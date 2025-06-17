# Astra Tarot 소셜 탭 개발 가이드

## 1. 개발 정책 및 구조
- **UI/UX만 구현**: 소셜(친구, 피드, 메시지) 탭은 임시 데이터 기반 UI/UX만 구현합니다.
- **실제 백엔드/메시지 송수신 미구현**: 실서비스 수준의 데이터 연동, 실시간 메시지 송수신 등은 구현하지 않습니다.
- **스타일 정책**: style prop 사용 금지, 반드시 .module.css 파일로 스타일 분리 및 적용
- **공통 컴포넌트/스타일 분리**: 레이아웃, 탭, 각 탭별 UI는 컴포넌트와 스타일을 분리하여 관리

## 2. 폴더/파일 구조
```
src/pages/social/
  SocialLayout.tsx           # 소셜 공통 레이아웃/탭 네비게이션
  SocialLayout.module.css    # 소셜 레이아웃 스타일
  FriendList.tsx             # 친구 탭(기존 컴포넌트)
  FriendList.module.css      # 친구 탭 스타일
  FeedTab.tsx                # 피드 탭(임시 데이터 기반)
  FeedTab.module.css         # 피드 탭 스타일
  MessageTab.tsx             # 메시지 탭(임시 데이터 기반)
  MessageTab.module.css      # 메시지 탭 스타일
  mockFriends.ts             # 임시 친구 데이터
  mockFeed.ts                # 임시 피드 데이터
  mockMessages.ts            # 임시 메시지 데이터
```

## 3. 임시 데이터 관리
- 각 탭에서 사용하는 임시 데이터는 mockFriends.ts, mockFeed.ts, mockMessages.ts로 분리하여 import해서 사용합니다.
- 실제 서비스 연동/실시간 기능은 구현하지 않으며, 임시 데이터만으로 UI/UX를 확인합니다.

## 4. 스타일 정책
- style prop 사용 금지
- 반드시 .module.css 파일로 스타일 분리 및 적용
- 공통 스타일/컴포넌트는 재사용성 있게 분리

## 5. 개발 체크리스트
- [ ] SocialLayout에서 탭 전환 시 각 탭 정상 렌더링
- [ ] 임시 데이터 기반 UI/UX만 구현(실제 송수신/백엔드 연동 없음)
- [ ] style prop 미사용, .module.css만 사용
- [ ] 공통 컴포넌트/스타일 분리
- [ ] UI/UX 일관성 및 기본 접근성

## 6. 기타
- 실제 서비스 연동, 실시간 메시지 송수신, 알림 등은 구현 대상이 아닙니다.
- 정책 위반(스타일 인라인, 임시방편 코드 등) 금지 