/**
 * Event Data Utilities Test
 * Phase 7: 이벤트 시스템
 */

import { describe, it, expect } from 'vitest';
import {
  SEASONAL_EVENTS,
  SPECIAL_EVENTS,
  DAILY_QUEST_TEMPLATES,
  WEEKLY_QUEST_TEMPLATES,
  getCurrentSeason,
  getCurrentYear,
  getCurrentWeekNumber,
  getTodayDateString,
  getWeekDateString,
  isEventActive,
  makeSeasonId,
  makeSpecialEventId,
  makeDailyQuestId,
  makeWeeklyQuestId
} from '../event-data.js';

describe('Event Data Utilities', () => {
  describe('getCurrentSeason', () => {
    it('TC01: 봄 시즌 반환 (3월)', () => {
      const date = new Date('2026-04-15');
      expect(getCurrentSeason(date)).toBe('spring');
    });

    it('TC02: 여름 시즌 반환 (7월)', () => {
      const date = new Date('2026-07-15');
      expect(getCurrentSeason(date)).toBe('summer');
    });

    it('TC03: 가을 시즌 반환 (10월)', () => {
      const date = new Date('2026-10-15');
      expect(getCurrentSeason(date)).toBe('autumn');
    });

    it('TC04: 겨울 시즌 반환 (1월)', () => {
      const date = new Date('2026-01-15');
      expect(getCurrentSeason(date)).toBe('winter');
    });
  });

  describe('getCurrentYear', () => {
    it('TC05: 올해 연도 반환', () => {
      const date = new Date('2026-05-10');
      expect(getCurrentYear(date)).toBe(2026);
    });

    it('TC06: 다른 연도 반환', () => {
      const date = new Date('2027-12-31');
      expect(getCurrentYear(date)).toBe(2027);
    });
  });

  describe('getCurrentWeekNumber', () => {
    it('TC07: 주차 계산 (1월 초)', () => {
      const date = new Date('2026-01-05');
      const week = getCurrentWeekNumber(date);
      expect(week).toBeGreaterThan(0);
      expect(week).toBeLessThanOrEqual(53);
    });

    it('TC08: 주차 계산 (7월)', () => {
      const date = new Date('2026-07-15');
      const week = getCurrentWeekNumber(date);
      expect(week).toBeGreaterThan(0);
      expect(week).toBeLessThanOrEqual(53);
    });
  });

  describe('getTodayDateString', () => {
    it('TC09: 오늘 날짜 형식 (YYYY-MM-DD)', () => {
      const result = getTodayDateString();
      const regex = /^\d{4}-\d{2}-\d{2}$/;
      expect(regex.test(result)).toBe(true);
    });

    it('TC10: 주어진 날짜 형식', () => {
      const date = new Date('2026-02-19');
      const result = getTodayDateString(date);
      expect(result).toBe('2026-02-19');
    });
  });

  describe('getWeekDateString', () => {
    it('TC11: 주차 형식 (YYYY-WXX)', () => {
      const result = getWeekDateString();
      const regex = /^\d{4}-W\d{2}$/;
      expect(regex.test(result)).toBe(true);
    });
  });

  describe('isEventActive', () => {
    it('TC12: 활성 이벤트 확인 (isActive=true)', () => {
      const event = {
        startDate: '2026-04-01T00:00:00Z',
        endDate: '2026-04-30T23:59:59Z',
        isActive: true
      };
      const now = new Date('2026-04-15');
      expect(isEventActive(event, now)).toBe(true);
    });

    it('TC13: 비활성 이벤트 확인 (isActive=false)', () => {
      const event = {
        startDate: '2026-04-01T00:00:00Z',
        endDate: '2026-04-30T23:59:59Z',
        isActive: false
      };
      const now = new Date('2026-04-15');
      expect(isEventActive(event, now)).toBe(false);
    });

    it('TC14: 기간 외 이벤트 확인 (future)', () => {
      const event = {
        startDate: '2027-04-01T00:00:00Z',
        endDate: '2027-04-30T23:59:59Z',
        isActive: true
      };
      expect(isEventActive(event)).toBe(false);
    });

    it('TC15: 기간 외 이벤트 확인 (past)', () => {
      const event = {
        startDate: '2025-04-01T00:00:00Z',
        endDate: '2025-04-30T23:59:59Z',
        isActive: true
      };
      expect(isEventActive(event)).toBe(false);
    });
  });

  describe('makeSeasonId', () => {
    it('TC16: 시즌 ID 생성', () => {
      expect(makeSeasonId('spring', 2026)).toBe('spring-2026');
      expect(makeSeasonId('winter', 2027)).toBe('winter-2027');
    });
  });

  describe('makeSpecialEventId', () => {
    it('TC17: 특별 이벤트 ID 생성', () => {
      expect(makeSpecialEventId('halloween', 2026)).toBe('halloween-2026');
      expect(makeSpecialEventId('christmas', 2026)).toBe('christmas-2026');
    });
  });

  describe('makeDailyQuestId', () => {
    it('TC18: 일일 퀘스트 ID 생성', () => {
      expect(makeDailyQuestId('daily-coins', '2026-02-19')).toBe('daily-coins-2026-02-19');
    });
  });

  describe('makeWeeklyQuestId', () => {
    it('TC19: 주간 퀘스트 ID 생성', () => {
      expect(makeWeeklyQuestId('weekly-master', '2026-W07')).toBe('weekly-master-2026-W07');
    });
  });

  describe('SEASONAL_EVENTS', () => {
    it('TC20: 시즌 이벤트 데이터 존재', () => {
      expect(SEASONAL_EVENTS).toBeDefined();
      expect(Array.isArray(SEASONAL_EVENTS)).toBe(true);
      expect(SEASONAL_EVENTS.length).toBeGreaterThan(0);
    });

    it('TC21: 시즌 이벤트 구조 확인', () => {
      const event = SEASONAL_EVENTS[0];
      expect(event).toHaveProperty('seasonId');
      expect(event).toHaveProperty('seasonType');
      expect(event).toHaveProperty('year');
      expect(event).toHaveProperty('startDate');
      expect(event).toHaveProperty('endDate');
      expect(event).toHaveProperty('events');
      expect(Array.isArray(event.events)).toBe(true);
    });
  });

  describe('SPECIAL_EVENTS', () => {
    it('TC22: 특별 이벤트 데이터 존재', () => {
      expect(SPECIAL_EVENTS).toBeDefined();
      expect(Array.isArray(SPECIAL_EVENTS)).toBe(true);
      expect(SPECIAL_EVENTS.length).toBeGreaterThan(0);
    });

    it('TC23: 특별 이벤트 구조 확인', () => {
      const event = SPECIAL_EVENTS[0];
      expect(event).toHaveProperty('eventId');
      expect(event).toHaveProperty('eventType');
      expect(event).toHaveProperty('year');
      expect(event).toHaveProperty('title');
      expect(event).toHaveProperty('startDate');
      expect(event).toHaveProperty('endDate');
      expect(event).toHaveProperty('tasks');
      expect(Array.isArray(event.tasks)).toBe(true);
    });
  });

  describe('DAILY_QUEST_TEMPLATES', () => {
    it('TC24: 일일 퀘스트 템플릿 존재', () => {
      expect(DAILY_QUEST_TEMPLATES).toBeDefined();
      expect(Array.isArray(DAILY_QUEST_TEMPLATES)).toBe(true);
      expect(DAILY_QUEST_TEMPLATES.length).toBeGreaterThan(0);
    });

    it('TC25: 일일 퀘스트 구조 확인', () => {
      const quest = DAILY_QUEST_TEMPLATES[0];
      expect(quest).toHaveProperty('questId');
      expect(quest).toHaveProperty('title');
      expect(quest).toHaveProperty('type');
      expect(quest).toHaveProperty('rewards');
      expect(quest).toHaveProperty('tasks');
      expect(Array.isArray(quest.tasks)).toBe(true);
    });
  });

  describe('WEEKLY_QUEST_TEMPLATES', () => {
    it('TC26: 주간 퀘스트 템플릿 존재', () => {
      expect(WEEKLY_QUEST_TEMPLATES).toBeDefined();
      expect(Array.isArray(WEEKLY_QUEST_TEMPLATES)).toBe(true);
      expect(WEEKLY_QUEST_TEMPLATES.length).toBeGreaterThan(0);
    });

    it('TC27: 주간 퀘스트 구조 확인', () => {
      const quest = WEEKLY_QUEST_TEMPLATES[0];
      expect(quest).toHaveProperty('questId');
      expect(quest).toHaveProperty('title');
      expect(quest).toHaveProperty('type');
      expect(quest).toHaveProperty('rewards');
      expect(quest).toHaveProperty('tasks');
      expect(Array.isArray(quest.tasks)).toBe(true);
    });
  });
});