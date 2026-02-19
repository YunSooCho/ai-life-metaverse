/**
 * Event System - 이벤트 시스템 메인
 * Phase 7: 이벤트 시스템
 *
 * 시즌 이벤트, 특별 이벤트, 일일/주간 퀘스트, 리워드 시스템 통합
 */

import * as SeasonalEventManager from './seasonal-event-manager.js';
import * as SpecialEventManager from './special-event-manager.js';
import * as EventRewardSystem from './event-reward-system.js';
import * as DailyQuestManager from './daily-quest-manager.js';
import * as EventProgressManager from './event-progress-manager.js';
import * as EventData from './event-data.js';

// Export all modules
export {
  // Seasonal Event Manager
  getCurrentSeasonInfo,
  getSeasonEvents,
  getAllSeasonalEvents,
  getActiveSeasonEvents,
  getCurrentSeason,
  getCurrentYear,
  startSeason,
  endSeason,
  updateSeasonEventProgress,
  claimSeasonEventReward,
  getCharacterSeasonEvents,
  initializeCharacterSeasonEvents
} from './seasonal-event-manager.js';

export {
  // Special Event Manager
  getSpecialEvent,
  getAllSpecialEvents,
  getActiveSpecialEvents,
  isEventActive,
  activateSpecialEvent,
  deactivateSpecialEvent,
  updateSpecialEventProgress,
  claimSpecialEventReward,
  getCharacterSpecialEvents,
  initializeCharacterSpecialEvents,
  applyEventEffects,
  removeEventEffects
} from './special-event-manager.js';

export {
  // Event Reward System
  createReward,
  grantReward,
  grantRewardsByEvent,
  grantExperience,
  grantCoins,
  grantItem,
  grantStatsBoost,
  grantTitle,
  saveRewardHistory,
  getRewardHistory,
  hasClaimedReward
} from './event-reward-system.js';

export {
  // Daily/Weekly Quest Manager
  getDailyQuests,
  getWeeklyQuests,
  updateDailyQuestProgress,
  updateWeeklyQuestProgress,
  updateQuestProgressByEventType,
  completeQuest,
  resetDailyQuests,
  resetWeeklyQuests,
  shouldResetDaily,
  shouldResetWeekly,
  initializeCharacterQuests
} from './daily-quest-manager.js';

export {
  // Event Progress Manager
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
} from './event-progress-manager.js';

export {
  // Event Data
  SEASONAL_EVENTS,
  SPECIAL_EVENTS,
  DAILY_QUEST_TEMPLATES,
  WEEKLY_QUEST_TEMPLATES,
  getCurrentSeason,
  getCurrentYear,
  getCurrentWeekNumber,
  getTodayDateString,
  getWeekDateString,
  isEventActive,
  makeSeasonId,
  makeSpecialEventId,
  makeDailyQuestId,
  makeWeeklyQuestId
} from './event-data.js';

/**
 * 이벤트 시스템 초기화
 */
export function initializeEventSystem() {
  console.log('[Event System] Initializing...');

  // Redis 연결 확인
  const { isRedisEnabled } = require('../utils/redis-client.js');
  if (!isRedisEnabled()) {
    console.warn('[Event System] Redis is disabled. Event system running in memory mode.');
  }

  console.log('[Event System] Event system initialized.');
  return true;
}

/**
 * 캐릭터 이벤트 시스템 초기화
 * 캐릭터 생성/로그인 시 호출
 */
export function initializeCharacter(characterId) {
  console.log(`[Event System] Initializing character ${characterId}...`);

  try {
    // 시즌 이벤트 초기화
    SeasonalEventManager.initializeCharacterSeasonEvents(characterId);

    // 특별 이벤트 초기화
    SpecialEventManager.initializeCharacterSpecialEvents(characterId);

    // 일일/주간 퀘스트 초기화
    DailyQuestManager.initializeCharacterQuests(characterId);

    console.log(`[Event System] Character ${characterId} initialized.`);
    return true;
  } catch (error) {
    console.error('[Event System] Failed to initialize character:', error);
    return false;
  }
}

/**
 * 활성 이벤트 목록 조회
 */
export function getActiveEvents() {
  const seasonEvents = SeasonalEventManager.getActiveSeasonEvents().map(e => ({
    ...e,
    category: 'seasonal'
  }));

  const specialEvents = SpecialEventManager.getActiveSpecialEvents().map(e => ({
    ...e,
    category: 'special'
  }));

  return [...seasonEvents, ...specialEvents];
}

/**
 * 캐릭터의 모든 이벤트 목록 조회
 */
export function getCharacterEvents(characterId) {
  return {
    seasonal: SeasonalEventManager.getCharacterSeasonEvents(characterId),
    special: SpecialEventManager.getCharacterSpecialEvents(characterId),
    daily: DailyQuestManager.getDailyQuests(characterId),
    weekly: DailyQuestManager.getWeeklyQuests(characterId)
  };
}

/**
 * 이벤트 태스크 진행 처리
 * 게임 내 이벤트 발생 시 호출
 */
export function handleEvent(characterId, eventType, data = {}) {
  let results = {
    seasonalUpdated: false,
    specialUpdated: false,
    dailyUpdated: false,
    weeklyUpdated: false
  };

  try {
    // 시즌 이벤트 업데이트
    if (SeasonalEventManager.updateSeasonEventProgress(characterId, eventType, data.amount || 1)) {
      results.seasonalUpdated = true;
    }

    // 특별 이벤트 업데이트
    if (SpecialEventManager.updateSpecialEventProgress(characterId, eventType, data.amount || 1)) {
      results.specialUpdated = true;
    }

    // 일일 퀘스트 업데이트
    if (DailyQuestManager.updateDailyQuestProgress(characterId, eventType, data)) {
      results.dailyUpdated = true;
    }

    // 주간 퀘스트 업데이트
    if (DailyQuestManager.updateWeeklyQuestProgress(characterId, eventType, data)) {
      results.weeklyUpdated = true;
    }

    return results;
  } catch (error) {
    console.error('[Event System] Failed to handle event:', error);
    return results;
  }
}

/**
 * 리워드 수령
 */
export function claimReward(characterId, eventType, eventId) {
  switch (eventType) {
    case 'seasonal':
      return SeasonalEventManager.claimSeasonEventReward(characterId, eventId);
    case 'special':
      return SpecialEventManager.claimSpecialEventReward(characterId, eventId);
    case 'daily':
    case 'weekly':
      return DailyQuestManager.completeQuest(characterId, eventId);
    default:
      return {
        success: false,
        message: '알 수 없는 이벤트 타입'
      };
  }
}

/**
 * 이벤트 시스템 상태 조회
 */
export function getEventSystemStatus() {
  try {
    const { isRedisEnabled } = require('../utils/redis-client.js');

    return {
      enabled: true,
      redisEnabled: isRedisEnabled(),
      currentSeason: EventData.getCurrentSeason(),
      currentYear: EventData.getCurrentYear(),
      activeSeasonEvents: SeasonalEventManager.getActiveSeasonEvents().length,
      activeSpecialEvents: SpecialEventManager.getActiveSpecialEvents().length,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('[Event System] Failed to get status:', error);
    return {
      enabled: false,
      error: error.message
    };
  }
}