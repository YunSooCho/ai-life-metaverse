/**
 * Special Event Manager - 특별 이벤트 관리자
 * Phase 7: 이벤트 시스템
 */

import {
  SPECIAL_EVENTS,
  isEventActive
} from './event-data.js';
import {
  getEventProgress,
  initializeSpecialEventProgress,
  markEventCompleted,
  markRewardClaimed,
  hasClaimedReward
} from './event-progress-manager.js';
import { grantRewardsByEvent } from './event-reward-system.js';
import { getRedisClient, isRedisEnabled, TTL } from '../utils/redis-client.js';

/**
 * 특별 이벤트 조회
 */
export function getSpecialEvent(eventType, year) {
  try {
    return SPECIAL_EVENTS.find(
      event => event.eventType === eventType && event.year === year
    ) || null;
  } catch (error) {
    console.error('Failed to get special event:', error);
    return null;
  }
}

/**
 * 모든 특별 이벤트 조회
 */
export function getAllSpecialEvents() {
  try {
    return SPECIAL_EVENTS;
  } catch (error) {
    console.error('Failed to get all special events:', error);
    return [];
  }
}

/**
 * 활성 특별 이벤트 목록 조회
 */
export function getActiveSpecialEvents() {
  try {
    const now = new Date();
    const activeEvents = [];

    for (const event of SPECIAL_EVENTS) {
      if (isEventActive(event)) {
        activeEvents.push(event);
      }
    }

    return activeEvents;
  } catch (error) {
    console.error('Failed to get active special events:', error);
    return [];
  }
}

/**
 * 특별 이벤트 활성화 (관리자용)
 */
export function activateSpecialEvent(eventId) {
  try {
    if (!isRedisEnabled()) {
      console.warn('Redis is disabled, event not activated');
      return false;
    }

    const redis = getRedisClient();
    const event = SPECIAL_EVENTS.find(e => e.eventId === eventId);

    if (!event) {
      console.error(`Special event ${eventId} not found`);
      return false;
    }

    event.isActive = true;

    const key = `event:special:${eventId}`;
    redis.set(key, JSON.stringify(event), { EX: TTL.LONG });

    console.log(`Special event ${eventId} activated`);
    return true;
  } catch (error) {
    console.error('Failed to activate special event:', error);
    return false;
  }
}

/**
 * 특별 이벤트 비활성화 (관리자용)
 */
export function deactivateSpecialEvent(eventId) {
  try {
    if (!isRedisEnabled()) {
      console.warn('Redis is disabled, event not deactivated');
      return false;
    }

    const redis = getRedisClient();
    const event = SPECIAL_EVENTS.find(e => e.eventId === eventId);

    if (!event) {
      console.error(`Special event ${eventId} not found`);
      return false;
    }

    event.isActive = false;

    const key = `event:special:${eventId}`;
    redis.set(key, JSON.stringify(event), { EX: TTL.LONG });

    console.log(`Special event ${eventId} deactivated`);
    return true;
  } catch (error) {
    console.error('Failed to deactivate special event:', error);
    return false;
  }
}

/**
 * 이벤트 진행 업데이트
 */
