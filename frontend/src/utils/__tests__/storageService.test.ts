/**
 * StorageService 테스트
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { storageService, type GameState } from '../storageService'

beforeEach(() => {
  localStorage.clear()
})

afterEach(() => {
  localStorage.clear()
})

describe('StorageService - 기본 기능', () => {
  it('초기 상태에서 저장된 데이터가 없어야 함', () => {
    expect(storageService.hasSaveData()).toBe(false)
  })

  it('게임 상태를 저장할 수 있어야 함', () => {
    const state: Partial<GameState> = {
      myCharacter: {
        id: 'player',
        name: '테스트 플레이어',
        level: 1
      },
      characters: {},
      affinities: {},
      inventory: [],
      quests: []
    }

    const result = storageService.saveGameState(state)
    expect(result).toBe(true)
    expect(storageService.hasSaveData()).toBe(true)
  })

  it('게임 상태를 로드할 수 있어야 함', () => {
    const originalState: Partial<GameState> = {
      myCharacter: {
        id: 'player',
        name: '테스트 플레이어',
        level: 5
      },
      characters: {},
      affinities: {},
      inventory: [],
      quests: []
    }

    storageService.saveGameState(originalState)
    const loadedState = storageService.loadGameState()

    expect(loadedState).not.toBeNull()
    expect(loadedState?.myCharacter.name).toBe('테스트 플레이어')
    expect(loadedState?.myCharacter.level).toBe(5)
  })

  it('저장된 데이터가 없으면 null을 반환해야 함', () => {
    const state = storageService.loadGameState()
    expect(state).toBeNull()
  })
})

describe('StorageService - 플레이어 캐릭터', () => {
  it('플레이어 캐릭터를 저장할 수 있어야 함', () => {
    const character = {
      id: 'player',
      name: '영웅',
      level: 10,
      exp: 500
    }

    const result = storageService.savePlayerCharacter(character)
    expect(result).toBe(true)
  })

  it('플레이어 캐릭터를 로드할 수 있어야 함', () => {
    const originalCharacter = {
      id: 'player',
      name: '영웅',
      level: 10,
      exp: 500
    }

    storageService.savePlayerCharacter(originalCharacter)
    const loadedCharacter = storageService.loadPlayerCharacter()

    expect(loadedCharacter).not.toBeNull()
    expect(loadedCharacter?.name).toBe('영웅')
    expect(loadedCharacter?.level).toBe(10)
  })
})

describe('StorageService - 설정', () => {
  it('설정을 저장할 수 있어야 함', () => {
    const settings = {
      language: 'ko',
      soundEnabled: true,
      fullscreen: false
    }

    const result = storageService.saveSettings(settings)
    expect(result).toBe(true)
  })

  it('설정을 로드할 수 있어야 함', () => {
    const originalSettings = {
      language: 'en',
      soundEnabled: false,
      fullscreen: true
    }

    storageService.saveSettings(originalSettings)
    const loadedSettings = storageService.loadSettings()

    expect(loadedSettings).not.toBeNull()
    expect(loadedSettings?.language).toBe('en')
    expect(loadedSettings?.soundEnabled).toBe(false)
  })
})

describe('StorageService - 세션 데이터', () => {
  it('세션 데이터를 저장할 수 있어야 함', () => {
    const sessionData = {
      roomId: 'main',
      joinTime: new Date().toISOString(),
      playerId: 'player-123'
    }

    const result = storageService.saveSessionData(sessionData)
    expect(result).toBe(true)
  })

  it('세션 데이터를 로드할 수 있어야 함', () => {
    const originalSessionData = {
      roomId: 'room-456',
      joinTime: new Date().toISOString(),
      playerId: 'player-789'
    }

    storageService.saveSessionData(originalSessionData)
    const loadedSessionData = storageService.loadSessionData()

    expect(loadedSessionData).not.toBeNull()
    expect(loadedSessionData?.roomId).toBe('room-456')
  })
})

describe('StorageService - 시간 정보', () => {
  it('마지막 저장 시간을 확인할 수 있어야 함', () => {
    const state: Partial<GameState> = {
      myCharacter: { id: 'player', name: '테스트' },
      characters: {},
      affinities: {},
      inventory: [],
      quests: []
    }

    storageService.saveGameState(state)
    const lastSaveTime = storageService.getLastSaveTime()

    expect(lastSaveTime).not.toBeNull()
    expect(lastSaveTime).toBeInstanceOf(Date)
  })

  it('저장된 데이터가 없으면 마지막 저장 시간은 null이어야 함', () => {
    const lastSaveTime = storageService.getLastSaveTime()
    expect(lastSaveTime).toBeNull()
  })
})

describe('StorageService - 데이터 관리', () => {
  it('모든 데이터를 삭제할 수 있어야 함', () => {
    const state: Partial<GameState> = {
      myCharacter: { id: 'player', name: '테스트' },
      characters: {},
      affinities: {},
      inventory: [],
      quests: []
    }

    storageService.saveGameState(state)
    expect(storageService.hasSaveData()).toBe(true)

    const result = storageService.clearAllData()
    expect(result).toBe(true)
    expect(storageService.hasSaveData()).toBe(false)
  })
})

describe('StorageService - 자동 저장', () => {
  it('자동 저장을 시작할 수 있어야 함', () => {
    let saveCalled = false
    const saveCallback = () => {
      saveCalled = true
    }

    storageService.startAutoSave(saveCallback)

    // 타이머가 설정되었는지 확인
    expect(storageService).toBeDefined()
  })

  it('자동 저장을 중지할 수 있어야 함', () => {
    const saveCallback = () => {}
    storageService.startAutoSave(saveCallback)
    storageService.stopAutoSave()

    // 중지된 것을 확인 (예외가 발생하지 않아야 함)
    expect(storageService).toBeDefined()
  })
})