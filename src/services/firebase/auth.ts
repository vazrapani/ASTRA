import { auth } from '../../config/firebase';
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInAnonymously,
  UserCredential,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  deleteUser,
  linkWithPopup,
  FacebookAuthProvider
} from 'firebase/auth';

// TODO: Naver, Kakao, LINE provider 연동 필요 (커스텀 OAuth 구현 필요)

export const signInWithGoogle = async (): Promise<UserCredential> => {
  const provider = new GoogleAuthProvider();
  if (auth.currentUser && auth.currentUser.isAnonymous) {
    // 익명 계정 상태라면 업그레이드
    return linkWithPopup(auth.currentUser, provider);
  } else {
    // 일반 로그인
    return signInWithPopup(auth, provider);
  }
};

// 게스트 로그인
export const signInAsGuest = async (): Promise<UserCredential> => {
  return signInAnonymously(auth);
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

export const logout = async () => {
  return signOut(auth);
};

export const withdrawUser = async () => {
  if (auth.currentUser) {
    return deleteUser(auth.currentUser);
  } else {
    throw new Error('No user is currently logged in.');
  }
};

export const signInWithFacebook = async (): Promise<UserCredential> => {
  const provider = new FacebookAuthProvider();
  if (auth.currentUser && auth.currentUser.isAnonymous) {
    return linkWithPopup(auth.currentUser, provider);
  } else {
    return signInWithPopup(auth, provider);
  }
}; 