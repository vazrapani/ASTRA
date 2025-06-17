import React, { useState } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar
} from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { loginWithEmail, signInWithGoogle, signInAsGuest } from '../../services/firebase/auth';
import { CustomButton, CustomInput } from '../../components';
import { useDispatch } from 'react-redux';
import { loginSuccess, loginFailure } from '../../store/slices/authSlice';
import { getDoc, doc, setDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import styles from './Login.module.css';

const Login: React.FC = () => {
  const history = useHistory();
  const dispatch = useDispatch();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const NAVER_CLIENT_ID = import.meta.env.VITE_NAVER_CLIENT_ID;
  const NAVER_REDIRECT_URI = import.meta.env.VITE_NAVER_REDIRECT_URI;

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const cred = await signInWithGoogle();
      const user = cred.user;

      // Firestore에서 유저 정보 가져오기
      const userRef = doc(db, 'users', user.uid);
      let userSnap = await getDoc(userRef);

      // Firestore에 유저 정보가 없으면 새로 생성
      if (!userSnap.exists()) {
        await setDoc(userRef, {
          email: user.email || '',
          nickname: user.displayName || user.email?.split('@')[0] || '사용자',
          profileImage: user.photoURL || '',
          credits: 1000,
          role: 'user',
          status: 'active',
          createdAt: Date.now()
        });
        userSnap = await getDoc(userRef);
      }

      const userData = userSnap.data() || {};

      dispatch(loginSuccess({
        user: {
          email: user.email || '',
          nickname: user.displayName || user.email?.split('@')[0] || '사용자',
          profileImage: user.photoURL || '',
          credits: 1000,
          role: 'user',
          status: 'active',
          createdAt: Date.now(),
          ...userData,
          id: user.uid
        },
        token: (await user.getIdToken())
      }));
      history.push('/tabs');
    } catch (err: any) {
      setError(err.message || 'Google 로그인 실패');
      dispatch(loginFailure(err.message || 'Google 로그인 실패'));
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const cred = await signInAsGuest();
      const user = cred.user;
      const userRef = doc(db, 'users', user.uid);
      let userSnap = await getDoc(userRef);
      if (!userSnap.exists()) {
        await setDoc(userRef, {
          email: user.email || '',
          nickname: '게스트',
          profileImage: '',
          credits: 1000,
          role: 'user',
          status: 'active',
          createdAt: Date.now()
        });
        userSnap = await getDoc(userRef);
      }
      const userData = userSnap.data() || {};
      dispatch(loginSuccess({
        user: {
          email: user.email || '',
          nickname: '게스트',
          profileImage: '',
          credits: 1000,
          role: 'user',
          status: 'active',
          createdAt: Date.now(),
          ...userData,
          id: user.uid
        },
        token: (await user.getIdToken())
      }));
      history.push('/tabs');
    } catch (err: any) {
      setError(err.message || '게스트 로그인 실패');
      dispatch(loginFailure(err.message || '게스트 로그인 실패'));
    } finally {
      setLoading(false);
    }
  };

  const handleNaverLogin = () => {
    const state = Math.random().toString(36).substring(2, 15); // CSRF 방지용 랜덤 state
    const naverAuthUrl = `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${NAVER_CLIENT_ID}&redirect_uri=${encodeURIComponent(NAVER_REDIRECT_URI)}&state=${state}`;
    window.location.href = naverAuthUrl;
  };

  const handleNotReady = (provider: string) => {
    setError(`${provider} 로그인은 곧 지원됩니다.`);
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>로그인</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding" fullscreen>
        <div className={styles.loginBox}>
          <CustomButton onClick={handleGoogleLogin} className={styles.btnGoogle}>
            Google로 로그인
          </CustomButton>
          <CustomButton onClick={handleNaverLogin} className={styles.btnNaver}>
            Naver로 로그인
          </CustomButton>
          <CustomButton onClick={() => handleNotReady('Kakao')} className={styles.btnKakao}>
            Kakao로 로그인 (준비중)
          </CustomButton>
          <CustomButton onClick={() => handleNotReady('LINE')} className={styles.btnLine}>
            LINE으로 로그인 (준비중)
          </CustomButton>
          <CustomButton onClick={handleGuestLogin} className={styles.btnGuest}>
            게스트로 시작하기
          </CustomButton>
        </div>
        {error && <div className={styles.loginError}>{error}</div>}
      </IonContent>
    </IonPage>
  );
};

export default Login; 