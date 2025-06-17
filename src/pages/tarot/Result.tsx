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

interface ResultProps {
  unreadCount: number;
  onClickNotification: () => void;
}

const Result: React.FC<ResultProps> = ({ unreadCount, onClickNotification }) => {
  const question = useSelector((state: RootState) => state.tarot.question);
  const category = useSelector((state: RootState) => state.tarot.category);
  const spread = useSelector((state: RootState) => state.tarot.spread);
  const selectedCards = useSelector((state: RootState) => state.tarot.selectedCards);
  const interpretation = useSelector((state: RootState) => state.tarot.interpretation);
  console.log('interpretation:', interpretation);
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
    if (!user?.uid || !question || !selectedCards.length || savedRef.current) return;
    // Firestore에 기록 저장
    const readingId = uuidv4();
    const now = Date.now();
    const reading = {
      readingId,
      userId: user.uid,
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
      category: category || '기타',
      createdAt: now,
      updatedAt: now,
    };
    addReading(user.uid, reading);
    savedRef.current = true;
  }, [user, question, category, spread, selectedCards, interpretation]);

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
        sharerUid: user.uid,
        receiverUids: [friendId],
        sharedAt: Date.now(),
        sharedInterpretationContent: interpretation,
        ratings: [],
        comments: [],
        emojis: [],
      };
      console.log('공유 데이터:', sharedReading);
      await setSharedReading(sharedReading);
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
            <div className={styles.categoryInfo}>카테고리: {category || '미선택'} / 스프레드: {spread || '미선택'}</div>
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
            <IonText>이직에 대한 긍정적인 에너지가 느껴집니다. 새로운 시작이 당신에게 좋은 기회를 가져다줄 것입니다.</IonText>
          </IonCardContent>
        </IonCard>
        <IonCard color="light">
          <IonCardHeader>
            <IonCardTitle>상세 해석</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonText>
              더 푸울(정방향)은 새로운 도전과 순수한 열정을 의미합니다. 더 매지션(역방향)은 준비 부족이나 혼란을 경고합니다. 더 하이프리스트리스(정방향)는 직관을 따르라는 메시지를 줍니다. 전체적으로, 신중한 준비와 내면의 소리에 귀 기울인다면 좋은 결과를 얻을 수 있습니다.
            </IonText>
          </IonCardContent>
        </IonCard>
        <IonCard color="light">
          <IonCardHeader>
            <IonCardTitle>조언/핵심 메시지</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonText color="primary">충분한 준비와 자기 신뢰가 필요합니다. 직관을 믿고 도전해보세요!</IonText>
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