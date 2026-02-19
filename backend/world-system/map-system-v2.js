/**
 * 맵 시스템 v2 - 통합 모듈 (간소화 버전)
 * Phase 11: 월드맵 시스템 정고지
 */

// Imports (모듈 레벨에서만)
import { mapExists, getMap, getAllMaps } from './maps.js'
import { getHiddenLocations, getDiscoveries, HIDDEN_LOCATIONS, tryDiscover } from './hidden-locations.js'
import { getMapExploration, getExplorationData, recordMapVisit, addProgress } from './exploration-progress.js'
import { recordInteraction, getInteractionsByMap } from './map-interaction.js'
import { triggerMapEvents, getEventHistory, MAP_EVENTS, MAP_EVENT_TYPES } from './map-events.js'
import { getTransition, canTransition, getAllTransitionPaths } from './map-transitions.js'
import { getMapWeather, getWeatherBasedEvents, getWeatherUIEffects } from './weather-bridge.js'
import { getMapQuestTemplates, autoGenerateQuests, getActiveQuests, updateQuestProgress, MAP_QUEST_TEMPLATES } from './map-quests.js'
import { exportInteractionData, importInteractionData, getSystemStats as getInteractionSystemStats } from './map-interaction.js'
import { exportEventData, importEventData, getSystemStats as getEventSystemStats } from './map-events.js'
import { exportDiscoveryData, importDiscoveryData, getSystemStats as getDiscoverySystemStats } from './hidden-locations.js'
import { exportExplorationData, importExplorationData, getSystemStats as getExplorationSystemStats } from './exploration-progress.js'
import { exportWeatherData, importWeatherData, getSystemStats as getWeatherSystemStats } from './weather-bridge.js'
import { exportQuestData, importQuestData, getSystemStats as getQuestSystemStats } from './map-quests.js'

// Re-exports
export * from './buildings.js'
export { mapExists, getMap, getAllMaps } from './maps.js'
export * from './npcs.js'
export * from './map-interaction.js'
export * from './map-transitions.js'
export * from './map-events.js'
export * from './hidden-locations.js'
export * from './exploration-progress.js'
export * from './weather-bridge.js'
export * from './map-quests.js'

/**
 * 통합 초기화 함수
 */
export function initializeMapSystemV2() {
  console.log('🌍 맵 시스템 v2 초기화 중...')

  const allMaps = getAllMaps()
  const totalQuestTemplates = Object.keys(MAP_QUEST_TEMPLATES || {}).length
  const totalHiddenLocations = Object.keys(HIDDEN_LOCATIONS || {}).length

  console.log(`✅ 맵 데이터 로드 완료: ${allMaps.length}개 맵`)
  console.log(`✅ 퀘스트 템플릿: ${totalQuestTemplates}개`)
  console.log(`✅ 비밀 장소: ${totalHiddenLocations}개`)

  return {
    maps: allMaps,
    totalQuestTemplates,
    totalHiddenLocations
  }
}

/**
 * 캐릭터 맵 진입 처리
 */
export function handleMapEntry(characterId, mapId, context = {}) {
  if (!mapExists(mapId)) {
    return { success: false, error: 'Map not found' }
  }

  const results = []

  // 1. 맵 방문 기록
  recordMapVisit(characterId, mapId)
  results.push({ type: 'visit', message: 'Map visit recorded' })

  // 2. 맵 이벤트 트리거
  const enterEvents = triggerMapEvents(characterId, mapId, 'enter', context)
  if (enterEvents.length > 0) {
    results.push({ type: 'events', events: enterEvents })
  }

  // 3. 퀘스트 자동 생성
  const newQuests = autoGenerateQuests(characterId, mapId, context)
  if (newQuests.length > 0) {
    results.push({ type: 'quests', quests: newQuests })
  }

  // 4. 날씨 기반 이벤트
  const weatherEvents = getWeatherBasedEvents(mapId)
  if (weatherEvents.length > 0) {
    results.push({ type: 'weather_events', events: weatherEvents })
  }

  return {
    success: true,
    mapId,
    results
  }
}

/**
 * 캐릭터 맵 상호작션 처리
 */
