/**
 * event-system/index.js
 *
 * 이벤트 시스템 통합 모듈
 * SeasonalEvent, SpecialEvent, DailyQuest, WeeklyQuest, EventReward 통합
 */

const { EventManager, eventManager } = require('./event-manager');
const { SeasonalEvent, seasonalEvent, Season, SEASON_DATA } = require('./seasonal-event');
const { SpecialEvent, specialEvent, SpecialEventType, SPECIAL_EVENT_DATA } = require('./special-event');
const { DailyQuest, dailyQuest, DailyQuestCategory, DAILY_QUEST_TEMPLATES } = require('./daily-quest');
const { WeeklyQuest, weeklyQuest, WeeklyQuestCategory, WEEKLY_QUEST_TEMPLATES } = require('./weekly-quest');
const { EventReward, eventReward, RewardType, RewardTier } = require('./event-reward');

/**
 * EventSystem 클래스
 * 모든 이벤트 관련 시스템을 통합
 */
class EventSystem {
  constructor() {
    this.eventManager = eventManager;
    this.seasonalEvent = seasonalEvent;
    this.specialEvent = specialEvent;
    this.dailyQuest = dailyQuest;
    this.weeklyQuest = weeklyQuest;
    this.eventReward = eventReward;
    this.initialized = false;
  }

  /**
   * 이벤트 시스템 초기화
   * @param {Object} options - 초기화 옵션
   * @returns {boolean} 초기화 성공 여부
   */
  initialize(options = {}) {
    if (this.initialized) {
      console.warn('EventSystem: Already initialized');
      return true;
    }

    const { autoCreateSeasonalEvents = true, autoCreateSpecialEvents = false } = options;

    // 시즌 이벤트 생성
    if (autoCreateSeasonalEvents) {
      const currentSeason = this.seasonalEvent.getCurrentSeason();
      const seasonalEvents = this.seasonalEvent.createSeasonalEvents();

      seasonalEvents.forEach(event => {
        this.eventManager.registerEvent(event);
        this.eventManager.activateEvent(event.id);
      });

      console.log(`EventSystem: Initialized with ${currentSeason} season`);
    }

    // 특별 이벤트 생성 (선택)
    if (autoCreateSpecialEvents) {
      // 오늘 날짜에 해당하는 특별 이벤트 생성
      this.createActiveSpecialEvents();
    }

    this.initialized = true;
    console.log('EventSystem: System initialized successfully');
    return true;
  }

  /**
   * 현재 활성화된 특별 이벤트 생성
   */
  createActiveSpecialEvents() {
    const now = new Date();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    const year = now.getFullYear();

    // 할로윈 (10월 25일 ~ 11월 1일)
    if ((month === 10 && day >= 25) || (month === 11 && day <= 1)) {
      const halloweenEvent = this.specialEvent.createSpecialEvent('halloween', year);
      if (halloweenEvent) {
        this.eventManager.registerEvent(halloweenEvent);
        this.specialEvent.activateSpecialEvent(halloweenEvent.id);
      }
    }

    // 크리스마스 (12월 20일 ~ 12월 31일)
    if (month === 12 && day >= 20) {
      const christmasEvent = this.specialEvent.createSpecialEvent('christmas', year);
      if (christmasEvent) {
        this.eventManager.registerEvent(christmasEvent);
        this.specialEvent.activateSpecialEvent(christmasEvent.id);
      }
    }

    // 신년 (1월 1일 ~ 1월 3일)
    if (month === 1 && day <= 3) {
      const newYearEvent = this.specialEvent.createSpecialEvent('new_year', year);
      if (newYearEvent) {
        this.eventManager.registerEvent(newYearEvent);
        this.specialEvent.activateSpecialEvent(newYearEvent.id);
      }
    }

    // 발렌타인 (2월 10일 ~ 2월 15일)
    if (month === 2 && day >= 10 && day <= 15) {
      const valentineEvent = this.specialEvent.createSpecialEvent('valentine', year);
      if (valentineEvent) {
        this.eventManager.registerEvent(valentineEvent);
        this.specialEvent.activateSpecialEvent(valentineEvent.id);
      }
    }
  }

  /**
   * 캐릭터용 일일 퀘스트 생성
   * @param {string} characterId - 캐릭터 ID
   * @returns {Array} 일일 퀘스트 목록
   */
  createCharacterDailyQuests(characterId) {
    if (!this.dailyQuest.isTodayQuestsValid(characterId)) {
      return this.dailyQuest.createDailyQuests(characterId);
    }

    return this.dailyQuest.getCharacterDailyQuests(characterId);
  }

