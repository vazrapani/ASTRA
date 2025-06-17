import React from 'react';
import { IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel, IonRouterOutlet, IonPage } from '@ionic/react';
import { peopleOutline, chatbubblesOutline, megaphoneOutline, gridOutline } from 'ionicons/icons';
import { Redirect, Route } from 'react-router-dom';
import AdminDashboard from './AdminDashboard';
import UsersPage from './UsersPage';
import InquiriesPage from './InquiriesPage';
import NoticesPage from './NoticesPage';
import CommonHeader from '../../components/CommonHeader';

const AdminTabs: React.FC = () => {
  return (
    <IonPage>
      <CommonHeader title="관리자" />
      <IonTabs>
        <IonRouterOutlet>
          <Route path="/admin/dashboard" component={AdminDashboard} exact />
          <Route path="/admin/users" component={UsersPage} exact />
          <Route path="/admin/inquiries" component={InquiriesPage} exact />
          <Route path="/admin/notices" component={NoticesPage} exact />
          <Redirect exact from="/admin" to="/admin/dashboard" />
        </IonRouterOutlet>
        <IonTabBar slot="bottom">
          <IonTabButton tab="dashboard" href="/admin/dashboard">
            <IonIcon icon={gridOutline} />
            <IonLabel>대시보드</IonLabel>
          </IonTabButton>
          <IonTabButton tab="users" href="/admin/users">
            <IonIcon icon={peopleOutline} />
            <IonLabel>사용자</IonLabel>
          </IonTabButton>
          <IonTabButton tab="inquiries" href="/admin/inquiries">
            <IonIcon icon={chatbubblesOutline} />
            <IonLabel>문의</IonLabel>
          </IonTabButton>
          <IonTabButton tab="notices" href="/admin/notices">
            <IonIcon icon={megaphoneOutline} />
            <IonLabel>공지</IonLabel>
          </IonTabButton>
        </IonTabBar>
      </IonTabs>
    </IonPage>
  );
};

export default AdminTabs; 