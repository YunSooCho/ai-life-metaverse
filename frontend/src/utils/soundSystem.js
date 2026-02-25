/**
 * 사운드 시스템
 * Web Audio API 사용 - 사운드 파일 없이 프로그래밍 방식으로 사운드 생성
 */

class SoundSystem {
  constructor() {
    this.audioContext = null
    this.bgmNodes = {}
    this.bgmVolume = 0.3
    this.sfxVolume = 0.5
    this.muted = false
    this.weatherSoundNode = null
    this.weatherSoundGain = null
  }

  // 오디오 컨텍스트 초기화 (사용자 제스처 필요)
  init() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)()
    }
    return this.audioContext
  }

  // 볼륨 설정
  setBgmVolume(volume) {
    this.bgmVolume = Math.max(0, Math.min(1, volume))
    Object.values(this.bgmNodes).forEach(node => {
      if (node.gain) node.gain.gain.setValueAtTime(this.bgmVolume * this.bgmVolume, this.audioContext.currentTime)
    })
  }

  setSfxVolume(volume) {
    this.sfxVolume = Math.max(0, Math.min(1, volume))
  }

  toggleMute() {
    this.muted = !this.muted
    if (this.muted) {
      this.stopAllBgm()
      this.stopWeatherSound()
    }
    return this.muted
  }

  // BGM 재생 (시간대별)
  playBgm(timezone = 'day') {
    if (!this.audioContext || this.muted) return

    this.stopAllBgm()

    const bgmConfigs = {
      morning: { freq: 440, type: 'sine' },      // 아침: 밝은 톤
      day: { freq: 523.25, type: 'triangle' },   // 낮: 활기
      evening: { freq: 392, type: 'sine' },     // 저녁: 차분
      night: { freq: 330, type: 'sine' }        // 밤: 어두운 톤
    }

    const config = bgmConfigs[timezone] || bgmConfigs.day

    const osc = this.audioContext.createOscillator()
    const gain = this.audioContext.createGain()

    osc.type = config.type
    osc.frequency.setValueAtTime(config.freq, this.audioContext.currentTime)

    gain.gain.setValueAtTime(0, this.audioContext.currentTime)
    gain.gain.linearRampToValueAtTime(this.bgmVolume * 0.2, this.audioContext.currentTime + 1)

    osc.connect(gain)
    gain.connect(this.audioContext.destination)

    osc.start()
    this.bgmNodes[timezone] = { osc, gain }
  }

  stopBgm(timezone) {
    const node = this.bgmNodes[timezone]
    if (node) {
      node.gain.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 0.5)
      node.osc.stop(this.audioContext.currentTime + 0.5)
      delete this.bgmNodes[timezone]
    }
  }

  stopAllBgm() {
    Object.keys(this.bgmNodes).forEach(timezone => this.stopBgm(timezone))
  }

  // 효과음
  playClick() {
    if (!this.audioContext || this.muted) return
    this._playTone(800, 'square', 0.05, this.sfxVolume * 0.3)
  }

  playInteract() {
    if (!this.audioContext || this.muted) return
    this._playTone(600, 'sine', 0.1, this.sfxVolume * 0.4)
  }

  playItemUse() {
    if (!this.audioContext || this.muted) return
    this._playTone(1000, 'triangle', 0.15, this.sfxVolume * 0.5)
  }

  playQuestComplete() {
    if (!this.audioContext || this.muted) return
    // 3음 연주 (도 미 솔)
    setTimeout(() => this._playTone(523.25, 'sine', 0.15, this.sfxVolume * 0.6), 0)
    setTimeout(() => this._playTone(659.25, 'sine', 0.15, this.sfxVolume * 0.6), 150)
    setTimeout(() => this._playTone(783.99, 'sine', 0.3, this.sfxVolume * 0.6), 300)
  }

  // 날씨 환경음 (비, 눈)
  startWeatherSound(weather) {
    if (!this.audioContext || this.muted) return
    this.stopWeatherSound()

    if (weather === 'RAIN' || weather === 'SNOW') {
      const noise = this._createNoise()
      const gain = this.audioContext.createGain()

      gain.gain.setValueAtTime(this.sfxVolume * 0.1, this.audioContext.currentTime)

      noise.connect(gain)
      gain.connect(this.audioContext.destination)

      this.weatherSoundNode = noise
      this.weatherSoundGain = gain
    }
  }

  stopWeatherSound() {
    if (this.weatherSoundNode) {
      this.weatherSoundGain.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 0.5)
      this.weatherSoundNode.stop(this.audioContext.currentTime + 0.5)
      this.weatherSoundNode = null
      this.weatherSoundGain = null
    }
  }

  // 프라이빗: 단일 톤 재생
  _playTone(freq, type, duration, volume) {
    const osc = this.audioContext.createOscillator()
    const gain = this.audioContext.createGain()

    osc.type = type
    osc.frequency.setValueAtTime(freq, this.audioContext.currentTime)

    gain.gain.setValueAtTime(volume, this.audioContext.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration)

    osc.connect(gain)
    gain.connect(this.audioContext.destination)

    osc.start()
    osc.stop(this.audioContext.currentTime + duration)
  }

  // 프라이빗: 노이즈 생성 (비/눈 효과)
  _createNoise() {
    const bufferSize = this.audioContext.sampleRate * 2
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate)
    const data = buffer.getChannelData(0)

    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1
    }

    const noise = this.audioContext.createBufferSource()
    noise.buffer = buffer
    noise.loop = true

    return noise
  }
}

const soundSystem = new SoundSystem()
export default soundSystem

// 사운드 타입 상수
export const SOUND_TYPES = {
  CLICK: 'click',
  INTERACT: 'interact',
  ITEM_USE: 'item_use',
  QUEST_COMPLETE: 'quest_complete',
  WEATHER: 'weather'
}