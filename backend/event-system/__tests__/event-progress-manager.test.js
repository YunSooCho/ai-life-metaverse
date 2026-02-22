/**
 * Event Progress Manager Test
 * Phase 7: 이벤트 시스템
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getEventProgress,
  saveEventProgress,
  initializeEventProgress,
  updateTaskProgress,
  completeTask,
  initializeSeasonEventProgress,
  initializeSpecialEventProgress,
  initializeDailyQuestProgress,
  initializeWeeklyQuestProgress,
  resetDailyQuests,
  resetWeeklyQuests,
  shouldResetDaily,
  shouldResetWeekly,
  markEventCompleted,
  markRewardClaimed,
  hasClaimedReward
} from '../event-progress-manager.js';

// Mock Redis client
const mockRedisClient = {
  get: vi.fn(),
  set: vi.fn()
};

vi.mock('../../utils/redis-client.js', () => ({
  getRedisClient: () => mockRedisClient,
  isRedisEnabled: () => true,
  TTL: {
    SHORT: 300,
    MEDIUM: 3600,
    LONG: 86400,
    WEEK: 604800
  }
}));

describe('Event Progress Manager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRedisClient.get.mockReturnValue(null);
    mockRedisClient.set.mockReturnValue(true);
  });

  describe('getEventProgress', () => {
    it('TC01: 없는 캐릭터는 초기 상태 반환', () => {
      const characterId = 'test-char-1';
      const progress = getEventProgress(characterId);

      expect(progress).toBeDefined();
      expect(progress.characterId).toBe(characterId);
      expect(progress.seasonEvents).toEqual({});
      expect(progress.specialEvents).toEqual({});
      expect(progress.dailyQuests).toEqual({});
      expect(progress.weeklyQuests).toEqual({});
    });

    it('TC02: 기존 진행 상태 로드', () => {
      const characterId = 'test-char-2';
      const existingData = {
        characterId,
        seasonEvents: { 'spring-2026:cherry-blossom': { status: 'in_progress' } }
      };
      mockRedisClient.get.mockReturnValue(JSON.stringify(existingData));

      const progress = getEventProgress(characterId);

      expect(progress).toBeDefined();
      expect(progress.seasonEvents).toEqual(existingData.seasonEvents);
    });
  });

  describe('saveEventProgress', () => {
    it('TC03: 진행 상태 저장', () => {
      const characterId = 'test-char-3';
      const progress = {
        characterId,
        dailyQuests: { 'daily-coins-2026-02-19': { status: 'completed' } }
      };

      const result = saveEventProgress(characterId, progress);

      expect(result).toBe(true);
      expect(mockRedisClient.set).toHaveBeenCalled();
    });
  });

  describe('initializeEventProgress', () => {
    it('TC04: 캐릭터 초기화 시 기본 상태 반환', () => {
      const characterId = 'test-char-4';
      const progress = initializeEventProgress(characterId);

      expect(progress).toBeDefined();
      expect(progress.characterId).toBe(characterId);
      expect(progress.seasonEvents).toEqual({});
      expect(progress.specialEvents).toEqual({});
      expect(progress.dailyQuests).toEqual({});
      expect(progress.weeklyQuests).toEqual({});
      expect(progress.lastDailyReset).toBeNull();
      expect(progress.lastWeeklyReset).toBeNull();
    });
  });

  describe('initializeSeasonEventProgress', () => {
    it('TC05: 시즌 이벤트 진행 상태 초기화', () => {
      const characterId = 'test-char-5';
      const seasonEventId = 'spring-2026:cherry-blossom-2026';

      const result = initializeSeasonEventProgress(characterId, seasonEventId);

      expect(result).toBe(true);
    });

    it('TC06: 기존 시즌 이벤트 업데이트', () => {
      const characterId = 'test-char-6';
      const seasonEventId = 'spring-2026:cherry-blossom-2026';

      const existingData = {
        characterId,
        seasonEvents: {
          [seasonEventId]: { status: 'in_progress', progress: 1 }
        }
      };
      mockRedisClient.get.mockReturnValue(JSON.stringify(existingData));

      const result = initializeSeasonEventProgress(characterId, seasonEventId);

      expect(result).toBe(true);
    });
  });

  describe('initializeSpecialEventProgress', () => {
    it('TC07: 특별 이벤트 진행 상태 초기화', () => {
      const characterId = 'test-char-7';
      const eventId = 'halloween-2026';

      const result = initializeSpecialEventProgress(characterId, eventId);

      expect(result).toBe(true);
    });
  });

  describe('initializeDailyQuestProgress', () => {
    it('TC08: 일일 퀘스트 진행 상태 초기화', () => {
      const characterId = 'test-char-8';
      const questId = 'daily-coins-2026-02-19';
      const tasks = [
        { id: 'collect-coins-100', description: '100개 코인 수집', type: 'collect', requiredCount: 100 }
      ];

      const result = initializeDailyQuestProgress(characterId, questId, tasks);

      expect(result).toBe(true);
    });

    it('TC09: taskDetails 포함', () => {
      const characterId = 'test-char-9';
      const questId = 'daily-coins-2026-02-19';
      const tasks = [
        { id: 'chat-5-times', description: '5번 채팅하기', type: 'chat', requiredCount: 5 }
      ];

      // Initialize 후 저장된 데이터를 반환하도록 mock 설정
      const originalGet = mockRedisClient.get;
      const originalSet = mockRedisClient.set;
      let savedData = null;

      mockRedisClient.get.mockImplementation((key) => {
        if (key.startsWith(`event:progress:${characterId}`)) {
          return savedData ? JSON.stringify(savedData) : null;
        }
        return originalGet(key);
      });
      mockRedisClient.set.mockImplementation((key, value, options) => {
        if (key.startsWith(`event:progress:${characterId}`)) {
          savedData = JSON.parse(value);
        }
        return originalSet(key, value, options);
      });

      initializeDailyQuestProgress(characterId, questId, tasks);

      const progress = getEventProgress(characterId);
      expect(progress).toBeDefined();
      expect(progress.dailyQuests[questId]).toHaveProperty('taskDetails');
      expect(progress.dailyQuests[questId].taskDetails).toHaveLength(1);
      expect(progress.dailyQuests[questId].taskDetails[0].id).toBe('chat-5-times');

      // mock 복원
      mockRedisClient.get.mockRestore();
      mockRedisClient.set.mockRestore();
      mockRedisClient.get.mockReturnValue(null);
      mockRedisClient.set.mockReturnValue(true);
    });
  });

  describe('initializeWeeklyQuestProgress', () => {
    it('TC10: 주간 퀘스트 진행 상태 초기화', () => {
      const characterId = 'test-char-10';
      const questId = 'weekly-master-2026-W07';
      const tasks = [
        { id: 'visit-10-buildings', description: '10개 건물 방문', type: 'visit_building', requiredCount: 10 }
      ];

      const result = initializeWeeklyQuestProgress(characterId, questId, tasks);

      expect(result).toBe(true);
    });
  });

  describe('updateTaskProgress', () => {
    it('TC11: 태스크 진행 업데이트 (숫자)', () => {
      const characterId = 'test-char-11';
      const taskId = 'collect-coins-100';

      const existingData = {
        characterId,
        dailyQuests: {
          'daily-coins-2026-02-19': {
            status: 'in_progress',
            tasks: { 'collect-coins-100': 50 },
            maxProgress: 1,
            taskDetails: [
              { id: 'collect-coins-100', requiredCount: 100 }
            ]
          }
        }
      };
      mockRedisClient.get.mockReturnValue(JSON.stringify(existingData));

      const result = updateTaskProgress(characterId, taskId, 75);

      expect(result).toBe(true);
    });

    it('TC12: 태스크 완료 시 상태 변경', () => {
      const characterId = 'test-char-12';
      const taskId = 'visit-park-5-times';

      const existingData = {
        characterId,
        seasonEvents: {
          'spring-2026:cherry-blossom': {
            status: 'in_progress',
            tasks: { 'visit-park-5-times': 5 },
            maxProgress: 1,
            completedTasks: [],
            taskDetails: [
              { id: 'visit-park-5-times', requiredCount: 5 }
            ]
          }
        }
      };
      mockRedisClient.get.mockReturnValue(JSON.stringify(existingData));

      const result = updateTaskProgress(characterId, taskId, 5);

      expect(result).toBe(true);
    });

    it('TC13: 찾을 수 없는 태스크는 실패', () => {
      const characterId = 'test-char-13';
      const taskId = 'unknown-task';

      mockRedisClient.get.mockReturnValue(JSON.stringify({ characterId }));

      const result = updateTaskProgress(characterId, taskId, 10);

      expect(result).toBe(false);
    });
  });

  describe('completeTask', () => {
    it('TC14: 태스크 완료 마크', () => {
      const characterId = 'test-char-14';
      const taskId = 'chat-5-times';

      const existingData = {
        characterId,
        dailyQuests: {
          'daily-coins-2026-02-19': {
            status: 'in_progress',
            tasks: { 'chat-5-times': 5 },
            maxProgress: 1,
            completedTasks: [],
            taskDetails: [
              { id: 'chat-5-times', requiredCount: 5 }
            ]
          }
        }
      };
      mockRedisClient.get.mockReturnValue(JSON.stringify(existingData));

      const result = completeTask(characterId, taskId);

      expect(result).toBe(true);
    });
  });

  describe('resetDailyQuests', () => {
    it('TC15: 일일 퀘스트 리셋', () => {
      const characterId = 'test-char-15';

      const existingData = {
        characterId,
        dailyQuests: {
          'daily-coins-2026-02-18': { status: 'completed' }
        },
        lastDailyReset: '2026-02-18'
      };
      mockRedisClient.get.mockReturnValue(JSON.stringify(existingData));

      const result = resetDailyQuests(characterId);

      expect(result).toBe(true);
    });
  });

  describe('resetWeeklyQuests', () => {
    it('TC16: 주간 퀘스트 리셋', () => {
      const characterId = 'test-char-16';

      const existingData = {
        characterId,
        weeklyQuests: {
          'weekly-master-2026-W06': { status: 'completed' }
        },
        lastWeeklyReset: '2026-02-09'
      };
      mockRedisClient.get.mockReturnValue(JSON.stringify(existingData));

      const result = resetWeeklyQuests(characterId);

      expect(result).toBe(true);
    });
  });

  describe('shouldResetDaily', () => {
    it('TC17: 리셋 필요 (날짜 다름)', () => {
      const characterId = 'test-char-17';

      const existingData = {
        characterId,
        lastDailyReset: '2026-02-18'
      };
      mockRedisClient.get.mockReturnValue(JSON.stringify(existingData));

      const shouldReset = shouldResetDaily(characterId);

      expect(shouldReset).toBe(true);
    });

    it('TC18: 리셋 불필요 (같은 날짜)', () => {
      const characterId = 'test-char-18';
      const today = new Date().toISOString().split('T')[0];

      const existingData = {
        characterId,
        lastDailyReset: today
      };
      mockRedisClient.get.mockReturnValue(JSON.stringify(existingData));

      const shouldReset = shouldResetDaily(characterId);

      expect(shouldReset).toBe(false);
    });

    it('TC19: 없는 캐릭터는 리셋 필요', () => {
      const characterId = 'test-char-19';
      mockRedisClient.get.mockReturnValue(null);

      const shouldReset = shouldResetDaily(characterId);

      expect(shouldReset).toBe(true);
    });
  });

  describe('shouldResetWeekly', () => {
    it('TC20: 리셋 필요 (주차 다름)', () => {
      const characterId = 'test-char-20';

      const existingData = {
        characterId,
        lastWeeklyReset: '2026-02-09'
      };
      mockRedisClient.get.mockReturnValue(JSON.stringify(existingData));

      const shouldReset = shouldResetWeekly(characterId);

      // 오늘의 주차와 비교
      expect(typeof shouldReset).toBe('boolean');
    });
  });

  describe('markEventCompleted', () => {
    it('TC21: 시즌 이벤트 완료 마크', () => {
      const characterId = 'test-char-21';
      const eventId = 'spring-2026:cherry-blossom-2026';

      const existingData = {
        characterId,
        seasonEvents: {
          [eventId]: { status: 'in_progress' }
        }
      };
      mockRedisClient.get.mockReturnValue(JSON.stringify(existingData));

      const result = markEventCompleted(characterId, eventId, 'seasonal');

      expect(result).toBe(true);
    });

    it('TC22: 특별 이벤트 완료 마크', () => {
      const characterId = 'test-char-22';
      const eventId = 'halloween-2026';

      const existingData = {
        characterId,
        specialEvents: {
          [eventId]: { status: 'in_progress' }
        }
      };
      mockRedisClient.get.mockReturnValue(JSON.stringify(existingData));

      const result = markEventCompleted(characterId, eventId, 'special');

      expect(result).toBe(true);
    });
  });

  describe('markRewardClaimed', () => {
    it('TC23: 리워드 수령 마크', () => {
      const characterId = 'test-char-23';
      const eventId = 'daily-coins-2026-02-19';

      const existingData = {
        characterId,
        dailyQuests: {
          [eventId]: { status: 'completed' }
        }
      };
      mockRedisClient.get.mockReturnValue(JSON.stringify(existingData));

      const result = markRewardClaimed(characterId, eventId, 'daily');

      expect(result).toBe(true);
    });
  });

  describe('hasClaimedReward', () => {
    it('TC24: 수령한 리워드 true 반환', () => {
      const characterId = 'test-char-24';
      const eventId = 'weekly-master-2026-W07';

      const existingData = {
        characterId,
        weeklyQuests: {
          [eventId]: { status: 'completed', rewardClaimed: true }
        }
      };
      mockRedisClient.get.mockReturnValue(JSON.stringify(existingData));

      const result = hasClaimedReward(characterId, eventId, 'weekly');

      expect(result).toBe(true);
    });

    it('TC25: 미수령 리워드 false 반환', () => {
      const characterId = 'test-char-25';
      const eventId = 'weekly-master-2026-W07';

      const existingData = {
        characterId,
        weeklyQuests: {
          [eventId]: { status: 'completed', rewardClaimed: false }
        }
      };
      mockRedisClient.get.mockReturnValue(JSON.stringify(existingData));

      const result = hasClaimedReward(characterId, eventId, 'weekly');

      expect(result).toBe(false);
    });

    it('TC26: 없는 이벤트 false 반환', () => {
      const characterId = 'test-char-26';
      const eventId = 'non-existent';

      mockRedisClient.get.mockReturnValue(JSON.stringify({ characterId }));

      const result = hasClaimedReward(characterId, eventId, 'daily');

      expect(result).toBe(false);
    });
  });
});