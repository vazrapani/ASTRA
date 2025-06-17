import { onSchedule } from 'firebase-functions/v2/scheduler';
import * as admin from 'firebase-admin';

// 타입 정의
interface Notification {
  userId: string;
  type: 'daily_tarot';
  message: string;
  createdAt: admin.firestore.FieldValue;
  read: boolean;
}

interface FCMMessage {
  token: string;
  notification: {
    title: string;
    body: string;
  };
  data: {
    type: string;
  };
  android: {
    priority: 'high';
    notification: {
      channelId: string;
    };
  };
  apns: {
    payload: {
      aps: {
        sound: string;
      };
    };
  };
}

// Admin SDK 초기화
admin.initializeApp();

// 매일 00시에 실행되는 일일 타로 초기화 및 알림 함수
export const dailyTarotReset = onSchedule({ 
  schedule: '0 0 * * *',  // 매일 00시
  timeZone: 'Asia/Seoul', // 한국 시간 기준
  region: 'asia-northeast3'
}, async (_event) => {
  const db = admin.firestore();
  const messaging = admin.messaging();

  try {
    // 1. 활성 사용자 목록 가져오기
    const usersSnapshot = await db.collection('users')
      .where('isActive', '==', true)
      .get();

    const batch = db.batch();
    const notifications: Notification[] = [];
    const messages: FCMMessage[] = [];

    usersSnapshot.forEach(doc => {
      const userId = doc.id;
      const userRef = db.collection('users').doc(userId);
      
      // 2. 일일 타로 상태 초기화
      batch.update(userRef, {
        lastDailyTarot: null
      });

      // 3. 앱 내 알림 생성
      const notification: Notification = {
        userId,
        type: 'daily_tarot',
        message: '오늘의 타로를 확인해보세요!',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        read: false
      };
      notifications.push(notification);

      // 4. FCM 메시지 준비
      if (doc.data()?.fcmToken) {
        messages.push({
          token: doc.data()!.fcmToken,
          notification: {
            title: '아스트라 타로',
            body: '오늘의 운세를 확인해보세요!'
          },
          data: {
            type: 'DAILY_TAROT_RESET'
          },
          android: {
            priority: 'high',
            notification: {
              channelId: 'daily_tarot'
            }
          },
          apns: {
            payload: {
              aps: {
                sound: 'default'
              }
            }
          }
        });
      }
    });

    // 5. 일괄 처리 실행
    await batch.commit();

    // 6. 앱 내 알림 저장
    const notificationPromises = notifications.map(notification =>
      db.collection('notifications').add(notification)
    );
    await Promise.all(notificationPromises);

    // 7. FCM 메시지 전송 (최대 500개씩 분할 전송)
    for (let i = 0; i < messages.length; i += 500) {
      const batch = messages.slice(i, i + 500);
      if (batch.length > 0) {
        const response = await messaging.sendAll(batch);
        console.log('Successfully sent messages:', response.successCount);
        if (response.failureCount > 0) {
          console.error('Failed to send some messages:', response.responses.filter(r => !r.success));
        }
      }
    }

    console.log('Daily tarot reset completed successfully');
  } catch (error) {
    console.error('Daily tarot reset failed:', error);
    throw error;
  }
}); 