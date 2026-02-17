/**
 * 픽셀 아트 애니메이션 효과 시스템
 *
 * Phase 3: 피셀아트 레이아웃 시스템 - 애니메이션 프레임워크
 *
 * 기능:
 * - 픽셀 애니메이션 상태 관리
 * - 프레임 기반 애니메이션
 * - 이징 함수 (픽셀 스타일)
 */

/**
 * 픽셀 애니메이션 타입
 */
export const ANIMATION_TYPES = {
  POP_IN: 'popIn',        // 튀어나오는 효과
  POP_OUT: 'popOut',      // 사라지는 효과
  BOUNCE: 'bounce',       // 바운스
  SHAKE: 'shake',         // 흔들기
  SCALE: 'scale',         // 스케일
  ROTATE: 'rotate',       // 회전
  FLASH: 'flash'          // 점멸
}

/**
 * 이징 함수 (픽셀 스타일 - 계단식)
 */
export const EASING = {
  LINEAR: (t) => t,
  EASE_IN: (t) => {
    // 픽셀 느낌의 계단식 ease-in
    const steps = 4
    const step = Math.floor(t * steps) / steps
    return step * step
  },
  EASE_OUT: (t) => {
    // 픽셀 느낌의 계단식 ease-out
    const steps = 4
    const step = Math.floor(t * steps) / steps
    return 1 - (1 - step) * (1 - step)
  },
  EASE_IN_OUT: (t) => {
    // 픽셀 느낌의 계단식 ease-in-out
    const steps = 4
    const step = Math.floor(t * steps) / steps
    return step < 0.5 ? 2 * step * step : 1 - Math.pow(-2 * step + 2, 2) / 2
  },
  BOUNCE: (t) => {
    // 픽셀 느낌의 계단식 바운스
    const steps = 8
    const step = Math.floor(t * steps) / steps
    const n1 = 7.5625
    const d1 = 2.75
    if (step < 1 / d1) {
      return n1 * step * step
    } else if (step < 2 / d1) {
      return n1 * (step -= 1.5 / d1) * step + 0.75
    } else if (step < 2.5 / d1) {
      return n1 * (step -= 2.25 / d1) * step + 0.9375
    } else {
      return n1 * (step -= 2.625 / d1) * step + 0.984375
    }
  }
}

/**
 * 애니메이션 클래스
 */
export class PixelAnimation {
  constructor(options = {}) {
    this.type = options.type || ANIMATION_TYPES.POP_IN
    this.duration = options.duration || 300 // ms
    this.easing = options.easing || EASING.EASE_OUT
    this.delay = options.delay || 0
    this.loop = options.loop || false

    this.startTime = null
    this.paused = false
    this.completed = false

    // 콜백
    this.onUpdate = options.onUpdate || (() => {})
    this.onComplete = options.onComplete || (() => {})
  }

  /**
   * 애니메이션 시작
   */
  start(timestamp = Date.now()) {
    this.startTime = timestamp + this.delay
    this.paused = false
    this.completed = false
    return this
  }

  /**
   * 애니메이션 일시정지
   */
  pause() {
    this.paused = true
    return this
  }

  /**
   * 애니메이션 재개
   */
  resume() {
    this.paused = false
    return this
  }

  /**
   * 애니메이션 중지
   */
  stop() {
    this.completed = true
    return this
  }

  /**
   * 프레임 업데이트
   */
  update(timestamp) {
    if (this.completed || this.paused) {
      return { completed: true, progress: 1 }
    }

    if (timestamp < this.startTime) {
      return { completed: false, progress: 0 }
    }

    const elapsed = timestamp - this.startTime
    let progress = elapsed / this.duration

    if (progress >= 1) {
      if (this.loop) {
        progress = 0
        this.startTime = timestamp
      } else {
        progress = 1
        this.completed = true
        this.onComplete()
      }
    }

    const easedProgress = this.easing(progress)
    const value = this.calculateValue(easedProgress)

    this.onUpdate(value, easedProgress)

    return {
      completed: this.completed,
      progress: easedProgress,
      value
    }
  }

