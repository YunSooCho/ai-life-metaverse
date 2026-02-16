/**
 * 날씨/시간 시스템 (Weather & Time System)
 * 
 * 게임 내 시간 사이클 (1 게임 일 = 24분 실시간)
 * 날씨 랜덤 변화 (맑음/비/눈/흐림)
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

// 날씨별 파티클 설정
const WEATHER_PARTICLES = {
  [WEATHER_TYPES.RAIN]: { count: 80, color: '#88ccff', speed: 8, size: 2, angle: 0.1 },
  [WEATHER_TYPES.SNOW]: { count: 40, color: '#ffffff', speed: 2, size: 3, angle: 0 },
  [WEATHER_TYPES.CLOUDY]: { count: 0 },
  [WEATHER_TYPES.CLEAR]: { count: 0 }
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
 * 날씨 파티클 생성
 */
export function createWeatherParticles(weather, canvasWidth, canvasHeight) {
  const config = WEATHER_PARTICLES[weather]
  if (!config || config.count === 0) return []

  const particles = []
  for (let i = 0; i < config.count; i++) {
    particles.push({
      x: Math.random() * canvasWidth,
      y: Math.random() * canvasHeight,
      speed: config.speed + Math.random() * 2,
      size: config.size + Math.random() * 2,
      opacity: 0.3 + Math.random() * 0.7
    })
  }
  return particles
}

/**
 * 날씨 파티클 업데이트
 */
export function updateWeatherParticles(particles, weather, canvasWidth, canvasHeight) {
  const config = WEATHER_PARTICLES[weather]
  if (!config || config.count === 0) return particles

  return particles.map(p => {
    let newY = p.y + p.speed
    let newX = p.x + (config.angle * p.speed)

    if (newY > canvasHeight) {
      newY = -10
      newX = Math.random() * canvasWidth
    }
    if (newX > canvasWidth) newX = 0
    if (newX < 0) newX = canvasWidth

    return { ...p, x: newX, y: newY }
  })
}

/**
 * 날씨 파티클 렌더링 (Canvas ctx)
 */
export function renderWeatherParticles(ctx, particles, weather) {
  const config = WEATHER_PARTICLES[weather]
  if (!config || config.count === 0) return

  ctx.save()
  particles.forEach(p => {
    ctx.globalAlpha = p.opacity
    ctx.fillStyle = config.color

    if (weather === WEATHER_TYPES.RAIN) {
      // 빗방울: 세로 선
      ctx.fillRect(p.x, p.y, 1, p.size * 3)
    } else if (weather === WEATHER_TYPES.SNOW) {
      // 눈: 원형
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
      ctx.fill()
    }
  })
  ctx.globalAlpha = 1
  ctx.restore()
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
export { GAME_DAY_DURATION_MS, GAME_HOUR_DURATION_MS }
