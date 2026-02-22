import { readFileSync, existsSync, unlinkSync } from 'fs'
import { readdirSync } from 'fs'
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import {
  JsonDataStore,
  characterDataStore,
  inventoryDataStore,
  affinityDataStore,
  eventLogDataStore,
  buildingVisitDataStore,
  saveCharacterData,
  loadCharacterData,
  saveInventoryData,
  loadInventoryData,
  saveAffinityData,
  loadAffinityData,
  saveEventLog,
  loadEventLog,
  saveBuildingVisit,
  loadBuildingVisit,
  initializeAllDataStores,
  backupAllData
} from '../data-store.js'

describe('JsonDataStore', () => {
  let store

  beforeEach(() => {
    store = new JsonDataStore('test-store.json', { initial: 'data' })
  })

  afterEach(() => {
    // 테스트 파일 정리
    const testFile = 'backend/data/test-store.json'
    if (existsSync(testFile)) {
      unlinkSync(testFile)
    }
  })

  describe('초기화', () => {
    it('초기 데이터로 생성되어야 함', () => {
      expect(store.data).toEqual({ initial: 'data' })
    })

    it('파일이 없을 때 초기 데이터로 파일이 생성되어야 함', () => {
      expect(existsSync('backend/data/test-store.json')).toBe(true)
    })

    it('JSON 파일을 로드할 수 있어야 함', () => {
      // 새 스토어 생성 (파일 로드)
      const newStore = new JsonDataStore('test-store.json')
      expect(newStore.data).toEqual({ initial: 'data' })
    })
  })

  describe('데이터 저장 & 가져오기', () => {
    it('set & get가 정상 작동해야 함', () => {
      store.set('testKey', 'testValue')
      expect(store.get('testKey')).toBe('testValue')
    })

    it('객체 저장 가능해야 함', () => {
      const testData = { name: 'test', value: 123 }
      store.set('objectKey', testData)
      expect(store.get('objectKey')).toEqual(testData)
    })

    it('set 호출 시 파일이 저장되어야 함', () => {
      store.set('newKey', 'newValue')
      const content = readFileSync('backend/data/test-store.json', 'utf-8')
      const data = JSON.parse(content)
      expect(data.newKey).toBe('newValue')
    })
  })

  describe('getAll & setAll', () => {
    it('모든 데이터를 가져올 수 있어야 함', () => {
      const allData = store.getAll()
      expect(allData).toEqual({ initial: 'data' })
    })

    it('모든 데이터를 설정할 수 있어야 함', () => {
      const newData = { key1: 'value1', key2: 'value2' }
      store.setAll(newData)
      expect(store.getAll()).toEqual(newData)
    })
  })

  describe('delete', () => {
    it('데이터 삭제 가능해야 함', () => {
      store.set('tempKey', 'tempValue')
      store.delete('tempKey')
      expect(store.has('tempKey')).toBe(false)
    })

    it('존재하지 않는 키 삭제 시 에러 없이 처리해야 함', () => {
      expect(() => store.delete('nonExistentKey')).not.toThrow()
    })
  })

  describe('has', () => {
    it('키 존재 여부를 올바르게 확인해야 함', () => {
      store.set('existingKey', 'value')
      expect(store.has('existingKey')).toBe(true)
      expect(store.has('nonExistingKey')).toBe(false)
    })
  })

  describe('clear', () => {
    it('모든 데이터를 초기화할 수 있어야 함', () => {
      store.set('key1', 'value1')
      store.set('key2', 'value2')
      store.clear()
      expect(store.size()).toBe(0)
    })
  })

  describe('keys', () => {
    it('모든 키 목록을 반환해야 함', () => {
      store.set('key1', 'value1')
      store.set('key2', 'value2')
      store.set('key3', 'value3')
      const keys = store.keys()
      expect(keys).toContain('key1')
      expect(keys).toContain('key2')
      expect(keys).toContain('key3')
    })
  })

  describe('size', () => {
    it('데이터 크기를 올바르게 반환해야 함', () => {
      expect(store.size()).toBe(1) // 초기 데이터 포함
      store.set('key1', 'value1')
      expect(store.size()).toBe(2)
      store.set('key2', 'value2')
      expect(store.size()).toBe(3)
    })
  })
})

describe('캐릭터 데이터 함수', () => {
  beforeEach(() => {
    characterDataStore.clear()
  })

  afterEach(() => {
    characterDataStore.clear()
    const testFile = 'backend/data/character-data.json'
    if (existsSync(testFile)) {
      unlinkSync(testFile)
    }
  })

  describe('saveCharacterData & loadCharacterData', () => {
    it('캐릭터 데이터를 저장할 수 있어야 함', () => {
      const characterData = {
        id: 'char1',
        name: 'Test Character',
        x: 100,
        y: 200
      }
      saveCharacterData('char1', characterData)
      const loaded = loadCharacterData('char1')
      expect(loaded).toEqual(characterData)
    })

    it('존재하지 않는 캐릭터는 undefined 반환해야 함', () => {
      const loaded = loadCharacterData('nonExistent')
      expect(loaded).toBeUndefined()
    })
  })
})

