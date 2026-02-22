/**
 * SpecialEvent - 특별 이벤트 시스템
 *
 * 할로윈, 크리스마스, 신년 등 특별 이벤트 관리
 */

/**
 * 특별 이벤트 유형
 */
const SpecialEventType = {
  HALLOWEEN: 'halloween',
  CHRISTMAS: 'christmas',
  NEW_YEAR: 'new_year',
  VALENTINE: 'valentine',
  ANNIVERSARY: 'anniversary',
  CUSTOM: 'custom'
};

/**
 * 특별 이벤트 데이터
 */
const SPECIAL_EVENT_DATA = {
  [SpecialEventType.HALLOWEEN]: {
    name: '할로완 이벤트',
    emoji: '🎃',
    description: '스페셜 할로윈 이벤트! 호박 모양 코스튬과 사탕을 모아보세요!',
    defaultStartDate: { month: 10, day: 25 }, // 10월 25일
    defaultDurationDays: 7, // 7일
    colors: ['#FF7518', '#000000', '#7B68EE', '#FFD700'],
    items: ['호박', '사탕', '할로윈 코스튬', '마녀 모자'],
    rewards: ['할로윈 코스튬', '호박 조각', '사탕 가방'],
    specialActivities: [
      '호박 장식 찾기',
      '사탕 수집하기',
      '미스터리 상자 열기',
      '할로윈 퀴즈 도전'
    ]
  },
  [SpecialEventType.CHRISTMAS]: {
    name: '크리스마스 이벤트',
    emoji: '🎄',
    description: '메리 크리스마스! 선물과 산타 코스튬을 받아보세요!',
    defaultStartDate: { month: 12, day: 20 }, // 12월 20일
    defaultDurationDays: 10, // 10일
    colors: ['#FF0000', '#00FF00', '#FFFFFF', '#FFD700'],
    items: ['산타 모자', '선물 상자', '크리스마스 트리', '눈송이'],
    rewards: ['산타 코스튬', '크리스마스 장식', '선물 상자'],
    specialActivities: [
      '선물 상자 열기',
      '크리스마스 트리 장식하기',
      '산타에게 편지 쓰기',
      '눈싸움 하기'
    ]
  },
  [SpecialEventType.NEW_YEAR]: {
    name: '신년 이벤트',
    emoji: '🎆',
    description: '새해 복 많이 받으세요! 새해 장식과 특별 보상을 받아보세요!',
    defaultStartDate: { month: 1, day: 1 },
    defaultDurationDays: 3, // 3일
    colors: ['#FFD700', '#FF0000', '#FFFFFF', '#C0C0C0'],
    items: ['복주머니', '돼지 저금통', '새해 장식', '불꽃놀이'],
    rewards: ['신년 코스튬', '복주머니', '새해 특별 선물'],
    specialActivities: [
      '복주머니 열기',
      '새해 소원 빌기',
      '불꽃놀이 관람',
      '신년 Gacha 도전'
    ]
  },
  [SpecialEventType.VALENTINE]: {
    name: '발렌타인 이벤트',
    emoji: '💖',
    description: '사랑의 계절 발렌타인! 초콜릿과 꽃다발을 선물하세요!',
    defaultStartDate: { month: 2, day: 10 },
    defaultDurationDays: 5, // 5일
    colors: ['#FF69B4', '#FFB6C1', '#FFC0CB', '#FFFFFF'],
    items: ['초콜릿', '장미', '발렌타인 카드', '하트 캔디'],
    rewards: ['발렌타인 코스튬', '로맨틱 장식', '프리미엄 초콜릿'],
    specialActivities: [
      '초콜릿 선물하기',
      '장미 꽃다발 만들기',
      '사랑의 편지 쓰기',
      '로맨틱 스팟 방문'
    ]
  },
  [SpecialEventType.ANNIVERSARY]: {
    name: '앱 기념일 이벤트',
    emoji: '🎉',
    description: 'AI Life Metaverse 기념일! 특별 코스튬과 보상을 받아보세요!',
    defaultStartDate: { month: 2, day: 5 }, // 앱 출시일 (예시)
    defaultDurationDays: 7, // 7일
    colors: ['#FF6B6B', '#4ECDC4', '#FFD93D', '#6BCB77'],
    items: ['기념일 코스튬', '스페셜 뱃지', '리미티드 장식', '골드 코인'],
    rewards: ['기념일 코스튬', '스페셜 뱃지', '리미티드 아이템'],
    specialActivities: [
      '기념일 퀴즈 도전',
      '앱 히스토리 읽기',
      '특별 캐릭터 만나기',
      '리미티드 Gacha 도전'
    ]
  }
};

