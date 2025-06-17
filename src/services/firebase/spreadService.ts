import { db, storage } from '../../config/firebase';
import { 
  collection, 
  getDocs, 
  doc, 
  updateDoc, 
  getDoc, 
  orderBy, 
  query, 
  where, 
  addDoc, 
  deleteDoc 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { TarotSpread } from '../../types';

// 모든 스프레드 가져오기
export const getAllSpreads = async (): Promise<TarotSpread[]> => {
  const spreadsRef = collection(db, 'spreads');
  const q = query(spreadsRef, orderBy('name', 'asc'));
  const snapshot = await getDocs(q);
  
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as TarotSpread));
};

// 활성화된 스프레드만 가져오기
export const getActiveSpreads = async (): Promise<TarotSpread[]> => {
  const spreadsRef = collection(db, 'spreads');
  const q = query(
    spreadsRef,
    where('isActive', '==', true),
    orderBy('name', 'asc')
  );
  const snapshot = await getDocs(q);
  
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as TarotSpread));
};

// 스프레드 상세 정보 가져오기
export const getSpreadDetails = async (spreadId: string): Promise<TarotSpread> => {
  const spreadRef = doc(db, 'spreads', spreadId);
  const spreadDoc = await getDoc(spreadRef);
  
  if (!spreadDoc.exists()) {
    throw new Error('Spread not found');
  }

  return {
    id: spreadDoc.id,
    ...spreadDoc.data()
  } as TarotSpread;
};

// 스프레드 이미지 업로드
export const uploadSpreadImage = async (file: File): Promise<string> => {
  const storageRef = ref(storage, `spreads/${Date.now()}_${file.name}`);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
};

// 관리자 활동 로그 기록 함수
const logAdminAction = async (adminId: string, action: string, target: any) => {
  await addDoc(collection(db, 'admin_logs'), {
    adminId,
    action,
    target,
    timestamp: Date.now(),
  });
};

// 새 스프레드 생성
export const createSpread = async (spread: Omit<TarotSpread, 'id' | 'createdAt' | 'updatedAt'>, adminId?: string): Promise<string> => {
  const spreadsRef = collection(db, 'spreads');
  const now = Date.now();
  const docRef = await addDoc(spreadsRef, {
    ...spread,
    createdAt: now,
    updatedAt: now
  });
  if (adminId) await logAdminAction(adminId, 'createSpread', { spreadId: docRef.id, ...spread });
  return docRef.id;
};

// 스프레드 정보 업데이트
export const updateSpread = async (spreadId: string, updates: Partial<TarotSpread>, adminId?: string) => {
  const spreadRef = doc(db, 'spreads', spreadId);
  await updateDoc(spreadRef, {
    ...updates,
    updatedAt: Date.now()
  });
  if (adminId) await logAdminAction(adminId, 'updateSpread', { spreadId, updates });
};

// 스프레드 삭제
export const deleteSpread = async (spreadId: string, adminId?: string) => {
  const spread = await getSpreadDetails(spreadId);
  
  // 이미지가 있다면 스토리지에서도 삭제
  if (spread.imageUrl) {
    try {
      const imageRef = ref(storage, spread.imageUrl);
      await deleteObject(imageRef);
    } catch (error) {
      console.error('Failed to delete spread image:', error);
    }
  }
  
  // Firestore에서 스프레드 문서 삭제
  const spreadRef = doc(db, 'spreads', spreadId);
  await deleteDoc(spreadRef);
  if (adminId) await logAdminAction(adminId, 'deleteSpread', { spreadId });
};

// 스프레드 검색
export const searchSpreads = async (searchTerm: string): Promise<TarotSpread[]> => {
  const spreadsRef = collection(db, 'spreads');
  const q = query(
    spreadsRef,
    where('name', '>=', searchTerm),
    where('name', '<=', searchTerm + '\uf8ff'),
    orderBy('name')
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as TarotSpread));
}; 