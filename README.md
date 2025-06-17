# Astra Tarot

내면의 지혜를 밝히는 판타지 타로 앱

## 스타일 관리 원칙

- 인라인 style 속성 사용 금지 (예외 없음)
- 모든 스타일은 컴포넌트 전용 .module.css 파일에 작성
- 공통 색상, 폰트, spacing 등은 src/theme/variables.css에서 관리
- 공통 UI(헤더, 버튼 등)는 공통 컴포넌트 + 공통 CSS로만 관리
- 기존 인라인 스타일 발견 시 즉시 .module.css로 이전
- 스타일 관련 논의/변경 사항은 README에 기록

## 프로젝트 개요

Astra Tarot은 대규모 언어 모델(LLM)을 활용하여 개인화된 타로 해석을 제공하고, 친구 간의 소셜 교류를 지원하는 하이브리드 웹 앱입니다.

## 기술 스택

### Frontend
- Ionic + React + TypeScript
- 상태 관리: Redux Toolkit
- 스타일링: Styled Components
- 빌드 도구: Vite

### Backend (로컬 개발 / 프로덕션)
- 로컬 개발:
  - IndexedDB (데이터 저장)
  - LocalStorage (사용자 설정)
  - 로컬 인증 시스템
- 프로덕션 (Firebase):
  - Authentication
  - Cloud Firestore
  - Cloud Functions
  - Hosting
  - FCM

### LLM
- Google Gemini 1.5 Flash API

### 인증 제공자
- 로컬 개발: 기본 인증
- 프로덕션: Google, Naver, Kakao, LINE

## 개발 환경 설정

### 1. 필수 요구사항
- Node.js (v18 이상)
- npm 또는 yarn
- Git
- Ionic CLI

### 2. 로컬 개발 환경 설정
1. 프로젝트 클론
2. 의존성 설치: `npm install`
3. 환경 변수 설정:
   - `.env.development` 파일 생성
   - 필요한 API 키 설정
4. 개발 서버 실행: `npm run dev`

### 3. 프로덕션 환경 설정 (Firebase)
1. Firebase 프로젝트 생성
2. Firebase CLI 설치: `npm install -g firebase-tools`
3. Firebase 로그인: `firebase login`
4. 프로젝트 초기화: `firebase init`
5. 환경 변수 설정:
   - `.env.production` 파일 생성
   - Firebase 설정 정보 입력

## 주요 기능

### 1. 사용자 인증 및 프로필
- 로컬/소셜 로그인
- 게스트 모드
- 프로필 관리

### 2. 타로 리딩
- 오늘의 카드
- 특정 주제 질문
- 다양한 스프레드 (1장, 3장, 5장, 켈틱 크로스)
- LLM 기반 해석

### 3. 크레딧 시스템
- 카드 리딩 비용
- 광고 시청 보상
- 결제 시스템

### 4. 소셜 기능
- 친구 관리
- 타로 해석 공유
- 메시지 시스템

### 5. 관리자 기능
- 시스템 설정
  - 앱 설정 관리
  - 타로 카드 데이터베이스 관리
  - LLM 프롬프트 관리
- 사용자 관리
  - 사용자 목록 조회
  - 사용자 권한 관리
  - 사용자 활동 로그
- 통계 및 모니터링
  - 일일/주간/월간 사용자 통계
  - 타로 리딩 통계
  - 결제 및 크레딧 통계
  - 시스템 성능 모니터링
- 콘텐츠 관리
  - 공지사항 관리
  - 이벤트 관리
  - FAQ 관리
- 보안 관리
  - 접근 로그 모니터링
  - 이상 징후 감지
  - 백업 및 복구

### 6. 지난 대화 기록 보기(타로 리딩 히스토리)

