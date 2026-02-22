/**
 * 맵 이벤트 시스템
 * 맵별 고유 이벤트 트리거 및 관리
 */

import { mapExists, getMap } from './maps.js'

// 이벤트 유형
export const MAP_EVENT_TYPES = {
  ENTER: 'enter',           // 맵 입장
  EXIT: 'exit',             // 맵 퇴장
  STAY_DURATION: 'stay_duration', // 특정 시간 머무름
  INTERACTION: 'interaction',      // 특정 오브젝트 상호작용
  TIME_OF_DAY: 'time_of_day',     // 시간대별 이벤트
  WEATHER_CHANGE: 'weather_change', // 날씨 변화
  SEASONAL: 'seasonal'            // 계절별 이벤트
}

// 이벤트 우선순위
export const EVENT_PRIORITIES = {
  LOW: 1,
  MEDIUM: 2,
  HIGH: 3,
  CRITICAL: 4
}

// 맵별 이벤트 설정
export const MAP_EVENTS = {
  default: [
    {
      id: 'default_welcome',
      type: MAP_EVENT_TYPES.ENTER,
      priority: EVENT_PRIORITIES.MEDIUM,
      conditions: {
        isFirstVisit: true
      },
      actions: [
        { type: 'show_message', content: '메인 광장에 오신 것을 환영합니다!' },
        { type: 'give_reward', reward: { type: 'coin', amount: 100 } }
      ],
      cooldown: 0 // 1회성
    },
    {
      id: 'default_festival',
      type: MAP_EVENT_TYPES.TIME_OF_DAY,
      priority: EVENT_PRIORITIES.MEDIUM,
      conditions: {
        hour: [18, 19, 20] // 저녁 6-8시
      },
      actions: [
        { type: 'show_message', content: '저녁 축제가 시작되어 축천하는 군요!' }
      ],
      cooldown: 3600000 // 1시간
    }
  ],

  beach: [
    {
      id: 'beach_sunrise',
      type: MAP_EVENT_TYPES.TIME_OF_DAY,
      priority: EVENT_PRIORITIES.HIGH,
      conditions: {
        hour: [5, 6] // 새벽 5-6시
      },
      actions: [
        { type: 'show_message', content: '해변에서 아름다운 일출을 감상할 수 있습니다!' },
        { type: 'give_reward', reward: { type: 'experience', amount: 50 } }
      ],
      cooldown: 86400000 // 1일
    },
    {
      id: 'beach_shell_collect',
      type: MAP_EVENT_TYPES.INTERACTION,
      priority: EVENT_PRIORITIES.MEDIUM,
      conditions: {
        target: 'sea' // 바다 클릭
      },
      actions: [
        { type: 'show_message', content: '조개를 발견했습니다!' },
        { type: 'give_item', itemId: 'shell', cantidad: 1 }
      ],
      cooldown: 300000 // 5분
    },
    {
      id: 'beach_warm_weather',
      type: MAP_EVENT_TYPES.WEATHER_CHANGE,
      priority: EVENT_PRIORITIES.LOW,
      conditions: {
        toWeather: 'sunny'
      },
      actions: [
        { type: 'show_message', content: '따스한 날씨가 이어지네요!' }
      ],
      cooldown: 7200000 // 2시간
    }
  ],

  forest: [
    {
      id: 'forest_mystery',
      type: MAP_EVENT_TYPES.ENTER,
      priority: EVENT_PRIORITIES.HIGH,
      conditions: {
        timeOfDay: 'night' // 밤
      },
      actions: [
        { type: 'show_message', content: '밤의 숲에서 무언가 신비로운 기운이 느껴집니다...' },
        { type: 'give_item', itemId: 'mysterious_essence', cantidad: 1 }
      ],
      cooldown: 86400000 // 1일
    },
    {
      id: 'forest_butterfly',
      type: MAP_EVENT_TYPES.INTERACTION,
      priority: EVENT_PRIORITIES.LOW,
      conditions: {
        target: 'decorative_tree' // 나무 클릭
      },
      actions: [
        { type: 'show_message', content: '나비가 날아갑니다...' }
      ],
      cooldown: 60000 // 1분
    },
    {
      id: 'forest_rain',
      type: MAP_EVENT_TYPES.WEATHER_CHANGE,
      priority: EVENT_PRIORITIES.MEDIUM,
      conditions: {
        toWeather: 'rainy'
      },
      actions: [
        { type: 'show_message', content: '숲에 비가 내리며 신선한 공기가 느껴집니다!' },
        { type: 'give_reward', reward: { type: 'experience', amount: 30 } }
      ],
      cooldown: 3600000 // 1시간
    }
  ],

  mountain: [
    {
      id: 'mountain_summit',
      type: MAP_EVENT_TYPES.ENTER,
      priority: EVENT_PRIORITIES.HIGH,
      conditions: {
        isFirstVisit: true
      },
      actions: [
        { type: 'show_message', content: '산 정상에 오르셨네요! 멋진 풍경을 즐기세요!' },
        { type: 'give_reward', reward: { type: 'experience', amount: 200 } },
        { type: 'give_title', titleId: 'mountain_climber' }
      ],
      cooldown: 0 // 1회성
    },
    {
      id: 'mountain_snow',
      type: MAP_EVENT_TYPES.WEATHER_CHANGE,
      priority: EVENT_PRIORITIES.HIGH,
      conditions: {
        fromWeather: ['sunny', 'cloudy'],
        toWeather: 'snowy'
      },
      actions: [
        { type: 'show_message', content: '갑작스러운 눈이 내리기 시작했습니다!' },
        { type: 'give_item', itemId: 'snow_crystal', cantidad: 1 }
      ],
      cooldown: 10800000 // 3시간
    },
    {
      id: 'mountain_altitude',
      type: MAP_EVENT_TYPES.STAY_DURATION,
      priority: EVENT_PRIORITIES.MEDIUM,
      conditions: {
        duration: 300000 // 5분 이상 머문 경우
      },
      actions: [
        { type: 'show_message', content: '고지대에서 호흡이 가빠지는 것을 느낍니다...' },
        { type: 'give_reward', reward: { type: 'experience', amount: 100 } }
      ],
      cooldown: 1800000 // 30분
    }
  ]
}

