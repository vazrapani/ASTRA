import React from 'react';
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
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonIcon,
} from '@ionic/react';
import { 
  shuffleOutline, 
  calendarOutline, 
  heartOutline, 
  starOutline 
} from 'ionicons/icons';

const TarotMain: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>타로</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonGrid>
          <IonRow>
            <IonCol size="6">
              <IonCard>
                <IonCardHeader>
                  <IonCardTitle>
                    <IonIcon icon={shuffleOutline} /> 일일 타로
                  </IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  오늘의 운세를 확인하세요
                </IonCardContent>
                <IonButton expand="block" fill="clear">시작하기</IonButton>
              </IonCard>
            </IonCol>
            <IonCol size="6">
              <IonCard>
                <IonCardHeader>
                  <IonCardTitle>
                    <IonIcon icon={calendarOutline} /> 주간 타로
                  </IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  이번 주의 운세를 확인하세요
                </IonCardContent>
                <IonButton expand="block" fill="clear">시작하기</IonButton>
              </IonCard>
            </IonCol>
          </IonRow>
          <IonRow>
            <IonCol size="6">
              <IonCard>
                <IonCardHeader>
                  <IonCardTitle>
                    <IonIcon icon={heartOutline} /> 연애 타로
                  </IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  연애와 관련된 운세를 확인하세요
                </IonCardContent>
                <IonButton expand="block" fill="clear">시작하기</IonButton>
              </IonCard>
            </IonCol>
            <IonCol size="6">
              <IonCard>
                <IonCardHeader>
                  <IonCardTitle>
                    <IonIcon icon={starOutline} /> 직업 타로
                  </IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  직업과 관련된 운세를 확인하세요
                </IonCardContent>
                <IonButton expand="block" fill="clear">시작하기</IonButton>
              </IonCard>
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default TarotMain; 