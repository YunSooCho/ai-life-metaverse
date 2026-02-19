/**
 * Event Data - 기본 이벤트 정의
 * Phase 7: 이벤트 시스템
 */

// 시즌 이벤트 기본 데이터
export const SEASONAL_EVENTS = [
  {
    seasonId: 'spring-2026',
    seasonType: 'spring',
    year: 2026,
    startDate: '2026-03-01T00:00:00Z',
    endDate: '2026-05-31T23:59:59Z',
    isActive: true,
    events: [
      {
        eventId: 'cherry-blossom-2026',
        title: '벚꽃 축제',
        description: '전국의 벚꽃이 만개합니다!',
        startDate: '2026-04-01T00:00:00Z',
        endDate: '2026-04-30T23:59:59Z',
        imageUrl: '/events/cherry-blossom.jpg',
        rewards: {
          experience: 200,
          coins: 100,
          items: [
            { id: 'cherry-pet', quantity: 1, name: '벚꽃 펫', description: '귀여운 벚꽃 펫', icon: '/items/cherry-pet.png', rarity: 'legendary' }
          ]
        },
        tasks: [
          {
            id: 'visit-park-5-times',
            description: '공원 5번 방문',
            type: 'visit_building',
            targetId: 'park',
            requiredCount: 5
          },
          {
            id: 'chat-with-ai-10-times',
            description: 'AI와 10번 대화',
            type: 'chat',
            requiredCount: 10
          }
        ]
      }
    ]
  },
  {
    seasonId: 'summer-2026',
    seasonType: 'summer',
    year: 2026,
    startDate: '2026-06-01T00:00:00Z',
    endDate: '2026-08-31T23:59:59Z',
    isActive: false,
    events: [
      {
        eventId: 'summer-fest-2026',
        title: '여름 축제',
        description: '시원한 여름 축제!',
        startDate: '2026-07-01T00:00:00Z',
        endDate: '2026-08-31T23:59:59Z',
        imageUrl: '/events/summer-fest.jpg',
        rewards: {
          experience: 250,
          coins: 150,
          items: [
            { id: 'water-gun', quantity: 1, name: '물총', description: '시원한 물총', icon: '/items/water-gun.png', rarity: 'rare' }
          ]
        },
        tasks: [
          {
            id: 'visit-beach-3-times',
            description: '해변 3번 방문',
            type: 'visit_building',
            targetId: 'beach',
            requiredCount: 3
          }
        ]
      }
    ]
  },
  {
    seasonId: 'autumn-2026',
    seasonType: 'autumn',
    year: 2026,
    startDate: '2026-09-01T00:00:00Z',
    endDate: '2026-11-30T23:59:59Z',
    isActive: false,
    events: [
      {
        eventId: 'fall-fest-2026',
        title: '가을 축제',
        description: '단풍이 보는 계절!',
        startDate: '2026-10-01T00:00:00Z',
        endDate: '2026-11-30T23:59:59Z',
        imageUrl: '/events/fall-fest.jpg',
        rewards: {
          experience: 200,
          coins: 100,
          items: [
            { id: 'maple-leaf', quantity: 5, name: '단풍잎', description: '아름다운 단풍잎', icon: '/items/maple-leaf.png', rarity: 'common' }
          ]
        },
        tasks: [
          {
            id: 'visit-forest-5-times',
            description: '숲 5번 방문',
            type: 'visit_building',
            targetId: 'forest',
            requiredCount: 5
          }
        ]
      }
    ]
  },
  {
    seasonId: 'winter-2026',
    seasonType: 'winter',
    year: 2026,
    startDate: '2026-12-01T00:00:00Z',
    endDate: '2027-02-28T23:59:59Z',
    isActive: false,
    events: [
      {
        eventId: 'winter-fest-2026',
        title: '겨울 축제',
        description: '눈이 내리는 아름다운 계절!',
        startDate: '2026-12-01T00:00:00Z',
        endDate: '2027-02-28T23:59:59Z',
        imageUrl: '/events/winter-fest.jpg',
        rewards: {
          experience: 300,
          coins: 200,
          items: [
            { id: 'snowflake', quantity: 10, name: '눈송이', description: '맑은 눈송이', icon: '/items/snowflake.png', rarity: 'common' }
          ]
        },
        tasks: [
          {
            id: 'build-snowman',
            description: '눈사람 만들기',
            type: 'interact',
            targetId: 'snowman',
            requiredCount: 1
          }
        ]
      }
    ]
  }
];

