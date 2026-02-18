/**
 * GameCanvas CRITICAL BUG Fix (#65)
 * Problem: Canvas is completely transparent (all pixels [0,0,0,0])
 *
 * Root Cause Analysis:
 * 1. useEffect dependency array is too large
 * 2. Any dependency change triggers re-render and recreates the render loop
 * 3. renderTilemap and renderBuildingSprite are in dependency array
 * 4. Animated characters state updates cause frequent useEffect re-runs
 * 5. This causes the render loop to restart constantly, preventing stable rendering
 *
 * Solution:
 * 1. Separate canvas setup from rendering (useRef dependencies)
 * 2. Use refs for mutable state that changes frequently (scale, animatedCharacters)
 * 3. Keep only essential dependencies in useEffect
 * 4. Add console logs for debugging
 * 5. Ensure render loop persists across re-renders
 */

import { useRef, useEffect, useState, useCallback, useLayoutEffect } from 'react'
import PropTypes from 'prop-types'
import { useI18n } from '../i18n/I18nContext'
import Character from './Character'
import ChatBubble from './ChatBubble'
import CharacterProfile from './CharacterProfile'
import spriteLoader from '../utils/spriteLoader'
import spriteRenderer from '../utils/spriteRenderer'
import tileRenderer from '../utils/TileRenderer'
import { renderBuilding, isBuildingHighlighted, renderInterior, isExitButtonClicked } from '../utils/BuildingRenderer'
import buildingsInteriorData from '../data/buildings_interior.json'
import tilemapData from '../data/tilemap.json'
import {
  renderEmotionEmoji,
  getEmotionFromAffinity
} from '../utils/emojiSprite'
import {
  createFxParticle,
  renderFx,
  getFxForAffinityChange,
  FX_TYPES
} from '../utils/effects'
import {
  EMOTION_TYPES,
  EMOTION_EMOJIS,
  EMOTION_COLORS,
  getAutoEmotionAffinity,
  EmotionSystem,
  FXSystem,
  FX_TYPES as NEW_FX_TYPES
} from '../utils/emotionSystem'
import {
  getOptionEmoji,
  getColorHex
} from '../utils/characterCustomization'
import {
  CUSTOMIZATION_CATEGORIES
} from '../data/customizationOptions'
import {
  getGameHour,
  getGameMinute,
  generateRandomWeather,
  renderTimeOverlay,
  renderWeatherTimeHUD,
  WeatherState,
  renderWeatherTransition,
  WEATHER_TYPES
} from '../utils/weatherTimeSystem'
import { soundManager } from '../utils/soundManager'
import { drawPixelCharacter } from '../utils/pixelArtRenderer'
import {
  initializeInputHandler,
  getMovementDirection,
  isMoving,
  resetKeyStates,
  cleanupAllInputHandlers
} from '../utils/inputHandler'
import { globalMovementHistoryManager } from '../utils/MovementHistory.js'

export const MAP_SIZE = { width: 1000, height: 700 }
export const CHARACTER_SIZE = 40
export const CELL_SIZE = 50
const DEFAULT_SPEED = 3
const SPRITE_SIZE = 32

export function checkCollision(x, y, targetCharacterId, allCharacters, charSize = CHARACTER_SIZE) {
  const collisionRadius = charSize

  for (const [id, char] of Object.entries(allCharacters)) {
    if (id === targetCharacterId) continue

    const distance = Math.sqrt(
      Math.pow(char.x - x, 2) + Math.pow(char.y - y, 2)
    )

    if (distance < collisionRadius) {
      return true
    }
  }
  return false
}

export function checkBuildingCollision(x, y, buildings, charSize = CHARACTER_SIZE) {
  const halfSize = charSize / 2

  for (const building of buildings) {
    const buildingLeft = building.x
    const buildingRight = building.x + building.width
    const buildingTop = building.y
    const buildingBottom = building.y + building.height

    if (x + halfSize > buildingLeft && x - halfSize < buildingRight &&
        y + halfSize > buildingTop && y - halfSize < buildingBottom) {
      return true
    }
  }
  return false
}

export function checkMapBounds(x, y, charSize = CHARACTER_SIZE) {
  const halfSize = charSize / 2
  return {
    inBounds: x >= halfSize && x <= MAP_SIZE.width - halfSize &&
              y >= halfSize && y <= MAP_SIZE.height - halfSize,
    clampedX: Math.max(halfSize, Math.min(MAP_SIZE.width - halfSize, x)),
    clampedY: Math.max(halfSize, Math.min(MAP_SIZE.height - halfSize, y))
  }
}

export function canMove(character) {
  return !character.isConversing
}

export function getCharacterSpeed(character) {
  return character.speed || DEFAULT_SPEED
}

// 방향 계산 함수 - MovementHistory 기반으로 개선
// spriteRenderer와 호환되는 방향 형식으로 변환 (walk_up, walk_down, walk_left, walk_right)
export function calculateDirection(characterId) {
  const history = globalMovementHistoryManager.getHistory(characterId)
  if (!history) return 'idle'

  const direction = history.getDirection()

  // MovementHistory는 'right', 'left', 'up', 'down'을 반환
  // spriteRenderer는 'walk_right', 'walk_left', 'walk_up', 'walk_down'을 기대함
  if (direction === 'idle') return 'idle'
  if (direction === 'right') return 'walk_right'
  if (direction === 'left') return 'walk_left'
  if (direction === 'up') return 'walk_up'
  if (direction === 'down') return 'walk_down'

  return 'idle'
}

// 기존 호환성을 위해 prevX, prevY 기반 방향 계산도 유지
// spriteRenderer와 호환되는 방향 형식으로 변환 (walk_up, walk_down, walk_left, walk_right)
export function calculateDirectionFromPositions(prevX, prevY, currX, currY) {
  const dx = currX - prevX
  const dy = currY - prevY

  if (dx === 0 && dy === 0) return 'idle'

  const absX = Math.abs(dx)
  const absY = Math.abs(dy)

  if (absY > absX) {
    return dy > 0 ? 'walk_down' : 'walk_up'
  } else {
    return dx > 0 ? 'walk_right' : 'walk_left'
  }
}

