/**
 * Event Progress Manager - 이벤트 진행 상태 관리자
 * Phase 7: 이벤트 시스템
 */

import { getRedisClient, isRedisEnabled, TTL } from '../utils/redis-client.js';

/**
 * 이벤트 진행 상태 조회
 */
export function getEventProgress(characterId) {
  try {
    if (!isRedisEnabled()) {
      // Redis 없이 메모리에서 기본 상태 반환
      return {
        characterId,
        seasonEvents: {},
        specialEvents: {},
        dailyQuests: {},
        weeklyQuests: {},
        lastDailyReset: null,
        lastWeeklyReset: null
      };
    }

    const redis = getRedisClient();
    const key = `event:progress:${characterId}`;
    const data = redis.get(key);

    if (data) {
      return JSON.parse(data);
    }

    // 초기 상태 반환
    return {
      characterId,
      seasonEvents: {},
      specialEvents: {},
      dailyQuests: {},
      weeklyQuests: {},
      lastDailyReset: null,
      lastWeeklyReset: null
    };
  } catch (error) {
    console.error('Failed to get event progress:', error);
    return null;
  }
}

/**
 * 이벤트 진행 상태 저장
 */
export function saveEventProgress(characterId, progress) {
  try {
    if (!isRedisEnabled()) {
      console.warn('Redis is disabled, event progress not saved');
      return false;
    }

    const redis = getRedisClient();
    const key = `event:progress:${characterId}`;
    redis.set(key, JSON.stringify(progress), { EX: TTL.LONG });

    return true;
  } catch (error) {
    console.error('Failed to save event progress:', error);
    return false;
  }
}

/**
 * 이벤트 진행 상태 초기화 (없을 때 생성)
 */
export function initializeEventProgress(characterId) {
  const existing = getEventProgress(characterId);
  if (!existing) {
    const initial = {
      characterId,
      seasonEvents: {},
      specialEvents: {},
      dailyQuests: {},
      weeklyQuests: {},
      lastDailyReset: null,
      lastWeeklyReset: null
    };
    saveEventProgress(characterId, initial);
    return initial;
  }
  return existing;
}

/**
 * 태스크 진행 업데이트
 * progress: number (0~requiredCount) 또는 추가 정보
 */
export function updateTaskProgress(characterId, taskId, progress) {
  try {
    const eventProgress = getEventProgress(characterId);
    if (!eventProgress) {
      return false;
    }

    // 모든 이벤트/퀘스트에서 태스크 찾기
    const allEvents = {
      ...eventProgress.seasonEvents,
      ...eventProgress.specialEvents,
      ...eventProgress.dailyQuests,
      ...eventProgress.weeklyQuests
    };

    for (const eventId in allEvents) {
      const eventData = allEvents[eventId];
      if (eventData.tasks && eventData.tasks[taskId]) {
        eventData.tasks[taskId] = progress;

        // 전체 진행률 계산
        if (eventData.maxProgress !== undefined) {
          const completedCount = Object.values(eventData.tasks).filter(
            (val, idx, arr) => {
              const taskInfo = eventData.taskDetails?.[idx];
              const taskProgress = Array.isArray(val) ? val.length : val;
              return taskProgress >= taskInfo?.requiredCount;
            }
          ).length;
          eventData.progress = completedCount;
        }

        saveEventProgress(characterId, eventProgress);
        return true;
      }
    }

    console.error(`Task ${taskId} not found in any event`);
    return false;
  } catch (error) {
    console.error('Failed to update task progress:', error);
    return false;
  }
}

/**
 * 태스크 완료
 */
export function completeTask(characterId, taskId) {
  return updateTaskProgress(characterId, taskId, 'completed');
}

/**
 * 이벤트 진행 데이터 초기화 (시즌 이벤트)
 */
