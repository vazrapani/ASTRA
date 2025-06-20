import React, { useEffect } from 'react';
import { IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel, IonRouterOutlet, IonBadge } from '@ionic/react';
import { Route, Redirect } from 'react-router';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { home, person, chatbubbles } from 'ionicons/icons';
import TarotTabRoutes from './tarot/TarotTabRoutes';
import MyTabRoutes from './my/MyTabRoutes';
import SocialTabRoutes from './social/SocialTabRoutes';
import styles from './MainTabs.module.css';

const MainTabs: React.FC = () => {
  console.log('[MainTabs] 렌더링');

  useEffect(() => {
    console.log('[MainTabs] 마운트');
  }, []);

  const unreadCount = useSelector((state: RootState) => state.notification.unreadCount);
  
  const handleNotificationClick = () => {
    // TODO: 알림 클릭 핸들러 구현
  };

  return (
    <IonTabs>
      <IonRouterOutlet>
        <Route path="/tabs/tarot" render={() => {
          console.log('[MainTabs] 타로 탭 렌더링');
          return <TarotTabRoutes />;
        }} />
        <Route path="/tabs/my" render={() => {
          console.log('[MainTabs] 마이 탭 렌더링');
          return <MyTabRoutes unreadCount={unreadCount} onClickNotification={handleNotificationClick} />;
        }} />
        <Route path="/tabs/social" render={() => {
          console.log('[MainTabs] 소셜 탭 렌더링');
          return <SocialTabRoutes unreadCount={unreadCount} onClickNotification={handleNotificationClick} />;
        }} />
        <Route exact path="/tabs">
          <Redirect to="/tabs/tarot" />
        </Route>
      </IonRouterOutlet>

      <IonTabBar slot="bottom" className={styles.tabBar}>
        <IonTabButton tab="tarot" href="/tabs/tarot" className={styles.tabButton}>
          <IonIcon icon={home} />
          <IonLabel>타로</IonLabel>
        </IonTabButton>
        <IonTabButton tab="my" href="/tabs/my" className={styles.tabButton}>
          <IonIcon icon={person} />
          <IonLabel>마이</IonLabel>
          {unreadCount > 0 && (
            <IonBadge color="danger">{unreadCount}</IonBadge>
          )}
        </IonTabButton>
        <IonTabButton tab="social" href="/tabs/social" className={styles.tabButton}>
          <IonIcon icon={chatbubbles} />
          <IonLabel>소셜</IonLabel>
        </IonTabButton>
      </IonTabBar>
    </IonTabs>
  );
};

export default MainTabs; 