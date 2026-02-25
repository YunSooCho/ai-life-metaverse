/**
 * 비밀 장소 시스템
 * 맵 내 숨겨진 장소, 아이템, Easter Egg 관리
 */

import { mapExists, getMap } from './maps.js'

// 발견 난이도
export const DIFFICULTY_LEVELS = {
  EASY: 'easy',            // 쉬움 (명시적인 단서)
  NORMAL: 'normal',        // 보통 (약간의 단서)
  HARD: 'hard',            // 어려움 (미묘한 단서)
  EXPERT: 'expert',        // 전문가 (거의 단서 없음)
  LEGENDARY: 'legendary'   // 전설 (숨겨진 힌트 필요)
}

// 발견 유형
export const DISCOVERY_TYPES = {
  LOCATION: 'location',    // 비밀 장소 발견
  ITEM: 'item',            // 숨겨진 아이템 발견
  EASTER_EGG: 'easter_egg', // 이스터 에그
  SECRET_PASSAGE: 'secret_passage', // 비밀 통로
  HIDDEN_CHEST: 'hidden_chest'      // 숨겨진 상자
}

// 비밀 장소 데이터
export const HIDDEN_LOCATIONS = {
  default: [
    {
      id: 'hidden_garden',
      name: '숨겨진 정원',
      description: '메인 광장 뒤편의 아름다운 정원',
      type: DISCOVERY_TYPES.LOCATION,
      difficulty: DIFFICULTY_LEVELS.NORMAL,
      position: { x: 950, y: 100, width: 50, height: 50 },
      conditions: {
        requiredInteractions: 10 // 광장에서 10회 이상 상호작션
      },
      rewards: [
        { type: 'experience', amount: 100 },
        { type: 'item', itemId: 'magic_flower', quantity: 1 }
      ],
      hints: [
        '광장의 한쪽 구석에서 기묘한 향기가 나는군요...'
      ],
      firstDiscoverer: null,
      discoveryCount: 0
    },
    {
      id: 'underground_tunnel',
      name: '지하 터널',
      description: '맵 아래로 이어지는 비밀 터널',
      type: DISCOVERY_TYPES.SECRET_PASSAGE,
      difficulty: DIFFICULTY_LEVELS.HARD,
      position: { x: 750, y: 650, width: 100, height: 50 },
      conditions: {
        requiredLevel: 20,
        requiredMap: ['beach', 'forest'] // 해변과 숲을 방문해야 함
      },
      rewards: [
        { type: 'coin', amount: 500 },
        { type: 'item', itemId: 'ancient_map', quantity: 1 }
      ],
      hints: [
        '어딘가에서 바람 소리가 들리는 것 같습니다...'
      ],
      firstDiscoverer: null,
      discoveryCount: 0
    }
  ],

  beach: [
    {
      id: 'pirate_treasure',
      name: '해적 보물',
      description: '모래사장 깊이 묻혀있는 해적의 보물',
      type: DISCOVERY_TYPES.HIDDEN_CHEST,
      difficulty: DIFFICULTY_LEVELS.EASY,
      position: { x: 100, y: 500, width: 100, height: 100 },
      conditions: {
        requiredInteractions: 5
      },
      rewards: [
        { type: 'coin', amount: 1000 },
        { type: 'item', itemId: 'pirate_hat', quantity: 1 }
      ],
      hints: [
        '모래사장에서 반짝이는 것이 보입니다...',
        '삽을 찾아보세요...'
      ],
      firstDiscoverer: null,
      discoveryCount: 0
    },
    {
      id: 'sea_cave',
      name: '바다 동굴',
      description: '해변 끝의 숨겨진 동굴',
      type: DISCOVERY_TYPES.LOCATION,
      difficulty: DIFFICULTY_LEVELS.HARD,
      position: { x: 1150, y: 200, width: 50, height: 100 },
      conditions: {
        requiredInteractions: 20,
        timeOfDay: 'night' // 밤에만 발견 가능
      },
      rewards: [
        { type: 'experience', amount: 300 },
        { type: 'item', itemId: 'sea_pearl', quantity: 1 }
      ],
      hints: [
        '파도 소리 뒤로 다른 소리가 들리는 것 같습니다...',
        '밤을 기다려보세요...'
      ],
      firstDiscoverer: null,
      discoveryCount: 0
    }
  ],

  forest: [
    {
      id: 'ancient_ruins',
      name: '고대 폐허',
      description: '숲 깊이 숨겨진 고대 문명의 흔적',
      type: DISCOVERY_TYPES.LOCATION,
      difficulty: DIFFICULTY_LEVELS.EXPERT,
      position: { x: 550, y: 600, width: 100, height: 150 },
      conditions: {
        requiredLevel: 30,
        requiredMaps: ['default', 'beach', 'mountain'],
        requiredInteractions: 50
      },
      rewards: [
        { type: 'experience', amount: 1000 },
        { type: 'item', itemId: 'ancient_artifact', quantity: 1 },
        { type: 'title', titleId: 'explorer' }
      ],
      hints: [
        '숲의 어딘가에 과거의 흔적이 남아있습니다...',
        '모든 맵을 탐험해보세요...'
      ],
      firstDiscoverer: null,
      discoveryCount: 0
    },
    {
      id: 'fairy_circle',
      name: '요정의 원',
      description: '밤에만 나타나는 신비로운 원형 터',
      type: DISCOVERY_TYPES.EASTER_EGG,
      difficulty: DIFFICULTY_LEVELS.LEGENDARY,
      position: { x: 300, y: 300, width: 150, height: 150 },
      conditions: {
        timeOfDay: 'night',
        season: 'summer', // 여름에만
        moonPhase: 'full' // 보름달일 때
      },
      rewards: [
        { type: 'experience', amount: 5000 },
        { type: 'item', itemId: 'fairy_dust', quantity: 3 },
        { type: 'title', titleId: 'fairy_friend' }
      ],
      hints: [
        '여름의 보름달 밤에 무언가 신비로운 일이 일어날지 모릅니다...'
      ],
      firstDiscoverer: null,
      discoveryCount: 0
    }
  ],

  mountain: [
    {
      id: 'summit_cave',
      name: '산 정상의 동굴',
      description: '산 정상의 폐쇄된 동굴',
      type: DISCOVERY_TYPES.SECRET_PASSAGE,
      difficulty: DIFFICULTY_LEVELS.HARD,
      position: { x: 650, y: 200, width: 100, height: 100 },
      conditions: {
        requiredLevel: 25,
        requiredInteractions: 30,
        weather: 'snowy' // 눈이 올 때만
      },
      rewards: [
        { type: 'experience', amount: 400 },
        { type: 'item', itemId: 'ice_crystal', quantity: 1 }
      ],
      hints: [
        '눈이 올 때 산 정상에서 기묘한 소리가 들립니다...'
      ],
      firstDiscoverer: null,
      discoveryCount: 0
    },
    {
      id: 'hidden_hot_spring',
      name: '숨겨진 온천',
      description: '동굴 안의 온천',
      type: DISCOVERY_TYPES.LOCATION,
      difficulty: DIFFICULTY_LEVELS.NORMAL,
      position: { x: 800, y: 750, width: 150, height: 100 },
      conditions: {
        requiredInteractions: 15
      },
      rewards: [
        { type: 'experience', amount: 200 },
        { type: 'item', itemId: 'spring_water', quantity: 2 }
      ],
      hints: [
        '따뜻한 증기가 피어오르는 곳이 있습니다...'
      ],
      firstDiscoverer: null,
      discoveryCount: 0
    }
  ]
}

