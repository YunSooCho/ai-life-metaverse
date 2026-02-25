// EventManager - 이벤트 시스템
// Phase 7: 시즌, 특별, 일일/주간 퀘스트 지원

class EventManager {
  constructor() {
    // 이벤트 데이터 저장
    this.activeEvents = {}
    this.eventHistory = {}

    // 일일 퀘스트 (매일 자정에 갱신)
    this.dailyQuests = []
    this.lastDailyQuestUpdate = null

    // 주간 퀘스트 (매주 월요일 자정에 갱신)
    this.weeklyQuests = []
    this.lastWeeklyQuestUpdate = null

    // 시즌 정의
    this.seasons = this.defineSeasons()

    // 특별 이벤트 정의
    this.specialEvents = this.defineSpecialEvents()

    // 리워드 정의
    this.rewards = this.defineRewards()

    console.log('✨ EventManager initialized')
  }

  // ===== 시즌 정의 =====
  defineSeasons() {
    return {
      SPRING: {
        name: '봄 시즌',
        months: [3, 4, 5], // 3월, 4월, 5월
        icon: '🌸',
        description: '벚꽃이 피는 봄 시즌 이벤트',
        quests: [
          { id: 'spring-1', title: '벚꽃 사진 찍기', xp: 100, gold: 50 },
          { id: 'spring-2', title: '봄놀이 하기', xp: 150, gold: 75 },
          { id: 'spring-3', title: '꽃 키우기', xp: 200, gold: 100 }
        ],
        bonuses: {
          xpMultiplier: 1.2, // 경험치 20% 증가
          affinityMultiplier: 1.1 // 호감도 10% 증가
        }
      },
      SUMMER: {
        name: '여름 시즌',
        months: [6, 7, 8], // 6월, 7월, 8월
        icon: '☀️',
        description: '햇살 쨍쨍한 여름 시즌 이벤트',
        quests: [
          { id: 'summer-1', title: '해변 야경 감상', xp: 100, gold: 50 },
          { id: 'summer-2', title: '아이스크림 먹기', xp: 150, gold: 75 },
          { id: 'summer-3', title: '수영하기', xp: 200, gold: 100 }
        ],
        bonuses: {
          xpMultiplier: 1.3, // 경험치 30% 증가
          energyMultiplier: 1.2 // 에너지 20% 증가
        }
      },
      AUTUMN: {
        name: '가을 시즌',
        months: [9, 10, 11], // 9월, 10월, 11월
        icon: '🍂',
        description: '단풍 드는 가을 시즌 이벤트',
        quests: [
          { id: 'autumn-1', title: '단풍 감상', xp: 100, gold: 50 },
          { id: 'autumn-2', title: '가을 음식 만들기', xp: 150, gold: 75 },
          { id: 'autumn-3', title: '옷 만들기', xp: 200, gold: 100 }
        ],
        bonuses: {
          goldMultiplier: 1.2, // 골드 20% 증가
          dropRateMultiplier: 1.1 // 드롭률 10% 증가
        }
      },
      WINTER: {
        name: '겨울 시즌',
        months: [12, 1, 2], // 12월, 1월, 2월
        icon: '❄️',
        description: '눈 내리는 겨울 시즌 이벤트',
        quests: [
          { id: 'winter-1', title: '눈싸움 하기', xp: 100, gold: 50 },
          { id: 'winter-2', title: '따뜻한 음료 마시기', xp: 150, gold: 75 },
          { id: 'winter-3', title: '눈사람 만들기', xp: 200, gold: 100 }
        ],
        bonuses: {
          affinityMultiplier: 1.2, // 호감도 20% 증가
          xpMultiplier: 1.1 // 경험치 10% 증가
        }
      }
    }
  }

