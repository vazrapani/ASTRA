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

// 별점 저장 (1~5점)
export async function setReadingRating(readingId: string, userId: string, rating: number) {
  const ref = doc(db, 'readings', readingId, 'ratings', userId);
  await setDoc(ref, {
    userId,
    rating,
    createdAt: Date.now(),
  });
}

// 별점 전체 조회 (평균/개수 계산용)
export async function getReadingRatings(readingId: string): Promise<{ ratings: number[]; avg: number; count: number; userRatings: { [userId: string]: number } }> {
  const col = collection(db, 'readings', readingId, 'ratings');
  const snap = await getDocs(col);
  const ratings: number[] = [];
  const userRatings: { [userId: string]: number } = {};
  snap.forEach(doc => {
    const data = doc.data();
    if (typeof data.rating === 'number') {
      ratings.push(data.rating);
      userRatings[data.userId] = data.rating;
    }
  });
  const count = ratings.length;
  const avg = count > 0 ? ratings.reduce((a, b) => a + b, 0) / count : 0;
  return { ratings, avg, count, userRatings };
} 