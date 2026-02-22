/**
 * 맥락 관리자 테스트
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { contextManager, ConversationContext } from '../context-manager.js'

describe('ContextManager', () => {
  let testCharacterId

  beforeEach(() => {
    testCharacterId = 'test-character-1'
    // 새 맥락 초기화
    contextManager.context.cleanup()
  })

  describe('대화 컨텍스트', () => {
    it('새 컨텍스트가 생성되어야 함', () => {
      const context = contextManager.context.ensureConversation(testCharacterId)

      expect(context).toBeDefined()
      expect(context.messages).toEqual([])
      expect(context.conversationState).toBe('new')
    })

    it('메시지를 추가할 수 있어야 함', () => {
      contextManager.addMessage(testCharacterId, 'user', '안녕하세요!')

      const context = contextManager.context.ensureConversation(testCharacterId)

      expect(context.messages.length).toBe(1)
      expect(context.messages[0].senderRole).toBe('user')
      expect(context.messages[0].content).toBe('안녕하세요!')
    })

    it('여러 메시지를 추가할 수 있어야 함', () => {
      contextManager.addMessage(testCharacterId, 'user', '첫 메시지')
      contextManager.addMessage(testCharacterId, 'assistant', '응답')
      contextManager.addMessage(testCharacterId, 'user', '두 메시지')

      const context = contextManager.context.ensureConversation(testCharacterId)

      expect(context.messages.length).toBe(3)
    })

    it('최근 메시지 30개만 유지되어야 함', () => {
      // 35개 메시지 추가
      for (let i = 0; i < 35; i++) {
        contextManager.addMessage(testCharacterId, 'user', `메시지 ${i}`)
      }

      const context = contextManager.context.ensureConversation(testCharacterId)

      expect(context.messages.length).toBe(30)
    })
  })

  describe('대화 상태', () => {
    it('새 대화 상태를 감지해야 함', () => {
      const state = contextManager.getConversationState(testCharacterId)

      expect(state).toBe('new')
    })

    it('계속되는 대화 상태를 감지해야 함', () => {
      contextManager.addMessage(testCharacterId, 'user', '첫 메시지')
      const state = contextManager.getConversationState(testCharacterId)

      expect(state).toBe('continuing')
    })

    it('일시 정지 상태를 감지해야 함 (5분 이상)', () => {
      // 5분보다 작은 메시지 추가
      contextManager.addMessage(testCharacterId, 'user', '메시지', {
        timestamp: Date.now() - 4 * 60 * 1000
      })

      const state = contextManager.getConversationState(testCharacterId)

      expect(state).toBe('paused')
    })

    it('대화 재개 상태를 감지해야 함 (30분 이상)', () => {
      // 30분보다 작은 메시지 추가
      contextManager.addMessage(testCharacterId, 'user', '메시지', {
        timestamp: Date.now() - 35 * 60 * 1000
      })

      const state = contextManager.getConversationState(testCharacterId)

      expect(state).toBe('resumed')
    })
  })

  describe('메시지 가져오기', () => {
    beforeEach(() => {
      for (let i = 0; i < 15; i++) {
        contextManager.addMessage(testCharacterId, i % 2 === 0 ? 'user' : 'assistant', `메시지 ${i}`)
      }
    })

    it('최근 10개 메시지를 가져올 수 있어야 함', () => {
      const recent = contextManager.getRecentMessages(testCharacterId, 10)

      expect(recent.length).toBe(10)
      expect(recent[recent.length - 1].content).toBe('메시지 14')
    })

    it('지정된 개수의 메시지를 가져올 수 있어야 함', () => {
      const recent = contextManager.getRecentMessages(testCharacterId, 5)

      expect(recent.length).toBe(5)
    })
  })

  describe('플레이어 동작', () => {
    it('플레이어 동작을 기록할 수 있어야 함', () => {
      contextManager.context.recordPlayerAction(testCharacterId, 'greet', { type: 'wave' })

      const actions = contextManager.context.getPlayerActions(testCharacterId)

      expect(actions.length).toBe(1)
      expect(actions[0].type).toBe('greet')
    })

    it('여러 동작을 기록할 수 있어야 함', () => {
      contextManager.context.recordPlayerAction(testCharacterId, 'greet')
      contextManager.context.recordPlayerAction(testCharacterId, 'move')
      contextManager.context.recordPlayerAction(testCharacterId, 'compliment')

      const actions = contextManager.context.getPlayerActions(testCharacterId)

      expect(actions.length).toBe(3)
    })

    it('최근 동작 50개만 유지되어야 함', () => {
      for (let i = 0; i < 60; i++) {
        contextManager.context.recordPlayerAction(testCharacterId, `action-${i}`)
      }

      const actions = contextManager.context.getPlayerActions(testCharacterId)

      expect(actions.length).toBeLessThanOrEqual(50)
    })

    it('시간 윈도우 내의 동작만 필터링해야 함', () => {
      const now = Date.now()
      contextManager.context.recordPlayerAction(testCharacterId, 'old-action', { timestamp: now - 20 * 60 * 1000 })
      contextManager.context.recordPlayerAction(testCharacterId, 'new-action', { timestamp: now - 2 * 60 * 1000 })

      const actions = contextManager.context.getPlayerActions(testCharacterId, 10 * 60 * 1000) // 10분 윈도우

      expect(actions.length).toBe(1)
      expect(actions[0].type).toBe('new-action')
    })
  })

  describe('토픽 관리', () => {
    it('토픽을 기록할 수 있어야 함', () => {
      contextManager.context.recordTopic(testCharacterId, '음악')

      const topics = contextManager.context.getTopics(testCharacterId)

      expect(topics).toContain('음악')
    })

    it('여러 토픽을 기록할 수 있어야 함', () => {
      contextManager.context.recordTopic(testCharacterId, '음악')
      contextManager.context.recordTopic(testCharacterId, '게임')
      contextManager.context.recordTopic(testCharacterId, '여행')

      const topics = contextManager.context.getTopics(testCharacterId)

      expect(topics.length).toBe(3)
      expect(topics).toContain('음악')
      expect(topics).toContain('게임')
      expect(topics).toContain('여행')
    })

    it('중복 토픽은 저장하지 않아야 함', () => {
      contextManager.context.recordTopic(testCharacterId, '음악')
      contextManager.context.recordTopic(testCharacterId, '음악')
      contextManager.context.recordTopic(testCharacterId, '음악')

      const topics = contextManager.context.getTopics(testCharacterId)

      expect(topics.length).toBe(1)
    })

    it('현재 토픽을 설정할 수 있어야 함', () => {
      contextManager.setCurrentTopic(testCharacterId, '여행')

      const currentTopic = contextManager.getCurrentTopic(testCharacterId)

      expect(currentTopic).toBe('여행')
    })
  })

  describe('대화 분위기 분석', () => {
    it('긍정적인 대화를 감지해야 함', () => {
      contextManager.addMessage(testCharacterId, 'user', '오늘 정말 좋아! 행복해!')
      contextManager.addMessage(testCharacterId, 'assistant', '저도 기뻐요!')
      contextManager.addMessage(testCharacterId, 'user', '최고라니까요!')

      const mood = contextManager.context.analyzeConversationMood(testCharacterId)

      expect(mood).toBe('positive')
    })

    it('부정적인 대화를 감지해야 함', () => {
      contextManager.addMessage(testCharacterId, 'user', '슬퍼... 힘들어')
      contextManager.addMessage(testCharacterId, 'assistant', '미안해요')
      contextManager.addMessage(testCharacterId, 'user', '정말 괴로워')

      const mood = contextManager.context.analyzeConversationMood(testCharacterId)

      expect(mood).toBe('negative')
    })

    it('중립적인 대화를 감지해야 함', () => {
      contextManager.addMessage(testCharacterId, 'user', '안녕하세요')
      contextManager.addMessage(testCharacterId, 'assistant', '반가워요')
      contextManager.addMessage(testCharacterId, 'user', '시간이 몇 시죠?')

      const mood = contextManager.context.analyzeConversationMood(testCharacterId)

      expect(mood).toBe('neutral')
    })

    it('메시지가 없으면 neutral을 반환해야 함', () => {
      const mood = contextManager.context.analyzeConversationMood('unknown-character')

      expect(mood).toBe('neutral')
    })
  })

  describe('맥락 프롬프트', () => {
    it('맥락 프롬프트를 생성할 수 있어야 함', () => {
      const prompt = contextManager.generateContextPrompt(testCharacterId, '안녕하세요!')

      expect(typeof prompt).toBe('string')
      expect(prompt.length).toBeGreaterThan(0)
      expect(prompt).toContain('[대화 맥락]')
    })

    it('대화 상태를 포함해야 함', () => {
      const prompt = contextManager.generateContextPrompt(testCharacterId, '안녕하세요!')

      expect(prompt).toContain('대화 상태')
    })

    it('시간대를 포함해야 함', () => {
      const prompt = contextManager.generateContextPrompt(testCharacterId, '안녕하세요!')

      expect(prompt).toContain('시간대')
    })

    it('위치를 설정하면 포함해야 함', () => {
      contextManager.setLocation('공원')
      const prompt = contextManager.generateContextPrompt(testCharacterId, '안녕하세요!')

      expect(prompt).toContain('현재 위치')
      expect(prompt).toContain('공원')
    })
  })

  describe('대화 요약', () => {
    beforeEach(() => {
      contextManager.addMessage(testCharacterId, 'user', '안녕하세요')
      contextManager.addMessage(testCharacterId, 'assistant', '반가워요!')
      contextManager.context.recordTopic(testCharacterId, '인사')
      contextManager.context.recordPlayerAction(testCharacterId, 'greet')
    })

    it('대화 요약을 생성할 수 있어야 함', () => {
      const summary = contextManager.getConversationSummary(testCharacterId)

      expect(summary).toBeDefined()
      expect(summary.messageCount).toBe(2)
      expect(summary.topics).toContain('인사')
      expect(summary.recentActions).toBeDefined()
    })
  })

  describe('초기화', () => {
    it('대화 컨텍스트를 초기화할 수 있어야 함', () => {
      contextManager.addMessage(testCharacterId, 'user', '메시지')
      contextManager.context.clearConversation(testCharacterId)

      const context = contextManager.context.ensureConversation('new-character')

      expect(context.messages.length).toBe(0)
    })

    it('전체 컨텍스트를 초기화할 수 있어야 함', () => {
      contextManager.addMessage(testCharacterId, 'user', '메시지')
      contextManager.context.recordTopic(testCharacterId, '토픽')
      contextManager.context.cleanup()

      expect(contextManager.context.conversations.size).toBe(0)
      expect(contextManager.context.topics.size).toBe(0)
    })
  })
})