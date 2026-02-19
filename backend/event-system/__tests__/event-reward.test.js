const { describe, test, expect, beforeEach, afterEach } = require('@vitest/runner');
const {
  EventReward,
  eventReward,
  RewardType,
  RewardTier,
  REWARD_TIER_PROBABILITIES
} = require('../event-reward');

describe('EventReward', () => {
  let testEventReward;
  const characterId = 'test_char_001';

  beforeEach(() => {
    testEventReward = new EventReward();
  });

  afterEach(() => {
    // Clean up
  });

  test('EventReward 인스턴스 생성', () => {
    expect(testEventReward).toBeDefined();
    expect(testEventReward instanceof EventReward).toBe(true);
  });

  test('보상 유형 열거형 확인', () => {
    expect(RewardType.EXPERIENCE).toBe('experience');
    expect(RewardType.COIN).toBe('coin');
    expect(RewardType.ITEM).toBe('item');
    expect(RewardType.CUSTOM).toBe('custom');
    expect(RewardType.TITLE).toBe('title');
    expect(RewardType.COSTUME).toBe('costume');
    expect(RewardType.DECORATION).toBe('decoration');
  });

  test('보상 티어 열거형 확인', () => {
    expect(RewardTier.COMMON).toBe('common');
    expect(RewardTier.RARE).toBe('rare');
    expect(RewardTier.EPIC).toBe('epic');
    expect(RewardTier.LEGENDARY).toBe('legendary');
  });

  test('보상 티어 확률 확인', () => {
    expect(REWARD_TIER_PROBABILITIES).toBeDefined();
    expect(REWARD_TIER_PROBABILITIES[RewardTier.COMMON]).toBe(0.6);
    expect(REWARD_TIER_PROBABILITIES[RewardTier.RARE]).toBe(0.3);
    expect(REWARD_TIER_PROBABILITIES[RewardTier.EPIC]).toBe(0.08);
    expect(REWARD_TIER_PROBABILITIES[RewardTier.LEGENDARY]).toBe(0.02);

    // 모든 확률의 합이 1인지 확인
    const totalProbability = Object.values(REWARD_TIER_PROBABILITIES).reduce((sum, p) => sum + p, 0);
    expect(totalProbability).toBeCloseTo(1.0, 10);
  });

  test('기본 보상 초기화', () => {
    expect(testEventReward.rewardsDb.size).toBeGreaterThan(0);

    const rewards = testEventReward.getAllRewards();
    expect(rewards.length).toBeGreaterThan(0);

    // 기본 보상 중 경험치 있는지 확인
    const expRewards = rewards.filter(r => r.type === RewardType.EXPERIENCE);
    expect(expRewards.length).toBeGreaterThan(0);

    // 기본 보상 중 코인 있는지 확인
    const coinRewards = rewards.filter(r => r.type === RewardType.COIN);
    expect(coinRewards.length).toBeGreaterThan(0);
  });

  test('보상 생성', () => {
    const rewardData = {
      id: 'test_reward_1',
      type: RewardType.EXPERIENCE,
      amount: 100,
      name: '테스트 보상',
      description: '테스트용 보상',
      tier: RewardTier.COMMON
    };

    const reward = testEventReward.createReward(rewardData);

    expect(reward).toBeDefined();
    expect(reward.id).toBe('test_reward_1');
    expect(reward.type).toBe(RewardType.EXPERIENCE);
    expect(reward.amount).toBe(100);
    expect(reward.name).toBe('테스트 보상');
    expect(reward.tier).toBe(RewardTier.COMMON);
  });

  test('잘못된 보상 생성 실패', () => {
    const result = testEventReward.createReward({
      name: '없는 ID 보상'
    });

    expect(result).toBeNull();
  });

  test('보상 조회', () => {
    const reward = testEventReward.getReward('exp_small');
    expect(reward).toBeDefined();
    expect(reward.id).toBe('exp_small');
    expect(reward.type).toBe(RewardType.EXPERIENCE);
  });

  test('존재하지 않는 보상 조회', () => {
    const reward = testEventReward.getReward('nonexistent');
    expect(reward).toBeNull();
  });

  test('랜덤 보상 생성', () => {
    const reward = testEventReward.generateRandomReward();

    expect(reward).toBeDefined();
    expect(reward).toHaveProperty('id');
    expect(reward).toHaveProperty('type');
    expect(reward).toHaveProperty('name');
    expect(reward).toHaveProperty('tier');
    expect(reward).toHaveProperty('claimedAt');

    expect(Object.values(RewardTier)).toContain(reward.tier);
  });

  test('선호 티어로 랜덤 보상 생성', () => {
    const reward = testEventReward.generateRandomReward(RewardTier.RARE);

    expect(reward).toBeDefined();
    expect(reward.tier).toBe(RewardTier.RARE);
  });

  test('존재하지 않는 티어로 랜덤 보상 생성', () => {
    const reward = testEventReward.generateRandomReward('nonexistent_tier');

    expect(reward).toBeDefined();
    // 기본 티어로 리셋 (Common)
  });

  test('랜덤 티어 계산', () => {
    const tier = testEventReward.calculateRandomTier();
    expect(Object.values(RewardTier)).toContain(tier);
  });

  test('티어별 랜덤 보상 생성', () => {
    const commonReward = testEventReward.createTierReward(RewardTier.COMMON);
    expect(commonReward.tier).toBe(RewardTier.COMMON);

    const rareReward = testEventReward.createTierReward(RewardTier.RARE);
    expect(rareReward.tier).toBe(RewardTier.RARE);

    const epicReward = testEventReward.createTierReward(RewardTier.EPIC);
    expect(epicReward.tier).toBe(RewardTier.EPIC);

    const legendaryReward = testEventReward.createTierReward(RewardTier.LEGENDARY);
    expect(legendaryReward.tier).toBe(RewardTier.LEGENDARY);
  });

  test('다중 보상 생성', () => {
    const rewards = testEventReward.generateMultipleRewards(RewardTier.COMMON, 5);

    expect(Array.isArray(rewards)).toBe(true);
    expect(rewards.length).toBe(5);

    rewards.forEach(reward => {
      expect(reward).toBeDefined();
      expect(reward.tier).toBe(RewardTier.COMMON);
    });
  });

  test('보상 지급 (보상 ID)', () => {
    testEventReward.createReward({
      id: 'give_test',
      type: RewardType.COIN,
      amount: 50,
      name: '지급 테스트',
      tier: RewardTier.COMMON
    });

    const givenReward = testEventReward.giveReward(characterId, 'give_test', 'test_event');

    expect(givenReward).toBeDefined();
    expect(givenReward.id).toBe('give_test');
  });

  test('보상 지급 (보상 데이터)', () => {
    const reward = testEventReward.getReward('exp_small');

    const givenReward = testEventReward.giveReward(characterId, reward, 'test_event');

    expect(givenReward).toBeDefined();
    expect(givenReward.type).toBe(RewardType.EXPERIENCE);
  });

  test('존재하지 않는 보상 지급 실패', () => {
    const result = testEventReward.giveReward(characterId, 'nonexistent', 'test_event');
    expect(result).toBeNull();
  });

  test('보상 지급 후 기록', () => {
    const reward = testEventReward.getReward('coin_small');
    testEventReward.giveReward(characterId, reward, 'test_event');

    const history = testEventReward.getCharacterRewardHistory(characterId);
    expect(history.length).toBeGreaterThan(0);

    const latestRecord = history[0];
    expect(latestRecord.characterId).toBe(characterId);
    expect(latestRecord.source).toBe('test_event');
  });

  test('보상 풀에서 보상 추첨', () => {
    const rewardPool = [
      { type: RewardType.EXPERIENCE, amount: 100 },
      { type: RewardType.COIN, amount: 50 },
      { type: RewardType.ITEM, name: '테스트 아이템' }
    ];

    const reward = testEventReward.drawFromRewardPool(rewardPool);

    expect(reward).toBeDefined();
    const validTypes = [RewardType.EXPERIENCE, RewardType.COIN, RewardType.ITEM];
    expect(validTypes).toContain(reward.type);
  });

  test('빈 보상 풀 추첨', () => {
    const reward = testEventReward.drawFromRewardPool([]);
    expect(reward).toBeNull();
  });

  test('캐릭터별 보상 기록 조회', () => {
    const reward = testEventReward.getReward('exp_small');
    testEventReward.giveReward(characterId, reward, 'test_event');

    testEventReward.giveReward(characterId, reward, 'test_event_2');

    const history = testEventReward.getCharacterRewardHistory(characterId);
    expect(history.length).toBeGreaterThanOrEqual(2);

    // 최신 순으로 정렬되어 있는지 확인
    const latestRecord = history[0];
    expect(latestRecord.source).toBe('test_event_2');
  });

  test('기록 제한 확인', () => {
    const reward = testEventReward.getReward('coin_small');

    for (let i = 0; i < 30; i++) {
      testEventReward.giveReward(characterId, reward, `test_event_${i}`);
    }

    const history = testEventReward.getCharacterRewardHistory(characterId, 10);
    expect(history.length).toBeLessThanOrEqual(10);
  });

  test('출처별 보상 기록 조회', () => {
    const reward = testEventReward.getReward('exp_small');

    testEventReward.giveReward(characterId, reward, 'seasonal_event');
    testEventReward.giveReward(characterId, reward, 'daily_quest');
    testEventReward.giveReward(characterId, reward, 'seasonal_event');

    const seasonalHistory = testEventReward.getSourceRewardHistory('seasonal_event');
    expect(seasonalHistory.length).toBeGreaterThanOrEqual(2);

    seasonalHistory.forEach(record => {
      expect(record.source).toBe('seasonal_event');
    });
  });

  test('모든 보상 조회', () => {
    const allRewards = testEventReward.getAllRewards();

    expect(allRewards.length).toBeGreaterThan(0);
  });

  test('티어별 보상 조회', () => {
    const commonRewards = testEventReward.getRewardsByTier(RewardTier.COMMON);

    expect(commonRewards.length).toBeGreaterThan(0);

    commonRewards.forEach(reward => {
      expect(reward.tier).toBe(RewardTier.COMMON);
    });
  });

  test('보상 통계', () => {
    testEventReward.giveReward(characterId, testEventReward.getReward('exp_small'), 'test1');
    testEventReward.giveReward(characterId, testEventReward.getReward('coin_small'), 'test2');
    testEventReward.giveReward(characterId, testEventReward.getReward('exp_small'), 'test1');

    const stats = testEventReward.getRewardStats();

    expect(stats).toBeDefined();
    expect(stats.totalRewardsGiven).toBeGreaterThan(0);
    expect(stats).toHaveProperty('rewardsByType');
    expect(stats).toHaveProperty('uniqueRewards');
  });

  test('보상 삭제', () => {
    testEventReward.createReward({
      id: 'delete_test',
      type: RewardType.EXPERIENCE,
      amount: 10,
      name: '삭제 테스트',
      tier: RewardTier.COMMON
    });

    const deleted = testEventReward.deleteReward('delete_test');
    expect(deleted).toBe(true);

    const reward = testEventReward.getReward('delete_test');
    expect(reward).toBeNull();
  });

  test('존재하지 않는 보상 삭제', () => {
    const deleted = testEventReward.deleteReward('nonexistent');
    expect(deleted).toBe(false);
  });

  test('모든 보상 초기화', () => {
    testEventReward.createReward({
      id: 'reset_test',
      type: RewardType.EXPERIENCE,
      amount: 999,
      name: '리셋 테스트',
      tier: RewardTier.LEGENDARY
    });

    testEventReward.resetAllRewards();

    const reward = testEventReward.getReward('reset_test');
    expect(reward).toBeNull();

    // 기본 보상들이 다시 로드되어 있는지 확인
    const defaultReward = testEventReward.getReward('exp_small');
    expect(defaultReward).toBeDefined();
  });

  test('싱글톤 인스턴스', () => {
    expect(eventReward).toBeDefined();
    expect(eventReward instanceof EventReward).toBe(true);

    // 두 번째 인스턴스 생성 해도 동일한 인스턴스인지 확인
    const { eventReward: eventReward2 } = require('../event-reward');
    expect(eventReward).toBe(eventReward2);
  });
});