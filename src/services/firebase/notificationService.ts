import { db } from '../../config/firebase';
import { collection, addDoc, query, where, getDocs, orderBy, limit, updateDoc, doc, deleteDoc, Timestamp } from 'firebase/firestore';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import type { Notification, NotificationType } from '../../types/notification';

const NOTIFICATIONS_COLLECTION = 'notifications';

// FCM 토큰 관리
export const initializeMessaging = () => {
  try {
    const messaging = getMessaging();
    
    // 메시지 수신 핸들러 등록
    onMessage(messaging, (payload) => {
      console.log('Message received:', payload);
      
      // 브라우저 알림 표시
      if (Notification.permission === 'granted' && payload.notification) {
        const { title, body } = payload.notification;
        new Notification(title || '아스트라 타로', {
          body,
          icon: '/favicon.png',
          badge: '/favicon.png',
          data: payload.data
        });
      }
    });
  } catch (error) {
    console.error('Error initializing messaging:', error);
  }
};

// FCM 토큰 가져오기
export const getFCMToken = async () => {
  try {
    const messaging = getMessaging();
    const token = await getToken(messaging, {
      vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY
    });
    return token;
  } catch (error) {
    console.error('Error getting FCM token:', error);
    return null;
  }
};

// FCM 토큰 업데이트
export const updateFCMToken = async (userId: string, token: string) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      fcmToken: token
    });
    console.log('FCM token updated successfully');
  } catch (error) {
    console.error('Error updating FCM token:', error);
  }
};

// 알림 권한 요청
export const requestNotificationPermission = async () => {
  try {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return false;
  }
};

// 알림 생성
export const createNotification = async (notification: Omit<Notification, 'id'>) => {
  try {
    const docRef = await addDoc(collection(db, NOTIFICATIONS_COLLECTION), notification);
    return {
      id: docRef.id,
      ...notification
    } as Notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

// 사용자의 읽지 않은 알림 개수 가져오기
export async function getUnreadNotificationCount(userId: string) {
  const q = query(
    collection(db, 'notifications'),
    where('userId', '==', userId),
    where('read', '==', false)
  );
  const snapshot = await getDocs(q);
  return snapshot.size;
}

// 사용자의 최근 알림 목록 가져오기
export async function getUserNotifications(userId: string, limitCount: number = 20) {
  const q = query(
    collection(db, 'notifications'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}

// 알림 읽음 처리
export const markNotificationAsRead = async (notificationId: string) => {
  try {
    const notificationRef = doc(db, NOTIFICATIONS_COLLECTION, notificationId);
    await updateDoc(notificationRef, {
      isRead: true
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

export const fetchUserNotifications = async (userId: string): Promise<Notification[]> => {
  try {
    const q = query(
      collection(db, NOTIFICATIONS_COLLECTION),
      where('recipientId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Notification[];
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }
};

export const markAllNotificationsAsRead = async (userId: string) => {
  try {
    const q = query(
      collection(db, NOTIFICATIONS_COLLECTION),
      where('recipientId', '==', userId),
      where('isRead', '==', false)
    );
    const querySnapshot = await getDocs(q);
    const updatePromises = querySnapshot.docs.map(doc =>
      updateDoc(doc.ref, { isRead: true })
    );
    await Promise.all(updatePromises);
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
};

export const deleteNotification = async (notificationId: string) => {
  try {
    await deleteDoc(doc(db, NOTIFICATIONS_COLLECTION, notificationId));
  } catch (error) {
    console.error('Error deleting notification:', error);
    throw error;
  }
};

export const createSystemNotification = async (
  recipientId: string,
  title: string,
  message: string,
  data?: Record<string, any>
) => {
  const notification: Omit<Notification, 'id'> = {
    type: 'SYSTEM_NOTICE',
    title,
    message,
    isRead: false,
    createdAt: Date.now(),
    recipientId,
    data
  };
  return createNotification(notification);
};

export const createFriendRequestNotification = async (
  recipientId: string,
  senderId: string,
  senderName: string
) => {
  const notification: Omit<Notification, 'id'> = {
    type: 'FRIEND_REQUEST',
    title: '새로운 친구 요청',
    message: `${senderName}님이 친구 요청을 보냈습니다.`,
    isRead: false,
    createdAt: Date.now(),
    recipientId,
    senderId,
    data: {
      friendId: senderId
    }
  };
  return createNotification(notification);
};

export const createReadingShareNotification = async (
  recipientId: string,
  senderId: string,
  senderName: string,
  readingId: string
) => {
  const notification: Omit<Notification, 'id'> = {
    type: 'READING_SHARE',
    title: '타로 해석 공유',
    message: `${senderName}님이 타로 해석을 공유했습니다.`,
    isRead: false,
    createdAt: Date.now(),
    recipientId,
    senderId,
    data: {
      readingId
    }
  };
  return createNotification(notification);
}; 