- 사용자가 과거에 받은 타로 해석과 대화 기록을 한눈에 확인, 검색, 필터, 상세 조회, 이어 질문 가능
- Firestore `/users/{userId}/readings/{readingId}` 구조로 저장, 각 리딩의 질문/카드/해석/대화/피드백 등 모든 정보 관리
- 검색(키워드, 기간, 카테고리), 무한 스크롤, 상세 대화(카톡형 UI), 별점/피드백, 공유, 삭제 등 다양한 UX 제공
- 데이터/서비스/컴포넌트/상태관리 계층 분리, 모듈화, 테스트, 보안 등 실무적 개발 원칙 적용
- 상세 기획은 `App_Flow_and_Features.md` 참고

## 프로젝트 구조

```
src/
├── components/     # 공통 컴포넌트
├── pages/         # 페이지 컴포넌트
│   ├── auth/      # 인증 관련
│   ├── tarot/     # 타로 관련
│   ├── social/    # 소셜 관련
│   └── admin/     # 관리자 관련
├── services/      # API 서비스
│   ├── local/     # 로컬 서비스 구현
│   └── firebase/  # Firebase 서비스 구현
├── store/         # Redux 스토어
├── config/        # 환경 설정
├── utils/         # 유틸리티 함수
├── theme/         # 테마 설정
└── assets/        # 이미지, 폰트 등
```

## 개발 가이드라인

### 1. 모듈식 개발
- 각 기능은 독립적인 모듈로 개발
- 모듈 간 의존성 최소화
- 명확한 인터페이스 정의

### 2. 데이터 레이어 추상화
- 로컬/프로덕션 환경에 따른 데이터 접근 계층 분리
- 인터페이스를 통한 일관된 데이터 접근
- 환경별 구현체 분리

### 3. 코드 품질
- TypeScript 사용
- ESLint + Prettier
- 단위 테스트 작성

### 4. 성능 최적화
- 코드 스플리팅
- 이미지 최적화
- 캐싱 전략

## 환경 전환 가이드

### 로컬 → 프로덕션 전환
1. Firebase 프로젝트 설정
2. 환경 변수 업데이트
3. 데이터 마이그레이션
4. 배포 테스트

### 프로덕션 → 로컬 전환
1. 로컬 환경 설정
2. 데이터 동기화
3. 기능 테스트

## 라이선스

ISC

## 폰트

### Pretendard
- 기본 폰트로 Pretendard 사용
- SIL Open Font License 1.1 라이센스
- 사용 굵기:
  - Regular (400): 기본 텍스트
  - SemiBold (600): 강조 텍스트
  - Black (900): 제목, 특별 강조
- 폰트 파일 위치: `src/assets/fonts/`
- 최적화: font-display: swap 적용 

## 문의하기(제작자 문의) 기능 개발 및 연동 원칙

- 문의하기는 ContactPage(프론트) → Firebase Cloud Function(백엔드) → Firestore 저장 + SendGrid 이메일 발송 구조로 동작
- InquiryForm 컴포넌트에서 제목/내용 입력, 로그인 이메일 자동 사용, 전송 성공 시 3초 후 마이페이지 이동 UX 적용
- Cloud Function(`submitInquiry`)에서 Firestore inquiries 컬렉션 저장 및 지정 이메일로 자동 발송
- SendGrid API 키, 발신/수신자 이메일은 환경 변수로 관리, 배포 전 반드시 등록
- 문의 내역은 추후 관리자 페이지에서 확인/답변 기능으로 확장 예정
- 모든 문의 데이터는 Firestore에 안전하게 저장, 개인정보 보호 및 보안 준수

## 진행 요약 및 다음 작업 (2024-06-09)

### 1. 지금까지 진행한 내용
- 전체 78장(메이저+마이너) 타로 카드 배열 구현 및 오늘의 카드 기능 정상 동작
- 문의하기(프론트/백엔드/이메일 연동) 기능 구현 및 테스트 완료
  - ContactPage/InquriyForm에서 문의 전송 → Cloud Function → Firestore 저장 + 이메일 발송
  - SendGrid 환경 변수 등록 및 실제 이메일 수신 확인
- README, App_Flow_and_Features.md 등 문서 기반으로 전체 서비스 플로우/UX 구조 파악
- 기존 코드 구조(타로 메인, 오늘의 카드, 3장 스프레드 등)와 앞으로 확장할 화면 구조 점검
- 코드/폴더 구조상 큰 충돌 없이 확장 가능한 상태 확인
- ✅ 스프레드별(1장, 3장, 5장, 켈틱 등) 화면/컴포넌트 설계 및 구현 완료

