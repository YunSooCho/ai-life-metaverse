# 캔버스 렌더링 시스템 (Canvas Rendering System)

## 개요

GameCanvas는 WebGL/Canvas 2D API를 사용하여 게임 씬을 렌더링하는 핵심 컴포넌트입니다. React hooks와 캔버스 API를 결합하여 실시간 렌더링을 수행합니다.

## 상태 관리

### useState로 관리하는 상태

```javascript
const [animatedCharacters, setAnimatedCharacters] = useState({})
const [spriteSheets, setSpriteSheets] = useState({})
const [isSpritesLoaded, setIsSpritesLoaded] = useState(false)
const [selectedCharacter, setSelectedCharacter] = useState(null)
const [keyboardMovement, setKeyboardMovement] = useState({ x: 0, y: 0 })
const [activeBuilding, setActiveBuilding] = useState(null)
const [showInterior, setShowInterior] = useState(false)
const [currentInteriorData, setCurrentInteriorData] = useState(null)
const [clickedExit, setClickedExit] = useState(false)
const [showExitButton, setShowExitButton] = useState(false)
const [exitButtonPos, setExitButtonPos] = useState({ x: 0, y: 0 })
```

### useRef로 관리하는 가변 상태

랜더링 루프에서 자주 변경되는 상태는 useRef를 사용하여 불필요한 리렌더링을 방지합니다:

```javascript
const canvasRef = useRef(null)
const scaleRef = useRef(1)
const animatedCharactersRef = useRef(propsAnimatedCharacters)
const weatherRef = useRef(weather)
const mapSizeRef = useRef(MAP_SIZE)
const requestRef = useRef(null)
const lastTimeRef = useRef(0)
```

## 렌더링 루프

### render() 함수

메인 렌더링 루프입니다. requestAnimationFrame으로 60 FPS 렌더링을 수행합니다:

```javascript
const render = useCallback((timestamp) => {
  if (!lastTimeRef.current) lastTimeRef.current = timestamp
  const deltaTime = timestamp - lastTimeRef.current

  const canvas = canvasRef.current
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  const canvasWidth = canvas.clientWidth
  const canvasHeight = canvas.clientHeight
  const scale = Math.min(canvasWidth / mapSizeRef.current.width, canvasHeight / mapSizeRef.current.height)

  scaleRef.current = scale
  animatedCharactersRef.current = animatedCharacters
  weatherRef.current = weather

  // 캔버스 클리어
  ctx.clearRect(0, 0, canvasWidth, canvasHeight)

  // 타일맵 배경 렌더링
  renderTilemap(ctx, scale, canvasWidth, canvasHeight)

  // 건물 렌더링
  renderBuildings(ctx, buildings, scale)

  // 캐릭터 렌더링
  renderCharacters(ctx, myCharacter, characters, animatedCharacters, scale)

  // 인테리어 렌더링 (건물 내부)
  if (activeBuilding && showInterior) {
    renderInterior(ctx, currentInteriorData, scale, canvasWidth, canvasHeight)
  }

  // 이펙트 렌더링
  renderEffects(ctx, clickEffects, scale)

  // 날씨/시간 오버레이 렌더링
  renderWeatherTimeHUD(ctx, weather, scale, canvasWidth, canvasHeight)

  lastTimeRef.current = timestamp
  requestRef.current = requestAnimationFrame(render)
}, [props...])
```

### useEffect로 렌더링 루프 시작/종료

```javascript
useEffect(() => {
  requestRef.current = requestAnimationFrame(render)
  return () => cancelAnimationFrame(requestRef.current)
}, [render])
```

## 캐릭터 렌더링

### renderCharacters() 함수

플레이어와 AI 캐릭터를 렌더링합니다:

```javascript
function renderCharacters(ctx, myCharacter, characters, animatedCharacters, scale) {
  const allChars = {
    ...characters,
    [myCharacter.id]: myCharacter
  }

  const CHARACTER_SIZE_SCALED = CHARACTER_SIZE * scale

  Object.values(allChars).forEach(char => {
    const animChar = animatedCharacters[char.id] || char
    const x = animChar.x * scale
    const y = animChar.y * scale

    // 방향 계산
    const direction = calculateDirection(char.id)

    // 픽셀 캐릭터 렌더링
    drawPixelCharacter(ctx, x, y, animChar.color, scale)

    // 감정 이모지 렌더링
    if (char.emotion) {
      const emojiSize = 16 * scale
      ctx.font = `${emojiSize}px Arial`
      ctx.fillText(char.emotion.emoji, x - emojiSize / 2, y - CHARACTER_SIZE_SCALED - 5)
    }

    // 채팅 버블 렌더링
    const chatData = chatMessages[char.id]
    if (chatData?.message) {
      renderChatBubble(ctx, chatData.message, x, y, CHARACTER_SIZE, scale, canvasWidth, canvasHeight)
    }
  })
}
```

