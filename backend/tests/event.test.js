import { describe, it, expect } from 'vitest'

describe('Building Entry/Exit Logic', () => {
  const createMockEventSystem = () => {
    const eventLogs = {}
    const activeBuildingVisits = {}

    const enterBuilding = (buildingId, characterId, characterName, buildingName) => {
      const activeVisit = activeBuildingVisits[characterId]
      if (activeVisit) {
        return { success: false, error: 'Already in a building' }
      }

      const enterTime = Date.now()
      activeBuildingVisits[characterId] = {
        buildingId,
        buildingName,
        characterId,
        characterName,
        enterTime
      }

      return {
        success: true,
        event: {
          buildingId,
          buildingName,
          characterId,
          characterName,
          enterTime
        }
      }
    }

    const exitBuilding = (buildingId, characterId) => {
      const activeVisit = activeBuildingVisits[characterId]
      if (!activeVisit) {
        return { success: false, error: 'Not in a building' }
      }

      if (activeVisit.buildingId !== buildingId) {
        return { success: false, error: 'Building ID mismatch' }
      }

      const exitTime = Date.now()
      const dwellTime = exitTime - activeVisit.enterTime

      const event = {
        type: 'exit',
        buildingId: activeVisit.buildingId,
        buildingName: activeVisit.buildingName,
        characterId: activeVisit.characterId,
        characterName: activeVisit.characterName,
        enterTime: activeVisit.enterTime,
        exitTime,
        dwellTime
      }

      if (!eventLogs[characterId]) {
        eventLogs[characterId] = []
      }
      eventLogs[characterId].push(event)

      delete activeBuildingVisits[characterId]

      return { success: true, event }
    }

    const getEventLogs = (characterId) => {
      return eventLogs[characterId] || []
    }

    return { enterBuilding, exitBuilding, getEventLogs, eventLogs, activeBuildingVisits }
  }

  it('should successfully enter a building', () => {
    const { enterBuilding, activeBuildingVisits } = createMockEventSystem()

    const result = enterBuilding(1, 'char1', '테스트 캐릭터', '상점')

    expect(result.success).toBe(true)
    expect(result.event.buildingId).toBe(1)
    expect(result.event.buildingName).toBe('상점')
    expect(activeBuildingVisits['char1']).toBeDefined()
  })

  it('should prevent entering another building while already inside', () => {
    const { enterBuilding } = createMockEventSystem()

    enterBuilding(1, 'char1', '테스트 캐릭터', '상점')
    const result = enterBuilding(2, 'char1', '테스트 캐릭터', '카페')

    expect(result.success).toBe(false)
    expect(result.error).toBe('Already in a building')
  })

  it('should successfully exit a building and calculate dwell time', async () => {
    const { enterBuilding, exitBuilding, getEventLogs } = createMockEventSystem()

    enterBuilding(1, 'char1', '테스트 캐릭터', '상점')
    
    await new Promise(resolve => setTimeout(resolve, 100))
    
    const result = exitBuilding(1, 'char1')

    expect(result.success).toBe(true)
    expect(result.event.type).toBe('exit')
    expect(result.event.dwellTime).toBeGreaterThanOrEqual(100)
    
    const logs = getEventLogs('char1')
    expect(logs.length).toBe(1)
    expect(logs[0].dwellTime).toBeGreaterThanOrEqual(0)
  })

  it('should prevent exiting when not in a building', () => {
    const { exitBuilding } = createMockEventSystem()

    const result = exitBuilding(1, 'char1')

    expect(result.success).toBe(false)
    expect(result.error).toBe('Not in a building')
  })

  it('should prevent exiting from wrong building ID', () => {
    const { enterBuilding, exitBuilding } = createMockEventSystem()

    enterBuilding(1, 'char1', '테스트 캐릭터', '상점')
    const result = exitBuilding(2, 'char1')

    expect(result.success).toBe(false)
    expect(result.error).toBe('Building ID mismatch')
  })

  it('should allow multiple building visits', async () => {
    const { enterBuilding, exitBuilding, getEventLogs } = createMockEventSystem()

    const buildingSequence = [
      { id: 1, name: '상점' },
      { id: 2, name: '카페' },
      { id: 1, name: '상점' }
    ]

    for (const building of buildingSequence) {
      enterBuilding(building.id, 'char1', '테스트 캐릭터', building.name)
      await new Promise(resolve => setTimeout(resolve, 50))
      exitBuilding(building.id, 'char1')
    }

    const logs = getEventLogs('char1')
    expect(logs.length).toBe(3)
    expect(logs[0].buildingName).toBe('상점')
    expect(logs[1].buildingName).toBe('카페')
    expect(logs[2].buildingName).toBe('상점')
  })

  it('should handle multiple characters independently', async () => {
    const { enterBuilding, exitBuilding, getEventLogs } = createMockEventSystem()

    enterBuilding(1, 'char1', '캐릭터1', '상점')
    enterBuilding(2, 'char2', '캐릭터2', '카페')
    
    await new Promise(resolve => setTimeout(resolve, 50))
    
    exitBuilding(1, 'char1')
    exitBuilding(2, 'char2')

    const logs1 = getEventLogs('char1')
    const logs2 = getEventLogs('char2')

    expect(logs1.length).toBe(1)
    expect(logs1[0].buildingName).toBe('상점')
    expect(logs2.length).toBe(1)
    expect(logs2[0].buildingName).toBe('카페')
  })

  it('should correctly calculate dwell time in various durations', async () => {
    const { enterBuilding, exitBuilding, getEventLogs } = createMockEventSystem()

    const visits = [
      { duration: 50 },
      { duration: 200 },
      { duration: 500 }
    ]

    for (let i = 0; i < visits.length; i++) {
      enterBuilding(1, 'char1', '테스트 캐릭터', '상점')
      await new Promise(resolve => setTimeout(resolve, visits[i].duration))
      exitBuilding(1, 'char1')
    }

    const logs = getEventLogs('char1')
    expect(logs.length).toBe(3)
    expect(logs[0].dwellTime).toBeGreaterThanOrEqual(50)
    expect(logs[1].dwellTime).toBeGreaterThanOrEqual(200)
    expect(logs[2].dwellTime).toBeGreaterThanOrEqual(500)
  })
})