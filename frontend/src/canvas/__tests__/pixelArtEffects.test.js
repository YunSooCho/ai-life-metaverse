/**
 * pixelArtEffects.js 테스트
 *
 * Phase 3: 피셀아트 레이아웃 시스템 - 애니메이션 프레임워크 테스트
 */

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  ANIMATION_TYPES,
  EASING,
  PixelAnimation,
  AnimationManager,
  createPixelShakeEffect,
  createPixelPopEffect,
  createPixelBounceEffect,
  createPixelFlashEffect,
  applyAnimationTransform,
  animationManager
} from '../pixelArtEffects'

describe('pixelArtEffects', () => {
  describe('ANIMATION_TYPES', () => {
    test('모든 애니메이션 타입이 정의되어 있어야 함', () => {
      expect(ANIMATION_TYPES.POP_IN).toBe('popIn')
      expect(ANIMATION_TYPES.POP_OUT).toBe('popOut')
      expect(ANIMATION_TYPES.BOUNCE).toBe('bounce')
      expect(ANIMATION_TYPES.SHAKE).toBe('shake')
      expect(ANIMATION_TYPES.SCALE).toBe('scale')
      expect(ANIMATION_TYPES.ROTATE).toBe('rotate')
      expect(ANIMATION_TYPES.FLASH).toBe('flash')
    })
  })

  describe('EASING', () => {
    test('LINEAR easing', () => {
      expect(EASING.LINEAR(0)).toBe(0)
      expect(EASING.LINEAR(0.5)).toBe(0.5)
      expect(EASING.LINEAR(1)).toBe(1)
    })

    test('EASE_IN easing', () => {
      expect(EASING.EASE_IN(0)).toBe(0)
      expect(EASING.EASE_IN(1)).toBe(1)
      expect(EASING.EASE_IN(0.5)).toBeLessThan(0.5)
    })

    test('EASE_OUT easing', () => {
      expect(EASING.EASE_OUT(0)).toBe(0)
      expect(EASING.EASE_OUT(1)).toBe(1)
      expect(EASING.EASE_OUT(0.5)).toBeGreaterThan(0.5)
    })

    test('EASE_IN_OUT easing', () => {
      expect(EASING.EASE_IN_OUT(0)).toBe(0)
      expect(EASING.EASE_IN_OUT(1)).toBe(1)
    })

    test('BOUNCE easing', () => {
      expect(EASING.BOUNCE(0)).toBe(0)
      expect(EASING.BOUNCE(1)).toBe(1)
    })
  })

  describe('PixelAnimation', () => {
    let onUpdateCallback
    let onCompleteCallback

    beforeEach(() => {
      onUpdateCallback = vi.fn()
      onCompleteCallback = vi.fn()
    })

    test('애니메이션 생성', () => {
      const animation = new PixelAnimation({
        type: ANIMATION_TYPES.POP_IN,
        duration: 300,
        easing: EASING.EASE_OUT
      })

      expect(animation.type).toBe(ANIMATION_TYPES.POP_IN)
      expect(animation.duration).toBe(300)
      expect(animation.easing).toBe(EASING.EASE_OUT)
      expect(animation.paused).toBe(false)
      expect(animation.completed).toBe(false)
    })

    test('애니메이션 시작', () => {
      const animation = new PixelAnimation({
        type: ANIMATION_TYPES.POP_IN,
        duration: 300,
        onUpdate: onUpdateCallback,
        onComplete: onCompleteCallback
      })

      const startTime = 1000
      animation.start(startTime)

      expect(animation.startTime).toBe(startTime)
      expect(animation.paused).toBe(false)
      expect(animation.completed).toBe(false)
    })

    test('애니메이션 일시정지/재개', () => {
      const animation = new PixelAnimation()

      animation.pause()
      expect(animation.paused).toBe(true)

      animation.resume()
      expect(animation.paused).toBe(false)
    })

    test('애니메이션 중지', () => {
      const animation = new PixelAnimation()

      animation.stop()
      expect(animation.completed).toBe(true)
    })

    test('POP_IN 애니메이션 값 계산', () => {
      const animation = new PixelAnimation({
        type: ANIMATION_TYPES.POP_IN,
        duration: 300,
        easing: EASING.LINEAR
      })

      const value0 = animation.calculateValue(0)
      expect(value0.scale).toBe(0)
      expect(value0.opacity).toBe(0)

      const value1 = animation.calculateValue(1)
      expect(value1.scale).toBe(1)
      expect(value1.opacity).toBe(1)

      const value05 = animation.calculateValue(0.5)
      expect(value05.scale).toBe(0.5)
      expect(value05.opacity).toBe(0.5)
    })

    test('POP_OUT 애니메이션 값 계산', () => {
      const animation = new PixelAnimation({
        type: ANIMATION_TYPES.POP_OUT,
        duration: 300,
        easing: EASING.LINEAR
      })

      const value0 = animation.calculateValue(0)
      expect(value0.scale).toBe(1)
      expect(value0.opacity).toBe(1)

      const value1 = animation.calculateValue(1)
      expect(value1.scale).toBe(0)
      expect(value1.opacity).toBe(0)
    })

    test('BOUNCE 애니메이션 값 계산', () => {
      const animation = new PixelAnimation({
        type: ANIMATION_TYPES.BOUNCE,
        duration: 300,
        easing: EASING.LINEAR
      })

      const value0 = animation.calculateValue(0)
      expect(Math.abs(value0.offsetY)).toBeCloseTo(0, 5)

      const value05 = animation.calculateValue(0.5)
      expect(value05.offsetY).toBeLessThan(0)
      expect(value0.scale).toBeLessThan(value05.scale)
    })

    test('SHAKE 애니메이션 값 계산', () => {
      const animation = new PixelAnimation({
        type: ANIMATION_TYPES.SHAKE,
        duration: 300,
        easing: EASING.LINEAR
      })

      const value = animation.calculateValue(0.5)
      expect(value).toHaveProperty('offsetX')
      expect(value).toHaveProperty('offsetY')
      expect(value.offsetX).not.toBeUndefined()
    })

    test('SCALE 애니메이션 값 계산', () => {
      const animation = new PixelAnimation({
        type: ANIMATION_TYPES.SCALE,
        duration: 300,
        easing: EASING.LINEAR
      })

      const value = animation.calculateValue(0.5)
      expect(value.scale).toBe(0.5)
    })

    test('ROTATE 애니메이션 값 계산', () => {
      const animation = new PixelAnimation({
        type: ANIMATION_TYPES.ROTATE,
        duration: 300,
        easing: EASING.LINEAR
      })

      const value = animation.calculateValue(0.5)
      expect(value.rotation).toBeCloseTo(Math.PI, 5)
    })

    test('FLASH 애니메이션 값 계산', () => {
      const animation = new PixelAnimation({
        type: ANIMATION_TYPES.FLASH,
        duration: 300,
        easing: EASING.LINEAR
      })

      const value = animation.calculateValue(0.5)
      expect(value).toHaveProperty('opacity')
    })

    test('애니메이션 업데이트', () => {
      const animation = new PixelAnimation({
        type: ANIMATION_TYPES.POP_IN,
        duration: 100,
        easing: EASING.LINEAR,
        onUpdate: onUpdateCallback,
        onComplete: onCompleteCallback
      })

      animation.start(1000)

      // 중간 (50ms 진행)
      const result1 = animation.update(1050)
      expect(result1.completed).toBe(false)
      expect(onUpdateCallback).toHaveBeenCalled()
      expect(onCompleteCallback).not.toHaveBeenCalled()

      // 완료 (100ms 진행)
      const result2 = animation.update(1100)
      expect(result2.completed).toBe(true)
      expect(onCompleteCallback).toHaveBeenCalled()
    })

    test('애니메이션 루프', () => {
      const animation = new PixelAnimation({
        type: ANIMATION_TYPES.POP_IN,
        duration: 100,
        loop: true,
        onUpdate: onUpdateCallback
      })

      animation.start(1000)

      // 첫 번째 루프 완료
      animation.update(1100)
      expect(animation.completed).toBe(false)

      // 두 번째 루프 진행
      animation.update(1150)
      expect(animation.completed).toBe(false)
    })

    test('애니메이션 딜레이', () => {
      const animation = new PixelAnimation({
        type: ANIMATION_TYPES.POP_IN,
        duration: 100,
        delay: 50,
        onUpdate: onUpdateCallback
      })

      animation.start(1000)

      // 딜레이 전
      const result1 = animation.update(1000)
      expect(result1.completed).toBe(false)
      expect(result1.progress).toBe(0)
      expect(onUpdateCallback).not.toHaveBeenCalled()

      // 딜레이 후
      const result2 = animation.update(1050)
      expect(result2.completed).toBe(false)
      expect(result2.progress).toBe(0)
    })

    test('일시정지된 애니메이션은 업데이트하지 않음', () => {
      const animation = new PixelAnimation({
        type: ANIMATION_TYPES.POP_IN,
        duration: 100,
        onUpdate: onUpdateCallback
      })

      animation.start(1000).pause()

      const result = animation.update(1050)
      expect(result.completed).toBe(true) // 일시정지 상태에서는 완료로 처리
      expect(onUpdateCallback).not.toHaveBeenCalled()
    })
  })

  describe('AnimationManager', () => {
    let onUpdateCallback
    let onCompleteCallback

    beforeEach(() => {
      onUpdateCallback = vi.fn()
      onCompleteCallback = vi.fn()
      // 기존 애니메이션 정리
      animationManager.stopAll()
    })

    afterEach(() => {
      animationManager.stopAll()
    })

    test('애니메이션 추가', () => {
      const manager = new AnimationManager()
      const animation = new PixelAnimation({
        type: ANIMATION_TYPES.POP_IN,
        duration: 300
      })

      manager.add('test-animation', animation)

      expect(manager.get('test-animation')).toBe(animation)
      expect(manager.activeAnimations.length).toBe(1)
    })

    test('애니메이션 제거', () => {
      const manager = new AnimationManager()
      const animation = new PixelAnimation({
        type: ANIMATION_TYPES.POP_IN,
        duration: 300
      })

      manager.add('test-animation', animation)
      manager.remove('test-animation')

      expect(manager.get('test-animation')).toBeUndefined()
      expect(manager.activeAnimations.length).toBe(0)
    })

    test('애니메이션 업데이트', () => {
      const manager = new AnimationManager()
      const animation = new PixelAnimation({
        type: ANIMATION_TYPES.POP_IN,
        duration: 100,
        onUpdate: onUpdateCallback,
        onComplete: onCompleteCallback
      })

      manager.add('test-animation', animation)
      animation.start(1000)

      const activeCount = manager.update(1050)
      expect(activeCount).toBe(1)
    })

    test('완료된 애니메이션 필터링', () => {
      const manager = new AnimationManager()

      const animation1 = new PixelAnimation({
        type: ANIMATION_TYPES.POP_IN,
        duration: 100,
        onUpdate: onUpdateCallback,
        onComplete: onCompleteCallback
      })

      const animation2 = new PixelAnimation({
        type: ANIMATION_TYPES.POP_IN,
        duration: 200,
        onUpdate: onUpdateCallback,
        onComplete: onCompleteCallback
      })

      manager.add('animation1', animation1)
      manager.add('animation2', animation2)

      animation1.start(1000)
      animation2.start(1000)

      manager.update(1100)
      expect(manager.activeAnimations.length).toBe(1)
    })

    test('모든 애니메이션 중지', () => {
      const manager = new AnimationManager()

      manager.add('animation1', new PixelAnimation())
      manager.add('animation2', new PixelAnimation())

      manager.stopAll()

      expect(manager.activeAnimations.length).toBe(0)
      expect(manager.animations.size).toBe(0)
    })

    test('활성 애니메이션 수 확인', () => {
      const manager = new AnimationManager()

      expect(manager.getActiveCount()).toBe(0)

      manager.add('animation1', new PixelAnimation())
      expect(manager.getActiveCount()).toBe(1)

      manager.remove('animation1')
      expect(manager.getActiveCount()).toBe(0)
    })

    test('너무 많은 애니메이션 방지 (사이즈 제한)', () => {
      const manager = new AnimationManager()

      // 101개 애니메이션 추가
      for (let i = 0; i < 101; i++) {
        const animation = new PixelAnimation({
          type: ANIMATION_TYPES.POP_IN,
          duration: 1000, // 긴 지속 시간
          onUpdate: onUpdateCallback
        })
        manager.add(`animation-${i}`, animation)
        animation.start(1000)
      }

      manager.update(1050)

      // 50개 이하로 줄어들어야 함
      expect(manager.activeAnimations.length).toBeLessThanOrEqual(50)
    })
  })

  describe('createPixelShakeEffect', () => {
    test('기본 설정으로 생성', () => {
      const effect = createPixelShakeEffect()

      expect(effect.type).toBe(ANIMATION_TYPES.SHAKE)
      expect(effect.duration).toBe(300)
      expect(effect.easing).toBe(EASING.LINEAR)
    })

    test('커스텀 설정으로 생성', () => {
      const effect = createPixelShakeEffect(4, 500)

      expect(effect.duration).toBe(500)
    })
  })

  describe('createPixelPopEffect', () => {
    test('기본 설정으로 생성', () => {
      const effect = createPixelPopEffect()

      expect(effect.type).toBe(ANIMATION_TYPES.POP_IN)
      expect(effect.duration).toBe(200)
      expect(effect.easing).toBe(EASING.BOUNCE)
    })

    test('커스텀 설정으로 생성', () => {
      const effect = createPixelPopEffect(300)

      expect(effect.duration).toBe(300)
    })
  })

  describe('createPixelBounceEffect', () => {
    test('기본 설정으로 생성', () => {
      const effect = createPixelBounceEffect()

      expect(effect.type).toBe(ANIMATION_TYPES.BOUNCE)
      expect(effect.duration).toBe(500)
      expect(effect.easing).toBe(EASING.BOUNCE)
    })

    test('커스텀 설정으로 생성', () => {
      const effect = createPixelBounceEffect(700)

      expect(effect.duration).toBe(700)
    })
  })

  describe('createPixelFlashEffect', () => {
    test('기본 설정으로 생성', () => {
      const effect = createPixelFlashEffect()

      expect(effect.type).toBe(ANIMATION_TYPES.FLASH)
      expect(effect.duration).toBe(300)
      expect(effect.easing).toBe(EASING.LINEAR)
    })

    test('커스텀 설정으로 생성', () => {
      const effect = createPixelFlashEffect(400)

      expect(effect.duration).toBe(400)
    })
  })

  describe('applyAnimationTransform', () => {
    test('ctx가 null이면 아무것도 하지 않음', () => {
      expect(() => {
        applyAnimationTransform(null, { scale: 1 })
      }).not.toThrow()
    })

    test('scale 적용', () => {
      const mockCtx = {
        save: vi.fn(),
        translate: vi.fn(),
        scale: vi.fn(),
        restore: vi.fn()
      }

      const result = applyAnimationTransform(mockCtx, { scale: 2 })
      expect(result).toBeUndefined()
    })

    test('offset 적용', () => {
      const mockCtx = {
        translate: vi.fn()
      }

      applyAnimationTransform(mockCtx, { offsetX: 10, offsetY: 20 })
      expect(mockCtx.translate).toHaveBeenCalledWith(10, 20)
    })

    test('rotation 적용', () => {
      const mockCtx = {
        translate: vi.fn(),
        rotate: vi.fn()
      }

      applyAnimationTransform(mockCtx, { rotation: Math.PI })
      expect(mockCtx.translate).toHaveBeenCalled()
    })

    test('모든 값 null이면 아무것도 하지 않음', () => {
      const mockCtx = {}

      applyAnimationTransform(mockCtx, {})
      // 에러가 나지 않으면 통과
    })
  })
})