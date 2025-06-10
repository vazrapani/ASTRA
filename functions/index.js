/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const {onRequest} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const axios = require('axios');
const functions = require("firebase-functions");

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

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
