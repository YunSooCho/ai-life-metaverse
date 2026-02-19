/**
 * SeasonalEvent - 시즌 이벤트 시스템
 *
 * 봄/여름/가을/겨울 시즌 이벤트 관리
 */

const { month } = require('./event-utils');

/**
 * 시즌 열거형
 */
const Season = {
  SPRING: 'spring',
  SUMMER: 'summer',
  AUTUMN: 'autumn',
  WINTER: 'winter'
};

/**
 * 시즌별 데이터
 */
const SEASON_DATA = {
  [Season.SPRING]: {
    name: '봄',
    description: '꽃이 피는 계절',
    months: [3, 4, 5], // 3월, 4월, 5월
    colors: ['#FFB7B2', '#FFDAC1', '#E2F0CB', '#B5EAD7'],
    items: ['꽃가루', '벚꽃', '봄바람'],
    rewards: ['스프링 코스튬', '꽃다발', '봄철 보너스 경험치']
  },
  [Season.SUMMER]: {
    name: '여름',
    description: '시원한 바람이 불어오는 계절',
    months: [6, 7, 8], // 6월, 7월, 8월
    colors: ['#87CEEB', '#FF6B6B', '#FFE66D', '#4ECDC4'],
    items: ['해변타월', '선글라스', '수영복'],
    rewards: ['서머 코스튬', '해변 티켓', '여름철 보너스 경험치']
  },
  [Season.AUTUMN]: {
    name: '가을',
    description: '단풍이 물드는 계절',
    months: [9, 10, 11], // 9월, 10월, 11월
    colors: ['#FFB347', '#FF6F61', '#D2691E', '#8B4513'],
    items: ['단풍잎', '호박', '가을바람'],
    rewards:['가을 코스튬', '단풍 장식', '가을철 보너스 경험치']
  },
  [Season.WINTER]: {
    name: '겨울',
    description: '눈이 내리는 계절',
    months: [12, 1, 2], // 12월, 1월, 2월
    colors: ['#E0E0E0', '#B0C4DE', '#87CEFA', '#F0F8FF'],
    items: ['눈사람', '스키', '핫초코'],
    rewards: ['윈터 코스튬', '눈꽃 장식', '겨울철 보너스 경험치']
  }
};

/**
 * SeasonalEvent 클래스
 */
class SeasonalEvent {
  constructor() {
    this.currentSeason = null;
    this.currentSeasonEvents = new Map();
  }

  /**
   * 현재 시즌 계산
   * @returns {string} 현재 시즌
   */
  getCurrentSeason() {
    const currentMonth = new Date().getMonth() + 1; // 1-12

    for (const [season, data] of Object.entries(SEASON_DATA)) {
      if (data.months.includes(currentMonth)) {
        this.currentSeason = season;
        return season;
      }
    }

    return Season.SPRING; // 기본값
  }

  /**
   * 현재 시즌 정보 가져오기
   * @returns {Object} 시즌 데이터
   */
  getCurrentSeasonInfo() {
    const season = this.getCurrentSeason();
    return {
      season: this.currentSeason,
      ...SEASON_DATA[this.currentSeason]
    };
  }

  /**
   * 시즌별 이벤트 생성
   * @returns {Array} 이벤트 목록
   */
  createSeasonalEvents() {
    const currentInfo = this.getCurrentSeasonInfo();
    const year = new Date().getFullYear();

    const events = [];

    // 각 시즌에 맞는 월 계산
    const startMonth = SEASON_DATA[this.currentSeason].months[0];
    const endMonth = SEASON_DATA[this.currentSeason].months[2];

    const startDate = new Date(year, startMonth - 1, 1);
    const endDate = new Date(year, endMonth, 31);

    // 시즌 이벤트 생성
    const seasonalEvent = {
      id: `seasonal_${this.currentSeason}_${year}`,
      type: 'seasonal',
      name: `${currentInfo.name} 시즌 이벤트 ${year}`,
      description: `${currentInfo.description}. ${currentInfo.name}만의 특별 보상과 퀘스트를 즐겨보세요!`,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      rewards: currentInfo.rewards.map(reward => ({
        type: 'item',
        name: reward,
        amount: 1
      })),
      colors: currentInfo.colors,
      specialItems: currentInfo.items
    };

    events.push(seasonalEvent);
    this.currentSeasonEvents.set(seasonalEvent.id, seasonalEvent);

    console.log(`SeasonalEvent: Created ${currentInfo.name} seasonal event for ${year}`);
    return events;
  }

  /**
   * 시즌 전환 이벤트
   * @param {string} oldSeason - 이전 시즌
   * @param {string} newSeason - 새 시즌
   * @returns {Object} 전환 이벤트
   */
  createSeasonTransitionEvent(oldSeason, newSeason) {
    const oldSeasonName = SEASON_DATA[oldSeason].name;
    const newSeasonName = SEASON_DATA[newSeason].name;
    const year = new Date().getFullYear();

    return {
      id: `season_transition_${oldSeason}_to_${newSeason}_${year}`,
      type: 'seasonal',
      name: `시즌 전환: ${oldSeasonName} → ${newSeasonName}`,
      description: `${oldSeasonName}이 끝나고 ${newSeasonName}이 시작되었습니다!`,
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7일
      rewards: [
        { type: 'experience', amount: 500 },
        { type: 'item', name: `${newSeasonName} 환영 선물`, amount: 1 }
      ],
      isTransition: true
    };
  }

  /**
   * 시즌별 특별 보상
   * @param {string} season - 시즌
   * @returns {Array} 보상 목록
   */
  getSeasonalRewards(season) {
    const seasonData = SEASON_DATA[season];
    if (!seasonData) return [];

    return seasonData.rewards.map(reward => ({
      type: 'item',
      name: reward,
      amount: 1
    }));
  }

  /**
   * 시즌별 색상 팔레트
   * @param {string} season - 시즌
   * @returns {Array} 색상 목록
   */
  getSeasonalColors(season) {
    const seasonData = SEASON_DATA[season];
    return seasonData ? seasonData.colors : ['#FFFFFF'];
  }

  /**
   * 시즌별 특별 아이템
   * @param {string} season - 시즌
   * @returns {Array} 아이템 목록
   */
  getSeasonalItems(season) {
    const seasonData = SEASON_DATA[season];
    return seasonData ? seasonData.items : [];
  }

  /**
   * 모든 시즌 정보
   * @returns {Object} 모든 시즌 데이터
   */
  getAllSeasons() {
    return SEASON_DATA;
  }

  /**
   * 기간이 유효한 시즌인지 확인
   * @param {Date} date - 확인할 날짜
   * @returns {string} 시즌
   */
  getSeasonByDate(date) {
    const month = date.getMonth() + 1; // 1-12

    for (const [season, data] of Object.entries(SEASON_DATA)) {
      if (data.months.includes(month)) {
        return season;
      }
    }

    return Season.SPRING;
  }

  /**
   * 시즌별 테마 스타일
   * @param {string} season - 시즌
   * @returns {Object} 테마 스타일
   */
  getSeasonalTheme(season) {
    const data = SEASON_DATA[season];

    return {
      colors: data.colors,
      accentColor: data.colors[0],
      secondaryColor: data.colors[1],
      textColor: '#333333',
      backgroundColor: data.colors[2]
    };
  }
}

// 싱글톤 인스턴스
const seasonalEvent = new SeasonalEvent();

module.exports = {
  SeasonalEvent,
  seasonalEvent,
  Season,
  SEASON_DATA
};