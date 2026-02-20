# Character System

## 캐릭터 구조

### 기본 속성

```javascript
{
  id: 'player | ai-id',
  name: '플레이어 이름',
  x: 125,        // X 좌표 (0 ~ 1000)
  y: 125,        // Y 좌표 (0 ~ 700)
  color: '#4CAF50',
  emoji: '👤',
  isAi: false    // AI 캐릭터 여부
}
```

### 커스터마이징 속성

```javascript
{
  hairStyle: 'short | medium | long',
  clothingColor: 'blue | red | green | yellow | purple',
  accessory: 'none | glasses | hat | flowers'
}
```

## 픽셀아트 캐릭터 (✅ 구현 완료)

### 사양

- **기본 사이즈**: 32x32 픽셀
- **렌더링 사이즈**: 40x40px (확대)
- **색상 팔레트**: 8비트 레트로 스타일
- **애니메이션 프레임**: 2~4 프레임 / 초

### 애니메이션 타입 (Issue #88: 완료 ✅ 2026-02-18)

| 타입 | 프레임 수 | 속도 | 루프 | 설명 | 상태 |
|------|----------|------|------|------|------|
| idle | 1 | 500ms | ✅ | 정지 상태 | ✅ 구현 완료 |
| walk | 4 | 200ms | ✅ | 이동 중 (보통 속도) | ✅ 구현 완료 |
| run | 4 | 120ms | ✅ | 이동 중 (빠른 속도) | ✅ 구현 완료 |
| jump | 4 | 150ms | ❌ | 점프 | ✅ 구현 완료 |
| sit | 4 | 300ms | ✅ | 앉기 | ✅ 구현 완료 |

### 감정 애니메이션 시스템 (Issue #88: 완료 ✅ 2026-02-18)

| 감정 | 프레임 | 속도 | 루프 | 설명 |
|------|---------|------|------|------|
| neutral | 2 | - | ✅ | 기본 상태 |
| joy (happy) | 2 | 250ms | ✅ | 기쁨: 눈/입 애니메이션 |
| sad | 2 | 300ms | ✅ | 슬픔: 아래쪽 입 모양 |
| angry | 2 | 200ms | ✅ | 화남: 눈썹/입 애니메이션 |
| surprised | 2 | 150ms | ❌ | 놀람: 눈/입 둥글게 (비루프) |

### FX 스프라이트 시스템 (Issue #93: 완료 ✅ 2026-02-18)

**FX 타입:**
- `jump`: 점프 궤적 효과 (파티클, 방향별 왼쪽/오른쪽)
- `heart`: 하트 효과 (상승, 페이드, 반짝이)
- `dead`: 데드 효과 (X 아이콘, 흔들림, 희미티)
- `loading`: 로딩 효과 (회전 인디케이터, 세그먼트)

**FX 구현:**
- `spriteRenderer.renderFX(ctx, fxType, x, y, size, progress, options)`
- 각 FX별 렌더링 메서드:
  - `renderJumpFX(ctx, x, y, size, progress, options)`
  - `renderHeartFX(ctx, x, y, size, progress, options)`
  - `renderDeadFX(ctx, x, y, size, progress, options)`
  - `renderLoadingFX(ctx, x, y, size, progress, options)`

**FX 옵션:**
- color: 커스텀 색상
- direction: 방향 (left/right)
- targetY: 하트 효과 목표 Y 좌표
- segments: 로딩 세그먼트 수 (기본 8)

**테스트 결과:** 20/20 통과 ✅ (fxRenderer.test.js)

### 애니메이션 시스템 기능

**채널 기반 애니메이션 관리:**
- `AnimationChannelManager`: 전체 캐릭터 애니메이션 컨트롤러 관리
- `AnimationController`: 개별 캐릭터 애니메이션 상태 관리
- 5개 애니메이션 채널 (idle, walk, run, jump, sit)
- 5개 감정 채널 (neutral, joy, sad, angry, surprised)

**부드러운 애니메이션 전환 (Crossfade):**
- 애니메이션 상태 변경 시 200ms crossfade
- `transitionProgress` (0~1) 로 부드러운 전환
- `isTransitioning` 상태 플래그

**Bounce 애니메이션 (이동 시):**
- Walk: 0.5px 진폭
- Run: 0.8px 진폭 (더 역동적)
- `Math.sin(currentFrame * Math.PI / 2)` 로 자연스러운 바운스

**이동 방향에 따른 애니메이션:**
- 4방향 지원: up, down, left, right
- Direction 기반 프레임 선택 (스프라이트 시트)
- `setDirection()` 메서드로 방향 설정

**애니메이션 속도 조절:**
- Walk speed에 따른 frame rate 자동 조절
- `setAnimationSpeed(speed)`: speed 1~3 → 200~110ms
- 빠른 속도일수록 더 부드러운 애니메이션

### 이동 애니메이션 시스템 (2026-02-18 구현)

**Backend:**
- `move` 이벤트 핸들러에서 `moveData` 구조 생성
- `moveData`: `{ characterId, characterName, from, to, direction, timestamp }`
- `direction` 결정: `determineDirection(from, to)` 함수
- Socket 이벤트: `io.to(roomId).emit('characterUpdate', character, moveData)`

**Frontend:**
- `App.jsx`: `animatedCharacters` state管理 + 60fps 보간
- 보간 속도: `0.2` pixels/frame
- `animateCharacter` 로직: `setInterval` 16ms (~60 FPS)
- `GameCanvas.jsx`: `propsAnimatedCharactersRef.current` 사용

**방향 결정:**
```javascript
function determineDirection(from, to) {
  const dx = to.x - from.x
  const dy = to.y - from.y
  if (Math.abs(dx) > Math.abs(dy)) {
    return dx > 0 ? 'right' : 'left'
  } else {
    return dy > 0 ? 'down' : 'up'
  }
}
```

