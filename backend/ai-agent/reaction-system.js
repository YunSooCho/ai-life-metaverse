/**
 * Reaction System - 리액션 시스템
 *
 * 기능:
 * - 선물 기여 시 반응
 * - 퀘스트 완료 시 반응
 * - 시간대별 반응 (아침, 점심, 저녁, 밤)
 * - 특별 이벤트 반응
 */

// 시간대 정의
const TIME_OF_DAY = {
  DAWN: { name: '새벽', start: 5, end: 7, icon: '🌅' },
  MORNING: { name: '아침', start: 7, end: 12, icon: '☀️' },
  LUNCH: { name: '점심', start: 12, end: 14, icon: '🍽️' },
  AFTERNOON: { name: '오후', start: 14, end: 17, icon: '🌤️' },
  EVENING: { name: '저녁', start: 17, end: 20, icon: '🌆' },
  NIGHT: { name: '밤', start: 20, end: 5, icon: '🌙' }
}

// 현재 시간대 가져오기
function getCurrentTimeOfDay() {
  const hour = new Date().getHours()

  for (const [key, time] of Object.entries(TIME_OF_DAY)) {
    if (time.start < time.end) {
      // 일반적인 범위 (예: 7-12)
      if (hour >= time.start && hour < time.end) {
        return { key, ...time }
      }
    } else {
      // 밤시간 (예: 20-5)
      if (hour >= time.start || hour < time.end) {
        return { key, ...time }
      }
    }
  }

  return TIME_OF_DAY.NIGHT
}

// 시간대별 인사 리액션
const TIME_OF_DAY_GREETINGS = {
  DAWN: [
    '일찍 일어나셨네요~ 🌅',
    '새벽이라 졸려요... 하지만 반가워요! 😊',
    '하루가 시작되는군요. 좋은 하루 보내시길! 💪'
  ],
  MORNING: [
    '좋은 아침입니다! 🌞',
    '아침부터 기분이 좋아요~ 🌟',
    '오늘 하루도 화이팅 해요! 💪'
  ],
  LUNCH: [
    '밥 먹었어요? 🍽️',
    '점심시간이라 배고픈데요~ 🍜',
    '같이 맛있는 거 먹을까요? 🥗'
  ],
  AFTERNOON: [
    '오후라 좀 피곤한데 기운 내요! ☕',
    '하늘이 정말 예쁘네요~ 🌤️',
    '뭐 재미있는 거 없을까요? 🤔'
  ],
  EVENING: [
    '저녁입니다~ 하루 잘 보내셨나요? 🌆',
    '하루 끝이라 조금 피곤해요~ 😴',
    '오늘 하루 어땠어요? 👀'
  ],
  NIGHT: [
    '늦게까지 있으시네요~ 밤새지 않도록 주의! 🌙',
    '잠잘 시간인데요~ 달콤한 꿈 꾸세요! 💤',
    '어두워서 좀 무서운데... 괜찮아요? 😅'
  ]
}

// 시간대별 대화 리액션
const TIME_OF_DAY_CONVERSATIONS = {
  DAWN: [
    '새벽에 어딜 가세요? 🌅',
    '일찍일어! 부지런하시네~ 🌟',
    '조용해서 좋네요~'
  ],
  MORNING: [
    '오늘 뭐 할 계획 있어요? ☀️',
    '기분 전환이 필요하면 말해주세요! 😊',
    '카페로 갈까요? 커피 마시면 좋을 것 같아! ☕'
  ],
  LUNCH: [
    '뭐 먹을지 아직 안 정했어요? 🍜',
    '점심 맛있게 먹어요~ 🍽️',
    '같이 먹을까요? 👀'
  ],
  AFTERNOON: [
    '오후라 나른해요~ ☕ 마실까요?',
    '하늘 구름이 예쁘네요~ ☁️',
    '뭐 하고 재미있을까요? 🤔'
  ],
  EVENING: [
    '저녁이라 배고픈데요~ 🍛',
    '오늘 하루 어땠어요? 👀',
    '휴식이 필요해요~ 😌'
  ],
  NIGHT: [
    '잠 안 오지 않아요? 🌙',
    '늦은 시간이라 좀 무서운데요... 😅',
    '달콤한 꿈 꾸시길! 💤'
  ]
}

// 선물 기여 반응
const GIFT_REACTIONS = {
  COMMON: [
    '와, 선물 주셨네요! 감사합니다! 🎁',
    '이거 정말 예쁘네요~ 잘 쓸게요! ✨',
    '선물이라니 기분 좋아요! 😊 감사합니다!'
  ],
  RARE: [
    '우와! 이거 진짜 좋은 거네요~ 😍 감사합니다!',
    '이렇게 비싼 걸 다 받아도 될까요? 🎁 정말 감사해요!',
    '진짜?! 정말 고마워요~ 평생 잊지 않을게요! 💖'
  ],
  EPIC: [
    '설마... 이런 걸 받다니?! 😱 너무 감동했어요! 😭',
    '이건... 너무 소중해요... 🥺 정말 감사합니다! 💕',
    '꿈인가요? 이런 선물을 받다니... 정말 평생 잊지 않을게요! 💝'
  ]
}

// 퀘스트 완료 반응
const QUEST_COMPLETION_REACTIONS = {
  EASY: [
    '퀘스트 완료 축하해요! 🎉',
    '잘했어요~ 좀 더 열심히 해봐요! 💪',
    '수고했어요! 다음 퀘스트도 할 수 있을 거예요 😊'
  ],
  NORMAL: [
    '좋아요! 퀘스트 완료! 🎊',
    '역시시 기대했어요~ 잘했어요! 👍',
    '노력한 만큼 결과가 좋네요! 축하해요! 🎉'
  ],
  HARD: [
    '와, 어려운 퀘스트 완료?! 대단해요! 🏆',
    '정말 고생했어요... 이렇게 어려운 걸 다 해내다니! 🥇',
    '너무 멋지다! 난 당신이 최고인 줄 알았어! 🌟'
  ],
  LEGENDARY: [
    '전설급?! 이건 미친 거 아냐?! 🤯',
    '이게 말이 되는 거야?! 내 눈을 의심케 하네... 😱',
    '당신이 최고야! 정말 최고! 🏆🏆🏆'
  ]
}

