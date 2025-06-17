import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getMessaging, getToken } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const messaging = getMessaging(app);

// 서비스 워커 등록 및 FCM 설정
export async function initializeFCM() {
  try {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
      console.log('서비스 워커 등록 성공:', registration.scope);

      // Firebase 설정을 서비스 워커에 전달
      registration.active?.postMessage({
        type: 'FIREBASE_CONFIG',
        config: firebaseConfig
      });

      // FCM 토큰 요청
      const currentToken = await getToken(messaging, {
        vapidKey: firebaseConfig.vapidKey,
        serviceWorkerRegistration: registration
      });

      if (currentToken) {
        console.log('FCM 토큰:', currentToken);
        return currentToken;
      } else {
        console.log('FCM 토큰을 받을 수 없습니다. 알림 권한을 확인해주세요.');
        return null;
      }
    }
    return null;
  } catch (error) {
    console.error('FCM 초기화 실패:', error);
    return null;
  }
}

export default app; 