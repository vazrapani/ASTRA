import React, { useEffect, useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import {
  IonPage,
  IonContent,
  IonSpinner,
  useIonToast
} from '@ionic/react';
import { RootState } from '../../store';
import styles from './Tarot-Daily.module.css';
import CommonHeader from '../../components/CommonHeader';
import tarotService from '../../services/firebase/tarotService';
import { useAppDispatch, useAppSelector } from '../../store';
import { setDailyTarotResult } from '../../store/slices/tarotSlice';
import axios from 'axios';
import { 
  getMultipleRandomCards,
  getRandomOrientation,
  generateTempCardImage,
  deckConfigs,
} from '../../utils/tarotCards';
import { DailyTarotResult, CardOrientation, DeckType, TarotCard } from '../../types/tarot';

// UI 상태를 더 세분화하여 통합
type ViewState = 'deck_selection' | 'gathering' | 'spread' | 'confirmed' | 'flipping' | 'revealed';

interface TarotDailyProps {
  unreadCount?: number;
  onClickNotification?: () => void;
}

const TarotDaily: React.FC<TarotDailyProps> = ({ unreadCount = 0, onClickNotification }) => {
  const user = useAppSelector((state: RootState) => state.auth.user);
  const { isDailyAvailable, result: dailyResult } = useAppSelector(state => state.tarot.dailyTarotStatus);
  const [isLoading, setIsLoading] = useState(true);
  const dispatch = useAppDispatch();
  const [present] = useIonToast();
  
  // UI 상태 관리
  const [view, setView] = useState<ViewState>('deck_selection');
  const [selectedDeck, setSelectedDeck] = useState<DeckType | null>(null);
  const [isDeckConfirming, setIsDeckConfirming] = useState(false); // 덱 선택 애니메이션 상태
  const [selectedCardIndex, setSelectedCardIndex] = useState<number | null>(null);
  
  // 데이터 상태 관리
  const [spreadCards, setSpreadCards] = useState<{ card: TarotCard; orientation: CardOrientation }[]>([]);
  const [geminiInterpretation, setGeminiInterpretation] = useState<string>('');
  const [isGeminiLoading, setIsGeminiLoading] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false); // 카드 애니메이션 진행 상태 추적

  // 새로운 타로 읽기를 시작하는 함수 (카드 5장 뽑기)
  const startNewReading = useCallback((deck: DeckType) => {
    const newCards = getMultipleRandomCards(deck, 5);
    
    const newSpreadCards = newCards.map(card => ({
      card,
      orientation: getRandomOrientation()
    }));
    
    setSpreadCards(newSpreadCards);
  }, []);

  useEffect(() => {
    // [임시] 개발 및 향후 관리자 기능 구현을 위해 일일 타로 제한을 항상 해제합니다.
    // 추후 이 부분은 관리자 페이지에서 제어하는 기능으로 대체될 예정입니다.
    setView('deck_selection'); 
    setIsLoading(false);
  }, []); // 의존성 배열을 비워, 컴포넌트 마운트 시 한 번만 실행되도록 합니다.

  useEffect(() => {
    if (view === 'gathering') {
      const timer = setTimeout(() => {
        setView('spread');
      }, 500); // 0.1초에서 0.5초로 변경하여 중앙 상태를 인지할 시간 확보
      return () => clearTimeout(timer);
    }
    
    // 'spread' 상태가 되면 애니메이션 종료를 감지
    if (view === 'spread') {
      const animationEndTimer = setTimeout(() => {
        setIsAnimating(false);
      }, 900); // getCardStyle의 transition 시간과 동일하게 설정
      return () => clearTimeout(animationEndTimer);
    }
  }, [view]);

  const handleDeckSelect = (deck: DeckType) => {
    if (view !== 'deck_selection') return;
    
    // 이미 선택된 덱을 다시 클릭하면 선택 해제, 다른 덱을 클릭하면 선택 변경
    setSelectedDeck(prevDeck => prevDeck === deck ? null : deck);
  };

  const handleDeckConfirm = () => {
    if (!selectedDeck) return;
    
    setIsDeckConfirming(true);
    startNewReading(selectedDeck);

    // 복잡한 setTimeout 제거. 0.8초 애니메이션은 CSS에서 처리.
    // 애니메이션이 끝난 후 view를 gathering으로 변경.
    setTimeout(() => {
      setView('gathering');
    }, 800);
  };

  const handleConfirm = async () => {
    if (selectedCardIndex === null || !user?.id || spreadCards.length === 0) return;
    
    setIsAnimating(true);
    setView('confirmed');

    const selectedCardData = spreadCards[selectedCardIndex];
    const { card, orientation } = selectedCardData;

    setTimeout(async () => {
      setView('flipping');
      setIsGeminiLoading(true);

      try {
        const response = await axios.post('/api/geminiInterpret', {
          cardName: card.nameKo,
          cardDesc: card.meanings[orientation],
          orientation: orientation,
        });
        const interpretation = response.data.interpretation;
        setGeminiInterpretation(interpretation);
        
        const result = await tarotService.saveDailyTarotReading(
          user.id,
          card.deck,
          card,
          orientation,
          interpretation
        );
        
        dispatch(setDailyTarotResult({ isDailyAvailable: false, result }));

      } catch (e) {
        setGeminiInterpretation('운세 해석을 가져오는 중 오류가 발생했습니다.');
      } finally {
        setIsGeminiLoading(false);
        setView('revealed');
        setIsAnimating(false);
      }
    }, 900);
  };
  
  const handleShuffle = () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    setSelectedCardIndex(null);
    if(selectedDeck) {
      startNewReading(selectedDeck);
    }
    setView('gathering');
  };

  const getCardStyle = (index: number): React.CSSProperties => {
    const isSpread = view === 'spread';
    const isSelected = selectedCardIndex === index;
    const isConfirmed = view === 'confirmed' || view === 'flipping' || view === 'revealed';

    let finalTransform = 'translate(-50%, -50%)'; // Default to center
    let opacity = 1;
    let zIndex = 5 - index;
    
    if (isConfirmed) {
      if (isSelected) {
        finalTransform = 'translate(-50%, -95%) scale(1.7)';
        zIndex = 100;
      } else {
        opacity = 0;
      }
    } else if (isSpread) {
      const baseAngle = -140, angleIncrement = 100 / 4;
      const cardAngle = baseAngle + (index * angleIncrement);
      const xRadius = 150, yRadius = 75; 
      const rad = (cardAngle * Math.PI) / 180;
      const x = Math.cos(rad) * xRadius;
      const y = Math.sin(rad) * yRadius;
      const maxRotation = 30;
      const dampenedRotation = ((cardAngle + 90) / 50) * maxRotation;
      const selectionTransform = isSelected ? 'translateY(-35px) ' : '';
      finalTransform = `translate(-50%, -50%) ${selectionTransform}translate(${x}px, ${y}px) rotate(${dampenedRotation}deg)`;
      zIndex = isSelected ? 10 : 5 - index;
    }

    return {
      opacity,
      zIndex,
      transform: finalTransform,
      cursor: view === 'spread' ? 'pointer' : 'default',
    };
  };

  if (isLoading) {
    return (
      <IonPage>
        <CommonHeader title="일일 타로" backHref="/tabs/tarot" />
        <IonContent className={styles.loadingContainer}>
          <IonSpinner />
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <CommonHeader title="일일 타로" backHref="/tabs/tarot" />
      <IonContent>
        <div className={styles.container}>
          {/* 1. 덱 선택 UI */}
          <div
            className={`${styles.deckSelectionContainer} ${
              view !== 'deck_selection' ? styles.hidden : ''
            } ${isDeckConfirming ? styles.fadeOut : ''}`}
            onClick={() => !isDeckConfirming && setSelectedDeck(null)}
          >
            <p className={styles.pickingHelperText}>
              오늘의 운세를 함께할 덱을 선택하세요.
            </p>
            <div className={styles.deckCardsWrapper}>
              <div
                className={`${styles.deckCard} ${styles.riderWaiteDeck} ${
                  isDeckConfirming ? styles.gathering : selectedDeck === 'rider-waite' ? styles.selected : ''
                }`}
                onClick={(e) => { e.stopPropagation(); if (!isDeckConfirming) handleDeckSelect('rider-waite'); }}
              />
              <div
                className={`${styles.deckCard} ${styles.thothDeck} ${
                  isDeckConfirming ? styles.gathering : selectedDeck === 'thoth' ? styles.selected : ''
                }`}
                onClick={(e) => { e.stopPropagation(); if (!isDeckConfirming) handleDeckSelect('thoth'); }}
              />
            </div>
            <div className={styles.deckInfoContainer}>
              <p className={`${styles.selectedDeckText} ${selectedDeck && !isDeckConfirming ? styles.visible : ''}`}>
                {selectedDeck ? `${deckConfigs[selectedDeck].nameKo}` : ''}
              </p>
              <p className={`${styles.deckDescriptionText} ${selectedDeck && !isDeckConfirming ? styles.visible : ''}`}>
                  {selectedDeck === 'rider-waite' && '현실적인 고민에 명쾌한 답을 건네는 덱입니다.'}
                  {selectedDeck === 'thoth' && '잠재의식과 운명의 흐름을 통찰하는 힘을 가진 덱입니다.'}
              </p>
            </div>
            <div className={styles.buttonContainer}>
              <button onClick={handleDeckConfirm} disabled={!selectedDeck || isDeckConfirming}>
                덱 선택 완료
              </button>
            </div>
          </div>

          {/* 2. 카드 뽑기 UI */}
          <div
            className={`${styles.cardPickingContainer} ${
              view === 'deck_selection' ? styles.hidden : ''
            }`}
          >
            <p className={`${styles.pickingHelperText} ${view === 'revealed' ? styles.fadeOut: ''}`}>
              오늘의 당신을 위한 다섯 장의 카드.<br/>
              가장 마음에 끌리는 한 장을 선택하세요.
            </p>
            <div
              className={styles.cardAnimationArea}
              onClick={() => {
                if (view === 'spread') {
                  setSelectedCardIndex(null);
                }
              }}
            >
              {isDailyAvailable ? (
                spreadCards.map(({ card, orientation }, i) => (
                  <div
                    key={card.id + i}
                    className={`${styles.cardWrapper} ${
                      view === 'spread' && selectedCardIndex === i ? styles.selectedCard : ''
                    }`}
                    style={getCardStyle(i)}
                    onClick={(e) => {
                      if (view === 'spread') { 
                        e.stopPropagation(); 
                        setSelectedCardIndex(prev => prev === i ? null : i); 
                      }
                    }}
                  >
                    <div
                      className={styles.cardInner}
                      style={{transform: (view === 'flipping' || view === 'revealed') && selectedCardIndex === i ? 'rotateY(180deg)' : 'none' }}
                    >
                      <div className={`${styles.cardFace} ${styles.cardBack}`} />
                      <div className={`${styles.cardFace} ${styles.cardFront}`}>
                        <img src={generateTempCardImage(card, orientation)} alt={card.nameKo} style={{width: '100%', height: '100%', borderRadius: 10}}/>
                      </div>
                    </div>
                    {view === 'revealed' && selectedCardIndex === i && (
                      <div className={styles.cardInfoText}>
                        <span>{card.nameKo}</span>
                        <span>({orientation === 'upright' ? '정방향' : '역방향'})</span>
                      </div>
                    )}
                  </div>
                ))
              ) : dailyResult ? (
                <div style={getCardStyle(0)}>
                   <div className={styles.cardInner} style={{transform: 'rotateY(180deg)'}}>
                      <div className={`${styles.cardFace} ${styles.cardBack}`} />
                      <div className={`${styles.cardFace} ${styles.cardFront}`}>
                        <img src={generateTempCardImage(dailyResult.card, dailyResult.orientation)} alt={dailyResult.card.nameKo} style={{width: '100%', height: '100%', borderRadius: 10}}/>
                      </div>
                    </div>
                    <div className={styles.cardInfoText}>
                      <span>{dailyResult.card.nameKo}</span>
                      <span>({dailyResult.orientation === 'upright' ? '정방향' : '역방향'})</span>
                    </div>
                </div>
              ) : null}
            </div>
            
            {isDailyAvailable && (
              <div className={styles.buttonContainer}>
                {(view === 'spread') && (
                  <>
                    <button onClick={handleShuffle} disabled={isAnimating || selectedCardIndex !== null}>다시 섞기</button>
                    <button onClick={handleConfirm} disabled={isAnimating || selectedCardIndex === null}>선택 완료</button>
                  </>
                )}
              </div>
            )}
          </div>
          
          {/* 3. 결과 표시 영역 */}
          {view === 'revealed' && (
            <div className={styles.resultContainer}>
              {isGeminiLoading ? (
                <div className={styles.spinnerContainer}>
                  <IonSpinner name="bubbles" />
                  <p>카드를 해석하고 있습니다...</p>
                </div>
              ) : (
                <div className={styles.interpretation}>
                  <h2>오늘의 타로 해석</h2>
                  <p>{geminiInterpretation}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default TarotDaily; 