### 2. 다음번에 해야 할 일
- 문의하기 내역을 Firestore에서 불러와 관리자 페이지에서 확인/답변 기능 구현
- 각 단계별 화면을 별도 파일/컴포넌트로 분리하여 관리(유지보수성 강화)
- 카드 데이터/공통 로직 유틸 분리(예: src/utils/tarotCards.ts)
- 라우팅 구조 명확화(메인→카테고리→질문→스프레드→카드선택→결과)
- (추후) 기록 저장, 소셜/공유, 크레딧/결제 등 부가 기능 확장

## ⚠️ 진행 중단/다음 접속 시 이어서 할 작업 메모

- 2024-06-XX: Google Cloud Functions(GCP) 서비스 장애(503/500 등)로 문의하기 기능(Cloud Function) 배포 및 테스트가 중단됨. 장애 해소 후 배포/테스트/로그 진단부터 이어서 진행 필요.
- 네이버 소셜 로그인 연동 기능도 중간에 멈춘 상태. 다음 접속 시 네이버 로그인 연동(Callback, Firebase Functions, 환경 변수, 연동 해제 등) 구현 마저 진행해야 함.

---

**다음 접속 시 안내:**
- 스프레드별 화면 설계 및 단계별 구현(카테고리/질문/스프레드/카드선택 등)부터 진행하면 됩니다.
- 기존 구조와 충돌 없이, 새 기능을 별도 파일/컴포넌트로 추가하는 방식으로 확장하면 안전합니다.
- 궁금한 점이나 추가 요청사항 있으면 언제든 질문해 주세요!

## Firebase 지역(region) 설정 가이드

> **중요: 모든 Firebase 서비스(Functions, Firestore, Storage, Realtime Database 등)는 반드시 `asia-northeast3`(서울) 리전으로 생성 및 배포해야 합니다.**
>
> - Functions: 코드에서 region을 `asia-northeast3`로 명시 후 배포
> - Firestore/Storage/Realtime DB: 생성 시 반드시 `asia-northeast3` 선택(생성 후 변경 불가)
> - 기존 us-central1 등 타 리전에 생성된 리소스는 데이터 이전 후 삭제 권장

### 예시 (Cloud Functions)
```js
const functions = require("firebase-functions/v2");
exports.geminiInterpret = functions.https.onRequest({ region: "asia-northeast3" }, async (req, res) => { ... });
```

> 내일 "README에 적혀 있는 다음단계의 할일이 뭐야?"라고 물으면, 위 ⏳ 앞으로 해야 할 일 목록을 기준으로 답변하면 됨. 

## TODO: 프로젝트 종료 후 체크할 내용

### Firebase 익명 계정 30일 미사용 자동 삭제 기능
- Cloud Functions를 이용해 30일 이상 미사용된 익명(Anonymous) 계정을 자동으로 삭제하는 기능 구현 필요
- Blaze(유료) 요금제에서만 스케줄러 사용 가능
- 예시 코드:

```js
const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

const THIRTY_DAYS = 1000 * 60 * 60 * 24 * 30;

exports.deleteOldAnonymousUsers = functions.pubsub.schedule('every 24 hours').onRun(async (context) => {
  const now = Date.now();
  let nextPageToken;
  let deletedCount = 0;

  do {
    const listUsersResult = await admin.auth().listUsers(1000, nextPageToken);
    for (const userRecord of listUsersResult.users) {
      if (
        userRecord.providerData.length === 0 && // 익명 계정
        userRecord.metadata.lastSignInTime &&
        now - new Date(userRecord.metadata.lastSignInTime).getTime() > THIRTY_DAYS
      ) {
        await admin.auth().deleteUser(userRecord.uid);
        deletedCount++;
      }
    }
    nextPageToken = listUsersResult.pageToken;
  } while (nextPageToken);

  console.log(`Deleted ${deletedCount} old anonymous users.`);
  return null;
});
```

