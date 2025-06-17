import React, { useState, useEffect } from 'react';
import { IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel, IonRouterOutlet, IonPage } from '@ionic/react';
import { Redirect, Route, useHistory } from 'react-router-dom';
import { cardOutline, peopleOutline, personCircleOutline, settingsOutline } from 'ionicons/icons';
import Index from './Index';
import TempSocial from './social/TempSocial';
import TempAdmin from './admin/TempAdmin';
import DailyTarot from './tarot/DailyTarot';
import SpreadSelect from './tarot/SpreadSelect';
import QuestionInput from './tarot/QuestionInput';
import CardPick from './tarot/CardPick';
import Result from './tarot/Result';
import FollowUpQuestion from './tarot/FollowUpQuestion';
import FriendList from './social/FriendList';
import FriendFeed from './social/FriendFeed';
import TarotMain from './tarot/TarotMain';
import SocialMain from './social/TempSocial';
import { useSelector, useDispatch } from 'react-redux';
import { updateUser } from '../store/slices/authSlice';
import MyReadingList from './my/MyReadingList';
import ReadingDetail from './my/ReadingDetail';
import { logout as firebaseLogout, withdrawUser } from '../services/firebase/auth';
import { logout as storeLogout } from '../store/slices/authSlice';
import { persistor } from '../store';
import { CustomButton } from '../components';
import InfoPage from './my/InfoPage';
import ContactPage from './my/ContactPage';
import NotificationsPage from './my/NotificationsPage';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import CommonHeader from '../components/CommonHeader';
import NoticeListPage from './my/NoticeListPage';
import { getNoticeById } from '../services/firebase/noticeService';
import styles from './MainTabs.module.css';
import TarotTabRoutes from './tarot/TarotTabRoutes';
import SocialTabRoutes from './social/SocialTabRoutes';
import MyTabRoutes from './my/MyTabRoutes';
import MyPageMain from './my/MyPageMain';

interface MyPageMainProps {
  unreadCount?: number;
  onClickNotification?: () => void;
}

// 임시 마이페이지/관리자 메인 컴포넌트
const AdminMain = () => <IonPage><div className={styles.container}><h2>관리자 메인</h2></div></IonPage>;

// 마이페이지 알림 구독 래퍼
const MyPageWithNotifications: React.FC<{page: 'main'|'info'|'contact'|'notifications'}> = ({ page }) => {
  const user = useSelector((state: any) => state.auth.user);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user?.id) return;
    const q = query(collection(db, 'notifications'), where('userId', '==', user.id), where('read', '==', false));
    const unsub = onSnapshot(q, async snap => {
      let count = 0;
      for (const docSnap of snap.docs) {
        const n = docSnap.data();
        if (n.type === 'notice' && n.noticeId) {
          const notice = await getNoticeById(n.noticeId);
          if (!notice || notice.deleted) continue;
        }
        count++;
      }
      setUnreadCount(count);
    });
    return () => unsub();
  }, [user?.id]);

  if (page === 'main') return <MyPageMain unreadCount={unreadCount} />;
  if (page === 'info') return <InfoPage unreadCount={unreadCount} />;
  if (page === 'contact') return <ContactPage unreadCount={unreadCount} />;
  if (page === 'notifications') return <NotificationsPage unreadCount={unreadCount} />;
  return null;
};

// 글로벌 알림 구독 래퍼
const TabsWithNotifications: React.FC<{children: (unreadCount: number) => React.ReactNode}> = ({ children }) => {
  const user = useSelector((state: any) => state.auth.user);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user?.id) return;
    const q = query(collection(db, 'notifications'), where('userId', '==', user.id), where('read', '==', false));
    const unsub = onSnapshot(q, async snap => {
      let count = 0;
      for (const docSnap of snap.docs) {
        const n = docSnap.data();
        if (n.type === 'notice' && n.noticeId) {
          const notice = await getNoticeById(n.noticeId);
          if (!notice || notice.deleted) continue;
        }
        count++;
      }
      setUnreadCount(count);
    });
    return () => unsub();
  }, [user?.id]);

  return <>{children(unreadCount)}</>;
};

const MainTabs: React.FC = () => {
  const history = useHistory();
  return (
    <TabsWithNotifications>
      {(unreadCount) => (
        <IonTabs>
          <IonRouterOutlet>
            {/* 탭별 서브 라우트로 위임 */}
            <Route path="/tabs/tarot" render={() => <TarotTabRoutes unreadCount={unreadCount} />} />
            <Route path="/tabs/social" render={() => <SocialTabRoutes unreadCount={unreadCount} />} />
            <Route path="/tabs/my" render={() => <MyTabRoutes unreadCount={unreadCount} />} />
            {/* /tabs 접근 시 /tabs/tarot로 리다이렉트 */}
            <Redirect exact from="/tabs" to="/tabs/tarot" />
          </IonRouterOutlet>
          <IonTabBar slot="bottom">
            <IonTabButton tab="tarot" href="/tabs/tarot">
              <IonIcon icon={cardOutline} />
              <IonLabel>타로</IonLabel>
            </IonTabButton>
            <IonTabButton tab="social" href="/tabs/social">
              <IonIcon icon={peopleOutline} />
              <IonLabel>소셜</IonLabel>
            </IonTabButton>
            <IonTabButton tab="my" href="/tabs/my">
              <IonIcon icon={personCircleOutline} />
              <IonLabel>마이</IonLabel>
            </IonTabButton>
          </IonTabBar>
        </IonTabs>
      )}
    </TabsWithNotifications>
  );
};

export default MainTabs;
export { MyPageWithNotifications }; 