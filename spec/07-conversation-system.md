# 대화 시스템 (Conversation System)

## 대화 흐름

```
1. 플레이어가 ChatInput에 메시지 입력
2. Socket.io로 chatMessage 이벤트 전송
3. 서버가 chatBroadcast로 전체 전파
4. AI Agent가 메시지 수신 → GLM-4.7로 응답 생성
5. 응답이 chatBroadcast로 전파
6. 프론트엔드에서 Speech bubble로 표시
```

---

## GLM-4.7 대화 생성

### LLM 설정
- **Provider:** Cerebras
- **Model:** zai-glm-4.7
- **용도:** AI 캐릭터 대화 응답 생성

### Persona 프롬프트
각 AI 캐릭터는 고유한 Persona를 가짐:
- 이름, 나이, 성별
- 성격 (personality)
- 말하기 스타일 (speakingStyle)
- 관심사 (interests)
- 싫어하는 것 (dislikes)

### 대화 컨텍스트 관리 (chat-context.js)
- **최근 10개 대화 저장** (캐릭터별)
- 시간 경과에 따른 컨텍스트 관리
- 방별 대화 컨텍스트 분리

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

*마지막 업데이트: 2026-02-17*
*GitHub Issue #56 완료: 멀티플레이어 방 입장/퇴장 알림 시스템*
