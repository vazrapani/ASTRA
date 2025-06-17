import React, { useState } from 'react';
import { IonPage, IonContent, IonButton, IonGrid, IonRow, IonCol, IonCard, IonCardContent, IonSpinner, IonText } from '@ionic/react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { selectCard, clearSelectedCards, setInterpretation } from '../../store/slices/tarotSlice';
import CommonHeader from '../../components/CommonHeader';
import styles from './CardPick.module.css';
import { cards, fetchGeminiInterpret } from '../../utils/tarotCards';

const dummyCards = Array.from({ length: 10 }, (_, i) => ({ id: i, picked: false }));

const spreadToCount: Record<string, number> = { one: 1, three: 3, five: 5, celtic: 10 };

interface CardPickProps {
  unreadCount: number;
  onClickNotification: () => void;
}

const CardPick: React.FC<CardPickProps> = ({ unreadCount, onClickNotification }) => {
  const dispatch = useDispatch();
  const spread = useSelector((state: RootState) => state.tarot.spread) || 'three';
  const pickCount = spreadToCount[spread] || 3;
  const [picked, setPicked] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const question = useSelector((state: RootState) => state.tarot.question);

  React.useEffect(() => {
    dispatch(clearSelectedCards());
  }, [dispatch]);

  const handlePick = (id: number) => {
    if (picked.length < pickCount && !picked.includes(id)) {
      setPicked([...picked, id]);
      // Redux에 카드 정보 저장 (id, name만 예시)
      dispatch(selectCard({ id, name: `카드 ${id + 1}`, imageUrl: '', meaning: '', reversedMeaning: '' }));
    }
  };

  const handleInterpret = async () => {
    setLoading(true);
    try {
      // 선택된 카드 정보로 해석 생성 (여기서는 첫 번째 카드 기준 예시)
      const mainCard = cards[picked[0]];
      const result = await fetchGeminiInterpret(mainCard.name, mainCard.desc, question);
      dispatch(setInterpretation(result));
      window.location.href = '/tabs/tarot/result';
    } catch (e) {
      alert('AI 해석을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <IonPage>
      <CommonHeader title="카드 선택" backHref="/tabs/tarot" unreadCount={unreadCount} onClickNotification={onClickNotification} />
      <IonContent className="ion-padding">
        <IonText color="primary">
          {picked.length < pickCount
            ? `카드를 ${pickCount}장 선택하세요!`
            : '선택 완료! 해석을 시작할 수 있습니다.'}
        </IonText>
        <IonGrid className={styles.cardGrid}>
          <IonRow>
            {dummyCards.slice(0, Math.max(pickCount * 2, pickCount)).map(card => (
              <IonCol size="4" key={card.id} className={styles.cardCol}>
                <IonCard
                  className={
                    picked.includes(card.id)
                      ? styles.pickedCard
                      : styles.unpickedCard +
                        (picked.length < pickCount && !picked.includes(card.id)
                          ? ' ' + styles.cardPointer
                          : '')
                  }
                  onClick={() => handlePick(card.id)}
                >
                  <IonCardContent>
                    <div className={styles.cardIcon}>
                      {picked.includes(card.id) ? '🔮' : '🃏'}
                    </div>
                    <div className={styles.cardName}>카드 {card.id + 1}</div>
                  </IonCardContent>
                </IonCard>
              </IonCol>
            ))}
          </IonRow>
        </IonGrid>
        {picked.length === pickCount && !loading && (
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