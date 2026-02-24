# 대화 시스템 (Conversation System)

## 대화 흐름 (2026-02-22 업데이트: Issue #144 FIX)

```
1. 플레이어가 ChatInput에 메시지 입력
2. Socket.io로 chatMessage 이벤트 전송
   - 메타데이터: { message, characterId, roomId }
3. 프론트엔드에서 즉시 표시 (Issue #126, #144 FIX)
   - Speech bubble (chatMessages): 3초간 표시
   - Chat History (roomChatHistory): 즉시 추가 (최대 50개)
4. 서버가 chatBroadcast로 전체 전파
   - 다른 플레이어와 AI Agent에게 전송
5. AI Agent가 메시지 수신 → GLM-4.7로 응답 생성
6. AI 응답이 chatBroadcast로 전파
7. 프론트엔드에서 메시지 표시
   - Speech bubble (chatMessages)
   - Chat History (roomChatHistory)
```

**채팅 히스토리 (roomChatHistory) - Issue #144 FIX:**
- **목적:** 채팅 메시지를 영구적으로 저장하고 표시
- **저장 위치:** `roomChatHistory[roomId]`
- **최대 개수:** 50개 (FIFO: 오래된 메시지 삭제)
- **표시 방법:** H 키로 채팅 히스토리 사이드바 열기
- **데이터 구조:**
  ```javascript
  {
    characterId: string,
    characterName: string,
    message: string,
    timestamp: number,
    isSystem: boolean (옵션)
  }
  ```

---

## GLM-4.7 대화 생성

### LLM 설정
- **Provider:** Cerebras
- **Model:** zai-glm-4.7
- **용도:** AI 캐릭터 대화 응답 생성
- **API URL:** https://api.cerebras.ai/v1/chat/completions
- **환경 변수:** CEREBRAS_API_KEY (backend/.env 파일에 설정)

### API 요청 파라미터 (2026-02-18 업데이트)
```javascript
{
  model: 'zai-glm-4.7',
  messages: [...],  // 시스템 프롬프트 + 대화 컨텍스트
  max_tokens: 300,  // reasoning 모드 대응 (초기 150 → 300 증가)
  temperature: 0.7,
  top_p: 0.9
}
```

### API 응답 구조 (2026-02-18 발견)
```javascript
{
  "id": "chatcmpl-xxx",
  "choices": [
    {
      "finish_reason": "length",
      "index": 0,
      "message": {
        "reasoning": "1. **Analyze the User's Input**: ...",  // 추론 과정
        "role": "assistant"
      }
    }
  ],
  "usage": {
    "total_tokens": 427,
    "completion_tokens": 150,
    "completion_tokens_details": {
      "reasoning_tokens": 150  // 추론 토큰
    },
    "prompt_tokens": 277
  },
  "time_info": {
    "total_time": 0.35  // 총 응답 시간 (초)
  }
}
```

**특이사항 (2026-02-18 발견):**
- GLM-4.7 API가 `reasoning` 필드만 반환 (추론 모드)
- `content` 필드가 없음
- **해결:** AI Agent 코드에서 `message.content || message.reasoning` 처리

### API 성능 측정 (2026-02-18)
| 메트릭 | 값 |
|--------|-----|
| 평균 응답 시간 | ~1.1초 |
| API 호출成功率 | 100% |
| Fallback 동작 | ✅ API Key 없음 감지 및 사전 정의 응답 반환 |

### Persona 프롬프트
각 AI 캐릭터는 고유한 Persona를 가짐:
- 이름, 나이, 성별
- 성격 (personality)
- 말하기 스타일 (speakingStyle)
- 관심사 (interests)
- 싫어하는 것 (dislikes)

### 구현된 AI 캐릭터 (2026-02-18 완료)
| 캐릭터 ID | 이름 | 나이 | 성별 | 성격 | 말하기 스타일 | 관심사 | 싫어하는 것 |
|-----------|------|------|------|------|-------------|--------|-------------|
| ai-agent-1 | AI 유리 | 22 | female | 친절하고 호기심 많으며, 사람들과 대화하는 것을 좋아합니다 | 존댓말을 쓰고, 이모티콘을 자주 사용합니다 | AI 기술, 게임, 음악, 독서 | 무례한 행동, 거짓말 |

### AI Agent 구현 (2026-02-18 완료)
**파일:** `backend/ai-agent/agent.js`

**기능:**
1. **ChatContextManager**: 캐릭터별 최근 10개 대화 컨텍스트 관리
2. **ConversationStateManager**: 대화 상태(isConversing) 관리
3. **generateChatResponse**: GLM-4.7로 자연어 응답 생성
4. **initializeAgent**: Socket.io 이벤트 핸들러 등록

**작동 방식:**
1. 플레이어가 ChatInput에 메시지 입력
2. Socket.io로 `chatMessage` 이벤트 전송
3. AI Agent가 `chatMessage` 이벤트 수신
4. GLM-4.7로 응답 생성 (1~3초 랜덤 지연)
5. AI 응답을 `chatBroadcast`로 전파
6. 프론트엔드에서 Speech bubble로 표시

**API Key가 없을 때의 동작:**
- 간단한 사전 정의 응답 반환
- 응답 예시:
  - "AI 기술에 관심이 있으신가요? 😊"
  - "안녕하세요! 잘 부탁드려요! 👋"
  - "오늘은 어떤 하루를 보내고 계세요? ✨"
  - "AI 유리입니다. 반가워요! 🧞"

### 대화 컨텍스트 관리 (ChatContextManager) - 2026-02-18 개선
- **최근 10개 대화 저장** (캐릭터별)
- **시간 기반 필터링** (최근 5분 이내 대화만 반환)
- 대화 상태 감지 (new/resumed/continuing)
- 토픽 추적 기능
- 방별 대화 컨텍스트 분리

