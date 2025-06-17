import React from 'react';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonButton, IonBackButton, IonList, IonItem, IonLabel, IonTextarea } from '@ionic/react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { addComment, addReaction } from '../../store/slices/socialSlice';
import { useParams } from 'react-router-dom';
import CommonHeader from '../../components/CommonHeader';
import styles from './FriendFeed.module.css';
import { getSharedReadingV2, setSharedReadingV2 } from '../../services/firebase/readingService';
import TarotSharedCard from '../../components/TarotSharedCard';

interface FriendFeedProps {
  unreadCount: number;
  onClickNotification: () => void;
}

const FriendFeed: React.FC<FriendFeedProps> = ({ unreadCount, onClickNotification }) => {
  const dispatch = useDispatch();
  const { id: friendId } = useParams<{ id: string }>();
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const [sharedReadings, setSharedReadings] = React.useState<any[]>([]);
  const [commentInputs, setCommentInputs] = React.useState<Record<string, string>>({});

  React.useEffect(() => {
    // TODO: 실제로는 친구별로 여러 개의 공유 해석을 쿼리해야 함. 임시로 1개만 불러옴
    getSharedReadingV2('test-shared-reading-id').then(r => r && setSharedReadings([r]));
  }, [friendId]);

  // 상호작용 핸들러
  const handleRate = async (reading: any, score: number) => {
    if (!currentUser) return;
    const ratings = reading.ratings.filter((r: any) => r.userId !== currentUser.id).concat({ userId: currentUser.id, rating: score, createdAt: Date.now() });
    const updated = { ...reading, ratings };
    await setSharedReadingV2(updated);
    setSharedReadings((prev) => prev.map(r => r.sharedReadingId === reading.sharedReadingId ? updated : r));
  };
  const handleComment = async (reading: any, text: string) => {
    if (!currentUser) return;
    const commentId = Date.now().toString();
    const comments = reading.comments.concat({ commentId, userId: currentUser.id, content: text, createdAt: Date.now() });
    const updated = { ...reading, comments };
    await setSharedReadingV2(updated);
    setSharedReadings((prev) => prev.map(r => r.sharedReadingId === reading.sharedReadingId ? updated : r));
  };
  const handleEmoji = async (reading: any, emoji: any) => {
    if (!currentUser) return;
    // 한 사용자는 한 종류의 이모티콘만 가능(중복 방지)
    const emojis = reading.emojis.filter((e: any) => e.userId !== currentUser.id).concat({ userId: currentUser.id, emoji, createdAt: Date.now() });
    const updated = { ...reading, emojis };
    await setSharedReadingV2(updated);
    setSharedReadings((prev) => prev.map(r => r.sharedReadingId === reading.sharedReadingId ? updated : r));
  };

  const handleCommentInput = (feedId: string) => {
    const content = commentInputs[feedId]?.trim();
    if (content) {
      dispatch(addComment({ feedId, comment: { id: Date.now().toString(), userId: 'me', content, createdAt: new Date() } }));
      setCommentInputs(inputs => ({ ...inputs, [feedId]: '' }));
    }
  };

  return (
    <IonPage>
      <CommonHeader title="친구 피드" unreadCount={unreadCount} onClickNotification={onClickNotification} />
      <IonContent className="ion-padding">
        {/* 공유된 해석 카드형 피드 */}
        {sharedReadings.map(reading => (
          <TarotSharedCard
            key={reading.sharedReadingId}
            reading={reading}
            currentUserId={currentUser?.id || ''}
            onRate={score => handleRate(reading, score)}
            onComment={text => handleComment(reading, text)}
            onEmoji={emoji => handleEmoji(reading, emoji)}
          />
        ))}
        {/* 기존 임시 피드 렌더링은 완전히 삭제 */}
        <IonButton expand="block" color="primary" className={styles.btnTop24}>OO님과 우정 타로 뽑기</IonButton>
        <IonButton expand="block" color="secondary" className={styles.btnTop12}>OO님과 애정 타로 뽑기</IonButton>
      </IonContent>
    </IonPage>
  );
};

export default FriendFeed; 