// 발견 기록
// { characterId: [ { locationId, mapId, discoveredAt } ] }
const discoveryRecords = new Map()

/**
 * 맵별 비밀 장소 목록 조회
 * @param {string} mapId - 맵 ID
 * @returns {Array} 비밀 장소 배열
 */
export function getHiddenLocations(mapId) {
  if (!mapExists(mapId)) {
    return []
  }
  return HIDDEN_LOCATIONS[mapId] || []
}

/**
 * 캐릭터의 발견 기록 조회
 * @param {string} characterId - 캐릭터 ID
 * @returns {Array} 발견 기록 배열
 */
export function getDiscoveries(characterId) {
  return discoveryRecords.get(characterId) || []
}

/**
 * 캐릭터가 특정 위치를 발견했는지 확인
 * @param {string} characterId - 캐릭터 ID
 * @param {string} locationId - 위치 ID
 * @returns {boolean} 발견 여부
 */
export function hasDiscovered(characterId, locationId) {
  const discoveries = getDiscoveries(characterId)
  return discoveries.some(d => d.locationId === locationId)
}

/**
 * 비밀 장소 발견 시도
 * @param {string} characterId - 캐릭터 ID
 * @param {string} mapId - 맵 ID
 * @param {number} x - X 좌표
 * @param {number} y - Y 좌표
 * @param {Object} context - 발견 컨텍스트
 * @returns {Object|null} 발견 결과
 */
