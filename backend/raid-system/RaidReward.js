/**
 * RaidReward - 레이드 보상 분배 시스템
 * 길드 경험치, 아이템, 골드 보상 분배
 */

class RaidReward {
  constructor(raidManager, guildManager) {
    this.raidManager = raidManager;
    this.guildManager = guildManager;
  }

  /**
   * 레이드 보상 계산
   * @param {string} raidId - 레이드 ID
   * @returns {Object} 보상 정보
   */
  calculateRewards(raidId) {
    const raid = this.raidManager.getRaid(raidId);
    if (!raid) return { error: 'raid_not_found' };

    // 승리 시만 보상 지급
    if (raid.status !== 'completed') {
      return { error: 'raid_not_completed' };
    }

    const bossLevel = raid.bossConfig ? raid.bossConfig.level || 100 : 100;
    const participantCount = raid.participants.length;
    const totalDamage = raid.participants.reduce((sum, p) => sum + (p.damage || 0), 0);

    // 기본 보상 계산
    const baseRewards = {
      guildExp: Math.floor(500 * bossLevel * 0.1),
      gold: Math.floor(1000 * bossLevel * 0.1),
      items: this.generateRewardItems(bossLevel, raid.bossConfig)
    };

    // 개별 보상 계산 (데미지 비율 기반)
    const individualRewards = raid.participants.map(p => {
      const damagePercent = totalDamage > 0 ? (p.damage || 0) / totalDamage : 1 / participantCount;
      const deathPenalty = Math.max(0.5, 1 - (p.deaths || 0) * 0.1); // 죽을 때마다 10% 페널티

      return {
        characterId: p.characterId,
        name: p.name,
        damage: p.damage || 0,
        xp: Math.floor(1000 * bossLevel * 0.1 * damagePercent * deathPenalty),
        gold: Math.floor(baseRewards.gold / participantCount * deathPenalty),
        items: this.assignItems(p, baseRewards.items),
        contribution: Math.floor(bossLevel * 10 * damagePercent * deathPenalty)
      };
    });

    return {
      raidId,
      baseRewards,
      individualRewards,
      totalRewards: {
        totalXp: individualRewards.reduce((sum, r) => sum + r.xp, 0),
        totalGold: individualRewards.reduce((sum, r) => sum + r.gold, 0),
        totalItems: individualRewards.reduce((sum, r) => sum + r.items.length, 0)
      }
    };
  }

  /**
   * 보상 아이템 생성
   * @param {number} bossLevel - 보스 레벨
   * @param {Object} bossConfig - 보스 설정
   * @returns {Array<Object>} 아이템 목록
   */
  generateRewardItems(bossLevel, bossConfig) {
    const bossType = bossConfig ? bossConfig.type || 'normal' : 'normal';

    const itemPool = {
      normal: [
        { itemId: 'potion_hp', name: 'HP 포션', rarity: 'common', quantity: 5 },
        { itemId: 'potion_mp', name: 'MP 포션', rarity: 'common', quantity: 5 },
        { itemId: 'scroll_exp', name: '경험치 스크롤', rarity: 'uncommon', quantity: 2 }
      ],
      elite: [
        { itemId: 'potion_hp', name: 'HP 포션', rarity: 'common', quantity: 10 },
        { itemId: 'potion_mp', name: 'MP 포션', rarity: 'common', quantity: 10 },
        { itemId: 'scroll_exp', name: '경험치 스크롤', rarity: 'uncommon', quantity: 3 },
        { itemId: 'rare_crystal', name: '희귀 크리스탈', rarity: 'rare', quantity: 1 }
      ],
      legendary: [
        { itemId: 'potion_hp', name: 'HP 포션', rarity: 'common', quantity: 20 },
        { itemId: 'potion_mp', name: 'MP 포션', rarity: 'common', quantity: 20 },
        { itemId: 'scroll_exp', name: '경험치 스크롤', rarity: 'uncommon', quantity: 5 },
        { itemId: 'rare_crystal', name: '희귀 크리스탈', rarity: 'rare', quantity: 2 },
        { itemId: 'legendary_weapon', name: '전설 무기', rarity: 'legendary', quantity: 1 }
      ],
      mythic: [
        { itemId: 'potion_hp', name: 'HP 포션', rarity: 'common', quantity: 50 },
        { itemId: 'potion_mp', name: 'MP 포션', rarity: 'common', quantity: 50 },
        { itemId: 'scroll_exp', name: '경험치 스크롤', rarity: 'uncommon', quantity: 10 },
        { itemId: 'rare_crystal', name: '희귀 크리스탈', rarity: 'rare', quantity: 5 },
        { itemId: 'legendary_equipment', name: '전설 장비', rarity: 'legendary', quantity: 2 },
        { itemId: 'mythic_relic', name: '신화 유물', rarity: 'mythic', quantity: 1 }
      ]
    };

    const pool = itemPool[bossType] || itemPool.normal;
    return pool;
  }