  // ===== 특별 이벤트 정의 =====
  defineSpecialEvents() {
    return {
      HALLOWEEN: {
        id: 'halloween',
        name: '할로윈',
        icon: '🎃',
        description: '귀신 나오는 할로윈 이벤트!',
        startDate: '10-25', // 10월 25일
        endDate: '10-31', // 10월 31일
        quests: [
          { id: 'halloween-1', title: '호박 장식하기', xp: 200, gold: 100 },
          { id: 'halloween-2', title: '귀신 놀이 하기', xp: 300, gold: 150 },
          { id: 'halloween-3', title: '사탕 모으기', xp: 400, gold: 200 }
        ],
        specialRewards: [
          { item: '할로윈 의상', rarity: 'EPIC' },
          { item: '귀신 가면', rarity: 'RARE' }
        ]
      },
      CHRISTMAS: {
        id: 'christmas',
        name: '크리스마스',
        icon: '🎄',
        description: '메리 크리스마스! 선물을 받으세요!',
        startDate: '12-24', // 12월 24일
        endDate: '12-25', // 12월 25일
        quests: [
          { id: 'christmas-1', title: '크리스마스 트리 장식', xp: 200, gold: 100 },
          { id: 'christmas-2', title: '선물 교환하기', xp: 300, gold: 150 },
          { id: 'christmas-3', title: '크리스마스 케익 만들기', xp: 400, gold: 200 }
        ],
        specialRewards: [
          { item: '산타 의상', rarity: 'EPIC' },
          { item: '루돌프 사슴', rarity: 'LEGENDARY' }
        ]
      },
      NEW_YEAR: {
        id: 'new-year',
        name: '새해',
        icon: '🎊',
        description: '새해 복 많이 받으세요!',
        startDate: '01-01', // 1월 1일
        endDate: '01-03', // 1월 3일
        quests: [
          { id: 'newyear-1', title: '새해 인사하기', xp: 200, gold: 100 },
          { id: 'newyear-2', title: '세배하기', xp: 300, gold: 150 },
          { id: 'newyear-3', title: '떡국 먹기', xp: 400, gold: 200 }
        ],
        specialRewards: [
          { item: '새해 한복', rarity: 'EPIC' },
          { item: '복주머니', rarity: 'LEGENDARY' }
        ]
      },
      VALENTINE: {
        id: 'valentine',
        name: '발렌타인',
        icon: '💕',
        description: '사랑에 빠져봐요!',
        startDate: '02-14', // 2월 14일
        endDate: '02-14', // 2월 14일 (하루만)
        quests: [
          { id: 'valentine-1', title: '초콜릿 선물하기', xp: 200, gold: 100 },
          { id: 'valentine-2', title: '러브 퀴즈 풀기', xp: 300, gold: 150 }
        ],
        specialRewards: [
          { item: '하트 보석', rarity: 'RARE' },
          { item: '러브 티켓', rarity: 'EPIC' }
        ]
      }
    }
  }

  // ===== 리워드 정의 =====
  defineRewards() {
    return {
      // 경험치 리워드
      xp: {
        EASY: 50,
        NORMAL: 100,
        HARD: 200,
        LEGENDARY: 500
      },
      // 골드 리워드
      gold: {
        EASY: 25,
        NORMAL: 50,
        HARD: 100,
        LEGENDARY: 250
      },
      // 호감도 리워드
      affinity: {
        EASY: 3,
        NORMAL: 5,
        HARD: 10,
        LEGENDARY: 20
      },
      // 아이템 리워드 rarity 확률
      itemRarityChances: {
        COMMON: 0.6,      // 60%
        RARE: 0.25,       // 25%
        EPIC: 0.13,       // 13%
        LEGENDARY: 0.02   // 2%
      }
    }
  }

  // ===== 현재 시즌 가져오기 =====
  getCurrentSeason() {
    const now = new Date()
    const month = now.getMonth() + 1 // 1-12

    for (const [key, season] of Object.entries(this.seasons)) {
      if (season.months.includes(month)) {
        return { key, ...season }
      }
    }

    // 기본값: 봄
    return { key: 'SPRING', ...this.seasons.SPRING }
  }

