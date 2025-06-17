import { Redirect, Route, Switch } from 'react-router-dom';
import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import MainTabs from './pages/MainTabs';
import Login from './pages/auth/Login';
import ProtectedRoute from './components/ProtectedRoute';
import { useSelector } from 'react-redux';
import NaverCallback from './pages/auth/NaverCallback';
import './config/firebase';
import InquiriesPage from './pages/admin/InquiriesPage';
import ProtectedAdminRoute from './components/ProtectedAdminRoute';
import AdminTabs from './pages/admin/AdminTabs';
import { RootState } from './store';
import { useEffect } from 'react';
import { auth, db, initializeFCM } from './config/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useDispatch } from 'react-redux';
import { logout } from './store/slices/authSlice';
import { useHistory, useLocation } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import AuthWatcher from './components/AuthWatcher';
import { updateFCMToken } from './services/firebase/notificationService';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Ionic Dark Mode */
import '@ionic/react/css/palettes/dark.always.css';

setupIonicReact({
  mode: 'ios',
});

const App: React.FC = () => {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const userId = useSelector((state: RootState) => state.auth.user?.id);

  // FCM 초기화
  useEffect(() => {
    if (userId) {
      const setupFCM = async () => {
        try {
          const token = await initializeFCM();
          if (token) {
            await updateFCMToken(userId, token);
          }
        } catch (error) {
          console.error('FCM 설정 실패:', error);
        }
      };
      setupFCM();
    }
  }, [userId]);

  return (
    <IonApp>
      <IonReactRouter>
        <AuthWatcher />
        <IonRouterOutlet>
          <Switch>
            <Route path="/auth/login" component={Login} />
            <Route path="/naver/callback" component={NaverCallback} />
            <ProtectedRoute path="/tabs" component={MainTabs} />
            <ProtectedRoute path="/tabs/*" component={MainTabs} />
            <ProtectedAdminRoute path="/admin" component={AdminTabs} />
            <Redirect exact from="/" to={isAuthenticated ? "/tabs" : "/auth/login"} />
          </Switch>
        </IonRouterOutlet>
      </IonReactRouter>
    </IonApp>
  );
};

export default App;
