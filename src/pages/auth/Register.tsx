import React, { useState } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButton,
  IonList,
  IonItem,
  IonLabel,
  IonInput,
  IonSelect,
  IonSelectOption,
} from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { registerWithEmail } from '../../services/firebase/auth';
import { CustomButton, CustomInput } from '../../components';

const Register: React.FC = () => {
  const history = useHistory();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password || !password2 || !nickname) {
      setError('모든 항목을 입력하세요.');
      return;
    }
    if (password !== password2) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }
    setLoading(true);
    try {
      await registerWithEmail(email, password);
      history.push('/auth/login');
    } catch (err: any) {
      setError(err.message || '회원가입 실패');
    } finally {
      setLoading(false);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>회원가입</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <form onSubmit={handleRegister}>
          <CustomInput
            placeholder="닉네임"
            value={nickname}
            onChange={e => setNickname(e.target.value)}
          />
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
          <CustomInput
            placeholder="비밀번호 확인"
            value={password2}
            onChange={e => setPassword2(e.target.value)}
            type="password"
          />
          <CustomButton text={loading ? '가입 중...' : '가입하기'} type="submit" />
        </form>
        <CustomButton text="로그인으로 돌아가기" onClick={() => history.push('/auth/login')} />
        {error && <div style={{ color: 'red', marginTop: 16 }}>{error}</div>}
      </IonContent>
    </IonPage>
  );
};

export default Register; 