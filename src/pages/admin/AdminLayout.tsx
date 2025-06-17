import React, { PropsWithChildren } from 'react';
import {
  IonPage,
  IonSplitPane,
  IonMenu,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonIcon,
  IonLabel,
  IonMenuToggle,
} from '@ionic/react';
import {
  mailOutline,
  peopleOutline,
  newspaperOutline,
  settingsOutline,
  statsChartOutline,
  shieldOutline,
} from 'ionicons/icons';
import { useLocation } from 'react-router-dom';
import styles from './AdminLayout.module.css';
import { useSelector } from 'react-redux';
import { Redirect } from 'react-router-dom';
import { RootState } from '../../store';

const menuItems = [
  {
    title: '대시보드',
    icon: statsChartOutline,
    url: '/admin',
  },
  {
    title: '사용자 관리',
    icon: peopleOutline,
    url: '/admin/users',
  },
  {
    title: '카드 관리',
    icon: newspaperOutline,
    url: '/admin/cards',
  },
  {
    title: '스프레드 관리',
    icon: settingsOutline,
    url: '/admin/spreads',
  },
  {
    title: '문의 관리',
    icon: mailOutline,
    url: '/admin/inquiries',
  },
  {
    title: '공지 관리',
    icon: shieldOutline,
    url: '/admin/notices',
  },
];

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const location = useLocation();
  const user = useSelector((state: RootState) => state.auth.user);

  // 관리자가 아닌 경우 홈으로 리다이렉트
  if (!user || user.role !== 'admin') {
    return <Redirect to="/tabs" />;
  }

  return (
    <IonPage>
      <IonSplitPane contentId="admin-main" when="md">
        <IonMenu contentId="admin-main" className={styles.menu}>
          <IonHeader>
            <IonToolbar color="primary">
              <IonTitle>관리자 메뉴</IonTitle>
            </IonToolbar>
          </IonHeader>
          <IonContent>
            <IonList lines="none">
              {menuItems.map((item) => (
                <IonMenuToggle key={item.url} autoHide={false}>
                  <IonItem
                    className={location.pathname === item.url ? styles.selected : ''}
                    routerLink={item.url}
                    routerDirection="none"
                    detail={false}
                  >
                    <IonIcon slot="start" icon={item.icon} />
                    <IonLabel>{item.title}</IonLabel>
                  </IonItem>
                </IonMenuToggle>
              ))}
            </IonList>
          </IonContent>
        </IonMenu>

        <IonPage id="admin-main" className={styles.content}>
          {children}
        </IonPage>
      </IonSplitPane>
    </IonPage>
  );
};

export default AdminLayout; 