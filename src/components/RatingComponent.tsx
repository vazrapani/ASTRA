import React, { useState } from 'react';

interface RatingComponentProps {
  readingId: string;
  userId: string;
  initialRating?: number; // 내 별점
  onRate?: (rating: number) => void; // 별점 선택 시 콜백
  disabled?: boolean;
}

const RatingComponent: React.FC<RatingComponentProps> = ({
  readingId,
  userId,
  initialRating = 0,
  onRate,
  disabled = false,
}) => {
  const [myRating, setMyRating] = useState(initialRating);
  const [hover, setHover] = useState(0);

  const handleClick = (rating: number) => {
    if (disabled) return;
    setMyRating(rating);
    if (onRate) onRate(rating);
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          style={{
            fontSize: '1.7em',
            color: (hover || myRating) >= star ? '#FFD600' : '#aaa',
            cursor: disabled ? 'not-allowed' : 'pointer',
            opacity: disabled ? 0.5 : 1,
            transition: 'color 0.15s',
          }}
          onMouseEnter={() => !disabled && setHover(star)}
          onMouseLeave={() => setHover(0)}
          onClick={() => handleClick(star)}
          aria-label={star + '점'}
        >★</span>
      ))}
      <span style={{ marginLeft: 8, color: '#FFD600', fontWeight: 600 }}>
        {myRating > 0 ? `${myRating}점` : '별점 선택'}
      </span>
    </div>
  );
};

export default RatingComponent; 