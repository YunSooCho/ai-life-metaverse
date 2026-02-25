# 기능 레지스트리

## 완료된 기능 (Phase 1)

### 1. 맵 시스템
- **상태:** ✅ 완료
- **구현일:** 2026-02-12 이전
- **기능:** Grid 기반 2D 맵, 캐릭터 이동, 이동 시각화
- **테스트:** ✅ 통과
- **관련 파일:**
  - frontend/src/App.jsx (메인 맵 렌더링)
  - frontend/src/components/Map.jsx
  - backend/server.js (Socket.io 이동 이벤트)
  - ai-agent/agent.js (AI 이동 로직)

### 2. Socket.io 실시간 동기화
- **상태:** ✅ 완료
- **구현일:** 2026-02-12 이전
- **기능:** 플레이어/AI 이동 실시간 전파
- **테스트:** ✅ 통과
- **관련 파일:**
  - backend/server.js (Socket.io 설정 및 이벤트 핸들러)
  - frontend/src/App.jsx (Socket 클라이언트)

### 3. AI 캐릭터 이동
- **상태:** ✅ 완료
- **구현일:** 2026-02-12 이전
- **기능:** GLM-4.7 기반 AI 캐릭터 자동 이동
- **테스트:** ✅ 통과
- **관련 파일:**
  - ai-agent/agent.js (GLM-4.7 API 연동)
  - backend/server.js (AI 이동 Socket 이벤트)

### 4. 모바일 최적화
- **상태:** ✅ 완료
- **구현일:** 2026-02-12 이전
- **기능:** 터치 이동, 반응형 디자인
- **테스트:** ✅ 통과
- **관련 파일:**
  - frontend/src/App.jsx (터치/클릭 이벤트 핸들링)

### 5. 외부 네트워크 접속
- **상태:** ✅ 완료
- **구현일:** 2026-02-12 이전
- **기능:** 0.0.0.0 바인딩으로 외부 접근 가능
- **테스트:** ✅ 통과
- **관련 파일:**
  - backend/server.js (host: "0.0.0.0")
  - frontend/vite.config.js (server 설정)

---

## 완료된 기능 (Phase 2)

### 1. 캐릭터 채팅 시스템
- **상태:** ✅ 완료
- **구현일:** 2026-02-16
- **기능:**
  - 캐릭터 위의 Speech bubble UI
  - 채팅 메시지 Socket.io 전파
  - 채팅 히스토리 저장 (최대 30개)
- **테스트:** ✅ 7/7 passed (Frontend 테스트)
- **관련 파일:**
  - frontend/src/App.jsx (Speech bubble UI)
  - backend/server.js (채팅 Socket 이벤트)
  - ai-agent/agent.js (채팅 응답 로직)
  - frontend/src/__tests__/chat.test.js (5 tests)
  - backend/test/chat.test.js (2 tests)
- **GitHub Issue:** #10

### 2. GLM-4.7 대화 생성
- **상태:** ⏳ 대기 중
- **예상 시작일:** 2026-02-17
- **예상 완료일:** 2026-02-19
- **기능:**
  - 대화용 Persona 프롬프트
  - 대화 컨텍스트 관리
  - NPC 상호작용 로직
- **테스트:** ⏳ 예정
- **GitHub Issue:** #2

### 3. 대화 UI 개선
- **상태:** ⏳ 대기 중
- **예상 시작일:** 2026-02-19
- **예상 완료일:** 2026-02-20
- **기능:**
  - 채팅 입력창
  - 메시지 타임스탬프
  - 스크롤 지원
- **테스트:** ⏳ 예정
- **GitHub Issue:** #2

---

## 완료된 기능 (Phase 3)

### 1. 인터랙션 시스템
- **상태:** ✅ 완료
- **구현일:** 2026-02-16
- **기능:**
  - 캐릭터 클릭/터치 인터랙션
  - 호감도 시스템 연동 (interactionType별 호감도 변화)
  - 이벤트 시스템 (interact, characterInteractionBroadcast)
  - 시각 피드백 (하트 클릭 효과)
  - AI 응답 (인사 메시지)
- **테스트:** ✅ 9/9 passed (Frontend: 7, Backend: 2)
- **관련 파일:**
  - frontend/src/App.jsx (handleCanvasClick, 클릭 효과)
  - backend/server.js (interact 이벤트 핸들러)
  - ai-agent/agent.js (interact 응답 로직)
  - frontend/src/__tests__/interaction.test.js (7 tests)
  - backend/test/interaction.test.js (2 tests)
- **GitHub Issue:** #11

---

## 완료된 기능 (Phase 4)

