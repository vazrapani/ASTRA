import React from 'react';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonButton, IonBackButton, IonList, IonItem, IonLabel, IonTextarea } from '@ionic/react';

const dummyFeed = [
  { id: 1, card: '더 푸울', summary: '새로운 시작의 기운', comment: '정확해요!', emoji: '👍' },
  { id: 2, card: '더 매지션', summary: '의지와 창조', comment: '', emoji: '😊' },
];

const FriendFeed: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonBackButton defaultHref="/social/friends" />
          <IonTitle>친구 피드</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonList>
          {dummyFeed.map(feed => (
            <IonCard key={feed.id} color="light">
              <IonCardHeader>
                <IonCardTitle>{feed.card} <span style={{fontSize:'0.9em',color:'#888'}}>{feed.emoji}</span></IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <div>해석 요약: {feed.summary}</div>
                <div style={{marginTop:8}}>
                  <IonButton size="small" color="success">좋아요</IonButton>
                  <IonButton size="small" color="warning">😊</IonButton>
                  <IonButton size="small" color="danger">💔</IonButton>
                </div>
                <div style={{marginTop:8}}>
                  <IonTextarea autoGrow placeholder="댓글 입력 (50자 이내)" value={feed.comment} />
                </div>
              </IonCardContent>
            </IonCard>
          ))}
        </IonList>
        <IonButton expand="block" color="primary" style={{marginTop:24}}>OO님과 우정 타로 뽑기</IonButton>
        <IonButton expand="block" color="secondary" style={{marginTop:12}}>OO님과 애정 타로 뽑기</IonButton>
      </IonContent>
    </IonPage>
  );
};

export default FriendFeed; 