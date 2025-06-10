import React from 'react';
import { IonButton } from '@ionic/react';

const TempSocial: React.FC = () => (
  <div style={{ textAlign: 'center', padding: '2em' }}>
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" stroke="#6c47ff" strokeWidth="2" fill="#f5f5fa" />
      <path d="M8 12h8M8 16h8M8 8h8" stroke="#6c47ff" strokeWidth="2" strokeLinecap="round"/>
    </svg>
    <h2>소셜 기능 준비중</h2>
    <p>이곳에 소셜/커뮤니티 기능이 추가될 예정입니다.</p>
    <IonButton expand="block" color="primary" style={{marginTop:24}} routerLink="/social/friends">친구 목록 보기</IonButton>
  </div>
);

export default TempSocial; 