export function initializeSeasonEventProgress(characterId, seasonEventId) {
  try {
    const eventProgress = initializeEventProgress(characterId);

    eventProgress.seasonEvents[seasonEventId] = {
      status: 'in_progress',
      completedTasks: [],
      progress: 0,
      maxProgress: 0,
      tasks: {},
      taskDetails: []
    };

    saveEventProgress(characterId, eventProgress);
    return true;
  } catch (error) {
    console.error('Failed to initialize season event progress:', error);
    return false;
  }
}

/**
 * 특별 이벤트 진행 데이터 초기화
 */
export function initializeSpecialEventProgress(characterId, eventId) {
  try {
    const eventProgress = initializeEventProgress(characterId);

    eventProgress.specialEvents[eventId] = {
      status: 'in_progress',
      completedTasks: [],
      progress: 0,
      maxProgress: 0,
      tasks: {},
      taskDetails: []
    };

    saveEventProgress(characterId, eventProgress);
    return true;
  } catch (error) {
    console.error('Failed to initialize special event progress:', error);
    return false;
  }
}

/**
 * 일일 퀘스트 진행 데이터 초기화
 */
export function initializeDailyQuestProgress(characterId, questId, tasks) {
  try {
    const eventProgress = initializeEventProgress(characterId);

    const taskDetails = tasks.map(task => ({
      id: task.id,
      description: task.description,
      type: task.type,
      targetId: task.targetId,
      requiredCount: task.requiredCount
    }));

    eventProgress.dailyQuests[questId] = {
      status: 'in_progress',
      completedTasks: [],
      progress: 0,
      maxProgress: tasks.length,
      tasks: {},
      taskDetails,
      rewardClaimed: false
    };

    saveEventProgress(characterId, eventProgress);
    return true;
  } catch (error) {
    console.error('Failed to initialize daily quest progress:', error);
    return false;
  }
}

/**
 * 주간 퀘스트 진행 데이터 초기화
 */
export function initializeWeeklyQuestProgress(characterId, questId, tasks) {
  try {
    const eventProgress = initializeEventProgress(characterId);

    const taskDetails = tasks.map(task => ({
      id: task.id,
      description: task.description,
      type: task.type,
      targetId: task.targetId,
      requiredCount: task.requiredCount
    }));

    eventProgress.weeklyQuests[questId] = {
      status: 'in_progress',
      completedTasks: [],
      progress: 0,
      maxProgress: tasks.length,
      tasks: {},
      taskDetails,
      rewardClaimed: false
    };

    saveEventProgress(characterId, eventProgress);
    return true;
  } catch (error) {
    console.error('Failed to initialize weekly quest progress:', error);
    return false;
  }
}

/**
 * 일일 퀘스트 리셋
 */
export function resetDailyQuests(characterId) {
  try {
    const eventProgress = getEventProgress(characterId);
    if (!eventProgress) {
      return false;
    }

    const today = new Date().toISOString().split('T')[0];
    eventProgress.dailyQuests = {};
    eventProgress.lastDailyReset = today;

    saveEventProgress(characterId, eventProgress);
    return true;
  } catch (error) {
    console.error('Failed to reset daily quests:', error);
    return false;
  }
}

/**
 * 주간 퀘스트 리셋
 */
export function resetWeeklyQuests(characterId) {
  try {
    const eventProgress = getEventProgress(characterId);
    if (!eventProgress) {
      return false;
    }

    eventProgress.weeklyQuests = {};
    eventProgress.lastWeeklyReset = new Date().toISOString();

    saveEventProgress(characterId, eventProgress);
    return true;
  } catch (error) {
    console.error('Failed to reset weekly quests:', error);
    return false;
  }
}

/**
 * 일일 퀘스트 리셋 필요 여부 확인
 */
export function shouldResetDaily(characterId) {
  try {
    const eventProgress = getEventProgress(characterId);
    if (!eventProgress) {
      return true;
    }

    const today = new Date().toISOString().split('T')[0];
    return eventProgress.lastDailyReset !== today;
  } catch (error) {
    console.error('Failed to check daily reset:', error);
    return true;
  }
}

/**
 * 주간 퀘스트 리셋 필요 여부 확인
 */
