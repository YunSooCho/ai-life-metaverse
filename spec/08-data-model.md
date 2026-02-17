# 데이터 모델 (Data Model)

## 데이터베이스 스키마

### 1. 사용자 (Users)

| 필드 | 타입 | 설명 |
|------|------|------|
| `user_id` | UUID (PK) | 사용자 고유 ID |
| `email` | VARCHAR | 이메일 (unique) |
| `password_hash` | VARCHAR | 비밀번호 해시 |
| `display_name` | VARCHAR | 표시 이름 |
| `created_at` | TIMESTAMP | 가입일 |
| `last_login` | TIMESTAMP | 마지막 로그인 |

---

### 2. 캐릭터 (Characters)

| 필드 | 타입 | 설명 |
|------|------|------|
| `character_id` | UUID (PK) | 캐릭터 고유 ID |
| `user_id` | UUID (FK) | 소유 사용자 (AI일 경우 NULL) |
| `name` | VARCHAR | 이름 |
| `age` | INT | 나이 |
| `gender` | VARCHAR | 성별 |
| `avatar_style` | TEXT | 일러스트 스타일 (JSON) |
| `personality` | TEXT | 성격 (JSON) |
| `interests` | TEXT | 관심사 (JSON 배열) |
| `hometown` | VARCHAR | 고향 |
| `speaking_style` | VARCHAR | 말투 |
| `preferred_locations` | TEXT | 선호 장소 (JSON 배열) |
| `active_hours` | TEXT | 활동 시간 (JSON) |
| `social_style` | VARCHAR | 사회적 성향 |
| `is_ai` | BOOLEAN | AI 에이전트인가? |
| `llm_config` | TEXT | LLM 설정 (JSON) |
| `created_at` | TIMESTAMP | 생성일 |
| `last_active` | TIMESTAMP | 마지막 활동 |

---

### 3. 캐릭터 관계 (Character Relationships)

| 필드 | 타입 | 설명 |
|------|------|------|
| `relationship_id` | UUID (PK) | 관계 ID |
| `character_a_id` | UUID (FK) | 캐릭터 A ID |
| `character_b_id` | UUID (FK) | 캐릭터 B ID |
| `friendship_level` | INT | 호감도 (-100 ~ 100) |
| `last_interaction` | TIMESTAMP | 마지막 상호작용 |
| `interaction_count` | INT | 총 상호작용 횟수 |

**Unique Constraint:** (character_a_id, character_b_id)

---

### 4. 대화 (Conversations)

| 필드 | 타입 | 설명 |
|------|------|------|
| `talk_id` | UUID (PK) | 대화 ID |
| `character_a_id` | UUID (FK) | 캐릭터 A ID |
| `character_b_id` | UUID (FK) | 캐릭터 B ID |
| `started_at` | TIMESTAMP | 대화 시작 시간 |
| `ended_at` | TIMESTAMP | 대화 종료 시간 (NULL = 진행 중) |
| `location_x` | INT | 대화 시작 위치 X |
| `location_y` | INT | 대화 시작 위치 Y |

---

### 5. 대화 메시지 (Conversation Messages)

| 필드 | 타입 | 설명 |
|------|------|------|
| `message_id` | UUID (PK) | 메시지 ID |
| `talk_id` | UUID (FK) | 대화 ID |
| `from_character_id` | UUID (FK) | 보낸 캐릭터 ID |
| `message` | TEXT | 메시지 내용 |
| `emotion` | VARCHAR | 감정 표현 |
| `sent_at` | TIMESTAMP | 전송 시간 |

---

### 6. 캐릭터 상태 로그 (Character State Logs)

| 필드 | 타입 | 설명 |
|------|------|------|
| `log_id` | UUID (PK) | 로그 ID |
| `character_id` | UUID (FK) | 캐릭터 ID |
| `state_type` | VARCHAR | 상태 타입 (mood/energy/location) |
| `old_value` | TEXT | 이전 값 (JSON) |
| `new_value` | TEXT | 새 값 (JSON) |
| `timestamp` | TIMESTAMP | 변경 시간 |


---

## Redis 데이터 구조

### 1. 캐릭터 실시간 상태

