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
  deleteDoc,
  QueryConstraint 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { TarotCard } from '../../types';

// 모든 카드 가져오기
export const getAllCards = async (): Promise<TarotCard[]> => {
  const cardsRef = collection(db, 'cards');
  const q = query(cardsRef, orderBy('name', 'asc'));
  const snapshot = await getDocs(q);
  
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as TarotCard));
};

// 카드 상세 정보 가져오기
export const getCardDetails = async (cardId: string): Promise<TarotCard> => {
  const cardRef = doc(db, 'cards', cardId);
  const cardDoc = await getDoc(cardRef);
  
  if (!cardDoc.exists()) {
    throw new Error('Card not found');
  }

  return {
    id: cardDoc.id,
    ...cardDoc.data()
  } as TarotCard;
};

// 카드 이미지 업로드
export const uploadCardImage = async (file: File): Promise<string> => {
  const storageRef = ref(storage, `cards/${Date.now()}_${file.name}`);
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

// 새 카드 생성
export const createCard = async (card: Omit<TarotCard, 'id' | 'createdAt' | 'updatedAt'>, adminId?: string): Promise<string> => {
  const cardsRef = collection(db, 'cards');
  const now = Date.now();
  const docRef = await addDoc(cardsRef, {
    ...card,
    createdAt: now,
    updatedAt: now
  });
  if (adminId) await logAdminAction(adminId, 'createCard', { cardId: docRef.id, ...card });
  return docRef.id;
};

// 카드 정보 업데이트
export const updateCard = async (cardId: string, updates: Partial<TarotCard>, adminId?: string) => {
  const cardRef = doc(db, 'cards', cardId);
  await updateDoc(cardRef, {
    ...updates,
    updatedAt: Date.now()
  });
  if (adminId) await logAdminAction(adminId, 'updateCard', { cardId, updates });
};

// 카드 삭제
export const deleteCard = async (cardId: string, adminId?: string) => {
  const card = await getCardDetails(cardId);
  
  // 이미지가 있다면 스토리지에서도 삭제
  if (card.imageUrl) {
    try {
      const imageRef = ref(storage, card.imageUrl);
      await deleteObject(imageRef);
    } catch (error) {
      console.error('Failed to delete card image:', error);
    }
  }
  
  // Firestore에서 카드 문서 삭제
  const cardRef = doc(db, 'cards', cardId);
  await deleteDoc(cardRef);
  if (adminId) await logAdminAction(adminId, 'deleteCard', { cardId });
};

// 카드 검색
export const searchCards = async (searchTerm: string): Promise<TarotCard[]> => {
  const cardsRef = collection(db, 'cards');
  const q = query(
    cardsRef,
    where('name', '>=', searchTerm),
    where('name', '<=', searchTerm + '\uf8ff'),
    orderBy('name')
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as TarotCard));
}; 