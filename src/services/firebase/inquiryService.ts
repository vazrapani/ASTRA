import { db } from '../../config/firebase';
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
  QueryConstraint,
  arrayUnion
} from 'firebase/firestore';
import { Inquiry } from '../../types';

// 문의 목록 가져오기
export const getInquiries = async (status?: 'pending' | 'in_progress' | 'resolved'): Promise<Inquiry[]> => {
  const inquiriesRef = collection(db, 'inquiries');
  const constraints: QueryConstraint[] = [orderBy('createdAt', 'desc')];
  
  if (status) {
    constraints.push(where('status', '==', status));
  }

  const q = query(inquiriesRef, ...constraints);
  const snapshot = await getDocs(q);
  
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Inquiry));
};

// 문의 상세 정보 가져오기
export const getInquiryDetails = async (inquiryId: string): Promise<Inquiry> => {
  const inquiryRef = doc(db, 'inquiries', inquiryId);
  const inquiryDoc = await getDoc(inquiryRef);
  
  if (!inquiryDoc.exists()) {
    throw new Error('Inquiry not found');
  }

  return {
    id: inquiryDoc.id,
    ...inquiryDoc.data()
  } as Inquiry;
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

// 문의 상태 업데이트
export const updateInquiryStatus = async (inquiryId: string, status: 'pending' | 'in_progress' | 'resolved', adminId?: string) => {
  const inquiryRef = doc(db, 'inquiries', inquiryId);
  await updateDoc(inquiryRef, { 
    status,
    updatedAt: Date.now()
  });
  if (adminId) await logAdminAction(adminId, 'updateInquiryStatus', { inquiryId, status });
};

// 문의 답변 추가
export const addInquiryResponse = async (inquiryId: string, adminId: string, content: string, userId?: string) => {
  const inquiryRef = doc(db, 'inquiries', inquiryId);
  const now = Date.now();
  await updateDoc(inquiryRef, {
    responses: arrayUnion({
      adminId,
      content,
      createdAt: now
    }),
    status: 'resolved',
    updatedAt: now
  });
  await logAdminAction(adminId, 'addInquiryResponse', { inquiryId, content });
  // 사용자 알림 추가
  if (userId) {
    await addDoc(collection(db, 'notifications'), {
      userId,
      type: 'inquiry_reply',
      inquiryId,
      content,
      createdAt: now,
      read: false
    });
  }
};

// 문의 답변 전송 (이전 버전과의 호환성을 위해 유지)
export const sendInquiryReply = async (inquiryId: string, adminId: string, content: string) => {
  return addInquiryResponse(inquiryId, adminId, content);
};

// 새 문의 생성
export const createInquiry = async (userId: string, title: string, content: string, category: string): Promise<string> => {
  const inquiriesRef = collection(db, 'inquiries');
  const now = Date.now();
  
  const docRef = await addDoc(inquiriesRef, {
    userId,
    title,
    content,
    category,
    status: 'pending',
    createdAt: now,
    updatedAt: now
  });

  return docRef.id;
}; 