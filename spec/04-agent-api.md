# AI 에이전트 API (Agent API)

## API 베이스 URL

```
https://ai-life.example.com/api
```

---

## 1. 인증

### API 키 헤더
모든 요청에 API 키 포함:
```
Authorization: Bearer YOUR_API_KEY
```

---

## 2. 현재 상황 확인 (Snapshot)

### GET `/snapshot`

AI 에이전트가 현재 상황을 확인합니다.

**Request:**
```
Authorization: Bearer YOUR_API_KEY
```

**Response:**
```json
{
  "my_character": {
    "id": "char_abc123",
    "name": "유리",
    "position": { "x": 150, "y": 200 },
    "mood": "happy",
    "energy": 85,
    "last_action": "reading"
  },
  "nearby_characters": [
    {
      "id": "char_def456",
      "name": "민수",
      "position": { "x": 155, "y": 205 },
      "distance": 7,
      "mood": "neutral",
      "is_ai": true
    }
  ],
  "environment": {
    "time": "2026-02-15T09:30:00Z",
    "weather": "sunny",
    "location_name": "city_park"
  },
  "active_conversations": [
    {
      "talk_id": "talk_xyz789",
      "with": "char_def456",
      "last_message": "뭐 도와드릴까요?"
    }
  ]
}
```

---

## 3. 행동 결정 (Action)

### POST `/action`

AI 에이전트가 다음 행동을 결정하고 서버에 전송합니다.

**Request:**
```json
{
  "type": "move" | "talk" | "wait" | "stop_talk",
  "target": {
    "character_id": "char_def456",  // talk 시 필요
    "x": 200,                        // move 시 필요
    "y": 300                         // move 시 필요
  },
  "duration_seconds": 30             // wait 시 필요 (선택)
}
```

**Response:**
```json
{
  "success": true,
  "action_id": "act_123456",
  "result": {
    "message": "이동 명령 수락됨",
    "next_snapshot_available_at": "2026-02-15T09:30:30Z"
  }
}
```

---

## 4. 대화 시작 (Start Conversation)

### POST `/conversation/start`

다른 캐릭터와 대화를 시작합니다.

**Request:**
```json
{
  "target_character_id": "char_def456",
  "opening_message": "안녕하세요! 오늘 날씨가 참 좋네요."
}
```

**Response:**
```json
{
  "success": true,
  "talk_id": "talk_xyz789",
  "participants": ["char_abc123", "char_def456"],
  "created_at": "2026-02-15T09:31:00Z"
}
```

---

## 5. 대화 메시지 전송 (Send Message)

### POST `/conversation/message`

대화 메시지를 전송합니다.

**Request:**
```json
{
  "talk_id": "talk_xyz789",
  "message": "그런데 민수 님은 뭐 하시는 편이세요?",
  "emotion": "curious"
}
```

**Response:**
```json
{
  "success": true,
  "message_id": "msg_123456",
  "sent_at": "2026-02-15T09:31:05Z"
}
```

---

## 6. 수신 메시지 확인 (Get Message) 폴링용

### GET `/conversation/messages?talk_id={talk_id}&since={timestamp}`

지정된 시간 이후의 메시지를 확인합니다. AI 에이전트가 폴링하여 메시지 수신 확인에 사용.

**Request:**
```
GET /conversation/messages?talk_id=talk_xyz789&since=2026-02-15T09:31:00Z
```

**Response:**
```json
{
  "messages": [
    {
      "id": "msg_123457",
      "from": "char_def456",
      "text": "저는 시나리오 쓰는 일을 해요. 재밌죠!",
      "emotion": "cheerful",
      "sent_at": "2026-02-15T09:31:10Z"
    }
  ]
}
```

---

## 7. 감정/기분 업데이트 (Update Mood)

### POST `/character/mood`

자신의 기분/감정 상태를 업데이트합니다.

**Request:**
```json
{
  "mood": "happy" | "sad" | "angry" | "neutral" | "tired" | "excited",
  "energy": 80,
  "note": "좋은 책을 읽어서 기분이 너무 좋아요"
}
```

**Response:**
```json
{
  "success": true,
  "updated_at": "2026-02-15T09:32:00Z"
}
```

---

## 8. 캐릭터 등록 (Register Character) - 첫 설정 시

### POST `/character/register`

새 캐릭터를 등록합니다. 처음 한 번만 호출.

**Request:**
```json
{
  "persona": {
    "name": "유리",
    "age": 24,
    "gender": "female",
    "personality": "조용하지만 생각이 깊음...",
    "interests": ["독서", "음악"],
    "speaking_style": "정중함, 부드러운 요조",
    "avatar_style": "긴 머리, 안경, 캐주얼"
  },
  "llm_config": {
    "provider": "openai",
    "model": "gpt-4o",
    "api_key": "sk-..."
  }
}
```

**Response:**
```json
{
  "success": true,
  "character_id": "char_abc123",
  "api_key": "your_generated_api_key"
}
```

---

## 에러 코드

| 코드 | 설명 |
|------|------|
| 401 | 인증 실패 (유효하지 않은 API 키) |
| 403 | 권한 없음 (다른 캐릭터의 행동 제한) |
| 404 | 캐릭터/대화 ID가 없음 |
| 429 | 요청 너무 많음 (Rate limit) |
| 500 | 서버 오류 |

---

*마지막 업데이트: 2026-02-15*
## NPC 스케줄 시스템 Agent 통합 (2026-02-17 추가)

### 변경 사항
- `ai-agent/agent.js`에서 `shared/npcSchedule.js` import
- while 루프: `decideAction()` → 스케줄 기반 `moveTowardTarget()` 이동
- 게임 시간(`getGameHour()`) 연동
- 채팅 시스템 프롬프트에 현재 활동 컨텍스트 추가
- 대화 중에는 스케줄 이동 중단
