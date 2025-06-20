import React from 'react';
import { TarotCard, CardOrientation } from '../types/tarot';
import styles from './TarotSharedCard.module.css';
import { SharedReadingV2, SharedReadingRating, SharedReadingComment, SharedReadingEmoji, EmojiType } from '../types';

interface TarotSharedCardProps {
  card: TarotCard;
  orientation: CardOrientation;
  className?: string;
  size?: 'default' | 'small';
}

const emojiList: { type: EmojiType; label: string; icon: string }[] = [
  { type: 'like', label: '좋아요', icon: '👍' },
  { type: 'thanks', label: '고마워요', icon: '🙏' },
  { type: 'impressed', label: '감동이에요', icon: '😭' },
  { type: 'love', label: '사랑해요', icon: '❤️' },
  { type: 'sad', label: '안타까워요', icon: '😢' },
];

const TarotSharedCard: React.FC<TarotSharedCardProps> = ({
  card,
  orientation,
  className = '',
  size = 'default'
}) => {
  const cardTypeText = card.arcana === 'major' ? '메이저 아르카나' : '마이너 아르카나';
  const deckText = card.deck === 'rider-waite' ? '라이더-웨이트' : '토트';
  
  return (
    <div className={`${styles.cardContainer} ${className} ${size === 'small' ? styles.cardSmall : ''}`}>
      <div className={`${styles.cardBox} ${size === 'small' ? styles.cardBoxSmall : ''}`}>
        <div className={styles.cardContent}>
          <div className={styles.cardHeader}>
            <span className={styles.cardDeck}>{deckText}</span>
            <span className={styles.cardType}>{cardTypeText}</span>
          </div>
          <h2 className={styles.cardName}>{card.nameKo}</h2>
          {card.suit && (
            <p className={styles.cardSuit}>{card.suit}</p>
          )}
          <div className={styles.cardOrientation}>
            {orientation === 'upright' ? '정방향' : '역방향'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TarotSharedCard; 