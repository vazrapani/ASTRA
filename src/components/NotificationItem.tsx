import React from 'react';
import { IonIcon } from '@ionic/react';
import { 
  personAdd, 
  time, 
  share, 
  megaphone,
  chatbubble,
  heart 
} from 'ionicons/icons';
import { NotificationType, Notification } from '../types/notification';
import styles from './NotificationItem.module.css';

interface NotificationItemProps {
  notification: Notification;
  onClick: () => void;
}

const NotificationIcon: React.FC<{ type: NotificationType }> = ({ type }) => {
  const iconConfig = {
    'FRIEND_REQUEST': { icon: personAdd, className: styles.friendRequestIcon },
    'FRIEND_ACCEPT': { icon: personAdd, className: styles.friendAcceptIcon },
    'daily_tarot': { icon: time, className: styles.dailyTarotIcon },
    'READING_SHARE': { icon: share, className: styles.readingSharedIcon },
    'READING_COMMENT': { icon: chatbubble, className: styles.readingCommentIcon },
    'READING_REACTION': { icon: heart, className: styles.readingReactionIcon },
    'SYSTEM_NOTICE': { icon: megaphone, className: styles.systemNoticeIcon }
  }[type];

  return (
    <div className={`${styles.notificationIcon} ${iconConfig.className}`}>
      <IonIcon icon={iconConfig.icon} />
    </div>
  );
};

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onClick
}) => {
  const { type, title, message, time, read } = notification;

  return (
    <div 
      className={`${styles.notificationItem} ${read ? styles.read : styles.unread}`}
      onClick={onClick}
    >
      <div className={styles.notificationContent}>
        <NotificationIcon type={type} />
        <div className={styles.textContent}>
          <h3 className={styles.notificationTitle}>{title}</h3>
          <p className={styles.notificationMessage}>{message}</p>
          <span className={styles.notificationTime}>
            {new Date(time).toLocaleString()}
          </span>
        </div>
        {!read && <div className={styles.unreadDot} />}
      </div>
    </div>
  );
};

export default NotificationItem; 