export function shouldResetWeekly(characterId) {
  try {
    const eventProgress = getEventProgress(characterId);
    if (!eventProgress) {
      return true;
    }

    const currentWeek = getCurrentWeekString();
    const lastReset = eventProgress.lastWeeklyReset
      ? getWeekStringFromISO(eventProgress.lastWeeklyReset)
      : null;

    return lastReset !== currentWeek;
  } catch (error) {
    console.error('Failed to check weekly reset:', error);
    return true;
  }
}

/**
 * ISO 타임스탬프에서 주차 문자열 추출
 */
function getWeekStringFromISO(isoString) {
  const date = new Date(isoString);
  const year = date.getFullYear();
  const week = getCurrentWeekNumber(date);
  return `${year}-W${String(week).padStart(2, '0')}`;
}

/**
 * 현재 주차 문자열
 */
function getCurrentWeekString() {
  const now = new Date();
  const year = now.getFullYear();
  const week = getCurrentWeekNumber(now);
  return `${year}-W${String(week).padStart(2, '0')}`;
}

/**
 * 현재 주차 계산 (헬퍼 함수)
 */
function getCurrentWeekNumber(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

/**
 * 이벤트 완료 상태로 변경
 */
export function markEventCompleted(characterId, eventId, eventType) {
  try {
    const eventProgress = getEventProgress(characterId);
    if (!eventProgress) {
      return false;
    }

    let eventsMap;
    switch (eventType) {
      case 'seasonal':
        eventsMap = eventProgress.seasonEvents;
        break;
      case 'special':
        eventsMap = eventProgress.specialEvents;
        break;
      case 'daily':
        eventsMap = eventProgress.dailyQuests;
        break;
      case 'weekly':
        eventsMap = eventProgress.weeklyQuests;
        break;
      default:
        return false;
    }

    if (eventsMap[eventId]) {
      eventsMap[eventId].status = 'completed';
      eventsMap[eventId].completedAt = new Date().toISOString();
      saveEventProgress(characterId, eventProgress);
      return true;
    }

    return false;
  } catch (error) {
    console.error('Failed to mark event completed:', error);
    return false;
  }
}

/**
 * 리워드 수령 마크
 */
export function markRewardClaimed(characterId, eventId, eventType) {
  try {
    const eventProgress = getEventProgress(characterId);
    if (!eventProgress) {
      return false;
    }

    let eventsMap;
    switch (eventType) {
      case 'seasonal':
        eventsMap = eventProgress.seasonEvents;
        break;
      case 'special':
        eventsMap = eventProgress.specialEvents;
        break;
      case 'daily':
        eventsMap = eventProgress.dailyQuests;
        break;
      case 'weekly':
        eventsMap = eventProgress.weeklyQuests;
        break;
      default:
        return false;
    }

    if (eventsMap[eventId]) {
      eventsMap[eventId].rewardClaimed = true;
      eventsMap[eventId].rewardClaimedAt = new Date().toISOString();
      saveEventProgress(characterId, eventProgress);
      return true;
    }

    return false;
  } catch (error) {
    console.error('Failed to mark reward claimed:', error);
    return false;
  }
}

/**
 * 리워드 수령 여부 확인
 */
export function hasClaimedReward(characterId, eventId, eventType) {
  try {
    const eventProgress = getEventProgress(characterId);
    if (!eventProgress) {
      return false;
    }

    let eventsMap;
    switch (eventType) {
      case 'seasonal':
        eventsMap = eventProgress.seasonEvents;
        break;
      case 'special':
        eventsMap = eventProgress.specialEvents;
        break;
      case 'daily':
        eventsMap = eventProgress.dailyQuests;
        break;
      case 'weekly':
        eventsMap = eventProgress.weeklyQuests;
        break;
      default:
        return false;
    }

    return eventsMap[eventId]?.rewardClaimed || false;
  } catch (error) {
    console.error('Failed to check reward claimed:', error);
    return false;
  }
}