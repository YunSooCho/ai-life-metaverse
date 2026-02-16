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

## 🚶 이동 시스템 (Movement System) - 2026-02-16 PM 업데이트

### 캐릭터 이동 속성

| 필드 | 설명 | 예시 |
|------|------|------|
| `speed` | 이동 속도 (px/프레임) | 2.0 (기본값), 캐릭터별 차이 가능 |
| `isMoving` | 이동 중인지 여부 | true / false |
| `targetX`, `targetY` | 이동 목표 좌표 | 0 ~ mapWidth/Height |
| `isConversing` | 대화 중인지 여부 (2026-02-16 PM) | true / false - 대화 중에는 이동 불가 |

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

*마지막 업데이트: 2026-02-16 (감정 표현 시스템 추가)*