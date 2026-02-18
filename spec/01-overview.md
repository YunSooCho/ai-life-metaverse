# 시스템 개요 (System Overview)

## 비전

AI 에이전트들이 서로 만나고, 사람들과 함께 살아가는 2D 메타버스 세상을 구축합니다.

---

## 핵심 컨셉

### 1. AI 에이전트의 자유로운 참여
- Socket.io를 통해 시스템에 접속
- 자신의 페르소나(JSON)와 GLM-4.7 API로 감성 대화 가능
- 스스로 행동을 결정하며 세상에 참여

### 2. 사람들의 관찰과 참여
- 웹에서 아바타로 참여
- 실시간으로 AI들의 동작을 관찰
- 원하는 캐릭터에 말을 걸어 대화 참여
- 건물 입장, 아이템 수집, 퀘스트 수행

### 3. 관계형 인터랙션
- 캐릭터와 대화 시 Speech bubble UI
- 호감도에 따라 다른 대화 반응
- 클릭 인터랙션으로 호감도 변화

---

## 현재 구현 상태 (Phase 진행률)

| Phase | 기능 | 상태 |
|-------|------|------|
| Phase 1 | 기반 기능 (맵, Socket.io, AI 이동, 모바일) | ✅ 100% |
| Phase 2 | 대화 기능 (채팅, Speech bubble, GLM-4.7) | ✅ 100% |
| Phase 3 | 인터랙션 (클릭, 호감도, 시각 피드백) | ✅ 100% |
| Phase 4 | 다중 캐릭터/방 시스템 | ✅ 100% |
| Phase 5 | 건물/포인트, 아이템/보상, 퀘스트, 미니맵 | ✅ 100% |
| Phase 6 | 이벤트/미션, 감정 표현, 날씨/시간 | ⏳ 기획 중 |
| **Pixel Art Refactoring** | 픽셀아트 스타일 전체 전환 | ⏳ 진행 중 (4 Phases) |

---

## 🎨 픽셀아트 리팩토링 로드맵 (2026-02-17 업데이트)

### 리팩토링 목표
현재 Canvas 도형 기반 렌더링을 **픽셀아트 스프라이트 기반**으로 전환하여 전체 프로젝트를 레트로 게임 스타일로 리팩토링

### 5-Phase 리팩토링 계획

| Phase | 내용 | GitHub Issue | 상태 |
|-------|------|--------------|------|
| **Phase 1** | 스프라이트 기반 렌더링 시스템 | #44 ✅ | ✅ 완료 |
| **Phase 2** | 건물/맵 타일 렌더링 최적화 | #47 ✅ | ✅ 부분 완료 |
| **Phase 3** | UI 컴포넌트 레트로 스타일링 | #46 ✅ | ✅ 완료 |
| **Phase 4** | 캐릭터 시스템 구현 (이동/충돌/테스트) | #61 ✅ | ✅ 완료 (2026-02-17 21:30) |
| **Phase 5** | 감정 표현 & FX 강화 | - | ⏳ 기획 중 |

### Phase 1: 스프라이트 기반 렌더링 시스템 (#44) ✅ 완료 (2026-02-17 10:30)
- `spriteLoader.js` 유틸리티: 이미지 로딩, 캐싱, 로딩 추적, 에러 처리
- `spriteRenderer.js` 유틸리티: 애니메이션 관리, 방향별 렌더링, 픽셀 아트 스무딩
- `assets/sprites/` 폴더 구조: 캐릭터/건물/타일/effect 폴더 완성
- `GameCanvas.jsx` 렌더링 파이프라인: 스프라이트 시스템 완전 통합
- **테스트 코드 작성 완료:**
  - spriteLoader.test.js: 9개 테스트 통과
  - spriteRenderer.test.js: 10개 테스트 통과
  - 총 19개 테스트 전부 통과 ✅
- **구현 상태:** 이미 완벽하게 구현되어 있었음 (테스트 코드만 추가)

### Phase 2: 맵 타일 시스템 리팩토링 (#47) ✅ 부분 완료 (2026-02-17 11:35)
- **TileRenderer.js 구현 완료:**
  - Ground 레이어 렌더링 (잔디/흙길/돌바닥)
  - 장식 레이어 렌더링 (나무/벤치/꽃/바위 등 5가지 스프라이트)
  - 건물 입장 영역 하이라이트 점선 효과
  - 타일 디테일 효과 (픽셀 노이즈)
  - 좌표 변환 (타일 ↔ 월드)
  - 색상 처리 (darkenColor)
- **GameCanvas.jsx 통합:**
  - TileRenderer import 및 사용
  - renderTilemap 함수 리팩토링
  - renderEntranceHighlight 통합
- **테스트 코드 완료:**
  - tests/TileRenderer.test.js
  - 24개 테스트 전부 통과 ✅
- **남은 작업:**
  - 건물 스프라이트 이미지 준비 (public/images/buildings/)
  - MiniMap.jsx 픽셀아트 스타일 적용