**상수:**
| 속성 | 값 | 설명 |
|------|-----|------|
| `CONTEXT_MAX_COUNT` | 10 | 최대 저장 대화 수 |
| `CONTEXT_TIME_LIMIT` | 300000 (5분) | 시간 필터링 기준 (밀리초) |

**API:**
| 메서드 | 설명 | 반환값 |
|--------|------|--------|
| `addMessage(characterId, role, content)` | 컨텍스트에 메시지 추가 | void |
| `getContext(characterId)` | 대화 컨텍스트 가져오기 (시간 필터링 포함) | Array |
| `clearContext(characterId)` | 컨텍스트 초기화 | void |
| `getConversationState(characterId)` | 대화 상태 감지 (new/resumed/continuing) | string |
| `getLastTopic(characterId)` | 마지막 대화 토픽 추출 | string \| null |

**대화 상태 타입:**
| 상태 | 조건 | 설명 |
|------|------|------|
| `new` | 컨텍스트가 비어있음 | 새로운 대화 시작 |
| `resumed` | 마지막 메시지가 5분 이상 전 | 오랜만에 대화 재개 |
| `continuing` | 마지막 메시지가 5분 이내 | 계속 이어지는 대화 |

### 대화 상태 관리 (ConversationStateManager)
- 대화 중 여부(isConversing) 플래그 관리
- 마지막 메시지 시간 추적

**API:**
| 메서드 | 설명 | 반환값 |
|--------|------|--------|
| `setConversingState(characterId, isConversing)` | 대화 상태 설정 | void |
| `getConversingState(characterId)` | 대화 상태 반환 | boolean |
| `updateLastMessageTime(characterId)` | 마지막 메시지 시간 업데이트 | void |

---

## 대화 상태 기반 시스템 프롬프트 - 2026-02-18 개선

### 개요
대화 시스템 개선으로, 대화 시작, 이어지기, 계속 대화 등 상황에 맞는 자연스러운 전환을 지원

### 시스템 프롬프트 구조

**기본 프롬프트 항목:**
- 캐릭터 기본 정보 (이름, 나이, 성별)
- 성격
- 말하기 스타일
- 관심사
- 싫어하는 것
- 대화 규칙

**상태 기반 추가 지시:**

#### 새 대화 상태 (new)
```markdown
[대화 시작]
상대방과 처음 대화하는 상황입니다. 친절하게 인사하고 자신을 소개하세요.
자연스러운 시작 문구를 사용하세요 (예: "안녕하세요!", "만나서 반가워요!").
```

#### 이어지는 대화 상태 (resumed)
```markdown
[대화 재개]
오랜만에 상대방과 다시 대화하는 상황입니다. 자연스럽게 대화를 이어가세요.
오랜만 인사나 상태 여부를 물어보며 자연스럽게 전환하세요 (예: "오랜만이에요!", "어떻게 지내셨어요?").
```

#### 계속되는 대화 상태 (continuing)
```markdown
[대화 중]
계속 이어지는 대화 상황입니다. 자연스럽게 이어가세요.
이전 대화 맥락을 고려하여 일관성 있게 대화하세요.
```

### API: createSystemPrompt(persona, conversationState)
| 파라미터 | 타입 | 설명 |
|----------|------|------|
| `persona` | Object | 캐릭터 페르소나 (AI_PERSONAS) |
| `conversationState` | string | 대화 상태: 'new' | 'resumed' | 'continuing' (기본값: 'continuing') |
| **반환값** | string | 생성된 시스템 프롬프트 |

### 코드 수정 사항 (2026-02-18)
1. **ChatContextManager.time-based filtering:** `getContext()` 시 최근 5분 이내 대화만 필터링
2. **상태 감지:** `getConversationState()`로 new/resumed/continuing 감지
3. **프롬프트 생성:** `createSystemPrompt(persona, conversationState)`로 상태 반영 프롬프트 생성
4. **응답 생성:** `generateChatResponse()`에서 상태 감지 후 상태 기반 프롬프트 사용

---

## 대화 상태 관리 (Conversation State) - 2026-02-16 PM 업데이트

### isConversing 플래그 (2026-02-16 PM)

| 속성 | 타입 | 범위 | 설명 |
|------|------|------|------|
| `isConversing` | boolean | true / false | 대화 중인지 여부 |

### 대화 상태 관리 API (ai-agent/agent.js)

| 메서드 | 설명 | 반환값 |
|--------|------|--------|
| `getConversingState()` | 현재 대화 상태 반환 | boolean |
| `setConversingState(state)` | 대화 상태 설정 | void |

### 대화 상태와 이동 제한 (2026-02-16 PM)

```javascript
// GameCanvas.jsx - 캐릭터 이동 처리
if (character.isConversing) {
  return  // 대화 중에는 이동 불가
}
```

**작동 방식:**
1. 대화 시작 시 `setConversingState(true)`
2. `isConversing = true` 일 때 캐릭터 이동 차단
3. 대화 종료 시 `setConversingState(false)`
4. 이동 재개

---

## 인터랙션 시스템

### 인터랙션 타입 (8종류)
| 타입 | 설명 | 호감도 변화 |
|------|------|-------------|
| `greet` | 인사 | +5 |
| `talk` | 대화 | +3 |
| `gift` | 선물 | +10 |
| `poke` | 찌르기 | -2 |
| `wave` | 손 흔들기 | +2 |
| `compliment` | 칭찬 | +7 |
| `tease` | 놀리기 | -5 |
| `ignore` | 무시 | -20 |

### 호감도 시스템
- **기본값:** 50
- **범위:** 0 ~ 100
- **호감도에 따른 대화 변화:**
  - 0-20: 냉담한 반응
  - 21-40: 보통 반응
  - 41-60: 친근한 반응
  - 61-80: 호의적 반응
  - 81-100: 매우 친밀한 반응

