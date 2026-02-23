/**
 * PartyQuests - 파티 퀘스트 시스템 (확장)
 * - 파티 전용 퀘스트
 * - 협동 기반 퀘스트
 * - 파티 보스전
 */

import EventEmitter from 'events';

export default class PartyQuests extends EventEmitter {
  constructor() {
    super();
    this.activeQuests = new Map(); // partyId -> Quest
    this.questCounter = 0;
    this.bossBattles = new Map(); // partyId -> BossBattle
  }

  /**
   * 협동 퀘스트 시작
   * @param {string} partyId - 파티 ID
   * @param {string} questType - 퀘스트 유형 (cooperation, boss, exploration)
   * @param {Object} params - 퀘스트 파라미터
   * @returns {Object} 시작된 퀘스트
   */
  startCooperativeQuest(partyId, questType = 'cooperation', params = {}) {
    const quest = {
      id: this._generateQuestId(),
      partyId,
      type: questType,
      title: params.title || this._getQuestTitle(questType),
      description: params.description || this._getQuestDescription(questType),
      difficulty: params.difficulty || 'medium',
      level: params.level || 1,
      objectives: params.objectives || this._getDefaultObjectives(questType),
      rewards: {
        exp: (params.level || 1) * 150 * (params.difficultyMultiplier || 1),
        coins: (params.level || 1) * 75 * (params.difficultyMultiplier || 1),
        items: params.rewardItems || []
      },
      timeLimit: params.timeLimit || 3600000, // 1시간 (ms)
      createdAt: Date.now(),
      expiresIn: Date.now() + (params.timeLimit || 3600000),
      status: 'active', // active, completed, failed, expired
      objectivesProgress: {},
      progress: 0
    };

    // 목표 진행 상황 초기화
    quest.objectives.forEach(obj => {
      quest.objectivesProgress[obj.type] = {
        target: obj.count || obj.target || 1,
        current: 0
      };
    });

    this.activeQuests.set(partyId, quest);

    this.emit('cooperativeQuestStarted', { partyId, quest });
    return quest;
  }

  /**
   * 파티 보스전 시작
   * @param {string} partyId - 파티 ID
   * @param {string} bossId - 보스 ID
   * @param {Object} bossData - 보스 데이터
   * @returns {Object} 시작된 보스전
   */
  startBossBattle(partyId, bossId, bossData = {}) {
    const bossBattle = {
      id: this._generateQuestId(),
      partyId,
      type: 'boss',
      boss: {
        id: bossId,
        name: bossData.name || 'Unknown Boss',
        level: bossData.level || 1,
        maxHP: bossData.maxHP || 1000,
        hp: bossData.maxHP || 1000,
        attack: bossData.attack || 50,
        defense: bossData.defense || 30,
        skills: bossData.skills || []
      },
      partyDamage: new Map(), // playerId -> damage
      phase: 'preparation', // preparation, fighting, completed, failed
      createdAt: Date.now(),
      timeLimit: 600000, // 10분
      status: 'active'
    };

    this.bossBattles.set(partyId, bossBattle);

    this.emit('bossBattleStarted', { partyId, bossBattle });
    return bossBattle;
  }

  /**
   * 보스에 데미지 입력
   * @param {string} partyId - 파티 ID
   * @param {string} playerId - 플레이어 ID
   * @param {number} damage - 데미지
   * @returns {Object} 결과
   */
  dealBossDamage(partyId, playerId, damage) {
    const bossBattle = this.bossBattles.get(partyId);
    if (!bossBattle) {
      throw new Error('No boss battle in progress');
    }

    if (bossBattle.status !== 'active' || bossBattle.phase !== 'fighting') {
      throw new Error('Boss battle is not in fighting phase');
    }

    // 데미지 적용
    const actualDamage = Math.max(0, damage);
    bossBattle.boss.hp = Math.max(0, bossBattle.boss.hp - actualDamage);

    // 플레이어 데미지 기록
    const playerDamage = bossBattle.partyDamage.get(playerId) || 0;
    bossBattle.partyDamage.set(playerId, playerDamage + actualDamage);

    // 보스 사망 확인
    if (bossBattle.boss.hp <= 0) {
      bossBattle.phase = 'completed';
      bossBattle.status = 'completed';
      bossBattle.completedAt = Date.now();

      this.emit('bossDefeated', { partyId, bossBattle });
      return {
        success: true,
        bossDefeated: true,
        hp: bossBattle.boss.hp
      };
    }

    this.emit('bossDamaged', { partyId, playerId, damage: actualDamage });
    return {
      success: true,
      bossDefeated: false,
      hp: bossBattle.boss.hp
    };
  }

  /**
   * 퀘스트 목표 진행
   * @param {string} partyId - 파티 ID
   * @param {string} objectiveType - 목표 유형
   * @param {number} progress - 진행 양
   * @returns {Object|undefined} 결과
   */
  progressObjective(partyId, objectiveType, progress = 1) {
    const quest = this.activeQuests.get(partyId);
    if (!quest) {
      throw new Error('No active quest for this party');
    }

    // 목표 유형이 없으면 무시 (undefined 반환)
    if (!quest.objectivesProgress[objectiveType]) {
      return undefined;
    }

    quest.objectivesProgress[objectiveType].current += progress;

    // 목표 완료 확인
    const target = quest.objectivesProgress[objectiveType].target;
    const current = quest.objectivesProgress[objectiveType].current;

    if (current >= target) {
      this._checkQuestCompletion(partyId, quest);
    }

    this.emit('objectiveProgress', { partyId, objectiveType, progress });
    return quest.objectivesProgress;
  }