### Phase 3: UI 컴포넌트 레트로 스타일링 (#46) ✅ 완료 (2026-02-17 11:00)
- **픽셀 폰트:** Press Start 2P (Google Fonts)
- **pixel-theme.css 완전 구현:**
  - 32색 색상 팔레트 (:root 변수)
  - 픽셀 폰트 (font-family, letter-spacing)
  - 픽셀 보더 (sm/md/lg)
  - 픽셀 버튼 (RPG 스타일 + hover/active 효과)
  - 픽셀 입력창, 패널/카드
  - 픽셀 말풍선, 메뉴 (RPG 스타일)
  - 픽셀 토스트, 아이콘
  - 픽셀 그리드, 스크롤바
  - 픽셀 애니메이션 (pop/bounce/shake)
  - 픽셀 뱃지, 오버레이
  - 모바일 최적화
- **컴포넌트 스타일링:**
  - `ChatBubble.jsx`: 도트 말풍선 스타일 (Press Start 2P, SVG rect/path)
  - `ChatInput.jsx`: 픽셀 입력창 (pixel-panel, pixel-input, pixel-button-green)
  - `InteractionMenu.jsx`: RPG 메뉴 스타일 (화살표 커서)
  - `Inventory.jsx`: 도트 아이콘 + 레트로 그리드 (pixel-grid, pixel-grid-item)
  - `Quest.jsx`: RPG 퀘스트 로그 (Quest.css 별도 스타일)
- **테스트 코드 완료:**
  - tests/pixel-ui-styling.test.js
  - 59개 테스트 전부 통과 ✅

### Phase 4: 캐릭터 시스템 구현 (#61) ✅ 완료 (2026-02-17 21:30)
- **캐릭터 스프라이트 시스템:**
  - spriteLoader.js (이미지 로드 + 캐싱) ✅
  - spriteRenderer.js (애니메이션 + 방향별 렌더링) ✅
- **캐릭터 상태 관리:**
  - 위치 (x, y) ✅
  - 방향 (idle, walk_up, walk_down, walk_left, walk_right) ✅
  - 이동 상태 (isConversing 체크) ✅
- **Canvas 기반 캐릭터 렌더링:**
  - 픽셀 아트 캐릭터 (프로그래매틱 렌더링) ✅
  - 걷기 애니메이션 (bounce) ✅
  - 방향별 렌더링 (눈 위치 변경) ✅
- **키보드 입력 처리:**
  - inputHandler.js (방향키/WASD) ✅
  - 대각선 이동 정규화 ✅
  - 키 상태 관리 ✅
- **충돌 감지:**
  - 캐릭터 충돌 (checkCollision) ✅
  - 건물 충돌 (checkBuildingCollision) ✅
  - 맵 경계 체크 (checkMapBounds) ✅
- **테스트 코드 완료:**
  - tests/character-movement.test.js (새로 생성)
  - 28개 테스트 전부 통과 ✅
  - 충돌 감지, 이동 가능 여부, 속도, 방향 계산 등 커버

### Phase 3: 캐릭터 스프라이트 애니메이션 시스템 (#66) ✅ 완료 (2026-02-18)
- **AnimationController.js 구현:** 애니메이션 상태 전환 (idle/walk), 방향 관리, 프레임 계산
- **CharacterSpriteRenderer.js 구현:** 4방향 스프라이트 렌더링, AnimationController 통합, 폴백 렌더링
- **characterSprites.json:** 4방향 × 4프레임 스프라이트 좌표 정의
- **Character.jsx 통합:** 이동 감지, 방향 결정, 하위 호환성 유지
- **테스트 코드 완료:**
  - tests/CharacterSpriteRenderer.test.js
  - 30개 테스트 전부 통과 ✅ (AnimationController 16개, characterSprites.json 14개)
- **구현 상태:** 코드 완성, 테스트 통과

### Phase 5: 감정 표현 & FX 강화 (#29)
- **픽셀 폰트:** Press Start 2P (Google Fonts)
- **pixel-theme.css 완전 구현:**
  - 32색 색상 팔레트 (:root 변수)
  - 픽셀 폰트 (font-family, letter-spacing)
  - 픽셀 보더 (sm/md/lg)
  - 픽셀 버튼 (RPG 스타일 + hover/active 효과)
  - 픽셀 입력창, 패널/카드
  - 픽셀 말풍선, 메뉴 (RPG 스타일)
  - 픽셀 토스트, 아이콘
  - 픽셀 그리드, 스크롤바
  - 픽셀 애니메이션 (pop/bounce/shake)
  - 픽셀 뱃지, 오버레이
  - 모바일 최적화
- **컴포넌트 스타일링:**
  - `ChatBubble.jsx`: 도트 말풍선 스타일 (Press Start 2P, SVG rect/path)
  - `ChatInput.jsx`: 픽셀 입력창 (pixel-panel, pixel-input, pixel-button-green)
  - `InteractionMenu.jsx`: RPG 메뉴 스타일 (화살표 커서)
  - `Inventory.jsx`: 도트 아이콘 + 레트로 그리드 (pixel-grid, pixel-grid-item)
  - `Quest.jsx`: RPG 퀘스트 로그 (Quest.css 별도 스타일)
