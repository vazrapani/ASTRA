import React from 'react';
import { WebStorage } from 'redux-persist';
import { PersistGateProps } from 'redux-persist/es/integration/react';
import { RouteComponentProps } from 'react-router-dom';

// Redux Persist 타입 정의
declare module 'redux-persist/lib/storage' {
  const storage: WebStorage;
  export default storage;
}

declare module 'redux-persist/integration/react' {
  export const PersistGate: React.FC<PersistGateProps>;
}

// Ionic React Router 타입 정의
declare module '@ionic/react-router' {
  export interface IonReactRouterProps extends RouteComponentProps {}
}

// 전역 타입 정의
declare global {
  interface Window {
    __REDUX_DEVTOOLS_EXTENSION__?: () => any;
  }
}

// 커스텀 타입 정의
export interface User {
  id: string;
  email: string;
  nickname: string;
  profileImage?: string;
}

export interface TarotCard {
  id: number;
  name: string;
  imageUrl: string;
  meaning: string;
  reversedMeaning: string;
}

export interface TarotReading {
  id: string;
  type: 'daily' | 'weekly' | 'love' | 'career';
  cards: TarotCard[];
  date: string;
  interpretation: string;
} 