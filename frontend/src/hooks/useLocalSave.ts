/**
 * useLocalSave - 로컬 저장 React Hook
 *
 * App.jsx에서 사용하여 자동 저장 및 로드 기능 제공
 */

import { useEffect, useCallback, useRef } from 'react'
import { storageService, type GameState, type SaveOptions } from '../utils/storageService'

interface UseLocalSaveOptions {
  autoSave?: boolean
  autoSaveInterval?: number
  onLoad?: (state: GameState | null) => void
  onSave?: (success: boolean) => void
}

/**
 * 로컬 저장 훅
 */
export function useLocalSave(
  getState: () => Partial<GameState>,
  options: UseLocalSaveOptions = {}
) {
  const {
    autoSave = true,
    autoSaveInterval = 5 * 60 * 1000, // 5분
    onLoad,
    onSave
  } = options

  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null)

  /**
   * 수동 저장
   */
  const save = useCallback((saveOptions: SaveOptions = {}) => {
    const state = getState()
    const success = storageService.saveGameState(state, saveOptions)

    if (onSave) {
      onSave(success)
    }

    return success
  }, [getState, onSave])

  /**
   * 수동 로드
   */
  const load = useCallback(() => {
    const state = storageService.loadGameState()

    if (onLoad) {
      onLoad(state)
    }

    return state
  }, [onLoad])

  /**
   * 자동 저장 시작
   */
  const startAutoSave = useCallback(() => {
    stopAutoSave()

    autoSaveTimerRef.current = setInterval(() => {
      console.log('💾 자동 저장 실행 중...')
      save({ silent: true })
    }, autoSaveInterval)

    console.log('✅ 자동 저장 시작됨')
  }, [autoSaveInterval, save])

  /**
   * 자동 저장 중지
   */
  const stopAutoSave = useCallback(() => {
    if (autoSaveTimerRef.current) {
      clearInterval(autoSaveTimerRef.current)
      autoSaveTimerRef.current = null
      console.log('⏹️ 자동 저장 중지됨')
    }
  }, [])

  /**
   * 마운트 시 로드 및 자동 저장 설정
   */
  useEffect(() => {
    // 저장된 데이터 로드
    const savedState = load()

    // 자동 저장 시작
    if (autoSave && savedState) {
      startAutoSave()
    }

    // 언마운트 시 자동 저장 중지
    return () => {
      stopAutoSave()
    }
  }, [autoSave, load, startAutoSave, stopAutoSave])

  /**
   * 설정 저장
   */
  const saveSettings = useCallback((settings: any) => {
    return storageService.saveSettings(settings)
  }, [])

  /**
   * 설정 로드
   */
  const loadSettings = useCallback(() => {
    return storageService.loadSettings()
  }, [])

  /**
   * 저장 데이터 확인
   */
  const hasData = useCallback(() => {
    return storageService.hasSaveData()
  }, [])

  /**
   * 마지막 저장 시간
   */
  const getLastSaveTime = useCallback(() => {
    return storageService.getLastSaveTime()
  }, [])

  /**
   * 모든 데이터 삭제
   */
  const clearAll = useCallback(() => {
    return storageService.clearAllData()
  }, [])

  return {
    save,
    load,
    saveSettings,
    loadSettings,
    hasData,
    getLastSaveTime,
    clearAll,
    startAutoSave,
    stopAutoSave
  }
}

/**
 * 플레이어 캐릭터 저장 훅
 */
export function usePlayerSave() {
  const savePlayer = useCallback((character: any) => {
    return storageService.savePlayerCharacter(character)
  }, [])

  const loadPlayer = useCallback(() => {
    return storageService.loadPlayerCharacter()
  }, [])

  return {
    savePlayer,
    loadPlayer
  }
}