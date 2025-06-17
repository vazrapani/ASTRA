import React, { useState, useEffect } from 'react';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel, IonButton, IonBackButton } from '@ionic/react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { addFriend } from '../../store/slices/socialSlice';
import CommonHeader from '../../components/CommonHeader';
import styles from './FriendList.module.css';
import FriendAddModal from './FriendAddModal';
import { getReceivedFriendRequests, getSentFriendRequests, acceptFriendRequest, getUserDetails } from '../../services/firebase/userService';
import { doc, deleteDoc, collection, onSnapshot } from 'firebase/firestore';
import { db } from '../../config/firebase';
import UserCard from '../../components/UserCard';
import Modal from '../../components/Modal';
import { useHistory } from 'react-router-dom';

interface FriendListProps {
  unreadCount: number;
  onClickNotification: () => void;
  hideHeader?: boolean;
}

const FriendList: React.FC<FriendListProps> = ({ unreadCount, onClickNotification, hideHeader = false }) => {
  const dispatch = useDispatch();
  const [friends, setFriends] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const user = useSelector((state: any) => state.auth.user);
  const [receivedRequests, setReceivedRequests] = useState<any[]>([]);
  const [sentRequests, setSentRequests] = useState<any[]>([]);
  const [friendsWithProfile, setFriendsWithProfile] = useState<any[]>([]);
  const [selectedFriend, setSelectedFriend] = useState<any | null>(null);
  const history = useHistory();

  useEffect(() => {
    if (!user?.id) return;
    const ref = collection(db, 'users', user.id, 'friends');
    const unsub = onSnapshot(ref, snap => {
      setFriends(snap.docs.map(doc => doc.data()));
    });
    return () => unsub();
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) return;
    getReceivedFriendRequests(user.id).then(setReceivedRequests);
    getSentFriendRequests(user.id).then(setSentRequests);
  }, [user?.id]);

  useEffect(() => {
    if (!friends.length) {
      setFriendsWithProfile([]);
      return;
    }
    Promise.all(friends.map(f => getUserDetails(f.userId))).then(setFriendsWithProfile);
  }, [friends]);

  const handleAddFriend = () => {
    // 임시: 랜덤 친구 추가 예시
    const newId = (friends.length + 1).toString();
    dispatch(addFriend({ id: newId, nickname: `새 친구${newId}`, profileImage: '', lastActive: new Date() }));
  };

  const refreshRequests = () => {
    if (!user?.id) return;
    getReceivedFriendRequests(user.id).then(setReceivedRequests);
    getSentFriendRequests(user.id).then(setSentRequests);
  };

  const handleAccept = async (reqId: string) => {
    await acceptFriendRequest(reqId);
    refreshRequests();
  };

  const handleDelete = async (reqId: string) => {
    await deleteDoc(doc(db, 'friendRequests', reqId));
    refreshRequests();
  };

  const handleDeleteFriend = async (friendId: string) => {
    if (!user?.id) return;
    await deleteDoc(doc(db, 'users', user.id, 'friends', friendId));
    await deleteDoc(doc(db, 'users', friendId, 'friends', user.id));
  };

  // 모달 내부에 임시 피드 데이터 예시
  const mockSharedReadings = [
    {
      sharedReadingId: '1',
      date: '2024-05-01',
      question: '올해의 운세는?',
      summary: '긍정적인 변화가 예상됩니다.',
      emojis: ['👍', '😊'],
      comments: [
        { user: '나', text: '고마워!' },
        { user: '친구', text: '함께 힘내자!' },
      ],
    },
    {
      sharedReadingId: '2',
      date: '2024-04-20',
      question: '취업운이 궁금해',
      summary: '새로운 기회가 다가옵니다.',
      emojis: ['👏'],
      comments: [],
    },
  ];

  return (
    <div>
      <IonButton expand="block" color="primary" className={styles.btnAdd} onClick={() => setShowAddModal(true)}>친구 추가/초대</IonButton>
      <FriendAddModal open={showAddModal} onClose={() => setShowAddModal(false)} />
      <IonList>
        {friendsWithProfile.length === 0 && (
          <IonItem><IonLabel>친구가 없습니다.</IonLabel></IonItem>
        )}
        {friendsWithProfile
          .filter(friend => friend.status !== 'deleted')
          .map(friend => (
            <div key={friend.id} className={styles.friendCardRow}>
              <div onClick={() => history.push(`/tabs/social/friends/${friend.id}`)} style={{ flex: 1, cursor: 'pointer' }}>
                <UserCard user={friend} isInactive={friend.status === 'inactive'} />
              </div>
              <IonButton size="small" color="danger" onClick={() => handleDeleteFriend(friend.id)} className={styles.deleteBtn} disabled={friend.status === 'inactive'}>
                삭제
              </IonButton>
            </div>
          ))}
      </IonList>
      {/* 받은 친구 요청 */}
      {receivedRequests.length > 0 && (
        <div className={styles.requestSection}>
          <div className={styles.requestTitle}>받은 친구 요청</div>
          <IonList>
            {receivedRequests.map(req => (
              <IonItem key={req.id}>
                <IonLabel>{req.from}</IonLabel>
                <IonButton size="small" color="success" onClick={() => handleAccept(req.id)}>수락</IonButton>
                <IonButton size="small" color="danger" onClick={() => handleDelete(req.id)}>거절</IonButton>
              </IonItem>
            ))}
          </IonList>
        </div>
      )}
      {/* 보낸 친구 요청 */}
      {sentRequests.length > 0 && (
        <div className={styles.requestSection}>
          <div className={styles.requestTitle}>보낸 친구 요청</div>
          <IonList>
            {sentRequests.map(req => (
              <IonItem key={req.id}>
                <IonLabel>{req.to}</IonLabel>
                <IonButton size="small" color="medium" onClick={() => handleDelete(req.id)}>취소</IonButton>
              </IonItem>
            ))}
          </IonList>
        </div>
      )}
    </div>
  );
};

export default FriendList; 