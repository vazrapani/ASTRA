import { IonPage } from '@ionic/react';
import React from 'react';
import CommonHeader from '../../components/CommonHeader';
import { useHistory } from 'react-router-dom';
import styles from './InfoPage.module.css';

interface InfoPageProps {
  unreadCount?: number;
}

const InfoPage: React.FC<InfoPageProps> = ({ unreadCount }) => {
  const history = useHistory();

  return (
    <IonPage>
      <CommonHeader title="정보" backHref="/tabs/my" unreadCount={unreadCount} />
      <div className={styles.infoContainer}>
        <h2 className={styles.sectionTitle}>제작자 정보</h2>
        <div className={styles.authorInfo}>
          <b>제작자:</b> 홍길동<br/>
          <b>이메일:</b> example@email.com<br/>
          <b>버전:</b> v0.1.0<br/>
        </div>
        <h2 className={styles.sectionTitle}>서비스 약관 (임시)</h2>
        <div className={styles.termsText}>
          본 서비스는 테스트용으로 제공되며, 실제 상담, 의료, 법률 자문이 아닙니다.\n
          사용자의 개인정보는 서비스 개선 및 운영 목적으로만 활용됩니다.\n
          서비스 이용 중 발생하는 모든 책임은 사용자 본인에게 있습니다.\n
          기타 문의사항은 제작자 이메일로 연락 바랍니다.
        </div>
      </div>
    </IonPage>
  );
};

export default InfoPage; 