import fs from 'fs'
import path from 'path'

// 데이터 저장소 디렉토리
const DATA_DIR = path.join(process.cwd(), 'backend', 'data')

// JSON 파일 유틸리티
export class JsonDataStore {
  constructor(filename, initialData = {}) {
    this.filename = filename
    this.data = initialData
    this.filePath = path.join(DATA_DIR, filename)
    this.load()
  }

  // 데이터 로드
  load() {
    try {
      if (fs.existsSync(this.filePath)) {
        const content = fs.readFileSync(this.filePath, 'utf-8')
        this.data = JSON.parse(content)
        console.log(`📂 데이터 로드 완료: ${this.filename}`)
        return true
      }
      // 파일이 없으면 초기 데이터로 생성
      this.save()
      return false
    } catch (error) {
      console.error(`❌ 데이터 로드 실패: ${this.filename}`, error)
      this.data = {}
      return false
    }
  }

  // 데이터 저장
  save() {
    try {
      // 디렉토리 생성 (없을 경우)
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true })
      }

      fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2), 'utf-8')
      console.log(`💾 데이터 저장 완료: ${this.filename}`)
      return true
    } catch (error) {
      console.error(`❌ 데이터 저장 실패: ${this.filename}`, error)
      return false
    }
  }

  // 데이터 가져오기
  get(key) {
    return this.data[key]
  }

  // 데이터 설정
  set(key, value) {
    this.data[key] = value
    this.save()
  }

  // 모든 데이터 가져오기
  getAll() {
    return { ...this.data }
  }

  // 모든 데이터 설정
  setAll(data) {
    this.data = data
    this.save()
  }

  // 데이터 삭제
  delete(key) {
    delete this.data[key]
    this.save()
  }

  // 데이터 존재 여부 확인
  has(key) {
    return key in this.data
  }

  // 모든 데이터 초기화
  clear() {
    this.data = {}
    this.save()
  }

  // 키 목록 가져오기
  keys() {
    return Object.keys(this.data)
  }

  // 데이터 크기
  size() {
    return Object.keys(this.data).length
  }
}

// 캐릭터 데이터 저장소
export const characterDataStore = new JsonDataStore('character-data.json', {})

// 인벤토리 데이터 저장소
export const inventoryDataStore = new JsonDataStore('inventory-data.json', {})

// 호감도 데이터 저장소
export const affinityDataStore = new JsonDataStore('affinity-data.json', {})

// 이벤트 로그 저장소
export const eventLogDataStore = new JsonDataStore('event-log.json', {})

// 건물 방문 기록 저장소
export const buildingVisitDataStore = new JsonDataStore('building-visit.json', {})

// 캐릭터 데이터 저장
export function saveCharacterData(characterId, characterData) {
  characterDataStore.set(characterId, characterData)
}

// 캐릭터 데이터 로드
export function loadCharacterData(characterId) {
  return characterDataStore.get(characterId)
}

// 인벤토리 데이터 저장
export function saveInventoryData(characterId, inventoryData) {
  inventoryDataStore.set(characterId, inventoryData)
}

// 인벤토리 데이터 로드
export function loadInventoryData(characterId) {
  return inventoryDataStore.get(characterId) || {}
}

// 호감도 데이터 저장
export function saveAffinityData(characterId, affinityData) {
  affinityDataStore.set(characterId, affinityData)
}

// 호감도 데이터 로드
export function loadAffinityData(characterId) {
  return affinityDataStore.get(characterId) || {}
}

// 이벤트 로그 저장
export function saveEventLog(characterId, logData) {
  const existingLogs = eventLogDataStore.get(characterId) || []
  existingLogs.push(logData)
  eventLogDataStore.set(characterId, existingLogs)
}

// 이벤트 로그 로드
export function loadEventLog(characterId) {
  return eventLogDataStore.get(characterId) || []
}

// 건물 방문 기록 저장
export function saveBuildingVisit(characterId, visitData) {
  buildingVisitDataStore.set(characterId, visitData)
}

// 건물 방문 기록 로드
export function loadBuildingVisit(characterId) {
  return buildingVisitDataStore.get(characterId)
}

// 모든 초기화
export function initializeAllDataStores() {
  characterDataStore.load()
  inventoryDataStore.load()
  affinityDataStore.load()
  eventLogDataStore.load()
  buildingVisitDataStore.load()
}

// 모든 데이터 백업
export function backupAllData() {
  const backupDir = path.join(DATA_DIR, 'backup', Date.now().toString())
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true })
  }

  const stores = [
    characterDataStore,
    inventoryDataStore,
    affinityDataStore,
    eventLogDataStore,
    buildingVisitDataStore
  ]

  stores.forEach(store => {
    const backupPath = path.join(backupDir, store.filename)
    fs.writeFileSync(backupPath, JSON.stringify(store.data, null, 2), 'utf-8')
  })

  console.log(`📦 데이터 백업 완료: ${backupDir}`)
  return backupDir
}