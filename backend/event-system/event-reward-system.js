/**
 * Event Reward System - 이벤트 리워드 시스템
 * Phase 7: 이벤트 시스템
 */

import { getRedisClient, isRedisEnabled, TTL } from '../utils/redis-client.js';

/**
 * 리워드 생성
 */
export function createReward(config) {
  const {
    rewardId,
    type = 'bundle',
    experience = 0,
    coins = 0,
    items = [],
    statsBoost = {},
    title = null,
    expiresAt = null
  } = config;

  return {
    rewardId,
    type,
    experience,
    coins,
    items,
    statsBoost,
    title,
    expiresAt,
    granted: false,
    grantedAt: null
  };
}

/**
 * 리워드 지급
 */
export function grantReward(characterId, reward) {
  try {
    const results = {
      success: false,
      rewardId: reward.rewardId,
      grants: [],
      timestamp: new Date().toISOString()
    };

    // 경험치 지급
    if (reward.experience > 0) {
      const expResult = grantExperience(characterId, reward.experience);
      results.grants.push({
        type: 'experience',
        value: reward.experience,
        success: expResult.success,
        error: expResult.error
      });
    }

    // 코인 지급
    if (reward.coins > 0) {
      const coinResult = grantCoins(characterId, reward.coins);
      results.grants.push({
        type: 'coins',
        value: reward.coins,
        success: coinResult.success,
        error: coinResult.error
      });
    }

    // 아이템 지급
    for (const item of reward.items) {
      const itemResult = grantItem(characterId, item);
      results.grants.push({
        type: 'item',
        value: item,
        success: itemResult.success,
        error: itemResult.error
      });
    }

    // 능력치 부스트 지급
    if (reward.statsBoost) {
      const statsResult = grantStatsBoost(characterId, reward.statsBoost);
      results.grants.push({
        type: 'stats',
        value: reward.statsBoost,
        success: statsResult.success,
        error: statsResult.error
      });
    }

    // 칭호 지급
    if (reward.title) {
      const titleResult = grantTitle(characterId, reward.title);
      results.grants.push({
        type: 'title',
        value: reward.title,
        success: titleResult.success,
        error: titleResult.error
      });
    }

    // 전체 성공 여부 확인
    results.success = results.grants.every(grant => grant.success);

    // 리워드 히스토리 기록
    if (results.success) {
      saveRewardHistory(characterId, {
        rewardId: reward.rewardId,
        reward: reward,
        grantedAt: results.timestamp
      });
    }

    return results;
  } catch (error) {
    console.error('Failed to grant reward:', error);
    return {
      success: false,
      rewardId: reward.rewardId,
      grants: [],
      timestamp: new Date().toISOString(),
      error: error.message
    };
  }
}

/**
 * 경험치 지급
 */
export function grantExperience(characterId, amount) {
  try {
    if (!isRedisEnabled()) {
      console.warn('Redis is disabled, experience not granted');
      return { success: false, error: 'Redis disabled' };
    }

    const redis = getRedisClient();
    const key = `character:${characterId}`;
    const characterData = JSON.parse(redis.get(key) || '{}');

    const currentExp = characterData.exp || 0;
    const newExp = currentExp + amount;

    characterData.exp = newExp;

    // 레벨업 체크
    const currentLevel = characterData.level || 1;
    const requiredExp = 100 * Math.pow(currentLevel, 2);

    if (newExp >= requiredExp) {
      // 레벨업
      characterData.level = currentLevel + 1;
      characterData.exp = newExp - requiredExp;

      // 레벨업 보너스 부여
      grantLevelUpBonus(characterId, characterData);
    }

    redis.set(key, JSON.stringify(characterData), { EX: TTL.LONG });

    return { success: true, granted: amount };
  } catch (error) {
    console.error('Failed to grant experience:', error);
    return { success: false, error: error.message };
  }
}

/**
 * 코인 지급
 */
export function grantCoins(characterId, amount) {
  try {
    if (!isRedisEnabled()) {
      console.warn('Redis is disabled, coins not granted');
      return { success: false, error: 'Redis disabled' };
    }

    const redis = getRedisClient();
    const key = `inventory:${characterId}`;
    const inventory = JSON.parse(redis.get(key) || '{}');

    const currentCoins = inventory.coin || 0;
    const newCoins = currentCoins + amount;

    inventory.coin = newCoins;

    redis.set(key, JSON.stringify(inventory), { EX: TTL.LONG });

    return { success: true, granted: amount };
  } catch (error) {
    console.error('Failed to grant coins:', error);
    return { success: false, error: error.message };
  }
}

/**
 * 아이템 지급
 */
export function grantItem(characterId, item) {
  try {
    if (!isRedisEnabled()) {
      console.warn('Redis is disabled, item not granted');
      return { success: false, error: 'Redis disabled' };
    }

    const redis = getRedisClient();
    const key = `inventory:${characterId}`;
    const inventory = JSON.parse(redis.get(key) || '{}');

    const currentItem = inventory[item.id] || 0;
    const newItem = currentItem + item.quantity;

    inventory[item.id] = newItem;

    redis.set(key, JSON.stringify(inventory), { EX: TTL.LONG });

    return { success: true, granted: item };
  } catch (error) {
    console.error('Failed to grant item:', error);
    return { success: false, error: error.message };
  }
}

/**
 * 능력치 부스트 지급
 */