- 실제 적용 전, Cloud Functions 배포 및 Blaze 요금제 전환 필요
- 자세한 구현 및 배포 방법은 Firebase 공식 문서 참고 

## 네이버 소셜 로그인 연동 관련 메모 (2024-06-11)

- 현재 네이버 소셜 로그인 연동 시, Firebase Functions(백엔드)에서 네이버 Client ID/Secret/Redirect URI 환경변수(Secrets)가 누락되거나 잘못 등록된 경우 access_token 발급이 실패함.
- Functions 로그에 `client_id is missing` 또는 관련 에러가 반복적으로 발생할 수 있음.
- 이는 .env 파일만 수정해서는 해결되지 않고, 반드시 Firebase CLI로 secrets를 재등록해야 함.

### 다음번 네이버 로그인 연동/배포 시 꼭 해야 할 일

1. **Secrets(환경변수) 재등록**
   ```bash
   firebase functions:secrets:set VITE_NAVER_CLIENT_ID
   # 프롬프트에 Client ID 입력 (예: Dai3poR5NihXJlTCyVxn)
   firebase functions:secrets:set VITE_NAVER_CLIENT_SECRET
   # 프롬프트에 Secret 입력 (예: FOPE3QrXZ6)
   firebase functions:secrets:set VITE_NAVER_REDIRECT_URI
   # 프롬프트에 Redirect URI 입력 (예: http://localhost:8100/naver/callback)
   ```
2. **Secrets 등록 후 반드시 Functions 재배포**
   ```bash
   firebase deploy --only functions
   ```

- 위 과정을 거치지 않으면 네이버 로그인 연동이 정상 동작하지 않으니, 배포/환경 변경 시 반드시 위 절차를 반복할 것!

## 네이버 소셜 로그인 연동 안내

- 네이버 로그인 연동 시, 네이버 개발자센터에 Callback URL과 연결끊기(연동 해제) URL을 등록해야 합니다.
- **연결끊기(연동 해제) API는 추후 구현 필요!**
    - 사용자가 네이버 계정에서 서비스 연결을 해제할 때 네이버가 등록된 URL로 POST 요청을 보냅니다.
    - 해당 요청을 받아 실제로 회원 탈퇴/연동 해제 처리를 하는 서버 API를 구현해야 합니다.
    - 현재는 URL만 등록되어 있고, 실제 동작은 미구현 상태입니다.

> TODO: `/naver/unlink` 엔드포인트에서 네이버 연결끊기(연동 해제) 처리를 구현할 것 

## UI/페이지 구조 및 스타일 정책(프로젝트 표준)

### 1. 페이지(탭 루트/상세/최상위) 구조
- 모든 페이지는 아래 구조를 반드시 따른다:
  ```tsx
  <IonPage>
    <CommonHeader ... />
    <IonContent className={styles.content}>
      <div className={styles.container}>
        {/* 실제 컨텐츠(서브 컴포넌트 등) */}
      </div>
    </IonContent>
  </IonPage>
  ```
- 공통 헤더(CommonHeader)는 IonPage 바로 아래에만 위치
- IonContent는 IonPage 바로 아래에만 위치
- container 등 레이아웃 스타일은 반드시 .module.css에서만 관리

### 2. 서브 컴포넌트(리스트, 폼, 카드 등) 구조
- 서브 컴포넌트는 오직 "컨텐츠"만 반환 (IonPage, IonContent, 헤더 등 포함 금지)
- 필요시 props로 "헤더 숨김/표시" 등만 제어
- 스타일은 해당 컴포넌트의 .module.css에서만 관리

### 3. 라우팅/탭 구조
- 탭 루트/상세/서브 페이지 모두 위 구조를 일관 적용
- 중첩 라우팅 시에도 IonPage/IonContent/헤더 중첩 금지
- 공통 레이아웃/정책은 README, 코드 주석, 문서 등으로 명확히 규정

