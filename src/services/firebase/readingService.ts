import { collection, doc, getDocs, getDoc, setDoc, updateDoc, deleteDoc, query, orderBy, where, collectionGroup } from 'firebase/firestore';
import { Reading as BaseReading, SharedReadingV2 } from '../../types';
import { db } from '../../config/firebase';

export type Reading = BaseReading;

// 내 리딩 목록 불러오기 (최신순)
export async function getReadings(userId: string): Promise<Reading[]> {
  const q = query(collection(db, 'users', userId, 'readings'), orderBy('updatedAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => d.data() as Reading);
}

// 특정 리딩 상세 불러오기
export async function getReading(userId: string, readingId: string): Promise<Reading | null> {
  const ref = doc(db, 'users', userId, 'readings', readingId);
  const snap = await getDoc(ref);
  return snap.exists() ? (snap.data() as Reading) : null;
}

// 리딩 추가
export async function addReading(userId: string, reading: Reading) {
  const ref = doc(db, 'users', userId, 'readings', reading.readingId);
  await setDoc(ref, reading);
}

// 리딩 수정
export async function updateReading(userId: string, readingId: string, data: Partial<Reading>) {
  const ref = doc(db, 'users', userId, 'readings', readingId);
  await updateDoc(ref, data);
}

// 리딩 삭제
export async function deleteReading(userId: string, readingId: string) {
  const ref = doc(db, 'users', userId, 'readings', readingId);
  await deleteDoc(ref);
}

// 공유 리딩 불러오기
export async function getSharedReading(sharedReadingId: string): Promise<SharedReadingV2 | null> {
  const ref = doc(db, 'sharedReadings', sharedReadingId);
  const snap = await getDoc(ref);
  return snap.exists() ? (snap.data() as SharedReadingV2) : null;
}

// 공유 리딩 추가/수정
export async function setSharedReading(sharedReading: SharedReadingV2) {
  const ref = doc(db, 'sharedReadings', sharedReading.sharedReadingId);
  await setDoc(ref, sharedReading);
}

// 공유 리딩 V2 불러오기
export async function getSharedReadingV2(sharedReadingId: string): Promise<SharedReadingV2 | null> {
  const ref = doc(db, 'sharedReadingsV2', sharedReadingId);
  const snap = await getDoc(ref);
  return snap.exists() ? (snap.data() as SharedReadingV2) : null;
}

// 공유 리딩 V2 추가/수정
export async function setSharedReadingV2(sharedReading: SharedReadingV2) {
  const ref = doc(db, 'sharedReadingsV2', sharedReading.sharedReadingId);
  await setDoc(ref, sharedReading);
}

// 모든 리딩 가져오기 (관리자용)
export async function getAllReadings(): Promise<Reading[]> {
  const readingsRef = collectionGroup(db, 'readings');
  const q = query(readingsRef, orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => d.data() as Reading);
} 