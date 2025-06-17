"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendInquiryReply = exports.dailyTarotReset = void 0;
const https_1 = require("firebase-functions/v2/https");
const scheduler_1 = require("firebase-functions/v2/scheduler");
const admin = __importStar(require("firebase-admin"));
// Admin SDK 초기화
admin.initializeApp();
// 매일 00시에 실행되는 일일 타로 초기화 및 알림 함수
exports.dailyTarotReset = (0, scheduler_1.onSchedule)({
    schedule: '0 0 * * *',
    timeZone: 'Asia/Seoul',
    region: 'asia-northeast3'
}, async (_event) => {
    const db = admin.firestore();
    const messaging = admin.messaging();
    try {
        // 1. 활성 사용자 목록 가져오기
        const usersSnapshot = await db.collection('users')
            .where('isActive', '==', true)
            .get();
        const batch = db.batch();
        const notifications = [];
        const messages = [];
        usersSnapshot.forEach(doc => {
            var _a;
            const userId = doc.id;
            const userRef = db.collection('users').doc(userId);
            // 2. 일일 타로 상태 초기화
            batch.update(userRef, {
                lastDailyTarot: null
            });
            // 3. 앱 내 알림 생성
            const notification = {
                userId,
                type: 'daily_tarot',
                message: '오늘의 타로를 확인해보세요!',
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                read: false
            };
            notifications.push(notification);
            // 4. FCM 메시지 준비
            if ((_a = doc.data()) === null || _a === void 0 ? void 0 : _a.fcmToken) {
                messages.push({
                    token: doc.data().fcmToken,
                    notification: {
                        title: '아스트라 타로',
                        body: '오늘의 운세를 확인해보세요!'
                    },
                    data: {
                        type: 'daily_tarot'
                    },
                    android: {
                        priority: 'high',
                        notification: {
                            channelId: 'daily_tarot'
                        }
                    },
                    apns: {
                        payload: {
                            aps: {
                                sound: 'default'
                            }
                        }
                    }
                });
            }
        });
        // 5. 일괄 처리 실행
        await batch.commit();
        // 6. 앱 내 알림 저장
        const notificationPromises = notifications.map(notification => db.collection('notifications').add(notification));
        await Promise.all(notificationPromises);
        // 7. FCM 메시지 전송 (최대 500개씩 분할 전송)
        for (let i = 0; i < messages.length; i += 500) {
            const batch = messages.slice(i, i + 500);
            if (batch.length > 0) {
                const response = await messaging.sendAll(batch);
                console.log('Successfully sent messages:', response.successCount);
                if (response.failureCount > 0) {
                    console.error('Failed to send some messages:', response.responses.filter(r => !r.success));
                }
            }
        }
        console.log('Daily tarot reset completed successfully');
    }
    catch (error) {
        console.error('Daily tarot reset failed:', error);
        throw error;
    }
});
exports.sendInquiryReply = (0, https_1.onCall)({ region: "asia-northeast3" }, async (request) => {
    const { inquiryId, replyContent, recipientEmail, originalTitle, originalContent } = request.data;
    if (!inquiryId || !replyContent || !recipientEmail || !originalTitle || !originalContent) {
        throw new Error('Missing required parameters');
    }
    const msg = {
        to: recipientEmail,
        from: process.env.SENDGRID_SENDER_EMAIL || 'noreply@astrotarot.com',
        subject: `[아스트라 타로] 문의하신 내용에 대한 답변입니다: ${originalTitle}`,
        html: `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <h2 style="color: #333;">문의하신 내용에 대한 답변입니다</h2>
        
        <div style="margin: 20px 0; padding: 15px; background: #f5f5f5; border-radius: 5px;">
          <h3 style="margin: 0 0 10px 0; color: #666;">문의 내용</h3>
          <p style="margin: 0; white-space: pre-wrap;">${originalContent}</p>
        </div>
        
        <div style="margin: 20px 0; padding: 15px; background: #e8f0fe; border-radius: 5px;">
          <h3 style="margin: 0 0 10px 0; color: #1a73e8;">답변 내용</h3>
          <p style="margin: 0; white-space: pre-wrap;">${replyContent}</p>
        </div>
        
        <p style="color: #666; font-size: 14px; margin-top: 30px;">
          추가 문의사항이 있으시면 언제든 문의하기를 통해 문의해 주세요.<br>
          감사합니다.
        </p>
      </div>
    `,
    };
    try {
        await sgMail.send(msg);
        return { success: true };
    }
    catch (error) {
        console.error('SendGrid error:', error);
        throw new Error('Failed to send email');
    }
});
//# sourceMappingURL=index.js.map