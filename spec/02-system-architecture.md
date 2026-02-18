# System Architecture

## 전체 아키텍처

```
┌─────────────────┐         ┌─────────────────┐
│   Frontend      │         │   Backend       │
│   (React)       │◄────────┤   (Node.js)     │
│                 │ Socket  │                 │
│ - GameCanvas    │  .io    │ - socket.io     │
│ - ChatInput     │         │ - Express       │
│ - Components    │ REST    │ - AI Agent      │
└─────────────────┘  API    │   (GLM-4.7)     │
      │                     └─────────────────┘
      │                              │
      │                              │
      ▼                              ▼
  Browser                    Cerebras API
```

## Frontend 구조

### 주요 컴포넌트

- **App.jsx**: 메인 애플리케이션
- **GameCanvas**: 메인 게임 캔버스
- **ChatInput**: 채팅 입력
- **InteractionMenu**: 상호작용 메뉴
- **AffinityDisplay**: 호감도 표시
- **RoomMenu**: 방 메뉴
- **Inventory**: 인벤토리
- **Quest**: 퀘스트 시스템
- **Reward**: 보상 시스템

### Custom Hooks

- **useSocketEvent**: Socket.io 이벤트 핸들러

## Backend 구조

### 핵심 모듈

- **server.js**: 메인 서vier (HTTP + Socket.io)
- **ai-agent/agent.js**: AI Agent (GLM-4.7 연동)
- **ai-agent/character.js**: 캐릭터 대화 로직
- **routes/*.js**: REST API 라우트

### Socket.io 이벤트

**클라이언트 → 서버**:
- `join`: 방 입장
- `move`: 캐릭터 이동
- `chatMessage`: 채팅 메시지
- `interact`: 캐릭터 상호작용
- `characterInteraction`: AI 상호작용
- `createRoom`: 방 생성
- `changeRoom`: 방 변경
- `enterBuilding`: 건물 입장
- `exitBuilding`: 건물 퇴장
- `getInventory`: 인벤토리 조회
- `useItem`: 아이템 사용
- `claimReward`: 보상 수령
- `getQuests`: 퀘스트 조회
- `acceptQuest`: 퀘스트 수락
- `claimQuestReward`: 퀘스트 보상 수령

**서버 → 클라이언트**:
- `characters`: 모든 캐릭터 상태
- `characterUpdate`: 캐릭터 업데이트
- `chatBroadcast`: 채팅 브로드캐스트
- `characterInteractionBroadcast`: 상호작용 브로드캐스트
- `affinities`: 호감도 데이터
- `rooms`: 방 목록
- `roomJoined`: 방 입장 알림
- `buildings`: 건물 목록
- `buildingEvent`: 건물 이벤트
- `roomNotification`: 방 알림
- `inventory`: 인벤토리 데이터
- `rewardClaimed`: 보상 수령
- `itemUsed`: 아이템 사용
- `itemUseFailed`: 아이템 사용 실패
- `quests`: 퀘스트 데이터
- `questProgress`: 퀘스트 진행
- `questAccepted`: 퀘스트 수락
- `questRewardClaimed`: 퀘스트 보상 수령

## API Endpoint

### REST API

- `GET /api/health`: 헬스 체크
- `GET /api/character/:id`: 캐릭터 정보 조회
- `GET /api/rooms`: 방 목록 조회
- `GET /api/buildings`: 건물 목록 조회
- `GET /api/events/:characterId`: 이벤트 로그 조회
- `POST /api/rooms`: 방 생성
- `POST /api/weather`: 날씨 변경

## 데이터 흐름

1. **캐릭터 이동**: 클라이언트 → `move` 이벤트 → 서버 업데이트 → `characterUpdate` 브로드캐스트
2. **채팅**: 클라이언트 → `chatMessage` → 서버 저장 → `chatBroadcast` 브로드캐스트
3. **AI 대화**: 클라이언트 → `chatMessage` → 서버 → GLM-4.7 API → 응답 → `chatBroadcast` 브로드캐스트