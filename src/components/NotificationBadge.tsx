import React from 'react';
import { IonIcon, IonBadge } from '@ionic/react';
import styles from './NotificationBadge.module.css';

export interface NotificationBadgeProps {
  unreadCount: number;
  onClick?: () => void;
  icon: string;
}

const NotificationBadge: React.FC<NotificationBadgeProps> = ({ unreadCount, onClick, icon }) => {
  return (
    <div className={styles.notificationBadge} onClick={onClick}>
      <IonIcon icon={icon} className={unreadCount > 0 ? styles.hasUnread : ''} />
      {unreadCount > 0 && (
        <IonBadge color="danger" className={styles.badge}>
          {unreadCount}
        </IonBadge>
      )}
    </div>
  );
};

export default NotificationBadge; 