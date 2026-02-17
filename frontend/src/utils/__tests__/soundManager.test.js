/**
 * SoundManager 테스트
 *
 * 오디오 파일이 없을 때 silent fail을 테스트합니다.
 */

import { soundManager, BGM_URLS, SFX_URLS, VOICE_URLS } from '../soundManager'

// 오디오 컨텍스트 Mock
class MockAudioContext {
  constructor() {
    this.createGain = jest.fn(() => ({
      gain: { value: 0 },
      connect: jest.fn()
    }))
    this.createBufferSource = jest.fn(() => ({
      connect: jest.fn(),
      start: jest.fn()
    }))
    this.decodeAudioData = jest.fn(() => Promise.reject(new Error('Mock error')))
  }

  static get supported() {
    return true
  }
}

// Web Audio API Mock
global.AudioContext = MockAudioContext
global.webkitAudioContext = MockAudioContext

// Fetch Mock (404 for audio files)
global.fetch = jest.fn(() => Promise.resolve({
  ok: false,
  status: 404,
  arrayBuffer: () => Promise.reject(new Error('File not found'))
}))

describe('SoundManager - 오디오 파일 없을 때 silent fail', () => {
  beforeEach(async () => {
    jest.clearAllMocks()
    await soundManager.init()
  })

  test('playBGM은 파일이 없을 때 silent fail해야 함', async () => {
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation()

    await soundManager.playBGM(BGM_URLS.MAIN)

    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining('BGM 파일을 찾을 수 없음')
    )
    consoleWarnSpy.mockRestore()
  })

  test('playSFX는 파일이 없을 때 silent fail해야 함', async () => {
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation()

    await soundManager.playSFX(SFX_URLS.BUTTON_CLICK)

    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining('SFX 파일을 찾을 수 없음')
    )
    consoleWarnSpy.mockRestore()
  })

  test('playVoice는 파일이 없을 때 silent fail해야 함', async () => {
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation()

    await soundManager.playVoice(VOICE_URLS.AI1)

    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining('Voice 파일을 찾을 수 없음')
    )
    consoleWarnSpy.mockRestore()
  })

  test('enabled=false일 때 재생하지 않음', async () => {
    soundManager.setEnabled(false)

    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation()

    await soundManager.playBGM(BGM_URLS.MAIN)
    await soundManager.playSFX(SFX_URLS.BUTTON_CLICK)

    expect(consoleWarnSpy).not.toHaveBeenCalled()
    consoleWarnSpy.mockRestore()

    // 원래 상태 복원
    soundManager.setEnabled(true)
  })

  test('initialized=false일 때 재생하지 않음', () => {
    const uninitializedManager = new (Object.getPrototypeOf(soundManager).constructor)()

    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation()

    uninitializedManager.playBGM(BGM_URLS.MAIN)

    expect(consoleWarnSpy).not.toHaveBeenCalled()
    consoleWarnSpy.mockRestore()
  })
})

describe('SoundManager - 볼륨 컨트롤', () => {
  test('setBGMVolume은 0.0~1.0 범위로 제한해야 함', async () => {
    await soundManager.init()

    soundManager.setBGMVolume(-1)
    expect(soundManager.bgmVolume).toBe(0)

    soundManager.setBGMVolume(2)
    expect(soundManager.bgmVolume).toBe(1)

    soundManager.setBGMVolume(0.5)
    expect(soundManager.bgmVolume).toBe(0.5)
  })

  test('setSFXVolume은 0.0~1.0 범위로 제한해야 함', () => {
    soundManager.setSFXVolume(-0.5)
    expect(soundManager.sfxVolume).toBe(0)

    soundManager.setSFXVolume(1.5)
    expect(soundManager.sfxVolume).toBe(1)

    soundManager.setSFXVolume(0.7)
    expect(soundManager.sfxVolume).toBe(0.7)
  })

  test('setEnabled=false일 때 BGM이 중지되어야 함', async () => {
    await soundManager.init()

    // BGM이 재생 중일 때 (Mock 상태)
    soundManager.currentBGM = BGM_URLS.MAIN
    soundManager.currentBGMSource = { stop: jest.fn() }

    soundManager.setEnabled(false)

    expect(soundManager.currentBGM).toBeNull()
    expect(soundManager.enabled).toBe(false)
  })
})