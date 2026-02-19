/**
 * 날씨 시스템 브리지
 * 맵 시스템과 날씨 시스템 연동
 */

import { getMap, getAllMaps } from './maps.js'

// 날씨 유형 (backend/weather-system/weather.js의 날씨와 연동)
export const WEATHER_TYPES = {
  SUNNY: 'sunny',
  CLOUDY: 'cloudy',
  RAINY: 'rainy',
  SNOWY: 'snowy',
  WINDY: 'windy',
  FOGGY: 'foggy'
}

// 맵별 기본 날씨 설정
export const DEFAULT_WEATHER = {
  default: {
    type: WEATHER_TYPES.SUNNY,
    temperature: 22,
    humidity: 50,
    windSpeed: 10
  },
  beach: {
    type: WEATHER_TYPES.SUNNY,
    temperature: 28,
    humidity: 60,
    windSpeed: 15
  },
  forest: {
    type: WEATHER_TYPES.CLOUDY,
    temperature: 20,
    humidity: 70,
    windSpeed: 5
  },
  mountain: {
    type: WEATHER_TYPES.SNOWY,
    temperature: -5,
    humidity: 80,
    windSpeed: 25
  }
}

// 맵별 날씨 확률 (자동 날씨 변환용)
export const WEATHER_PROBABILITIES = {
  default: {
    [WEATHER_TYPES.SUNNY]: 40,
    [WEATHER_TYPES.CLOUDY]: 30,
    [WEATHER_TYPES.RAINY]: 20,
    [WEATHER_TYPES.SNOWY]: 10
  },
  beach: {
    [WEATHER_TYPES.SUNNY]: 60,
    [WEATHER_TYPES.CLOUDY]: 25,
    [WEATHER_TYPES.RAINY]: 10,
    [WEATHER_TYPES.WINDY]: 5
  },
  forest: {
    [WEATHER_TYPES.SUNNY]: 30,
    [WEATHER_TYPES.CLOUDY]: 35,
    [WEATHER_TYPES.RAINY]: 30,
    [WEATHER_TYPES.FOGGY]: 5
  },
  mountain: {
    [WEATHER_TYPES.SUNNY]: 20,
    [WEATHER_TYPES.CLOUDY]: 25,
    [WEATHER_TYPES.RAINY]: 15,
    [WEATHER_TYPES.SNOWY]: 40
  }
}

// 실시간 날씨 상태 (맵별 현재 날씨)
// { mapId: { type, temperature, humidity, windSpeed, lastUpdate } }
const currentWeather = new Map()

/**
 * 맵의 현재 날씨 조회
 * @param {string} mapId - 맵 ID
 * @returns {Object} 날씨 데이터
 */
export function getMapWeather(mapId) {
  if (currentWeather.has(mapId)) {
    return currentWeather.get(mapId)
  }

  // 기본 날씨 반환
  return DEFAULT_WEATHER[mapId] || DEFAULT_WEATHER.default
}

/**
 * 맵의 날씨 설정
 * @param {string} mapId - 맵 ID
 * @param {Object} weather - 날씨 객체
 * @returns {boolean} 설정 성공 여부
 */
export function setMapWeather(mapId, weather) {
  const weatherData = {
    type: weather.type || WEATHER_TYPES.SUNNY,
    temperature: weather.temperature || 22,
    humidity: weather.humidity || 50,
    windSpeed: weather.windSpeed || 10,
    lastUpdate: Date.now()
  }

  currentWeather.set(mapId, weatherData)
  return true
}

/**
 * 맵의 날씨 랜덤 변경 (자동 날씨 시뮬레이션용)
 * @param {string} mapId - 맵 ID
 * @returns {Object|null} 변경된 날씨
 */
