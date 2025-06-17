import { db } from '../../config/firebase';
import { collection, getDocs, doc, updateDoc, getDoc, orderBy, query, where, limit, startAfter, QueryConstraint, addDoc, setDoc, deleteDoc, Timestamp } from 'firebase/firestore';
import { User as BaseUser } from '../../types';
import { deleteUser } from 'firebase/auth';
import { tarotCards, getRandomCard } from '../../utils/tarotCards';

export type User = BaseUser;

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  newUsersToday: number;
  premiumUsers: number;
}

export interface UserFilters {
  role?: 'user' | 'admin';
  status?: 'active' | 'inactive';
  searchTerm?: string;
  dateRange?: { start: string, end: string };
}

// 모든 사용자 가져오기 (관리자용)
export const getAllUsers = async (): Promise<User[]> => {
  const usersRef = collection(db, 'users');
  const q = query(usersRef, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as User));
};

// 사용자 목록 가져오기 (페이지네이션)
export const getUsers = async (
  pageSize: number = 20,
  lastUser: User | null | undefined,
  filters?: UserFilters
): Promise<User[]> => {
  const usersRef = collection(db, 'users');
  const constraints: QueryConstraint[] = [orderBy('createdAt', 'desc'), limit(pageSize)];

  // 필터 적용
  if (filters?.role) {
    constraints.push(where('role', '==', filters.role));
  }
  if (filters?.status) {
    constraints.push(where('status', '==', filters.status));
  }
  
  // 마지막 문서 이후부터 조회
  if (lastUser) {
    constraints.push(startAfter(lastUser.createdAt));
  }

  const q = query(usersRef, ...constraints);
  const snapshot = await getDocs(q);
  
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as User));
};

// 사용자 상세 정보 가져오기
export const getUserDetails = async (userId: string): Promise<User> => {
  const userRef = doc(db, 'users', userId);
  const userDoc = await getDoc(userRef);
  
  if (!userDoc.exists()) {
    throw new Error('User not found');
  }

  return {
    id: userDoc.id,
    ...userDoc.data()
  } as User;
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

// 사용자 권한 업데이트
export const updateUserRole = async (userId: string, role: 'user' | 'admin', adminId?: string) => {
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, { role });
  if (adminId) await logAdminAction(adminId, 'updateUserRole', { userId, role });
};

// 사용자 상태 업데이트
export const updateUserStatus = async (userId: string, status: 'active' | 'inactive', adminId?: string) => {
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, { status });
  if (adminId) await logAdminAction(adminId, 'updateUserStatus', { userId, status });
};

// 사용자 통계 가져오기
export const getUserStats = async (): Promise<UserStats> => {
  const usersRef = collection(db, 'users');
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [totalUsers, activeUsers, newUsers, premiumUsers] = await Promise.all([
    getDocs(query(usersRef)).then(snap => snap.size),
    getDocs(query(usersRef, where('status', '==', 'active'))).then(snap => snap.size),
    getDocs(query(usersRef, where('createdAt', '>=', today.getTime()))).then(snap => snap.size),
    getDocs(query(usersRef, where('isPremium', '==', true))).then(snap => snap.size),
  ]);

  return {
    totalUsers,
    activeUsers,
    newUsersToday: newUsers,
    premiumUsers,
  };
};

// 관리자에 의한 사용자 삭제(강제 탈퇴)
export const deleteUserAdmin = async (userId: string, adminId?: string) => {
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, { status: 'deleted' }); // 실제 삭제 대신 상태 변경(복구 가능성 고려)
  if (adminId) {
    try {
      await logAdminAction(adminId, 'deleteUser', { userId });
    } catch (e) {
      // 로그 기록 실패 시 무시
    }
  }
};

// 이메일로 사용자 단건 검색
export const getUserByEmail = async (email: string): Promise<User | null> => {
  const usersRef = collection(db, 'users');
  const q = query(usersRef, where('email', '==', email));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  const docSnap = snapshot.docs[0];
  return { id: docSnap.id, ...docSnap.data() } as User;
};

// 친구 추가 요청 보내기
export const sendFriendRequest = async (fromUserId: string, toUserId: string) => {
  const friendRequestsRef = collection(db, 'friendRequests');
  await addDoc(friendRequestsRef, {
    from: fromUserId,
    to: toUserId,
    status: 'pending',
    createdAt: Date.now(),
  });
};

// 알림 전송 (Firestore notifications 컬렉션에 추가)
export const sendNotification = async (userId: string, type: string, message: string) => {
  const notificationsRef = collection(db, 'notifications');
  await addDoc(notificationsRef, {
    userId,
    type,
    message,
    read: false,
    createdAt: Date.now(),
  });
};

