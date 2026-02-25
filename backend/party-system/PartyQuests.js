/**
 * PartyQuests - 파티 퀘스트 시스템
 * 
 * 기능:
 * - 파티 전용 퀘스트
 * - 협동 기반 퀘스트
 * - 파티 보스전
 */

import EventEmitter from 'events';

export class PartyQuests extends EventEmitter {
  constructor() {
    super();
    this.partyQuests = new Map(); // partyId => Array<ActiveQuest>
    this.questDefinitions = new Map(); // questId => QuestDefinition
    this.questProgress = new Map(); // partyId:questId => Progress
  }

  /**
   * 파티 퀘스트 시작
   * @param {string} partyId - 파티 아이디
   * @param {string} questId - 퀘스트 정의 아이디
   * @returns {Object} 시작 결과
   */
  startQuest(partyId, questId) {
    const questDef = this.questDefinitions.get(questId);

    if (!questDef) {
      return {
        success: false,
        error: 'QUEST_NOT_FOUND',
        message: '퀘스트 정의를 찾을 수 없습니다.'
      };
    }

    // 활성 퀘스트 초기화
    if (!this.partyQuests.has(partyId)) {
      this.partyQuests.set(partyId, []);
    }

    const activeQuests = this.partyQuests.get(partyId);

    // 동일한 퀘스트가 이미 진행 중인지 확인
    if (activeQuests.some(q => q.questId === questId && !q.completed)) {
      return {
        success: false,
        error: 'QUEST_ALREADY_ACTIVE',
        message: '이미 진행 중인 퀘스트입니다.'
      };
    }

    // 퀘스트 시작
    const activeQuest = {
      id: `active_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      partyId,
      questId,
      ...questDef,
      startedAt: Date.now()
    };

    activeQuests.push(activeQuest);

    // 진행 상황 초기화
    const progressKey = `${partyId}:${activeQuest.id}`;
    this.questProgress.set(progressKey, {
      kills: 0,
      progress: 0,
      tasksCompleted: 0,
      membersContributed: []
    });

    this.emit('party:questStarted', { partyId, activeQuest });

    return {
      success: true,
      activeQuest
    };
  }

  /**
   * 퀘스트 진행 업데이트
   * @param {string} partyId - 파티 아이디
   * @param {string} activeQuestId - 활성 퀘스트 아이디
   * @param {string} playerId - 플레이어 아이디
   * @param {string} type - 업데이트 타입 (kill, progress, task)
   * @param {number} amount - 업데이트 양
   * @returns {Object} 업데이트 결과
   */
  updateQuestProgress(partyId, activeQuestId, playerId, type, amount = 1) {
    const activeQuests = this.partyQuests.get(partyId);

    if (!activeQuests) {
      return {
        success: false,
        error: 'NO_ACTIVE_QUESTS',
        message: '진행 중인 퀘스트가 없습니다.'
      };
    }

    const activeQuest = activeQuests.find(q => q.id === activeQuestId);

    if (!activeQuest || activeQuest.completed) {
      return {
        success: false,
        error: 'QUEST_NOT_ACTIVE',
        message: '퀘스트가 활성 상태가 아닙니다.'
      };
    }

    const progressKey = `${partyId}:${activeQuestId}`;
    const progress = this.questProgress.get(progressKey) || {
      kills: 0,
      progress: 0,
      tasksCompleted: 0,
      membersContributed: []
    };

    // 기여 멤버 기록
    if (!progress.membersContributed.includes(playerId)) {
      progress.membersContributed.push(playerId);
    }

    // 타입별 업데이트
    switch (type) {
      case 'kill':
        progress.kills += amount;
        break;
      case 'progress':
        progress.progress = Math.min(100, progress.progress + amount);
        break;
      case 'task':
        progress.tasksCompleted += amount;
        break;
      default:
        return {
          success: false,
          error: 'INVALID_TYPE',
          message: '잘못된 업데이트 타입입니다.'
        };
    }

    this.questProgress.set(progressKey, progress);

    // 퀘스트 완료 여부 확인
    const isCompleted = this.checkCompletion(activeQuest, progress);

    if (isCompleted) {
      activeQuest.completed = true;
      activeQuest.completedAt = Date.now();

      this.emit('party:questProgressUpdated', { partyId, activeQuestId, progress, completed: true });

      return {
        success: true,
        activeQuest,
        progress,
        completed: true
      };
    }

    this.emit('party:questProgressUpdated', { partyId, activeQuestId, progress, completed: false });

    return {
      success: true,
      activeQuest,
      progress,
      completed: false
    };
  }

  /**
   * 퀘스트 완료 조건 확인
   * @param {Object} activeQuest - 활성 퀘스트
   * @param {Object} progress - 진행 상황
   * @returns {boolean} 완료 여부
   */
  checkCompletion(activeQuest, progress) {
    switch (activeQuest.type) {
      case 'boss':
        return progress.kills >= activeQuest.targetKills;
      case 'dungeon':
        return progress.progress >= activeQuest.targetProgress;
      case 'collection':
        return progress.kills >= activeQuest.targetCount;
      case 'cooperation':
        return progress.tasksCompleted >= activeQuest.targetTasks;
      default:
        return false;
    }
  }

  /**
   * 활성 퀘스트 목록 조회
   * @param {string} partyId - 파티 아이디
   * @returns {Object} 퀘스트 목록
   */
  getActiveQuests(partyId) {
    const activeQuests = this.partyQuests.get(partyId) || [];

    const quests = activeQuests.map(q => {
      const progressKey = `${partyId}:${q.id}`;
      const progress = this.questProgress.get(progressKey) || {
        kills: 0,
        progress: 0,
        tasksCompleted: 0,
        membersContributed: []
      };

      return {
        ...q,
        progress
      };
    });

    return {
      success: true,
      partyId,
      quests
    };
  }

  /**
   * 퀘스트 정의 등록
   * @param {string} questId - 퀘스트 아이디
   * @param {Object} definition - 퀘스트 정의
   */
  registerQuestDefinition(questId, definition) {
    this.questDefinitions.set(questId, definition);
  }

  /**
   * 보스 퀘스트 생성
   * @param {number} partyLevel - 파티 레벨
   * @returns {Object} 보스 퀘스트
   */
  createBossQuest(partyLevel) {
    return {
      id: `boss_${Date.now()}`,
      type: 'boss',
      title: '파티 보스전',
      description: '강력한 보스 몬스터를 협동해서 처치하세요',
      targetKills: 1,
      level: partyLevel,
      reward: {
        exp: Math.floor(1000 * (1 + partyLevel * 0.1)),
        coins: Math.floor(500 * (1 + partyLevel * 0.1)),
        items: ['boss_reward_' + (Math.floor(Math.random() * 3) + 1)]
      },
      timeLimit: 30 * 60 * 1000 // 30분
    };
  }

  /**
   * 협동 퀘스트 생성
   * @param {number} partyLevel - 파티 레벨
   * @returns {Object} 협동 퀘스트
   */
  createCooperationQuest(partyLevel) {
    const taskTypes = ['대화', '전투', '탐험', '수집'];
    const randomType = taskTypes[Math.floor(Math.random() * taskTypes.length)];

    return {
      id: `coop_${Date.now()}`,
      type: 'cooperation',
      title: '협동 임무',
      description: `파티원과 함께 ${randomType} 임무를 완수하세요`,
      targetTasks: Math.floor(5 + partyLevel * 0.5),
      level: partyLevel,
      reward: {
        exp: Math.floor(800 * (1 + partyLevel * 0.1)),
        coins: Math.floor(400 * (1 + partyLevel * 0.1)),
        items: ['coop_reward_common']
      },
      timeLimit: 60 * 60 * 1000 // 1시간
    };
  }

  /**
   * 랜덤 퀘스트 생성
   * @param {number} partyLevel - 파티 레벨
   * @returns {Object} 랜덤 퀘스트
   */
  generateRandomQuest(partyLevel) {
    const questTypes = ['boss', 'cooperation'];
    const randomType = questTypes[Math.floor(Math.random() * questTypes.length)];

    switch (randomType) {
      case 'boss':
        return this.createBossQuest(partyLevel);
      case 'cooperation':
        return this.createCooperationQuest(partyLevel);
      default:
        return this.createCooperationQuest(partyLevel);
    }
  }

  /**
   * 퀘스트 포기
   * @param {string} partyId - 파티 아이디
   * @param {string} activeQuestId - 활성 퀘스트 아이디
   * @returns {Object} 포기 결과
   */
  abortQuest(partyId, activeQuestId) {
    const activeQuests = this.partyQuests.get(partyId);

    if (!activeQuests) {
      return {
        success: false,
        error: 'NO_ACTIVE_QUESTS',
        message: '진행 중인 퀘스트가 없습니다.'
      };
    }

    const questIndex = activeQuests.findIndex(q => q.id === activeQuestId);

    if (questIndex === -1) {
      return {
        success: false,
        error: 'QUEST_NOT_FOUND',
        message: '퀘스트를 찾을 수 없습니다.'
      };
    }

    const abortedQuest = activeQuests[questIndex];
    activeQuests.splice(questIndex, 1);

    // 진행 상황 삭제
    const progressKey = `${partyId}:${activeQuestId}`;
    this.questProgress.delete(progressKey);

    this.emit('party:questAborted', { partyId, activeQuestId, abortedQuest });

    return {
      success: true,
      partyId,
      activeQuestId,
      abortedQuest
    };
  }

  /**
   * 파티 퀘스트 정리
   * @param {string} partyId - 파티 아이디
   */
  cleanupPartyQuests(partyId) {
    this.partyQuests.delete(partyId);
    
    // 연결된 진행 상황 정리
    for (const [key] of this.questProgress) {
      if (key.startsWith(`${partyId}:`)) {
        this.questProgress.delete(key);
      }
    }
  }

  /**
   * 만료된 퀘스트 정리 (시간 초과)
   * @returns {Object} 정리 결과
   */
  cleanupExpiredQuests() {
    const now = Date.now();
    let expiredCount = 0;

    this.partyQuests.forEach((activeQuests, partyId) => {
      const validQuests = [];

      activeQuests.forEach(quest => {
        const elapsed = now - quest.startedAt;
        const timeLimit = quest.timeLimit || (60 * 60 * 1000); // 기본 1시간

        if (elapsed < timeLimit && !quest.completed) {
          validQuests.push(quest);
        } else {
          expiredCount++;
          const progressKey = `${partyId}:${quest.id}`;
          this.questProgress.delete(progressKey);

          this.emit('party:questExpired', { partyId, quest });
        }
      });

      this.partyQuests.set(partyId, validQuests);
    });

    return {
      success: true,
      expiredCount
    };
  }

  /**
   * 퀘스트 통계 조회
   * @returns {Object} 통계 정보
   */
  getStats() {
    let totalActiveQuests = 0;
    let totalCompletedQuests = 0;

    this.partyQuests.forEach((quests) => {
      quests.forEach(quest => {
        if (quest.completed) {
          totalCompletedQuests++;
        } else {
          totalActiveQuests++;
        }
      });
    });

    return {
      totalQuestDefinitions: this.questDefinitions.size,
      totalActiveQuests,
      totalCompletedQuests,
      activeParties: this.partyQuests.size
    };
  }
}