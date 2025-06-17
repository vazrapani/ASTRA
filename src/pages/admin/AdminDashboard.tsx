import React, { useState, useEffect } from 'react';
import {
  IonPage,
  IonContent,
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonList,
  IonItem,
  IonLabel,
  IonBadge,
  IonIcon,
  IonButton,
  IonRefresher,
  IonRefresherContent,
  RefresherEventDetail,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonMenuButton
} from '@ionic/react';
import {
  peopleOutline,
  bookOutline,
  starOutline,
  timeOutline,
  trendingUpOutline
} from 'ionicons/icons';
import { getAllUsers, User } from '../../services/firebase/userService';
import { getAllReadings, Reading } from '../../services/firebase/readingService';
import { getNoticeList } from '../../services/firebase/noticeService';
import { Notice } from '../../types/notice';
import CommonHeader from '../../components/CommonHeader';
import { useHistory } from 'react-router-dom';
import styles from './AdminDashboard.module.css';

interface DashboardStats {
  totalUsers: number;
  totalReadings: number;
  averageRating: number;
  activeUsers: number;
}

interface ReadingWithRating extends Reading {
  rating?: number;
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalReadings: 0,
    averageRating: 0,
    activeUsers: 0
  });
  const [recentUsers, setRecentUsers] = useState<User[]>([]);
  const [recentReadings, setRecentReadings] = useState<ReadingWithRating[]>([]);
  const [recentNotices, setRecentNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const history = useHistory();

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // 사용자 데이터 로드
      const users = await getAllUsers();
      const readings = await getAllReadings();
      
      // 통계 계산
      const totalUsers = users.length;
      const totalReadings = readings.length;
      const ratings = readings
        .map((r: ReadingWithRating) => r.rating)
        .filter((r): r is number => r !== undefined);
      const averageRating = ratings.length > 0 
        ? ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length 
        : 0;
      
      // 최근 24시간 내 활성 사용자 수 계산
      const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
      const activeUsers = readings.filter((r: Reading) => r.createdAt > oneDayAgo).length;

      setStats({
        totalUsers,
        totalReadings,
        averageRating,
        activeUsers
      });

      // 최근 사용자 및 리딩 설정
      setRecentUsers(users.sort((a: User, b: User) => b.createdAt - a.createdAt).slice(0, 5));
      setRecentReadings(readings.sort((a: Reading, b: Reading) => b.createdAt - a.createdAt).slice(0, 5));

      // 최근 공지 불러오기
      const notices = await getNoticeList();
      setRecentNotices(notices.slice(0, 3));
    } catch (error) {
      console.error('대시보드 데이터 로드 중 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(() => {
      loadDashboardData();
    }, 10000); // 10초마다 자동 새로고침
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = async (event: CustomEvent<RefresherEventDetail>) => {
    await loadDashboardData();
    event.detail.complete();
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <IonPage>
      <CommonHeader title="관리자 대시보드" backHref="/admin" onClickBack={() => history.goBack()} />
      <IonContent>
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent />
        </IonRefresher>

        <IonGrid>
          <IonRow>
            <IonCol size="12" className={`${styles.textRight} ${styles.marginBottom8}`}>
              <IonButton size="small" onClick={loadDashboardData} disabled={loading}>
                {loading ? '새로고침 중...' : '새로고침'}
              </IonButton>
            </IonCol>
          </IonRow>
          {/* 통계 카드 섹션 */}
          <IonRow>
            <IonCol size="6" sizeMd="3">
              <IonCard>
                <IonCardContent className="ion-text-center">
                  <IonIcon icon={peopleOutline} className={`${styles.icon2rem} ${styles.iconPrimary}`} />
                  <h2>{stats.totalUsers}</h2>
                  <p>총 사용자</p>
                </IonCardContent>
              </IonCard>
            </IonCol>
            <IonCol size="6" sizeMd="3">
              <IonCard>
                <IonCardContent className="ion-text-center">
                  <IonIcon icon={bookOutline} className={`${styles.icon2rem} ${styles.iconSecondary}`} />
                  <h2>{stats.totalReadings}</h2>
                  <p>총 리딩</p>
                </IonCardContent>
              </IonCard>
            </IonCol>
            <IonCol size="6" sizeMd="3">
              <IonCard>
                <IonCardContent className="ion-text-center">
                  <IonIcon icon={starOutline} className={`${styles.icon2rem} ${styles.iconWarning}`} />
                  <h2>{stats.averageRating.toFixed(1)}</h2>
                  <p>평균 평점</p>
                </IonCardContent>
              </IonCard>
            </IonCol>
            <IonCol size="6" sizeMd="3">
              <IonCard>
                <IonCardContent className="ion-text-center">
                  <IonIcon icon={trendingUpOutline} className={`${styles.icon2rem} ${styles.iconSuccess}`} />
                  <h2>{stats.activeUsers}</h2>
                  <p>활성 사용자</p>
                </IonCardContent>
              </IonCard>
            </IonCol>
          </IonRow>

          {/* 최근 리딩 섹션 */}
          <IonRow>
            <IonCol size="12" sizeMd="6">
              <IonCard>
                <IonCardHeader>
                  <IonCardTitle>최근 리딩</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  <IonList>
                    {recentReadings.map(reading => (
                      <IonItem key={reading.readingId}>
                        <IonLabel>
                          <h3>{reading.initialQuestion}</h3>
                          <p>{formatDate(reading.createdAt)}</p>
                        </IonLabel>
                        {reading.rating && (
                          <IonBadge slot="end" color="warning">
                            {reading.rating}점
                          </IonBadge>
                        )}
                      </IonItem>
                    ))}
                  </IonList>
                  <IonButton expand="block" fill="clear">
                    모든 리딩 보기
                  </IonButton>
                </IonCardContent>
              </IonCard>
            </IonCol>

            {/* 최근 공지 섹션 */}
            <IonCol size="12" sizeMd="6">
              <IonCard>
                <IonCardHeader>
                  <IonCardTitle>최근 공지</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  <IonList>
                    {recentNotices.length === 0 && <IonItem><IonLabel>공지 없음</IonLabel></IonItem>}
                    {recentNotices.map(notice => (
                      <IonItem key={notice.noticeId}>
                        <IonLabel>
                          <h3>{notice.title}</h3>
                          <p>{notice.category} | {formatDate(notice.createdAt)}</p>
                        </IonLabel>
                      </IonItem>
                    ))}
                  </IonList>
                  <IonButton expand="block" fill="clear" routerLink="/admin/notices">모든 공지 보기</IonButton>
                </IonCardContent>
              </IonCard>
            </IonCol>
          </IonRow>

          {/* 최근 사용자 섹션 */}
          <IonRow>
            <IonCol size="12" sizeMd="6">
              <IonCard>
                <IonCardHeader>
                  <IonCardTitle>최근 가입한 사용자</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  <IonList>
                    {recentUsers.map(user => (
                      <IonItem key={user.id}>
                        <IonLabel>
                          <h3>{user.displayName || '이름 없음'}</h3>
                          <p>{formatDate(user.createdAt)}</p>
                        </IonLabel>
                        <IonIcon icon={timeOutline} slot="end" />
                      </IonItem>
                    ))}
                  </IonList>
                  <IonButton expand="block" fill="clear">
                    모든 사용자 보기
                  </IonButton>
                </IonCardContent>
              </IonCard>
            </IonCol>
          </IonRow>

          {/* 시스템 상태 섹션 */}
          <IonRow>
            <IonCol>
              <IonCard>
                <IonCardHeader>
                  <IonCardTitle>시스템 상태</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  <IonList>
                    <IonItem>
                      <IonLabel>서버 상태</IonLabel>
                      <IonBadge color="success">정상</IonBadge>
                    </IonItem>
                    <IonItem>
                      <IonLabel>마지막 업데이트</IonLabel>
                      <IonLabel slot="end">{formatDate(Date.now())}</IonLabel>
                    </IonItem>
                  </IonList>
                </IonCardContent>
              </IonCard>
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default AdminDashboard; 