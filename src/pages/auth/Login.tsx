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

const Login: React.FC = () => {
  const history = useHistory();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEmailLogin = async () => {
    setLoading(true);
    setError('');
    try {
      await loginWithEmail(email, password);
      history.push('/');
    } catch (err: any) {
      setError(err.message || '로그인 실패');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      await signInWithGoogle();
      history.push('/');
    } catch (err: any) {
      setError(err.message || 'Google 로그인 실패');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setLoading(true);
    setError('');
    try {
      await signInAsGuest();
      history.push('/');
    } catch (err: any) {
      setError(err.message || '게스트 로그인 실패');
    } finally {
      setLoading(false);
    }
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
        <form onSubmit={e => { e.preventDefault(); handleEmailLogin(); }}>
          <CustomInput
            placeholder="이메일"
            value={email}
            onChange={e => setEmail(e.target.value)}
            type="email"
          />
          <CustomInput
            placeholder="비밀번호"
            value={password}
            onChange={e => setPassword(e.target.value)}
            type="password"
          />
          <CustomButton text={loading ? '로그인 중...' : '이메일로 로그인'} type="submit" />
        </form>
        <CustomButton text="Google로 로그인" onClick={handleGoogleLogin} />
        <CustomButton text="게스트로 시작하기" onClick={handleGuestLogin} />
        <CustomButton text="Naver로 로그인 (준비중)" onClick={() => handleNotReady('Naver')} />
        <CustomButton text="Kakao로 로그인 (준비중)" onClick={() => handleNotReady('Kakao')} />
        <CustomButton text="LINE으로 로그인 (준비중)" onClick={() => handleNotReady('LINE')} />
        {error && <div style={{ color: 'red', marginTop: 16 }}>{error}</div>}
      </IonContent>
    </IonPage>
  );
};

export default Login; 