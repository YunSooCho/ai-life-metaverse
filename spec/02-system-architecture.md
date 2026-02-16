# 시스템 아키텍처 (System Architecture)

## 전체 구조

```
┌─────────────────────────────────────────────────────────────┐
│                     사용자 (People)                          │
│                   Web Frontend (React + Vite)               │
│                   http://10.76.29.91:3000                   │
└─────────────────────┬───────────────────────────────────────┘
                      │ WebSocket (Socket.io)
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                 메인 서버 (Node.js + Express)                │
│                 http://10.76.29.91:4000                     │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐           │
│  │  Socket.io │  │  상태 관리  │  │  게임 로직  │           │
│  │  실시간    │  │ (인메모리)  │  │ (건물,퀘스트)│           │
│  └────────────┘  └────────────┘  └────────────┘           │
└─────────────────────┬───────────────────────────────────────┘
                      │ Socket.io Client
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                  AI 에이전트 (Node.js)                       │
│  ┌─────────────────┐  ┌──────────────────┐                 │
│  │  GLM-4.7 API    │  │  Chat Context    │                 │
│  │  (Cerebras)     │  │  Manager         │                 │
│  └─────────────────┘  └──────────────────┘                 │
└─────────────────────────────────────────────────────────────┘
```

---

## 구성 요소

### 1. Frontend (React + Vite)
- **위치:** `frontend/`
- **포트:** 3000
- **주요 컴포넌트:**
  - `App.jsx` - 메인 앱 (상태 관리, Socket 연결)
  - `GameCanvas.jsx` - 2D Canvas 렌더링 (캐릭터, 건물, 맵)
  - `Character.jsx` - 캐릭터 렌더링
  - `ChatBubble.jsx` - Speech bubble UI
  - `ChatInput.jsx` - 채팅 입력창 (textarea, Enter 전송)
  - `MiniMap.jsx` - 미니맵 (건물/캐릭터 위치)
  - `Inventory.jsx` - 인벤토리 UI
  - `Reward.jsx` - 보상 UI
  - `Quest.jsx` - 퀘스트 UI
  - `EventLog.jsx` - 이벤트 로그
  - `RoomMenu.jsx` - 방 선택 메뉴
  - `InteractionMenu.jsx` - 인터랙션 메뉴
  - `AffinityDisplay.jsx` - 호감도 표시
  - `CharacterList.jsx` - 캐릭터 목록
  - `Toast.jsx` - 토스트 알림
- **Custom Hooks:**
  - `useSocketEvent.js` - Socket 이벤트 관리
  - `useCharacter.js` - 캐릭터 상태 관리
- **Utilities:**
  - `characterUtils.js` - 캐릭터 유틸리티 함수
  - `socket.js` - Socket.io 클라이언트 설정

### 2. Backend (Node.js + Express + Socket.io)
- **위치:** `backend/`
- **포트:** 4000
- **주요 파일:**
  - `server.js` - 메인 서버 (Socket.io 이벤트 핸들러, 게임 로직)
  - `inventory.js` - 인벤토리/아이템 시스템
  - `quest.js` - 퀘스트 시스템
- **데이터 저장:** 인메모리 (Redis/DB 미사용, 서버 재시작 시 초기화)

### 3. AI Agent (Node.js)
- **위치:** `ai-agent/`
- **주요 파일:**
  - `agent.js` - AI 에이전트 메인 (GLM-4.7 연동, 이동/대화 로직)
  - `chat-context.js` - 대화 컨텍스트 관리 (최근 10개 대화 저장)
- **LLM:** Cerebras GLM-4.7 (zai-glm-4.7)
- **기능:**
  - 주기적 자동 이동
  - 채팅 응답 생성 (Persona 기반)
  - 인터랙션 응답 (호감도 기반)
  - 8가지 인터랙션 타입 (greet, talk, gift, poke, wave, compliment, tease, ignore)

---

## Socket.io 이벤트 목록

