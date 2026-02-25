/**
 * 감정 시스템 유틸리티
 * 캐릭터 감정 표현 및 FX 관리
 */

// 감정 타입 정의 (5개 → 16개 확장)
export const EMOTION_TYPES = {
  HAPPY: 'happy',
  SAD: 'sad',
  ANGRY: 'angry',
  SURPRISED: 'surprised',
  NEUTRAL: 'neutral',
  LOVE: 'love',        // 추가
  HATE: 'hate',        // 추가
  FEAR: 'fear',        // 추가
  EXCITED: 'excited',  // 추가
  TIRED: 'tired',      // 추가
  CONFUSED: 'confused',// 추가
  PROUD: 'proud',      // 추가
  SHY: 'shy',          // 추가
  EMBARRASSED: 'embarrassed', // 추가
  CURIOUS: 'curious',  // 추가
  DISGUSTED: 'disgusted' // 추가
}

// 감정별 이모지 (16x16 픽셀 스타일)
export const EMOTION_EMOJIS = {
  [EMOTION_TYPES.HAPPY]: '😊',
  [EMOTION_TYPES.SAD]: '😢',
  [EMOTION_TYPES.ANGRY]: '😠',
  [EMOTION_TYPES.SURPRISED]: '😲',
  [EMOTION_TYPES.NEUTRAL]: '😐',
  [EMOTION_TYPES.LOVE]: '❤️',
  [EMOTION_TYPES.HATE]: '😒',
  [EMOTION_TYPES.FEAR]: '😨',
  [EMOTION_TYPES.EXCITED]: '🤩',
  [EMOTION_TYPES.TIRED]: '😴',
  [EMOTION_TYPES.CONFUSED]: '😕',
  [EMOTION_TYPES.PROUD]: '😏',
  [EMOTION_TYPES.SHY]: '😳',
  [EMOTION_TYPES.EMBARRASSED]: '🫣',
  [EMOTION_TYPES.CURIOUS]: '🤔',
  [EMOTION_TYPES.DISGUSTED]: '🤢'
}

// 감정별 색상
export const EMOTION_COLORS = {
  [EMOTION_TYPES.HAPPY]: '#FFD93D',
  [EMOTION_TYPES.SAD]: '#6C7EB0',
  [EMOTION_TYPES.ANGRY]: '#FF6B6B',
  [EMOTION_TYPES.SURPRISED]: '#FFA500',
  [EMOTION_TYPES.NEUTRAL]: '#A8A8A8',
  [EMOTION_TYPES.LOVE]: '#FF69B4',
  [EMOTION_TYPES.HATE]: '#8B4513',
  [EMOTION_TYPES.FEAR]: '#9370DB',
  [EMOTION_TYPES.EXCITED]: '#FF4500',
  [EMOTION_TYPES.TIRED]: '#708090',
  [EMOTION_TYPES.CONFUSED]: '#B8860B',
  [EMOTION_TYPES.PROUD]: '#FFD700',
  [EMOTION_TYPES.SHY]: '#FFB6C1',
  [EMOTION_TYPES.EMBARRASSED]: '#FF6347',
  [EMOTION_TYPES.CURIOUS]: '#20B2AA',
  [EMOTION_TYPES.DISGUSTED]: '#556B2F'
}

// 감정 지속 시간 (ms)
export const EMOTION_DURATION = {
  [EMOTION_TYPES.HAPPY]: 3000,
  [EMOTION_TYPES.SAD]: 4000,
  [EMOTION_TYPES.ANGRY]: 2000,
  [EMOTION_TYPES.SURPRISED]: 1500,
  [EMOTION_TYPES.NEUTRAL]: 1000,
  [EMOTION_TYPES.LOVE]: 4000,
  [EMOTION_TYPES.HATE]: 3000,
  [EMOTION_TYPES.FEAR]: 2500,
  [EMOTION_TYPES.EXCITED]: 2000,
  [EMOTION_TYPES.TIRED]: 5000,
  [EMOTION_TYPES.CONFUSED]: 3000,
  [EMOTION_TYPES.PROUD]: 4000,
  [EMOTION_TYPES.SHY]: 3000,
  [EMOTION_TYPES.EMBARRASSED]: 3500,
  [EMOTION_TYPES.CURIOUS]: 4000,
  [EMOTION_TYPES.DISGUSTED]: 3000
}

