// Firebase Cloud Messaging 서비스 워커
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyBGQCLp6B9MHbCwuEK-pT3YEgNUwHJZvMk",
  authDomain: "astrt-e152b.firebaseapp.com",
  projectId: "astrt-e152b",
  storageBucket: "astrt-e152b.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:1234567890abcdef"
});

const messaging = firebase.messaging();

// 백그라운드 메시지 핸들링
messaging.onBackgroundMessage((payload) => {
  console.log('Background message received:', payload);

  const { title, body } = payload.notification || {};
  const notificationOptions = {
    body: body || '',
    icon: '/favicon.png',
    badge: '/favicon.png',
    data: payload.data
  };

  self.registration.showNotification(title || '아스트라 타로', notificationOptions);
}); 