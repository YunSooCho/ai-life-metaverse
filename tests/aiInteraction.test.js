/**
 * AI 상호작용 시스템 테스트
 * - AI 캐릭터 2명 페르소나
 * - 대화 컨텍스트 관리
 * - 시스템 프롬프트 생성
 * - GLM-4.7 응답 생성
 * - AI 간 자동 상호작용
 */
import { describe, it, expect, beforeEach } from 'vitest'
import {
  AI_PERSONAS,
  createSystemPrompt,
  contextManager,
  conversationStateManager
} from '../backend/ai-agent/agent.js'

describe('AI 상호작용 시스템', () => {
  beforeEach(() => {
    // 컨텍스트 초기화
    contextManager.clearContext('ai-agent-1')
    contextManager.clearContext('ai-agent-2')
  })

  describe('AI 페르소나', () => {
    it('AI 유리 페르소나가 존재해야 함', () => {
      expect(AI_PERSONAS['ai-agent-1']).toBeDefined()
      expect(AI_PERSONAS['ai-agent-1'].name).toBe('AI 유리')
      expect(AI_PERSONAS['ai-agent-1'].age).toBe(22)
      expect(AI_PERSONAS['ai-agent-1'].gender).toBe('female')
    })

    it('AI 히카리 페르소나가 존재해야 함', () => {
      expect(AI_PERSONAS['ai-agent-2']).toBeDefined()
      expect(AI_PERSONAS['ai-agent-2'].name).toBe('AI 히카리')
      expect(AI_PERSONAS['ai-agent-2'].age).toBe(20)
      expect(AI_PERSONAS['ai-agent-2'].gender).toBe('female')
    })

    it('두 AI 캐릭터는 서로 다른 성격이어야 함', () => {
      expect(AI_PERSONAS['ai-agent-1'].personality)
        .not.toBe(AI_PERSONAS['ai-agent-2'].personality)
    })

    it('두 AI 캐릭터는 서로 다른 관심사를 가져야 함', () => {
      const interests1 = AI_PERSONAS['ai-agent-1'].interests
      const interests2 = AI_PERSONAS['ai-agent-2'].interests
      // 최소 하나 이상 다른 관심사
      const hasUnique = interests1.some(i => !interests2.includes(i))
      expect(hasUnique).toBe(true)
    })

    it('두 AI 캐릭터는 서로 다른 말하기 스타일이어야 함', () => {
      expect(AI_PERSONAS['ai-agent-1'].speakingStyle)
        .not.toBe(AI_PERSONAS['ai-agent-2'].speakingStyle)
    })
  })

  describe('시스템 프롬프트', () => {
    it('유리의 시스템 프롬프트가 올바르게 생성되어야 함', () => {
      const prompt = createSystemPrompt(AI_PERSONAS['ai-agent-1'])
      expect(prompt).toContain('AI 유리')
      expect(prompt).toContain('22')
      expect(prompt).toContain('AI 기술')
      expect(prompt).toContain('한국어')
    })

    it('히카리의 시스템 프롬프트가 올바르게 생성되어야 함', () => {
      const prompt = createSystemPrompt(AI_PERSONAS['ai-agent-2'])
      expect(prompt).toContain('AI 히카리')
      expect(prompt).toContain('20')
      expect(prompt).toContain('요리')
      expect(prompt).toContain('한국어')
    })

    it('프롬프트에 대화 규칙이 포함되어야 함', () => {
      const prompt = createSystemPrompt(AI_PERSONAS['ai-agent-1'])
      expect(prompt).toContain('대화 규칙')
      expect(prompt).toContain('메타버스')
      expect(prompt).toContain('100자')
    })
  })

  describe('채팅 컨텍스트 관리', () => {
    it('메시지를 추가하고 가져올 수 있어야 함', () => {
      contextManager.addMessage('ai-agent-1', 'user', '안녕하세요')
      const context = contextManager.getContext('ai-agent-1')
      expect(context).toHaveLength(1)
      expect(context[0].role).toBe('user')
      expect(context[0].content).toBe('안녕하세요')
    })

    it('최대 10개 메시지만 유지해야 함', () => {
      for (let i = 0; i < 15; i++) {
        contextManager.addMessage('ai-agent-1', 'user', `메시지 ${i}`)
      }
      const context = contextManager.getContext('ai-agent-1')
      expect(context).toHaveLength(10)
      expect(context[0].content).toBe('메시지 5') // 처음 5개는 삭제됨
    })

    it('캐릭터별 독립된 컨텍스트를 유지해야 함', () => {
      contextManager.addMessage('ai-agent-1', 'user', '유리에게')
      contextManager.addMessage('ai-agent-2', 'user', '히카리에게')
      
      expect(contextManager.getContext('ai-agent-1')[0].content).toBe('유리에게')
      expect(contextManager.getContext('ai-agent-2')[0].content).toBe('히카리에게')
    })

    it('컨텍스트 초기화가 가능해야 함', () => {
      contextManager.addMessage('ai-agent-1', 'user', '메시지')
      contextManager.clearContext('ai-agent-1')
      expect(contextManager.getContext('ai-agent-1')).toHaveLength(0)
    })

    it('타임스탬프가 포함되어야 함', () => {
      contextManager.addMessage('ai-agent-1', 'user', '시간 확인')
      const context = contextManager.getContext('ai-agent-1')
      expect(context[0].timestamp).toBeDefined()
      expect(typeof context[0].timestamp).toBe('number')
    })
  })

  describe('대화 상태 관리', () => {
    it('초기 대화 상태는 false여야 함', () => {
      expect(conversationStateManager.getConversingState('ai-agent-1')).toBe(false)
    })

    it('대화 상태를 변경할 수 있어야 함', () => {
      conversationStateManager.setConversingState('ai-agent-1', true)
      expect(conversationStateManager.getConversingState('ai-agent-1')).toBe(true)
    })

    it('대화 상태를 복원할 수 있어야 함', () => {
      conversationStateManager.setConversingState('ai-agent-1', true)
      conversationStateManager.setConversingState('ai-agent-1', false)
      expect(conversationStateManager.getConversingState('ai-agent-1')).toBe(false)
    })

    it('각 AI 캐릭터가 독립된 대화 상태를 가져야 함', () => {
      conversationStateManager.setConversingState('ai-agent-1', true)
      conversationStateManager.setConversingState('ai-agent-2', false)
      expect(conversationStateManager.getConversingState('ai-agent-1')).toBe(true)
      expect(conversationStateManager.getConversingState('ai-agent-2')).toBe(false)
    })

    it('마지막 메시지 시간을 업데이트할 수 있어야 함', () => {
      conversationStateManager.updateLastMessageTime('ai-agent-1')
      const state = conversationStateManager.states.get('ai-agent-1')
      expect(state.lastMessageTime).toBeDefined()
      expect(typeof state.lastMessageTime).toBe('number')
    })
  })

  describe('AI 페르소나 완전성', () => {
    it('모든 AI 페르소나가 필수 필드를 가져야 함', () => {
      const requiredFields = ['id', 'name', 'personality', 'speakingStyle', 'interests', 'dislikes', 'age', 'gender']
      
      Object.values(AI_PERSONAS).forEach(persona => {
        requiredFields.forEach(field => {
          expect(persona[field]).toBeDefined()
        })
      })
    })

    it('interests와 dislikes는 배열이어야 함', () => {
      Object.values(AI_PERSONAS).forEach(persona => {
        expect(Array.isArray(persona.interests)).toBe(true)
        expect(Array.isArray(persona.dislikes)).toBe(true)
        expect(persona.interests.length).toBeGreaterThan(0)
        expect(persona.dislikes.length).toBeGreaterThan(0)
      })
    })
  })
})