// 캐릭터별 이벤트 기록
// { characterId: { lastTriggeredEvents: { mapId_eventId: timestamp } } }
const eventHistory = new Map()

/**
 * 맵 이벤트 트리거 확인
 * @param {string} characterId - 캐릭터 ID
 * @param {string} mapId - 맵 ID
 * @param {string} eventType - 이벤트 유형
 * @param {Object} context - 이벤트 컨텍스트
 * @returns {Array} 트리거된 이벤트 배열
 */
export function triggerMapEvents(characterId, mapId, eventType, context = {}) {
  if (!mapExists(mapId)) {
    return []
  }

  const events = MAP_EVENTS[mapId] || []
  const triggeredEvents = []

  events.forEach(event => {
    if (event.type !== eventType) {
      return
    }

    // 조건確認
    if (!checkEventConditions(event.conditions, context)) {
      return
    }

    // 쿨다운 확인
    if (!checkEventCooldown(characterId, mapId, event)) {
      return
    }

    // 이벤트 트리거
    triggeredEvents.push({
      ...event,
      triggeredAt: Date.now(),
      characterId,
      mapId
    })

    // 기록 업데이트
    recordEventTrigger(characterId, mapId, event)
  })

  return triggeredEvents
}

/**
 * 이벤트 조건 확인
 * @param {Object} conditions - 조건 객체
 * @param {Object} context - 컨텍스트
 * @returns {boolean} 조건 충족 여부
 */
