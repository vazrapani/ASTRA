import React from 'react';
import { IonButton, IonPage, IonContent } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import CommonHeader from '../../components/CommonHeader';
import styles from './TempSocial.module.css';
import FriendList from './FriendList';

interface SocialMainProps {
  unreadCount: number;
  onClickNotification: () => void;
}

const SocialMain: React.FC<SocialMainProps> = ({ unreadCount, onClickNotification }) => {
  const history = useHistory();
  return (
    <IonPage>
      <CommonHeader title="소셜" unreadCount={unreadCount} onClickNotification={onClickNotification} />
      <IonContent className={styles.content}>
        <div className={styles.container}>
          <FriendList unreadCount={unreadCount} onClickNotification={onClickNotification} hideHeader={true} />
        </div>
      </IonContent>
    </IonPage>
  );
};

export default SocialMain; 