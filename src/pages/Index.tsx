import React from 'react';
import {
  IonContent,
  IonPage,
  IonButton,
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonIcon
} from '@ionic/react';
import { 
  personOutline, 
  cardOutline, 
  peopleOutline, 
  settingsOutline 
} from 'ionicons/icons';
import './Index.css';
import CommonHeader from '../components/CommonHeader';
import styles from './Index.module.css';

const Index: React.FC = () => {
  return (
    <IonPage>
      <CommonHeader title="Astra Tarot" />
      <IonContent className="ion-padding">
        <div className={styles.centerBox}>
          <h2>당신의 내면의 지혜를 깨워줄 타로카드 앱</h2>
          <p className={styles.mainTitle}>Astra Tarot에 오신 것을 환영합니다!</p>
          <p className={styles.mainDesc}>판타지 테마와 함께, 오늘의 운세와 다양한 타로 리딩을 경험해보세요.</p>
        </div>
        <IonGrid>
          {/* 메인 카드 섹션 */}
          <IonRow>
            <IonCol size="12">
              <IonCard>
                <IonCardHeader>
                  <IonCardTitle>오늘의 타로</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  <IonButton expand="block" routerLink="/tabs/tarot/daily">
                    <IonIcon slot="start" icon={cardOutline} />
                    카드 뽑기
                  </IonButton>
                </IonCardContent>
              </IonCard>
            </IonCol>
          </IonRow>

          {/* 메뉴 그리드 */}
          <IonRow>
            <IonCol size="6">
              <IonCard>
                <IonCardContent>
                  <IonButton expand="block" routerLink="/tabs/tarot/question">
                    <IonIcon slot="start" icon={cardOutline} />
                    스프레드
                  </IonButton>
                </IonCardContent>
              </IonCard>
            </IonCol>
            <IonCol size="6">
              <IonCard>
                <IonCardContent>
                  <IonButton expand="block" routerLink="/tabs/social">
                    <IonIcon slot="start" icon={peopleOutline} />
                    소셜
                  </IonButton>
                </IonCardContent>
              </IonCard>
            </IonCol>
          </IonRow>

          {/* 프로필/설정 섹션 */}
          <IonRow>
            <IonCol size="6">
              <IonCard>
                <IonCardContent>
                  <IonButton expand="block" routerLink="/tabs/my">
                    <IonIcon slot="start" icon={personOutline} />
                    프로필
                  </IonButton>
                </IonCardContent>
              </IonCard>
            </IonCol>
            <IonCol size="6">
              <IonCard>
                <IonCardContent>
                  <IonButton expand="block" routerLink="/tabs/my">
                    <IonIcon slot="start" icon={settingsOutline} />
                    설정
                  </IonButton>
                </IonCardContent>
              </IonCard>
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default Index; 