import React, { useState } from 'react';
import styles from './SocialLayout.module.css';
import FriendList from './FriendList';
import FeedTab from './FeedTab';
import MessageTab from './MessageTab';

const TABS = [
  { key: 'friends', label: '친구' },
  { key: 'feed', label: '피드' },
  { key: 'message', label: '메시지' },
];

const SocialLayout = () => {
  const [tab, setTab] = useState('friends');

  return (
    <div className={styles.container}>
      <div className={styles.tabBar}>
        {TABS.map((t) => (
          <button
            key={t.key}
            className={tab === t.key ? styles.active : ''}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className={styles.tabContent}>
        {tab === 'friends' && <FriendList unreadCount={0} onClickNotification={() => {}} />}
        {tab === 'feed' && <FeedTab />}
        {tab === 'message' && <MessageTab />}
      </div>
    </div>
  );
};

export default SocialLayout; 