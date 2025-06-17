import React, { useState } from 'react';
import styles from './MessageTab.module.css';
import { mockMessages } from './mockMessages';

const MessageTab = () => {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const selected = mockMessages.find((m) => m.id === selectedId);

  return (
    <div className={styles.container}>
      <div className={styles.listPanel}>
        <h2>메시지</h2>
        <ul>
          {mockMessages.map((msg) => (
            <li
              key={msg.id}
              className={selectedId === msg.id ? styles.selected : ''}
              onClick={() => setSelectedId(msg.id)}
            >
              <div className={styles.user}>{msg.user}</div>
              <div className={styles.lastMessage}>{msg.lastMessage}</div>
              <div className={styles.time}>{msg.time}</div>
              {msg.unread > 0 && <span className={styles.unread}>{msg.unread}</span>}
            </li>
          ))}
        </ul>
      </div>
      <div className={styles.detailPanel}>
        {selected ? (
          <>
            <h3>{selected.user}</h3>
            <div className={styles.messages}>
              {selected.messages.map((m, i) => (
                <div key={i} className={m.from === '나' ? styles.myMsg : styles.otherMsg}>
                  <span className={styles.msgUser}>{m.from}</span>
                  <span className={styles.msgText}>{m.text}</span>
                  <span className={styles.msgTime}>{m.time}</span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className={styles.empty}>메시지를 선택하세요.</div>
        )}
      </div>
    </div>
  );
};

export default MessageTab; 