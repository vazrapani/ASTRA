import React, { useEffect, useState } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonBackButton, IonSpinner } from '@ionic/react';
import { getSharedReadingV2, setSharedReadingV2 } from '../../services/firebase/readingService';
import TarotSharedCard from '../../components/TarotSharedCard';
import { useSelector } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);

const FeedDetailPage: React.FC = () => {
  const { sharedReadingId } = useParams<{ sharedReadingId: string }>();
  const history = useHistory();
  const [reading, setReading] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const user = useSelector((state: any) => state.auth.user);
  const [commentInput, setCommentInput] = useState('');
  const [sending, setSending] = useState(false);
  const [editCommentId, setEditCommentId] = useState<string | null>(null);
  const [editCommentInput, setEditCommentInput] = useState('');

  // 이모티콘(리액션) 관련
  const EMOJIS = ['👍', '😂', '😍', '😢'];
  const myEmoji = reading?.emojis?.find((e: any) => e.userId === user?.id)?.emoji;
  const [showEmojis, setShowEmojis] = useState(false);

  // 각 이모티콘별 카운트 계산
  const emojiCounts = EMOJIS.reduce((acc, emoji) => {
    acc[emoji] = reading?.emojis?.filter((e: any) => e.emoji === emoji).length || 0;
    return acc;
  }, {} as Record<string, number>);

  // 선택된 이모티콘들만 필터링 (카운트가 있는 것들만)
  const activeEmojis = Object.entries(emojiCounts).filter(([_, count]) => count > 0);

  const handleEmojiClick = async (emoji: string) => {
    if (!user || !reading) return;
    setTimeout(() => setShowEmojis(false), 1000); // 1000ms(1초) 딜레이 후 닫기
    setSending(true);
    try {
      let newEmojis;
      const existing = reading.emojis?.find((e: any) => e.userId === user.id);
      if (existing) {
        if (existing.emoji === emoji) {
          // 이미 누른 이모티콘이면 취소(삭제)
          newEmojis = reading.emojis.filter((e: any) => e.userId !== user.id);
        } else {
          // 다른 이모티콘으로 교체
          newEmojis = reading.emojis.map((e: any) => e.userId === user.id ? { ...e, emoji, createdAt: Date.now() } : e);
        }
      } else {
        // 새로 추가
        newEmojis = [...(reading.emojis || []), { userId: user.id, emoji, createdAt: Date.now() }];
      }
      const updated = { ...reading, emojis: newEmojis };
      await setSharedReadingV2(updated);
      const refreshed = await getSharedReadingV2(reading.sharedReadingId);
      setReading(refreshed);
    } catch (e) {
      alert('이모티콘 반영 실패: ' + (e as any).message);
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    const fetchReading = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getSharedReadingV2(sharedReadingId);
        if (!data) {
          setError('공유 해석을 찾을 수 없습니다.');
        } else {
          setReading(data);
        }
      } catch (e) {
        setError('데이터를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };
    if (sharedReadingId) fetchReading();
  }, [sharedReadingId]);

  // 댓글 등록 핸들러
  const handleAddComment = async () => {
    if (!user || !commentInput.trim() || !reading) return;
    setSending(true);
    try {
      const newComment = {
        commentId: uuidv4(),
        userId: user.id,
        content: commentInput.trim(),
        createdAt: Date.now(),
      };
      const updated = {
        ...reading,
        comments: [...(reading.comments || []), newComment],
      };
      await setSharedReadingV2(updated);
      // 최신 데이터 fetch
      const refreshed = await getSharedReadingV2(reading.sharedReadingId);
      setReading(refreshed);
      setCommentInput('');
    } catch (e) {
      alert('댓글 등록 실패: ' + (e as any).message);
    } finally {
      setSending(false);
    }
  };

  // 댓글 수정 저장 핸들러
  const handleSaveEditComment = async () => {
    if (!user || !reading || !editCommentId || !editCommentInput.trim()) return;
    setSending(true);
    try {
      const updatedComments = (reading.comments || []).map((c: any) =>
        c.commentId === editCommentId ? { ...c, content: editCommentInput.trim() } : c
      );
      const updated = { ...reading, comments: updatedComments };
      await setSharedReadingV2(updated);
      const refreshed = await getSharedReadingV2(reading.sharedReadingId);
      setReading(refreshed);
      setEditCommentId(null);
      setEditCommentInput('');
    } catch (e) {
      alert('댓글 수정 실패: ' + (e as any).message);
    } finally {
      setSending(false);
    }
  };

  // 댓글 삭제 핸들러
  const handleDeleteComment = async (commentId: string) => {
    if (!user || !reading) return;
    if (!window.confirm('정말로 이 댓글을 삭제하시겠습니까?')) return;
    setSending(true);
    try {
      const updatedComments = (reading.comments || []).filter((c: any) => c.commentId !== commentId);
      const updated = { ...reading, comments: updatedComments };
      await setSharedReadingV2(updated);
      const refreshed = await getSharedReadingV2(reading.sharedReadingId);
      setReading(refreshed);
    } catch (e) {
      alert('댓글 삭제 실패: ' + (e as any).message);
    } finally {
      setSending(false);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/tabs/social/friends" />
          </IonButtons>
          <IonTitle>공유 해석 상세</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        {loading ? (
          <div style={{textAlign:'center',marginTop:40}}><IonSpinner name="crescent" /> 불러오는 중...</div>
        ) : error ? (
          <div style={{textAlign:'center',marginTop:40,color:'#f44336'}}>{error}</div>
        ) : reading && (
          <div style={{maxWidth:480,margin:'32px auto',padding:'24px',background:'#23272f',borderRadius:12,color:'#fff'}}>
            <div style={{fontWeight:600,fontSize:'1.1em',marginBottom:8}}>{reading.date}</div>
            {reading.type !== 'daily' && (
              <div style={{marginBottom:12}}><b>질문:</b> {reading.question || '-'}</div>
            )}
            {reading.card && (
              <div style={{marginBottom:16, display:'flex', justifyContent:'center'}}>
                <TarotSharedCard card={Array.isArray(reading.card) ? reading.card[0] : reading.card} orientation={(Array.isArray(reading.card) ? reading.card[0]?.direction : reading.card?.direction) || (Array.isArray(reading.card) ? reading.card[0]?.orientation : reading.card?.orientation) || 'upright'} />
              </div>
            )}
            <div style={{marginBottom:16}}><b>해석:</b> {reading.sharedInterpretationContent || '-'}</div>
            {/* 이모티콘(리액션) UI */}
            <div style={{marginBottom:16}}>
              {/* 이모티콘 헤더 */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 8
              }}>
                <div style={{display: 'flex', gap: '8px'}}>
                  {activeEmojis.length > 0 ? (
                    // 선택된 이모티콘들 표시
                    activeEmojis.map(([emoji, count]) => (
                      <button
                        key={emoji}
                        onClick={() => setShowEmojis(!showEmojis)}
                        style={{
                          background: 'none',
                          border: '1px solid #444',
                          borderRadius: '8px',
                          color: '#fff',
                          fontSize: '18px',
                          cursor: 'pointer',
                          padding: '6px 12px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          transition: 'all 0.2s'
                        }}
                      >
                        {emoji}
                        <span style={{
                          fontSize: '14px',
                          color: '#aaa',
                          fontWeight: '500'
                        }}>
                          {count}
                        </span>
                      </button>
                    ))
                  ) : (
                    // 기본 이모티콘만 표시
                    <button
                      onClick={() => setShowEmojis(!showEmojis)}
                      style={{
                        background: 'none',
                        border: '1px solid #444',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: '18px',
                        cursor: 'pointer',
                        padding: '6px 12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        transition: 'all 0.2s'
                      }}
                    >
                      😊
                      <span style={{
                        fontSize: '14px',
                        color: '#aaa',
                        fontWeight: '500'
                      }}>
                        0
                      </span>
                    </button>
                  )}
                </div>
                <span style={{color: '#aaa', fontSize: '14px'}}>
                  댓글 {reading.comments?.length || 0}
                </span>
              </div>

              {/* 이모티콘 슬라이드 영역 */}
              <div style={{
                height: showEmojis ? '44px' : '0px',
                overflow: 'hidden',
                transition: 'height 0.3s ease-in-out',
                marginBottom: showEmojis ? '12px' : '0'
              }}>
                <div style={{
                  display: 'flex',
                  gap: '8px',
                  padding: '4px 0'
                }}>
                  {EMOJIS.map(emoji => {
                    const count = reading.emojis?.filter((e: any) => e.emoji === emoji).length || 0;
                    const isMine = myEmoji === emoji;
                    return (
                      <button
                        key={emoji}
                        onClick={() => handleEmojiClick(emoji)}
                        disabled={sending}
                        style={{
                          fontSize: '18px',
                          background: isMine ? '#ffd700' : '#23272f',
                          color: isMine ? '#23272f' : '#fff',
                          border: '1px solid #444',
                          borderRadius: '8px',
                          padding: '6px 12px',
                          cursor: 'pointer',
                          fontWeight: isMine ? 600 : 400,
                          outline: 'none',
                          transition: 'all 0.2s',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          minWidth: '44px'
                        }}
                      >
                        {emoji}
                        {count > 0 && (
                          <span style={{
                            fontSize: '14px',
                            color: isMine ? '#23272f' : '#aaa',
                            fontWeight: '500'
                          }}>
                            {count}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
            <div style={{marginBottom:16}}>
              <div style={{marginTop:8}}>
                {reading.comments && reading.comments.length > 0 ? (
                  reading.comments.map((c:any,i:number)=>{
                    const isMine = c.userId === user?.id;
                    const isEditing = editCommentId === c.commentId;
                    return (
                      <div key={c.commentId || i} style={{marginBottom:12,padding:'12px 14px',background:'#353945',borderRadius:8}}>
                        {/* 작성자/시간 */}
                        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:4}}>
                          <span style={{fontWeight:600,color:'#ffd700',fontSize:15}}>{isMine ? (user?.nickname || '나') : c.userId || '익명'}</span>
                          <span style={{color:'#aaa',fontSize:12}}>{c.createdAt ? dayjs(c.createdAt).fromNow() : ''}</span>
                        </div>
                        {/* 내용 or 수정 input */}
                        {isEditing ? (
                          <input
                            style={{width:'100%',padding:'6px 10px',borderRadius:6,border:'1px solid #444',background:'#23272f',color:'#fff',marginBottom:6}}
                            value={editCommentInput}
                            onChange={e => setEditCommentInput(e.target.value)}
                            disabled={sending}
                          />
                        ) : (
                          <div style={{color:'#fff',fontSize:15,marginBottom:6,whiteSpace:'pre-line'}}>{c.content || c.text}</div>
                        )}
                        {/* 버튼 영역 */}
                        <div style={{display:'flex',justifyContent:'flex-end',gap:8}}>
                          {isEditing ? (
                            <>
                              <button
                                style={{background:'#6c47ff',color:'#fff',border:'none',borderRadius:4,padding:'4px 14px',fontWeight:600,cursor:'pointer',opacity:sending?0.5:1}}
                                onClick={handleSaveEditComment}
                                disabled={sending || !editCommentInput.trim()}
                              >저장</button>
                              <button
                                style={{background:'#444',color:'#fff',border:'none',borderRadius:4,padding:'4px 14px',fontWeight:600,cursor:'pointer'}}
                                onClick={()=>{setEditCommentId(null);setEditCommentInput('');}}
                                disabled={sending}
                              >취소</button>
                            </>
                          ) : (
                            isMine && !editCommentId && <>
                              <button
                                style={{background:'none',color:'#ffd700',border:'none',borderRadius:4,padding:'2px 12px',fontWeight:600,cursor:'pointer'}}
                                onClick={()=>{setEditCommentId(c.commentId);setEditCommentInput(c.content);}}
                                disabled={sending}
                              >수정</button>
                              <button
                                style={{background:'none',color:'#ff6666',border:'none',borderRadius:4,padding:'2px 12px',fontWeight:600,cursor:'pointer'}}
                                onClick={()=>handleDeleteComment(c.commentId)}
                                disabled={sending}
                              >삭제</button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div style={{color:'#aaa',margin:'8px 0'}}>댓글이 없습니다.</div>
                )}
              </div>
              <div style={{display:'flex',marginTop:12,gap:8}}>
                <input
                  type="text"
                  placeholder="댓글을 입력하세요"
                  style={{flex:1,padding:'8px',borderRadius:6,border:'1px solid #444',background:'#23272f',color:'#fff'}}
                  value={commentInput}
                  onChange={e => setCommentInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !sending) handleAddComment(); }}
                  disabled={sending}
                />
                <button
                  style={{background:'#6c47ff',color:'#fff',border:'none',borderRadius:6,padding:'8px 16px',fontWeight:600,cursor:'pointer',opacity:sending?0.5:1}}
                  onClick={handleAddComment}
                  disabled={sending || !commentInput.trim()}
                >등록</button>
              </div>
            </div>
          </div>
        )}
      </IonContent>
    </IonPage>
  );
};

export default FeedDetailPage; 