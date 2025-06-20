import React, { useState, useEffect } from 'react';
import { IonPage, IonContent, IonButton, IonGrid, IonRow, IonCol, IonCard, IonCardContent, IonSpinner, IonText, useIonToast } from '@ionic/react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { RootState } from '../../store';
import { selectCard, clearSelectedCards, setInterpretation } from '../../store/slices/tarotSlice';
import CommonHeader from '../../components/CommonHeader';
import styles from './CardPick.module.css';
import { cards as allCards } from '../../utils/tarotCards';
import { TarotCard as TarotCardType } from '../../types/tarot';

const spreadToCount: Record<string, number> = { one: 1, three: 3, five: 5, seven: 7, celtic: 10 };

// Fisher-Yates shuffle algorithm
const shuffle = (array: any[]) => {
  let currentIndex = array.length, randomIndex;
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }
  return array;
};

const CardPick: React.FC = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const [present] = useIonToast();

  const { question, spread, selectedCards } = useSelector((state: RootState) => state.tarot);
  const pickCount = spreadToCount[spread] || 3;
  
  const [shuffledDeck, setShuffledDeck] = useState<TarotCardType[]>([]);
  const [pickedCardIds, setPickedCardIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    dispatch(clearSelectedCards());
    setShuffledDeck(shuffle([...allCards]));
  }, [dispatch]);

  const handlePick = (card: TarotCardType) => {
    if (pickedCardIds.length < pickCount && !pickedCardIds.includes(card.id as any)) {
      const orientation = Math.random() < 0.5 ? 'upright' : 'reversed';
      const pickedCard = { ...card, orientation };
      
      dispatch(selectCard(pickedCard));
      setPickedCardIds([...pickedCardIds, card.id as any]);
    }
  };

  const handleInterpret = async () => {
    if (selectedCards.length !== pickCount) return;
    setLoading(true);
    try {
      const response = await fetch('/api/interpretMultipleCards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cards: selectedCards, question }),
      });

      if (!response.ok) {
        // 400 Bad Request 같은 에러가 발생했을 때, 서버가 JSON이 아닌 일반 텍스트나 HTML을 보낼 수 있습니다.
        // 먼저 텍스트로 응답을 받아보고, JSON 파싱을 시도합니다.
        const errorText = await response.text();
        try {
          const errorData = JSON.parse(errorText);
          throw new Error(errorData.error || 'AI 해석을 불러오지 못했습니다.');
        } catch (jsonError) {
          // 서버가 JSON이 아닌 다른 것을 보냈을 경우, 받은 텍스트를 그대로 에러로 던집니다.
          throw new Error(errorText || 'AI 해석 중 알 수 없는 오류가 발생했습니다.');
        }
      }

      const data = await response.json();
      dispatch(setInterpretation(data.interpretation));
      history.push('/tabs/tarot/result');
    } catch (e) {
      console.error('AI 해석 에러:', e);
      present({
        message: e instanceof Error ? e.message : String(e),
        duration: 3000,
        color: 'danger',
      });
    } finally {
      setLoading(false);
    }
  };

  const displayDeck = shuffledDeck.slice(0, Math.max(pickCount * 2, 78));

  return (
    <IonPage>
      <CommonHeader title="카드 선택" backHref="/tabs/tarot/spread" />
      <IonContent className="ion-padding">
        <div className={styles.infoTextContainer}>
          <IonText color="primary" className={styles.infoText}>
            {pickedCardIds.length < pickCount
              ? `카드를 ${pickCount}장 선택하세요.`
              : '선택 완료! 아래 버튼으로 해석을 시작하세요.'}
          </IonText>
          <IonText color="medium" className={styles.pickCount}>
            {pickedCardIds.length} / {pickCount}
          </IonText>
        </div>
        <IonGrid className={styles.cardGrid}>
          <IonRow>
            {displayDeck.map((card: TarotCardType) => (
              <IonCol size="4" key={card.id} className={styles.cardCol}>
                <IonCard
                  className={`${styles.card} ${
                    pickedCardIds.includes(card.id as any)
                      ? styles.pickedCard
                      : styles.unpickedCard
                  }`}
                  onClick={() => handlePick(card)}
                  disabled={pickedCardIds.includes(card.id as any) || pickedCardIds.length >= pickCount}
                >
                  <img src="/assets/card_default.png" alt="Tarot Card Back" className={styles.cardImage} />
                </IonCard>
              </IonCol>
            ))}
          </IonRow>
        </IonGrid>
        {pickedCardIds.length === pickCount && !loading && (
          <IonButton expand="block" className={styles.interpretButton} onClick={handleInterpret}>
            해석 시작
          </IonButton>
        )}
        {loading && (
          <div className={styles.centered}>
            <IonSpinner name="crescent" color="primary" />
            <p className={styles.centeredText}>카드가 당신의 운명을 읽고 있습니다...<br/>우주의 지혜가 모이는 중...</p>
          </div>
        )}
      </IonContent>
    </IonPage>
  );
};

export default CardPick; 