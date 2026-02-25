/**
 * Daily/Weekly Quest Manager Tests
 * Phase 7: 이벤트 시스템
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as EventProgressManager from '../event-progress-manager.js';
import * as EventRewardSystem from '../event-reward-system.js';
import * as RedisUtils from '../../utils/redis-client.js';
import {
  getDailyQuests,
  getWeeklyQuests,
  updateDailyQuestProgress,
  updateWeeklyQuestProgress,
  completeQuest,
  resetDailyQuests,
  resetWeeklyQuests,
  shouldResetDaily,
  shouldResetWeekly,
  updateQuestProgressByEventType
} from '../daily-quest-manager.js';

describe('DailyQuestManager Module Export Tests', () => {
  it('should export all required functions', () => {
    expect(typeof getDailyQuests).toBe('function');
    expect(typeof getWeeklyQuests).toBe('function');
    expect(typeof updateDailyQuestProgress).toBe('function');
    expect(typeof updateWeeklyQuestProgress).toBe('function');
    expect(typeof completeQuest).toBe('function');
    expect(typeof resetDailyQuests).toBe('function');
    expect(typeof resetWeeklyQuests).toBe('function');
    expect(typeof updateQuestProgressByEventType).toBe('function');
    // shouldResetDaily/shouldResetWeekly are from event-progress-manager
    expect(typeof shouldResetDaily).toBe('undefined'); // Not exported from this module
    expect(typeof shouldResetWeekly).toBe('undefined'); // Not exported from this module
  });
});

describe('DailyQuestManager', () => {
  const mockCharacterId = 'test-character-001';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getDailyQuests', () => {
    it('getDailyQuests 함수가 존재해야 함', () => {
      expect(typeof getDailyQuests).toBe('function');
    });

    it('빈 캐릭터 ID로 호출해도 에러가 발생하지 않아야 함', () => {
      const result = getDailyQuests('');
      expect(Array.isArray(result)).toBe(true);
    });

    it('null 캐릭터 ID로 호출해도 에러가 발생하지 않아야 함', () => {
      const result = getDailyQuests(null);
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('getWeeklyQuests', () => {
    it('getWeeklyQuests 함수가 존재해야 함', () => {
      expect(typeof getWeeklyQuests).toBe('function');
    });

    it('빈 캐릭터 ID로 호출해도 에러가 발생하지 않아야 함', () => {
      const result = getWeeklyQuests('');
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('updateDailyQuestProgress', () => {
    it('updateDailyQuestProgress 함수가 존재해야 함', () => {
      expect(typeof updateDailyQuestProgress).toBe('function');
    });

    it('빈 캐릭터 ID로 호출하면 false를 반환해야 함', () => {
      const result = updateDailyQuestProgress('', 'chat', { amount: 1 });
      expect(result).toBe(false);
    });

    it('null 캐릭터 ID로 호출하면 false를 반환해야 함', () => {
      const result = updateDailyQuestProgress(null, 'chat', { amount: 1 });
      expect(result).toBe(false);
    });
  });

  describe('updateWeeklyQuestProgress', () => {
    it('updateWeeklyQuestProgress 함수가 존재해야 함', () => {
      expect(typeof updateWeeklyQuestProgress).toBe('function');
    });

    it('빈 캐릭터 ID로 호출하면 false를 반환해야 함', () => {
      const result = updateWeeklyQuestProgress('', 'chat', { amount: 1 });
      expect(result).toBe(false);
    });

    it('null 캐릭터 ID로 호출하면 false를 반환해야 함', () => {
      const result = updateWeeklyQuestProgress(null, 'chat', { amount: 1 });
      expect(result).toBe(false);
    });
  });

  describe('completeQuest', () => {
    it('completeQuest 함수가 존재해야 함', () => {
      expect(typeof completeQuest).toBe('function');
    });

    it('빈 캐릭터 ID로 호출하면 실패해야 함', () => {
      const result = completeQuest('', 'quest-id');
      expect(result.success).toBe(false);
    });

    it('null 캐릭터 ID로 호출하면 실패해야 함', () => {
      const result = completeQuest(null, 'quest-id');
      expect(result.success).toBe(false);
    });
  });

  describe('updateQuestProgressByEventType', () => {
    it('updateQuestProgressByEventType 함수가 존재해야 함', () => {
      expect(typeof updateQuestProgressByEventType).toBe('function');
    });

    it('빈 캐릭터 ID로 호출해도 에러가 발생하지 않아야 함', () => {
      expect(() => updateQuestProgressByEventType('', 'chat', { amount: 1 })).not.toThrow();
    });

    it('null 캐릭터 ID로 호출해도 에러가 발생하지 않아야 함', () => {
      expect(() => updateQuestProgressByEventType(null, 'chat', { amount: 1 })).not.toThrow();
    });
  });

  describe('Integration with EventProgressManager', () => {
    it('EventProgressManager 모듈을 가져올 수 있어야 함', () => {
      expect(EventProgressManager).toBeDefined();
      expect(typeof EventProgressManager.getEventProgress).toBe('function');
    });

    it('EventRewardSystem 모듈을 가져올 수 있어야 함', () => {
      expect(EventRewardSystem).toBeDefined();
      expect(typeof EventRewardSystem.grantRewardsByEvent).toBe('function');
    });

    it('RedisUtils 모듈을 가져올 수 있어야 함', () => {
      expect(RedisUtils).toBeDefined();
      expect(typeof RedisUtils.isRedisEnabled).toBe('function');
    });
  });

  describe('Error Handling', () => {
    it('이벤트 진행 상태가 없을 때도 처리해야 함', () => {
      vi.spyOn(EventProgressManager, 'getEventProgress').mockReturnValue(null);

      const result = updateDailyQuestProgress(mockCharacterId, 'chat', { amount: 1 });
      expect(result).toBe(false);
    });

    it('리워드 지급 실패 시 에러를 반환해야 함', () => {
      vi.spyOn(EventProgressManager, 'getEventProgress').mockReturnValue({
        dailyQuests: {
          'test-quest': {
            status: 'completed',
            progress: 1,
            maxProgress: 1,
            completedTasks: ['task1'],
            rewardClaimed: false
          }
        }
      });

      vi.spyOn(EventProgressManager, 'hasClaimedReward').mockReturnValue(false);
      vi.spyOn(EventProgressManager, 'markRewardClaimed').mockReturnValue(true);
      vi.spyOn(EventRewardSystem, 'grantRewardsByEvent').mockReturnValue({
        success: false,
        error: 'Grant failed'
      });

      const result = completeQuest(mockCharacterId, 'test-quest');
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });
});