import { useRef, useEffect, useState, useCallback } from 'react'
import PropTypes from 'prop-types'
import Character from './Character'
import ChatBubble from './ChatBubble'
import CharacterProfile from './CharacterProfile'
import spriteLoader from '../utils/spriteLoader'
import spriteRenderer from '../utils/spriteRenderer'
import tileRenderer from '../utils/TileRenderer'
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
  createWeatherParticles,
  updateWeatherParticles,
  renderWeatherParticles,
  renderTimeOverlay,
  renderWeatherTimeHUD,
  WEATHER_TYPES
} from '../utils/weatherTimeSystem'

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

/**
 * 캐릭터 방향 계산
 */
function calculateDirection(prevX, prevY, currX, currY) {
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
  characterCustomization = {
    hairStyle: 'short',
    clothingColor: 'blue',
    accessory: 'none'
  }
}) {
  const [animatedCharacters, setAnimatedCharacters] = useState({})
  const [spriteSheets, setSpriteSheets] = useState({})
  const [isSpritesLoaded, setIsSpritesLoaded] = useState(false)
  const [weather, setWeather] = useState(WEATHER_TYPES.CLEAR)
  const [selectedCharacter, setSelectedCharacter] = useState(null)
  const animationRef = useRef(null)
  const lastTimeRef = useRef(0)
  const characterDirections = useRef({})
  const gameStartTime = useRef(Date.now())
  const weatherParticlesRef = useRef([])
  const lastWeatherChange = useRef(Date.now())
  const fxParticlesRef = useRef([])
  const prevAffinitiesRef = useRef({})

  // 감정 시스템 및 FX 시스템 refs
  const emotionSystemRef = useRef(new EmotionSystem())
  const fxSystemRef = useRef(new FXSystem())

  // 날씨 변경 (5 게임 시간마다 = 5분)
  useEffect(() => {
    const weatherInterval = setInterval(() => {
      setWeather(generateRandomWeather())
      lastWeatherChange.current = Date.now()
    }, 5 * 60 * 1000)
    return () => clearInterval(weatherInterval)
  }, [])

  // 스프라이트 시트 로드
  useEffect(() => {
    const loadSprites = async () => {
      try {
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
      } catch (error) {
        console.error('Failed to load sprites:', error)
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

  const updateCharacterAnimation = useCallback((timestamp) => {
    if (!lastTimeRef.current) {
      lastTimeRef.current = timestamp
    }
    
    const deltaTime = (timestamp - lastTimeRef.current) / 16.67
    lastTimeRef.current = timestamp
    
    setAnimatedCharacters(prev => {
      const updated = { ...prev }
      const directions = { ...characterDirections.current }
      
      Object.values(characters).forEach(char => {
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
          
          // 방향 계산 및 업데이트
          const direction = calculateDirection(prevX, prevY, char.x, char.y)
          directions[char.id] = direction
          spriteRenderer.setAnimationState(char.id, distance > 0.5 ? 'walk' : 'idle')
        } else {
          updated[char.id].x = char.x
          updated[char.id].y = char.y
          directions[char.id] = 'idle'
          spriteRenderer.setAnimationState(char.id, 'idle')
        }
      })
      
      if (!updated[myCharacter.id]) {
        updated[myCharacter.id] = { 
          x: myCharacter.x, 
          y: myCharacter.y,
          prevX: myCharacter.x,
          prevY: myCharacter.y
        }
      }
      
      const myPrevX = updated[myCharacter.id].x
      const myPrevY = updated[myCharacter.id].y
      const myDx = myCharacter.x - (updated[myCharacter.id]?.x || myCharacter.x)
      const myDy = myCharacter.y - (updated[myCharacter.id]?.y || myCharacter.y)
      const myDistance = Math.sqrt(myDx * myDx + myDy * myDy)
      
      if (myDistance > 0.5) {
        const mySpeed = getCharacterSpeed(myCharacter)
        const myMoveDistance = mySpeed * deltaTime
        const myMoveX = (myDx / myDistance) * myMoveDistance
        const myMoveY = (myDy / myDistance) * myMoveDistance
        
        updated[myCharacter.id].x += myMoveX
        updated[myCharacter.id].y += myMoveY
        
        // 방향 계산 및 업데이트
        const direction = calculateDirection(myPrevX, myPrevY, myCharacter.x, myCharacter.y)
        directions[myCharacter.id] = direction
        spriteRenderer.setAnimationState(myCharacter.id, 'walk')
      } else {
        updated[myCharacter.id].x = myCharacter.x
        updated[myCharacter.id].y = myCharacter.y
        directions[myCharacter.id] = 'idle'
        spriteRenderer.setAnimationState(myCharacter.id, 'idle')
      }
      
      characterDirections.current = directions
      return updated
    })
    
    animationRef.current = requestAnimationFrame(updateCharacterAnimation)
  }, [characters, myCharacter, getCharacterSpeed])

  useEffect(() => {
    animationRef.current = requestAnimationFrame(updateCharacterAnimation)
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [updateCharacterAnimation])

  /**
   * 타일맵 렌더링 함수 - TileRenderer 사용
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
   * 건물 스프라이트 렌더링 함수
   */
  const renderBuildingSprite = useCallback((ctx, building, scale, isHighlighted) => {
    const bx = building.x * scale
    const by = building.y * scale
    const bw = building.width * scale
    const bh = building.height * scale

    // 건물 소스 좌표 (buildings.svg SVG viewBox 0 0 800 200)
    const buildingSources = {
      shop: { x: 0, y: 0, width: 128, height: 128 },
      cafe: { x: 128, y: 0, width: 128, height: 128 },
      park: { x: 256, y: 0, width: 200, height: 160 },
      library: { x: 464, y: 0, width: 150, height: 140 },
      gym: { x: 620, y: 0, width: 160, height: 140 }
    }

    // 스프라이트 있는지 확인
    const buildingSprite = spriteSheets.buildings
    if (buildingSprite && buildingSprite instanceof Image && buildingSources[building.sprite]) {
      // 스프라이트 렌더링 (소스 좌표 사용)
      const source = buildingSources[building.sprite]
      ctx.imageSmoothingEnabled = false
      ctx.drawImage(
        buildingSprite,
        source.x, source.y, source.width, source.height, // 소스 좌표
        bx, by, bw, bh // 목표 좌표
      )
    } else {
      // Fallback: 기본 색상 건물 렌더링
      ctx.imageSmoothingEnabled = false
      ctx.fillStyle = building.color
      ctx.fillRect(bx, by, bw, bh)
    }
    
    // 입장 하이라이트 - TileRenderer 사용
    if (isHighlighted) {
      tileRenderer.renderEntranceHighlight(ctx, building.entrance, scale)
    }
    
    // 건물 이름 (레트로 폰트 스타일)
    ctx.font = `${12 * scale}px 'Courier New', monospace`
    ctx.fillStyle = '#ffffff'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.shadowColor = '#000000'
    ctx.shadowBlur = 2
    ctx.fillText(building.name, bx + bw / 2, by + bh / 2)
    ctx.shadowBlur = 0
  }, [spriteSheets])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const container = canvas.parentElement
    if (!container) return
    const containerWidth = container.clientWidth
    const containerHeight = container.clientHeight

    const scale = Math.min(containerWidth / MAP_SIZE.width, containerHeight / MAP_SIZE.height)
    const canvasWidth = MAP_SIZE.width * scale
    const canvasHeight = MAP_SIZE.height * scale

    // 캔버스 크기 설정 (핵심!)
    canvas.width = canvasWidth
    canvas.height = canvasHeight
    canvas.style.width = `${canvasWidth}px`
    canvas.style.height = `${canvasHeight}px`

    const CELL_SIZE_SCALED = CELL_SIZE * scale
    const CHARACTER_SIZE_SCALED = CHARACTER_SIZE * scale

    const render = () => {
      ctx.fillStyle = '#1a1a2e'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // 타일맵 배경 렌더링
      renderTilemap(ctx, scale, canvasWidth, canvasHeight)

      // 건물 렌더링 (픽셀 아트 스타일)
      buildings.forEach(building => {
        renderBuildingSprite(ctx, building, scale, false)
      })

      // 픽셀 아트 그리드 렌더링 (타일맵 위에 가볍게 표시)
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

      const drawCharacter = (char) => {
        const animatedChar = animatedCharacters[char.id] || char
        const x = animatedChar.x * scale
        const y = animatedChar.y * scale
        const { color, emoji, name, isAi, isConversing } = char
        const displayName = name || '익명'  // Fallback: name이 undefined이면 '익명' 표시
        const direction = characterDirections.current[char.id] || 'idle'
        const timestamp = performance.now()

        // myCharacter인지 확인
        const isMyCharacter = char.id === myCharacter.id

        // 커스터마이징 정보 가져오기 (myCharacter만)
        const customization = isMyCharacter ? characterCustomization : null
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

        // 스프라이트 렌더링 (사용 가능한 경우)
        if (isSpritesLoaded && spriteSheets.character) {
          spriteRenderer.renderCharacterSprite(
            ctx,
            spriteSheets.character,
            char.id,
            x,
            y,
            CHARACTER_SIZE_SCALED * 1.5,
            direction,
            timestamp,
            150
          )
        } else {
          // fallback: 원형 캐릭터 렌더링
          ctx.beginPath()
          ctx.arc(x, y, CHARACTER_SIZE_SCALED / 2, 0, Math.PI * 2)
          ctx.fillStyle = finalCharColor
          ctx.fill()
          ctx.strokeStyle = isConversing ? '#FFD700' : (isAi ? '#FF6B6B' : '#4CAF50')
          ctx.lineWidth = isConversing ? 4 : 3
          ctx.stroke()

          ctx.font = `${CHARACTER_SIZE_SCALED / 2}px Arial`
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText(finalEmoji, x, y)
        }

        // accessory 별도 표시 (myCharacter만)
        if (accessoryEmoji) {
          ctx.font = `${CHARACTER_SIZE_SCALED / 3}px Arial`
          ctx.fillText(accessoryEmoji, x + CHARACTER_SIZE_SCALED / 3, y - CHARACTER_SIZE_SCALED / 3)
        }

        // 캐릭터 이름 (픽셀 아트 스타일)
        ctx.font = `${10 * scale}px 'Press Start 2P', 'Courier New', monospace`
        ctx.fillStyle = '#ffffff'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'bottom'
        
        // 이름에 그림자 효과
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
          ctx.font = `${16 * scale}px Arial`
          ctx.fillStyle = '#FF6B6B'
          ctx.fillText('🤖', x + CHARACTER_SIZE_SCALED / 2, y - CHARACTER_SIZE_SCALED / 2 - (8 * scale))
        }

        // 호감도 디스플레이
        const affinity = affinities[myCharacter.id]?.[char.id] || 0
        if (affinity !== undefined) {
          const heartSize = Math.max(32, 24 * scale)
          const fontSize = Math.max(12, 10 * scale)
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

        // 감정 이모지 렌더링 (EmotionSystem 사용)
        if (char.id !== myCharacter.id && affinity !== undefined) {
          const emotionType = char.emotion || getAutoEmotionAffinity(affinity)
          const emotion = emotionSystemRef.current.getEmotion(char.id)
          
          // 감정이 없으면 자동 설정
          if (!emotion && affinity !== undefined) {
            emotionSystemRef.current.setEmotion(char.id, emotionType)
          }
          
          if (emotion) {
            const bounceOffset = emotionSystemRef.current.getBounceOffset(char.id)
            const emotionOpacity = emotionSystemRef.current.getAnimationProgress(char.id)
            
            ctx.globalAlpha = emotionOpacity
            const emotionX = x + bounceOffset.x
            const emotionY = y - CHARACTER_SIZE_SCALED / 2 + bounceOffset.y
            renderEmotionEmoji(ctx, emotionType, emotionX, emotionY, scale, performance.now())
            ctx.globalAlpha = 1
          }
        }

        // 호감도 변화 FX 감지 (FXSystem 사용)
        const prevAff = prevAffinitiesRef.current[char.id] || 0
        if (affinity !== prevAff && char.id !== myCharacter.id) {
          const affinityDiff = affinity - prevAff
          if (affinityDiff > 0) {
            fxSystemRef.current.addAffinityUp(x / scale, y / scale)
          } else if (affinityDiff < 0) {
            fxSystemRef.current.addAffinityDown(x / scale, y / scale)
          }
          prevAffinitiesRef.current[char.id] = affinity
        }

        // 채팅 버블 렌더링
        const chatData = chatMessages[char.id] || (char.id === myCharacter.id ? chatMessages[myCharacter.id] : null)

        if (chatData?.message) {
          renderChatBubble(ctx, chatData.message, x, y, CHARACTER_SIZE_SCALED, scale)
        }
      }

      Object.values(characters).forEach(char => {
        drawCharacter(char)
      })

      drawCharacter(myCharacter)

      // 시간 오버레이 렌더링
      const gameHour = getGameHour(gameStartTime.current)
      const gameMinute = getGameMinute(gameStartTime.current)
      renderTimeOverlay(ctx, gameHour, canvasWidth, canvasHeight)

      // 날씨 파티클 업데이트 & 렌더링
      if (weatherParticlesRef.current.length === 0 && (weather === WEATHER_TYPES.RAIN || weather === WEATHER_TYPES.SNOW)) {
        weatherParticlesRef.current = createWeatherParticles(weather, canvasWidth, canvasHeight)
      } else if (weather !== WEATHER_TYPES.RAIN && weather !== WEATHER_TYPES.SNOW) {
        weatherParticlesRef.current = []
      }
      weatherParticlesRef.current = updateWeatherParticles(weatherParticlesRef.current, weather, canvasWidth, canvasHeight)
      renderWeatherParticles(ctx, weatherParticlesRef.current, weather)

      // 시간/날씨 HUD
      renderWeatherTimeHUD(ctx, gameHour, gameMinute, weather, scale)

      // 클릭 효과 렌더링
      clickEffects.forEach(effect => {
        const age = Date.now() - effect.timestamp
        if (age < 500) {
          const progress = age / 500
          const alpha = 1 - progress

          if (effect.type === 'dust') {
            // Dust FX 렌더링
            const dustSize = 8 * scale * (1 - progress)
            ctx.fillStyle = `rgba(200, 200, 200, ${alpha})`
            ctx.beginPath()
            ctx.arc(effect.x * scale, effect.y * scale, dustSize, 0, Math.PI * 2)
            ctx.fill()
          } else {
            // 하트 FX 렌더링 (기존)
            const size = (CHARACTER_SIZE_SCALED / 2) * (1 + progress)
            const y = effect.y * scale - (CHARACTER_SIZE_SCALED / 2) - (progress * 50)

            ctx.beginPath()
            ctx.font = `${28 * scale}px Arial`
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            ctx.globalAlpha = alpha
            ctx.shadowColor = '#FF69B4'
            ctx.shadowBlur = 10
            ctx.fillText('💗', effect.x * scale, y)
            ctx.globalAlpha = 1
            ctx.shadowBlur = 0
          }
        }
      })

      // FX 파티클 업데이트 및 렌더링 (FXSystem 사용)
      fxSystemRef.current.update()
      const fxEffects = fxSystemRef.current.getRenderEffects()
      fxEffects.forEach(fx => {
        const fxX = fx.x * scale
        const fxY = fx.y * scale
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

      renderLoopId = requestAnimationFrame(render)
    }
    
    let renderLoopId = requestAnimationFrame(render)

    // Cleanup: 이전 렌더 루프 취소 (중복 방지!)
    return () => {
      cancelAnimationFrame(renderLoopId)
    }
  }, [myCharacter, characters, chatMessages, affinities, clickEffects, buildings, animatedCharacters, isSpritesLoaded, spriteSheets, weather])

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
  }, [canvasRef, characters, myCharacter, onClick])

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
          scale={scale}
        />
      )}
    </div>
  )
}

/**
 * 채팅 버블 렌더링 (레트로 스타일)
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

  // 레트로 스타일 버블 배경
  ctx.fillStyle = '#ffffff'
  ctx.imageSmoothingEnabled = false
  ctx.fillRect(bubbleX, bubbleY, bubbleWidth, bubbleHeight)

  // 레트로 스타일 테두리
  ctx.strokeStyle = '#000000'
  ctx.lineWidth = 2
  ctx.strokeRect(bubbleX, bubbleY, bubbleWidth, bubbleHeight)

  // 꼬리 부분
  const tailWidth = 12 * scale
  const tailHeight = 12 * scale
  const tailX = x - (tailWidth / 2)
  const tailY = bubbleY + bubbleHeight

  ctx.fillStyle = '#ffffff'
  ctx.fillRect(tailX, tailY, tailWidth, tailHeight)
  ctx.strokeStyle = '#000000'
  ctx.lineWidth = 2
  ctx.strokeRect(tailX, tailY, tailWidth, tailHeight)

  // 텍스트 렌더링
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
  characterCustomization: PropTypes.shape({
    hairStyle: PropTypes.string,
    clothingColor: PropTypes.string,
    accessory: PropTypes.string
  })
}

export default GameCanvas