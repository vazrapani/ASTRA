import React, { useState } from 'react';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonCard, IonCardContent, IonImg, IonSpinner, IonButtons
} from '@ionic/react';
import { useHistory } from 'react-router-dom';

// 메이저 아르카나 22장
const majorArcana = [
  { id: 0, name: '더 푸울', eng: 'The Fool', img: '/assets/cards/major_0.png', desc: '새로운 시작, 순수함, 자유' },
  { id: 1, name: '더 매지션', eng: 'The Magician', img: '/assets/cards/major_1.png', desc: '의지, 창조, 자원' },
  { id: 2, name: '더 하이프리스트리스', eng: 'The High Priestess', img: '/assets/cards/major_2.png', desc: '직관, 신비, 잠재력' },
  { id: 3, name: '더 엠프레스', eng: 'The Empress', img: '/assets/cards/major_3.png', desc: '풍요, 모성, 창조성' },
  { id: 4, name: '더 엠퍼러', eng: 'The Emperor', img: '/assets/cards/major_4.png', desc: '권위, 구조, 통제' },
  { id: 5, name: '더 하이어로펀트', eng: 'The Hierophant', img: '/assets/cards/major_5.png', desc: '전통, 신념, 영적지도' },
  { id: 6, name: '더 러버스', eng: 'The Lovers', img: '/assets/cards/major_6.png', desc: '사랑, 조화, 선택' },
  { id: 7, name: '더 체리엇', eng: 'The Chariot', img: '/assets/cards/major_7.png', desc: '의지, 승리, 결단력' },
  { id: 8, name: '스트렝스', eng: 'Strength', img: '/assets/cards/major_8.png', desc: '용기, 인내, 내면의 힘' },
  { id: 9, name: '더 허밋', eng: 'The Hermit', img: '/assets/cards/major_9.png', desc: '고독, 탐구, 내면의 지혜' },
  { id: 10, name: '운명의 수레바퀴', eng: 'Wheel of Fortune', img: '/assets/cards/major_10.png', desc: '운명, 변화, 전환점' },
  { id: 11, name: '저스티스', eng: 'Justice', img: '/assets/cards/major_11.png', desc: '정의, 균형, 책임' },
  { id: 12, name: '더 행드맨', eng: 'The Hanged Man', img: '/assets/cards/major_12.png', desc: '희생, 관점전환, 인내' },
  { id: 13, name: '데스', eng: 'Death', img: '/assets/cards/major_13.png', desc: '종결, 변화, 재생' },
  { id: 14, name: '템퍼런스', eng: 'Temperance', img: '/assets/cards/major_14.png', desc: '조화, 절제, 균형' },
  { id: 15, name: '더 데빌', eng: 'The Devil', img: '/assets/cards/major_15.png', desc: '유혹, 집착, 속박' },
  { id: 16, name: '더 타워', eng: 'The Tower', img: '/assets/cards/major_16.png', desc: '붕괴, 충격, 해방' },
  { id: 17, name: '더 스타', eng: 'The Star', img: '/assets/cards/major_17.png', desc: '희망, 영감, 치유' },
  { id: 18, name: '더 문', eng: 'The Moon', img: '/assets/cards/major_18.png', desc: '불안, 환상, 잠재의식' },
  { id: 19, name: '더 선', eng: 'The Sun', img: '/assets/cards/major_19.png', desc: '성취, 기쁨, 성공' },
  { id: 20, name: '저지먼트', eng: 'Judgement', img: '/assets/cards/major_20.png', desc: '각성, 평가, 부활' },
  { id: 21, name: '더 월드', eng: 'The World', img: '/assets/cards/major_21.png', desc: '완성, 통합, 성취' },
];