  // ===== 활성 특별 이벤트 확인 =====
  getActiveSpecialEvents() {
    const now = new Date()
    const currentDate = `${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}` // MM-DD

    const activeEvents = []
    for (const [key, event] of Object.entries(this.specialEvents)) {
      if (currentDate >= event.startDate && currentDate <= event.endDate) {
        activeEvents.push({ key, ...event })
      }
    }

    return activeEvents
  }

  // ===== 이벤트 보너스 적용 =====
  applyEventBonuses(baseValue, type) {
    const season = this.getCurrentSeason()
    let multiplier = 1.0

    switch (type) {
      case 'xp':
        if (season.bonuses.xpMultiplier) {
          multiplier *= season.bonuses.xpMultiplier
        }
        break
      case 'gold':
        if (season.bonuses.goldMultiplier) {
          multiplier *= season.bonuses.goldMultiplier
        }
        break
      case 'affinity':
        if (season.bonuses.affinityMultiplier) {
          multiplier *= season.bonuses.affinityMultiplier
        }
        break
      case 'energy':
        if (season.bonuses.energyMultiplier) {
          multiplier *= season.bonuses.energyMultiplier
        }
        break
      case 'drop':
        if (season.bonuses.dropRateMultiplier) {
          multiplier *= season.bonuses.dropRateMultiplier
        }
        break
    }

    return Math.floor(baseValue * multiplier)
  }

  // ===== 리워드 생성 =====
  generateReward(difficulty = 'NORMAL') {
    const xp = this.rewards.xp[difficulty] || 100
    const gold = this.rewards.gold[difficulty] || 50
    const affinity = this.rewards.affinity[difficulty] || 5

    // 시즌 보너스 적용
    const finalXP = this.applyEventBonuses(xp, 'xp')
    const finalGold = this.applyEventBonuses(gold, 'gold')
    const finalAffinity = this.applyEventBonuses(affinity, 'affinity')

    // 아이템 rarity 결정
    const roll = Math.random()
    let rarity = 'COMMON'
    let cumulativeChance = 0
    for (const [r, chance] of Object.entries(this.rewards.itemRarityChances)) {
      cumulativeChance += chance
      if (roll < cumulativeChance) {
        rarity = r
        break
      }
    }

    return {
      xp: finalXP,
      gold: finalGold,
      affinity: finalAffinity,
      item: { rarity }
    }
  }

  // ===== 일일 퀘스트 갱신 =====
  updateDailyQuests() {
    const now = new Date()
    const today = now.toDateString()

    // 이미 오늘 갱신했으면 패스
    if (this.lastDailyQuestUpdate === today) {
      return this.dailyQuests
    }

    // 랜덤 3개 일일 퀘스트 생성
    const allDailyQuests = [
      { id: 'daily-1', title: '로그인하기', xp: 50, gold: 25 },
      { id: 'daily-2', title: '채팅 5회 하기', xp: 75, gold: 40 },
      { id: 'daily-3', title: '이동 10회 하기', xp: 75, gold: 40 },
      { id: 'daily-4', title: '퀘스트 1개 완료하기', xp: 100, gold: 50 },
      { id: 'daily-5', title: '인터랙션 3회 하기', xp: 100, gold: 50 },
      { id: 'daily-6', title: '아이템 사용하기', xp: 75, gold: 40 },
      { id: 'daily-7', title: '건물 입장하기', xp: 50, gold: 25 },
      { id: 'daily-8', title: '선물 주기', xp: 100, gold: 50 }
    ]

    // 무작위 3개 선택
    const shuffled = allDailyQuests.sort(() => Math.random() - 0.5)
    this.dailyQuests = shuffled.slice(0, 3)
    this.lastDailyQuestUpdate = today

    console.log(`📅 일일 퀘스트 갱신: ${this.dailyQuests.length}개`)
    return this.dailyQuests
  }

