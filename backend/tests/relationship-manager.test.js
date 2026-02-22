/**
 * Relationship Manager 테스트
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { RelationshipManager, relationshipManager, RELATIONSHIP_LEVELS, CONVERSATION_STYLES } from '../ai-agent/relationship-manager.js'

describe('RelationshipManager', () => {
  let manager

  beforeEach(() => {
    manager = new RelationshipManager()
  })

  describe('관계 ID 생성', () => {
    it('동일 쌍에 대해 동일한 ID 반환', () => {
      const id1 = manager._getRelationshipId('char1', 'char2')
      const id2 = manager._getRelationshipId('char2', 'char1')
      expect(id1).toBe(id2)
      expect(id1).toBe('char1-char2')
    })
  })

  describe('친밀도 관리', () => {
    it('새 관계 초기화 - AI 캐릭터', () => {
      const affinity = manager.getAffinity('ai-agent-1', 'player1')
      expect(affinity).toBe(30)
    })

    it('새 관계 초기화 - 플레이어', () => {
      const affinity = manager.getAffinity('player1', 'player2')
      expect(affinity).toBe(0)
    })

    it('친밀도 변경', () => {
      manager.setAffinity('char1', 'char2', 50)
      expect(manager.getAffinity('char1', 'char2')).toBe(50)
    })

    it('친밀도 증감', () => {
      manager.setAffinity('char1', 'char2', 50)
      manager.changeAffinity('char1', 'char2', 10)
      expect(manager.getAffinity('char1', 'char2')).toBe(60)

      manager.changeAffinity('char1', 'char2', -20)
      expect(manager.getAffinity('char1', 'char2')).toBe(40)
    })

    it('친밀도 범위 제한 (0~100)', () => {
      manager.setAffinity('char1', 'char2', 150)
      expect(manager.getAffinity('char1', 'char2')).toBe(100)

      manager.changeAffinity('char1', 'char2', -200)
      expect(manager.getAffinity('char1', 'char2')).toBe(0)
    })
  })

  describe('관계 레벨', () => {
    it('낯선 사람 (0-19)', () => {
      manager.setAffinity('char1', 'char2', 10)
      const level = manager.getRelationshipLevel('char1', 'char2')
      expect(level.key).toBe('STRANGER')
      expect(level.name).toBe('낯선 사람')
      expect(level.color).toBe('#9E9E9E')
    })

    it('지인 (20-39)', () => {
      manager.setAffinity('char1', 'char2', 30)
      const level = manager.getRelationshipLevel('char1', 'char2')
      expect(level.key).toBe('ACQUAINTANCE')
      expect(level.name).toBe('지인')
    })

    it('친구 (40-59)', () => {
      manager.setAffinity('char1', 'char2', 50)
      const level = manager.getRelationshipLevel('char1', 'char2')
      expect(level.key).toBe('FRIEND')
      expect(level.name).toBe('친구')
    })

    it('좋은 친구 (60-79)', () => {
      manager.setAffinity('char1', 'char2', 70)
      const level = manager.getRelationshipLevel('char1', 'char2')
      expect(level.key).toBe('GOOD_FRIEND')
      expect(level.name).toBe('좋은 친구')
    })

    it('베프 (80-100)', () => {
      manager.setAffinity('char1', 'char2', 90)
      const level = manager.getRelationshipLevel('char1', 'char2')
      expect(level.key).toBe('BEST_FRIEND')
      expect(level.name).toBe('베프')
    })
  })

  describe('대화 스타일', () => {
    it('낯선 사람 대화 스타일', () => {
      manager.setAffinity('char1', 'char2', 10)
      const style = manager.getConversationStyle('char1', 'char2')
      expect(style).toBe(CONVERSATION_STYLES.STRANGER)
    })

    it('친구 대화 스타일', () => {
      manager.setAffinity('char1', 'char2', 50)
      const style = manager.getConversationStyle('char1', 'char2')
      expect(style).toBe(CONVERSATION_STYLES.FRIEND)
    })

    it('베프 대화 스타일', () => {
      manager.setAffinity('char1', 'char2', 90)
      const style = manager.getConversationStyle('char1', 'char2')
      expect(style).toBe(CONVERSATION_STYLES.BEST_FRIEND)
    })
  })

  describe('상호작용', () => {
    it('상호작용 횟수 증가', () => {
      manager.incrementInteraction('char1', 'char2')
      manager.incrementInteraction('char1', 'char2')
      expect(manager.getInteractionCount('char1', 'char2')).toBe(2)
    })

    it('마지막 상호작용 시간', () => {
      const beforeTest = Date.now()
      manager.incrementInteraction('char1', 'char2')
      const lastInteraction = manager.getLastInteraction('char1', 'char2')

      expect(lastInteraction).toBeGreaterThanOrEqual(beforeTest)
      expect(lastInteraction).toBeLessThanOrEqual(Date.now())
    })
  })

  describe('관계 데이터', () => {
    it('관계 데이터 가져오기', () => {
      const relData = manager.getRelationshipData('char1', 'char2')
      expect(relData).toBeDefined()
      expect(relData.affinity).toBe(0)
      expect(relData.interactionCount).toBe(0)
    })

    it('모든 관계 가져오기', () => {
      manager.setAffinity('char1', 'char2', 50)
      manager.setAffinity('char2', 'char3', 70)

      const all = manager.getAllRelationships()
      expect(all.length).toBe(2)
    })

    it('캐릭터의 모든 관계 가져오기', () => {
      manager.setAffinity('char1', 'char2', 50)
      manager.setAffinity('char1', 'char3', 70)
      manager.setAffinity('char2', 'char3', 30)

      const char1Rels = manager.getCharacterRelationships('char1')
      expect(char1Rels.length).toBe(2)
      expect(char1Rels.map(r => r.otherCharacter).sort()).toEqual(['char2', 'char3'])
    })
  })

  describe('관계 초기화', () => {
    it('단일 관계 초기화', () => {
      manager.setAffinity('char1', 'char2', 50)
      manager.resetRelationship('char1', 'char2')

      expect(manager.getAffinity('char1', 'char2')).toBe(0)
    })

    it('모든 관계 초기화', () => {
      manager.setAffinity('char1', 'char2', 50)
      manager.setAffinity('char2', 'char3', 70)
      manager.resetAll()

      const all = manager.getAllRelationships()
      expect(all.length).toBe(0)
    })
  })
})

describe('RELATIONSHIP_LEVELS 상수', () => {
  it('모든 레벨 정의됨', () => {
    expect(RELATIONSHIP_LEVELS.STRANGER).toBeDefined()
    expect(RELATIONSHIP_LEVELS.ACQUAINTANCE).toBeDefined()
    expect(RELATIONSHIP_LEVELS.FRIEND).toBeDefined()
    expect(RELATIONSHIP_LEVELS.GOOD_FRIEND).toBeDefined()
    expect(RELATIONSHIP_LEVELS.BEST_FRIEND).toBeDefined()
  })

  it('연속적인 범위', () => {
    expect(RELATIONSHIP_LEVELS.STRANGER.max).toBe(19)
    expect(RELATIONSHIP_LEVELS.ACQUAINTANCE.min).toBe(20)
    expect(RELATIONSHIP_LEVELS.ACQUAINTANCE.max).toBe(39)
    expect(RELATIONSHIP_LEVELS.FRIEND.min).toBe(40)
  })
})

describe('CONVERSATION_STYLES 상수', () => {
  it('모든 스타일 정의됨', () => {
    expect(CONVERSATION_STYLES.STRANGER).toBeDefined()
    expect(CONVERSATION_STYLES.ACQUAINTANCE).toBeDefined()
    expect(CONVERSATION_STYLES.FRIEND).toBeDefined()
    expect(CONVERSATION_STYLES.GOOD_FRIEND).toBeDefined()
    expect(CONVERSATION_STYLES.BEST_FRIEND).toBeDefined()
  })
})

describe('싱글톤 인스턴스', () => {
  it('relationshipManager 싱글톤 동작', () => {
    relationshipManager.setAffinity('player1', 'player2', 75)
    expect(relationshipManager.getAffinity('player1', 'player2')).toBe(75)

    relationshipManager.resetAll()
    expect(relationshipManager.getAffinity('player1', 'player2')).toBe(0)
  })
})