// 호감도에 따른 감정 자동 표현 로직
export function getAutoEmotionAffinity(affinity) {
  if (affinity >= 80) return EMOTION_TYPES.LOVE
  if (affinity >= 60) return EMOTION_TYPES.HAPPY
  if (affinity >= 40) return EMOTION_TYPES.NEUTRAL
  if (affinity >= 20) return EMOTION_TYPES.CONFUSED
  return EMOTION_TYPES.SAD
}

// 감정 객체 관리 클래스
export class EmotionSystem {
  constructor() {
    this.activeEmotions = new Map() // characterId -> emotion
    this.emotionTimers = new Map() // characterId -> timerId
  }

  // 감정 설정
  setEmotion(characterId, emotionType) {
    this.clearEmotion(characterId)

    const emotion = {
      type: emotionType,
      emoji: EMOTION_EMOJIS[emotionType],
      color: EMOTION_COLORS[emotionType],
      startTime: Date.now(),
      duration: EMOTION_DURATION[emotionType] || 3000
    }

    this.activeEmotions.set(characterId, emotion)

    // 자동 클리어 타이머
    const timerId = setTimeout(() => {
      this.clearEmotion(characterId)
    }, emotion.duration)

    this.emotionTimers.set(characterId, timerId)

    return emotion
  }

  // 감정 가져오기
  getEmotion(characterId) {
    return this.activeEmotions.get(characterId) || null
  }

  // 감정 클리어
  clearEmotion(characterId) {
    const timerId = this.emotionTimers.get(characterId)
    if (timerId) {
      clearTimeout(timerId)
      this.emotionTimers.delete(characterId)
    }
    this.activeEmotions.delete(characterId)
  }

  // 모든 감정 클리어
  clearAll() {
    this.emotionTimers.forEach(timerId => clearTimeout(timerId))
    this.emotionTimers.clear()
    this.activeEmotions.clear()
  }

  // 애니메이션 진행도 계산 (0~1)
  getAnimationProgress(characterId) {
    const emotion = this.activeEmotions.get(characterId)
    if (!emotion) return 0

    const elapsed = Date.now() - emotion.startTime
    const progress = Math.min(elapsed / emotion.duration, 1)

    // 페이드 아웃 (마지막 500ms)
    if (progress > 0.8) {
      return 1 - (progress - 0.8) / 0.2
    }

    // 팝인 애니메이션 (처음 300ms)
    if (progress < 0.1) {
      return progress / 0.1
    }

    return 1
  }

  // 바운스 애니메이션 오프셋 계산
  getBounceOffset(characterId) {
    const emotion = this.activeEmotions.get(characterId)
    if (!emotion) return { x: 0, y: 0 }

    const elapsed = Date.now() - emotion.startTime
    const bounceDuration = 500

    if (elapsed < bounceDuration) {
      const progress = elapsed / bounceDuration
      const offsetY = Math.sin(progress * Math.PI) * 10
      return { x: 0, y: offsetY }
    }

    return { x: 0, y: 0 }
  }

  // 감정 유효성 체크
  isValidEmotion(emotionType) {
    return Object.values(EMOTION_TYPES).includes(emotionType)
  }

  // 호감도에 따른 자동 감정 설정
  setAutoEmotionByAffinity(characterId, affinity) {
    const emotionType = getAutoEmotionAffinity(affinity)
    return this.setEmotion(characterId, emotionType)
  }
}

// FX 스프라이트 타입 정의
export const FX_TYPES = {
  JUMP_DUST: 'jump_dust',       // 점프 먼지
  HEART_RISE: 'heart_rise',     // 하트 상승
  AFFINITY_UP: 'affinity_up',   // 호감도 상승
  AFFINITY_DOWN: 'affinity_down', // 호감도 하락
  LOADING: 'loading',           // 로딩
  CLICK_RIPPLE: 'click_ripple', // 클릭 리플
  PARTICLE_BURST: 'particle_burst' // 파티클 버스트
}