### 채팅 버블 렌더링

```javascript
function renderChatBubble(ctx, messageText, x, y, charSize, scale, canvasWidth, canvasHeight) {
  const padding = 8
  const fontSize = 10
  ctx.font = `${fontSize}px 'Press Start 2P', monospace`

  const textWidth = ctx.measureText(messageText).width
  const bubbleWidth = Math.min(textWidth + padding * 2, canvasWidth * 0.5)
  const bubbleHeight = fontSize + padding * 2

  const bubbleX = x - bubbleWidth / 2
  const bubbleY = y - charSize * scale - bubbleHeight - 5

  // 말풍선 배경
  ctx.fillStyle = 'rgba(22, 33, 62, 0.95)'
  ctx.fillRect(bubbleX, bubbleY, bubbleWidth, bubbleHeight)
  ctx.strokeStyle = '#a8dadc'
  ctx.lineWidth = 2
  ctx.strokeRect(bubbleX, bubbleY, bubbleWidth, bubbleHeight)

  // 꼬리
  ctx.beginPath()
  ctx.moveTo(x, bubbleY + bubbleHeight)
  ctx.lineTo(x - 5, bubbleY + bubbleHeight + 5)
  ctx.lineTo(x + 5, bubbleY + bubbleHeight)
  ctx.closePath()
  ctx.fillStyle = '#a8dadc'
  ctx.fill()

  // 텍스트
  ctx.fillStyle = '#ffffff'
  ctx.fillText(messageText, bubbleX + padding, bubbleY + padding + fontSize)
}
```

## 이펙트 렌더링

### 렌더링 프로세스

1. **클릭 효과 (Click Effects)**
   - 점프 dust particle
   - 하트 이모지 (호감도 상승)
   - 스컬 이모지 (호감도 하락)

2. **애니메이션 이펙트 (Animation Effects)**
   - 호감도 상승 (하트)
   - 호감도 하락 (스컬)
   - 경험치 획득 (반짝임)
   - 레벨업

```javascript
function renderEffects(ctx, clickEffects, scale) {
  clickEffects.forEach(effect => {
    const age = Date.now() - effect.timestamp
    if (age > 500) return // 0.5초 후 사라짐

    const x = effect.x * scale
    const y = effect.y * scale

    ctx.font = `${20 * scale}px Arial`
    ctx.fillText(effect.type === 'heart' ? '❤️' : '💨', x, y)
  })
}
```

## 날씨 렌더링

### 날씨 시스템

```javascript
function renderWeatherTimeHUD(ctx, weather, scale, canvasWidth, canvasHeight) {
  const weatherType = weather?.type || 'CLEAR'

  if (weatherType === 'CLEAR') {
    return // 맑음: 아무것도 렌더링하지 않음
  }

  // 날씨 오버레이
  ctx.strokeStyle = weatherType === 'RAIN' ? '#87CEEB' : '#E6E6FA'
  ctx.lineWidth = 2

  for (let i = 0; i < 50; i++) {
    const x = Math.random() * canvasWidth
    const y = (Date.now() / 10 + i * 20) % canvasHeight

    if (weatherType === 'RAIN') {
      // 비
      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.lineTo(x, y + 10)
      ctx.stroke()
    } else if (weatherType === 'SNOW') {
      // 눈
      ctx.beginPath()
      ctx.arc(x, y, 2, 0, Math.PI * 2)
      ctx.fill()
    }
  }
}
```

## 성능 최적화

### CRITICAL BUG Fix (#65)**

**문제:** 캔버스가 완전히 투명하게 렌더링됨

**원인:** useEffect 의존성 배열이 너무 커서 자주 재렌더링이 발생하고 렌더링 루프가 재시작됨

**해결:**
1. 캔버스 설정을 렌더링 분리 (useRef 사용)
2. 자주 변경되는 상태는 refs로 관리 (scale, animatedCharacters)
3. useEffect 의존성 배열 최소화
4. 렌더링 루프가 리렌더링 시 유지되도록 보장

```javascript
// 수정 전: 큰 의존성 배열
useEffect(() => {
  // render loop
}, [myCharacter, characters, mapImages, animatedCharacters, renderTilemap, ...])

// 수정 후: 최소 의존성 배열
useEffect(() => {
  // render loop
}, [render])

// 자주 변경되는 상태는 refs로 관리
const scaleRef = useRef(1)
const animatedCharactersRef = useRef(propsAnimatedCharacters)
```

## 인테리어 렌더링

### 건물 내부 렌더링