export function randomizeMapWeather(mapId) {
  const probabilities = WEATHER_PROBABILITIES[mapId] || WEATHER_PROBABILITIES.default

  // 랜덤 날씨 선택
  const random = Math.random() * 100
  let cumulative = 0
  let selectedWeather = WEATHER_TYPES.SUNNY

  for (const [type, probability] of Object.entries(probabilities)) {
    cumulative += probability
    if (random <= cumulative) {
      selectedWeather = type
      break
    }
  }

  // 온도 조정
  const baseTemp = DEFAULT_WEATHER[mapId]?.temperature || 22
  const tempVariation = Math.floor(Math.random() * 10) - 5 // -5 ~ +5

  const newWeather = {
    type: selectedWeather,
    temperature: baseTemp + tempVariation,
    humidity: 50 + Math.floor(Math.random() * 30), // 50 ~ 80%
    windSpeed: 5 + Math.floor(Math.random() * 20) // 5 ~ 25
  }

  setMapWeather(mapId, newWeather)
  return newWeather
}

/**
 * 맵 날씨 기반 이벤트 트리거
 * @param {string} mapId - 맵 ID
 * @returns {Array} 날씨 기반 이벤트 배열
 */
export function getWeatherBasedEvents(mapId) {
  const weather = getMapWeather(mapId)
  const events = []

  switch (weather.type) {
    case WEATHER_TYPES.SUNNY:
      events.push({
        type: 'weather_sunny',
        message: '맑은 날씨입니다! 기분이 좋아지는군요.',
        effects: ['mood_boost', 'activity_bonus']
      })
      break

    case WEATHER_TYPES.RAINY:
      events.push({
        type: 'weather_rainy',
        message: '비가 내리고 있습니다. 실내에서의 활동이 추천됩니다.',
        effects: ['indoor_bonus', 'outdoor_penalty']
      })
      break

    case WEATHER_TYPES.SNOWY:
      events.push({
        type: 'weather_snowy',
        message: '눈이 내리고 있습니다! 겨울의 정취를 즐겨보세요.',
        effects: ['special_item_drop']
      })
      break

    case WEATHER_TYPES.FOGGY:
      events.push({
        type: 'weather_foggy',
        message: '안개가 자욱합니다. 시야가 제한됩니다.',
        effects: ['hidden_locations_bonus', 'discovery_chance_up']
      })
      break

    case WEATHER_TYPES.WINDY:
      events.push({
        type: 'weather_windy',
        message: '바람이 붑니다. 든든한 옷을 입는 것이 좋겠어요.',
        effects: ['movement_speed_bonus', 'wind_item_chance']
      })
      break
  }

  return events
}

/**
 * 날씨별 UI 효과 데이터
 * @param {string} mapId - 맵 ID
 * @returns {Object} UI 효과 데이터
 */
export function getWeatherUIEffects(mapId) {
  const weather = getMapWeather(mapId)

  return {
    weatherType: weather.type,
    // 비 효과
    rain: {
      enabled: weather.type === WEATHER_TYPES.RAINY,
      intensity: weather.humidity / 100, // 습도 기반 강도
      color: '#6B9BD1',
      dropType: 'teardrop',
      angle: weather.windSpeed > 15 ? 15 : 0, // 바람 기반 각도
      speed: 15 + weather.windSpeed
    },
    // 눈 효과
    snow: {
      enabled: weather.type === WEATHER_TYPES.SNOWY,
      intensity: Math.abs(weather.temperature) / 30, // 온도 기반 강도
      color: '#FFFFFF',
      shape: 'star', // 별형
      swayAmount: weather.windSpeed, // 흔들림
      speed: 5 + weather.windSpeed / 2
    },
    // 바람 효과
    wind: {
      enabled: weather.windSpeed > 20,
      direction: 'right',
      speed: weather.windSpeed
    },
    // 안개 효과
    fog: {
      enabled: weather.type === WEATHER_TYPES.FOGGY,
      opacity: 0.6,
      color: '#E0E0E0'
    }
  }
}

/**
 * 계절에 따른 맵 날씨 자동 조정 (시즌 이벤트용)
 * @param {string} season - 계절 (spring, summer, autumn, winter)
 * @returns {boolean} 조정 성공 여부
 */
