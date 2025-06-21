// 타로 카드 정보 및 해석 함수 공통 유틸

import {
  TarotCard,
  DeckType,
  DeckConfig,
  CardOrientation,
  MinorSuit,
  ArcanaType,
  DailyTarotResult
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
    description: '가장 대중적이고 상징이 명확한 타로 덱입니다.',
    imageBasePath: '/assets/cards/rider-waite',
    tempImageBasePath: '/assets/temp_cards/rider-waite'
  },
  'thoth': {
    type: 'thoth',
    name: 'Thoth Tarot',
    nameKo: '토트 타로',
    description: '상징주의와 신비주의 철학이 깊게 담긴 덱입니다.',
    imageBasePath: '/assets/cards/thoth',
    tempImageBasePath: '/assets/temp_cards/thoth'
  }
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
    meanings: {
      upright: '지혜, 신비, 잠재력',
      reversed: '비밀, 억압, 혼란'
    }
  },
  // ... 나머지 카드도 동일 패턴으로 전체 필드 포함하여 작성 ...
];

// 라이더-웨이트 마이너 아르카나
export const riderWaiteMinorArcana: TarotCard[] = [
  // Wands
  { id: 'rw-minor-wands-1', name: 'Ace of Wands', nameKo: '완드 에이스', deck: 'rider-waite', arcana: 'minor', suit: 'wands', imageUrl: '', meanings: { upright: '새로운 시작, 영감, 창의력, 잠재력', reversed: '기회 놓침, 방향성 상실, 에너지 부족' }},
  { id: 'rw-minor-wands-2', name: 'Two of Wands', nameKo: '완드 2', deck: 'rider-waite', arcana: 'minor', suit: 'wands', imageUrl: '', meanings: { upright: '미래 계획, 결정, 진보', reversed: '두려움, 미지의 공포, 결정 장애' }},
  { id: 'rw-minor-wands-3', name: 'Three of Wands', nameKo: '완드 3', deck: 'rider-waite', arcana: 'minor', suit: 'wands', imageUrl: '', meanings: { upright: '확장, 성장, 먼 미래를 내다봄', reversed: '지연, 장애물, 비현실적인 기대' }},
  { id: 'rw-minor-wands-4', name: 'Four of Wands', nameKo: '완드 4', deck: 'rider-waite', arcana: 'minor', suit: 'wands', imageUrl: '', meanings: { upright: '축하, 안정, 조화, 귀향', reversed: '불안정한 기반, 축하의 지연' }},
  { id: 'rw-minor-wands-5', name: 'Five of Wands', nameKo: '완드 5', deck: 'rider-waite', arcana: 'minor', suit: 'wands', imageUrl: '', meanings: { upright: '경쟁, 갈등, 사소한 다툼', reversed: '갈등 회피, 내부적 갈등, 혼란' }},
  { id: 'rw-minor-wands-6', name: 'Six of Wands', nameKo: '완드 6', deck: 'rider-waite', arcana: 'minor', suit: 'wands', imageUrl: '', meanings: { upright: '승리, 성공, 인정, 자신감', reversed: '실패, 오만, 인정받지 못함' }},
  { id: 'rw-minor-wands-7', name: 'Seven of Wands', nameKo: '완드 7', deck: 'rider-waite', arcana: 'minor', suit: 'wands', imageUrl: '', meanings: { upright: '도전, 방어, 용기, 끈기', reversed: '압도당함, 포기, 지침' }},
  { id: 'rw-minor-wands-8', name: 'Eight of Wands', nameKo: '완드 8', deck: 'rider-waite', arcana: 'minor', suit: 'wands', imageUrl: '', meanings: { upright: '빠른 진행, 소식, 여행, 행동', reversed: '지연, 정체, 빗나간 방향' }},
  { id: 'rw-minor-wands-9', name: 'Nine of Wands', nameKo: '완드 9', deck: 'rider-waite', arcana: 'minor', suit: 'wands', imageUrl: '', meanings: { upright: '경계, 인내, 마지막 저항', reversed: '피로, 포기, 방어벽 붕괴' }},
  { id: 'rw-minor-wands-10', name: 'Ten of Wands', nameKo: '완드 10', deck: 'rider-waite', arcana: 'minor', suit: 'wands', imageUrl: '', meanings: { upright: '부담, 책임감, 과로', reversed: '부담 내려놓기, 책임 회피' }},
  { id: 'rw-minor-wands-11', name: 'Page of Wands', nameKo: '완드 페이지', deck: 'rider-waite', arcana: 'minor', suit: 'wands', imageUrl: '', meanings: { upright: '열정, 새로운 아이디어, 탐험', reversed: '미숙함, 충동성, 계획 부족' }},
  { id: 'rw-minor-wands-12', name: 'Knight of Wands', nameKo: '완드 나이트', deck: 'rider-waite', arcana: 'minor', suit: 'wands', imageUrl: '', meanings: { upright: '에너지, 열정, 행동력, 모험', reversed: '성급함, 무모함, 충동적 행동' }},
  { id: 'rw-minor-wands-13', name: 'Queen of Wands', nameKo: '완드 퀸', deck: 'rider-waite', arcana: 'minor', suit: 'wands', imageUrl: '', meanings: { upright: '자신감, 열정, 독립심, 매력', reversed: '질투, 이기심, 통제 불능' }},
  { id: 'rw-minor-wands-14', name: 'King of Wands', nameKo: '완드 킹', deck: 'rider-waite', arcana: 'minor', suit: 'wands', imageUrl: '', meanings: { upright: '리더십, 비전, 카리스마, 결단력', reversed: '독단적, 오만함, 성급한 결정' }},
  // Cups
  { id: 'rw-minor-cups-1', name: 'Ace of Cups', nameKo: '컵 에이스', deck: 'rider-waite', arcana: 'minor', suit: 'cups', imageUrl: '', meanings: { upright: '새로운 감정, 사랑의 시작, 공감', reversed: '감정적 억압, 사랑의 상실' }},
  { id: 'rw-minor-cups-2', name: 'Two of Cups', nameKo: '컵 2', deck: 'rider-waite', arcana: 'minor', suit: 'cups', imageUrl: '', meanings: { upright: '파트너십, 조화, 사랑, 결합', reversed: '불화, 관계의 깨짐, 부조화' }},
  { id: 'rw-minor-cups-3', name: 'Three of Cups', nameKo: '컵 3', deck: 'rider-waite', arcana: 'minor', suit: 'cups', imageUrl: '', meanings: { upright: '축하, 우정, 커뮤니티', reversed: '과잉, 고립, 조화롭지 못한 관계' }},
  { id: 'rw-minor-cups-4', name: 'Four of Cups', nameKo: '컵 4', deck: 'rider-waite', arcana: 'minor', suit: 'cups', imageUrl: '', meanings: { upright: '권태, 무관심, 새로운 제안', reversed: '기회 놓침, 우울, 고립' }},
  { id: 'rw-minor-cups-5', name: 'Five of Cups', nameKo: '컵 5', deck: 'rider-waite', arcana: 'minor', suit: 'cups', imageUrl: '', meanings: { upright: '상실, 슬픔, 후회, 부정적 감정', reversed: '과거 수용, 희망 발견, 긍정적 전환' }},
  { id: 'rw-minor-cups-6', name: 'Six of Cups', nameKo: '컵 6', deck: 'rider-waite', arcana: 'minor', suit: 'cups', imageUrl: '', meanings: { upright: '추억, 순수함, 그리움, 과거의 선물', reversed: '과거에 얽매임, 비현실적 기대' }},
  { id: 'rw-minor-cups-7', name: 'Seven of Cups', nameKo: '컵 7', deck: 'rider-waite', arcana: 'minor', suit: 'cups', imageUrl: '', meanings: { upright: '환상, 상상, 많은 선택지', reversed: '현실 직시, 환상에서 깨어남' }},
  { id: 'rw-minor-cups-8', name: 'Eight of Cups', nameKo: '컵 8', deck: 'rider-waite', arcana: 'minor', suit: 'cups', imageUrl: '', meanings: { upright: '새로운 길을 떠남, 포기, 탐색', reversed: '망설임, 두려움, 현실 도피' }},
  { id: 'rw-minor-cups-9', name: 'Nine of Cups', nameKo: '컵 9', deck: 'rider-waite', arcana: 'minor', suit: 'cups', imageUrl: '', meanings: { upright: '소원 성취, 만족, 행복', reversed: '불만족, 탐욕, 실망' }},
  { id: 'rw-minor-cups-10', name: 'Ten of Cups', nameKo: '컵 10', deck: 'rider-waite', arcana: 'minor', suit: 'cups', imageUrl: '', meanings: { upright: '가정의 행복, 조화, 완벽한 사랑', reversed: '가정 불화, 깨진 관계' }},
  { id: 'rw-minor-cups-11', name: 'Page of Cups', nameKo: '컵 페이지', deck: 'rider-waite', arcana: 'minor', suit: 'cups', imageUrl: '', meanings: { upright: '감정적 메시지, 창의적 영감', reversed: '감정적 미숙, 불안정' }},
  { id: 'rw-minor-cups-12', name: 'Knight of Cups', nameKo: '컵 나이트', deck: 'rider-waite', arcana: 'minor', suit: 'cups', imageUrl: '', meanings: { upright: '로맨틱, 이상주의, 제안', reversed: '기만, 환상, 비현실적' }},
  { id: 'rw-minor-cups-13', name: 'Queen of Cups', nameKo: '컵 퀸', deck: 'rider-waite', arcana: 'minor', suit: 'cups', imageUrl: '', meanings: { upright: '공감, 직관, 감정적 성숙', reversed: '감정 과잉, 의존성, 불안정' }},
  { id: 'rw-minor-cups-14', name: 'King of Cups', nameKo: '컵 킹', deck: 'rider-waite', arcana: 'minor', suit: 'cups', imageUrl: '', meanings: { upright: '감정적 균형, 통제력, 관대함', reversed: '감정적 조작, 변덕, 냉담함' }},
  // Swords
  { id: 'rw-minor-swords-1', name: 'Ace of Swords', nameKo: '소드 에이스', deck: 'rider-waite', arcana: 'minor', suit: 'swords', imageUrl: '', meanings: { upright: '명확한 사고, 진실, 새로운 아이디어', reversed: '혼란, 잘못된 판단, 거짓' }},
  { id: 'rw-minor-swords-2', name: 'Two of Swords', nameKo: '소드 2', deck: 'rider-waite', arcana: 'minor', suit: 'swords', imageUrl: '', meanings: { upright: '균형, 결정 보류, 평화', reversed: '결정의 어려움, 교착 상태, 거짓된 평화' }},
  { id: 'rw-minor-swords-3', name: 'Three of Swords', nameKo: '소드 3', deck: 'rider-waite', arcana: 'minor', suit: 'swords', imageUrl: '', meanings: { upright: '마음의 상처, 슬픔, 이별', reversed: '상처 극복, 회복, 고통 완화' }},
  { id: 'rw-minor-swords-4', name: 'Four of Swords', nameKo: '소드 4', deck: 'rider-waite', arcana: 'minor', suit: 'swords', imageUrl: '', meanings: { upright: '휴식, 회복, 명상', reversed: '정체, 소진, 고립' }},
  { id: 'rw-minor-swords-5', name: 'Five of Swords', nameKo: '소드 5', deck: 'rider-waite', arcana: 'minor', suit: 'swords', imageUrl: '', meanings: { upright: '갈등, 패배, 이기적인 승리', reversed: '갈등의 끝, 화해, 용서' }},
  { id: 'rw-minor-swords-6', name: 'Six of Swords', nameKo: '소드 6', deck: 'rider-waite', arcana: 'minor', suit: 'swords', imageUrl: '', meanings: { upright: '어려움으로부터의 이동, 전환, 회복', reversed: '정체, 해결되지 않는 문제' }},
  { id: 'rw-minor-swords-7', name: 'Seven of Swords', nameKo: '소드 7', deck: 'rider-waite', arcana: 'minor', suit: 'swords', imageUrl: '', meanings: { upright: '전략, 기만, 몰래 하는 행동', reversed: '진실이 드러남, 정직한 조언' }},
  { id: 'rw-minor-swords-8', name: 'Eight of Swords', nameKo: '소드 8', deck: 'rider-waite', arcana: 'minor', suit: 'swords', imageUrl: '', meanings: { upright: '제한, 속박, 스스로 만든 감옥', reversed: '해방, 속박에서 벗어남, 자유' }},
  { id: 'rw-minor-swords-9', name: 'Nine of Swords', nameKo: '소드 9', deck: 'rider-waite', arcana: 'minor', suit: 'swords', imageUrl: '', meanings: { upright: '불안, 악몽, 걱정, 죄책감', reversed: '두려움 극복, 희망 발견' }},
  { id: 'rw-minor-swords-10', name: 'Ten of Swords', nameKo: '소드 10', deck: 'rider-waite', arcana: 'minor', suit: 'swords', imageUrl: '', meanings: { upright: '실패, 끝, 배신, 새로운 시작', reversed: '회복의 시작, 고통의 끝' }},
  { id: 'rw-minor-swords-11', name: 'Page of Swords', nameKo: '소드 페이지', deck: 'rider-waite', arcana: 'minor', suit: 'swords', imageUrl: '', meanings: { upright: '호기심, 진실 탐구, 새로운 아이디어', reversed: '성급한 판단, 험담' }},
  { id: 'rw-minor-swords-12', name: 'Knight of Swords', nameKo: '소드 나이트', deck: 'rider-waite', arcana: 'minor', suit: 'swords', imageUrl: '', meanings: { upright: '빠른 행동, 결단력, 지성', reversed: '무모함, 충동성, 공격성' }},
  { id: 'rw-minor-swords-13', name: 'Queen of Swords', nameKo: '소드 퀸', deck: 'rider-waite', arcana: 'minor', suit: 'swords', imageUrl: '', meanings: { upright: '지성, 독립, 명확한 판단', reversed: '냉소적, 비판적, 고독' }},
  { id: 'rw-minor-swords-14', name: 'Knight of Swords', nameKo: '소드 기사', deck: 'rider-waite', arcana: 'minor', suit: 'swords', imageUrl: '', meanings: { upright: '강력한 지성, 권위, 분석력', reversed: '독단, 잔인함, 권력 남용' }},
  // Pentacles
  { id: 'rw-minor-pentacles-1', name: 'Ace of Pentacles', nameKo: '펜타클 에이스', deck: 'rider-waite', arcana: 'minor', suit: 'pentacles', imageUrl: '', meanings: { upright: '새로운 기회, 번영, 안정', reversed: '기회 놓침, 재정적 손실' }},
  { id: 'rw-minor-pentacles-2', name: 'Two of Pentacles', nameKo: '펜타클 2', deck: 'rider-waite', arcana: 'minor', suit: 'pentacles', imageUrl: '', meanings: { upright: '균형, 적응, 유연성', reversed: '불균형, 관리의 어려움' }},
  { id: 'rw-minor-pentacles-3', name: 'Three of Pentacles', nameKo: '펜타클 3', deck: 'rider-waite', arcana: 'minor', suit: 'pentacles', imageUrl: '', meanings: { upright: '협력, 기술, 팀워크', reversed: '협력 부족, 낮은 품질' }},
  { id: 'rw-minor-pentacles-4', name: 'Four of Pentacles', nameKo: '펜타클 4', deck: 'rider-waite', arcana: 'minor', suit: 'pentacles', imageUrl: '', meanings: { upright: '소유, 안정, 통제', reversed: '탐욕, 인색함, 손실의 두려움' }},
  { id: 'rw-minor-pentacles-5', name: 'Five of Pentacles', nameKo: '펜타클 5', deck: 'rider-waite', arcana: 'minor', suit: 'pentacles', imageUrl: '', meanings: { upright: '재정적 어려움, 소외, 궁핍', reversed: '어려움 극복, 희망 발견' }},
  { id: 'rw-minor-pentacles-6', name: 'Six of Pentacles', nameKo: '펜타클 6', deck: 'rider-waite', arcana: 'minor', suit: 'pentacles', imageUrl: '', meanings: { upright: '관대함, 나눔, 자선', reversed: '이기심, 빚, 불공정한 거래' }},
  { id: 'rw-minor-pentacles-7', name: 'Seven of Pentacles', nameKo: '펜타클 7', deck: 'rider-waite', arcana: 'minor', suit: 'pentacles', imageUrl: '', meanings: { upright: '인내, 평가, 장기적 투자', reversed: '조급함, 노력의 부족, 실망' }},
  { id: 'rw-minor-pentacles-8', name: 'Eight of Pentacles', nameKo: '펜타클 8', deck: 'rider-waite', arcana: 'minor', suit: 'pentacles', imageUrl: '', meanings: { upright: '기술 연마, 노력, 헌신', reversed: '나태, 낮은 품질, 노력 부족' }},
  { id: 'rw-minor-pentacles-9', name: 'Nine of Pentacles', nameKo: '펜타클 9', deck: 'rider-waite', arcana: 'minor', suit: 'pentacles', imageUrl: '', meanings: { upright: '독립, 풍요, 자기 만족', reversed: '의존, 재정적 불안, 외로움' }},
  { id: 'rw-minor-pentacles-10', name: 'Ten of Pentacles', nameKo: '펜타클 10', deck: 'rider-waite', arcana: 'minor', suit: 'pentacles', imageUrl: '', meanings: { upright: '가족의 부, 유산, 안정', reversed: '가족 갈등, 재정적 불안정' }},
  { id: 'rw-minor-pentacles-11', name: 'Page of Pentacles', nameKo: '펜타클 페이지', deck: 'rider-waite', arcana: 'minor', suit: 'pentacles', imageUrl: '', meanings: { upright: '새로운 기회, 배우려는 자세', reversed: '기회 놓침, 나태함' }},
  { id: 'rw-minor-pentacles-12', name: 'Knight of Pentacles', nameKo: '펜타클 나이트', deck: 'rider-waite', arcana: 'minor', suit: 'pentacles', imageUrl: '', meanings: { upright: '신뢰, 꾸준함, 책임감', reversed: '나태, 고집, 지루함' }},
  { id: 'rw-minor-pentacles-13', name: 'Queen of Pentacles', nameKo: '펜타클 퀸', deck: 'rider-waite', arcana: 'minor', suit: 'pentacles', imageUrl: '', meanings: { upright: '현실적, 안정, 관대함', reversed: '물질주의, 불안정, 질투' }},
  { id: 'rw-minor-pentacles-14', name: 'King of Pentacles', nameKo: '펜타클 킹', deck: 'rider-waite', arcana: 'minor', suit: 'pentacles', imageUrl: '', meanings: { upright: '사업적 성공, 안정, 풍요', reversed: '탐욕, 부패, 무능' }},
];