function GameCanvas({
  myCharacter,
  characters,
  affinities,
  chatMessages,
  clickEffects,
  buildings,
  canvasRef,
  onClick,
  onBuildingClick,
  onMove,
  characterCustomization = {
    hairStyle: 'short',
    clothingColor: 'blue',
    accessory: 'none'
  },
  weather = 'CLEAR',
  animatedCharacters: propsAnimatedCharacters = {}
}) {
  const { t } = useI18n()
  const [animatedCharacters, setAnimatedCharacters] = useState({})
  const [spriteSheets, setSpriteSheets] = useState({})
  const [isSpritesLoaded, setIsSpritesLoaded] = useState(false)
  const [selectedCharacter, setSelectedCharacter] = useState(null)
  const [keyboardMovement, setKeyboardMovement] = useState({ x: 0, y: 0 })

  // 인테리어 상태 (Issue #71)
  const [inInterior, setInInterior] = useState(false)
  const [currentInterior, setCurrentInterior] = useState(null)
  const exitButtonAreaRef = useRef(null)

  // Refs for mutable state (avoids triggering useEffect)
  const animationRef = useRef(null)
  const lastTimeRef = useRef(0)
  const characterDirections = useRef({})
  const gameStartTime = useRef(Date.now())
  const weatherParticlesRef = useRef([])
  const lastWeatherChange = useRef(Date.now())
  const fxParticlesRef = useRef([])
  const prevAffinitiesRef = useRef({})
  const inputCleanupRef = useRef(null)

  // WeatherState for smooth weather transition
  const weatherStateRef = useRef(new WeatherState(weather))

  // NEW: Refs for state that changes frequently
  const scaleRef = useRef(1)
  const myCharacterRef = useRef(myCharacter)
  const charactersRef = useRef(characters)
  const affinitiesRef = useRef(affinities)
  const chatMessagesRef = useRef(chatMessages)
  const clickEffectsRef = useRef(clickEffects)
  const buildingsRef = useRef(buildings)
  const characterCustomizationRef = useRef(characterCustomization)
  const weatherRef = useRef(weather)
  const animatedCharactersRef = useRef(animatedCharacters)
  const renderLoopIdRef = useRef(null)
  const inInteriorRef = useRef(false)
  const currentInteriorRef = useRef(null)

  // Update refs when state changes (sync refs with props)
  useEffect(() => {
    myCharacterRef.current = myCharacter
    charactersRef.current = characters
    affinitiesRef.current = affinities
    chatMessagesRef.current = chatMessages
    clickEffectsRef.current = clickEffects
    buildingsRef.current = buildings
    characterCustomizationRef.current = characterCustomization
    weatherRef.current = weather
  }, [myCharacter, characters, affinities, chatMessages, clickEffects, buildings, characterCustomization, weather])

  // Sync animatedCharacters ref
  useEffect(() => {
    animatedCharactersRef.current = animatedCharacters
  }, [animatedCharacters])

  // Sync propsAnimatedCharacters ref (animation from App.js)
  const propsAnimatedCharactersRef = useRef(propsAnimatedCharacters)
  useEffect(() => {
    propsAnimatedCharactersRef.current = propsAnimatedCharacters
  }, [propsAnimatedCharacters])

  // Sync interior refs
  useEffect(() => {
    inInteriorRef.current = inInterior
    currentInteriorRef.current = currentInterior
  }, [inInterior, currentInterior])

  // 감정 시스템 및 FX 시스템 refs
  const emotionSystemRef = useRef(new EmotionSystem())
  const fxSystemRef = useRef(new FXSystem())

  // 날씨 변경 (5 게임 시간마다 = 5분)
  useEffect(() => {
    const weatherInterval = setInterval(() => {
      const newWeather = generateRandomWeather()
      weatherStateRef.current.transitionTo(newWeather)
      weatherRef.current = newWeather
      setWeather(newWeather)

      // 날씨 사운드 재생
      soundManager.playWeatherSound(newWeather, 3000) // 3초 페이드 인

      lastWeatherChange.current = Date.now()
    }, 5 * 60 * 1000)
    return () => clearInterval(weatherInterval)
  }, [weather])

  // 키보드 입력 초기화
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

  // 스프라이트 시트 로드
  useEffect(() => {
    const loadSprites = async () => {
      try {
        console.log('[GameCanvas] Loading sprites...')
        // 스프라이트 파일은 /images/sprites/ 폴더에 있으므로 sprites/ 접두사 필요
        const characterSprite = await spriteLoader.loadSpriteSheet(
          'sprites/character/RPGCharacterSprites32x32.svg',
          'character'
        )

        // 건물 스프라이트 로드 (하나의 파일로 로드)
        let buildingSprite = null
        try {
          buildingSprite = await spriteLoader.loadSpriteSheet('sprites/buildings/buildings.svg', 'buildings')
        } catch (e) {
          console.warn('Failed to load building sprite:', e)
        }

        // 타일맵 스프라이트 로드
        let tileSprite = null
        try {
          tileSprite = await spriteLoader.loadSpriteSheet('tiles/tileset.svg', 'tiles')
        } catch (e) {
          console.warn('Failed to load tile sprite:', e)
        }

        // 입장 하이라이트 스프라이트 로드
        let entranceSprite = null
        try {
          entranceSprite = await spriteLoader.loadSpriteSheet('effects/entrance_highlight.svg', 'entrance')
        } catch (e) {
          console.warn('Failed to load entrance sprite:', e)
        }

        setSpriteSheets({
          character: characterSprite,
          buildings: buildingSprite,
          tiles: tileSprite,
          entrance: entranceSprite
        })
        setIsSpritesLoaded(true)
        console.log('[GameCanvas] Sprites loaded successfully')
      } catch (error) {
        console.error('[GameCanvas] Failed to load sprites:', error)
        setIsSpritesLoaded(false)
      }
    }

    loadSprites()
  }, [])

  const checkCollisionLocal = useCallback((x, y, targetCharacterId, allCharacters) => {
    return checkCollision(x, y, targetCharacterId, allCharacters)
  }, [])

  const checkBuildingCollisionLocal = useCallback((x, y) => {
    return checkBuildingCollision(x, y, buildings)
  }, [buildings])

  const checkMapBoundsLocal = useCallback((x, y) => {
    return checkMapBounds(x, y)
  }, [])

  /**
   * 타일맵 렌더링 함수 - stable reference
   */
  const renderTilemap = useCallback((ctx, scale, canvasWidth, canvasHeight) => {
    const { mapSize, layers } = tilemapData

    // 타일맵 렌더러를 사용한 Ground 레이어 렌더링
    if (layers.ground) {
      tileRenderer.renderGroundLayer(ctx, layers.ground, scale)
    }

    // 장식 레이어 렌더링
    if (layers.decoration) {
      tileRenderer.renderDecorationLayer(ctx, layers.decoration, scale)
    }
  }, [])

  /**
   * 건물 스프라이트 렌더링 함수 - stable reference
   * Phase 2 마무리: BuildingRenderer를 통한 리팩토링
   */
  const renderBuildingSprite = useCallback((ctx, building, scale, isHighlighted) => {
    renderBuilding(ctx, building, scale, spriteSheets, tileRenderer.renderEntranceHighlight, isHighlighted)
  }, [spriteSheets])

  /**
   * 캐릭터 애니메이션 업데이트 - 분리
   */
  const updateCharacterAnimation = useCallback((timestamp) => {
    if (!lastTimeRef.current) {
      lastTimeRef.current = timestamp
    }

    const deltaTime = (timestamp - lastTimeRef.current) / 16.67
    lastTimeRef.current = timestamp

    setAnimatedCharacters(prev => {
      const updated = { ...prev }
      const directions = { ...characterDirections.current }
      const chars = charactersRef.current
      const myChar = myCharacterRef.current

      Object.values(chars).forEach(char => {
        if (!updated[char.id]) {
          updated[char.id] = {
            x: char.x,
            y: char.y,
            targetX: char.x,
            targetY: char.y,
            prevX: char.x,
            prevY: char.y
          }
        }

        const prevX = updated[char.id].x
        const prevY = updated[char.id].y
        const speed = getCharacterSpeed(char)
        const dx = char.x - updated[char.id].x
        const dy = char.y - updated[char.id].y
        const distance = Math.sqrt(dx * dx + dy * dy)

        if (distance > 0.5) {
          const moveDistance = speed * deltaTime
          const moveX = (dx / distance) * moveDistance
          const moveY = (dy / distance) * moveDistance

          updated[char.id].x += moveX
          updated[char.id].y += moveY

          // MovementHistory에 위치 등록
          globalMovementHistoryManager.addPosition(char.id, char.x, char.y)

          // 방향 계산 및 업데이트 (MovementHistory 기반)
          const direction = calculateDirection(char.id)
          directions[char.id] = direction
          spriteRenderer.setAnimationState(char.id, distance > 0.5 ? 'walk' : 'idle')
        } else {
          updated[char.id].x = char.x
          updated[char.id].y = char.y

          // MovementHistory에 위치 등록
          globalMovementHistoryManager.addPosition(char.id, char.x, char.y)

          directions[char.id] = 'idle'
          spriteRenderer.setAnimationState(char.id, 'idle')
        }
      })

      if (!updated[myChar.id]) {
        updated[myChar.id] = {
          x: myChar.x,
          y: myChar.y,
          prevX: myChar.x,
          prevY: myChar.y
        }
      }

      const myPrevX = updated[myChar.id].x
      const myPrevY = updated[myChar.id].y

      characterDirections.current = directions
      return updated
    })

    animationRef.current = requestAnimationFrame(updateCharacterAnimation)
  }, [])

  useEffect(() => {
    animationRef.current = requestAnimationFrame(updateCharacterAnimation)
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [updateCharacterAnimation])

  /**
   * CORE FIX: Canvas Rendering useEffect
   *
   * Changes:
   * 1. Use refs instead of direct prop access (avoids re-render triggers)
   * 2. Keep dependencies minimal (only canvasRef and scale change)
   * 3. Add console logs for debugging
   * 4. Ensure render loop persists across re-renders
   */
  useEffect(() => {
    console.log('[GameCanvas] Rendering useEffect started')

    const canvas = canvasRef.current
    if (!canvas) {
      console.error('[GameCanvas] Canvas ref is null!')
      return
    }

    const ctx = canvas.getContext('2d')
    if (!ctx) {
      console.error('[GameCanvas] Canvas context is null!')
      return
    }

    const container = canvas.parentElement
    if (!container) {
      console.error('[GameCanvas] Canvas container is null!')
      return
    }

    const containerWidth = container.clientWidth
    const containerHeight = container.clientHeight

    const scale = Math.min(containerWidth / MAP_SIZE.width, containerHeight / MAP_SIZE.height)
    const canvasWidth = MAP_SIZE.width * scale
    const canvasHeight = MAP_SIZE.height * scale

    // Update scale ref
    scaleRef.current = scale

    // 캔버스 크기 설정 (핵심!)
    canvas.width = canvasWidth
    canvas.height = canvasHeight
    canvas.style.width = `${canvasWidth}px`
    canvas.style.height = `${canvasHeight}px`

    console.log('[GameCanvas] Canvas setup:', { canvasWidth, canvasHeight, scale })

    const CELL_SIZE_SCALED = CELL_SIZE * scale
    const CHARACTER_SIZE_SCALED = CHARACTER_SIZE * scale

    // Get cached building sprite data for performance
    const buildingSpriteData = spriteSheets.buildings

    /**
     * Main render function - uses refs to avoid dependency re-renders
     */
    const render = () => {
      // Get current data from refs (not from props!)
      const myChar = myCharacterRef.current
      const chars = charactersRef.current
      const affs = affinitiesRef.current
      const msgs = chatMessagesRef.current
      const effects = clickEffectsRef.current
      const blds = buildingsRef.current
      const cust = characterCustomizationRef.current
      const wthr = weatherRef.current
      const animChars = { ...animatedCharactersRef.current, ...propsAnimatedCharactersRef.current }
      const currentScale = scaleRef.current

      // Background fill (MUST happen first!)
      ctx.fillStyle = '#1a1a2e'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // 인테리어 렌더링 (Issue #71)
      const isInside = inInteriorRef.current
      const interiorData = currentInteriorRef.current

      if (isInside && interiorData) {
        // 인테리어 모드: 인테리어 렌더링
        const exitButton = renderInterior(
          ctx,
          interiorData,
          canvas.width,
          canvas.height,
          currentScale,
          drawCharacter
        )
        exitButtonAreaRef.current = exitButton
      } else {
        // 맵 모드: 기존 렌더링

      // 타일맵 배경 렌더링
      renderTilemap(ctx, currentScale, canvasWidth, canvasHeight)

      // 건물 렌더링 (픽셀 아트 스타일)
      blds.forEach(building => {
        const bx = building.x * currentScale
        const by = building.y * currentScale
        const bw = building.width * currentScale
        const bh = building.height * currentScale

        // 건물 소스 좌표 (buildings.svg SVG viewBox 0 0 800 200)
        const buildingSources = {
          shop: { x: 0, y: 0, width: 128, height: 128 },
          cafe: { x: 128, y: 0, width: 128, height: 128 },
          park: { x: 256, y: 0, width: 200, height: 160 },
          library: { x: 464, y: 0, width: 150, height: 140 },
          gym: { x: 620, y: 0, width: 160, height: 140 }
        }

        // 스프라이트 있는지 확인
        if (buildingSpriteData && buildingSpriteData instanceof Image && buildingSources[building.sprite]) {
          const source = buildingSources[building.sprite]
          ctx.imageSmoothingEnabled = false
          ctx.drawImage(
            buildingSpriteData,
            source.x, source.y, source.width, source.height,
            bx, by, bw, bh
          )
        } else {
          ctx.imageSmoothingEnabled = false
          ctx.fillStyle = building.color
          ctx.fillRect(bx, by, bw, bh)
        }

        // 건물 이름
        ctx.font = `${12 * currentScale}px 'Courier New', monospace`
        ctx.fillStyle = '#ffffff'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.shadowColor = '#000000'
        ctx.shadowBlur = 2
        ctx.fillText(building.name, bx + bw / 2, by + bh / 2)
        ctx.shadowBlur = 0
      })

      // 픽셀 아트 그리드 렌더링
      ctx.strokeStyle = 'rgba(42, 42, 78, 0.3)'
      ctx.lineWidth = 1
      ctx.imageSmoothingEnabled = false
      for (let x = 0; x < canvas.width; x += CELL_SIZE_SCALED) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, canvas.height)
        ctx.stroke()
      }
      for (let y = 0; y < canvas.height; y += CELL_SIZE_SCALED) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(canvas.width, y)
        ctx.stroke()
      }

      } // END: 맵 모드 (else 블록)

      /**
       * Character rendering
       */
      const drawCharacter = (char) => {
        const animatedChar = animChars[char.id] || char
        const x = animatedChar.x * currentScale
        const y = animatedChar.y * currentScale
        const { color, emoji, name, isAi, isConversing } = char
        const displayName = name || t('app.anonymous')
        const direction = characterDirections.current[char.id] || 'idle'
        const timestamp = performance.now()

        // myCharacter인지 확인
        const isMyCharacter = char.id === myChar.id

        // 커스터마이징 정보 가져오기 (myCharacter만)
        const customization = isMyCharacter ? cust : null
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

        // 커스터마이징 옵션 준비 (pixelArtRenderer용)
        const pixelArtOptions = {
          hairStyle: customization?.hairStyle || 'short',
          hairColor: 'default',
          clothingColor: customization?.clothingColor || 'blue',
          accessory: customization?.accessory || 'none',
          emotion: 'neutral'
        }

        // 색상 매핑 (characterCustomization → pixelArtRenderer)
        const colorMap = {
          'blue': 'blue', 'red': 'red', 'green': 'green',
          'yellow': 'yellow', 'purple': 'purple',
          'orange': 'red', 'pink': 'purple', 'cyan': 'blue',
          'lime': 'green', 'gray': 'blue', 'white': 'blue'
        }
        if (customization?.clothingColor) {
          pixelArtOptions.clothingColor = colorMap[customization.clothingColor] || 'blue'
        }

        // AI 캐릭터에는 기본 스타일 적용
        if (!isMyCharacter && isAi) {
          pixelArtOptions.clothingColor = 'red'
          pixelArtOptions.hairColor = 'brown'
        }

        // 걷기 애니메이션을 위한 바운스 효과
        const isWalking = direction && direction !== 'idle'
        const walkFrame = isWalking ? Math.floor(timestamp / 200) % 4 : 0
        const bounce = isWalking ? Math.sin(walkFrame * Math.PI / 2) * 2 : 0

        // 그림자
        ctx.fillStyle = 'rgba(0,0,0,0.2)'
        ctx.beginPath()
        ctx.ellipse(x, y + CHARACTER_SIZE_SCALED / 3, CHARACTER_SIZE_SCALED / 4, 4 * currentScale, 0, 0, Math.PI * 2)
        ctx.fill()

        // PixelArtRenderer로 캐릭터 렌더링
        // JRPG Chibi Style Character Renderer
        {
          const s = CHARACTER_SIZE_SCALED
          const bx = x  // center x
          const by = y - (bounce * currentScale) // center y with bounce
          
          const bodyColor = isMyCharacter 
            ? (characterCustomColor || '#4477DD')
            : (isAi ? '#DD4455' : (color || '#4477DD'))
          const hairColor = isMyCharacter ? '#2A1B0A' : (isAi ? '#CC6633' : '#2A1B0A')
          const skinColor = '#FDDCB5'
          const eyeWhite = '#FFFFFF'
          const eyeColor = isAi ? '#CC3333' : '#443322'
          const eyeHighlight = '#FFFFFF'
          
          // === JRPG Chibi proportions: big head (60%), small body (40%) ===
          const headR = s * 0.32  // head radius (big!)
          const headCX = bx
          const headCY = by - s * 0.12
          
          // --- Body (small, rounded) ---
          const bodyW = s * 0.28
          const bodyH = s * 0.22
          const bodyX = bx - bodyW / 2
          const bodyY = by + s * 0.12
          
          // Body fill
          ctx.fillStyle = bodyColor
          ctx.beginPath()
          ctx.moveTo(bodyX + 3, bodyY)
          ctx.lineTo(bodyX + bodyW - 3, bodyY)
          ctx.quadraticCurveTo(bodyX + bodyW, bodyY, bodyX + bodyW, bodyY + 3)
          ctx.lineTo(bodyX + bodyW, bodyY + bodyH - 2)
          ctx.quadraticCurveTo(bodyX + bodyW, bodyY + bodyH, bodyX + bodyW - 3, bodyY + bodyH)
          ctx.lineTo(bodyX + 3, bodyY + bodyH)
          ctx.quadraticCurveTo(bodyX, bodyY + bodyH, bodyX, bodyY + bodyH - 2)
          ctx.lineTo(bodyX, bodyY + 3)
          ctx.quadraticCurveTo(bodyX, bodyY, bodyX + 3, bodyY)
          ctx.fill()
          
          // Body outline
          ctx.strokeStyle = '#333333'
          ctx.lineWidth = 1.5
          ctx.stroke()
          
          // Collar / shirt detail
          ctx.fillStyle = '#FFFFFF'
          ctx.beginPath()
          ctx.moveTo(bx - bodyW * 0.2, bodyY)
          ctx.lineTo(bx, bodyY + bodyH * 0.25)
          ctx.lineTo(bx + bodyW * 0.2, bodyY)
          ctx.fill()
          
          // --- Arms (small stubs) ---
          ctx.fillStyle = bodyColor
          // Left arm
          ctx.beginPath()
          ctx.ellipse(bodyX - 2, bodyY + bodyH * 0.3, s * 0.06, s * 0.1, -0.2, 0, Math.PI * 2)
          ctx.fill()
          ctx.strokeStyle = '#333333'
          ctx.lineWidth = 1
          ctx.stroke()
          // Right arm
          ctx.beginPath()
          ctx.ellipse(bodyX + bodyW + 2, bodyY + bodyH * 0.3, s * 0.06, s * 0.1, 0.2, 0, Math.PI * 2)
          ctx.fill()
          ctx.stroke()
          
          // --- Legs (short, chibi style) ---
          const legW = s * 0.09
          const legH = s * 0.1
          // Left leg
          ctx.fillStyle = '#555566'
          ctx.beginPath()
          ctx.ellipse(bx - legW * 1.1, bodyY + bodyH + legH * 0.4, legW, legH, 0, 0, Math.PI * 2)
          ctx.fill()
          ctx.strokeStyle = '#333333'
          ctx.lineWidth = 1
          ctx.stroke()
          // Right leg
          ctx.beginPath()
          ctx.ellipse(bx + legW * 1.1, bodyY + bodyH + legH * 0.4, legW, legH, 0, 0, Math.PI * 2)
          ctx.fill()
          ctx.stroke()
          
          // Shoes
          ctx.fillStyle = '#8B4513'
          ctx.beginPath()
          ctx.ellipse(bx - legW * 1.1, bodyY + bodyH + legH * 0.8, legW * 1.1, legH * 0.5, 0, 0, Math.PI)
          ctx.fill()
          ctx.beginPath()
          ctx.ellipse(bx + legW * 1.1, bodyY + bodyH + legH * 0.8, legW * 1.1, legH * 0.5, 0, 0, Math.PI)
          ctx.fill()
          
          // === HEAD (big round chibi head) ===
          // Hair back layer
          ctx.fillStyle = hairColor
          ctx.beginPath()
          ctx.arc(headCX, headCY, headR * 1.08, 0, Math.PI * 2)
          ctx.fill()
          
          // Head/face
          ctx.fillStyle = skinColor
          ctx.beginPath()
          ctx.arc(headCX, headCY + headR * 0.08, headR * 0.88, 0, Math.PI * 2)
          ctx.fill()
          ctx.strokeStyle = '#333333'
          ctx.lineWidth = 1.5
          ctx.stroke()
          
          // Hair front layer (JRPG bangs)
          ctx.fillStyle = hairColor
          ctx.beginPath()
          ctx.arc(headCX, headCY - headR * 0.15, headR * 1.05, Math.PI * 1.1, Math.PI * 1.9)
          ctx.quadraticCurveTo(headCX + headR * 0.9, headCY - headR * 0.3, headCX + headR * 0.7, headCY + headR * 0.1)
          ctx.lineTo(headCX + headR * 0.5, headCY + headR * 0.05)
          ctx.lineTo(headCX + headR * 0.2, headCY + headR * 0.15)
          ctx.lineTo(headCX - headR * 0.1, headCY + headR * 0.05)
          ctx.lineTo(headCX - headR * 0.4, headCY + headR * 0.18)
          ctx.lineTo(headCX - headR * 0.6, headCY + headR * 0.05)
          ctx.quadraticCurveTo(headCX - headR * 0.9, headCY - headR * 0.3, headCX - headR * 0.8, headCY - headR * 0.5)
          ctx.closePath()
          ctx.fill()
          
          // Hair side strands
          ctx.beginPath()
          ctx.moveTo(headCX - headR * 0.85, headCY - headR * 0.1)
          ctx.quadraticCurveTo(headCX - headR * 1.1, headCY + headR * 0.5, headCX - headR * 0.75, headCY + headR * 0.7)
          ctx.lineTo(headCX - headR * 0.7, headCY + headR * 0.4)
          ctx.fill()
          ctx.beginPath()
          ctx.moveTo(headCX + headR * 0.85, headCY - headR * 0.1)
          ctx.quadraticCurveTo(headCX + headR * 1.1, headCY + headR * 0.5, headCX + headR * 0.75, headCY + headR * 0.7)
          ctx.lineTo(headCX + headR * 0.7, headCY + headR * 0.4)
          ctx.fill()
          
          // === EYES (big anime-style JRPG eyes) ===
          const eyeW = headR * 0.28
          const eyeH = headR * 0.38
          const eyeLX = headCX - headR * 0.32
          const eyeRX = headCX + headR * 0.32
          const eyeY = headCY + headR * 0.05
          
          // Eye whites
          ctx.fillStyle = eyeWhite
          ctx.beginPath()
          ctx.ellipse(eyeLX, eyeY, eyeW, eyeH, 0, 0, Math.PI * 2)
          ctx.fill()
          ctx.beginPath()
          ctx.ellipse(eyeRX, eyeY, eyeW, eyeH, 0, 0, Math.PI * 2)
          ctx.fill()
          
          // Iris (large, anime style)
          const irisR = eyeW * 0.7
          ctx.fillStyle = eyeColor
          ctx.beginPath()
          ctx.arc(eyeLX, eyeY + eyeH * 0.1, irisR, 0, Math.PI * 2)
          ctx.fill()
          ctx.beginPath()
          ctx.arc(eyeRX, eyeY + eyeH * 0.1, irisR, 0, Math.PI * 2)
          ctx.fill()
          
          // Pupil
          ctx.fillStyle = '#111111'
          ctx.beginPath()
          ctx.arc(eyeLX, eyeY + eyeH * 0.15, irisR * 0.5, 0, Math.PI * 2)
          ctx.fill()
          ctx.beginPath()
          ctx.arc(eyeRX, eyeY + eyeH * 0.15, irisR * 0.5, 0, Math.PI * 2)
          ctx.fill()
          
          // Eye highlight (anime sparkle)
          ctx.fillStyle = eyeHighlight
          ctx.beginPath()
          ctx.arc(eyeLX - irisR * 0.3, eyeY - eyeH * 0.1, irisR * 0.35, 0, Math.PI * 2)
          ctx.fill()
          ctx.beginPath()
          ctx.arc(eyeRX - irisR * 0.3, eyeY - eyeH * 0.1, irisR * 0.35, 0, Math.PI * 2)
          ctx.fill()
          // Small secondary highlight
          ctx.beginPath()
          ctx.arc(eyeLX + irisR * 0.25, eyeY + eyeH * 0.2, irisR * 0.15, 0, Math.PI * 2)
          ctx.fill()
          ctx.beginPath()
          ctx.arc(eyeRX + irisR * 0.25, eyeY + eyeH * 0.2, irisR * 0.15, 0, Math.PI * 2)
          ctx.fill()
          
          // Eye outline
          ctx.strokeStyle = '#222222'
          ctx.lineWidth = 1.2
          ctx.beginPath()
          ctx.ellipse(eyeLX, eyeY, eyeW, eyeH, 0, 0, Math.PI * 2)
          ctx.stroke()
          ctx.beginPath()
          ctx.ellipse(eyeRX, eyeY, eyeW, eyeH, 0, 0, Math.PI * 2)
          ctx.stroke()
          
          // Eyelashes (top, thick)
          ctx.strokeStyle = '#111111'
          ctx.lineWidth = 2
          ctx.beginPath()
          ctx.arc(eyeLX, eyeY, eyeW, Math.PI * 1.15, Math.PI * 1.85)
          ctx.stroke()
          ctx.beginPath()
          ctx.arc(eyeRX, eyeY, eyeW, Math.PI * 1.15, Math.PI * 1.85)
          ctx.stroke()
          
          // --- Mouth (small, cute) ---
          ctx.fillStyle = '#DD7788'
          ctx.beginPath()
          ctx.arc(headCX, headCY + headR * 0.45, headR * 0.08, 0, Math.PI)
          ctx.fill()
          
          // --- Blush (anime cheek blush) ---
          ctx.fillStyle = 'rgba(255, 150, 150, 0.35)'
          ctx.beginPath()
          ctx.ellipse(headCX - headR * 0.5, headCY + headR * 0.3, headR * 0.15, headR * 0.08, 0, 0, Math.PI * 2)
          ctx.fill()
          ctx.beginPath()
          ctx.ellipse(headCX + headR * 0.5, headCY + headR * 0.3, headR * 0.15, headR * 0.08, 0, 0, Math.PI * 2)
          ctx.fill()
        }

        // AI/대화 중 표시 (PixelArtRenderer 위에 그리기)
        if (isConversing || isAi) {
          const s = CHARACTER_SIZE_SCALED
          const cx = x - s / 2
          const cy = y - s / 2 - (bounce * currentScale)
          ctx.strokeStyle = isConversing ? '#FFD700' : '#FF6B6B'
          ctx.lineWidth = isConversing ? 3 : 2
          ctx.strokeRect(cx - 2, cy - 2, s + 4, s + 4)
        }

        // 이모지
        ctx.font = `${CHARACTER_SIZE_SCALED / 2.5}px Arial`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(finalEmoji, x, y - CHARACTER_SIZE_SCALED / 2 - (bounce * currentScale))

        // accessory
        if (accessoryEmoji) {
          ctx.font = `${CHARACTER_SIZE_SCALED / 3}px Arial`
          ctx.fillText(accessoryEmoji, x + CHARACTER_SIZE_SCALED / 3, y - CHARACTER_SIZE_SCALED / 3)
        }

        // 이름
        ctx.font = `${10 * currentScale}px 'Press Start 2P', 'Courier New', monospace`
        ctx.fillStyle = '#ffffff'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'bottom'
        ctx.shadowColor = '#000000'
        ctx.shadowBlur = 2
        ctx.shadowOffsetX = 1
        ctx.shadowOffsetY = 1
        ctx.fillText(displayName, x, y - CHARACTER_SIZE_SCALED / 2)
        ctx.shadowBlur = 0
        ctx.shadowOffsetX = 0
        ctx.shadowOffsetY = 0

        // AI 표시
        if (isAi) {
          ctx.font = `${16 * currentScale}px Arial`
          ctx.fillStyle = '#FF6B6B'
          ctx.fillText('🤖', x + CHARACTER_SIZE_SCALED / 2, y - CHARACTER_SIZE_SCALED / 2 - (8 * currentScale))
        }

        // 호감도
        const affinity = affs[myChar.id]?.[char.id] || 0
        if (affinity !== undefined) {
          const heartSize = Math.max(32, 24 * currentScale)
          const fontSize = Math.max(12, 10 * currentScale)
          ctx.font = `${heartSize}px Arial`
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText('💗', x, y + CHARACTER_SIZE_SCALED / 2 + heartSize / 2 + 5)

          ctx.font = `bold ${fontSize}px Arial`
          ctx.fillStyle = getAffinityColor(affinity)
          ctx.shadowColor = '#000000'
          ctx.shadowBlur = 2
          ctx.fillText(`${affinity}`, x, y + CHARACTER_SIZE_SCALED / 2 + heartSize + fontSize + 5)
          ctx.shadowBlur = 0
        }

        // 감정 이모지
        if (char.id !== myChar.id && affinity !== undefined) {
          const emotionType = char.emotion || getAutoEmotionAffinity(affinity)
          const emotion = emotionSystemRef.current.getEmotion(char.id)

          if (!emotion && affinity !== undefined) {
            emotionSystemRef.current.setEmotion(char.id, emotionType)
          }

          if (emotion) {
            const bounceOffset = emotionSystemRef.current.getBounceOffset(char.id)
            const emotionOpacity = emotionSystemRef.current.getAnimationProgress(char.id)

            ctx.globalAlpha = emotionOpacity
            const emotionX = x + bounceOffset.x
            const emotionY = y - CHARACTER_SIZE_SCALED / 2 + bounceOffset.y
            renderEmotionEmoji(ctx, emotionType, emotionX, emotionY, currentScale, performance.now())
            ctx.globalAlpha = 1
          }
        }

        // 호감도 변화 FX
        const prevAff = prevAffinitiesRef.current[char.id] || 0
        if (affinity !== prevAff && char.id !== myChar.id) {
          const affinityDiff = affinity - prevAff
          if (affinityDiff > 0) {
            fxSystemRef.current.addAffinityUp(x / currentScale, y / currentScale)
          } else if (affinityDiff < 0) {
            fxSystemRef.current.addAffinityDown(x / currentScale, y / currentScale)
          }
          prevAffinitiesRef.current[char.id] = affinity
        }

        // 채팅 버블
        const chatData = msgs[char.id] || (char.id === myChar.id ? msgs[myChar.id] : null)
        if (chatData?.message) {
          renderChatBubble(ctx, chatData.message, x, y, CHARACTER_SIZE_SCALED, currentScale)
        }
      }

      // Render all characters
      Object.values(chars).forEach(char => {
        drawCharacter(char)
      })
      drawCharacter(myChar)

      // 시간 오버레이
      const gameHour = getGameHour(gameStartTime.current)
      const gameMinute = getGameMinute(gameStartTime.current)
      renderTimeOverlay(ctx, gameHour, canvasWidth, canvasHeight)

      // 날씨 파티클 (WeatherTransition - smooth fade)
      renderWeatherTransition(ctx, weatherStateRef.current, canvasWidth, canvasHeight)

      // 시간/날씨 HUD
      renderWeatherTimeHUD(ctx, gameHour, gameMinute, wthr, currentScale)

      // 클릭 효과
      effects.forEach(effect => {
        const age = Date.now() - effect.timestamp
        if (age < 500) {
          const progress = age / 500
          const alpha = 1 - progress

          if (effect.type === 'dust') {
            const dustSize = 8 * currentScale * (1 - progress)
            ctx.fillStyle = `rgba(200, 200, 200, ${alpha})`
            ctx.beginPath()
            ctx.arc(effect.x * currentScale, effect.y * currentScale, dustSize, 0, Math.PI * 2)
            ctx.fill()
          } else {
            const size = (CHARACTER_SIZE_SCALED / 2) * (1 + progress)
            const y = effect.y * currentScale - (CHARACTER_SIZE_SCALED / 2) - (progress * 50)

            ctx.beginPath()
            ctx.font = `${28 * currentScale}px Arial`
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            ctx.globalAlpha = alpha
            ctx.shadowColor = '#FF69B4'
            ctx.shadowBlur = 10
            ctx.fillText('💗', effect.x * currentScale, y)
            ctx.globalAlpha = 1
            ctx.shadowBlur = 0
          }
        }
      })

      // FX 파티클
      fxSystemRef.current.update()
      const fxEffects = fxSystemRef.current.getRenderEffects()
      fxEffects.forEach(fx => {
        const fxX = fx.x * currentScale
        const fxY = fx.y * currentScale
        ctx.save()
        ctx.globalAlpha = fx.opacity
        ctx.translate(fxX, fxY)
        ctx.scale(fx.scale, fx.scale)

        // FX 타입별 렌더링
        switch (fx.type) {
          case NEW_FX_TYPES.JUMP_DUST:
          case NEW_FX_TYPES.AFFINITY_DOWN:
            ctx.fillStyle = fx.color
            ctx.beginPath()
            ctx.arc(0, 0, fx.size / 2, 0, Math.PI * 2)
            ctx.fill()
            break
          case NEW_FX_TYPES.HEART_RISE:
          case NEW_FX_TYPES.AFFINITY_UP:
            ctx.font = `${fx.size}px Arial`
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            ctx.fillText('❤️', 0, 0)
            break
          case NEW_FX_TYPES.CLICK_RIPPLE:
            ctx.strokeStyle = fx.color
            ctx.lineWidth = 2
            ctx.globalAlpha = fx.opacity * 0.5
            ctx.beginPath()
            ctx.arc(0, 0, fx.size / 2, 0, Math.PI * 2)
            ctx.stroke()
            break
          case NEW_FX_TYPES.LOADING:
            ctx.strokeStyle = fx.color
            ctx.lineWidth = 2
            ctx.globalAlpha = fx.opacity
            ctx.beginPath()
            ctx.arc(0, 0, fx.size / 2, 0, Math.PI * 2)
            ctx.stroke()
            break
          case NEW_FX_TYPES.PARTICLE_BURST:
            ctx.fillStyle = fx.color
            ctx.beginPath()
            ctx.arc(0, 0, fx.size / 2, 0, Math.PI * 2)
            ctx.fill()
            break
        }

        ctx.restore()
      })

      // Request next frame
      renderLoopIdRef.current = requestAnimationFrame(render)
    }

    // Start render loop
    console.log('[GameCanvas] Starting render loop...')
    renderLoopIdRef.current = requestAnimationFrame(render)

    // Cleanup function
    return () => {
      console.log('[GameCanvas] Cleaning up render loop...')
      if (renderLoopIdRef.current) {
        cancelAnimationFrame(renderLoopIdRef.current)
      }
    }
    // Minimal dependencies: only things that affect canvas setup
  }, [canvasRef, renderTilemap, spriteSheets.isSpritesLoaded])

  // 캐릭터 클릭 핸들러
  const handleCanvasClick = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const clickY = e.clientY - rect.top

    const container = canvas.parentElement
    const containerWidth = container.clientWidth
    const containerHeight = container.clientHeight
    const scale = Math.min(containerWidth / MAP_SIZE.width, containerHeight / MAP_SIZE.height)

    // 인테리어에 있을 때: 퇴장 버튼 클릭 확인 (Issue #71)
    if (inInterior && exitButtonAreaRef.current) {
      if (isExitButtonClicked(clickX, clickY, exitButtonAreaRef.current)) {
        setInInterior(false)
        setCurrentInterior(null)
        exitButtonAreaRef.current = null
        // 인테리어 퇴장 시 이벤트 처리
        if (onBuildingClick) {
          onBuildingClick({ type: 'exit', building: currentInterior })
        }
        return
      }
    }

    // 인테리어가 아닐 때: 건물 클릭 확인 (Issue #71)
    if (!inInterior) {
      for (const building of buildingsRef.current) {
        if (isBuildingHighlighted(clickX, clickY, building, scale)) {
          // 건물 클릭 시 인테리어 진입
          const interiorData = buildingsInteriorData[building.type]
          if (interiorData && interiorData.interior) {
            setInInterior(true)
            setCurrentInterior(interiorData.interior)
            // 인테리어 진입 이벤트 처리
            if (onBuildingClick) {
              onBuildingClick({ type: 'enter', building, interior: interiorData.interior })
            }
          }
          return
        }
      }
    }

    // 클릭 좌표를 맵 좌표로 변환
    const mapX = clickX / scale
    const mapY = clickY / scale

    // 클릭 리플 FX 효과 추가
    fxSystemRef.current.addClickRipple(mapX, mapY, '#4CAF50')

    // 캐릭터 클릭 감지
    let clickedCharacter = null
    const clickDistanceThreshold = 25 // 클릭 반경

    // 내 클릭 처리 (기존 onClick)
    if (onClick) {
      onClick(e)
    }

    // 다른 캐릭터 클릭 감지
    for (const [id, char] of Object.entries(characters)) {
      const distance = Math.sqrt(Math.pow(char.x - mapX, 2) + Math.pow(char.y - mapY, 2))
      if (distance < clickDistanceThreshold) {
        clickedCharacter = char
        break
      }
    }

    if (clickedCharacter && clickedCharacter.id !== myCharacter.id) {
      setSelectedCharacter(clickedCharacter)
    } else {
      setSelectedCharacter(null)
    }
  }, [canvasRef, characters, myCharacter, onClick, onBuildingClick, inInterior, currentInterior])

  // 프로필 닫기 핸들러
  const handleCloseProfile = useCallback(() => {
    setSelectedCharacter(null)
  }, [])

  return (
    <div className="canvas-container" style={{ position: 'relative' }}>
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        onTouchStart={handleCanvasClick}
      />
      {/* 캐릭터 프로필 카드 */}
      {selectedCharacter && (
        <CharacterProfile
          character={selectedCharacter}
          affinity={affinities[myCharacter.id]?.[selectedCharacter.id] || 0}
          isVisible={true}
          onClose={handleCloseProfile}
          scale={scaleRef.current}
        />
      )}
    </div>
  )
}

