/**
 * 맥락 관리자 (Context Manager)
 *
 * 기능:
 * - 이전 대화 내용 기억
 * - 플레이어 행동 기반 대화 맞춤
 * - 시간대/장소/캐릭터 상태 반영 대화
 * - 대화 히스토리 및 토픽 관리
 */

// 대화 맥락 클래스
class ConversationContext {
  constructor() {
    this.conversations = new Map() // characterId → ConversationData
    this.playerActions = new Map() // characterId → Array of player actions
    this.topics = new Map() // characterId → Set of discussed topics
    this.lastInteractionTime = new Map() // characterId → timestamp
  }

  // 대화 컨텍스트 가져오기 또는 생성
  ensureConversation(characterId) {
    if (!this.conversations.has(characterId)) {
      this.conversations.set(characterId, {
        messages: [],
        currentTopic: null,
        conversationState: 'new', // new, continuing, paused
        mood: 'neutral', // neutral, positive, negative
        lastMessageIndex: 0
      })
    }
    return this.conversations.get(characterId)
  }

  // 메시지 추가
  addMessage(characterId, senderRole, content, metadata = {}) {
    const context = this.ensureConversation(characterId)

    context.messages.push({
      senderRole, // 'user' or 'assistant'
      content,
      timestamp: Date.now(),
      ...metadata
    })

    // 최근 30개만 유지
    if (context.messages.length > 30) {
      context.messages.shift()
    }

    // 대화 상태 업데이트
    this.updateConversationState(characterId)
  }

  // 대화 상태 업데이트
  updateConversationState(characterId) {
    const context = this.conversations.get(characterId)
    if (!context) return

    const now = Date.now()
    const lastMessage = context.messages[context.messages.length - 1]

    if (!lastMessage) {
      context.conversationState = 'new'
      return
    }

    const timeSinceLastMessage = now - lastMessage.timestamp

    // 마지막 메시지 후 30분 이상이면 새 대화
    if (timeSinceLastMessage > 30 * 60 * 1000) {
      context.conversationState = 'resumed'
    } else if (timeSinceLastMessage >= 4 * 60 * 1000) {
      // 4분 이상이면 일시 정지 상태
      context.conversationState = 'paused'
    } else {
      context.conversationState = 'continuing'
    }
  }

  // 대화 상태 가져오기
  getConversationState(characterId) {
    const context = this.ensureConversation(characterId)
    return context.conversationState
  }

  // 최근 메시지 가져오기
  getRecentMessages(characterId, count = 10) {
    const context = this.ensureConversation(characterId)
    return context.messages.slice(-count)
  }

  // 플레이어 동작 기록
  recordPlayerAction(characterId, actionType, details = {}) {
    if (!this.playerActions.has(characterId)) {
      this.playerActions.set(characterId, [])
    }

    const actions = this.playerActions.get(characterId)
    actions.push({
      type: actionType,
      details,
      timestamp: details.timestamp || Date.now()
    })

    // 최근 50개만 유지
    if (actions.length > 50) {
      actions.shift()
    }

    console.log(`📝 플레이어 동작 기록: ${characterId} → ${actionType}`)
  }

  // 플레이어 동작 히스토리 가져오기
  getPlayerActions(characterId, timeWindow = 10 * 60 * 1000) {
    const actions = this.playerActions.get(characterId) || []
    const now = Date.now()

    return actions.filter(action => {
      return (now - action.timestamp) < timeWindow
    })
  }

  // 토픽 기록
  recordTopic(characterId, topic) {
    if (!this.topics.has(characterId)) {
      this.topics.set(characterId, new Set())
    }

    this.topics.get(characterId).add(topic)
  }

  // 토픽 가져오기
  getTopics(characterId) {
    return Array.from(this.topics.get(characterId) || [])
  }

  // 현재 토픽 설정
  setCurrentTopic(characterId, topic) {
    const context = this.ensureConversation(characterId)
    context.currentTopic = topic
    this.recordTopic(characterId, topic)
  }

  // 현재 토픽 가져오기
  getCurrentTopic(characterId) {
    const context = this.conversations.get(characterId)
    return context?.currentTopic || null
  }

