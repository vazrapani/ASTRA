import React, { useState, useEffect } from 'react';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonInput, IonTextarea, IonSelect, IonSelectOption, IonList, IonItem, IonLabel, IonText, IonModal, IonAlert, IonIcon } from '@ionic/react';
import { Notice, NoticeCategory, NoticeNotificationType } from '../../types/notice';
import { getNoticeList, createNotice, getNoticeById, updateNotice, deleteNotice } from '../../services/firebase/noticeService';
import { getAllUsers } from '../../services/firebase/userService';
import { createNotification } from '../../services/firebase/notificationService';
import { eyeOffOutline } from 'ionicons/icons';
import { getGroupList } from '../../services/firebase/groupService';
import CommonHeader from '../../components/CommonHeader';
import { useHistory } from 'react-router-dom';
import styles from './NoticesPage.module.css';

const CATEGORY_OPTIONS: NoticeCategory[] = ['업데이트', '징계', '일반', '긴급'];
const NOTIFICATION_OPTIONS: NoticeNotificationType[] = ['앱내', '푸쉬'];

const TARGET_TYPE_OPTIONS = [
  { label: '전체', value: 'all' },
  { label: '그룹', value: 'groups' },
  { label: '사용자', value: 'users' },
];
const DUMMY_GROUPS = [
  { id: 'group1', name: '그룹1' },
  { id: 'group2', name: '그룹2' },
];
const DUMMY_USERS = [
  { id: 'user1', name: '사용자1' },
  { id: 'user2', name: '사용자2' },
];

