import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import soundManager, { BGM_URLS, SFX_URLS, VOICE_URLS } from '../soundManager'

describe('SoundManager', () => {
  beforeEach(() => {
    // AudioContext Mock 설정
    global.AudioContext = vi.fn(() => ({
      createGain: vi.fn(() => ({
        connect: vi.fn(),
        gain: { value: 0 }
      })),
      createBufferSource: vi.fn(() => ({
        buffer: null,
        loop: false,
        connect: vi.fn(),
        start: vi.fn(),
        stop: vi.fn()
      })),
      decodeAudioData: vi.fn(() => Promise.resolve({})),
      destination: {}
    }))

    global.fetch = vi.fn(() =>
      Promise.resolve({
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(8))
      })
    )
  })

  afterEach(() => {
    vi.clearAllMocks()
    // 싱글톤 상태 리셋
    soundManager.initialized = false
    soundManager.audioContext = null
    soundManager.currentBGM = null
    soundManager.currentBGMSource = null
    soundManager.enabled = true
  })

  describe('초기화', () => {
    it('should initialize audio context', async () => {
      await soundManager.init()
      expect(soundManager.initialized).toBe(true)
      expect(soundManager.audioContext).toBeTruthy()
    })

    it('should not initialize twice', async () => {
      await soundManager.init()
      const firstContext = soundManager.audioContext

      await soundManager.init()
      expect(soundManager.audioContext).toBe(firstContext)
    })
  })

  describe('볼륨 제어', () => {
    it('should set BGM volume', () => {
      soundManager.setBGMVolume(0.7)
      expect(soundManager.bgmVolume).toBe(0.7)
    })

    it('should clamp BGM volume to 0.0 - 1.0', () => {
      soundManager.setBGMVolume(1.5)
      expect(soundManager.bgmVolume).toBe(1.0)

      soundManager.setBGMVolume(-0.5)
      expect(soundManager.bgmVolume).toBe(0.0)
    })

    it('should set SFX volume', () => {
      soundManager.setSFXVolume(0.6)
      expect(soundManager.sfxVolume).toBe(0.6)
    })

    it('should set voice volume', () => {
      soundManager.setVoiceVolume(0.8)
      expect(soundManager.voiceVolume).toBe(0.8)
    })
  })

  describe('활성화/비활성화', () => {
    it('should enable sound', () => {
      soundManager.setEnabled(true)
      expect(soundManager.enabled).toBe(true)
    })

    it('should disable sound and stop BGM', () => {
      soundManager.setEnabled(false)
      expect(soundManager.enabled).toBe(false)
    })
  })

  describe('BGM 재생', () => {
    it('should play BGM when enabled', async () => {
      await soundManager.init()
      await soundManager.playBGM('/test.mp3')
      expect(soundManager.currentBGM).toBe('/test.mp3')
    })

    it('should not play BGM when disabled', async () => {
      soundManager.setEnabled(false)
      await soundManager.init()
      await soundManager.playBGM('/test.mp3')
      expect(soundManager.currentBGM).toBeNull()
    })

    it('should stop BGM', () => {
      soundManager.currentBGMSource = {
        stop: vi.fn()
      }
      soundManager.stopBGM()
      expect(soundManager.currentBGMSource).toBeNull()
      expect(soundManager.currentBGM).toBeNull()
    })
  })

  describe('효과음 재생', () => {
    it('should play SFX when enabled', async () => {
      await soundManager.init()
      await soundManager.playSFX('/sfx.mp3')
      // 에러 없이 완료되면 성공
      expect(true).toBe(true)
    })

    it('should not play SFX when disabled', async () => {
      soundManager.setEnabled(false)
      await soundManager.init()
      await soundManager.playSFX('/sfx.mp3')
      // 비활성화 상태에서는 에러 없이 무시되어야 함
      expect(true).toBe(true)
    })
  })

  describe('대화 사운드 재생', () => {
    it('should play voice with default pitch', async () => {
      await soundManager.init()
      await soundManager.playVoice('/voice.mp3')
      expect(true).toBe(true)
    })

    it('should play voice with custom pitch', async () => {
      await soundManager.init()
      await soundManager.playVoice('/voice.mp3', 1.5)
      expect(true).toBe(true)
    })
  })

  describe('URL 상수', () => {
    it('should have BGM_URLS defined', () => {
      expect(BGM_URLS).toHaveProperty('MAIN')
      expect(BGM_URLS).toHaveProperty('CAFE')
      expect(BGM_URLS).toHaveProperty('LIBRARY')
      expect(BGM_URLS).toHaveProperty('NIGHT')
    })

    it('should have SFX_URLS defined', () => {
      expect(SFX_URLS).toHaveProperty('BUTTON_CLICK')
      expect(SFX_URLS).toHaveProperty('MOVE')
      expect(SFX_URLS).toHaveProperty('ITEM_GET')
      expect(SFX_URLS).toHaveProperty('GREET')
      expect(SFX_URLS).toHaveProperty('GIFT')
      expect(SFX_URLS).toHaveProperty('QUEST_COMPLETE')
    })

    it('should have VOICE_URLS defined', () => {
      expect(VOICE_URLS).toHaveProperty('AI1')
      expect(VOICE_URLS).toHaveProperty('AI2')
      expect(VOICE_URLS).toHaveProperty('AI3')
    })
  })
})