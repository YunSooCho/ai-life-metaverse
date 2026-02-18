# 캐릭터 시스템 (Character System)

## 캐릭터 구성 요소

### 1. 기본 정보

| 필드 | 설명 | 예시 |
|------|------|------|
| `character_id` | 고유 ID | char_abc123 |
| `name` | 이름 | 유리 |
| `age` | 나이 | 24 |
| `gender` | 성별 | male/female/other |
| `avatar_style` | 일러스트 스타일 | 긴 머리, 안경, 캐주얼 |
| `sprite_id` | 픽셀아트 스프라이트 ID (2026-02-16) | character_yuri.png |
| `sprite_palette` | 색상 팔레트 ID (2026-02-16) | palette_default |

**Name Fallback (2026-02-17):**
- `name`이 `undefined` 또는 `null`이면 UI에 "익명"으로 표시
- Character.jsx와 GameCanvas.jsx에서 `name || '익명'` 적용
- Issue #37 해결

---

## 🎨 픽셀아트 스프라이트 시스템 (Pixel Art Sprite System) - 2026-02-16

### 스프라이트 구조

**스프라이트시트 패키징:**
```
assets/sprites/
├── character/
│   ├── yuri.png              # 유리 캐릭터 스프라이트 (32x32, 8x4 프레임)
│   │   # idle (4), walk_down (4), walk_left (4), walk_right (4)
│   ├── minsoo.png            # 민수 캐릭터 스프라이트 (동일 구조)
│   ├── hanul.png             # 하늘 캐릭터 (다른 스타일)
│   ├── player_default.png    # 플레이어 기본 캐릭터
│   ├── player_female.png     # 플레이어 여성 스타일
│   ├── player_male.png       # 플레이어 남성 스타일
│   └── character_variants/   # 캐릭터 스타일 변형 (30+)
│       ├── variant_hair_long.png     # 긴 머리 스타일
│       ├── variant_hair_short.png    # 짧은 머리 스타일
│       ├── variant_glasses.png       # 안경 스타일
│       ├── variant_hat.png           # 모자 스타일
│       ├── variant_casual.png        # 캐주얼 옷
│       ├── variant_athlete.png       # 운동복
│       ├── variant_formal.png        # 정장
│       └── ...
│
├── emoji/
│   ├── emotions_basic.png    # 기본 5 감정 이모지 (16x16, 1x5)
│   ├── emotions_extended.png # 확장 16 감정 이모지 (16x16, 1x16)
│   └── emotion_animations/   # 감정 애니메이션 (프레임 기반)
│       ├── happy_pulse.png   # happy: pulse 애니메이션
│       ├── sad_droop.png     # sad: droop 애니메이션
│       ├── angry_shake.png   # angry: shake 애니메이션
│       ├── love_heartbeat.png # love: heartbeat 애니메이션
│       └── ...
│
├── buildings/
│   ├── shop.png              # 상점 (64x64)
│   ├── shop_interior.png     # 상점 내부 (128x128)
│   ├── shop_sign.png         # 상점 간판 (32x16)
│   ├── cafe.png              # 카페 (64x64)
│   ├── cafe_interior.png     # 카페 내부 (128x128)
│   ├── cafe_sign.png         # 카페 간판
│   ├── park.png              # 공원 (64x64)
│   ├── park_details.png      # 공원 장식 (나무, 벤치 등)
│   ├── library.png           # 도서관 (64x64)
│   ├── library_interior.png  # 도서관 내부
│   ├── library_sign.png      # 도서관 간판
│   ├── gym.png               # 체육관 (64x64)
│   ├── gym_interior.png      # 체육관 내부
│   ├── gym_sign.png          # 체육관 간판
│   └── buildings_variants/   # 건물 변형 (20+)
│       ├── shop_night.png    # 야간 상점
│       ├── cafe_sunny.png    # 맑은 날 카페
│       ├── park_spring.png   # 봄 공원
│       └── ...
│
├── tiles/
│   ├── tileset_basic.png     # 기본 타일셋 (16x16, 12x12 프레임 = 144 타일)
│   ├── tileset_nature.png    # 자연 타일 (잔디, 흙, 물, 물가, 바위, 나무 등)
│   ├── tileset_urban.png     # 도시 타일 (길, 보도, 건물 벽, 창문, 문 등)
│   ├── tileset_interior.png  # 인테리어 타일 (바닥, 벽, 가구 등)
│   ├── tileset_decorations.png # 장식 타일 (꽃, 돌, 울타리 등)
│   ├── tileset_water.png     # 물 타일 (일반 물, 얕은 물, 깊은 물, 폭포 등)
│   ├── tileset_special.png   # 특수 타일 (포털, 텔레포터, 맵 이동 지점 등)
│   └── tileset_animated/     # 애니메이션 타일
│       ├── water_wave.png    # 물결 애니메이션 (4 프레임)
│       ├── fire_flicker.png  # 불 애니메이션 (4 프레임)
│       ├── smoke_puff.png    # 연기 애니메이션 (3 프레임)
│       └── ...
│
├── items/
│   ├── item_health.png       # 체력 아이템 (16x16)
│   ├── item_energy.png       # 에너지 아이템 (16x16)
│   ├── item_food.png         # 음식 아이템 (16x16, 10개 변형)
│   ├── item_drink.png        # 음료 아이템 (16x16, 8개 변형)
│   ├── item_gift.png         # 선물 아이템 (16x16, 12개 변형)
│   ├── item_book.png         # 책 아이템 (16x16, 5개 변형)
│   ├── item_flower.png       # 꽃 아이템 (16x16, 8개 변형)
│   ├── item_music.png        # 음악 아이템 (16x16, 6개 변형)
│   ├── item_key.png          # 열쇠 아이템 (16x16, 3개 변형)
│   ├── item_gem.png          # 보석 아이템 (16x16, 5개 변형)
│   └── item_special.png      # 특수 아이템 (16x16, 10개 변형)
│
├── effects/
│   ├── effects_ui/           # UI 이펙트
│   │   ├── heart.png         # 하트 효과 (16x16)
│   │   ├── heart_burst.png   # 하트 폭발 (32x32, 4 프레임)
│   │   ├── skull.png         # 데드 효과 (16x16)
│   │   ├── skull_fade.png    # 데드 페이드 (32x32, 4 프레임)
│   │   ├── dust.png          # 점프 먼지 (8x8, 3 프레임)
│   │   ├── ripple.png        # 클릭 리플 (16x16, 4 프레임)
│   │   ├── sparkle.png       # 반짝임 효과 (16x16, 4 프레임)
│   │   ├── blink.png         # 깜빡임 효과 (16x16, 2 프레임)
│   │   ├── arrow_up.png      # 위쪽 화살표 (16x16)
│   │   ├── arrow_down.png    # 아래쪽 화살표 (16x16)
│   │   └── cursor.png        # 커서 효과 (16x16)
│   │
│   ├── effects_character/    # 캐릭터 이펙트
│   │   ├── jump_up.png       # 점프 상승 (32x32, 3 프레임)
│   │   ├── jump_land.png     # 점프 착지 (32x32, 3 프레임)
│   │   ├── run_dust.png      # 달리기 먼지 (16x16, 4 프레임)
│   │   ├── sit_down.png      # 앉기 효과 (32x32, 2 프레임)
│   │   ├── stand_up.png      # 일어서기 효과 (32x32, 2 프레임)
│   │   ├── hug.png           # 포옹 효과 (32x32, 4 프레임)
│   │   ├── shake_hand.png    # 악수 효과 (32x32, 4 프레임)
│   │   ├── wave.png          # 손 흔들기 (32x32, 4 프레임)
│   │   └── ...
│   │
│   ├── effects_elemental/    # 원소 이펙트
│   │   ├── fire_flame.png    # 불꽃 (16x16, 4 프레임)
│   │   ├── ice_shard.png     # 얼음 파편 (16x16, 4 프레임)
│   │   ├── poison_cloud.png  # 독 구름 (16x16, 4 프레임)
│   │   ├── healing_light.png # 치유 빛 (16x16, 4 프레임)
│   │   ├── electric_spark.png # 전기 스파크 (16x16, 3 프레임)
│   │   └── ...
│   │
│   ├── effects_weather/      # 날씨 이펙트
│   │   ├── rain_drop.png     # 빗방울 (8x8)
│   │   ├── snow_flake.png    # 눈송이 (8x8)
│   │   ├── lightning.png     # 번개 (32x64, 2 프레임)
│   │   └── cloud.png         # 구름 (32x16)
│   │
│   └── effects_atmosphere/   # 분위기 이펙트
│       ├── moon_light.png    # 달빛 (64x64)
│       ├── sun_light.png     # 햇빛 (64x64)
│       ├── glow_orb.png      # 빛 구체 (16x16, 4 프레임)
│       └── shadow.png        # 그림자 (32x32)
│
├── ui/
│   ├── ui_buttons/           # UI 버튼 (20개)
│   │   ├── button_ok.png     # 확인 버튼
│   │   ├── button_cancel.png # 취소 버튼
│   │   ├── button_yes.png    # 예 버튼
│   │   ├── button_no.png     # 아니오 버튼
│   │   ├── button_next.png   # 다음 버튼
│   │   ├── button_prev.png   # 이전 버튼
│   │   └── ...
│   │
│   ├── ui_panels/            # UI 패널 (10개)
│   │   ├── panel_basic.png   # 기본 패널
│   │   ├── panel_inventory.png # 인벤토리 패널
│   │   ├── panel_quest.png   # 퀘스트 패널
│   │   ├── panel_shop.png    # 상점 패널
│   │   └── ...
│   │
│   ├── ui_icons/             # UI 아이콘 (50+)
│   │   ├── icon_coin.png     # 코인 (16x16)
│   │   ├── icon_gem.png      # 보석 (16x16)
│   │   ├── icon_heart.png    # 하트 (16x16)
│   │   ├── icon_energy.png   # 에너지 (16x16)
│   │   ├── icon_exp.png      # 경험치 (16x16)
│   │   ├── icon_map.png      # 지도 (16x16)
│   │   ├── icon_settings.png # 설정 (16x16)
│   │   ├── icon_sound.png    # 사운드 (16x16)
│   │   ├── icon_music.png    # 음악 (16x16)
│   │   └── ...
│   │
│   └── ui_decorations/       # UI 장식 (20+)
│       ├── frame_gold.png    # 금색 테두리
│       ├── frame_silver.png  # 은색 테두리
│       ├── corner_bl.png     # 왼쪽 아래 코너
│       ├── corner_br.png     # 오른쪽 아래 코너
│       ├── corner_tl.png     # 왼쪽 위 코너
│       └── corner_tr.png     # 오른쪽 위 코너
│
├── backgrounds/
│   ├── bg_menu.png           # 메인 메뉴 배경 (스크롤)
│   ├── bg_night.png          # 야간 배경 (스크롤)
│   ├── bg_day.png            # 주간 배경 (스크롤)
│   ├── bg_indoor.png         # 실내 배경 (타일맵)
│   └── bg_special/           # 특수 배경
│       ├── bg_shop.png       # 상점 배경
│       ├── bg_cafe.png       # 카페 배경
│       └── ...
│
└── animations/               # 전용 애니메이션
    ├── anim_intro.png        # 인트로 애니메이션
    ├── anim_transition.png   # 화면 전환 애니메이션
    └── anim_victory.png      # 승리 애니메이션
```

