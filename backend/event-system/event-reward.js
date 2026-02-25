/**
 * EventReward - 이벤트 보상 시스템
 *
 * 이벤트, 퀘스트, 시즌/특별 이벤트의 보상 관리
 */

/**
 * 보상 유형
 */
const RewardType = {
  EXPERIENCE: 'experience',     // 경험치
  COIN: 'coin',                // 코인
  ITEM: 'item',                // 아이템
  CUSTOM: 'custom',            // 커스텀 보상
  TITLE: 'title',              // 칭호
  COSTUME: 'costume',          // 코스튬
  DECORATION: 'decoration'     // 장식
};

/**
 * 보상 티어
 */
const RewardTier = {
  COMMON: 'common',
  RARE: 'rare',
  EPIC: 'epic',
  LEGENDARY: 'legendary'
};

/**
 * 보상 티어별 아이템 확률
 */
const REWARD_TIER_PROBABILITIES = {
  [RewardTier.COMMON]: 0.6,      // 60%
  [RewardTier.RARE]: 0.3,        // 30%
  [RewardTier.EPIC]: 0.08,       // 8%
  [RewardTier.LEGENDARY]: 0.02   // 2%
};

/**
 * EventReward 클래스
 */
class EventReward {
  constructor() {
    this.rewardsDb = new Map(); // 보상 데이터베이스
    this.rewardHistory = [];    // 보상 기록
    this.initDefaultRewards();
  }

  /**
   * 기본 보상 초기화
   */
  initDefaultRewards() {
    // 경험치 보상
    this.rewardsDb.set('exp_small', {
      id: 'exp_small',
      type: RewardType.EXPERIENCE,
      name: '소량 경험치',
      amount: 50,
      description: '소량의 경험치를 얻습니다',
      tier: RewardTier.COMMON
    });

    this.rewardsDb.set('exp_medium', {
      id: 'exp_medium',
      type: RewardType.EXPERIENCE,
      name: '중량 경험치',
      amount: 200,
      description: '중량의 경험치를 얻습니다',
      tier: RewardTier.RARE
    });

    this.rewardsDb.set('exp_large', {
      id: 'exp_large',
      type: RewardType.EXPERIENCE,
      name: '대량 경험치',
      amount: 500,
      description: '대량의 경험치를 얻습니다',
      tier: RewardTier.EPIC
    });

    // 코인 보상
    this.rewardsDb.set('coin_small', {
      id: 'coin_small',
      type: RewardType.COIN,
      name: '소량 코인',
      amount: 50,
      description: '소량의 코인을 얻습니다',
      tier: RewardTier.COMMON
    });

    this.rewardsDb.set('coin_medium', {
      id: 'coin_medium',
      type: RewardType.COIN,
      name: '중량 코인',
      amount: 200,
      description: '중량의 코인을 얻습니다',
      tier: RewardTier.RARE
    });

    this.rewardsDb.set('coin_large', {
      id: 'coin_large',
      type: RewardType.COIN,
      name: '대량 코인',
      amount: 500,
      description: '대량의 코인을 얻습니다',
      tier: RewardTier.EPIC
    });

    // 아이템 보상
    this.rewardsDb.set('item_common', {
      id: 'item_common',
      type: RewardType.ITEM,
      name: '일반 아이템',
      description: '일반 아이템을 얻습니다',
      tier: RewardTier.COMMON
    });

    this.rewardsDb.set('item_rare', {
      id: 'item_rare',
      type: RewardType.ITEM,
      name: '희귀 아이템',
      description: '희귀 아이템을 얻습니다',
      tier: RewardTier.RARE
    });

    // 코스튬
    this.rewardsDb.set('costume_seasonal', {
      id: 'costume_seasonal',
      type: RewardType.COSTUME,
      name: '시즌 코스튬',
      description: '시즌 한정 코스튬을 얻습니다',
      tier: RewardTier.EPIC
    });

    // 장식
    this.rewardsDb.set('decoration_special', {
      id: 'decoration_special',
      type: RewardType.DECORATION,
      name: '특별 장식',
      description: '특별한 장식을 얻습니다',
      tier: RewardTier.RARE
    });
  }

  /**
   * 보상 생성
   * @param {Object} rewardData - 보상 데이터
   * @returns {Object} 생성된 보상
   */
  createReward(rewardData) {
    const { id, type, amount, name, description, tier } = rewardData;

    if (!id || !type) {
      console.error('EventReward: Invalid reward data - ID and type are required');
      return null;
    }

    const reward = {
      id,
      type,
      amount: amount || 0,
      name: name || 'Unknown Reward',
      description: description || 'Reward',
      tier: tier || RewardTier.COMMON,
      createdAt: new Date()
    };

    this.rewardsDb.set(id, reward);
    console.log(`EventReward: Created reward - ${reward.name} (${id})`);
    return reward;
  }

  /**
   * 보상 조회
   * @param {string} rewardId - 보상 ID
   * @returns {Object|null} 보상 데이터
   */
  getReward(rewardId) {
    return this.rewardsDb.get(rewardId) || null;
  }

  /**
   * 티어별 랜덤 보상 생성
   * @param {string} preferredTier - 선호 티어 (선택)
   * @returns {Object} 랜덤 보상
   */
  generateRandomReward(preferredTier = null) {
    // 선호 티어가 있으면 해당 티어로 생성
    if (preferredTier && Object.values(RewardTier).includes(preferredTier)) {
      return this.createTierReward(preferredTier);
    }

    // 랜덤 티어 결정
    const tier = this.calculateRandomTier();
    return this.createTierReward(tier);
  }