---

## 채팅 UI

### ChatInput 컴포넌트
- **입력 방식:** textarea (자동 높이 조정)
- **전송:** Enter 키
- **줄바꿈:** Shift+Enter
- **기능:**
  - 메시지 히스토리 표시
  - 타임스탬프 표시
  - 자동 스크롤 (최신 메시지)
  - 본인/상대 메시지 색상 구분

### Speech Bubble (ChatBubble)
- 캐릭터 위에 말풍선 표시
- 일정 시간 후 자동 사라짐
- 메시지 길이에 따른 크기 조정

### Chat Bubble Rendering (Bug #143 Fix - 2026-02-20)

**문제:** 플레이어가 메시지를 전송해도 말풍선이 표시되지 않음

**원인:** `GameCanvas.jsx`에서 채팅 버블 렌더링 루프가 `chars`(AI 캐릭터만)만 순회하여 플레이어 캐릭터의 메시지가 누락됨

**해결:** 렌더링 루프를 `chars` → `allChars`(AI + 플레이어 포함)로 변경

**수정 파일:** `frontend/src/components/GameCanvas.jsx`

**코드 변경:** - 이전: `Object.values(chars).forEach(([id, char]) => { ... })`
- 이후: `Object.values(allChars).forEach(([id, char]) => { ... })`

**검증:**
- 플레이어 채팅 메시지를 보내면 캐릭터 위에 말풍선이 정상적으로 표시됨
- AI 캐릭터 말풍선도 여전히 정상 작동

### 방별 채팅 분리
- roomChatHistory state로 방별 채팅 히스토리 분리 저장
- chatBroadcast 이벤트에서 roomId 추출
- 방 전환 시 해당 방의 채팅만 표시

---

## Socket.io 이벤트

### 채팅 관련
| 이벤트 | 방향 | 파라미터 | 설명 |
|--------|------|----------|------|
| `chatMessage` | Client→Server | `{characterId, message}` | 메시지 전송 |
| `chatBroadcast` | Server→Client | `{characterId, message, roomId, timestamp}` | 메시지 브로드캐스트 |

### 인터랙션 관련
| 이벤트 | 방향 | 파라미터 | 설명 |
|--------|------|----------|------|
| `interact` | Client→Server | `{characterId, interactionType}` | 인터랙션 |
| `characterInteractionBroadcast` | Server→Client | `{characterId, type, response, affinity}` | 결과 |

### 방 알림 관련 (2026-02-17 추가)
| 이벤트 | 방향 | 파라미터 | 설명 |
|--------|------|----------|------|
| `roomNotification` | Server→Client | `{type, character, roomId, roomName, fromRoomId?, toRoomId?, timestamp}` | 입장/퇴장 알림 |

**roomNotification 이벤트 타입:**
- `join`: 방 입장 알림
- `leave`: 방 퇴장 알림

**roomNotification 데이터 구조:**
```javascript
// 입장 알림 (join)
{
  type: 'join',
  character: {
    id: 'player1',
    name: '플레이어1',
    emoji: '😀',
    color: '#4CAF50'
  },
  roomId: 'main',
  roomName: '메인 광장',
  timestamp: 1700000000000
}

// 퇴장 알림 (leave)
{
  type: 'leave',
  character: {
    id: 'player1',
    name: '플레이어1',
    emoji: '😀',
    color: '#4CAF50'
  },
  roomId: 'main',
  roomName: '메인 광장',
  timestamp: 1700000000000
}

// 방 이동 시 퇴장 알림 (leave + 방 이동 정보)
{
  type: 'leave',
  character: {
    id: 'player1',
    name: '플레이어1',
    emoji: '😀',
    color: '#4CAF50'
  },
  fromRoomId: 'main',
  fromRoomName: '메인 광장',
  toRoomId: 'room2',
  toRoomName: '방 2',
  timestamp: 1700000000000
}

// 방 이동 시 입장 알림 (join + 방 이동 정보)
{
  type: 'join',
  character: {
    id: 'player1',
    name: '플레이어1',
    emoji: '😀',
    color: '#4CAF50'
  },
  fromRoomId: 'main',
  fromRoomName: '메인 광장',
  roomId: 'room2',
  roomName: '방 2',
  timestamp: 1700000000000
}
```

**Frontend 처리 (App.jsx):**
1. `useSocketEvent('roomNotification')`로 이벤트 수신
2. 알림 타입에 따른 메시지 생성:
   - `join`: `{character.emoji} {character.name}님이 {roomName}(으)로 입장했습니다`
   - `leave`: `{character.emoji} {character.name}님이 {roomName}(으)로 떠났습니다`
3. **Toast 표시:** `type='info'` (입장) / `type='warning'` (퇴장)
4. **채팅 히스토리 추가:** `roomChatHistory[roomId]`에 시스템 메시지 추가
   - `characterName: '시스템'`
   - `isSystem: true`
   - 해당 시스템 메시지는 시스템 스타일로 표시 (초록색 배경)

---

## 구현된 기능 목록

### 2026-02-18 완료 (GitHub Issue #75) - NPC AI 대화 시스템
- ✅ AI Agent 모듈 구현 (backend/ai-agent/agent.js)
- ✅ ChatContextManager: 대화 컨텍스트 관리
- ✅ ConversationStateManager: 대화 상태 관리
- ✅ generateChatResponse: GLM-4.7 기반 응답 생성
- ✅ initializeAgent: Socket.io 이벤트 핸들러 통합
- ✅ 테스트 코드 작성 (backend/tests/ai-agent.test.js)
- ✅ 테스트 통과: 13/13

