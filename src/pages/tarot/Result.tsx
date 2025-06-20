import React, { useEffect, useRef } from 'react';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonButton, IonText, IonBackButton, IonList, IonItem, IonLabel, IonTextarea, IonInput } from '@ionic/react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { addReading, setSharedReading } from '../../services/firebase/readingService';
import { v4 as uuidv4 } from 'uuid';
import CommonHeader from '../../components/CommonHeader';
import styles from './Result.module.css';
import FriendSelectModal from '../../components/FriendSelectModal';
import { useHistory } from 'react-router-dom';

// 마크다운 파싱을 위한 간단한 함수
const parseMarkdown = (text: string) => {
  const sections: { [key: string]: string } = {};
  // 정규식: #### 제목\n(내용)\n#### ...
  const regex = /#### (.*?)\n([\s\S]*?)(?=\n#### |$)/g;
  let match;
  while ((match = regex.exec(text)) !== null) {
    sections[match[1].trim()] = match[2].trim();
  }
  return sections;
};

interface ResultProps {
  unreadCount: number;
  onClickNotification: () => void;
}

const Result: React.FC<ResultProps> = ({ unreadCount, onClickNotification }) => {
  const question = useSelector((state: RootState) => state.tarot.question);
  const spread = useSelector((state: RootState) => state.tarot.spread);
  const selectedCards = useSelector((state: RootState) => state.tarot.selectedCards);
  const interpretation = useSelector((state: RootState) => state.tarot.interpretation) || '';
  // interpretation 값 파싱 직전 콘솔 출력
  console.log('interpretation:', interpretation);
  const parsedInterpretation = parseMarkdown(interpretation);
  const user = useSelector((state: RootState) => state.auth.user);
  const savedRef = useRef(false);
  const [showFriendModal, setShowFriendModal] = React.useState(false);
  const [sharing, setSharing] = React.useState(false);
  const [shareError, setShareError] = React.useState<string | null>(null);
  const history = useHistory();
  // TODO: 실제 친구 목록을 store/props에서 받아와야 함. 임시 데이터로 대체
  const friends = [
    { id: 'friend1', nickname: '친구1' },
    { id: 'friend2', nickname: '친구2' },
  ];

  useEffect(() => {
    if (!user?.id || !question || !selectedCards.length || savedRef.current) return;
    // Firestore에 기록 저장
    const readingId = uuidv4();
    const now = Date.now();
    const reading = {
      readingId,
      userId: user.id,
      initialQuestion: question,
      spreadType: spread,
      cardsDrawn: selectedCards.map((c: any, idx: number) => ({
        name: c.name,
        direction: 'upright' as 'upright', // TODO: 실제 방향 정보 반영
        imageUrl: c.imageUrl || '',
        position: idx + 1,
      })),
      representativeCardIndex: 0,
      conversationTurns: [
        {
          type: 'llm_initial_interpretation' as 'llm_initial_interpretation',
          content: interpretation,
          timestamp: now,
        },
      ],
      createdAt: now,
      updatedAt: now,
    };
    addReading(user.id, reading);
    savedRef.current = true;
  }, [user, question, spread, selectedCards, interpretation]);

  const handleShare = () => {
    setShowFriendModal(true);
  };

  const handleSelectFriend = async (friendId: string) => {
    if (!user || !interpretation) {
      console.log('공유 불가: user 또는 interpretation 없음', user, interpretation);
      return;
    }
    setSharing(true);
    setShareError(null);
    try {
      const sharedReading = {
        sharedReadingId: uuidv4(),
        originalReadingId: 'TODO',
        sharedTurnIndex: 0,
        sharerUid: user.id,
        receiverUids: [friendId],
        sharedAt: Date.now(),
        sharedInterpretationContent: interpretation,
        ratings: [],
        comments: [],
        emojis: [],
        question: question,
        card: selectedCards,
        type: 'spread',
      };
      console.log('공유 데이터:', sharedReading);
      await import('../../services/firebase/readingService').then(mod => mod.setSharedReadingV2(sharedReading));
      console.log('공유 성공!');
      alert('친구에게 해석이 성공적으로 공유되었습니다!');
      setShowFriendModal(false);
      history.push('/tabs/social');
    } catch (e) {
      setShareError('공유 실패: ' + (e as any).message);
      console.error('공유 에러:', e);
    } finally {
      setSharing(false);
    }
  };

  return (
    <IonPage>
      <CommonHeader title="타로 해석 결과" backHref="/tabs/tarot/pick" unreadCount={unreadCount} onClickNotification={onClickNotification} />
      <IonContent className="ion-padding">
        <IonCard color="light">
          <IonCardHeader>
            <IonCardTitle>질문</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonText color="primary">{question ? `"${question}"` : '질문이 입력되지 않았습니다.'}</IonText>
            <div className={styles.categoryInfo}>스프레드: {spread || '미선택'}</div>
          </IonCardContent>
        </IonCard>
        <IonCard color="light">
          <IonCardHeader>
            <IonCardTitle>선택한 카드</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonList>
              {selectedCards.length > 0 ? selectedCards.map(card => (
                <IonItem key={card.id}>
                  <IonLabel>
                    <b>{card.name}</b>
                  </IonLabel>
                </IonItem>
              )) : <IonText color="medium">카드가 선택되지 않았습니다.</IonText>}
            </IonList>
          </IonCardContent>
        </IonCard>
        <IonCard color="light">
          <IonCardHeader>
            <IonCardTitle>해석 요약</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonText>{parsedInterpretation['해석 요약'] || '해석을 불러오는 중입니다...'}</IonText>
          </IonCardContent>
        </IonCard>
        <IonCard color="light">
          <IonCardHeader>
            <IonCardTitle>상세 해석</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonText style={{ whiteSpace: 'pre-wrap' }}>
              {parsedInterpretation['상세 해석'] || ''}
            </IonText>
          </IonCardContent>
        </IonCard>
        <IonCard color="light">
          <IonCardHeader>
            <IonCardTitle>조언/핵심 메시지</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonText color="primary">{parsedInterpretation['조언/핵심 메시지'] || ''}</IonText>
          </IonCardContent>
        </IonCard>
        <IonCard color="light">
          <IonCardHeader>
            <IonCardTitle>만족도 피드백</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonLabel>별점 (1~5점)</IonLabel>
            <IonInput type="number" min={1} max={5} placeholder="5" />
            <IonLabel className={styles.feedbackLabel}>의견(선택)</IonLabel>
            <IonTextarea autoGrow placeholder="50자 이내로 의견을 남겨주세요." />
            <IonButton expand="block" className={styles.feedbackButton}>피드백 제출</IonButton>
          </IonCardContent>
        </IonCard>
        <IonButton expand="block" color="secondary" className={styles.shareButton} onClick={handleShare}>해석 공유하기</IonButton>
        <IonButton expand="block" className={styles.newQuestionButton} routerLink="/tarot/question">새로운 질문 시작</IonButton>
        <IonButton expand="block" className={styles.followupButton} routerLink="/tarot/followup">이어 질문하기</IonButton>
        <FriendSelectModal open={showFriendModal} onSelect={handleSelectFriend} onClose={()=>setShowFriendModal(false)} sharing={sharing} error={shareError} />
      </IonContent>
    </IonPage>
  );
};

export default Result; 