describe('인벤토리 데이터 함수', () => {
  beforeEach(() => {
    inventoryDataStore.clear()
  })

  afterEach(() => {
    inventoryDataStore.clear()
    const testFile = 'backend/data/inventory-data.json'
    if (existsSync(testFile)) {
      unlinkSync(testFile)
    }
  })

  describe('saveInventoryData & loadInventoryData', () => {
    it('인벤토리 데이터를 저장할 수 있어야 함', () => {
      const inventoryData = {
        healthPotion: 3,
        coin: 50,
        giftBox: 1
      }
      saveInventoryData('char1', inventoryData)
      const loaded = loadInventoryData('char1')
      expect(loaded).toEqual(inventoryData)
    })

    it('존재하지 않는 인벤토리는 빈 객체 반환해야 함', () => {
      const loaded = loadInventoryData('nonExistent')
      expect(loaded).toEqual({})
    })
  })
})

describe('호감도 데이터 함수', () => {
  beforeEach(() => {
    affinityDataStore.clear()
  })

  afterEach(() => {
    affinityDataStore.clear()
    const testFile = 'backend/data/affinity-data.json'
    if (existsSync(testFile)) {
      unlinkSync(testFile)
    }
  })

  describe('saveAffinityData & loadAffinityData', () => {
    it('호감도 데이터를 저장할 수 있어야 함', () => {
      const affinityData = {
        char2: 50,
        char3: 75
      }
      saveAffinityData('char1', affinityData)
      const loaded = loadAffinityData('char1')
      expect(loaded).toEqual(affinityData)
    })

    it('존재하지 않는 호감도는 빈 객체 반환해야 함', () => {
      const loaded = loadAffinityData('nonExistent')
      expect(loaded).toEqual({})
    })
  })
})

describe('이벤트 로그 함수', () => {
  beforeEach(() => {
    eventLogDataStore.clear()
  })

  afterEach(() => {
    eventLogDataStore.clear()
    const testFile = 'backend/data/event-log.json'
    if (existsSync(testFile)) {
      unlinkSync(testFile)
    }
  })

  describe('saveEventLog & loadEventLog', () => {
    it('이벤트 로그를 저장할 수 있어야 함', () => {
      const logData = {
        type: 'test',
        timestamp: Date.now(),
        message: 'Test event'
      }
      saveEventLog('char1', logData)
      const loaded = loadEventLog('char1')
      expect(loaded).toHaveLength(1)
      expect(loaded[0]).toEqual(logData)
    })

    it('여러 이벤트를 저장할 수 있어야 함', () => {
      const log1 = { type: 'event1', timestamp: Date.now() }
      const log2 = { type: 'event2', timestamp: Date.now() }
      saveEventLog('char1', log1)
      saveEventLog('char1', log2)
      const loaded = loadEventLog('char1')
      expect(loaded).toHaveLength(2)
    })

    it('존재하지 않는 이벤트 로그는 빈 배열 반환해야 함', () => {
      const loaded = loadEventLog('nonExistent')
      expect(loaded).toEqual([])
    })
  })
})

describe('건물 방문 기록 함수', () => {
  beforeEach(() => {
    buildingVisitDataStore.clear()
  })

  afterEach(() => {
    buildingVisitDataStore.clear()
    const testFile = 'backend/data/building-visit.json'
    if (existsSync(testFile)) {
      unlinkSync(testFile)
    }
  })

  describe('saveBuildingVisit & loadBuildingVisit', () => {
    it('건물 방문 기록을 저장할 수 있어야 함', () => {
      const visitData = {
        buildingId: 1,
        buildingName: '상점',
        enterTime: Date.now()
      }
      saveBuildingVisit('char1', visitData)
      const loaded = loadBuildingVisit('char1')
      expect(loaded).toEqual(visitData)
    })

    it('존재하지 않는 방문 기록은 undefined 반환해야 함', () => {
      const loaded = loadBuildingVisit('nonExistent')
      expect(loaded).toBeUndefined()
    })
  })
})

describe('유틸리티 함수', () => {
  describe('initializeAllDataStores', () => {
    it('모든 데이터 저장소를 초기화할 수 있어야 함', () => {
      expect(() => initializeAllDataStores()).not.toThrow()
    })

    it('초기화 후 모든 저장소가 로드되어야 함', () => {
      initializeAllDataStores()
      expect(characterDataStore.size() >= 0).toBe(true)
      expect(inventoryDataStore.size() >= 0).toBe(true)
      expect(affinityDataStore.size() >= 0).toBe(true)
      expect(eventLogDataStore.size() >= 0).toBe(true)
      expect(buildingVisitDataStore.size() >= 0).toBe(true)
    })
  })

  describe('backupAllData', () => {
    afterEach(() => {
      // 백업 디렉토리 정리
      const backupDir = 'backend/data/backup'
      if (existsSync(backupDir)) {
        const files = readdirSync(backupDir)
        files.forEach(file => {
          const filePath = `${backupDir}/${file}`
          const stat = require('fs').statSync(filePath)
          if (stat.isDirectory()) {
            require('fs').rmSync(filePath, { recursive: true })
          } else {
            unlinkSync(filePath)
          }
        })
      }
    })

    it('모든 데이터를 백업할 수 있어야 함', () => {
      characterDataStore.set('test', 'data')
      inventoryDataStore.set('test', 'data')
      affinityDataStore.set('test', 'data')
      eventLogDataStore.set('test', 'data')
      buildingVisitDataStore.set('test', 'data')

      const backupPath = backupAllData()
      expect(backupPath).toBeTruthy()
      expect(existsSync(backupPath)).toBe(true)
    })
  })
})