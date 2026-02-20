/**
 * 고급 대화 시스템 테스트
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { advancedConversationSystem, CHARACTER_PERSONALITIES } from '../conversation.js'

describe('AdvancedConversationSystem', () => {
  let testCharacterId

  beforeEach(() => {
    testCharacterId = 'ai-agent-1'
    // 이전 상태 초기화
    advancedConversationSystem.stop()
  })

  describe('시스템 초기화', () => {
    it('시스템이 초기화되어야 함', () => {
      advancedConversationSystem.initialize(null, {})

      expect(advancedConversationSystem.isActive).toBe(true)
    })

    it('캐릭터별 개인성이 설정되어야 함', () => {
      advancedConversationSystem.initialize(null, {})

      // ai-agent-1 감정형
      const personality = advancedConversationSystem.getPersonality(testCharacterId)
      expect(personality).toBeDefined()
      expect(personality).toBe('feeler')

      // 감정도 설정되어야 함
      const emotion = advancedConversationSystem.getEmotionState(testCharacterId)
      expect(emotion.currentEmotion).toBe('joy')
    })
  })

  describe('캐릭터 개인성', () => {
    it('캐릭터 개인성 설정이 올바르게 정의되어 있어야 함', () => {
      expect(CHARACTER_PERSONALITIES['ai-agent-1']).toBeDefined()
      expect(CHARACTER_PERSONALITIES['ai-agent-1'].personality).toBe('feeler')
      expect(CHARACTER_PERSONALITIES['ai-agent-2'].personality).toBe('extrovert')
    })

    it('캐릭터 기본 감정이 설정되어 있어야 함', () => {
      expect(CHARACTER_PERSONALITIES['ai-agent-1'].defaultEmotion).toBe('joy')
      expect(CHARACTER_PERSONALITIES['ai-agent-2'].defaultEmotion).toBe('joy')
    })
  })

  describe('감정 프롬프트 생성', () => {
    beforeEach(() => {
      advancedConversationSystem.initialize(null, {})
    })

    it('감정 프롬프트를 생성할 수 있어야 함', () => {
      const prompt = advancedConversationSystem.generateEmotionPrompt({
        type: 'happy',
        intensity: 0.7,
        intensityModifier: 'strong'
      })

      expect(typeof prompt).toBe('string')
      expect(prompt).toContain('[감정 상태]')
      expect(prompt).toContain('현재 감정')
      expect(prompt).toContain('행복')
    })

    it('감정 강도를 포함해야 함', () => {
      const emotionState = { type: 'happy', intensity: 0.7, intensityModifier: 'strong' }
      const prompt = advancedConversationSystem.generateEmotionPrompt(emotionState)

      expect(prompt).toContain('70%')
    })

    it('감정 강도 수정자를 포함해야 함', () => {
      const emotionState = { type: 'happy', intensity: 0.2, intensityModifier: 'weak' }
      const prompt = advancedConversationSystem.generateEmotionPrompt(emotionState)

      expect(prompt).toContain('약함')
    })
  })

  describe('개인성 프롬프트 생성', () => {
    beforeEach(() => {
      advancedConversationSystem.initialize(null, {})
    })

    it('개인성 프롬프트을 생성할 수 있어야 함', () => {
      const personality = advancedConversationSystem.getPersonality(testCharacterId)
      const prompt = advancedConversationSystem.generatePersonalityPrompt(personality)

      expect(typeof prompt).toBe('string')
      expect(prompt).toContain('[개인성 특성]')
      expect(prompt).toContain('개인성 타입')
    })

    it('감정형 개인성 정보를 포함해야 함', () => {
      const personality = advancedConversationSystem.getPersonalitySettings(testCharacterId)
      const prompt = advancedConversationSystem.generatePersonalityPrompt(personality)

      expect(prompt).toContain('감정형')
      expect(prompt).toContain('성격')
      expect(prompt).toContain('말하기 스타일')
    })
  })

  describe('감정 상태 변경', () => {
    beforeEach(() => {
      advancedConversationSystem.initialize(null, {})
    })

    it('긍정적 콘텐츠로 감정을 강화해야 함', () => {
      advancedConversationSystem.updateEmotionFromContent(testCharacterId, '오늘 정말 좋아! 행복해!', true)

      const emotion = advancedConversationSystem.getEmotionState(testCharacterId)

      expect(emotion.currentEmotion).toBe('happy')
      expect(emotion.intensity).toBeGreaterThan(0.5)
    })

    it('부정적 콘텐츠로 감정을 변경해야 함', () => {
      advancedConversationSystem.updateEmotionFromContent(testCharacterId, '슬퍼... 너무 힘들어', true)

      const emotion = advancedConversationSystem.getEmotionState(testCharacterId)

      expect(emotion.currentEmotion).toBe('sad')
    })

    it('화난 콘텐츠로 감정을 변경해야 함', () => {
      advancedConversationSystem.updateEmotionFromContent(testCharacterId, '화나! 미쳤어! 정말 어이없어!', true)

      const emotion = advancedConversationSystem.getEmotionState(testCharacterId)

      expect(emotion.currentEmotion).toBe('angry')
    })

    it('기쁨 콘텐츠로 감정을 변경해야 함', () => {
      advancedConversationSystem.updateEmotionFromContent(testCharacterId, '와우! 멋져! 대박이야!', true)

      const emotion = advancedConversationSystem.getEmotionState(testCharacterId)

      expect(emotion.currentEmotion).toBe('joy')
    })

    it('사용자의 긍정적 메시지로 AI 감정을 강화해야 함', () => {
      // 초기 감정 설정
      advancedConversationSystem.getEmotionState(testCharacterId).setEmotion('calm', 0.3)

      // 사용자 긍정적 메시지
      advancedConversationSystem.updateEmotionFromContent(testCharacterId, '정말 좋아! 사랑해!')

      const emotion = advancedConversationSystem.getEmotionState(testCharacterId)

      expect(emotion.intensity).toBeGreaterThan(0.3) // 강화되어야 함
    })
  })

  describe('플레이어 동작 분석', () => {
    beforeEach(() => {
      advancedConversationSystem.initialize(null, {})
    })

    it('인사 동작으로 감정을 강화해야 함', () => {
      const initialIntensity = advancedConversationSystem.getEmotionState(testCharacterId).intensity

      advancedConversationSystem.analyzePlayerAction(testCharacterId, 'greet')

      const finalIntensity = advancedConversationSystem.getEmotionState(testCharacterId).intensity

      expect(finalIntensity).toBeGreaterThan(initialIntensity)
    })

    it('칭찬 동작으로 기쁨 감정으로 변경해야 함', () => {
      advancedConversationSystem.analyzePlayerAction(testCharacterId, 'compliment', { type: 'praise' })

      const emotion = advancedConversationSystem.getEmotionState(testCharacterId)

      expect(emotion.currentEmotion).toBe('joy')
    })

    it('모욕 동작으로 화남 감정으로 변경해야 함', () => {
      advancedConversationSystem.analyzePlayerAction(testCharacterId, 'insult', { type: 'curse' })

      const emotion = advancedConversationSystem.getEmotionState(testCharacterId)

      expect(emotion.currentEmotion).toBe('angry')
    })
  })

  describe('개인성 기반 후처리', () => {
    beforeEach(() => {
      advancedConversationSystem.initialize(null, {})
    })

    it('개인성 스타일을 적용할 수 있어야 함', () => {
      const response = '안녕하세요!'
      const processed = advancedConversationSystem.applyPersonalityPostprocessing(testCharacterId, response)

      expect(typeof processed).toBe('string')
      expect(processed.length).toBeGreaterThan(0)
    })

    it('응답이 수정되어야 함 (확률적)', () => {
      const response = '안녕하세요!'
      let modifiedCount = 0

      // 여러 번 시도 (확률적 테스트)
      for (let i = 0; i < 20; i++) {
        const processed = advancedConversationSystem.applyPersonalityPostprocessing(testCharacterId, response)
        if (processed !== response) {
          modifiedCount++
        }
      }

      // 적어도 몇 번은 수정되어야 함
      expect(modifiedCount).toBeGreaterThan(0)
    })
  })

  describe('대화 요약', () => {
    beforeEach(() => {
      advancedConversationSystem.initialize(null, {})
    })

    it('기본 대화 요약을 가져올 수 있어야 함', () => {
      const summary = advancedConversationSystem.getConversationSummary(testCharacterId)

      expect(summary).toBeDefined()
      expect(summary.messageCount).toBe(0)
      expect(summary.recentMessages).toEqual([])
    })
  })

  describe('시스템 중지', () => {
    it('시스템을 중지할 수 있어야 함', () => {
      advancedConversationSystem.initialize(null, {})
      advancedConversationSystem.stop()

      expect(advancedConversationSystem.isActive).toBe(false)
    })
  })
})