**방향 형식 호환성 (2026-02-18 버그 수정 후):**
- MovementHistory.getDirection(): 'right', 'left', 'up', 'down', 'idle' 반환
- spriteRenderer.renderCharacterSprite(): 'walk_right', 'walk_left', 'walk_up', 'walk_down', 'idle' 기대
- GameCanvas.calculateDirection(): 방향 형식 변환 ('right' -> 'walk_right')
- **호환성 보장을 위해 calculateDirection에서 자동 변환 수행** (Issue #86)

**애니메이션 완료 조건:**
- 거리 < speed (0.2px) → 도달로 간주, 애니메이션 제거
- 완료된 캐릭터는 `animatedCharacters` state에서 제거

### 색상 팔레트

```
Skin: #FFE4C4 (Peach)
Hair: #000000 (Black), #8B4513 (Brown), #FFD700 (Gold)
Clothing: #4169E1 (Blue), #FF6347 (Red), #32CD32 (Green), #FFD700 (Yellow), #9370DB (Purple)
Outline: #333333
White: #FFFFFF
Pink: #FFB6C1
```

### 구현된 기능

- ✅ `pixelArtRenderer.js` - 픽셀아트 렌더링 유틸리티 (Issue #88 개선 완료 2026-02-18)
  - `drawPixelCharacter()` - Canvas에 캐릭터 그리기 (애니메이션 지원)
  - `createPixelCharacterDataURL()` - Data URL 생성 (브라우저 전용)
  - `validateCustomizationOptions()` - 옵션 유효성 검사
  - `getAnimationController()` - 애니메이션 컨트롤러 가져오기
  - `removeAnimationController()` - 애니메이션 컨트롤러 제거
  - `cleanupAllAnimationControllers()` - 모든 애니메이션 컨트롤러 정리
- ✅ `AnimationController.js` - 애니메이션 컨트롤러 (Issue #88 개선 완료 2026-02-18)
  - 5개 애니메이션 채널: idle, walk, run, jump, sit
  - 5개 감정 채널: neutral, joy, sad, angry, surprised
  - Crossfade 전환 (200ms)
  - Bounce 애니메이션
  - 애니메이션 속도 자동 조절
- ✅ `AnimationChannelManager` - 애니메이션 채널 관리자 (Issue #88 개선 완료 2026-02-18)
  - 개별 캐릭터별 컨트롤러 관리
  - 컨트롤러 재사용 및 정리
- ✅ 머리 스타일: short, medium, long
- ✅ 머리 색상: default, brown, gold
- ✅ 옷 색상: blue, red, green, yellow, purple
- ✅ 악세서리: none, glasses, hat, flowers
- ✅ 감정 표현: happy (joy), sad, angry, neutral, surprised
- ✅ GameCanvas 통합 (Issue #73) - drawCharacter 함수에서 drawPixelCharacter 사용
- ✅ myCharacter 커스터마이징 옵션 적용
- ✅ AI 캐릭터에도 픽셀아트 적용 (기본 스타일: red/brown)
- ✅ 테스트 코드:
  - `pixelArtRenderer.spec.js` (11/11 통과)
  - `tests/PixelArtRenderer.test.js` (11/11 통과)
  - `tests/PixelArtRendererIntegration.test.js` (17/17 통과 - GameCanvas 통합)
  - `pixelArtRenderer-animation.test.js` (23/23 통과 + 2 skipped - Issue #88 애니메이션 테스트)

### 파일 위치

- `frontend/src/utils/pixelArtRenderer.js` - 메인 코드
- `frontend/src/components/GameCanvas.jsx` - GameCanvas 통합 완료
- `frontend/src/utils/pixelArtRenderer.spec.js` - 단위 테스트
- `frontend/src/utils/pixelArtRenderer.test.js` - 레거시 테스트
- `tests/PixelArtRenderer.test.js` - Vitest 테스트
- `tests/PixelArtRendererIntegration.test.js` - 통합 테스트 (GameCanvas)

## AI 캐릭터

### 설정

```javascript
{
  id: 'ai-yuri',
  name: 'AI 유리',
  x: 500,
  y: 350,
  color: '#FF69B4',
  emoji: '👩',
  isAi: true,
  personality: '친절하고 다정',
  greeting: '안녕하세요! 만나서 반가워요!'
}
```

### 대화 로직 (Issue #105: 완료 ✅ 2026-02-20)

1. 사용자 메시지 수신
2. 감정 시스템으로 메시지 분석 및 감정 상태 업데이트
3. 맥락 관리자로 대화 컨텍스트 및 플레이어 동작 기록
4. 개인성 시스템으로 응답 스타일 적용
5. GLM-4.7 API로 응답 생성 (감정 + 개인성 + 맥락 프롬프트 포함)
6. 응답 전송 (`chatBroadcast` 이벤트)
7. 개인성 후처리로 톤, 말투, 길이 조정

### 상호작용 타입

- **인사 (greet)**: 호감도 +5
- **선물 (gift)**: 호감도 +10
- **친하기 (befriend)**: 호감도 +20
- **싸우기 (fight)**: 호감도 -15

## 고급 대화 시스템 (Issue #105: 완료 ✅ 2026-02-20)

### 개요

AI 캐릭터가 감정, 개인성, 맥락을 인식하여 더 자연스럽게 대화하는 고급 시스템. GLM-4.7 API와 통합하여 인간 같은 대화 경험 제공.

### 시스템 구성

1. **감정 시스템 (`emotion-system.js`)**
2. **개인성 시스템 (`personality-system.js`)**
3. **맥락 관리자 (`context-manager.js`)**
4. **고급 대화 시스템 (`conversation.js`)**

---

## 감정 시스템 (Issue #105: 완료 ✅ 2026-02-20)

### 감정 타입

| 타입 | 설명 | 초기 강도 | 최대 강도 |
|------|------|----------|----------|
| happy | 기쁨, 즐거움 | 0.0 | 1.0 |
| sad | 슬픔, 우울 | 0.0 | 1.0 |
| angry | 화남, 분노 | 0.0 | 1.0 |
| joy | 환희, 기쁨 | 0.3 | 1.0 |
| calm | 차분함 | 0.5 | 1.0 |
| anxious | 불안, 걱정 | 0.0 | 0.8 |

### 감정 상태 데이터 구조

```javascript
{
  characterId: 'ai-yuri',
  emotion: {
    happy: 0.8,
    sad: 0.1,
    angry: 0.0,
    joy: 0.6,
    calm: 0.4,
    anxious: 0.2
  },
  lastUpdated: 1708543200000
}
```

### 핵심 메서드

**EmotionSystem 클래스:**
- `detectEmotion(message)`: 메시지에서 감정 감지
- `amplifyEmotion(emotionType, amount)`: 감정 강화
- `decayEmotions()`: 시간 경과에 따른 감정 자연 감소
- `getDominantEmotion()`: 가장 강한 감정 반환
- `recordEmotionChange(emotionType, oldIntensity, newIntensity)`: 감정 변화 기록

### 감정 감지 로직

**키워드 기반 감정 분석:**

| 감정 | 키워드 (일본어/한국어) | 가중치 |
|------|----------------------|--------|
| happy | 嬉しい, 기뻐, 축하해, 좋아, 楽しい | +0.3 |
| sad | 悲しい, 슬퍼, 미안, 죄송, 寂しい | +0.3 |
| angry | 怒り, 화나, 싫어, 짜증, うざい | +0.4 |
| joy | 嬉しい, 大好き, 와우, 멋져, 最高 | +0.3 |
| calm | 平静, 괜찮아, 안심, まあまあ | +0.2 |
| anxious | 心配, 불안, 두려워, 怖い, 恐怖 | +0.2 |

### 감정 자연 감소

- 매 5분마다 감정 강도 자연 감소
- 감소 속도: 0.05 per 5분
- 최소 감정 강도: 0.0

### 구현 파일

- `backend/ai/emotion-system.js` - 감정 시스템
- `backend/ai/__tests__/emotion-system.test.js` - 테스트 (18 tests)

---

## 개인성 시스템 (Issue #105: 완료 ✅ 2026-02-20)

### 개인성 타입

| 타입 | 설명 | 말하기 스타일 | 토픽 선호 |
|------|------|--------------|----------|
| extrovert | 외향형 | 활발, 직설적, 친근 | 자유 주제, 사회적 이슈 |
| introvert | 내향형 | 조심스럽, 침착, 사색적 | 독서, 취미, 생각 |
| emotional | 감정형 | 감정 풍부, 비유적, 따뜻 | 감정, 인간관계, 이야기 |
| rational | 이성형 | 논리적, 간결, 사실적 | 팩트, 분석, 문제 해결 |
| creative | 창의형 | 독창적, 유머러스, 예술적 | 아이디어, 예술, 창의성 |
| realistic | 현실형 | 실용적, 구체적, 현실적 | 현실 문제, 실용성 |

### 개인성 스크립트 데이터 구조

```javascript
{
  id: 'ai-yuri',
  personality: 'emotional',
  speakingStyleModifiers: {
    tone: 'warm',
    formality: 'polite',
    expressiveness: 'high',
    emotionality: 0.8
  },
  preferredTopics: ['emotion', 'relationships', 'stories'],
  speakingLength: 'moderate'
}
```

### 말하기 스타일 수정자

| 수정자 | 옵션 | 설명 |
|--------|------|------|
| tone | warm, cool, neutral, enthusiastic | 대화 톤 |
| formality | formal, polite, casual, intimate | 예의 수준 |
| expressiveness | low, moderate, high | 감정 표현 정도 |
| emotionality | 0.0 ~ 1.0 | 감정 섞는 비율 |
| brevity | very short, short, moderate, long, very long | 대화 길이 |

### 개인성 기반 토픽 추천

| 개인성 | 추천 토픽 |
|--------|----------|
| extrovert | social, entertainment, current events |
| introvert | books, quiet activities, personal thoughts |
| emotional | feelings, relationships, stories |
| rational | facts, analysis, problem solving |
| creative | ideas, art, hobbies |
| realistic | practical matters, everyday life |

### 핵심 메서드

**PersonalitySystem 클래스:**
- `applyPersonalityToResponse(response, personality)`: 개인성 적용
- `getSpeakingModifiers(personalityType)`: 말하기 스타일 수정자 반환
- `suggestTopics(personalityType, context)`: 토픽 추천
- `adjustResponseLength(response, length)`: 응답 길이 조정
- `addEmotionalColor(response, emotionality, emotion)`: 감정 색상 추가

### 응답 길이 조정

| 길이 | 최대 글자 수 (일본어) | 최대 글자 수 (한국어) |
|------|----------------------|----------------------|
| very short | 10 | 10 |
| short | 20 | 20 |
| moderate | 40 | 40 |
| long | 70 | 70 |
| very long | 100 | 100 |

### 구현 파일

- `backend/ai/personality-system.js` - 개인성 시스템
- `backend/ai/__tests__/personality-system.test.js` - 테스트 (45 tests)

---

## 맥락 관리자 (Issue #105: 완료 ✅ 2026-02-20)

### 개요

대화 컨텍스트 및 플레이어 동작을 기록하고 관리하는 시스템.

### 대화 컨텍스트 데이터 구조

```javascript
{
  characterId: 'ai-yuri',
  messageHistory: [
    {
      id: 'msg-001',
      sender: 'player',
      content: '안녕하세요!',
      timestamp: 1708543200000,
      emotion: 'neutral'
    }
  ],
  conversationState: 'active',
  currentTopic: 'greeting',
  lastInteraction: 1708543200000,
  atmosphere: 'positive'
}
```

### 플레이어 동작 기록

```javascript
{
  playerId: 'player-001',
  actions: [
    {
      type: 'character move',
      data: { from: { x: 100, y: 100 }, to: { x: 150, y: 150 } },
      timestamp: 1708543200000
    }
  ],
  lastUpdate: 1708543200000
}
```

### 대화 분위기

| 분위기 | 설명 | 조건 |
|--------|------|------|
| positive | 긍정적 | 긍정적 메시지 3개 이상 |
| negative | 부정적 | 부정적 메시지 3개 이상 |
| neutral | 중립 | 기본 상태 |

### 핵심 메서드

**ContextManager 클래스:**
- `recordMessage(characterId, message)`: 메시지 기록
- `recordPlayerAction(playerId, actionType, data)`: 플레이어 동작 기록
- `extractTopics(messageHistory)`: 토픽 추출
- `analyzeAtmosphere(messageHistory)`: 대화 분위기 분석
- `getContextualPrompt(characterId, currentPlayerAction)`: 맥락 기반 프롬프트 생성
- `updateConversationState(characterId, state)`: 대화 상태 업데이트

### 토픽 추출 로직

**자주 등장하는 키워드 기반 추출:**
1. 마지막 10개 메시지에서 키워드 추출
2. 빈도 기반 토픽 결정
3. 토픽 우선순위 최신순 정렬

### 시간대 및 위치 기반 프롬프트

```javascript
{
  timeOfDay: 'morning',  // morning, afternoon, evening, night
  location: 'cafe',      // cafe, library, park, home
  prompt: '朝のカフェでまったり会話しよう'
}
```

### 구현 파일

- `backend/ai/context-manager.js` - 맥락 관리자
- `backend/ai/__tests__/context-manager.test.js` - 테스트 (60 tests)

---

## 고급 대화 시스템 (Issue #105: 완료 ✅ 2026-02-20)

### 개요

감정, 개인성, 맥락을 통합하여 자연스러운 AI 대화를 제공하는 메인 시스템.

### 시스템 통합 구조

```
사용자 메시지
    ↓
[감정 시스템] 감정 감지 및 상태 업데이트
    ↓
[맥락 관리자] 컨텍스트 기록 및 토픽 추출
    ↓
[개인성 시스템] 개인성 적용
    ↓
[GLM-4.7 API] 응답 생성 (감정 + 개인성 + 맥락 프롬프트)
    ↓
[개인성 후처리] 톤, 말투, 길이 조정
    ↓
완성된 응답
```

### 캐릭별 개인성 설정

```javascript
{
  'ai-yuri': {
    personality: 'emotional',
    speakingLength: 'moderate',
    tone: 'warm'
  },
  'ai-hikari': {
    personality: 'introvert',
    speakingLength: 'short',
    tone: 'calm'
  }
}
```

### 감정 프롬프트 생성

```javascript
// 감정 상태를 프롬프트로 변환
const emotionPrompt = emotionSystem.generateEmotionPrompt(emotionState);
// 예: "현재 기분: 기쁨 (0.8), 차분함 (0.4)"
```

### 개인성 프롬프트 생성

```javascript
// 개인성을 프롬프트로 변환
const personalityPrompt = personalitySystem.generatePersonalityPrompt(personalityType);
// 예: "성격: 감정형, 말투: 따뜻하고 친절, 길이: 적당"
```

### 감정 상태 변경 로직

**채팅 내용 기반 감정 변화:**

| 메시지 내용 | 감정 변화 |
|------------|----------|
| 긍정적 메시지 (기뻐, 좋아 등) | happy +0.3, joy +0.2 |
| 부정적 메시지 (싫어, 미안 등) | sad +0.3, anxious +0.1 |
| 화난 메시지 (화나, 짜증) | angry +0.4, anxious +0.2 |
| 차분한 메시지 (괜찮아, 안심) | calm +0.2, anxious -0.1 |

### 플레이어 동작 분석

| 동작 | 감정 변화 | 설명 |
|------|----------|------|
| 근접 이동 | calm +0.1 | 플레이어가 다가옴 |
| 선물 주기 | happy +0.4 | 선물 받음 |
| 떠남 | sad +0.2 | 플레이어가 떠남 |
| 공격 | angry +0.5 | 공격당함 |

### 개인성 기반 응답 후처리

**톤 적용:**
- warm: "〜しますよ", "〜ですね" (상냥한 말투)
- cool: "〜だ", "〜した" (간결한 말투)
- neutral: 기본 형태
- enthusiastic: "〜！", "〜よ！" (활기찬 말투)

**예의 수준 적용:**
- formal: "です", "ます" (상당히 정중)
- polite: "〜かな？", "〜だね" (정중하게)
- casual: "〜だよ", "〜ね" (친근하게)
- intimate: "〜", "〜よ" (가까운 사이)

### 핵심 메서드

**ConversationSystem 클래스:**
- `generateResponse(characterId, message, playerId)`: 응답 생성
- `updateEmotionalState(characterId, message)`: 감정 상태 업데이트
- `analyzePlayerBehavior(characterId, action)`: 플레이어 동작 분석
- `applyPersonalityPostprocessing(response, personality)`: 개인성 후처리
- `getConversationContext(characterId)`: 대화 컨텍스트 반환

### GLM-4.7 API 프롬프트 구성

```javascript
const prompt = `
당신은 AI 캐릭터 ${characterName}입니다.

[감정 상태]
${emotionPrompt}

[성격]
${personalityPrompt}

[대화 맥락]
${contextPrompt}

[플레이어 메시지]
${message}

자연스럽게 응답하세요.
`;
```

### 구현 파일

- `backend/conversation.js` - 고급 대화 시스템
- `backend/__tests__/conversation.test.js` - 테스트 (40 tests)

## AI 캐릭터 자동 이동 시스템 (✅ 구현 완료 2026-02-18)

### 개요

AI 캐릭터(유리, 히카리)가 시간대별로 자동으로 건물을 방문하고 산책하는 시스템. 30분마다 하트비트로 PM이 자동 관리.

### 시간대별 행동 패턴

| 시간대 | 시간 | 주요 건물 | 확률 | 대기 시간 |
|-------|------|----------|------|----------|
| Dawn | 5-7시 | Cafe(70%), Park(30%) | 카페/공원 | 5분 |
| Morning | 7-12시 | Cafe(60%), Library(40%) | 카페/도서관 | 8분 |
| Afternoon | 12-17시 | Park(70%), Cafe(30%) | 공원/카페 | 6분 |
| Evening | 17-20시 | Library(60%), Cafe(40%) | 도서관/카페 | 10분 |
| Night | 20-5시 | Home(100%) | 집 | 30분 |

### 건물 위치 (map 기준)

```javascript
BUILDING_LOCATIONS = {
  cafe: { x: 300, y: 400, name: 'Cafe' },
  library: { x: 600, y: 300, name: 'Library' },
  park: { x: 500, y: 600, name: 'Park' },
  home: { x: 400, y: 500, name: 'Home' }
}
```

### 핵심 기능

**AiCharacterMovementScheduler:**
- 시간대별 확률 기반 목표 건물 선택
- Linear interpolation 이동 애니메이션 (5초 소요)
- 주기적 스케줄 체크 (10초마다)
- 소켓 이벤트发射 (`character:move`, `character:building:enter`)

**BuildingInteractionSystem:**
- 건물 입장/퇴장 관리
- 활동 상태 (ENTRANCE → INSIDE → EXIT)
- 1분마다 활동 메시지 전송
- 캐릭터 상태 추적 (`isOccupying`, `getCharacterBuilding`)

**useAiCharacterMovement Hook:**
- React 컨포넌트 통합
- Socket.io 연동
- 캐릭터 추가/제거 관리
- 스케줄러 시작/정지 제어

### 구현 파일

- `frontend/src/utils/aiCharacterMovementScheduler.js` - 이동 스케줄러 (19 tests ✅)
- `frontend/src/utils/buildingInteractionSystem.js` - 건물 상호작용 (26 tests ✅)
- `frontend/src/hooks/useAiCharacterMovement.js` - React Hook
- 각 파일 테스트 포함 (총 45 tests ✅)

### 활동 메시지 예시 (일본어)

**Cafe:**
- 입장: 「☕ カフェに入りました」「🧋 甘い物食べたいなー」「☕ コーヒーの匂いがいい匂い」
- 활동: 「☕ まったりリラックス」「📱 スマホを見てる」「☕ 甘い物食べる」
- 퇴장: 「☕ おいしかった！」「👋 また来るねー」

**Library:**
- 입장: 「📚 図書館に入りました」「📖 勉強するよ」「📚 本読みたいな」
- 활동: 「📖 静かに本を読んでる」「📝 ノートを書いてる」「📚 わかりやすい本を探してる」
- 퇴장: 「📚 勉強終わり！」「👋 また来るねー」

**Park:**
- 입장: 「🌳 公園に入りました」「🌸 花綺麗だね」「🌳 新鮮な空気吸いたい」
- 활동: 「🌳 ベンチで休んでる」「🌸 花を眺めてる」「🌳 ストレッチ中」
- 퇴장: 「🌳 また来るねー」「👋 さようなら！」

### 이동 애니메이션

- Linear interpolation: `position = start + (end - start) * progress`
- Duration: 5초 (5000ms)
- RequestAnimationFrame 사용 (60fps)
- 도착 후 건물 입장 이벤트 발생

### 스케줄러 메서드

- `start()` / `stop()`: 스케줄러 시작/정지
- `executeMovement(charId)`: 캐릭터 이동 시작
- `animateMovement(charId, schedule)`: 이동 애니메이션
- `onCharacterArrive(charId, schedule)`: 도착 처리
- `addCharacter(char)` / `removeCharacter(charId)`: 캐릭터 관리

### BuildingInteractionSystem 메서드

- `enter(charId, building)`: 건물 입장
- `startActivity(charId)`: 활동 시작
- `exit(charId)`: 건물 퇴장
- `isOccupying(charId)`: 캐릭터가 건물에 있는지 확인
- `getCharacterBuilding(charId)`: 캐릭터 현재 건물 확인

## 캐릭터 이동 테스트 시스템 (✅ 완료 2026-02-20)

### 개요 (CRITICAL Test #1002)

캐릭터 연속 이동 시 캐릭터 이동 시스템의 안정성을 검증하기 위한 CRITICAL 레벨 테스트. 이동 경로 추적, 히스토리 기록, 맵 경계 처리, 건물 충돌 처리, 서버 동기화 등의 기능을 검증.

### 테스트 파일

**위치:** `frontend/src/utils/__tests__/characterContinuousMovement.test.js`

**테스트 케이스 총 10개 (전부 통과 ✅):**

| ID | 테스트 항목 | 상태 |
|----|-----------|------|
| T1002-01 | 캐릭터 단일 이동 테스트 | ✅ 통과 |
| T1002-02 | 캐릭터 연속 이동 (2단계) | ✅ 통과 |
| T1002-03 | 캐릭터 연속 이동 (5단계) | ✅ 통과 |
| T1002-04 | 연속 이동 시 서버 동기화 | ✅ 통과 |
| T1002-05 | 맵 경계 이동 클램핑 | ✅ 통과 |
| T1002-06 | 건물 충돌 이동 차단 | ✅ 통과 |
| T1002-07 | 이동 히스토리 순서 | ✅ 통과 |
| T1002-08 | 동시 접속 캐릭터 독립성 | ✅ 통과 |
| T1002-09 | AI 캐릭터 연속 이동 | ✅ 통과 |
| T1002-10 | AI 캐릭터 인터랙션 중 이동 중지 | ✅ 통과 |

### 핵심 기능 검증

**1. 연속 이동 경로 추적:**
- 이동 경로 큐 (`movementPath`)를 이용한 다단계 이동 지원
- 각 이동 시작 시 히스토리 기록 (이동 전/후 위치 포함)
- 모든 이동 완료 후 `isMoving` 플래그 해제

**2. 맵 경계 클램핑:**
- 맵 크기: width 800px, height 600px
- 경계 밖으로 이동 요청 시 자동 클램핑 (충돌이 아니므로 허용)
- `Math.max(0, Math.min(MAP_SIZE.width, targetX))`로 처리

**3. 건물 충돌 감지 및 차단:**
- 건물 위치 데이터:
  - shop: (300, 300) ~ (400, 400)
  - cafe: (500, 200) ~ (580, 280)
  - library: (100, 400) ~ (220, 480)
- 충돌 감지 함수: `checkBuildingCollision(x, y)`
- 충돌 발생 시 Promise reject하여 이동 차단

**4. 서버 동기화 검증:**
- 각 이동 완료 후 `getPosition()` 호출
- Socket.io `movement` 이벤트로 서버에 위치 전송
- 전송 데이터 포함: `{ id, x, y, roomId }`

**5. 히스토리 순서 검증:**
- 이동 순서대로 `history`에 기록
- timestamp 순서 검증 (`history[n].timestamp <= history[n+1].timestamp`)
- 각 항목: `{ timestamp, fromX, fromY, toX, toY }`

**6. 다중 캐릭터 독립성:**
- 여러 캐릭터(`player1`, `player2`, `ai_yuri`) 별도 인스턴스
- 동시 이동 시 각 캐릭터가 독립적으로 움직임
- AI 캐릭터 스케줄 이동도 동일한 로직으로 처리

### 구현된 알고리즘

**충돌 감지:**
```javascript
function checkBuildingCollision(x, y) {
  for (const building of BUILDINGS) {
    if (x >= building.x && x < building.x + building.width &&
        y >= building.y && y < building.y + building.height) {
      return true;
    }
  }
  return false;
}
```

**이동 로직:**
```javascript
moveTo(targetX, targetY) {
  return new Promise((resolve, reject) => {
    if (checkBuildingCollision(targetX, targetY)) {
      reject(new Error('Collision detected'));
      return;
    }

    const startPos = { x: this.x, y: this.y };

    setTimeout(() => {
      this.x = Math.max(0, Math.min(MAP_SIZE.width, targetX));
      this.y = Math.max(0, Math.min(MAP_SIZE.height, targetY));

      this.history.push({
        timestamp: Date.now(),
        fromX: startPos.x,
        fromY: startPos.y,
        toX: this.x,
        toY: this.y
      });

      resolve();
    }, 100);
  });
}
```

### 테스트 결과 요약

- **테스트 파일 생성:** 2026-02-20 10:00
- **코드 작성:** vitest 호환 테스트 코드 (read/write로 작성)
- **테스트 실행:** 1.9초 소요
- **결과:** 10/10 통과 (100%)
- **GitHub Issue:** #117 (CRITICAL Test #1002) close 완료

## 캐릭터 데이터 영구 저장 시스템 (✅ 완료 2026-02-20)

### 개요 (CRITICAL Test #1007)

캐릭터 이동 시 서버의 데이터베이스(SQLite)에 위치를 영구 저장하여 페이지 새로고침 후에도 위치가 유지되도록 하는 시스템. 이전에는 메모리(`room.characters`)에만 저장하여 페이지 새로고칭 시 위치가 초기화되는 버그가 있었음.

### 버그 원인 (수정 전)

**문제 1:** move 이벤트 핸들러에서 메모리 업데이트만
- `room.characters[character.id] = character`로만 업데이트
- DB나 Redis에 저장 없음
- 페이지 새로고침 시 위치 초기화

**문제 2:** `/api/characters` 엔드포인트 없음
- 서버 캐릭터 데이터 조회 API 없음
- E2E 테스트에서 서버 데이터 확인 불가

**문제 3:** 캐릭터 테이블 없음
- SQLite DB는 있으나 캐릭터 테이블 부재
- `character-data.json`만 존재 (비어 있음: `{"test":"data"}`)

### 수정 내용

**1. character-manager.js 생성**
- 위치: `backend/database/character-manager.js`
- 캐릭터 테이블 초기화 (`characters`)
- `updateCharacterPosition()` - 위치 업데이트
- `upsertCharacter()` - 전체 데이터 업데이트
- `getCharacter()` - ID로 조회
- `getAllCharacters()` - 전체 조회

**2. server.js move 이벤트 핸들러 수정**
- `character-manager.js` import (`initCharacterTable`, `updateCharacterPosition`)
- `initCharacterTable()` 호출 (서버 시작 시)
- move 이벤트에서 `updateCharacterPosition()` 호출로 DB 저장

```javascript
// 수정 전
room.characters[character.id] = character
io.to(roomId).emit('characterUpdate', character, moveData)

// 수정 후
room.characters[character.id] = character

// 💾 DB에 위치 저장 (영구 저장)
updateCharacterPosition(character.id, character.x, character.y, roomId)

io.to(roomId).emit('characterUpdate', character, moveData)
```

**3. /api/characters 엔드포인트 추가**
- `GET /api/characters` - 모든 캐릭터 조회
- `GET /api/characters/:id` - 특정 캐릭터 조회

### 캐릭터 테이블 구조

```sql
CREATE TABLE characters (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#4CAF50',
  emoji TEXT DEFAULT '😊',
  x REAL DEFAULT 400,
  y REAL DEFAULT 300,
  room_id TEXT DEFAULT 'main-plaza',
  level INTEGER DEFAULT 1,
  exp INTEGER DEFAULT 0,
  hp INTEGER DEFAULT 100,
  affinity INTEGER DEFAULT 0,
  charisma INTEGER DEFAULT 0,
  intelligence INTEGER DEFAULT 0,
  is_ai BOOLEAN NOT NULL DEFAULT 0,
  created_at INTEGER DEFAULT (strftime('%s', 'now')),
  updated_at INTEGER DEFAULT (strftime('%s', 'now'))
)
```

### 구현된 메서드

**character-manager.js:**
- `initCharacterTable()` - 캐릭터 테이블 생성
- `updateCharacterPosition(characterId, x, y, roomId)` - 위치 업데이트 (없으면 생성)
- `upsertCharacter(character)` - 전체 데이터 업데이트 (INSERT OR REPLACE)
- `getCharacter(characterId)` - ID로 조회
- `getAllCharacters()` - 모든 캐릭터 조회
- `getCharactersByRoom(roomId)` - 방 별 조회
- `deleteCharacter(characterId)` - 삭제

### 테스트 결과 요약

- **구현 완료:** 2026-02-20 13:30
- **코드 작성:** read/write로 캐릭터 데이터 영구 저장 시스템 구현
- **테스트 코드:** 10개 테스트 케이스, 31개 assertions (read/write로 작성)
- **테스트 실행:** Node.js 직접 실행 (vitest 문제로 manual test runner 사용)
- **결과:** 31/31 통과 (100%)
- **GitHub Issue:** #122 (CRITICAL Test #1007) 진행 중

### 테스트 케이스 (CRITICAL Test #1007)

| ID | 테스트 항목 | 상태 |
|----|-----------|------|
| T1007-01 | 캐릭터 테이블 존재 확인 | ✅ 통과 |
| T1007-02 | 캐릭터 생성 후 위치 업데이트 | ✅ 통과 (x=200, y=200) |
| T1007-03 | 캐릭터가 없으면 새로 생성 | ✅ 통과 (x=300, y=300) |
| T1007-04 | ID로 캐릭터 조회 | ✅ 통과 (이름, 색상, 이모지) |
| T1007-05 | 존재하지 않는 캐릭터 조회 | ✅ 통과 (null 반환) |
| T1007-06 | 빈 목록 조회 | ✅ 통과 (빈 배열) |
| T1007-07 | 여러 캐릭터 조회 | ✅ 통과 (3개 캐릭터) |
| T1007-08 | is_ai 플래그 변환 확인 | ✅ 통과 (false/true 변환) |
| T1007-09 | 연속 이동 후 데이터 유지 | ✅ 통과 (3번 이동) |
| T1007-10 | 다중 캐릭터 독립성 | ✅ 통과 (char-1, char-2 독립) |

### 핵심 기능 검증

**1. 캐릭터 위치 저장:**
- move 이벤트 호출 시 `updateCharacterPosition()` 실행
- SQLite DB에 x, y, room_id 저장
- 페이지 새로고침 후에도位置 유지

**2. is_ai 플래그 변환:**
- DB에서는 0/1로 저장
- 조회 시 boolean(true/false)로 변환
- Frontend에서 사용하기 편한 형식

**3. 연속 이동 데이터 유지:**
- 1번째 이동: (100, 100) → (200, 200)
- 2번째 이동: (200, 200) → (300, 300)
- 3번째 이동: (300, 300) → (400, 400), room_id: 'room-2'
- 모든 이동 후 DB에서 최종 위치 조회 성공

**4. 다중 캐릭터 독립성:**
- char-1: (100, 100), room-1
- char-2: (200, 200), room-2
- 각 캐릭터가 독립적으로 이동 및 저장

### 파일 위치

- `backend/database/character-manager.js` - 메인 코드 (3884 bytes)
- `backend/database/index.js` - export 추가
- `backend/server.js` - import 및 move 이벤트 수정
- `backend/database/__tests__/character-manager.test.js` - vitest 테스트 (5614 bytes)
- `backend/database/__tests__/run-test.js` - manual test runner (8560 bytes)

---

## 호감도 시스템

### 호감도 범위

| 범위 | 관계 | 색상 |
|------|------|------|
| 0 ~ 19 | 낯선 사람 | 회색 |
| 20 ~ 39 | 지인 | 파란색 |
| 40 ~ 59 | 친구 | 초록색 |
| 60 ~ 79 | 좋은 친구 | 노란색 |
| 80 ~ 100 | 베프 | 빨간색 |

### 호감도 데이터 구조

```javascript
{
  characterId: {
    [otherCharacterId]: affinityScore
  }
}
```

## 캐릭터 컴포넌트

### CharacterRenderer.jsx

- 캐릭터 렌더링
- 커스터마이징 적용
- 애니메이션 처리

### CharacterCustomizationModal.jsx

- 머리 스타일 선택
- 옷 색상 선택
- 액세서리 선택

## TODO (Phase 3)

- [ ] 픽셀아트 스프라이트를 GameCanvas에 통합
- [ ] 애니메이션 시스템 구현 (idle/walk)
- [ ] 방향 전환 (상/하/좌/우)

---

## 스킬 시스템 (Phase 12) - ✅ 완료 (2026-02-20)

### 스킬 타입

| 타입 | 설명 | 예시 |
|------|------|------|
| ACTIVE | 발동형 스킬 (사용 시 발동) | 베기, 힐, 대시 |
| PASSIVE | 자동 효과 스킬 (상시 효과) | 크리티컬 히트, 민첩함, 생명력 |

### 스킬 범주

| 범주 | 설명 | 예시 스킬 |
|------|------|---------|
| COMBAT | 전투 (데미지, 공격력 증가) | 베기, 파워 스트라이크, 크리티컬 히트 |
| MOVEMENT | 이동 (속도 증가, 순간이동) | 대시, 속도 부스트, 민첩함 |
| SUPPORT | 보조 (힐, 버프, 디버프) | 힐, 방어력 강화, 생명력 |

### 기본 스킬 목록

**전투 스킬:**
- `slash` (Lv.1): 전방의 적에게 물리 공격 (10-20 데미지, 쿨타임 3초)
- `power_strike` (Lv.10): 강력한 일격 (30-50 데미지, 쿨타임 8초)
- `critical_hit` (Lv.5, PASSIVE): 크리티컬 확률 10% 증가

**이동 스킬:**
- `dash` (Lv.1): 짧은 거리 이동 (3칸 순간이동, 쿨타임 5초)
- `speed_boost` (Lv.8): 이동 속도 30% 증가 (10초, 쿨타임 30초)
- `agility` (Lv.3, PASSIVE): 기본 이동 속도 15% 증가

**보조 스킬:**
- `heal` (Lv.1): HP 회복 (20-40 회복, 쿨타임 10초)
- `defense_boost` (Lv.7): 방어력 20% 증가 (15초, 쿨타임 25초)
- `vitality` (Lv.2, PASSIVE): 최대 HP 20% 증가

### 스킬 데이터 구조

```javascript
{
  characterId: 'player1',
  skills: {
    skills: ['slash', 'heal', 'criticial_hit'],           // 소유 스킬 ID 목록
    skillLevels: { slash: 2, heal: 1, critical_hit: 1 }, // 스킬 레벨
    skillExp: { slash: 150, heal: 0, critical_hit: 0 },  // 스킬 경험치
    skillCooldowns: { slash: 1708543300000 },            // 쿨타임 종료 시간
    activeSlots: 5,                                      // 액티브 스킬 슬롯
    equippedActive: ['slash', 'heal'],                   // 장착된 액티브 스킬
    passiveSkills: ['critical_hit'],                     // 패시브 스킬
    activeEffects: []                                    // 활성화된 버프/디버프
  }
}
```

### 스킬 시스템 기능

**1. 스킬 학습:**
- 레벨 조건 확인
- 중복 학습 방지
- 패시브 스킬 자동 활성화

**2. 스킬 레벨업:**
- 경험치 기반 레벨업 (100 × 현재 레벨)
- 레벨당 10% 효과 증가
- 쿨타임 5% 감소 (액티브 스킬)

**3. 스킬 장착/해제:**
- 액티브 스킬 슬롯 관리 (기본 5개)
- 패시브 스킬 자동 활성화 (수동 장착 불가)

**4. 스킬 사용:**
- 쿨타임 관리
- 효과 계산 (데미지, 힐, 버프, 이동)
- 액티브 효과 등록 (지속 효과)

**5. 패시브 스킬 효과:**
- 자동 스탯 보정 계산
- 캐릭터 총 스탯 계산 (패시브 + 액티브)

### 쿨타임 시스템

**쿨타임 계산:**
```javascript
actualCooldown = skill.cooldown × (1 - (skillLevel - 1) × 0.05)
```

- Lv.1: 100% 쿨타임
- Lv.5: 80% 쿨타임 (레벨당 5% 감소)

### 스킬 레벨 효과

| 레벨 | 데미지 증가 | 쿨타임 감소 |
|------|------------|------------|
| Lv.1 | 0% | 0% |
| Lv.2 | 10% | 5% |
| Lv.3 | 20% | 10% |
| Lv.4 | 30% | 15% |
| Lv.5 | 40% | 20% |

### 테스트 결과 요약

- **구현 완료:** 2026-02-20 12:02
- **코드 작성:** read/write로 스킬 시스템 구현
- **테스트 코드:** 49개 테스트 (read/write로 작성)
- **테스트 실행:** 213ms 소요
- **결과:** 49/49 통과 (100%)
- **GitHub Issue:** #113 Phase 12 진행 중

### 구현된 메서드

**SkillManager 클래스:**
- `getSkill(skillId)` - 스킬 정보 가져오기
- `getAllSkills()` - 모든 스킬 목록
- `getAvailableSkills(level)` - 레벨별 사용 가능 스킬
- `canLearnSkill(characterData, skillId)` - 학습 가능 여부 확인
- `learnSkill(characterData, skillId)` - 스킬 학습
- `levelUpSkill(characterData, skillId, expGained)` - 스킬 레벨업
- `canUseSkill(characterData, skillId)` - 사용 가능 여부 확인
- `useSkill(characterData, skillId, target)` - 스킬 사용
- `equipSkill(characterData, skillId)` - 스킬 장착
- `unequipSkill(characterData, skillId)` - 스킬 장착 해제
- `updateCooldowns(characterData)` - 쿨타임 업데이트
- `calculatePassiveEffects(characterData)` - 패시브 효과 계산
- `calculateTotalStats(characterData, baseStats)` - 총 스탯 계산
- `getSkillSummary(characterData)` - 스킬 요약 정보
- `getLearnableSkills(characterData)` - 학습 가능 스킬

### 파일 위치

- `backend/character-system/skill-system.js` - 메인 코드 (18,055 bytes)
- `backend/character-system/__tests__/skill-system.test.js` - 테스트 코드 (21,351 bytes)
- [ ] 감정 표현을 채팅에 통합
- [ ] 아바타 미리보기 UI

---

## 장비 시스템 (Phase 12) - ✅ 완료 (2026-02-20)

### 개요

캐릭터가 장비를 장착하고 관리하는 시스템. 장비 슬롯, 인벤토리, 강화 시스템을 포함.

### 장비 슬롯

| 슬롯 타입 | 설명 | 예시 장비 |
|-----------|------|----------|
| WEAPON | 무기 | 기본 검, 강철 검, 마법 스태프 |
| HEAD | 머리 | 가죽 투구, 마법사 관 |
| BODY | 몸통 | 가죽 갑옷, 판금 갑옷 |
| ACCESSORY | 장신구 | 생명의 반지, 속도의 반지 |
| SPECIAL | 특수 | 그림자 망토 |

### 장비 레어도

| 레어도 | 색상 | 스탯 보너스 |
|--------|------|------------|
| COMMON | #95A5A6 (회색) | 1.0x |
| RARE | #3498DB (파란색) | 1.2x |
| EPIC | #9B59B6 (보라색) | 1.5x |
| LEGENDARY | #F39C12 (금색) | 2.0x |
| MYTHIC | #E74C3C (빨간색) | 2.5x |

### 장비 스탯 타입

| 스탯 | 설명 |
|------|------|
| attack | 공격력 |
| defense | 방어력 |
| speed | 이동 속도 |
| health | 생명력 |
| stamina | 스테미나 |
| intelligence | 지능 |
| criticalChance | 크리티컬 확률 |
| criticalDamage | 크리티컬 데미지 |

### 기본 장비 데이터베이스

**무기:**
- `sword_basic` (Lv.1, COMMON): 기본 검 (공격력 10, 크리티컬 데미지 5%)
- `sword_rare` (Lv.1, RARE): 강철 검 (공격력 15, 크리티컬 데미지 8%)
- `staff_magic` (Lv.1, RARE): 마법 스태프 (공격력 8, 지능 20, 크리티컬 확률 10%)

**머리 장비:**
- `helmet_leather` (Lv.1, COMMON): 가죽 투구 (방어력 5, 생명력 10)
- `crown_mage` (Lv.1, EPIC): 마법사 관 (방어력 8, 지능 25, 크리티컬 확률 5%)

**몸통 장비:**
- `armor_leather` (Lv.1, COMMON): 가죽 갑옷 (방어력 15, 생명력 30)
- `armor_plate` (Lv.1, RARE): 판금 갑옷 (방어력 25, 생명력 50, 속도 -5)

**장신구:**
- `ring_hp` (Lv.1, EPIC): 생명의 반지 (생명력 100, 스테미나 20)
- `ring_speed` (Lv.1, EPIC): 속도의 반지 (속도 20, 크리티컬 확률 8%)

**특수 장비:**
- `shadow_cloak` (Lv.1, LEGENDARY): 그림자 망토 (속도 30, 크리티컬 확률 15%, 크리티컬 데미지 20%)

### 장비 데이터 구조

```javascript
{
  id: 'sword_basic',
  name: '기본 검',
  slot: 'weapon',
  rarity: { name: 'COMMON', color: '#95A5A6', statMultiplier: 1.0 },
  level: 1,
  maxLevel: 10,
  baseStats: {
    attack: 10,
    criticalDamage: 0.05
  },
  description: '기본적인 검'
}
```

### 장비 시스템 기능

**1. 장비 정보:**
- 데이터베이스에서 장비 정보 조회
- Deep copy로 정보 반환 (데이터 보호)

**2. 장비 장착/해제:**
- 장착 슬롯에 장비 할당
- 장착 중인 장비 교체
- 장착된 장비 해제

**3. 장비 강화:**
- 장비 레벨 증가
- 최대 레벨 제한 (maxLevel 속성)
- 장착된 장비/인벤토리 장비 강화

**4. 장비 효과 계산:**
- 장착된 장비의 스탯 합산
- 레어도 보너스 적용 (statMultiplier)
- 레벨 보너스 적용 (레벨당 10% 증가)

**5. 인벤토리 관리:**
- 인벤토리에 장비 추가
- 인벤토리에서 장비 제거
- 인벤토리 목록 조회

**6. 장비 스탯 계산:**
- 단일 장비 스탯 계산 (레어도 × 레벨 보너스)
- 캐릭터 총 스탟 계산

### 장비 스탯 계산

**효과 스탟 계산:**
```javascript
effectiveValue = baseStats × rarityMultiplier × levelMultiplier

levelMultiplier = 1 + (level - 1) × 0.1  // 레벨당 10% 증가
```

**예시:**
- 기본 검 (Lv.1, COMMON): 공격력 10 × 1.0 × 1.0 = 10
- 기본 검 (Lv.3, COMMON): 공격력 10 × 1.0 × 1.2 = 12
- 강철 검 (Lv.1, RARE): 공격력 15 × 1.2 × 1.0 = 18
- 강철 검 (Lv.5, RARE): 공격력 15 × 1.2 × 1.4 = 25.2

### 장비 강화 효과

| 레벨 | 보너스 스탯 (레벨당) |
|------|---------------------|
| Lv.1 | 0% |
| Lv.2 | +10% |
| Lv.3 | +20% |
| Lv.4 | +30% |
| Lv.5 | +40% |

### 테스트 결과 요약

- **구현 완료:** 2026-02-20 12:31
- **코드 작성:** read/write로 장비 시스템 구현
- **테스트 코드:** 44개 테스트 (read/write로 작성)
- **테스트 실행:** 181ms 소요
- **결과:** 44/44 통과 (100%)
- **GitHub Issue:** #113 Phase 12 진행 중

### 테스트 카테고리

- 기본 설정 (3 tests)
- 장비 정보 조회 (3 tests)
- 장비 장착 (4 tests)
- 장비 해제 (3 tests)
- 장비 강화 (4 tests)
- 장비 효과 계산 (5 tests)
- 인벤토리 관리 (6 tests)
- 장비 스탯 계산 (4 tests)
- 장착 슬롯 정보 (2 tests)
- 요약 정보 (2 tests)
- 통합 테스트 (4 tests)
- 엣지 케이스 (4 tests)

### 구현된 메서드

**EquipmentSystem 클래스:**
- `getEquipmentInfo(itemId)` - 장비 정보 가져오기
- `equipItem(itemId)` - 장비 장착
- `unequipSlot(slotType)` - 장비 해제
- `enhanceEquipment(itemId)` - 장비 강화
- `getTotalStats()` - 총 스탯 계산
- `equippedSlots` - 장착된 슬롯 정보
- `addToInventory(equipment)` - 인벤토리 추가
- `removeFromInventory(itemId)` - 인벤토리 제거
- `getInventory()` - 인벤토리 목록
- `getSummary()` - 요약 정보
- `calculateStat(equipment, stat)` - 장비 스탯 계산

### 버그 수정 기록

1. **2026-02-20 12:31 - 키 오타 수정**
   - 'helmet Leather' → 'helmet_leather' (공백 제거)

2. **2026-02-20 12:31 - 파라미터 검증 추가**
   - `addToInventory()`에 equipment 파라미터 null/undefined 검증 추가

3. **2026-02-20 12:31 - 테스트 케이스 수정**
   - T26: 장착된 장비 제거 실패 테스트 로직 수정 (인벤토리 추가 후 장착)
   - T41: 장비 장착 후 인벤토리 추가 성공으로 수정 (인벤토리와 장착 슬롯은 독립적)

### 파일 위치

- `backend/character-system/equipment-system.js` - 메인 코드 (11,455 bytes)
- `backend/character-system/__tests__/equipment-system.test.js` - 테스트 코드 (17,968 bytes)