/**
 * 채팅 버블 렌더링
 */
function renderChatBubble(ctx, messageText, x, y, charSize, scale) {
  const bubbleMaxWidth = 140 * scale
  const bubblePadding = 10 * scale
  const bubbleFontSize = 11 * scale
  ctx.font = `${bubbleFontSize}px 'Courier New', monospace`
  ctx.imageSmoothingEnabled = false

  const lines = []
  let currentLine = ''

  for (const char of messageText.split('')) {
    const testLine = currentLine + char
    const metrics = ctx.measureText(testLine)

    if (metrics.width > bubbleMaxWidth - (bubblePadding * 2) && currentLine !== '') {
      lines.push(currentLine)
      currentLine = char
    } else {
      currentLine = testLine
    }
  }
  lines.push(currentLine)

  const lineHeight = bubbleFontSize * 1.5
  const bubbleHeight = (lines.length * lineHeight) + (bubblePadding * 2)
  const bubbleWidth = Math.min(
    bubbleMaxWidth,
    Math.max(
      ctx.measureText(lines[0]).width + (bubblePadding * 2),
      ...lines.map(line => ctx.measureText(line).width + (bubblePadding * 2))
    )
  )

  const bubbleX = x - (bubbleWidth / 2)
  const bubbleY = y - charSize - bubbleHeight - (12 * scale)

  // 버블 배경
  ctx.fillStyle = '#ffffff'
  ctx.imageSmoothingEnabled = false
  ctx.fillRect(bubbleX, bubbleY, bubbleWidth, bubbleHeight)

  // 테두리
  ctx.strokeStyle = '#000000'
  ctx.lineWidth = 2
  ctx.strokeRect(bubbleX, bubbleY, bubbleWidth, bubbleHeight)

  // 꼬리
  const tailWidth = 12 * scale
  const tailHeight = 12 * scale
  const tailX = x - (tailWidth / 2)
  const tailY = bubbleY + bubbleHeight

  ctx.fillStyle = '#ffffff'
  ctx.fillRect(tailX, tailY, tailWidth, tailHeight)
  ctx.strokeStyle = '#000000'
  ctx.lineWidth = 2
  ctx.strokeRect(tailX, tailY, tailWidth, tailHeight)

  // 텍스트
  ctx.fillStyle = '#000000'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'

  lines.forEach((line, index) => {
    ctx.fillText(
      line,
      x,
      bubbleY + bubblePadding + (index * lineHeight)
    )
  })
}

