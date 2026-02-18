/**
 * SoundManager v1.0
 *
 * AI Life Metaverse 사운드 시스템
 * - BGM 재생 시스템 (메인 테마, 상황별 BGM)
 * - 효과음 시스템 (버튼 클릭, 이동, 알림)
 * - 날씨별 사운드 (비, 눈)
 * - 사운드 온/오프 토글
 * - 볼륨 조절
 */

import { useState, useEffect } from 'react'
import { WEATHER_TYPES } from './weatherTimeSystem'

/**
 * 사운드 URL 상수
 */
export const BGM_URLS = {
  MAIN: '/audio/bgm/main_theme.mp3',
  DAY: '/audio/bgm/day_theme.mp3',
  NIGHT: '/audio/bgm/night_theme.mp3'
}

export const SFX_URLS = {
  BUTTON_CLICK: '/audio/sfx/button_click.wav',
  MOVE: '/audio/sfx/move.wav',
  NOTIFICATION: '/audio/sfx/notification.wav',
  QUEST_COMPLETE: '/audio/sfx/quest_complete.wav',
  ITEM_PICKUP: '/audio/sfx/item_pickup.wav',
  DOOR_OPEN: '/audio/sfx/door_open.wav'
}

export const WEATHER_URLS = {
  RAIN: '/audio/weather/rain_ambient.mp3',
  SNOW: '/audio/weather/snow_ambient.mp3'
}

class SoundManager {
  constructor() {
    this.sounds = {}
    this.bgmAudio = null
    this.weatherAudio = null
    this.isMuted = false
    this.masterVolume = 0.7
    this.bgmVolume = 0.5
    this.sfxVolume = 0.6
    this.weatherVolume = 0.4
  }

  /**
   * 사운드 파일 로드 (AudioContext 또는 Audio Element)
   */
  loadSound(name, url, type = 'sfx') {
    return new Promise((resolve, reject) => {
      const audio = new Audio()
      audio.src = url
      audio.preload = 'auto'

      audio.addEventListener('canplaythrough', () => {
        this.sounds[name] = { audio, type }
        resolve(audio)
      })

      audio.addEventListener('error', (err) => {
        console.error(`Failed to load sound: ${name}`, err)
        reject(err)
      })
    })
  }

  /**
   * 효과음 재생
   */
  playSound(name, volume = 1.0) {
    if (this.isMuted) return null

    const sound = this.sounds[name]
    if (!sound || sound.type !== 'sfx') {
      console.warn(`Sound not found or not SFX: ${name}`)
      return null
    }

    const audio = sound.audio.cloneNode?.() || sound.audio // 복제 본 사용
    audio.volume = Math.min(1, Math.max(0, volume)) * this.sfxVolume * this.masterVolume

    audio.play().catch(err => {
      console.warn(`Failed to play sound: ${name}`, err)
    })

    return audio
  }

  /**
   * BGM 재생 (반복)
   */
  playBGM(name, fadeInMs = 2000) {
    if (this.isMuted) return

    const sound = this.sounds[name]
    if (!sound || sound.type !== 'bgm') {
      console.warn(`Sound not found or not BGM: ${name}`)
      return
    }

    if (this.bgmAudio) {
      this.stopBGM(fadeInMs) // 이전 BGM 정지
    }

    this.bgmAudio = sound.audio.cloneNode?.() || sound.audio
    this.bgmAudio.loop = true
    this.bgmAudio.volume = 0 // 시작 시 음소거 (fade in)

    this.bgmAudio.play().catch(err => {
      console.warn(`Failed to play BGM: ${name}`, err)
    })

    // Fade in
    this.fadeAudio(this.bgmAudio, 0, this.bgmVolume * this.masterVolume, fadeInMs)
  }

  /**
   * BGM 정지
   */
  stopBGM(fadeOutMs = 1000) {
    if (!this.bgmAudio) return

    // Fade out 후 정지
    this.fadeAudio(this.bgmAudio, this.bgmAudio.volume, 0, fadeOutMs)

    setTimeout(() => {
      if (this.bgmAudio) {
        this.bgmAudio.pause()
        this.bgmAudio.currentTime = 0
        this.bgmAudio = null
      }
    }, fadeOutMs)
  }

  /**
   * 날씨 사운드 재생 (반복)
   */
  playWeatherSound(weather, fadeInMs = 2000) {
    if (this.isMuted) return

    // 날씨별 사운드 매핑
    const weatherSoundMap = {
      [WEATHER_TYPES.RAIN]: 'rain_ambient',
      [WEATHER_TYPES.SNOW]: 'snow_ambient'
    }

    const soundName = weatherSoundMap[weather]
    if (!soundName) {
      this.stopWeatherSound()
      return
    }

    if (this.weatherAudio && this.weatherSound === soundName) {
      return // 이미 같은 날씨 사운드 재생 중
    }

    this.stopWeatherSound(fadeInMs)

    const sound = this.sounds[soundName]
    if (!sound || sound.type !== 'weather') {
      console.warn(`Weather sound not found: ${soundName}`)
      return
    }

    this.weatherAudio = sound.audio.cloneNode?.() || sound.audio
    this.weatherAudio.loop = true
    this.weatherAudio.volume = 0

    this.weatherAudio.play().catch(err => {
      console.warn(`Failed to play weather sound: ${soundName}`, err)
    })

    this.fadeAudio(this.weatherAudio, 0, this.weatherVolume * this.masterVolume, fadeInMs)
    this.weatherSound = soundName
  }

