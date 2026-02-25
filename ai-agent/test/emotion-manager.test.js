import { describe, test, expect, beforeEach } from 'vitest'
import { EmotionManager } from '../emotion-manager.js'

describe('EmotionManager', () => {
  let emotionManager

  beforeEach(() => {
    emotionManager = new EmotionManager()
  })

  test('default emotion is neutral', () => {
    expect(emotionManager.currentEmotion).toBe('neutral')
    expect(emotionManager.currentEmoji).toBe('😐')
  })

  test('throws error for invalid emotion type', () => {
    expect(() => new EmotionManager('invalid')).toThrow('Invalid emotion type')
  })

  test('can create with valid emotion types', () => {
    const validTypes = ['happy', 'sad', 'angry', 'surprised', 'neutral']
    validTypes.forEach(type => {
      const manager = new EmotionManager(type)
      expect(manager.currentEmotion).toBe(type)
    })
  })

  test('setEmotion changes emotion', () => {
    emotionManager.setEmotion('happy', 'testing')
    expect(emotionManager.currentEmotion).toBe('happy')
    expect(emotionManager.currentEmoji).toBe('😊')
  })

  test('setEmotion throws error for invalid emotion', () => {
    expect(() => emotionManager.setEmotion('invalid')).toThrow('Invalid emotion type')
  })

  test('setEmotion records history', () => {
    emotionManager.setEmotion('happy', 'reason 1')
    emotionManager.setEmotion('sad', 'reason 2')
    
    const history = emotionManager.getHistory()
    expect(history).toHaveLength(2)
    expect(history[0].from).toBe('neutral')
    expect(history[0].to).toBe('happy')
    expect(history[0].reason).toBe('reason 1')
    expect(history[1].from).toBe('happy')
    expect(history[1].to).toBe('sad')
    expect(history[1].reason).toBe('reason 2')
  })

  test('getHistory respects limit', () => {
    for (let i = 0; i < 15; i++) {
      emotionManager.setEmotion('happy', `reason ${i}`)
      emotionManager.setEmotion('sad', `reason ${i}`)
    }

    const history = emotionManager.getHistory(5)
    expect(history).toHaveLength(5)
  })

  test('analyzeEmotion detects happy emotions', () => {
    const result = emotionManager.analyzeEmotion('I am so happy and excited today!')
    expect(result.emotion).toBe('happy')
    expect(result.emoji).toBe('😊')
    expect(result.scores.happy).toBeGreaterThan(0)
  })

  test('analyzeEmotion detects sad emotions', () => {
    const result = emotionManager.analyzeEmotion('I feel so sad and lonely')
    expect(result.emotion).toBe('sad')
    expect(result.emoji).toBe('😢')
    expect(result.scores.sad).toBeGreaterThan(0)
  })

  test('analyzeEmotion detects angry emotions', () => {
    const result = emotionManager.analyzeEmotion('This is so annoying and unfair')
    expect(result.emotion).toBe('angry')
    expect(result.emoji).toBe('😠')
    expect(result.scores.angry).toBeGreaterThan(0)
  })

  test('analyzeEmotion detects surprised emotions', () => {
    const result = emotionManager.analyzeEmotion('Wow, this is incredible!')
    expect(result.emotion).toBe('surprised')
    expect(result.emoji).toBe('😲')
    expect(result.scores.surprised).toBeGreaterThan(0)
  })

  test('analyzeEmotion defaults to neutral for no keywords', () => {
    const result = emotionManager.analyzeEmotion('This is a normal sentence')
    expect(result.emotion).toBe('neutral')
    expect(result.emoji).toBe('😐')
    expect(result.scores.neutral).toBeGreaterThan(0)
  })

  test('analyzeEmotion handles Korean keywords', () => {
    const happyResult = emotionManager.analyzeEmotion('정말 행복해요!')
    expect(happyResult.emotion).toBe('happy')

    const sadResult = emotionManager.analyzeEmotion('너무 슬퍼요')
    expect(sadResult.emotion).toBe('sad')

    const angryResult = emotionManager.analyzeEmotion('화나요')
    expect(angryResult.emotion).toBe('angry')

    const surprisedResult = emotionManager.analyzeEmotion('와우 대단해요')
    expect(surprisedResult.emotion).toBe('surprised')
  })

  test('analyzeEmotion updates emotion state', () => {
    emotionManager.analyzeEmotion('I am so happy!')
    expect(emotionManager.currentEmotion).toBe('happy')
  })

  test('analyzeEmotion records history with reason', () => {
    const message = 'I am so happy and excited today!'
    emotionManager.analyzeEmotion(message)
    
    const history = emotionManager.getHistory()
    expect(history).toHaveLength(1)
    expect(history[0].from).toBe('neutral')
    expect(history[0].to).toBe('happy')
    expect(history[0].reason).toContain(message.substring(0, 50))
  })

  test('getEmotion returns current emotion info', () => {
    emotionManager.setEmotion('happy')
    const info = emotionManager.getEmotion()
    
    expect(info.type).toBe('happy')
    expect(info.emoji).toBe('😊')
    expect(typeof info.lastChangeTime).toBe('number')
  })

  test('reset clears emotion history and resets to neutral', () => {
    emotionManager.setEmotion('happy')
    emotionManager.setEmotion('sad')
    expect(emotionManager.currentEmotion).toBe('sad')
    expect(emotionManager.emotionHistory.length).toBeGreaterThan(0)

    emotionManager.reset()

    expect(emotionManager.currentEmotion).toBe('neutral')
    expect(emotionManager.emotionHistory).toHaveLength(0)
  })

  test('static getEmotionTypes returns emotion types', () => {
    const types = EmotionManager.getEmotionTypes()
    expect(types).toEqual(['happy', 'sad', 'angry', 'surprised', 'neutral'])
  })

  test('static getEmotionEmojis returns emoji mapping', () => {
    const emojis = EmotionManager.getEmotionEmojis()
    expect(emojis.happy).toBe('😊')
    expect(emojis.sad).toBe('😢')
    expect(emojis.angry).toBe('😠')
    expect(emojis.surprised).toBe('😲')
    expect(emojis.neutral).toBe('😐')
  })

  test('multiple analyzeEmotion calls create history chain', () => {
    emotionManager.analyzeEmotion('I am happy')
    emotionManager.analyzeEmotion('This makes me sad')
    emotionManager.analyzeEmotion('Wow, surprising!')
    
    const history = emotionManager.getHistory()
    expect(history).toHaveLength(3)
    expect(history[0].to).toBe('happy')
    expect(history[1].to).toBe('sad')
    expect(history[2].to).toBe('surprised')
    expect(history[2].from).toBe('sad')
  })

  test('lastChangeTime updates on emotion change', () => {
    const time1 = emotionManager.lastChangeTime
    expect(typeof time1).toBe('number')
    
    setTimeout(() => {
      emotionManager.setEmotion('happy')
      const time2 = emotionManager.lastChangeTime
      expect(time2).toBeGreaterThan(time1)
    }, 10)
  })
})