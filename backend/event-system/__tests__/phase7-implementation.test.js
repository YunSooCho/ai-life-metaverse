/**
 * Phase 7 Implementation Test
 * 구현된 Phase 7 기능들이 정상 작동하는지 테스트
 */

import { describe, it, expect } from 'vitest';
import {
  getCurrentSeason,
  getCurrentYear,
  getCurrentWeekNumber,
  getTodayDateString,
  getWeekDateString,
  SEASONAL_EVENTS,
  SPECIAL_EVENTS,
  DAILY_QUEST_TEMPLATES,
  WEEKLY_QUEST_TEMPLATES
} from '../backend/event-system/event-data.js';

describe('Phase 7: Event System Implementation', () => {
  describe('Event Data', () => {
    it('should define seasonal events', () => {
      expect(SEASONAL_EVENTS).toBeDefined();
      expect(SEASONAL_EVENTS.length).toBeGreaterThan(0);
      expect(SEASONAL_EVENTS[0]).toHaveProperty('seasonId');
      expect(SEASONAL_EVENTS[0]).toHaveProperty('events');
    });

    it('should define special events', () => {
      expect(SPECIAL_EVENTS).toBeDefined();
      expect(SPECIAL_EVENTS.length).toBeGreaterThan(0);
      expect(SPECIAL_EVENTS[0]).toHaveProperty('eventId');
      expect(SPECIAL_EVENTS[0]).toHaveProperty('eventType');
    });

    it('should define daily quest templates', () => {
      expect(DAILY_QUEST_TEMPLATES).toBeDefined();
      expect(DAILY_QUEST_TEMPLATES.length).toBeGreaterThanOrEqual(3);
    });

    it('should define weekly quest templates', () => {
      expect(WEEKLY_QUEST_TEMPLATES).toBeDefined();
      expect(WEEKLY_QUEST_TEMPLATES.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('Date Utilities', () => {
    it('should get current season', () => {
      const season = getCurrentSeason();
      expect(['spring', 'summer', 'autumn', 'winter']).toContain(season);
    });

    it('should get current year', () => {
      const year = getCurrentYear();
      expect(year).toBeGreaterThanOrEqual(2026);
    });

    it('should get current week number', () => {
      const weekNumber = getCurrentWeekNumber();
      expect(weekNumber).toBeGreaterThanOrEqual(1);
      expect(weekNumber).toBeLessThanOrEqual(53);
    });

    it('should get today date string', () => {
      const dateStr = getTodayDateString();
      expect(dateStr).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('should get week date string', () => {
      const weekStr = getWeekDateString();
      expect(weekStr).toMatch(/^\d{4}-W\d{2}$/);
    });
  });

  describe('Daily Quest System', () => {
    it('should have at least 3 daily quests', () => {
      expect(DAILY_QUEST_TEMPLATES.length).toBeGreaterThanOrEqual(3);
    });

    it('should define coin collector quest', () => {
      const coinQuest = DAILY_QUEST_TEMPLATES.find(q => q.questId === 'daily-coins');
      expect(coinQuest).toBeDefined();
      expect(coinQuest.title).toBe('코인 수집가');
      expect(coinQuest.rewards).toBeDefined();
    });

    it('should define social butterfly quest', () => {
      const socialQuest = DAILY_QUEST_TEMPLATES.find(q => q.questId === 'daily-social');
      expect(socialQuest).toBeDefined();
      expect(socialQuest.title).toBe('소셜 호랑나비');
    });

    it('should define explorer quest', () => {
      const explorerQuest = DAILY_QUEST_TEMPLATES.find(q => q.questId === 'daily-explorer');
      expect(explorerQuest).toBeDefined();
      expect(explorerQuest.title).toBe('탐험가');
    });
  });

  describe('Weekly Quest System', () => {
    it('should have at least 3 weekly quests', () => {
      expect(WEEKLY_QUEST_TEMPLATES.length).toBeGreaterThanOrEqual(3);
    });

    it('should define master explorer quest', () => {
      const weeklyQuest = WEEKLY_QUEST_TEMPLATES.find(q => q.questId === 'weekly-master-explorer');
      expect(weeklyQuest).toBeDefined();
      expect(weeklyQuest.title).toBe('마스터 탐험가');
    });

    it('should define chat master quest', () => {
      const weeklyQuest = WEEKLY_QUEST_TEMPLATES.find(q => q.questId === 'weekly-chat-master');
      expect(weeklyQuest).toBeDefined();
      expect(weeklyQuest.title).toBe('대화 왕');
    });

    it('should define quest hunter quest', () => {
      const weeklyQuest = WEEKLY_QUEST_TEMPLATES.find(q => q.questId === 'weekly-quest-hunter');
      expect(weeklyQuest).toBeDefined();
      expect(weeklyQuest.title).toBe('퀘스트 헌터');
    });
  });

  describe('Seasonal Event System', () => {
    it('should define spring event', () => {
      const springEvent = SEASONAL_EVENTS.find(e => e.seasonType === 'spring');
      expect(springEvent).toBeDefined();
      expect(springEvent.seasonId).toContain('spring');
      expect(springEvent.events).toBeDefined();
      expect(springEvent.events.length).toBeGreaterThan(0);
    });

    it('should define summer event', () => {
      const summerEvent = SEASONAL_EVENTS.find(e => e.seasonType === 'summer');
      expect(summerEvent).toBeDefined();
      expect(summerEvent.seasonId).toContain('summer');
    });

    it('should define autumn event', () => {
      const autumnEvent = SEASONAL_EVENTS.find(e => e.seasonType === 'autumn');
      expect(autumnEvent).toBeDefined();
      expect(autumnEvent.seasonId).toContain('autumn');
    });

    it('should define winter event', () => {
      const winterEvent = SEASONAL_EVENTS.find(e => e.seasonType === 'winter');
      expect(winterEvent).toBeDefined();
      expect(winterEvent.seasonId).toContain('winter');
    });
  });

  describe('Special Event System', () => {
    it('should define halloween event', () => {
      const halloweenEvent = SPECIAL_EVENTS.find(e => e.eventType === 'halloween');
      expect(halloweenEvent).toBeDefined();
      expect(halloweenEvent.title).toContain('할로윈');
    });

    it('should define christmas event', () => {
      const christmasEvent = SPECIAL_EVENTS.find(e => e.eventType === 'christmas');
      expect(christmasEvent).toBeDefined();
      expect(christmasEvent.title).toContain('크리스마스');
    });

    it('should define new-year event', () => {
      const newYearEvent = SPECIAL_EVENTS.find(e => e.eventType === 'new-year');
      expect(newYearEvent).toBeDefined();
      expect(newYearEvent.title).toContain('신년');
    });
  });
});