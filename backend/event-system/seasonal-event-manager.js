/**
 * Seasonal Event Manager - 시즌 이벤트 관리자
 * Phase 7: 이벤트 시스템
 */

import {
  SEASONAL_EVENTS,
  getCurrentSeason,
  getCurrentYear,
  makeSeasonId,
  isEventActive
} from './event-data.js';
import {
  getEventProgress,
  initializeSeasonEventProgress,
  markEventCompleted,
  markRewardClaimed,
  hasClaimedReward
} from './event-progress-manager.js';
import { grantRewardsByEvent } from './event-reward-system.js';
import { getRedisClient, isRedisEnabled, TTL } from '../utils/redis-client.js';

/**
 * 현재 시즌 조회
 */
export function getCurrentSeasonInfo(date = new Date()) {
  try {
    const season = getCurrentSeason(date);
    const year = getCurrentYear(date);
    const seasonId = makeSeasonId(season, year);

    const seasonEvent = SEASONAL_EVENTS.find(
      event => event.seasonId === seasonId
    );

    if (!seasonEvent) {
      return null;
    }

    return {
      seasonId: seasonEvent.seasonId,
      seasonType: seasonEvent.seasonType,
      year: seasonEvent.year,
      startDate: seasonEvent.startDate,
      endDate: seasonEvent.endDate,
      isActive: isEventActive(seasonEvent),
      events: seasonEvent.events
    };
  } catch (error) {
    console.error('Failed to get current season:', error);
    return null;
  }
}

/**
 * 시즌 이벤트 목록 조회
 */
export function getSeasonEvents(seasonId) {
  try {
    const seasonEvent = SEASONAL_EVENTS.find(
      event => event.seasonId === seasonId
    );

    if (!seasonEvent) {
      return [];
    }

    return seasonEvent.events || [];
  } catch (error) {
    console.error('Failed to get season events:', error);
    return [];
  }
}

/**
 * 모든 시즌 이벤트 조회
 */
export function getAllSeasonalEvents() {
  try {
    return SEASONAL_EVENTS;
  } catch (error) {
    console.error('Failed to get all seasonal events:', error);
    return [];
  }
}

/**
 * 활성 시즌 이벤트 목록 조회
 */
export function getActiveSeasonEvents() {
  try {
    const now = new Date();
    const activeEvents = [];

    for (const seasonEvent of SEASONAL_EVENTS) {
      if (isEventActive(seasonEvent)) {
        for (const event of seasonEvent.events) {
          if (isEventActive(event)) {
            activeEvents.push({
              ...event,
              seasonType: seasonEvent.seasonType
            });
          }
        }
      }
    }

    return activeEvents;
  } catch (error) {
    console.error('Failed to get active season events:', error);
    return [];
  }
}

/**
 * 시즌 시작 (관리자용)
 */
export function startSeason(seasonId) {
  try {
    if (!isRedisEnabled()) {
      console.warn('Redis is disabled, season not started');
      return false;
    }

    const redis = getRedisClient();
    const seasonEvent = SEASONAL_EVENTS.find(
      event => event.seasonId === seasonId
    );

    if (!seasonEvent) {
      console.error(`Season ${seasonId} not found`);
      return false;
    }

    seasonEvent.isActive = true;

    // Redis에 저장
    const key = `event:season:${seasonId}`;
    redis.set(key, JSON.stringify(seasonEvent), { EX: TTL.LONG });

    console.log(`Season ${seasonId} started`);
    return true;
  } catch (error) {
    console.error('Failed to start season:', error);
    return false;
  }
}

/**
 * 시즌 종료 (관리자용)
 */
export function endSeason(seasonId) {
  try {
    if (!isRedisEnabled()) {
      console.warn('Redis is disabled, season not ended');
      return false;
    }

    const redis = getRedisClient();
    const seasonEvent = SEASONAL_EVENTS.find(
      event => event.seasonId === seasonId
    );

    if (!seasonEvent) {
      console.error(`Season ${seasonId} not found`);
      return false;
    }

    seasonEvent.isActive = false;

    // Redis에 저장
    const key = `event:season:${seasonId}`;
    redis.set(key, JSON.stringify(seasonEvent), { EX: TTL.LONG });

    console.log(`Season ${seasonId} ended`);
    return true;
  } catch (error) {
    console.error('Failed to end season:', error);
    return false;
  }
}

/**
 * 시즌 이벤트 진행 업데이트
 */
export function updateSeasonEventProgress(characterId, taskId, progress) {
  try {
    const eventProgress = getEventProgress(characterId);
    if (!eventProgress) {
      return false;
    }

    // 모든 시즌 이벤트에서 태스크 찾기
    for (const seasonId in eventProgress.seasonEvents) {
      const seasonEvent = eventProgress.seasonEvents[seasonId];

      if (seasonEvent.tasks && seasonEvent.tasks[taskId] !== undefined) {
        seasonEvent.tasks[taskId] = progress;

        // 태스크 완료 확인
        const taskDetails = seasonEvent.taskDetails || [];
        const taskIndex = taskDetails.findIndex(t => t.id === taskId);

        if (taskIndex >= 0) {
          const taskInfo = taskDetails[taskIndex];
          const taskProgress = Array.isArray(progress)
            ? progress.length
            : progress;

          if (taskProgress >= taskInfo.requiredCount) {
            if (!seasonEvent.completedTasks.includes(taskId)) {
              seasonEvent.completedTasks.push(taskId);
            }

            // 모든 태스크 완료 확인
            if (seasonEvent.completedTasks.length >= taskDetails.length) {
              seasonEvent.status = 'completed';
              seasonEvent.progress = taskDetails.length;
            } else {
              seasonEvent.progress = seasonEvent.completedTasks.length;
            }
          }
        }

        // Redis에 저장
        const redis = getRedisClient();
        const key = `event:progress:${characterId}`;
        redis.set(key, JSON.stringify(eventProgress), { EX: TTL.LONG });

        return true;
      }
    }

    console.error(`Task ${taskId} not found in any season event`);
    return false;
  } catch (error) {
    console.error('Failed to update season event progress:', error);
    return false;
  }
}