  /**
   * 퀘스트 포기
   * @param {string} partyId - 파티 ID
   * @returns {Object} 결과
   */
  abandonQuest(partyId) {
    const quest = this.activeQuests.get(partyId);
    if (!quest) {
      throw new Error('No active quest for this party');
    }

    quest.status = 'failed';
    quest.failedAt = Date.now();

    this.activeQuests.delete(partyId);

    this.emit('cooperativeQuestAbandoned', { partyId, quest });
    return { success: true, quest };
  }

  /**
   * 활성 퀘스트 조회
   * @param {string} partyId - 파티 ID
   * @returns {Object|null} 활성 퀘스트
   */
  getActiveQuest(partyId) {
    return this.activeQuests.get(partyId) || null;
  }

  /**
   * 보스전 조회
   * @param {string} partyId - 파티 ID
   * @returns {Object|null} 보스전 정보
   */
  getBossBattle(partyId) {
    return this.bossBattles.get(partyId) || null;
  }

  /**
   * 퀘스트 완료 확인
   * @private
   * @param {string} partyId - 파티 ID
   * @param {Object} quest - 퀘스트
   */
  _checkQuestCompletion(partyId, quest) {
    const allComplete = Object.values(quest.objectivesProgress).every(
      progress => progress.current >= progress.target
    );

    if (allComplete) {
      quest.status = 'completed';
      quest.completedAt = Date.now();

      // 보상 분배
      this.emit('cooperativeQuestCompleted', { partyId, quest });
    }
  }

  /**
   * 퀘스트 ID 생성
   * @private
   * @returns {string}
   */
  _generateQuestId() {
    return `pq_${++this.questCounter}`;
  }

  /**
   * 퀘스트 제목 반환
   * @private
   * @param {string} questType - 퀘스트 유형
   * @returns {string}
   */
  _getQuestTitle(questType) {
    const titles = {
      cooperation: 'Unity Challenge: Together We Triumph',
      boss: 'Epic Boss Battle: Defeat the Great Evil',
      exploration: 'Exploration: Discover Hidden Treasures Together',
      scavenger: 'Party Scavenger Hunt: Find the Lost Artifacts'
    };
    return titles[questType] || 'Party Adventure';
  }

  /**
   * 퀘스트 설명 반환
   * @private
   * @param {string} questType - 퀘스트 유형
   * @returns {string}
   */
  _getQuestDescription(questType) {
    const descriptions = {
      cooperation: 'Work together with your party members to overcome challenges!',
      boss: 'Face a powerful boss alongside your allies. Only together can you triumph!',
      exploration: 'Explore the world as a team and discover legendary treasures!',
      scavenger: 'Hunt for rare artifacts scattered across the lands with your party!'
    };
    return descriptions[questType] || 'Embark on a party adventure!';
  }

  /**
   * 기본 목표 반환
   * @private
   * @param {string} questType - 퀘스트 유형
   * @returns {Array}
   */
  _getDefaultObjectives(questType) {
    const objectives = {
      cooperation: [
        { type: 'complete_tasks', count: 5, target: 5, description: 'Complete 5 tasks' },
        { type: 'defeat_monsters', count: 10, target: 10, description: 'Defeat 10 monsters' }
      ],
      boss: [
        { type: 'defeat_boss', count: 1, target: 1, description: 'Defeat the boss' }
      ],
      exploration: [
        { type: 'discover_locations', count: 3, target: 3, description: 'Discover 3 locations' },
        { type: 'collect_items', count: 5, target: 5, description: 'Collect 5 rare items' }
      ],
      scavenger: [
        { type: 'find_artifacts', count: 4, target: 4, description: 'Find 4 artifacts' }
      ]
    };
    return objectives[questType] || [];
  }

  /**
   * 만료된 퀘스트 정리
   * @returns {Array} 만료된 퀘스트 목록
   */
  cleanupExpiredQuests() {
    const now = Date.now();
    const expired = [];

    this.activeQuests.forEach((quest, partyId) => {
      if (now > quest.expiresIn && quest.status === 'active') {
        quest.status = 'expired';
        quest.expiredAt = now;
        expired.push({ partyId, quest });
        this.activeQuests.delete(partyId);
        this.emit('cooperativeQuestExpired', { partyId, quest });
      }
    });

    this.bossBattles.forEach((battle, partyId) => {
      if (now > (battle.createdAt + battle.timeLimit) && battle.status === 'active') {
        battle.status = 'failed';
        battle.failedAt = now;
        expired.push({ partyId, battle });
        this.bossBattles.delete(partyId);
        this.emit('bossBattleExpired', { partyId, battle });
      }
    });

    return expired;
  }
}