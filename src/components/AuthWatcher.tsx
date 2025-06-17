import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useHistory, useLocation } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../config/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { logout, setUser, clearUser } from '../store/slices/authSlice';
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
          dispatch(setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL
          }));

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