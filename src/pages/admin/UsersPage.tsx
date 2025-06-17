import React, { useEffect, useState } from 'react';
import {
  IonPage,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonButton,
  IonIcon,
  IonSelect,
  IonSelectOption,
  IonSearchbar,
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardContent,
  IonModal,
  IonText,
  IonSpinner,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  useIonToast,
  IonBadge,
  IonInput,
  IonAlert,
  IonHeader,
  IonToolbar,
  IonTitle,
} from '@ionic/react';
import { personCircle, statsChart, key, ban } from 'ionicons/icons';
import { getUsers, getUserStats, updateUserRole, updateUserStatus, UserStats, UserFilters, deleteUserAdmin, getDeletedUsers } from '../../services/firebase/userService';
import { getReadings } from '../../services/firebase/readingService';
import { User } from '../../types';
import CommonHeader from '../../components/CommonHeader';
import styles from './UsersPage.module.css';
import { deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { getGroupList, createGroup, updateGroupName, deleteGroup, getGroupById, addUserToGroup, removeUserFromGroup } from '../../services/firebase/groupService';
import { useHistory } from 'react-router-dom';
import UserCard from '../../components/UserCard';

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<UserFilters>({});
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [lastUser, setLastUser] = useState<User | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [presentToast] = useIonToast();
  const [userReadingCount, setUserReadingCount] = useState<number | null>(null);
  const [userRecentReadings, setUserRecentReadings] = useState<any[]>([]);
  const [actionLoading, setActionLoading] = useState(false);
  const user = useSelector((state: RootState) => state.auth.user);
  const [dateRange, setDateRange] = useState<{start: string, end: string}>({start: '', end: ''});
  const [showRoleAlert, setShowRoleAlert] = useState(false);
  const [showStatusAlert, setShowStatusAlert] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [pendingAction, setPendingAction] = useState<'role'|'status'|'delete'|null>(null);
  const [pendingUser, setPendingUser] = useState<User|null>(null);
  const [tab, setTab] = useState<'users'|'deleted'|'groups'>('users');
  const [groups, setGroups] = useState<any[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [editGroup, setEditGroup] = useState<any | null>(null);
  const [editName, setEditName] = useState('');
  const [showDetail, setShowDetail] = useState(false);
  const [detailGroup, setDetailGroup] = useState<any | null>(null);
  const [userToAdd, setUserToAdd] = useState('');
  const [allGroups, setAllGroups] = useState<any[]>([]);
  const [groupToAdd, setGroupToAdd] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [showBatchGroupModal, setShowBatchGroupModal] = useState(false);
  const [batchGroupId, setBatchGroupId] = useState('');
  const [showSearchOptions, setShowSearchOptions] = useState(false);
  const history = useHistory();
  const [deletedUsers, setDeletedUsers] = useState<User[]>([]);
  const [loadingDeleted, setLoadingDeleted] = useState(false);
  const [showResetDailyTarotAlert, setShowResetDailyTarotAlert] = useState(false);

  // 사용자 목록 로드
  const loadUsers = async (refresh = false) => {
    try {
      const newUsers = await getUsers(20, refresh ? null : lastUser, {...filters, dateRange});
      if (refresh) {
        setUsers(newUsers);
      } else {
        setUsers([...users, ...newUsers]);
      }
      setLastUser(newUsers[newUsers.length - 1]);
      setHasMore(newUsers.length === 20);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load users:', error);
      presentToast({
        message: '사용자 목록을 불러오는데 실패했습니다.',
        duration: 3000,
        color: 'danger',
      });
    }
  };

  // 통계 로드
  const loadStats = async () => {
    try {
      const stats = await getUserStats();
      setStats(stats);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  useEffect(() => {
    loadUsers(true);
    loadStats();
    fetchAllGroups();
  }, [filters]);

  useEffect(() => {
    if(tab==='groups') fetchGroups();
    if(tab==='deleted') {
      setLoadingDeleted(true);
      getDeletedUsers().then(setDeletedUsers).finally(() => setLoadingDeleted(false));
    }
  }, [tab]);

  const fetchGroups = async () => {
    const list = await getGroupList();
    setGroups(list);
  };

  const fetchAllGroups = async () => {
    const list = await getGroupList();
    setAllGroups(list);
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

  const openDetail = async (group: any) => {
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

  // 권한 변경
  const handleRoleChange = async (userId: string, newRole: 'user' | 'admin') => {
    setActionLoading(true);
    try {
      await updateUserRole(userId, newRole, user?.id);
      setUsers(users.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ));
      presentToast({
        message: '사용자 권한이 변경되었습니다.',
        duration: 2000,
        color: 'success',
      });
    } catch (error) {
      presentToast({
        message: '권한 변경에 실패했습니다.',
        duration: 3000,
        color: 'danger',
      });
    } finally {
      setActionLoading(false);
      setShowRoleAlert(false);
    }
  };

  // 상태 변경
  const handleStatusChange = async (userId: string, newStatus: 'active' | 'inactive') => {
    setActionLoading(true);
    try {
      await updateUserStatus(userId, newStatus, user?.id);
      setUsers(users.map(user => 
        user.id === userId ? { ...user, status: newStatus } : user
      ));
      presentToast({
        message: '사용자 상태가 변경되었습니다.',
        duration: 2000,
        color: 'success',
      });
    } catch (error) {
      presentToast({
        message: '상태 변경에 실패했습니다.',
        duration: 3000,
        color: 'danger',
      });
    } finally {
      setActionLoading(false);
      setShowStatusAlert(false);
    }
  };

  // 무한 스크롤
  const loadMore = async (e: CustomEvent<void>) => {
    await loadUsers();
    (e.target as HTMLIonInfiniteScrollElement).complete();
  };

  // 사용자 상세 정보 및 리딩 수 로딩
  const handleUserClick = async (user: User) => {
    setSelectedUser(user);
    setShowUserModal(true);
    setUserReadingCount(null);
    setUserRecentReadings([]);
    try {
      const readings = await getReadings(user.id);
      setUserReadingCount(readings.length);
      setUserRecentReadings(readings.sort((a, b) => b.createdAt - a.createdAt).slice(0, 5));
    } catch (e) {
      setUserReadingCount(-1);
      setUserRecentReadings([]);
    }
  };

  // 강제 탈퇴(삭제)
  const handleDeleteUser = async (userId: string) => {
    setActionLoading(true);
    try {
      await deleteUserAdmin(userId, user?.id);
      setUsers(users.filter(user => user.id !== userId));
      presentToast({
        message: '사용자가 삭제되었습니다.',
        duration: 2000,
        color: 'success',
      });
      setShowUserModal(false);
    } catch (error) {
      presentToast({
        message: '사용자 삭제에 실패했습니다.',
        duration: 3000,
        color: 'danger',
      });
    } finally {
      setActionLoading(false);
      setShowDeleteAlert(false);
    }
  };

  // 사용자에 그룹 추가
  const handleAddGroupToUser = async (userId: string, groupId: string) => {
    await addUserToGroup(groupId, userId);
    // 사용자 객체에도 groups 필드 동기화
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, { groups: [...(selectedUser?.groups||[]), groupId] });
    // UI 갱신
    setSelectedUser(su => su ? { ...su, groups: [...(su.groups||[]), groupId] } : su);
    fetchAllGroups();
    loadUsers(true);
  };

  // 사용자에 그룹 제거
  const handleRemoveGroupFromUser = async (userId: string, groupId: string) => {
    await removeUserFromGroup(groupId, userId);
    // 사용자 객체에도 groups 필드 동기화
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, { groups: (selectedUser?.groups||[]).filter((gid:string)=>gid!==groupId) });
    // UI 갱신
    setSelectedUser(su => su ? { ...su, groups: (su.groups||[]).filter((gid:string)=>gid!==groupId) } : su);
    fetchAllGroups();
    loadUsers(true);
  };

  // 체크박스 선택 핸들러
  const handleCheckUser = (userId: string) => {
    setSelectedUserIds(ids => ids.includes(userId) ? ids.filter(id => id !== userId) : [...ids, userId]);
  };
  const handleCheckAll = () => {
    if (selectedUserIds.length === users.length) setSelectedUserIds([]);
    else setSelectedUserIds(users.map(u => u.id));
  };

  // 일괄 그룹 이동
  const handleBatchMoveGroup = async () => {
    if (!batchGroupId) return;
    for (const userId of selectedUserIds) {
      await addUserToGroup(batchGroupId, userId);
      const userRef = doc(db, 'users', userId);
      // 기존 groups에 이미 포함되어 있지 않으면 추가
      const user = users.find(u=>u.id===userId);
      const prevGroups = user?.groups || [];
      if (!prevGroups.includes(batchGroupId)) {
        await updateDoc(userRef, { groups: [...prevGroups, batchGroupId] });
      }
    }
    setShowBatchGroupModal(false);
    setSelectedUserIds([]);
    loadUsers(true);
  };

  // 일괄 정지/해제/권한 부여/해제/탈퇴
  const handleBatchStatus = async (status: 'active' | 'inactive') => {
    for (const userId of selectedUserIds) {
      await updateUserStatus(userId, status);
    }
    setSelectedUserIds([]);
    loadUsers(true);
  };
  const handleBatchRole = async (role: 'user' | 'admin') => {
    for (const userId of selectedUserIds) {
      await updateUserRole(userId, role);
    }
    setSelectedUserIds([]);
    loadUsers(true);
  };
  const handleBatchDelete = async () => {
    for (const userId of selectedUserIds) {
      await deleteUserAdmin(userId);
    }
    setSelectedUserIds([]);
    loadUsers(true);
  };

  return (
    <IonPage>
      <CommonHeader title="사용자 관리" backHref="/admin" />
      <IonContent>
        <div className={styles.flexBetween + ' ' + styles.margin16}>
          <h2 className={styles.h2NoMargin}>사용자 관리</h2>
        </div>
        {/* 탭 전환 버튼 */}
        <div className={styles.flexGap8 + ' ' + styles.margin16}>
          <IonButton expand="block" color={tab==='users'?'primary':'medium'} onClick={()=>setTab('users')}>사용자 목록</IonButton>
          <IonButton expand="block" color={tab==='deleted'?'primary':'medium'} onClick={()=>setTab('deleted')}>탈퇴한 사용자</IonButton>
          <IonButton expand="block" color={tab==='groups'?'primary':'medium'} onClick={()=>setTab('groups')}>그룹 관리</IonButton>
        </div>
        {tab==='users' && (
          <>
            {/* 통계 카드 */}
            {stats && (
              <IonGrid>
                <IonRow>
                  <IonCol size="6">
                    <div className={styles.statsCard}>
                      <div className={styles.statsTitle}>전체 사용자</div>
                      <div className={styles.statsValue}>{stats.totalUsers}</div>
                    </div>
                  </IonCol>
                  <IonCol size="6">
                    <div className={styles.statsCard}>
                      <div className={styles.statsTitle}>활성 사용자</div>
                      <div className={styles.statsValue}>{stats.activeUsers}</div>
                    </div>
                  </IonCol>
                  <IonCol size="6">
                    <div className={styles.statsCard}>
                      <div className={styles.statsTitle}>오늘 신규</div>
                      <div className={styles.statsValue}>{stats.newUsersToday}</div>
                    </div>
                  </IonCol>
                  <IonCol size="6">
                    <div className={styles.statsCard}>
                      <div className={styles.statsTitle}>프리미엄</div>
                      <div className={styles.statsValue}>{stats.premiumUsers}</div>
                    </div>
                  </IonCol>
                </IonRow>
              </IonGrid>
            )}
            {/* 필터/검색창 */}
            <div className={styles.filterSection}>
              <div className={styles.flexGap8 + ' ' + styles.flexRow}>
                <IonSearchbar placeholder="이메일 또는 이름으로 검색" value={filters.searchTerm || ''} onIonInput={e => setFilters(f => ({ ...f, searchTerm: e.detail.value! }))} className={styles.width100} />
                <IonButton size="small" onClick={()=>loadUsers(true)}>검색</IonButton>
                <IonButton size="small" fill="clear" onClick={()=>setShowSearchOptions(o=>!o)}>{showSearchOptions ? '검색 옵션 닫기' : '검색 옵션 열기'}</IonButton>
              </div>
              {showSearchOptions && (
                <div className={styles.marginTop8 + ' ' + styles.flexGap8 + ' ' + styles.flexWrap + ' ' + styles.flexRow}>
                  <IonSelect placeholder="권한" value={filters.role} onIonChange={e=>setFilters(f=>({...f,role:e.detail.value||undefined}))} className={styles.minWidth100}>
                    <IonSelectOption value="">전체</IonSelectOption>
                    <IonSelectOption value="user">일반</IonSelectOption>
                    <IonSelectOption value="admin">운영자</IonSelectOption>
                  </IonSelect>
                  <IonSelect placeholder="상태" value={filters.status} onIonChange={e=>setFilters(f=>({...f,status:e.detail.value||undefined}))} className={styles.minWidth100}>
                    <IonSelectOption value="">전체</IonSelectOption>
                    <IonSelectOption value="active">활성</IonSelectOption>
                    <IonSelectOption value="inactive">정지</IonSelectOption>
                  </IonSelect>
                  <div className={styles.flexGap4}>
                    <span>가입일</span>
                    <input type="date" value={dateRange.start} onChange={e=>setDateRange(d=>({...d,start:e.target.value}))} />
                    <span>~</span>
                    <input type="date" value={dateRange.end} onChange={e=>setDateRange(d=>({...d,end:e.target.value}))} />
                  </div>
                </div>
              )}
            </div>
            {/* 편집 버튼/일괄 작업 바: 검색창 바로 아래, 리스트 바로 위 */}
            <div className={styles.flexRow + ' ' + styles.justifyEnd + ' ' + styles.gap8 + ' ' + styles.margin8_0}>
              <IonButton size="small" onClick={()=>setEditMode(e=>!e)}>{editMode ? '편집 종료' : '편집'}</IonButton>
              {editMode && (
                <IonButton size="small" color="light" onClick={()=>{setEditMode(false);setSelectedUserIds([]);}}>편집 취소</IonButton>
              )}
            </div>
            {editMode && (
              <div className={styles.stickyBar}>
                <IonButton size="small" onClick={handleCheckAll}>{selectedUserIds.length===users.length?'전체 해제':'전체 선택'}</IonButton>
                <span className={styles.fontSize14}>선택: {selectedUserIds.length}명</span>
                <IonButton size="small" color="primary" disabled={selectedUserIds.length===0} onClick={()=>setShowBatchGroupModal(true)}>그룹 이동</IonButton>
                <IonButton size="small" color="medium" disabled={selectedUserIds.length===0} onClick={()=>handleBatchStatus('inactive')}>정지</IonButton>
                <IonButton size="small" color="success" disabled={selectedUserIds.length===0} onClick={()=>handleBatchStatus('active')}>정지 해제</IonButton>
                <IonButton size="small" color="warning" disabled={selectedUserIds.length===0} onClick={()=>handleBatchRole('admin')}>관리자 권한 부여</IonButton>
                <IonButton size="small" color="light" disabled={selectedUserIds.length===0} onClick={()=>handleBatchRole('user')}>관리자 권한 해제</IonButton>
                <IonButton size="small" color="danger" disabled={selectedUserIds.length===0} onClick={handleBatchDelete}>강제 탈퇴</IonButton>
              </div>
            )}
            {/* 일괄 그룹 이동 모달 */}
            <IonModal isOpen={showBatchGroupModal} onDidDismiss={()=>setShowBatchGroupModal(false)}>
              <IonCard className={styles.maxWidth400}>
                <IonCardContent>
                  <h2 className={styles.marginBottom12}>그룹 일괄 이동</h2>
                  <IonSelect placeholder="그룹 선택" value={batchGroupId} onIonChange={e=>setBatchGroupId(e.detail.value!)} className={styles.width100}>
                    {allGroups.map(g=>(
                      <IonSelectOption key={g.id} value={g.id}>{g.name}</IonSelectOption>
                    ))}
                  </IonSelect>
                  <IonButton expand="block" className={styles.marginTop16} onClick={handleBatchMoveGroup} disabled={!batchGroupId}>이동</IonButton>
                  <IonButton expand="block" className={styles.marginTop8} color="light" onClick={()=>setShowBatchGroupModal(false)}>취소</IonButton>
                </IonCardContent>
              </IonCard>
            </IonModal>
            {/* 사용자 리스트 */}
            {loading ? (
              <div className={styles.center40}>
                <IonSpinner name="crescent" />
                <div className={styles.mt12}>사용자 목록을 불러오는 중...</div>
              </div>
            ) : users.length === 0 ? (
              <div className={styles.center40Gray}>사용자가 없습니다.</div>
            ) : (
              <IonList>
                {users.map(user => (
                  <IonItem key={user.id} button={!editMode} onClick={()=>!editMode && handleUserClick(user)}>
                    {editMode && (
                      <input type="checkbox" checked={selectedUserIds.includes(user.id)} onChange={()=>handleCheckUser(user.id)} className={styles.checkbox} />
                    )}
                    <UserCard user={user} />
                  </IonItem>
                ))}
              </IonList>
            )}
            {/* 무한 스크롤 */}
            {hasMore && !loading && (
              <IonInfiniteScroll onIonInfinite={loadMore} threshold="100px">
                <IonInfiniteScrollContent loadingText="더 불러오는 중..." />
              </IonInfiniteScroll>
            )}
            {/* 사용자 상세 모달 */}
            <IonModal isOpen={showUserModal} onDidDismiss={() => setShowUserModal(false)}>
              <CommonHeader title="사용자 상세" backHref="#" />
              <IonCard className={styles.modalCard}>
                <IonCardContent>
                  <h2 className={styles.modalTitle}>사용자 상세 정보</h2>
                  {selectedUser && (
                    <>
                      <div className={styles.flexRow + ' ' + styles.marginTop8}>
                        <b>닉네임:</b> {selectedUser.nickname}
                        {selectedUser.role==='admin' && <IonBadge color="warning">운영자</IonBadge>}
                        {selectedUser.status==='inactive' && <IonBadge color="medium">정지</IonBadge>}
                      </div>
                      <div><b>이메일:</b> {selectedUser.email}</div>
                      <div><b>권한:</b> {selectedUser.role}</div>
                      <div><b>상태:</b> {selectedUser.status}</div>
                      <div><b>가입일:</b> {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString('ko-KR') : '-'}</div>
                      <div><b>리딩 수:</b> {userReadingCount === null ? '불러오는 중...' : userReadingCount === -1 ? '에러' : userReadingCount + '개'}</div>
                      <div className={styles.marginTop8}><b>소속 그룹:</b> {Array.isArray(selectedUser.groups) && selectedUser.groups.length > 0 ? allGroups.filter(g=>selectedUser.groups!.includes(g.id)).map(g=>g.name).join(', ') : '없음'}</div>
                      <div className={styles.marginTop16}><b>최근 리딩 5개</b></div>
                      {userRecentReadings.length === 0 ? (
                        <div className={styles.fontGray + ' ' + styles.fontSize095}>최근 리딩이 없습니다.</div>
                      ) : (
                        <ul className={styles.paddingLeft16 + ' ' + styles.marginTop8}>
                          {userRecentReadings.map(r => (
                            <li key={r.readingId} className={styles.marginBottom8}>
                              <div className={styles.fontWeight500}>{r.initialQuestion || '질문 없음'}</div>
                              <div className={styles.fontSize09 + ' ' + styles.fontGray}>{r.createdAt ? new Date(r.createdAt).toLocaleDateString('ko-KR') : '-'}</div>
                              {r.rating && <div className={styles.fontSize09 + ' ' + styles.fontYellow}>평점: {r.rating}</div>}
                            </li>
                          ))}
                        </ul>
                      )}
                      {/* 그룹 관리 섹션 */}
                      <div className={styles.marginTop24}>
                        <b>그룹 관리</b>
                        <ul className={styles.margin8 + ' ' + styles.paddingLeft16}>
                          {(selectedUser.groups||[]).length === 0 && <li className={styles.fontGray}>소속 그룹 없음</li>}
                          {(selectedUser.groups||[]).map((gid:string) => {
                            const group = allGroups.find(g => g.id === gid);
                            return (
                              <li key={gid} className={styles.marginBottom8}>
                                {group ? group.name : gid}
                                <IonButton size="small" color="danger" className={styles.marginLeft8} onClick={()=>handleRemoveGroupFromUser(selectedUser.id, gid)}>제거</IonButton>
                              </li>
                            );
                          })}
                        </ul>
                        <div className={styles.flexGap8 + ' ' + styles.flexRow}>
                          <IonSelect placeholder="그룹 선택" value={groupToAdd} onIonChange={e=>setGroupToAdd(e.detail.value!)} className={styles.width100}>
                            {allGroups.filter(g=>!(selectedUser.groups||[]).includes(g.id)).map(g=>(
                              <IonSelectOption key={g.id} value={g.id}>{g.name}</IonSelectOption>
                            ))}
                          </IonSelect>
                          <IonButton size="small" onClick={()=>groupToAdd && handleAddGroupToUser(selectedUser.id, groupToAdd)}>추가</IonButton>
                        </div>
                      </div>
                      <div className={styles.flexGap8 + ' ' + styles.marginTop16}>
                        {selectedUser.status==='active' ? (
                          <IonButton size="small" color="medium" onClick={()=>handleBatchStatus('inactive')}>정지</IonButton>
                        ) : (
                          <IonButton size="small" color="success" onClick={()=>handleBatchStatus('active')}>정지 해제</IonButton>
                        )}
                        {selectedUser.role==='user' ? (
                          <IonButton size="small" color="warning" onClick={()=>handleBatchRole('admin')}>운영자 권한 부여</IonButton>
                        ) : (
                          <IonButton size="small" color="light" onClick={()=>handleBatchRole('user')}>운영자 권한 해제</IonButton>
                        )}
                        <IonButton size="small" color="danger" onClick={handleBatchDelete}>강제 탈퇴</IonButton>
                      </div>
                      <IonButton expand="block" color={selectedUser.role === 'admin' ? 'medium' : 'primary'} className={styles.marginTop8}
                        onClick={() => {
                          if (selectedUser.id === user?.id) {
                            presentToast({ message: '본인 계정의 권한은 변경할 수 없습니다.', duration: 2500, color: 'warning' });
                            return;
                          }
                          setPendingUser(selectedUser);
                          setPendingAction('role');
                          setShowRoleAlert(true);
                        }}
                        disabled={actionLoading}
                      >
                        {actionLoading && pendingAction==='role' ? <IonSpinner name="dots" /> : (selectedUser.role === 'admin' ? '관리자 권한 해제' : '관리자 권한 부여')}
                      </IonButton>
                      <IonButton expand="block" color={selectedUser.status === 'active' ? 'medium' : 'success'} className={styles.marginTop8}
                        onClick={() => {
                          if (selectedUser.id === user?.id) {
                            presentToast({ message: '본인 계정의 상태는 변경할 수 없습니다.', duration: 2500, color: 'warning' });
                            return;
                          }
                          setPendingUser(selectedUser);
                          setPendingAction('status');
                          setShowStatusAlert(true);
                        }}
                        disabled={actionLoading}
                      >
                        {actionLoading && pendingAction==='status' ? <IonSpinner name="dots" /> : (selectedUser.status === 'active' ? '계정 비활성화' : '계정 활성화')}
                      </IonButton>
                      <IonButton expand="block" color="danger" className={styles.marginTop8}
                        onClick={() => {
                          if (selectedUser.id === user?.id) {
                            presentToast({ message: '본인 계정은 삭제할 수 없습니다.', duration: 2500, color: 'warning' });
                            return;
                          }
                          setPendingUser(selectedUser);
                          setPendingAction('delete');
                          setShowDeleteAlert(true);
                        }}
                        disabled={actionLoading}
                      >
                        {actionLoading && pendingAction==='delete' ? <IonSpinner name="dots" /> : '강제 탈퇴(삭제)'}
                      </IonButton>
                      <IonButton expand="block" color="warning" className={styles.marginTop8}
                        onClick={() => setShowResetDailyTarotAlert(true)}
                      >
                        오늘의 타로 리셋
                      </IonButton>
                    </>
                  )}
                  <div className={styles.modalBtn}><IonButton expand="block" onClick={() => setShowUserModal(false)}>닫기</IonButton></div>
                </IonCardContent>
              </IonCard>
            </IonModal>
            <IonAlert
              isOpen={showRoleAlert}
              onDidDismiss={() => setShowRoleAlert(false)}
              header="권한 변경 확인"
              message={`정말로 ${pendingUser?.role === 'admin' ? '관리자 권한을 해제' : '관리자 권한을 부여'}하시겠습니까?`}
              buttons={[
                { text: '취소', role: 'cancel' },
                { text: '확인', handler: () => pendingUser ? handleRoleChange(pendingUser.id, pendingUser.role === 'admin' ? 'user' : 'admin') : undefined }
              ]}
            />
            <IonAlert
              isOpen={showStatusAlert}
              onDidDismiss={() => setShowStatusAlert(false)}
              header="상태 변경 확인"
              message={`정말로 ${pendingUser?.status === 'active' ? '비활성화' : '활성화'}하시겠습니까?`}
              buttons={[
                { text: '취소', role: 'cancel' },
                { text: '확인', handler: () => pendingUser ? handleStatusChange(pendingUser.id, pendingUser.status === 'active' ? 'inactive' : 'active') : undefined }
              ]}
            />
            <IonAlert
              isOpen={showDeleteAlert}
              onDidDismiss={() => setShowDeleteAlert(false)}
              header="강제 탈퇴 확인"
              message="정말로 이 사용자를 강제 탈퇴(삭제)하시겠습니까? 이 작업은 되돌릴 수 없습니다."
              buttons={[
                { text: '취소', role: 'cancel' },
                { text: '삭제', role: 'destructive', handler: () => pendingUser ? handleDeleteUser(pendingUser.id) : undefined }
              ]}
            />
            <IonAlert
              isOpen={showResetDailyTarotAlert}
              onDidDismiss={() => setShowResetDailyTarotAlert(false)}
              header="오늘의 타로 리셋 안내"
              message={`이 기능은 사용자의 브라우저 localStorage에서 'dailyTarotResult'를 삭제해야 적용됩니다.\n\n사용자에게 '설정 > 오늘의 타로 리셋' 또는 브라우저 캐시 삭제/새로고침을 안내해 주세요.`}
              buttons={[{ text: '확인', role: 'cancel' }]}
            />
          </>
        )}
        {tab==='deleted' && (
          <>
            {loadingDeleted ? (
              <div className={styles.center40}><IonSpinner name="crescent" /><div className={styles.mt12}>탈퇴한 사용자 목록을 불러오는 중...</div></div>
            ) : deletedUsers.length === 0 ? (
              <div className={styles.center40Gray}>탈퇴한 사용자가 없습니다.</div>
            ) : (
              <IonList>
                {deletedUsers.map(user => (
                  <IonItem key={user.id}>
                    <UserCard user={user} />
                    <IonLabel slot="end">
                      <div>가입일: {user.createdAt ? new Date(user.createdAt).toLocaleDateString('ko-KR') : '-'}</div>
                      <div>탈퇴일: {user.deletedAt ? new Date(user.deletedAt).toLocaleDateString('ko-KR') : '-'}</div>
                    </IonLabel>
                  </IonItem>
                ))}
              </IonList>
            )}
          </>
        )}
        {tab==='groups' && (
          <div>
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
                <IonButton expand="block" onClick={handleCreate} className={styles.mt16}>생성</IonButton>
                <IonButton expand="block" color="medium" onClick={() => setShowCreate(false)} className={styles.mt8}>취소</IonButton>
              </IonContent>
            </IonModal>
            {/* 그룹 이름 수정 모달 */}
            <IonModal isOpen={!!editGroup} onDidDismiss={() => setEditGroup(null)}>
              <IonHeader><IonToolbar><IonTitle>그룹 이름 수정</IonTitle></IonToolbar></IonHeader>
              <IonContent className="ion-padding">
                <IonInput label="그룹명" value={editName} onIonChange={e => setEditName(e.detail.value!)} />
                <IonButton expand="block" onClick={handleEditName} className={styles.mt16}>수정</IonButton>
                <IonButton expand="block" color="medium" onClick={() => setEditGroup(null)} className={styles.mt8}>취소</IonButton>
              </IonContent>
            </IonModal>
            {/* 그룹 상세(사용자 관리) 모달 */}
            <IonModal isOpen={showDetail} onDidDismiss={() => setShowDetail(false)}>
              <IonHeader><IonToolbar><IonTitle>그룹 상세</IonTitle></IonToolbar></IonHeader>
              <IonContent className="ion-padding">
                {detailGroup && (
                  <>
                    <h2>{detailGroup.name}</h2>
                    <div className={styles.mb8}>인원: {detailGroup.userIds.length}명</div>
                    <IonList>
                      {detailGroup.userIds.map((uid: string) => {
                        const user = users.find(u => u.id === uid);
                        return (
                          <IonItem key={uid}>
                            <IonLabel>{user ? user.name : uid}</IonLabel>
                            <IonButton size="small" color="danger" onClick={() => handleRemoveUser(uid)}>제거</IonButton>
                          </IonItem>
                        );
                      })}
                    </IonList>
                    <IonInput label="사용자 ID" value={userToAdd} onIonChange={e => setUserToAdd(e.detail.value!)} placeholder="추가할 사용자 ID" />
                    <IonButton expand="block" onClick={handleAddUser} className={styles.mt8}>사용자 추가</IonButton>
                    <IonButton expand="block" color="medium" onClick={() => setShowDetail(false)} className={styles.mt16}>닫기</IonButton>
                  </>
                )}
              </IonContent>
            </IonModal>
          </div>
        )}
      </IonContent>
    </IonPage>
  );
};

export default UsersPage; 