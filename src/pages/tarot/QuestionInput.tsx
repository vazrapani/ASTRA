import React, { useEffect } from 'react';
import { IonPage, IonContent, IonLabel, IonSelect, IonSelectOption, IonTextarea, IonButton, IonText, IonCard, IonCardContent } from '@ionic/react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { setCategory, setQuestion } from '../../store/slices/tarotSlice';
import CommonHeader from '../../components/CommonHeader';
import styles from './QuestionInput.module.css';

const categories = [
  '연애', '직업', '사업', '금전', '상대방의 속마음', '건강', '기타'
];

const questionExamples: Record<string, string[]> = {
  '연애': ['이 사람과의 궁합이 궁금해요.', '짝사랑이 이루어질 수 있을까요?'],
  '직업': ['이직을 해도 괜찮을까요?', '지금 하는 일이 저에게 맞을까요?'],
  '사업': ['사업 확장 시기가 언제가 좋을까요?'],
  '금전': ['다음 달 금전운은 어떻게 될까요?'],
  '상대방의 속마음': ['그 사람은 저를 어떻게 생각하나요?'],
  '건강': ['건강에 주의할 점이 있을까요?'],
  '기타': ['올해 전반적인 운세가 궁금해요.']
};

interface QuestionInputProps {
  unreadCount: number;
  onClickNotification: () => void;
}

const QuestionInput: React.FC<QuestionInputProps> = ({ unreadCount, onClickNotification }) => {
  const dispatch = useDispatch();
  const category = useSelector((state: RootState) => state.tarot.category) || '연애';
  const question = useSelector((state: RootState) => state.tarot.question) || '';

  // 진입 시 질문/카테고리 초기화
  useEffect(() => {
    dispatch(setCategory(''));
    dispatch(setQuestion(''));
  }, [dispatch]);

  return (
    <IonPage>
      <CommonHeader title="질문 입력" backHref="/tabs/tarot" unreadCount={unreadCount} onClickNotification={onClickNotification} />
      <IonContent className="ion-padding">
        <IonCard color="light">
          <IonCardContent>
            <IonLabel position="stacked">질문 카테고리</IonLabel>
            <IonSelect value={category} onIonChange={e => dispatch(setCategory(e.detail.value))}>
              {categories.map(cat => (
                <IonSelectOption key={cat} value={cat}>{cat}</IonSelectOption>
              ))}
            </IonSelect>
            <IonLabel position="stacked" className={styles.labelMargin}>질문 입력</IonLabel>
            <IonTextarea
              value={question}
              onIonChange={e => dispatch(setQuestion(e.detail.value!))}
              placeholder="구체적으로 질문할수록 더 좋은 해석을 얻을 수 있어요! (예: '다음 달 금전운은 어떻게 될까요?')"
              autoGrow
            />
            <IonText color="medium" className={styles.exampleText}>
              예시: {questionExamples[category][0]}
            </IonText>
            <IonButton expand="block" className={styles.nextButton} routerLink="/tabs/tarot/spread">타로 카드 뽑기</IonButton>
          </IonCardContent>
        </IonCard>
      </IonContent>
    </IonPage>
  );
};

export default QuestionInput; 