### Client → Server
| 이벤트 | 파라미터 | 설명 |
|--------|----------|------|
| `move` | `{x, y}` | 플레이어 이동 |
| `chatMessage` | `{characterId, message}` | 채팅 메시지 전송 |
| `interact` | `{characterId, interactionType}` | 캐릭터 인터랙션 |
| `enterBuilding` | `{buildingId}` | 건물 입장 |
| `exitBuilding` | `{buildingId}` | 건물 퇴장 |
| `joinRoom` | `{roomId}` | 방 입장 |
| `leaveRoom` | `{roomId}` | 방 퇴장 |
| `useItem` | `{itemId}` | 아이템 사용 |
| `acceptQuest` | `{questId}` | 퀘스트 수락 |
| `completeQuest` | `{questId}` | 퀘스트 완료 |

### Server → Client
| 이벤트 | 파라미터 | 설명 |
|--------|----------|------|
| `playerMoved` | `{id, x, y}` | 플레이어 이동 브로드캐스트 |
| `chatBroadcast` | `{characterId, message, roomId}` | 채팅 브로드캐스트 |
| `characterInteractionBroadcast` | `{characterId, interactionType, response}` | 인터랙션 결과 |
| `buildingEntered` | `{buildingId, timestamp}` | 건물 입장 확인 |
| `buildingExited` | `{buildingId, duration}` | 건물 퇴장 확인 |
| `inventoryUpdate` | `{inventory}` | 인벤토리 업데이트 |
| `questUpdate` | `{quests}` | 퀘스트 상태 업데이트 |
| `rewardReceived` | `{reward}` | 보상 수령 |

---

## 외부 접속

- **Mac mini IP:** `10.76.29.91`
- **Frontend:** `http://10.76.29.91:3000`
- **Backend:** `http://10.76.29.91:4000`
- **호스트 바인딩:** `0.0.0.0` (외부 접근 허용)

---

*마지막 업데이트: 2026-02-16*


## 날씨/시간 시스템 (2026-02-17 추가)

### 구조
- **유틸리티:** `frontend/src/utils/weatherTimeSystem.js`
- **통합:** `GameCanvas.jsx`에서 import하여 렌더링 루프에 통합

### 게임 시간
- 1 게임 일 = 24분 실시간
- 시간대: 새벽(5-7), 아침(7-12), 오후(12-17), 저녁(17-20), 밤(20-5)
- 시간대별 오버레이 색상 변화

### 날씨 시스템
- 4종류: 맑음, 흐림, 비, 눈
- 5분마다 랜덤 변경
- 비/눈: 파티클 시스템으로 렌더링

### HUD
- 좌상단에 게임 시간 + 날씨 표시
- 픽셀 아트 스타일 (Press Start 2P 폰트)

## NPC 스케줄/일과 시스템 (2026-02-17 추가)

### 구조
- **공유 모듈:** `shared/npcSchedule.js` (프론트엔드/백엔드 공용)
- **통합 대상:** `ai-agent/agent.js` (Issue #34)

### 장소 (5개)
- 도서관 (175, 150), 카페 (800, 475), 상점 (490, 560), 공원 (500, 300), 집 (100, 600)

### 일과 스케줄
| 시간 | 장소 | 활동 |
|------|------|------|
| 0-6 | 집 | 수면 |
| 6-8 | 카페 | 커피 |
| 8-12 | 도서관 | 공부 |
| 12-13 | 카페 | 커피 |
| 13-15 | 공원 | 산책 |
| 15-18 | 도서관 | 독서 |
| 18-19 | 상점 | 쇼핑 |
| 19-21 | 공원 | 휴식 |
| 21-24 | 집 | 수면 |

### 주요 함수
- `getCurrentSchedule(hour)`: 현재 스케줄 항목
- `getScheduleLocation(hour)`: 목표 좌표
- `moveTowardTarget(cx, cy, tx, ty, speed)`: 이동 계산
- `getNpcStatus(hour)`: 전체 상태 조회
