/**
 * 감정 시스템 테스트
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { emotionSystem, EmotionState, EMOTION_TYPES, EMOTION_DEFAULTS } from '../emotion-system.js'

describe('EmotionSystem', () => {
  let testCharacterId

  beforeEach(() => {
    testCharacterId = 'test-character-1'
    // 새 감정 상태 초기화
    emotionSystem.emotionStates.clear()
  })

  describe('감정 기본 설정', () => {
    it('모든 감정 타입이 정의되어 있어야 함', () => {
      expect(EMOTION_TYPES.HAPPY).toBe('happy')
      expect(EMOTION_TYPES.SAD).toBe('sad')
      expect(EMOTION_TYPES.ANGRY).toBe('angry')
      expect(EMOTION_TYPES.JOY).toBe('joy')
      expect(EMOTION_TYPES.CALM).toBe('calm')
      expect(EMOTION_TYPES.ANXIOUS).toBe('anxious')
    })

    it('모든 감정 기본 설정이 정의되어 있어야 함', () => {
      Object.values(EMOTION_TYPES).forEach(type => {
        expect(EMOTION_DEFAULTS[type]).toBeDefined()
        expect(EMOTION_DEFAULTS[type].decayRate).toBeGreaterThan(0)
        expect(EMOTION_DEFAULTS[type].boostRate).toBeGreaterThan(0)
      })
    })
  })

  describe('감정 상태', () => {
    it('새 감정 상태가 기본 감정(calm)으로 초기화되어야 함', () => {
      const state = new EmotionState(testCharacterId)
      expect(state.currentEmotion).toBe(EMOTION_TYPES.CALM)
      expect(state.intensity).toBe(EMOTION_DEFAULTS[EMOTION_TYPES.CALM].intensity)
    })

    it('감정을 설정할 수 있어야 함', () => {
      const state = new EmotionState(testCharacterId)
      const result = state.setEmotion(EMOTION_TYPES.HAPPY, 0.8)

      expect(result).toBe(true)
      expect(state.currentEmotion).toBe(EMOTION_TYPES.HAPPY)
      expect(state.intensity).toBe(0.8)
    })

    it('유효하지 않은 감정 타입을 설정하면 실패해야 함', () => {
      const state = new EmotionState(testCharacterId)
      const result = state.setEmotion('invalid-emotion')

      expect(result).toBe(false)
      expect(state.currentEmotion).toBe(EMOTION_TYPES.CALM)
    })

    it('감정 강도의 자동 설정이 작동해야 함', () => {
      const state = new EmotionState(testCharacterId)
      state.setEmotion(EMOTION_TYPES.ANGRY) // 강도 없이 호출

      expect(state.intensity).toBe(EMOTION_DEFAULTS[EMOTION_TYPES.ANGRY].intensity)
    })
  })

  describe('감정 강화', () => {
    it('감정을 강화할 수 있어야 함', () => {
      const state = new EmotionState(testCharacterId)
      state.setEmotion(EMOTION_TYPES.JOY, 0.5)
      state.boostEmotion(0.2)

      expect(state.intensity).toBeCloseTo(0.7, 1)
    })

    it('감정 강도는 1.0을 넘을 수 없어야 함', () => {
      const state = new EmotionState(testCharacterId)
      state.setEmotion(EMOTION_TYPES.JOY, 0.9)
      state.boostEmotion(0.5) // 너무 큰 강화

      expect(state.intensity).toBeLessThanOrEqual(1.0)
    })

    it('강화 값을 지정하지 않으면 기본 boostRate를 사용해야 함', () => {
      const state = new EmotionState(testCharacterId)
      state.setEmotion(EMOTION_TYPES.JOY, 0.5)
      state.boostEmotion() // 값 없이 호출

      expect(state.intensity).toBeCloseTo(0.5 + EMOTION_DEFAULTS[EMOTION_TYPES.JOY].boostRate, 2)
    })
  })

  describe('감정 이모티콘', () => {
    it('각 감정 타입에 맞는 이모티콘을 반환해야 함', () => {
      const state = new EmotionState(testCharacterId)

      state.setEmotion(EMOTION_TYPES.HAPPY)
      const HappyEmoji = state.getEmoji()
      expect(EMOTION_DEFAULTS[EMOTION_TYPES.HAPPY].emojiBonus).toContain(HappyEmoji)

      state.setEmotion(EMOTION_TYPES.SAD)
      const sadEmoji = state.getEmoji()
      expect(EMOTION_DEFAULTS[EMOTION_TYPES.SAD].emojiBonus).toContain(sadEmoji)

      state.setEmotion(EMOTION_TYPES.ANGRY)
      const angryEmoji = state.getEmoji()
      expect(EMOTION_DEFAULTS[EMOTION_TYPES.ANGRY].emojiBonus).toContain(angryEmoji)
    })
  })

  describe('감정 강도 수정자', () => {
    it('약한 감정 강도는 "weak"를 반환해야 함', () => {
      const state = new EmotionState(testCharacterId)
      state.setEmotion(EMOTION_TYPES.CALM, 0.2)

      expect(state.getIntensityModifier()).toBe('weak')
    })

    it('중간 감정 강도는 "moderate"를 반환해야 함', () => {
      const state = new EmotionState(testCharacterId)
      state.setEmotion(EMOTION_TYPES.CALM, 0.5)

      expect(state.getIntensityModifier()).toBe('moderate')
    })

    it('강한 감정 강도는 "strong"를 반환해야 함', () => {
      const state = new EmotionState(testCharacterId)
      state.setEmotion(EMOTION_TYPES.JOY, 0.7)

      expect(state.getIntensityModifier()).toBe('strong')
    })
  })

  describe('감정 기록', () => {
    it('감정 변화가 기록되어야 함', () => {
      const state = new EmotionState(testCharacterId)
      state.setEmotion(EMOTION_TYPES.HAPPY)
      state.setEmotion(EMOTION_TYPES.SAD)

      // 감정 기록이 있어야 함
      expect(state.emotionHistory.length).toBeGreaterThan(0)

      // 마지막 감정 기록 확인 (SAD 설정)
      const lastRecord = state.emotionHistory[state.emotionHistory.length - 1]
      expect(lastRecord.to).toBe(EMOTION_TYPES.SAD)
    })

    it('감정 기록은 최근 20개만 유지되어야 함', () => {
      const state = new EmotionState(testCharacterId)

      // 30번 감정 변경
      for (let i = 0; i < 30; i++) {
        state.setEmotion(i % 2 === 0 ? EMOTION_TYPES.HAPPY : EMOTION_TYPES.SAD)
      }

      expect(state.emotionHistory.length).toBeLessThanOrEqual(20)
    })
  })

  describe('감정 시스템 관리자', () => {
    it('캐릭터 감정 상태를 가져오거나 생성할 수 있어야 함', () => {
      const state1 = emotionSystem.getEmotionState(testCharacterId)
      const state2 = emotionSystem.getEmotionState(testCharacterId)

      expect(state1).toBeInstanceOf(EmotionState)
      expect(state1).toBe(state2) // 같은 인스턴스
    })

    it('시스템을 통해 감정을 설정할 수 있어야 함', () => {
      const result = emotionSystem.setEmotion(testCharacterId, EMOTION_TYPES.JOY, 0.8)
      const state = emotionSystem.getEmotionState(testCharacterId)

      expect(result).toBe(true)
      expect(state.currentEmotion).toBe(EMOTION_TYPES.JOY)
      expect(state.intensity).toBeCloseTo(0.8, 1)
    })

    it('감정 히스토리를 가져올 수 있어야 함', () => {
      emotionSystem.setEmotion(testCharacterId, EMOTION_TYPES.HAPPY)
      emotionSystem.setEmotion(testCharacterId, EMOTION_TYPES.SAD)

      const history = emotionSystem.getEmotionHistory(testCharacterId)

      expect(Array.isArray(history)).toBe(true)
      expect(history.length).toBeGreaterThan(0)
    })
  })
})