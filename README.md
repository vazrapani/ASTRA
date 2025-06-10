# Astra Tarot

내면의 지혜를 밝히는 판타지 타로 앱

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

## 진행 요약 및 다음 작업 (2024-06-09)

### 1. 지금까지 진행한 내용
- 전체 78장(메이저+마이너) 타로 카드 배열 구현 및 오늘의 카드 기능 정상 동작
- README, App_Flow_and_Features.md 등 문서 기반으로 전체 서비스 플로우/UX 구조 파악
- 기존 코드 구조(타로 메인, 오늘의 카드, 3장 스프레드 등)와 앞으로 확장할 화면 구조 점검
- 코드/폴더 구조상 큰 충돌 없이 확장 가능한 상태 확인

### 2. 다음번에 해야 할 일
- 스프레드별(1장, 3장, 5장, 켈틱 등) 화면/컴포넌트 설계 및 구현
  - 카테고리 선택 → 질문 입력 → 스프레드(카드수) 선택(자동/수동) → 카드 선택 → 애니메이션 → 결과/해석 플로우 단계별 구현
- 각 단계별 화면을 별도 파일/컴포넌트로 분리하여 관리(유지보수성 강화)
- 카드 데이터/공통 로직 유틸 분리(예: src/utils/tarotCards.ts)
- 라우팅 구조 명확화(메인→카테고리→질문→스프레드→카드선택→결과)
- (추후) 기록 저장, 소셜/공유, 크레딧/결제 등 부가 기능 확장

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