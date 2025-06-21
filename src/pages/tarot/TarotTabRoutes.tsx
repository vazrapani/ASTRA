import React, { useEffect } from 'react';
import { Route, Redirect } from 'react-router-dom';
import { IonRouterOutlet } from '@ionic/react';
import TarotMain from './TarotMain';
import TarotDaily from './Tarot-Daily';
import SpreadSelect from './SpreadSelect';
import QuestionInput from './QuestionInput';
import CardPick from './CardPick';
import Result from './Result';
import FollowUpQuestion from './FollowUpQuestion';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

const TarotTabRoutes: React.FC = () => {
  console.log('[TarotTabRoutes] 렌더링');

  useEffect(() => {
    console.log('[TarotTabRoutes] 마운트');
  }, []);

  const unreadCount = useSelector((state: RootState) => state.notification.unreadCount);
  
  const handleNotificationClick = () => {
    // TODO: 알림 클릭 핸들러 구현
  };

  return (
    <IonRouterOutlet>
      <Route exact path="/tabs/tarot" render={() => {
        console.log('[TarotTabRoutes] 메인 페이지 렌더링');
        return <TarotMain unreadCount={unreadCount} onClickNotification={handleNotificationClick} />;
      }} />
      <Route exact path="/tabs/tarot/daily" render={() => {
        console.log('[TarotTabRoutes] 일일 타로 페이지 렌더링');
        return <TarotDaily unreadCount={unreadCount} onClickNotification={handleNotificationClick} />;
      }} />
      <Route exact path="/tabs/tarot/spread" render={() => {
        console.log('[TarotTabRoutes] 심층 타로 페이지 렌더링');
        return <SpreadSelect />;
      }} />
      <Route exact path="/tabs/tarot/question" render={() => {
        console.log('[TarotTabRoutes] 질문 입력 페이지 렌더링');
        return <QuestionInput unreadCount={unreadCount} onClickNotification={handleNotificationClick} />;
      }} />
      <Route exact path="/tabs/tarot/pick" render={() => {
        console.log('[TarotTabRoutes] 카드 선택 페이지 렌더링');
        return <CardPick unreadCount={unreadCount} onClickNotification={handleNotificationClick} />;
      }} />
      <Route exact path="/tabs/tarot/result" render={() => {
        console.log('[TarotTabRoutes] 결과 페이지 렌더링');
        return <Result unreadCount={unreadCount} onClickNotification={handleNotificationClick} />;
      }} />
      <Route exact path="/tabs/tarot/followup" render={() => {
        console.log('[TarotTabRoutes] 추가 질문 페이지 렌더링');
        return <FollowUpQuestion unreadCount={unreadCount} onClickNotification={handleNotificationClick} />;
      }} />
      <Route>
        <Redirect to="/tabs/tarot" />
      </Route>
    </IonRouterOutlet>
  );
};

export default TarotTabRoutes; 