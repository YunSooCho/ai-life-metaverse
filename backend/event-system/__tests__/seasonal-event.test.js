const { describe, test, expect, beforeEach, afterEach } = require('@vitest/runner');
const { SeasonalEvent, seasonalEvent, Season, SEASON_DATA } = require('../seasonal-event');

describe('SeasonalEvent', () => {
  let testSeasonalEvent;

  beforeEach(() => {
    testSeasonalEvent = new SeasonalEvent();
  });

  afterEach(() => {
    // Clean up
  });

  test('SeasonalEvent 인스턴스 생성', () => {
    expect(testSeasonalEvent).toBeDefined();
    expect(testSeasonalEvent instanceof SeasonalEvent).toBe(true);
  });

  test('현재 시즌 계산', () => {
    const currentSeason = testSeasonalEvent.getCurrentSeason();

    expect(currentSeason).toBeDefined();
    expect(Object.values(Season)).toContain(currentSeason);
  });

  test('현재 시즌 정보 조회', () => {
    const seasonInfo = testSeasonalEvent.getCurrentSeasonInfo();

    expect(seasonInfo).toBeDefined();
    expect(seasonInfo).toHaveProperty('season');
    expect(seasonInfo).toHaveProperty('name');
    expect(seasonInfo).toHaveProperty('description');
    expect(seasonInfo).toHaveProperty('colors');
    expect(seasonInfo).toHaveProperty('items');
    expect(seasonInfo).toHaveProperty('rewards');
  });

  test('모든 시즌 데이터 확인', () => {
    expect(SEASON_DATA).toBeDefined();
    expect(SEASON_DATA).toHaveProperty(Season.SPRING);
    expect(SEASON_DATA).toHaveProperty(Season.SUMMER);
    expect(SEASON_DATA).toHaveProperty(Season.AUTUMN);
    expect(SEASON_DATA).toHaveProperty(Season.WINTER);
  });

  test('시즌별 데이터 구조 확인', () => {
    for (const [season, data] of Object.entries(SEASON_DATA)) {
      expect(data).toHaveProperty('name');
      expect(data).toHaveProperty('description');
      expect(data).toHaveProperty('months');
      expect(Array.isArray(data.months)).toBe(true);
      expect(data).toHaveProperty('colors');
      expect(Array.isArray(data.colors)).toBe(true);
      expect(data).toHaveProperty('items');
      expect(Array.isArray(data.items)).toBe(true);
      expect(data).toHaveProperty('rewards');
      expect(Array.isArray(data.rewards)).toBe(true);
    }
  });

  test('봄 시즌 데이터', () => {
    const springData = SEASON_DATA[Season.SPRING];

    expect(springData.name).toBe('봄');
    expect(springData.months).toContain(3);
    expect(springData.months).toContain(4);
    expect(springData.months).toContain(5);
  });

  test('여름 시즌 데이터', () => {
    const summerData = SEASON_DATA[Season.SUMMER];

    expect(summerData.name).toBe('여름');
    expect(summerData.months).toContain(6);
    expect(summerData.months).toContain(7);
    expect(summerData.months).toContain(8);
  });

  test('가을 시즌 데이터', () => {
    const autumnData = SEASON_DATA[Season.AUTUMN];

    expect(autumnData.name).toBe('가을');
    expect(autumnData.months).toContain(9);
    expect(autumnData.months).toContain(10);
    expect(autumnData.months).toContain(11);
  });

  test('겨울 시즌 데이터', () => {
    const winterData = SEASON_DATA[Season.WINTER];

    expect(winterData.name).toBe('겨울');
    expect(winterData.months).toContain(12);
    expect(winterData.months).toContain(1);
    expect(winterData.months).toContain(2);
  });

  test('시즌별 이벤트 생성', () => {
    const events = testSeasonalEvent.createSeasonalEvents();

    expect(Array.isArray(events)).toBe(true);
    expect(events.length).toBeGreaterThan(0);

    const event = events[0];
    expect(event).toHaveProperty('id');
    expect(event).toHaveProperty('type');
    expect(event).toHaveProperty('name');
    expect(event).toHaveProperty('description');
    expect(event).toHaveProperty('startDate');
    expect(event).toHaveProperty('endDate');
    expect(event.type).toBe('seasonal');
  });

  test('시즌별 색상 팔레트', () => {
    const colors = testSeasonalEvent.getSeasonalColors(Season.SPRING);

    expect(colors).toBeDefined();
    expect(Array.isArray(colors)).toBe(true);
    expect(colors.length).toBeGreaterThan(0);
  });

  test('시즌별 특별 아이템', () => {
    const items = testSeasonalEvent.getSeasonalItems(Season.SPRING);

    expect(items).toBeDefined();
    expect(Array.isArray(items)).toBe(true);
    expect(items.length).toBeGreaterThan(0);
  });

  test('시즌별 보상', () => {
    const rewards = testSeasonalEvent.getSeasonalRewards(Season.SPRING);

    expect(rewards).toBeDefined();
    expect(Array.isArray(rewards)).toBe(true);
    expect(rewards.length).toBeGreaterThan(0);

    rewards.forEach(reward => {
      expect(reward).toHaveProperty('type');
      expect(reward).toHaveProperty('name');
      expect(reward).toHaveProperty('amount');
    });
  });

  test('시즌별 테마 스타일', () => {
    const theme = testSeasonalEvent.getSeasonalTheme(Season.SPRING);

    expect(theme).toBeDefined();
    expect(theme).toHaveProperty('colors');
    expect(theme).toHaveProperty('accentColor');
    expect(theme).toHaveProperty('secondaryColor');
    expect(theme).toHaveProperty('textColor');
    expect(theme).toHaveProperty('backgroundColor');
  });

  test('날짜로 시즌 계산', () => {
    // 봄 (3월)
    const springDate = new Date(2026, 2, 15);
    const springSeason = testSeasonalEvent.getSeasonByDate(springDate);
    expect(springSeason).toBe(Season.SPRING);

    // 여름 (7월)
    const summerDate = new Date(2026, 6, 15);
    const summerSeason = testSeasonalEvent.getSeasonByDate(summerDate);
    expect(summerSeason).toBe(Season.SUMMER);

    // 가을 (10월)
    const autumnDate = new Date(2026, 9, 15);
    const autumnSeason = testSeasonalEvent.getSeasonByDate(autumnDate);
    expect(autumnSeason).toBe(Season.AUTUMN);

    // 겨울 (1월)
    const winterDate = new Date(2026, 0, 15);
    const winterSeason = testSeasonalEvent.getSeasonByDate(winterDate);
    expect(winterSeason).toBe(Season.WINTER);
  });

  test('모든 시즌 정보 조회', () => {
    const allSeasons = testSeasonalEvent.getAllSeasons();

    expect(allSeasons).toBeDefined();
    expect(Object.keys(allSeasons)).toHaveLength(4);
    expect(allSeasons).toHaveProperty(Season.SPRING);
    expect(allSeasons).toHaveProperty(Season.SUMMER);
    expect(allSeasons).toHaveProperty(Season.AUTUMN);
    expect(allSeasons).toHaveProperty(Season.WINTER);
  });

  test('시즌 전환 이벤트 생성', () => {
    const transitionEvent = testSeasonalEvent.createSeasonTransitionEvent(
      Season.SPRING,
      Season.SUMMER
    );

    expect(transitionEvent).toBeDefined();
    expect(transitionEvent).toHaveProperty('id');
    expect(transitionEvent).toHaveProperty('name');
    expect(transitionEvent.name).toContain('시즌 전환');
    expect(transitionEvent.type).toBe('seasonal');
    expect(transitionEvent.isTransition).toBe(true);
  });

  test('싱글톤 인스턴스', () => {
    expect(seasonalEvent).toBeDefined();
    expect(seasonalEvent instanceof SeasonalEvent).toBe(true);

    // 두 번째 인스턴스 생성 해도 동일한 인스턴스인지 확인
    const { seasonalEvent: seasonalEvent2 } = require('../seasonal-event');
    expect(seasonalEvent).toBe(seasonalEvent2);
  });

  test('시즌 열거형 값', () => {
    expect(Season.SPRING).toBe('spring');
    expect(Season.SUMMER).toBe('summer');
    expect(Season.AUTUMN).toBe('autumn');
    expect(Season.WINTER).toBe('winter');
  });
});