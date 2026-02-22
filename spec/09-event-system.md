# 이벤트 시스템 (Event System)

## 개요

AI Life Metaverse의 이벤트 시스템은 플레이어에게 다양한 도전과 보상을 제공하여 게임의 재미와 참여도를 높입니다. 시즌 이벤트, 특별 이벤트, 일일/주간 퀘스트를 포함합니다.

---

## 1. 시즌 이벤트 시스템 (Seasonal Event System)

### 시즌 타입

| 시즌 | 코드 | 기간 | 설명 |
|------|------|------|------|
| 봄 | `spring` | 3월~5월 | 벚꽃 축제, 봄맞이 행사 |
| 여름 | `summer` | 6월~8월 | 바다 축제, 여름 이벤트 |
| 가을 | `autumn` | 9월~11월 | 단풍 축제, 수확제 |
| 겨울 | `winter` | 12월~2월 | 눈 축제, 크리스마스 |

### 시즌 이벤트 데이터 구조

```json
{
  "seasonId": "spring-2026",
  "seasonType": "spring",
  "year": 2026,
  "startDate": "2026-03-01T00:00:00Z",
  "endDate": "2026-05-31T23:59:59Z",
  "isActive": true,
  "events": [
    {
      "eventId": "cherry-blossom-2026",
      "title": "벚꽃 축제",
      "description": "전국의 벚꽃이 만개합니다!",
      "startDate": "2026-04-01T00:00:00Z",
      "endDate": "2026-04-30T23:59:59Z",
      "imageUrl": "/events/cherry-blossom.jpg",
      "rewards": {
        "experience": 200,
        "coins": 100,
        "items": [
          { "id": "cherry-pet", "quantity": 1, "name": "벚꽃 펫" }
        ]
      },
      "tasks": [
        {
          "id": "visit-park-5-times",
          "description": "공원 5번 방문",
          "type": "visit_building",
          "targetId": "park",
          "requiredCount": 5
        },
        {
          "id": "chat-with-ai-10-times",
          "description": "AI와 10번 대화",
          "type": "chat",
          "requiredCount": 10
        }
      ]
    }
  ]
}
```

### SeasonalEventManager API

| 함수 | 설명 | 파라미터 | 반환값 |
|------|------|----------|--------|
| `getCurrentSeason()` | 현재 시즌 조회 | - | `Season \| null` |
| `getSeasonEvents(seasonId)` | 시즌 이벤트 목록 조회 | `seasonId` (string) | `Event[]` |
| `getActiveEvents()` | 활성 이벤트 목록 조회 | - | `Event[]` |
| `startSeason(seasonId)` | 시즌 시작 | `seasonId` (string) | `boolean` |
| `endSeason(seasonId)` | 시즌 종료 | `seasonId` (string) | `boolean` |
| `updateSeasonProgress(characterId, taskId)` | 시즌 이벤트 진행 업데이트 | `characterId`, `taskId` | `boolean` |
| `claimSeasonReward(characterId, eventId)` | 시즌 이벤트 리워드 수령 | `characterId`, `eventId` | `Reward \| null` |

---

## 2. 특별 이벤트 시스템 (Special Event System)

### 특별 이벤트 타입

| 이벤트 | 코드 | 기간 | 설명 |
|--------|------|------|------|
| 할로윈 | `halloween` | 10월 31일 | 호박, 코스튬 이벤트 |
| 크리스마스 | `christmas` | 12월 24~25일 | 산타, 선물 이벤트 |
| 신년 | `new-year` | 1월 1일 | 새해 축하 이벤트 |
| 발렌타인 | `valentine` | 2월 14일 | 사랑 이벤트 |
| 애견의 날 | `dog-day` | 8월 7일 | 반려견 이벤트 |

### 특별 이벤트 데이터 구조

