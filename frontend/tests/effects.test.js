/**
 * FX 시스템 테스트
 */

import { describe, it, expect } from 'vitest'
import {
  FX_TYPES,
  createFxParticle,
  renderFx,
  getFxForAffinityChange
} from '../src/utils/effects'

describe('effects.js', () => {
  describe('FX_TYPES 상수', () => {
    it('6개 FX 타입이 정의되어야 함', () => {
      expect(Object.keys(FX_TYPES)).toHaveLength(6)
    })

    it('필수 FX 타입이 포함되어야 함', () => {
      expect(FX_TYPES.DUST).toBe('dust')
      expect(FX_TYPES.HEART).toBe('heart')
      expect(FX_TYPES.ANGER).toBe('anger')
      expect(FX_TYPES.RIPPLE).toBe('ripple')
      expect(FX_TYPES.SPARKLE).toBe('sparkle')
      expect(FX_TYPES.LOADING).toBe('loading')
    })
  })

  describe('createFxParticle', () => {
    it('유효한 FX 파티클을 생성해야 함', () => {
      const fx = createFxParticle(FX_TYPES.DUST, 100, 100)

      expect(fx.type).toBe(FX_TYPES.DUST)
      expect(fx.x).toBe(100)
      expect(fx.y).toBe(100)
      expect(fx.startTime).toBeDefined()
      expect(fx.duration).toBeGreaterThan(0)
      expect(fx.particles).toBeDefined()
      expect(Array.isArray(fx.particles)).toBe(true)
    })

    it('DUST 파티클은 5개를 생성해야 함', () => {
      const fx = createFxParticle(FX_TYPES.DUST, 100, 100)
      expect(fx.particles).toHaveLength(5)
    })

    it('HEART 파티클은 3개를 생성해야 함', () => {
      const fx = createFxParticle(FX_TYPES.HEART, 100, 100)
      expect(fx.particles).toHaveLength(3)
    })

    it('ANGER 파티클은 4개를 생성해야 함', () => {
      const fx = createFxParticle(FX_TYPES.ANGER, 100, 100)
      expect(fx.particles).toHaveLength(4)
    })

    it('RIPPLE 파티클은 1개를 생성해야 함', () => {
      const fx = createFxParticle(FX_TYPES.RIPPLE, 100, 100)
      expect(fx.particles).toHaveLength(1)
    })

    it('SPARKLE 파티클은 6개를 생성해야 함', () => {
      const fx = createFxParticle(FX_TYPES.SPARKLE, 100, 100)
      expect(fx.particles).toHaveLength(6)
    })

    it('모든 FX 타입에 대해 파티클을 생성해야 함', () => {
      const types = [
        FX_TYPES.DUST,
        FX_TYPES.HEART,
        FX_TYPES.ANGER,
        FX_TYPES.RIPPLE,
        FX_TYPES.SPARKLE,
        FX_TYPES.LOADING
      ]

      types.forEach(type => {
        const fx = createFxParticle(type, 100, 100)
        expect(fx.type).toBe(type)
        expect(fx.particles).toBeDefined()
      })
    })
  })

  describe('renderFx', () => {
    it('완료된 FX는 false를 반환해야 함', () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const fx = createFxParticle(FX_TYPES.DUST, 100, 100)

      // duration을 0으로 설정하여 즉시 완료
      fx.duration = 0
      fx.startTime = Date.now() - 1000

      const result = renderFx(ctx, fx, 1)
      expect(result).toBe(false)
    })

    it('실행 중인 FX는 true를 반환해야 함', () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const fx = createFxParticle(FX_TYPES.DUST, 100, 100)

      // 에러가 나지 않아야 함
      const result = renderFx(ctx, fx, 1)
      expect(result).toBe(true)
    })

    it('모든 FX 타입을 렌더링할 수 있어야 함', () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')

      const types = [
        FX_TYPES.DUST,
        FX_TYPES.HEART,
        FX_TYPES.ANGER,
        FX_TYPES.RIPPLE,
        FX_TYPES.SPARKLE
      ]

      types.forEach(type => {
        const fx = createFxParticle(type, 100, 100)
        const result = renderFx(ctx, fx, 1)
        expect(result).toBe(true)
      })
    })
  })

  describe('getFxForAffinityChange', () => {
    it('호감도 상승은 HEART를 반환해야 함', () => {
      expect(getFxForAffinityChange(10)).toBe(FX_TYPES.HEART)
      expect(getFxForAffinityChange(1)).toBe(FX_TYPES.HEART)
      expect(getFxForAffinityChange(0.1)).toBe(FX_TYPES.HEART)
    })

    it('호감도 하락은 ANGER를 반환해야 함', () => {
      expect(getFxForAffinityChange(-10)).toBe(FX_TYPES.ANGER)
      expect(getFxForAffinityChange(-1)).toBe(FX_TYPES.ANGER)
      expect(getFxForAffinityChange(-0.1)).toBe(FX_TYPES.ANGER)
    })

    it('호감도 변화 없음은 null을 반환해야 함', () => {
      expect(getFxForAffinityChange(0)).toBe(null)
    })
  })

  describe('파티클 속성', () => {
    it('DUST 파티클은 색상을 가지고 있어야 함', () => {
      const fx = createFxParticle(FX_TYPES.DUST, 100, 100)
      expect(fx.particles[0].color).toBe('#8B7355')
    })

    it('HEART 파티클은 opacity를 가지고 있어야 함', () => {
      const fx = createFxParticle(FX_TYPES.HEART, 100, 100)
      expect(fx.particles[0].opacity).toBeDefined()
    })

    it('RIPPLE 파티클은 radius 속성을 가지고 있어야 함', () => {
      const fx = createFxParticle(FX_TYPES.RIPPLE, 100, 100)
      expect(fx.particles[0].radius).toBeDefined()
      expect(fx.particles[0].maxRadius).toBeDefined()
    })

    it('SPARKLE 파티클은 twinkle 속성을 가지고 있어야 함', () => {
      const fx = createFxParticle(FX_TYPES.SPARKLE, 100, 100)
      expect(fx.particles[0].twinkle).toBeDefined()
    })
  })
})