  /**
   * 티어 계산 (확률 기반)
   * @returns {string} 티어
   */
  calculateRandomTier() {
    const random = Math.random();

    if (random < REWARD_TIER_PROBABILITIES[RewardTier.LEGENDARY]) {
      return RewardTier.LEGENDARY;
    } else if (random < REWARD_TIER_PROBABILITIES[RewardTier.LEGENDARY] + REWARD_TIER_PROBABILITIES[RewardTier.EPIC]) {
      return RewardTier.EPIC;
    } else if (random < REWARD_TIER_PROBABILITIES[RewardTier.LEGENDARY] + REWARD_TIER_PROBABILITIES[RewardTier.EPIC] + REWARD_TIER_PROBABILITIES[RewardTier.RARE]) {
      return RewardTier.RARE;
    } else {
      return RewardTier.COMMON;
    }
  }

  /**
   * 티어별 보상 생성
   * @param {string} tier - 티어
   * @returns {Object} 보상
   */
  createTierReward(tier) {
    const rewardsByTier = Array.from(this.rewardsDb.values())
      .filter(reward => reward.tier === tier);

    if (rewardsByTier.length === 0) {
      // 해당 티어의 보상이 없으면 Common 티어로 대체
      return this.createTierReward(RewardTier.COMMON);
    }

    const randomReward = rewardsByTier[Math.floor(Math.random() * rewardsByTier.length)];

    return {
      ...randomReward,
      id: `reward_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      claimedAt: new Date()
    };
  }

  /**
   * 다중 보상 생성
   * @param {string} tier - 티어
   * @param {number} count - 보상 수량
   * @returns {Array} 보상 목록
   */
  generateMultipleRewards(tier, count = 1) {
    const rewards = [];

    for (let i = 0; i < count; i++) {
      rewards.push(this.generateRandomReward(tier));
    }

    return rewards;
  }

  /**
   * 보상 지급
   * @param {string} characterId - 캐릭터 ID
   * @param {string|Object} reward - 보상 ID 또는 보상 데이터
   * @param {string} source - 보상 출처 (이벤트, 퀘스트 등)
   * @returns {Object|null} 지급된 보상
   */
  giveReward(characterId, reward, source = 'unknown') {
    let rewardData;

    // 보상 ID인지 확인
    if (typeof reward === 'string') {
      rewardData = this.rewardsDb.get(reward);
    } else {
      rewardData = reward;
    }

    if (!rewardData) {
      console.error(`EventReward: Reward not found - ${reward}`);
      return null;
    }

    // 보상 지급 기록
    const rewardRecord = {
      characterId,
      reward: rewardData,
      source,
      givenAt: new Date()
    };

    this.rewardHistory.push(rewardRecord);

    console.log(`EventReward: Given ${rewardData.name} to ${characterId} from ${source}`);
    return rewardData;
  }

  /**
   * 보상 풀에서 보상 추첨
   * @param {Array} rewardPool - 보상 풀
   * @returns {Object|null} 보상
   */
  drawFromRewardPool(rewardPool) {
    if (!rewardPool || rewardPool.length === 0) {
      console.warn('EventReward: Empty reward pool');
      return null;
    }

    const randomIndex = Math.floor(Math.random() * rewardPool.length);
    return rewardPool[randomIndex];
  }

  /**
   * 캐릭터별 보상 기록 조회
   * @param {string} characterId - 캐릭터 ID
   * @param {number} limit - 최대 기록 수
   * @returns {Array} 보상 기록
   */
  getCharacterRewardHistory(characterId, limit = 20) {
    return this.rewardHistory
      .filter(record => record.characterId === characterId)
      .slice(-limit)
      .reverse();
  }

  /**
   * 출처별 보상 기록 조회
   * @param {string} source - 보상 출처
   * @param {number} limit - 최대 기록 수
   * @returns {Array} 보상 기록
   */
  getSourceRewardHistory(source, limit = 20) {
    return this.rewardHistory
      .filter(record => record.source === source)
      .slice(-limit)
      .reverse();
  }

  /**
   * 모든 보상 조회
   * @returns {Array} 보상 목록
   */
  getAllRewards() {
    return Array.from(this.rewardsDb.values());
  }

  /**
   * 티어별 보상 조회
   * @param {string} tier - 티어
   * @returns {Array} 보상 목록
   */
  getRewardsByTier(tier) {
    return Array.from(this.rewardsDb.values())
      .filter(reward => reward.tier === tier);
  }

  /**
   * 보상 통계
   * @returns {Object} 통계 데이터
   */
  getRewardStats() {
    const totalRewardsGiven = this.rewardHistory.length;
    const rewardsByType = {};

    this.rewardHistory.forEach(record => {
      const type = record.reward.type;
      rewardsByType[type] = (rewardsByType[type] || 0) + 1;
    });

    return {
      totalRewardsGiven,
      rewardsByType,
      uniqueRewards: this.rewardsDb.size
    };
  }

  /**
   * 보상 삭제
   * @param {string} rewardId - 보상 ID
   * @returns {boolean} 삭제 성공 여부
   */
  deleteReward(rewardId) {
    const deleted = this.rewardsDb.delete(rewardId);

    if (deleted) {
      console.log(`EventReward: Deleted reward - ${rewardId}`);
    }

    return deleted;
  }

  /**
   * 모든 보상 초기화
   */
  resetAllRewards() {
    this.rewardsDb.clear();
    this.rewardHistory = [];
    this.initDefaultRewards();
    console.log('EventReward: All rewards reset');
  }
}

// 싱글톤 인스턴스
const eventReward = new EventReward();

module.exports = {
  EventReward,
  eventReward,
  RewardType,
  RewardTier,
  REWARD_TIER_PROBABILITIES
};