```json
{
  "eventId": "halloween-2026",
  "eventType": "halloween",
  "year": 2026,
  "title": "할로윈 파티",
  "description": "무서운 밤의 축제!",
  "startDate": "2026-10-28T00:00:00Z",
  "endDate": "2026-10-31T23:59:59Z",
  "isActive": false,
  "imageUrl": "/events/halloween.jpg",
  "rewards": {
    "experience": 500,
    "coins": 300,
    "items": [
      { "id": "pumpkin-costume", "quantity": 1, "name": "호박 코스튬" },
      { "id": "candy", "quantity": 20, "name": "사탕" }
    ]
  },
  "tasks": [
    {
      "id": "collect-candies-50",
      "description": "50개 사탕 수집",
      "type": "collect",
      "targetId": "candy",
      "requiredCount": 50
    },
    {
      "id": "visit-haunted-house",
      "description": "유령의 집 방문",
      "type": "visit_building",
      "targetId": "haunted-house",
      "requiredCount": 1
    }
  ],
  "specialEffects": {
    "worldTheme": "halloween",
    "npcCostumes": ["ghost", "witch", "pumpkin"],
    "backgroundMusic": "/audio/halloween-bg.mp3"
  }
}
```

### SpecialEventManager API

| 함수 | 설명 | 파라미터 | 반환값 |
|------|------|----------|--------|
| `getSpecialEvent(eventType, year)` | 특별 이벤트 조회 | `eventType`, `year` | `Event \| null` |
| `getAllSpecialEvents()` | 모든 특별 이벤트 조회 | - | `Event[]` |
| `getActiveSpecialEvents()` | 활성 특별 이벤트 조회 | - | `Event[]` |
| `activateEvent(eventId)` | 이벤트 활성화 | `eventId` (string) | `boolean` |
| `deactivateEvent(eventId)` | 이벤트 비활성화 | `eventId` (string) | `boolean` |
| `updateEventProgress(characterId, taskId)` | 이벤트 진행 업데이트 | `characterId`, `taskId` | `boolean` |
| `claimEventReward(characterId, eventId)` | 이벤트 리워드 수령 | `characterId`, `eventId` | `Reward \| null` |
| `applyEventEffects(eventId, roomId)` | 이벤트 효과 적용 | `eventId`, `roomId` | `boolean` |

---

## 3. 이벤트 리워드 시스템 (Event Reward System)

### 리워드 타입

| 타입 | 설명 |
|------|------|
| `experience` | 경험치 |
| `coins` | 코인 |
| `items` | 아이템 (배열) |
| `stats` | 능력치 증가 |
| `titles` | 칭호 |

### 리워드 데이터 구조

```json
{
  "rewardId": "reward-001",
  "type": "bundle",
  "experience": 200,
  "coins": 100,
  "items": [
    {
      "itemId": "cherry-pet",
      "quantity": 1,
      "name": "벚꽃 펫",
      "description": "귀여운 벚꽃 펫",
      "icon": "/items/cherry-pet.png",
      "rarity": "legendary"
    }
  ],
  "statsBoost": {
    "hp": 10,
    "affinity": 5,
    "charisma": 3
  },
  "title": "벚꽃 사냥꾼",
  "expiresAt": "2026-06-01T00:00:00Z"
}
```

### EventRewardSystem API

| 함수 | 설명 | 파라미터 | 반환값 |
|------|------|----------|--------|
| `createReward(config)` | 리워드 생성 | `config` (object) | `Reward` |
| `grantReward(characterId, reward)` | 리워드 지급 | `characterId`, `reward` | `RewardGrantResult` |
| `grantRewardsByEvent(characterId, eventId)` | 이벤트 리워드 지급 | `characterId`, `eventId` | `RewardGrantResult[]` |
| `getRewardHistory(characterId)` | 리워드 히스토리 조회 | `characterId` | `RewardHistory[]` |
| `hasClaimedReward(characterId, eventId)` | 리워드 수령 여부 확인 | `characterId`, `eventId` | `boolean` |
| `markRewardClaimed(characterId, eventId)` | 리워드 수령 마크 | `characterId`, `eventId` | `boolean` |

### RewardGrantResult 구조

```typescript
interface RewardGrantResult {
  success: boolean;
  rewardId: string;
  grants: {
    type: 'experience' | 'coins' | 'item' | 'stats' | 'title';
    value: any;
    success: boolean;
    error?: string;
  }[];
  timestamp: Date;
}
```

