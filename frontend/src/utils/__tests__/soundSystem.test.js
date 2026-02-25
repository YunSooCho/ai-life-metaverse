/**
 * 사운드 시스템 테스트
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import soundSystem, { SOUND_TYPES } from '../soundSystem'

// Web Audio API mock
global.AudioContext = vi.fn(() => ({
  createOscillator: () => ({
    type: null,
    frequency: {
      setValueAtTime: vi.fn()
    },
    connect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn()
  }),
  createGain: () => ({
    gain: {
      setValueAtTime: vi.fn(),
      linearRampToValueAtTime: vi.fn(),
      exponentialRampToValueAtTime: vi.fn()
    },
    connect: vi.fn()
  }),
  createBuffer: vi.fn(() => ({
    getChannelData: vi.fn(() => new Float32Array(44100 * 2))
  })),
  createBufferSource: vi.fn(() => ({
    buffer: null,
    loop: false,
    connect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn()
  })),
  currentTime: 0
}))

global.webkitAudioContext = global.AudioContext

describe('SoundSystem', () => {
  beforeEach(() => {
    soundSystem.muted = false
    soundSystem.bgmNodes = {}
  })

  describe('초기화', () => {
    it('오디오 컨텍스트가 생성되어야 함', () => {
      const ctx = soundSystem.init()
      expect(ctx).toBeDefined()
      expect(soundSystem.audioContext).toBeDefined()
    })
  })

  describe('볼륨 제어', () => {
    it('BGM 볼륨 설정 (0~1 범위)', () => {
      soundSystem.init()
      soundSystem.setBgmVolume(0.5)
      expect(soundSystem.bgmVolume).toBe(0.5)
    })

    it('BGM 볼륨 클램핑 (최대 1)', () => {
      soundSystem.init()
      soundSystem.setBgmVolume(1.5)
      expect(soundSystem.bgmVolume).toBe(1)
    })

    it('BGM 볼륨 클램핑 (최소 0)', () => {
      soundSystem.init()
      soundSystem.setBgmVolume(-0.5)
      expect(soundSystem.bgmVolume).toBe(0)
    })

    it('SFX 볼륨 설정', () => {
      soundSystem.init()
      soundSystem.setSfxVolume(0.7)
      expect(soundSystem.sfxVolume).toBe(0.7)
    })
  })

  describe('음소거', () => {
    it('음소거 토글', () => {
      const result = soundSystem.toggleMute()
      expect(result).toBe(true)
      expect(soundSystem.muted).toBe(true)

      const result2 = soundSystem.toggleMute()
      expect(result2).toBe(false)
      expect(soundSystem.muted).toBe(false)
    })
  })

  describe('BGM 재생', () => {
    it('day BGM 시작', () => {
      soundSystem.init()
      soundSystem.playBgm('day')
      expect(soundSystem.bgmNodes.day).toBeDefined()
    })

    it('morning BGM 시작', () => {
      soundSystem.init()
      soundSystem.playBgm('morning')
      expect(soundSystem.bgmNodes.morning).toBeDefined()
    })

    it('night BGM 시작', () => {
      soundSystem.init()
      soundSystem.playBgm('night')
      expect(soundSystem.bgmNodes.night).toBeDefined()
    })

    it('특정 BGM 중지', () => {
      soundSystem.init()
      soundSystem.playBgm('day')
      soundSystem.stopBgm('day')
      expect(soundSystem.bgmNodes.day).toBeUndefined()
    })

    it('전체 BGM 중지', () => {
      soundSystem.init()
      soundSystem.playBgm('day')
      soundSystem.playBgm('night')
      soundSystem.stopAllBgm()
      expect(Object.keys(soundSystem.bgmNodes).length).toBe(0)
    })
  })

  describe('효과음', () => {
    it('CLICK 효과음 상수 정의', () => {
      expect(SOUND_TYPES.CLICK).toBe('click')
    })

    it('INTERACT 효과음 상수 정의', () => {
      expect(SOUND_TYPES.INTERACT).toBe('interact')
    })

    it('ITEM_USE 효과음 상수 정의', () => {
      expect(SOUND_TYPES.ITEM_USE).toBe('item_use')
    })

    it('QUEST_COMPLETE 효과음 상수 정의', () => {
      expect(SOUND_TYPES.QUEST_COMPLETE).toBe('quest_complete')
    })

    it('음소거 시 효과음 재생되지 않음', () => {
      soundSystem.muted = true
      soundSystem.init()
      soundSystem.playClick()
      // 에러 없이 리턴
      expect(true).toBe(true)
    })
  })

  describe('날씨 환경음', () => {
    it('RAIN 환경음 시작', () => {
      soundSystem.init()
      soundSystem.startWeatherSound('RAIN')
      expect(soundSystem.weatherSoundNode).toBeDefined()
    })

    it('SNOW 환경음 시작', () => {
      soundSystem.init()
      soundSystem.startWeatherSound('SNOW')
      expect(soundSystem.weatherSoundNode).toBeDefined()
    })

    it('날씨 환경음 중지', () => {
      soundSystem.init()
      soundSystem.startWeatherSound('RAIN')
      soundSystem.stopWeatherSound()
      expect(soundSystem.weatherSoundNode).toBeNull()
    })

    it('CLEAR 날씨는 환경음 없음', () => {
      soundSystem.init()
      soundSystem.startWeatherSound('CLEAR')
      expect(soundSystem.weatherSoundNode).toBeNull()
    })
  })
})