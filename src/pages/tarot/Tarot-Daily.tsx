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
    // 1. 오늘의 타로를 이미 봤는지 확인
    if (!isDailyAvailable && dailyResult) {
      // 이미 본 결과가 있으면, 해당 결과를 바로 표시
      setSpreadCards([{ card: dailyResult.card, orientation: dailyResult.orientation }]);
      setGeminiInterpretation(dailyResult.interpretation);
      setSelectedCardIndex(0); // 결과 카드가 첫 번째이자 유일한 카드
      setSelectedDeck(dailyResult.deck); // 결과 덱도 상태에 저장
      setView('revealed'); // 바로 결과 표시 상태로 전환
    } else {
      // 오늘의 타로를 아직 안 봤으면, 덱 선택 UI 표시
      setView('deck_selection'); 
    }
    setIsLoading(false);
  }, [isDailyAvailable, dailyResult]);

  // 'initial' 상태에서 자동으로 'spread' 상태로 전환하던 로직(버그 원인)을 제거했습니다.
  
  const handleDeckSelect = (deck: DeckType) => {
    // deck_selection 단계가 아니면 아무것도 하지 않음
    if (view !== 'deck_selection') return;
    
    // 이미 선택된 덱을 다시 클릭하면 선택 해제, 다른 덱을 클릭하면 선택 변경
    setSelectedDeck(prevDeck => prevDeck === deck ? null : deck);
  };

  const handleDeckConfirm = () => {
    if (!selectedDeck) return;
    
    setIsDeckConfirming(true); // 애니메이션 시작
    startNewReading(selectedDeck); // 백그라운드에서 카드 데이터 미리 로드

    // 1. 카드를 중앙에 모으는 상태로 먼저 변경
    setTimeout(() => {
      setView('gathering');
      
      // 2. 아주 짧은 지연 후, 카드를 펼치는 상태로 변경하여 애니메이션 트리거
      setTimeout(() => {
        setView('spread');
      }, 50); // React가 'gathering' 상태를 렌더링할 시간을 줌
    }, 1000); // CSS 덱 선택 애니메이션 시간과 일치
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
    setView('gathering'); // 'initial' 대신 'gathering' 상태로 변경하여 카드 모으기 애니메이션을 명시적으로 호출
    setSelectedCardIndex(null);
    
    setTimeout(() => {
      if (selectedDeck) {
        startNewReading(selectedDeck); // 현재 선택된 덱으로 다시 뽑기
      }
      
      // DOM 업데이트를 위한 짧은 지연 후 펼치기 애니메이션 시작
      setTimeout(() => {
        setView('spread');
        setTimeout(() => {
          setIsAnimating(false);
        }, 900);
      }, 50); 
    }, 900); 
  };

  const getCardStyle = (index: number): React.CSSProperties => {
    const isSpread = view === 'spread';
    const isSelected = selectedCardIndex === index;
    const isConfirmed = view === 'confirmed' || view === 'flipping' || view === 'revealed';

    let finalTransform = '';
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
    } else if (view === 'gathering') { // 'initial' 대신 'gathering' 상태를 명시적으로 확인
      finalTransform = `translate(-50%, -50%) translate(0, ${-index * 2}px) rotate(0deg)`;
    }
    
    return {
      position: 'absolute',
      left: '50%',
      top: '50%',
      width: 100,
      height: 160,
      transform: finalTransform,
      zIndex,
      opacity,
      transition: 'all 0.9s cubic-bezier(0.68, -0.55, 0.27, 1.55)',
      cursor: isSpread ? 'pointer' : 'default',
      transformStyle: 'preserve-3d',
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
                  selectedDeck === 'rider-waite' ? (isDeckConfirming ? styles.confirmed : styles.selected) : ''
                } ${isDeckConfirming && selectedDeck !== 'rider-waite' ? styles.unselected : ''}`}
                onClick={(e) => { e.stopPropagation(); if (!isDeckConfirming) handleDeckSelect('rider-waite'); }}
              />
              <div
                className={`${styles.deckCard} ${styles.thothDeck} ${
                  selectedDeck === 'thoth' ? (isDeckConfirming ? styles.confirmed : styles.selected) : ''
                } ${isDeckConfirming && selectedDeck !== 'thoth' ? styles.unselected : ''}`}
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
              onClick={() => { if (view === 'spread' && !isDailyAvailable) setSelectedCardIndex(null); }}
            >
              {isDailyAvailable ? (
                spreadCards.map(({ card, orientation }, i) => (
                  <div
                    key={card.id + i}
                    style={getCardStyle(i)}
                    onClick={(e) => {
                      if (view === 'spread') {
                        e.stopPropagation();
                        // 이미 선택된 카드를 다시 클릭하면 선택 해제, 아니면 선택
                        setSelectedCardIndex(prev => prev === i ? null : i);
                      }
                    }}
                  >
                    <div className={styles.cardInner} style={{transform: (view === 'flipping' || view === 'revealed') && selectedCardIndex === i ? 'rotateY(180deg)' : 'none' }}>
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
              <div className={`${styles.buttonContainer} ${view !== 'spread' ? styles.fadeOut : ''}`}>
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