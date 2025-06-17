import React, { useEffect, useState, useMemo } from 'react';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonBackButton } from '@ionic/react';
import { useSelector, useDispatch } from 'react-redux';
import { useHistory, useLocation } from 'react-router-dom';
import ReadingSearchBar from './ReadingSearchBar';
import ReadingFilterPopup from './ReadingFilterPopup';
import ReadingListItem from './ReadingListItem';
import { fetchReadings, setFilter, setSearch } from '../../store/slices/readingSlice';
import { AppDispatch } from '../../store';
import styles from './MyReadingList.module.css';
import CommonHeader from '../../components/CommonHeader';

const MyReadingList: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const history = useHistory();
  const location = useLocation<any>();
  const user = useSelector((state: any) => state.auth.user);
  const { readings, loading, filter, search } = useSelector((state: any) => state.reading);
  const [filterOpen, setFilterOpen] = useState(false);
  const unreadCount = location.state?.unreadCount ?? 0;
  const onClickNotification = location.state?.onClickNotification ?? (() => {});

  useEffect(() => {
    if (user?.id) dispatch(fetchReadings(user.id));
  }, [user, dispatch]);

  // 검색/필터 적용된 목록
  const filtered = useMemo(() => {
    let list = readings;
    // 기간 필터(간단 예시, 실제는 날짜 계산 필요)
    if (filter.period !== '전체') {
      // TODO: 기간별 필터 구현
    }
    if (filter.category !== '전체') {
      list = list.filter((r: any) => r.category === filter.category);
    }
    if (search) {
      list = list.filter((r: any) => r.initialQuestion.includes(search));
    }
    return list;
  }, [readings, filter, search]);

  return (
    <IonPage>
      <CommonHeader title="내 리딩 목록" backHref="/tabs/my" unreadCount={unreadCount} onClickNotification={onClickNotification} />
      <IonContent className="ion-padding">
        <div className="myReadingListTopBar">
          <div className={styles.topBarFlex}>
            <ReadingSearchBar
              value={search}
              onChange={v => dispatch(setSearch(v))}
              onSearch={() => {}}
              resultCount={filtered.length}
            />
            <IonButton onClick={() => setFilterOpen(true)} className="myReadingListFilterBtn">필터</IonButton>
          </div>
        </div>
        <ReadingFilterPopup
          open={filterOpen}
          period={filter.period}
          category={filter.category}
          onChange={v => dispatch(setFilter(v))}
          onClose={() => setFilterOpen(false)}
          onReset={() => dispatch(setFilter({ period: '전체', category: '전체' }))}
          onApply={() => setFilterOpen(false)}
        />
        {loading ? (
          <div className="myReadingListLoading">불러오는 중...</div>
        ) : filtered.length === 0 ? (
          <div className="myReadingListEmpty">저장된 타로 리딩 기록이 없습니다.</div>
        ) : (
          filtered.map((r: any) => (
            <ReadingListItem
              key={r.readingId}
              date={new Date(r.createdAt).toLocaleString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              question={r.initialQuestion.length > 30 ? r.initialQuestion.slice(0, 30) + '...' : r.initialQuestion}
              cardImage={r.cardsDrawn?.[r.representativeCardIndex ?? 0]?.imageUrl || '/assets/card_default.png'}
              cardCount={r.cardsDrawn?.length || 0}
              rating={r.conversationTurns?.[0]?.ownerFeedback?.rating}
              onClick={() => history.push(`/tabs/my/readings/${r.readingId}`)}
            />
          ))
        )}
      </IonContent>
    </IonPage>
  );
};
export default MyReadingList; 