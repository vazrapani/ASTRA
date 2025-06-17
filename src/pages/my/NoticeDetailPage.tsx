import React, { useEffect, useState } from 'react';
import { IonPage, IonContent, IonText, IonButton } from '@ionic/react';
import { useParams, useHistory } from 'react-router-dom';
import { Notice } from '../../types/notice';
import { getNoticeList, markNoticeAsRead } from '../../services/firebase/noticeService';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import CommonHeader from '../../components/CommonHeader';
import styles from './NoticeListPage.module.css';

const NoticeDetailPage: React.FC = () => {
  const { noticeId } = useParams<{ noticeId: string }>();
  const [notice, setNotice] = useState<Notice | null>(null);
  const user = useSelector((state: RootState) => state.auth.user);
  const history = useHistory();

  useEffect(() => {
    const fetchNotice = async () => {
      const list = await getNoticeList();
      const found = list.find(n => n.noticeId === noticeId);
      setNotice(found || null);
      if (found && user && !found.readBy?.[user.id]) {
        await markNoticeAsRead(found.noticeId, user.id);
      }
    };
    fetchNotice();
  }, [noticeId, user]);

  if (!notice) {
    return (
      <IonPage>
        <CommonHeader title="공지 상세" backHref="/tabs/my/notices" />
        <IonContent className="ion-padding">
          <div>공지 정보를 찾을 수 없습니다.</div>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <CommonHeader title="공지 상세" backHref="/tabs/my/notices" />
      <IonContent className="ion-padding">
        <IonButton expand="block" className={styles.modalCloseBtn} onClick={() => {
          if (history.length > 1) history.goBack();
          else history.replace('/tabs/my/notices');
        }}>뒤로가기</IonButton>
        <h2>{notice.title} <IonText color="medium">[{notice.category}]</IonText></h2>
        <div className={styles.modalContent}>{notice.content}</div>
        <div className={styles.dateText}>작성일: {new Date(notice.createdAt).toLocaleString()}</div>
      </IonContent>
    </IonPage>
  );
};

export default NoticeDetailPage; 