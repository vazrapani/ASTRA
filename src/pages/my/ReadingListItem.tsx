import React from 'react';
import styles from './ReadingListItem.module.css';

type Props = {
  date: string;
  question: string;
  cardImage: string;
  cardCount: number;
  rating?: number;
  onClick?: () => void;
};

const ReadingListItem: React.FC<Props> = ({ date, question, cardImage, cardCount, rating, onClick }) => {
  const safeCardImage = cardImage && cardImage.trim() !== '' ? cardImage : '/assets/card_default.png';

  return (
    <div onClick={onClick} className={styles.readingListItemRoot}>
      <img src={safeCardImage} alt="대표카드" className={styles.readingListItemImage} />
      <div className={styles.readingListItemInfo}>
        <div className={styles.readingListItemDate}>{date}</div>
        <div className={styles.readingListItemQuestion}>{question}</div>
        <div className={styles.readingListItemCardCount}>카드 {cardCount}장</div>
      </div>
      {typeof rating === 'number' && (
        <div className={styles.readingListItemRating}>{'★'.repeat(rating)}{'☆'.repeat(5-rating)}</div>
      )}
    </div>
  );
};

export default ReadingListItem; 