### 에셋 총 개수 (추정)

| 카테고리 | 파일 수 | 설명 |
|----------|---------|------|
| Character | 10+ (기본) + 30 (변형) = **40+** | 기본 캐릭터 + 스타일 변형 |
| Emoji | 2 (기본/확장) + 5 (애니메이션) = **7** | 감정 이모지 |
| Buildings | 15 (기본/내부/간판) + 20 (변형) = **35+** | 건물 스프라이트 |
| Tiles | 7 (기본 타일셋) + 4 (애니메이션) = **11** | 타일맵 (~200 타일) |
| Items | **50+** | 다양한 아이템 |
| Effects | 20+ (UI) + 20+ (캐릭터) + 10+ (원소) + 4 (날씨) + 4 (분위기) = **60+** | 다양한 이펙트 |
| UI | 20 (버튼) + 10 (패널) + 50 (아이콘) + 20 (장식) = **100+** | UI 에셋 |
| Backgrounds | 4+ (기본) + 10 (특수) = **14+** | 배경 |
| Animations | **3+** | 전용 애니메이션 |

**총 추정: 300+ 에셋 파일** 📊

---

### 캐릭터 스프라이트 프레임 구조

**스프라이트시트:** `32x32 픽셀 * 4번(방향) * 4번(액션) = 512x128`

| 액션 | 프레임 | 설명 |
|------|--------|------|
| `idle` | 0-3 | 대기 (정지 애니메이션, 200ms/프레임) |
| `walk_down` | 4-7 | 왼쪽으로 이동 (애니메이션, 150ms/프레임) |
| `walk_left` | 8-11 | 아래로 이동 |
| `walk_right` | 12-15 | 위로 이동 |

**방향 매핑:**
- `0, 1, 2, 3`: down → left → right → up (시계방향)

### 스프라이트 로더 유틸리티 (SpriteLoader)

```javascript
// frontend/src/utils/spriteLoader.js
class SpriteLoader {
  constructor()
  loadImage(spriteId)          // 스프라이트 로드 (캐싱)
  getFrame(spriteId, frameX, frameY)  // 프레임 추출 (Image 객체 반환)
  preload(spriteIds)          // 한 번에 여러 스프라이트 로드
}
```

### 애니메이션 시스템 (AnimationSystem)

```javascript
// 캐릭터 애니메이션 상태
{
  currentAction: 'idle',      // idle, walk_down, walk_left, walk_right
  frameIndex: 0,              // 현재 프레임 (0~3)
  lastFrameTime: 0,           // 마지막 프레임 시간 (timestamp)
  frameDuration: 200          // 프레임 지속시간 (ms)
}
```

**애니메이션 업데이트 로직:**
```javascript
function updateAnimation(animationState, currentTime) {
  const { currentAction, frameIndex, lastFrameTime, frameDuration } = animationState

  if (currentTime - lastFrameTime >= frameDuration) {
    animationState.frameIndex = (frameIndex + 1) % 4  // 4 프레임 루프
    animationState.lastFrameTime = currentTime
  }
}
```

### 스프라이트 렌더링 (Canvas) - ✅ 구현 완료 (2026-02-16)

```javascript
// frontend/src/utils/spriteRenderer.js - 스프라이트 렌더러 클래스
class SpriteRenderer {
  renderFrame(ctx, spriteSheet, destX, destY, destSize, frame, flipX)
  renderCharacterSprite(ctx, spriteSheet, characterId, x, y, size, direction, timestamp, animationSpeed)
  setAnimationState(characterId, state)
  resetAnimation(characterId)
  cleanup()
}

// GameCanvas.jsx에서 캐릭터 렌더링
if (isSpritesLoaded && spriteSheets.character) {
  spriteRenderer.renderCharacterSprite(
    ctx, spriteSheets.character, char.id,
    x, y, CHARACTER_SIZE_SCALED * 1.5,
    direction, timestamp, 150
  )
} else {
  // fallback: 원형 캐릭터 렌더링
  ctx.beginPath()
  ctx.arc(x, y, CHARACTER_SIZE_SCALED / 2, 0, Math.PI * 2)
  ctx.fillStyle = color
  ctx.fill()
}

// 캐릭터 방향 계산
function calculateDirection(prevX, prevY, currX, currY) {
  const dx = currX - prevX
  const dy = currY - prevY
  if (dx === 0 && dy === 0) return 'idle'
  const absX = Math.abs(dx)
  const absY = Math.abs(dy)
  if (absY > absX) return dy > 0 ? 'walk_down' : 'walk_up'
  return dx > 0 ? 'walk_right' : 'walk_left'
}
```

**구현된 기능:**
- ✅ spriteRenderer.js: 스프라이트 프레임 렌더링, 애니메이션 지원, 방향 계산
- ✅ GameCanvas.jsx: 스프라이트 렌더링 통합, 픽셀 아트 스타일, fallback 지원
- ✅ 테스트 코드: spriteRenderer.test.js (10개 테스트 통과), GameCanvas.test.jsx (31개 테스트 통과)

---

### 2. 페르소나

| 필드 | 설명 | 예시 |
|------|------|------|
| `personality` | 성격 묘사 | 조용하지만 생각이 깊음, 책 읽기 좋아... |
| `interests` | 관심사 리스트 | ["독서", "음악", "커피", "도시 탐험"] |
| `hometown` | 고향 | 서울 북부 |
| `speaking_style` | 말투 | 정중함, 부드러운 요조 |

### 3. 행동 패턴

| 필드 | 설명 | 예시 |
|------|------|------|
| `preferred_locations` | 선호 장소 | ["공원", "카페", "도서관"] |
| `active_hours` | 활동 시간 | ["09:00-22:00"] |
| `social_style` | 사회적 성향 | 주도적/수동/혼자만 |
| `movement_speed` | 이동 속도 (초) | 30 |

### 4. 실시간 상태

| 필드 | 설명 | 범위 |
|------|------|------|
| `position` | 현재 위치 (x, y) | 0-1000 |
| `emotion` | 감정 상태 (2026-02-16 추가) | happy/sad/angry/surprised/neutral |
| `emotion_emoji` | 감정 표시 이모지 (2026-02-16 추가) | 😊/😢/😠/😲/😐 |
| `energy` | 에너지 | 0-100 |
| `last_action` | 마지막 행동 | reading/walking/talking |

### 5. 관계 정보

| 필드 | 설명 | 범위 |
|------|------|------|
| `friendship_levels` | 각 캐릭터별 호감도 | -100 ~ 100 |
| `current_conversation` | 현재 대화 ID | talk_xxx / null |

---

## 🚶 이동 시스템 (Movement System) - 2026-02-16 PM 업데이트 / 2026-02-17 키보드 입력 추가

### 캐릭터 이동 속성

| 필드 | 설명 | 예시 |
|------|------|------|
| `speed` | 이동 속도 (px/프레임) | 2.0 (기본값), 캐릭터별 차이 가능 |
| `isMoving` | 이동 중인지 여부 | true / false |
| `targetX`, `targetY` | 이동 목표 좌표 | 0 ~ mapWidth/Height |
| `isConversing` | 대화 중인지 여부 (2026-02-16 PM) | true / false - 대화 중에는 이동 불가 |

