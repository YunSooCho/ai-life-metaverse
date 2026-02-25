/**
 * AI Agent 테스트
 *
 * 테스트 항목:
 * - ChatContextManager 기능
 * - ConversationStateManager 기능
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  contextManager,
  conversationStateManager,
  createSystemPrompt,
  AI_PERSONAS
} from './agent.js'

// Mock fetch 함수
global.fetch = vi.fn()

describe('ChatContextManager', () => {
  beforeEach(() => {
    contextManager.clearContext('test-char-1')
  })

  it('컨텍스트에 메시지를 추가할 수 있어야 함', () => {
    contextManager.addMessage('test-char-1', 'user', '안녕하세요')
    contextManager.addMessage('test-char-1', 'assistant', '반가워요!')

    const context = contextManager.getContext('test-char-1')
    expect(context).toHaveLength(2)
    expect(context[0]).toEqual({
      role: 'user',
      content: '안녕하세요',
      timestamp: expect.any(Number)
    })
    expect(context[1]).toEqual({
      role: 'assistant',
      content: '반가워요!',
      timestamp: expect.any(Number)
    })
  })

  it('최근 10개 메시지만 유지해야 함', () => {
    // 15개 메시지 추가
    for (let i = 1; i <= 15; i++) {
      contextManager.addMessage('test-char-1', 'user', `메시지 ${i}`)
    }

    const context = contextManager.getContext('test-char-1')
    expect(context).toHaveLength(10)
    expect(context[0].content).toBe('메시지 6') // 마지막 10개만 유지
    expect(context[9].content).toBe('메시지 15')
  })

  it('존재하지 않는 캐릭터의 컨텍스트는 빈 배열을 반환해야 함', () => {
    const context = contextManager.getContext('non-existent-char')
    expect(context).toEqual([])
  })

  it('컨텍스트를 초기화할 수 있어야 함', () => {
    contextManager.addMessage('test-char-1', 'user', '테스트 메시지')
    expect(contextManager.getContext('test-char-1')).toHaveLength(1)

    contextManager.clearContext('test-char-1')
    expect(contextManager.getContext('test-char-1')).toEqual([])
  })
})

describe('ConversationStateManager', () => {
  beforeEach(() => {
    // 모든 상태 초기화
    conversationStateManager.states.clear()
  })

  it('대화 상태를 설정할 수 있어야 함', () => {
    conversationStateManager.setConversingState('ai-char-1', true)
    expect(conversationStateManager.getConversingState('ai-char-1')).toBe(true)

    conversationStateManager.setConversingState('ai-char-1', false)
    expect(conversationStateManager.getConversingState('ai-char-1')).toBe(false)
  })

  it('존재하지 않는 캐릭터의 대화 상태는 false를 반환해야 함', () => {
    expect(conversationStateManager.getConversingState('non-existent')).toBe(false)
  })

  it('마지막 메시지 시간을 업데이트할 수 있어야 함', () => {
    conversationStateManager.updateLastMessageTime('ai-char-1')
    const state = conversationStateManager.states.get('ai-char-1')
    expect(state.lastMessageTime).toBeGreaterThan(0)
  })
})

describe('createSystemPrompt', () => {
  it('AI 캐릭터의 Persona로 시스템 프롬프트를 생성해야 함', () => {
    const persona = AI_PERSONAS['ai-agent-1']
    const systemPrompt = createSystemPrompt(persona)

    expect(systemPrompt).toContain('AI 유리')
    expect(systemPrompt).toContain('22')
    expect(systemPrompt).toContain('친절하고 호기심 많으며')
    expect(systemPrompt).toContain('존댓말을 쓰고')
    expect(systemPrompt).toContain('AI 기술')
    expect(systemPrompt).toContain('무례한 행동')
    expect(systemPrompt).toContain('대화 규칙')
  })

  it('Persona가 없으면 에러를 발생시켜야 함', () => {
    expect(() => {
      createSystemPrompt(null)
    }).toThrow()
  })
})

describe('AI_PERSONAS', () => {
  it('ai-agent-1 캐릭터의 Persona가 정의되어 있어야 함', () => {
    const persona = AI_PERSONAS['ai-agent-1']

    expect(persona).toBeDefined()
    expect(persona.id).toBe('ai-agent-1')
    expect(persona.name).toBe('AI 유리')
    expect(persona.age).toBe(22)
    expect(persona.gender).toBe('female')
    expect(persona.personality).toBeDefined()
    expect(persona.speakingStyle).toBeDefined()
    expect(persona.interests).toBeDefined()
    expect(persona.dislikes).toBeDefined()
  })

  it('관심사와 싫어하는 것이 배열로 정의되어 있어야 함', () => {
    const persona = AI_PERSONAS['ai-agent-1']

    expect(Array.isArray(persona.interests)).toBe(true)
    expect(Array.isArray(persona.dislikes)).toBe(true)
    expect(persona.interests.length).toBeGreaterThan(0)
    expect(persona.dislikes.length).toBeGreaterThan(0)
  })
})

describe('generateChatResponse - Simple Response (No API Key)', () => {
  beforeEach(() => {
    // API 키를 없게 설정
    process.env.CEREBRAS_API_KEY = ''
    global.fetch.mockReset()
  })

  it('API 키가 없으면 간단한 응답을 반환해야 함', async () => {
    // fetch는 호출되지 않아야 함
    const { generateChatResponse } = await import('./agent.js')

    const response = await generateChatResponse('ai-agent-1', '안녕하세요')

    expect(response).toBeDefined()
    expect(typeof response).toBe('string')
    expect(response.length).toBeGreaterThan(0)
    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('존재하지 않는 캐릭터 ID면 null을 반환해야 함', async () => {
    const { generateChatResponse } = await import('./agent.js')

    const response = await generateChatResponse('non-existent', '안녕하세요')
    expect(response).toBeNull()
  })
})