/**
 * 날씨/시간 시스템 (Weather & Time System) v2.0
 * 
 * 게임 내 시간 사이클 (1 게임 일 = 24분 실시간)
 * 날씨 랜덤 변화 (맑음/비/눈/흐림)
 * 강화된 날씨 효과: 실제적인 비/눈 애니메이션 + 페이드 전환
 */

// 게임 시간 상수
const GAME_DAY_DURATION_MS = 24 * 60 * 1000 // 24분 = 1 게임 일
const GAME_HOUR_DURATION_MS = GAME_DAY_DURATION_MS / 24 // 1분 = 1 게임 시간

// 날씨 타입
export const WEATHER_TYPES = {
  CLEAR: 'clear',
  CLOUDY: 'cloudy',
  RAIN: 'rain',
  SNOW: 'snow'
}

// 시간대 타입
export const TIME_PERIODS = {
  DAWN: 'dawn',       // 5-7시
  MORNING: 'morning', // 7-12시
  AFTERNOON: 'afternoon', // 12-17시
  EVENING: 'evening', // 17-20시
  NIGHT: 'night'      // 20-5시
}

// 시간대별 오버레이 색상 & 투명도
const TIME_OVERLAYS = {
  [TIME_PERIODS.DAWN]: { color: 'rgba(255, 180, 100, 0.15)' },
  [TIME_PERIODS.MORNING]: { color: 'rgba(255, 255, 200, 0.05)' },
  [TIME_PERIODS.AFTERNOON]: { color: 'rgba(255, 255, 255, 0)' },
  [TIME_PERIODS.EVENING]: { color: 'rgba(255, 120, 50, 0.2)' },
  [TIME_PERIODS.NIGHT]: { color: 'rgba(0, 0, 40, 0.4)' }
}

// 날씨별 파티클 설정 (강화됨)
const WEATHER_PARTICLES = {
  [WEATHER_TYPES.RAIN]: {
    count: 150,          // 파티클 수 증가
    color: '#88ccff',    // 빗방울 색상
    baseSpeed: 12,       // 기본 속도
    speedVariation: 4,   // 속도 변화
    size: 2,             // 기본 크기
    sizeVariation: 1,    // 크기 변화
    angle: 0.15,         // 바람 각도
    windVariation: 0.05  // 바람 변화
  },
  [WEATHER_TYPES.SNOW]: {
    count: 100,          // 파티클 수 증가
    color: '#ffffff',    // 눈송이 색상
    baseSpeed: 1.5,      // 기본 속도 (느림)
    speedVariation: 1,   // 속도 변화
    size: 4,             // 기본 크기
    sizeVariation: 2,    // 크기 변화
    angle: 0,            // 바람 각도
    windVariation: 0.1,  // 바람 변화 (좌우 흔들림)
    swirlSpeed: 0.02     // 회전 속도
  },
  [WEATHER_TYPES.CLOUDY]: { count: 0 },
  [WEATHER_TYPES.CLEAR]: { count: 0 }
}

// 날씨 전환 설정
const WEATHER_FADE_DURATION_MS = 3000 // 3초 페이드

/**
 * WeatherState 클래스 - 날씨 전환 관리
 */
export class WeatherState {
  constructor(initialWeather = WEATHER_TYPES.CLEAR) {
    this.currentWeather = initialWeather
    this.previousWeather = null
    this.fadeProgress = 1.0 // 0.0 ~ 1.0 (1.0 = 전환 완료)
    this.isTransitioning = false
    this.transitionStartTime = 0
    this.prevParticles = []
    this.currParticles = []
  }

  /**
   * 날씨 전환 시작
   */
  transitionTo(newWeather) {
    if (newWeather === this.currentWeather && !this.isTransitioning) return

    this.previousWeather = this.currentWeather
    this.currentWeather = newWeather
    this.fadeProgress = 0.0
    this.isTransitioning = true
    this.transitionStartTime = Date.now()
    this.prevParticles = this.currParticles
    this.currParticles = []
  }

  /**
   * 페이드 업데이트
   */
  updateFade() {
    if (!this.isTransitioning) return

    const elapsed = Date.now() - this.transitionStartTime
    this.fadeProgress = Math.min(elapsed / WEATHER_FADE_DURATION_MS, 1.0)

    if (this.fadeProgress >= 1.0) {
      this.isTransitioning = false
      this.prevParticles = []
    }
  }

  /**
   * 현재 표시할 날씨 오피시티 계산
   */
  getDisplayOpacities() {
    if (!this.isTransitioning) {
      return { current: 1.0, previous: 0.0 }
    }

    return {
      current: this.fadeProgress,
      previous: 1.0 - this.fadeProgress
    }
  }

  /**
   * 완전히 전환되었는지 확인
   */
  isTransitionComplete() {
    return !this.isTransitioning && this.fadeProgress >= 1.0
  }
}

/**
 * 현재 게임 시간 계산 (0-23 시)
 */