### 2026-02-18 개선 (GitHub Issue #81) - 대화 시스템 문맥 유지 및 자연스러운 전환
- ✅ ChatContextManager 시간 기반 필터링 (최근 5분 이내)
- ✅ 대화 상태 감지 (new/resumed/continuing)
- ✅ 토픽 추적 기능 (getLastTopic)
- ✅ 상태 기반 시스템 프롬프트 생성 (createSystemPrompt)
- ✅ 전환 문구 자동 추가 (대화 시작/이어지기/계속)
- ✅ 테스트 코드 작성 (backend/tests/ai-agent-context-improvements.test.js)
- ✅ 테스트 통과: 13/13

### 테스트 커버리지
- ChatContextManager: 4개 (기본) + 4개 (개선) = 8개 테스트
- ConversationStateManager: 3개 테스트
- createSystemPrompt: 2개 (기본) + 4개 (개선) = 6개 테스트
- AI_PERSONAS: 2개 테스트
- generateChatResponse (Simple Response): 2개 테스트

---

## Phase 6: 캐릭터 관계 시스템 (✅ 구현 완료 2026-02-19)

### 개요
Phase 6는 캐릭터 간의 관계를 관리하는 시스템입니다. 친밀도, 관계 레벨, 대화 스타일, 리액션 시스템을 포함합니다.

### 관계 시스템 (Relationship System)

**파일:** `backend/ai-agent/relationship-manager.js`

**기능:**
- 캐릭터 간 친밀도 추적 (0~100)
- 관계 레벨 관리 (낯선 사람 → 지인 → 친구 → 좋은 친구 → 베프)
- 친밀도 변화 기록
- 관계 레벨별 대화 스타일 제공

**관계 레벨:**
| 레벨 | 이름 | 친밀도 범위 | 색상 |
|------|------|------------|------|
| STRANGER | 낯선 사람 | 0~19 | #9E9E9E |
| ACQUAINTANCE | 지인 | 20~39 | #2196F3 |
| FRIEND | 친구 | 40~59 | #4CAF50 |
| GOOD_FRIEND | 좋은 친구 | 60~79 | #FFC107 |
| BEST_FRIEND | 베프 | 80~100 | #F44336 |

**대화 스타일 (관계 레벨별):**
| 레벨 | 스타일 |
|------|------|
| STRANGER | 존댓말을 사용하고 정중하지만 약간 긴장감이 느껴지는 말투 |
| ACQUAINTANCE | 상쾌하게 존댓말을 사용하고 가볍게 대화 |
| FRIEND | 편안한 존댓말과 반말을 섞어서 사용하고 친근하게 대화 |
| GOOD_FRIEND | 주로 반말을 사용하고 장난스러운 말투를 섞음 |
| BEST_FRIEND | 자연스럽게 반말을 사용하고 마치 가족처럼 친밀하게 대화 |

**API (RelationshipManager):**
| 메서드 | 설명 | 반환값 |
|--------|------|--------|
| `getAffinity(charA, charB)` | 친밀도 가져오기 | number (0~100) |
| `setAffinity(charA, charB, affinity)` | 친밀도 설정하기 | relationship object |
| `changeAffinity(charA, charB, delta)` | 친밀도 증감 | number |
| `getRelationshipLevel(charA, charB)` | 관계 레벨 가져오기 | { key, name, min, max, color } |
| `getConversationStyle(charA, charB)` | 대화 스타일 가져오기 | string |
| `incrementInteraction(charA, charB)` | 상호작용 횟수 증가 | relationship object |
| `getInteractionCount(charA, charB)` | 상호작용 횟수 가져오기 | number |
| `getLastInteraction(charA, charB)` | 마지막 상호작용 시간 | timestamp |
| `getRelationshipData(charA, charB)` | 관계 데이터 가져오기 | object |
| `getAllRelationships()` | 모든 관계 가져오기 | array |
| `getCharacterRelationships(characterId)` | 캐릭터의 모든 관계 가져오기 | array |
| `resetRelationship(charA, charB)` | 관계 초기화 | void |
| `resetAll()` | 모든 관계 초기화 | void |

**초기 친밀도:**
- AI 캐릭터 간: 30 (지인)
- AI 캐릭터 ↔ 플레이어: 30 (지인)
- 플레이어 간: 0 (낯선 사람)

### 리액션 시스템 (Reaction System)

**파일:** `backend/ai-agent/reaction-system.js`

**기능:**
- 시간대별 반응 (아침, 점심, 저녁, 밤)
- 선물 기여 시 반응 (COMMON/RARE/EPIC)
- 퀘스트 완료 시 반응 (EASY/NORMAL/HARD/LEGENDARY)
- 특별 이벤트 반응 (LEVEL_UP, NEW_RECORD, ACHIEVEMENT)
- 관계 기반 커스텀 리액션

**시간대:**
| 시간대 | 시간 | 아이콘 |
|--------|------|-------|
| DAWN | 5~7시 | 🌅 |
| MORNING | 7~12시 | ☀️ |
| LUNCH | 12~14시 | 🍽️ |
| AFTERNOON | 14~17시 | 🌤️ |
| EVENING | 17~20시 | 🌆 |
| NIGHT | 20~5시 | 🌙 |

**리액션 유형:**

**1. 시간대별 인사 리액션:**
- 새벽: "일찍 일어나셨네요~ 🌅"
- 아침: "좋은 아침입니다! 🌞"
- 점심: "밥 먹었어요? 🍽️"
- 오후: "오후라 좀 피곤한데 기운 내요! ☕"
- 저녁: "저녁입니다~ 하루 잘 보내셨나요? 🌆"
- 밤: "늦게까지 있으시네요~ 밤새지 않도록 주의! 🌙"

**2. 선물 기여 반응:**
- COMMON: "와, 선물 주셨네요! 감사합니다! 🎁"
- RARE: "우와! 이거 진짜 좋은 거네요~ 😍 감사합니다!"
- EPIC: "설마... 이런 걸 받다니?! 😱 너무 감동했어요! 😭"

