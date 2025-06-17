import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  IonPage,
  IonContent,
  IonSpinner,
  useIonToast
} from '@ionic/react';
import { RootState } from '../../store';
import styles from './DailyTarot.module.css';
import CommonHeader from '../../components/CommonHeader';
import tarotService from '../../services/firebase/tarotService';
import { useAppDispatch, useAppSelector } from '../../store';
import { setDailyTarotResult } from '../../store/slices/tarotSlice';
import TarotSharedCard from '../../components/TarotSharedCard';

interface DailyTarotProps {
  unreadCount?: number;
  onClickNotification?: () => void;
}

const DailyTarot: React.FC<DailyTarotProps> = ({ unreadCount = 0, onClickNotification }) => {
  const user = useSelector((state: RootState) => state.auth.user);
  const [isLoading, setIsLoading] = useState(true);
  const dispatch = useAppDispatch();
  const { result: dailyResult } = useAppSelector(state => state.tarot.dailyTarotStatus);
  const [present] = useIonToast();

  useEffect(() => {
    const checkDailyStatus = async () => {
      if (!user?.uid) return;
      
      try {
        setIsLoading(true);
        const status = await tarotService.getDailyTarotStatus(user.uid);
        dispatch(setDailyTarotResult(status));
      } catch (error) {
        console.error('Error checking daily tarot status:', error);
        present({
          message: '일일 타로 상태를 확인하는 중 오류가 발생했습니다.',
          duration: 2000,
          position: 'bottom',
          color: 'danger'
        });
      } finally {
        setIsLoading(false);
      }
    };

    checkDailyStatus();
  }, [user?.uid, dispatch, present]);

  if (!user) {
    return null;
  }

  if (isLoading) {
    return (
      <IonPage>
        <CommonHeader 
          title="일일 타로"
          backHref="/tabs/tarot"
          unreadCount={unreadCount}
          onClickNotification={onClickNotification}
        />
        <div className={styles.loadingContainer}>
          <IonSpinner />
        </div>
      </IonPage>
    );
  }

  if (!dailyResult) {
    return (
      <IonPage>
        <CommonHeader 
          title="일일 타로"
          backHref="/tabs/tarot"
          unreadCount={unreadCount}
          onClickNotification={onClickNotification}
        />
        <IonContent>
          <div className={styles.messageContainer}>
            <h2>아직 오늘의 타로가 준비되지 않았습니다</h2>
            <p>메인 화면에서 일일 타로를 시작해주세요.</p>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <CommonHeader 
        title="일일 타로"
        backHref="/tabs/tarot"
        unreadCount={unreadCount}
        onClickNotification={onClickNotification}
      />
      <IonContent>
        <div className={styles.container}>
          <div className={styles.resultContainer}>
            {dailyResult.card ? (
              <TarotSharedCard
                card={dailyResult.card}
                orientation={dailyResult.orientation}
                className={styles.cardDisplay}
              />
            ) : (
              <div>카드 정보가 올바르지 않습니다.</div>
            )}
            <div className={styles.interpretation}>
              <h2>오늘의 타로 해석</h2>
              <p>{dailyResult.interpretation}</p>
            </div>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default DailyTarot; 