---

### ⌨️ 키보드 입력 시스템 (Keyboard Input System) - 2026-02-17 추가

**관련 GitHub Issue:** #61 [feat] Phase 3: 캐릭터 시스템 구현 - 픽셀아트 캐릭터 이동 및 렌더링

#### 입력 유틸리티 (inputHandler.js)

**위치:** `frontend/src/utils/inputHandler.js`

| 메서드 | 설명 | 반환값 |
|--------|------|--------|
| `initializeInputHandler(callbacks)` | 키보드 입력 초기화 | cleanup 함수 |
| `isKeyPressed(key)` | 키가 눌려 있는지 확인 | boolean |
| `getMovementDirection()` | 현재 이동 방향 계산 | { x, y } (정규화됨) |
| `isMoving()` | 키보드로 이동 중인지 확인 | boolean |
| `resetKeyStates()` | 모든 키 상태 초기화 | void |
| `getPressedKeys()` | 현재 눌린 키 목록 | string[] |
| `cleanupAllInputHandlers()` | 모든 입력 핸들러 정리 | void |

#### 지원하는 키 (Supported Keys)

| 키 | 설명 |
|----|------|
| `ArrowUp`, `ArrowDown`, `ArrowLeft`, `ArrowRight` | 방향키 |
| `w`, `a`, `s`, `d` | WASD (소문자) |
| `W`, `A`, `S`, `D` | WASD (대문자) |

#### 키 방향 매핑 (Key Direction Mapping)

| 키 | 방향 벡터 { x, y } |
|----|-------------------|
| `ArrowUp`, `w`, `W` | { x: 0, y: -1 } |
| `ArrowDown`, `s`, `S` | { x: 0, y: 1 } |
| `ArrowLeft`, `a`, `A` | { x: -1, y: 0 } |
| `ArrowRight`, `d`, `D` | { x: 1, y: 0 } |

#### 대각선 이동 정규화 (Diagonal Movement Normalization)

두 방향 키가 동시에 눌린 경우, 대각선 방향 벡터의 길이가 1이 되도록 정규화:

```javascript
// 대각선 이동 정규화
if (x !== 0 && y !== 0) {
  const length = Math.sqrt(x * x + y * y)
  x = x / length
  y = y / length
}
```

**결과:** 모든 방향에서 동일한 속도로 이동

#### 충돌 처리 (Collision Handling)

키보드 기반 이동 시 다음 충돌 감지/회피 적용:

1. **맵 경계 체크** (`checkMapBounds`)
   - 맵 영역 밖으로 이동 방지
   - `clampedX`, `clampedY`로 경계 내 위치 계산

2. **건물 충돌 체크** (`checkBuildingCollision`)
   - 건물 영역 내로 이동 방지
   - 충돌 시 이동 무시

3. **캐릭터 충돌 체크** (`checkCollision`)
   - 다른 캐릭터와 겹침 방지
   - 최소 거리 유지

#### GameCanvas 통합 (GameCanvas Integration)

**Props:**
```javascript
{
  onMove: (character) => void  // 캐릭터 이동 시 콜백
}
```

**구현:**

```javascript
// 1. 키보드 입력 초기화
useEffect(() => {
  const cleanup = initializeInputHandler({
    onKeyDown: (key) => {
      const direction = getMovementDirection()
      setKeyboardMovement({ x: direction.x, y: direction.y })
    },
    onKeyUp: (key) => {
      const direction = getMovementDirection()
      setKeyboardMovement({ x: direction.x, y: direction.y })
    }
  })

  inputCleanupRef.current = cleanup

  return () => {
    if (inputCleanupRef.current) {
      inputCleanupRef.current()
    }
  }
}, [])

// 2. updateCharacterAnimation에서 키보드 이동 처리
if (keyboardMovement.x !== 0 || keyboardMovement.y !== 0) {
  const speed = getCharacterSpeed(myCharacter)
  const moveDistance = speed * deltaTime

  // 새로운 위치 계산
  const newX = myPrevX + keyboardMovement.x * moveDistance
  const newY = myPrevY + keyboardMovement.y * moveDistance

  // 맵 경계 체크
  const bounds = checkMapBounds(newX, newY)
  const clampedX = bounds.clampedX
  const clampedY = bounds.clampedY

  // 건물 충돌 체크
  const buildingCollision = checkBuildingCollision(clampedX, clampedY, buildings)

  // 충돌이 없으면 이동
  if (!buildingCollision) {
    updated[myCharacter.id].x = clampedX
    updated[myCharacter.id].y = clampedY

    // 서버에 새 위치 전송
    if (onMove) {
      onMove({
        id: myCharacter.id,
        x: clampedX,
        y: clampedY
      })
    }
  }
}
```

#### App.jsx 통합 (App.jsx Integration)

**handleMove 함수:**
```javascript
const handleMove = (character) => {
  setMyCharacter(prev => ({ ...prev, x: character.x, y: character.y }))
  socket.emit('move', character)
}
```

**GameCanvas prop:**
```javascript
<GameCanvas
  onMove={handleMove}
  // ... other props
/>
```

#### 테스트 커버리지 (Test Coverage)

| 파일 | 테스트 개수 | 상태 |
|------|-------------|------|
| `frontend/src/utils/__tests__/inputHandler.test.js` | 24 | ✅ 100% 통과 |

**테스트 항목:**
- `initializeInputHandler` (3): 초기화, 콜백 호출, 지원하지 않는 키 무시
- `isKeyPressed` (3): 기본 상태, 키 다운 후 true, 키 업 후 false
- `getMovementDirection` (8): 기본, 상하좌우, WASD, 대각선 정규화, 충돌 키 처리
- `isMoving` (2): 기본 false, 키 입력 후 true
- `resetKeyStates` (1): 모든 키 리셋
- `getPressedKeys` (2): 기본 빈 배열, 눌린 키 목록
- `cleanupAllInputHandlers` (1): 모든 핸들러 정리

#### 향후 개선 (Future Improvements)

1. **터치 컨트롤** - 모바일용 가상 조이스틱
2. **컨트롤러 지원** - 게임패드 연동
3. **키 커스터마이징** - 사용자 별 키 설정
4. **더블 클릭 이동** - 빠른 이동 단축키
5. **이동 경로 표시** - 클릭/키보드 이동 경로 시각화

### 이동 시스템 기능

#### 1. 랜덤 이동 로직 개선 (2026-02-16 PM)

```javascript
// GameCanvas.jsx
function getRandomMovePosition(character, mapWidth, mapHeight, tileSize) {
  // 맵 밖으로 이동 방지
  const maxX = mapWidth - tileSize
  const maxY = mapHeight - tileSize

  return {
    x: Math.random() * maxX,
    y: Math.random() * maxY
  }
}
```

**특징:**
- 맵 경계 고려 (맵 밖으로 이동 방지)
- 지형/벽 고려 (향후 구현 예정)

#### 2. 충돌 감지/회피 시스템 (2026-02-16 PM)

```javascript
// GameCanvas.jsx
function checkCollision(char1, char2, minDistance = 40) {
  const dx = char1.x - char2.x
  const dy = char1.y - char2.y
  const distance = Math.sqrt(dx * dx + dy * dy)

  return distance < minDistance
}

function avoidCollision(character, otherCharacters, minDistance = 40) {
  for (const other of otherCharacters) {
    if (character.id === other.id) continue

    if (checkCollision(character, other, minDistance)) {
      // 충돌 회피: 반대 방향으로 이동
      const dx = character.x - other.x
      const dy = character.y - other.y
      const dist = Math.sqrt(dx * dx + dy * dy)

      const avoidX = character.x + (dx / dist) * minDistance
      const avoidY = character.y + (dy / dist) * minDistance

      return { x: avoidX, y: avoidY }
    }
  }

  return null  // 충돌 없음
}
```

**특징:**
- 캐릭터끼리 겹침 방지
- 충돌 시 자동 회피 (반대 방향으로 이동)
- 최소 거리 설정 (40px 기본값)

#### 3. 대화 상태 이동 제한 (2026-02-16 PM)

```javascript
// GameCanvas.jsx - 캐릭터 이동 처리
if (character.isConversing) {
  return  // 대화 중에는 이동 불가
}
```

**특징:**
- `isConversing = true` 일 때 이동 차단
- 대화 시작 시 이동 정지
- 대화 종료 시 이동 재개

#### 4. 캐릭터별 이동 속도 차이 (2026-02-16 PM)

```javascript
// 캐릭터 생성 시
{
  character_id: 'char_abc123',
  speed: 2.0,  // 기본값, 캐릭터별 차이 가능
  // ...
}

// GameCanvas.jsx - 이동 업데이트
function updateCharacterPosition(character, targetX, targetY) {
  const speed = character.speed || 2.0

  const dx = targetX - character.x
  const dy = targetY - character.y
  const dist = Math.sqrt(dx * dx + dy * dy)

  if (dist < speed) {
    character.x = targetX
    character.y = targetY
  } else {
    character.x += (dx / dist) * speed
    character.y += (dy / dist) * speed
  }
}
```