// 친구 관계 추가 (양방향)
export const addFriendRelation = async (fromUserId: string, toUserId: string) => {
  const fromRef = doc(db, 'users', fromUserId, 'friends', toUserId);
  const toRef = doc(db, 'users', toUserId, 'friends', fromUserId);
  await setDoc(fromRef, { userId: toUserId, createdAt: Date.now() });
  await setDoc(toRef, { userId: fromUserId, createdAt: Date.now() });
};

// 친구 요청 수락
export const acceptFriendRequest = async (requestId: string) => {
  const reqRef = doc(db, 'friendRequests', requestId);
  const reqSnap = await getDoc(reqRef);
  if (!reqSnap.exists()) throw new Error('요청이 존재하지 않습니다.');
  const req = reqSnap.data();
  await updateDoc(reqRef, { status: 'accepted' });
  // 친구 관계 동기화
  await addFriendRelation(req.from, req.to);
  // 요청자에게 알림 전송
  await sendNotification(req.from, 'friend_accept', '상대방이 친구 요청을 수락했습니다.');
};

// 받은 친구 요청 목록
export const getReceivedFriendRequests = async (userId: string) => {
  const ref = collection(db, 'friendRequests');
  const q = query(ref, where('to', '==', userId), where('status', '==', 'pending'));
  const snap = await getDocs(q);
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// 보낸 친구 요청 목록
export const getSentFriendRequests = async (userId: string) => {
  const ref = collection(db, 'friendRequests');
  const q = query(ref, where('from', '==', userId), where('status', '==', 'pending'));
  const snap = await getDocs(q);
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// 회원 탈퇴(아카이빙 및 연관 데이터 정리)
export const withdrawAndArchiveUser = async (userId: string, authUser: any) => {
  // 1. users/{userId} 데이터 읽기
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);
  if (!userSnap.exists()) throw new Error('User not found');
  const userData = userSnap.data();

  // 2. deletedUsers/{userId}로 복사 (가입일/탈퇴일 모두 보존, 중복 탈퇴 시 덮어쓰기)
  const deletedUserRef = doc(db, 'deletedUsers', userId);
  const deletedUserSnap = await getDoc(deletedUserRef);
  const createdAt = userData.createdAt || (deletedUserSnap.exists() ? deletedUserSnap.data().createdAt : Date.now());
  await setDoc(deletedUserRef, { ...userData, createdAt, deletedAt: Date.now() });

  // 3. users/{userId}/friends 서브컬렉션 삭제
  const friendsCol = collection(db, 'users', userId, 'friends');
  const friendsSnap = await getDocs(friendsCol);
  for (const friendDoc of friendsSnap.docs) {
    // 친구의 friends 서브컬렉션에서도 해당 userId 삭제
    const friendId = friendDoc.data().userId;
    await deleteDoc(doc(db, 'users', friendId, 'friends', userId));
    await deleteDoc(friendDoc.ref);
  }

  // 4. friendRequests 컬렉션에서 from/to가 userId인 문서 삭제
  const friendReqCol = collection(db, 'friendRequests');
  const reqSnap = await getDocs(friendReqCol);
  for (const reqDoc of reqSnap.docs) {
    const req = reqDoc.data();
    if (req.from === userId || req.to === userId) {
      await deleteDoc(reqDoc.ref);
    }
  }

  // 5. users/{userId} 문서 삭제
  await deleteDoc(userRef);

  // 6. Firebase Auth 계정 삭제
  if (authUser) {
    await deleteUser(authUser);
  }
};

// 탈퇴한 사용자 목록 가져오기
export const getDeletedUsers = async (): Promise<User[]> => {
  const deletedUsersRef = collection(db, 'deletedUsers');
  const q = query(deletedUsersRef, orderBy('deletedAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
};

interface DailyTarotResult {
  card: {
    name: string;
    meaning: string;
  };
  date: Timestamp;
}

export const getDailyTarotResult = async (userId: string): Promise<DailyTarotResult | null> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) return null;

    const data = userDoc.data();
    if (!data.lastDailyTarot) return null;

    // 오늘 날짜와 비교
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const lastDate = data.lastDailyTarot.date.toDate();
    lastDate.setHours(0, 0, 0, 0);

    if (lastDate.getTime() !== today.getTime()) {
      return null;
    }

    return data.lastDailyTarot;
  } catch (error) {
    console.error('Error getting daily tarot result:', error);
    throw error;
  }
};

export const setDailyTarotResult = async (userId: string): Promise<DailyTarotResult> => {
  try {
    const card = getRandomCard();
    const result: DailyTarotResult = {
      card: {
        name: card.name,
        meaning: card.meaning
      },
      date: Timestamp.now()
    };

    await updateDoc(doc(db, 'users', userId), {
      lastDailyTarot: result
    });

    return result;
  } catch (error) {
    console.error('Error setting daily tarot result:', error);
    throw error;
  }
}; 