/**
 * 시즌 이벤트 리워드 수령
 */
export function claimSeasonEventReward(characterId, eventId) {
  try {
    // 이미 수령했는지 확인
    if (hasClaimedReward(characterId, eventId, 'seasonal')) {
      return {
        success: false,
        message: '이미 수령한 리워드입니다'
      };
    }

    // 현재 시즌에서 이벤트 찾기
    const currentSeason = getCurrentSeasonInfo();
    if (!currentSeason) {
      return {
        success: false,
        message: '활성 시즌이 없습니다'
      };
    }

    const event = currentSeason.events.find(e => e.eventId === eventId);
    if (!event) {
      return {
        success: false,
        message: '이벤트를 찾을 수 없습니다'
      };
    }

    // 진행 상태 확인
    const eventProgress = getEventProgress(characterId);
    const seasonId = currentSeason.seasonId;
    const seasonEventData = eventProgress?.seasonEvents?.[seasonId]?.[eventId];

    if (!seasonEventData || seasonEventData.status !== 'completed') {
      return {
        success: false,
        message: '이벤트 미완료'
      };
    }

    // 리워드 지급
    const result = grantRewardsByEvent(characterId, eventId, event.rewards);

    if (result.success) {
      // 수령 마크
      markRewardClaimed(characterId, eventId, 'seasonal');

      return {
        success: true,
        message: '리워드가 지급되었습니다',
        reward: event.rewards,
        grants: result.grants
      };
    } else {
      return {
        success: false,
        message: '리워드 지급 실패',
        error: result.error
      };
    }
  } catch (error) {
    console.error('Failed to claim season event reward:', error);
    return {
      success: false,
      message: '리워드 수령 실패',
      error: error.message
    };
  }
}

/**
 * 캐릭터의 시즌 이벤트 목록 조회
 */
export function getCharacterSeasonEvents(characterId) {
  try {
    const currentSeason = getCurrentSeasonInfo();
    if (!currentSeason) {
      return [];
    }

    const eventProgress = getEventProgress(characterId);
    const seasonId = currentSeason.seasonId;
    const seasonEvents = eventProgress?.seasonEvents?.[seasonId] || {};

    // 이벤트 목록에 진행 상태 추가
    const eventsWithProgress = currentSeason.events.map(event => {
      const progressData = seasonEvents[event.eventId] || {
        status: 'not_started',
        completedTasks: [],
        progress: 0,
        maxProgress: event.tasks?.length || 0
      };

      return {
        ...event,
        progress: progressData.progress,
        maxProgress: progressData.maxProgress,
        status: progressData.status,
        completedTasks: progressData.completedTasks,
        rewardClaimed: progressData.rewardClaimed || false
      };
    });

    return eventsWithProgress;
  } catch (error) {
    console.error('Failed to get character season events:', error);
    return [];
  }
}

/**
 * 캐릭터 시즌 이벤트 자동 초기화 (캐릭터 생성 시 호출)
 */
export function initializeCharacterSeasonEvents(characterId) {
  try {
    const currentSeason = getCurrentSeasonInfo();
    if (!currentSeason) {
      return false;
    }

    const seasonId = currentSeason.seasonId;

    // 각 이벤트에 대해 진행 상태 초기화
    for (const event of currentSeason.events) {
      initializeSeasonEventProgress(characterId, `${seasonId}:${event.eventId}`);
    }

    console.log(`Season events initialized for ${characterId}`);
    return true;
  } catch (error) {
    console.error('Failed to initialize character season events:', error);
    return false;
  }
}

/**
 * 시즌 이벤트 캐시 갱신 (Redis)
 */
export function cacheSeasonEvent(seasonId) {
  try {
    if (!isRedisEnabled()) {
      return false;
    }

    const redis = getRedisClient();
    const seasonEvent = SEASONAL_EVENTS.find(
      event => event.seasonId === seasonId
    );

    if (!seasonEvent) {
      return false;
    }

    const key = `event:season:${seasonId}`;
    redis.set(key, JSON.stringify(seasonEvent), { EX: TTL.LONG });

    return true;
  } catch (error) {
    console.error('Failed to cache season event:', error);
    return false;
  }
}

/**
 * 캐시에서 시즌 이벤트 불러오기
 */
export function getCachedSeasonEvent(seasonId) {
  try {
    if (!isRedisEnabled()) {
      return null;
    }

    const redis = getRedisClient();
    const key = `event:season:${seasonId}`;
    const data = redis.get(key);

    if (data) {
      return JSON.parse(data);
    }

    return null;
  } catch (error) {
    console.error('Failed to get cached season event:', error);
    return null;
  }
}