// FX 객체 클래스
export class FXEffect {
  constructor(type, x, y, options = {}) {
    this.id = Math.random().toString(36).substr(2, 9)
    this.type = type
    this.x = x
    this.y = y
    this.startTime = Date.now()
    this.duration = options.duration || 500
    this.size = options.size || 16
    this.color = options.color || '#FFFFFF'
    this.direction = options.direction || 'up'
    this.speed = options.speed || 2
    this.opacity = 1
    this.scale = 1
  }

  // 업데이트
  update() {
    const elapsed = Date.now() - this.startTime
    const progress = elapsed / this.duration

    if (progress >= 1) {
      this.opacity = 0
      return false // 완료
    }

    // 페이드 아웃
    this.opacity = 1 - progress

    // 이동
    switch (this.direction) {
      case 'up':
        this.y -= this.speed
        break
      case 'down':
        this.y += this.speed
        break
      case 'left':
        this.x -= this.speed
        break
      case 'right':
        this.x += this.speed
        break
    }

    // 스케일 애니메이션
    this.scale = 1 + Math.sin(progress * Math.PI) * 0.2

    return true // 계속 실행
  }

  // 렌더링 데이터
  getRenderData() {
    return {
      id: this.id,
      type: this.type,
      x: this.x,
      y: this.y,
      opacity: this.opacity,
      scale: this.scale,
      color: this.color,
      size: this.size
    }
  }
}

// FX 시스템 관리 클래스
export class FXSystem {
  constructor() {
    this.effects = []
  }

  // FX 추가
  addEffect(type, x, y, options = {}) {
    const effect = new FXEffect(type, x, y, options)
    this.effects.push(effect)
    return effect
  }

  // 점프 dust FX
  addJumpDust(x, y) {
    for (let i = 0; i < 5; i++) {
      const offsetX = (Math.random() - 0.5) * 20
      const offsetY = (Math.random() - 0.5) * 10
      this.addEffect(FX_TYPES.JUMP_DUST, x + offsetX, y + offsetY, {
        duration: 500,
        size: 8,
        color: '#CCCCCC',
        direction: 'down',
        speed: 1 + Math.random()
      })
    }
  }

  // 하트 상승 FX
  addHeartRise(x, y) {
    this.addEffect(FX_TYPES.HEART_RISE, x, y, {
      duration: 1000,
      size: 16,
      color: '#FF69B4',
      direction: 'up',
      speed: 2
    })
  }

  // 호감도 상승 FX
  addAffinityUp(x, y) {
    for (let i = 0; i < 3; i++) {
      this.addHeartRise(x + (Math.random() - 0.5) * 20, y - 10)
    }
  }

  // 호감도 하락 FX
  addAffinityDown(x, y) {
    this.addEffect(FX_TYPES.AFFINITY_DOWN, x, y, {
      duration: 800,
      size: 12,
      color: '#FF6B6B',
      direction: 'down',
      speed: 1.5
    })
  }

  // 클릭 리플 FX
  addClickRipple(x, y, color = '#4CAF50') {
    for (let i = 0; i < 3; i++) {
      this.addEffect(FX_TYPES.CLICK_RIPPLE, x, y, {
        duration: 600,
        size: 20 + i * 10,
        color: color,
        direction: 'none',
        speed: 0,
        scale: 0
      }).scale = 1 // 시작 스케일
    }
  }

  // 업데이트 모든 FX
  update() {
    this.effects = this.effects.filter(effect => effect.update())
  }

  // 모든 FX 클리어
  clearAll() {
    this.effects = []
  }

  // 렌더링 데이터
  getRenderEffects() {
    return this.effects.filter(e => e.opacity > 0).map(e => e.getRenderData())
  }

  // 효과 개수
  getCount() {
    return this.effects.length
  }
}

// 기본 내보내기
export default {
  EMOTION_TYPES,
  EMOTION_EMOJIS,
  EMOTION_COLORS,
  EMOTION_DURATION,
  getAutoEmotionAffinity,
  EmotionSystem,
  FX_TYPES,
  FXEffect,
  FXSystem
}