function getAffinityColor(affinity) {
  if (affinity <= 2) return '#ff4444'
  if (affinity >= 3 && affinity < 8) return '#ff8800'
  return '#00cc44'
}

GameCanvas.propTypes = {
  myCharacter: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    x: PropTypes.number.isRequired,
    y: PropTypes.number.isRequired,
    color: PropTypes.string.isRequired,
    emoji: PropTypes.string.isRequired,
    isAi: PropTypes.bool.isRequired
  }).isRequired,
  characters: PropTypes.object.isRequired,
  animatedCharacters: PropTypes.object,
  affinities: PropTypes.object.isRequired,
  chatMessages: PropTypes.object.isRequired,
  clickEffects: PropTypes.arrayOf(
    PropTypes.shape({
      x: PropTypes.number.isRequired,
      y: PropTypes.number.isRequired,
      timestamp: PropTypes.number.isRequired,
      type: PropTypes.string.isRequired
    })
  ).isRequired,
  buildings: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      x: PropTypes.number.isRequired,
      y: PropTypes.number.isRequired,
      width: PropTypes.number.isRequired,
      height: PropTypes.number.isRequired,
      type: PropTypes.string.isRequired,
      color: PropTypes.string.isRequired
    })
  ).isRequired,
  canvasRef: PropTypes.object.isRequired,
  onClick: PropTypes.func.isRequired,
  onBuildingClick: PropTypes.func,
  onMove: PropTypes.func,
  characterCustomization: PropTypes.shape({
    hairStyle: PropTypes.string,
    clothingColor: PropTypes.string,
    accessory: PropTypes.string
  })
}

export default GameCanvas