export function handleMapInteraction(characterId, mapId, x, y, context = {}) {
  if (!mapExists(mapId)) {
    return { success: false, error: 'Map not found' }
  }

  const results = []

  // 1. 상호작션 기록
  recordInteraction(characterId, {
    type: context.type || 'click',
    mapId,
    x,
    y,
    target: context.target
  })
  results.push({ type: 'recorded', message: 'Interaction recorded' })

  // 2. 탐험 진행률 업데이트
  addProgress(characterId, mapId, 'interact', 1)
  results.push({ type: 'progress', message: 'Exploration progress increased' })

  // 3. 비밀 장소 발견 시도
  const discovery = tryDiscover(characterId, mapId, x, y, context)
  if (discovery && discovery.success) {
    results.push({ type: 'discovery', discovery })
  }

  // 4. 맵 이벤트 트리거
  const interactionEvents = triggerMapEvents(characterId, mapId, 'interaction', context)
  if (interactionEvents.length > 0) {
    results.push({ type: 'events', events: interactionEvents })
  }

  // 5. 퀘스트 진행 업데이트
  const activeQuests = getActiveQuests(characterId, mapId)
  activeQuests.forEach(quest => {
    const objective = quest.objectives.find(o => o.type === 'interact')
    if (objective) {
      const update = updateQuestProgress(characterId, quest.id, 'interact', 1)
      if (update && update.completed) {
        results.push({ type: 'quest_completed', quest: update.quest, rewards: update.rewards })
      }
    }
  })

  return {
    success: true,
    characterId,
    mapId,
    x,
    y,
    results
  }
}

/**
 * 캐릭터 맵 퇴장 처리
 */
export function handleMapExit(characterId, fromMapId, toMapId, context = {}) {
  const results = []

  // 1. 맵 이벤트 트리거 (EXIT)
  const exitEvents = triggerMapEvents(characterId, fromMapId, 'exit', context)
  if (exitEvents.length > 0) {
    results.push({ type: 'events', events: exitEvents })
  }

  // 2. 맵 전환 확인
  if (toMapId && canTransition(fromMapId, toMapId)) {
    const transition = getTransition(fromMapId, toMapId)
    if (transition) {
      results.push({ type: 'transition', transition })
    }
  }

  return {
    success: true,
    fromMapId,
    toMapId,
    results
  }
}

/**
 * 캐릭터 맵 상태 완전 조회
 */
export function getCharacterMapState(characterId, mapId) {
  // 이 함수에서 필요한 helper functions
  const tryDiscover = createTryDiscover()

  return {
    map: getMap(mapId),
    exploration: getMapExploration(characterId, mapId),
    interactions: getInteractionsByMap(characterId, mapId),
    weather: getMapWeather(mapId),
    quests: getActiveQuests(characterId, mapId),
    discoveries: getDiscoveries(characterId).filter(d => d.mapId === mapId),
    events: getEventHistory(characterId, mapId),
    uiEffects: getWeatherUIEffects(mapId),
    transitionPaths: getAllTransitionPaths(mapId),
    hiddenLocations: getHiddenLocations(mapId)
  }
}

// Helper function factory to avoid circular dependency
function createTryDiscover() {
  let hiddenLocsModule = null
  return function(characterId, mapId, x, y, context = {}) {
    // Lazy load hidden locations module
    if (!hiddenLocsModule) {
      hiddenLocsModule = { tryDiscover: function() {} } // Placeholder
    }
    return null
  }
}
// Note: tryDiscover function is simplified to avoid circular dependency
// In real usage, it would be imported from hidden-locations.js

/**
 * 전체 시스템 통계
 */
export function getMapSystemV2Stats() {
  return {
    interaction: getInteractionSystemStats(),
    event: getEventSystemStats(),
    discovery: getDiscoverySystemStats(),
    exploration: getExplorationSystemStats(),
    weather: getWeatherSystemStats(),
    quest: getQuestSystemStats()
  }
}

/**
 * 시스템 영속화 데이터 내보내기
 */
export function exportAllData() {
  return {
    interaction: exportInteractionData(),
    event: exportEventData(),
    discovery: exportDiscoveryData(),
    exploration: exportExplorationData(),
    weather: exportWeatherData(),
    quest: exportQuestData()
  }
}

/**
 * 시스템 영속화 데이터 불러오기
 */
export function importAllData(data) {
  if (data.interaction) importInteractionData(data.interaction)
  if (data.event) importEventData(data.event)
  if (data.discovery) importDiscoveryData(data.discovery)
  if (data.exploration) importExplorationData(data.exploration)
  if (data.weather) importWeatherData(data.weather)
  if (data.quest) importQuestData(data.quest)
}