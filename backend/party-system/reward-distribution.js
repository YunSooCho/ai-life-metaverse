/**
 * RewardDistribution - 보상 분배 시스템
 * 퀘스트 보상 분배, 파티 전용 보상 관리
 * Redis 기반 영속화 + 메모리 fallback
 */

export default class RewardDistribution {
  constructor(redisClient = null, partyManager = null, expShare = null) {
    this.redis = redisClient;
    this.partyManager = partyManager;
    this.expShare = expShare;
    this.partyQuests = new Map(); // partyId -> quest object
  }

  /**
   * 종합 보상 분배
   * @param {string} partyId - 파티 ID
   * @param {Array} partyMembers - 파티원 배열 [{id, name, level}]
   * @param {Object} rewards - 보상 객체 {exp, gold, items}
   * @returns {Object} 분배 결과
   */
  distributeAllRewards(partyId, partyMembers, rewards) {
    const distribution = {
      partyId,
      members: {},
      total: {
        exp: rewards.exp || 0,
        gold: rewards.gold || 0,
        items: rewards.items || []
      },
      timestamp: Date.now()
    };

    // 경험치 분배
    if (rewards.exp && this.expShare) {
      const expDist = this.expShare.calculateExpDistribution(partyMembers, rewards.exp);
      distribution.members = { ...distribution.members, ...expDist };
    }

    // 골드 분배 (균등)
    if (rewards.gold) {
      const goldPerMember = Math.floor(rewards.gold / partyMembers.length);
      partyMembers.forEach(member => {
        if (!distribution.members[member.id]) {
          distribution.members[member.id] = {};
        }
        distribution.members[member.id].gold = goldPerMember;
      });
    }

    // 아이템 분배 (랜덤 1명에게)
    if (rewards.items && rewards.items.length > 0) {
      const luckyMember = partyMembers[Math.floor(Math.random() * partyMembers.length)];
      if (!distribution.members[luckyMember.id]) {
        distribution.members[luckyMember.id] = {};
      }
      distribution.members[luckyMember.id].items = [...rewards.items];
    }

    // Redis에 저장
    if (this.redis) {
      this.redis.setEx(
        `reward:${partyId}:${Date.now()}`,
        3600,
        JSON.stringify(distribution)
      );
    }

    return distribution;
  }

  /**
   * 파티 전용 퀘스트 생성
   * @param {string} partyId - 파티 ID
   * @param {Object} questData - 퀘스트 데이터
   * @returns {Object} 생성된 퀘스트
   */
  createPartyQuest(partyId, questData = {}) {
    const quest = {
      id: questData.id || `quest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      partyId,
      type: questData.type || 'explore',
      title: questData.title || '특별 퀘스트',
      description: questData.description || '특별 임무',
      objectives: questData.objectives || {
        complete_tasks: { current: 0, target: 5 },
        defeat_monsters: { current: 0, target: 10 }
      },
      rewards: questData.rewards || {
        exp: 1000,
        gold: 500,
        items: []
      },
      createdAt: Date.now(),
      expiresAt: Date.now() + 3600000, // 1시간
      status: 'active',
      participants: questData.participants || []
    };

    this.partyQuests.set(partyId, quest);

    if (this.redis) {
      this.redis.setEx(
        `party_quest:${partyId}`,
        3600,
        JSON.stringify(quest)
      );
    }

    return quest;
  }

  /**
   * 파티 전용 퀘스트 조회
   * @param {string} partyId - 파티 ID
   * @returns {Object|null} 퀘스트 정보
   */
  getPartyQuest(partyId) {
    return this.partyQuests.get(partyId) || null;
  }

  /**
   * 파티 전용 퀘스트 완료
   * @param {string} partyId - 파티 ID
   * @param {string} questId - 퀘스트 ID
   * @returns {Object} 완료 결과
   */
  completePartyQuest(partyId, questId) {
    const quest = this.partyQuests.get(partyId);
    if (!quest) {
      throw new Error('No party quests found');
    }

    if (quest.id !== questId) {
      throw new Error('Quest not found');
    }

    quest.status = 'completed';
    quest.completedAt = Date.now();

    if (this.redis) {
      this.redis.del(`party_quest:${partyId}`);
    }

    return {
      success: true,
      questId,
      questType: quest.type,
      rewards: quest.rewards,
      completedAt: quest.completedAt
    };
  }

  /**
   * 퀘스트 목표 진행 업데이트
   * @param {string} partyId - 파티 ID
   * @param {string} objectiveType - 목표 유형
   * @param {number} amount - 증가량
   * @returns {Object} 진행 결과
   */
  updateObjectiveProgress(partyId, objectiveType, amount) {
    const quest = this.partyQuests.get(partyId);
    if (!quest) {
      return { partyId, objectiveType, progress: undefined };
    }

    if (quest.objectives[objectiveType]) {
      quest.objectives[objectiveType].current = Math.min(
        quest.objectives[objectiveType].current + amount,
        quest.objectives[objectiveType].target
      );

      // 모든 목표 완료 확인
      const allCompleted = Object.values(quest.objectives).every(
        obj => obj.current >= obj.target
      );

      if (allCompleted && quest.status === 'active') {
        quest.status = 'ready_to_complete';
      }

      if (this.redis) {
        this.redis.setEx(
          `party_quest:${partyId}`,
          3600,
          JSON.stringify(quest)
        );
      }
    }

    return {
      partyId,
      objectiveType,
      progress: quest.objectives[objectiveType]?.current,
      target: quest.objectives[objectiveType]?.target,
      completed: quest.objectives[objectiveType]?.current >= quest.objectives[objectiveType]?.target
    };
  }

  /**
   * 만료된 퀘스트 정리
   * @returns {Array} 삭제된 퀘스트 목록
   */
  cleanupExpiredQuests() {
    const now = Date.now();
    const expired = [];

    for (const [partyId, quest] of this.partyQuests.entries()) {
      if (quest.expiresAt && quest.expiresAt < now) {
        this.partyQuests.delete(partyId);
        expired.push(quest);

        if (this.redis) {
          this.redis.del(`party_quest:${partyId}`);
        }
      }
    }

    return expired;
  }
}