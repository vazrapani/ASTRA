import React, { useEffect } from 'react';
import { IonPage, IonContent, IonLabel, IonTextarea, IonButton, IonCard, IonCardContent } from '@ionic/react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { setQuestion } from '../../store/slices/tarotSlice';
import CommonHeader from '../../components/CommonHeader';
import styles from './QuestionInput.module.css';

interface QuestionInputProps {
  unreadCount: number;
  onClickNotification: () => void;
}

const QuestionInput: React.FC<QuestionInputProps> = ({ unreadCount, onClickNotification }) => {
  const dispatch = useDispatch();
  const question = useSelector((state: RootState) => state.tarot.question) || '';

  // 진입 시 질문 초기화
  useEffect(() => {
    dispatch(setQuestion(''));
  }, [dispatch]);

  return (
    <IonPage>
      <CommonHeader title="질문 입력" backHref="/tabs/tarot" unreadCount={unreadCount} onClickNotification={onClickNotification} />
      <IonContent className="ion-padding">
        <IonCard color="light">
          <IonCardContent>
            <IonLabel position="stacked" className={styles.labelMargin}>질문 입력</IonLabel>
            <IonTextarea
              value={question}
              onIonChange={e => dispatch(setQuestion(e.detail.value!))}
              placeholder="구체적으로 질문할수록 더 좋은 해석을 얻을 수 있어요!"
              autoGrow
            />
            <IonButton 
              expand="block" 
              className={styles.nextButton}
              routerLink="/tabs/tarot/spread"
              disabled={!question.trim()}
            >
              타로 카드 뽑기
            </IonButton>
          </IonCardContent>
        </IonCard>
      </IonContent>
    </IonPage>
  );
};

export default QuestionInput; 