  // 최근 대화 기억 요약
  summarizeRecentConversation(characterId) {
    const messages = this.getRecentMessages(characterId, 10)
    const topics = this.getTopics(characterId)
    const actions = this.getPlayerActions(characterId)

    return {
      messageCount: messages.length,
      recentMessages: messages.map(m => ({
        role: m.senderRole,
        content: m.content.substring(0, 50),
        time: Math.round((Date.now() - m.timestamp) / 1000) + 's ago'
      })),
      topics: topics.slice(0, 5),
      recentActions: actions.map(a => ({
        type: a.type,
        time: Math.round((Date.now() - a.timestamp) / 1000) / 60 + 'm ago'
      }))
    }
  }

  // 대화 분위기 분석
  analyzeConversationMood(characterId) {
    const messages = this.getRecentMessages(characterId, 15)
    if (messages.length === 0) return 'neutral'

    // 긍정/부정 키워드
    const positiveKeywords = ['좋아', '좋아요', '행복', '즐겁', '감사', '사랑', '기뻐', '반가워', '대박', '신나']
    const negativeKeywords = ['슬퍼', '안타까워', '미안해', '화나', '힘들', '지루해', '짜증', '싫어', '괴로워', '불쌍해']

    let positiveScore = 0
    let negativeScore = 0

    for (const message of messages) {
      const content = message.content.toLowerCase()

      for (const keyword of positiveKeywords) {
        if (content.includes(keyword)) positiveScore++
      }

      for (const keyword of negativeKeywords) {
        if (content.includes(keyword)) negativeScore++
      }
    }

    // 분위기 판정
    if (positiveScore > negativeScore + 2) return 'positive'
    if (negativeScore > positiveScore + 2) return 'negative'
    return 'neutral'
  }

  // 마지막 상호작용 시간 업데이트
  updateLastInteractionTime(characterId) {
    this.lastInteractionTime.set(characterId, Date.now())
  }

  // 마지막 상호작용 시간 가져오기
  getLastInteractionTime(characterId) {
    return this.lastInteractionTime.get(characterId) || null
  }

  // 대화 컨텍스트 초기화
  clearConversation(characterId) {
    this.conversations.delete(characterId)
    this.topics.delete(characterId)
    this.lastInteractionTime.delete(characterId)
    console.log(`🗑️ 대화 컨텍스트 초기화: ${characterId}`)
  }

  // 전체 초기화
  cleanup() {
    this.conversations.clear()
    this.playerActions.clear()
    this.topics.clear()
    this.lastInteractionTime.clear()
    console.log('🗑️ 맥락 관리자 전체 초기화')
  }
}

// 맥락 관리자 클래스
class ContextManager {
  constructor() {
    this.context = new ConversationContext()
    this.timeOfDay = this.getTimeOfDay()
    this.currentLocation = null
  }

  // 시간대 계산
  getTimeOfDay() {
    const hour = new Date().getHours()

    if (hour >= 5 && hour < 12) return 'morning'
    if (hour >= 12 && hour < 17) return 'afternoon'
    if (hour >= 17 && hour < 22) return 'evening'
    return 'night'
  }

  // 메시지 추가 (위임)
  addMessage(characterId, senderRole, content, metadata = {}) {
    return this.context.addMessage(characterId, senderRole, content, metadata)
  }

  // 대화 상태 가져오기 (위임)
  getConversationState(characterId) {
    const context = this.context.ensureConversation(characterId)
    return context.conversationState
  }

  // 최근 메시지 가져오기 (위임)
  getRecentMessages(characterId, count = 10) {
    const messages = this.context.getRecentMessages(characterId, count)
    return messages
  }

  // 현재 토픽 설정 (위임)
  setCurrentTopic(characterId, topic) {
    return this.context.setCurrentTopic(characterId, topic)
  }

  // 현재 토픽 가져오기 (위임)
  getCurrentTopic(characterId) {
    return this.context.getCurrentTopic(characterId)
  }

  // 맥락 프롬프트 생성
  generateContextPrompt(characterId, userMessage) {
    const context = this.context.ensureConversation(characterId)
    const recentMessages = this.context.getRecentMessages(characterId, 5)
    const topics = this.context.getTopics(characterId)

    // 시간대 프롬프트
    const timePrompts = {
      morning: '아침',
      afternoon: '오후',
      evening: '저녁',
      night: '밤'
    }

    let prompt = '[대화 맥락]\n'
    prompt += `시간대: ${timePrompts[this.timeOfDay]}\n`

    if (this.currentLocation) {
      prompt += `현재 위치: ${this.currentLocation}\n`
    }

    prompt += `대화 상태: ${context.conversationState}\n`
    prompt += `분위기: ${context.mood}\n`

    if (topics.length > 0) {
      prompt += `주제: ${topics.join(', ')}\n`
    }

    prompt += '\n최근 대화:\n'
    recentMessages.forEach((msg, idx) => {
      prompt += `${idx + 1}. ${msg.senderRole}: ${msg.content.substring(0, 50)}...\n`
    })

    prompt += '\n사용자 메시지:\n'
    prompt += `${userMessage}\n`

    return prompt
  }

