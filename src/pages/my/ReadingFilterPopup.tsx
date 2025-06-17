import React from 'react';
import styles from './ReadingFilterPopup.module.css';

const periods = ['전체', '최근 1주일', '최근 1개월', '최근 3개월', '최근 6개월', '최근 1년', '사용자 정의'];
const categories = ['전체', '연애', '직업', '사업', '금전', '상대방의 속마음'];

type Props = {
  open: boolean;
  period: string;
  category: string;
  onChange: (p: { period: string; category: string }) => void;
  onClose: () => void;
  onReset: () => void;
  onApply: () => void;
};

const ReadingFilterPopup: React.FC<Props> = ({ open, period, category, onChange, onClose, onReset, onApply }) => {
  if (!open) return null;
  return (
    <div className={styles.readingFilterPopupOverlay}>
      <div className={styles.readingFilterPopupBox}>
        <h3 className={styles.readingFilterPopupTitle}>필터</h3>
        <div className={styles.readingFilterPopupSection}>
          <b>기간</b><br />
          <select value={period} onChange={e => onChange({ period: e.target.value, category })} className={styles.readingFilterPopupSelect}>
            {periods.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <div className={styles.readingFilterPopupSection}>
          <b>카테고리</b><br />
          <select value={category} onChange={e => onChange({ period, category: e.target.value })} className={styles.readingFilterPopupSelect}>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className={styles.readingFilterPopupBtnRow}>
          <button onClick={onReset} className={`${styles.readingFilterPopupBtn} ${styles.readingFilterPopupBtnReset}`}>초기화</button>
          <button onClick={onApply} className={`${styles.readingFilterPopupBtn} ${styles.readingFilterPopupBtnApply}`}>적용</button>
          <button onClick={onClose} className={`${styles.readingFilterPopupBtn} ${styles.readingFilterPopupBtnClose}`}>닫기</button>
        </div>
      </div>
    </div>
  );
};

export default ReadingFilterPopup; 