export function grantStatsBoost(characterId, statsBoost) {
  try {
    if (!isRedisEnabled()) {
      console.warn('Redis is disabled, stats boost not granted');
      return { success: false, error: 'Redis disabled' };
    }

    const redis = getRedisClient();
    const key = `character:${characterId}`;
    const characterData = JSON.parse(redis.get(key) || '{}');

    const stats = characterData.stats || {
      hp: 100,
      maxHp: 100,
      affinity: 10,
      charisma: 5,
      intelligence: 5
    };

    if (statsBoost.hp) {
      stats.hp += statsBoost.hp;
      stats.maxHp += statsBoost.hp;
    }
    if (statsBoost.affinity) {
      stats.affinity += statsBoost.affinity;
    }
    if (statsBoost.charisma) {
      stats.charisma += statsBoost.charisma;
    }
    if (statsBoost.intelligence) {
      stats.intelligence += statsBoost.intelligence;
    }

    characterData.stats = stats;

    redis.set(key, JSON.stringify(characterData), { EX: TTL.LONG });

    return { success: true, granted: statsBoost };
  } catch (error) {
    console.error('Failed to grant stats boost:', error);
    return { success: false, error: error.message };
  }
}

/**
 * 칭호 지급
 */
export function grantTitle(characterId, title) {
  try {
    if (!isRedisEnabled()) {
      console.warn('Redis is disabled, title not granted');
      return { success: false, error: 'Redis disabled' };
    }

    const redis = getRedisClient();
    const key = `character:${characterId}`;
    const characterData = JSON.parse(redis.get(key) || '{}');

    const titles = characterData.titles || [];
    if (!titles.includes(title)) {
      titles.push(title);
      characterData.titles = titles;
      characterData.activeTitle = title; // 새 칭호로 설정
    }

    redis.set(key, JSON.stringify(characterData), { EX: TTL.LONG });

    return { success: true, granted: title };
  } catch (error) {
    console.error('Failed to grant title:', error);
    return { success: false, error: error.message };
  }
}

/**
 * 레벨업 보너스 부여
 */
function grantLevelUpBonus(characterId, characterData) {
  try {
    const stats = characterData.stats || {
      hp: 100,
      maxHp: 100,
      affinity: 10,
      charisma: 5,
      intelligence: 5
    };

    // 랜덤 보너스 부여
    const hpBonus = Math.floor(Math.random() * 5) + 10; // 10~14
    const affinityBonus = Math.floor(Math.random() * 2) + 2; // 2~3
    const charismaBonus = Math.floor(Math.random() * 2) + 1; // 1~2
    const intelligenceBonus = Math.floor(Math.random() * 2) + 1; // 1~2

    stats.hp += hpBonus;
    stats.maxHp += hpBonus;
    stats.affinity += affinityBonus;
    stats.charisma += charismaBonus;
    stats.intelligence += intelligenceBonus;

    characterData.stats = stats;

    console.log(`Level up bonus granted to ${characterId}: HP+${hpBonus}, Aff+${affinityBonus}, Cha+${charismaBonus}, Int+${intelligenceBonus}`);
  } catch (error) {
    console.error('Failed to grant level up bonus:', error);
  }
}

/**
 * 리워드 히스토리 기록
 */
export function saveRewardHistory(characterId, historyEntry) {
  try {
    if (!isRedisEnabled()) {
      console.warn('Redis is disabled, reward history not saved');
      return false;
    }

    const redis = getRedisClient();
    const key = `event:rewards:${characterId}`;
    const history = JSON.parse(redis.get(key) || '[]');

    history.unshift(historyEntry);

    // 최대 100개만 유지
    if (history.length > 100) {
      history.splice(100);
    }

    redis.set(key, JSON.stringify(history), { EX: TTL.WEEK });

    return true;
  } catch (error) {
    console.error('Failed to save reward history:', error);
    return false;
  }
}

/**
 * 리워드 히스토리 조회
 */
export function getRewardHistory(characterId) {
  try {
    if (!isRedisEnabled()) {
      console.warn('Redis is disabled, no reward history');
      return [];
    }

    const redis = getRedisClient();
    const key = `event:rewards:${characterId}`;
    const history = JSON.parse(redis.get(key) || '[]');

    return history;
  } catch (error) {
    console.error('Failed to get reward history:', error);
    return [];
  }
}

/**
 * 이벤트별 리워드 지급 (모든 리워드 한 번에)
 */
export function grantRewardsByEvent(characterId, eventId, rewards) {
  try {
    const result = {
      success: false,
      eventId,
      characterId,
      grants: [],
      timestamp: new Date().toISOString()
    };

    // 경험치
    if (rewards.experience > 0) {
      const expResult = grantExperience(characterId, rewards.experience);
      result.grants.push({
        type: 'experience',
        value: rewards.experience,
        success: expResult.success
      });
    }

    // 코인
    if (rewards.coins > 0) {
      const coinResult = grantCoins(characterId, rewards.coins);
      result.grants.push({
        type: 'coins',
        value: rewards.coins,
        success: coinResult.success
      });
    }

    // 아이템들
    for (const item of rewards.items || []) {
      const itemResult = grantItem(characterId, item);
      result.grants.push({
        type: 'item',
        value: item,
        success: itemResult.success
      });
    }

    result.success = result.grants.every(grant => grant.success);

    if (result.success) {
      saveRewardHistory(characterId, {
        eventId,
        rewards,
        grantedAt: result.timestamp
      });
    }

    return result;
  } catch (error) {
    console.error('Failed to grant rewards by event:', error);
    return {
      success: false,
      eventId,
      characterId,
      grants: [],
      timestamp: new Date().toISOString(),
      error: error.message
    };
  }
}

/**
 * 리워드 수령 여부 확인 (히스토리 기반)
 */
export function hasClaimedReward(characterId, eventId) {
  try {
    const history = getRewardHistory(characterId);
    return history.some(entry => entry.eventId === eventId);
  } catch (error) {
    console.error('Failed to check reward claimed:', error);
    return false;
  }
}