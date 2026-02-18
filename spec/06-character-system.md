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

### 대화 로직

1. 사용자 메시지 수신
2. GLM-4.7 API로 응답 생성
3. 응답 전송 (`chatBroadcast` 이벤트)

### 상호작용 타입

- **인사 (greet)**: 호감도 +5
- **선물 (gift)**: 호감도 +10
- **친하기 (befriend)**: 호감도 +20
- **싸우기 (fight)**: 호감도 -15

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
- [ ] 감정 표현을 채팅에 통합
- [ ] 아바타 미리보기 UI