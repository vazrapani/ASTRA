// 타로 카드 정보 및 해석 함수 공통 유틸

// 메이저 아르카나 22장
export const majorArcana = [
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

export const minorSuits = [
  { suit: '완드', eng: 'Wands' },
  { suit: '컵', eng: 'Cups' },
  { suit: '소드', eng: 'Swords' },
  { suit: '펜타클', eng: 'Pentacles' }
];
export const minorRanks = [
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
export const minorArcana: { id: number; name: string; eng: string; img: string; desc: string }[] = [];
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

export const cards = [...majorArcana, ...minorArcana];

export async function fetchGeminiInterpret(cardName: string, cardDesc: string, userQuestion?: string) {
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

export interface TarotCard {
  name: string;
  meaning: string;
}

export const tarotCards: TarotCard[] = [
  {
    name: "The Fool",
    meaning: "새로운 시작, 순수함, 모험, 자유로운 영혼"
  },
  {
    name: "The Magician",
    meaning: "창의력, 기술, 자원 활용, 의지력"
  },
  {
    name: "The High Priestess",
    meaning: "직관, 신비, 내면의 지혜, 잠재의식"
  },
  {
    name: "The Empress",
    meaning: "풍요, 창조성, 모성, 자연과의 조화"
  },
  {
    name: "The Emperor",
    meaning: "권위, 리더십, 안정성, 체계"
  },
  {
    name: "The Hierophant",
    meaning: "전통, 교육, 영적 지도, 신념"
  },
  {
    name: "The Lovers",
    meaning: "사랑, 조화, 관계, 선택"
  },
  {
    name: "The Chariot",
    meaning: "의지력, 성공, 결단력, 승리"
  },
  {
    name: "Strength",
    meaning: "용기, 인내, 내면의 힘, 자제력"
  },
  {
    name: "The Hermit",
    meaning: "내면의 성찰, 고독, 지혜, 영적 탐구"
  },
  {
    name: "Wheel of Fortune",
    meaning: "운명, 기회, 변화, 순환"
  },
  {
    name: "Justice",
    meaning: "정의, 균형, 진실, 인과응보"
  },
  {
    name: "The Hanged Man",
    meaning: "희생, 새로운 관점, 중단, 포기"
  },
  {
    name: "Death",
    meaning: "변화, 종료, 변형, 새로운 시작"
  },
  {
    name: "Temperance",
    meaning: "균형, 조화, 절제, 치유"
  },
  {
    name: "The Devil",
    meaning: "속박, 유혹, 물질주의, 집착"
  },
  {
    name: "The Tower",
    meaning: "급격한 변화, 파괴, 해방, 각성"
  },
  {
    name: "The Star",
    meaning: "희망, 영감, 평화, 치유"
  },
  {
    name: "The Moon",
    meaning: "불안, 환상, 직관, 잠재의식"
  },
  {
    name: "The Sun",
    meaning: "행복, 성공, 긍정, 활력"
  },
  {
    name: "Judgement",
    meaning: "재생, 심판, 깨달음, 소명"
  },
  {
    name: "The World",
    meaning: "완성, 성취, 통합, 여행"
  }
];

export const getRandomCard = (): TarotCard => {
  const randomIndex = Math.floor(Math.random() * tarotCards.length);
  return tarotCards[randomIndex];
}; 