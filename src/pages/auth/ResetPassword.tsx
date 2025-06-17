import React, { useState } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar
} from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { resetPassword } from '../../services/firebase/auth';
import { CustomButton, CustomInput } from '../../components';
import styles from './ResetPassword.module.css';

const ResetPassword: React.FC = () => {
  const history = useHistory();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (!email) {
      setError('이메일을 입력하세요.');
      return;
    }
    setLoading(true);
    try {
      await resetPassword(email);
      setMessage('비밀번호 재설정 링크가 전송되었습니다.');
    } catch (err: any) {
      setError(err.message || '재설정 실패');
    } finally {
      setLoading(false);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>비밀번호 재설정</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <form onSubmit={handleReset}>
          <CustomInput
            placeholder="이메일"
            value={email}
            onChange={e => setEmail(e.target.value)}
            type="email"
          />
          <CustomButton type="submit">
            {loading ? '전송 중...' : '재설정 링크 보내기'}
          </CustomButton>
        </form>
        <CustomButton onClick={() => history.push('/auth/login')}>
          로그인으로 돌아가기
        </CustomButton>
        {message && <div className={styles.resetMsg}>{message}</div>}
        {error && <div className={styles.resetError}>{error}</div>}
      </IonContent>
    </IonPage>
  );
};

export default ResetPassword; 