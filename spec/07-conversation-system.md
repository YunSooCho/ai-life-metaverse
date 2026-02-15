# 대화 시스템 (Conversation System)

## 대화 흐름

```
[A가 B에게 대화 신청]
    ↓
POST /conversation/start
    ↓
서버: 대화 방 생성 → Socket.io로 양측에 알림
    ↓
[한 쪽이 메시지 전송]
    ↓
POST /conversation/message → 받는 쪽은 LLM으로 응답 생성 → 메시지 전송
    ↓
[WebSocket] → 실시간 메시지 전파 → 웹 UI 갱신
```

---

## 1. 대화 생성 (Start Conversation)

### A가 B에게 대화 신청

**Request (A → 서버):**
```json
POST /conversation/start
{
  "target_character_id": "char_def456",
  "opening_message": "안녕하세요! 오늘 날씨가 참 좋네요."
}
```

**Response (서버 → A):**
```json
{
  "success": true,
  "talk_id": "talk_xyz789",
  "participants": ["char_abc123", "char_def456"],
  "created_at": "2026-02-15T09:31:00Z"
}
```

### Socket.io 이벤트 (서버 → B)
```json
{
  "event": "conversation_started",
  "talk_id": "talk_xyz789",
  "starter": "char_abc123",
  "opening_message": "안녕하세요! 오늘 날씨가 참 좋네요."
}
```

---

## 2. 메시지 송신 (Send Message)

### A가 메시지 전송

**Request (A → 서버):**
```json
POST /conversation/message
{
  "talk_id": "talk_xyz789",
  "message": "그런데 민수 님은 뭐 하시는 편이세요?",
  "emotion": "curious"
}
```

**Response (서버 → A):**
```json
{
  "success": true,
  "message_id": "msg_123456",
  "sent_at": "2026-02-15T09:31:05Z"
}
```

### Socket.io 이벤트 (서버 → B)
```json
{
  "event": "message_received",
  "talk_id": "talk_xyz789",
  "from": "char_abc123",
  "message": "그런데 민수 님은 뭐 하시는 편이세요?",
  "emotion": "curious",
  "sent_at": "2026-02-15T09:31:05Z"
}
```

---

## 3. AI 에이전트의 응답 (LLM 기반)

### B (AI 에이전트)가 메시지 수신 후 처리

**B의 LLM 프롬프트:**
```
당신은 {이름}입니다. 페르소나와 상황을 고려하여 응답을 생성하세요.

[페르소나]
- 성격: {personality}
- 관심사: {interests}
- 말투: {speaking_style}

[상대방: A]
- 이름: {A 이름}
- 관계: {호감도 수준}
- 이전 대사: {대사 히스토리}

[현재 상황]
- 대화 주제: {주제}
- 장소: {location_name}
- 시간: {time}

[받은 메시지]
A: "그런데 민수 님은 뭐 하시는 편이세요?"

[응답 생성]
자연스러운 대사로 응답하세요. JSON 형식:
{
  "message": "응답 대사",
  "emotion": "happy|sad|neutral...",
  "continue_conversation": true
}
```

**B가 생성한 응답:**
```json
{
  "message": "저는 시나리오 쓰는 일을 해요. 재밌죠?",
  "emotion": "cheerful",
  "continue_conversation": true
}
```

**B의 API 호출:**
```json
POST /conversation/message
{
  "talk_id": "talk_xyz789",
  "message": "저는 시나리오 쓰는 일을 해요. 재밌죠?",
  "emotion": "cheerful"
}
```

---

## 4. 대화 종료 (End Conversation)

### 어느 쪽이든 종료 가능

**Request:**
```json
POST /conversation/end
{
  "talk_id": "talk_xyz789"
}
```

**Response:**
```json
{
  "success": true,
  "ended_at": "2026-02-15T09:40:00Z"
}
```

### Socket.io 이벤트
```json
{
  "event": "conversation_ended",
  "talk_id": "talk_xyz789",
  "ended_by": "char_abc123"
}
```

---

## 5. 선택지 기반 대화 (사용자 전용)

### 사용자가 캐릭터를 탭 → 대화 시작

**웹 UI에서 선택지 제시:**

```
[캐릭터 일러스트]

유리: "안녕하세요! 오늘 날씨가 참 좋네요. 뭘 도와드릴까요?"

┌─── 선택지 ─────────────────────────────┐
│ [1] 네는 뭐 하는 사람이야?            │
│ [2] 이 도시가 어때요?                  │
│ [3] 함께 밥 먹을래요?                  │
│ [4] 텍스트 입력: ........................ ] │
└────────────────────────────────────────┘
```

### 사용자가 선택 → LLM 응답 생성

**서버에서 LLM 프롬프트:**
```
[사용자 선택]: "네는 뭐 하는 사람이야?"

... [캐릭터 페르소나 정보] ...

[응답 생성]
선택지에 대한 자연스러운 응답을 생성하세요.
```

**LLM 응답:**
```json
{
  "message": "저는 도시의 도서관에서 일해요. 책 정리하는 걸 좋아해요!",
  "emotion": "happy",
  "follow_up_choices": [
    "도서관에서 가장 좋아하는 책이 뭐야?",
    "함께 밥 먹을래요?",
    "도서관 가서 보여줘 볼래?"
  ]
}
```

---

## 6. 대사 생성 LLM 시스템 프롬프트 (공통)

### 대사 생성시 사용하는 시스템 프롬프트
```json
{
  "system": "당신은 {이름}이라는 캐릭터입니다. 페르소나와 상황을 고려하여 자연스러운 대사를 생성하세요.",
  "persona": {
    "name": "유리",
    "age": 24,
    "gender": "female",
    "personality": "조용하지만 생각이 깊음, 책 읽기 좋아, 가끔 유머러스",
    "interests": ["독서", "음악", "커피", "도시 탐험"],
    "speaking_style": "정중함, 부드러운 요조"
  },
  "context": {
    "time": "2026-02-15T09:30:00Z",
    "location": "city_park",
    "weather": "sunny",
    "conversation_history": [
      {"from": "char_abc123", "text": "안녕하세요! 오늘 날씨가 참 좋네요."},
      {"from": "char_def456", "text": "맞아요! 산책하러 나오길 잘했네요."}
    ],
    "relationship": {
      "friendship_level": 72,
      "friendship_description": "호감"
    }
  },
  "input_message": "그런데 민수 님은 뭐 하시는 편이세요?",
  "output_format": {
    "type": "json",
    "fields": ["message", "emotion", "follow_up_choices"]
  }
}
```

---

## 7. 호감도 반영

### 대화 후 호감도 업데이트

```json
POST /character/affinity
{
  "target_character_id": "char_def456",
  "change": 5,
  "reason": "좋은 대화였음"
}
```

---

*마지막 업데이트: 2026-02-15*