  /**
   * 캐릭터용 주간 퀘스트 생성
   * @param {string} characterId - 캐릭터 ID
   * @returns {Array} 주간 퀘스트 목록
   */
  createCharacterWeeklyQuests(characterId) {
    if (!this.weeklyQuest.isThisWeekQuestsValid(characterId)) {
      return this.weeklyQuest.createWeeklyQuests(characterId);
    }

    return this.weeklyQuest.getCharacterWeeklyQuests(characterId);
  }

  /**
   * 이벤트 참가
   * @param {string} characterId - 캐릭터 ID
   * @param {string} eventId - 이벤트 ID
   * @returns {boolean} 참가 성공 여부
   */
  joinEvent(characterId, eventId) {
    const event = this.eventManager.getEventById(eventId);

    if (!event) {
      return false;
    }

    // 시즌 이벤트
    if (event.type === 'seasonal') {
      return this.eventManager.joinEvent(eventId, characterId);
    }

    // 특별 이벤트
    if (event.type === 'special') {
      return this.specialEvent.joinSpecialEvent(eventId, characterId);
    }

    return false;
  }

  /**
   * 이벤트 보상 수령
   * @param {string} characterId - 캐릭터 ID
   * @param {string} eventId - 이벤트 ID
   * @returns {Object|null} 보상 데이터
   */
  claimEventReward(characterId, eventId) {
    const event = this.eventManager.getEventById(eventId);

    if (!event) {
      return null;
    }

    // 보상 획득
    const reward = this.eventManager.claimEventReward(eventId, characterId);

    if (!reward) {
      return null;
    }

    // 보상 지급
    return this.eventReward.giveReward(characterId, reward, eventId);
  }

  /**
   * 퀘스트 보상 수령
   * @param {string} characterId - 캐릭터 ID
   * @param {string} questId - 퀘스트 ID
   * @param {string} questType - 퀘스트 유형 ('daily', 'weekly')
   * @returns {Object|null} 보상 데이터
   */
  claimQuestReward(characterId, questId, questType = 'daily') {
    let reward;

    if (questType === 'daily') {
      reward = this.dailyQuest.claimQuestReward(characterId, questId);
    } else if (questType === 'weekly') {
      reward = this.weeklyQuest.claimQuestReward(characterId, questId);
    } else {
      return null;
    }

    if (!reward) {
      return null;
    }

    // 보상 지급
    return this.eventReward.giveReward(characterId, reward, questType);
  }

  /**
   * 활성 이벤트 목록 조회
   * @returns {Array} 활성 이벤트 목록
   */
  getActiveEvents() {
    const seasonalEvents = this.eventManager.getActiveEvents();
    const specialEvents = this.specialEvent.getActiveSpecialEvents();

    return [...seasonalEvents, ...specialEvents];
  }

  /**
   * 캐릭터의 퀘스트 조회
   * @param {string} characterId - 캐릭터 ID
   * @returns {Object} 일일/주간 퀘스트
   */
  getCharacterQuests(characterId) {
    return {
      daily: this.dailyQuest.getCharacterDailyQuests(characterId),
      weekly: this.weeklyQuest.getCharacterWeeklyQuests(characterId)
    };
  }

  /**
   * 시스템 통계
   * @returns {Object} 통계 데이터
   */
  getSystemStats() {
    const activeEvents = this.getActiveEvents();

    return {
      initialized: this.initialized,
      currentSeason: this.seasonalEvent.getCurrentSeason(),
      activeEventsCount: activeEvents.length,
      activeEvents: activeEvents.map(e => ({
        id: e.id,
        name: e.name,
        type: e.type,
        participants: e.participants.size
      })),
      eventStats: this.eventManager.getEventStats(),
      rewardStats: this.eventReward.getRewardStats(),
      specialEventType: Object.keys(SpecialEventType).length,
      seasonalEventType: Object.keys(Season).length
    };
  }

  /**
   * 시스템 상태 리셋
   */
  reset() {
    this.eventManager.resetAllEvents();
    this.dailyQuest.resetDailyQuests();
    this.weeklyQuest.resetWeeklyQuests();
    this.eventReward.resetAllRewards();
    this.initialized = false;
    console.log('EventSystem: System reset');
  }
}

// 싱글톤 인스턴스
const eventSystem = new EventSystem();

module.exports = {
  EventSystem,
  eventSystem,

  // 개별 모듈 내보내기
  EventManager,
  eventManager,
  SeasonalEvent,
  seasonalEvent,
  SpecialEvent,
  specialEvent,
  DailyQuest,
  dailyQuest,
  WeeklyQuest,
  weeklyQuest,
  EventReward,
  eventReward,

  // 열거형 및 데이터
  Season,
  SEASON_DATA,
  SpecialEventType,
  SPECIAL_EVENT_DATA,
  DailyQuestCategory,
  DAILY_QUEST_TEMPLATES,
  WeeklyQuestCategory,
  WEEKLY_QUEST_TEMPLATES,
  RewardType,
  RewardTier,
  REWARD_TIER_PROBABILITIES
};