**특징:**
- 각 캐릭터마다 다른 속도 설정 가능
- 기본값: 2.0 px/프레임
- 빠른 캐릭터 (3.0), 느린 캐릭터 (1.0) 등

#### 5. 이동 애니메이션 (부드러운 전환) (2026-02-16 PM)

```javascript
// GameCanvas.jsx - requestAnimationFrame 기반 애니메이션
function animate() {
  // 모든 캐릭터 위치 업데이트
  for (const character of characters) {
    if (character.targetX !== undefined && character.targetY !== undefined) {
      updateCharacterPosition(character, character.targetX, character.targetY)
    }
  }

  // 캔버스 재렌더링
  render()

  requestAnimationFrame(animate)
}

// 애니메이션 시작
requestAnimationFrame(animate)
```

**특징:**
- `requestAnimationFrame` 사용 (부드러운 60fps)
- 프레임 기반 위치 업데이트
- 부드러운 이동 효과

### AI 에이전트 이동 이벤트 처리 (2026-02-16 PM)

```javascript
// ai-agent/agent.js
socket.on('characterMove', (data) => {
  const { characterId, targetX, targetY } = data
  updateCharacterPosition(characterId, targetX, targetY)
})

// agent.js - 대화 상태 관리
function getConversingState() {
  return isConversing
}

function setConversingState(state) {
  isConversing = state
}
```

**특징:**
- 소켓 이벤트로 이동 명령 수신
- 대화 상태 관리 함수
- 백엔드와 프론트엔드 동기화

---

## 호감도 시스템 (Affinity System)

### 호감도 변화 규칙

| 상황 | 호감도 변화 |
|------|-------------|
| 성공적인 대화 (긍정적 응답) | +5 ~ +10 |
| 함께 시간 보냄 (이동/대화 지속) | +2 ~ +5 |
| 선택지에서 좋은 선택 | +3 ~ +8 |
| 싫어하는 주제 언급 | -10 ~ -20 |
| 무례한 대사 | -15 ~ -30 |
| 선물/좋아하는 것 공유 | +10 ~ +25 |

### 호감도 수준

| 범위 | 의미 | 관계 |
|------|------|------|
| -100 ~ -50 | 증오 | 💢 적대 |
| -50 ~ -10 | 불편 | 😠 싫음 |
| -10 ~ 10 | 무관 | 😐 보통 |
| 10 ~ 40 | 관심 있음 | 👍 친구 |
| 40 ~ 80 | 호감 | 💖 좋아함 |
| 80 ~ 100 | 연인 | ❤️ 사랑 |

---

## 🎭 감정 표현 시스템 (Emotion System) - 2026-02-16 업데이트

### 픽셀아트 감정 스프라이트 (16 감정)

**스프라이트 시트:** `assets/sprites/emojis.png` (16x16 픽셀, 16 프레임)

| 감정 | 이모지 | 설명 | 키워드 예시 (한국어) |
|------|--------|------|---------------------|
| `happy` | 😊 | 기쁨, 즐거움 | 행복, 기뻐, 좋아, 즐거워, 대박, 최고 |
| `sad` | 😢 | 슬픔, 우울 | 슬퍼, 미안, 서운, 우울, 외로워, 아파 |
| `angry` | 😠 | 화남, 짜증 | 화나, 싫어, 짜증, 바보, 믿을 수 없어 |
| `surprised` | 😲 | 놀라움, 놀람 | 와우, 정말, 놀라워, 대단, 신기, 헐 |
| `neutral` | 😐 | 보통, 중립 (기본값) | - |
| `love` | 😍 | 사랑, 호감 | 사랑, 좋아해, 사랑해, 사랑스러워 |
| `hate` | 😤 | 혐오, 싫음 | 혐오, 정말 싫어, 역겨워, 징그러워 |
| `fear` | 😨 | 두려움, 공포 | 무서워, 아애, 두려워, 떨려, 겁났어 |
| `excited` | 🤩 | 흥분, 열광 | 신난다, 대박, 완전 좋아, 엄청 기대 |
| `tired` | 😴 | 피로, 지침 | 피곤해, 지쳤어, 잠와, 힘들어, 죽겠어 |
| `confused` | 😕 | 혼란, 의문 | 뭐야, 이해 안 돼, 헷갈려, 모르겠어 |
| `proud` | 😎 | 자랑, 자부심 | 자랑스러워, 나이스, 대단해, 멋져 |
| `shy` | 😳 | 수줍음, 부끄러움 | 부끄러워, 쑥스러워, 창피해 |
| `embarrassed` | 😅 | 민망, 당황 | 아, 죄송, 깜짝이야, 에이 |
| `curious` | 🤔 | 궁금, 호기심 | 궁금해, 관심 있어, 알고 싶어 |
| `disgusted` | 🤢 | 역겨움, 싫음 | 역겨워, 끔찍해, 못 봐, 더 지겨워 |

**감정 분석 자동화 (Emotion Analysis):**

| 키워드 타입 | 영어 키워드 예시 | 한국어 키워드 예시 |
|-------------|------------------|-------------------|
| happy | happy, joy, excited, thank, love, great, good | 행복, 기뻐, 좋아, 사랑, 대박, 최고, 감사, 축하, 야호 |
| sad | sad, sorry, miss, disappointed, bad, hurt | 슬퍼, 미안, 그리워, 서운, 안타까워, 우울, 외로워, 아파, 울어 |
| angry | angry, hate, stupid, annoying, frustrated | 화나, 싫어, 바보, 짜증, 불공평, 믿을 수 없어, 화내, 미쳤어 |
| surprised | wow, really, incredible, surprise, shocking | 와우, 정말, 놀라워, 대단, 신기, 오마이갓, 헐, 진짜 |
| love | love, adore, cherish, heart | 사랑, 사랑해, 좋아해, 사랑스러워, 사랑받고 싶어 |
| hate | hate, disgust, despise, loathe | 싫어, 혐오, 역겨워, 징그러워, 못 봐 |
| fear | fear, scared, afraid, terror | 무서워, 아애, 두려워, 공포, 떨려, 겁났어 |
| excited | excited, thrilled, pumped | 신난, 흥분, 엄청 기대, 완전 좋아 |
| tired | tired, exhausted, sleepy | 피곤, 지쳤, 잠와, 힘들, 죽겠어, 꼬장 |
| confused | confused, puzzled, lost | 혼란, 뭐야, 이해 안 돼, 헷갈려, 모르겠어 |
| proud | proud, awesome, impressive | 자랑스러워, 나이스, 대단해, 멋져, 수작 |
| shy | shy, embarrassed, blush | 수줍, 부끄러워, 쑥스러워, 창피해, 얼굴 빨개 |
| embarrassed | embarrassed, awkward, sorry | 민망, 당황, 아 죄송, 깜짝이야, 에이 |
| curious | curious, interested, wondering | 궁금, 관심 있어, 알고 싶어, 어떻게 될까 |
| disgusted | disgusted, gross, awful | 역겨워, 끔찍, 못 봐, 더 지겨워, 끔찍해 |

**감정 스코어 기반 결정:**
- 각 키워드에 +1 점
- 최종적으로 스코어가 가장 높은 감정 선택
- 키워드 없으면 `neutral` 기본값

#### 감정 이력 추적 (Emotion History)

```javascript
{
  from: "neutral",      // 이전 감정
  to: "happy",          // 현재 감정
  timestamp: 1739700000000,
  reason: "Analyzed from message: \"정말 행복해요!...\""
}
```

**기능:**
- 감정 변화 이력 자동 기록
- 최근 N개 이력 조회 가능
- 변화 사유 기록

#### EmotionManager API

| 메서드 | 설명 | 반환값 |
|--------|------|--------|
| `constructor(emotion)` | EmotionManager 생성 (기본값: neutral) | EmotionManager 인스턴스 |
| `setEmotion(emotion, reason)` | 감정 설정 | 현재 감정 |
| `analyzeEmotion(message)` | 메시지 분석으로 감정 자동 설정 | { emotion, scores, emoji } |
| `getEmotion()` | 현재 감정 정보 반환 | { type, emoji, lastChangeTime } |
| `getHistory(limit)` | 감정 이력 반환 | 감정 이력 배열 |
| `reset()` | 감정 초기화 (neutral) | void |
| `static getEmotionTypes()` | 감정 타입 리스트 반환 | ['happy', 'sad', 'angry', 'surprised', 'neutral'] |
| `static getEmotionEmojis()` | 감정 이모지 맵 반환 | { happy: '😊', ... } |

---

## 🎭 감정 시스템 & FX 시스템 (EmotionSystem & FXSystem) - 2026-02-17 업데이트

### EmotionSystem 클래스

감정 표현 시스템 관리 및 애니메이션 제어

#### 상수 (Constants)

| 상수 | 설명 | 값 예시 |
|------|------|---------|
| `EMOTION_TYPES` | 16개 감정 타입 | { HAPPY: 'happy', SAD: 'sad', ... } |
| `EMOTION_EMOJIS` | 감정별 이모지 | { happy: '😊', sad: '😢', ... } |
| `EMOTION_COLORS` | 감정별 색상 | { happy: '#FFD93D', sad: '#6C7EB0', ... } |
| `EMOTION_DURATION` | 감정별 지속 시간 (ms) | { happy: 3000, sad: 4000, ... } |

