// 타로 카드 정보 및 해석 함수 공통 유틸

import {
  TarotCard,
  DeckType,
  DeckConfig,
  TempImageConfig,
  CardOrientation,
  MinorSuit,
  ArcanaType
} from '../types/tarot';

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

// 덱 설정
export const deckConfigs: Record<DeckType, DeckConfig> = {
  'rider-waite': {
    type: 'rider-waite',
    name: 'Rider-Waite Tarot',
    nameKo: '라이더-웨이트 타로',
    description: '가장 대중적이고 전통적인 타로 덱',
    imageBasePath: '/assets/cards/rider-waite',
    tempImageBasePath: '/assets/temp_cards/rider-waite'
  },
  'thoth': {
    type: 'thoth',
    name: 'Thoth Tarot',
    nameKo: '토트 타로',
    description: '신비적이고 심오한 상징을 담은 타로 덱',
    imageBasePath: '/assets/cards/thoth',
    tempImageBasePath: '/assets/temp_cards/thoth'
  }
};

// 임시 이미지 설정
export const tempImageConfig: TempImageConfig = {
  width: 300,
  height: 500,
  backgroundColor: '#f0f0f0',
  textColor: '#333333',
  font: '20px Arial'
};

// 마이너 아르카나 슈트 정보
export const minorSuitInfo = {
  wands: { nameKo: '완드', element: '불' },
  cups: { nameKo: '컵', element: '물' },
  swords: { nameKo: '소드', element: '공기' },
  pentacles: { nameKo: '펜타클', element: '땅' }
};

// 라이더-웨이트 메이저 아르카나 (예시: 3장 전체 필드 포함)
export const riderWaiteMajorArcana: TarotCard[] = [
  {
    id: 'rw-major-0',
    name: 'The Fool',
    nameKo: '광대',
    deck: 'rider-waite',
    arcana: 'major',
    imageUrl: `${deckConfigs['rider-waite'].imageBasePath}/major_0.jpg`,
    tempImageUrl: `${deckConfigs['rider-waite'].tempImageBasePath}/major_0.jpg`,
    meanings: {
      upright: '새로운 시작, 순수함, 모험, 자유로운 영혼',
      reversed: '무모함, 위험한 선택, 부주의'
    }
  },
  {
    id: 'rw-major-1',
    name: 'The Magician',
    nameKo: '마법사',
    deck: 'rider-waite',
    arcana: 'major',
    imageUrl: `${deckConfigs['rider-waite'].imageBasePath}/major_1.jpg`,
    tempImageUrl: `${deckConfigs['rider-waite'].tempImageBasePath}/major_1.jpg`,
    meanings: {
      upright: '창의력, 기술, 자원 활용, 의지력',
      reversed: '기만, 재능 낭비, 미숙함'
    }
  },
  {
    id: 'rw-major-2',
    name: 'The High Priestess',
    nameKo: '여사제',
    deck: 'rider-waite',
    arcana: 'major',
    imageUrl: `${deckConfigs['rider-waite'].imageBasePath}/major_2.jpg`,
    tempImageUrl: `${deckConfigs['rider-waite'].tempImageBasePath}/major_2.jpg`,
    meanings: {
      upright: '직관, 신비, 잠재력',
      reversed: '비밀, 억압, 혼란'
    }
  },
  // ... 나머지 카드도 동일 패턴으로 전체 필드 포함하여 작성 ...
];

// 토트 메이저 아르카나 (예시: 3장 전체 필드 포함)
export const thothMajorArcana: TarotCard[] = [
  {
    id: 'th-major-0',
    name: 'The Fool',
    nameKo: '광대',
    deck: 'thoth',
    arcana: 'major',
    imageUrl: `${deckConfigs['thoth'].imageBasePath}/major_0.jpg`,
    tempImageUrl: `${deckConfigs['thoth'].tempImageBasePath}/major_0.jpg`,
    meanings: {
      upright: '순수한 에너지, 새로운 시작, 무한한 가능성',
      reversed: '혼돈, 무질서, 비이성적 행동'
    }
  },
  {
    id: 'th-major-1',
    name: 'The Magus',
    nameKo: '마구스',
    deck: 'thoth',
    arcana: 'major',
    imageUrl: `${deckConfigs['thoth'].imageBasePath}/major_1.jpg`,
    tempImageUrl: `${deckConfigs['thoth'].tempImageBasePath}/major_1.jpg`,
    meanings: {
      upright: '의식적 의지, 창조적 힘, 지성',
      reversed: '혼돈의 힘, 왜곡된 의지, 기만'
    }
  },
  {
    id: 'th-major-2',
    name: 'The High Priestess',
    nameKo: '여사제',
    deck: 'thoth',
    arcana: 'major',
    imageUrl: `${deckConfigs['thoth'].imageBasePath}/major_2.jpg`,
    tempImageUrl: `${deckConfigs['thoth'].tempImageBasePath}/major_2.jpg`,
    meanings: {
      upright: '지혜, 신비, 잠재력',
      reversed: '비밀, 억압, 혼란'
    }
  },
  // ... 나머지 카드도 동일 패턴으로 전체 필드 포함하여 작성 ...
];

// 임시 이미지 생성 함수
export const generateTempCardImage = (card: TarotCard, orientation: CardOrientation): string => {
  const directionMark = orientation === 'reversed' ? '↓' : '↑';
  return `${card.deck === 'rider-waite' ? 
    deckConfigs['rider-waite'].tempImageBasePath : 
    deckConfigs['thoth'].tempImageBasePath}/${card.name.toLowerCase().replace(/ /g, '_')}_${orientation}.jpg`;
};

// 랜덤 덱 선택
export const getRandomDeck = (): DeckType => {
  const decks: DeckType[] = ['rider-waite', 'thoth'];
  return decks[Math.floor(Math.random() * decks.length)];
};

// 랜덤 카드 선택 (덱 지정)
export const getRandomCard = (deck: DeckType): TarotCard => {
  const cards = deck === 'rider-waite' ? riderWaiteMajorArcana : thothMajorArcana;
  return cards[Math.floor(Math.random() * cards.length)];
};

// 랜덤 방향 선택
export const getRandomOrientation = (): CardOrientation => {
  return Math.random() < 0.5 ? 'upright' : 'reversed';
};

// 일일 타로 카드 뽑기
export const drawDailyTarotCard = () => {
  const deck = getRandomDeck();
  const card = getRandomCard(deck);
  const orientation = getRandomOrientation();
  
  return {
    deck,
    card,
    orientation,
    tempImageUrl: generateTempCardImage(card, orientation)
  };
};

// LLM 해석 요청 함수
export async function fetchGeminiInterpret(
  card: TarotCard,
  orientation: CardOrientation,
  userQuestion?: string
) {
  const response = await fetch(
    "https://asia-northeast3-astrt-e152b.cloudfunctions.net/geminiInterpret",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cardName: card.name,
        cardDesc: orientation === 'upright' ? card.meanings.upright : card.meanings.reversed,
        deck: card.deck,
        orientation,
        userQuestion
      }),
    }
  );
  if (!response.ok) throw new Error("LLM 해석 실패");
  const data = await response.json();
  return data.result as string;
} 