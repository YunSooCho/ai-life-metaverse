/**
 * Daily/Weekly Quest Manager - 일일/주간 퀘스트 관리자
 * Phase 7: 이벤트 시스템
 */

import {
  DAILY_QUEST_TEMPLATES,
  WEEKLY_QUEST_TEMPLATES,
  makeDailyQuestId,
  makeWeeklyQuestId,
  getTodayDateString,
  getWeekDateString
} from './event-data.js';
import {
  getEventProgress,
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
import { grantRewardsByEvent } from './event-reward-system.js';
import { getRedisClient, isRedisEnabled, TTL } from '../utils/redis-client.js';

/**
 * 일일 퀘스트 목록 조회
 */
export function getDailyQuests(characterId) {
  try {
    const today = getTodayDateString();
    const eventProgress = getEventProgress(characterId);
    const dailyQuests = eventProgress?.dailyQuests || {};

    // 리셋 필요 확인
    if (shouldResetDaily(characterId)) {
      resetDailyQuests(characterId);
      // 리셋 후 다시 불러오기
      return generateDailyQuestsForCharacter(characterId, today);
    }

    // 기존 퀘스트 반환
    const quests = [];
    for (const questId in dailyQuests) {
      const questData = dailyQuests[questId];
      const template = DAILY_QUEST_TEMPLATES.find(q => q.questId === questId.split('-').slice(0, -1).join('-'));

      if (template) {
        quests.push({
          ...template,
          questId: questId,
          status: questData.status,
          progress: questData.progress,
          maxProgress: questData.maxProgress,
          completedTasks: questData.completedTasks,
          rewardClaimed: questData.rewardClaimed || false
        });
      }
    }

    return quests;
  } catch (error) {
    console.error('Failed to get daily quests:', error);
    return [];
  }
}

/**
 * 주간 퀘스트 목록 조회
 */
export function getWeeklyQuests(characterId) {
  try {
    const weekStr = getWeekDateString();
    const eventProgress = getEventProgress(characterId);
    const weeklyQuests = eventProgress?.weeklyQuests || {};

    // 리셋 필요 확인
    if (shouldResetWeekly(characterId)) {
      resetWeeklyQuests(characterId);
      // 리셋 후 다시 불러오기
      return generateWeeklyQuestsForCharacter(characterId, weekStr);
    }

    // 기존 퀘스트 반환
    const quests = [];
    for (const questId in weeklyQuests) {
      const questData = weeklyQuests[questId];
      const template = WEEKLY_QUEST_TEMPLATES.find(q => q.questId === questId.split('-').slice(0, -1).join('-'));

      if (template) {
        quests.push({
          ...template,
          questId: questId,
          status: questData.status,
          progress: questData.maxProgress || template.tasks?.length || 0,
          maxProgress: questData.maxProgress || template.tasks?.length || 0,
          completedTasks: questData.completedTasks,
          rewardClaimed: questData.rewardClaimed || false
        });
      }
    }

    return quests;
  } catch (error) {
    console.error('Failed to get weekly quests:', error);
    return [];
  }
}

/**
 * 캐릭터용 일일 퀘스트 생성
 */
function generateDailyQuestsForCharacter(characterId, dateStr) {
  try {
    const quests = [];

    for (const template of DAILY_QUEST_TEMPLATES) {
      const questId = makeDailyQuestId(template.questId, dateStr);
      initializeDailyQuestProgress(characterId, questId, template.tasks);

      quests.push({
        ...template,
        questId,
        status: 'in_progress',
        progress: 0,
        maxProgress: template.tasks?.length || 0,
        completedTasks: [],
        rewardClaimed: false
      });
    }

    return quests;
  } catch (error) {
    console.error('Failed to generate daily quests:', error);
    return [];
  }
}

/**
 * 캐릭터용 주간 퀘스트 생성
 */
function generateWeeklyQuestsForCharacter(characterId, weekStr) {
  try {
    const quests = [];

    for (const template of WEEKLY_QUEST_TEMPLATES) {
      const questId = makeWeeklyQuestId(template.questId, weekStr);
      initializeWeeklyQuestProgress(characterId, questId, template.tasks);

      quests.push({
        ...template,
        questId,
        status: 'in_progress',
        progress: 0,
        maxProgress: template.tasks?.length || 0,
        completedTasks: [],
        rewardClaimed: false
      });
    }

    return quests;
  } catch (error) {
    console.error('Failed to generate weekly quests:', error);
    return [];
  }
}

/**
 * 일일 퀘스트 진행 업데이트
 */
export function updateDailyQuestProgress(characterId, eventType, data) {
  try {
    const eventProgress = getEventProgress(characterId);
    if (!eventProgress) {
      return false;
    }

    let updated = false;

    // 모든 일일 퀘스트에서 해당 타입의 태스크 찾기
    for (const questId in eventProgress.dailyQuests) {
      const questData = eventProgress.dailyQuests[questId];

      for (const task of questData.taskDetails || []) {
        if (task.type === eventType) {
          // 태스크 진행 업데이트
          const currentProgress = questData.tasks[task.id] || 0;
          const newProgress = currentProgress + (data.amount || 1);
          questData.tasks[task.id] = newProgress;

          // 태스크 완료 확인
          if (newProgress >= task.requiredCount) {
            if (!questData.completedTasks.includes(task.id)) {
              questData.completedTasks.push(task.id);
            }

            // 모든 태스크 완료 확인
            if (questData.completedTasks.length >= questData.taskDetails.length) {
              questData.status = 'completed';
              questData.progress = questData.taskDetails.length;
            } else {
              questData.progress = questData.completedTasks.length;
            }
          }

          updated = true;
        }
      }
    }

    if (updated) {
      // Redis에 저장
      if (isRedisEnabled()) {
        const redis = getRedisClient();
        const key = `event:progress:${characterId}`;
        redis.set(key, JSON.stringify(eventProgress), { EX: TTL.LONG });
      }
    }

    return updated;
  } catch (error) {
    console.error('Failed to update daily quest progress:', error);
    return false;
  }
}

/**
 * 주간 퀘스트 진행 업데이트
 */
export function updateWeeklyQuestProgress(characterId, eventType, data) {
  try {
    const eventProgress = getEventProgress(characterId);
    if (!eventProgress) {
      return false;
    }

    let updated = false;

    // 모든 주간 퀘스트에서 해당 타입의 태스크 찾기
    for (const questId in eventProgress.weeklyQuests) {
      const questData = eventProgress.weeklyQuests[questId];

      for (const task of questData.taskDetails || []) {
        if (task.type === eventType) {
          // 태스크 진행 업데이트
          const currentProgress = questData.tasks[task.id] || 0;
          const newProgress = currentProgress + (data.amount || 1);
          questData.tasks[task.id] = newProgress;

          // 태스크 완료 확인
          if (newProgress >= task.requiredCount) {
            if (!questData.completedTasks.includes(task.id)) {
              questData.completedTasks.push(task.id);
            }

            // 모든 태스크 완료 확인
            if (questData.completedTasks.length >= questData.taskDetails.length) {
              questData.status = 'completed';
              questData.progress = questData.taskDetails.length;
            } else {
              questData.progress = questData.completedTasks.length;
            }
          }

          updated = true;
        }
      }
    }

    if (updated) {
      // Redis에 저장
      if (isRedisEnabled()) {
        const redis = getRedisClient();
        const key = `event:progress:${characterId}`;
        redis.set(key, JSON.stringify(eventProgress), { EX: TTL.LONG });
      }
    }

    return updated;
  } catch (error) {
    console.error('Failed to update weekly quest progress:', error);
    return false;
  }
}

/**
 * 퀘스트 완료 처리 (리워드 지급)
 */
export function completeQuest(characterId, questId) {
  try {
    const eventProgress = getEventProgress(characterId);
    if (!eventProgress) {
      return {
        success: false,
        message: '진행 상태를 찾을 수 없습니다'
      };
    }

    // 일일 퀘스트에서 찾기
    const isDaily = eventProgress.dailyQuests.hasOwnProperty(questId);
    const isWeekly = eventProgress.weeklyQuests.hasOwnProperty(questId);

    let questType;
    if (isDaily) {
      questType = 'daily';
    } else if (isWeekly) {
      questType = 'weekly';
    } else {
      return {
        success: false,
        message: '퀘스트를 찾을 수 없습니다'
      };
    }

    const questData = isDaily
      ? eventProgress.dailyQuests[questId]
      : eventProgress.weeklyQuests[questId];

    // 완료 상태 확인
    if (questData.status !== 'completed') {
      return {
        success: false,
        message: '퀘스트 미완료'
      };
    }

    // 이미 수령했는지 확인
    if (questData.rewardClaimed) {
      return {
        success: false,
        message: '이미 수령한 리워드입니다'
      };
    }

    // 템플릿 찾기
    const baseQuestId = questId.split('-').slice(0, -1).join('-');
    const templates = isDaily ? DAILY_QUEST_TEMPLATES : WEEKLY_QUEST_TEMPLATES;
    const template = templates.find(q => q.questId === baseQuestId);

    if (!template) {
      return {
        success: false,
        message: '퀘스트 템플릿을 찾을 수 없습니다'
      };
    }

    // 리워드 지급
    const result = grantRewardsByEvent(characterId, questId, template.rewards);

    if (result.success) {
      // 수령 마크
      markRewardClaimed(characterId, questId, isDaily ? 'daily' : 'weekly');

      return {
        success: true,
        message: '리워드가 지급되었습니다',
        reward: template.rewards,
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
    console.error('Failed to complete quest:', error);
    return {
      success: false,
      message: '퀘스트 완료 실패',
      error: error.message
    };
  }
}

/**
 * 일일 퀘스트 리셋
 */
export function resetDailyQuests(characterId) {
  try {
    const today = getTodayDateString();
    const result = resetDailyQuests(characterId);

    // 새 퀘스트 생성
    if (result) {
      generateDailyQuestsForCharacter(characterId, today);
    }

    return result;
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
    const weekStr = getWeekDateString();
    const result = resetWeeklyQuests(characterId);

    // 새 퀘스트 생성
    if (result) {
      generateWeeklyQuestsForCharacter(characterId, weekStr);
    }

    return result;
  } catch (error) {
    console.error('Failed to reset weekly quests:', error);
    return false;
  }
}

/**
 * 캐릭터용 일일/주간 퀘스트 초기화
 */
export function initializeCharacterQuests(characterId) {
  try {
    const today = getTodayDateString();
    const weekStr = getWeekDateString();

    // 일일 퀘스트 초기화
    generateDailyQuestsForCharacter(characterId, today);

    // 주간 퀘스트 초기화
    generateWeeklyQuestsForCharacter(characterId, weekStr);

    console.log(`Quests initialized for ${characterId}`);
    return true;
  } catch (error) {
    console.error('Failed to initialize character quests:', error);
    return false;
  }
}

/**
 * 이벤트 타입별 퀘스트 진행 업데이트 (일반 함수)
 */
export function updateQuestProgressByEventType(characterId, eventType, data) {
  let updated = false;

  // 일일 퀘스트 업데이트
  if (updateDailyQuestProgress(characterId, eventType, data)) {
    updated = true;
  }

  // 주간 퀘스트 업데이트
  if (updateWeeklyQuestProgress(characterId, eventType, data)) {
    updated = true;
  }

  return updated;
}