/**
 * Reaction System 테스트
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  ReactionSystem,
  reactionSystem,
  TIME_OF_DAY,
  getCurrentTimeOfDay,
  TIME_OF_DAY_GREETINGS,
  TIME_OF_DAY_CONVERSATIONS,
  GIFT_REACTIONS,
  QUEST_COMPLETION_REACTIONS,
  SPECIAL_EVENT_REACTIONS
} from '../ai-agent/reaction-system.js'

describe('ReactionSystem', () => {
  let system

  beforeEach(() => {
    system = new ReactionSystem()
  })

  describe('시간대별 인사', () => {
    it('시간대별 인사 리액션 반환', () => {
      const reaction = system.getTimeOfDayGreeting('ai-agent-1')

      expect(reaction.timeOfDay).toBeDefined()
      expect(reaction.greeting).toBeDefined()
      expect(reaction.icon).toBeDefined()
    })

    it('시간대 아이콘 포함', () => {
      const reaction = system.getTimeOfDayGreeting('ai-agent-1')
      expect(['🌅', '☀️', '🍽️', '🌤️', '🌆', '🌙']).toContain(reaction.icon)
    })
  })

  describe('시간대별 대화', () => {
    it('시간대별 대화 리액션 반환', () => {
      const reaction = system.getTimeOfDayConversation('ai-agent-1')

      expect(reaction.timeOfDay).toBeDefined()
      expect(reaction.conversation).toBeDefined()
      expect(reaction.icon).toBeDefined()
    })

    it('대화 내용 포함', () => {
      const reaction = system.getTimeOfDayConversation('ai-agent-1')
      expect(reaction.conversation.length).toBeGreaterThan(0)
    })
  })

  describe('선물 기여 반응', () => {
    it('COMMON 선물 반응', () => {
      const reaction = system.getGiftReaction('ai-agent-1', 'COMMON')

      expect(reaction.type).toBe('gift')
      expect(reaction.rarity).toBe('COMMON')
      expect(reaction.reaction).toBeDefined()
      expect(reaction.reaction.length).toBeGreaterThan(0)
    })

    it('RARE 선물 반응', () => {
      const reaction = system.getGiftReaction('ai-agent-1', 'RARE')

      expect(reaction.rarity).toBe('RARE')
      expect(reaction.reaction).toBeDefined()
    })

    it('EPIC 선물 반응', () => {
      const reaction = system.getGiftReaction('ai-agent-1', 'EPIC')

      expect(reaction.rarity).toBe('EPIC')
      expect(reaction.reaction).toBeDefined()
    })

    it('잘못된 레어리티는 기본값 사용', () => {
      const reaction = system.getGiftReaction('ai-agent-1', 'LEGENDARY')

      expect(reaction.rarity).toBe('LEGENDARY')
      expect(reaction.reaction).toBeDefined()
    })
  })

  describe('퀘스트 완료 반응', () => {
    it('EASY 퀘스트 반응', () => {
      const reaction = system.getQuestCompletionReaction('ai-agent-1', 'EASY')

      expect(reaction.type).toBe('quest_completion')
      expect(reaction.difficulty).toBe('EASY')
      expect(reaction.reaction).toBeDefined()
    })

    it('NORMAL 퀘스트 반응', () => {
      const reaction = system.getQuestCompletionReaction('ai-agent-1', 'NORMAL')
      expect(reaction.difficulty).toBe('NORMAL')
    })

    it('HARD 퀘스트 반응', () => {
      const reaction = system.getQuestCompletionReaction('ai-agent-1', 'HARD')
      expect(reaction.difficulty).toBe('HARD')
    })

    it('LEGENDARY 퀘스트 반응', () => {
      const reaction = system.getQuestCompletionReaction('ai-agent-1', 'LEGENDARY')
      expect(reaction.difficulty).toBe('LEGENDARY')
    })
  })

  describe('특별 이벤트 반응', () => {
    it('LEVEL_UP 반응', () => {
      const reaction = system.getSpecialEventReaction('ai-agent-1', 'LEVEL_UP')

      expect(reaction).not.toBeNull()
      expect(reaction.type).toBe('special_event')
      expect(reaction.eventType).toBe('LEVEL_UP')
      expect(reaction.reaction).toBeDefined()
    })

    it('NEW_RECORD 반응', () => {
      const reaction = system.getSpecialEventReaction('ai-agent-1', 'NEW_RECORD')
      expect(reaction.eventType).toBe('NEW_RECORD')
    })

    it('ACHIEVEMENT 반응', () => {
      const reaction = system.getSpecialEventReaction('ai-agent-1', 'ACHIEVEMENT')
      expect(reaction.eventType).toBe('ACHIEVEMENT')
    })

    it('존재하지 않는 이벤트 타입은 null 반환', () => {
      const reaction = system.getSpecialEventReaction('ai-agent-1', 'UNKNOWN')
      expect(reaction).toBeNull()
    })
  })

  describe('관계 기반 커스텀 리액션', () => {
    it('베프 반응 (80~100)', () => {
      for (let affinity = 80; affinity <= 100; affinity += 10) {
        const reaction = system.getRelationshipReaction('ai-agent-1', 'player1', affinity)
        expect(reaction).toBeDefined()
        expect(reaction.length).toBeGreaterThan(0)
      }
    })

    it('좋은 친구 반응 (60~79)', () => {
      for (let affinity = 60; affinity <= 79; affinity += 10) {
        const reaction = system.getRelationshipReaction('ai-agent-1', 'player1', affinity)
        expect(reaction).toBeDefined()
      }
    })

    it('친구 반응 (40~59)', () => {
      for (let affinity = 40; affinity <= 59; affinity += 10) {
        const reaction = system.getRelationshipReaction('ai-agent-1', 'player1', affinity)
        expect(reaction).toBeDefined()
      }
    })

    it('지인/낯선 사람 반응 (0~39)', () => {
      for (let affinity = 0; affinity <= 39; affinity += 10) {
        const reaction = system.getRelationshipReaction('ai-agent-1', 'player1', affinity)
        expect(reaction).toBeDefined()
      }
    })
  })

  describe('리액션 히스토리', () => {
    it('리액션 히스토리에 추가', () => {
      const reaction = { type: 'gift', reaction: '감사합니다!' }
      system.addReactionToHistory('ai-agent-1', reaction)

      const history = system.getReactionHistory('ai-agent-1')
      expect(history.length).toBe(1)
      expect(history[0].type).toBe('gift')
      expect(history[0].reaction).toBe('감사합니다!')
      expect(history[0].timestamp).toBeDefined()
    })

    it('여러 리액션 추가', () => {
      system.addReactionToHistory('ai-agent-1', { type: 'gift', reaction: '감사합니다!' })
      system.addReactionToHistory('ai-agent-1', { type: 'quest', reaction: '축하해요!' })

      const history = system.getReactionHistory('ai-agent-1')
      expect(history.length).toBe(2)
    })

    it('최근 20개만 유지', () => {
      for (let i = 0; i < 25; i++) {
        system.addReactionToHistory('ai-agent-1', { type: 'test', reaction: `Reaction ${i}` })
      }

      const history = system.getReactionHistory('ai-agent-1')
      expect(history.length).toBe(20)
      expect(history[0].reaction).toBe('Reaction 5') // 첫 5개 제거
    })

    it('리액션 히스토리 초기화', () => {
      system.addReactionToHistory('ai-agent-1', { type: 'gift', reaction: '감사합니다!' })
      system.clearReactionHistory('ai-agent-1')

      const history = system.getReactionHistory('ai-agent-1')
      expect(history.length).toBe(0)
    })
  })
})

describe('getCurrentTimeOfDay', () => {
  it('현재 시간대 반환', () => {
    const timeOfDay = getCurrentTimeOfDay()
    expect(timeOfDay).toBeDefined()
    expect(timeOfDay.name).toBeDefined()
    expect(timeOfDay.start).toBeDefined()
    expect(timeOfDay.end).toBeDefined()
    expect(timeOfDay.icon).toBeDefined()
  })

  it('유효한 시간대 반환', () => {
    const timeOfDay = getCurrentTimeOfDay()
    expect(['DAWN', 'MORNING', 'LUNCH', 'AFTERNOON', 'EVENING', 'NIGHT']).toContain(timeOfDay.key)
  })
})

describe('TIME_OF_DAY 상수', () => {
  it('모든 시간대 정의됨', () => {
    expect(TIME_OF_DAY.DAWN).toBeDefined()
    expect(TIME_OF_DAY.MORNING).toBeDefined()
    expect(TIME_OF_DAY.LUNCH).toBeDefined()
    expect(TIME_OF_DAY.AFTERNOON).toBeDefined()
    expect(TIME_OF_DAY.EVENING).toBeDefined()
    expect(TIME_OF_DAY.NIGHT).toBeDefined()
  })

  it('시간대 아이콘 포함', () => {
    expect(TIME_OF_DAY.DAWN.icon).toBe('🌅')
    expect(TIME_OF_DAY.MORNING.icon).toBe('☀️')
    expect(TIME_OF_DAY.LUNCH.icon).toBe('🍽️')
    expect(TIME_OF_DAY.AFTERNOON.icon).toBe('🌤️')
    expect(TIME_OF_DAY.EVENING.icon).toBe('🌆')
    expect(TIME_OF_DAY.NIGHT.icon).toBe('🌙')
  })
})

describe('리액션 상수', () => {
  it('시간대별 인사 정의됨', () => {
    expect(TIME_OF_DAY_GREETINGS.DAWN).toBeDefined()
    expect(TIME_OF_DAY_GREETINGS.DAWN.length).toBeGreaterThan(0)
  })

  it('시간대별 대화 정의됨', () => {
    expect(TIME_OF_DAY_CONVERSATIONS.MORNING).toBeDefined()
    expect(TIME_OF_DAY_CONVERSATIONS.MORNING.length).toBeGreaterThan(0)
  })

  it('선물 반응 정의됨', () => {
    expect(GIFT_REACTIONS.COMMON).toBeDefined()
    expect(GIFT_REACTIONS.RARE).toBeDefined()
    expect(GIFT_REACTIONS.EPIC).toBeDefined()
  })

  it('퀘스트 완료 반응 정의됨', () => {
    expect(QUEST_COMPLETION_REACTIONS.EASY).toBeDefined()
    expect(QUEST_COMPLETION_REACTIONS.NORMAL).toBeDefined()
    expect(QUEST_COMPLETION_REACTIONS.HARD).toBeDefined()
    expect(QUEST_COMPLETION_REACTIONS.LEGENDARY).toBeDefined()
  })

  it('특별 이벤트 반응 정의됨', () => {
    expect(SPECIAL_EVENT_REACTIONS.LEVEL_UP).toBeDefined()
    expect(SPECIAL_EVENT_REACTIONS.NEW_RECORD).toBeDefined()
    expect(SPECIAL_EVENT_REACTIONS.ACHIEVEMENT).toBeDefined()
  })
})

describe('싱글톤 인스턴스', () => {
  it('reactionSystem 싱글톤 동작', () => {
    const reaction = reactionSystem.getGiftReaction('player1', 'COMMON')
    expect(reaction.type).toBe('gift')

    reactionSystem.addReactionToHistory('player1', reaction)
    const history = reactionSystem.getReactionHistory('player1')
    expect(history.length).toBe(1)

    reactionSystem.clearReactionHistory('player1')
    expect(reactionSystem.getReactionHistory('player1').length).toBe(0)
  })
})