export function tryDiscover(characterId, mapId, x, y, context = {}) {
  // 이미 발견한 위치 무시
  const locations = getHiddenLocations(mapId)
  const undiscovered = locations.filter(loc => !hasDiscovered(characterId, loc.id))

  for (const location of undiscovered) {
    // 위치 확인
    const withinBounds = (
      x >= location.position.x &&
      x <= location.position.x + location.position.width &&
      y >= location.position.y &&
      y <= location.position.y + location.position.height
    )

    if (!withinBounds) continue

    // 조건 확인
    if (!checkDiscoveryConditions(location.conditions, characterId, context)) {
      continue
    }

    // 난이도 기반 발견 확률
    const successChance = getDiscoveryChance(location.difficulty)
    if (Math.random() > successChance) {
      continue
    }

    // 발견 성공
    return discoverLocation(characterId, mapId, location)
  }

  return null
}

/**
 * 발견 조건 확인
 * @param {Object} conditions - 조건
 * @param {string} characterId - 캐릭터 ID
 * @param {Object} context - 컨텍스트
 * @returns {boolean} 조건 충족
 */
function checkDiscoveryConditions(conditions, characterId, context) {
  if (!conditions) return true

  if (conditions.requiredLevel && context.level < conditions.requiredLevel) {
    return false
  }

  if (conditions.requiredInteractions && context.interactions < conditions.requiredInteractions) {
    return false
  }

  if (conditions.requiredMaps && context.visitedMaps) {
    for (const map of conditions.requiredMaps) {
      if (!context.visitedMaps.includes(map)) {
        return false
      }
    }
  }

  if (conditions.timeOfDay) {
    const hour = new Date().getHours()
    const timeOfDay = hour < 6 ? 'night' : hour < 12 ? 'morning' : hour < 18 ? 'day' : 'night'
    if (timeOfDay !== conditions.timeOfDay) {
      return false
    }
  }

  if (conditions.weather && conditions.weather !== context.weather) {
    return false
  }

  if (conditions.season && conditions.season !== context.season) {
    return false
  }

  if (conditions.moonPhase && conditions.moonPhase !== context.moonPhase) {
    return false
  }

  return true
}

/**
 * 난이도 기반 발견 확률
 * @param {string} difficulty - 난이도
 * @returns {number} 발견 확률 (0~1)
 */
function getDiscoveryChance(difficulty) {
  switch (difficulty) {
    case DIFFICULTY_LEVELS.EASY:
      return 0.8
    case DIFFICULTY_LEVELS.NORMAL:
      return 0.5
    case DIFFICULTY_LEVELS.HARD:
      return 0.3
    case DIFFICULTY_LEVELS.EXPERT:
      return 0.15
    case DIFFICULTY_LEVELS.LEGENDARY:
      return 0.05
    default:
      return 0.5
  }
}

