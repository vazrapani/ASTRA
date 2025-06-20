import React, { useEffect, useState } from 'react';
import styles from './FriendSelectModal.module.css';
import { useSelector } from 'react-redux';
import { db } from '../config/firebase';
import { collection, onSnapshot, getDoc, doc } from 'firebase/firestore';
import defaultProfileImage from '../assets/images/default-profile.png';

interface Friend {
  id: string;
  nickname: string;
  profileImage?: string;
}

interface FriendSelectModalProps {
  open: boolean;
  onSelect: (friendId: string) => void;
  onClose: () => void;
  sharing?: boolean;
  error?: string | null;
}

const FriendSelectModal: React.FC<FriendSelectModalProps> = ({ open, onSelect, onClose, sharing = false, error = null }) => {
  const user = useSelector((state: any) => state.auth.user);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedFriendId, setSelectedFriendId] = useState<string | null>(null);

  useEffect(() => {
    console.log('[FriendSelectModal/useEffect] open:', open, 'user:', user);
    if (!open || !user?.id) return;
    setLoading(true);
    setSelectedFriendId(null);
    const ref = collection(db, 'users', user.id, 'friends');
    const unsub = onSnapshot(ref, async snap => {
      console.log('[FriendSelectModal/useEffect] friends snap.docs:', snap.docs);
      const friendIds = snap.docs.map(doc => doc.data().userId);
      console.log('[FriendSelectModal/useEffect] friendIds:', friendIds);
      const friendList: Friend[] = [];
      for (const fid of friendIds) {
        console.log('[FriendSelectModal/useEffect] checking fid:', fid);
        const fdoc = await getDoc(doc(db, 'users', fid));
        console.log('[FriendSelectModal/useEffect] fdoc.exists:', fdoc.exists());
        if (fdoc.exists()) {
          const d = fdoc.data();
          console.log('[FriendSelectModal/useEffect] friend profile:', d);
          friendList.push({
            id: fid,
            nickname: d.nickname || '이름 없음',
            profileImage: d.profileImage || '',
          });
        }
      }
      setFriends(friendList);
      setLoading(false);
    });
    return () => unsub();
  }, [open, user?.id]);

  const handleShare = () => {
    if (selectedFriendId && !sharing) {
      onSelect(selectedFriendId);
    }
  };

  console.log('🔥🔥🔥 FriendSelectModal 렌더링됨!');

  if (!open) return null;
  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalBox}>
        <div className={styles.title}>공유할 친구 선택</div>
        <div className={styles.friendList}>
          {loading ? (
            <div style={{color:'#aaa',textAlign:'center'}}>불러오는 중...</div>
          ) : friends.length === 0 ? (
            <div style={{color:'#aaa',textAlign:'center'}}>친구가 없습니다.</div>
          ) : friends.map(f => (
            <div
              key={f.id}
              className={styles.friendItem + (selectedFriendId === f.id ? ' ' + styles.selected : '')}
              onClick={() => setSelectedFriendId(f.id)}
              style={{background: selectedFriendId === f.id ? '#4b2fd6' : undefined}}
            >
              <img src={f.profileImage && String(f.profileImage).trim() !== '' ? f.profileImage : defaultProfileImage} alt={f.nickname} className={styles.profileImg} />
              <span>{f.nickname}</span>
            </div>
          ))}
        </div>
        {error && <div style={{color:'#ff7675',textAlign:'center',marginBottom:8}}>{error}</div>}
        <button
          className={styles.closeBtn}
          onClick={onClose}
          style={{marginRight: 8, background: '#444'}}
          disabled={sharing}
        >닫기</button>
        <button
          className={styles.closeBtn}
          onClick={handleShare}
          disabled={!selectedFriendId || sharing}
        >{sharing ? '공유 중...' : '공유하기'}</button>
      </div>
    </div>
  );
};

export default FriendSelectModal; 