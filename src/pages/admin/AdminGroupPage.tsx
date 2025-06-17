import React, { useEffect, useState } from 'react';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel, IonButton, IonInput, IonModal, IonText } from '@ionic/react';
import { Group } from '../../types/group';
import { getGroupList, createGroup, updateGroupName, deleteGroup, getGroupById, addUserToGroup, removeUserFromGroup } from '../../services/firebase/groupService';
import { getAllUsers } from '../../services/firebase/userService';
import styles from './AdminGroupPage.module.css';

const AdminGroupPage: React.FC = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [editGroup, setEditGroup] = useState<Group | null>(null);
  const [editName, setEditName] = useState('');
  const [showDetail, setShowDetail] = useState(false);
  const [detailGroup, setDetailGroup] = useState<Group | null>(null);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [userToAdd, setUserToAdd] = useState('');

  useEffect(() => {
    fetchGroups();
    fetchUsers();
  }, []);

  const fetchGroups = async () => {
    const list = await getGroupList();
    setGroups(list);
  };
  const fetchUsers = async () => {
    const users = await getAllUsers();
    setAllUsers(users);
  };

  const handleCreate = async () => {
    if (!newGroupName.trim()) return;
    await createGroup(newGroupName.trim());
    setShowCreate(false);
    setNewGroupName('');
    fetchGroups();
  };
  const handleEditName = async () => {
    if (!editGroup || !editName.trim()) return;
    await updateGroupName(editGroup.id, editName.trim());
    setEditGroup(null);
    setEditName('');
    fetchGroups();
  };
  const handleDelete = async (groupId: string) => {
    await deleteGroup(groupId);
    fetchGroups();
  };
  const openDetail = async (group: Group) => {
    const g = await getGroupById(group.id);
    setDetailGroup(g);
    setShowDetail(true);
  };
  const handleAddUser = async () => {
    if (!detailGroup || !userToAdd) return;
    await addUserToGroup(detailGroup.id, userToAdd);
    const g = await getGroupById(detailGroup.id);
    setDetailGroup(g);
    setUserToAdd('');
    fetchGroups();
  };
  const handleRemoveUser = async (userId: string) => {
    if (!detailGroup) return;
    await removeUserFromGroup(detailGroup.id, userId);
    const g = await getGroupById(detailGroup.id);
    setDetailGroup(g);
    fetchGroups();
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>그룹 관리</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonButton expand="block" onClick={() => setShowCreate(true)} className={styles.marginBottom16}>그룹 생성</IonButton>
        <IonList>
          {groups.map(g => (
            <IonItem key={g.id}>
              <IonLabel>
                <b>{g.name}</b> <IonText color="medium">({g.userIds.length}명)</IonText>
              </IonLabel>
              <IonButton size="small" onClick={() => { setEditGroup(g); setEditName(g.name); }}>이름수정</IonButton>
              <IonButton size="small" color="danger" onClick={() => handleDelete(g.id)}>삭제</IonButton>
              <IonButton size="small" onClick={() => openDetail(g)}>상세</IonButton>
            </IonItem>
          ))}
        </IonList>

        {/* 그룹 생성 모달 */}
        <IonModal isOpen={showCreate} onDidDismiss={() => setShowCreate(false)}>
          <IonHeader><IonToolbar><IonTitle>그룹 생성</IonTitle></IonToolbar></IonHeader>
          <IonContent className="ion-padding">
            <IonInput label="그룹명" value={newGroupName} onIonChange={e => setNewGroupName(e.detail.value!)} />
            <IonButton expand="block" onClick={handleCreate} className={styles.marginTop16}>생성</IonButton>
            <IonButton expand="block" color="medium" onClick={() => setShowCreate(false)} className={styles.marginTop8}>취소</IonButton>
          </IonContent>
        </IonModal>

        {/* 그룹 이름 수정 모달 */}
        <IonModal isOpen={!!editGroup} onDidDismiss={() => setEditGroup(null)}>
          <IonHeader><IonToolbar><IonTitle>그룹 이름 수정</IonTitle></IonToolbar></IonHeader>
          <IonContent className="ion-padding">
            <IonInput label="그룹명" value={editName} onIonChange={e => setEditName(e.detail.value!)} />
            <IonButton expand="block" onClick={handleEditName} className={styles.marginTop16}>수정</IonButton>
            <IonButton expand="block" color="medium" onClick={() => setEditGroup(null)} className={styles.marginTop8}>취소</IonButton>
          </IonContent>
        </IonModal>

        {/* 그룹 상세(사용자 관리) 모달 */}
        <IonModal isOpen={showDetail} onDidDismiss={() => setShowDetail(false)}>
          <IonHeader><IonToolbar><IonTitle>그룹 상세</IonTitle></IonToolbar></IonHeader>
          <IonContent className="ion-padding">
            {detailGroup && (
              <>
                <h2>{detailGroup.name}</h2>
                <div className={styles.marginBottom8}>인원: {detailGroup.userIds.length}명</div>
                <IonList>
                  {detailGroup.userIds.map(uid => {
                    const user = allUsers.find(u => u.id === uid);
                    return (
                      <IonItem key={uid}>
                        <IonLabel>{user ? user.name : uid}</IonLabel>
                        <IonButton size="small" color="danger" onClick={() => handleRemoveUser(uid)}>제거</IonButton>
                      </IonItem>
                    );
                  })}
                </IonList>
                <IonInput label="사용자 ID" value={userToAdd} onIonChange={e => setUserToAdd(e.detail.value!)} placeholder="추가할 사용자 ID" />
                <IonButton expand="block" onClick={handleAddUser} className={styles.marginTop8}>사용자 추가</IonButton>
                <IonButton expand="block" color="medium" onClick={() => setShowDetail(false)} className={styles.marginTop16}>닫기</IonButton>
              </>
            )}
          </IonContent>
        </IonModal>
      </IonContent>
    </IonPage>
  );
};

export default AdminGroupPage; 