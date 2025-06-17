import React, { useEffect, useState } from 'react';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel, IonText, IonModal, IonButton } from '@ionic/react';
import { Notice, NoticeCategory } from '../../types/notice';
import { getNoticeList, markNoticeAsRead } from '../../services/firebase/noticeService';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import CommonHeader from '../../components/CommonHeader';
import { useHistory } from 'react-router-dom';
import styles from './NoticeListPage.module.css';

const NoticeListPage: React.FC = () => {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);
  const user = useSelector((state: RootState) => state.auth.user);
  const history = useHistory();

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    const list = await getNoticeList();
    if (!user) {
      setNotices(list.filter(n => !n.deleted));
      return;
    }
    setNotices(list.filter(n => {
      if (n.deleted) return false;
      if (!n.targetType || n.targetType === 'all') return true;
      if (n.targetType === 'groups' && n.targetGroups) {
        if (Array.isArray(user.groups)) {
          return n.targetGroups.some(gid => user.groups!.includes(gid));
        }
        return false;
      }
      if (n.targetType === 'users' && n.targetUsers) {
        return n.targetUsers.includes(user.id);
      }
      return false;
    }));
  };

  const handleOpenNotice = async (notice: Notice) => {
    setSelectedNotice(notice);
    if (user && !notice.readBy?.[user.id]) {
      await markNoticeAsRead(notice.noticeId, user.id);
      fetchNotices();
    }
  };

  return (
    <IonPage>
      <CommonHeader title="전체 공지" backHref="/tabs/my" />
      <IonContent className="ion-padding">
        <IonList>
          {notices.map(notice => {
            const isRead = user && notice.readBy?.[user.id];
            return (
              <IonItem key={notice.noticeId} button onClick={() => history.push(`/tabs/my/notices/${notice.noticeId}`)}>
                <IonLabel>
                  <span className={isRead ? styles.readTitle : styles.unreadTitle}>{notice.title}</span>
                  <IonText color="medium" className={styles.categoryText}>[{notice.category}]</IonText>
                  <div className={styles.dateText}>작성일: {new Date(notice.createdAt).toLocaleDateString()}</div>
                </IonLabel>
              </IonItem>
            );
          })}
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default NoticeListPage; 