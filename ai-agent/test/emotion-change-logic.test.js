import { describe, test, expect, beforeEach, vi } from 'vitest'
import { EmotionManager } from '../emotion-manager.js'

describe('Emotion Change Logic in Agent', () => {
  let emotionManager

  beforeEach(() => {
    emotionManager = new EmotionManager()
  })

  describe('Chat-based emotion transitions', () => {
    test('positive chat transitions to happy', () => {
      const result = emotionManager.analyzeEmotion('Thank you so much! This is great!')
      expect(result.emotion).toBe('happy')
      expect(emotionManager.getHistory()[0].to).toBe('happy')
    })

    test('negative chat transitions to sad', () => {
      const result = emotionManager.analyzeEmotion('I am so disappointed about this')
      expect(result.emotion).toBe('sad')
      expect(emotionManager.getHistory()[0].to).toBe('sad')
    })

    test('angry chat transitions to angry', () => {
      const result = emotionManager.analyzeEmotion('This is so unfair, I hate it!')
      expect(result.emotion).toBe('angry')
      expect(emotionManager.getHistory()[0].to).toBe('angry')
    })

    test('surprising chat transitions to surprised', () => {
      const result = emotionManager.analyzeEmotion('Wow, this is incredible news!')
      expect(result.emotion).toBe('surprised')
      expect(emotionManager.getHistory()[0].to).toBe('surprised')
    })

    test('neutral chat maintains neutral', () => {
      const result = emotionManager.analyzeEmotion('The sky is blue and clouds are white')
      expect(result.emotion).toBe('neutral')
    })
  })

  describe('Sequential emotion changes', () => {
    test('emotion changes create a chain in history', () => {
      const messages = [
        'I am so happy!',
        'This is terrible',
        'Wow, what happened?',
        'I am excited again!'
      ]

      const expectedEmotions = ['happy', 'sad', 'surprised', 'happy']

      messages.forEach((msg, idx) => {
        const result = emotionManager.analyzeEmotion(msg)
        expect(result.emotion).toBe(expectedEmotions[idx])
      })

      const history = emotionManager.getHistory()
      expect(history).toHaveLength(4)
      expect(history[0].from).toBe('neutral')
      expect(history[0].to).toBe('happy')
      expect(history[1].from).toBe('happy')
      expect(history[1].to).toBe('sad')
      expect(history[2].from).toBe('sad')
      expect(history[2].to).toBe('surprised')
      expect(history[3].from).toBe('surprised')
      expect(history[3].to).toBe('happy')
    })
  })

  describe('Emotion score calculation', () => {
    test('multiple positive keywords increase happy score', () => {
      const result = emotionManager.analyzeEmotion('I am happy, excited, and thankful!')
      expect(result.scores.happy).toBeGreaterThanOrEqual(3)
    })

    test('mixed emotions prioritize strongest emotion', () => {
      const result = emotionManager.analyzeEmotion('I am sad but surprised')
      expect(result.scores.sad).toBe(1)
      expect(result.scores.surprised).toBe(1)
      expect(['sad', 'surprised']).toContain(result.emotion)
    })

    test('neutral score decreases when emotion keywords are present', () => {
      const resultWithEmotion = emotionManager.analyzeEmotion('I am happy')
      expect(resultWithEmotion.scores.neutral).toBe(0)
    })

    test('neutral score is present when no emotion keywords', () => {
      const resultWithoutEmotion = emotionManager.analyzeEmotion('The sky is blue')
      expect(resultWithoutEmotion.scores.neutral).toBeGreaterThan(0)
      expect(resultWithoutEmotion.emotion).toBe('neutral')
    })
  })

  describe('Multilingual emotion detection', () => {
    test('Korean happiness is detected', () => {
      const result = emotionManager.analyzeEmotion('정말 행복하고 좋아요!')
      expect(result.emotion).toBe('happy')
    })

    test('Korean sadness is detected', () => {
      const result = emotionManager.analyzeEmotion('너무 슬프고 서운해요')
      expect(result.emotion).toBe('sad')
    })

    test('Korean anger is detected', () => {
      const result = emotionManager.analyzeEmotion('화나고 짜증나요')
      expect(result.emotion).toBe('angry')
    })

    test('Korean surprise is detected', () => {
      const result = emotionManager.analyzeEmotion('와우 정말 놀라워요!')
      expect(result.emotion).toBe('surprised')
    })

    test('mixed language emotion detection', () => {
      const result = emotionManager.analyzeEmotion('I am so happy 행복해요!')
      expect(result.emotion).toBe('happy')
      expect(result.scores.happy).toBeGreaterThanOrEqual(2)
    })
  })

  describe('Character interaction emotion context', () => {
    test('greeting interaction sets happy emotion', () => {
      const greeting = 'Hello! Nice to meet you!'
      const result = emotionManager.analyzeEmotion(greeting)
      expect(result.emotion).toBe('happy')
    })

    test('gift interaction increases happy score significantly', () => {
      const giftMessage = 'Thank you for the wonderful gift! I love it!'
      emotionManager.analyzeEmotion(giftMessage)
      expect(emotionManager.currentEmotion).toBe('happy')
    })

    test('conflict interaction sets angry emotion', () => {
      const conflict = 'I hate this ridiculous situation!'
      const result = emotionManager.analyzeEmotion(conflict)
      expect(result.emotion).toBe('angry')
    })

    test('apology may set sad emotion', () => {
      const apology = 'I am so sorry about what happened'
      const result = emotionManager.analyzeEmotion(apology)
      expect(result.emotion).toBe('sad')
    })
  })

  describe('Emotion state persistence', () => {
    test('emotion persists across multiple messages', () => {
      emotionManager.analyzeEmotion('I am happy')
      expect(emotionManager.currentEmotion).toBe('happy')

      emotionManager.analyzeEmotion('This is great')
      expect(emotionManager.currentEmotion).toBe('happy')
    })

    test('emotion changes when detected', () => {
      emotionManager.analyzeEmotion('I am happy')
      expect(emotionManager.currentEmotion).toBe('happy')

      const historyBefore = emotionManager.emotionHistory.length

      emotionManager.analyzeEmotion('This is terrible and bad')
      expect(emotionManager.currentEmotion).toBe('sad')

      const historyAfter = emotionManager.emotionHistory.length
      expect(historyAfter).toBeGreaterThan(historyBefore)
    })
  })

  describe('Edge cases', () => {
    test('empty message defaults to neutral', () => {
      const result = emotionManager.analyzeEmotion('')
      expect(result.emotion).toBe('neutral')
    })

    test('case insensitive emotion detection', () => {
      const result1 = emotionManager.analyzeEmotion('I am HAPPY')
      expect(result1.emotion).toBe('happy')

      const result2 = emotionManager.analyzeEmotion('i am happy')
      expect(result2.emotion).toBe('happy')
    })

    test('special characters do not affect emotion detection', () => {
      const result = emotionManager.analyzeEmotion('I am so happy!!! 😊')
      expect(result.emotion).toBe('happy')
    })

    test('reset emotion to neutral', () => {
      emotionManager.analyzeEmotion('I am happy')
      expect(emotionManager.currentEmotion).toBe('happy')

      emotionManager.reset()
      expect(emotionManager.currentEmotion).toBe('neutral')
      expect(emotionManager.emotionHistory).toHaveLength(0)
    })
  })

  describe('Emoji consistency', () => {
    test('each emotion has consistent emoji', () => {
      emotionManager.setEmotion('happy')
      expect(emotionManager.currentEmoji).toBe('😊')

      emotionManager.setEmotion('sad')
      expect(emotionManager.currentEmoji).toBe('😢')

      emotionManager.setEmotion('angry')
      expect(emotionManager.currentEmoji).toBe('😠')

      emotionManager.setEmotion('surprised')
      expect(emotionManager.currentEmoji).toBe('😲')

      emotionManager.setEmotion('neutral')
      expect(emotionManager.currentEmoji).toBe('😐')
    })
  })
})