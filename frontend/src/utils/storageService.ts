/**
 * StorageService - 로컬 스토리지 및 세션 관리 서비스
 *
 * 기능:
 * - 게임 상태 로컬 스토리지에 저장/복구
 * - 세션 데이터 관리
 * - 자동 저장 및 로드
 */

const STORAGE_KEYS = {
  GAME_STATE: 'ai-life-game-state',
  PLAYER_CHARACTER: 'ai-life-player-character',
  SETTINGS: 'ai-life-settings',
  SESSION_DATA: 'ai-life-session-data'
} as const

export interface GameState {
  myCharacter: any
  characters: Record<string, any>
  affinities: Record<string, number>
  inventory: any[]
  quests: any[]
  settings?: any
  lastSaved: string
}

export interface SaveOptions {
  autoSave?: boolean
  silent?: boolean
}

class StorageService {
  private autoSaveTimer: NodeJS.Timeout | null = null
  private readonly AUTO_SAVE_INTERVAL = 5 * 60 * 1000 // 5분

  /**
   * 게임 상태 저장
   */
  saveGameState(state: Partial<GameState>, options: SaveOptions = {}): boolean {
    try {
      const saveData: GameState = {
        myCharacter: state.myCharacter,
        characters: state.characters || {},
        affinities: state.affinities || {},
        inventory: state.inventory || [],
        quests: state.quests || [],
        settings: state.settings,
        lastSaved: new Date().toISOString()
      }

      localStorage.setItem(STORAGE_KEYS.GAME_STATE, JSON.stringify(saveData))

      if (!options.silent) {
        console.log('✅ 게임 상태 저장됨:', new Date(saveData.lastSaved).toLocaleString())
      }

      return true
    } catch (error) {
      console.error('❌ 게임 상태 저장 실패:', error)
      return false
    }
  }

  /**
   * 게임 상태 로드
   */
  loadGameState(): GameState | null {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.GAME_STATE)
      if (!saved) {
        console.log('📦 저장된 게임 상태 없음')
        return null
      }

      const state: GameState = JSON.parse(saved)
      console.log('✅ 게임 상태 로드됨:', new Date(state.lastSaved).toLocaleString())
      return state
    } catch (error) {
      console.error('❌ 게임 상태 로드 실패:', error)
      return null
    }
  }

  /**
   * 플레이어 캐릭터 저장
   */
  savePlayerCharacter(character: any): boolean {
    try {
      localStorage.setItem(STORAGE_KEYS.PLAYER_CHARACTER, JSON.stringify(character))
      console.log('✅ 플레이어 캐릭터 저장됨')
      return true
    } catch (error) {
      console.error('❌ 플레이어 캐릭터 저장 실패:', error)
      return false
    }
  }

  /**
   * 플레이어 캐릭터 로드
   */
  loadPlayerCharacter(): any | null {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PLAYER_CHARACTER)
      if (!saved) return null

      return JSON.parse(saved)
    } catch (error) {
      console.error('❌ 플레이어 캐릭터 로드 실패:', error)
      return null
    }
  }

  /**
   * 설정 저장
   */
  saveSettings(settings: any): boolean {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify({
        ...settings,
        lastSaved: new Date().toISOString()
      }))
      console.log('✅ 설정 저장됨')
      return true
    } catch (error) {
      console.error('❌ 설정 저장 실패:', error)
      return false
    }
  }

  /**
   * 설정 로드
   */
  loadSettings(): any | null {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS)
      if (!saved) return null

      return JSON.parse(saved)
    } catch (error) {
      console.error('❌ 설정 로드 실패:', error)
      return null
    }
  }

  /**
   * 세션 데이터 저장
   */
  saveSessionData(data: any): boolean {
    try {
      localStorage.setItem(STORAGE_KEYS.SESSION_DATA, JSON.stringify({
        ...data,
        lastSaved: new Date().toISOString()
      }))
      return true
    } catch (error) {
      console.error('❌ 세션 데이터 저장 실패:', error)
      return false
    }
  }

  /**
   * 세션 데이터 로드
   */
  loadSessionData(): any | null {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SESSION_DATA)
      if (!saved) return null

      return JSON.parse(saved)
    } catch (error) {
      console.error('❌ 세션 데이터 로드 실패:', error)
      return null
    }
  }

  /**
   * 자동 저장 시작
   */
  startAutoSave(saveCallback: () => void): void {
    if (this.autoSaveTimer) {
      this.stopAutoSave()
    }

    this.autoSaveTimer = setInterval(() => {
      console.log('💾 자동 저장 실행...')
      saveCallback()
    }, this.AUTO_SAVE_INTERVAL)

    console.log('✅ 자동 저장 시작됨 (간격: 5분)')
  }

  /**
   * 자동 저장 중지
   */
  stopAutoSave(): void {
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer)
      this.autoSaveTimer = null
      console.log('⏹️ 자동 저장 중지됨')
    }
  }

  /**
   * 모든 저장 데이터 삭제
   */
  clearAllData(): boolean {
    try {
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key)
      })
      console.log('✅ 모든 저장 데이터 삭제됨')
      return true
    } catch (error) {
      console.error('❌ 데이터 삭제 실패:', error)
      return false
    }
  }

  /**
   * 저장 데이터 확인
   */
  hasSaveData(): boolean {
    return localStorage.getItem(STORAGE_KEYS.GAME_STATE) !== null
  }

  /**
   * 마지막 저장 시간 확인
   */
  getLastSaveTime(): Date | null {
    const state = this.loadGameState()
    return state ? new Date(state.lastSaved) : null
  }
}

// 싱글톤 인스턴스
export const storageService = new StorageService()

// React Hook
export const useLocalStorage = () => {
  return {
    saveState: (state: Partial<GameState>, options?: SaveOptions) =>
      storageService.saveGameState(state, options),
    loadState: () => storageService.loadGameState(),
    savePlayer: (character: any) => storageService.savePlayerCharacter(character),
    loadPlayer: () => storageService.loadPlayerCharacter(),
    saveSettings: (settings: any) => storageService.saveSettings(settings),
    loadSettings: () => storageService.loadSettings(),
    clearAll: () => storageService.clearAllData(),
    hasData: () => storageService.hasSaveData(),
    lastSaveTime: () => storageService.getLastSaveTime()
  }
}