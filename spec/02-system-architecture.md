# System Architecture

## 전체 아키텍처

```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│   Frontend      │         │   Backend       │         │   Redis (DB)    │
│   (React)       │◄────────┤   (Node.js)     │◄────────┤   (Persistence) │
│                 │ Socket  │                 │   TCP   │                 │
│ - GameCanvas    │  .io    │ - socket.io     │         │ - 캐릭터 데이터  │
│ - ChatInput     │         │ - Express       │         │ - 인벤토리      │
│ - Components    │ REST    │ - AI Agent      │         │ - 호감도        │
└─────────────────┘  API    │   (GLM-4.7)     │         │ - 퀘스트        │
      │                     └─────────────────┘         │ - 채팅 히스토리 │
      │                              │                  │ - 방 데이터     │
      │                              │                  └─────────────────┘
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

### 유틸리티 (Phase 3: 픽셀아트 시스템)

- **pixelArtRenderer.js**: 픽셀아트 캐릭터 & 타일 렌더링
  - `Tile`: 타일 클래스 (id, type, properties, style)
  - `Tilemap`: 타일맵 클래스 (width, height, tiles, layers)
  - `drawTile`: 단일 타일 렌더링 (grass, water, tree, path)
  - `drawTilemap`: 타일맵 렌더링
  - `worldToTile`: 월드 좌표 → 타일 좌표 변환
  - `tileToWorld`: 타일 좌표 → 월드 좌표 변환
  - `calculateTileSpacing`: 타일 간격 계산
  - `drawPixelCharacter`: 픽셀아트 캐릭터 렌더링
  - `validateCustomizationOptions`: 커스터마이징 옵션 유효성 검사

- **TileRenderer.js**: 타일맵 레벨 렌더러
  - `renderGroundLayer`: Ground 레이어 렌더링
  - `renderDecorationLayer`: Decoration 레이어 렌더링
  - `renderEntranceHighlight`: 건물 입장 하이라이트

**Phase 3 완료 (2026-02-18)**
- ✅ 배경 픽셀아트 타일 시스템 완성
- ✅ Tile, Tilemap 클래스 추가
- ✅ 타일 패턴 (grass, water, tree, path)
- ✅ 타일 렌더링 함수
- ✅ 좌표 변환 함수
- ✅ 테스트 코드 (25 passed, 11 skipped)

## Backend 구조

### 핵심 모듈

- **server.js**: 메인 서버 (HTTP + Socket.io)
- **ai-agent/agent.js**: AI Agent (GLM-4.7 연동)
- **ai-agent/character.js**: 캐릭터 대화 로직
- **routes/*.js**: REST API 라우트

#### 월드 시스템 (world-system/) ✅ (2026-02-19 완료)

맵 유형별 건물, NPC, 지형 데이터를 관리하는 월드 확장 시스템

- **buildings.js**: 맵 유형별 건물 데이터 시스템
  - 맵 유형: default, beach, forest, mountain
  - 건물 데이터 구조: ID, 이름, 위치 (x, y), 크기 (width, height), 타입, 색상, mapType, description
  - 기능:
    - `getBuildingsByMap(mapType)`: 맵 유형별 건물 목록
    - `findBuildingById(buildingId)`: 건물 ID로 찾기
    - `getAllBuildings()`: 모든 건물 목록

- **maps.js**: 맵 데이터 시스템
  - 4개 맵:
    - 메인 광장 (default): 1000x700, 기본 건물 5개
    - 해변 (beach): 1200x800, 건물 3개, 바다/모래사장/파도
    - 숲 (forest): 1100x750, 건물 3개, 나무/강/동굴
    - 산맥 (mountain): 1300x900, 건물 3개, 산/눈/구름
  - 맵 데이터 구조: ID, 이름, 크기, 배경색, 지형색, 설명, 피처(features), 날씨(weather)
  - 피처 타입: pavement, decorative_tree, fountain, sand, sea, wave, umbrella, palm_tree, tree_cluster, stream, fireflies, mountain_peak, snow, mountain_base, pine_tree, cloud
  - 기능:
    - `getMap(mapId)`: 맵 데이터 가져오기
    - `getAllMaps()`: 모든 맵 목록
    - `mapExists(mapId)`: 맵 존재 여부
    - `getMapFeaturesForRendering(mapId)`: 렌더링용 피처 데이터

- **npcs.js**: NPC (새로운 AI 캐릭터) 데이터 시스템
  - 캐릭터 데이터 구조: ID, 이름, 위치 (x, y), 색상, 이모지, isAi(true), mapType, description, personality
  - 개인성(personality) 타입: friendly, energetic, responsible, adventurous, calm, knowledgeable, wild, confident, determined, hospitable
  - 맵 유형별 NPC:
    - default: AI 유리, AI 히카리 (2개)
    - beach: 수영 선생님, 서퍼, 낚꾼 (3개)
    - forest: 숲길 안내인, 야생 동물, 등산객 (3개)
    - mountain: 스키 강사, 산악 등반가, 산장 주인 (3개)
  - 기능:
    - `getNPCsByMap(mapType)`: 맵 유형별 NPC 목록
    - `findNPCById(npcId)`: NPC ID로 찾기
    - `getAllNPCs()`: 모든 NPC 목록
    - `getNPCIntroduction(npc)`: NPC 소개 텍스트 생성

- **index.js**: 월드 시스템 통합 모듈
  - `initializeWorldSystem()`: 월드 시스템 초기화 및 모든 데이터 로드
  - `getMapCompleteData(mapId)`: 맵 단위 완전 데이터 (맵 + 건물 + NPC)

**테스트 커버리지:**
- buildings.test.js: 18개 테스트 전체 통과
- maps.test.js: 24개 테스트 전체 통과
- npcs.test.js: 23개 테스트 전체 통과
- index.test.js: 22개 테스트 전체 통과
- **총 87개 테스트 전체 통과**

**추가일:** 2026-02-19

#### 데이터 영속성 시스템 (Redis/DB) ✅

- **backend/utils/redis-client.js**: Redis 클라이언트 연결 관리
  - `initRedis()` - Redis 클라이언트 초기화
  - `getRedisClient()` - Redis 클라이언트 인스턴스 가져오기
  - `closeRedis()` - Redis 연결 종료
  - `isRedisEnabled()` - Redis 사용 가능 여부 확인
  - **Graceful degradation**: Redis 연결 실패 시 메모리 모드로 실행

- **backend/persistence.js**: 데이터 영속화 API
  - **캐릭터 데이터**: `saveCharacter()`, `loadCharacter()`
  - **인벤토리**: `saveInventory()`, `loadInventory()`
  - **호감도**: `saveAffinities()`, `loadAffinities()`
  - **퀘스트**: `saveQuests()`, `loadQuests()`
  - **채팅 히스토리**: `saveChatHistory()`, `loadChatHistory()`
  - **방 데이터**: `saveRoom()`, `loadRoom()`
  - **통합 API**: `saveCharacterData()`, `loadCharacterData()`, `saveRoomData()`, `loadRoomData()`
  - **삭제**: `deleteCharacterData()`, `deleteRoomData()`

**TTL 설정:**
- SHORT: 5분
- MEDIUM: 1시간 (기본값)
- LONG: 1일 (캐릭터, 인벤토리, 호감도, 퀘스트, 방)
- WEEK: 1주일 (채팅 히스토리)

**추가일:** 2026-02-19

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

### 이벤트 시스템 (event-system/) ✅ (2026-02-19 완료)

시즌, 특별 이벤트, 일일/주간 퀘스트를 관리하는 이벤트 시스템

- **event-manager.js**: 이벤트 관리 시스템
  - 이벤트 등록, 활성화, 비활성화
  - 기능: `registerEvent`, `activateEvent`, `deactivateEvent`, `getActiveEvents`, `joinEvent`, `claimEventReward`, `getEventStats`
  - 이벤트 타입: seasonal, special, daily, weekly

- **seasonal-event.js**: 시즌 이벤트 시스템
  - 시즌: spring (봄), summer (여름), autumn (가을), winter (겨울)
  - 시즌별 데이터: 색상, 아이템, 보상, 설명
  - 기능: `getCurrentSeason`, `getSeasonalColors`, `getSeasonalItems`, `getSeasonalRewards`, `createSeasonalEvents`
  - 시즌별 맞춤 테마와 보상 시스템

- **special-event.js**: 특별 이벤트 시스템
  - 특별 이벤트: halloween (할로완), christmas (크리스마스), new_year (신년), valentine (발렌타인), anniversary (기념일)
  - 이벤트 데이터: 이름, 이모지, 설명, 기간, 색상, 특별 아이템, 활동
  - 기능: `createSpecialEvent`, `getActiveSpecialEvents`, `joinSpecialEvent`, `getSpecialItem`, `completeSpecialActivity`
  - 기간 내 맞춤 이벤트 자동 활성화

- **daily-quest.js**: 일일 퀘스트 시스템
  - 일일 퀘스트 카테고리: social, exploration, collection, combat, event
  - 퀘스트 난이도: easy, normal, hard
  - 기능: `createDailyQuests`, `updateQuestProgress`, `claimQuestReward`, `getCharacterDailyQuests`, `getDailyQuestStats`
  - 매일 23:59:59 리셋

- **weekly-quest.js**: 주간 퀘스트 시스템
  - 주간 퀘스트 카테고리: social, exploration, collection, mastery, event
  - 기능: `createWeeklyQuests`, `updateQuestProgress`, `claimQuestReward`, `getCharacterWeeklyQuests`, `getWeeklyQuestStats`, `getRemainingWeekInfo`
  - 일요일 23:59:59 리셋

- **event-reward.js**: 이벤트 보상 시스템
  - 보상 유형: experience, coin, item, title, costume, decoration
  - 보상 티어: common (60%), rare (30%), epic (8%), legendary (2%)
  - 기능: `createReward`, `giveReward`, `generateRandomReward`, `drawFromRewardPool`, `getRewardStats`
  - 확률 기반 랜덤 보상 시스템

- **index.js**: 이벤트 시스템 통합 모듈
  - `EventSystem`: 모든 이벤트 서브시스템 통합
  - 기능: `initialize`, `createCharacterDailyQuests`, `createCharacterWeeklyQuests`, `joinEvent`, `claimEventReward`, `claimQuestReward`, `getActiveEvents`, `getCharacterQuests`, `getSystemStats`

**테스트 커버리지:**
- event-manager.test.js: 13개 테스트 ✅
- seasonal-event.test.js: 22개 테스트 ✅
- special-event.test.js: 28개 테스트 ✅
- daily-quest.test.js: 30개 테스트 ✅
- weekly-quest.test.js: 26개 테스트 ✅
- event-reward.test.js: 32개 테스트 ✅
- index.test.js: 19개 테스트 ✅

**추가일:** 2026-02-19

### 친구 시스템 (friend-system/) ✅ (2026-02-19 완료)

친구 관리, 친구 요청, 온라인 상태 추적을 위한 소셜 시스템

- **friend-manager.js**: 친구 관리 시스템
  - 친구 추가/삭제/목록/검색
  - 친구 관계 확인 및 수 가져오기
  - 기능:
    - `getFriendList(characterId)`: 캐릭터의 친구 목록
    - `addFriend(characterId, friendId, friendName)`: 친구 추가
    - `removeFriend(characterId, friendId)`: 친구 삭제
    - `isFriend(characterId, targetId)`: 친구인지 확인
    - `searchFriends(characterId, query)`: 친구 검색
    - `getFriendCount(characterId)`: 친구 수
  - Graceful degradation: Redis 연결 실패 시 메모리 모드 실행
  - TTL: 7일 (친구 목록)

- **friend-request.js**: 친구 요청 시스템
  - 친구 요청 전송/수락/거절
  - 수신/보낸 요청 목록
  - 기능:
    - `getReceivedRequests(characterId)`: 수신한 요청 목록
    - `getSentRequests(characterId)`: 보낸 요청 목록
    - `sendRequest(fromId, fromName, toId, toName)`: 요청 전송
    - `acceptRequest(fromId, toId)`: 요청 수락
    - `rejectRequest(fromId, toId)`: 요청 거절
    - `getPendingRequestCount(characterId)`: 대기 중인 요청 수
    - `findRequest(fromId, toId)`: 특정 요청 찾기
  - 요청 상태: pending, accepted, rejected
  - TTL: 24시간 (요청)
  - 메모리 모드 지원 (Redis 연결 없음시)

- **online-tracker.js**: 온라인 상태 추적 시스템
  - 온라인/오프라인 상태 관리
  - 마지막 접속 시간 추적
  - 기능:
    - `setOnline(characterId, characterName)`: 온라인 설정
    - `setOffline(characterId)`: 오프라인 설정
    - `isOnline(characterId)`: 온라인 상태 확인
    - `getOnlineUsers()`: 모든 온라인 사용자
    - `getLastSeen(characterId)`: 마지막 접속 시간
    - `getFriendsOnlineStatus(friendIds)`: 친구들의 온라인 상태
  - TTL: 5분 (온라인 상태)
  - 긴 TTL: 마지막 접속 (유지)

- **index.js**: 친구 시스템 통합 모듈
  - `FriendSystem` class: 모든 서브시스템 통합
  - 기능:
    - `sendFriendRequest(fromId, fromName, toId, toName)`: 요청 전송 & 검증
    - `acceptFriendRequest(fromId, toId, friendName)`: 요청 수락 & 친구 추가
    - `rejectFriendRequest(fromId, toId)`: 요청 거절
    - `removeFriend(characterId, friendId)`: 친구 삭제 (양방향)
    - `getFriendListWithStatus(characterId)`: 친구 목록 & 온라인 상태
    - `characterOnline(characterId, characterName)`: 캐릭터 접속
    - `characterOffline(characterId)`: 캐릭터 접속 종료
    - `clearCharacterData(characterId)`: 캐릭터 데이터 전체 삭제
    - `getSystemStats()`: 시스템 통계 (온라인 사용자)
  - Singleton pattern: `initializeFriendSystem(redisClient)`, `getFriendSystem()`

**테스트 커버리지:**
- friend-manager.test.js: 16개 테스트 ✅
- friend-request.test.js: 21개 테스트 ✅
- online-tracker.test.js: 19개 테스트 ✅
- index.test.js: 26개 테스트 ✅
- **총 82개 테스트 전체 통과!**

**추가일:** 2026-02-19