// 마이너 아르카나 56장 생성
const minorSuits = [
  { suit: '완드', eng: 'Wands' },
  { suit: '컵', eng: 'Cups' },
  { suit: '소드', eng: 'Swords' },
  { suit: '펜타클', eng: 'Pentacles' }
];
const minorRanks = [
  { name: '에이스', eng: 'Ace' },
  { name: '2', eng: '2' },
  { name: '3', eng: '3' },
  { name: '4', eng: '4' },
  { name: '5', eng: '5' },
  { name: '6', eng: '6' },
  { name: '7', eng: '7' },
  { name: '8', eng: '8' },
  { name: '9', eng: '9' },
  { name: '10', eng: '10' },
  { name: '페이지', eng: 'Page' },
  { name: '나이트', eng: 'Knight' },
  { name: '퀸', eng: 'Queen' },
  { name: '킹', eng: 'King' },
];
const minorArcana: { id: number; name: string; eng: string; img: string; desc: string }[] = [];
let minorId = 22;
minorSuits.forEach((suit) => {
  minorRanks.forEach((rank, i) => {
    minorArcana.push({
      id: minorId,
      name: `${suit.suit} ${rank.name}`,
      eng: `${rank.eng} of ${suit.eng}`,
      img: `/assets/cards/minor_${suit.eng.toLowerCase()}_${i}.png`,
      desc: `${suit.suit} 슈트의 ${rank.name}`
    });
    minorId++;
  });
});

const cards = [...majorArcana, ...minorArcana];

const CardSVG = ({ name }: { name: string }) => (
  <svg width="120" height="200" viewBox="0 0 120 200" xmlns="http://www.w3.org/2000/svg">
    <rect x="5" y="5" width="110" height="190" rx="18" fill="#f5f3e7" stroke="#bba77a" strokeWidth="4" />
    <text x="60" y="110" textAnchor="middle" fontSize="20" fill="#333" fontFamily="sans-serif" fontWeight="bold">{name}</text>
  </svg>
);

// Gemini LLM 해석 fetch 함수 (임시로 파일 내에 구현, 분리 가능)
async function fetchGeminiInterpret(cardName: string, cardDesc: string, userQuestion?: string) {
  const response = await fetch(
    "https://asia-northeast3-astrt-e152b.cloudfunctions.net/geminiInterpret",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cardName, cardDesc, userQuestion }),
    }
  );
  if (!response.ok) throw new Error("LLM 해석 실패");
  const data = await response.json();
  return data.result as string;
}

const DailyTarot: React.FC = () => {
  const [selected, setSelected] = useState<number|null>(null);
  const [interpretation, setInterpretation] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [isReversed, setIsReversed] = useState(false);
  const history = useHistory();
  const handleDraw = async () => {
    const idx = Math.floor(Math.random() * cards.length);
    setSelected(idx);
    setInterpretation("");
    setError("");
    setIsReversed(Math.random() < 0.5);
    setLoading(true);
    try {
      const card = cards[idx];
      const result = await fetchGeminiInterpret(card.name, card.desc);
      setInterpretation(result);
    } catch (e) {
      setError("AI 해석을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton fill="clear" onClick={() => history.goBack()}>뒤로 가기</IonButton>
          </IonButtons>
          <IonTitle>오늘의 타로</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        {selected === null ? (
          <IonButton expand="block" onClick={handleDraw}>카드 뽑기</IonButton>
        ) : (
          <IonCard>
            <div style={{display:'flex',justifyContent:'center',marginTop:16}}>
              <CardSVG name={cards[selected].name} />
            </div>
            <IonCardContent>
              <h2 style={{textAlign:'center'}}>
                {cards[selected].name}
                <span style={{fontSize:14,marginLeft:8,color:'#bba77a'}}>
                  {isReversed ? ' (역방향)' : ' (정방향)'}
                </span>
              </h2>
              <p style={{textAlign:'center',color:'#888'}}>{cards[selected].desc}</p>
              {loading ? (
                <div style={{textAlign:'center',marginTop:16}}>
                  <div style={{marginBottom:8, fontWeight:'bold', color:'#666'}}>타로 해석중입니다...</div>
                  <IonSpinner />
                </div>
              ) : error ? (
                <div style={{color:'red', marginTop:16}}>{error}</div>
              ) : interpretation && (
                <div style={{marginTop:16,background:'#f9f6e7',borderRadius:8,padding:12}}>
                  <b>AI 해석</b>
                  <div style={{marginTop:8,whiteSpace:'pre-line'}}>{interpretation}</div>
                </div>
              )}
            </IonCardContent>
          </IonCard>
        )}
      </IonContent>
    </IonPage>
  );
};

export default DailyTarot; 