  // ===== 주간 퀘스트 갱신 =====
  updateWeeklyQuests() {
    const now = new Date()
    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - now.getDay() + 1) // 월요일
    const weekId = startOfWeek.toDateString()

    // 이미 이번 주에 갱신했으면 패스
    if (this.lastWeeklyQuestUpdate === weekId) {
      return this.weeklyQuests
    }

    // 랜덤 5개 주간 퀘스트 생성
    const allWeeklyQuests = [
      { id: 'weekly-1', title: '채팅 20회 하기', xp: 200, gold: 100 },
      { id: 'weekly-2', title: '이동 50회 하기', xp: 200, gold: 100 },
      { id: 'weekly-3', title: '퀘스트 5개 완료하기', xp: 300, gold: 150 },
      { id: 'weekly-4', title: '인터랙션 10회 하기', xp: 250, gold: 125 },
      { id: 'weekly-5', title: '호감도 80 이상 캐릭터 3명 만들기', xp: 300, gold: 150 },
      { id: 'weekly-6', title: '아이템 10개 사용하기', xp: 200, gold: 100 },
      { id: 'weekly-7', title: '모든 방 방문하기', xp: 250, gold: 125 },
      { id: 'weekly-8', title: '친구 요청 보내기', xp: 150, gold: 75 }
    ]

    // 무작위 5개 선택
    const shuffled = allWeeklyQuests.sort(() => Math.random() - 0.5)
    this.weeklyQuests = shuffled.slice(0, 5)
    this.lastWeeklyQuestUpdate = weekId

    console.log(`📅 주간 퀘스트 갱신: ${this.weeklyQuests.length}개`)
    return this.weeklyQuests
  }

  // ===== 퀘스트 완료 처리 =====
  completeQuest(characterId, questId) {
    const timestamp = Date.now()

    // 완료 히스토리 기록
    if (!this.eventHistory[characterId]) {
      this.eventHistory[characterId] = []
    }
    this.eventHistory[characterId].push({
      questId,
      timestamp,
      completed: true
    })

    // 리워드 생성
    const difficulty = this.getQuestDifficulty(questId)
    const reward = this.generateReward(difficulty)

    console.log(`✅ 퀘스트 완료: ${characterId} → ${questId}`)
    return {
      success: true,
      reward
    }
  }

  // ===== 퀘스트 난이도 결정 =====
  getQuestDifficulty(questId) {
    if (questId.includes('daily')) {
      return 'NORMAL'
    } else if (questId.includes('weekly')) {
      return 'HARD'
    } else if (questId.includes('special')) {
      return 'LEGENDARY'
    }
    return 'EASY'
  }

  // ===== 이벤트 상태 요약 =====
  getEventSummary() {
    return {
      currentSeason: this.getCurrentSeason(),
      activeSpecialEvents: this.getActiveSpecialEvents(),
      dailyQuests: this.updateDailyQuests(),
      weeklyQuests: this.updateWeeklyQuests(),
      bonuses: this.getCurrentSeason().bonuses
    }
  }

  // ===== 이벤트 히스토리 =====
  getEventHistory(characterId) {
    return this.eventHistory[characterId] || []
  }

  // ===== 이벤트 히스토리 초기화 =====
  clearEventHistory(characterId) {
    this.eventHistory[characterId] = []
  }

  // ===== 모든 이벤트 히스토리 초기화 =====
  resetAll() {
    this.activeEvents = {}
    this.eventHistory = {}
    this.dailyQuests = []
    this.lastDailyQuestUpdate = null
    this.weeklyQuests = []
    this.lastWeeklyQuestUpdate = null
    console.log('🔄 EventManager reset complete')
  }
}

// 싱글톤 인스턴스
let eventManagerInstance = null

function getEventManager() {
  if (!eventManagerInstance) {
    eventManagerInstance = new EventManager()
  }
  return eventManagerInstance
}

export {
  EventManager,
  getEventManager
}