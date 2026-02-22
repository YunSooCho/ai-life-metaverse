/**
 * 감정 시스템 (Emotion System)
 *
 * 기능:
 * - AI 캐릭터 기본 감정 상태 관리
 * - 감정 상태에 따른 대화 스타일 변화
 * - 감정이 자연스럽게 감진되는 메커니즘
 *
 * 감정 타입:
 * - 행복 (happy): 긍정적, 활발, 친근한 대화
 * - 슬픔 (sad): 차분, 진지, 공감적인 대화
 * - 화남 (angry): 단호, 직설적, 강한 어조
 * - 기쁨 (joy): 밝고 에너지 넘치는 대화
 * - 평온 (calm): 안정적, 논리적, 균형 잡힌 대화
 * - 불안 (anxious): 조심스럽고 물음이 많은 대화
 */

// 감정 타입 정의
export const EMOTION_TYPES = {
  HAPPY: 'happy',
  SAD: 'sad',
  ANGRY: 'angry',
  JOY: 'joy',
  CALM: 'calm',
  ANXIOUS: 'anxious'
}

// 감정 기본 설정
const EMOTION_DEFAULTS = {
  [EMOTION_TYPES.HAPPY]: {
    intensity: 0.5,
    decayRate: 0.01, // 매 초마다 감소
    boostRate: 0.2, // 긍정적 상호작용 시 증가
    speakingMultiplier: 1.1, // 말하기 스타일 강화
    emojiBonus: ['😊', '✨', '💕', '🌟'],
    minDuration: 60, // 최소 지속 시간 (초)
    maxDuration: 300 // 최대 지속 시간 (초)
  },
  [EMOTION_TYPES.SAD]: {
    intensity: 0.4,
    decayRate: 0.008,
    boostRate: 0.15,
    speakingMultiplier: 0.9,
    emojiBonus: ['😢', '😔', '🌧️', '💔'],
    minDuration: 120,
    maxDuration: 600
  },
  [EMOTION_TYPES.ANGRY]: {
    intensity: 0.6,
    decayRate: 0.015,
    boostRate: 0.25,
    speakingMultiplier: 1.2,
    emojiBonus: ['😤', '😠', '💢', '🔥'],
    minDuration: 30,
    maxDuration: 180
  },
  [EMOTION_TYPES.JOY]: {
    intensity: 0.7,
    decayRate: 0.012,
    boostRate: 0.18,
    speakingMultiplier: 1.3,
    emojiBonus: ['🎉', '😆', '🥳', '💃'],
    minDuration: 45,
    maxDuration: 240
  },
  [EMOTION_TYPES.CALM]: {
    intensity: 0.3,
    decayRate: 0.005,
    boostRate: 0.1,
    speakingMultiplier: 0.95,
    emojiBonus: ['😌', '🍃', '🌊', '☕'],
    minDuration: 180,
    maxDuration: 900
  },
  [EMOTION_TYPES.ANXIOUS]: {
    intensity: 0.45,
    decayRate: 0.01,
    boostRate: 0.2,
    speakingMultiplier: 0.85,
    emojiBonus: ['😰', '🤔', '💭', '❓'],
    minDuration: 60,
    maxDuration: 300
  }
}

// 감정 상태 클래스
class EmotionState {
  constructor(characterId) {
    this.characterId = characterId
    this.currentEmotion = EMOTION_TYPES.CALM // 기본 감정
    this.intensity = EMOTION_DEFAULTS[EMOTION_TYPES.CALM].intensity
    this.emotionStartTime = Date.now()
    this.emotionDuration = EMOTION_DEFAULTS[EMOTION_TYPES.CALM].maxDuration * 1000
    this.emotionHistory = [] // 감정 변화 히스토리
  }

  // 감정 설정
  setEmotion(emotionType, intensity = null) {
    if (!EMOTION_DEFAULTS[emotionType]) {
      console.log(`⚠️ 유효하지 않은 감정 타입: ${emotionType}`)
      return false
    }

    // 이전 감정 값 저장
    const oldEmotion = this.currentEmotion
    const oldIntensity = this.intensity

    // 새 감정 설정
    this.currentEmotion = emotionType
    this.intensity = intensity !== null ? intensity : EMOTION_DEFAULTS[emotionType].intensity
    this.emotionStartTime = Date.now()
    this.emotionDuration = this.getRandomDuration(emotionType)

    // 이전 감정 기록 (새 감정 설정 후 기록)
    this.recordEmotionChange(oldEmotion, oldIntensity)

    console.log(`😊 감정 설정: ${this.characterId} → ${emotionType} (강도: ${this.intensity.toFixed(2)})`)
    return true
  }

