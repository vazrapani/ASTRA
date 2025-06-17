export interface User {
  id: string;
  createdAt: number;
  credits: number;
  email: string;
  nickname: string;
  profileImage: string;
  role: string;
  deletedAt?: number; // 탈퇴일 (선택적)
  // friends, groups 등은 필요에 따라 추가
} 