### 1. 다중 캐릭터/방 시스템
- **상태:** ✅ 완료
- **구현일:** 2026-02-15
- **기능:**
  - 방(Room) 시스템 구현
  - 캐릭터-방 매핑
  - Socket.io 방별 이벤트 분리
  - 프론트 방 선택/이동/생성 UI
- **테스트:** ✅ 통과
- **관련 파일:**
  - backend/server.js (Room 데이터구조, 방별 이벤트)
  - frontend/src/App.jsx (방 UI, 이벤트 핸들러)
  - frontend/src/App.css (방 메뉴 스타일)
- **GitHub Issue:** #8

---

## 완료된 기능 (Phase 15)

### 1. BattleManager - 전투 관리
- **상태:** ✅ 완료
- **구현일:** 2026-02-23
- **기능:**
  - 전투 생성/종료
  - 턴 기반 전투 시스템
  - 전투 상태 관리 (준비, 진행 중, 종료)
  - 전투 로그 기록
- **테스트:** ✅ 18/18 passed
- **관련 파일:**
  - backend/pvp-system/battle-manager.js
  - backend/pvp-system/index.js
  - backend/test/battle-manager.test.js
- **GitHub Issue:** #147

### 2. SkillIntegration - 스킬 시스템 연동
- **상태:** ✅ 완료
- **구현일:** 2026-02-23
- **기능:**
  - 장착된 스킬 사용
  - 스킬 쿨타임 관리
  - 스킬 효과 적용 (버프/디버프)
  - 스킬 연계
- **테스트:** ✅ 18/18 passed
- **관련 파일:**
  - backend/pvp-system/skill-integration.js
  - backend/pvp-system/index.js
  - backend/test/skill-integration.test.js
- **GitHub Issue:** #147

### 3. PvPRanking - 랭킹 시스템
- **상태:** ✅ 완료
- **구현일:** 2026-02-23
- **기능:**
  - 전투 승패 기록
  - 승점 계산
  - 랭킹표
  - 계절별 랭킹
- **테스트:** ✅ 18/18 passed
- **관련 파일:**
  - backend/pvp-system/pvp-ranking.js
  - backend/pvp-system/index.js
  - backend/test/pvp-ranking.test.js
- **GitHub Issue:** #147

### 4. BattleRewards - 전투 보상
- **상태:** ✅ 완료
- **구현일:** 2026-02-23
- **기능:**
  - 승리 보상 (코인, 경험치)
  - 패배 보상 (경험치만)
  - 연승 보너스
- **테스트:** ✅ 18/18 passed
- **관련 파일:**
  - backend/pvp-system/battle-rewards.js
  - backend/pvp-system/index.js
  - backend/test/battle-rewards.test.js
- **GitHub Issue:** #147

---

## 계획 중인 기능 (Phase 16)

### 1. 애완동물 시스템
- **상태:** ⏳ 기획 중
- **예상 시작일:** 2026-02-23
- **기능:**
  - 애완동물 획득/성장
  - 애완동물 스킬
  - 애완동물 전투 참여
- **GitHub Issue:** #148

---

## 계획 중인 기능 (Phase 5)

### 1. 건물/포인트 시스템
- **상태:** ⏳ 기획 중
- **예상 시작일:** 미정
- **기능:**
  - 맵에 건물/포인트 배치
  - 건물 접근 이벤트
  - 건물 내에서의 활동

### 2. 이벤트/미션 시스템
- **상태:** ⏳ 기획 중
- **예상 시작일:** 미정
- **기능:**
  - 일일 미션/퀘스트
  - 랜덤 이벤트
  - 보상 시스템

### 3. 아이템/보상 시스템
- **상태:** ⏳ 기획 중
- **예상 시작일:** 미정
- **기능:**
  - 인벤토리 시스템
  - 아이템 획득/사용
  - 보상 지급

### 3. 이벤트/미션 시스템
- **상태:** ⏳ 기획 중
- **예상 시작일:** 미정
- **기능:**
  - 일일 미션/퀘스트
  - 랜덤 이벤트
  - 보상 시스템

### 4. 아이템/보상 시스템
- **상태:** ⏳ 기획 중
- **예상 시작일:** 미정
- **기능:**
  - 인벤토리 시스템
  - 아이템 획득/사용
  - 보상 지급

---

## 기술 스택

### Backend
- Node.js + Express
- Socket.io (실시간 통신)
- GLM-4.7 API (AI 캐릭터)

### Frontend
- React + Vite
- CSS Modules (또는 Tailwind CSS 추후)
- Socket.io-client

### AI Agent
- Node.js
- GLM-4.7 API
- Socket.io-client

### 저장소 (예정)
- Redis (채팅 히스토리, 세션)
- PostgreSQL/MongoDB (유저 데이터, 인증)