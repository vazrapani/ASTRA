import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  IonPage,
  IonContent,
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonIcon,
  IonText,
  IonChip,
  IonSpinner
} from '@ionic/react';
import { RootState } from '../../store';
import { getDailyTarotResult, setDailyTarotResult } from '../../services/firebase/userService';
import { checkmarkCircle, timeOutline } from 'ionicons/icons';
import { getFCMToken, updateFCMToken, requestNotificationPermission, initializeMessaging } from '../../services/firebase/notificationService';
import styles from './DailyTarot.module.css';
import CommonHeader from '../../components/CommonHeader';
import { tarotService } from '../../services/firebase/tarotService';
import { getDoc, Timestamp } from 'firebase/firestore';
import NotificationList from '../../components/NotificationList';
import { useAppDispatch, useAppSelector } from '../../store';
import { setDailyTarotResult as setDailyTarotResultSlice } from '../../store/slices/tarotSlice';
import { getDailyTarotStatus, saveDailyTarotReading } from '../../services/firebase/tarotService';

interface DailyTarotCard {
  name: string;
  meaning: string;
  imageUrl?: string;
}

interface DailyTarotResult {
  card: DailyTarotCard;
  date: Timestamp;
}

interface DailyTarotProps {
  unreadCount?: number;
  onClickNotification?: () => void;
}

const getRandomCard = () => {
  // 실제 카드 리스트로 교체 필요
  const cards = [
    { name: 'The Star', imageUrl: '/assets/cards/star.jpg' },
    { name: 'The Sun', imageUrl: '/assets/cards/sun.jpg' },
    { name: 'The Moon', imageUrl: '/assets/cards/moon.jpg' },
    // ... 더 추가
  ];
  return cards[Math.floor(Math.random() * cards.length)];
};

