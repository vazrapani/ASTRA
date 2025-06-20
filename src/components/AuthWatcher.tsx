import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useHistory, useLocation } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../config/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { logout, setUser } from '../store/slices/authSlice';
import type { User } from '../types/user';
import { initializeMessaging, requestNotificationPermission } from '../services/firebase/notificationService';

const AuthWatcher: React.FC = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userRef = doc(db, 'users', firebaseUser.uid);
        const userSnap = await getDoc(userRef);
        if (!userSnap.exists()) {
          dispatch(logout());
          if (history && location.pathname !== '/auth/login') {
            history.replace('/auth/login');
          }
        } else {
          const userData = userSnap.data();
          const userObj: User = {
            id: firebaseUser.uid,
            email: firebaseUser.email || userData?.email || '',
            nickname: userData?.nickname || firebaseUser.displayName || firebaseUser.email?.split('@')[0] || '사용자',
            profileImage: userData?.profileImage || firebaseUser.photoURL || '',
            credits: userData?.credits || 0,
            role: userData?.role || 'user',
            createdAt: userData?.createdAt || Date.now(),
            deletedAt: userData?.deletedAt,
          };
          dispatch(setUser(userObj));

          const isGranted = await requestNotificationPermission();
          if (isGranted) {
            await initializeMessaging(firebaseUser.uid);
          }
        }
      } else {
        dispatch(logout());
        if (history && location.pathname !== '/auth/login') {
          history.replace('/auth/login');
        }
      }
    });
    return () => unsubscribe();
  }, [dispatch, history, location]);

  return null;
};

export default AuthWatcher; 