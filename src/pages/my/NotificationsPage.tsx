import React, { useEffect, useState } from 'react';
import { IonPage, IonContent, IonList, IonItem, IonLabel, IonBadge, IonButton, IonText } from '@ionic/react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../../config/firebase';
import CommonHeader from '../../components/CommonHeader';
import { useHistory } from 'react-router-dom';
import { getNoticeById } from '../../services/firebase/noticeService';
import { Notification, NotificationType, SystemNoticeNotification } from '../../types/notification';
import { markNotificationAsRead } from '../../services/firebase/notificationService';
import styles from './NotificationsPage.module.css';

interface NotificationsPageProps {
  unreadCount?: number;
}

const NotificationsPage: React.FC<NotificationsPageProps> = ({ unreadCount }) => {
  const user = useSelector((state: RootState) => state.auth.user);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const history = useHistory();

  useEffect(() => {
    if (!user?.uid) return;
    const q = query(
      collection(db, 'notifications'),
      where('recipientId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );
    const unsub = onSnapshot(q, async snap => {
      let data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Notification[];
      // 삭제된 공지 알림 필터링
      for (const n of data) {
        if (n.type === 'SYSTEM_NOTICE') {
          const notice = await getNoticeById(n.data?.noticeId);
          if (!notice || notice.deleted) {
            (n.data as SystemNoticeNotification['data'])._deletedNotice = true;
          }
        }
      }
      setNotifications(data.filter(n => {
        if (n.type === 'SYSTEM_NOTICE') {
          return !(n.data as SystemNoticeNotification['data'])?._deletedNotice;
        }
        return true;
      }));
      setLoading(false);
    });
    return () => unsub();
  }, [user?.uid]);

  const handleRead = async (notification: Notification) => {
    if (!notification.read) {
      await markNotificationAsRead(notification.id);
    }
  };

  const getNotificationTitle = (type: NotificationType): string => {
    switch (type) {
      case 'FRIEND_REQUEST':
        return '친구 요청';
      case 'FRIEND_ACCEPT':
        return '친구 수락';
      case 'daily_tarot':
        return '오늘의 타로';
      case 'READING_SHARE':
        return '타로 해석 공유';
      case 'READING_COMMENT':
        return '타로 해석 댓글';
      case 'READING_REACTION':
        return '타로 해석 반응';
      case 'SYSTEM_NOTICE':
        return '공지사항';
      default:
        return '알림';
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    handleRead(notification);
    
    switch (notification.type) {
      case 'FRIEND_REQUEST':
      case 'FRIEND_ACCEPT':
        if (notification.data?.friendId) {
          history.push(`/tabs/social/friends/${notification.data.friendId}`);
        }
        break;
      case 'READING_SHARE':
      case 'READING_COMMENT':
      case 'READING_REACTION':
        if (notification.data?.readingId) {
          history.push(`/tabs/my/readings/${notification.data.readingId}`);
        }
        break;
      case 'SYSTEM_NOTICE':
        if (notification.data?.noticeId) {
          history.push(`/tabs/my/notices/${notification.data.noticeId}`);
        }
        break;
    }
  };

  return (
    <IonPage>
      <CommonHeader 
        title="알림" 
        backHref="/tabs/my" 
        unreadCount={unreadCount}
      />
      <IonContent className="ion-padding">
        <h2 className={styles.sectionTitle}>알림 메시지</h2>
        {loading ? (
          <div className={styles.centerLoading}>불러오는 중...</div>
        ) : notifications.length === 0 ? (
          <div className={styles.emptyNotice}>알림이 없습니다.</div>
        ) : (
          <IonList>
            {notifications.map(notification => {
              const expanded = expandedId === notification.id;
              return (
                <IonItem
                  key={notification.id}
                  button
                  onClick={() => {
                    setExpandedId(expanded ? null : notification.id);
                    handleNotificationClick(notification);
                  }}
                  color={notification.read ? undefined : 'light'}
                  className={styles.itemColumn}
                >
                  <IonLabel>
                    <div className={notification.read ? styles.fontWeight400 : styles.fontWeight600}>
                      {getNotificationTitle(notification.type)}
                    </div>
                    <div className={styles.contentText}>
                      {notification.message}
                    </div>
                    <div className={styles.dateText}>
                      {new Date(notification.createdAt).toLocaleString()}
                    </div>
                  </IonLabel>
                  {!notification.read && <IonBadge color="danger">NEW</IonBadge>}
                  {expanded && (
                    <div className={styles.expandedBox}>
                      <IonText>{notification.message}</IonText>
                      {notification.type === 'SYSTEM_NOTICE' && notification.data?.noticeId && (
                        <IonButton 
                          size="small" 
                          expand="block" 
                          className={styles.noticeBtn} 
                          onClick={(e: React.MouseEvent) => {
                            e.stopPropagation();
                            if (notification.data?.noticeId) {
                              history.push(`/tabs/my/notices/${notification.data.noticeId}`);
                            }
                          }}
                        >
                          공지 바로가기
                        </IonButton>
                      )}
                    </div>
                  )}
                </IonItem>
              );
            })}
          </IonList>
        )}
      </IonContent>
    </IonPage>
  );
};

export default NotificationsPage; 