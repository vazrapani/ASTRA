import React from 'react';
import { Route } from 'react-router-dom';
import { IonRouterOutlet } from '@ionic/react';
import TarotMain from './TarotMain';
import DailyTarot from './DailyTarot';
import SpreadSelect from './SpreadSelect';
import QuestionInput from './QuestionInput';
import CardPick from './CardPick';
import Result from './Result';
import FollowUpQuestion from './FollowUpQuestion';

const TarotTabRoutes: React.FC = () => {
  // 임시로 unreadCount를 0으로 고정
  const unreadCount = 0;
  const handleNotificationClick = () => {
    // TODO: 알림 클릭 핸들러 구현
  };

  return (
    <IonRouterOutlet>
      <Route exact path="/tabs/tarot">
        <TarotMain unreadCount={unreadCount} onClickNotification={handleNotificationClick} />
      </Route>
      <Route exact path="/tabs/tarot/daily">
        <DailyTarot unreadCount={unreadCount} onClickNotification={handleNotificationClick} />
      </Route>
      <Route exact path="/tabs/tarot/spread">
        <SpreadSelect unreadCount={unreadCount} onClickNotification={handleNotificationClick} />
      </Route>
      <Route exact path="/tabs/tarot/question">
        <QuestionInput unreadCount={unreadCount} onClickNotification={handleNotificationClick} />
      </Route>
      <Route exact path="/tabs/tarot/pick">
        <CardPick unreadCount={unreadCount} onClickNotification={handleNotificationClick} />
      </Route>
      <Route exact path="/tabs/tarot/result">
        <Result unreadCount={unreadCount} onClickNotification={handleNotificationClick} />
      </Route>
      <Route exact path="/tabs/tarot/followup">
        <FollowUpQuestion unreadCount={unreadCount} onClickNotification={handleNotificationClick} />
      </Route>
    </IonRouterOutlet>
  );
};

export default TarotTabRoutes; 