// 토트 마이너 아르카나
export const thothMinorArcana: TarotCard[] = [
  // Wands
  { id: 'th-minor-wands-1', name: 'Ace of Wands', nameKo: '완드 에이스', deck: 'thoth', arcana: 'minor', suit: 'wands', imageUrl: '', meanings: { upright: '창조의 원초적 에너지, 의지의 시작', reversed: '파괴적 에너지, 방향성 없는 힘' }},
  { id: 'th-minor-wands-2', name: 'Dominion', nameKo: '지배 (완드 2)', deck: 'thoth', arcana: 'minor', suit: 'wands', imageUrl: '', meanings: { upright: '의지력, 통제, 지배력', reversed: '힘의 남용, 독단' }},
  { id: 'th-minor-wands-3', name: 'Virtue', nameKo: '미덕 (완드 3)', deck: 'thoth', arcana: 'minor', suit: 'wands', imageUrl: '', meanings: { upright: '선한 의지, 조화, 확립된 힘', reversed: '위선, 비현실적 이상' }},
  { id: 'th-minor-wands-4', name: 'Completion', nameKo: '완성 (완드 4)', deck: 'thoth', arcana: 'minor', suit: 'wands', imageUrl: '', meanings: { upright: '완벽, 휴식, 일의 마무리', reversed: '불완전함, 정체' }},
  { id: 'th-minor-wands-5', name: 'Strife', nameKo: '투쟁 (완드 5)', deck: 'thoth', arcana: 'minor', suit: 'wands', imageUrl: '', meanings: { upright: '갈등, 경쟁, 장애물', reversed: '패배, 폭력, 잔인함' }},
  { id: 'th-minor-wands-6', name: 'Victory', nameKo: '승리 (완드 6)', deck: 'thoth', arcana: 'minor', suit: 'wands', imageUrl: '', meanings: { upright: '성공, 승리, 에너지의 조화', reversed: '오만, 헛된 승리' }},
  { id: 'th-minor-wands-7', name: 'Valour', nameKo: '용기 (완드 7)', deck: 'thoth', arcana: 'minor', suit: 'wands', imageUrl: '', meanings: { upright: '용맹, 도전, 끈기', reversed: '무모함, 불확실한 싸움' }},
  { id: 'th-minor-wands-8', name: 'Swiftness', nameKo: '신속 (완드 8)', deck: 'thoth', arcana: 'minor', suit: 'wands', imageUrl: '', meanings: { upright: '빠른 속도, 메시지, 급격한 변화', reversed: '지연, 방향성 상실' }},
  { id: 'th-minor-wands-9', name: 'Strength', nameKo: '힘 (완드 9)', deck: 'thoth', arcana: 'minor', suit: 'wands', imageUrl: '', meanings: { upright: '내면의 힘, 잠재력, 회복력', reversed: '약점, 의지 부족' }},
  { id: 'th-minor-wands-10', name: 'Oppression', nameKo: '억압 (완드 10)', deck: 'thoth', arcana: 'minor', suit: 'wands', imageUrl: '', meanings: { upright: '과도한 책임, 억압, 부담', reversed: '책임 회피, 짐을 내려놓음' }},
  { id: 'th-minor-wands-11', name: 'Princess of Wands', nameKo: '완드 공주', deck: 'thoth', arcana: 'minor', suit: 'wands', imageUrl: '', meanings: { upright: '열정, 영감, 새로운 아이디어', reversed: '충동성, 예측 불가능' }},
  { id: 'th-minor-wands-12', name: 'Prince of Wands', nameKo: '완드 왕자', deck: 'thoth', arcana: 'minor', suit: 'wands', imageUrl: '', meanings: { upright: '에너지, 창의력, 대담함', reversed: '파괴성, 성급함' }},
  { id: 'th-minor-wands-13', name: 'Queen of Wands', nameKo: '완드 여왕', deck: 'thoth', arcana: 'minor', suit: 'wands', imageUrl: '', meanings: { upright: '독립심, 자신감, 카리스마', reversed: '질투, 통제, 권위적' }},
  { id: 'th-minor-wands-14', name: 'Knight of Wands', nameKo: '완드 기사', deck: 'thoth', arcana: 'minor', suit: 'wands', imageUrl: '', meanings: { upright: '강력한 의지, 리더십, 창조적 힘', reversed: '파괴적, 잔인함, 독단적' }},
  // Cups
  { id: 'th-minor-cups-1', name: 'Ace of Cups', nameKo: '컵 에이스', deck: 'thoth', arcana: 'minor', suit: 'cups', imageUrl: '', meanings: { upright: '사랑의 근원, 풍요로운 감정', reversed: '감정의 고갈, 불만족' }},
  { id: 'th-minor-cups-2', name: 'Love', nameKo: '사랑 (컵 2)', deck: 'thoth', arcana: 'minor', suit: 'cups', imageUrl: '', meanings: { upright: '사랑, 조화, 결합', reversed: '불화, 관계의 깨짐' }},
  { id: 'th-minor-cups-3', name: 'Abundance', nameKo: '풍요 (컵 3)', deck: 'thoth', arcana: 'minor', suit: 'cups', imageUrl: '', meanings: { upright: '풍요, 축하, 기쁨', reversed: '과잉, 쾌락주의' }},
  { id: 'th-minor-cups-4', name: 'Luxury', nameKo: '사치 (컵 4)', deck: 'thoth', arcana: 'minor', suit: 'cups', imageUrl: '', meanings: { upright: '감정적 안정, 권태', reversed: '불만, 새로운 자극 필요' }},
  { id: 'th-minor-cups-5', name: 'Disappointment', nameKo: '실망 (컵 5)', deck: 'thoth', arcana: 'minor', suit: 'cups', imageUrl: '', meanings: { upright: '상실, 실망, 슬픔', reversed: '새로운 희망, 회복' }},
  { id: 'th-minor-cups-6', name: 'Pleasure', nameKo: '쾌락 (컵 6)', deck: 'thoth', arcana: 'minor', suit: 'cups', imageUrl: '', meanings: { upright: '순수한 기쁨, 조화, 행복', reversed: '과거에 대한 집착, 권태' }},
  { id: 'th-minor-cups-7', name: 'Debauch', nameKo: '방탕 (컵 7)', deck: 'thoth', arcana: 'minor', suit: 'cups', imageUrl: '', meanings: { upright: '환상, 중독, 잘못된 선택', reversed: '현실 직시, 환상에서 벗어남' }},
  { id: 'th-minor-cups-8', name: 'Indolence', nameKo: '나태 (컵 8)', deck: 'thoth', arcana: 'minor', suit: 'cups', imageUrl: '', meanings: { upright: '감정적 정체, 무기력', reversed: '새로운 시작, 변화의 필요성' }},
  { id: 'th-minor-cups-9', name: 'Happiness', nameKo: '행복 (컵 9)', deck: 'thoth', arcana: 'minor', suit: 'cups', imageUrl: '', meanings: { upright: '소원 성취, 만족, 행복', reversed: '불만족, 탐욕' }},
  { id: 'th-minor-cups-10', name: 'Satiety', nameKo: '만족 (컵 10)', deck: 'thoth', arcana: 'minor', suit: 'cups', imageUrl: '', meanings: { upright: '완벽한 행복, 감정적 충만', reversed: '행복의 과잉, 부패' }},
  { id: 'th-minor-cups-11', name: 'Princess of Cups', nameKo: '컵 공주', deck: 'thoth', arcana: 'minor', suit: 'cups', imageUrl: '', meanings: { upright: '낭만, 상상력, 감수성', reversed: '현실 도피, 감정적 미숙' }},
  { id: 'th-minor-cups-12', name: 'Prince of Cups', nameKo: '컵 왕자', deck: 'thoth', arcana: 'minor', suit: 'cups', imageUrl: '', meanings: { upright: '매력, 예술적 감각, 섬세함', reversed: '기만, 불안정, 나르시시즘' }},
  { id: 'th-minor-cups-13', name: 'Queen of Cups', nameKo: '컵 여왕', deck: 'thoth', arcana: 'minor', suit: 'cups', imageUrl: '', meanings: { upright: '직관, 공감, 상상력', reversed: '감정적 착취, 왜곡된 시선' }},
  { id: 'th-minor-cups-14', name: 'Knight of Cups', nameKo: '컵 기사', deck: 'thoth', arcana: 'minor', suit: 'cups', imageUrl: '', meanings: { upright: '치유, 자비, 평화', reversed: '수동성, 무관심' }},
  // Swords
  { id: 'th-minor-swords-1', name: 'Ace of Swords', nameKo: '소드 에이스', deck: 'thoth', arcana: 'minor', suit: 'swords', imageUrl: '', meanings: { upright: '지성의 힘, 진실, 명확한 판단', reversed: '혼란, 파괴적 사고' }},
  { id: 'th-minor-swords-2', name: 'Peace', nameKo: '평화 (소드 2)', deck: 'thoth', arcana: 'minor', suit: 'swords', imageUrl: '', meanings: { upright: '균형 잡힌 힘, 긴장 속 평화', reversed: '깨진 평화, 교착 상태' }},
  { id: 'th-minor-swords-3', name: 'Sorrow', nameKo: '슬픔 (소드 3)', deck: 'thoth', arcana: 'minor', suit: 'swords', imageUrl: '', meanings: { upright: '마음의 상처, 슬픔, 이별', reversed: '고통의 극복, 회복' }},
  { id: 'th-minor-swords-4', name: 'Truce', nameKo: '휴전 (소드 4)', deck: 'thoth', arcana: 'minor', suit: 'swords', imageUrl: '', meanings: { upright: '휴식, 재정비, 갈등의 일시정지', reversed: '정체, 고립' }},
  { id: 'th-minor-swords-5', name: 'Defeat', nameKo: '패배 (소드 5)', deck: 'thoth', arcana: 'minor', suit: 'swords', imageUrl: '', meanings: { upright: '패배, 굴욕, 한계', reversed: '악의, 비겁함' }},
  { id: 'th-minor-swords-6', name: 'Science', nameKo: '과학 (소드 6)', deck: 'thoth', arcana: 'minor', suit: 'swords', imageUrl: '', meanings: { upright: '객관적 분석, 지적 탐구', reversed: '편협한 시각, 비과학적 사고' }},
  { id: 'th-minor-swords-7', name: 'Futility', nameKo: '무익 (소드 7)', deck: 'thoth', arcana: 'minor', suit: 'swords', imageUrl: '', meanings: { upright: '헛된 노력, 불안정한 계획', reversed: '현명한 포기, 새로운 전략' }},
  { id: 'th-minor-swords-8', name: 'Interference', nameKo: '간섭 (소드 8)', deck: 'thoth', arcana: 'minor', suit: 'swords', imageUrl: '', meanings: { upright: '외부의 방해, 제한된 힘', reversed: '속박에서 벗어남, 자유' }},
  { id: 'th-minor-swords-9', name: 'Cruelty', nameKo: '잔인함 (소드 9)', deck: 'thoth', arcana: 'minor', suit: 'swords', imageUrl: '', meanings: { upright: '절망, 죄책감, 자기 파괴', reversed: '희망의 빛, 회복' }},
  { id: 'th-minor-swords-10', name: 'Ruin', nameKo: '파멸 (소드 10)', deck: 'thoth', arcana: 'minor', suit: 'swords', imageUrl: '', meanings: { upright: '완전한 실패, 파괴, 끝', reversed: '새로운 시작, 긍정적 전환' }},
  { id: 'th-minor-swords-11', name: 'Princess of Swords', nameKo: '소드 공주', deck: 'thoth', arcana: 'minor', suit: 'swords', imageUrl: '', meanings: { upright: '논리, 분석, 진실 탐구', reversed: '파괴적 비판, 냉소' }},
  { id: 'th-minor-swords-12', name: 'Prince of Swords', nameKo: '소드 왕자', deck: 'thoth', arcana: 'minor', suit: 'swords', imageUrl: '', meanings: { upright: '지적 창의력, 아이디어', reversed: '파괴적 생각, 논쟁' }},
  { id: 'th-minor-swords-13', name: 'Queen of Swords', nameKo: '소드 여왕', deck: 'thoth', arcana: 'minor', suit: 'swords', imageUrl: '', meanings: { upright: '명확한 판단, 독립성, 지혜', reversed: '슬픔, 고독, 비판적' }},
  { id: 'th-minor-swords-14', name: 'Knight of Swords', nameKo: '소드 기사', deck: 'thoth', arcana: 'minor', suit: 'swords', imageUrl: '', meanings: { upright: '강력한 지성, 권위, 분석력', reversed: '독단, 잔인함, 권력 남용' }},
  // Disks (Pentacles)
  { id: 'th-minor-disks-1', name: 'Ace of Disks', nameKo: '디스크 에이스', deck: 'thoth', arcana: 'minor', suit: 'disks', imageUrl: '', meanings: { upright: '물질적 풍요의 시작, 새로운 기회', reversed: '기회의 상실, 물질주의' }},
  { id: 'th-minor-disks-2', name: 'Change', nameKo: '변화 (디스크 2)', deck: 'thoth', arcana: 'minor', suit: 'disks', imageUrl: '', meanings: { upright: '순환, 변화, 적응', reversed: '불안정, 일관성 부족' }},
  { id: 'th-minor-disks-3', name: 'Works', nameKo: '작업 (디스크 3)', deck: 'thoth', arcana: 'minor', suit: 'disks', imageUrl: '', meanings: { upright: '물질적 성장, 협력, 기술', reversed: '낮은 품질, 협력 부족' }},
  { id: 'th-minor-disks-4', name: 'Power', nameKo: '권력 (디스크 4)', deck: 'thoth', arcana: 'minor', suit: 'disks', imageUrl: '', meanings: { upright: '물질적 안정, 통제', reversed: '탐욕, 인색함' }},
  { id: 'th-minor-disks-5', name: 'Worry', nameKo: '걱정 (디스크 5)', deck: 'thoth', arcana: 'minor', suit: 'disks', imageUrl: '', meanings: { upright: '재정적 어려움, 불안', reversed: '어려움 극복, 희망' }},
  { id: 'th-minor-disks-6', name: 'Success', nameKo: '성공 (디스크 6)', deck: 'thoth', arcana: 'minor', suit: 'disks', imageUrl: '', meanings: { upright: '물질적 성공, 조화', reversed: '오만, 성공의 환상' }},
  { id: 'th-minor-disks-7', name: 'Failure', nameKo: '실패 (디스크 7)', deck: 'thoth', arcana: 'minor', suit: 'disks', imageUrl: '', meanings: { upright: '인내의 한계, 투자 실패', reversed: '조급함, 노력 부족' }},
  { id: 'th-minor-disks-8', name: 'Prudence', nameKo: '신중 (디스크 8)', deck: 'thoth', arcana: 'minor', suit: 'disks', imageUrl: '', meanings: { upright: '신중함, 기술, 노력', reversed: '나태, 세부사항 무시' }},
  { id: 'th-minor-disks-9', name: 'Gain', nameKo: '이익 (디스크 9)', deck: 'thoth', arcana: 'minor', suit: 'disks', imageUrl: '', meanings: { upright: '물질적 이득, 풍요', reversed: '재정적 손실, 탐욕' }},
  { id: 'th-minor-disks-10', name: 'Wealth', nameKo: '부 (디스크 10)', deck: 'thoth', arcana: 'minor', suit: 'disks', imageUrl: '', meanings: { upright: '부의 정점, 안정된 유산', reversed: '재정적 실패, 불안정' }},
  { id: 'th-minor-disks-11', name: 'Princess of Disks', nameKo: '디스크 공주', deck: 'thoth', arcana: 'minor', suit: 'disks', imageUrl: '', meanings: { upright: '새로운 기회, 성장, 실용성', reversed: '나태함, 기회 놓침' }},
  { id: 'th-minor-disks-12', name: 'Prince of Disks', nameKo: '디스크 왕자', deck: 'thoth', arcana: 'minor', suit: 'disks', imageUrl: '', meanings: { upright: '꾸준함, 신뢰, 생산성', reversed: '물질주의, 정체' }},
  { id: 'th-minor-disks-13', name: 'Queen of Disks', nameKo: '디스크 여왕', deck: 'thoth', arcana: 'minor', suit: 'disks', imageUrl: '', meanings: { upright: '관대함, 안정, 현실감각', reversed: '의존, 불안정' }},
  { id: 'th-minor-disks-14', name: 'Knight of Disks', nameKo: '디스크 기사', deck: 'thoth', arcana: 'minor', suit: 'disks', imageUrl: '', meanings: { upright: '결실, 풍요, 책임감', reversed: '나태, 무책임' }},
];