  /**
   * 날씨 사운드 정지
   */
  stopWeatherSound(fadeOutMs = 1000) {
    if (!this.weatherAudio) return

    this.fadeAudio(this.weatherAudio, this.weatherAudio.volume, 0, fadeOutMs)

    setTimeout(() => {
      if (this.weatherAudio) {
        this.weatherAudio.pause()
        this.weatherAudio.currentTime = 0
        this.weatherAudio = null
        this.weatherSound = null
      }
    }, fadeOutMs)
  }

  /**
   * 오디오 페이드 (볼륨 부드럽게 변경)
   */
  fadeAudio(audio, fromVolume, toVolume, durationMs) {
    const startTime = performance.now()
    const volumeStep = (toVolume - fromVolume) / (durationMs / 50) // 50ms 간격

    const fadeInterval = setInterval(() => {
      const elapsed = performance.now() - startTime
      const progress = Math.min(elapsed / durationMs, 1)
      const currentVolume = fromVolume + (toVolume - fromVolume) * progress

      audio.volume = Math.max(0, Math.min(1, currentVolume))

      if (progress >= 1) {
        clearInterval(fadeInterval)
      }
    }, 50)
  }

  /**
   * 음소거 토글
   */
  toggleMute() {
    this.isMuted = !this.isMuted

    if (this.isMuted) {
      this.stopBGM(500)
      this.stopWeatherSound(500)
    }

    return this.isMuted
  }

  /**
   * 마스터 볼륨 설정
   */
  setMasterVolume(volume) {
    this.masterVolume = Math.max(0, Math.min(1, volume))

    // 재생 중인 오디오 볼륨 업데이트
    if (this.bgmAudio) {
      this.bgmAudio.volume = this.bgmVolume * this.masterVolume
    }
    if (this.weatherAudio) {
      this.weatherAudio.volume = this.weatherVolume * this.masterVolume
    }
  }

  /**
   * BGM 볼륨 설정
   */
  setBGMVolume(volume) {
    this.bgmVolume = Math.max(0, Math.min(1, volume))

    if (this.bgmAudio) {
      this.bgmAudio.volume = this.bgmVolume * this.masterVolume
    }
  }

  /**
   * 효과음 볼륨 설정
   */
  setSFXVolume(volume) {
    this.sfxVolume = Math.max(0, Math.min(1, volume))
  }

  /**
   * 날씨 사운드 볼륨 설정
   */
  setWeatherVolume(volume) {
    this.weatherVolume = Math.max(0, Math.min(1, volume))

    if (this.weatherAudio) {
      this.weatherAudio.volume = this.weatherVolume * this.masterVolume
    }
  }

  /**
   * 모든 사운드 정지
   */
  stopAll() {
    this.stopBGM(500)
    this.stopWeatherSound(500)
  }

  /**
   * 사운드 매니저 초기화
   */
  async initialize() {
    // BGM
    await this.loadSound('main_theme', BGM_URLS.MAIN, 'bgm')
    await this.loadSound('day_theme', BGM_URLS.DAY, 'bgm')
    await this.loadSound('night_theme', BGM_URLS.NIGHT, 'bgm')

    // 효과음
    await this.loadSound('button_click', SFX_URLS.BUTTON_CLICK, 'sfx')
    await this.loadSound('move', SFX_URLS.MOVE, 'sfx')
    await this.loadSound('notification', SFX_URLS.NOTIFICATION, 'sfx')
    await this.loadSound('quest_complete', SFX_URLS.QUEST_COMPLETE, 'sfx')
    await this.loadSound('item_pickup', SFX_URLS.ITEM_PICKUP, 'sfx')
    await this.loadSound('door_open', SFX_URLS.DOOR_OPEN, 'sfx')

    // 날씨 사운드
    await this.loadSound('rain_ambient', WEATHER_URLS.RAIN, 'weather')
    await this.loadSound('snow_ambient', WEATHER_URLS.SNOW, 'weather')

    console.log('SoundManager initialized successfully')
  }
}

// Singleton 인스턴스
export const soundManager = new SoundManager()

// 초기화 훅
export function useSoundManager() {
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    soundManager.initialize().then(() => {
      setIsInitialized(true)
    }).catch(err => {
      console.error('Failed to initialize SoundManager:', err)
    })

    return () => {
      soundManager.stopAll()
    }
  }, [])

  return { soundManager, isInitialized }
}

export default SoundManager