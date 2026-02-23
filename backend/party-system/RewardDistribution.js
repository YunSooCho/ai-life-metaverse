/**
 * RewardDistribution - 보상 분배 시스템
 * 
 * 기능:
 * - 퀘스트 보상 분배
 * - 파티 내 랜덤 퀘스트 생성
 * - 파티 전용 보상
 */

import EventEmitter from 'events';

export class RewardDistribution extends EventEmitter {
  constructor() {
    super();
    this.partyQuests = new Map(); // partyId => Array<Quest>
    this.questRewards = new Map(); // questId => Reward
  }

  /**
   * 퀘스트 보상 분배
   * @param {string} questId - 퀘스트 아이디
   * @param {Array} partyMembers - 파티원 목록
   * @param {string} distributionType - 분배 방법 (equal, random, based_on_contribution)
   * @returns {Object} 분배 결과
   */
  distributeQuestReward(questId, partyMembers, distributionType = 'equal') {
    const reward = this.questRewards.get(questId);

    if (!reward) {
      return {
        success: false,
        error: 'REWARD_NOT_FOUND',
        message: '퀘스트 보상을 찾을 수 없습니다.'
      };
    }

    let distributions = [];

    switch (distributionType) {
      case 'equal':
        distributions = this.distributeEqually(reward, partyMembers);
        break;
      case 'random':
        distributions = this.distributeRandomly(reward, partyMembers);
        break;
      case 'based_on_contribution':
        distributions = this.distributeByContribution(reward, partyMembers);
        break;
      default:
        return {
          success: false,
          error: 'INVALID_DISTRIBUTION_TYPE',
          message: '잘못된 분배 방법입니다.'
        };
    }

    this.emit('reward:distributed', { questId, distributionType, distributions });

    return {
      success: true,
      questId,
      distributionType,
      distributions
    };
  }

  /**
   * 균등 분배
   * @param {Object} reward - 보상 정보
   * @param {Array} members - 멤버 목록
   * @returns {Array} 분배 결과
   */
  distributeEqually(reward, members) {
    const distributions = [];

    members.forEach(member => {
      const exp = Math.floor(reward.exp / members.length);
      const coins = Math.floor(reward.coins / members.length);

      distributions.push({
        playerId: member.id,
        playerName: member.name,
        exp,
        coins,
        items: reward.items ? [...reward.items] : []
      });
    });

    return distributions;
  }

  /**
   * 랜덤 분배
   * @param {Object} reward - 보상 정보
   * @param {Array} members - 멤버 목록
   * @returns {Array} 분배 결과
   */
  distributeRandomly(reward, members) {
    const distributions = [];

    // 경험치와 코인은 균등 분배
    const expPerMember = Math.floor(reward.exp / members.length);
    const coinsPerMember = Math.floor(reward.coins / members.length);

    // 아이템은 랜덤 분배
    const shuffledItems = reward.items 
      ? [...reward.items].sort(() => Math.random() - 0.5)
      : [];

    members.forEach((member, index) => {
      // 각 멤버에게 랜덤 아이템 1개씩 배정 (가능한 경우)
      const item = index < shuffledItems.length ? shuffledItems[index] : null;

      distributions.push({
        playerId: member.id,
        playerName: member.name,
        exp: expPerMember,
        coins: coinsPerMember,
        items: item ? [item] : []
      });
    });

    return distributions;
  }

  /**
   * 기여도 기반 분배
   * @param {Object} reward - 보상 정보
   * @param {Array} members - 멤버 목록 (contribution 속성 필요)
   * @returns {Array} 분배 결과
   */
  distributeByContribution(reward, members) {
    const totalContribution = members.reduce((sum, m) => sum + (m.contribution || 0), 0);

    if (totalContribution === 0) {
      // 기여도가 0이면 균등 분배로 fallback
      return this.distributeEqually(reward, members);
    }

    const distributions = [];

    members.forEach(member => {
      const contributionRatio = (member.contribution || 0) / totalContribution;
      const exp = Math.floor(reward.exp * contributionRatio);
      const coins = Math.floor(reward.coins * contributionRatio);

      // 아이템은 기여도 상위 2명에게 우선 배정
      const items = [];
      if (reward.items && member.contribution > 0) {
        // 기여도 비율에 따라 아이템 개수 결정
        const itemCount = Math.ceil(reward.items.length * contributionRatio);
        for (let i = 0; i < Math.min(itemCount, reward.items.length); i++) {
          items.push(reward.items[i]);
        }
      }

      distributions.push({
        playerId: member.id,
        playerName: member.name,
        exp,
        coins,
        items
      });
    });

    return distributions;
  }