#### 메서드 (Methods)

| 메서드 | 설명 | 반환값 |
|--------|------|--------|
| `constructor()` | EmotionSystem 인스턴스 초기화 | EmotionSystem |
| `setEmotion(characterId, emotionType)` | 캐릭터 감정 설정 | { type, emoji, color, startTime, duration } |
| `getEmotion(characterId)` | 캐릭터 감정 가져오기 | Emotion 객체 또는 null |
| `clearEmotion(characterId)` | 캐릭터 감정 클리어 | void |
| `clearAll()` | 모든 감정 클리어 | void |
| `getAnimationProgress(characterId)` | 애니메이션 진행도 계산 (0~1) | number |
| `getBounceOffset(characterId)` | 바운스 애니메이션 오프셋 | { x, y } |
| `isValidEmotion(emotionType)` | 감정 유효성 검사 | boolean |
| `setAutoEmotionByAffinity(characterId, affinity)` | 호감도에 따른 자동 감정 설정 | Emotion 객체 |

#### 애니메이션 효과 (Animation Effects)

| 효과 | 설명 | 적용 대상 |
|------|------|----------|
| Pop-in | 감정 나타날 때 확대 효과 | 모든 감정 |
| Fade-out | 감정 사라질 때 페이드 아웃 | 마지막 20% 시간 |
| Bounce | 수직 바운스 애니메이션 (500ms) | 감정 설정 직후 |

#### 호감도 기반 자동 감정 (Affinity-Based Emotion)

| 호감도 범위 | 감정 | 설명 |
|------------|------|------|
| 80~100  | `love` | ❤️ 강한 긍정 |
| 60~79   | `happy` | 😊 긍정 |
| 40~59   | `neutral` | 😐 중립 |
| 20~39   | `confused` | 😕 혼란 |
| 0~19    | `sad` | 😢 부정 |

#### 사용 예시 (Example Usage)

```javascript
import { EmotionSystem, EMOTION_TYPES } from './emotionSystem'

const emotionSystem = new EmotionSystem()

// 감정 설정
emotionSystem.setEmotion('char1', EMOTION_TYPES.HAPPY)

// 감정 가져오기
const emotion = emotionSystem.getEmotion('char1')
console.log(emotion.type)     // 'happy'
console.log(emotion.emoji)    // '😊'
console.log(emotion.color)    // '#FFD93D'

// 호감도에 따른 자동 감정 설정
emotionSystem.setAutoEmotionByAffinity('char2', 85)  // love

// 애니메이션 오프셋 계산
const offset = emotionSystem.getBounceOffset('char1')
console.log(offset.x, offset.y)  // 캐릭터 위에 표시할 위치
```

---

### FXSystem 클래스

시각 효과 (VFX) 관리 시스템

#### FX 타입 (FX Types)

| 타입 | 설명 | 사용 사례 |
|------|------|----------|
| `jump_dust` | 점프 먼지 | 캐릭터 이동 시 |
| `heart_rise` | 하트 상승 | 호감도 상승 |
| `affinity_up` | 호감도 상승 효과 | 호감도 +1 이상 |
| `affinity_down` | 호감도 하락 효과 | 호감도 -1 이하 |
| `loading` | 로딩 효과 | 데이터 로드 중 |
| `click_ripple` | 클릭 리플 | 캔버스 클릭 시 |
| `particle_burst` | 파티클 버스트 | 특수 이벤트 |

#### 메서드 (Methods)

| 메서드 | 설명 | 반환값 |
|--------|------|--------|
| `constructor()` | FXSystem 인스턴스 초기화 | FXSystem |
| `addEffect(type, x, y, options)` | FX 효과 추가 | FXEffect |
| `addJumpDust(x, y)` | 점프 먼지 효과 추가 (5개 파티클) | void |
| `addHeartRise(x, y)` | 하트 상승 효과 추가 | void |
| `addAffinityUp(x, y)` | 호감도 상승 효과 추가 (3개 하트) | void |
| `addAffinityDown(x, y)` | 호감도 하락 효과 추가 | void |
| `addClickRipple(x, y, color)` | 클릭 리플 효과 추가 (3개 리플) | void |
| `update()` | 모든 FX 업데이트 | void |
| `clearAll()` | 모든 FX 클리어 | void |
| `getRenderEffects()` | 렌더링 FX 목록 반환 | RenderEffect[] |
| `getCount()` | FX 개수 반환 | number |

#### FXEffect 클래스

시각 효과 객체

| 필드 | 설명 | 기본값 |
|------|------|--------|
| `id` | 고유 ID | 자동 생성 |
| `type` | FX 타입 | - |
| `x` | X 좌표 | - |
| `y` | Y 좌표 | - |
| `startTime` | 시작 시간 | Date.now() |
| `duration` | 지속 시간 (ms) | 500 |
| `size` | 크기 | 16 |
| `color` | 색상 | '#FFFFFF' |
| `direction` | 이동 방향 | 'up' |
| `speed` | 이동 속도 | 2 |
| `opacity` | 투명도 (0~1) | 1 |
| `scale` | 스케일 | 1 |

#### 이동 방향 (Directions)

| 방향 | 설명 |
|------|------|
| `up` | 위로 이동 |
| `down` | 아래로 이동 |
| `left` | 왼쪽으로 이동 |
| `right` | 오른쪽으로 이동 |
| `none` | 이동 없음 |

#### 사용 예시 (Example Usage)

```javascript
import { FXSystem, FX_TYPES } from './emotionSystem'

const fxSystem = new FXSystem()

// 점프 먼지 효과 추가
fxSystem.addJumpDust(100, 200)

// 호감도 상승 효과 추가
fxSystem.addAffinityUp(150, 250)

// 클릭 리플 효과 추가
fxSystem.addClickRipple(300, 400, '#00FF00')

// 업데이트 및 렌더링
fxSystem.update()
const renderEffects = fxSystem.getRenderEffects()
renderEffects.forEach(fx => {
  // 캔버스에 FX 렌더링
  ctx.save()
  ctx.globalAlpha = fx.opacity
  ctx.translate(fx.x, fx.y)
  ctx.scale(fx.scale, fx.scale)
  // FX 렌더링 코드
  ctx.restore()
})

// 모든 FX 클리어
fxSystem.clearAll()
```

---

### GameCanvas 통합 (GameCanvas Integration)

#### Ref 구조

```javascript
const emotionSystemRef = useRef(new EmotionSystem())
const fxSystemRef = useRef(new FXSystem())
```

#### 감정 렌더링 (Emotion Rendering)

```javascript
// GameCanvas.jsx
const emotion = emotionSystemRef.current.getEmotion(characterId)
if (emotion) {
  const bounceOffset = emotionSystemRef.current.getBounceOffset(characterId)
  const emotionOpacity = emotionSystemRef.current.getAnimationProgress(characterId)
  
  ctx.globalAlpha = emotionOpacity
  const emotionX = x + bounceOffset.x
  const emotionY = y - CHARACTER_SIZE_SCALED / 2 + bounceOffset.y
  renderEmotionEmoji(ctx, emotionType, emotionX, emotionY, scale, performance.now())
  ctx.globalAlpha = 1
}
```

#### FX 렌더링 (FX Rendering)

```javascript
// GameCanvas.jsx - FX 업데이트
fxSystemRef.current.update()
const fxEffects = fxSystemRef.current.getRenderEffects()

// GameCanvas.jsx - FX 렌더링
fxEffects.forEach(fx => {
  const fxX = fx.x * scale
  const fxY = fx.y * scale
  ctx.save()
  ctx.globalAlpha = fx.opacity
  ctx.translate(fxX, fxY)
  ctx.scale(fx.scale, fx.scale)
  // FX 타입별 렌더링 코드
  ctx.restore()
})
```

#### 이벤트 연결 (Event Connection)

| 이벤트 | 감정 시스템 | FX 시스템 |
|--------|------------|-----------|
| 캐릭터 클릭 | - | `addClickRipple()` |
| 호감도 ↑ | `setAutoEmotionByAffinity()` | `addAffinityUp()` |
| 호감도 ↓ | `setAutoEmotionByAffinity()` | `addAffinityDown()` |
| 캐릭터 이동 | - | `addJumpDust()` |

---

### 테스트 커버리지 (Test Coverage)

| 항목 | 테스트 클래스 | 개수 | 상태 |
|------|--------------|------|------|
| 상수 | emotionSystem.test.js | 6 | ✅ 통과 |
| getAutoEmotionAffinity | emotionSystem.test.js | 5 | ✅ 통과 |
| EmotionSystem 클래스 | emotionSystem.test.js | 10 | ✅ 통과 |
| FX 시스템 상수 | emotionSystem.test.js | 1 | ✅ 통과 |
| FXEffect 클래스 | emotionSystem.test.js | 3 | ✅ 통과 |
| FXSystem 클래스 | emotionSystem.test.js | 11 | ✅ 통과 |
| 통합 테스트 | emotionSystem.test.js | 2 | ✅ 통과 |
| **총계** | **emotionSystem.test.js** | **38** | **✅ 100% 통과** |

### 관련 파일

