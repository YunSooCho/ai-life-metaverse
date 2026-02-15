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

*마지막 업데이트: 2026-02-15*