/**
 * SpecialEvent 클래스
 */
class SpecialEvent {
  constructor() {
    this.activeSpecialEvents = new Map();
    this.specialEventHistory = [];
  }

  /**
   * 특별 이벤트 생성
   * @param {string} type - 이벤트 유형
   * @param {number} year - 연도
   * @param {Object} options - 추가 옵션
   * @returns {Object} 이벤트 데이터
   */
  createSpecialEvent(type, year = new Date().getFullYear(), options = {}) {
    const eventData = SPECIAL_EVENT_DATA[type];

    if (!eventData) {
      console.error(`SpecialEvent: Unknown event type - ${type}`);
      return null;
    }

    const startDate = options.startDate
      ? new Date(options.startDate)
      : new Date(year, eventData.defaultStartDate.month - 1, eventData.defaultStartDate.day);

    const endDate = options.endDate
      ? new Date(options.endDate)
      : new Date(startDate.getTime() + eventData.defaultDurationDays * 24 * 60 * 60 * 1000);

    const specialEvent = {
      id: `special_${type}_${year}`,
      type: 'special',
      eventType: type,
      name: eventData.name,
      emoji: eventData.emoji,
      description: eventData.description,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      rewards: eventData.rewards.map(reward => ({
        type: 'item',
        name: reward,
        amount: 1
      })),
      colors: eventData.colors,
      specialItems: eventData.items,
      specialActivities: eventData.specialActivities,
      isActive: false,
      participants: new Set(),
      createdAt: new Date()
    };

    this.activeSpecialEvents.set(specialEvent.id, specialEvent);
    console.log(`SpecialEvent: Created ${eventData.name} for ${year}`);
    return specialEvent;
  }

  /**
   * 현재 활성화된 특별 이벤트 목록 조회
   * @returns {Array} 활성 이벤트 목록
   */
  getActiveSpecialEvents() {
    const now = new Date();

    return Array.from(this.activeSpecialEvents.values()).filter(event => {
      if (!event.isActive) return false;

      const start = new Date(event.startDate);
      const end = new Date(event.endDate);

      return now >= start && now <= end;
    });
  }

  /**
   * 이벤트 ID로 특별 이벤트 조회
   * @param {string} eventId - 이벤트 ID
   * @returns {Object|null} 이벤트 데이터
   */
  getSpecialEventById(eventId) {
    return this.activeSpecialEvents.get(eventId) || null;
  }

  /**
   * 이벤트 유형별 특별 이벤트 목록 조회
   * @param {string} type - 이벤트 유형
   * @returns {Array} 이벤트 목록
   */
  getSpecialEventsByType(type) {
    return Array.from(this.activeSpecialEvents.values())
      .filter(event => event.eventType === type);
  }

  /**
   * 특별 이벤트 활성화
   * @param {string} eventId - 이벤트 ID
   * @returns {boolean} 활성화 성공 여부
   */
  activateSpecialEvent(eventId) {
    const event = this.activeSpecialEvents.get(eventId);

    if (!event) {
      console.error(`SpecialEvent: Event not found - ${eventId}`);
      return false;
    }

    event.isActive = true;
    console.log(`SpecialEvent: Activated ${event.name} (${eventId})`);
    return true;
  }

