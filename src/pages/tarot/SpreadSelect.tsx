import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { IonPage, IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton, useIonToast } from '@ionic/react';
import { setSpread, setQuestion } from '../../store/slices/tarotSlice';
import { RootState } from '../../store';
import styles from './SpreadSelect.module.css';

const CARD_COUNTS = [1, 3, 5, 7] as const;
type SpreadType = 'one' | 'three' | 'five' | 'seven';
const spreadToCount: Record<SpreadType, number> = { one: 1, three: 3, five: 5, seven: 7 };
const countToSpread: Record<number, SpreadType> = { 1: 'one', 3: 'three', 5: 'five', 7: 'seven' };

const SpreadSelect: React.FC = () => {
  console.log('[SpreadSelect] 컴포넌트 렌더링');
  
  const dispatch = useDispatch();
  const history = useHistory();
  const savedQuestion = useSelector((state: RootState) => state.tarot.question);
  const [present] = useIonToast();
  const [step, setStep] = useState(1);
  const [question, setQuestionLocal] = useState(savedQuestion || '');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiRecommend, setAiRecommend] = useState<number | null>(null);
  const [cardCount, setCardCount] = useState<number | null>(null);

  // 질문 입력 후 다음 단계
  const handleQuestionNext = async () => {
    if (!question.trim()) return;
    
    dispatch(setQuestion(question));
    setStep(2);
    setAiLoading(true);

    const apiCall = fetch('/api/analyzeQuestion', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: question.trim() })
    });
    
    // 최소 1초간 로딩 메시지를 보여주기 위한 타이머
    const minDisplayTime = new Promise(resolve => setTimeout(resolve, 1000));

    try {
      const [response] = await Promise.all([apiCall, minDisplayTime]);

      if (!response.ok) throw new Error('분석 요청 실패');
      
      const data = await response.json();
      const recommendedSpread = data.recommendedSpread as SpreadType;
      const recommendedCount = spreadToCount[recommendedSpread] || 3;
      setAiRecommend(recommendedCount);
      setCardCount(recommendedCount);
      dispatch(setSpread(recommendedSpread));
    } catch (error) {
      console.error('질문 분석 중 오류:', error);
      present({
        message: 'AI 추천에 실패했습니다. 기본 3장으로 진행합니다.',
        duration: 2000,
        color: 'warning',
      });
      // 에러 시 기본값 3장
      setAiRecommend(3);
      setCardCount(3);
      dispatch(setSpread('three'));
    } finally {
      setAiLoading(false);
    }
  };

  // 카드 장수 선택
  const handleSelectCardCount = (count: number) => {
    setCardCount(count);
    dispatch(setSpread(countToSpread[count]));
  };

  // 카드 뽑기 시작
  const handleStartPicking = () => {
    console.log('[SpreadSelect] 카드 뽑기 시작 버튼 클릭');
    history.push('/tabs/tarot/pick');
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/tabs/tarot" />
          </IonButtons>
          <IonTitle>심층 타로</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <div className={styles.container}>
          {/* 1. 질문 입력 */}
          <AccordionStep
            title="질문"
            summary={question || undefined}
            open={step === 1}
            onClick={() => setStep(1)}
            done={!!question}
          >
            <textarea
              className={styles.questionInput}
              placeholder="질문을 입력하세요"
              value={question}
              onChange={e => setQuestionLocal(e.target.value)}
              rows={3}
            />
            <button
              className={styles.nextBtn}
              onClick={handleQuestionNext}
              disabled={!question.trim()}
            >
              다음
            </button>
          </AccordionStep>

          {/* 2. 카드 장수 선택 */}
          <AccordionStep
            title="카드 장수"
            summary={cardCount ? `${cardCount}장${aiRecommend === cardCount ? ' (추천)' : ''}` : undefined}
            open={step === 2}
            onClick={() => setStep(2)}
            done={!!cardCount}
            disabled={!question}
          >
            {aiLoading ? (
              <div className={styles.aiLoading}>ASTRA 타로가 질문을 분석하여 타로 스프레드를 추천중입니다...</div>
            ) : (
              <>
                {aiRecommend && (
                  <div className={styles.aiRecommend}>{aiRecommend}장 스프레드를 추천합니다!</div>
                )}
                <div className={styles.cardCountList}>
                  {CARD_COUNTS.map(count => (
                    <button
                      key={count}
                      className={styles.cardCountBtn + (cardCount === count ? ' ' + styles.selected : '')}
                      onClick={() => handleSelectCardCount(count)}
                    >
                      {count}장{aiRecommend === count ? ' (추천)' : ''}
                    </button>
                  ))}
                </div>
              </>
            )}
          </AccordionStep>

          {/* 카드 뽑기 시작 버튼 */}
          {cardCount && !aiLoading && step === 2 && (
            <button 
              className={styles.startBtn} 
              onClick={handleStartPicking}
            >
              카드 뽑기 시작
            </button>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

// 아코디언 스텝 컴포넌트
interface AccordionStepProps {
  title: string;
  summary?: string;
  open: boolean;
  onClick: () => void;
  done?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
}

const AccordionStep: React.FC<AccordionStepProps> = ({ title, summary, open, onClick, done, disabled, children }) => (
  <div className={styles.accordionStep + (open ? ' ' + styles.open : '') + (done ? ' ' + styles.done : '') + (disabled ? ' ' + styles.disabled : '')}>
    <div className={styles.stepHeader} onClick={!disabled ? onClick : undefined}>
      <span className={styles.stepTitle}>{title}</span>
      {done && summary && <span className={styles.stepSummary}>{summary}</span>}
      <span className={styles.chevron}>{open ? '▲' : '▼'}</span>
    </div>
    {open && <div className={styles.stepContent}>{children}</div>}
  </div>
);

export default SpreadSelect; 