### 4. 예외/임시방편 금지
- 인라인 스타일, 글로벌 스타일, 구조적 예외, 임시방편 등 절대 금지
- 모든 구조/정책은 이 표준에 따라야 하며, 나중에 예외/딴소리 없이 일관성 유지

### 5. 적용 예시
- 소셜, 마이페이지, 타로, 관리자 등 모든 페이지에 동일하게 적용
- 서브 컴포넌트(리스트, 카드, 폼 등)는 어디서든 재사용 가능 

### 마이페이지 - 내 친구 코드 정책
- 마이페이지(프로필/설정) 화면에 '내 친구 코드'를 항상 표시
- 친구 추가/초대 기능에서 이 코드를 입력하면 친구로 추가 가능
- 친구 코드는 고유값(예: UID, 별도 난수 등)으로 발급/표시
- 친구 코드 복사/공유 기능 제공(추후)
- 정책/구조는 README 및 UI에 명확히 반영 

# 오늘의 타로 - 서버 시간/기록 기반 하루 1회 시스템

## Firestore DB 구조

- 컬렉션: `users/{userId}/dailyTarotResult`
- 문서 예시:
  ```json
  {
    "date": "2024-06-11",
    "cardIndex": 12,
    "interpretation": "오늘의 해석 내용...",
    "createdAt": Timestamp
  }
  ```

## 동작 규칙

1. **하루 1회 제한**
   - 오늘의 타로는 서버(Firestore) 시간 기준으로 하루 1회만 뽑을 수 있다.
   - 클라이언트는 반드시 Firestore의 기록을 확인 후 뽑기/상태 표시를 한다.

2. **클라이언트-서버 동기화**
   - 뽑기 시도 시 Firestore에서 `dailyTarotResult`를 읽어 오늘 날짜와 비교한다.
   - 이미 뽑았다면 기존 결과만 보여주고, 아니면 새로 뽑기 가능하다.
   - 뽑기 성공 시 Firestore에 오늘 날짜/카드/해석을 저장한다.

3. **알림/신호 시스템**
   - 00시에 서버(Cloud Functions 등)에서 푸시 알림 및 실시간 신호를 발송할 수 있다.
   - 앱/웹이 켜져 있으면 실시간 신호로 인앱 알림, 꺼져 있으면 푸시 알림으로 안내한다.

4. **예외/테스트 케이스**
   - 여러 날 미접속: 마지막 기록이 오늘이 아니면 새로 뽑기 가능
   - 디바이스 시간 조작: 서버 시간 기준이므로 편법 불가
   - 네트워크 오류: 서버와 동기화 실패 시 에러 안내 및 재시도 UX 제공
   - 중복 요청: 서버에서 하루 1회만 허용(동시성 제어)

5. **유지보수/확장 가이드**
   - 서버 기록 구조/필드 변경 시 클라이언트 코드도 함께 수정 필요
   - 푸시 알림/실시간 신호 시스템은 선택적으로 확장 가능

---

> 이 규칙에 따라 오늘의 타로 기능을 서버 시간/기록 기반으로 체계적으로 관리합니다. 

## 알림 시스템 (Notification System)

### 개요
알림 시스템은 사용자에게 다음과 같은 이벤트를 실시간으로 알려줍니다:
- 친구 초청 받았을 때
- 오늘의 타로 초기화 되었을 때
- 타로 리딩이 공유 되었을 때
- 관리자가 공지를 올렸을 때 (시스템 공지사항)

### 주요 기능
1. 실시간 알림 표시
   - 읽지 않은 알림 수를 배지로 표시
   - 알림 목록을 모달로 표시
   - 읽은 알림은 회색으로 표시

2. 알림 타입별 라우팅
   - 각 알림은 관련된 페이지로 자동 이동
   - 동적 라우팅 파라미터 지원

### 새로운 알림 타입 추가 방법

