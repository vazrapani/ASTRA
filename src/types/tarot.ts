// 덱 타입 정의
export type DeckType = 'rider-waite' | 'thoth';

// 카드 방향
export type CardOrientation = 'upright' | 'reversed';

// 아르카나 타입
export type ArcanaType = 'major' | 'minor';

// 마이너 아르카나 슈트
export type MinorSuit = 'wands' | 'cups' | 'swords' | 'pentacles' | 'disks';

// 기본 카드 인터페이스
export interface TarotCard {
  id: string;
  name: string;
  nameKo: string;
  deck: DeckType;
  arcana: ArcanaType;
  suit?: MinorSuit;
  imageUrl: string;
  tempImageUrl?: string; // 임시 이미지 URL
  meanings: {
    upright: string;
    reversed: string;
  };
}

// 타로 리딩 인터페이스
export interface TarotReading {
  id: string;
  userId: string;
  date: string;
  question: string;
  spread: string;
  cards: TarotCard[];
  orientations: CardOrientation[];
  interpretation: string;
  isShared?: boolean;
  sharedWith?: string[];
}

// 일일 타로 결과 인터페이스
export interface DailyTarotResult {
  userId: string;
  date: string;
  deck: DeckType;
  card: TarotCard;
  orientation: CardOrientation;
  interpretation: string;
  tempImageUrl?: string;  // 임시 이미지 URL
}

// 타로 덱 설정
export interface DeckConfig {
  type: DeckType;
  name: string;
  nameKo: string;
  description: string;
  imageBasePath: string;
  tempImageBasePath: string;
}

// 임시 이미지 설정
export interface TempImageConfig {
  width: number;
  height: number;
  backgroundColor: string;
  textColor: string;
  font: string;
} 