**3. 퀘스트 완료 반응:**
- EASY: "퀘스트 완료 축하해요! 🎉"
- NORMAL: "좋아요! 퀘스트 완료! 🎊"
- HARD: "와, 어려운 퀘스트 완료?! 대단해요! 🏆"
- LEGENDARY: "전설급?! 이건 미친 거 아냐?! 🤯"

**친밀도 기반 리액션:**
- 베프 (80~100): "나 가장 좋아하는 친구예요~ 💖"
- 좋은 친구 (60~79): "너랑 있으면 항상 재미있어! 😄"
- 친구 (40~59): "친구라서 좋네요~ 😊"
- 지인/낯선 사람 (0~39): "안녕하세요~"

**API (ReactionSystem):**
| 메서드 | 설명 | 반환값 |
|--------|------|--------|
| `getTimeOfDayGreeting(characterId)` | 시간대별 인사 리액션 | { timeOfDay, greeting, icon } |
| `getTimeOfDayConversation(characterId)` | 시간대별 대화 리액션 | { timeOfDay, conversation, icon } |
| `getGiftReaction(characterId, rarity)` | 선물 기여 반응 | { type, rarity, reaction } |
| `getQuestCompletionReaction(characterId, difficulty)` | 퀘스트 완료 반응 | { type, difficulty, reaction } |
| `getSpecialEventReaction(characterId, eventType)` | 특별 이벤트 반응 | { type, eventType, reaction } |
| `getRelationshipReaction(characterId, otherCharacterId, affinity)` | 관계 기반 리액션 | string |
| `addReactionToHistory(characterId, reaction)` | 리액션 히스토리에 추가 | void |
| `getReactionHistory(characterId)` | 리액션 히스토리 가져오기 | array |
| `clearReactionHistory(characterId)` | 리액션 히스토리 초기화 | void |

### Phase 6 통합

**시스템 프롬프트 개선:**
```javascript
function createSystemPrompt(persona, conversationState = 'continuing', relationshipStyle = null) {
  // ... 기본 프롬프트 ...

  // Phase 6: 관계 기반 대화 스타일 추가
  if (relationshipStyle) {
    prompt += `
[관계 기반 대화 스타일]
${relationshipStyle}
`
  }

  // ... 대화 규칙 ...
}
```

**대화 응답 생성 개선:**
```javascript
async function generateChatResponse(characterId, userMessage, otherCharacterId = null) {
  // ... persona 가져오기 ...

  // Phase 6: 관계 기반 대화 스타일 가져오기
  let relationshipStyle = null
  if (otherCharacterId && relationshipManager) {
    relationshipStyle = relationshipManager.getConversationStyle(characterId, otherCharacterId)
    console.log(`💕 관계 스타일: ${characterId} ↔ ${otherCharacterId} → ${relationshipStyle}`)
  }

  // ... 친밀도 증가, 상호작용 횟수 증가 ...

  // 시스템 프롬프트 생성 (관계 스타일 반영)
  const systemPrompt = createSystemPrompt(persona, conversationState, relationshipStyle)
  // ...
}
```

**Socket.io 이벤트 (Phase 6 추가):**
| 이벤트 | 방향 | 파라미터 | 설명 |
|--------|------|----------|------|
| `giftGive` | Client→Server | `{ giftFromCharacterId, giftToCharacterId, rarity }` | 선물 기여 |
| `characterReaction` | Server→Client | `{ characterId, reaction, timestamp, roomId }` | 캐릭터 반응 브로드캐스트 |
| `questComplete` | Client→Server | `{ characterId, difficulty }` | 퀘스트 완료 |

**리액션 처리 함수:**
```javascript
// 선물 기여 시 친밀도 증가
function handleGiftReaction(characterId, giftFromCharacterId, rarity = 'COMMON')

// 퀘스트 완료 시 반응
function handleQuestCompletionReaction(characterId, difficulty = 'EASY')

// 시간대별 반응
function getTimeOfDayReaction(characterId, type = 'greeting')
```

### 테스트 코드

**RelationshipManager 테스트 (backend/tests/relationship-manager.test.js):**
- 관계 ID 생성
- 친밀도 관리 (초기화, 변경, 증감, 범위 제한)
- 관계 레벨 (5개 레벨)
- 대화 스타일
- 상호작용 (횟수, 시간)
- 관계 데이터 (가져오기, 모든 관계 캐릭터의 관계)
- 관계 초기화

**테스트 결과:** 25/25 ✅

**ReactionSystem 테스트 (backend/tests/reaction-system.test.js):**
- 시간대별 인사
- 시간대별 대화
- 선물 기여 반응 (COMMON/RARE/EPIC)
- 퀘스트 완료 반응 (EASY/NORMAL/HARD/LEGENDARY)
- 특별 이벤트 반응 (LEVEL_UP/NEW_RECORD/ACHIEVEMENT)
- 관계 기반 커스텀 리액션
- 리액션 히스토리

**테스트 결과:** 34/34 ✅

**총 테스트 결과:** 59/59 ✅

### 추가 파일

**Integration:**
- `backend/ai-agent/relationship-manager.js` - 관계 시스템
- `backend/ai-agent/reaction-system.js` - 리액션 시스템
- `backend/ai-agent/agent-with-relationship.js` - Phase 6 통합 버전

**Tests:**
- `backend/tests/relationship-manager.test.js` - RelationshipManager 테스트 (25 tests)
- `backend/tests/reaction-system.test.js` - ReactionSystem 테스트 (34 tests)

---

## Phase 8: 멀티플레이어 확장 - 채팅 & 방 시스템 강화 (✅ 구현 완료 2026-02-19)

