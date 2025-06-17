import React from 'react';
import styles from './TarotSharedCard.module.css';
import { SharedReadingV2, SharedReadingRating, SharedReadingComment, SharedReadingEmoji, EmojiType } from '../types';

interface TarotSharedCardProps {
  reading: SharedReadingV2;
  currentUserId: string;
  onRate?: (score: number) => void;
  onComment?: (text: string) => void;
  onEmoji?: (emoji: EmojiType) => void;
}

const emojiList: { type: EmojiType; label: string; icon: string }[] = [
  { type: 'like', label: '좋아요', icon: '👍' },
  { type: 'thanks', label: '고마워요', icon: '🙏' },
  { type: 'impressed', label: '감동이에요', icon: '😭' },
  { type: 'love', label: '사랑해요', icon: '❤️' },
  { type: 'sad', label: '안타까워요', icon: '😢' },
];

export const TarotSharedCard: React.FC<TarotSharedCardProps> = ({ reading, currentUserId, onRate, onComment, onEmoji }) => {
  const [comment, setComment] = React.useState('');
  const myRating = reading.ratings.find(r => r.userId === currentUserId)?.rating || 0;

  return (
    <div className={styles.cardWrapper}>
      <div className={styles.header}>
        <span className={styles.sharer}>공유자: {reading.sharerUid}</span>
        <span className={styles.date}>{new Date(reading.sharedAt).toLocaleString()}</span>
      </div>
      <div className={styles.content}>{reading.sharedInterpretationContent}</div>
      <div className={styles.ratingSection}>
        <span>평점: </span>
        {[1,2,3,4,5].map(n => (
          <span
            key={n}
            className={n <= myRating ? styles.starActive : styles.star}
            onClick={() => onRate && onRate(n)}
            role="button"
            tabIndex={0}
          >★</span>
        ))}
        <span className={styles.ratingAvg}>(평균 {reading.ratings.length ? (reading.ratings.reduce((a, b) => a + b.rating, 0) / reading.ratings.length).toFixed(1) : '-'}점)</span>
      </div>
      <div className={styles.emojiSection}>
        {emojiList.map(e => (
          <span
            key={e.type}
            className={styles.emojiBtn}
            onClick={() => onEmoji && onEmoji(e.type)}
            role="button"
            tabIndex={0}
          >{e.icon} <span className={styles.emojiCount}>{reading.emojis.filter(em => em.emoji === e.type).length}</span></span>
        ))}
      </div>
      <div className={styles.commentSection}>
        <div className={styles.commentList}>
          {reading.comments.map(c => (
            <div key={c.commentId} className={styles.commentItem}>
              <b>{c.userId}</b>: {c.content}
            </div>
          ))}
        </div>
        <div className={styles.commentInputBox}>
          <input
            type="text"
            value={comment}
            onChange={e => setComment(e.target.value)}
            placeholder="댓글을 입력하세요"
            maxLength={50}
            className={styles.commentInput}
          />
          <button onClick={() => { if (comment.trim() && onComment) { onComment(comment); setComment(''); } }} className={styles.commentBtn}>등록</button>
        </div>
      </div>
    </div>
  );
};

export default TarotSharedCard; 