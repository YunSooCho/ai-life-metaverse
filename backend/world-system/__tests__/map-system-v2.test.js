/**
 * Map System V2 Tests
 * Phase 11: 월드맵 시스템 정고지 통합 테스트
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'

import {
  initializeMapSystemV2,
  handleMapEntry,
  handleMapInteraction,
  handleMapExit,
  getCharacterMapState,
  getMapSystemV2Stats,
  recordMapVisit,
  addProgress,
  getMapExploration,
  getExplorationData,
  getAllMaps,
  getMap,
  mapExists,
  getMapWeather,
  setMapWeather,
  getActiveQuests,
  triggerMapEvents,
  importAllData,
  exportAllData
} from '../map-system-v2.js'

describe('Map System V2 - Initialization', () => {
  it('should initialize map system v2', () => {
    const result = initializeMapSystemV2()

    expect(result).toBeDefined()
    expect(result.maps).toBeDefined()
    expect(result.maps.length).toBeGreaterThan(0)
    expect(result.totalQuestTemplates).toBeGreaterThan(0)
    expect(result.totalHiddenLocations).toBeGreaterThan(0)
  })

  it('should have valid maps', () => {
    const maps = getAllMaps()

    expect(maps.length).toBeGreaterThan(0)
    expect(maps[0]).toHaveProperty('id')
    expect(maps[0]).toHaveProperty('name')
    expect(maps[0]).toHaveProperty('width')
    expect(maps[0]).toHaveProperty('height')
  })

  it('should check map existence', () => {
    expect(mapExists('default')).toBe(true)
    expect(mapExists('beach')).toBe(true)
    expect(mapExists('forest')).toBe(true)
    expect(mapExists('mountain')).toBe(true)
    expect(mapExists('invalid')).toBe(false)
  })
})

describe('Map System V2 - Map Entry', () => {
  beforeEach(() => {
    // Reset before each test
    vi.clearAllMocks()
  })

  it('should handle map entry successfully', () => {
    const characterId = 'char_001'
    const mapId = 'default'

    const result = handleMapEntry(characterId, mapId, {
      characterId,
      isFirstVisit: true,
      level: 1,
      interactions: 0
    })

    expect(result).toBeDefined()
    expect(result.success).toBe(true)
    expect(result.mapId).toBe(mapId)
    expect(result.results).toBeInstanceOf(Array)
    expect(result.results.length).toBeGreaterThan(0)
  })

  it('should fail map entry for invalid map', () => {
    const characterId = 'char_001'
    const mapId = 'invalid_map'

    const result = handleMapEntry(characterId, mapId)

    expect(result).toBeDefined()
    expect(result.success).toBe(false)
    expect(result.error).toBe('Map not found')
  })

  it('should record map visit', () => {
    const characterId = 'char_002'
    const mapId = 'beach'

    const result = recordMapVisit(characterId, mapId)

    expect(result).toBe(true)

    const exploration = getMapExploration(characterId, mapId)
    expect(exploration).toBeDefined()
    expect(exploration.visitCount).toBeGreaterThan(0)
  })
})

describe('Map System V2 - Map Interaction', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should handle map interaction successfully', () => {
    const characterId = 'char_003'
    const mapId = 'default'

    const result = handleMapInteraction(characterId, mapId, 500, 350, {
      type: 'click',
      target: null,
      characterId,
      level: 5,
      interactions: 10
    })

    expect(result).toBeDefined()
    expect(result.success).toBe(true)
    expect(result.characterId).toBe(characterId)
    expect(result.mapId).toBe(mapId)
    expect(result.x).toBe(500)
    expect(result.y).toBe(350)
    expect(result.results).toBeInstanceOf(Array)
  })

  it('should update exploration progress on interaction', () => {
    const characterId = 'char_004'
    const mapId = 'forest'

    handleMapInteraction(characterId, mapId, 550, 400, {
      type: 'click',
      characterId,
      level: 10,
      interactions: 20
    })

    const exploration = getMapExploration(characterId, mapId)
    expect(exploration).toBeDefined()
    expect(exploration.progress).toBeGreaterThan(0)
  })
})

describe('Map System V2 - Map Exit', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should handle map exit successfully', () => {
    const characterId = 'char_005'
    const fromMapId = 'default'
    const toMapId = 'beach'

    const result = handleMapExit(characterId, fromMapId, toMapId, {
      characterId,
      level: 5
    })

    expect(result).toBeDefined()
    expect(result.success).toBe(true)
    expect(result.fromMapId).toBe(fromMapId)
    expect(result.toMapId).toBe(toMapId)
    expect(result.results).toBeInstanceOf(Array)
  })

  it('should handle map exit without destination', () => {
    const characterId = 'char_006'
    const fromMapId = 'beach'

    const result = handleMapExit(characterId, fromMapId, null, {
      characterId,
      level: 5
    })

    expect(result).toBeDefined()
    expect(result.success).toBe(true)
    expect(result.fromMapId).toBe(fromMapId)
  })
})

describe('Map System V2 - Character Map State', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should get complete character map state', () => {
    const characterId = 'char_007'
    const mapId = 'mountain'

    // First, enter the map
    handleMapEntry(characterId, mapId, {
      characterId,
      isFirstVisit: true,
      level: 10,
      interactions: 30
    })

    // Then get state
    const state = getCharacterMapState(characterId, mapId)

    expect(state).toBeDefined()
    expect(state.map).toBeDefined()
    expect(state.exploration).toBeDefined()
    expect(state.interactions).toBeInstanceOf(Array)
    expect(state.weather).toBeDefined()
    expect(state.quests).toBeInstanceOf(Array)
    expect(state.discoveries).toBeInstanceOf(Array)
    expect(state.events).toBeDefined()
    expect(state.uiEffects).toBeDefined()
    expect(state.transitionPaths).toBeInstanceOf(Array)
    expect(state.hiddenLocations).toBeInstanceOf(Array)
  })

  it('should have valid map data in state', () => {
    const characterId = 'char_008'
    const mapId = 'forest'

    const state = getCharacterMapState(characterId, mapId)

    expect(state.map.id).toBe(mapId)
    expect(state.map.name).toBe('숲')
    expect(state.map.width).toBeGreaterThan(0)
    expect(state.map.height).toBeGreaterThan(0)
  })
})

describe('Map System V2 - Exploration Progress', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should add exploration progress', () => {
    const characterId = 'char_009'
    const mapId = 'beach'

    recordMapVisit(characterId, mapId)

    const result = addProgress(characterId, mapId, 'interact', 5)

    expect(result).toBeDefined()
    expect(result.progressGain).toBeGreaterThan(0)
    expect(result.totalProgress).toBeGreaterThan(0)
    expect(result.level).toBeGreaterThan(0)
  })

  it('should track exploration stats', () => {
    const characterId = 'char_010'
    const mapId = 'default'

    recordMapVisit(characterId, mapId)
    addProgress(characterId, mapId, 'visit', 1)
    addProgress(characterId, mapId, 'interact', 10)

    const data = getExplorationData(characterId)

    expect(data).toBeDefined()
    expect(data.level).toBeGreaterThan(0)
    expect(data.totalProgress).toBeGreaterThan(0)
    expect(data.mapProgress).toBeDefined()
  })
})

describe('Map System V2 - Weather System', () => {
  it('should get default map weather', () => {
    const weather = getMapWeather('default')

    expect(weather).toBeDefined()
    expect(weather.type).toBeDefined()
    expect(weather.temperature).toBeDefined()
    expect(weather.humidity).toBeDefined()
    expect(weather.windSpeed).toBeDefined()
  })

  it('should set custom map weather', () => {
    const mapId = 'beach'
    const customWeather = {
      type: 'rainy',
      temperature: 25,
      humidity: 80,
      windSpeed: 20
    }

    const result = setMapWeather(mapId, customWeather)
    expect(result).toBe(true)

    const weather = getMapWeather(mapId)
    expect(weather.type).toBe('rainy')
  })
})

describe('Map System V2 - Quest System', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should get active quests for character', () => {
    const characterId = 'char_011'
    const mapId = 'default'

    handleMapEntry(characterId, mapId, {
      characterId,
      isFirstVisit: true,
      level: 5,
      interactions: 10
    })

    const quests = getActiveQuests(characterId, mapId)

    expect(quests).toBeInstanceOf(Array)
  })

  it('should auto-generate quests on map entry', () => {
    const characterId = 'char_012'
    const mapId = 'forest'

    const result = handleMapEntry(characterId, mapId, {
      characterId,
      isFirstVisit: true,
      level: 10,
      interactions: 20
    })

    const questsResult = result.results.find(r => r.type === 'quests')
    expect(questsResult).toBeDefined()
    expect(questsResult.quests).toBeInstanceOf(Array)
  })
})

describe('Map System V2 - Event System', () => {
  it('should trigger map events', () => {
    const characterId = 'char_013'
    const mapId = 'default'

    const events = triggerMapEvents(characterId, mapId, 'enter', {
      characterId,
      isFirstVisit: true,
      level: 1,
      interactions: 0
    })

    expect(events).toBeInstanceOf(Array)
  })
})

describe('Map System V2 - System Stats', () => {
  it('should get all system stats', () => {
    const stats = getMapSystemV2Stats()

    expect(stats).toBeDefined()
    expect(stats.interaction).toBeDefined()
    expect(stats.event).toBeDefined()
    expect(stats.discovery).toBeDefined()
    expect(stats.exploration).toBeDefined()
    expect(stats.weather).toBeDefined()
    expect(stats.quest).toBeDefined()
  })
})

describe('Map System V2 - Data Persistence', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should export all data', () => {
    const data = exportAllData()

    expect(data).toBeDefined()
    expect(data.interaction).toBeDefined()
    expect(data.event).toBeDefined()
    expect(data.discovery).toBeDefined()
    expect(data.exploration).toBeDefined()
    expect(data.weather).toBeDefined()
    expect(data.quest).toBeDefined()
  })

  it('should import all data', () => {
    const testData = {
      interaction: {
        'char_014': { interactions: [] }
      },
      event: {},
      discovery: {},
      exploration: {},
      weather: {},
      quest: {}
    }

    const result = importAllData(testData)
    expect(result).toBeUndefined() // Import doesn't return value
  })
})

describe('Map System V2 - Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should integrate map entry, interaction, and exit', () => {
    const characterId = 'char_015'

    // 1. Enter map
    const entryResult = handleMapEntry(characterId, 'default', {
      characterId,
      isFirstVisit: true,
      level: 1,
      interactions: 0
    })
    expect(entryResult.success).toBe(true)

    // 2. Interact with map
    const interactionResult = handleMapInteraction(characterId, 'default', 500, 350, {
      type: 'click',
      characterId,
      level: 1,
      interactions: 1
    })
    expect(interactionResult.success).toBe(true)

    // 3. Exit map
    const exitResult = handleMapExit(characterId, 'default', 'beach', {
      characterId,
      level: 1
    })
    expect(exitResult.success).toBe(true)

    // 4. Check complete state
    const state = getCharacterMapState(characterId, 'default')
    expect(state).toBeDefined()
    expect(state.exploration.visitCount).toBeGreaterThan(0)
    expect(state.interactions.length).toBeGreaterThan(0)
  })
})