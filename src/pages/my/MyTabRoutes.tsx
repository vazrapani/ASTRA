import React from 'react';
import { IonRouterOutlet } from '@ionic/react';
import { Route } from 'react-router-dom';
import MyReadingList from './MyReadingList';
import ReadingDetail from './ReadingDetail';
import InfoPage from './InfoPage';
import ContactPage from './ContactPage';
import NotificationsPage from './NotificationsPage';
import NoticeListPage from './NoticeListPage';
import MyPageMain from './MyPageMain';
import NoticeDetailPage from './NoticeDetailPage';

interface MyTabRoutesProps {
  unreadCount: number;
  onClickNotification: () => void;
}

const MyTabRoutes: React.FC<MyTabRoutesProps> = ({ unreadCount, onClickNotification }) => {
  return (
    <IonRouterOutlet>
      <Route exact path="/tabs/my" render={() => (
        <MyPageMain unreadCount={unreadCount} />
      )} />
      <Route exact path="/tabs/my/readings" component={MyReadingList} />
      <Route exact path="/tabs/my/readings/:id" component={ReadingDetail} />
      <Route exact path="/tabs/my/info" render={() => (
        <InfoPage unreadCount={unreadCount} />
      )} />
      <Route exact path="/tabs/my/contact" render={() => (
        <ContactPage unreadCount={unreadCount} />
      )} />
      <Route exact path="/tabs/my/notifications" render={() => (
        <NotificationsPage unreadCount={unreadCount} />
      )} />
      <Route exact path="/tabs/my/notices" component={NoticeListPage} />
      <Route exact path="/tabs/my/notices/:noticeId" component={NoticeDetailPage} />
    </IonRouterOutlet>
  );
};

export default MyTabRoutes; 