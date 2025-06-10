import React, { useState } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButton,
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardContent,
  IonBackButton,
  IonButtons,
  IonProgressBar,
} from '@ionic/react';

const TarotReading: React.FC = () => {
  const [step, setStep] = useState(1);
  const [selectedCards, setSelectedCards] = useState<number[]>([]);

  const handleCardSelect = (cardIndex: number) => {
    if (selectedCards.length < 3) {
      setSelectedCards([...selectedCards, cardIndex]);
      if (selectedCards.length + 1 === 3) {
        setStep(2);
      }
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/tarot" />
          </IonButtons>
          <IonTitle>타로 리딩</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonProgressBar value={step / 2} />
        
        {step === 1 && (
          <div className="ion-text-center">
            <h2>카드를 선택해주세요</h2>
            <p>3장의 카드를 선택하면 리딩이 시작됩니다</p>
            <IonGrid>
              <IonRow>
                {Array.from({ length: 22 }, (_, i) => (
                  <IonCol size="4" key={i}>
                    <IonCard 
                      button 
                      onClick={() => handleCardSelect(i)}
                      className={selectedCards.includes(i) ? 'selected' : ''}
                    >
                      <IonCardContent>
                        <img 
                          src={`/assets/cards/back.png`} 
                          alt={`Card ${i + 1}`}
                          style={{ width: '100%' }}
                        />
                      </IonCardContent>
                    </IonCard>
                  </IonCol>
                ))}
              </IonRow>
            </IonGrid>
          </div>
        )}

        {step === 2 && (
          <div className="ion-text-center">
            <h2>리딩 결과</h2>
            <IonGrid>
              <IonRow>
                {selectedCards.map((cardIndex, index) => (
                  <IonCol size="4" key={index}>
                    <IonCard>
                      <IonCardContent>
                        <img 
                          src={`/assets/cards/${cardIndex + 1}.png`} 
                          alt={`Selected Card ${index + 1}`}
                          style={{ width: '100%' }}
                        />
                        <h3>카드 {index + 1}</h3>
                        <p>카드 해석이 여기에 표시됩니다</p>
                      </IonCardContent>
                    </IonCard>
                  </IonCol>
                ))}
              </IonRow>
            </IonGrid>
            <IonButton expand="block" className="ion-margin-top">
              결과 저장하기
            </IonButton>
          </div>
        )}
      </IonContent>
    </IonPage>
  );
};

export default TarotReading; 