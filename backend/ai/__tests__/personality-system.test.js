/**
 * 개인성 시스템 테스트
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { personalitySystem, PERSONALITY_TYPES, PERSONALITY_DEFAULTS } from '../personality-system.js'

describe('PersonalitySystem', () => {
  let testCharacterId

  beforeEach(() => {
    testCharacterId = 'test-character-1'
    // 새 개인성 상태 초기화
    personalitySystem.personalities.clear()
  })

  describe('개인성 타입', () => {
    it('모든 개인성 타입이 정의되어 있어야 함', () => {
      expect(PERSONALITY_TYPES.EXTROVERT).toBe('extrovert')
      expect(PERSONALITY_TYPES.INTROVERT).toBe('introvert')
      expect(PERSONALITY_TYPES.FEELER).toBe('feeler')
      expect(PERSONALITY_TYPES.THINKER).toBe('thinker')
      expect(PERSONALITY_TYPES.CREATIVE).toBe('creative')
      expect(PERSONALITY_TYPES.REALIST).toBe('realist')
    })

    it('모든 개인성 기본 설정이 정의되어 있어야 함', () => {
      Object.values(PERSONALITY_TYPES).forEach(type => {
        expect(PERSONALITY_DEFAULTS[type]).toBeDefined()
        expect(PERSONALITY_DEFAULTS[type].name).toBeDefined()
        expect(PERSONALITY_DEFAULTS[type].description).toBeDefined()
        expect(PERSONALITY_DEFAULTS[type].speakingStyle).toBeDefined()
      })
    })
  })

  describe('개인성 설정', () => {
    it('개인성을 설정할 수 있어야 함', () => {
      const result = personalitySystem.setPersonality(testCharacterId, PERSONALITY_TYPES.EXTROVERT)

      expect(result).toBe(true)
      expect(personalitySystem.getPersonality(testCharacterId)).toBe(PERSONALITY_TYPES.EXTROVERT)
    })

    it('유효하지 않은 개인성 타입을 설정하면 실패해야 함', () => {
      const result = personalitySystem.setPersonality(testCharacterId, 'invalid-personality')

      expect(result).toBe(false)
    })

    it('개인성이 설정되지 않으면 기본값을 반환해야 함', () => {
      const personality = personalitySystem.getPersonality(testCharacterId)

      expect(personality).toBe(PERSONALITY_TYPES.INTROVERT)
    })

    it('개인성 설정을 가져올 수 있어야 함', () => {
      personalitySystem.setPersonality(testCharacterId, PERSONALITY_TYPES.FEELER)
      const settings = personalitySystem.getPersonalitySettings(testCharacterId)

      expect(settings).toBeDefined()
      expect(settings.name).toBe('감정형')
      expect(settings.description).toBeDefined()
    })
  })

  describe('개인성 스타일 적용', () => {
    beforeEach(() => {
      personalitySystem.setPersonality(testCharacterId, PERSONALITY_TYPES.EXTROVERT)
    })

    it('외향형 스타일이 응답에 적용되어야 함', () => {
      const response = personalitySystem.applyPersonalityStyle(testCharacterId, '안녕하세요! 만나서 반가워요.')

      expect(typeof response).toBe('string')
      expect(response.length).toBeGreaterThan(0)
    })

    it('내향형 스타일이 응답에 적용되어야 함', () => {
      personalitySystem.setPersonality(testCharacterId, PERSONALITY_TYPES.INTROVERT)
      const response = personalitySystem.applyPersonalityStyle(testCharacterId, '안녕하세요.')

      expect(typeof response).toBe('string')
      expect(response.length).toBeGreaterThan(0)
    })

    it('감정형 스타일이 응답에 적용되어야 함', () => {
      personalitySystem.setPersonality(testCharacterId, PERSONALITY_TYPES.FEELER)
      const response = personalitySystem.applyPersonalityStyle(testCharacterId, '어떻게 지내세요?')

      expect(typeof response).toBe('string')
      expect(response.length).toBeGreaterThan(0)
    })
  })

  describe('키워드 선택', () => {
    it('개인성에 맞는 키워드를 선택할 수 있어야 함', () => {
      personalitySystem.setPersonality(testCharacterId, PERSONALITY_TYPES.EXTROVERT)
      const keyword = personalitySystem.selectKeyword(testCharacterId)

      expect(keyword).toBeDefined()
      expect(typeof keyword).toBe('string')
      expect(PERSONALITY_DEFAULTS[PERSONALITY_TYPES.EXTROVERT].keywords).toContain(keyword)
    })

    it('다른 개인성의 키워드를 선택할 수 있어야 함', () => {
      personalitySystem.setPersonality(testCharacterId, PERSONALITY_TYPES.INTROVERT)
      const keyword = personalitySystem.selectKeyword(testCharacterId)

      expect(PERSONALITY_DEFAULTS[PERSONALITY_TYPES.INTROVERT].keywords).toContain(keyword)
    })
  })

  describe('대화 길이 조정', () => {
    it('현실형은 짧게 조정해야 함', () => {
      personalitySystem.setPersonality(testCharacterId, PERSONALITY_TYPES.REALIST)
      const longText = '이것은 아주 긴 텍스트입니다. 아주 아주 긴 텍스트가 되고 있습니다. 계속 길게 작성되고 있습니다. 이것은 테스트를 위한 것입니다. 아주 긴 텍스트입니다.'

      const adjusted = personalitySystem.adjustConversationLength(testCharacterId, longText, 100)

      expect(adjusted.length).toBeLessThanOrEqual(60) // 현실형은 ~50
    })

    it('이성형은 길게 조정해야 함', () => {
      personalitySystem.setPersonality(testCharacterId, PERSONALITY_TYPES.THINKER)
      const shortText = '짧은 텍스트'

      const adjusted = personalitySystem.adjustConversationLength(testCharacterId, shortText, 50)

      expect(adjusted.length).toBeGreaterThanOrEqual(80) // 이성형은 ~100 이상
    })
  })

  describe('토픽 추천', () => {
    it('개인성에 맞는 토픽을 추천할 수 있어야 함', () => {
      personalitySystem.setPersonality(testCharacterId, PERSONALITY_TYPES.CREATIVE)
      const topic = personalitySystem.suggestTopic(testCharacterId)

      expect(topic).toBeDefined()
      expect(typeof topic).toBe('string')
      expect(PERSONALITY_DEFAULTS[PERSONALITY_TYPES.CREATIVE].topics).toContain(topic)
    })

    it('다른 개인성의 토픽을 추천할 수 있어야 함', () => {
      personalitySystem.setPersonality(testCharacterId, PERSONALITY_TYPES.THINKER)
      const topic = personalitySystem.suggestTopic(testCharacterId)

      expect(PERSONALITY_DEFAULTS[PERSONALITY_TYPES.THINKER].topics).toContain(topic)
    })
  })

  describe('개인성 특성', () => {
    it('외향형의 특성이 올바르게 정의되어 있어야 함', () => {
      const settings = PERSONALITY_DEFAULTS[PERSONALITY_TYPES.EXTROVERT]

      expect(settings.name).toBe('외향형')
      expect(settings.politeness).toBe('casual')
      expect(settings.emojiFrequency).toBe('high')
      expect(settings.strengths).toContain('친화력')
    })

    it('내향형의 특성이 올바르게 정의되어 있어야 함', () => {
      const settings = PERSONALITY_DEFAULTS[PERSONALITY_TYPES.INTROVERT]

      expect(settings.name).toBe('내향형')
      expect(settings.politeness).toBe('formal')
      expect(settings.emojiFrequency).toBe('low')
      expect(settings.strengths).toContain('집중력')
    })

    it('감정형의 특성이 올바르게 정의되어 있어야 함', () => {
      const settings = PERSONALITY_DEFAULTS[PERSONALITY_TYPES.FEELER]

      expect(settings.name).toBe('감정형')
      expect(settings.speakingStyle).toContain('감정')
      expect(settings.strengths).toContain('공감력')
    })

    it('이성형의 특성이 올바르게 정의되어 있어야 함', () => {
      const settings = PERSONALITY_DEFAULTS[PERSONALITY_TYPES.THINKER]

      expect(settings.name).toBe('이성형')
      expect(settings.speakingStyle).toContain('논리')
      expect(settings.strengths).toContain('논리력')
    })

    it('창의형의 특성이 올바르게 정의되어 있어야 함', () => {
      const settings = PERSONALITY_DEFAULTS[PERSONALITY_TYPES.CREATIVE]

      expect(settings.name).toBe('창의형')
      expect(settings.speakingStyle).toContain('창의')
      expect(settings.strengths).toContain('창의력')
    })

    it('현실형의 특성이 올바르게 정의되어 있어야 함', () => {
      const settings = PERSONALITY_DEFAULTS[PERSONALITY_TYPES.REALIST]

      expect(settings.name).toBe('현실형')
      expect(settings.speakingStyle).toContain('현실')
      expect(settings.strengths).toContain('실용성')
    })
  })
})