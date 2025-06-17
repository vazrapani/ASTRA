import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import styles from './InquiryForm.module.css';

interface InquiryFormProps {
  onSubmit: (data: { email: string; title: string; content: string }) => Promise<void>;
  userEmail?: string;
}

const InquiryForm: React.FC<InquiryFormProps> = ({ onSubmit, userEmail }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const history = useHistory();

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        history.replace('/tabs/my');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success, history]);

  const handleSubmit = async (e: React.FormEvent) => {
    console.log('문의 전송 시도', { userEmail, title, content });
    e.preventDefault();
    setError('');
    if (!userEmail) {
      setError('로그인된 이메일 정보가 없습니다.');
      return;
    }
    if (!title.trim() || !content.trim()) {
      setError('제목과 내용을 모두 입력해 주세요.');
      return;
    }
    setLoading(true);
    try {
      await onSubmit({ email: userEmail, title, content });
      setSuccess(true);
    } catch (err: any) {
      setError(err?.message || '문의 전송에 실패했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className={styles.successMessage}>
        문의가 성공적으로 접수되었습니다.<br/>최대한 빠르게 답변드리겠습니다.<br/>
        <span className={styles.redirectNotice}>3초 후 마이페이지로 이동합니다.</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.emailInfo}>
        <b>이메일:</b> {userEmail || '로그인 필요'}
      </div>
      <input
        type="text"
        value={title}
        onChange={e => setTitle(e.target.value)}
        placeholder="제목"
        className={styles.input}
        maxLength={50}
        disabled={loading}
        required
      />
      <textarea
        value={content}
        onChange={e => setContent(e.target.value)}
        placeholder="문의 내용을 입력해 주세요."
        className={styles.textarea}
        maxLength={1000}
        disabled={loading}
        required
      />
      {error && <div className={styles.errorMsg}>{error}</div>}
      <button
        type="submit"
        className={styles.submitBtn}
        disabled={loading}
      >
        {loading ? '전송 중...' : '문의 전송'}
      </button>
    </form>
  );
};

export default InquiryForm; 