// 특별 이벤트 반응
const SPECIAL_EVENT_REACTIONS = {
  LEVEL_UP: [
    '레벨업! 축하해요! 🎊',
    '점점 더 강해지고 있네요~ 💪',
    '앞으로 더 기대돼요! 🌟'
  ],
  NEW_RECORD: [
    '신기록! 대단해요! 🏆',
    '평생 안 깨질 기록일지도!? 🤯',
    '너무 멋지다! 👍'
  ],
  ACHIEVEMENT: [
    '업적 달성! 축하해요! 🎉',
    '정말 대단해요! 👍',
    '오늘 기분 최고! 😊'
  ]
}

// 리액션 시스템 클래스
class ReactionSystem {
  constructor() {
    this.reactionHistory = new Map() // characterId → Array of reactions
  }

  // 시간대별 인사 리액션 가져오기
  getTimeOfDayGreeting(characterId) {
    const timeOfDay = getCurrentTimeOfDay()
    const greetings = TIME_OF_DAY_GREETINGS[timeOfDay.key] || TIME_OF_DAY_GREETINGS.MORNING
    return {
      timeOfDay,
      greeting: greetings[Math.floor(Math.random() * greetings.length)],
      icon: timeOfDay.icon
    }
  }

  // 시간대별 대화 리액션 가져오기
  getTimeOfDayConversation(characterId) {
    const timeOfDay = getCurrentTimeOfDay()
    const conversations = TIME_OF_DAY_CONVERSATIONS[timeOfDay.key] || TIME_OF_DAY_CONVERSATIONS.AFTERNOON
    return {
      timeOfDay,
      conversation: conversations[Math.floor(Math.random() * conversations.length)],
      icon: timeOfDay.icon
    }
  }

  // 선물 기여 반응 가져오기
  getGiftReaction(characterId, rarity = 'COMMON') {
    const reactions = GIFT_REACTIONS[rarity] || GIFT_REACTIONS.COMMON
    return {
      type: 'gift',
      rarity,
      reaction: reactions[Math.floor(Math.random() * reactions.length)]
    }
  }

  // 퀘스트 완료 반응 가져오기
  getQuestCompletionReaction(characterId, difficulty = 'EASY') {
    const reactions = QUEST_COMPLETION_REACTIONS[difficulty] || QUEST_COMPLETION_REACTIONS.EASY
    return {
      type: 'quest_completion',
      difficulty,
      reaction: reactions[Math.floor(Math.random() * reactions.length)]
    }
  }

  // 특별 이벤트 반응 가져오기
  getSpecialEventReaction(characterId, eventType) {
    const reactions = SPECIAL_EVENT_REACTIONS[eventType]
    if (!reactions) return null

    return {
      type: 'special_event',
      eventType,
      reaction: reactions[Math.floor(Math.random() * reactions.length)]
    }
  }

  // 관계 기반 커스텀 리액션
  getRelationshipReaction(characterId, otherCharacterId, affinity) {
    if (affinity >= 80) {
      // 베프
      const reactions = [
        '나 가장 좋아하는 친구예요~ 💖',
        '영원히 함께할 거죠? 🥺',
        '당신이 있어서 너무 행복해요! 😊'
      ]
      return reactions[Math.floor(Math.random() * reactions.length)]
    } else if (affinity >= 60) {
      // 좋은 친구
      const reactions = [
        '너랑 있으면 항상 재미있어! 😄',
        '좋은 친구야! 👍',
        '당신 최고! 🌟'
      ]
      return reactions[Math.floor(Math.random() * reactions.length)]
    } else if (affinity >= 40) {
      // 친구
      const reactions = [
        '친구라서 좋네요~ 😊',
        '함께 있어 즐거워요!',
        '더 친해지고 싶어요! 🤝'
      ]
      return reactions[Math.floor(Math.random() * reactions.length)]
    } else {
      // 지인/낯선 사람
      const reactions = [
        '안녕하세요~',
        '만나서 반가워요! 👋',
        '어떻게 지내세요?'
      ]
      return reactions[Math.floor(Math.random() * reactions.length)]
    }
  }

  // 리액션 히스토리에 추가
  addReactionToHistory(characterId, reaction) {
    if (!this.reactionHistory.has(characterId)) {
      this.reactionHistory.set(characterId, [])
    }

    const history = this.reactionHistory.get(characterId)
    history.push({
      ...reaction,
      timestamp: Date.now()
    })

    // 최근 20개 히스토리만 유지
    if (history.length > 20) {
      history.shift()
    }
  }

  // 리액션 히스토리 가져오기
  getReactionHistory(characterId) {
    return this.reactionHistory.get(characterId) || []
  }

  // 리액션 히스토리 초기화
  clearReactionHistory(characterId) {
    this.reactionHistory.delete(characterId)
  }
}

// 싱글톤 인스턴스
const reactionSystem = new ReactionSystem()

export {
  ReactionSystem,
  reactionSystem,
  TIME_OF_DAY,
  TIME_OF_DAY_GREETINGS,
  TIME_OF_DAY_CONVERSATIONS,
  GIFT_REACTIONS,
  QUEST_COMPLETION_REACTIONS,
  SPECIAL_EVENT_REACTIONS,
  getCurrentTimeOfDay
}