const DailyTarot: React.FC<DailyTarotProps> = ({ unreadCount = 0, onClickNotification }) => {
  const user = useSelector((state: RootState) => state.auth.user);
  const [dailyResult, setDailyResult] = useState<DailyTarotResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [cardId, setCardId] = useState<string | null>(null);
  const [reading, setReading] = useState<string>('');
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const dispatch = useAppDispatch();
  const { isDailyAvailable, result: dailyResultSlice } = useAppSelector(state => state.tarot.dailyTarotStatus);

  useEffect(() => {
    const initializeNotifications = async () => {
      if (user?.uid) {
        const isGranted = await requestNotificationPermission();
        if (isGranted) {
          const token = await getFCMToken();
          if (token) {
            await updateFCMToken(user.uid, token);
          }
          initializeMessaging();
        }
      }
    };

    const loadDailyTarot = async () => {
      if (user?.uid) {
        try {
          const result = await getDailyTarotResult(user.uid);
          setDailyResult(result);
        } catch (error) {
          console.error('Error loading daily tarot:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    const initializeDailyTarot = async () => {
      if (!user?.uid) return;

      try {
        setIsLoading(true);
        // 오늘의 타로 초기화 체크 및 처리
        const wasReset = await tarotService.resetDailyTarot(user.uid);
        
        // 현재 데이터 조회
        const dailyTarotRef = tarotService.getDailyTarotRef(user.uid);
        const dailyTarotDoc = await getDoc(dailyTarotRef);
        
        if (dailyTarotDoc.exists()) {
          const data = dailyTarotDoc.data();
          setCardId(data.cardId);
          setReading(data.reading);
          setDailyResult({
            card: {
              name: "임시 카드",
              meaning: "임시 의미"
            },
            date: data.updatedAt
          });
        }
      } catch (error) {
        console.error('Failed to initialize daily tarot:', error);
      } finally {
        setIsLoading(false);
      }
    };

    dispatch(setDailyTarotResultSlice({
      isDailyAvailable: true,
      result: {
        card: {
          name: "임시 카드",
          meaning: "임시 의미"
        },
        date: Timestamp.fromDate(new Date())
      }
    }));
    initializeNotifications();
    loadDailyTarot();
    initializeDailyTarot();
  }, [user?.uid, dispatch]);

  useEffect(() => {
    const checkDailyStatus = async () => {
      if (!user?.uid) return;
      
      try {
        setIsLoading(true);
        const status = await getDailyTarotStatus(user.uid);
        dispatch(setDailyTarotResultSlice(status));
      } catch (error) {
        console.error('Error checking daily tarot status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkDailyStatus();
  }, [dispatch, user?.uid]);

  const handleDailyTarot = async () => {
    if (!user?.uid || !isDailyAvailable) return;

    try {
      setIsLoading(true);
      // 실제 카드 선택 로직으로 교체 필요
      const cardData = {
        name: "The Star",
        imageUrl: "/assets/cards/star.jpg" // 실제 이미지 경로로 교체 필요
      };
      
      const result = await saveDailyTarotReading(user.uid, cardData);
      dispatch(setDailyTarotResultSlice({
        isDailyAvailable: false,
        result: {
          card: result.card,
          date: result.date
        }
      }));
    } catch (error) {
      console.error('Error drawing daily tarot card:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNotificationClick = () => {
    setIsNotificationModalOpen(true);
  };

  const handleNotificationModalClose = () => {
    setIsNotificationModalOpen(false);
  };

  const handleDrawCard = async () => {
    if (!user?.uid || !isDailyAvailable) return;

    try {
      setIsLoading(true);
      // 여기에 카드 선택 로직 구현
      const cardData = {
        name: "샘플 카드",
        meaning: "샘플 의미"
      };
      
      const result = await saveDailyTarotReading(user.uid, cardData);
      dispatch(setDailyTarotResultSlice({
        isDailyAvailable: false,
        result: {
          card: cardData,
          date: result.date
        }
      }));
    } catch (error) {
      console.error('Error drawing daily tarot card:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderStatusChip = () => (
    <IonChip 
      color={isDailyAvailable ? "warning" : "success"}
      className={styles.statusChip}
    >
      <IonIcon icon={isDailyAvailable ? timeOutline : checkmarkCircle} />
      <IonText>
        {isDailyAvailable ? "가능" : "완료"}
      </IonText>
    </IonChip>
  );

  if (loading || isLoading) {
    return (
      <IonPage>
        <CommonHeader 
          title="일일 타로"
          backHref="/tabs/tarot"
          unreadCount={unreadCount}
          onClickNotification={handleNotificationClick}
        />
        <div className={styles.loadingContainer}>
          <IonSpinner />
        </div>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <CommonHeader 
        title="일일 타로"
        backHref="/tabs/tarot"
        unreadCount={unreadCount}
        onClickNotification={handleNotificationClick}
      />
      <IonContent>
        <div className={styles.container}>
          <IonCard>
            <IonCardHeader>
              <h2>오늘의 타로</h2>
            </IonCardHeader>
            <IonCardContent>
              {isLoading || !dailyResult ? (
                <div className={styles.loadingContainer}>
                  <IonText color="medium">카드를 뽑고 해석을 준비 중입니다...</IonText>
                </div>
              ) : (
                <>
                  <div className={styles.cardContainer}>
                    <div className={styles.tarotCard}>
                      <img 
                        src={dailyResult.card.imageUrl || '/assets/card_default.png'} 
                        alt={dailyResult.card.name}
                        className={styles.cardImage}
                      />
                      <h3>{dailyResult.card.name}</h3>
                    </div>
                  </div>
                  <div className={styles.meaningContainer}>
                    <h2>{dailyResult.card.name}</h2>
                    <div className={styles.interpretation}>
                      {dailyResult.card.meaning.split('\n').map((paragraph, index) => (
                        <p key={index}>{paragraph}</p>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </IonCardContent>
          </IonCard>
        </div>
      </IonContent>
      <NotificationList 
        isOpen={isNotificationModalOpen}
        onClose={handleNotificationModalClose}
      />
    </IonPage>
  );
};

export default DailyTarot; 