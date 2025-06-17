import React from 'react';
import { IonModal, IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonList, IonSpinner, createAnimation } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store';
import { markNotificationAsRead } from '../store/slices/notificationSlice';
import { NOTIFICATION_ROUTES, NotificationType } from '../types/notification';
import NotificationItem from './NotificationItem';
import styles from './NotificationList.module.css';

interface NotificationListProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationList: React.FC<NotificationListProps> = ({ isOpen, onClose }) => {
  const history = useHistory();
  const dispatch = useAppDispatch();
  const notifications = useAppSelector(state => state.notification.notifications);
  const isLoading = useAppSelector(state => state.notification.isLoading);

  console.log('NotificationList rendered:', { isOpen, notifications, isLoading });

  const enterAnimation = (baseEl: HTMLElement) => {
    const root = baseEl.shadowRoot;

    const backdropAnimation = createAnimation()
      .addElement(root?.querySelector('ion-backdrop')!)
      .fromTo('opacity', '0.01', 'var(--backdrop-opacity)');

    const wrapperAnimation = createAnimation()
      .addElement(root?.querySelector('.modal-wrapper')!)
      .keyframes([
        { offset: 0, opacity: '0', transform: 'translateY(-100%)' },
        { offset: 1, opacity: '1', transform: 'translateY(0)' }
      ]);

    return createAnimation()
      .addElement(baseEl)
      .easing('ease-out')
      .duration(200)
      .addAnimation([backdropAnimation, wrapperAnimation]);
  };

  const leaveAnimation = (baseEl: HTMLElement) => {
    return enterAnimation(baseEl).direction('reverse');
  };

  const handleNotificationClick = (notificationId: string, type: NotificationType, data?: any) => {
    dispatch(markNotificationAsRead(notificationId));
    const route = NOTIFICATION_ROUTES[type];
    if (route) {
      if (data) {
        switch (type) {
          case 'FRIEND_REQUEST':
          case 'FRIEND_ACCEPT':
            if ('friendId' in data) {
              history.push(`${route}/${data.friendId}`);
            }
            break;
          case 'READING_SHARE':
          case 'READING_COMMENT':
          case 'READING_REACTION':
            if ('readingId' in data) {
              history.push(`${route}/${data.readingId}`);
            }
            break;
          case 'SYSTEM_NOTICE':
            if ('noticeId' in data) {
              history.push(`${route}/${data.noticeId}`);
            }
            break;
          default:
            history.push(route);
        }
      } else {
        history.push(route);
      }
    }
    onClose();
  };

  return (
    <IonModal 
      isOpen={isOpen} 
      onDidDismiss={onClose}
      breakpoints={[0, 1]}
      initialBreakpoint={1}
      mode="ios"
      className={styles.modal}
      enterAnimation={enterAnimation}
      leaveAnimation={leaveAnimation}
    >
      <IonHeader>
        <IonToolbar>
          <IonTitle>알림</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={onClose}>닫기</IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent className={styles.content}>
        <div className={styles.container}>
          {isLoading ? (
            <div className={styles.loading}>
              <IonSpinner />
            </div>
          ) : notifications.length === 0 ? (
            <div className={styles.empty}>
              알림이 없습니다.
            </div>
          ) : (
            <IonList className={styles.list}>
              {notifications.map(notification => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onClick={() => handleNotificationClick(notification.id, notification.type, notification.data)}
                />
              ))}
            </IonList>
          )}
        </div>
      </IonContent>
    </IonModal>
  );
};

export default NotificationList; 