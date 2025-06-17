import React, { useEffect, useState } from 'react';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonBadge,
  IonButton,
  IonIcon,
  IonModal,
  IonTextarea,
  IonButtons,
  IonMenuButton,
  IonSpinner,
  IonAlert,
} from '@ionic/react';
import { mailOutline, checkmarkCircle } from 'ionicons/icons';
import AdminLayout from './AdminLayout';
import styles from './InquiriesPage.module.css';
import { Inquiry } from '../../types';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { deleteDoc, doc, collection, getDocs, query, updateDoc, orderBy } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useIonToast } from '@ionic/react';
import { addInquiryResponse, updateInquiryStatus } from '../../services/firebase/inquiryService';
import CommonHeader from '../../components/CommonHeader';
import { useHistory } from 'react-router-dom';

const InquiriesPage: React.FC = () => {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [showModal, setShowModal] = useState(false);
  const user = useSelector((state: RootState) => state.auth.user);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'resolved'>('all');
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [presentToast] = useIonToast();
  const [actionLoading, setActionLoading] = useState(false);
  const history = useHistory();

  useEffect(() => {
    loadInquiries();
  }, []);

  const loadInquiries = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, 'inquiries'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setInquiries(data as Inquiry[]);
    } catch (error) {
      console.error('Failed to load inquiries:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async () => {
    if (!selectedInquiry || !replyContent.trim() || !user) return;
    try {
      await addInquiryResponse(selectedInquiry.id, user.id, replyContent);
      setShowModal(false);
      setReplyContent('');
      loadInquiries(); // 목록 새로고침
    } catch (error) {
      console.error('Failed to send reply:', error);
    }
  };

  const handleDeleteInquiry = async (inquiryId: string) => {
    setActionLoading(true);
    try {
      await deleteDoc(doc(db, 'inquiries', inquiryId));
      setInquiries(inquiries.filter(i => i.id !== inquiryId));
      presentToast({
        message: '문의가 삭제되었습니다.',
        duration: 2000,
        color: 'success',
      });
    } catch (e) {
      presentToast({
        message: '문의 삭제에 실패했습니다.',
        duration: 3000,
        color: 'danger',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleStatusChange = async (inquiryId: string, status: 'pending' | 'in_progress' | 'resolved') => {
    if (!user) return;
    try {
      await updateInquiryStatus(inquiryId, status, user.id);
      loadInquiries();
      presentToast({
        message: '문의 상태가 변경되었습니다.',
        duration: 2000,
        color: 'success',
      });
    } catch (error) {
      presentToast({
        message: '문의 상태 변경에 실패했습니다.',
        duration: 3000,
        color: 'danger',
      });
    }
  };

  const filteredInquiries = inquiries.filter(i =>
    statusFilter === 'all' ? true : i.status === statusFilter
  );

  return (
    <AdminLayout>
      <CommonHeader title="문의 관리" backHref="/admin" />
      <IonContent>
        <div className={`${styles.flexGap8} ${styles.margin16_12}`}>
          <IonButton size="small" fill={statusFilter==='all'?'solid':'outline'} onClick={()=>setStatusFilter('all')}>전체</IonButton>
          <IonButton size="small" fill={statusFilter==='pending'?'solid':'outline'} onClick={()=>setStatusFilter('pending')}>대기중</IonButton>
          <IonButton size="small" fill={statusFilter==='resolved'?'solid':'outline'} onClick={()=>setStatusFilter('resolved')}>답변완료</IonButton>
        </div>
        {loading ? (
          <div className={`${styles.centerText} ${styles.margin40}`}>
            <IonSpinner name="crescent" />
            <div className={styles.marginTop12}>문의 목록을 불러오는 중...</div>
          </div>
        ) : filteredInquiries.length === 0 ? (
          <div className={`${styles.centerText} ${styles.margin40} ${styles.fontGray} ${styles.fontSize1_1em}`}>
            문의가 없습니다.
          </div>
        ) : (
          <IonList>
            {filteredInquiries.map((inquiry) => (
              <IonItem key={inquiry.id} className={styles.inquiryItem}>
                <IonIcon icon={mailOutline} slot="start" />
                <IonLabel>
                  <h2 className={styles.inquiryTitle}>{inquiry.title}</h2>
                  <p className={styles.inquiryEmail}>{inquiry.userId}</p>
                  <p className={styles.inquiryDate}>{new Date(inquiry.createdAt).toLocaleString()}</p>
                </IonLabel>
                <IonBadge color={inquiry.status === 'pending' ? 'warning' : 'success'}>
                  {inquiry.status === 'pending' ? '대기중' : '답변완료'}
                </IonBadge>
                <IonButton
                  fill="clear"
                  onClick={() => {
                    setSelectedInquiry(inquiry);
                    setShowModal(true);
                  }}
                >
                  답변하기
                </IonButton>
                <IonButton
                  fill="clear"
                  color="danger"
                  onClick={() => {
                    setDeleteTargetId(inquiry.id);
                    setShowDeleteAlert(true);
                  }}
                  disabled={actionLoading}
                >
                  삭제
                </IonButton>
              </IonItem>
            ))}
          </IonList>
        )}

        <IonModal isOpen={showModal} onDidDismiss={() => setShowModal(false)}>
          <CommonHeader title="문의 답변" onClickBack={() => setShowModal(false)} />
          <IonContent className={styles.modalContent}>
            {selectedInquiry && (
              <>
                <h2 className={styles.modalTitle}>{selectedInquiry.title}</h2>
                <p className={styles.modalEmail}>{selectedInquiry.userId}</p>
                <div className={styles.modalContent}>{selectedInquiry.content}</div>
                <div className={styles.replyArea}>
                  <IonTextarea
                    value={replyContent}
                    onIonChange={e => setReplyContent(e.detail.value!)}
                    placeholder="답변을 입력하세요..."
                    rows={6}
                  />
                  <IonButton
                    expand="block"
                    onClick={handleReply}
                    className={styles.marginTop16}
                  >
                    <IonIcon icon={checkmarkCircle} slot="start" />
                    답변 보내기
                  </IonButton>
                </div>
              </>
            )}
          </IonContent>
        </IonModal>

        <IonAlert
          isOpen={showDeleteAlert}
          onDidDismiss={() => setShowDeleteAlert(false)}
          header="문의 삭제"
          message="정말로 이 문의를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다."
          buttons={[
            { text: '취소', role: 'cancel', handler: () => actionLoading ? undefined : undefined },
            { text: '삭제', role: 'destructive', handler: () => (!actionLoading && deleteTargetId) ? handleDeleteInquiry(deleteTargetId) : undefined },
          ]}
        />
      </IonContent>
    </AdminLayout>
  );
};

export default InquiriesPage; 