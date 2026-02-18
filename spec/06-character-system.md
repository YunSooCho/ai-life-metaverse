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

### 애니메이션 타입

| 타입 | 프레임 수 | 설명 | 상태 |
|------|----------|------|------|
| idle | 2 | 정지 상태 (숨 쉬기) | TODO |
| walk | 4 | 이동 중 | ✅ 구현 완료 (2026-02-18) |
| emote | 3 | 감정 표현 | TODO |
| interact | 2 | 상호작용 중 | TODO |

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

- ✅ `pixelArtRenderer.js` - 픽셀아트 렌더링 유틸리티
  - `drawPixelCharacter()` - Canvas에 캐릭터 그리기
  - `createPixelCharacterDataURL()` - Data URL 생성 (브라우저 전용)
  - `validateCustomizationOptions()` - 옵션 유효성 검사
- ✅ 머리 스타일: short, medium, long
- ✅ 머리 색상: default, brown, gold
- ✅ 옷 색상: blue, red, green, yellow, purple
- ✅ 악세서리: none, glasses, hat, flowers
- ✅ 감정 표현: happy, sad, angry, neutral
- ✅ GameCanvas 통합 (Issue #73) - drawCharacter 함수에서 drawPixelCharacter 사용
- ✅ myCharacter 커스터마이징 옵션 적용
- ✅ AI 캐릭터에도 픽셀아트 적용 (기본 스타일: red/brown)
- ✅ 테스트 코드:
  - `pixelArtRenderer.spec.js` (11/11 통과)
  - `tests/PixelArtRenderer.test.js` (11/11 통과)
  - `tests/PixelArtRendererIntegration.test.js` (17/17 통과 - GameCanvas 통합)

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