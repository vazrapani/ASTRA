import React, { useState } from 'react';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonGrid, IonRow, IonCol, IonCard, IonCardContent, IonBackButton, IonSpinner, IonText } from '@ionic/react';

const dummyCards = Array.from({ length: 10 }, (_, i) => ({ id: i, picked: false }));

const CardPick: React.FC = () => {
  const [picked, setPicked] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);

  // 예시: 3장 뽑기 기준
  const pickCount = 3;

  const handlePick = (id: number) => {
    if (picked.length < pickCount && !picked.includes(id)) {
      setPicked([...picked, id]);
    }
  };

  const handleInterpret = () => {
    setLoading(true);
    setTimeout(() => {
      // 실제로는 LLM API 호출 후 결과 페이지로 이동
      setLoading(false);
      window.location.href = '/tarot/result';
    }, 2000);
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonBackButton defaultHref="/tarot/spread" />
          <IonTitle>카드 뽑기</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonText color="primary">
          {picked.length < pickCount
            ? `카드를 ${pickCount}장 선택하세요!`
            : '선택 완료! 해석을 시작할 수 있습니다.'}
        </IonText>
        <IonGrid style={{marginTop:24}}>
          <IonRow>
            {dummyCards.slice(0, pickCount * 2).map(card => (
              <IonCol size="4" key={card.id} style={{textAlign:'center'}}>
                <IonCard
                  style={{
                    background: picked.includes(card.id) ? '#6c47ff' : '#f5f5fa',
                    color: picked.includes(card.id) ? '#fff' : '#222',
                    cursor: picked.length < pickCount && !picked.includes(card.id) ? 'pointer' : 'default',
                    transition: '0.2s',
                    boxShadow: picked.includes(card.id) ? '0 0 12px #6c47ff88' : undefined
                  }}
                  onClick={() => handlePick(card.id)}
                >
                  <IonCardContent>
                    <div style={{fontSize:'2em',padding:'1em 0'}}>
                      {picked.includes(card.id) ? '🔮' : '🃏'}
                    </div>
                    <div>카드 {card.id + 1}</div>
                  </IonCardContent>
                </IonCard>
              </IonCol>
            ))}
          </IonRow>
        </IonGrid>
        {picked.length === pickCount && !loading && (
          <IonButton expand="block" style={{marginTop:32}} onClick={handleInterpret}>
            해석 시작
          </IonButton>
        )}
        {loading && (
          <div style={{textAlign:'center',marginTop:32}}>
            <IonSpinner name="crescent" color="primary" />
            <p style={{marginTop:16}}>카드가 당신의 운명을 읽고 있습니다...<br/>우주의 지혜가 모이는 중...</p>
          </div>
        )}
      </IonContent>
    </IonPage>
  );
};

export default CardPick; 