---

## 4. 일일/주간 퀘스트 시스템 (Daily/Weekly Quest System)

### 일일 퀘스트 타입

| 퀘스트 | 설명 | 보상 |
|--------|------|------|
| 코인 수집가 | 코인 100개 수집 | 50 EXP + 50 코인 |
| 소셜 호랑나비 | 채팅 5회 | 30 EXP + 30 코인 |
| 탐험가 | 서로 다른 건물 3개 방문 | 40 EXP + 40 코인 |

### 주간 퀘스트 타입

| 퀘스트 | 설명 | 보상 |
|--------|------|------|
| 마스터 탐험가 | 건물 10개 방문 | 200 EXP + 100 코인 + 특별 아이템 |
| 대화 왕 | 채팅 30회 | 150 EXP + 80 코인 |
| 퀘스트 헌터 | 퀘스트 5개 완료 | 250 EXP + 120 코인 + 레어 아이템 |

### DailyQuestManager API

| 함수 | 설명 | 파라미터 | 반환값 |
|------|------|----------|--------|
| `getDailyQuests(characterId)` | 일일 퀘스트 목록 조회 | `characterId` | `Quest[]` |
| `getWeeklyQuests(characterId)` | 주간 퀘스트 목록 조회 | `characterId` | `Quest[]` |
| `updateDailyQuestProgress(characterId, eventType, data)` | 일일 퀘스트 진행 업데이트 | `characterId`, `eventType`, `data` | `boolean` |
| `updateWeeklyQuestProgress(characterId, eventType, data)` | 주간 퀘스트 진행 업데이트 | `characterId`, `eventType`, `data` | `boolean` |
| `completeQuest(characterId, questId)` | 퀘스트 완료 처리 | `characterId`, `questId` | `Reward \| null` |
| `resetDailyQuests(characterId)` | 일일 퀘스트 리셋 | `characterId` | `boolean` |
| `resetWeeklyQuests(characterId)` | 주간 퀘스트 리셋 | `characterId` | `boolean` |
| `shouldResetDaily(characterId)` | 일일 퀘스트 리셋 필요 여부 | `characterId` | `boolean` |
| `shouldResetWeekly(characterId)` | 주간 퀘스트 리셋 필요 여부 | `characterId` | `boolean` |

---

## 5. 이벤트 진행 데이터 (Event Progress Data)

### 데이터 구조

```json
{
  "characterId": "char_abc123",
  "seasonEvents": {
    "spring-2026": {
      "cherry-blossom-2026": {
        "status": "in_progress",
        "completedTasks": [],
        "progress": 0,
        "maxProgress": 2
      }
    }
  },
  "specialEvents": {
    "halloween-2026": {
      "status": "not_started",
      "completedTasks": [],
      "progress": 0,
      "maxProgress": 2
    }
  },
  "dailyQuests": {
    "daily-coins-2026-02-19": {
      "status": "completed",
      "completedAt": "2026-02-19T10:30:00Z",
      "rewardClaimed": true
    }
  },
  "weeklyQuests": {
    "weekly-explorer-2026-W07": {
      "status": "in_progress",
      "completedTasks": [1, 2, 3],
      "progress": 3,
      "maxProgress": 10
    }
  },
  "lastDailyReset": "2026-02-19T00:00:00Z",
  "lastWeeklyReset": "2026-02-16T00:00:00Z"
}
```

### EventProgressManager API

| 함수 | 설명 | 파라미터 | 반환값 |
|------|------|----------|--------|
| `getEventProgress(characterId)` | 이벤트 진행 상태 조회 | `characterId` | `EventProgress` |
| `saveEventProgress(characterId, progress)` | 이벤트 진행 상태 저장 | `characterId`, `progress` | `boolean` |
| `updateTaskProgress(characterId, taskId, progress)` | 태스크 진행 업데이트 | `characterId`, `taskId`, `progress` | `boolean` |
| `completeTask(characterId, taskId)` | 태스크 완료 | `characterId`, `taskId` | `boolean` |
| `resetProgress(characterId, eventType)` | 진행 상태 리셋 | `characterId`, `eventType` | `boolean` |

