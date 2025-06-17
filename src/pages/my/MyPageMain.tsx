import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { updateUser } from '../../store/slices/authSlice';
import { logout as firebaseLogout, withdrawUser } from '../../services/firebase/auth';
import { logout as storeLogout } from '../../store/slices/authSlice';
import { persistor } from '../../store';
import CommonHeader from '../../components/CommonHeader';
import { CustomButton } from '../../components';
import styles from '../MainTabs.module.css';
import { IonButton } from '@ionic/react';
import { withdrawAndArchiveUser } from '../../services/firebase/userService';
import { auth } from '../../config/firebase';

interface MyPageMainProps {
  unreadCount?: number;
  onClickNotification?: () => void;
}

const MyPageMain: React.FC<MyPageMainProps> = ({ unreadCount, onClickNotification }) => {
  const dispatch = useDispatch();
  const user = useSelector((state: any) => state.auth.user);
  const [showModal, setShowModal] = useState(false);
  const [nicknameInput, setNicknameInput] = useState(user?.nickname || '');
  const [showCreditModal, setShowCreditModal] = useState(false);
  const [creditInput, setCreditInput] = useState('100');
  const history = useHistory();

  const handleNicknameSave = () => {
    if (nicknameInput.trim()) {
      dispatch(updateUser({ nickname: nicknameInput.trim() }));
      setShowModal(false);
    }
  };

  const handleCreditCharge = () => {
    const add = parseInt(creditInput, 10);
    if (!isNaN(add) && add > 0) {
      dispatch(updateUser({ credits: (user?.credits || 0) + add }));
      setShowCreditModal(false);
      setCreditInput('100');
    }
  };

  const handleLogout = async () => {
    await firebaseLogout();
    dispatch(storeLogout());
    await persistor.purge();
    // 라우팅은 ProtectedRoute가 자동 처리
  };

  const handleWithdraw = async () => {
    if (window.confirm('정말로 회원 탈퇴하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      try {
        if (user && auth.currentUser) {
          await withdrawAndArchiveUser(user.id, auth.currentUser);
        } else {
          await withdrawUser(); // fallback
        }
        history.replace('/auth/login');
      } catch (err) {
        alert('회원 탈퇴 중 오류가 발생했습니다. 다시 시도해 주세요.');
      }
    }
  };

  return (
    <React.Fragment>
      <CommonHeader title="마이페이지" unreadCount={unreadCount} onClickNotification={onClickNotification} />
      <div className={styles.container}>
        <h2 className={styles.title}>마이페이지</h2>
        <div className={styles.section}>
          <img src={user?.profileImage && user.profileImage.trim() !== '' ? user.profileImage : "/assets/profile_default.png"} alt="프로필" className={styles.profileImg} />
          <div className={styles.nickname}>닉네임: {user?.nickname || '로그인 필요'}</div>
          <CustomButton className={styles.btnNickname} onClick={()=>setShowModal(true)}>닉네임 변경</CustomButton>
        </div>
        {/* 닉네임 변경 모달 */}
        {showModal && (
          <div className={styles.modal}>
            <div className={styles.modalContent}>
              <h3 className={styles.title + ' ' + styles.modalTitleMargin}>닉네임 변경</h3>
              <input value={nicknameInput} onChange={e=>setNicknameInput(e.target.value)} maxLength={16} className={styles.input} />
              <div className={styles.flexEnd}>
                <button onClick={()=>setShowModal(false)} className={styles.cancelBtn}>취소</button>
                <button onClick={handleNicknameSave} className={styles.saveBtn}>저장</button>
              </div>
            </div>
          </div>
        )}
        <div className={styles.section}>
          <b>크레딧:</b> {user?.credits ?? 1000}
          <button className={styles.creditBtn} onClick={()=>setShowCreditModal(true)}>충전</button>
        </div>
        {/* 크레딧 충전 모달 */}
        {showCreditModal && (
          <div className={styles.modal}>
            <div className={styles.modalContent}>
              <h3 className={styles.title + ' ' + styles.modalTitleMargin}>크레딧 충전</h3>
              <input type="number" min={1} value={creditInput} onChange={e=>setCreditInput(e.target.value)} className={styles.input} />
              <div className={styles.flexEnd}>
                <button onClick={()=>setShowCreditModal(false)} className={styles.cancelBtn}>취소</button>
                <button onClick={handleCreditCharge} className={styles.saveBtn + ' ' + styles.saveBtnWhite}>충전</button>
              </div>
            </div>
          </div>
        )}
        <div className={styles.section}>
          <IonButton className={styles.btnFull + ' ' + styles.btnGray} routerLink="/tabs/my/readings" routerDirection="forward">지난 대화 기록</IonButton>
          <IonButton className={styles.btnFull + ' ' + styles.btnInfo} routerLink="/tabs/my/info" routerDirection="forward">제작자 정보 / 약관</IonButton>
          <IonButton className={styles.btnFull + ' ' + styles.btnInfo} routerLink="/tabs/my/contact" routerDirection="forward">문의하기</IonButton>
          <IonButton className={styles.btnFull + ' ' + styles.btnInfo} routerLink="/tabs/my/notices" routerDirection="forward">전체 공지</IonButton>
          {user?.role === 'admin' && (
            <IonButton className={styles.btnFull + ' ' + styles.btnAdmin} routerLink="/admin" routerDirection="forward">
              관리자 대시보드
            </IonButton>
          )}
          <CustomButton className={styles.btnFull + ' ' + styles.btnLogout} onClick={handleLogout}>로그아웃</CustomButton>
          <CustomButton className={styles.btnFull + ' ' + styles.btnWithdraw} onClick={handleWithdraw}>회원 탈퇴</CustomButton>
        </div>
        <div className={styles.uid}>UID: {user?.id || '로그인 필요'} (개발자용)</div>
      </div>
    </React.Fragment>
  );
};

export default MyPageMain; 