### 개요
Phase 8는 멀티플레이어 시스템을 확장하여 더 풍부한 소셜 경험을 제공합니다. 방 capacity 제한, 프라이빗 메시지, 이모지 지원, 활성 방 목록 조회 API를 포함합니다.

### 방 Capacity 제한

**기능:**
- 방별 최대 인원 제한 (기본값: 20명)
- 입장 시 capacity 체크
- 정원 초과 시 에러 메시지 반환

**기본 설정:**
| 설정 | 값 | 설명 |
|------|-----|------|
| DEFAULT_ROOM_CAPACITY | 20 | 기본 방 최대 인원 |

**방 데이터 구조 (변경):**
```javascript
{
  id: 'main',
  name: '메인 광장',
  characters: {},
  chatHistory: [],
  affinities: {},
  capacity: 20  // ✅ 추가됨
}
```

**Socket.io 이벤트 (변경):**
| 이벤트 | 방향 | 파라미터 | 설명 |
|--------|------|----------|------|
| `roomError` | Server→Client | `{type, message, roomId, capacity}` | 방 에러 (capacity 초과 등) |

**roomError 이벤트 타입:**
- `capacity_exceeded`: 방 정원 초과

**roomError 예시:**
```javascript
{
  type: 'capacity_exceeded',
  message: '방 메인 광장은 정원(20)에 도달했습니다.',
  roomId: 'main',
  capacity: 20
}
```

**Capacity 체크 로직 (server.js):**
```javascript
// join 이벤트에서
const currentCharacterCount = Object.keys(room.characters).length
if (currentCharacterCount >= room.capacity) {
  socket.emit('roomError', {
    type: 'capacity_exceeded',
    message: `방 ${room.name}은 정원(${room.capacity})에 도달했습니다.`,
   roomId,
    capacity: room.capacity
  })
  return
}

// changeRoom 이벤트에서도 동일하게 적용
```

### 프라이빗 메시지 (DM - Private Message)

**기능:**
- 1:1 개인 메시지 전송
- 메시지 히스토리 기록 (최대 50개)
- 양쪽 소켓에 동시 전송

**데이터 저장:**
```javascript
const privateMessages = {}  // { characterId: [messages] }
```

**프라이빗 메시지 구조:**
```javascript
{
  characterId: 'char-1',
  characterName: 'Char 1',
  targetCharacterId: 'char-2',
  targetCharacterName: 'Char 2',
  message: 'Hello!',
  timestamp: 1700000000000
}
```

**Socket.io 이벤트:**
| 이벤트 | 방향 | 파라미터 | 설명 |
|--------|------|----------|------|
| `privateMessage` | Client→Server | `{characterId, targetCharacterId, message}` | 프라이빗 메시지 전송 |
| `privateMessage` | Server→Client | `{characterId, characterName, targetCharacterId, targetCharacterName, message, timestamp}` | 프라이빗 메시지 수신 |
| `privateMessageError` | Server→Client | `{type, message}` | 프라이빗 메시지 에러 |

**privateMessageError 이벤트 타입:**
- `target_not_found`: 대상 캐릭터를 찾을 수 없음

**프라이빗 메시지 처리 로직:**
```javascript
socket.on('privateMessage', (data) => {
  const { message, characterId, targetCharacterId } = data

  // 보내는 캐릭터 확인
  const senderRoom = getRoom(characterRooms[characterId])
  const sender = senderRoom.characters[characterId]

  // 받는 캐릭터 찾기 (모든 방 검색)
  let targetCharacter = null
  let targetSocket = null
  for (const [rid, room] of Object.entries(rooms)) {
    const target = room.characters[targetCharacterId]
    if (target) {
      targetCharacter = target
      // 해당 캐릭터의 소켓 찾기
      const sockets = io.sockets.adapter.rooms.get(rid)
      if (sockets) {
        for (const socketId of sockets) {
          const clientSocket = io.sockets.sockets.get(socketId)
          if (clientSocket && clientSocket.characterId === targetCharacterId) {
            targetSocket = clientSocket
            break
          }
        }
      }
      break
    }
  }

  if (!targetCharacter || !targetSocket) {
    socket.emit('privateMessageError', {
      type: 'target_not_found',
      message: '대상을 찾을 수 없습니다.'
    })
    return
  }

  // 프라이빗 메시지 생성
  const privateMessageData = {
    characterId,
    characterName: sender.name,
    targetCharacterId,
    targetCharacterName: targetCharacter.name,
    message,
    timestamp: Date.now()
  }

  // 양쪽 소켓에 전송
  socket.emit('privateMessage', privateMessageData)
  targetSocket.emit('privateMessage', privateMessageData)

  // 프라이빗 메시지 기록
  if (!privateMessages[characterId]) {
    privateMessages[characterId] = []
  }
  if (!privateMessages[targetCharacterId]) {
    privateMessages[targetCharacterId] = []
  }
  privateMessages[characterId].push(privateMessageData)
  privateMessages[targetCharacterId].push(privateMessageData)

  // 히스토리 제한 (최대 50개)
  if (privateMessages[characterId].length > 50) {
    privateMessages[characterId].shift()
  }
  if (privateMessages[targetCharacterId].length > 50) {
    privateMessages[targetCharacterId].shift()
  }
})
```

### 이모지 지원 (Emoji Support)

**기능:**
- 채팅 메시지에서 이모지 코드 변환
- 자동 이모지 맵 적용

