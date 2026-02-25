/**
 * EventManager Test
 * Phase 7: 이벤트 시스템
 */

import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import { EventManager, eventManager } from '../event-manager.js';

describe('EventManager', () => {
  let testManager;

  beforeEach(() => {
    testManager = new EventManager();
  });

  afterEach(() => {
    testManager.resetAllEvents();
  });

  test('EventManager 인스턴스 생성', () => {
    expect(testManager).toBeDefined();
    expect(testManager instanceof EventManager).toBe(true);
  });

  test('이벤트 등록 (시즌 이벤트)', () => {
    const eventData = {
      id: 'seasonal_test_1',
      type: 'seasonal',
      name: '시험 시즌 이벤트',
      description: '테스트용 시즌 이벤트',
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      rewards: [{ type: 'experience', amount: 100 }]
    };

    const result = testManager.registerEvent(eventData);
    expect(result).toBe(true);
  });

  test('이벤트 등록 (특별 이벤트)', () => {
    const eventData = {
      id: 'special_test_1',
      type: 'special',
      name: '시험 특별 이벤트',
      description: '테스트용 특별 이벤트',
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      rewards: [{ type: 'coin', amount: 50 }]
    };

    const result = testManager.registerEvent(eventData);
    expect(result).toBe(true);
  });

  test('잘못된 이벤트 등록 실패', () => {
    const result = testManager.registerEvent({
      name: '없는 ID 이벤트'
    });

    expect(result).toBe(false);
  });

  test('이벤트 활성화', () => {
    testManager.registerEvent({
      id: 'activate_test',
      type: 'seasonal',
      name: '활성화 테스트',
      description: '활성화 테스트 이벤트',
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    });

    const result = testManager.activateEvent('activate_test');
    expect(result).toBe(true);
  });

  test('존재하지 않는 이벤트 활성화 실패', () => {
    const result = testManager.activateEvent('nonexistent');
    expect(result).toBe(false);
  });

  test('이벤트 비활성화', () => {
    testManager.registerEvent({
      id: 'deactivate_test',
      type: 'seasonal',
      name: '비활성화 테스트',
      description: '비활성화 테스트 이벤트',
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    });

    testManager.activateEvent('deactivate_test');
    const deactivateResult = testManager.deactivateEvent('deactivate_test');

    expect(deactivateResult).toBe(true);

    const event = testManager.getEventById('deactivate_test');
    expect(event.isActive).toBe(false);
  });

  test('이벤트 참가', () => {
    testManager.registerEvent({
      id: 'join_test',
      type: 'seasonal',
      name: '참가 테스트',
      description: '참가 테스트 이벤트',
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    });

    testManager.activateEvent('join_test');
    const result = testManager.joinEvent('join_test', 'char_001');

    expect(result).toBe(true);
  });

  test('이벤트 참가 여부 확인', () => {
    testManager.registerEvent({
      id: 'check_join_test',
      type: 'seasonal',
      name: '참가 확인 테스트',
      description: '참가 확인 테스트 이벤트',
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    });

    testManager.activateEvent('check_join_test');
    testManager.joinEvent('check_join_test', 'char_001');

    const hasJoined = testManager.hasJoinedEvent('check_join_test', 'char_001');
    expect(hasJoined).toBe(true);
  });

  test('이벤트 ID로 조회', () => {
    testManager.registerEvent({
      id: 'find_test',
      type: 'seasonal',
      name: '조회 테스트',
      description: '조회 테스트 이벤트',
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    });

    const event = testManager.getEventById('find_test');
    expect(event).toBeDefined();
    expect(event.name).toBe('조회 테스트');
  });

  test('이벤트 기록 조회', () => {
    testManager.registerEvent({
      id: 'history_test',
      type: 'seasonal',
      name: '기록 테스트',
      description: '기록 테스트 이벤트',
      startDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      endDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
    });

    testManager.activateEvent('history_test');
    testManager.deactivateEvent('history_test');

    const history = testManager.getEventHistory();
    expect(history.length).toBeGreaterThan(0);
  });

  test('모든 이벤트 통계', () => {
    testManager.registerEvent({
      id: 'stats_test_1',
      type: 'seasonal',
      name: '통계 테스트 1',
      description: '통계 테스트',
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    });

    testManager.registerEvent({
      id: 'stats_test_2',
      type: 'special',
      name: '통계 테스트 2',
      description: '통계 테스트',
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    });

    const stats = testManager.getEventStats();
    expect(stats).toBeDefined();
    expect(stats.totalSeasonalEvents).toBeGreaterThanOrEqual(0);
    expect(stats.totalSpecialEvents).toBeGreaterThanOrEqual(0);
  });

  test('모든 이벤트 초기화', () => {
    testManager.registerEvent({
      id: 'reset_test',
      type: 'seasonal',
      name: '리셋 테스트',
      description: '리셋 테스트 이벤트',
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    });

    testManager.resetAllEvents();

    const stats = testManager.getEventStats();
    expect(stats.totalSeasonalEvents).toBe(0);
    expect(stats.totalSpecialEvents).toBe(0);
    expect(stats.totalActiveEvents).toBe(0);
  });

  test('싱글톤 인스턴스', () => {
    expect(eventManager).toBeDefined();
    expect(eventManager instanceof EventManager).toBe(true);
  });
});