---

## 6. Redis 데이터 구조 (Event System)

### 시즌 이벤트

```
event:season:{season_id} = {
  "seasonId": "spring-2026",
  "seasonType": "spring",
  "year": 2026,
  "startDate": "2026-03-01T00:00:00Z",
  "endDate": "2026-05-31T23:59:59Z",
  "isActive": true,
  "events": [...]
}
```

**TTL:** `TTL.LONG` (1일)

---

### 특별 이벤트

```
event:special:{event_id} = {
  "eventId": "halloween-2026",
  "eventType": "halloween",
  "year": 2026,
  "title": "할로윈 파티",
  "startDate": "2026-10-28T00:00:00Z",
  "endDate": "2026-10-31T23:59:59Z",
  "isActive": false,
  "rewards": {...},
  "tasks": [...]
}
```

**TTL:** `TTL.LONG` (1일)

---

### 이벤트 진행 상태

```
event:progress:{character_id} = {
  "characterId": "char_abc123",
  "seasonEvents": {...},
  "specialEvents": {...},
  "dailyQuests": {...},
  "weeklyQuests": {...},
  "lastDailyReset": "2026-02-19T00:00:00Z",
  "lastWeeklyReset": "2026-02-16T00:00:00Z"
}
```

**TTL:** `TTL.LONG` (1일)

---

### 리워드 히스토리

```
event:rewards:{character_id} = [
  {
    "rewardId": "reward-001",
    "eventId": "cherry-blossom-2026",
    "grantedAt": "2026-04-15T10:30:00Z",
    "reward": {...}
  }
]
```

**TTL:** `TTL.WEEK` (1주일)

---

## 7. Socket.io 이벤트 (Event System)

### 클라이언트 → 서버

| 이벤트 | 설명 | 파라미터 |
|--------|------|----------|
| `getSeasonEvents` | 시즌 이벤트 목록 조회 | `{ seasonId? }` |
| `getSpecialEvents` | 특별 이벤트 목록 조회 | `{ eventType?, year? }` |
| `getEventProgress` | 이벤트 진행 상태 조회 | `{}` |
| `updateEventTask` | 이벤트 태스크 진행 업데이트 | `{taskId, progress}` |
| `claimEventReward` | 이벤트 리워드 수령 | `{eventId}` |
| `getDailyQuests` | 일일 퀘스트 목록 조회 | `{}` |
| `getWeeklyQuests` | 주간 퀘스트 목록 조회 | `{}` |
| `resetDailyQuests` | 일일 퀘스트 리셋 | `{}` |
| `resetWeeklyQuests` | 주간 퀘스트 리셋 | `{}` |

### 서버 → 클라이언트

| 이벤트 | 설명 | 파라미터 |
|--------|------|----------|
| `seasonEvents` | 시즌 이벤트 목록 | `{ events: SeasonEvent[] }` |
| `specialEvents` | 특별 이벤트 목록 | `{ events: SpecialEvent[] }` |
| `eventProgress` | 이벤트 진행 상태 | `{ progress: EventProgress }` |
| `eventTaskUpdated` | 태스크 진행 업데이트 | `{taskId, progress}` |
| `eventRewardClaimed` | 이벤트 리워드 수령 | `{reward, timestamp}` |
| `dailyQuests` | 일일 퀘스트 목록 | `{ quests: Quest[] }` |
| `weeklyQuests` | 주간 퀘스트 목록 | `{ quests: Quest[] }` |
| `questCompleted` | 퀘스트 완료 | `{questId, reward}` |

---

## 8. 구현 파일

### Backend

- `backend/event-system/seasonal-event-manager.js` - 시즌 이벤트 관리자
- `backend/event-system/special-event-manager.js` - 특별 이벤트 관리자
- `backend/event-system/event-reward-system.js` - 이벤트 리워드 시스템
- `backend/event-system/daily-quest-manager.js` - 일일/주간 퀘스트 관리자
- `backend/event-system/event-progress-manager.js` - 이벤트 진행 상태 관리자
- `backend/event-system/event-data.js` - 이벤트 데이터 (기본 이벤트 정의)
- `backend/event-system/index.js` - 이벤트 시스템 메인

