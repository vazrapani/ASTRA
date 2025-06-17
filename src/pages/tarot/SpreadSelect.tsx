import React from 'react';
import { IonPage, IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonButton, IonList, IonItem, IonLabel, IonRadioGroup, IonRadio, IonText } from '@ionic/react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { setSpread } from '../../store/slices/tarotSlice';
import CommonHeader from '../../components/CommonHeader';
import styles from './SpreadSelect.module.css';

const spreads = [
  { key: 'one', name: '1장 뽑기', desc: '간단한 상황, 빠른 조언이 필요할 때' },
  { key: 'three', name: '3장 뽑기', desc: '과거-현재-미래 흐름을 보고 싶을 때' },
  { key: 'five', name: '5장 뽑기', desc: '상황의 원인과 해결책까지 깊이 있게' },
  { key: 'celtic', name: '10장 켈틱 크로스', desc: '복잡한 문제, 인생의 큰 전환점 등' },
];

interface SpreadSelectProps {
  unreadCount: number;
  onClickNotification: () => void;
}

const SpreadSelect: React.FC<SpreadSelectProps> = ({ unreadCount, onClickNotification }) => {
  const dispatch = useDispatch();
  const selected = useSelector((state: RootState) => state.tarot.spread) || 'three';
  const [autoRecommended] = React.useState('three'); // 실제 LLM 추천값으로 대체 가능

  return (
    <IonPage>
      <CommonHeader title="스프레드 선택" backHref="/tabs/tarot" unreadCount={unreadCount} onClickNotification={onClickNotification} />
      <IonContent className="ion-padding">
        <IonCard color="light">
          <IonCardHeader>
            <IonCardTitle>추천 배열법</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonText color="primary">
              당신의 질문에 대해 <b>{spreads.find(s => s.key === autoRecommended)?.name}</b>을(를) 추천합니다.<br/>
              <small>({spreads.find(s => s.key === autoRecommended)?.desc})</small>
            </IonText>
          </IonCardContent>
        </IonCard>
        <IonList>
          <IonRadioGroup value={selected} onIonChange={e => dispatch(setSpread(e.detail.value))}>
            {spreads.map(spread => (
              <IonItem key={spread.key}>
                <IonLabel>
                  <b>{spread.name}</b><br/>
                  <small>{spread.desc}</small>
                  {spread.key === 'celtic' && <IonText color="danger"> (켈틱 크로스는 크레딧 2배 차감)</IonText>}
                </IonLabel>
                <IonRadio slot="end" value={spread.key} />
              </IonItem>
            ))}
          </IonRadioGroup>
        </IonList>
        <IonButton expand="block" className={styles.pickButton} routerLink="/tabs/tarot/pick">카드 뽑기 시작</IonButton>
        <IonButton expand="block" className={styles.backButton} routerLink="/tabs/tarot/question">질문 입력으로 돌아가기</IonButton>
      </IonContent>
    </IonPage>
  );
};

export default SpreadSelect; 