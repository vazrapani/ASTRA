import { IonPage } from '@ionic/react';
import React from 'react';
import { useSelector } from 'react-redux';
import CommonHeader from '../../components/CommonHeader';
import InquiryForm from '../../components/InquiryForm';
import { submitInquiry } from '../../services/inquiryService';
import { useHistory } from 'react-router-dom';

interface ContactPageProps {
  unreadCount?: number;
}

const ContactPage: React.FC<ContactPageProps> = ({ unreadCount }) => {
  const user = useSelector((state: any) => state.auth.user);
  const history = useHistory();
  return (
    <IonPage>
      <CommonHeader title="문의하기" backHref="/tabs/my" unreadCount={unreadCount} />
      <InquiryForm onSubmit={submitInquiry} userEmail={user?.email} />
    </IonPage>
  );
};

export default ContactPage; 