  /**
   * 애니메이션 값 계산
   */
  calculateValue(progress) {
    switch (this.type) {
      case ANIMATION_TYPES.POP_IN:
        return {
          scale: progress,
          opacity: progress
        }
      case ANIMATION_TYPES.POP_OUT:
        return {
          scale: 1 - progress,
          opacity: 1 - progress
        }
      case ANIMATION_TYPES.BOUNCE:
        return {
          offsetY: -Math.sin(progress * Math.PI) * 10,
          scale: 1 + Math.sin(progress * Math.PI) * 0.1
        }
      case ANIMATION_TYPES.SHAKE:
        const angle = Math.random() * Math.PI * 2
        const magnitude = (1 - progress) * 4
        return {
          offsetX: Math.cos(angle) * magnitude,
          offsetY: Math.sin(angle) * magnitude
        }
      case ANIMATION_TYPES.SCALE:
        return {
          scale: progress
        }
      case ANIMATION_TYPES.ROTATE:
        return {
          rotation: progress * Math.PI * 2
        }
      case ANIMATION_TYPES.FLASH:
        return {
          opacity: Math.sin(progress * Math.PI * 4)
        }
      default:
        return {
          scale: progress,
          opacity: progress
        }
    }
  }
}

/**
 * 애니메이션 관리자
 */
export class AnimationManager {
  constructor() {
    this.animations = new Map()
    this.activeAnimations = []
  }

  /**
   * 애니메이션 추가
   */
  add(key, animation) {
    this.animations.set(key, animation)
    this.activeAnimations.push(animation)
    return this
  }

  /**
   * 애니메이션 제거
   */
  remove(key) {
    const animation = this.animations.get(key)
    if (animation) {
      animation.stop()
      this.animations.delete(key)
    }
    return this
  }

  /**
   * 특정 애니메이션 가져오기
   */
  get(key) {
    return this.animations.get(key)
  }

  /**
   * 모든 애니메이션 업데이트
   */
  update(timestamp) {
    // 완료된 애니메이션 필터링
    this.activeAnimations = this.activeAnimations.filter(animation => {
      const result = animation.update(timestamp)
      return !result.completed
    })

    // 사이즈 제한 (너무 많은 애니메이션 방지)
    if (this.activeAnimations.length > 100) {
      this.activeAnimations = this.activeAnimations.slice(-50)
    }

    return this.activeAnimations.length
  }

  /**
   * 모든 애니메이션 중지
   */
  stopAll() {
    this.activeAnimations.forEach(animation => animation.stop())
    this.activeAnimations = []
    this.animations.clear()
  }

  /**
   * 활성 애니메이션 수
   */
  getActiveCount() {
    return this.activeAnimations.length
  }
}

/**
 * 픽셀 셰이크 효과
 */
export function createPixelShakeEffect(intensity = 2, duration = 300) {
  return new PixelAnimation({
    type: ANIMATION_TYPES.SHAKE,
    duration,
    easing: EASING.LINEAR
  })
}

/**
 * 픽셀 팝 효과
 */
export function createPixelPopEffect(duration = 200) {
  return new PixelAnimation({
    type: ANIMATION_TYPES.POP_IN,
    duration,
    easing: EASING.BOUNCE
  })
}

/**
 * 픽셀 바운스 효과
 */
export function createPixelBounceEffect(duration = 500) {
  return new PixelAnimation({
    type: ANIMATION_TYPES.BOUNCE,
    duration,
    easing: EASING.BOUNCE
  })
}

/**
 * 픽셀 플래시 효과
 */
export function createPixelFlashEffect(duration = 300) {
  return new PixelAnimation({
    type: ANIMATION_TYPES.FLASH,
    duration,
    easing: EASING.LINEAR
  })
}

/**
 * 캔버스에 애니메이션 적용 (렌더링 트랜스폼)
 */
export function applyAnimationTransform(ctx, animationValue) {
  if (!animationValue) return

  const { scale, offsetX, offsetY, rotation } = animationValue

  if (offsetX || offsetY) {
    ctx.translate(offsetX || 0, offsetY || 0)
  }

  if (rotation) {
    ctx.translate(0, 0)
    ctx.rotate(rotation)
    ctx.translate(0, 0)
  }

  if (scale !== undefined && scale !== 1) {
    ctx.translate(0, 0)
    ctx.scale(scale, scale)
    ctx.translate(0, 0)
  }
}

/**
 * 애니메이션 효과 렌더링 (캔버스 컨텍스트)
 */
export function renderAnimationEffect(ctx, effect) {
  if (!effect) return

  const { opacity } = effect.update(Date.now())

  if (opacity !== undefined) {
    ctx.globalAlpha = Math.max(0, Math.min(1, opacity))
  }
}

// 싱글톤 인스턴스
export const animationManager = new AnimationManager()

export default {
  ANIMATION_TYPES,
  EASING,
  PixelAnimation,
  AnimationManager,
  createPixelShakeEffect,
  createPixelPopEffect,
  createPixelBounceEffect,
  createPixelFlashEffect,
  applyAnimationTransform,
  renderAnimationEffect,
  animationManager
}