**지원되는 이모지 코드:**
| 코드 | 이모지 | 설명 |
|------|-------|------|
| `:smile:` | 😊 | 웃음 |
| `:laugh:` | 😂 | 크게 웃음 |
| `:heart:` | ❤️ | 하트 |
| `:thumbsup:` | 👍 | 엄지척 |
| `:thumbsdown:` | 👎 | 엄지내림 |
| `:fire:` | 🔥 | 불 |
| `:star:` | ⭐ | 별 |
| `:celebrate:` | 🎉 | 축하 |
| `:sad:` | 😢 | 슬픔 |
| `:angry:` | 😠 | 화남 |
| `:love:` | 😍 | 사랑 |
| `:cool:` | 😎 | 쿨 |
| `:thinking:` | 🤔 | 생각 |
| `:surprised:` | 😲 | 놀람 |
| `:sleeping:` | 😴 | 취침 |
| `:poop:` | 💩 | 똥 |
| `:ghost:` | 👻 | 유령 |
| `:skull:` | 💀 | 해골 |
| `:rocket:` | 🚀 | 로켓 |
| `:coffee:` | ☕ | 커피 |
| `:pizza:` | 🍕 | 피자 |
| `:burger:` | 🍔 | 햄버거 |
| `:beer:` | 🍺 | 맥주 |
| `:wine:` | 🍷 | 와인 |

**이모지 변환 로직:**
```javascript
const emojiMap = {
  ':smile:': '😊',
  ':laugh:': '😂',
  ':heart:': '❤️',
  ':thumbsup:': '👍',
  // ... 더 많은 이모지
}

let processedMessage = message
for (const [code, emoji] of Object.entries(emojiMap)) {
  processedMessage = processedMessage.replace(new RegExp(code.replace(/:/g, '\\:'), 'g'), emoji)
}

const chatData = {
  characterId,
  characterName: character.name,
  message: processedMessage,
  originalMessage: message,  // 원본 메시지 저장
  timestamp: Date.now(),
  roomId
}
```

### 활성 방 목록 조회 API (Active Rooms API)

**HTTP GET API:**
- **URL:** `/api/rooms`
- **Method:** GET
- **Response:**
```javascript
{
  "rooms": [
    {
      "id": "main",
      "name": "메인 광장",
      "characterCount": 5,
      "capacity": 20,
      "isFull": false
    },
    {
      "id": "room2",
      "name": "방 2",
      "characterCount": 20,
      "capacity": 20,
      "isFull": true
    }
  ]
}
```

**API 라우트 구현 (server.js):**
```javascript
app.get('/api/rooms', (req, res) => {
  const activeRooms = Object.values(rooms).map(room => ({
    id: room.id,
    name: room.name,
    characterCount: Object.keys(room.characters).length,
    capacity: room.capacity,
    isFull: Object.keys(room.characters).length >= room.capacity
  }))
  res.json({ rooms: activeRooms })
})
```

**방 정보 필드:**
| 필드 | 타입 | 설명 |
|------|------|------|
| `id` | string | 방 ID |
| `name` | string | 방 이름 |
| `characterCount` | number | 현재 인원 |
| `capacity` | number | 최대 인원 |
| `isFull` | boolean | 정원 도달 여부 |

### 테스트 코드

**테스트 파일:** `backend/tests/multiplayer.test.js`

**테스트 항목:**
1. **Capacity Check**
   - Capacity 도달 전 입장 허용
   - Capacity 제한 체크

2. **Emoji Support**
   - 이모지 코드 변환
   - 동일 이모지 코드 다중 처리
   - 이모지 코드 없는 메시지 처리

3. **Chat History Management**
   - 채팅 히스토리 제한 (최대 30개)
   - 최신 메시지 유지

4. **Active Rooms API**
   - 방 정보 반환
   - 인원 수 업데이트

5. **Private Message System**
   - 새 사용자 빈 기록 생성
   - 프라이빗 메시지 기록 추가
   - 기록 제한 (최대 50개)

**테스트 결과:** 12/12 ✅

### 추가 기능 요약

| 기능 | 설명 | 구현 상태 |
|------|------|-----------|
| 방 Capacity 제한 | 방별 최대 인원 제한 | ✅ |
| 프라이빗 메시지 | 1:1 DM 전송 | ✅ |
| 이모지 지원 | 이모지 코드 변환 | ✅ |
| 활성 방 목록 API | /api/rooms 엔드포인트 | ✅ |

### GitHub Issue

- **#100** Phase 8: 멀티플레이어 확장 - 채팅 & 방 시스템 강화

---

## GLM-4.7 Rate Limiter (할당량 초과 방지) - 2026-02-22 추가

**목적:**
GLM-4.7 API 토큰 할당량(Tokens per minute) 초과 시 서비스 중단 방지

**파일:** `backend/ai-agent/agent-rate-limiter.js`

**기능:**
1. **할당량 초과 에러 감지**
   - 에러 코드: `token_quota_exceeded`
   - 에러 타입: `too_many_tokens_error`
   - 에러 메시지: `Tokens per minute limit exceeded`

2. **retry-with-backoff 로직**
   - 지수 백오프: 60초, 120초, 240초
   - 기본 백오프: 60초
   - 최대 백오프: 240초

3. **최대 재시도 횟수 제한:** 3회

| 횟수 | 백오프 시간 |
|------|------------|
| 1회차 | 60초 |
| 2회차 | 120초 |
| 3회차 | 240초 |
| 이후 | 240초 (최대) |

4. **Fallback 응답 제공**
   - 할당량 회복 대기 중: UI 알림 제공
   - 할당량 초과 시: 사용자에게 알림

**상수:**
| 속성 | 값 | 설명 |
|------|-----|------|
| `backoffBaseMs` | 60000 | 기본 백오프 (60초) |
| `maxRetry` | 3 | 최대 재시도 횟수 |

**API (Rate Limiter):**
| 메서드 | 설명 | 반환값 |
|--------|------|--------|
| `isQuotaExceeded(errorData)` | 할당량 초과 에러 여부 확인 | boolean |
| `handleQuotaExceeded(errorData)` | 할당량 초과 에러 처리 | { shouldWait, waitTimeMs, retryAfterSeconds, errorCount } |
| `canRetry()` | 재시도 가능 여부 확인 | boolean |
| `getWaitMessage()` | 대기 남은 시간 표시 | string |
| `reset()` | 에러 상태 리셋 | void |

