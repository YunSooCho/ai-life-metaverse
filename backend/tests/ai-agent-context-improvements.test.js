/**
 * AI Agent 대화 시스템 개선 테스트
 *
 * 테스트 항목:
 * - ChatContextManager 시간 기반 필터링
 * - 대화 상태 감지 (new/resumed/continuing)
 * - 시스템 프롬프트 생성 (상태 기반)
 * - 전환 문구 자동 추가
 */

// Vitest 테스팅 프레임워크 사용
import { describe, it, expect, beforeEach, beforeAll } from 'vitest'

// AI Agent 모듈 로드 (이전에 구현된 테스트와 동일한 방식)
let contextManager, createSystemPrompt, AI_PERSONAS

describe('AI Agent 대화 시스템 개선', () => {
  beforeAll(async () => {
    // 모듈을 dynamic import하여 테스트
    const agentModule = await import('../ai-agent/agent.js')
    contextManager = agentModule.contextManager
    createSystemPrompt = agentModule.createSystemPrompt
    AI_PERSONAS = agentModule.AI_PERSONAS
  })

  describe('ChatContextManager 시간 기반 필터링', () => {
    const TEST_CHARACTER_ID = 'test-character-1'

    beforeEach(() => {
      contextManager.clearContext(TEST_CHARACTER_ID)
    })

    it('[TC01] 기본 컨텍스트 저장 및 조회', () => {
      contextManager.addMessage(TEST_CHARACTER_ID, 'user', '안녕하세요')
      contextManager.addMessage(TEST_CHARACTER_ID, 'assistant', '안녕하세요! 만나서 반가워요! 👋')

      const context = contextManager.getContext(TEST_CHARACTER_ID)
      expect(context.length).toBe(2)
      expect(context[0].role).toBe('user')
      expect(context[1].role).toBe('assistant')
    })

    it('[TC02] 최근 10개 메시지만 유지', () => {
      // 15개 메시지 추가
      for (let i = 0; i < 15; i++) {
        contextManager.addMessage(TEST_CHARACTER_ID, 'user', `메시지 ${i}`)
      }

      const context = contextManager.getContext(TEST_CHARACTER_ID)
      expect(context.length).toBe(10) // 최근 10개만 유지
      expect(context[0].content).toBe('메시지 5') // 가장 오래된 메시지는 index 5
    })

    it('[TC03] 시간 기반 필터링 (5분 이내 메시지만 반환)', () => {
      const now = Date.now()

      // 오래된 메시지 (6분 전)
      contextManager.contexts.set(TEST_CHARACTER_ID, [
        { role: 'user', content: '오래된 메시지1', timestamp: now - (6 * 60 * 1000) },
        { role: 'assistant', content: '오래된 메시지2', timestamp: now - (5.5 * 60 * 1000) }
      ])

      // 최근 메시지 (1분 전)
      contextManager.addMessage(TEST_CHARACTER_ID, 'user', '최근 메시지')

      const context = contextManager.getContext(TEST_CHARACTER_ID)
      expect(context.length).toBe(1) // 최근 메시지만 반환
      expect(context[0].content).toBe('최근 메시지')
    })

    it('[TC04] 컨텍스트 전부가 오래된 경우 빈 배열 반환', () => {
      const now = Date.now()
      contextManager.contexts.set(TEST_CHARACTER_ID, [
        { role: 'user', content: '오래된 메시지', timestamp: now - (10 * 60 * 1000) }
      ])

      const context = contextManager.getContext(TEST_CHARACTER_ID)
      expect(context.length).toBe(0)
    })
  })

  describe('대화 상태 감지 (Conversation State)', () => {
    const TEST_CHARACTER_ID = 'test-character-2'

    beforeEach(() => {
      contextManager.clearContext(TEST_CHARACTER_ID)
    })

    it('[TC05] 새 대화 상태 감지 (컨텍스트가 없는 경우)', () => {
      const state = contextManager.getConversationState(TEST_CHARACTER_ID)
      expect(state).toBe('new')
    })

    it('[TC06] 계속되는 대화 상태 감지 (최근 1분 이내)', () => {
      const now = Date.now()

      // 최근 1분 전 메시지
      contextManager.addMessage(TEST_CHARACTER_ID, 'user', '안녕하세요')
      // 현재 시간으로 설정 (contextManager가 자동으로 현재 시간 사용)
      contextManager.contexts.set(TEST_CHARACTER_ID, [
        { role: 'user', content: '안녕하세요', timestamp: now - (1 * 60 * 1000) }
      ])
      contextManager.addMessage(TEST_CHARACTER_ID, 'assistant', '반가워요!')

      const state = contextManager.getConversationState(TEST_CHARACTER_ID)
      expect(state).toBe('continuing')
    })

    it('[TC07] 이어지는 대화 상태 감지 (5분이 지난 경우)', () => {
      const now = Date.now()

      // 6분 전 메시지
      contextManager.contexts.set(TEST_CHARACTER_ID, [
        { role: 'user', content: '안녕하세요', timestamp: now - (6 * 60 * 1000) },
        { role: 'assistant', content: '반가워요!', timestamp: now - (5.5 * 60 * 1000) }
      ])

      const state = contextManager.getConversationState(TEST_CHARACTER_ID)
      expect(state).toBe('resumed')
    })

    it('[TC08] 마지막 토픽 추출', () => {
      contextManager.addMessage(TEST_CHARACTER_ID, 'user', '날씨가 좋네요')
      contextManager.addMessage(TEST_CHARACTER_ID, 'assistant', '네, 정말 좋아요! ☀️')
      contextManager.addMessage(TEST_CHARACTER_ID, 'user', '오늘 뭐 할까요?')

      const lastTopic = contextManager.getLastTopic(TEST_CHARACTER_ID)
      expect(lastTopic).toBe('오늘 뭐 할까요?')
    })

    it('[TC09] 마지막 토픽이 없는 경우 null 반환', () => {
      contextManager.addMessage(TEST_CHARACTER_ID, 'assistant', '안녕하세요!')

      const lastTopic = contextManager.getLastTopic(TEST_CHARACTER_ID)
      expect(lastTopic).toBe(null)
    })
  })

  describe('시스템 프롬프트 생성 (상태 기반)', () => {
    it('[TC10] 새 대화 상태 프롬프트 생성', () => {
      const persona = AI_PERSONAS['ai-agent-1']
      const prompt = createSystemPrompt(persona, 'new')

      expect(prompt).toContain('AI 유리')
      expect(prompt).toContain('친절하고 호기심 많으며')
      expect(prompt).toContain('[대화 시작]')
      expect(prompt).toContain('상대방과 처음 대화하는 상황')
      expect(prompt).toContain('친절하게 인사하고 자신을 소개하세요')
    })

    it('[TC11] 이어지는 대화 상태 프롬프트 생성', () => {
      const persona = AI_PERSONAS['ai-agent-1']
      const prompt = createSystemPrompt(persona, 'resumed')

      expect(prompt).toContain('[대화 재개]')
      expect(prompt).toContain('오랜만에 상대방과 다시 대화하는 상황')
      expect(prompt).toContain('오랜만 인사나 상태 여부를 물어보며')
    })

    it('[TC12] 계속되는 대화 상태 프롬프트 생성', () => {
      const persona = AI_PERSONAS['ai-agent-1']
      const prompt = createSystemPrompt(persona, 'continuing')

      expect(prompt).toContain('[대화 중]')
      expect(prompt).toContain('계속 이어지는 대화 상황')
      expect(prompt).toContain('이전 대화 맥락을 고려하여')
    })

    it('[TC13] 기본 대화 상태 (기본값: continuing)', () => {
      const persona = AI_PERSONAS['ai-agent-1']
      const prompt = createSystemPrompt(persona)

      expect(prompt).toContain('[대화 중]')
      expect(prompt).toContain('계속 이어지는 대화 상황')
    })
  })
})