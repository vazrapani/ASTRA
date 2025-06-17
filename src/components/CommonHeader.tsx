import React, { useState } from 'react';
import { IonHeader, IonToolbar, IonButtons, IonBackButton, IonTitle, IonButton } from '@ionic/react';
import { notifications } from 'ionicons/icons';
import NotificationBadge from './NotificationBadge';
import NotificationList from './NotificationList';
import styles from './CommonHeader.module.css';

export interface CommonHeaderProps {
  title: string;
  backHref?: string;
  unreadCount?: number;
  onClickNotification?: () => void;
}

const CommonHeader: React.FC<CommonHeaderProps> = ({ 
  title, 
  backHref, 
  unreadCount = 0,
  onClickNotification 
}) => {
  const [showNotifications, setShowNotifications] = useState(false);

  const handleNotificationClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    console.log('알림 아이콘 클릭됨');
    console.log('현재 showNotifications 상태:', showNotifications);
    
    if (onClickNotification) {
      console.log('onClickNotification prop 실행');
      onClickNotification();
    }
    
    console.log('showNotifications를 true로 설정');
    setShowNotifications(true);
  };

  return (
    <>
      <IonHeader>
        <IonToolbar>
          {backHref && (
            <IonButtons slot="start">
              <IonBackButton defaultHref={backHref} />
            </IonButtons>
          )}
          <IonTitle>{title}</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={handleNotificationClick}>
              <NotificationBadge 
                unreadCount={unreadCount} 
                icon={notifications}
              />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <NotificationList 
        isOpen={showNotifications} 
        onClose={() => {
          console.log('모달 닫기');
          setShowNotifications(false);
        }} 
      />
    </>
  );
};

export default CommonHeader; 