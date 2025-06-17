export type NotificationType = 
  | 'FRIEND_REQUEST'      // 친구 초청
  | 'FRIEND_ACCEPT'      // 친구 수락
  | 'daily_tarot'        // 오늘의 타로 초기화
  | 'READING_SHARE'      // 타로 해석 공유
  | 'READING_COMMENT'    // 타로 해석 댓글
  | 'READING_REACTION'   // 타로 해석 반응
  | 'SYSTEM_NOTICE';     // 시스템 공지사항

// 알림 라우팅 정보
export const NOTIFICATION_ROUTES: Record<NotificationType, string> = {
  FRIEND_REQUEST: '/tabs/social/friends',
  FRIEND_ACCEPT: '/tabs/social/friends',
  daily_tarot: '/tabs/tarot/daily',
  READING_SHARE: '/tabs/my/readings',
  READING_COMMENT: '/tabs/my/readings',
  READING_REACTION: '/tabs/my/readings',
  SYSTEM_NOTICE: '/tabs/my/notices'
};

// 기본 알림 인터페이스
export interface BaseNotification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  time: number;
  read: boolean;
  createdAt?: any;  // Firestore Timestamp
  data?: Record<string, any>;  // 추가 데이터 필드
}

// 친구 요청 알림
interface FriendRequestNotification extends BaseNotification {
  type: 'FRIEND_REQUEST';
  data: {
    friendId: string;
    friendName: string;
  };
}

// 친구 수락 알림
interface FriendAcceptNotification extends BaseNotification {
  type: 'FRIEND_ACCEPT';
  data: {
    friendId: string;
    friendName: string;
  };
}

// 오늘의 타로 초기화 알림
interface DailyTarotNotification extends BaseNotification {
  type: 'daily_tarot';
}

// 타로 해석 공유 알림
interface ReadingSharedNotification extends BaseNotification {
  type: 'READING_SHARE' | 'READING_COMMENT' | 'READING_REACTION';
  data: {
    readingId: string;
    sharedBy: string;
  };
}

// 시스템 공지사항 알림
export interface SystemNoticeNotification extends BaseNotification {
  type: 'SYSTEM_NOTICE';
  data: {
    noticeId: string;
    _deletedNotice?: boolean;
  }
}

// 알림 타입 유니온
export type Notification = 
  | FriendRequestNotification
  | FriendAcceptNotification
  | DailyTarotNotification
  | ReadingSharedNotification
  | SystemNoticeNotification;

export interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  lastChecked: number | null;
  isLoading: boolean;
  error: string | null;
} 