export function adjustWeatherBySeason(season) {
  const allMaps = getAllMaps()

  allMaps.forEach(map => {
    let newWeatherType

    switch (season) {
      case 'spring':
        newWeather = DEFAULT_WEATHER[map.id].type === WEATHER_TYPES.SNOWY
          ? WEATHER_TYPES.CLOUDY
          : DEFAULT_WEATHER[map.id].type
        break
      case 'summer':
        newWeather = [WEATHER_TYPES.SUNNY, WEATHER_TYPES.WINDY].includes(DEFAULT_WEATHER[map.id].type)
          ? WEATHER_TYPES.SUNNY
          : WEATHER_TYPES.CLOUDY
        break
      case 'autumn':
        newWeather = [WEATHER_TYPES.SUNNY, WEATHER_TYPES.WINDY].includes(DEFAULT_WEATHER[map.id].type)
          ? WEATHER_TYPES.CLOUDY
          : WEATHER_TYPES.RAINY
        break
      case 'winter':
        if (map.id === 'mountain') {
          newWeather = WEATHER_TYPES.SNOWY
        } else if (map.id === 'default') {
          newWeather = WEATHER_TYPES.CLOUDY
        } else {
          newWeather = DEFAULT_WEATHER[map.id].type
        }
        break
    }

    if (newWeather) {
      randomizeMapWeather(map.id)
    }
  })

  return true
}

/**
 * 날씨 예보 생성
 * @param {string} mapId - 맵 ID
 * @param {number} hours - 예보 기간 (시간)
 * @returns {Array} 예보 배열
 */
export function generateWeatherForecast(mapId, hours = 24) {
  const forecast = []
  const weather = getMapWeather(mapId)

  for (let i = 1; i <= hours; i++) {
    // 간단한 예보 로직
    const forecastTime = new Date(Date.now() + i * 3600000)
    const hour = forecastTime.getHours()

    let predictedWeather = weather.type

    // 시간대에 따른 날씨 패턴
    if (hour >= 6 && hour < 12) {
      // 아침: 맑은 날씨 높은 확률
      predictedWeather = Math.random() > 0.3 ? WEATHER_TYPES.SUNNY : weather.type
    } else if (hour >= 12 && hour < 18) {
      // 오후: 구름 높은 확률
      predictedWeather = Math.random() > 0.5 ? WEATHER_TYPES.CLOUDY : weather.type
    } else if (hour >= 18 && hour < 24) {
      // 저녁: 비/눈 높은 확률
      if (Math.random() > 0.7) {
        predictedWeather = mapId === 'mountain' ? WEATHER_TYPES.SNOWY : WEATHER_TYPES.RAINY
      }
    }

    forecast.push({
      hour: hour,
      type: predictedWeather,
      temperature: weather.temperature + Math.floor(Math.random() * 6) - 3,
      timestamp: forecastTime.getTime()
    })
  }

  return forecast
}

/**
 * 모든 맵의 날씨 동기화 (시스템 브로드캐스트용)
 * @returns {Object} 모든 맵 날씨 데이터
 */
export function syncAllWeather() {
  const allMaps = getAllMaps()
  const weatherData = {}

  allMaps.forEach(map => {
    weatherData[map.id] = {
      mapId: map.id,
      mapName: map.name,
      weather: getMapWeather(map.id),
      uiEffects: getWeatherUIEffects(map.id)
    }
  })

  return weatherData
}

/**
 * 날씨 데이터 내보내기 (Redis 영속화용)
 * @returns {Object} 모든 날씨 데이터
 */
export function exportWeatherData() {
  const data = {}
  currentWeather.forEach((value, key) => {
    data[key] = value
  })
  return data
}

/**
 * 날씨 데이터 불러오기 (Redis 영속화용)
 * @param {Object} data - 불러올 데이터
 */
export function importWeatherData(data) {
  Object.entries(data).forEach(([mapId, value]) => {
    currentWeather.set(mapId, value)
  })
}

// 시스템 통계
export function getSystemStats() {
  return {
    totalMaps: currentWeather.size,
    weatherDistribution: {
      sunny: 0,
      cloudy: 0,
      rainy: 0,
      snowy: 0,
      windy: 0,
      foggy: 0
    }
  }
}