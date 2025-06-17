import { getFunctions } from 'firebase/functions';

export async function submitInquiry(data: { email: string; title: string; content: string }) {
  console.log('🔥 inquiryService.ts 실제 실행!', data);
  
  const response = await fetch('https://asia-northeast3-astrt-e152b.cloudfunctions.net/submitInquiryHttp', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || '문의 전송 실패');
  }

  const result = await response.json();
  if (!result?.success) {
    throw new Error('문의 전송 실패');
  }
  return;
} 