// 특별 이벤트 기본 데이터
export const SPECIAL_EVENTS = [
  {
    eventId: 'halloween-2026',
    eventType: 'halloween',
    year: 2026,
    title: '할로윈 파티',
    description: '무서운 밤의 축제!',
    startDate: '2026-10-28T00:00:00Z',
    endDate: '2026-10-31T23:59:59Z',
    isActive: false,
    imageUrl: '/events/halloween.jpg',
    rewards: {
      experience: 500,
      coins: 300,
      items: [
        { id: 'pumpkin-costume', quantity: 1, name: '호박 코스튬', description: '귀여운 호박 코스튬', icon: '/items/pumpkin-costume.png', rarity: 'legendary' },
        { id: 'candy', quantity: 20, name: '사탕', description: '달콤한 사탕', icon: '/items/candy.png', rarity: 'common' }
      ]
    },
    tasks: [
      {
        id: 'collect-candies-50',
        description: '50개 사탕 수집',
        type: 'collect',
        targetId: 'candy',
        requiredCount: 50
      },
      {
        id: 'visit-haunted-house',
        description: '유령의 집 방문',
        type: 'visit_building',
        targetId: 'haunted-house',
        requiredCount: 1
      }
    ],
    specialEffects: {
      worldTheme: 'halloween',
      npcCostumes: ['ghost', 'witch', 'pumpkin'],
      backgroundMusic: '/audio/halloween-bg.mp3'
    }
  },
  {
    eventId: 'christmas-2026',
    eventType: 'christmas',
    year: 2026,
    title: '크리스마스',
    description: '산타와 함께하는 즐거운 크리스마스!',
    startDate: '2026-12-24T00:00:00Z',
    endDate: '2026-12-25T23:59:59Z',
    isActive: false,
    imageUrl: '/events/christmas.jpg',
    rewards: {
      experience: 600,
      coins: 400,
      items: [
        { id: 'santa-hat', quantity: 1, name: '산타 모자', description: '귀여운 산타 모자', icon: '/items/santa-hat.png', rarity: 'legendary' },
        { id: 'present', quantity: 5, name: '선물', description: '특별한 선물', icon: '/items/present.png', rarity: 'rare' }
      ]
    },
    tasks: [
      {
        id: 'spread-cheer-10-chats',
        description: '10번 채팅으로 기쁨 전하기',
        type: 'chat',
        requiredCount: 10
      },
      {
        id: 'visit-church',
        description: '교회 방문',
        type: 'visit_building',
        targetId: 'church',
        requiredCount: 1
      }
    ],
    specialEffects: {
      worldTheme: 'christmas',
      npcCostumes: ['santa', 'reindeer', 'elf'],
      backgroundMusic: '/audio/christmas-bg.mp3'
    }
  },
  {
    eventId: 'new-year-2027',
    eventType: 'new-year',
    year: 2027,
    title: '신년 축하',
    description: '새해 복 많이 받으세요!',
    startDate: '2027-01-01T00:00:00Z',
    endDate: '2027-01-01T23:59:59Z',
    isActive: false,
    imageUrl: '/events/new-year.jpg',
    rewards: {
      experience: 1000,
      coins: 500,
      items: [
        { id: 'lucky-charm', quantity: 1, name: '행운 부적', description: '올해의 행운을 가져다줄 부적', icon: '/items/lucky-charm.png', rarity: 'legendary' }
      ]
    },
    tasks: [
      {
        id: 'new-year-greeting',
        description: 'AI에게 새해 인사 하기',
        type: 'chat',
        requiredCount: 1
      }
    ],
    specialEffects: {
      worldTheme: 'new-year',
      npcCostumes: ['hanbok'],
      backgroundMusic: '/audio/new-year-bg.mp3'
    }
  }
];

