import React, { useState } from 'react';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonButton, IonText, IonBackButton, IonTextarea } from '@ionic/react';

const FollowUpQuestion: React.FC = () => {
  const [followUp, setFollowUp] = useState('');

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonBackButton defaultHref="/tarot/result" />
          <IonTitle>질문 추가/대화 이어가기</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonCard color="light">
          <IonCardHeader>
            <IonCardTitle>이전 질문</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonText color="primary">예시: "이직을 해도 괜찮을까요?"</IonText>
          </IonCardContent>
        </IonCard>
        <IonCard color="light">
          <IonCardHeader>
            <IonCardTitle>이전 해석 요약</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonText>이직에 대한 긍정적인 에너지가 느껴집니다. 새로운 시작이 당신에게 좋은 기회를 가져다줄 것입니다.</IonText>
          </IonCardContent>
        </IonCard>
        <IonCard color="light">
          <IonCardHeader>
            <IonCardTitle>추가 질문</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonTextarea
              value={followUp}
              onIonChange={e => setFollowUp(e.detail.value!)}
              placeholder="이 해석에 대해 더 궁금한 점이 있으신가요?"
              autoGrow
            />
            <IonButton expand="block" style={{marginTop:16}}>이어 질문하기</IonButton>
          </IonCardContent>
        </IonCard>
        <IonButton expand="block" style={{marginTop:24}} routerLink="/tarot/question">새로운 질문 시작</IonButton>
      </IonContent>
    </IonPage>
  );
};

export default FollowUpQuestion; 