import React, { useEffect } from 'react';
import {
  IonPage,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonIcon,
  IonButton,
  useIonToast
} from '@ionic/react';
import {
  gridOutline,
  chevronForward
} from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../store';
import { setDailyTarotResult, setQuestion, setSpread } from '../../store/slices/tarotSlice';
import tarotService from '../../services/firebase/tarotService';
import { getRandomDeck, getRandomCard, getRandomOrientation } from '../../utils/tarotCards';
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
  const [present] = useIonToast();

  useEffect(() => {
    const checkDailyStatus = async () => {
      if (!user?.id) return;

      // =================================================
      // 개발용 임시 조치: 일일 타로 제한 해제
      // 개발 완료 후 반드시 원상 복구해야 합니다.
      dispatch(setDailyTarotResult({ isDailyAvailable: true, result: null }));
      return; 
      // =================================================

      try {
        const status = await tarotService.getDailyTarotStatus(user!.id);
        console.log('[타로메인] getDailyTarotStatus:', status);
        dispatch(setDailyTarotResult(status));
      } catch (error) {
        console.error('Error checking daily tarot status:', error);
        present({
          message: '일일 타로 상태를 확인하는 중 오류가 발생했습니다.',
          duration: 2000,
          position: 'bottom',
          color: 'danger'
        });
      }
    };

    checkDailyStatus();
  }, [user?.id, dispatch, present]);

  const handleDailyTarotClick = async () => {
    if (!user?.id) return;
    console.log('[타로메인] handleDailyTarotClick 진입, isDailyAvailable:', isDailyAvailable);
    // 오늘의 타로 가능 여부와 관계없이, 결과 확인 또는 새로운 뽑기를 위해 페이지로 이동합니다.
    history.push('/tabs/tarot/daily');
  };

  const handleDeepTarotClick = () => {
    console.log('[타로메인] 심층 타로 버튼 클릭');
    // 심층 타로 시작 전 상태 초기화
    dispatch(setQuestion(''));
    dispatch(setSpread(''));
    
    console.log('[타로메인] /tabs/tarot/spread로 이동 시도');
    history.push('/tabs/tarot/spread');
    console.log('[타로메인] 이동 완료');
  };

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
            <IonItem 
              className={styles.dailyItem} 
              onClick={handleDailyTarotClick}
              detail={false}
            >
              <IonLabel>
                <div className={styles.labelContainer}>
                  <h2>일일 타로</h2>
                  <span className={styles.statusChip}>
                    {isDailyAvailable ? '가능' : '완료'}
                  </span>
                </div>
                <p>{isDailyAvailable ? '오늘의 타로를 확인해보세요' : '오늘의 타로를 이미 확인했습니다'}</p>
              </IonLabel>
              <IonButton fill="clear" slot="end">
                <IonIcon icon={chevronForward} slot="icon-only" />
              </IonButton>
            </IonItem>
            <IonItem 
              button
              className={styles.spreadItem}
              detail={false}
              onClick={handleDeepTarotClick}
            >
              <IonLabel>
                <div className={styles.labelContainer}>
                  <h2>심층 타로</h2>
                </div>
                <p>다양한 스프레드로 깊이 있는 타로 리딩을 시작하세요</p>
              </IonLabel>
              <IonButton fill="clear" slot="end">
                <IonIcon icon={chevronForward} slot="icon-only" />
              </IonButton>
            </IonItem>
            {/* 필요시 추가 기능(내 기록 등)도 아래에 추가 가능 */}
          </IonList>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default TarotMain; 