function checkEventConditions(conditions, context) {
  if (!conditions) {
    return true
  }

  for (const [key, value] of Object.entries(conditions)) {
    switch (key) {
      case 'isFirstVisit':
        if (value && !context.isFirstVisit) return false
        break
      case 'hour':
        const currentHour = new Date().getHours()
        if (!value.includes(currentHour)) return false
        break
      case 'timeOfDay':
        const hour24 = new Date().getHours()
        const timeOfDay = hour24 < 6 ? 'night' : hour24 < 12 ? 'morning' : hour24 < 18 ? 'day' : 'night'
        if (timeOfDay !== value) return false
        break
      case 'target':
        if (context.target !== value) return false
        break
      case 'toWeather':
        if (context.toWeather !== value) return false
        break
      case 'fromWeather':
        if (!value.includes(context.fromWeather)) return false
        break
      case 'duration':
        if (context.stayTime < value) return false
        break
      default:
        console.warn(`Unknown condition: ${key}`)
    }
  }

  return true
}

/**
 * 이벤트 쿨다운 확인
 * @param {string} characterId - 캐릭터 ID
 * @param {string} mapId - 맵 ID
 * @param {Object} event - 이벤트 객체
 * @returns {boolean} 쿨다운 통과 여부
 */
function checkEventCooldown(characterId, mapId, event) {
  const history = eventHistory.get(characterId)
  if (!history) {
    return true
  }

  const key = `${mapId}_${event.id}`
  const lastTriggered = history.lastTriggeredEvents[key]

  if (lastTriggered === undefined) {
    return true
  }

  return Date.now() - lastTriggered >= event.cooldown
}

/**
 * 이벤트 트리거 기록
 * @param {string} characterId - 캐릭터 ID
 * @param {string} mapId - 맵 ID
 * @param {Object} event - 이벤트 객체
 */
function recordEventTrigger(characterId, mapId, event) {
  let history = eventHistory.get(characterId)

  if (!history) {
    history = { lastTriggeredEvents: {} }
    eventHistory.set(characterId, history)
  }

  const key = `${mapId}_${event.id}`
  history.lastTriggeredEvents[key] = Date.now()
}

/**
 * 캐릭터의 이벤트 이력 조회
 * @param {string} characterId - 캐릭터 ID
 * @param {string} mapId - 맵 ID (옵션)
 * @returns {Object} 이벤트 이력
 */
export function getEventHistory(characterId, mapId = null) {
  const history = eventHistory.get(characterId)
  if (!history) {
    return {}
  }

  if (mapId) {
    const filtered = {}
    for (const [key, timestamp] of Object.entries(history.lastTriggeredEvents)) {
      if (key.startsWith(`${mapId}_`)) {
        filtered[key] = timestamp
      }
    }
    return filtered
  }

  return history.lastTriggeredEvents
}

/**
 * 맵별 모든 이벤트 조회
 * @param {string} mapId - 맵 ID
 * @returns {Array} 이벤트 배열
 */
export function getMapEvents(mapId) {
  return MAP_EVENTS[mapId] || []
}

/**
 * 이벤트 우선순위별 정렬
 * @param {Array} events - 이벤트 배열
 * @returns {Array} 정렬된 이벤트 배열
 */
export function sortEventsByPriority(events) {
  return [...events].sort((a, b) => {
    return EVENT_PRIORITIES[b.priority] - EVENT_PRIORITIES[a.priority]
  })
}

/**
 * 캐릭터 이벤트 데이터 내보내기 (Redis 영속화용)
 * @returns {Object} 모든 캐릭터 이벤트 데이터
 */
export function exportEventData() {
  const data = {}
  eventHistory.forEach((value, key) => {
    data[key] = value
  })
  return data
}

/**
 * 캐릭터 이벤트 데이터 불러오기 (Redis 영속화용)
 * @param {Object} data - 불러올 데이터
 */
export function importEventData(data) {
  Object.entries(data).forEach(([characterId, value]) => {
    eventHistory.set(characterId, value)
  })
}

// 시스템 통계
export function getSystemStats() {
  let totalEvents = 0
  let totalMaps = 0

  for (const mapId in MAP_EVENTS) {
    totalEvents += MAP_EVENTS[mapId].length
    totalMaps++
  }

  return {
    totalMaps,
    totalEvents,
    averageEventsPerMap: totalMaps > 0 ? (totalEvents / totalMaps).toFixed(2) : 0,
    totalCharactersWithHistory: eventHistory.size
  }
}