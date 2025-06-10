import React from 'react';
import { IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel, IonRouterOutlet } from '@ionic/react';
import { Redirect, Route } from 'react-router-dom';
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

const MainTabs: React.FC = () => (
  <IonTabs>
    <IonRouterOutlet>
      <Route exact path="/" component={Index} />
      <Route exact path="/tarot" component={Index} />
      <Route exact path="/tarot/daily" component={DailyTarot} />
      <Route exact path="/tarot/spread" component={SpreadSelect} />
      <Route exact path="/tarot/question" component={QuestionInput} />
      <Route exact path="/tarot/pick" component={CardPick} />
      <Route exact path="/tarot/result" component={Result} />
      <Route exact path="/tarot/followup" component={FollowUpQuestion} />
      <Route exact path="/social" component={TempSocial} />
      <Route exact path="/social/friends" component={FriendList} />
      <Route exact path="/social/feed/:id" component={FriendFeed} />
      <Route exact path="/my" render={() => <div style={{textAlign:'center',padding:'2em'}}><h2>마이페이지 준비중</h2></div>} />
      <Route exact path="/admin" component={TempAdmin} />
      <Redirect exact from="/tabs" to="/" />
    </IonRouterOutlet>
    <IonTabBar slot="bottom">
      <IonTabButton tab="tarot" href="/tarot">
        <IonIcon icon={cardOutline} />
        <IonLabel>타로</IonLabel>
      </IonTabButton>
      <IonTabButton tab="social" href="/social" routerDirection="root">
        <IonIcon icon={peopleOutline} />
        <IonLabel>소셜</IonLabel>
      </IonTabButton>
      <IonTabButton tab="my" href="/my">
        <IonIcon icon={personCircleOutline} />
        <IonLabel>마이</IonLabel>
      </IonTabButton>
      <IonTabButton tab="admin" href="/admin">
        <IonIcon icon={settingsOutline} />
        <IonLabel>관리자</IonLabel>
      </IonTabButton>
    </IonTabBar>
  </IonTabs>
);

export default MainTabs; 