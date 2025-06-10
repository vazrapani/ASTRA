// 사용자 관련 타입
export interface User {
  id: string;
  nickname: string;
  profileImage: string;
  credits: number;
  createdAt: Date;
  lastLoginAt: Date;
}

// 타로 카드 관련 타입
export interface TarotCard {
  id: string;
  name: string;
  imageUrl: string;
  meaning: {
    upright: string;
    reversed: string;
  };
}

// 타로 리딩 관련 타입
export interface TarotReading {
  id: string;
  userId: string;
  question: string;
  cards: {
    card: TarotCard;
    position: 'upright' | 'reversed';
  }[];
  interpretation: string;
  createdAt: Date;
}

// 크레딧 시스템 관련 타입
export interface CreditSystem {
  readingCost: {
    singleCard: number;
    threeCards: number;
    fiveCards: number;
    celticCross: number;
  };
  adReward: {
    shortAd: number;
    longAd: number;
  };
}

// 관리자 설정 관련 타입
export interface AdminSettings {
  creditSystem: CreditSystem;
  adSettings: {
    enabled: boolean;
    shortAdDuration: number;
    longAdDuration: number;
  };
} 