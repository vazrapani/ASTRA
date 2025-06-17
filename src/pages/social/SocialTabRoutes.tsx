import React from 'react';
import { IonRouterOutlet } from '@ionic/react';
import { Route } from 'react-router-dom';
import SocialMain from './TempSocial';
import FriendList from './FriendList';
import FriendFeed from './FriendFeed';
import FriendFeedPage from './FriendFeedPage';

interface SocialTabRoutesProps {
  unreadCount: number;
  onClickNotification: () => void;
}

const SocialTabRoutes: React.FC<SocialTabRoutesProps> = ({ unreadCount, onClickNotification }) => {
  return (
    <IonRouterOutlet>
      <Route exact path="/tabs/social" render={() => <SocialMain unreadCount={unreadCount} onClickNotification={onClickNotification} />} />
      <Route exact path="/tabs/social/friends" render={() => <FriendList unreadCount={unreadCount} onClickNotification={onClickNotification} />} />
      <Route exact path="/tabs/social/feed/:id" render={props => <FriendFeed {...props} unreadCount={unreadCount} onClickNotification={onClickNotification} />} />
      <Route exact path="/tabs/social/friends/:friendId" component={FriendFeedPage} />
    </IonRouterOutlet>
  );
};

export default SocialTabRoutes; 