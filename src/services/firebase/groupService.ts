import { db } from '../../config/firebase';
import { collection, addDoc, doc, updateDoc, deleteDoc, getDocs, getDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { Group } from '../../types/group';

const GROUPS_COLLECTION = 'groups';

// 그룹 생성
export async function createGroup(name: string) {
  const docRef = await addDoc(collection(db, GROUPS_COLLECTION), {
    name,
    userIds: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });
  return docRef.id;
}

// 그룹 이름 수정
export async function updateGroupName(groupId: string, name: string) {
  const docRef = doc(db, GROUPS_COLLECTION, groupId);
  await updateDoc(docRef, { name, updatedAt: Date.now() });
}

// 그룹 삭제
export async function deleteGroup(groupId: string) {
  const docRef = doc(db, GROUPS_COLLECTION, groupId);
  await deleteDoc(docRef);
}

// 그룹 리스트 조회
export async function getGroupList() {
  const snapshot = await getDocs(collection(db, GROUPS_COLLECTION));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Group[];
}

// 그룹 상세 조회
export async function getGroupById(groupId: string) {
  const docRef = doc(db, GROUPS_COLLECTION, groupId);
  const snapshot = await getDoc(docRef);
  if (!snapshot.exists()) return null;
  return { id: snapshot.id, ...snapshot.data() } as Group;
}

// 그룹에 사용자 추가
export async function addUserToGroup(groupId: string, userId: string) {
  const docRef = doc(db, GROUPS_COLLECTION, groupId);
  await updateDoc(docRef, { userIds: arrayUnion(userId), updatedAt: Date.now() });
}

// 그룹에서 사용자 제거
export async function removeUserFromGroup(groupId: string, userId: string) {
  const docRef = doc(db, GROUPS_COLLECTION, groupId);
  await updateDoc(docRef, { userIds: arrayRemove(userId), updatedAt: Date.now() });
} 