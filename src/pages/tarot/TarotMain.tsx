import React, { useEffect } from 'react';
import { IonPage, IonContent, IonList, IonItem, IonLabel, IonIcon, IonBadge } from '@ionic/react';
import { timeOutline, gridOutline } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../store';
import { setDailyTarotResult } from '../../store/slices/tarotSlice';
import { getDailyTarotStatus } from '../../services/firebase/tarotService';
import CommonHeader from '../../components/CommonHeader';
import styles from './TarotMain.module.css';

interface TarotMainProps {
  unreadCount?: number;
  onClickNotification?: () => void;
}

const TarotMain: React.FC<TarotMainProps> = ({ unreadCount = 0, onClickNotification }) => {
  const history = useHistory();
  const dispatch = useAppDispatch();
  const user = useAppSelector(state => state.auth.user);
  const { isDailyAvailable } = useAppSelector(state => state.tarot.dailyTarotStatus);

  useEffect(() => {
    const checkDailyStatus = async () => {
      if (!user?.uid) return;
      
      try {
        const status = await getDailyTarotStatus(user.uid);
        dispatch(setDailyTarotResult(status));
      } catch (error) {
        console.error('Error checking daily tarot status:', error);
      }
    };

    checkDailyStatus();
  }, [dispatch, user?.uid]);

  return (
    <IonPage>
      <CommonHeader 
        title="타로"
        unreadCount={unreadCount}
        onClickNotification={onClickNotification}
      />
      <IonContent>
        <div className={styles.container}>
          <IonList>
            <IonItem button onClick={() => history.push('/tabs/tarot/daily')} className={styles.dailyItem}>
              <IonIcon icon={timeOutline} slot="start" />
              <IonLabel>
                <div className={styles.labelContainer}>
                  <h2>일일 타로</h2>
                  <IonBadge 
                    color={isDailyAvailable ? "success" : "medium"}
                    className={styles.statusBadge}
                  >
                    {isDailyAvailable ? "가능" : "완료"}
                  </IonBadge>
                </div>
                <p>매일 00시에 새로운 타로 카드를 확인하세요</p>
              </IonLabel>
            </IonItem>
            <IonItem button onClick={() => history.push('/tabs/tarot/spread')}>
              <IonIcon icon={gridOutline} slot="start" />
              <IonLabel>
                <h2>타로 (스프레드)</h2>
                <p>다양한 스프레드로 타로 리딩을 시작하세요</p>
              </IonLabel>
            </IonItem>
          </IonList>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default TarotMain; 