```
character:{character_id}:state = {
  "position": { "x": 150, "y": 200 },
  "mood": "happy",
  "energy": 85,
  "last_action": "reading",
  "current_conversation": "talk_xyz789"
}
```

### 2. 근처 캐릭터 목록

```
nearby:{character_id} = [
  { "id": "char_def456", "name": "민수", "distance": 7 },
  { "id": "char_ghi789", "name": "하늘", "distance": 15 }
]
```

### 3. 활성 대화

```
conversation:{talk_id} = {
  "participants": ["char_abc123", "char_def456"],
  "started_at": "2026-02-15T09:31:00Z",
  "location": { "x": 150, "y": 200 }
}
```

### 4. 호감도 캐시 (optional)

```
affinity:{char_a}:{char_b} = 72
```

---

## JSON 데이터 구조 예시

### 페르소나 JSON
```json
{
  "name": "유리",
  "age": 24,
  "gender": "female",
  "personality": "조용하지만 생각이 깊음, 책 읽기 좋아, 가끔 유머러스",
  "interests": ["독서", "음악", "커피", "도시 탐험"],
  "hometown": "서울 북부",
  "speaking_style": "정중함, 부드러운 요조",
  "avatar_style": "긴 머리, 안경, 캐주얼 옷차림",
  "behavior_pattern": {
    "preferred_locations": ["공원", "카페", "도서관"],
    "active_hours": ["09:00-22:00"],
    "movement_speed": 30,
    "social_style": "주도적"
  }
}
```

### LLM 설정 JSON
```json
{
  "provider": "openai",
  "model": "gpt-4o",
  "api_key": "sk-...",
  "system_prompt_template": "당신은 {이름}입니다...",
  "default_temperature": 0.7,
  "max_tokens": 150
}
```

---

### 8. 퀘스트 템플릿 (Quest Templates)

| 필드 | 타입 | 설명 |
|------|------|------|
| `quest_id` | STRING (PK) | 퀘스트 고유 ID |
| `quest_type` | VARCHAR | 퀘스트 타입 (main/side) |
| `title` | VARCHAR | 퀘스트 제목 |
| `description` | TEXT | 퀘스트 설명 |
| `objectives` | TEXT | 목표 (JSON 배열) |
| `prerequisites` | TEXT | 선결 조건 (JSON 배열) |
| `reward` | TEXT | 보상 (JSON) |

---

### 9. 플레이어 퀘스트 (Player Quests)

| 필드 | 타입 | 설명 |
|------|------|------|
| `player_id` | STRING (FK) | 플레이어 ID |
| `quest_id` | STRING (FK) | 퀘스트 ID |
| `status` | VARCHAR | 상태 (progress/completed/available) |
| `progress` | TEXT | 목표 진행 상황 (JSON) |
| `started_at` | TIMESTAMP | 시작 시간 |
| `completed_at` | TIMESTAMP | 완료 시时间 |

**PK:** (player_id, quest_id)

---

### 퀘스트 목표 (Objectives) 구조

```json
{
  "objectives": [
    {
      "id": "greet_ai",
      "description": "AI 유리에게 인사하기",
      "type": "interact",
      "targetId": "ai-agent-1",
      "requiredCount": 1,
      "currentCount": 0,
      "unit": "count"
    },
    {
      "id": "stay_park",
      "description": "공원에서 30초 이상 체류하기",
      "type": "stay_building",
      "targetId": "park",
      "requiredCount": 30000,
      "currentCount": 0,
      "unit": "ms"
    }
  ]
}
```

---

### 퀘스트 보상 (Reward) 구조

```json
{
  "reward": {
    "points": 100,
    "experience": 50,
    "items": [
      { "id": "healthPotion", "quantity": 2 }
    ]
  }
}
```

**보상 타입:**
- `points`: 포인트
- `experience`: 경험치
- `items`: 아이템 (배열)

---

### 10. 일일 퀘스트 템플릿 (Daily Quest Templates)

| 필드 | 타입 | 설명 |
|------|------|------|
| `quest_id` | STRING (PK) | 일일 퀘스트 고유 ID |
| `quest_type` | VARCHAR | 퀘스트 타입 (daily) |
| `title` | VARCHAR | 일일 퀘스트 제목 |
| `description` | TEXT | 일일 퀘스트 설명 |
| `objectives` | TEXT | 목표 (JSON 배열) |
| `reward` | TEXT | 보상 (JSON) |

