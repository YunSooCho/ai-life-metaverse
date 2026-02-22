/**
 * useLocalSave Hook 테스트
 */

import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { useLocalSave, usePlayerSave } from '../useLocalSave'
import { storageService, type GameState } from '../../utils/storageService'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString()
    },
    removeItem: (key: string) => {
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

beforeEach(() => {
  localStorage.clear()
  vi.clearAllMocks()
})

afterEach(() => {
  localStorage.clear()
})

describe('useLocalSave - 기본 기능', () => {
  it('저장 및 로드 함수를 제공해야 함', () => {
    const getState = vi.fn(() => ({
      myCharacter: { id: 'player', name: '테스트' },
      characters: {},
      affinities: {},
      inventory: [],
      quests: []
    }))

    const { result } = renderHook(() => useLocalSave(getState))

    expect(result.current.save).toBeDefined()
    expect(result.current.load).toBeDefined()
    expect(result.current.hasData).toBeDefined()
  })

  it('save를 호출하여 상태를 저장할 수 있어야 함', () => {
    const getState = vi.fn(() => ({
      myCharacter: { id: 'player', name: '테스트 플레이어' },
      characters: {},
      affinities: { ai1: 50 },
      inventory: [],
      quests: []
    }))

    const { result } = renderHook(() => useLocalSave(getState))

   act(() => {
      result.current.save()
    })

    expect(result.current.hasData()).toBe(true)
  })

  it('load를 호출하여 저장된 상태를 로드할 수 있어야 함', () => {
    const testState: Partial<GameState> = {
      myCharacter: { id: 'player', name: '로드 테스트', level: 5 },
      characters: { ai1: { id: 'ai1', name: 'AI 1' } },
      affinities: { ai1: 75 },
      inventory: [],
      quests: []
    }

    // 먼저 저장
    storageService.saveGameState(testState)

    // 그다음 로드
    const { result } = renderHook(() => useLocalSave(() => ({})))

    act(() => {
      const loadedState = result.current.load()
      expect(loadedState).not.toBeNull()
      expect(loadedState?.myCharacter.name).toBe('로드 테스트')
    })
  })
})

describe('useLocalSave - 옵션', () => {
  it('onLoad 콜백을 호출해야 함', () => {
    const onLoad = vi.fn()
    const getState = vi.fn(() => ({}))

    // 먼저 데이터 저장
    storageService.saveGameState({
      myCharacter: { id: 'player' },
      characters: {},
      affinities: {},
      inventory: [],
      quests: []
    })

    renderHook(() => useLocalSave(getState, { onLoad }))

    expect(onLoad).toHaveBeenCalled()
  })

  it('autoSave 옵션이 false이면 자동 저장을 시작하지 않아야 함', () => {
    const getState = vi.fn(() => ({}))
    const getStateSpy = vi.fn()

    renderHook(() => useLocalSave(getStateSpy, { autoSave: false }))

    // 자동 저장이 시작되지 않았는지 확인
    // setTimeout이나 setInterval이 호출되지 않았는지 확인
    expect(getStateSpy).not.toHaveBeenCalled()
  })
})

describe('useLocalSave - 설정 관리', () => {
  it('saveSettings를 호출하여 설정을 저장할 수 있어야 함', () => {
    const getState = vi.fn(() => ({}))
    const { result } = renderHook(() => useLocalSave(getState))

    const settings = {
      language: 'en',
      soundEnabled: false
    }

    act(() => {
      result.current.saveSettings(settings)
    })

    const loadedSettings = result.current.loadSettings()
    expect(loadedSettings?.language).toBe('en')
    expect(loadedSettings?.soundEnabled).toBe(false)
  })

  it('loadSettings를 호출하여 설정을 로드할 수 있어야 함', () => {
    const getState = vi.fn(() => ({}))
    const { result } = renderHook(() => useLocalSave(getState))

    // 먼저 설정 저장
    const settings = { language: 'ko', soundEnabled: true }
    act(() => {
      result.current.saveSettings(settings)
    })

    // 로드
    act(() => {
      const loadedSettings = result.current.loadSettings()
      expect(loadedSettings?.language).toBe('ko')
    })
  })
})

describe('useLocalSave - 데이터 관리', () => {
  it('clearAll을 호출하여 모든 데이터를 삭제할 수 있어야 함', () => {
    const getState = vi.fn(() => ({
      myCharacter: { id: 'player' },
      characters: {},
      affinities: {},
      inventory: [],
      quests: []
    }))

    const { result } = renderHook(() => useLocalSave(getState))

    // 저장
    act(() => {
      result.current.save()
    })
    expect(result.current.hasData()).toBe(true)

    // 삭제
    act(() => {
      result.current.clearAll()
    })
    expect(result.current.hasData()).toBe(false)
  })

  it('hasData를 호출하여 저장된 데이터 존재 여부를 확인할 수 있어야 함', () => {
    const getState = vi.fn(() => ({}))
    const { result } = renderHook(() => useLocalSave(getState))

    expect(result.current.hasData()).toBe(false)

    act(() => {
      result.current.save()
    })
    expect(result.current.hasData()).toBe(true)
  })

  it('getLastSaveTime를 호출하여 마지막 저장 시간을 확인할 수 있어야 함', () => {
    const getState = vi.fn(() => ({
      myCharacter: { id: 'player' },
      characters: {},
      affinities: {},
      inventory: [],
      quests: []
    }))

    const { result } = renderHook(() => useLocalSave(getState))

    act(() => {
      result.current.save()
    })

    const lastSaveTime = result.current.getLastSaveTime()
    expect(lastSaveTime).not.toBeNull()
    expect(lastSaveTime).toBeInstanceOf(Date)
  })
})

describe('usePlayerSave', () => {
  it('플레이어 캐릭터를 저장할 수 있어야 함', () => {
    const { result } = renderHook(() => usePlayerSave())

    const character = {
      id: 'player',
      name: '영웅',
      level: 10
    }

    act(() => {
      result.current.savePlayer(character)
    })

    // 로드 확인
    const loaded = result.current.loadPlayer()
    expect(loaded).not.toBeNull()
    expect(loaded?.name).toBe('영웅')
  })

  it('플레이어 캐릭터를 로드할 수 있어야 함', () => {
    // 먼저 저장
    const character = {
      id: 'player',
      name: '로드 테스트',
      level: 5
    }
    storageService.savePlayerCharacter(character)

    // 로드 훅 사용
    const { result } = renderHook(() => usePlayerSave())

    act(() => {
      const loaded = result.current.loadPlayer()
      expect(loaded?.name).toBe('로드 테스트')
    })
  })
})