const { describe, test, expect, beforeEach, afterEach } = require('@vitest/runner');
const { SpecialEvent, specialEvent, SpecialEventType, SPECIAL_EVENT_DATA } = require('../special-event');

describe('SpecialEvent', () => {
  let testSpecialEvent;

  beforeEach(() => {
    testSpecialEvent = new SpecialEvent();
  });

  afterEach(() => {
    testSpecialEvent.deactivateAllSpecialEvents();
  });

  test('SpecialEvent 인스턴스 생성', () => {
    expect(testSpecialEvent).toBeDefined();
    expect(testSpecialEvent instanceof SpecialEvent).toBe(true);
  });

  test('모든 특별 이벤트 타입 데이터 확인', () => {
    expect(SPECIAL_EVENT_DATA).toBeDefined();
    expect(SPECIAL_EVENT_DATA).toHaveProperty(SpecialEventType.HALLOWEEN);
    expect(SPECIAL_EVENT_DATA).toHaveProperty(SpecialEventType.CHRISTMAS);
    expect(SPECIAL_EVENT_DATA).toHaveProperty(SpecialEventType.NEW_YEAR);
    expect(SPECIAL_EVENT_DATA).toHaveProperty(SpecialEventType.VALENTINE);
    expect(SPECIAL_EVENT_DATA).toHaveProperty(SpecialEventType.ANNIVERSARY);
  });

  test('할로윈 이벤트 데이터 구조', () => {
    const halloween = SPECIAL_EVENT_DATA[SpecialEventType.HALLOWEEN];

    expect(halloween).toHaveProperty('name');
    expect(halloween).toHaveProperty('emoji');
    expect(halloween).toHaveProperty('description');
    expect(halloween).toHaveProperty('defaultStartDate');
    expect(halloween).toHaveProperty('defaultDurationDays');
    expect(halloween).toHaveProperty('colors');
    expect(halloween).toHaveProperty('items');
    expect(halloween).toHaveProperty('rewards');
    expect(halloween).toHaveProperty('specialActivities');

    expect(halloween.emoji).toBe('🎃');
    expect(Array.isArray(halloween.colors)).toBe(true);
    expect(Array.isArray(halloween.items)).toBe(true);
    expect(Array.isArray(halloween.rewards)).toBe(true);
    expect(Array.isArray(halloween.specialActivities)).toBe(true);
  });

  test('크리스마스 이벤트 데이터', () => {
    const christmas = SPECIAL_EVENT_DATA[SpecialEventType.CHRISTMAS];

    expect(christmas.name).toContain('크리스마스');
    expect(christmas.emoji).toBe('🎄');
    expect(christmas.defaultStartDate.month).toBe(12);
    expect(christmas.defaultDurationDays).toBe(10);
  });

  test('신년 이벤트 데이터', () => {
    const newYear = SPECIAL_EVENT_DATA[SpecialEventType.NEW_YEAR];

    expect(newYear.name).toContain('신년');
    expect(newYear.emoji).toBe('🎆');
    expect(newYear.defaultStartDate.month).toBe(1);
    expect(newYear.defaultDurationDays).toBe(3);
  });

  test('발렌타인 이벤트 데이터', () => {
    const valentine = SPECIAL_EVENT_DATA[SpecialEventType.VALENTINE];

    expect(valentine.name).toContain('발렌타인');
    expect(valentine.emoji).toBe('💖');
    expect(valentine.defaultStartDate.month).toBe(2);
    expect(valentine.defaultDurationDays).toBe(5);
  });

  test('앱 기념일 이벤트 데이터', () => {
    const anniversary = SPECIAL_EVENT_DATA[SpecialEventType.ANNIVERSARY];

    expect(anniversary.name).toContain('기념일');
    expect(anniversary.emoji).toBe('🎉');
    expect(anniversary.defaultStartDate.month).toBe(2);
    expect(anniversary.defaultDurationDays).toBe(7);
  });

  test('특별 이벤트 생성 (할로윈)', () => {
    const halloweenEvent = testSpecialEvent.createSpecialEvent(SpecialEventType.HALLOWEEN, 2026);

    expect(halloweenEvent).toBeDefined();
    expect(halloweenEvent.type).toBe('special');
    expect(halloweenEvent.eventType).toBe(SpecialEventType.HALLOWEEN);
    expect(halloweenEvent.name).toContain('할로완');
    expect(halloweenEvent.emoji).toBe('🎃');
    expect(halloweenEvent).toHaveProperty('startDate');
    expect(halloweenEvent).toHaveProperty('endDate');
    expect(halloweenEvent).toHaveProperty('rewards');
    expect(halloweenEvent).toHaveProperty('specialItems');
    expect(halloweenEvent).toHaveProperty('specialActivities');
  });

  test('특별 이벤트 생성 (크리스마스)', () => {
    const christmasEvent = testSpecialEvent.createSpecialEvent(SpecialEventType.CHRISTMAS, 2026);

    expect(christmasEvent).toBeDefined();
    expect(christmasEvent.eventType).toBe(SpecialEventType.CHRISTMAS);
    expect(christmasEvent.name).toContain('크리스마스');
    expect(christmasEvent.emoji).toBe('🎄');
  });

  test('존재하지 않는 이벤트 타입 생성 실패', () => {
    const result = testSpecialEvent.createSpecialEvent('nonexistent_type', 2026);
    expect(result).toBeNull();
  });

  test('특별 이벤트 활성화', () => {
    const event = testSpecialEvent.createSpecialEvent(SpecialEventType.HALLOWEEN, 2026);
    const result = testSpecialEvent.activateSpecialEvent(event.id);

    expect(result).toBe(true);
    expect(event.isActive).toBe(true);
  });

  test('존재하지 않는 이벤트 활성화 실패', () => {
    const result = testSpecialEvent.activateSpecialEvent('nonexistent');
    expect(result).toBe(false);
  });

  test('특별 이벤트 비활성화', () => {
    const event = testSpecialEvent.createSpecialEvent(SpecialEventType.CHRISTMAS, 2026);
    testSpecialEvent.activateSpecialEvent(event.id);
    const result = testSpecialEvent.deactivateSpecialEvent(event.id);

    expect(result).toBe(true);
    expect(event.isActive).toBe(false);
    expect(event).toHaveProperty('endedAt');
  });

  test('활성 특별 이벤트 목록 조회', () => {
    const event1 = testSpecialEvent.createSpecialEvent(SpecialEventType.HALLOWEEN, 2026);
    testSpecialEvent.activateSpecialEvent(event1.id);

    const activeEvents = testSpecialEvent.getActiveSpecialEvents();
    expect(activeEvents.length).toBeGreaterThan(0);
  });

  test('이벤트 ID로 특별 이벤트 조회', () => {
    const event = testSpecialEvent.createSpecialEvent(SpecialEventType.NEW_YEAR, 2026);
    const foundEvent = testSpecialEvent.getSpecialEventById(event.id);

    expect(foundEvent).toBeDefined();
    expect(foundEvent.id).toBe(event.id);
    expect(foundEvent.name).toBe(event.name);
  });

  test('이벤트 유형별 특별 이벤트 목록 조회', () => {
    testSpecialEvent.createSpecialEvent(SpecialEventType.HALLOWEEN, 2026);
    testSpecialEvent.createSpecialEvent(SpecialEventType.CHRISTMAS, 2026);

    const christmasEvents = testSpecialEvent.getSpecialEventsByType(SpecialEventType.CHRISTMAS);
    expect(christmasEvents.length).toBeGreaterThan(0);

    christmasEvents.forEach(event => {
      expect(event.eventType).toBe(SpecialEventType.CHRISTMAS);
    });
  });

  test('특별 이벤트 참가', () => {
    const event = testSpecialEvent.createSpecialEvent(SpecialEventType.VALENTINE, 2026);
    testSpecialEvent.activateSpecialEvent(event.id);

    const result = testSpecialEvent.joinSpecialEvent(event.id, 'char_001');
    expect(result).toBe(true);

    const hasJoined = event.participants.has('char_001');
    expect(hasJoined).toBe(true);
  });

  test('활성화되지 않은 이벤트 참가 실패', () => {
    const event = testSpecialEvent.createSpecialEvent(SpecialEventType.ANNIVERSARY, 2026);

    const result = testSpecialEvent.joinSpecialEvent(event.id, 'char_001');
    expect(result).toBe(false);
  });

  test('특별 아이템 획득', () => {
    const event = testSpecialEvent.createSpecialEvent(SpecialEventType.HALLOWEEN, 2026);
    testSpecialEvent.activateSpecialEvent(event.id);
    testSpecialEvent.joinSpecialEvent(event.id, 'char_001');

    const item = testSpecialEvent.getSpecialItem(event.id, 'char_001');
    expect(item).toBeDefined();
    expect(event.specialItems).toContain(item);
  });

  test('참가하지 않은 특별 이벤트 아이템 획득 실패', () => {
    const event = testSpecialEvent.createSpecialEvent(SpecialEventType.HALLOWEEN, 2026);
    testSpecialEvent.activateSpecialEvent(event.id);

    const item = testSpecialEvent.getSpecialItem(event.id, 'char_001');
    expect(item).toBeNull();
  });

  test('특별 활동 완료', () => {
    const event = testSpecialEvent.createSpecialEvent(SpecialEventType.CHRISTMAS, 2026);
    testSpecialEvent.activateSpecialEvent(event.id);
    testSpecialEvent.joinSpecialEvent(event.id, 'char_001');

    const activity = '선물 상자 열기';
    const result = testSpecialEvent.completeSpecialActivity(event.id, 'char_001', activity);
    expect(result).toBe(true);
  });

  test('잘못된 특별 활동 완료 실패', () => {
    const event = testSpecialEvent.createSpecialEvent(SpecialEventType.NEW_YEAR, 2026);
    testSpecialEvent.activateSpecialEvent(event.id);
    testSpecialEvent.joinSpecialEvent(event.id, 'char_001');

    const result = testSpecialEvent.completeSpecialActivity(event.id, 'char_001', '존재하지 않는 활동');
    expect(result).toBe(false);
  });

  test('모든 특별 이벤트 종료', () => {
    const event1 = testSpecialEvent.createSpecialEvent(SpecialEventType.HALLOWEEN, 2026);
    const event2 = testSpecialEvent.createSpecialEvent(SpecialEventType.CHRISTMAS, 2026);

    testSpecialEvent.activateSpecialEvent(event1.id);
    testSpecialEvent.activateSpecialEvent(event2.id);

    testSpecialEvent.deactivateAllSpecialEvents();

    expect(event1.isActive).toBe(false);
    expect(event2.isActive).toBe(false);
  });

  test('특별 이벤트 기록 조회', () => {
    const event = testSpecialEvent.createSpecialEvent(SpecialEventType.VALENTINE, 2026);
    testSpecialEvent.activateSpecialEvent(event.id);
    testSpecialEvent.deactivateSpecialEvent(event.id);

    const history = testSpecialEvent.getSpecialEventHistory();
    expect(history.length).toBeGreaterThan(0);
    expect(history[0].id).toBe(event.id);
  });

  test('모든 특별 이벤트 유형 조회', () => {
    const allTypes = testSpecialEvent.getAllSpecialEventTypes();

    expect(allTypes).toBeDefined();
    expect(allTypes).toHaveProperty(SpecialEventType.HALLOWEEN);
    expect(allTypes).toHaveProperty(SpecialEventType.CHRISTMAS);
    expect(allTypes).toHaveProperty(SpecialEventType.NEW_YEAR);
  });

  test('싱글톤 인스턴스', () => {
    expect(specialEvent).toBeDefined();
    expect(specialEvent instanceof SpecialEvent).toBe(true);

    // 두 번째 인스턴스 생성 해도 동일한 인스턴스인지 확인
    const { specialEvent: specialEvent2 } = require('../special-event');
    expect(specialEvent).toBe(specialEvent2);
  });

  test('특별 이벤트 유형 열거형 값', () => {
    expect(SpecialEventType.HALLOWEEN).toBe('halloween');
    expect(SpecialEventType.CHRISTMAS).toBe('christmas');
    expect(SpecialEventType.NEW_YEAR).toBe('new_year');
    expect(SpecialEventType.VALENTINE).toBe('valentine');
    expect(SpecialEventType.ANNIVERSARY).toBe('anniversary');
    expect(SpecialEventType.CUSTOM).toBe('custom');
  });
});