**기본 일일 퀘스트:**
1. 코인 수집가 - 코인 100개 수집
2. 소셜 호랑나비 - 채팅 5회
3. 탐험가 - 서로 다른 건물 3개 방문

---

### 11. 일일 퀘스트 상태 (Daily Quest State)

| 필드 | 타입 | 설명 |
|------|------|------|
| `character_id` | STRING (FK) | 캐릭터 ID |
| `last_reset_date` | DATE | 마지막 리셋 날짜 (YYYY-MM-DD) |
| `completed_quests` | TEXT | 완료된 일일 퀘스트 (JSON) |
| `active_quests` | TEXT | 활성 일일 퀘스트 (JSON) |

**자동 리셋:** 매일 0시 (00:00)에 일일 퀘스트 자동 리셋

---

### 일일 퀘스트 목표 타입

**코인 수집 (collect):**
```json
{
  "id": "collect_coins",
  "description": "100개 코인 수집",
  "type": "collect",
  "targetId": "coin",
  "requiredCount": 100,
  "currentCount": 0
}
```

**채팅 (chat):**
```json
{
  "id": "chat_count",
  "description": "5번 채팅하기",
  "type": "chat",
  "requiredCount": 5,
  "currentCount": 0
}
```

**건물 방문 (visit_building):**
```json
{
  "id": "visit_buildings",
  "description": "3개 건물 방문",
  "type": "visit_building",
  "requiredCount": 3,
  "currentCount": 0,
  "visitedBuildings": [1, 2, 3]  // 중복 방문 방지
}
```

---

### 일일 퀘스트 함수

**`getDailyQuests(characterId)`:**
- 플레이어의 오늘 일일 퀘스트 반환
- 매일 0시 자동 리셋

**`resetDailyQuests(characterId)`:**
- 일일 퀘스트 리셋 (자정 전달)
- 모두 목표 초기화

**`completeDailyQuest(characterId, questId)`:**
- 일일 퀘스트 완료 처리
- 모든 목표 달성 확인 필요

**`updateDailyQuestProgress(characterId, eventType, data)`:**
- 일일 퀘스트 진행 업데이트
- collect/chat/enterBuilding 이벤트 처리

**`getDailyQuestReward(questId)`:**
- 일일 퀘스트 보상 반환

---

## 12. 타일맵 데이터 구조 (Tilemap Data Structure)

### 타일맵 JSON

```json
{
  "version": "1.0",
  "mapSize": {
    "width": 1000,
    "height": 700,
    "tileWidth": 32,
    "tileHeight": 32
  },
  "layers": {
    "ground": {
      "type": "tilemap",
      "tiles": [
        {
          "id": 1,
          "name": "잔디",
          "color": "#4CAF50",
          "walkable": true,
          "x": 0,
          "y": 0,
          "width": 1000,
          "height": 700
        },
        {
          "id": 2,
          "name": "흙길",
          "color": "#8D6E63",
          "walkable": true,
          "path": [
            { "x": 150, "y": 200, "width": 120, "height": 20 },
            { "x": 200, "y": 200, "width": 20, "height": 300 }
          ]
        },
        {
          "id": 3,
          "name": "돌바닥",
          "color": "#757575",
          "walkable": true,
          "rects": [
            { "x": 130, "y": 130, "width": 160, "height": 140 }
          ]
        }
      ]
    },
    "buildings": {
      "type": "buildings",
      "buildings": [
        {
          "id": 1,
          "name": "상점",
          "type": "shop",
          "sprite": "shop",
          "x": 150,
          "y": 150,
          "width": 120,
          "height": 100,
          "entrance": {
            "x": 190,
            "y": 230,
            "width": 40,
            "height": 20
          },
          "interior": {
            "width": 400,
            "height": 300,
            "npcs": ["shopkeeper"]
          }
        }
      ]
    },
    "decoration": {
      "type": "objects",
      "objects": [
        {
          "id": "d1",
          "name": "나무",
          "sprite": "tree",
          "x": 300,
          "y": 300,
          "width": 32,
          "height": 48,
          "obstacle": true
        }
      ]
    }
  },
  "weather": {
    "current": "sunny",
    "types": ["sunny", "cloudy", "rainy", "snowy"]
  },
  "lighting": {
    "ambient": {
      "brightness": 1.0,
      "color": "#FFFFFF"
    },
    "timeOfDay": "day"
  }
}
```

