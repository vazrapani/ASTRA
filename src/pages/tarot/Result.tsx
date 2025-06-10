import React from 'react';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonButton, IonText, IonBackButton, IonList, IonItem, IonLabel, IonTextarea, IonInput } from '@ionic/react';

const dummyCards = [
  { id: 1, name: '더 푸울', position: '정방향', desc: '새로운 시작, 순수함, 자유' },
  { id: 2, name: '더 매지션', position: '역방향', desc: '의지 부족, 혼란' },
  { id: 3, name: '더 하이프리스트리스', position: '정방향', desc: '직관, 신비, 잠재력' },
];

const Result: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonBackButton defaultHref="/tarot/pick" />
          <IonTitle>타로 해석 결과</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonCard color="light">
          <IonCardHeader>
            <IonCardTitle>질문</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonText color="primary">예시: "이직을 해도 괜찮을까요?"</IonText>
          </IonCardContent>
        </IonCard>
        <IonCard color="light">
          <IonCardHeader>
            <IonCardTitle>선택한 카드</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonList>
              {dummyCards.map(card => (
                <IonItem key={card.id}>
                  <IonLabel>
                    <b>{card.name}</b> ({card.position})<br/>
                    <small>{card.desc}</small>
                  </IonLabel>
                </IonItem>
              ))}
            </IonList>
          </IonCardContent>
        </IonCard>
        <IonCard color="light">
          <IonCardHeader>
            <IonCardTitle>해석 요약</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonText>이직에 대한 긍정적인 에너지가 느껴집니다. 새로운 시작이 당신에게 좋은 기회를 가져다줄 것입니다.</IonText>
          </IonCardContent>
        </IonCard>
        <IonCard color="light">
          <IonCardHeader>
            <IonCardTitle>상세 해석</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonText>
              더 푸울(정방향)은 새로운 도전과 순수한 열정을 의미합니다. 더 매지션(역방향)은 준비 부족이나 혼란을 경고합니다. 더 하이프리스트리스(정방향)는 직관을 따르라는 메시지를 줍니다. 전체적으로, 신중한 준비와 내면의 소리에 귀 기울인다면 좋은 결과를 얻을 수 있습니다.
            </IonText>
          </IonCardContent>
        </IonCard>
        <IonCard color="light">
          <IonCardHeader>
            <IonCardTitle>조언/핵심 메시지</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonText color="primary">충분한 준비와 자기 신뢰가 필요합니다. 직관을 믿고 도전해보세요!</IonText>
          </IonCardContent>
        </IonCard>
        <IonCard color="light">
          <IonCardHeader>
            <IonCardTitle>만족도 피드백</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonLabel>별점 (1~5점)</IonLabel>
            <IonInput type="number" min={1} max={5} placeholder="5" />
            <IonLabel style={{marginTop:8}}>의견(선택)</IonLabel>
            <IonTextarea autoGrow placeholder="50자 이내로 의견을 남겨주세요." />
            <IonButton expand="block" style={{marginTop:16}}>피드백 제출</IonButton>
          </IonCardContent>
        </IonCard>
        <IonButton expand="block" color="secondary" style={{marginTop:24}}>해석 공유하기</IonButton>
        <IonButton expand="block" style={{marginTop:12}} routerLink="/tarot/question">새로운 질문 시작</IonButton>
        <IonButton expand="block" style={{marginTop:12}} routerLink="/tarot/followup">이어 질문하기</IonButton>
      </IonContent>
    </IonPage>
  );
};

export default Result; 