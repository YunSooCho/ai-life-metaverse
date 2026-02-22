import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  FX_TYPES,
  createFxParticle,
  renderFx,
  getFxForAffinityChange
} from '../effects'

describe('FX Effects System', () => {
  describe('FX_TYPES', () => {
    it('should have 6 fx types', () => {
      expect(Object.keys(FX_TYPES)).toHaveLength(6)
    })
  })

  describe('createFxParticle', () => {
    it('should create dust particle', () => {
      const fx = createFxParticle(FX_TYPES.DUST, 100, 200)
      expect(fx.type).toBe(FX_TYPES.DUST)
      expect(fx.x).toBe(100)
      expect(fx.y).toBe(200)
      expect(fx.particles.length).toBe(5)
      expect(fx.duration).toBe(400)
    })

    it('should create heart particle', () => {
      const fx = createFxParticle(FX_TYPES.HEART, 50, 50)
      expect(fx.particles.length).toBe(3)
      expect(fx.duration).toBe(800)
    })

    it('should create ripple particle', () => {
      const fx = createFxParticle(FX_TYPES.RIPPLE, 50, 50)
      expect(fx.particles.length).toBe(1)
      expect(fx.particles[0]).toHaveProperty('radius')
      expect(fx.particles[0]).toHaveProperty('maxRadius')
    })

    it('should create sparkle particle', () => {
      const fx = createFxParticle(FX_TYPES.SPARKLE, 50, 50)
      expect(fx.particles.length).toBe(6)
      expect(fx.duration).toBe(1000)
    })

    it('should create anger particle', () => {
      const fx = createFxParticle(FX_TYPES.ANGER, 50, 50)
      expect(fx.particles.length).toBe(4)
    })
  })

  describe('renderFx', () => {
    let ctx
    beforeEach(() => {
      ctx = {
        save: vi.fn(), restore: vi.fn(),
        fillRect: vi.fn(), fillText: vi.fn(),
        beginPath: vi.fn(), arc: vi.fn(), stroke: vi.fn(),
        globalAlpha: 1, fillStyle: '', strokeStyle: '',
        lineWidth: 0, font: '', textAlign: ''
      }
    })

    it('should return true for active dust fx', () => {
      const fx = createFxParticle(FX_TYPES.DUST, 100, 100)
      const result = renderFx(ctx, fx, 1)
      expect(result).toBe(true)
      expect(ctx.save).toHaveBeenCalled()
    })

    it('should return false for expired fx', () => {
      const fx = createFxParticle(FX_TYPES.DUST, 100, 100)
      fx.startTime = Date.now() - 1000 // expired
      const result = renderFx(ctx, fx, 1)
      expect(result).toBe(false)
    })

    it('should render heart fx', () => {
      const fx = createFxParticle(FX_TYPES.HEART, 100, 100)
      const result = renderFx(ctx, fx, 1)
      expect(result).toBe(true)
      expect(ctx.fillText).toHaveBeenCalled()
    })

    it('should render ripple fx', () => {
      const fx = createFxParticle(FX_TYPES.RIPPLE, 100, 100)
      const result = renderFx(ctx, fx, 1)
      expect(result).toBe(true)
      expect(ctx.beginPath).toHaveBeenCalled()
      expect(ctx.arc).toHaveBeenCalled()
    })
  })

  describe('getFxForAffinityChange', () => {
    it('should return HEART for positive change', () => {
      expect(getFxForAffinityChange(10)).toBe(FX_TYPES.HEART)
    })

    it('should return ANGER for negative change', () => {
      expect(getFxForAffinityChange(-5)).toBe(FX_TYPES.ANGER)
    })

    it('should return null for zero change', () => {
      expect(getFxForAffinityChange(0)).toBeNull()
    })
  })
})
