const { describe, test, expect, beforeEach, afterEach } = require('@vitest/runner');
const { EventSystem, eventSystem } = require('../index');

describe('Event System Integration', () => {
  let testEventSystem;
  const characterId = 'test_char_001';

  beforeEach(() => {
    testEventSystem = new EventSystem();
  });

  afterEach(() => {
    testEventSystem.reset();
  });

  test('EventSystem 인스턴스 생성', () => {
    expect(testEventSystem).toBeDefined();
    expect(testEventSystem instanceof EventSystem).toBe(true);
  });

  test('이벤트 시스템 초기화 (시즌 이벤트 자동 생성)', () => {
    const result = testEventSystem.initialize({ autoCreateSeasonalEvents: true });

    expect(result).toBe(true);
    expect(testEventSystem.initialized).toBe(true);
  });

  test('이벤트 시스템 초기화 (시즌 이벤트 비활성화)', () => {
    const result = testEventSystem.initialize({ autoCreateSeasonalEvents: false });

    expect(result).toBe(true);
    expect(testEventSystem.initialized).toBe(true);
  });

  test('활성 이벤트 목록 조회', () => {
    testEventSystem.initialize();

    const activeEvents = testEventSystem.getActiveEvents();
    expect(Array.isArray(activeEvents)).toBe(true);
  });

  test('캐릭터용 일일 퀘스트 생성', () => {
    const quests = testEventSystem.createCharacterDailyQuests(characterId);

    expect(quests).toBeDefined();
    expect(Array.isArray(quests)).toBe(true);
    expect(quests.length).toBeGreaterThan(0);

    quests.forEach(quest => {
      expect(quest.characterId).toBe(characterId);
      expect(quest).toHaveProperty('id');
      expect(quest).toHaveProperty('name');
      expect(quest).toHaveProperty('target');
      expect(quest).toHaveProperty('progress');
    });
  });

  test('이미 유효한 일일 퀘스트가 있으면 재생성 안 함', () => {
    const quests1 = testEventSystem.createCharacterDailyQuests(characterId);
    const quests2 = testEventSystem.createCharacterDailyQuests(characterId);

    expect(quests1.length).toBe(quests2.length);
  });

  test('캐릭터용 주간 퀘스트 생성', () => {
    const quests = testEventSystem.createCharacterWeeklyQuests(characterId);

    expect(quests).toBeDefined();
    expect(Array.isArray(quests)).toBe(true);
    expect(quests.length).toBeGreaterThan(0);

    quests.forEach(quest => {
      expect(quest.characterId).toBe(characterId);
      expect(quest).toHaveProperty('id');
      expect(quest).toHaveProperty('name');
      expect(quest).toHaveProperty('target');
      expect(quest).toHaveProperty('progress');
    });
  });

  test('이미 유효한 주간 퀘스트가 있으면 재생성 안 함', () => {
    const quests1 = testEventSystem.createCharacterWeeklyQuests(characterId);
    const quests2 = testEventSystem.createCharacterWeeklyQuests(characterId);

    expect(quests1.length).toBe(quests2.length);
  });

  test('캐릭터의 퀘스트 조회', () => {
    const dailyQuests = testEventSystem.createCharacterDailyQuests(characterId);
    const weeklyQuests = testEventSystem.createCharacterWeeklyQuests(characterId);

    const characterQuests = testEventSystem.getCharacterQuests(characterId);

    expect(characterQuests).toBeDefined();
    expect(characterQuests).toHaveProperty('daily');
    expect(characterQuests).toHaveProperty('weekly');

    expect(characterQuests.daily.length).toBe(dailyQuests.length);
    expect(characterQuests.weekly.length).toBe(weeklyQuests.length);
  });

  test('이벤트 참가', () => {
    testEventSystem.initialize();

    const activeEvents = testEventSystem.getActiveEvents();

    if (activeEvents.length > 0) {
      const eventId = activeEvents[0].id;
      const result = testEventSystem.joinEvent(characterId, eventId);
      expect(result).toBe(true);
    }
  });

  test('퀘스트 진행 업데이트 (일일)', () => {
    const dailyQuests = testEventSystem.createCharacterDailyQuests(characterId);

    if (dailyQuests.length > 0) {
      const quest = dailyQuests[0];
      const completed = testEventSystem.dailyQuest.updateQuestProgress(characterId, quest.id, quest.target);
      expect(completed).toBe(true);
    }
  });

  test('퀘스트 진행 업데이트 (주간)', () => {
    const weeklyQuests = testEventSystem.createCharacterWeeklyQuests(characterId);

    if (weeklyQuests.length > 0) {
      const quest = weeklyQuests[0];
      const completed = testEventSystem.weeklyQuest.updateQuestProgress(characterId, quest.id, quest.target);
      expect(completed).toBe(true);
    }
  });

  test('퀘스트 보상 수령 (일일)', () => {
    const dailyQuests = testEventSystem.createCharacterDailyQuests(characterId);

    if (dailyQuests.length > 0) {
      const quest = dailyQuests[0];
      testEventSystem.dailyQuest.updateQuestProgress(characterId, quest.id, quest.target);

      const reward = testEventSystem.claimQuestReward(characterId, quest.id, 'daily');
      expect(reward).toBeDefined();
    }
  });

  test('퀘스트 보상 수령 (주간)', () => {
    const weeklyQuests = testEventSystem.createCharacterWeeklyQuests(characterId);

    if (weeklyQuests.length > 0) {
      const quest = weeklyQuests[0];
      testEventSystem.weeklyQuest.updateQuestProgress(characterId, quest.id, quest.target);

      const reward = testEventSystem.claimQuestReward(characterId, quest.id, 'weekly');
      expect(reward).toBeDefined();
    }
  });

  test('시스템 통계 조회', () => {
    testEventSystem.initialize();
    testEventSystem.createCharacterDailyQuests(characterId);
    testEventSystem.createCharacterWeeklyQuests(characterId);

    const stats = testEventSystem.getSystemStats();

    expect(stats).toBeDefined();
    expect(stats).toHaveProperty('initialized');
    expect(stats).toHaveProperty('currentSeason');
    expect(stats).toHaveProperty('activeEventsCount');
    expect(stats).toHaveProperty('activeEvents');
    expect(stats).toHaveProperty('eventStats');
    expect(stats).toHaveProperty('rewardStats');
    expect(stats).toHaveProperty('specialEventType');
    expect(stats).toHaveProperty('seasonalEventType');

    expect(stats.initialized).toBe(true);
    expect(stats.currentSeason).toBeDefined();
    expect(stats.activeEventsCount).toBeGreaterThanOrEqual(0);
  });

  test('현재 시즌 확인', () => {
    testEventSystem.initialize();

    const stats = testEventSystem.getSystemStats();
    expect(stats.currentSeason).toBeDefined();
  });

  test('이벤트 보상 수령', () => {
    testEventSystem.initialize();

    const activeEvents = testEventSystem.getActiveEvents();

    if (activeEvents.length > 0) {
      const event = activeEvents[0];

      // 이벤트 참가
      testEventSystem.joinEvent(characterId, event.id);

      // 이벤트 참가 내역에 추가 (보상 수령 가능하도록)
      event.participants.add(characterId);

      // 보상 수령
      const reward = testEventSystem.claimEventReward(characterId, event.id);
      expect(reward).toBeDefined();
    }
  });

  test('모든 하위 시스템 초기화 확인', () => {
    testEventSystem.initialize();

    expect(testEventSystem.eventManager).toBeDefined();
    expect(testEventSystem.seasonalEvent).toBeDefined();
    expect(testEventSystem.specialEvent).toBeDefined();
    expect(testEventSystem.dailyQuest).toBeDefined();
    expect(testEventSystem.weeklyQuest).toBeDefined();
    expect(testEventSystem.eventReward).toBeDefined();
  });

  test('시스템 통합 테스트: 전체 워크플로우', () => {
    // 1. 시스템 초기화
    testEventSystem.initialize();
    expect(testEventSystem.initialized).toBe(true);

    // 2. 일일 퀘스트 생성
    const dailyQuests = testEventSystem.createCharacterDailyQuests(characterId);
    expect(dailyQuests.length).toBeGreaterThan(0);

    // 3. 주간 퀘스트 생성
    const weeklyQuests = testEventSystem.createCharacterWeeklyQuests(characterId);
    expect(weeklyQuests.length).toBeGreaterThan(0);

    // 4. 일일 퀘스트 완료
    const dailyQuest = dailyQuests[0];
    testEventSystem.dailyQuest.updateQuestProgress(characterId, dailyQuest.id, dailyQuest.target);

    // 5. 일일 퀘스트 보상 수령
    const dailyReward = testEventSystem.claimQuestReward(characterId, dailyQuest.id, 'daily');
    expect(dailyReward).toBeDefined();

    // 6. 주간 퀘스트 완료
    const weeklyQuest = weeklyQuests[0];
    testEventSystem.weeklyQuest.updateQuestProgress(characterId, weeklyQuest.id, weeklyQuest.target);

    // 7. 주간 퀘스트 보상 수령
    const weeklyReward = testEventSystem.claimQuestReward(characterId, weeklyQuest.id, 'weekly');
    expect(weeklyReward).toBeDefined();

    // 8. 통계 확인
    const stats = testEventSystem.getSystemStats();
    expect(stats).toBeDefined();

    // 9. 보상 기록 확인
    const rewardHistory = testEventSystem.eventReward.getCharacterRewardHistory(characterId);
    expect(rewardHistory.length).toBeGreaterThanOrEqual(2);
  });

  test('시스템 리셋', () => {
    testEventSystem.initialize();
    testEventSystem.createCharacterDailyQuests(characterId);
    testEventSystem.createCharacterWeeklyQuests(characterId);

    testEventSystem.reset();

    expect(testEventSystem.initialized).toBe(false);

    const dailyQuests = testEventSystem.dailyQuest.getCharacterDailyQuests(characterId);
    const weeklyQuests = testEventSystem.weeklyQuest.getCharacterWeeklyQuests(characterId);

    expect(dailyQuests.length).toBe(0);
    expect(weeklyQuests.length).toBe(0);
  });

  test('이미 초기화된 시스템 재초기화', () => {
    testEventSystem.initialize();
    const result = testEventSystem.initialize();

    expect(result).toBe(true); // 이미 초기화되어 있어도 성공
  });

  test('싱글톤 인스턴스', () => {
    expect(eventSystem).toBeDefined();
    expect(eventSystem instanceof EventSystem).toBe(true);

    // 두 번째 인스턴스 생성 해도 동일한 인스턴스인지 확인
    const { eventSystem: eventSystem2 } = require('../index');
    expect(eventSystem).toBe(eventSystem2);
  });
});