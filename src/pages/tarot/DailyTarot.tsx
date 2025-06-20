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
import axios from 'axios';
import FriendSelectModal from '../../components/FriendSelectModal';
import { setSharedReading, setReadingRating, getReadingRatings } from '../../services/firebase/readingService';
import { v4 as uuidv4 } from 'uuid';
import { useHistory } from 'react-router-dom';
import RatingComponent from '../../components/RatingComponent';

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
  const [geminiInterpretation, setGeminiInterpretation] = useState<string>('');
  const [isGeminiLoading, setIsGeminiLoading] = useState(false);
  const [showFriendModal, setShowFriendModal] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [shareError, setShareError] = useState<string | null>(null);
  const [sharedToday, setSharedToday] = useState(false);
  const history = useHistory();
  const [myRating, setMyRating] = useState<number>(0);
  const [ratingLoading, setRatingLoading] = useState(false);

  // 진단용 로그
  console.log('[DailyTarot] 렌더링', { user, isLoading, dailyResult });

  useEffect(() => {
    console.log('[DailyTarot] useEffect(checkDailyStatus) 진입', { user });
    const checkDailyStatus = async () => {
      if (!user?.id) {
        console.log('[DailyTarot] user 없음, checkDailyStatus 중단');
        return;
      }
      try {
        setIsLoading(true);
        const status = await tarotService.getDailyTarotStatus(user.id);
        console.log('[DailyTarot] getDailyTarotStatus:', status);
        dispatch(setDailyTarotResult(status));
      } catch (error) {
        console.error('[DailyTarot] Error checking daily tarot status:', error);
        present({
          message: '일일 타로 상태를 확인하는 중 오류가 발생했습니다.',
          duration: 2000,
          position: 'bottom',
          color: 'danger'
        });
      } finally {
        setIsLoading(false);
        console.log('[DailyTarot] checkDailyStatus finally, isLoading=false');
      }
    };
    checkDailyStatus();
  }, [user?.id, dispatch, present]);

  useEffect(() => {
    // Gemini 1.5 Flash 해석 요청
    const fetchGeminiInterpretation = async () => {
      if (!dailyResult?.card) return;
      try {
        setIsGeminiLoading(true);
        const response = await axios.post('/api/interpretDailyTarot', {
          deck: dailyResult.card.deck,
          cardName: dailyResult.card.nameKo,
          cardDesc: dailyResult.card.meanings[dailyResult.orientation],
          arcana: dailyResult.card.arcana,
          orientation: dailyResult.orientation,
        });
        setGeminiInterpretation(response.data.interpretation);
      } catch (e) {
        setGeminiInterpretation('운세 해석을 가져오지 못했습니다.');
      } finally {
        setIsGeminiLoading(false);
      }
    };
    fetchGeminiInterpretation();
  }, [dailyResult]);

  useEffect(() => {
    // 공유 중복 방지: Firestore에서 오늘 공유한 기록이 있는지 확인(간단 버전)
    // TODO: 실제 Firestore에서 오늘 공유한 기록 조회(임시로 false)
    setSharedToday(false);
  }, [user?.id, dailyResult?.card?.nameKo]);

  // 별점 조회
  useEffect(() => {
    const fetchMyRating = async () => {
      if (!user?.id || !dailyResult) return;
      setRatingLoading(true);
      try {
        const { userRatings } = await getReadingRatings(dailyResult.date + '-' + user.id); // readingId는 date-userId로 가정
        setMyRating(userRatings[user.id] || 0);
      } catch (e) {
        setMyRating(0);
      } finally {
        setRatingLoading(false);
      }
    };
    fetchMyRating();
  }, [user?.id, dailyResult]);

  const handleShare = () => {
    setShowFriendModal(true);
  };

  const handleSelectFriend = async (friendId: string) => {
    if (!user || !geminiInterpretation) return;
    setSharing(true);
    setShareError(null);
    try {
      const sharedReading = {
        sharedReadingId: uuidv4(),
        originalReadingId: 'daily-'+(dailyResult?.card?.nameKo||'')+'-'+(new Date().toISOString().slice(0,10)),
        sharedTurnIndex: 0,
        sharerUid: user.id,
        receiverUids: [friendId],
        sharedAt: Date.now(),
        sharedInterpretationContent: geminiInterpretation,
        ratings: [],
        comments: [],
        emojis: [],
        card: dailyResult?.card,
        type: 'daily',
        date: new Date().toISOString().slice(0,10),
      };
      await import('../../services/firebase/readingService').then(mod => mod.setSharedReadingV2(sharedReading));
      alert('친구에게 해석이 성공적으로 공유되었습니다!');
      setShowFriendModal(false);
      setSharedToday(true);
      history.push('/tabs/social');
    } catch (e) {
      setShareError('공유 실패: ' + (e as any).message);
    } finally {
      setSharing(false);
    }
  };

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

  // ====== 종류A: 공유/별점 컴포넌트 ======
  const MyTarotShareRating = ({ user, dailyResult, interpretation }: { user: any, dailyResult: any, interpretation: string }) => {
    return (
      <>
        <div style={{width:'100%',maxWidth:400,margin:'32px auto 0',padding:'24px',background:'#23272f',borderRadius:12,boxShadow:'0 2px 8px rgba(0,0,0,0.04)',color:'#fff'}}>
          {/* 공유 버튼 */}
          <button
            style={{width:'100%',padding:'10px',borderRadius:8,background:sharedToday?'#aaa':'#6c47ff',color:'#fff',fontWeight:600,border:'none',marginBottom:16,cursor:sharedToday?'not-allowed':'pointer'}}
            onClick={handleShare}
            disabled={sharedToday || sharing}
          >🔗 {sharedToday ? '오늘은 이미 공유함' : sharing ? '공유 중...' : '해석 공유하기'}</button>
          {/* 별점 */}
          <div style={{display:'flex',alignItems:'center',gap:4,marginTop:12}}>
            <span style={{fontWeight:600,marginRight:8}}>별점:</span>
            <RatingComponent
              readingId={dailyResult.date + '-' + user.id}
              userId={user.id}
              initialRating={myRating}
              onRate={async (rating) => {
                setRatingLoading(true);
                await setReadingRating(dailyResult.date + '-' + user.id, user.id, rating);
                setMyRating(rating);
                setRatingLoading(false);
              }}
              disabled={ratingLoading}
            />
          </div>
          {shareError && <div style={{color:'#ff7675',marginTop:8}}>{shareError}</div>}
        </div>
        <FriendSelectModal open={showFriendModal} onSelect={handleSelectFriend} onClose={()=>setShowFriendModal(false)} sharing={sharing} error={shareError} />
      </>
    );
  };

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
              {isGeminiLoading ? (
                <div style={{ marginTop: '1rem', color: '#888' }}>
                  타로 해석 중...
                </div>
              ) : (
                geminiInterpretation && (
                  <div style={{ marginTop: '1rem', color: '#ffd700' }}>
                    {geminiInterpretation}
                  </div>
                )
              )}
            </div>
            <MyTarotShareRating user={user} dailyResult={dailyResult} interpretation={geminiInterpretation || dailyResult.interpretation} />
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default DailyTarot; 