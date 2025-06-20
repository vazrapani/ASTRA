import { onRequest } from 'firebase-functions/v2/https';

export const helloTest = onRequest({ region: 'asia-northeast3' }, async (req, res) => {
  console.log('helloTest 함수 진입');
  res.json({ message: 'helloTest OK' });
}); 