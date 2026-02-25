import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import {
  createSaveData,
  saveGame,
  loadGame,
  validateSaveData,
  getSaveSlots,
  deleteSave,
  deleteAllSaves,
  formatSaveTimestamp
} from '../saveLoadSystem'

// localStorage를 모킹
const localStorageMock = (() => {
  let store = {}

  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => {
      store[key] = String(value)
    },
    removeItem: (key) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    }
  }
})()

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock
})

// 테스트용 플레이어 데이터
const testPlayerData = {
  character_id: 'char_test',
  name: '테스트 플레이어',
  x: 100,
  y: 200,
  color: '#FF0000',
  emoji: '😊',
  inventory: [
    { id: 'item_1', name: '건강 포션', quantity: 3 }
  ],
  quests: [
    { id: 'quest_1', name: '첫 퀘스트', progress: 50 }
  ],
  friendshipLevels: {
    char_1: 80,
    char_2: 50
  },
  completedQuests: ['quest_0'],
  currentRoom: 'main'
}

describe('Save/Load System', () => {
  beforeEach(() => {
    localStorageMock.clear()
  })

  afterEach(() => {
    localStorageMock.clear()
  })

  describe('createSaveData', () => {
    it('should create valid save data structure', () => {
      const saveData = createSaveData(testPlayerData)

      expect(saveData).toHaveProperty('version')
      expect(saveData).toHaveProperty('timestamp')
      expect(saveData).toHaveProperty('player')
      expect(saveData).toHaveProperty('inventory')
      expect(saveData).toHaveProperty('quests')
      expect(saveData).toHaveProperty('friendshipLevels')
      expect(saveData).toHaveProperty('completedQuests')
    })

    it('should include required player fields', () => {
      const saveData = createSaveData(testPlayerData)

      expect(saveData.player.id).toBe(testPlayerData.character_id)
      expect(saveData.player.name).toBe(testPlayerData.name)
      expect(saveData.player.x).toBe(testPlayerData.x)
      expect(saveData.player.y).toBe(testPlayerData.y)
    })

    it('should use empty arrays for missing fields', () => {
      const emptyPlayer = {
        character_id: 'char_empty',
        name: '빈 플레이어',
        x: 0,
        y: 0,
        color: '#000000',
        emoji: '😐'
      }

      const saveData = createSaveData(emptyPlayer)

      expect(saveData.inventory).toEqual([])
      expect(saveData.quests).toEqual([])
      expect(saveData.friendshipLevels).toEqual({})
      expect(saveData.completedQuests).toEqual([])
    })
  })

  describe('saveGame', () => {
    it('should save data to slot 1', () => {
      const result = saveGame(1, testPlayerData)

      expect(result).toBe(true)
      expect(localStorageMock.getItem('ai_life_save_1')).toBeTruthy()
    })

    it('should save data to slot 2', () => {
      const result = saveGame(2, testPlayerData)

      expect(result).toBe(true)
      expect(localStorageMock.getItem('ai_life_save_2')).toBeTruthy()
    })

    it('should save data to slot 3', () => {
      const result = saveGame(3, testPlayerData)

      expect(result).toBe(true)
      expect(localStorageMock.getItem('ai_life_save_3')).toBeTruthy()
    })

    it('should return false for invalid slot', () => {
      expect(saveGame(0, testPlayerData)).toBe(false)
      expect(saveGame(4, testPlayerData)).toBe(false)
      expect(saveGame(-1, testPlayerData)).toBe(false)
    })

    it('should overwrite existing save in slot', () => {
      saveGame(1, testPlayerData)

      const modifiedData = { ...testPlayerData, name: '수정된 이름' }
      saveGame(1, modifiedData)

      const loadedData = JSON.parse(localStorageMock.getItem('ai_life_save_1'))
      expect(loadedData.player.name).toBe('수정된 이름')
    })
  })

  describe('loadGame', () => {
    it('should load saved data from slot 1', () => {
      saveGame(1, testPlayerData)
      const loadedData = loadGame(1)

      expect(loadedData).toBeTruthy()
      expect(loadedData.player.name).toBe(testPlayerData.name)
    })

    it('should return null for empty slot', () => {
      const loadedData = loadGame(1)
      expect(loadedData).toBeNull()
    })

    it('should return null for invalid slot', () => {
      expect(loadGame(0)).toBeNull()
      expect(loadGame(4)).toBeNull()
    })

    it('should return null for corrupted data', () => {
      localStorageMock.setItem('ai_life_save_1', 'invalid json')
      expect(loadGame(1)).toBeNull()
    })
  })

  describe('validateSaveData', () => {
    it('should validate correct save data', () => {
      const saveData = createSaveData(testPlayerData)
      expect(validateSaveData(saveData)).toBe(true)
    })

    it('should reject null', () => {
      expect(validateSaveData(null)).toBe(false)
    })

    it('should reject undefined', () => {
      expect(validateSaveData(undefined)).toBe(false)
    })

    it('should reject data without version', () => {
      const saveData = createSaveData(testPlayerData)
      delete saveData.version
      expect(validateSaveData(saveData)).toBe(false)
    })

    it('should reject data without timestamp', () => {
      const saveData = createSaveData(testPlayerData)
      delete saveData.timestamp
      expect(validateSaveData(saveData)).toBe(false)
    })

    it('should reject data without player', () => {
      const saveData = createSaveData(testPlayerData)
      delete saveData.player
      expect(validateSaveData(saveData)).toBe(false)
    })

    it('should reject data without player.id', () => {
      const saveData = createSaveData(testPlayerData)
      delete saveData.player.id
      expect(validateSaveData(saveData)).toBe(false)
    })
  })

  describe('getSaveSlots', () => {
    it('should return empty slots when no saves exist', () => {
      const slots = getSaveSlots()

      expect(slots).toHaveLength(3)
      expect(slots[0].exists).toBe(false)
      expect(slots[1].exists).toBe(false)
      expect(slots[2].exists).toBe(false)
    })

    it('should return slot info for existing saves', () => {
      saveGame(1, testPlayerData)
      saveGame(3, { ...testPlayerData, name: '슬롯 3' })

      const slots = getSaveSlots()

      expect(slots[0].exists).toBe(true)
      expect(slots[0].playerName).toBe('테스트 플레이어')
      expect(slots[1].exists).toBe(false)
      expect(slots[2].exists).toBe(true)
      expect(slots[2].playerName).toBe('슬롯 3')
    })

    it('should return slot index correctly', () => {
      const slots = getSaveSlots()

      expect(slots[0].slot).toBe(1)
      expect(slots[1].slot).toBe(2)
      expect(slots[2].slot).toBe(3)
    })
  })

  describe('deleteSave', () => {
    it('should delete save from slot', () => {
      saveGame(1, testPlayerData)

      const result = deleteSave(1)

      expect(result).toBe(true)
      expect(localStorageMock.getItem('ai_life_save_1')).toBeNull()
    })

    it('should return false for invalid slot', () => {
      expect(deleteSave(0)).toBe(false)
      expect(deleteSave(4)).toBe(false)
    })

    it('should succeed even if save does not exist', () => {
      expect(deleteSave(1)).toBe(true)
    })
  })

  describe('deleteAllSaves', () => {
    it('should delete all saves', () => {
      saveGame(1, testPlayerData)
      saveGame(2, testPlayerData)
      saveGame(3, testPlayerData)

      deleteAllSaves()

      expect(localStorageMock.getItem('ai_life_save_1')).toBeNull()
      expect(localStorageMock.getItem('ai_life_save_2')).toBeNull()
      expect(localStorageMock.getItem('ai_life_save_3')).toBeNull()
    })

    it('should succeed even if no saves exist', () => {
      deleteAllSaves()
      expect(getSaveSlots().every(slot => !slot.exists)).toBe(true)
    })
  })

  describe('formatSaveTimestamp', () => {
    it('should format timestamp correctly', () => {
      const timestamp = new Date(2026, 1, 17, 12, 30).getTime()
      const formatted = formatSaveTimestamp(timestamp)

      expect(formatted).toContain('2026')
      expect(formatted).toContain('02')
      expect(formatted).toContain('17')
    })

    it('should handle current timestamp', () => {
      const timestamp = Date.now()
      const formatted = formatSaveTimestamp(timestamp)

      expect(typeof formatted).toBe('string')
      expect(formatted.length).toBeGreaterThan(0)
    })
  })
})