1. 타입 정의 추가
```typescript
// types/notification.ts
export type NotificationType = 
  | 'EXISTING_TYPE'
  | 'NEW_NOTIFICATION_TYPE';  // 새로운 타입 추가

// 라우팅 정보 추가
export const NOTIFICATION_ROUTES: Record<NotificationType, string> = {
  EXISTING_TYPE: '/existing/path',
  NEW_NOTIFICATION_TYPE: '/new/path'  // 새로운 라우팅 경로 추가
};

// 알림 데이터 인터페이스 추가
interface NewNotification extends BaseNotification {
  type: 'NEW_NOTIFICATION_TYPE';
  data: {
    // 필요한 데이터 필드 추가
    someId: string;
    someData: string;
  };
}

// Union 타입에 추가
export type Notification = 
  | ExistingNotification
  | NewNotification;  // 새로운 타입 추가
```

2. 알림 생성 함수 추가
```typescript
// services/firebase/notificationService.ts
class NotificationService {
  async createNewTypeNotification(
    userId: string,
    data: { someId: string; someData: string }
  ) {
    const notification: NewNotification = {
      id: uuidv4(),
      type: 'NEW_NOTIFICATION_TYPE',
      title: '새로운 알림',
      time: Date.now(),
      read: false,
      data
    };

    await this.saveNotification(userId, notification);
  }
}
```

3. 스타일링 추가
```css
/* components/NotificationItem.module.css */
.newTypeIcon {
  background-color: #your-color;
}
```

4. 아이콘 매핑 추가
```typescript
// components/NotificationItem.tsx
const NotificationIcon: React.FC<{ type: Notification['type'] }> = ({ type }) => {
  const iconClass = {
    // ... 기존 매핑
    'NEW_NOTIFICATION_TYPE': styles.newTypeIcon
  }[type];

  return <div className={`${styles.notificationIcon} ${iconClass}`} />;
};
```

### 주의사항
- 알림은 사용자별로 저장되며, 읽음 상태가 유지됩니다.
- 알림 클릭 시 자동으로 읽음 처리되며, 배지 카운트가 감소합니다.
- 페이지가 미구현된 경우에도 라우팅 구조는 미리 준비되어 있습니다.

### 향후 개선 계획
- [ ] 알림 그룹화 기능
- [ ] 알림 필터링
- [ ] 알림 설정 (알림 종류별 ON/OFF)
- [ ] 알림음 설정
- [ ] 푸시 알림 지원 

## 일일 타로 프로세스 (Gemini 1.5 Flash API 활용)

1. **타로앱 메인 화면**
   - '일일 타로' 버튼 노출
2. **일일 타로 버튼 클릭**
   - 덱(라이더-웨이트/토트) 무작위 선택 (확장성 고려)
   - 선택된 덱의 78장 카드 중 1장 무작위 선택
   - 카드 정보(이름, 메이저/마이너, 정/역방향) 구성
3. **백엔드 호출**
   - 구성된 카드 정보와 함께 Firebase Cloud Functions 호출
   - 백엔드에서 덱 종류/카드 정보 기반 프롬프트 생성
   - Gemini 1.5 Flash API 호출하여 해석 생성
4. **해석 결과 반환 및 표시**
   - Gemini로부터 받은 해석 결과를 프론트엔드에 반환
   - 해석 결과를 해석 화면에 간결하게 표시

### 화면 단계도

```
[타로앱 메인]
   ↓ (일일 타로 버튼 클릭)
[일일 타로 해석 화면]
   ↓ (Gemini 1.5 Flash API 해석 결과 표시)
```

## 작업 규칙 (필수)

- **요청자가 요청한 내용에만 집중해서 수정한다.**
- **불필요하게 의미를 확대해석해서 수정하는 것은 절대로 금지한다.**
- **임의로 의미를 축소하거나 확장하지 않는다.**
- **요청자의 말의 맥락을 한 글자도 임의로 바꾸지 않고, 그대로 반영한다.**
- 이 규칙을 어길 시, Cursor AI 서비스를 이용하지 말라는 것과 같다. (Cursor AI는 규칙을 줘도 지키지 않기 때문에, 어떠한 개선의 노력도 하지 않는다는걸 의미하는 것이다)
- **실수를 반복하는 것은 어떠한 개선의 노력도 하지 않는다는걸 의미하는 것이다.**

---

// ... 기존 README 내용 ... 