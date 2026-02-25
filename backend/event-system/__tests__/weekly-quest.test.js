const { describe, test, expect, beforeEach, afterEach } = require('@vitest/runner');
const { WeeklyQuest, weeklyQuest, WeeklyQuestCategory, WEEKLY_QUEST_TEMPLATES } = require('../weekly-quest');

describe('WeeklyQuest', () => {
  let testWeeklyQuest;
  const characterId = 'test_char_001';

  beforeEach(() => {
    testWeeklyQuest = new WeeklyQuest();
  });

  afterEach(() => {
    testWeeklyQuest.resetWeeklyQuests();
  });

  test('WeeklyQuest 인스턴스 생성', () => {
    expect(testWeeklyQuest).toBeDefined();
    expect(testWeeklyQuest instanceof WeeklyQuest).toBe(true);
  });

  test('주간 퀘스트 템플릿 확인', () => {
    expect(WEEKLY_QUEST_TEMPLATES).toBeDefined();
    expect(Array.isArray(WEEKLY_QUEST_TEMPLATES)).toBe(true);
    expect(WEEKLY_QUEST_TEMPLATES.length).toBeGreaterThan(0);

    const template = WEEKLY_QUEST_TEMPLATES[0];
    expect(template).toHaveProperty('id');
    expect(template).toHaveProperty('name');
    expect(template).toHaveProperty('description');
    expect(template).toHaveProperty('category');
    expect(template).toHaveProperty('target');
    expect(template).toHaveProperty('reward');
    expect(template).toHaveProperty('difficulty');
  });

  test('주간 카테고리 열거형 확인', () => {
    expect(WeeklyQuestCategory.SOCIAL).toBe('social');
    expect(WeeklyQuestCategory.EXPLORATION).toBe('exploration');
    expect(WeeklyQuestCategory.COLLECTION).toBe('collection');
    expect(WeeklyQuestCategory.MASTERY).toBe('mastery');
    expect(WeeklyQuestCategory.EVENT).toBe('event');
  });

  test('주간 퀘스트 생성', () => {
    const quests = testWeeklyQuest.createWeeklyQuests(characterId);

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

  test('캐릭터별 주간 퀘스트 조회', () => {
    const createdQuests = testWeeklyQuest.createWeeklyQuests(characterId);
    const retrievedQuests = testWeeklyQuest.getCharacterWeeklyQuests(characterId);

    expect(retrievedQuests.length).toBe(createdQuests.length);
  });

  test('없는 캐릭터의 퀘스트 조회', () => {
    const quests = testWeeklyQuest.getCharacterWeeklyQuests('nonexistent_char');
    expect(quests).toEqual([]);
  });

  test('퀘스트 진행 업데이트', () => {
    const quests = testWeeklyQuest.createWeeklyQuests(characterId);
    const quest = quests[0];

    const completed = testWeeklyQuest.updateQuestProgress(characterId, quest.id, 5);
    expect(completed).toBe(false);
  });

  test('퀘스트 완료', () => {
    const quests = testWeeklyQuest.createWeeklyQuests(characterId);
    const quest = quests[0];

    // 목표치만큼 진행
    const completed = testWeeklyQuest.updateQuestProgress(characterId, quest.id, quest.target);
    expect(completed).toBe(true);

    const updatedQuests = testWeeklyQuest.getCharacterWeeklyQuests(characterId);
    const updatedQuest = updatedQuests.find(q => q.id === quest.id);
    expect(updatedQuest.completed).toBe(true);
    expect(updatedQuest.progress).toBe(quest.target);
  });

  test('존재하지 않는 퀘스트 진행 업데이트', () => {
    testWeeklyQuest.createWeeklyQuests(characterId);
    const result = testWeeklyQuest.updateQuestProgress(characterId, 'nonexistent_quest', 5);
    expect(result).toBeNull();
  });

  test('이미 완료된 퀘스트는 업데이트 안 함', () => {
    const quests = testWeeklyQuest.createWeeklyQuests(characterId);
    const quest = quests[0];

    // 완료
    testWeeklyQuest.updateQuestProgress(characterId, quest.id, quest.target);

    // 추가 업데이트 시도
    const result = testWeeklyQuest.updateQuestProgress(characterId, quest.id, 1);
    expect(result).toBe(true); // 이미 완료 상태

    const updatedQuests = testWeeklyQuest.getCharacterWeeklyQuests(characterId);
    const updatedQuest = updatedQuests.find(q => q.id === quest.id);
    expect(updatedQuest.progress).toBe(quest.target); // 목표치를 넘지 않음
  });

  test('퀘스트 보상 수령', () => {
    const quests = testWeeklyQuest.createWeeklyQuests(characterId);
    const quest = quests[0];

    // 완료
    testWeeklyQuest.updateQuestProgress(characterId, quest.id, quest.target);

    // 보상 수령
    const reward = testWeeklyQuest.claimQuestReward(characterId, quest.id);
    expect(reward).toBeDefined();
    expect(reward).toHaveProperty('type');
    expect(reward).toHaveProperty('amount');

    const updatedQuests = testWeeklyQuest.getCharacterWeeklyQuests(characterId);
    const updatedQuest = updatedQuests.find(q => q.id === quest.id);
    expect(updatedQuest.claimed).toBe(true);
  });

  test('완료되지 않은 퀘스트 보상 수령 실패', () => {
    const quests = testWeeklyQuest.createWeeklyQuests(characterId);
    const quest = quests[0];

    const reward = testWeeklyQuest.claimQuestReward(characterId, quest.id);
    expect(reward).toBeNull();
  });

  test('이미 수령한 퀘스트 보상 수령 실패', () => {
    const quests = testWeeklyQuest.createWeeklyQuests(characterId);
    const quest = quests[0];

    // 완료하고 보상 수령
    testWeeklyQuest.updateQuestProgress(characterId, quest.id, quest.target);
    testWeeklyQuest.claimQuestReward(characterId, quest.id);

    // 다시 수령 시도
    const reward = testWeeklyQuest.claimQuestReward(characterId, quest.id);
    expect(reward).toBeNull();
  });

  test('캐릭터별 퀘스트 리셋', () => {
    testWeeklyQuest.createWeeklyQuests(characterId);
    expect(testWeeklyQuest.isThisWeekQuestsValid(characterId)).toBe(true);

    testWeeklyQuest.resetCharacterQuests(characterId);
    expect(testWeeklyQuest.isThisWeekQuestsValid(characterId)).toBe(false);
  });

  test('퀘스트 통계 조회', () => {
    const quests = testWeeklyQuest.createWeeklyQuests(characterId);

    // 첫 번째 퀘스트 완료
    const quest1 = quests[0];
    testWeeklyQuest.updateQuestProgress(characterId, quest1.id, quest1.target);
    testWeeklyQuest.claimQuestReward(characterId, quest1.id);

    // 두 번째 퀘스트 진행 중
    const quest2 = quests[1];
    testWeeklyQuest.updateQuestProgress(characterId, quest2.id, 10);

    const stats = testWeeklyQuest.getWeeklyQuestStats(characterId);

    expect(stats).toBeDefined();
    expect(stats.total).toBe(quests.length);
    expect(stats.completed).toBe(1);
    expect(stats.claimed).toBe(1);
    expect(stats.inProgress).toBeGreaterThanOrEqual(0);
    expect(stats.notStarted).toBeGreaterThanOrEqual(0);
  });

  test('없는 캐릭터의 퀘스트 통계', () => {
    const stats = testWeeklyQuest.getWeeklyQuestStats('nonexistent_char');

    expect(stats).toBeDefined();
    expect(stats.total).toBe(0);
    expect(stats.completed).toBe(0);
    expect(stats.claimed).toBe(0);
    expect(stats.inProgress).toBe(0);
    expect(stats.notStarted).toBe(0);
  });

  test('한 주 끝 시간 계산 (일요일)', () => {
    const endOfWeek = testWeeklyQuest.getEndOfWeek();

    expect(endOfWeek).toBeDefined();
    expect(endOfWeek.getDay()).toBe(0); // 일요일
    expect(endOfWeek.getHours()).toBe(23);
    expect(endOfWeek.getMinutes()).toBe(59);
    expect(endOfWeek.getSeconds()).toBe(59);
  });

  test('퀘스트 ID 생성', () => {
    const questId1 = testWeeklyQuest.generateQuestId();
    const questId2 = testWeeklyQuest.generateQuestId();

    expect(questId1).toBeDefined();
    expect(questId2).toBeDefined();
    expect(questId1).not.toBe(questId2);
  });

  test('이번 주 퀘스트 유효성 확인', () => {
    const isValid = testWeeklyQuest.isThisWeekQuestsValid(characterId);
    expect(isValid).toBe(false); // 퀘스트 생성 전

    testWeeklyQuest.createWeeklyQuests(characterId);
    const isValidAfter = testWeeklyQuest.isThisWeekQuestsValid(characterId);
    expect(isValidAfter).toBe(true);
  });

  test('커스텀 퀘스트 템플릿 사용', () => {
    const customTemplates = [
      {
        id: 'custom_weekly_quest_1',
        name: '커스텀 주간 퀘스트',
        description: '커스텀 주간 테스트 퀘스트',
        category: WeeklyQuestCategory.MASTERY,
        target: 10,
        reward: { type: 'experience', amount: 2000 },
        difficulty: 'hard'
      }
    ];

    const quests = testWeeklyQuest.createWeeklyQuests(characterId, customTemplates);
    expect(quests.length).toBeGreaterThan(0);

    const customQuest = quests.find(q => q.id.includes('custom_weekly_quest_1'));
    expect(customQuest).toBeDefined();
    expect(customQuest.name).toBe('커스텀 주간 퀘스트');
  });

  test('이미 유효한 퀘스트가 있으면 새로 생성 안 함', () => {
    testWeeklyQuest.createWeeklyQuests(characterId);

    const quests1 = testWeeklyQuest.getCharacterWeeklyQuests(characterId);
    testWeeklyQuest.createWeeklyQuests(characterId);

    const quests2 = testWeeklyQuest.getCharacterWeeklyQuests(characterId);

    expect(quests1.length).toBe(quests2.length);
  });

  test('이번 주 남은 기간 계산', () => {
    const remainingInfo = testWeeklyQuest.getRemainingWeekInfo();

    expect(remainingInfo).toBeDefined();
    expect(remainingInfo).toHaveProperty('endOfWeek');
    expect(remainingInfo).toHaveProperty('remainingDays');
    expect(remainingInfo).toHaveProperty('remainingHours');
    expect(remainingInfo).toHaveProperty('remainingMinutes');
    expect(remainingInfo).toHaveProperty('totalRemainingHours');

    expect(remainingInfo.endOfWeek).toBeInstanceOf(Date);
    expect(remainingInfo.remainingDays).toBeGreaterThanOrEqual(0);
    expect(remainingInfo.remainingHours).toBeGreaterThanOrEqual(0);
    expect(remainingInfo.remainingMinutes).toBeGreaterThanOrEqual(0);
    expect(remainingInfo.totalRemainingHours).toBeGreaterThanOrEqual(0);

    // 일요일 확인
    expect(remainingInfo.endOfWeek.getDay()).toBe(0);
  });

  test('주간 퀘스트 난이도 분포 확인', () => {
    const quests = testWeeklyQuest.createWeeklyQuests(characterId);

    const easyCount = quests.filter(q => q.difficulty === 'easy').length;
    const normalCount = quests.filter(q => q.difficulty === 'normal').length;
    const hardCount = quests.filter(q => q.difficulty === 'hard').length;

    // 일반적으로 normal과 hard가 더 많음
    expect(quests.length).toBe(easyCount + normalCount + hardCount);
  });

  test('싱글톤 인스턴스', () => {
    expect(weeklyQuest).toBeDefined();
    expect(weeklyQuest instanceof WeeklyQuest).toBe(true);

    // 두 번째 인스턴스 생성 해도 동일한 인스턴스인지 확인
    const { weeklyQuest: weeklyQuest2 } = require('../weekly-quest');
    expect(weeklyQuest).toBe(weeklyQuest2);
  });
});