import React, { useEffect, useState } from 'react';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonBackButton, IonButton } from '@ionic/react';
import { useParams, useHistory } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchReading, clearCurrentReading } from '../../store/slices/readingSlice';
import { AppDispatch } from '../../store';
import { updateReading, deleteReading, setSharedReadingV2 } from '../../services/firebase/readingService';
import styles from './ReadingDetail.module.css';
import CommonHeader from '../../components/CommonHeader';
import FriendSelectModal from '../../components/FriendSelectModal';
import { v4 as uuidv4 } from 'uuid';

// LLM 해석 fetch 함수 (간단 버전)
async function fetchGeminiInterpret(context: string, userQuestion: string) {
  const response = await fetch(
    "https://asia-northeast3-astrt-e152b.cloudfunctions.net/geminiInterpretFollowup",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ context, userQuestion }),
    }
  );
  if (!response.ok) throw new Error("LLM 해석 실패");
  const data = await response.json();
  return data.result as string;
}

interface ReadingDetailProps {
  unreadCount: number;
  onClickNotification: () => void;
}

const ReadingDetail: React.FC<ReadingDetailProps> = ({ unreadCount, onClickNotification }) => {
  const { id } = useParams<{ id: string }>();
  const history = useHistory();
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: any) => state.auth.user);
  const reading = useSelector((state: any) => state.reading.currentReading);
  const loading = useSelector((state: any) => state.reading.loading);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [feedback, setFeedback] = useState<{ [idx: number]: { rating: number; text: string } }>({});
  const [feedbackLoading, setFeedbackLoading] = useState<{ [idx: number]: boolean }>({});
  const [showFriendModal, setShowFriendModal] = useState(false);
  const [sharing, setSharing] = useState(false);
  // TODO: 실제 친구 목록을 store/props에서 받아와야 함. 임시 데이터로 대체
  const friends = [
    { id: 'friend1', nickname: '친구1' },
    { id: 'friend2', nickname: '친구2' },
  ];

  useEffect(() => {
    if (user?.id && id) dispatch(fetchReading({ userId: user.id, readingId: id }));
    return () => { dispatch(clearCurrentReading()); };
  }, [user, id, dispatch]);

  const handleSend = async () => {
    if (!input.trim() || !user?.id || !reading) return;
    setSending(true);
    try {
      // 1. Firestore에 user_question 추가
      const newTurns = [
        ...reading.conversationTurns,
        { type: 'user_question' as 'user_question', content: input, timestamp: Date.now() },
      ];
      // 2. LLM API 호출 (context: 기존 대화 전체)
      const context = newTurns.map(t => `${t.type === 'user_question' ? 'Q:' : 'A:'} ${t.content}`).join('\n');
      const llmAnswer = await fetchGeminiInterpret(context, input);
      // 3. Firestore에 llm_response 추가
      newTurns.push({ type: 'llm_response' as 'llm_response', content: llmAnswer, timestamp: Date.now() });
      await updateReading(user.id, reading.readingId, { conversationTurns: newTurns, updatedAt: Date.now() });
      // 4. UI 갱신(다시 fetch)
      dispatch(fetchReading({ userId: user.id, readingId: reading.readingId }));
      setInput('');
    } catch (e) {
      alert('대화 이어가기 실패: ' + (e as any).message);
    } finally {
      setSending(false);
    }
  };

  const handleFeedback = async (turnIdx: number) => {
    if (!user?.id || !reading) return;
    const { rating, text } = feedback[turnIdx] || {};
    if (!rating) return alert('별점을 입력해 주세요.');
    setFeedbackLoading(f => ({ ...f, [turnIdx]: true }));
    try {
      const newTurns = reading.conversationTurns.map((t: any, i: number) =>
        i === turnIdx ? { ...t, ownerFeedback: { rating, text } } : t
      );
      await updateReading(user.id, reading.readingId, { conversationTurns: newTurns, updatedAt: Date.now() });
      dispatch(fetchReading({ userId: user.id, readingId: reading.readingId }));
    } catch (e) {
      alert('피드백 저장 실패: ' + (e as any).message);
    } finally {
      setFeedbackLoading(f => ({ ...f, [turnIdx]: false }));
    }
  };

  const handleDelete = async () => {
    if (!user?.id || !reading) return;
    if (!window.confirm('정말로 이 기록을 삭제하시겠습니까?')) return;
    try {
      await deleteReading(user.id, reading.readingId);
      alert('기록이 삭제되었습니다.');
      history.replace('/tabs/my/readings');
    } catch (e) {
      alert('삭제 실패: ' + (e as any).message);
    }
  };

  const handleShare = () => {
    setShowFriendModal(true);
  };

  const handleSelectFriend = async (friendId: string) => {
    if (!user || !reading) return;
    setSharing(true);
    try {
      const sharedReading = {
        sharedReadingId: uuidv4(),
        originalReadingId: reading.readingId,
        sharedTurnIndex: 0,
        sharerUid: user.id,
        receiverUids: [friendId],
        sharedAt: Date.now(),
        sharedInterpretationContent: reading.conversationTurns?.[0]?.content || '',
        ratings: [],
        comments: [],
        emojis: [],
      };
      await setSharedReadingV2(sharedReading);
      alert('친구에게 해석이 성공적으로 공유되었습니다!');
      setShowFriendModal(false);
      history.push('/tabs/social'); // 소셜 피드로 이동(경로는 실제 라우팅에 맞게 조정)
    } catch (e) {
      alert('공유 실패: ' + (e as any).message);
    } finally {
      setSharing(false);
    }
  };

  const handleNewQuestion = () => {
    history.push('/tabs/tarot/question');
  };

  if (loading || !reading) return (
    <IonPage>
      <IonHeader><IonToolbar><IonBackButton defaultHref="/tabs/my/readings" /><IonTitle>기록 상세</IonTitle></IonToolbar></IonHeader>
      <IonContent className="ion-padding"><div className={styles.loading}>불러오는 중...</div></IonContent>
    </IonPage>
  );

  return (
    <IonPage>
      <CommonHeader title="리딩 상세" backHref="/tabs/my/readings" unreadCount={unreadCount} onClickNotification={onClickNotification} />
      <IonContent className="ion-padding">
        <IonButton expand="block" className={styles.btnTop24} onClick={() => {
          if (history.length > 1) history.goBack();
          else history.replace('/tabs/my/readings');
        }}>뒤로가기</IonButton>
        {/* 질문/카드 정보 */}
        <div className={styles.readingDetailQuestionBox}>
          <div className={styles.readingDetailQuestionTitle}>질문</div>
          <div className={styles.readingDetailQuestionText}>{reading.initialQuestion}</div>
          <div className={styles.readingDetailCardList}>
            {reading.cardsDrawn?.map((c: any, i: number) => (
              <img key={i} src={c.imageUrl && c.imageUrl.trim() !== '' ? c.imageUrl : '/assets/card_default.png'} alt={c.name} title={c.name} className={styles.readingDetailCardImg} />
            ))}
          </div>
        </div>
        {/* 대화 버블 */}
        <div className={styles.readingDetailBubbleList}>
          {reading.conversationTurns?.map((turn: any, i: number) => (
            <div key={i} className={`${styles.readingDetailBubbleRow} ${turn.type.startsWith('llm') ? styles.llm : styles.user}`}> 
              <div className={`${styles.readingDetailBubble} ${turn.type.startsWith('llm') ? styles.llm : styles.user}`}> 
                {turn.content}
                {turn.ownerFeedback && (
                  <div className={styles.readingDetailFeedback}>
                    별점: {'★'.repeat(turn.ownerFeedback.rating)}{'☆'.repeat(5-turn.ownerFeedback.rating)}
                    {turn.ownerFeedback.text && <span className={styles.readingDetailFeedbackText}>{turn.ownerFeedback.text}</span>}
                  </div>
                )}
                {/* 별점/피드백 입력 UI (LLM 해석 턴에만) */}
                {turn.type.startsWith('llm') && (
                  <div className={styles.readingDetailFeedbackInput}>
                    <span>별점: </span>
                    {[1,2,3,4,5].map(n => (
                      <button key={n} onClick={()=>setFeedback(f=>({...f,[i]:{...f[i],rating:n}}))} className={`${styles.readingDetailStarBtn}${(feedback[i]?.rating||turn.ownerFeedback?.rating)===n?' '+styles.active:''}`} disabled={feedbackLoading[i]}>★</button>
                    ))}
                    <input
                      type="text"
                      maxLength={50}
                      placeholder="50자 이내 의견"
                      value={feedback[i]?.text ?? turn.ownerFeedback?.text ?? ''}
                      onChange={e=>setFeedback(f=>({...f,[i]:{...f[i],text:e.target.value}}))}
                      className={styles.readingDetailFeedbackInputText}
                      disabled={feedbackLoading[i]}
                    />
                    <button onClick={()=>handleFeedback(i)} disabled={feedbackLoading[i]} className={styles.readingDetailFeedbackSaveBtn}>저장</button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        {/* 이어질 질문 입력창 */}
        <div className={styles.readingDetailFollowupBox}>
          <input type="text" value={input} onChange={e=>setInput(e.target.value)} disabled={sending} placeholder="이어 질문을 입력하세요..." className={styles.readingDetailFollowupInput} />
          <button onClick={handleSend} disabled={sending || !input.trim()} className={styles.readingDetailFollowupSendBtn}>전송</button>
        </div>
        {/* 기록 삭제 버튼 */}
        <button onClick={handleDelete} className={styles.readingDetailDeleteBtn}>기록 삭제</button>
        {/* 해석 공유/새 질문 버튼 */}
        <button onClick={handleShare} className={styles.readingDetailShareBtn}>해석 공유하기</button>
        <button onClick={handleNewQuestion} className={styles.readingDetailNewBtn}>새로운 질문 시작</button>
        <FriendSelectModal open={showFriendModal} friends={friends} onSelect={handleSelectFriend} onClose={()=>setShowFriendModal(false)} />
      </IonContent>
    </IonPage>
  );
};
export default ReadingDetail; 