| 파일 | 설명 |
|------|------|
| `frontend/src/utils/emotionSystem.js` | 감정 시스템 & FX 시스템 (8885 bytes) |
| `frontend/src/utils/__tests__/emotionSystem.test.js` | 테스트 파일 (11014 bytes) |
| `frontend/src/components/GameCanvas.jsx` | GameCanvas 통합 |
| `frontend/src/App.jsx` | 이벤트 연결 (클릭 리플, 점프 dust) |
| `spec/06-character-system.md` | 문서 (이 섹션) |

### 향후 개선 (Future Improvements)

1. **감정 전환 애니메이션** - 감정 변경 시 페이드 인/아웃
2. **FX 스프라이트 시트** - 이미지 기반 FX (현재 원형/이모지)
3. **감정 조합** - 여러 감정 동시 표시
4. **SFX 연동** - 감정/FX에 효과음 추가
5. **파티클 시스템** - 더 복잡한 파티클 효과

---

## 기분/감정 시스템 (Mood System)

### 감정 상태 기존 모델 (Legacy)

| 감정 | 발생 조건 | AI 에이전트 행동 |
|------|----------|------------------|
| happy | 호감도 ↑ / 좋은 대화 | 밝은 톤, 활동적 |
| sad | 싫어하는 것 언급 / 거절 | 조용함, 혼자 있음 |
| angry | 무례한 대사 / 거부 | 직설적, 공격적 |
| neutral | 특별한 이벤트 없음 | 평범 |
| tired | 에너지 < 30 | 느림, 쉼 |
| excited | 새로운 만남 / 기쁜 소식 | 활동적, 많이 말함 |

> **참고:** 2026-02-16부터 감정 시스템이 `EmotionManager`로 통합되었습니다. 기존 `mood` 필드는 `emotion` 필드로 대체되었습니다.

### 에너지 (Energy)

- **회복:** 쉬거나 좋은 대화 시 +1 ~ +3/분
- **감소:** 이동/대화 시 -1 ~ -2/분
- **에너지 < 30:** 쉬려고 함 (wait action 우선)

---

## UI 렌더링 - 감정 이모지 표시

### Character.jsx 감정 표시 (2026-02-16 구현)

```jsx
{isAi && emotion && emotion.emoji && (
  <g transform={`translate(${x - 10}, ${y - 50})`}>
    <circle r="15" fill="rgba(0,0,0,0.7)" />
    <text x="0" y="5" textAnchor="middle" fontSize="20">
      {emotion.emoji}
    </text>
  </g>
)}
```

**설명:**
- AI 캐릭터만 감정 이모지 표시
- 캐릭터 위쪽 (-50px offset)에 표시
- 검정반원 배경에 이모지 렌더링

---

## 캐릭터 간 관계도 시각화

### 맵에서 표시

```
[유리] ━━━━━ (💖) ━━━━━ [민수]
         호감도 72

[하늘] ━━━━━ (💢) ━━━━━ [준우]
         호감도 -15
```

### 관계 그래프

가상의 그래프 노드로 관계를 시각화:
- 노드: 캐릭터
- 에지: 관계 (색상 = 호감도 수준)

---

## AI 에이전트 행동 결정 로직

### LLM 프롬프트 예시

```
당신은 {이름}입니다. 페르소나와 상황을 고려하여 행동을 결정하세요.

[페르소나]
- 성격: {personality}
- 관심사: {interests}
- 말투: {speaking_style}

[현재 상황]
- 위치: {location_name}
- 시간: {time}
- 날씨: {weather}
- 근처 캐릭터: {nearby_characters}
- 에너지: {energy}
- 감정: {emotion} (2026-02-16)

[관심 있는 캐릭터]
- {nearby_character}: 호감도 {friendship_level}

[결정할 행동]
다음 중 하나를 선택해주세요:
1. move: 이동 (target: 위치)
2. talk: 대화 시작 (target: 캐릭터 ID, opening_message: 대사)
3. wait: 대기 (duration_seconds: 시간)

JSON 형식으로 응답해주세요:
{
  "action": "move" | "talk" | "wait",
  "target": { ... },
  "reason": "이유"
}
```

---

*마지막 업데이트: 2026-02-17 (커스터마이징 시스템 추가)*
## 감정 표현 & FX 시스템 (Phase 4, 2026-02-17)

### 감정 이모지 (emojiSprite.js)
- 16종: happy, sad, angry, surprised, neutral, love, hate, fear, excited, tired, confused, proud, shy, embarrassed, curious, disgusted
- 호감도 → 감정 자동 매핑 (80+:love, 60+:happy, 40+:excited, 20+:neutral, 0+:confused, -20+:sad, else:angry)
- Canvas 렌더링 (bounce 애니메이션, pop-in 변화 효과)

### FX 시스템 (effects.js)
- 6종: dust, heart, anger, ripple, sparkle, loading
- 파티클 기반 렌더링, 자동 수명 관리
- 호감도 변화 연동 (positive→heart, negative→anger)

---

## 🎨 캐릭터 커스터마이징 시스템 (Character Customization System) - 2026-02-17

### 캐스터마이징 데이터 구조

```javascript
{
  hairStyle: 'short',      // 머리 스타일: short/medium/long/bald
  clothingColor: 'blue',   // 옷 색상: 10개 색상 팔레트
  accessory: 'none'        // 액세서리: none/glasses/hat/bow_tie/headphones/crown
}
```

### 커스터마이징 옵션

#### 머리 스타일 (HAIR_STYLES)
- `short`: 짧은 머리 (👨)
- `medium`: 중간 길이 (👩)
- `long`: 긴 머리 (👱‍♀️)
- `bald`: 대머리 (🧑‍🦲)

#### 옷 색상 (CLOTHING_COLORS) - 10가지 색상 팔레트
| ID | 이름 | 색상 | Hex |
|----|------|------|-----|
| blue | 파랑 | 파랑 | #2196F3 |
| red | 빨강 | 빨강 | #F44336 |
| green | 초록 | 초록 | #4CAF50 |
| yellow | 노랑 | 노랑 | #FFEB3B |
| purple | 보라 | 보라 | #9C27B0 |
| pink | 분홍 | 분홍 | #E91E63 |
| orange | 주황 | 주황 | #FF9800 |
| cyan | 청록 | 청록 | #00BCD4 |
| brown | 갈색 | 갈색 | #795548 |
| gray | 회색 | 회색 | #9E9E9E |

#### 액세서리 (ACCESSORIES) - 6가지
| ID | 이름 | 설명 | 이모지 |
|----|------|------|--------|
| none | 없음 | 액세서리 착용하지 않음 | |
| glasses | 안경 | 지적인 느낌의 안경 | 👓 |
| hat | 모자 | 캡 스타일 모자 | 🧢 |
| bow_tie | 넥타이 | 우아한 넥타이 | 🎀 |
| headphones | 헤드폰 | 음악 애호가의 헤드폰 | 🎧 |
| crown | 왕관 | 평범하지 않은 스타일 | 👑 |

### 커스터마이징 유틸리티 (characterCustomization.js)

#### API 메서드
| 메서드 | 설명 | 반환값 |
|--------|------|--------|
| `getCustomization()` | localStorage에서 설정 가져오기 | 커스터마이징 객체 |
| `saveCustomization(customization)` | localStorage에 설정 저장 | void |
| `resetCustomization()` | 설정 리셋 | void |
| `updateCustomization(customization, category, optionId)` | 옵션 업데이트 | 업데이트된 커스터마이징 |
| `getOptionName(category, optionId)` | 옵션 이름 가져오기 | string |
| `getOptionDescription(category, optionId)` | 옵션 설명 가져오기 | string |
| `getOptionEmoji(category, optionId)` | 옵션 이모지 가져오기 | string |
| `getColorHex(optionId)` | 옷 색상 hex 가져오기 | string |
| `getAllOptions()` | 모든 옵션 목록 가져오기 | object |
| `getCategories()` | 카테고리 목록 가져오기 | array |
| `getEmojiCombination(customization)` | 이모지 조합 생성 | string |

#### 사용 예시
```javascript
import { getCustomization, updateCustomization } from './utils/characterCustomization'

// 설정 가져오기
const customization = getCustomization()  // { hairStyle: 'short', clothingColor: 'blue', accessory: 'none' }

// 머리 스타일 변경
const updated = updateCustomization(customization, 'hairStyles', 'long')  // { hairStyle: 'long', ... }

// 옷 색상 변경
const updated = updateCustomization(customization, 'clothingColors', 'red')  // { clothingColor: 'red', ... }

// 액세서리 변경
const updated = updateCustomization(customization, 'accessories', 'glasses')  // { accessory: 'glasses', ... }

// 이모지 조합 가져오기
const emoji = getEmojiCombination(customization)  // "👱‍♀️👓"
```

### CharacterCustomizationModal 컴포넌트 ✅ 완료 (2026-02-17)

**위치:** `frontend/src/components/CharacterCustomizationModal.jsx`

**Props:**
```javascript
{
  show: boolean,              // 표시 여부
  onClose: () => void,        // 닫기 핸들러
  onSave: (customization) => void  // 저장 핸들러
}
```

**기능:**
- localStorage에서 저장된 커스터마이징 설정 로드
- 캐릭터 프리뷰 (머리 + 옷 + 액세서리 조합으로 실시간 표시)
- 카테고리 탭: [머리 스타일] [옷 색상] [액세서리]
- 옵션 선택 UI (이모지 + 이름 버튼, 색상 프리뷰)
- "저장" / "취소" 픽셀 버튼
- 저장 시 localStorage에 저장 + App.jsx로 콜백

