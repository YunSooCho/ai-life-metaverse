/**
 * 사운드 매니저
 *
 * BGM, 효과음, 대화 사운드를 재생하고 제어합니다.
 * Web Audio API를 사용합니다.
 */

class SoundManager {
  constructor() {
    this.audioContext = null
    this.bgmGainNode = null
    this.sfxGainNode = null
    this.voiceGainNode = null
    this.currentBGM = null
    this.currentBGMSource = null
    this.enabled = true
    this.bgmVolume = 0.5 // BGM 볼륨 (0.0 ~ 1.0)
    this.sfxVolume = 0.7 // 효과음 볼륨 (0.0 ~ 1.0)
    this.voiceVolume = 0.8 // 대화 사운드 볼륨 (0.0 ~ 1.0)
    this.initialized = false
  }

  /**
   * Audio Context 초기화 (사용자 제스처 후 호출 필요)
   */
  async init() {
    if (this.initialized) return

    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)()

      // 게인 노드 생성 (BGM, SFX, Voice 분리)
      this.bgmGainNode = this.audioContext.createGain()
      this.sfxGainNode = this.audioContext.createGain()
      this.voiceGainNode = this.audioContext.createGain()

      // 볼륨 설정
      this.bgmGainNode.gain.value = this.bgmVolume
      this.sfxGainNode.gain.value = this.sfxVolume
      this.voiceGainNode.gain.value = this.voiceVolume

      // 마스터에 연결
      this.bgmGainNode.connect(this.audioContext.destination)
      this.sfxGainNode.connect(this.audioContext.destination)
      this.voiceGainNode.connect(this.audioContext.destination)

      this.initialized = true
      console.log('Sound Manager 초기화 완료')
    } catch (error) {
      console.error('Sound Manager 초기화 실패:', error)
    }
  }

  /**
   * BGM 재생
   *
   * @param {string} bgmUrl - BGM 파일 URL
   * @param {boolean} loop - 반복 재생 여부 (기본값: true)
   */
  async playBGM(bgmUrl, loop = true) {
    if (!this.enabled || !this.initialized) return

    try {
      // 현재 BGM 중지
      this.stopBGM()

      // 오디오 파일 로드
      const response = await fetch(bgmUrl)
      const arrayBuffer = await response.arrayBuffer()
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer)

      // 오디오 소스 생성
      this.currentBGMSource = this.audioContext.createBufferSource()
      this.currentBGMSource.buffer = audioBuffer
      this.currentBGMSource.loop = loop

      // BGM 게인 노드에 연결
      this.currentBGMSource.connect(this.bgmGainNode)

      // 재생
      this.currentBGMSource.start(0)
      this.currentBGM = bgmUrl

      console.log('BGM 재생:', bgmUrl)
    } catch (error) {
      console.error('BGM 재생 실패:', error)
    }
  }

  /**
   * BGM 중지
   */
  stopBGM() {
    if (this.currentBGMSource) {
      try {
        this.currentBGMSource.stop()
      } catch (error) {
        // 이미 중지된 경우 무시
      }
      this.currentBGMSource = null
      this.currentBGM = null
    }
  }

  /**
   * 효과음 재생
   *
   * @param {string} sfxUrl - 효과음 파일 URL
   */
  async playSFX(sfxUrl) {
    if (!this.enabled || !this.initialized) return

    try {
      const response = await fetch(sfxUrl)
      const arrayBuffer = await response.arrayBuffer()
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer)

      const source = this.audioContext.createBufferSource()
      source.buffer = audioBuffer

      source.connect(this.sfxGainNode)
      source.start(0)
    } catch (error) {
      console.error('SFX 재생 실패:', error)
    }
  }

  /**
   * 대화 사운드 재생 (캐릭터별 톤)
   *
   * @param {string} voiceUrl - 대화 사운드 파일 URL
   * @param {number} pitch - 피치 변환 (0.5 ~ 2.0, 기본값: 1.0)
   */
  async playVoice(voiceUrl, pitch = 1.0) {
    if (!this.enabled || !this.initialized) return

    try {
      const response = await fetch(voiceUrl)
      const arrayBuffer = await response.arrayBuffer()
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer)

      const source = this.audioContext.createBufferSource()
      source.buffer = audioBuffer
      source.playbackRate.value = pitch // 피치 변환

      source.connect(this.voiceGainNode)
      source.start(0)
    } catch (error) {
      console.error('Voice 재생 실패:', error)
    }
  }

  /**
   * BGM 볼륨 설정
   *
   * @param {number} volume - 볼륨 (0.0 ~ 1.0)
   */
  setBGMVolume(volume) {
    this.bgmVolume = Math.max(0, Math.min(1, volume))
    if (this.bgmGainNode) {
      this.bgmGainNode.gain.value = this.bgmVolume
    }
  }

  /**
   * 효과음 볼륨 설정
   *
   * @param {number} volume - 볼륨 (0.0 ~ 1.0)
   */
  setSFXVolume(volume) {
    this.sfxVolume = Math.max(0, Math.min(1, volume))
    if (this.sfxGainNode) {
      this.sfxGainNode.gain.value = this.sfxVolume
    }
  }

  /**
   * 대화 사운드 볼륨 설정
   *
   * @param {number} volume - 볼륨 (0.0 ~ 1.0)
   */
  setVoiceVolume(volume) {
    this.voiceVolume = Math.max(0, Math.min(1, volume))
    if (this.voiceGainNode) {
      this.voiceGainNode.gain.value = this.voiceVolume
    }
  }

  /**
   * 소리 끄기 / 켜기
   *
   * @param {boolean} enabled - 활성화 여부
   */
  setEnabled(enabled) {
    this.enabled = enabled

    if (!enabled) {
      this.stopBGM()
    }
  }

  /**
   * 모든 소리 중지
   */
  stopAll() {
    this.stopBGM()
  }
}

// 싱글톤 인스턴스
export const soundManager = new SoundManager()

// BGM URL 상수
export const BGM_URLS = {
  MAIN: '/audio/bgm/main.mp3',
  CAFE: '/audio/bgm/cafe.mp3',
  LIBRARY: '/audio/bgm/library.mp3',
  NIGHT: '/audio/bgm/night.mp3'
}

// 효과음 URL 상수
export const SFX_URLS = {
  BUTTON_CLICK: '/audio/sfx/button-click.mp3',
  MOVE: '/audio/sfx/move.mp3',
  ITEM_GET: '/audio/sfx/item-get.mp3',
  GREET: '/audio/sfx/greet.mp3',
  GIFT: '/audio/sfx/gift.mp3',
  QUEST_COMPLETE: '/audio/sfx/quest-complete.mp3'
}

// 대화 사운드 URL 상수
export const VOICE_URLS = {
  AI1: '/audio/voice/ai1.mp3',
  AI2: '/audio/voice/ai2.mp3',
  AI3: '/audio/voice/ai3.mp3'
}

export default soundManager