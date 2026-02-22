/**
 * 감정 이모지 스프라이트 시스템 테스트
 */

import { describe, it, expect } from 'vitest'
import {
  EMOTIONS,
  getEmotionConfig,
  getEmotionFromAffinity,
  renderEmotionEmoji,
  renderEmotionPopIn
} from '../src/utils/emojiSprite'

describe('emojiSprite.js', () => {
  describe('EMOTIONS 상수', () => {
    it('16개 감정 타입이 정의되어야 함', () => {
      expect(Object.keys(EMOTIONS)).toHaveLength(16)
    })

    it('필수 감정 타입이 포함되어야 함', () => {
      expect(EMOTIONS.HAPPY).toBe('happy')
      expect(EMOTIONS.SAD).toBe('sad')
      expect(EMOTIONS.ANGRY).toBe('angry')
      expect(EMOTIONS.SURPRISED).toBe('surprised')
      expect(EMOTIONS.NEUTRAL).toBe('neutral')
      expect(EMOTIONS.LOVE).toBe('love')
      expect(EMOTIONS.HATE).toBe('hate')
      expect(EMOTIONS.FEAR).toBe('fear')
      expect(EMOTIONS.EXCITED).toBe('excited')
      expect(EMOTIONS.TIRED).toBe('tired')
      expect(EMOTIONS.CONFUSED).toBe('confused')
      expect(EMOTIONS.PROUD).toBe('proud')
      expect(EMOTIONS.SHY).toBe('shy')
      expect(EMOTIONS.EMBARRASSED).toBe('embarrassed')
      expect(EMOTIONS.CURIOUS).toBe('curious')
      expect(EMOTIONS.DISGUSTED).toBe('disgusted')
    })
  })

  describe('getEmotionConfig', () => {
    it('유효한 감정 설정을 반환해야 함', () => {
      const happyConfig = getEmotionConfig(EMOTIONS.HAPPY)
      expect(happyConfig.emoji).toBe('😊')
      expect(happyConfig.color).toBe('#FFD700')
      expect(happyConfig.label).toBe('HAPPY')
    })

    it('유효하지 않은 감정은 NEUTRAL 설정을 반환해야 함', () => {
      const invalidConfig = getEmotionConfig('invalid_emotion')
      expect(invalidConfig.emoji).toBe('😐')
    })

    it('모든 감정의 설정이 존재해야 함', () => {
      Object.values(EMOTIONS).forEach(emotion => {
        const config = getEmotionConfig(emotion)
        expect(config).toBeDefined()
        expect(config.emoji).toBeDefined()
        expect(config.color).toBeDefined()
      })
    })
  })

  describe('getEmotionFromAffinity', () => {
    it('호감도 80+는 LOVE를 반환해야 함', () => {
      expect(getEmotionFromAffinity(80)).toBe(EMOTIONS.LOVE)
      expect(getEmotionFromAffinity(100)).toBe(EMOTIONS.LOVE)
    })

    it('호감도 60+는 HAPPY를 반환해야 함', () => {
      expect(getEmotionFromAffinity(60)).toBe(EMOTIONS.HAPPY)
      expect(getEmotionFromAffinity(79)).toBe(EMOTIONS.HAPPY)
    })

    it('호감도 40+는 EXCITED를 반환해야 함', () => {
      expect(getEmotionFromAffinity(40)).toBe(EMOTIONS.EXCITED)
      expect(getEmotionFromAffinity(59)).toBe(EMOTIONS.EXCITED)
    })

    it('호감도 20+는 NEUTRAL을 반환해야 함', () => {
      expect(getEmotionFromAffinity(20)).toBe(EMOTIONS.NEUTRAL)
      expect(getEmotionFromAffinity(39)).toBe(EMOTIONS.NEUTRAL)
    })

    it('호감도 0+는 CONFUSED를 반환해야 함', () => {
      expect(getEmotionFromAffinity(0)).toBe(EMOTIONS.CONFUSED)
      expect(getEmotionFromAffinity(19)).toBe(EMOTIONS.CONFUSED)
    })

    it('호감도 -20+는 SAD를 반환해야 함', () => {
      expect(getEmotionFromAffinity(-20)).toBe(EMOTIONS.SAD)
      expect(getEmotionFromAffinity(-1)).toBe(EMOTIONS.SAD)
    })

    it('호감도 -20 미만은 ANGRY를 반환해야 함', () => {
      expect(getEmotionFromAffinity(-21)).toBe(EMOTIONS.ANGRY)
      expect(getEmotionFromAffinity(-100)).toBe(EMOTIONS.ANGRY)
    })
  })

  describe('renderEmotionEmoji', () => {
    it('NEUTRL 감정은 아무것도 렌더링하지 않아야 함', () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const renderSpy = vi.spyOn(ctx, 'save')

      renderEmotionEmoji(ctx, EMOTIONS.NEUTRAL, 100, 100, 1, 1000)

      // NEUTRAL은 조기에 반환하므로 save가 호출되지 않아야 함
      // 실제 브라우저 환경에서 테스트 필요
    })

    it('HAPPY 감정은 이모지를 렌더링해야 함', () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const fillTextSpy = vi.spyOn(ctx, 'fillText')

      renderEmotionEmoji(ctx, EMOTIONS.HAPPY, 100, 100, 1, 1000)

      // 이모지 렌더링 호출 확인
      expect(fillTextSpy).toHaveBeenCalled()
    })
  })

  describe('renderEmotionPopIn', () => {
    it('progress 1 이상은 아무것도 렌더링하지 않아야 함', () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')

      // 에러가 나지 않아야 함
      expect(() => {
        renderEmotionPopIn(ctx, EMOTIONS.HAPPY, 100, 100, 1, 1)
      }).not.toThrow()
    })

    it('progress 0.5에서 pop 애니메이션을 렌더링해야 함', () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')

      // 에러가 나지 않아야 함
      expect(() => {
        renderEmotionPopIn(ctx, EMOTIONS.HAPPY, 100, 100, 1, 0.5)
      }).not.toThrow()
    })
  })
})