export function getGameHour(startTime = 0) {
  const elapsed = (Date.now() - startTime) % GAME_DAY_DURATION_MS
  return Math.floor((elapsed / GAME_DAY_DURATION_MS) * 24)
}

/**
 * 현재 게임 분 계산 (0-59)
 */
export function getGameMinute(startTime = 0) {
  const elapsed = (Date.now() - startTime) % GAME_DAY_DURATION_MS
  const hourFraction = ((elapsed / GAME_DAY_DURATION_MS) * 24) % 1
  return Math.floor(hourFraction * 60)
}

/**
 * 시간대 결정
 */
export function getTimePeriod(hour) {
  if (hour >= 5 && hour < 7) return TIME_PERIODS.DAWN
  if (hour >= 7 && hour < 12) return TIME_PERIODS.MORNING
  if (hour >= 12 && hour < 17) return TIME_PERIODS.AFTERNOON
  if (hour >= 17 && hour < 20) return TIME_PERIODS.EVENING
  return TIME_PERIODS.NIGHT
}

/**
 * 시간대 오버레이 색상
 */
export function getTimeOverlay(hour) {
  const period = getTimePeriod(hour)
  return TIME_OVERLAYS[period]
}

/**
 * 랜덤 날씨 생성
 */
export function generateRandomWeather() {
  const rand = Math.random()
  if (rand < 0.5) return WEATHER_TYPES.CLEAR
  if (rand < 0.75) return WEATHER_TYPES.CLOUDY
  if (rand < 0.9) return WEATHER_TYPES.RAIN
  return WEATHER_TYPES.SNOW
}

/**
 * 날씨 파티클 생성 (强化版)
 */
export function createWeatherParticles(weather, canvasWidth, canvasHeight) {
  const config = WEATHER_PARTICLES[weather]
  if (!config || config.count === 0) return []

  const particles = []
  for (let i = 0; i < config.count; i++) {
    const size = config.size + Math.random() * config.sizeVariation
    particles.push({
      x: Math.random() * canvasWidth,
      y: Math.random() * canvasHeight,
      speed: config.baseSpeed + Math.random() * config.speedVariation,
      size,
      opacity: 0.4 + Math.random() * 0.6,
      angle: config.angle + (Math.random() - 0.5) * config.windVariation,
      // 눈송이 회전 (snow만)
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: config.swirlSpeed ? (Math.random() - 0.5) * config.swirlSpeed : 0,
      // 눈송이 좌우 흔들림 (snow만)
      swaying: config.swirlSpeed ? Math.random() * Math.PI * 2 : 0,
      swayingSpeed: config.swirlSpeed ? 0.05 + Math.random() * 0.03 : 0,
      swayingAmplitude: config.swirlSpeed ? 30 + Math.random() * 50 : 0
    })
  }
  return particles
}

/**
 * 날씨 파티클 업데이트 (强化版)
 */
export function updateWeatherParticles(particles, weather, canvasWidth, canvasHeight) {
  const config = WEATHER_PARTICLES[weather]
  if (!config || config.count === 0) return particles

  return particles.map(p => {
    let newY = p.y + p.speed
    let newX = p.x + (p.angle * p.speed)

    // 눈송이 좌우 흔들림
    if (weather === WEATHER_TYPES.SNOW) {
      p.swaying += p.swayingSpeed
      newX += Math.sin(p.swaying) * 0.5
      p.rotation += p.rotationSpeed
    }

    // 화면 밖에서 재생성
    if (newY > canvasHeight + 10) {
      newY = -20
      newX = Math.random() * canvasWidth
    }
    if (newX > canvasWidth + 20) newX = -20
    if (newX < -20) newX = canvasWidth + 20

    return { ...p, x: newX, y: newY }
  })
}

/**
 * 날씨 파티클 렌더링 (强化版 - 실제적인 비/눈 효과)
 */
