import React from 'react';
import styles from './ReadingSearchBar.module.css';

type Props = {
  value: string;
  onChange: (v: string) => void;
  onSearch: () => void;
  resultCount?: number;
  onPrev?: () => void;
  onNext?: () => void;
};

const ReadingSearchBar: React.FC<Props> = ({ value, onChange, onSearch, resultCount, onPrev, onNext }) => (
  <div className={styles.readingSearchBarRoot}>
    <input
      type="text"
      value={value}
      onChange={e => onChange(e.target.value)}
      onKeyDown={e => { if (e.key === 'Enter') onSearch(); }}
      placeholder="질문, 키워드로 검색"
      className={styles.readingSearchBarInput}
    />
    <button onClick={onSearch} className={styles.readingSearchBarBtn}>검색</button>
    {typeof resultCount === 'number' && (
      <span className={styles.readingSearchBarResult}>
        총 {resultCount}개
        <button onClick={onPrev} className={styles.readingSearchBarArrow}>▲</button>
        <button onClick={onNext} className={styles.readingSearchBarArrow}>▼</button>
      </span>
    )}
  </div>
);

export default ReadingSearchBar; 