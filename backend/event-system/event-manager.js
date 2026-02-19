/**
 * EventManager - 이벤트 관리 시스템
 *
 * 시즌, 특별 이벤트, 일일/주간 퀘스트를 관리하는 중앙 시스템
 */

class EventManager {
  constructor() {
    this.activeEvents = new Map(); // 활성 이벤트
    this.eventHistory = []; // 이벤트 기록
    this.seasonalEvents = new Map(); // 시즌 이벤트
    this.specialEvents = new Map(); // 특별 이벤트
  }

  /**
   * 이벤트 등록
   * @param {Object} eventData - 이벤트 데이터
   * @returns {boolean} 등록 성공 여부
   */
  registerEvent(eventData) {
    const { id, type, name, description, startDate, endDate, rewards } = eventData;

    if (!id || !type || !name) {
      console.error(`EventManager: Invalid event data - ID, type, and name are required`);
      return false;
    }

    const event = {
      id,
      type, // 'seasonal', 'special', 'daily', 'weekly'
      name,
      description,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      rewards: rewards || [],
      isActive: false,
      participants: new Set(),
      createdAt: new Date()
    };

    if (type === 'seasonal') {
      this.seasonalEvents.set(id, event);
    } else if (type === 'special') {
      this.specialEvents.set(id, event);
    } else {
      this.activeEvents.set(id, event);
    }

    console.log(`EventManager: Event registered - ${name} (${id})`);
    return true;
  }

  /**
   * 이벤트 활성화
   * @param {string} eventId - 이벤트 ID
   * @returns {boolean} 활성화 성공 여부
   */
  activateEvent(eventId) {
    const event = [...this.activeEvents.values(), ...this.seasonalEvents.values(), ...this.specialEvents.values()]
      .find(e => e.id === eventId);

    if (!event) {
      console.error(`EventManager: Event not found - ${eventId}`);
      return false;
    }

    const now = new Date();
    if (now < event.startDate || now > event.endDate) {
      console.warn(`EventManager: Event not within active period - ${eventId}`);
      return false;
    }

    event.isActive = true;
    console.log(`EventManager: Event activated - ${event.name} (${eventId})`);
    return true;
  }

  /**
   * 이벤트 비활성화
   * @param {string} eventId - 이벤트 ID
   * @returns {boolean} 비활성화 성공 여부
   */
  deactivateEvent(eventId) {
    const event = [...this.activeEvents.values(), ...this.seasonalEvents.values(), ...this.specialEvents.values()]
      .find(e => e.id === eventId);

    if (!event) {
      console.error(`EventManager: Event not found - ${eventId}`);
      return false;
    }

    event.isActive = false;
    event.endedAt = new Date();
    this.eventHistory.push(event);
    console.log(`EventManager: Event deactivated - ${event.name} (${eventId})`);
    return true;
  }

  /**
   * 활성 이벤트 목록 조회
   * @returns {Array} 활성 이벤트 목록
   */
  getActiveEvents() {
    const allEvents = [
      ...this.activeEvents.values(),
      ...this.seasonalEvents.values(),
      ...this.specialEvents.values()
    ];

    return allEvents.filter(event => {
      if (!event.isActive) return false;

      const now = new Date();
      return now >= event.startDate && now <= event.endDate;
    });
  }

  /**
   * 이벤트 참가
   * @param {string} eventId - 이벤트 ID
   * @param {string} characterId - 캐릭터 ID
   * @returns {boolean} 참가 성공 여부
   */
  joinEvent(eventId, characterId) {
    const event = this.getEventById(eventId);

    if (!event) {
      console.error(`EventManager: Event not found - ${eventId}`);
      return false;
    }

    if (!event.isActive) {
      console.warn(`EventManager: Event not active - ${eventId}`);
      return false;
    }

    event.participants.add(characterId);
    console.log(`EventManager: Character ${characterId} joined event ${eventId}`);
    return true;
  }

  /**
   * 이벤트 참가 여부 확인
   * @param {string} eventId - 이벤트 ID
   * @param {string} characterId - 캐릭터 ID
   * @returns {boolean} 참가 여부
   */
  hasJoinedEvent(eventId, characterId) {
    const event = this.getEventById(eventId);
    return event ? event.participants.has(characterId) : false;
  }

  /**
   * 이벤트 보상 지급
   * @param {string} eventId - 이벤트 ID
   * @param {string} characterId - 캐릭터 ID
   * @returns {Object|null} 보상 데이터
   */
  claimEventReward(eventId, characterId) {
    const event = this.getEventById(eventId);

    if (!event || !event.isActive) {
      console.error(`EventManager: Event not found or inactive - ${eventId}`);
      return null;
    }

    if (!event.participants.has(characterId)) {
      console.warn(`EventManager: Character not participated - ${characterId}`);
      return null;
    }

    // 보상 지급 로직 (실제 구현에서는 인벤토리/보상 시스템과 연동)
    const reward = event.rewards[Math.floor(Math.random() * event.rewards.length)];

    console.log(`EventManager: Reward claimed for ${characterId} from ${eventId} -`, reward);
    return reward;
  }

  /**
   * 이벤트 ID로 조회
   * @param {string} eventId - 이벤트 ID
   * @returns {Object|null} 이벤트 데이터
   */
  getEventById(eventId) {
    const allEvents = [
      ...this.activeEvents.values(),
      ...this.seasonalEvents.values(),
      ...this.specialEvents.values()
    ];

    return allEvents.find(e => e.id === eventId) || null;
  }

  /**
   * 이벤트 기록 조회
   * @param {number} limit - 최대 기록 수
   * @returns {Array} 이벤트 기록
   */
  getEventHistory(limit = 10) {
    return this.eventHistory.slice(-limit).reverse();
  }

  /**
   * 모든 이벤트 초기화
   */
  resetAllEvents() {
    this.activeEvents.clear();
    this.seasonalEvents.clear();
    this.specialEvents.clear();
    this.eventHistory = [];
    console.log('EventManager: All events reset');
  }

  /**
   * 이벤트 통계
   * @returns {Object} 통계 데이터
   */
  getEventStats() {
    return {
      totalSeasonalEvents: this.seasonalEvents.size,
      totalSpecialEvents: this.specialEvents.size,
      totalActiveEvents: this.activeEvents.size,
      totalParticipants: [...this.activeEvents, ...this.seasonalEvents, ...this.specialEvents]
        .reduce((sum, e) => sum + e.participants.size, 0),
      historyCount: this.eventHistory.length
    };
  }
}

// 싱글톤 인스턴스
const eventManager = new EventManager();

module.exports = {
  EventManager,
  eventManager
};