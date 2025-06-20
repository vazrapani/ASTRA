import React, { useEffect, useState } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { IonPage, IonContent, IonHeader, IonToolbar, IonButtons, IonBackButton, IonTitle, IonSpinner } from '@ionic/react';
import styles from './FriendFeed.module.css';
import defaultProfileImage from '../../assets/images/default-profile.png';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';
import TarotSharedCard from '../../components/TarotSharedCard';

interface Reading {
  sharedReadingId: string;
  date: string;
  question: string;
  summary: string;
  emojis: string[];
  comments: Array<{
    user: string;
    text: string;
  }>;
  card?: string;
  type?: string;
}

interface Friend {
  id: string;
  nickname: string;
  profileImage?: string;
  status?: string;
}

const DEFAULT_PROFILE_IMAGE = defaultProfileImage;

const FriendFeedPage: React.FC = () => {
  const { friendId } = useParams<{ friendId: string }>();
  const history = useHistory();
  const [friend, setFriend] = useState<Friend | null>(null);
  const [feeds, setFeeds] = useState<Reading[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<'received' | 'sent'>('received');

  useEffect(() => {
    const fetchFriendAndFeeds = async () => {
      setLoading(true);
      setError(null);
      try {
        // 친구 정보 가져오기
        const userRef = doc(db, 'users', friendId);
        const userSnap = await getDoc(userRef);
        if (!userSnap.exists()) {
          setError('친구 정보를 찾을 수 없습니다.');
          setLoading(false);
          return;
        }
        const userData = userSnap.data();
        setFriend({
          id: friendId,
          nickname: userData.nickname || '이름 없음',
          profileImage: userData.profileImage || '',
          status: userData.status || 'active',
        });

        // 피드(공유된 해석) 가져오기 (sharedReadingsV2 컬렉션에서 해당 userId의 피드)
        const feedsRef = collection(db, 'sharedReadingsV2');
        const q = query(feedsRef, where('receiverUids', 'array-contains', friendId));
        const feedsSnap = await getDocs(q);
        const feedList: Reading[] = feedsSnap.docs.map(docSnap => {
          const d = docSnap.data();
          return {
            sharedReadingId: docSnap.id,
            date: d.date || '',
            question: d.question || '',
            summary: d.sharedInterpretationContent || '',
            emojis: d.emojis || [],
            comments: d.comments || [],
            card: d.card || null,
            type: d.type || '',
          };
        });
        setFeeds(feedList);
      } catch (err: any) {
        setError('데이터를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };
    if (friendId) fetchFriendAndFeeds();
  }, [friendId]);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/tabs/social/friends" />
          </IonButtons>
          <IonTitle>{friend ? `${friend.nickname}님의 피드` : '친구 피드'}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <div className={styles.pageContainer}>
          <div style={{display:'flex',justifyContent:'center',margin:'16px 0'}}>
            <button onClick={()=>setTab('received')} style={{padding:'8px 24px',borderRadius:8,background:tab==='received'?'#6c47ff':'#23272f',color:'#fff',border:'none',marginRight:8,fontWeight:600}}>받은 공유</button>
            <button onClick={()=>setTab('sent')} style={{padding:'8px 24px',borderRadius:8,background:tab==='sent'?'#6c47ff':'#23272f',color:'#fff',border:'none',fontWeight:600}}>보낸 공유</button>
          </div>
          {loading ? (
            <div style={{textAlign:'center',marginTop:40}}><IonSpinner name="crescent" /> 불러오는 중...</div>
          ) : error ? (
            <div className={styles.emptyMsg}>{error}</div>
          ) : friend && (
            <>
              <div className={styles.friendHeader}>
                <img 
                  src={friend.profileImage && String(friend.profileImage).trim() !== "" ? friend.profileImage : DEFAULT_PROFILE_IMAGE}
                  alt={friend.nickname}
                  className={styles.avatar}
                  onError={e => { (e.currentTarget as HTMLImageElement).src = DEFAULT_PROFILE_IMAGE; }}
                />
                <div className={styles.nickname}>{friend.nickname}</div>
              </div>
              <div className={styles.feedList}>
                {feeds.map((reading: Reading) => {
                  // 대표 타로카드 추출
                  let mainCard = null;
                  if (Array.isArray(reading.card) && reading.card.length > 0) mainCard = reading.card[0];
                  else if (reading.card) mainCard = reading.card;
                  // 해석 일부 추출
                  const interpretationPreview = (reading.summary || '').slice(0, 40) + ((reading.summary || '').length > 40 ? '...' : '');
                  return (
                    <div key={reading.sharedReadingId} className={styles.feedCard} style={{cursor:'pointer'}} onClick={() => history.push(`/tabs/social/feed-detail/${reading.sharedReadingId}`)}>
                      {/* 날짜 */}
                      <div className={styles.feedDate}>{reading.date}</div>
                      {/* 대표 타로카드: TarotSharedCard 재사용 */}
                      {mainCard && (
                        <div style={{marginBottom:8, display:'flex', justifyContent:'center'}}>
                          <TarotSharedCard card={mainCard} orientation={mainCard.direction || mainCard.orientation || 'upright'} size="small" />
                        </div>
                      )}
                      {/* 해석 일부 */}
                      <div style={{margin:'8px 0',color:'#ffd700',fontSize:15}}>{interpretationPreview}</div>
                    </div>
                  );
                })}
                {feeds.length === 0 && <div className={styles.emptyMsg}>아직 공유된 해석이 없습니다.</div>}
              </div>
              <div className={styles.bottomBox}>
                <button className={styles.tarotBtn}>OO님과 우정 타로 뽑기</button>
                <button className={styles.tarotBtn2}>OO님과 애정 타로 뽑기</button>
                <div className={styles.guideMsg}>
                  타로 해석은 개인의 현재 에너지와 관점에 따라 다르게 느껴질 수 있습니다.<br />
                  서로의 해석을 존중하며 대화의 계기로 삼아보세요.
                </div>
              </div>
            </>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default FriendFeedPage; 