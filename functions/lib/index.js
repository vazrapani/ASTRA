"use strict";
/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */
const { onRequest } = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const admin = require("firebase-admin");
const fetchFromNode = require("node-fetch");
admin.initializeApp();
const cors = require('cors')({ origin: true });
// 사용자의 질문을 분석하여 가장 적절한 타로 스프레드를 추천
exports.analyzeQuestion = onRequest({ region: 'asia-northeast3' }, (req, res) => {
    cors(req, res, async () => {
        try {
            const { question } = req.body;
            if (!question) {
                res.status(400).send('Question is required');
                return;
            }
            const prompt = `당신은 타로 전문가입니다. 사용자의 질문을 분석하여 가장 적절한 타로 카드 장수를 "one", "three", "five", "seven" 중 하나로만 추천해주세요. 다른 설명은 절대 추가하지 마세요. 질문: "${question}"`;
            const apiKey = process.env.GEMINI_API_KEY;
            const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;
            const response = await fetchFromNode(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                            parts: [{
                                    text: prompt
                                }]
                        }]
                }),
            });
            if (!response.ok) {
                const errorText = await response.text();
                logger.error("API call failed", { status: response.status, text: errorText });
                res.status(response.status).send(errorText);
                return;
            }
            const data = await response.json();
            if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts || !data.candidates[0].content.parts[0]) {
                logger.error("Invalid response structure from Gemini API", { data });
                res.status(500).send('Invalid API response structure');
                return;
            }
            const recommendedSpread = data.candidates[0].content.parts[0].text.trim().toLowerCase();
            const validSpreads = ['one', 'three', 'five', 'seven'];
            const finalSpread = validSpreads.includes(recommendedSpread) ? recommendedSpread : 'three';
            res.json({ recommendedSpread: finalSpread });
        }
        catch (error) {
            logger.error("Error in analyzeQuestion", error);
            res.status(500).send('Internal Server Error');
        }
    });
});
// 한 장의 카드 해석 (일일 타로용)
exports.geminiInterpret = onRequest({ region: 'asia-northeast3' }, (req, res) => {
    cors(req, res, async () => {
        var _a, _b, _c, _d, _e;
        try {
            const { cardName, cardDesc, orientation, userQuestion } = req.body;
            if (!cardName || !cardDesc || !orientation) {
                res.status(400).json({ error: 'Missing required parameters: cardName, cardDesc, orientation' });
                return;
            }
            const prompt = `당신은 친근하고 통찰력 있는 타로 리더입니다. 아래 정보를 참고해, 카드의 본래 의미(정방향/역방향)를 존중하되 너무 부정적이거나 불안감을 주는 표현은 피하고, 현실적이면서도 따뜻한 조언을 2~3문장 이내의 한글로 전달하세요.\n\n카드: ${cardName}\n설명: ${cardDesc}\n방향: ${orientation}\n질문: ${userQuestion || '오늘의 운세'}\n\n위 정보를 참고해, 카드의 본래 의미와 방향을 바탕으로 운세 메시지를 작성하세요. 불필요한 서문, 면책 조항, 과도한 설명 없이 오직 운세 메시지만 출력하세요.`;
            const apiKey = process.env.GEMINI_API_KEY;
            const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;
            const response = await fetchFromNode(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                            parts: [{ text: prompt }]
                        }]
                }),
            });
            if (!response.ok) {
                const errorText = await response.text();
                logger.error("API call failed", { status: response.status, text: errorText });
                res.status(response.status).send(errorText);
                return;
            }
            const data = await response.json();
            // Gemini 응답의 날것 텍스트와 전체 데이터를 모두 로그로 남김
            let rawText = '';
            try {
                rawText = ((_e = (_d = (_c = (_b = (_a = data.candidates) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.content) === null || _c === void 0 ? void 0 : _c.parts) === null || _d === void 0 ? void 0 : _d[0]) === null || _e === void 0 ? void 0 : _e.text) || '';
                logger.info('Gemini Raw Response Received:', { rawText });
                logger.info('Gemini Raw Response Full Data:', { data });
                if (!rawText) {
                    logger.warn('Gemini 응답이 비어 있습니다.', { data });
                }
            }
            catch (e) {
                logger.error('Gemini 응답 파싱 실패', e);
            }
            if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts || !data.candidates[0].content.parts[0]) {
                logger.error("Invalid response structure from Gemini API", { data });
                res.status(500).send('Invalid API response structure');
                return;
            }
            const interpretation = data.candidates[0].content.parts[0].text.trim();
            res.json({ interpretation });
        }
        catch (error) {
            logger.error("Error in geminiInterpret", error);
            res.status(500).send('Internal Server Error');
        }
    });
});
// 여러 장의 카드 해석 (심층 타로용)
exports.interpretMultipleCards = onRequest({ region: 'asia-northeast3', timeoutSeconds: 300 }, (req, res) => {
    cors(req, res, async () => {
        var _a, _b, _c, _d, _e;
        try {
            const { cards, question } = req.body;
            if (!cards || !question || !Array.isArray(cards) || cards.length === 0) {
                res.status(400).send('Cards (array) and question (string) are required');
                return;
            }
            const cardInfo = cards.map((c) => `${c.name}(${c.orientation})`).join(', ');
            // const cardDetails = cards.map((c: any) => `카드: ${c.name}, 방향: ${c.orientation}, 기본 의미: ${c.desc}`).join('\n');
            const prompt = `당신은 사용자에게 타로 해석을 제공하는 전문 리더입니다.\n응답은 오직 다음 Markdown 섹션들로만 구성되어야 합니다.\n어떠한 서문, 결론, 추가 설명, 또는 불필요한 단어도 허용되지 않습니다.\n모든 섹션(#### 해석 요약, #### 상세 해석, #### 조언/핵심 메시지)은 반드시 포함되어야 합니다.\n내용이 없더라도 '(없음)'으로 표시해주세요.\n헤더 레벨은 오직 #### 만 사용해야 합니다.\n\n아래는 출력 예시입니다.\n\n질문: 직장 언제 취하나\n카드: 컵4(upright)\n#### 해석 요약\n기회가 곧 다가오지만, 현재는 내면에 집중할 시기입니다.\n#### 상세 해석\n컵4 카드는 권태와 무관심을 의미합니다. 지금은 주변의 기회를 잘 인식하지 못할 수 있습니다. 하지만 내면을 돌아보고 마음을 정리하면 곧 좋은 소식이 찾아올 것입니다.\n#### 조언/핵심 메시지\n지금은 조급해하지 말고, 자신을 돌보는 시간을 가지세요.\n\n---\n질문: 연애운\n카드: 연인(역방향)\n#### 해석 요약\n관계에 오해가 생길 수 있습니다.\n#### 상세 해석\n연인 카드의 역방향은 소통의 단절이나 감정의 혼란을 의미합니다. 상대방과의 대화가 중요합니다.\n#### 조언/핵심 메시지\n솔직한 마음을 표현하세요.\n\n---\n\n아래는 실제 해석에 사용할 정보입니다.\n\n질문: ${question}\n카드: ${cardInfo}\n\n#### 해석 요약\n(여기에 2-3문장으로 전체 해석의 핵심을 요약)\n\n#### 상세 해석\n(여기에 전체적인 상황 분석, 카드 간의 연결고리, 문제의 원인, 과정, 미래의 가능성 등을 구체적으로 서술)\n\n#### 조언/핵심 메시지\n(여기에 사용자가 실천할 수 있는 현실적인 조언이나, 이 리딩의 가장 중요한 메시지를 명확하게 전달)\n`;
            const apiKey = process.env.GEMINI_API_KEY;
            const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;
            const response = await fetchFromNode(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                            parts: [{ text: prompt }]
                        }]
                }),
            });
            if (!response.ok) {
                const errorText = await response.text();
                logger.error("API call failed", { status: response.status, text: errorText });
                res.status(response.status).send(errorText);
                return;
            }
            const data = await response.json();
            // Gemini 응답의 날것 텍스트와 전체 데이터를 모두 로그로 남김
            let rawText = '';
            try {
                rawText = ((_e = (_d = (_c = (_b = (_a = data.candidates) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.content) === null || _c === void 0 ? void 0 : _c.parts) === null || _d === void 0 ? void 0 : _d[0]) === null || _e === void 0 ? void 0 : _e.text) || '';
                logger.info('Gemini Raw Response Received:', { rawText });
                logger.info('Gemini Raw Response Full Data:', { data });
                if (!rawText) {
                    logger.warn('Gemini 응답이 비어 있습니다.', { data });
                }
            }
            catch (e) {
                logger.error('Gemini 응답 파싱 실패', e);
            }
            if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts || !data.candidates[0].content.parts[0]) {
                logger.error("Invalid response structure from Gemini API", { data });
                res.status(500).send('Invalid API response structure');
                return;
            }
            const interpretation = data.candidates[0].content.parts[0].text.trim();
            res.json({ interpretation });
        }
        catch (error) {
            logger.error("Error in interpretMultipleCards", error);
            res.status(500).send('Internal Server Error');
        }
    });
});
// 문의하기 (HTTP 요청, SendGrid 이메일 발송 포함)
exports.submitInquiryHttp = onRequest({ region: 'asia-northeast3', secrets: ["SENDGRID_API_KEY", "CONTACT_RECEIVER_EMAIL"] }, (req, res) => {
    cors(req, res, async () => {
        try {
            const { email, title, content } = req.body;
            if (!email || !title || !content) {
                logger.error('submitInquiryHttp: Missing required fields', { body: req.body });
                res.status(400).json({ error: '필수 항목이 누락되었습니다.' });
                return;
            }
            // 1. Firestore에 문의 내용 저장
            const inquiryRef = await admin.firestore().collection('inquiries').add({
                email,
                title,
                content,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                status: 'received' // '대기' 대신 'received' 사용
            });
            // 2. SendGrid를 통해 이메일 발송
            const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
            const CONTACT_RECEIVER_EMAIL = process.env.CONTACT_RECEIVER_EMAIL;
            if (!SENDGRID_API_KEY || !CONTACT_RECEIVER_EMAIL) {
                logger.error('submitInquiryHttp: SendGrid environment variables are not set.');
                // 사용자에게는 실패 사실만 알리고, 서버 에러로 처리
                res.status(500).json({ error: '문의를 처리하는 중 오류가 발생했습니다.' });
                return;
            }
            const emailData = {
                personalizations: [{
                        to: [{ email: CONTACT_RECEIVER_EMAIL }],
                        subject: `[Astra Tarot 문의] ${title}`
                    }],
                from: { email: 'no-reply@astratarot.com', name: 'Astra Tarot' },
                reply_to: { email: email, name: email },
                content: [{
                        type: 'text/plain',
                        value: `[문의자 정보]\n- 이메일: ${email}\n\n[문의 내용]\n- 제목: ${title}\n- 내용:\n${content}`
                    }]
            };
            const response = await fetchFromNode('https://api.sendgrid.com/v3/mail/send', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${SENDGRID_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(emailData)
            });
            if (!response.ok) {
                const errorText = await response.text();
                logger.error('submitInquiryHttp: Failed to send email via SendGrid', { status: response.status, statusText: response.statusText, body: errorText });
                // 이메일 발송이 실패해도 Firestore 저장은 성공했으므로 사용자에게는 성공으로 응답
                // 다만, 내부적으로는 에러를 인지해야 함
            }
            res.status(200).json({ success: true, id: inquiryRef.id });
        }
        catch (error) {
            logger.error('submitInquiryHttp: An unexpected error occurred.', error);
            res.status(500).json({ error: '문의 처리 중 예기치 않은 오류가 발생했습니다.' });
        }
    });
});
//# sourceMappingURL=index.js.map