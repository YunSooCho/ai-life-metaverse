/**
 * 날씨/시간 시스템
 *
 * 게임 시간 및 날씨 관리 유틸리티
 *
 * @module weatherTimeSystem
 */

/**
 * 게임 시간 설정
 * 1 게임 일 = 24분 실시간
 * 1 게임 시간 = 1 실시간 분
 */
const GAME_MINUTES_PER_REAL_MINUTE = 1
const GAME_HOURS_PER_REAL_MINUTE = 1 / 60 // 1분에 1/60시간 = 60번의 tick마다 1시간

/**
 * 실시간 ms를 게임 시간(0-23)으로 변환
 *
 * @param {number} currentTimeMs - 현재 시간(밀리초)
 * @returns {number} 게임 시간(hour, 0-23)
 *
 * @example
 * // 하루 자정부터 게임 시작
 * getGameHour(Date.now()) // 현재 게임 시간 반환
 */
export function getGameHour(currentTimeMs) {
  // 하루 자정(00:00)을 기준으로 게임 시간 계산
  const startOfDay = new Date(currentTimeMs)
  startOfDay.setHours(0, 0, 0, 0)

  // 자정으로부터 경과한 시간(ms)
  const elapsedMs = currentTimeMs - startOfDay.getTime()

  // 실시간 분 = 경과 시간(ms) / 60000
  const elapsedRealMinutes = elapsedMs / 60000

  // 게임 시간 = 실시간 분 * (1 게임 시간 / 1 실시간 분)
  const gameHour = elapsedRealMinutes * GAME_MINUTES_PER_REAL_MINUTE

  // 0-23 범위로 정규화
  return Math.floor(gameHour % 24)
}

/**
 * 시간대별 타입 반환
 *
 * @param {number} hour - 게임 시간(0-23)
 * @returns {string} 시간대 타입
 */
export function getTimeOfDay(hour) {
  if (hour >= 5 && hour < 7) return 'dawn'
  if (hour >= 7 && hour < 12) return 'morning'
  if (hour >= 12 && hour < 17) return 'afternoon'
  if (hour >= 17 && hour < 20) return 'evening'
  return 'night'
}

/**
 * 게임 시작 시간을 기준으로 게임 시간 계산
 *
 * @param {number} gameStartTimeMs - 게임 시작 시간(밀리초)
 * @returns {number} 게임 시간(hour, 0-23)
 */
/**
 * 날씨 타입
export const WEATHER_TYPES = {
  CLEAR: 'clear',
  CLOUDY: 'cloudy',
  RAIN: 'rain',
  SNOW: 'snow'
}

/**
 * 시간대별 색상 오버레이
 */
export const TIME_OVERLAY_COLORS = {
  dawn: 'rgba(255, 200, 150, 0.2)',
  morning: 'rgba(255, 255, 200, 0.1)',
  afternoon: 'rgba(255, 220, 150, 0.15)',
  evening: 'rgba(255, 150, 100, 0.25)',
  night: 'rgba(50, 50, 100, 0.3)'
}

/**
 * 날씨 상태 관리 (프론트엔드용)
 */
export class WeatherSystem {
  constructor() {
    this.currentWeather = WEATHER_TYPES.CLEAR
    this.lastWeatherChange = Date.now()
    this.weatherChangeInterval = 5 * 60 * 1000 // 5분마다 변경
  }

  getCurrentWeather() {
    return this.currentWeather
  }

  updateWeather() {
    const now = Date.now()
    if (now - this.lastWeatherChange >= this.weatherChangeInterval) {
      const weatherTypes = Object.values(WEATHER_TYPES)
      this.currentWeather = weatherTypes[Math.floor(Math.random() * weatherTypes.length)]
      this.lastWeatherChange = now
    }
    return this.currentWeather
  }
}