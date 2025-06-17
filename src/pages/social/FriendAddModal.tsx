import React, { useState } from 'react';
import styles from './FriendAddModal.module.css';
import { getUserByEmail, sendFriendRequest, sendNotification, getUserDetails } from '../../services/firebase/userService';
import { useSelector } from 'react-redux';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';

interface FriendAddModalProps {
  open: boolean;
  onClose: () => void;
}

const FriendAddModal: React.FC<FriendAddModalProps> = ({ open, onClose }) => {
  const [tab, setTab] = useState<'search' | 'code'>('search');
  const [searchEmail, setSearchEmail] = useState('');
  const [searchResult, setSearchResult] = useState<any[]>([]); // 실제 구현시 타입 지정
  const [codeInput, setCodeInput] = useState('');
  const user = useSelector((state: any) => state.auth.user);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [addStatus, setAddStatus] = useState('');
  const [codeAddStatus, setCodeAddStatus] = useState('');

  if (!open) return null;

  const handleEmailSearch = async () => {
    setSearchLoading(true);
    setSearchError('');
    setSearchResult([]);
    try {
      if (!searchEmail.trim()) {
        setSearchError('이메일을 입력하세요.');
        setSearchLoading(false);
        return;
      }
      const found = await getUserByEmail(searchEmail.trim());
      if (!found) {
        setSearchError('해당 이메일의 사용자를 찾을 수 없습니다.');
      } else if (found.id === user?.id) {
        setSearchError('본인은 친구로 추가할 수 없습니다.');
      } else {
        setSearchResult([found]);
      }
    } catch (e) {
      setSearchError('검색 중 오류가 발생했습니다.');
    } finally {
      setSearchLoading(false);
    }
  };

  const isAlreadyFriend = async (myId: string, otherId: string) => {
    const ref = doc(db, 'users', myId, 'friends', otherId);
    const snap = await getDoc(ref);
    return snap.exists();
  };

  const isAlreadyRequested = async (myId: string, otherId: string) => {
    const ref = collection(db, 'friendRequests');
    const q = query(ref, where('from', '==', myId), where('to', '==', otherId), where('status', '==', 'pending'));
    const snap = await getDocs(q);
    return !snap.empty;
  };

  const handleAddFriend = async (targetUser: any) => {
    setAddStatus('');
    try {
      if (!user?.id || !targetUser?.id) return;
      if (await isAlreadyFriend(user.id, targetUser.id)) {
        setAddStatus('이미 친구입니다.');
        return;
      }
      if (await isAlreadyRequested(user.id, targetUser.id)) {
        setAddStatus('이미 친구 요청을 보냈습니다.');
        return;
      }
      await sendFriendRequest(user.id, targetUser.id);
      await sendNotification(targetUser.id, 'friend_request', `${user.nickname || user.email}님이 친구 요청을 보냈습니다.`);
      setAddStatus('친구 요청을 보냈습니다.');
    } catch (e) {
      setAddStatus('친구 요청 중 오류가 발생했습니다.');
    }
  };

  const handleAddByCode = async () => {
    setCodeAddStatus('');
    try {
      if (!codeInput.trim()) {
        setCodeAddStatus('코드를 입력하세요.');
        return;
      }
      if (!user?.id) return;
      if (codeInput.trim() === user.id) {
        setCodeAddStatus('본인 코드는 입력할 수 없습니다.');
        return;
      }
      const found = await getUserDetails(codeInput.trim());
      if (!found) {
        setCodeAddStatus('해당 코드의 사용자를 찾을 수 없습니다.');
        return;
      }
      if (await isAlreadyFriend(user.id, found.id)) {
        setCodeAddStatus('이미 친구입니다.');
        return;
      }
      if (await isAlreadyRequested(user.id, found.id)) {
        setCodeAddStatus('이미 친구 요청을 보냈습니다.');
        return;
      }
      await sendFriendRequest(user.id, found.id);
      await sendNotification(found.id, 'friend_request', `${user.nickname || user.email}님이 친구 요청을 보냈습니다.`);
      setCodeAddStatus('친구 요청을 보냈습니다.');
    } catch (e) {
      setCodeAddStatus('친구 요청 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modalBox} onClick={e => e.stopPropagation()}>
        <div className={styles.tabHeader}>
          <button className={tab === 'search' ? styles.active : ''} onClick={() => setTab('search')}>친구 검색</button>
          <button className={tab === 'code' ? styles.active : ''} onClick={() => setTab('code')}>친구 코드 입력</button>
        </div>
        <div className={styles.tabContent}>
          {tab === 'search' && (
            <>
              <input
                type="email"
                placeholder="이메일로 친구 검색"
                value={searchEmail}
                onChange={e => setSearchEmail(e.target.value)}
                className={styles.input}
              />
              <button className={styles.searchBtn} onClick={handleEmailSearch} disabled={searchLoading}>검색</button>
              {searchLoading && <div className={styles.emptyMsg}>검색 중...</div>}
              {searchError && <div className={styles.emptyMsg}>{searchError}</div>}
              {searchResult.length === 0 ? (
                <div className={styles.emptyMsg}>이메일로 친구를 검색해 추가할 수 있습니다.</div>
              ) : (
                <ul className={styles.resultList}>
                  {searchResult.map((user, idx) => (
                    <li key={idx} className={styles.resultItem}>
                      {user.email} <button onClick={() => handleAddFriend(user)}>추가</button>
                    </li>
                  ))}
                </ul>
              )}
              {addStatus && <div className={styles.emptyMsg}>{addStatus}</div>}
            </>
          )}
          {tab === 'code' && (
            <>
              <input
                type="text"
                placeholder="친구 코드 입력"
                value={codeInput}
                onChange={e => setCodeInput(e.target.value)}
                className={styles.input}
              />
              <button className={styles.addBtn} onClick={handleAddByCode}>추가</button>
              {codeAddStatus && <div className={styles.emptyMsg}>{codeAddStatus}</div>}
            </>
          )}
        </div>
        <button className={styles.closeBtn} onClick={onClose}>닫기</button>
      </div>
    </div>
  );
};

export default FriendAddModal; 