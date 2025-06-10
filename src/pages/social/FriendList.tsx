import React from 'react';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel, IonButton, IonBackButton } from '@ionic/react';

const dummyFriends = [
  { id: 1, name: '홍길동', status: '온라인' },
  { id: 2, name: '김철수', status: '오프라인' },
  { id: 3, name: '이영희', status: '온라인' },
];

const FriendList: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonBackButton defaultHref="/social" />
          <IonTitle>친구 목록</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonButton expand="block" color="primary" style={{marginBottom:16}}>친구 추가/초대</IonButton>
        <IonList>
          {dummyFriends.map(friend => (
            <IonItem key={friend.id} button routerLink={`/social/feed/${friend.id}`}>
              <IonLabel>
                <b>{friend.name}</b> <span style={{color: friend.status === '온라인' ? 'green' : '#aaa', fontSize:'0.9em'}}>{friend.status}</span>
              </IonLabel>
            </IonItem>
          ))}
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default FriendList; 