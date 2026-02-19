const { describe, test, expect, beforeEach, afterEach } = require('@vitest/runner');
const { DailyQuest, dailyQuest, DailyQuestCategory, DAILY_QUEST_TEMPLATES } = require('../daily-quest');

describe('DailyQuest', () => {
  let testDailyQuest;
  const characterId = 'test_char_001';

  beforeEach(() => {
    testDailyQuest = new DailyQuest();
  });

  afterEach(() => {
    testDailyQuest.resetDailyQuests();
  });

  test('DailyQuest 인스턴스 생성', () => {
    expect(testDailyQuest).toBeDefined();
    expect(testDailyQuest instanceof DailyQuest).toBe(true);
  });

  test('일일 퀘스트 템플릿 확인', () => {
    expect(DAILY_QUEST_TEMPLATES).toBeDefined();
    expect(Array.isArray(DAILY_QUEST_TEMPLATES)).toBe(true);
    expect(DAILY_QUEST_TEMPLATES.length).toBeGreaterThan(0);

    const template = DAILY_QUEST_TEMPLATES[0];
    expect(template).toHaveProperty('id');
    expect(template).toHaveProperty('name');
    expect(template).toHaveProperty('description');
    expect(template).toHaveProperty('category');
    expect(template).toHaveProperty('target');
    expect(template).toHaveProperty('reward');
    expect(template).toHaveProperty('difficulty');
  });

  test('일일 카테고리 열거형 확인', () => {
    expect(DailyQuestCategory.SOCIAL).toBe('social');
    expect(DailyQuestCategory.EXPLORATION).toBe('exploration');
    expect(DailyQuestCategory.COLLECTION).toBe('collection');
    expect(DailyQuestCategory.COMBAT).toBe('combat');
    expect(DailyQuestCategory.EVENT).toBe('event');
  });

  test('일일 퀘스트 생성', () => {
    const quests = testDailyQuest.createDailyQuests(characterId);

    expect(quests).toBeDefined();
    expect(Array.isArray(quests)).toBe(true);
    expect(quests.length).toBeGreaterThan(0);

    const quest = quests[0];
    expect(quest).toHaveProperty('id');
    expect(quest).toHaveProperty('name');
    expect(quest).toHaveProperty('description');
    expect(quest).toHaveProperty('category');
    expect(quest).toHaveProperty('target');
    expect(quest).toHaveProperty('progress');
    expect(quest).toHaveProperty('completed');
    expect(quest).toHaveProperty('claimed');
    expect(quest).toHaveProperty('createdAt');
    expect(quest).toHaveProperty('expiresAt');
    expect(quest.characterId).toBe(characterId);
    expect(quest.progress).toBe(0);
    expect(quest.completed).toBe(false);
    expect(quest.claimed).toBe(false);
  });

  test('캐릭터별 일일 퀘스트 조회', () => {
    const createdQuests = testDailyQuest.createDailyQuests(characterId);
    const retrievedQuests = testDailyQuest.getCharacterDailyQuests(characterId);

    expect(retrievedQuests.length).toBe(createdQuests.length);
  });

  test('없는 캐릭터의 퀘스트 조회', () => {
    const quests = testDailyQuest.getCharacterDailyQuests('nonexistent_char');
    expect(quests).toEqual([]);
  });

  test('퀘스트 진행 업데이트', () => {
    const quests = testDailyQuest.createDailyQuests(characterId);
    const quest = quests[0];

    const completed = testDailyQuest.updateQuestProgress(characterId, quest.id, 5);
    expect(completed).toBe(false);
  });

  test('퀘스트 완료', () => {
    const quests = testDailyQuest.createDailyQuests(characterId);
    const quest = quests[0];

    // 목표치만큼 진행
    const completed = testDailyQuest.updateQuestProgress(characterId, quest.id, quest.target);
    expect(completed).toBe(true);

    const updatedQuests = testDailyQuest.getCharacterDailyQuests(characterId);
    const updatedQuest = updatedQuests.find(q => q.id === quest.id);
    expect(updatedQuest.completed).toBe(true);
    expect(updatedQuest.progress).toBe(quest.target);
  });

  test('존재하지 않는 퀘스트 진행 업데이트', () => {
    testDailyQuest.createDailyQuests(characterId);
    const result = testDailyQuest.updateQuestProgress(characterId, 'nonexistent_quest', 5);
    expect(result).toBeNull();
  });

  test('이미 완료된 퀘스트는 업데이트 안 함', () => {
    const quests = testDailyQuest.createDailyQuests(characterId);
    const quest = quests[0];

    // 완료
    testDailyQuest.updateQuestProgress(characterId, quest.id, quest.target);

    // 추가 업데이트 시도
    const result = testDailyQuest.updateQuestProgress(characterId, quest.id, 1);
    expect(result).toBe(true); // 이미 완료 상태

    const updatedQuests = testDailyQuest.getCharacterDailyQuests(characterId);
    const updatedQuest = updatedQuests.find(q => q.id === quest.id);
    expect(updatedQuest.progress).toBe(quest.target); // 목표치를 넘지 않음
  });

  test('퀘스트 보상 수령', () => {
    const quests = testDailyQuest.createDailyQuests(characterId);
    const quest = quests[0];

    // 완료
    testDailyQuest.updateQuestProgress(characterId, quest.id, quest.target);

    // 보상 수령
    const reward = testDailyQuest.claimQuestReward(characterId, quest.id);
    expect(reward).toBeDefined();
    expect(reward).toHaveProperty('type');
    expect(reward).toHaveProperty('amount');

    const updatedQuests = testDailyQuest.getCharacterDailyQuests(characterId);
    const updatedQuest = updatedQuests.find(q => q.id === quest.id);
    expect(updatedQuest.claimed).toBe(true);
  });

  test('완료되지 않은 퀘스트 보상 수령 실패', () => {
    const quests = testDailyQuest.createDailyQuests(characterId);
    const quest = quests[0];

    const reward = testDailyQuest.claimQuestReward(characterId, quest.id);
    expect(reward).toBeNull();
  });

  test('이미 수령한 퀘스트 보상 수령 실패', () => {
    const quests = testDailyQuest.createDailyQuests(characterId);
    const quest = quests[0];

    // 완료하고 보상 수령
    testDailyQuest.updateQuestProgress(characterId, quest.id, quest.target);
    testDailyQuest.claimQuestReward(characterId, quest.id);

    // 다시 수령 시도
    const reward = testDailyQuest.claimQuestReward(characterId, quest.id);
    expect(reward).toBeNull();
  });

  test('캐릭터별 퀘스트 리셋', () => {
    testDailyQuest.createDailyQuests(characterId);
    expect(testDailyQuest.isTodayQuestsValid(characterId)).toBe(true);

    testDailyQuest.resetCharacterQuests(characterId);
    expect(testDailyQuest.isTodayQuestsValid(characterId)).toBe(false);
  });

  test('퀘스트 통계 조회', () => {
    const quests = testDailyQuest.createDailyQuests(characterId);

    // 첫 번째 퀘스트 완료
    const quest1 = quests[0];
    testDailyQuest.updateQuestProgress(characterId, quest1.id, quest1.target);
    testDailyQuest.claimQuestReward(characterId, quest1.id);

    // 두 번째 퀘스트 진행 중
    const quest2 = quests[1];
    testDailyQuest.updateQuestProgress(characterId, quest2.id, 5);

    const stats = testDailyQuest.getDailyQuestStats(characterId);

    expect(stats).toBeDefined();
    expect(stats.total).toBe(quests.length);
    expect(stats.completed).toBe(1);
    expect(stats.claimed).toBe(1);
    expect(stats.inProgress).toBeGreaterThanOrEqual(0);
    expect(stats.notStarted).toBeGreaterThanOrEqual(0);
  });

  test('없는 캐릭터의 퀘스트 통계', () => {
    const stats = testDailyQuest.getDailyQuestStats('nonexistent_char');

    expect(stats).toBeDefined();
    expect(stats.total).toBe(0);
    expect(stats.completed).toBe(0);
    expect(stats.claimed).toBe(0);
    expect(stats.inProgress).toBe(0);
    expect(stats.notStarted).toBe(0);
  });

  test('퀘스트 만료 확인', () => {
    // 만료된 기간으로 퀘스트 생성
    testDailyQuest.createDailyQuests(characterId);

    const quests = testDailyQuest.getCharacterDailyQuests(characterId);
    if (quests.length > 0) {
      const quest = quests[0];
      expect(quest.expiresAt).toBeDefined();
      expect(quest.expiresAt instanceof Date || typeof quest.expiresAt === 'string').toBe(true);
    }
  });

  test('하루 끝 시간 계산', () => {
    const endOfDay = testDailyQuest.getEndOfDay();

    expect(endOfDay).toBeDefined();
    expect(endOfDay.getHours()).toBe(23);
    expect(endOfDay.getMinutes()).toBe(59);
    expect(endOfDay.getSeconds()).toBe(59);
  });

  test('퀘스트 ID 생성', () => {
    const questId1 = testDailyQuest.generateQuestId();
    const questId2 = testDailyQuest.generateQuestId();

    expect(questId1).toBeDefined();
    expect(questId2).toBeDefined();
    expect(questId1).not.toBe(questId2);
  });

  test('오늘의 퀘스트 유효성 확인', () => {
    const isValid = testDailyQuest.isTodayQuestsValid(characterId);
    expect(isValid).toBe(false); // 퀘스트 생성 전

    testDailyQuest.createDailyQuests(characterId);
    const isValidAfter = testDailyQuest.isTodayQuestsValid(characterId);
    expect(isValidAfter).toBe(true);
  });

  test('커스텀 퀘스트 템플릿 사용', () => {
    const customTemplates = [
      {
        id: 'custom_quest_1',
        name: '커스텀 퀘스트',
        description: '커스텀 테스트 퀘스트',
        category: DailyQuestCategory.SOCIAL,
        target: 100,
        reward: { type: 'experience', amount: 1000 },
        difficulty: 'hard'
      }
    ];

    const quests = testDailyQuest.createDailyQuests(characterId, customTemplates);
    expect(quests.length).toBeGreaterThan(0);

    const customQuest = quests.find(q => q.id.includes('custom_quest_1'));
    expect(customQuest).toBeDefined();
    expect(customQuest.name).toBe('커스텀 퀘스트');
  });

  test('이미 유효한 퀘스트가 있으면 새로 생성 안 함', () => {
    testDailyQuest.createDailyQuests(characterId);

    const quests1 = testDailyQuest.getCharacterDailyQuests(characterId);
    testDailyQuest.createDailyQuests(characterId);

    const quests2 = testDailyQuest.getCharacterDailyQuests(characterId);

    expect(quests1.length).toBe(quests2.length);
  });

  test('싱글톤 인스턴스', () => {
    expect(dailyQuest).toBeDefined();
    expect(dailyQuest instanceof DailyQuest).toBe(true);

    // 두 번째 인스턴스 생성 해도 동일한 인스턴스인지 확인
    const { dailyQuest: dailyQuest2 } = require('../daily-quest');
    expect(dailyQuest).toBe(dailyQuest2);
  });
});