  // 랜덤 지속 시간 계산
  getRandomDuration(emotionType) {
    const defaults = EMOTION_DEFAULTS[emotionType]
    const minMs = defaults.minDuration * 1000
    const maxMs = defaults.maxDuration * 1000
    return minMs + Math.random() * (maxMs - minMs)
  }

  // 감정 강화
  boostEmotion(amount = null) {
    const defaults = EMOTION_DEFAULTS[this.currentEmotion]
    const boost = amount !== null ? amount : defaults.boostRate
    this.intensity = Math.min(1.0, this.intensity + boost)
    console.log(`💖 감정 강화: ${this.characterId} → ${this.currentEmotion} (${this.intensity.toFixed(2)})`)
  }

  // 감정 감지 (자연 감진)
  decayEmotion() {
    const defaults = EMOTION_DEFAULTS[this.currentEmotion]
    const elapsed = Date.now() - this.emotionStartTime

    // 지속 시간이 지나면 감정 감소
    if (elapsed > this.emotionDuration) {
      this.intensity -= defaults.decayRate

      // 감정이 너무 약해지면 평온 상태로 전환
      if (this.intensity <= 0.1) {
        this.setEmotion(EMOTION_TYPES.CALM, 0.3)
      }
    }
  }

  // 감정 기록
  recordEmotionChange(oldEmotion, oldIntensity) {
    this.emotionHistory.push({
      from: oldEmotion,
      to: this.currentEmotion,
      fromIntensity: oldIntensity,
      toIntensity: this.intensity,
      timestamp: Date.now()
    })

    // 최근 20개만 유지
    if (this.emotionHistory.length > 20) {
      this.emotionHistory.shift()
    }
  }

  // 현재 감정 정보 가져오기
  getCurrentEmotion() {
    return {
      type: this.currentEmotion,
      intensity: this.intensity,
      startTime: this.emotionStartTime,
      duration: this.emotionDuration
    }
  }

  // 감정에 따른 이모티콘 선택
  getEmoji() {
    const defaults = EMOTION_DEFAULTS[this.currentEmotion]
    const emojis = defaults.emojiBonus
    return emojis[Math.floor(Math.random() * emojis.length)]
  }

  // 감정에 따른 말하기 스타일 수정
  getSpeakingStyleModifier() {
    const defaults = EMOTION_DEFAULTS[this.currentEmotion]
    return defaults.speakingMultiplier
  }

  // 감정 강도 기반 대화 수정자
  getIntensityModifier() {
    if (this.intensity < 0.3) return 'weak'
    if (this.intensity < 0.6) return 'moderate'
    return 'strong'
  }
}

// 감정 시스템 관리자
class EmotionSystem {
  constructor() {
    this.emotionStates = new Map() // characterId → EmotionState
    this.decayInterval = 1000 // 1초마다 감정 감지
    this.decayTimer = null
  }

  // 캐릭터 감정 상태 가져오기 또는 생성
  getEmotionState(characterId) {
    if (!this.emotionStates.has(characterId)) {
      this.emotionStates.set(characterId, new EmotionState(characterId))
    }
    return this.emotionStates.get(characterId)
  }

  // 감정 설정
  setEmotion(characterId, emotionType, intensity = null) {
    const state = this.getEmotionState(characterId)
    return state.setEmotion(emotionType, intensity)
  }

  // 감정 강화
  boostEmotion(characterId, amount = null) {
    const state = this.getEmotionState(characterId)
    state.boostEmotion(amount)
  }

  // 감정 감지 시작
  startDecay() {
    if (this.decayTimer) clearInterval(this.decayTimer)

    this.decayTimer = setInterval(() => {
      for (const state of this.emotionStates.values()) {
        state.decayEmotion()
      }
    }, this.decayInterval)

    console.log('🔄 감정 감지 타이머 시작')
  }

  // 감정 감지 중지
  stopDecay() {
    if (this.decayTimer) {
      clearInterval(this.decayTimer)
      this.decayTimer = null
      console.log('⏹️ 감정 감지 타이머 중지')
    }
  }

  // 감정 영구 정지 (clean-up)
  cleanup() {
    this.stopDecay()
    this.emotionStates.clear()
  }

  // 감정 히스토리 가져오기
  getEmotionHistory(characterId) {
    const state = this.emotionStates.get(characterId)
    return state ? state.emotionHistory : []
  }
}

// 싱글톤 인스턴스
const emotionSystem = new EmotionSystem()

export {
  EmotionSystem,
  EmotionState,
  EMOTION_TYPES,
  EMOTION_DEFAULTS,
  emotionSystem
}