export function renderWeatherParticles(ctx, particles, weather, opacity = 1.0) {
  const config = WEATHER_PARTICLES[weather]
  if (!config || config.count === 0) return

  ctx.save()
  ctx.globalAlpha = opacity

  particles.forEach(p => {
    const particleOpacity = p.opacity * opacity

    if (weather === WEATHER_TYPES.RAIN) {
      // 비 실제 물방울 효과 (tear-drop shape)
      ctx.globalAlpha = particleOpacity
      ctx.strokeStyle = config.color
      ctx.lineWidth = 1.5

      // 움직임 방향으로 비 경사
      const length = p.size * 4
      const angle = Math.atan2(p.angle, 1)
      const endX = p.x + Math.sin(angle) * length
      const endY = p.y + Math.cos(angle) * length

      ctx.beginPath()
      ctx.moveTo(p.x, p.y)
      ctx.lineTo(endX, endY)
      ctx.stroke()

      // 끝부분 강조 (작은 원)
      ctx.fillStyle = config.color
      ctx.beginPath()
      ctx.arc(endX, endY, p.size * 0.3, 0, Math.PI * 2)
      ctx.fill()

    } else if (weather === WEATHER_TYPES.SNOW) {
      // 눈송이 별형 (snowflake)
      ctx.globalAlpha = particleOpacity
      ctx.fillStyle = config.color
      ctx.translate(p.x, p.y)
      ctx.rotate(p.rotation)

      // 별형 눈송이
      const spikes = 6
      const outerRadius = p.size
      const innerRadius = p.size * 0.4

      ctx.beginPath()
      for (let i = 0; i < spikes * 2; i++) {
        const radius = i % 2 === 0 ? outerRadius : innerRadius
        const angle = (i * Math.PI) / spikes
        const x = Math.cos(angle) * radius
        const y = Math.sin(angle) * radius
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.closePath()
      ctx.fill()

      // 중심 밝게
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
      ctx.beginPath()
      ctx.arc(0, 0, p.size * 0.2, 0, Math.PI * 2)
      ctx.fill()

      ctx.setTransform(1, 0, 0, 1, 0, 0) // Reset transform
    }
  })

  ctx.globalAlpha = 1
  ctx.restore()
}

/**
 * 날씨 전환 관리 렌더링
 */
export function renderWeatherTransition(ctx, weatherState, canvasWidth, canvasHeight) {
  weatherState.updateFade()

  const { previous, current } = weatherState.getDisplayOpacities()

  // 이전 날씨 파티클 렌더링 (fade out)
  if (previous > 0 && weatherState.previousWeather && weatherState.prevParticles.length > 0) {
    weatherState.prevParticles = updateWeatherParticles(
      weatherState.prevParticles,
      weatherState.previousWeather,
      canvasWidth,
      canvasHeight
    )
    renderWeatherParticles(ctx, weatherState.prevParticles, weatherState.previousWeather, previous)
  }

  // 현재 날씨 파티클 렌더링 (fade in)
  if (current > 0 && weatherState.currentWeather) {
    if (weatherState.currParticles.length === 0) {
      weatherState.currParticles = createWeatherParticles(
        weatherState.currentWeather,
        canvasWidth,
        canvasHeight
      )
    }
    weatherState.currParticles = updateWeatherParticles(
      weatherState.currParticles,
      weatherState.currentWeather,
      canvasWidth,
      canvasHeight
    )
    renderWeatherParticles(ctx, weatherState.currParticles, weatherState.currentWeather, current)
  }
}

/**
 * 시간 오버레이 렌더링 (Canvas ctx)
 */
export function renderTimeOverlay(ctx, hour, canvasWidth, canvasHeight) {
  const overlay = getTimeOverlay(hour)
  if (overlay.color === 'rgba(255, 255, 255, 0)') return // 투명이면 스킵

  ctx.save()
  ctx.fillStyle = overlay.color
  ctx.fillRect(0, 0, canvasWidth, canvasHeight)
  ctx.restore()
}

/**
 * 시간/날씨 HUD 렌더링
 */
export function renderWeatherTimeHUD(ctx, hour, minute, weather, scale) {
  const hudX = 10 * scale
  const hudY = 10 * scale
  const fontSize = 10 * scale

  ctx.save()
  // HUD 배경
  ctx.fillStyle = 'rgba(0, 0, 0, 0.6)'
  ctx.fillRect(hudX, hudY, 160 * scale, 40 * scale)
  ctx.strokeStyle = '#ffffff'
  ctx.lineWidth = 2
  ctx.strokeRect(hudX, hudY, 160 * scale, 40 * scale)

  // 시간 표시
  const timeStr = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
  const period = getTimePeriod(hour)
  const periodEmoji = {
    [TIME_PERIODS.DAWN]: '🌅',
    [TIME_PERIODS.MORNING]: '☀️',
    [TIME_PERIODS.AFTERNOON]: '🌤️',
    [TIME_PERIODS.EVENING]: '🌇',
    [TIME_PERIODS.NIGHT]: '🌙'
  }

  // 날씨 이모지
  const weatherEmoji = {
    [WEATHER_TYPES.CLEAR]: '☀️',
    [WEATHER_TYPES.CLOUDY]: '☁️',
    [WEATHER_TYPES.RAIN]: '🌧️',
    [WEATHER_TYPES.SNOW]: '❄️'
  }

  ctx.font = `${fontSize}px 'Press Start 2P', monospace`
  ctx.fillStyle = '#ffffff'
  ctx.textAlign = 'left'
  ctx.textBaseline = 'top'

  ctx.fillText(`${periodEmoji[period]} ${timeStr}`, hudX + 8 * scale, hudY + 6 * scale)
  ctx.fillText(`${weatherEmoji[weather]} ${weather.toUpperCase()}`, hudX + 8 * scale, hudY + 22 * scale)

  ctx.restore()
}

// 상수 내보내기
export { GAME_DAY_DURATION_MS, GAME_HOUR_DURATION_MS, WEATHER_FADE_DURATION_MS }