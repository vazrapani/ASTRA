import React from 'react';
import styles from './UserCard.module.css';
import { User } from '../types/user';

interface UserCardProps {
  user: User;
  isInactive?: boolean;
}

const UserCard: React.FC<UserCardProps> = ({ user, isInactive = false }) => {
  return (
    <div className={styles.card + (isInactive ? ' ' + styles.inactive : '')}>
      <img src={user.profileImage} alt={user.nickname} className={styles.avatar} />
      <div className={styles.info}>
        <div className={styles.nickname}>{user.nickname}</div>
        <div className={styles.email}>{user.email}</div>
        <div className={styles.credits}>크레딧: {user.credits}</div>
        {isInactive && <div className={styles.inactiveText}>정지된 사용자</div>}
      </div>
    </div>
  );
};

export default UserCard; 