export function updateSpecialEventProgress(characterId, taskId, progress) {
  try {
    const eventProgress = getEventProgress(characterId);
    if (!eventProgress) {
      return false;
    }

    // 모든 특별 이벤트에서 태스크 찾기
    for (const eventId in eventProgress.specialEvents) {
      const eventData = eventProgress.specialEvents[eventId];

      if (eventData.tasks && eventData.tasks[taskId] !== undefined) {
        eventData.tasks[taskId] = progress;

        // 태스크 완료 확인
        const taskDetails = eventData.taskDetails || [];
        const taskIndex = taskDetails.findIndex(t => t.id === taskId);

        if (taskIndex >= 0) {
          const taskInfo = taskDetails[taskIndex];
          const taskProgress = Array.isArray(progress)
            ? progress.length
            : progress;

          if (taskProgress >= taskInfo.requiredCount) {
            if (!eventData.completedTasks.includes(taskId)) {
              eventData.completedTasks.push(taskId);
            }

            // 모든 태스크 완료 확인
            if (eventData.completedTasks.length >= taskDetails.length) {
              eventData.status = 'completed';
              eventData.progress = taskDetails.length;
            } else {
              eventData.progress = eventData.completedTasks.length;
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

    console.error(`Task ${taskId} not found in any special event`);
    return false;
  } catch (error) {
    console.error('Failed to update special event progress:', error);
    return false;
  }
}

/**
 * 특별 이벤트 리워드 수령
 */
export function claimSpecialEventReward(characterId, eventId) {
  try {
    // 이미 수령했는지 확인
    if (hasClaimedReward(characterId, eventId, 'special')) {
      return {
        success: false,
        message: '이미 수령한 리워드입니다'
      };
    }

    // 이벤트 찾기
    const event = SPECIAL_EVENTS.find(e => e.eventId === eventId);
    if (!event) {
      return {
        success: false,
        message: '이벤트를 찾을 수 없습니다'
      };
    }

    // 활성 상태 확인
    if (!isEventActive(event)) {
      return {
        success: false,
        message: '활성된 이벤트가 아닙니다'
      };
    }

    // 진행 상태 확인
    const eventProgress = getEventProgress(characterId);
    const eventData = eventProgress?.specialEvents?.[eventId];

    if (!eventData || eventData.status !== 'completed') {
      return {
        success: false,
        message: '이벤트 미완료'
      };
    }

    // 리워드 지급
    const result = grantRewardsByEvent(characterId, eventId, event.rewards);

    if (result.success) {
      // 수령 마크
      markRewardClaimed(characterId, eventId, 'special');

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
    console.error('Failed to claim special event reward:', error);
    return {
      success: false,
      message: '리워드 수령 실패',
      error: error.message
    };
  }
}

/**
 * 캐릭터의 특별 이벤트 목록 조회
 */
export function getCharacterSpecialEvents(characterId) {
  try {
    const activeEvents = getActiveSpecialEvents();
    const eventProgress = getEventProgress(characterId);
    const specialEvents = eventProgress?.specialEvents || {};

    // 이벤트 목록에 진행 상태 추가
    const eventsWithProgress = activeEvents.map(event => {
      const progressData = specialEvents[event.eventId] || {
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
    console.error('Failed to get character special events:', error);
    return [];
  }
}

/**
 * 캐릭터 특별 이벤트 자동 초기화
 */
export function initializeCharacterSpecialEvents(characterId) {
  try {
    const activeEvents = getActiveSpecialEvents();

    // 각 활성 이벤트에 대해 진행 상태 초기화
    for (const event of activeEvents) {
      initializeSpecialEventProgress(characterId, event.eventId);
    }

    console.log(`Special events initialized for ${characterId}`);
    return true;
  } catch (error) {
    console.error('Failed to initialize character special events:', error);
    return false;
  }
}

/**
 * 이벤트 효과 적용
 */
export function applyEventEffects(eventId, roomId) {
  try {
    const event = SPECIAL_EVENTS.find(e => e.eventId === eventId);

    if (!event || !event.specialEffects) {
      return { success: false, message: '이벤트 효과 없음' };
    }

    const effects = event.specialEffects;

    // TODO: 실제 게임 월드에 효과 적용
    // - 월드 테마 변경
    // - NPC 코스튬 변경
    // - 배경음악 변경

    console.log(`Event effects applied to room ${roomId}:`, effects);

    return { success: true, effects };
  } catch (error) {
    console.error('Failed to apply event effects:', error);
    return {
      success: false,
      message: '이벤트 효과 적용 실패',
      error: error.message
    };
  }
}

/**
 * 이벤트 효과 제거
 */
export function removeEventEffects(eventId, roomId) {
  try {
    // TODO: 실제 게임 월드에서 효과 제거
    console.log(`Event effects removed from room ${roomId}`);

    return { success: true };
  } catch (error) {
    console.error('Failed to remove event effects:', error);
    return {
      success: false,
      message: '이벤트 효과 제거 실패',
      error: error.message
    };
  }
}

/**
 * 특별 이벤트 캐시 갱신
 */
export function cacheSpecialEvent(eventId) {
  try {
    if (!isRedisEnabled()) {
      return false;
    }

    const redis = getRedisClient();
    const event = SPECIAL_EVENTS.find(e => e.eventId === eventId);

    if (!event) {
      return false;
    }

    const key = `event:special:${eventId}`;
    redis.set(key, JSON.stringify(event), { EX: TTL.LONG });

    return true;
  } catch (error) {
    console.error('Failed to cache special event:', error);
    return false;
  }
}

/**
 * 캐시에서 특별 이벤트 불러오기
 */
export function getCachedSpecialEvent(eventId) {
  try {
    if (!isRedisEnabled()) {
      return null;
    }

    const redis = getRedisClient();
    const key = `event:special:${eventId}`;
    const data = redis.get(key);

    if (data) {
      return JSON.parse(data);
    }

    return null;
  } catch (error) {
    console.error('Failed to get cached special event:', error);
    return null;
  }
}