const NoticesPage: React.FC = () => {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);
  const [showWrite, setShowWrite] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [form, setForm] = useState({
    title: '',
    category: '일반' as NoticeCategory,
    content: '',
    notificationType: '앱내' as NoticeNotificationType,
    targetType: 'all' as 'all' | 'groups' | 'users',
    targetGroups: [] as string[],
    targetUsers: [] as string[],
  });
  const [editMode, setEditMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [groups, setGroups] = useState<{id:string, name:string}[]>([]);
  const history = useHistory();

  useEffect(() => {
    fetchNotices();
    fetchGroups();
  }, []);

  const fetchNotices = async () => {
    const list = await getNoticeList();
    setNotices(list.filter(n => !n.deleted));
  };

  const fetchGroups = async () => {
    const list = await getGroupList();
    setGroups(list.map(g => ({ id: g.id, name: g.name })));
  };

  const handleWrite = async () => {
    if (!form.content || form.content.trim() === '') {
      alert('내용을 입력하세요.');
      return;
    }
    // TODO: 관리자 정보 연동 필요
    console.log('공지 알림에 저장될 내용:', form.content); // 디버깅용
    const noticeId = await createNotice({
      ...form,
      createdBy: { id: 'admin', name: '관리자' },
    });
    // 앱내 알림 전송
    if (form.notificationType === '앱내') {
      const users = await getAllUsers();
      let targetUserIds: string[] = [];
      if (form.targetType === 'all') {
        targetUserIds = users.filter(u => u.role === 'user').map(u => u.id);
      } else if (form.targetType === 'groups') {
        // 그룹에 속한 모든 사용자 ID를 합침
        const groupUsers = users.filter(u =>
          u.role === 'user' &&
          u.groups && Array.isArray(u.groups) &&
          u.groups.some((gid: string) => form.targetGroups.includes(gid))
        );
        targetUserIds = groupUsers.map(u => u.id);
      } else if (form.targetType === 'users') {
        targetUserIds = form.targetUsers;
      }
      const message = `[공지] ${form.title} - ${form.category}`;
      await Promise.all(targetUserIds.map(uid => createNotification({
        userId: uid,
        type: 'notice',
        message,
        content: form.content ?? '',
        noticeId,
        createdAt: Date.now(),
        read: false,
      })));
    }
    setShowWrite(false);
    setForm({ title: '', category: '일반', content: '', notificationType: '앱내', targetType: 'all', targetGroups: [], targetUsers: [] });
    fetchNotices();
  };

  const handleEdit = async () => {
    if (!selectedNotice) return;
    console.log('수정 직전 form:', form); // 디버깅용
    await updateNotice(selectedNotice.noticeId, form);
    setShowEdit(false);
    setSelectedNotice(null);
    fetchNotices();
  };

  const handleDelete = async () => {
    if (!selectedNotice) return;
    await deleteNotice(selectedNotice.noticeId);
    setShowDelete(false);
    setSelectedNotice(null);
    fetchNotices();
  };

  const allSelected = notices.length > 0 && selectedIds.length === notices.length;
  const handleSelectAll = () => {
    if (allSelected) setSelectedIds([]);
    else setSelectedIds(notices.map(n => n.noticeId));
  };
  const handleSelect = (id: string) => {
    setSelectedIds(ids => ids.includes(id) ? ids.filter(i => i !== id) : [...ids, id]);
  };
  const handleBatchDelete = async () => {
    for (const id of selectedIds) await deleteNotice(id);
    setSelectedIds([]);
    fetchNotices();
  };
  const handleBatchHide = async () => {
    for (const id of selectedIds) await updateNotice(id, { hidden: true });
    setSelectedIds([]);
    fetchNotices();
  };

  const handleEditOpen = (notice: Notice) => {
    setForm({
      title: notice.title,
      category: notice.category,
      content: notice.content,
      notificationType: notice.notificationType,
      targetType: 'all',
      targetGroups: [],
      targetUsers: [],
      // ...필요시 기타 필드
    });
    setSelectedNotice(notice);
    setShowEdit(true);
  };

  return (
    <IonPage>
      <CommonHeader title="공지 관리" backHref="/admin" />
      <IonContent className="ion-padding">
        <IonButton
          expand="block"
          onClick={() => {
            setForm({ title: '', category: '일반', content: '', notificationType: '앱내', targetType: 'all', targetGroups: [], targetUsers: [] });
            setShowWrite(true);
          }}
          className={styles.marginBottom16}
        >공지 작성</IonButton>
        <IonButton expand="block" color={editMode ? 'medium' : 'primary'} onClick={() => setEditMode(e => !e)} className={styles.marginBottom8}>{editMode ? '편집 완료' : '편집'}</IonButton>
        {editMode && (
          <div className={`${styles.flexGap8} ${styles.marginBottom8}`}>
            <IonButton size="small" onClick={handleSelectAll}>{allSelected ? '전체 해제' : '전체 선택'}</IonButton>
            <IonButton size="small" color="danger" onClick={handleBatchDelete} disabled={selectedIds.length===0}>삭제</IonButton>
            <IonButton size="small" color="medium" onClick={handleBatchHide} disabled={selectedIds.length===0}>숨김</IonButton>
          </div>
        )}
        <IonList>
          {notices.map(notice => (
            <IonItem key={notice.noticeId} button={!editMode} onClick={() => !editMode && setSelectedNotice(notice)}>
              {editMode && (
                <input type="checkbox" checked={selectedIds.includes(notice.noticeId)} onChange={() => handleSelect(notice.noticeId)} className={styles.marginRight8} />
              )}
              {notice.hidden && <IonIcon icon={eyeOffOutline} color="medium" className={styles.marginRight8} />}
              <IonLabel>
                <b>{notice.title}</b> <IonText color="medium">[{notice.category}]</IonText>
                <div className={`${styles.fontSize12} ${styles.fontGray}`}>작성일: {new Date(notice.createdAt).toLocaleString()} / 조회수: {notice.viewCount}</div>
              </IonLabel>
            </IonItem>
          ))}
        </IonList>

        {/* 상세 모달 */}
        <IonModal isOpen={!!selectedNotice} onDidDismiss={() => setSelectedNotice(null)}>
          <CommonHeader title="공지 상세" onClickBack={() => setSelectedNotice(null)} />
          <IonContent className="ion-padding">
            {selectedNotice && (
              <>
                <IonCard color="light">
                  <IonCardHeader>
                    <IonCardTitle>{selectedNotice.title} <IonText color="medium">[{selectedNotice.category}]</IonText></IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent>
                    <div className={styles.mb8}>{selectedNotice.content}</div>
                    <div className={styles.font12 + ' ' + styles.fontGray}>작성일: {new Date(selectedNotice.createdAt).toLocaleString()} / 조회수: {selectedNotice.viewCount}</div>
                    <div className={styles.font12 + ' ' + styles.fontGray}>작성자: {selectedNotice.createdBy?.name || '-'}</div>
                  </IonCardContent>
                </IonCard>
                <IonButton expand="block" color="primary" onClick={() => handleEditOpen(selectedNotice)}>수정</IonButton>
                <IonButton expand="block" color="danger" onClick={() => setShowDelete(true)}>삭제</IonButton>
                <IonButton expand="block" onClick={() => setSelectedNotice(null)} className={styles.mt8}>닫기</IonButton>
              </>
            )}
          </IonContent>
        </IonModal>

        {/* 작성 모달 */}
        <IonModal isOpen={showWrite} onDidDismiss={() => setShowWrite(false)}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>공지 작성</IonTitle>
            </IonToolbar>
          </IonHeader>
          <IonContent className="ion-padding">
            <IonInput label="제목" value={form.title} onIonChange={e => setForm(f => ({ ...f, title: e.detail.value! }))} />
            <IonSelect label="분류" value={form.category} onIonChange={e => setForm(f => ({ ...f, category: e.detail.value as NoticeCategory }))}>
              {CATEGORY_OPTIONS.map(opt => <IonSelectOption key={opt} value={opt}>{opt}</IonSelectOption>)}
            </IonSelect>
            <IonSelect label="알림 방식" value={form.notificationType} onIonChange={e => setForm(f => ({ ...f, notificationType: e.detail.value as NoticeNotificationType }))}>
              {NOTIFICATION_OPTIONS.map(opt => <IonSelectOption key={opt} value={opt}>{opt}</IonSelectOption>)}
            </IonSelect>
            <IonSelect label="대상" value={form.targetType} onIonChange={e => setForm(f => ({ ...f, targetType: e.detail.value }))}>
              {TARGET_TYPE_OPTIONS.map(opt => <IonSelectOption key={opt.value} value={opt.value}>{opt.label}</IonSelectOption>)}
            </IonSelect>
            {form.targetType === 'groups' && (
              <IonSelect label="그룹 선택" multiple value={form.targetGroups} onIonChange={e => setForm(f => ({ ...f, targetGroups: e.detail.value }))}>
                {groups.map(g => <IonSelectOption key={g.id} value={g.id}>{g.name}</IonSelectOption>)}
              </IonSelect>
            )}
            {form.targetType === 'users' && (
              <IonSelect label="사용자 선택" multiple value={form.targetUsers} onIonChange={e => setForm(f => ({ ...f, targetUsers: e.detail.value }))}>
                {DUMMY_USERS.map(u => <IonSelectOption key={u.id} value={u.id}>{u.name}</IonSelectOption>)}
              </IonSelect>
            )}
            <IonTextarea label="내용" value={form.content} onIonChange={e => setForm(f => ({ ...f, content: e.detail.value || '' }))} autoGrow />
            <IonButton expand="block" onClick={handleWrite} className={styles.mt16}>등록</IonButton>
            <IonButton expand="block" color="medium" onClick={() => setShowWrite(false)} className={styles.mt8}>취소</IonButton>
          </IonContent>
        </IonModal>

        {/* 수정 모달 */}
        <IonModal isOpen={showEdit} onDidDismiss={() => setShowEdit(false)}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>공지 수정</IonTitle>
            </IonToolbar>
          </IonHeader>
          <IonContent className="ion-padding">
            <IonInput label="제목" value={form.title} onIonChange={e => setForm(f => ({ ...f, title: e.detail.value! }))} />
            <IonSelect label="분류" value={form.category} onIonChange={e => setForm(f => ({ ...f, category: e.detail.value as NoticeCategory }))}>
              {CATEGORY_OPTIONS.map(opt => <IonSelectOption key={opt} value={opt}>{opt}</IonSelectOption>)}
            </IonSelect>
            <IonSelect label="알림 방식" value={form.notificationType} onIonChange={e => setForm(f => ({ ...f, notificationType: e.detail.value as NoticeNotificationType }))}>
              {NOTIFICATION_OPTIONS.map(opt => <IonSelectOption key={opt} value={opt}>{opt}</IonSelectOption>)}
            </IonSelect>
            <IonSelect label="대상" value={form.targetType} onIonChange={e => setForm(f => ({ ...f, targetType: e.detail.value }))}>
              {TARGET_TYPE_OPTIONS.map(opt => <IonSelectOption key={opt.value} value={opt.value}>{opt.label}</IonSelectOption>)}
            </IonSelect>
            {form.targetType === 'groups' && (
              <IonSelect label="그룹 선택" multiple value={form.targetGroups} onIonChange={e => setForm(f => ({ ...f, targetGroups: e.detail.value }))}>
                {groups.map(g => <IonSelectOption key={g.id} value={g.id}>{g.name}</IonSelectOption>)}
              </IonSelect>
            )}
            {form.targetType === 'users' && (
              <IonSelect label="사용자 선택" multiple value={form.targetUsers} onIonChange={e => setForm(f => ({ ...f, targetUsers: e.detail.value }))}>
                {DUMMY_USERS.map(u => <IonSelectOption key={u.id} value={u.id}>{u.name}</IonSelectOption>)}
              </IonSelect>
            )}
            <IonTextarea label="내용" value={form.content} onIonChange={e => setForm(f => ({ ...f, content: e.detail.value || '' }))} autoGrow />
            <IonButton expand="block" onClick={handleEdit} className={styles.mt16}>수정</IonButton>
            <IonButton expand="block" color="medium" onClick={() => setShowEdit(false)} className={styles.mt8}>취소</IonButton>
          </IonContent>
        </IonModal>

        {/* 삭제 확인 */}
        <IonAlert isOpen={showDelete} onDidDismiss={() => setShowDelete(false)} header="공지 삭제" message="정말 삭제하시겠습니까?" buttons={[{ text: '취소', role: 'cancel' }, { text: '삭제', role: 'destructive', handler: handleDelete }]} />
      </IonContent>
    </IonPage>
  );
};

export default NoticesPage; 