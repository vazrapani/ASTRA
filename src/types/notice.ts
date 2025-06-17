export type NoticeCategory = '업데이트' | '징계' | '일반' | '긴급';

export type NoticeNotificationType = '앱내' | '푸쉬';

export interface Notice {
  noticeId: string;
  title: string;
  category: NoticeCategory;
  content: string;
  createdAt: number;      // timestamp(ms)
  updatedAt: number;      // timestamp(ms)
  viewCount: number;
  createdBy: {
    id: string;
    name: string;
  };
  deleted?: boolean;
  readBy?: { [userId: string]: boolean }; // 읽음 처리
  notificationType: NoticeNotificationType; // 알림 방식
  hidden?: boolean; // 숨김 처리
  targetType?: 'all' | 'groups' | 'users'; // 전체/그룹/개별
  targetGroups?: string[]; // 그룹 id 배열
  targetUsers?: string[];  // 사용자 id 배열
} 