/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const {onRequest, onCall} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const axios = require('axios');
const functions = require("firebase-functions");
const admin = require('firebase-admin');
const express = require('express');
const cors = require('cors');

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

if (!admin.apps.length) {
  admin.initializeApp();
}

exports.geminiInterpret = onRequest({ region: 'asia-northeast3' }, async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }
  try {
    const { cardName, cardDesc, userQuestion } = req.body;
    const prompt = `타로 카드: ${cardName}\n의미: ${cardDesc}\n질문: ${userQuestion || '없음'}\n위 내용을 바탕으로 친절하고 구체적으로 타로 해석을 해줘.`;
    const apiKey = process.env.GEMINI_API_KEY || functions.config().gemini.apikey;
    if (!apiKey) {
      res.status(500).json({ error: 'Gemini API 키가 설정되지 않았습니다.' });
      return;
    }
    const geminiRes = await axios.post(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
      {
        contents: [{ parts: [{ text: prompt }] }]
      },
      {
        params: { key: apiKey },
        headers: { 'Content-Type': 'application/json' }
      }
    );
    const result = geminiRes.data.candidates?.[0]?.content?.parts?.[0]?.text || 'AI 해석 결과를 가져오지 못했습니다.';
    res.json({ result });
  } catch (err) {
    console.error('Gemini API Error:', err);
    res.status(500).json({ error: 'Gemini API 호출 실패', detail: err.message });
  }
});

exports.naverAuthCallback = onRequest({ region: 'asia-northeast3' }, async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }
  try {
    const NAVER_CLIENT_ID = process.env.VITE_NAVER_CLIENT_ID;
    const NAVER_CLIENT_SECRET = process.env.VITE_NAVER_CLIENT_SECRET;
    const NAVER_REDIRECT_URI = process.env.VITE_NAVER_REDIRECT_URI;
    const { code, state } = req.body;
    if (!code) {
      res.status(400).json({ error: 'code가 필요합니다.' });
      return;
    }
    // 1. 네이버 access_token 요청
    const tokenRes = await axios.post('https://nid.naver.com/oauth2.0/token', null, {
      params: {
        grant_type: 'authorization_code',
        client_id: NAVER_CLIENT_ID,
        client_secret: NAVER_CLIENT_SECRET,
        code,
        state,
        redirect_uri: NAVER_REDIRECT_URI
      }
    });
    const { access_token } = tokenRes.data;
    if (!access_token) {
      console.error('네이버 access_token 발급 실패:', tokenRes.data);
      res.status(400).json({ error: '네이버 access_token 발급 실패', detail: tokenRes.data });
      return;
    }
    // 2. 네이버 사용자 정보 요청
    const profileRes = await axios.get('https://openapi.naver.com/v1/nid/me', {
      headers: { Authorization: `Bearer ${access_token}` }
    });
    const naverUser = profileRes.data.response;
    if (!naverUser || !naverUser.id) {
      res.status(400).json({ error: '네이버 사용자 정보 조회 실패', detail: profileRes.data });
      return;
    }
    // 3. Firebase Custom Token 발급
    const firebaseUid = `naver:${naverUser.id}`;
    const customToken = await admin.auth().createCustomToken(firebaseUid, {
      provider: 'naver',
      email: naverUser.email || '',
      name: naverUser.nickname || '',
      profile_image: naverUser.profile_image || ''
    });
    res.json({ customToken });
  } catch (err) {
    console.error('Naver Auth Error:', err);
    res.status(500).json({ error: '네이버 인증 처리 실패', detail: err.message });
  }
});

exports.submitInquiry = onRequest({ region: 'asia-northeast3' }, async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  const { email, title, content } = req.body;
  if (!email || !title || !content) {
    res.status(400).json({ error: '필수 항목 누락' });
    return;
  }

  try {
    // 1. Firestore 저장
    const docRef = await admin.firestore().collection('inquiries').add({
      email,
      title,
      content,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      status: '대기'
    });

    // 2. SendGrid 이메일 발송
    const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
    const TO_EMAIL = process.env.CONTACT_RECEIVER_EMAIL;
    if (!SENDGRID_API_KEY || !TO_EMAIL) {
      res.status(500).json({ error: '이메일 환경변수 미설정' });
      return;
    }

    const sgRes = await axios.post(
      'https://api.sendgrid.com/v3/mail/send',
      {
        personalizations: [
          {
            to: [{ email: TO_EMAIL }],
            subject: `[Astra Tarot 문의] ${title}`
          }
        ],
        from: { email: email },
        content: [
          {
            type: 'text/plain',
            value: `문의자: ${email}\n제목: ${title}\n내용: ${content}`
          }
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${SENDGRID_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    res.json({ success: true, id: docRef.id });
  } catch (err) {
    console.error('문의 저장/이메일 발송 실패:', err);
    res.status(500).json({ error: '문의 저장/이메일 발송 실패', detail: err.message });
  }
});

exports.submitInquiryHttp = onRequest({ region: 'asia-northeast3', secrets: ["SENDGRID_API_KEY", "CONTACT_RECEIVER_EMAIL"] }, async (req, res) => {
  // CORS 헤더 설정
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  console.log('Request body:', req.body);  // 요청 body 로깅

  try {
    const { email, title, content } = req.body || {};
    console.log('Parsed data:', { email, title, content });  // 파싱된 데이터 로깅

    if (!email || !title || !content) {
      console.log('Missing required fields');  // 필수 필드 누락 로깅
      res.status(400).json({ error: '필수 항목 누락' });
      return;
    }

    // 1. Firestore 저장
    const docRef = await admin.firestore().collection('inquiries').add({
      email,
      title,
      content,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      status: '대기'
    });

    // 2. SendGrid 이메일 발송
    const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
    const TO_EMAIL = process.env.CONTACT_RECEIVER_EMAIL;
    
    console.log('Environment variables loaded:', { hasApiKey: !!SENDGRID_API_KEY, hasToEmail: !!TO_EMAIL });

    if (!SENDGRID_API_KEY || !TO_EMAIL) {
      console.log('Missing email environment variables');  // 환경변수 누락 로깅
      res.status(500).json({ error: '이메일 환경변수 미설정' });
      return;
    }

    const sgRes = await axios.post(
      'https://api.sendgrid.com/v3/mail/send',
      {
        personalizations: [
          {
            to: [{ email: TO_EMAIL }],
            subject: `[Astra Tarot 문의] ${title}`
          }
        ],
        from: { email: email },
        content: [
          {
            type: 'text/plain',
            value: `문의자: ${email}\n제목: ${title}\n내용: ${content}`
          }
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${SENDGRID_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    res.json({ success: true, id: docRef.id });
  } catch (err) {
    console.error('문의 저장/이메일 발송 실패:', err);  // 상세 에러 로깅
    res.status(500).json({ error: '문의 저장/이메일 발송 실패', detail: err.message });
  }
});