// 일일 퀘스트 템플릿
export const DAILY_QUEST_TEMPLATES = [
  {
    questId: 'daily-coins',
    title: '코인 수집가',
    description: '100개 코인 수집',
    type: 'daily',
    rewards: {
      experience: 50,
      coins: 50,
      items: []
    },
    tasks: [
      {
        id: 'collect-coins-100',
        description: '100개 코인 수집',
        type: 'collect',
        targetId: 'coin',
        requiredCount: 100
      }
    ]
  },
  {
    questId: 'daily-social',
    title: '소셜 호랑나비',
    description: '5번 채팅하기',
    type: 'daily',
    rewards: {
      experience: 30,
      coins: 30,
      items: []
    },
    tasks: [
      {
        id: 'chat-5-times',
        description: '5번 채팅하기',
        type: 'chat',
        requiredCount: 5
      }
    ]
  },
  {
    questId: 'daily-explorer',
    title: '탐험가',
    description: '서로 다른 건물 3개 방문',
    type: 'daily',
    rewards: {
      experience: 40,
      coins: 40,
      items: []
    },
    tasks: [
      {
        id: 'visit-3-buildings',
        description: '3개 건물 방문',
        type: 'visit_building',
        requiredCount: 3
      }
    ]
  }
];

// 주간 퀘스트 템플릿
export const WEEKLY_QUEST_TEMPLATES = [
  {
    questId: 'weekly-master-explorer',
    title: '마스터 탐험가',
    description: '건물 10개 방문',
    type: 'weekly',
    rewards: {
      experience: 200,
      coins: 100,
      items: [
        { id: 'compass', quantity: 1, name: '나침반', description: '길을 잃지 않는 나침반', icon: '/items/compass.png', rarity: 'rare' }
      ]
    },
    tasks: [
      {
        id: 'visit-10-buildings',
        description: '10개 건물 방문',
        type: 'visit_building',
        requiredCount: 10
      }
    ]
  },
  {
    questId: 'weekly-chat-master',
    title: '대화 왕',
    description: '채팅 30회',
    type: 'weekly',
    rewards: {
      experience: 150,
      coins: 80,
      items: []
    },
    tasks: [
      {
        id: 'chat-30-times',
        description: '30번 채팅하기',
        type: 'chat',
        requiredCount: 30
      }
    ]
  },
  {
    questId: 'weekly-quest-hunter',
    title: '퀘스트 헌터',
    description: '퀘스트 5개 완료',
    type: 'weekly',
    rewards: {
      experience: 250,
      coins: 120,
      items: [
        { id: 'quest-book', quantity: 1, name: '퀘스트 북', description: '모든 퀘스트를 기록하는 북', icon: '/items/quest-book.png', rarity: 'rare' }
      ]
    },
    tasks: [
      {
        id: 'complete-5-quests',
        description: '5개 퀘스트 완료',
        type: 'complete_quest',
        requiredCount: 5
      }
    ]
  }
];

/**
 * 현재 시즌 계산 (월 기준)
 */
export function getCurrentSeason(date = new Date()) {
  const month = date.getMonth() + 1; // 1~12

  if (month >= 3 && month <= 5) {
    return 'spring';
  } else if (month >= 6 && month <= 8) {
    return 'summer';
  } else if (month >= 9 && month <= 11) {
    return 'autumn';
  } else {
    return 'winter';
  }
}

/**
 * 현재 연도 계산
 */
export function getCurrentYear(date = new Date()) {
  return date.getFullYear();
}

/**
 * 현재 주차 계산 (ISO week)
 */
export function getCurrentWeekNumber(date = new Date()) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

/**
 * 오늘 날짜 문자열 (YYYY-MM-DD)
 */
export function getTodayDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * 주차 문자열 (YYYY-WXX)
 */
export function getWeekDateString(date = new Date()) {
  const year = date.getFullYear();
  const week = getCurrentWeekNumber(date);
  return `${year}-W${String(week).padStart(2, '0')}`;
}

/**
 * 이벤트 활성 상태 확인
 */
export function isEventActive(event, now = new Date()) {
  const startDate = new Date(event.startDate);
  const endDate = new Date(event.endDate);

  if (event.isActive !== undefined) {
    return event.isActive && now >= startDate && now <= endDate;
  }
  return now >= startDate && now <= endDate;
}

/**
 * 시즌 이벤트 ID 생성
 */
export function makeSeasonId(season, year) {
  return `${season}-${year}`;
}

/**
 * 특별 이벤트 ID 생성
 */
export function makeSpecialEventId(eventType, year) {
  return `${eventType}-${year}`;
}

/**
 * 일일 퀘스트 ID 생성
 */
export function makeDailyQuestId(questId, dateStr) {
  return `${questId}-${dateStr}`;
}

/**
 * 주간 퀘스트 ID 생성
 */
export function makeWeeklyQuestId(questId, weekStr) {
  return `${questId}-${weekStr}`;
}