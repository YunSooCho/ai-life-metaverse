/**
 * Phase 4 GameCanvas 통합 테스트
 * emojiSprite + effects가 GameCanvas에서 올바르게 import되는지 확인
 */

import { describe, it, expect } from 'vitest'
import {
  EMOTIONS,
  getEmotionConfig,
  getEmotionFromAffinity,
  renderEmotionEmoji
} from '../emojiSprite'
import {
  FX_TYPES,
  createFxParticle,
  renderFx,
  getFxForAffinityChange
} from '../effects'

describe('Phase 4 GameCanvas Integration', () => {
  describe('Emotion + Affinity flow', () => {
    it('should map affinity to emotion and get config', () => {
      const emotion = getEmotionFromAffinity(75)
      const config = getEmotionConfig(emotion)
      expect(emotion).toBe(EMOTIONS.HAPPY)
      expect(config.emoji).toBe('😊')
    })

    it('should map negative affinity to angry', () => {
      const emotion = getEmotionFromAffinity(-30)
      expect(emotion).toBe(EMOTIONS.ANGRY)
    })

    it('should map high affinity to love', () => {
      const emotion = getEmotionFromAffinity(90)
      expect(emotion).toBe(EMOTIONS.LOVE)
    })
  })

  describe('Affinity change → FX trigger', () => {
    it('positive change should create heart FX', () => {
      const fxType = getFxForAffinityChange(15)
      expect(fxType).toBe(FX_TYPES.HEART)
      const fx = createFxParticle(fxType, 100, 200)
      expect(fx.type).toBe(FX_TYPES.HEART)
      expect(fx.particles.length).toBe(3)
    })

    it('negative change should create anger FX', () => {
      const fxType = getFxForAffinityChange(-20)
      expect(fxType).toBe(FX_TYPES.ANGER)
      const fx = createFxParticle(fxType, 100, 200)
      expect(fx.type).toBe(FX_TYPES.ANGER)
      expect(fx.particles.length).toBe(4)
    })

    it('zero change should not create FX', () => {
      const fxType = getFxForAffinityChange(0)
      expect(fxType).toBeNull()
    })
  })

  describe('FX lifecycle', () => {
    it('active FX should render and return true', () => {
      const ctx = {
        save: () => {}, restore: () => {},
        fillRect: () => {}, fillText: () => {},
        beginPath: () => {}, arc: () => {}, stroke: () => {},
        globalAlpha: 1, fillStyle: '', strokeStyle: '',
        lineWidth: 0, font: '', textAlign: ''
      }
      const fx = createFxParticle(FX_TYPES.HEART, 100, 100)
      expect(renderFx(ctx, fx, 1)).toBe(true)
    })

    it('expired FX should return false', () => {
      const ctx = { save: () => {}, restore: () => {} }
      const fx = createFxParticle(FX_TYPES.DUST, 100, 100)
      fx.startTime = Date.now() - 10000
      expect(renderFx(ctx, fx, 1)).toBe(false)
    })
  })
})
