import { auth } from '../../config/firebase';
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInAnonymously,
  UserCredential,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail
} from 'firebase/auth';

// TODO: Naver, Kakao, LINE provider 연동 필요 (커스텀 OAuth 구현 필요)

export const signInWithGoogle = async (): Promise<UserCredential> => {
  const provider = new GoogleAuthProvider();
  return signInWithPopup(auth, provider);
};

// 게스트 로그인
export const signInAsGuest = async (): Promise<UserCredential> => {
  return signInAnonymously(auth);
};

// 이메일 회원가입
export const registerWithEmail = async (email: string, password: string): Promise<UserCredential> => {
  return createUserWithEmailAndPassword(auth, email, password);
};

// 이메일 로그인
export const loginWithEmail = async (email: string, password: string): Promise<UserCredential> => {
  return signInWithEmailAndPassword(auth, email, password);
};

// 비밀번호 재설정
export const resetPassword = async (email: string): Promise<void> => {
  return sendPasswordResetEmail(auth, email);
};

// 추후: Naver, Kakao, LINE 연동 함수 추가 예정 