**스타일:**
- pixel-theme.css 기반 픽셀 아트
- 최대 크기: 600px × 80vh
- 프리뷰 영역: 24px 패딩, 어두운 배경
- 옵션 그리드: 100px min-width, 8px gap
- 마우스 오버 효과: translate(-2px, -2px) + shadow

**구현 상태:**
- ✅ Modal UI 완성 (프리뷰, 탭, 버튼)
- ✅ localStorage 연동
- ✅ App.jsx 통합 (커스터마이징 버튼 + 저장 핸들러)

### GameCanvas에 커스터마이징 적용 ✅ 완료 (2026-02-17)

**수정 사항:**
- `characterCustomization` prop를 받아서 myCharacter에만 적용
- `clothingColor`에 따른 캐릭터 색상 동적 적용 (`getColorHex` 사용)
- `accessory` 이모지를 캐릭터 위에 오버레이로 표시
- `hairStyle`에 따른 머리 이모지 변경 (`getOptionEmoji` 사용)

```javascript
// GameCanvas.jsx - 커스터마이징 적용 로직
const isMyCharacter = char.id === myCharacter.id
const customization = isMyCharacter ? characterCustomization : null

// 커스터마이징 정보 적용
const accessoryEmoji = customization && customization.accessory !== 'none'
  ? getOptionEmoji(CUSTOMIZATION_CATEGORIES.ACCESSORIES, customization.accessory)
  : null
const characterCustomColor = customization
  ? getColorHex(customization.clothingColor || 'blue')
  : null
const finalCharColor = characterCustomColor || color
const finalEmoji = customization
  ? getOptionEmoji(CUSTOMIZATION_CATEGORIES.HAIR_STYLES, customization.hairStyle) || emoji
  : emoji

// 액세서리 렌더링
if (accessoryEmoji) {
  ctx.fillText(accessoryEmoji, x + CHARACTER_SIZE_SCALED / 3, y - CHARACTER_SIZE_SCALED / 3)
}
```

**상태 관리:**
- App.jsx에서 `characterCustomization` 상태 관리
- 저장 시 `myCharacter`의 `color`와 `emoji` 업데이트
- 소켓으로 캐릭터 업데이트 전송

### localStorage 관리

**Storage Key:** `character-customization`

**데이터 구조:**
```json
{
  "hairStyle": "short",
  "clothingColor": "blue",
  "accessory": "none"
}
```

### 파일 위치
- `frontend/src/data/customizationOptions.js` - 옵션 데이터 ✅ (2730 bytes)
- `frontend/src/utils/characterCustomization.js` - 유틸리티 ✅ (4339 bytes)
- `frontend/src/utils/__tests__/characterCustomization.test.js` - 유틸리티 테스트 ✅ (7296 bytes, 29개 테스트 통과)
- `frontend/src/components/CharacterCustomizationModal.jsx` - 모달 컴포넌트 ✅ (7000+ bytes)
- `frontend/src/components/__tests__/CharacterCustomizationModal.test.jsx` - 모달 테스트 ✅ (기본 1개 테스트)
- `frontend/src/components/__tests__/GameCanvas.test.jsx` - GameCanvas 테스트 ✅ (8000+ bytes, 19개 테스트 통과)
- `frontend/src/App.jsx` - 통합 ✅ (characterCustomization 상태 + 핸들러)

### GitHub Issue
- **#52:** [feat] 캐릭터 커스터마이징 시스템 - ✅ 완료 (데이터 구조 + 유틸리티)
- **#54:** [feat] 캐릭터 커스터마이징 UI Modal 완성 - ✅ 완료 (2026-02-17)
- **#55:** [feat] GameCanvas에 커스터마이징 적용 - ✅ 완료 (2026-02-17)

### 테스트 결과
- characterCustomization 테스트: 29개 ✅
- GameCanvas 커스터마이징 기능 테스트: 19개 ✅
- 총: 48개 테스트 전부 통과

---

## 🎬 캐릭터 스프라이트 애니메이션 시스템 Phase 3 - 2026-02-18

### GitHub Issue
- **#66:** [feat] 캐릭터 스프라이트 애니메이션 시스템 - Phase 3 ✅ 완료 (2026-02-18)

### 구현된 컴포넌트

#### 1. AnimationController.js
**위치:** `frontend/src/utils/AnimationController.js`

**기능:**
- 애니메이션 상태 전환 (idle, walk)
- 방향 관리 (up, down, left, right)
- 프레임 계산 및 업데이트 (4프레임 루프)
- 이동 상태 자동 관리 (isMoving → state 전환)

**API 메서드:**
| 메서드 | 설명 | 반환값 |
|--------|------|--------|
| `constructor(characterId)` | AnimationController 생성 | AnimationController |
| `setState(state)` | 애니메이션 상태 설정 | void |
| `setDirection(direction)` | 이동 방향 설정 | void |
| `setMoving(isMoving)` | 이동 상태 설정 | void |
| `updateFrame(timestamp)` | 프레임 업데이트 | void |
| `resetAnimation()` | 애니메이션 리셋 | void |
| `setAnimationSpeed(speed)` | 애니메이션 속도 설정 (ms/frame) | void |
| `getCurrentState()` | 현재 상태 반환 | { state, direction, currentFrame } |
| `getCharacterId()` | 캐릭터 ID 반환 | string |
| `cleanup()` | 정리 | void |

**특징:**
- walk 상태: 4프레임 루프 (animationSpeed 기본값 200ms)
- idle 상태: 항상 프레임 0
- 이동 시작/중지 시 자동 상태 전환

#### 2. CharacterSpriteRenderer.js
**위치:** `frontend/src/utils/characterSpriteRenderer.js`

**기능:**
- 4방향 스프라이트 애니메이션 렌더링
- AnimationController 통합 (캐릭터별)
- 스프라이트 시트 로드 (spriteLoader 사용)
- 폴백 렌더링 (프로그래매틱, 스프라이트 없을 때)
- 캐릭터별 애니메이션 컨트롤러 관리

**API 메서드:**
| 메서드 | 설명 | 반환값 |
|--------|------|--------|
| `constructor()` | CharacterSpriteRenderer 생성 | CharacterSpriteRenderer |
| `loadSpriteSheet()` | 스프라이트 시트 로드 | Promise<void> |
| `createController(characterId)` | 캐릭터 애니메이션 컨트롤러 생성 (async) | Promise<AnimationController> |
| `render(ctx, characterId, x, y, size, isMoving, direction, timestamp)` | 캐릭터 렌더링 | void |
| `renderSpriteFrame(ctx, x, y, size, state)` | 스프라이트 프레임 렌더링 | void |
| `renderFallback(ctx, x, y, size, state)` | 폴백 렌더링 (프로그래매틱) | void |
| `removeController(characterId)` | 캐릭터 컨트롤러 삭제 | void |
| `cleanup()` | 모든 컨트롤러 정리 | void |
| `isLoaded()` | 스프라이트 로드 여부 확인 | boolean |

**스프라이트 프레임 정의:**
- SPRITE_SIZE: 32 픽셀
- 방향별 행: down (0), up (1), left (2), right (3)
- 프레임: 4프레임 × 방향 (32×128 시트 구조)

