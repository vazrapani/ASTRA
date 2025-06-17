import React, { useState } from 'react';
import styles from './FeedTab.module.css';
import { mockFeed } from './mockFeed';

const FeedTab = () => {
  const [feeds, setFeeds] = useState(mockFeed);
  const [newContent, setNewContent] = useState('');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [comment, setComment] = useState('');

  const handleAddFeed = () => {
    if (!newContent.trim()) return;
    setFeeds([
      {
        id: Date.now(),
        user: '나',
        content: newContent,
        time: '방금 전',
        comments: [],
      },
      ...feeds,
    ]);
    setNewContent('');
  };

  const handleAddComment = (feedId: number) => {
    if (!comment.trim()) return;
    setFeeds(
      feeds.map((f) =>
        f.id === feedId
          ? { ...f, comments: [...f.comments, { user: '나', text: comment }] }
          : f
      )
    );
    setComment('');
  };

  const selectedFeed = feeds.find((f) => f.id === selectedId);

  return (
    <div className={styles.container}>
      <div className={styles.feedPanel}>
        <h2>피드</h2>
        <div className={styles.writeBox}>
          <textarea
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            placeholder="무엇을 생각하고 있나요?"
            className={styles.textarea}
          />
          <button onClick={handleAddFeed} className={styles.addBtn}>
            게시
          </button>
        </div>
        <ul className={styles.feedList}>
          {feeds.map((feed) => (
            <li
              key={feed.id}
              className={selectedId === feed.id ? styles.selected : ''}
              onClick={() => setSelectedId(feed.id)}
            >
              <div className={styles.user}>{feed.user}</div>
              <div className={styles.content}>{feed.content}</div>
              <div className={styles.time}>{feed.time}</div>
              <div className={styles.commentCount}>💬 {feed.comments.length}</div>
            </li>
          ))}
        </ul>
      </div>
      <div className={styles.detailPanel}>
        {selectedFeed ? (
          <>
            <h3>{selectedFeed.user}</h3>
            <div className={styles.feedContent}>{selectedFeed.content}</div>
            <div className={styles.feedTime}>{selectedFeed.time}</div>
            <div className={styles.comments}>
              <h4>댓글</h4>
              {selectedFeed.comments.length === 0 && <div className={styles.noComment}>댓글이 없습니다.</div>}
              {selectedFeed.comments.map((c, i) => (
                <div key={i} className={styles.commentItem}>
                  <span className={styles.commentUser}>{c.user}</span>
                  <span className={styles.commentText}>{c.text}</span>
                </div>
              ))}
              <div className={styles.commentWrite}>
                <input
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="댓글을 입력하세요"
                  className={styles.commentInput}
                />
                <button onClick={() => handleAddComment(selectedFeed.id)} className={styles.commentBtn}>
                  등록
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className={styles.empty}>피드를 선택하세요.</div>
        )}
      </div>
    </div>
  );
};

export default FeedTab; 