import { db } from '../../config/firebase';
import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
  increment,
  serverTimestamp,
  query,
  orderBy,
  setDoc,
} from 'firebase/firestore';
import { Notice, NoticeCategory, NoticeNotificationType } from '../../types/notice';

const NOTICES_COLLECTION = 'notices';

// 공지 생성
export async function createNotice(notice: Omit<Notice, 'noticeId' | 'createdAt' | 'updatedAt' | 'viewCount'>) {
  const docRef = await addDoc(collection(db, NOTICES_COLLECTION), {
    ...notice,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    viewCount: 0,
    deleted: false,
  });
  return docRef.id;
}

// 공지 리스트 조회 (최신순)
export async function getNoticeList() {
  const q = query(collection(db, NOTICES_COLLECTION), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ noticeId: doc.id, ...doc.data() })) as Notice[];
}

// 공지 상세 조회
export async function getNoticeById(noticeId: string) {
  const docRef = doc(db, NOTICES_COLLECTION, noticeId);
  const snapshot = await getDoc(docRef);
  if (!snapshot.exists()) return null;
  return { noticeId: snapshot.id, ...snapshot.data() } as Notice;
}

// 공지 조회수 증가 (관리자 제외)
export async function incrementNoticeView(noticeId: string) {
  const docRef = doc(db, NOTICES_COLLECTION, noticeId);
  await updateDoc(docRef, { viewCount: increment(1) });
}

// 공지 읽음 처리
export async function markNoticeAsRead(noticeId: string, userId: string) {
  const docRef = doc(db, NOTICES_COLLECTION, noticeId);
  await updateDoc(docRef, { [`readBy.${userId}`]: true });
}

// 공지 수정
export async function updateNotice(
  noticeId: string,
  update: Partial<Omit<Notice, 'noticeId' | 'createdBy' | 'createdAt' | 'viewCount'>>
) {
  const docRef = doc(db, NOTICES_COLLECTION, noticeId);
  const updateData: any = { updatedAt: Date.now() };
  if (update.title !== undefined) updateData.title = update.title;
  if (update.category !== undefined) updateData.category = update.category;
  if (update.content !== undefined) updateData.content = update.content;
  if (update.notificationType !== undefined) updateData.notificationType = update.notificationType;
  if (update.hidden !== undefined) updateData.hidden = update.hidden;

  console.log('updateNotice(setDoc) 호출:', noticeId, updateData); // 디버깅용
  try {
    await setDoc(docRef, updateData, { merge: true });
    console.log('setDoc(merge) 성공');
  } catch (e) {
    console.error('setDoc(merge) 실패', e);
  }
}

// 공지 삭제 (soft delete)
export async function deleteNotice(noticeId: string) {
  const docRef = doc(db, NOTICES_COLLECTION, noticeId);
  await updateDoc(docRef, { deleted: true, updatedAt: Date.now() });
} 