// 사용자 관련 타입
export interface User {
  id: string;
  email: string;
  name?: string;
  displayName?: string;
  photoURL?: string;
  nickname: string;
  profileImage: string;
  role: 'user' | 'admin';
  status: 'active' | 'inactive';
  credits: number;
  createdAt: number;
  lastLoginAt?: number;
  isPremium?: boolean;
  groups?: string[];
}

// 타로 카드 관련 타입
export interface TarotCard {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  keywords?: string[];
  upright?: string[];
  reversed?: string[];
  element?: string;
  zodiac?: string;
  planet?: string;
  createdAt: number;
  updatedAt: number;
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

// 지난 대화 기록(타로 리딩 히스토리) 관련 타입
export interface CardDrawn {
  name: string;
  direction: 'upright' | 'reversed';
  imageUrl: string;
  position: number;
}

export interface ConversationTurn {
  type: 'llm_initial_interpretation' | 'user_question' | 'llm_response';
  content: string;
  timestamp: number;
  ownerFeedback?: {
    rating: number;
    text?: string;
  };
}

export interface Reading {
  readingId: string;
  userId: string;
  initialQuestion: string;
  spreadType: string;
  cardsDrawn: {
    name: string;
    direction: 'upright' | 'reversed';
    imageUrl: string;
    position: number;
  }[];
  representativeCardIndex: number;
  conversationTurns: {
    type: 'user_question' | 'llm_initial_interpretation' | 'llm_followup' | 'user_followup';
    content: string;
    timestamp: number;
  }[];
  category?: string;
  createdAt: number;
  updatedAt: number;
}

// 소셜 공유/상호작용 타입 추가
export type EmojiType = 'like' | 'thanks' | 'impressed' | 'love' | 'sad';

export interface SharedReadingRating {
  userId: string;
  rating: number; // 1~5
  createdAt: number;
}

export interface SharedReadingComment {
  commentId: string;
  userId: string;
  content: string;
  createdAt: number;
}

export interface SharedReadingEmoji {
  userId: string;
  emoji: EmojiType;
  createdAt: number;
}

export interface SharedReadingV2 {
  sharedReadingId: string;
  originalReadingId: string;
  sharedTurnIndex: number;
  sharerUid: string;
  receiverUids: string[]; // 여러 명에게 공유 가능
  sharedAt: number;
  sharedInterpretationContent: string;
  ratings: SharedReadingRating[];
  comments: SharedReadingComment[];
  emojis: SharedReadingEmoji[];
  question?: string; // 질문(일일 타로는 undefined)
  card?: any; // 뽑힌 카드 정보(타입 엄격화 필요시 TarotCard 등으로 지정)
  type?: string; // 'daily' | 'spread' 등
}

export interface Inquiry {
  id: string;
  userId: string;
  title: string;
  content: string;
  status: 'pending' | 'in_progress' | 'resolved';
  category: string;
  createdAt: number;
  updatedAt: number;
  responses?: {
    adminId: string;
    content: string;
    createdAt: number;
  }[];
}

export interface SpreadPosition {
  id: string;
  index: number;
  name: string;
  description: string;
  x: number;
  y: number;
  rotation?: number;
}

export interface TarotSpread {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
  positions: SpreadPosition[];
  cardCount: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: string[];
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
} 