```javascript
function renderInterior(ctx, interiorData, scale, canvasWidth, canvasHeight) {
  if (!interiorData) return

  const { background, npcs, items } = interiorData

  // 배경 렌더링
  ctx.fillStyle = background.color || '#8B4513'
  ctx.fillRect(0, 0, canvasWidth, canvasHeight)

  // 바닥 렌더링
  ctx.fillStyle = background.floorColor || '#DEB887'
  ctx.fillRect(0, canvasHeight * 0.7, canvasWidth, canvasHeight * 0.3)

  // NPC 렌더링
  npcs.forEach(npc => {
    const x = npc.x * scale
    const y = npc.y * scale
    drawPixelCharacter(ctx, x, y, npc.color || '#FFD700', scale)
  })

  // 아이템 렌더링
  items.forEach(item => {
    const x = item.x * scale
    const y = item.y * scale
    ctx.font = `${20 * scale}px Arial`
    ctx.fillText(item.icon || '🎁', x, y)
  })
}
```

## Input 이벤트 핸들링

### 마우스/터치 클릭

```javascript
const handleCanvasClick = (e) => {
  const canvas = canvasRef.current
  const rect = canvas.getBoundingClientRect()

  const clientX = e.touches ? e.touches[0].clientX : e.clientX
  const clientY = e.touches ? e.touches[0].clientY : e.clientY

  const x = clientX - rect.left
  const y = clientY - rect.top

  const container = canvas.parentElement
  const scale = Math.min(container.clientWidth / MAP_SIZE.width, container.clientHeight / MAP_SIZE.height)

  const clickMapX = x / scale
  const clickMapY = y / scale

  // 건물 클릭 감지
  const clickedBuilding = buildings.find(building => {
    return clickMapX >= building.x && clickMapX <= building.x + building.width &&
           clickMapY >= building.y && clickMapY <= building.y + building.height
  })

  if (clickedBuilding) {
    onClick(building)
    return
  }

  // 캐릭터 클릭 감지
  const clickedCharacter = Object.values(characters).find(char => {
    const distance = Math.sqrt(Math.pow(char.x - clickMapX, 2) + Math.pow(char.y - clickMapY, 2))
    return distance <= CHARACTER_SIZE / 2
  })

  if (clickedCharacter) {
    onCharacterClick(clickedCharacter)
    return
  }

  // 빈 공간 클릭: 캐릭터 이동
  onMove(clickMapX, clickMapY)
}
```

## 테스트

### 테스트 파일

- `frontend/src/components/__tests__/GameCanvas.test.jsx` - 캔버스 렌더링 테스트
- `frontend/src/utils/__tests__/pixelArtRenderer.test.js` - 픽셀 캐릭터 렌더러 테스트
- `frontend/src/utils/__tests__/spriteRenderer.test.js` - 스프라이트 렌더러 테스트
- `frontend/src/tests/aiCharacterPosition.test.jsx` - AI 캐릭터 위치 테스트 (Issue #121)

### AI 캐릭터 위치 테스트 (Issue #121)

AI 캐릭터가 올바른 그리드 위치에 있는지 검증하는 테스트입니다.

**테스트 항목 (6개):**
1. AI 캐릭터가 올바른 그리드 위치에 있는지 검증
2. AI 캐릭터가 셀 중심에 위치해야 함 (버그 감지 가능)
3. AI 캐릭터가 셀 안에 있는지 확인
4. AI 캐릭터가 셀 중심과 정확히 일치하는지 확인
5. 맵 경계 밖에 있지 않아야 함
6. AI 캐릭터끼리 겹쳐있지 않아야 함

**버그 감지:**
- 테스트를 통해 AI 캐릭터가 셀 중심이 아니라 셀 시작점에 위치할 수 있는 버그를 감지 가능
- 올바른 셀 중심 좌표: (10 * 50 + 25, 7 * 50 + 25) = (525, 375)
- 잘못된 좌표: (10 * 50, 7 * 50) = (500, 350)

### 캔버스 상태 노출 (screenshot.js)

캔버스 렌더링 완료 상태를 확인할 수 있는 API:

```javascript
window.__gameCanvasReady = true
window.__canvasWidth = canvasWidth
window.__canvasHeight = canvasHeight
```

## 참고

- `frontend/src/components/GameCanvas.jsx` - 캔버스 컴포넌트
- `frontend/src/utils/pixelArtRenderer.js` - 픽셀 캐릭터 렌더러
- `frontend/src/utils/spriteRenderer.js` - 스프라이트 렌더러
- `frontend/src/utils/TileRenderer.js` - 타일맵 렌더러
- `frontend/src/utils/BuildingRenderer.js` - 건물 렌더러
- `frontend/src/screenshot.js` - 스크린샷 캡처 유틸리티

---

**마지막 업데이트:** 2026-02-21 (Issue #65 해결 완료)