### Frontend

- `frontend/src/systems/EventSystem.js` - 이벤트 시스템 (클라이언트)
- `frontend/src/components/EventPanel.jsx` - 이벤트 패널
- `frontend/src/components/SeasonEventCard.jsx` - 시즌 이벤트 카드
- `frontend/src/components/SpecialEventCard.jsx` - 특별 이벤트 카드
- `frontend/src/components/DailyQuestList.jsx` - 일일 퀘스트 목록

---

## 9. 테스트 (Testing)

### Backend Tests

- `backend/event-system/__tests__/seasonal-event-manager.test.js` - 시즌 이벤트 관리자 테스트
- `backend/event-system/__tests__/special-event-manager.test.js` - 특별 이벤트 관리자 테스트
- `backend/event-system/__tests__/event-reward-system.test.js` - 이벤트 리워드 시스템 테스트
- `backend/event-system/__tests__/daily-quest-manager.test.js` - 일일 퀘스트 관리자 테스트
- `backend/event-system/__tests__/event-progress-manager.test.js` - 이벤트 진행 상태 관리자 테스트

### Frontend Tests

- `frontend/src/systems/__tests__/EventSystem.test.js` - 이벤트 시스템 테스트
- `frontend/src/components/__tests__/EventPanel.test.jsx` - 이벤트 패널 테스트
- `frontend/src/components/__tests__/SeasonEventCard.test.jsx` - 시즌 이벤트 카드 테스트
- `frontend/src/components/__tests__/SpecialEventCard.test.jsx` - 특별 이벤트 카드 테스트

---

## 10. Phase 7 완료 체크리스트 ✅

- [x] SeasonalEventManager 구현 ✅ (2026-02-19)
- [x] SpecialEventManager 구현 ✅ (2026-02-19)
- [x] EventRewardSystem 구현 ✅ (2026-02-19)
- [x] DailyQuestManager 구현 ✅ (2026-02-19)
- [x] EventProgressManager 구현 ✅ (2026-02-19)
- [x] Redis Integration 완료 ✅ (2026-02-19)
- [x] Socket.io 이벤트 통합 ✅ (2026-02-19)
- [x] Event Data 완전 구현 (시즌/특별/일일/주간) ✅ (2026-02-19)
- [x] Scheduler 완전 구현 (일일/주간 리셋) ✅ (2026-02-19)
- [x] Phase 7 구현 체크 (phase7-check.cjs) ✅ (2026-02-19)

### 구현된 기능

**시즌 이벤트 (4개):**
- ✅ 봄: 벚꽃 축제 (3월~5월)
- ✅ 여름: 여름 축제 (6월~8월)
- ✅ 가을: 가을 축제 (9월~11월)
- ✅ 겨울: 겨울 추제 (12월~2월)

**특별 이벤트 (3개):**
- ✅ 할로윈: 할로윈 파티 (10/31)
- ✅ 크리스마스: 크리스마스 (12/24~25)
- ✅ 신년: 신년 축하 (1/1)

**일일 퀘스트 (3개):**
- ✅ 코인 수집가: 코인 100개 수집
- ✅ 소셜 호랑나비: 채팅 5회
- ✅ 탐험가: 건물 3개 방문

**주간 퀘스트 (3개):**
- ✅ 마스터 탐험가: 건물 10개 방문
- ✅ 대화 왕: 채팅 30회
- ✅ 퀘스트 헌터: 퀘스트 5개 완료

### GitHub Issues

- ✅ #99 [feat] Phase 7: 이벤트 시스템 (CLOSED 2026-02-19 12:30)
- ✅ #102 [feat] Phase 7-1: 일일 퀘스트 시스템 (CLOSED 2026-02-19 12:30)
- ✅ #103 [feat] Phase 7-2: 시즌 이벤트 시스템 (CLOSED 2026-02-19 12:30)

---

*마지막 업데이트: 2026-02-19 12:30 (Phase 7 완료)*