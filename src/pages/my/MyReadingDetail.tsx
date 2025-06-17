import React from 'react';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonButton, IonBackButton, IonList, IonItem, IonLabel } from '@ionic/react';
import { useSelector } from 'react-redux';
import { useParams, useHistory, useLocation } from 'react-router-dom';
import CommonHeader from '../../components/CommonHeader';
import styles from './MyReadingDetail.module.css';

const MyReadingDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const readings = useSelector((state: any) => state.tarot.readings);
  const reading = readings.find((r: any) => r.id === id);
  const history = useHistory();
  const location = useLocation<any>();
  const unreadCount = location.state?.unreadCount ?? 0;
  const onClickNotification = location.state?.onClickNotification ?? (() => {});
  if (!reading) {
    return (
      <IonPage>
        <CommonHeader title="기록 상세" backHref="/tabs/my/readings" />
        <IonContent className="ion-padding">
          <div className={styles.notFound}>기록을 찾을 수 없습니다.</div>
        </IonContent>
      </IonPage>
    );
  }
  return (
    <IonPage>
      <CommonHeader title="기록 상세" backHref="/tabs/my/readings" />
      <IonContent className="ion-padding">
        <IonButton expand="block" className={styles.btnTop24} onClick={() => {
          if (history.length > 1) history.goBack();
          else history.replace('/tabs/my/readings');
        }}>뒤로가기</IonButton>
        <IonCard color="light">
          <IonCardHeader>
            <IonCardTitle>질문</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>{reading.question || reading.type}</IonCardContent>
        </IonCard>
        <IonCard color="light">
          <IonCardHeader>
            <IonCardTitle>카드</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonList>
              {reading.cards && reading.cards.length > 0 ? reading.cards.map((c: any, i: number) => (
                <IonItem key={i}>
                  <IonLabel>{c.name || c.card?.name} {c.position ? `(${c.position === 'reversed' ? '역방향' : '정방향'})` : ''}</IonLabel>
                </IonItem>
              )) : <IonItem><IonLabel>카드 정보 없음</IonLabel></IonItem>}
            </IonList>
          </IonCardContent>
        </IonCard>
        <IonCard color="light">
          <IonCardHeader>
            <IonCardTitle>해석</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>{reading.interpretation}</IonCardContent>
        </IonCard>
      </IonContent>
    </IonPage>
  );
};
export default MyReadingDetail; 