import { describe, it, expect, vi } from 'vitest'
import {
  EMOTIONS,
  getEmotionConfig,
  getEmotionFromAffinity,
  renderEmotionEmoji,
  renderEmotionPopIn
} from '../emojiSprite'

describe('Emoji Sprite System', () => {
  describe('EMOTIONS', () => {
    it('should have 16 emotions', () => {
      expect(Object.keys(EMOTIONS)).toHaveLength(16)
    })
  })

  describe('getEmotionConfig', () => {
    it('should return config for each emotion', () => {
      Object.values(EMOTIONS).forEach(emotion => {
        const config = getEmotionConfig(emotion)
        expect(config).toHaveProperty('emoji')
        expect(config).toHaveProperty('color')
        expect(config).toHaveProperty('label')
      })
    })

    it('should return neutral for unknown emotion', () => {
      const config = getEmotionConfig('unknown')
      expect(config.emoji).toBe('😐')
    })
  })

  describe('getEmotionFromAffinity', () => {
    it('should return love for high affinity', () => {
      expect(getEmotionFromAffinity(85)).toBe(EMOTIONS.LOVE)
    })

    it('should return happy for good affinity', () => {
      expect(getEmotionFromAffinity(65)).toBe(EMOTIONS.HAPPY)
    })

    it('should return neutral for mid affinity', () => {
      expect(getEmotionFromAffinity(25)).toBe(EMOTIONS.NEUTRAL)
    })

    it('should return angry for very low affinity', () => {
      expect(getEmotionFromAffinity(-25)).toBe(EMOTIONS.ANGRY)
    })
  })

  describe('renderEmotionEmoji', () => {
    it('should render on canvas for non-neutral emotions', () => {
      const ctx = {
        save: vi.fn(), restore: vi.fn(),
        beginPath: vi.fn(), arc: vi.fn(), fill: vi.fn(),
        fillText: vi.fn(),
        font: '', textAlign: '', textBaseline: '', fillStyle: '',
        shadowColor: '', shadowBlur: 0
      }
      renderEmotionEmoji(ctx, EMOTIONS.HAPPY, 100, 50, 1, 0)
      expect(ctx.fillText).toHaveBeenCalled()
    })

    it('should not render for neutral', () => {
      const ctx = { save: vi.fn(), restore: vi.fn(), fillText: vi.fn() }
      renderEmotionEmoji(ctx, EMOTIONS.NEUTRAL, 100, 50, 1, 0)
      expect(ctx.save).not.toHaveBeenCalled()
    })
  })

  describe('renderEmotionPopIn', () => {
    it('should render for progress < 1', () => {
      const ctx = {
        save: vi.fn(), restore: vi.fn(), fillText: vi.fn(),
        globalAlpha: 1, font: '', textAlign: '', textBaseline: ''
      }
      renderEmotionPopIn(ctx, EMOTIONS.HAPPY, 100, 50, 1, 0.5)
      expect(ctx.fillText).toHaveBeenCalled()
    })

    it('should not render for progress >= 1', () => {
      const ctx = { save: vi.fn(), restore: vi.fn(), fillText: vi.fn() }
      renderEmotionPopIn(ctx, EMOTIONS.HAPPY, 100, 50, 1, 1)
      expect(ctx.save).not.toHaveBeenCalled()
    })
  })
})