  /**
   * 파티 랜덤 퀘스트 생성
   * @param {string} partyId - 파티 아이디
   * @param {number} partyLevel - 파티 평균 레벨
   * @returns {Object} 생성된 퀘스트 정보
   */
  generatePartyQuest(partyId, partyLevel) {
    const questId = `party_quest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const questTemplate = this.selectQuestTemplate(partyLevel);
    const quest = {
      id: questId,
      partyId,
      ...questTemplate,
      level: partyLevel,
      createdAt: Date.now(),
      expiresAt: Date.now() + (24 * 60 * 60 * 1000), // 24시간 후 만료
      isPartyQuest: true
    };

    if (!this.partyQuests.has(partyId)) {
      this.partyQuests.set(partyId, []);
    }

    this.partyQuests.get(partyId).push(quest);

    this.emit('party:questGenerated', { partyId, quest });

    return {
      success: true,
      quest
    };
  }

  /**
   * 퀘스트 템플릿 선택
   * @param {number} partyLevel - 파티 평균 레벨
   * @returns {Object} 퀘스트 템플릿
   */
  selectQuestTemplate(partyLevel) {
    const templates = [
      {
        type: 'boss',
        title: '파티 보스전',
        description: '강력한 보스 몬스터를 처치하세요',
        targetKills: 1,
        reward: {
          exp: Math.floor(1000 * (1 + partyLevel * 0.1)),
          coins: Math.floor(500 * (1 + partyLevel * 0.1)),
          items: ['rare_item']
        }
      },
      {
        type: 'dungeon',
        title: '던전 탐험',
        description: '던전을 완전히 탐험하세요',
        targetProgress: 100, // %
        reward: {
          exp: Math.floor(1500 * (1 + partyLevel * 0.1)),
          coins: Math.floor(750 * (1 + partyLevel * 0.1)),
          items: ['epic_item']
        }
      },
      {
        type: 'collection',
        title: '자원 수집',
        description: '특정 자원을 수집하세요',
        targetCount: Math.floor(10 + partyLevel * 2),
        reward: {
          exp: Math.floor(800 * (1 + partyLevel * 0.1)),
          coins: Math.floor(400 * (1 + partyLevel * 0.1)),
          items: ['common_item', 'uncommon_item']
        }
      },
      {
        type: 'cooperation',
        title: '협동 임무',
        description: '파티원과 함께 임무를 완료하세요',
        targetTasks: Math.floor(5 + partyLevel),
        reward: {
          exp: Math.floor(1200 * (1 + partyLevel * 0.1)),
          coins: Math.floor(600 * (1 + partyLevel * 0.1)),
          items: ['legendary_item', 'common_item']
        }
      }
    ];

    // 랜덤 템플릿 선택
    const randomIndex = Math.floor(Math.random() * templates.length);
    return templates[randomIndex];
  }

  /**
   * 파티 퀘스트 완료
   * @param {string} questId - 퀘스트 아이디
   * @param {Array} partyMembers - 파티원 목록
   * @returns {Object} 완료 결과
   */
  completePartyQuest(questId, partyMembers) {
    // 퀘스트 찾기
    let foundQuest = null;
    let foundPartyId = null;

    this.partyQuests.forEach((quests, partyId) => {
      const quest = quests.find(q => q.id === questId);
      if (quest) {
        foundQuest = quest;
        foundPartyId = partyId;
      }
    });

    if (!foundQuest) {
      return {
        success: false,
        error: 'QUEST_NOT_FOUND',
        message: '퀘스트를 찾을 수 없습니다.'
      };
    }

    // 보상 분배
    const distributionResult = this.distributeQuestReward(
      questId,
      partyMembers,
      foundQuest.rewardDistributionType || 'equal'
    );

    // 완료된 퀘스트 제거
    const partyQuests = this.partyQuests.get(foundPartyId);
    const updatedQuests = partyQuests.filter(q => q.id !== questId);
    this.partyQuests.set(foundPartyId, updatedQuests);

    this.emit('party:questCompleted', { questId, partyId: foundPartyId, distributionResult });

    return distributionResult;
  }

  /**
   * 파티 전용 보상 생성
   * @param {string} partyId - 파티 아이디
   * @param {Object} baseReward - 기본 보상
   * @param {number} partyBonus - 파티 보너스 계수
   * @returns {Object} 파티 보상
   */
  createPartyReward(partyId, baseReward, partyBonus = 1.0) {
    const partyReward = {
      partyId,
      exp: Math.floor(baseReward.exp * partyBonus),
      coins: Math.floor(baseReward.coins * partyBonus),
      items: [...(baseReward.items || [])]
    };

    // 파티 보너스 아이템 추가
    if (partyBonus >= 1.3) {
      partyReward.items.push('party_bonus_item_rare');
    }
    if (partyBonus >= 1.5) {
      partyReward.items.push('party_bonus_item_epic');
    }

    return partyReward;
  }

  /**
   * 파티 퀘스트 목록 조회
   * @param {string} partyId - 파티 아이디
   * @returns {Object} 퀘스트 목록
   */
  getPartyQuests(partyId) {
    const quests = this.partyQuests.get(partyId) || [];

    return {
      success: true,
      partyId,
      quests
    };
  }

  /**
   * 퀘스트 보상 등록
   * @param {string} questId - 퀘스트 아이디
   * @param {Object} reward - 보상 정보
   */
  registerQuestReward(questId, reward) {
    this.questRewards.set(questId, reward);
  }

  /**
   * 파티 퀘스트 정리
   * @param {string} partyId - 파티 아이디
   */
  cleanupPartyQuests(partyId) {
    this.partyQuests.delete(partyId);
  }

  /**
   * 만료된 퀘스트 정리
   * @returns {Object} 정리 결과
   */
  cleanupExpiredQuests() {
    const now = Date.now();
    let expiredCount = 0;

    this.partyQuests.forEach((quests, partyId) => {
      const activeQuests = quests.filter(q => q.expiresAt > now);
      expiredCount += quests.length - activeQuests.length;
      this.partyQuests.set(partyId, activeQuests);
    });

    return {
      success: true,
      expiredCount
    };
  }
}