  /**
   * 특별 이벤트 비활성화
   * @param {string} eventId - 이벤트 ID
   * @returns {boolean} 비활성화 성공 여부
   */
  deactivateSpecialEvent(eventId) {
    const event = this.activeSpecialEvents.get(eventId);

    if (!event) {
      console.error(`SpecialEvent: Event not found - ${eventId}`);
      return false;
    }

    event.isActive = false;
    event.endedAt = new Date();
    this.specialEventHistory.push(event);
    console.log(`SpecialEvent: Deactivated ${event.name} (${eventId})`);
    return true;
  }

  /**
   * 특별 이벤트 참가
   * @param {string} eventId - 이벤트 ID
   * @param {string} characterId - 캐릭터 ID
   * @returns {boolean} 참가 성공 여부
   */
  joinSpecialEvent(eventId, characterId) {
    const event = this.activeSpecialEvents.get(eventId);

    if (!event || !event.isActive) {
      console.warn(`SpecialEvent: Event not found or inactive - ${eventId}`);
      return false;
    }

    event.participants.add(characterId);
    console.log(`SpecialEvent: Character ${characterId} joined ${eventId}`);
    return true;
  }

  /**
   * 특별 아이템 획득
   * @param {string} eventId - 이벤트 ID
   * @param {string} characterId - 캐릭터 ID
   * @returns {string|null} 아이템 이름
   */
  getSpecialItem(eventId, characterId) {
    const event = this.activeSpecialEvents.get(eventId);

    if (!event || !event.isActive) {
      return null;
    }

    if (!event.participants.has(characterId)) {
      console.warn(`SpecialEvent: Character not participated - ${characterId}`);
      return null;
    }

    const specialItems = event.specialItems || [];
    const randomItem = specialItems[Math.floor(Math.random() * specialItems.length)];

    console.log(`SpecialEvent: Character ${characterId} got special item ${randomItem} from ${eventId}`);
    return randomItem;
  }

  /**
   * 특별 활동 완료
   * @param {string} eventId - 이벤트 ID
   * @param {string} characterId - 캐릭터 ID
   * @param {string} activity - 활동 이름
   * @returns {boolean} 완료 성공 여부
   */
  completeSpecialActivity(eventId, characterId, activity) {
    const event = this.activeSpecialEvents.get(eventId);

    if (!event || !event.isActive) {
      return false;
    }

    if (!event.participants.has(characterId)) {
      console.warn(`SpecialEvent: Character not participated - ${characterId}`);
      return false;
    }

    const validActivities = event.specialActivities || [];
    if (!validActivities.includes(activity)) {
      console.warn(`SpecialEvent: Invalid activity - ${activity}`);
      return false;
    }

    console.log(`SpecialEvent: Character ${characterId} completed activity ${activity} in ${eventId}`);
    return true;
  }

  /**
   * 모든 특별 이벤트 종료
   */
  deactivateAllSpecialEvents() {
    for (const [eventId, event] of this.activeSpecialEvents) {
      if (event.isActive) {
        this.deactivateSpecialEvent(eventId);
      }
    }
  }

  /**
   * 특별 이벤트 기록 조회
   * @param {number} limit - 최대 기록 수
   * @returns {Array} 이벤트 기록
   */
  getSpecialEventHistory(limit = 10) {
    return this.specialEventHistory.slice(-limit).reverse();
  }

  /**
   * 모든 특별 이벤트 유형
   * @returns {Object} 이벤트 유형 데이터
   */
  getAllSpecialEventTypes() {
    return SPECIAL_EVENT_DATA;
  }
}

// 싱글톤 인스턴스
const specialEvent = new SpecialEvent();

module.exports = {
  SpecialEvent,
  specialEvent,
  SpecialEventType,
  SPECIAL_EVENT_DATA
};