  /**
   * 아이템 배정
   * @param {Object} participant - 참여자 정보
   * @param {Array<Object>} items - 아이템 목록
   * @returns {Array<Object>} 배정된 아이템
   */
  assignItems(participant, items) {
    const assigned = [];

    // 희귀도별 배정 확률
    const rarityChance = {
      common: 1.0,
      uncommon: 0.6,
      rare: 0.3,
      legendary: 0.1,
      mythic: 0.05
    };

    items.forEach(item => {
      const chance = rarityChance[item.rarity] || 0;
      if (Math.random() < chance) {
        assigned.push(item);
      }
    });

    return assigned;
  }

  /**
   * 보상 분배 실행
   * @param {string} raidId - 레이드 ID
   * @returns {Promise<Object>} 분배 결과
   */
  async distributeRewards(raidId) {
    const raid = this.raidManager.getRaid(raidId);
    if (!raid) return { error: 'raid_not_found' };

    // 보상 계산
    const rewards = this.calculateRewards(raidId);
    if (rewards.error) return rewards;

    // 길드 경험치 추가
    if (raid.guildId) {
      await this.guildManager.addGuildExp(raid.guildId, rewards.baseRewards.guildExp);
    }

    // 길드 골드 추가 (부분)
    if (raid.guildId) {
      const guildGold = Math.floor(rewards.baseRewards.gold * 0.1); // 10%는 길드 골드
      await this.guildManager.addGuildGold(raid.guildId, guildGold);
    }

    // 참여자 보상 지급
    await this.distributeParticipantRewards(raid.guildId, rewards.individualRewards);

    // 레이드 보상 지급 완료 표시
    raid.rewardsDistributed = true;
    this.raidManager.raids.set(raidId, raid);
    if (this.raidManager.redis) {
      await this.raidManager.redis.hset('raids', raidId, JSON.stringify(raid));
    }

    return {
      raidId,
      distributed: true,
      rewards
    };
  }

  /**
   * 참여자 보상 지급
   * @param {string} guildId - 길드 ID
   * @param {Array<Object>} individualRewards - 개별 보상 목록
   */
  async distributeParticipantRewards(guildId, individualRewards) {
    for (const reward of individualRewards) {
      // 여기에 실제 보상 지급 로직 구현
      // 인벤토리 시스템, 골드 시스템, 경험치 시스템 연동 필요

      // 기여도 추가
      if (guildId) {
        const guildMember = new (require('../guild-system/GuildMember'))(this.guildManager);
        await guildMember.addContribution(reward.characterId, reward.contribution);
      }
    }
  }

  /**
   * 보상 내역 조회
   * @param {string} raidId - 레이드 ID
   * @returns {Object} 보상 내역
   */
  getRewardHistory(raidId) {
    const raid = this.raidManager.getRaid(raidId);
    if (!raid) return { error: 'raid_not_found' };

    const rewards = this.calculateRewards(raidId);
    if (rewards.error) return rewards;

    return {
     raidId,
      distributed: raid.rewardsDistributed,
      rewards
    };
  }
}

module.exports = RaidReward;