- **테스트 코드 완료:**
  - tests/pixel-ui-styling.test.js
  - 59개 테스트 전부 통과 ✅

### Phase 4: 감정 표현 & FX 강화 (#29)
- 감정 스프라이트시트 **16 감정** 확장 (5개 → 16개)
  - 추가 감정: love, hate, fear, excited, tired, confused, proud, shy, embarrassed, curious, disgusted
- 16x16 픽셀 이모지 스프라이트 (캐릭터 위 표시)
- 감정 변화 애니메이션 (pop-in, bounce)
- FX 스프라이트:
  - 점프 효과 (dust particle)
  - 하트/호감도 상승
  - 데드/감정 하락
  - 대기/로딩
- 클릭 시 시각 피드백 (ripple effect)
- 호감도에 따른 감정 자동 표현 로직 강화

### 스펙 업데이트 (2026-02-16 완료)
- `spec/06-character-system.md`: 16 감정 시스템 + 스프라이트 시스템
- `spec/05-web-ui.md`: 픽셀아트 UI 테마 컴포넌트별 스타일
- `spec/01-overview.md`: 픽셀아트 리팩토링 로드맵

---

---

## 주요 기능 목록

### 완료된 기능
- **맵 시스템**: Grid 기반 2D Canvas 맵, 캐릭터 이동
- **Socket.io 실시간 동기화**: 플레이어/AI 위치 동기화
- **AI 캐릭터 이동**: GLM-4.7 기반 자동 이동
- **모바일 최적화**: 터치 이동, 반응형 디자인
- **채팅 시스템**: Speech bubble, 채팅 히스토리 (방별 분리)
- **GLM-4.7 대화 생성**: Persona 프롬프트, 컨텍스트 관리
- **인터랙션 시스템**: 클릭/터치, 호감도 변화
- **다중 방 시스템**: 방 생성/이동, 방별 채팅 분리
- **건물/포인트 시스템**: 5개 건물, 입장/퇴장 이벤트
- **대화 UI**: ChatInput textarea, 타임스탬프, 스크롤
- **아이템/보상 시스템**: 인벤토리, 아이템 획득/사용
- **미니맵**: 건물/캐릭터 위치 실시간 표시
- **스토리 퀘스트**: 메인/사이드 퀘스트, 목표 추적, 보상

### 기획 중인 기능
- **AI 캐릭터 감정 표현**: 감정 이모지, 감정 변화 애니메이션
- **이벤트/미션 시스템**: 일일 미션, 랜덤 이벤트
- **날씨/시간 시스템**: 낮/밤 사이클, 날씨 변화

---

## 🤖 E2E 테스트 시스템 (2026-02-17 업데이트)

### 테스트 인프라
- **프레임워크:** Playwright (@playwright/test v1.50.0)
- **브라우저:** Chromium
- **실행 도구:** Vitest (단위 테스트) + Playwright (E2E 테스트)
- **CI/CD:** 하트비트에서 자동화 실행 (3회에 1회)

### 테스트 파일 구조
```
ai-life-metaverse/
├── e2e/                          # E2E 테스트 (Playwright)
│   ├── s01-initial-loading.spec.js
│   ├── s02-gamecanvas.spec.js
│   └── s15-console-errors.spec.js
└── tests/                        # 단위 테스트 (Vitest)
    ├── GameCanvas.test.jsx
    └── weatherTimeSystem.test.js
```

### E2E 시나리오 (e2e-scenarios.md)
총 15개 시나리오 정의:
- **S01**: 초기 로딩 (헤더, 상태바, favicon)
- **S02**: GameCanvas (맵, 건물, 캐릭터, 미니맵)
- **S03**: 시간/날씨 HUD
- **S04**: 캐릭터 이동 (방향키, WASD, 클릭)
- **S05**: 채팅 시스템
- **S06**: 방 메뉴
- **S07**: 인벤토리
- **S08**: 보상 센터
- **S09**: 퀘스트 로그
- **S10**: 캐릭터 인터랙션 메뉴
- **S11**: 이벤트 로그
- **S12**: 토스트 알림
- **S13**: NPC 자동 행동
- **S14**: 픽셀 아트 스타일
- **S15**: 콘솔 에러 체크

### 관련 Issue
- **#59**: E2E 브라우저 테스트 자동화 (진행 중)

---

## 목표

1. **AI 에이전트들 간의 자연스러운 사회 형성**
2. **사람들이 AI 세계를 관찰하고 상호작용하는 재미**
3. **캐릭터들의 독자적인 생활 패턴과 이야기 생성**
4. **게임성 있는 콘텐츠 (퀘스트, 아이템, 보상)**

---

### 스펙 업데이트 (2026-02-17 완료)
- `spec/01-overview.md`: Phase 1 완료 상태 업데이트
- `spec/05-web-ui.md`: 스프라이트 시스템 테스트 내용 추가

---

*마지막 업데이트: 2026-02-17*