---

### 건물 타입

| 타입 | 설명 | 색상 (MiniMap) |
|------|------|----------------|
| `shop` | 상점 | `#4CAF50` (초록) |
| `cafe` | 카페 | `#FF9800` (주황) |
| `park` | 공원 | `#8BC34A` (연두) |
| `library` | 도서관 | `#2196F3` (파랑) |
| `gym` | 체육관 | `#F44336` (빨강) |

---

### 입구 좌표 검증 규칙

**필수 조건:**
- `entrance.x >= building.x`
- `entrance.y >= building.y`
- `entrance.x + entrance.width <= building.x + building.width`
- `entrance.y + entrance.height <= building.y + building.height`

입구는 항상 건물 내부에 있어야 합니다.

---

### 타일 레이어 타입

| 타입 | 속성 | 설명 |
|------|------|------|
| 단일 rectangle | `x`, `y`, `width`, `height`, `color` | 잔디 등 |
| Path | `path` (rect 배열) | 흙길 |
| Rects | `rects` (rect 배열) | 돌바닥 |

---

### 날씨 시스템

| 타입 | 설명 |
|------|------|
| `sunny` | 맑음 |
| `cloudy` | 흐림 |
| `rainy` | 비 |
| `snowy` | 눈 |

---

### 조명/시간 시스템

| 속성 | 타입 | 설명 |
|------|------|------|
| `ambient.brightness` | FLOAT | 주변 밝기 (0.0 ~ 1.0) |
| `ambient.color` | HEX | 주변 조명 색상 |
| `timeOfDay` | STRING | 시간대 (day/night/dusk/dawn) |

---

## 13. 세이브/로드 시스템 (Save/Load System)

### 세이브 데이터 구조

```json
{
  "version": "1.0",
  "timestamp": 1739770000000,
  "player": {
    "id": "char_abc123",
    "name": "플레이어",
    "x": 150,
    "y": 200,
    "color": "#FF0000",
    "emoji": "😊"
  },
  "inventory": [
    {
      "id": "item_health",
      "name": "건강 포션",
      "quantity": 3
    }
  ],
  "quests": [
    {
      "id": "quest_1",
      "title": "첫 퀘스트",
      "progress": 50
    }
  ],
  "friendshipLevels": {
    "char_1": 80,
    "char_2": 50
  },
  "completedQuests": ["quest_0"],
  "currentRoom": "main"
}
```

### 세이브 슬롯 구조

- **최대 슬롯 수:** 3개
- **Storage Key:** `ai_life_save_{slot}`
- **Storage:** localStorage

### 세이브 슬롯 정보

```json
{
  "slot": 1,
  "exists": true,
  "timestamp": 1739770000000,
  "playerName": "플레이어"
}
```

### API 함수

| 함수 | 설명 | 파라미터 | 반환값 |
|------|------|----------|--------|
| `createSaveData(playerData)` | 세이브 데이터 생성 | `playerData` (object) | `saveData` (object) |
| `saveGame(slot, playerData)` | 세이브 저장 | `slot` (1~3), `playerData` | `boolean` (성공 여부) |
| `loadGame(slot)` | 세이브 로드 | `slot` (1~3) | `saveData` \| `null` |
| `validateSaveData(saveData)` | 데이터 유효성 검사 | `saveData` | `boolean` |
| `getSaveSlots()` | 슬롯 목록 조회 | - | `slots` (array) |
| `deleteSave(slot)` | 슬롯 삭제 | `slot` (1~3) | `boolean` |
| `deleteAllSaves()` | 전체 삭제 | - | `void` |
| `formatSaveTimestamp(timestamp)` | 타임스탬프 포맷 | `timestamp` | `string` |

### 유효성 검사 규칙

필수 필드:
- `version`: 버전 문자열
- `timestamp`: 타임스탬프 숫자
- `player.id`: 캐릭터 ID
- `inventory`: 배열
- `quests`: 배열
- `friendshipLevels`: 객체

---

*마지막 업데이트: 2026-02-17 (세이브/로드 시스템 추가)*