// 전체 카드 리스트 (덱별)
export const riderWaiteAllCards: TarotCard[] = [...riderWaiteMajorArcana, ...riderWaiteMinorArcana];
export const thothAllCards: TarotCard[] = [...thothMajorArcana, ...thothMinorArcana];

// 랜덤 덱 선택
export const getRandomDeck = (): DeckType => {
  const decks: DeckType[] = ['rider-waite', 'thoth'];
  return decks[Math.floor(Math.random() * decks.length)];
};

// 랜덤 카드 선택 (덱 지정)
export const getRandomCard = (deck: DeckType): TarotCard => {
  const cards = deck === 'rider-waite' ? riderWaiteAllCards : thothAllCards;
  return cards[Math.floor(Math.random() * cards.length)];
};

// 여러 장의 랜덤 카드 선택 (중복 없이)
export const getMultipleRandomCards = (deck: DeckType, count: number): TarotCard[] => {
  const cards = deck === 'rider-waite' ? riderWaiteAllCards : thothAllCards;
  const shuffled = cards.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
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

  const result: DailyTarotResult = {
    userId: 'temp-user-id', // 실제 사용자로 교체 필요
    date: new Date().toISOString(),
    deck,
    card,
    orientation,
    interpretation: 'AI 해석이 이곳에 들어갈 예정입니다.',
  };
  return result;
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