**폴백 렌더링:**
- 스프라이트 시트가 없을 때 프로그래매틱으로 캐릭터 렌더링
- 몸통: 사각형 (#4CAF50)
- 눈: 흰색 원 + 검은 눈동자
- bounce 애니메이션: 걷을 때 수직 이동

#### 3. characterSprites.json
**위치:** `frontend/src/data/characterSprites.json`

**구조:**
```json
{
  "spriteSheet": "sprites/characters.png",
  "spriteSize": 32,
  "framesPerAnimation": 4,
  "directions": {
    "down": 0,
    "up": 1,
    "left": 2,
    "right": 3
  },
  "animations": {
    "idle": { "frameCount": 1, "frameDuration": 0, "loop": false },
    "walk": { "frameCount": 4, "frameDuration": 200, "loop": true }
  },
  "frames": {
    "down": [{ "x": 0, "y": 0, "width": 32, "height": 32 }, ...],
    "up": [{ "x": 0, "y": 32, "width": 32, "height": 32 }, ...],
    "left": [{ "x": 0, "y": 64, "width": 32, "height": 32 }, ...],
    "right": [{ "x": 0, "y": 96, "width": 32, "height": 32 }, ...]
  }
}
```

**특징:**
- 4방향 × 4프레임 = 16개 프레임 정의
- 프레임 좌표: x (0, 32, 64, 96), y (방향별 0, 32, 64, 96)
- walk 애니메이션: 4프레임 × 200ms = 800ms 루프

#### 4. Character.jsx 통합
**위치:** `frontend/src/components/Character.jsx`

**변경 사항:**
- 이동 감지: useEffect로 x, y 변경 감지
- 방향 결정: dx, dy 기준 방향 계산 (absX > absY 수직, else 수평)
- 이동 상태 관리: setIsMoving (dx !== 0 \|\| dy !== 0)
- 스프라이트 시트 초기 로드 (loadSpriteSheet)
- 하위 호환성: SVG 기반 캐릭터 폴백 유지

**내보내기 함수:**
```javascript
export function renderCharacterSprite(canvas, char, scale, timestamp) {
  // GameCanvas에서 호출하여 Canvas에 스프라이트 렌더링
}
```

### 테스트 커버리지

| 파일 | 테스트 개수 | 상태 |
|------|-------------|------|
| `frontend/tests/CharacterSpriteRenderer.test.js` | AnimationController: 16 | ✅ 통과 |
| `frontend/tests/CharacterSpriteRenderer.test.js` | characterSprites.json: 14 | ✅ 통과 |
| **총계** | **30** | **✅ 100% 통과** |

**테스트 항목 (AnimationController):**
- 생성 및 초기화: 4개
- 애니메이션 상태 전환: 4개
- 이동 상태 관리: 3개
- 프레임 업데이트: 4개
- 애니메이션 속도 설정: 2개
- 정리: 1개

**테스트 항목 (characterSprites.json):**
- 전체 구조: 4개
- 애니메이션 데이터: 4개
- 프레임 데이터: 6개

### 향후 작업

1. **GameCanvas.jsx 완전 통합** - renderCharacterSprite 함수로 Canvas 기반 스프라이트 렌더링
2. **스프라이트 시트 에셋 준비** - `public/images/sprites/characters.png` 파일 생성
3. **E2E 브라우저 테스트** - 실제 브라우저에서 애니메이션 확인
4. **캐릭터별 이동 히스토리** - 방향 결정 개선 (현재 단순 비교)

### 관련 파일

| 파일 | 설명 | 크기 |
|------|------|------|
| `frontend/src/utils/AnimationController.js` | 애니메이션 컨트롤러 | 2273 bytes |
| `frontend/src/utils/characterSpriteRenderer.js` | 스프라이트 렌더러 | 5473 bytes |
| `frontend/src/data/characterSprites.json` | 스프라이트 좌표 데이터 | 1345 bytes |
| `frontend/src/components/Character.jsx` | 캐릭터 컴포넌트 (수정) | 5288 bytes |
| `frontend/tests/CharacterSpriteRenderer.test.js` | 테스트 파일 | 12280 bytes |

---

## 📊 캐릭터 이동 히스토리 시스템 (Movement History System) - 2026-02-18

### GitHub Issue
- **#67:** [feat] 캐릭터 이동 히스토리 시스템 - 방향 결정 개선 ✅ 완료 (2026-02-18)

### 목표
캐릭터 이동 히스토리를 추적하여 현재 이동 방향을 정확하게 결정하는 시스템 구현

### 문제
- 기존 코드에서 단순히 prevX/prevY와 현재 x/y 비교로 방향 결정
- 단순 비교로 인해 방향 전환이 부정확할 수 있음
- 이동 노이즈 제거 기능 없음

### 해결: MovementHistory.js 구현

### MovementHistory 클래스

이동 히스토리 추적 및 방향 결정 유틸리티

**데이터 구조:**
```javascript
{
  characterId: string,
  positions: [{ x, y, timestamp }],  // 최근 N개 위치 기록
  maxHistory: 100,                   // 최대 기록 개수
}
```

**설정값:**
| 상수 | 설명 | 값 |
|------|------|-----|
| DEFAULT_MAX_HISTORY | 최대 히스토리 크기 | 50 |
| MOVEMENT_THRESHOLD | 이동 임계값 (px) | 0.5 |
| DIRECTION_HISTORY_SIZE | 방향 결정에 사용할 최근 이동 개수 | 3 |

**메서드:**
| 메서드 | 설명 | 반환값 |
|--------|------|--------|
| constructor(characterId, maxHistory) | MovementHistory 생성 | MovementHistory |
| addPosition(x, y, timestamp) | 위치 추가 (임계값 이상 이동 시) | void |
| getRecentPositions(n) | 최근 N개 위치 반환 | Array |
| getCurrentPosition() | 현재 위치 반환 | { x, y, timestamp } \| null |
| getPreviousPosition() | 이전 위치 반환 | { x, y, timestamp } \| null |
| isMoving(n) | 이동 중 여부 (최근 N개 위치 평균) | boolean |
| calculateMovementVector(n) | 이동 벡터 계산 (정규화 포함) | { dx, dy, normalized } |
| getDirection() | 방향 결정 (up/down/left/right/idle) | string |
| getDetailedDirection() | 상세 방향 (8방향 + 대각선) | string |
| calculateSpeed(n) | 속도 계산 (px/ms) | number |
| clear() | 히스토리 초기화 | void |
| size() | 히스토리 크기 반환 | number |
| getStatus() | 상태 요약 | Object |

**주요 기능:**
1. **이동 임계값 무시** (노이즈 제거): 0.5px 미만 이동은 무시
2. **최근 위치 기반 방향 결정**: 최근 3개 위치 평균으로 정확한 방향 결정
3. **대각선 이동 정규화**: 벡터 크기 1로 정규화 (cos 45° ≈ 0.707)
4. **속도 계산**: px/ms 단위 속도 계산

**방향 결정 알고리즘:**
| 방향 | 설명 |
|------|------|
| idle | 정지 (이동 없음) |
| up, down, left, right | 4방향 (절대값이 큰 축 선택) |
| up-left, up-right, down-left, down-right | 8방향 (상세, 대각선 판정 임계값: 0.6) |

### MovementHistoryManager 클래스

다중 캐릭터 히스토리 관리 시스템

**메서드:**
| 메서드 | 설명 | 반환값 |
|--------|------|--------|
| constructor(defaultMaxHistory) | MovementHistoryManager 생성 | MovementHistoryManager |
| getHistory(characterId) | 캐릭터 히스토리 반환 (없으면 생성) | MovementHistory |
| addPosition(characterId, x, y, timestamp) | 캐릭터 위치 등록 | void |
| isMoving(characterId) | 캐릭터 이동 중 여부 | boolean |
| getDirection(characterId) | 캐릭터 방향 반환 | string |
| getDetailedDirection(characterId) | 캐릭터 상세 방향 반환 | string |
| calculateMovementVector(characterId) | 캐릭터 이동 벡터 반환 | { dx, dy, normalized } |
| calculateSpeed(characterId) | 캐릭터 속도 반환 | number |
| getStatus(characterId) | 캐릭터 상태 요약 반환 | Object |
| clear(characterId) | 캐릭터 히스토리 초기화 | void |
| remove(characterId) | 캐릭터 히스토리 제거 | void |
| clearAll() | 모든 히스토리 초기화 | void |
| getCharacterIds() | 관리 중인 캐릭터 목록 반환 | string[] |
| size() | 캐릭터 수 반환 | number |

**전역 인스턴스:** globalMovementHistoryManager

### Character.jsx 통합

**변경 사항:**
```javascript
// MovementHistory import
import { globalMovementHistoryManager } from '../utils/MovementHistory.js'

// 이동 상태 추적 (MovementHistory 사용)
const [isMoving, setIsMoving] = useState(false)
const [direction, setDirection] = useState('down')
const movementInitializedRef = useRef(false)

// MovementHistory로 위치 등록
useEffect(() => {
  if (!movementInitializedRef.current) {
    globalMovementHistoryManager.addPosition(id, x, y)
    movementInitializedRef.current = true
  }

  globalMovementHistoryManager.addPosition(id, x, y)

  const history = globalMovementHistoryManager.getHistory(id)
  setIsMoving(history.isMoving())
  setDirection(history.getDirection())

  return () => {
    globalMovementHistoryManager.remove(id)
  }
}, [x, y, id])
```

### GameCanvas.jsx 수정

**변경 사항:**
```javascript
// MovementHistory import
import { globalMovementHistoryManager } from '../utils/MovementHistory.js'

// calculateDirection 함수 수정 (MovementHistory 기반)
export function calculateDirection(characterId) {
  const history = globalMovementHistoryManager.getHistory(characterId)
  if (!history) return 'idle'
  return history.getDirection()
}
```

### 테스트 커버리지

**테스트 개수:** 31개 (모두 통과 ✅)
**테스트 항목:**
1. 위치 추가 및 히스토리 관리 (4개)
2. 이동 임계값 무시 (2개)
3. 이동 감지 (3개)
4. 이동 벡터 계산 (4개)
5. 방향 결정 (4개)
6. 상세 방향 결정 (4개)
7. 속도 계산 (1개)
8. MovementHistoryManager (7개)
9. 캐릭터 제거 (2개)
10. 전역 인스턴스 (1개)

### 관련 파일

| 파일 | 설명 | 크기 |
|------|------|------|
| frontend/src/utils/MovementHistory.js | 이동 히스토리 유틸리티 | ~9.5 KB |
| frontend/src/components/Character.jsx | 캐릭터 컴포넌트 (수정) | ~5.6 KB |
| frontend/src/components/GameCanvas.jsx | GameCanvas 컴포넌트 (수정) | ~XX KB |
| frontend/tests/MovementHistory.test.js | Jest 테스트 파일 | ~12 KB |
| frontend/test-movement-history.mjs | 테스트 스크립트 | ~5.3 KB |

---

*마지막 업데이트: 2026-02-18 (MovementHistory 시스템 추가)*