/**
 * 위치 발견 처리
 * @param {string} characterId - 캐릭터 ID
 * @param {string} mapId - 맵 ID
 * @param {Object} location - 위치 객체
 * @returns {Object} 발견 결과
 */
function discoverLocation(characterId, mapId, location) {
  const discoveries = getDiscoveries(characterId)

  const discovery = {
    locationId: location.id,
    mapId: mapId,
    discoveredAt: Date.now(),
    location: location
  }

  discoveries.push(discovery)
  discoveryRecords.set(characterId, discoveries)

  // 전역 발견 카운트 업데이트
  if (!location.firstDiscoverer) {
    location.firstDiscoverer = characterId
  }
  location.discoveryCount++

  return {
    success: true,
    discovery: discovery,
    rewards: location.rewards,
    isGlobalFirst: characterId === location.firstDiscoverer
  }
}

/**
 * 맵의 힌트 조회
 * @param {string} mapId - 맵 ID
 * @returns {Array} 힌트 배열
 */
export function getMapHints(mapId) {
  const locations = getHiddenLocations(mapId)
  const hints = []

  locations.forEach(loc => {
    hints.push(...loc.hints)
  })

  return hints
}

/**
 * 캐릭터의 발견 통계
 * @param {string} characterId - 캐릭터 ID
 * @returns {Object} 통계
 */
export function getDiscoveryStats(characterId) {
  const discoveries = getDiscoveries(characterId)

  const stats = {
    total: discoveries.length,
    byType: {},
    byMap: {},
    byDifficulty: {},
    globalFirsts: 0
  }

  discoveries.forEach(d => {
    // 타입별 통계
    stats.byType[d.location.type] = (stats.byType[d.location.type] || 0) + 1

    // 맵별 통계
    stats.byMap[d.mapId] = (stats.byMap[d.mapId] || 0) + 1

    // 난이도별 통계
    stats.byDifficulty[d.location.difficulty] = (stats.byDifficulty[d.location.difficulty] || 0) + 1

    // 전역 최초 발견자
    if (d.firstDiscoverer === characterId) {
      stats.globalFirsts++
    }
  })

  return stats
}

/**
 * 전역 발견 랭킹
 * @param {number} limit - 결과 제한
 * @returns {Array} 랭킹 배열
 */
export function getDiscoveryRankings(limit = 10) {
  const rankings = []

  discoveryRecords.forEach((discoveries, characterId) => {
    let globalFirsts = 0
    discoveries.forEach(d => {
      if (d.firstDiscoverer === characterId) {
        globalFirsts++
      }
    })

    rankings.push({
      characterId,
      totalDiscoveries: discoveries.length,
      globalFirsts
    })
  })

  return rankings
    .sort((a, b) => b.globalFirsts - a.globalFirsts || b.totalDiscoveries - a.totalDiscoveries)
    .slice(0, limit)
}

/**
 * 발견 데이터 내보내기 (Redis 영속화용)
 * @returns {Object} 모든 발견 데이터
 */
export function exportDiscoveryData() {
  const data = {}
  discoveryRecords.forEach((value, key) => {
    data[key] = value
  })
  return data
}

/**
 * 발견 데이터 불러오기 (Redis 영속화용)
 * @param {Object} data - 불러올 데이터
 */
export function importDiscoveryData(data) {
  Object.entries(data).forEach(([characterId, value]) => {
    discoveryRecords.set(characterId, value)
  })
}

// 시스템 통계
export function getSystemStats() {
  let totalLocations = 0
  let totalMaps = 0

  for (const mapId in HIDDEN_LOCATIONS) {
    totalLocations += HIDDEN_LOCATIONS[mapId].length
    totalMaps++
  }

  return {
    totalMaps,
    totalLocations,
    averageLocationsPerMap: totalMaps > 0 ? (totalLocations / totalMaps).toFixed(2) : 0,
    totalCharactersWithDiscoveries: discoveryRecords.size
  }
}