  // 위치 설정
  setLocation(location) {
    this.currentLocation = location
  }

  // 대화 요약 가져오기
  getConversationSummary(characterId) {
    return this.context.summarizeRecentConversation(characterId)
  }

  // 전체 초기화 (위임)
  cleanup() {
    return this.context.cleanup()
  }

  // 위치 설정
  setLocation(location) {
    this.currentLocation = location
    console.log(`📍 위치 설정: ${location}`)
  }

  // 위치 가져오기
  getLocation() {
    return this.currentLocation || 'unknown'
  }

  // 맥락 기반 프롬프트 생성
  generateContextPrompt(characterId, userMessage) {
    const state = this.context.getConversationState(characterId)
    const topic = this.context.getCurrentTopic(characterId)
    const mood = this.context.analyzeConversationMood(characterId)
    const timeOfDay = this.getTimeOfDay()
    const location = this.getLocation()

    let prompt = `[대화 맥락]
`

    // 대화 상태
    if (state === 'new') {
      prompt += `- 대화 상태: 새 대화
`
    } else if (state === 'resumed') {
      prompt += `- 대화 상태: 대화 재개 (오랜만)
`
    } else {
      prompt += `- 대화 상태: 계속되는 대화
`
    }

    // 토픽
    if (topic) {
      prompt += `- 현재 토픽: ${topic}
`
    }

    // 분위기
    if (mood !== 'neutral') {
      prompt += `- 대화 분위기: ${mood === 'positive' ? '긍정적' : '부정적'}
`
    }

    // 시간대
    const timeKorean = {
      morning: '아침',
      afternoon: '오후',
      evening: '저녁',
      night: '밤'
    }
    prompt += `- 시간대: ${timeKorean[timeOfDay]}
`

    // 위치
    if (location !== 'unknown') {
      prompt += `- 현재 위치: ${location}
`
    }

    prompt += `
[맥락 반영 요청]
- 대화 상태에 맞춰 자연스럽게 시작하세요.
- 현재 토픽이 있으면 그 주제로 대화를 이어가세요.
- 대화 분위기를 반영하여 어조를 조절하세요.
- 시간대를 고려하여 인사나 토픽을 선택하세요.
`

    return prompt
  }

  // 맥락 업데이트
  updateContext(characterId, senderRole, content, metadata = {}) {
    this.context.addMessage(characterId, senderRole, content, metadata)
    this.context.updateLastInteractionTime(characterId)

    // 토픽 추출 및 업데이트
    if (senderRole === 'user' && !metadata.topic) {
      const extractedTopic = this.extractTopic(content)
      if (extractedTopic) {
        this.context.setCurrentTopic(characterId, extractedTopic)
      }
    }

    // 분위기 업데이트
    const mood = this.context.analyzeConversationMood(characterId)
    const contextState = this.context.ensureConversation(characterId)
    contextState.mood = mood
  }

  // 토픽 추출 (간단)
  extractTopic(text) {
    // 주요 명사 추출 (간단한 구현)
    const topicPatterns = [
      /음악|노래|음원|가/, /여행|여행지|놀러|관광/, /게임|플레이|게이머/,
      /음식|식사|배고파|맛집/, /요리|만들기|조리/, /운동|헬스|체육/,
      /독서|책|읽기/, /공부|학습|공부/, /친구|친구들|사람/,
      /가족|가족들|부모님/, /AI|인공지능|로봇/, /날씨|비|눈|햇빛/,
      /사랑|좋아|호감/
    ]

    const topicNames = [
      '음악', '여행', '게임', '음식', '요리', '운동',
      '독서', '공부', '친구', '가족', 'AI', '날씨', '사랑'
    ]

    for (let i = 0; i < topicPatterns.length; i++) {
      if (topicPatterns[i].test(text)) {
        return topicNames[i]
      }
    }

    return null
  }

  // 대화 요약 가져오기
  getConversationSummary(characterId) {
    return this.context.summarizeRecentConversation(characterId)
  }
}

// 싱글톤 인스턴스
const contextManager = new ContextManager()

export {
  ContextManager,
  ConversationContext,
  contextManager
}