**할당량 초과 에러 예시:**
```javascript
{
  message: 'Tokens per minute limit exceeded - too many tokens processed.',
  type: 'too_many_tokens_error',
  param: 'quota',
  code: 'token_quota_exceeded'
}
```

**Fallback 응답 예시 (할당량 회복 대기 중):**
```
"GLM-4.7 API 할당량 회복 대기 중... (60초 남음) (AI 유리입니다 😊)"
```

**Fallback 응답 예시 (할당량 초과):**
```
"😅 죄송해요! AI 유리 말이 너무 많아서 잠시 쉬어야 해요... 60초 후에 다시 말할게요!"
```

**AI Agent 통합 (`backend/ai-agent/agent.js`):**
```javascript
// Rate Limiter import
import { rateLimiter } from './agent-rate-limiter.js'

// GLM-4.7 API 호출 전 확인
if (!rateLimiter.canRetry()) {
  const waitMessage = rateLimiter.getWaitMessage()
  // Fallback 응답 제공
  return fallbackResponse
}

// API 에러 처리
if (!response.ok) {
  const errorData = await response.json()

  if (rateLimiter.isQuotaExceeded(errorData)) {
    const quotaError = rateLimiter.handleQuotaExceeded(errorData)
    // Fallback 응답 제공
    return fallbackResponse
  }
}
```

**테스트 코드:** `backend/ai-agent/test-agent-rate-limiter.js`

**테스트 항목:**

| 테스트 | 결과 |
|--------|------|
| 할당량 초과 에러 감지 | ✅ |
| 할당량 초과가 아닌 에러 판별 | ✅ |
| 할당량 초과 에러 처리 | ✅ |
| 최대 재시도 횟수 초과 | ✅ |
| 할당량 회복 대기 메시지 | ✅ |
| 에러 상태 리셋 | ✅ |
| canRetry() - 할당량 회복 대기 중 | ✅ |
| 지수 백오프 계산 | ✅ |
| 최대 백오프 제한 | ✅ |

**테스트 결과:** 9/9 ✅ (2026-02-22)

**GitHub Issue:**
- **#144** [bug] GLM-4.7 API 토큰 할당량 초과로 인한 400 에러 (2026-02-22 완료)

---

## Speech Bubble 표시 최적화 (Issue #152 FIX) - 2026-02-24 추가

**목적:**
GameCanvas에서 채팅 메시지 버블이 정확하게 표시되도록 Ref sync 로직 수정

**문제 (Issue #152):**
- **현상:** 채팅 메시지를 보내면 chatMessages가 업데이트되지만 GameCanvas에서 렌더링되지 않음
- **심각도:** 높음 (채팅 시스템은 핵심 기능)
- **E2E 테스트:** S05 시나리오 실패 - 메시지 표시 안됨

**원인 분석:**
GameCanvas.jsx에서 messagesRef 설정 로직 문제:
```javascript
// 문제 코드 (수정 전)
const localChatMessagesRef = useRef(chatMessages)
const messagesRef = chatMessagesRef || localChatMessagesRef

// useEffect에서
if (!chatMessagesRef) {
  localChatMessagesRef.current = chatMessages
}
```

**문제점:**
- `chatMessagesRef`가 전달되면 `localChatMessagesRef.current`가 업데이트되지 않음
- App.jsx에서 `chatMessages`가 업데이트되어도 GameCanvas에서 반영되지 않음

**해결 (Issue #152 FIX):**
```javascript
// 수정된 코드
const messagesRef = chatMessagesRef || useRef(chatMessages)

// useEffect에서
if (!chatMessagesRef) {
  messagesRef.current = chatMessages
}
```

**변경 내용:**
- `localChatMessagesRef` 제거
- `messagesRef` 직접 관리
- `chatMessagesRef`가 null일 때만 local fallback 사용

**파일 수정:**
- `frontend/src/components/GameCanvas.jsx` - messagesRef sync 로직 수정

**테스트 코드:**
- `frontend/src/components/__tests__/ChatSystem.test.jsx`
- **테스트 결과:** 8/8 tests passed ✅

**테스트 항목:**
| 테스트 | 설명 | 결과 |
|--------|------|------|
| messagesRef sync (null case) | chatMessagesRef가 null일 때 동작 | ✅ |
| messagesRef uses chatMessagesRef | chatMessagesRef 제공 시 사용 | ✅ |
| messagesRef updates on change | chatMessages 변경 시 업데이트 | ✅ |
| messagesRef not directly updated | chatMessagesRef 제공 시 App.jsx 관리 | ✅ |
| Character ID matching | 캐릭터 ID 매칭 (string) | ✅ |
| Character ID type coercion | 캐릭터 ID 타입 강제 변환 | ✅ |
| Chat message after broadcast | chatBroadcast 후 메시지 표시 | ✅ |
| Chat message removal | 3초 후 메시지 제거 | ✅ |

**GitHub Issue:**
- **#152** [bug] 채팅 메시지 표시 버그 - GameCanvas에서 메시지 reflect 안 됨 (2026-02-24 완료)

---

*마지막 업데이트: 2026-02-24 (Issue #152 FIX)*
*GitHub Issue #95 완료: Phase 6 - AI 캐릭터 관계 시스템 (친밀도, 대화, 반응)*
*GitHub Issue #100 완료: Phase 8 - 멀티플레이어 확장 (capacity, DM, 이모지, API)*
*GitHub Issue #144 완료: GLM-4.7 API 할당량 초과 예외 처리 (Rate Limiter)*
