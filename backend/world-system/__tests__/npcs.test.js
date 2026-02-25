/**
 * NPC 시스템 테스트
 */

import { describe, it, test, expect } from 'vitest'
import {
  NPCS_BY_MAP,
  getNPCsByMap,
  findNPCById,
  getAllNPCs,
  getNPCIntroduction
} from '../npcs.js'
import { MAP_TYPES } from '../buildings.js'

describe('NPC 시스템', () => {
  describe('NPCS_BY_MAP', () => {
    test('기본 맵의 NPC가 2개여야 함', () => {
      expect(NPCS_BY_MAP[MAP_TYPES.DEFAULT]).toHaveLength(2)
    })

    test('해변 맵의 NPC가 3개여야 함', () => {
      expect(NPCS_BY_MAP[MAP_TYPES.BEACH]).toHaveLength(3)
    })

    test('숲 맵의 NPC가 3개여야 함', () => {
      expect(NPCS_BY_MAP[MAP_TYPES.FOREST]).toHaveLength(3)
    })

    test('산맥 맵의 NPC가 3개여야 함', () => {
      expect(NPCS_BY_MAP[MAP_TYPES.MOUNTAIN]).toHaveLength(3)
    })

    test('모든 맵 유형이 존재해야 함', () => {
      const mapTypes = Object.values(MAP_TYPES)
      mapTypes.forEach(mapType => {
        expect(NPCS_BY_MAP[mapType]).toBeDefined()
      })
    })
  })

  describe('getNPCsByMap', () => {
    test('기본 맵의 NPC 목록을 반환해야 함', () => {
      const npcs = getNPCsByMap(MAP_TYPES.DEFAULT)
      expect(npcs).toBe(NPCS_BY_MAP[MAP_TYPES.DEFAULT])
      expect(npcs).toHaveLength(2)
    })

    test('존재하지 않은 맵 유형은 기본 맵의 NPC를 반환해야 함', () => {
      const npcs = getNPCsByMap('invalid_map_type')
      expect(npcs).toBe(NPCS_BY_MAP[MAP_TYPES.DEFAULT])
    })

    test('기본 맵의 첫 번째 NPC는 AI 유리여야 함', () => {
      const npcs = getNPCsByMap(MAP_TYPES.DEFAULT)
      expect(npcs[0].id).toBe('ai-agent-1')
      expect(npcs[0].name).toBe('AI 유리')
    })

    test('NPC 객체가 올바른 구조를 가져야 함', () => {
      const npcs = getNPCsByMap(MAP_TYPES.DEFAULT)
      npcs.forEach(npc => {
        expect(npc).toHaveProperty('id')
        expect(npc).toHaveProperty('name')
        expect(npc).toHaveProperty('x')
        expect(npc).toHaveProperty('y')
        expect(npc).toHaveProperty('color')
        expect(npc).toHaveProperty('emoji')
        expect(npc).toHaveProperty('isAi')
        expect(npc).toHaveProperty('mapType')
        expect(npc).toHaveProperty('description')
        expect(npc).toHaveProperty('personality')
      })
    })

    test('모든 NPC는 isAi 속성이 true여야 함', () => {
      const npcs = getNPCsByMap(MAP_TYPES.DEFAULT)
      npcs.forEach(npc => {
        expect(npc.isAi).toBe(true)
      })
    })
  })

  describe('findNPCById', () => {
    test('존재하는 NPC ID로 찾을 수 있어야 함', () => {
      const npc = findNPCById('ai-agent-1')
      expect(npc).toBeDefined()
      expect(npc.id).toBe('ai-agent-1')
      expect(npc.name).toBe('AI 유리')
    })

    test('존재하지 않는 NPC ID는 null을 반환해야 함', () => {
      const npc = findNPCById('invalid_npc_id')
      expect(npc).toBeNull()
    })

    test('해변 맵의 NPC를 찾을 수 있어야 함', () => {
      const npc = findNPCById('npc-beach-1')
      expect(npc).toBeDefined()
      expect(npc.id).toBe('npc-beach-1')
      expect(npc.name).toBe('수영 선생님')
      expect(npc.mapType).toBe(MAP_TYPES.BEACH)
    })

    test('숲 맵의 NPC를 찾을 수 있어야 함', () => {
      const npc = findNPCById('npc-forest-1')
      expect(npc).toBeDefined()
      expect(npc.id).toBe('npc-forest-1')
      expect(npc.name).toBe('숲길 안내인')
      expect(npc.mapType).toBe(MAP_TYPES.FOREST)
    })

    test('산맥 맵의 NPC를 찾을 수 있어야 함', () => {
      const npc = findNPCById('npc-mountain-1')
      expect(npc).toBeDefined()
      expect(npc.id).toBe('npc-mountain-1')
      expect(npc.name).toBe('스키 강사')
      expect(npc.mapType).toBe(MAP_TYPES.MOUNTAIN)
    })
  })

  describe('getAllNPCs', () => {
    test('모든 맵의 모든 NPC를 반환해야 함', () => {
      const allNPCs = getAllNPCs()
      const expectedCount = 2 + 3 + 3 + 3  // 11개
      expect(allNPCs).toHaveLength(expectedCount)
    })

    test('반환된 NPC들이 중복되지 않아야 함', () => {
      const allNPCs = getAllNPCs()
      const ids = allNPCs.map(n => n.id)
      const uniqueIds = new Set(ids)
      expect(ids.length).toBe(uniqueIds.size)
    })

    test('같은 ID의 NPC가 없어야 함', () => {
      const allNPCs = getAllNPCs()
      const idCounts = {}
      allNPCs.forEach(npc => {
        idCounts[npc.id] = (idCounts[npc.id] || 0) + 1
      })

      Object.values(idCounts).forEach(count => {
        expect(count).toBe(1)
      })
    })

    test('모든 맵 유형의 NPC가 포함되어야 함', () => {
      const allNPCs = getAllNPCs()
      const mapTypes = new Set(allNPCs.map(n => n.mapType))

      expect(mapTypes).toContain(MAP_TYPES.DEFAULT)
      expect(mapTypes).toContain(MAP_TYPES.BEACH)
      expect(mapTypes).toContain(MAP_TYPES.FOREST)
      expect(mapTypes).toContain(MAP_TYPES.MOUNTAIN)
    })
  })

  describe('getNPCIntroduction', () => {
    test('NPC 소개 텍스트를 생성해야 함', () => {
      const npc = {
        id: 'test-npc',
        name: '테스트 NPC',
        emoji: '🎭',
        description: '테스트용 NPC',
        personality: 'friendly'
      }
      const intro = getNPCIntroduction(npc)
      expect(intro).toContain('🎭')
      expect(intro).toContain('테스트 NPC')
      expect(intro).toContain('테스트용 NPC')
      expect(intro).toContain('friendly')
    })

    test('null을 전달하면 빈 문자열을 반환해야 함', () => {
      const intro = getNPCIntroduction(null)
      expect(intro).toBe('')
    })

    test('undefined를 전달하면 빈 문자열을 반환해야 함', () => {
      const intro = getNPCIntroduction(undefined)
      expect(intro).toBe('')
    })

    test('personality가 없는 NPC도 처리해야 함', () => {
      const npc = {
        id: 'test-npc',
        name: '테스트 NPC',
        emoji: '🎭',
        description: '테스트용 NPC'
      }
      const intro = getNPCIntroduction(npc)
      expect(intro).toContain('일반')  // personality가 없으면 '일반' 표시
    })
  })
})