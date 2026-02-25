import { describe, it, expect, beforeEach } from 'vitest'
import { ChatContext } from '../ai-agent/chat-context.js'

describe('ChatContext', () => {
  let chatContext

  beforeEach(() => {
    chatContext = new ChatContext(10)
  })

  describe('대화 히스토리 관리', () => {
    it('메시지를 추가하고 조회할 수 있어야 함', () => {
      chatContext.addMessage('char1', 'User1', '안녕!', false)
      const history = chatContext.getHistory('char1')

      expect(history).toHaveLength(1)
      expect(history[0].sender).toBe('User1')
      expect(history[0].message).toBe('안녕!')
      expect(history[0].isFromMe).toBe(false)
    })

    it('최근 N개의 메시지만 유지해야 함', () => {
      for (let i = 0; i < 15; i++) {
        chatContext.addMessage('char1', 'User1', `메시지 ${i}`, false)
      }

      const history = chatContext.getHistory('char1')
      expect(history).toHaveLength(10)
      expect(history[0].message).toBe('메시지 5')
    })

    it('AI의 응답도 히스토리에 추가해야 함', () => {
      chatContext.addMessage('char1', 'User1', '안녕!', false)
      chatContext.addMessage('char1', 'AI 유리', '반가워요!', true)

      const history = chatContext.getHistory('char1')
      expect(history).toHaveLength(2)
      expect(history[0].isFromMe).toBe(false)
      expect(history[1].isFromMe).toBe(true)
    })

    it('여러 캐릭터와 독립된 히스토리 유지해야 함', () => {
      chatContext.addMessage('char1', 'User1', '메시지 1', false)
      chatContext.addMessage('char2', 'User2', '메시지 2', false)

      expect(chatContext.getHistory('char1')).toHaveLength(1)
      expect(chatContext.getHistory('char2')).toHaveLength(1)
    })
  })

  describe('호감도 관리', () => {
    it('호감도를 설정하고 조회할 수 있어야 함', () => {
      chatContext.setAffinity('char1', 75)
      expect(chatContext.getAffinity('char1')).toBe(75)
    })

    it('기본 호감도는 50이어야 함', () => {
      expect(chatContext.getAffinity('char1')).toBe(50)
    })
  })

  describe('프롬프트 생성', () => {
    it('히스토리가 없을 때 첫 만남 프롬프트 생성', () => {
      const prompt = chatContext.to_prompt('char1', 'AI 유리')

      expect(prompt).toContain('현재 호감도: 50/100')
      expect(prompt).toContain('이전 대화 없음 (첫 만남)')
    })

    it('히스토리가 있을 때 대화 히스토리 포함 프롬프트 생성', () => {
      chatContext.addMessage('char1', 'User1', '안녕!', false)
      chatContext.addMessage('char1', 'AI 유리', '반가워요!', true)

      const prompt = chatContext.to_prompt('char1', 'AI 유리')

      expect(prompt).toContain('최근 대화 히스토리:')
      expect(prompt).toContain('User1: "안녕!"')
      expect(prompt).toContain('AI 유리: "반가워요!"')
    })
  })

  describe('히스토리 초기화', () => {
    it('특정 캐릭터의 히스토리만 초기화할 수 있어야 함', () => {
      chatContext.addMessage('char1', 'User1', '메시지 1', false)
      chatContext.addMessage('char2', 'User2', '메시지 2', false)

      chatContext.clearHistory('char1')

      expect(chatContext.getHistory('char1')).toHaveLength(0)
      expect(chatContext.getHistory('char2')).toHaveLength(1)
    })

    it('모든 히스토리를 초기화할 수 있어야 함', () => {
      chatContext.addMessage('char1', 'User1', '메시지 1', false)
      chatContext.addMessage('char2', 'User2', '메시지 2', false)

      chatContext.clearHistory()

      expect(chatContext.getHistory('char1')).toHaveLength(0)
      expect(chatContext.getHistory('char2')).toHaveLength(0)
    })
  })
})