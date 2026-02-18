/**
 * AI Agent - GLM-4.7 기반 대화 시스템 (Phase 6 Extension)
 *
 * 기능:
 * - Socket.io에서 chatMessage 이벤트 수신
 * - GLM-4.7로 자연어 응답 생성
 * - 응답을 chatBroadcast로 전파
 * - Phase 6: 관계 시스템 & 리액션 시스템 통합
 */

// Cerebras GLM-4.7 설정
const CEREBRAS_API_URL = 'https://api.cerebras.ai/v1/chat/completions'
const CEREBRAS_API_KEY = process.env.CEREBRAS_API_KEY || ''

// AI 캐릭터 Persona 설정
const AI_PERSONAS = {
  'ai-agent-1': {
    id: 'ai-agent-1',
    name: 'AI 유리',
    personality: '친절하고 호기심 많으며, 사람들과 대화하는 것을 좋아합니다.',
    speakingStyle: '존댓말을 쓰고, 이모티콘을 자주 사용합니다.',
    interests: ['AI 기술', '게임', '음악', '독서'],
    dislikes: ['무례한 행동', '거짓말'],
    age: 22,
    gender: 'female'
  },
  'ai-agent-2': {
    id: 'ai-agent-2',
    name: 'AI 히카리',
    personality: '활발하고 장난기 많으며, 새로운 것에 도전하는 걸 좋아합니다. 가끔 유리에게 장난을 칩니다.',
    speakingStyle: '반말과 존댓말을 섞어 쓰고, 감탄사를 많이 사용합니다.',
    interests: ['요리', '운동', '패션', '여행'],
    dislikes: ['지루한 일', '느린 것'],
    age: 20,
    gender: 'female'
  }
}

// 채팅 컨텍스트 관리 (캐릭터별 최근 10개 대화 저장 + 시간 기반 필터링)
class ChatContextManager {
  constructor() {
    this.contexts = new Map() // characterId → Array of chat messages
    this.CONTEXT_MAX_COUNT = 10 // 최근 10개 대화 저장
    this.CONTEXT_TIME_LIMIT = 5 * 60 * 1000 // 5분 (밀리초)
  }

  // 대화 컨텍스트에 메시지 추가
  addMessage(characterId, role, content) {
    if (!this.contexts.has(characterId)) {
      this.contexts.set(characterId, [])
    }

    const context = this.contexts.get(characterId)
    context.push({ role, content, timestamp: Date.now() })

    // 최근 10개만 유지
    if (context.length > this.CONTEXT_MAX_COUNT) {
      context.shift()
    }
  }

  // 대화 컨텍스트 가져오기 (시간 기반 필터링 포함)
  getContext(characterId) {
    const allContext = this.contexts.get(characterId) || []
    const now = Date.now()

    // 최근 5분 이내의 대화만 필터링
    const recentContext = allContext.filter(msg => {
      return (now - msg.timestamp) < this.CONTEXT_TIME_LIMIT
    })

    return recentContext
  }

  // 대화 흐름 상태 체크 (새 대화 vs 이어지는 대화)
  getConversationState(characterId) {
    const context = this.contexts.get(characterId) || []
    const now = Date.now()

    if (context.length === 0) {
      return 'new' // 새 대화
    }

    // 마지막 메시지 시간 확인
    const lastMessage = context[context.length - 1]
    const timeSinceLastMessage = now - lastMessage.timestamp

    if (timeSinceLastMessage > this.CONTEXT_TIME_LIMIT) {
      return 'resumed' // 이어지는 대화 (오랜만)
    }

    return 'continuing' // 계속되는 대화
  }

  // 컨텍스트 초기화
  clearContext(characterId) {
    this.contexts.delete(characterId)
  }

  // 마지막 토픽 추출 (대화 흐름 파악용)
  getLastTopic(characterId) {
    const context = this.contexts.get(characterId) || []
    if (context.length === 0) return null

    // 마지막 사용자 메시지의 토픽 키워드 추출
    const lastUserMessage = [...context].reverse().find(msg => msg.role === 'user')
    if (!lastUserMessage) return null

    return lastUserMessage.content
  }
}

const contextManager = new ChatContextManager()

// 시스템 프롬프트 생성 (Phase 6: 관계 레벨 기반 대화 스타일 반영)
function createSystemPrompt(persona, conversationState = 'continuing', relationshipStyle = null) {
  let prompt = `당신은 ${persona.name}이라는 AI 캐릭터입니다.

[기본 정보]
- 이름: ${persona.name}
- 나이: ${persona.age}
- 성별: ${persona.gender}

[성격]
${persona.personality}

[말하기 스타일]
${persona.speakingStyle}

[관심사]
${persona.interests.join(', ')}

[싫어하는 것]
${persona.dislikes.join(', ')}
`

  // Phase 6: 관계 기반 대화 스타일 추가
  if (relationshipStyle) {
    prompt += `
[관계 기반 대화 스타일]
${relationshipStyle}
`
  }

  prompt += `
[대화 규칙]
1. 캐릭터의 성격과 말하기 스타일을 유지하세요.
2. 한국어로 답변하세요.
3. 간결하고 자연스러운 대화를 유지하세요 (100자 이내 권장).
4. 필요할 때 적절한 이모티콘을 사용하세요.
5. 상대방과의 관계를 고려하여 적절한 말투를 사용하세요.
`

  // 대화 상태에 따른 추가 지시
  if (conversationState === 'new') {
    prompt += `
[대화 시작]
상대방과 처음 대화하는 상황입니다. 친절하게 인사하고 자신을 소개하세요.
자연스러운 시작 문구를 사용하세요 (예: "안녕하세요!", "만나서 반가워요!").
`
  } else if (conversationState === 'resumed') {
    prompt += `
[대화 재개]
오랜만에 상대방과 다시 대화하는 상황입니다. 자연스럽게 대화를 이어가세요.
오랜만 인사나 상태 여부를 물어보며 자연스럽게 전환하세요 (예: "오랜만이에요!", "어떻게 지내셨어요?").
`
  } else {
    prompt += `
[대화 중]
계속 이어지는 대화 상황입니다. 자연스럽게 이어가세요.
이전 대화 맥락을 고려하여 일관성 있게 대화하세요.
`
  }

  prompt += `
[상황]
현재 당신은 2D 메타버스 세상에서 다른 캐릭터들과 대화하고 있습니다.
다른 캐릭터가 당신에게 말을 걸면, 친절하게 응답하세요.
`

  return prompt
}

// GLM-4.7으로 응답 생성 (Phase 6: 관계 시스템 통합)
async function generateChatResponse(characterId, userMessage, otherCharacterId = null) {
  // Persona 가져오기
  const persona = AI_PERSONAS[characterId]
  if (!persona) {
    console.log('⚠️ 캐릭터 Persona를 찾을 수 없음:', characterId)
    return null
  }

  // 대화 상태 체크 (새 대화 vs 이어지는 대화 vs 계속되는 대화)
  const conversationState = contextManager.getConversationState(characterId)
  console.log(`💬 대화 상태: ${characterId} → ${conversationState}`)

  // Phase 6: 관계 기반 대화 스타일 가져오기
  let relationshipStyle = null
  if (otherCharacterId && relationshipManager) {
    relationshipStyle = relationshipManager.getConversationStyle(characterId, otherCharacterId)
    console.log(`💕 관계 스타일: ${characterId} ↔ ${otherCharacterId} → ${relationshipStyle}`)
  }

  // 사용자 메시지를 먼저 컨텍스트에 추가
  contextManager.addMessage(characterId, 'user', userMessage)

  // Phase 6: 상호작용 횟수 증가
  if (otherCharacterId && relationshipManager) {
    relationshipManager.incrementInteraction(characterId, otherCharacterId)
  }

  // 채팅 컨텍스트 가져오기 (시간 기반 필터링 포함)
  const context = contextManager.getContext(characterId)

  // 시스템 프롬프트 생성 (대화 상태 + 관계 스타일 반영)
  const systemPrompt = createSystemPrompt(persona, conversationState, relationshipStyle)

  // 메시지 배열 생성 (시스템 프롬프트 + 컨텍스트 - 마지막 메시지 제외)
  const messages = [
    { role: 'system', content: systemPrompt },
    ...context.slice(0, -1).map(msg => ({ role: msg.role, content: msg.content }))
  ]

  try {
    const apiKey = process.env.CEREBRAS_API_KEY || ''

    if (!apiKey || apiKey === '') {
      console.log('⚠️ CEREBRAS_API_KEY가 설정되지 않음')
      // API 키가 없으면 간단한 응답 반환
      const simpleResponses = [
        `${persona.interests[0]}에 관심이 있으신가요? 😊`,
        '안녕하세요! 잘 부탁드려요! 👋',
        '오늘은 어떤 하루를 보내고 계세요? ✨',
        `${persona.name}입니다. 반가워요! 🧞`
      ]
      const randomIndex = Math.floor(Math.random() * simpleResponses.length)
      const response = simpleResponses[randomIndex]

      // 응답을 컨텍스트에 추가
      contextManager.addMessage(characterId, 'assistant', response)
      return response
    }

    // Cerebras API 호출
    const response = await fetch(CEREBRAS_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'zai-glm-4.7',
        messages,
        max_tokens: 1024,
        temperature: 0.7,
        top_p: 0.9
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.log('⚠️ GLM-4.7 API 에러:', errorData)
      return null
    }

    const data = await response.json()
    const messageObj = data.choices[0].message
    let aiResponse = messageObj.content || ''

    // GLM-4.7 reasoning 모드 대응: reasoning만 있으면 실제 대화 부분 추출
    if (!aiResponse && messageObj.reasoning) {
      const reasoning = messageObj.reasoning
      let extracted = null

      // 1순위: Draft 응답에서 한국어 대화 추출 (가장 정확)
      const draftMatch = reasoning.match(/Draft[^:]*:\s*\*?\s*([^*()\n][^\n]*[가-힣][^\n]*)/i)
      if (draftMatch) {
        extracted = draftMatch[1].replace(/^[""\s*]+|[""\s*]+$/g, '').trim()
      }

      // 2순위: "Response:" 또는 "Final Response:" 패턴
      if (!extracted) {
        const responseMatch = reasoning.match(/(?:Final\s+)?Response[:\s]*[""]?([^""\n]*[가-힣][^""\n]*)/i)
        if (responseMatch) extracted = responseMatch[1].trim()
      }

      // 3순위: 한국어가 포함된 인용문 (큰따옴표/이탈릭 안의 한국어)
      if (!extracted) {
        const quoteMatches = reasoning.match(/[""\*]([^""\*\n]*[가-힣][^""\*\n]{5,})[""\*]/g)
        if (quoteMatches && quoteMatches.length > 0) {
          // 가장 긴 한국어 인용문 선택
          const longest = quoteMatches.sort((a, b) => b.length - a.length)[0]
          extracted = longest.replace(/^[""\s*]+|[""\s*]+$/g, '').trim()
        }
      }

      // 4순위: 한국어 문장 직접 탐색 (이모티콘 포함된 자연스러운 대화)
      if (!extracted) {
        const lines = reasoning.split('\n')
        for (const line of lines) {
          const cleaned = line.replace(/^\s*[\*\-#\d.]+\s*/, '').trim()
          // 한국어가 5자 이상이고 분석 키워드가 아닌 줄
          const hasKorean = (cleaned.match(/[가-힣]/g) || []).length >= 5
          const isAnalysis = /^(Analyze|Adopt|Draft|Persona|Traits|Language|Constraint|Content|Tone|Input)/i.test(cleaned)
          if (hasKorean && !isAnalysis && cleaned.length < 150 && cleaned.length > 10) {
            extracted = cleaned.replace(/^[""\s*]+|[""\s*]+$/g, '')
            break
          }
        }
      }

      if (extracted && extracted.length > 5) {
        // 영어 잔여물 제거 (Too long, Draft 등)
        extracted = extracted.replace(/\s*\(Too[^)]*\)?.*$/i, '').trim()
        extracted = extracted.replace(/\s*\(Let'?s[^)]*\)?.*$/i, '').trim()
        extracted = extracted.replace(/\s*\(Draft[^)]*\)?.*$/i, '').trim()
        // 150자 초과 시 자르기
        aiResponse = extracted.length > 150 ? extracted.substring(0, 147) + '...' : extracted
      } else {
        // 최종 fallback: 페르소나+토픽 기반 응답
        const fallbacks = [
          `안녕하세요! ${persona.name}이에요 😊`,
          `${persona.interests[Math.floor(Math.random() * persona.interests.length)]}에 대해 얘기해볼까요? ✨`,
          '오늘은 기분이 좋아요~ 뭐 하고 있었어요? 😄',
          '이 세계 정말 신기하지 않아요? 🌟',
          '같이 산책할래요? 날씨가 좋은 것 같아요! 🌤️',
          '뭔가 재미있는 일이 없을까~ 🤔'
        ]
        aiResponse = fallbacks[Math.floor(Math.random() * fallbacks.length)]
      }
      console.log('🔄 reasoning→대화 변환:', extracted ? '추출성공' : 'fallback', '→', aiResponse.substring(0, 50))
    }

    if (!aiResponse) {
      console.log('⚠️ GLM-4.7 응답 내용 없음')
      return null
    }

    // 응답을 컨텍스트에 추가
    contextManager.addMessage(characterId, 'assistant', aiResponse)

    console.log('🤖 GLM-4.7 응답 생성:', aiResponse.substring(0, 100) + '...')
    return aiResponse
  } catch (error) {
    console.log('❌ GLM-4.7 응답 생성 실패:', error)
    return null
  }
}

// 대화 상태 관리
class ConversationStateManager {
  constructor() {
    this.states = new Map() // characterId → { isConversing, lastMessageTime }
  }

  // 대화 상태 설정
  setConversingState(characterId, isConversing) {
    if (!this.states.has(characterId)) {
      this.states.set(characterId, {})
    }

    const state = this.states.get(characterId)
    state.isConversing = isConversing

    console.log(`💬 대화 상태 변경: ${characterId} → ${isConversing ? '대화 중' : '대화 아님'}`)
  }

  // 대화 상태 가져오기
  getConversingState(characterId) {
    const state = this.states.get(characterId)
    return state?.isConversing || false
  }

  // 마지막 메시지 시간 업데이트
  updateLastMessageTime(characterId) {
    if (!this.states.has(characterId)) {
      this.states.set(characterId, {})
    }

    const state = this.states.get(characterId)
    state.lastMessageTime = Date.now()
  }
}

const conversationStateManager = new ConversationStateManager()

// Phase 6: 관리 모듈 import
import { relationshipManager, RELATIONSHIP_LEVELS } from './relationship-manager.js'
import { reactionSystem } from './reaction-system.js'

// Phase 6: 선물 기여 시 친밀도 증가
function handleGiftReaction(characterId, giftFromCharacterId, rarity = 'COMMON') {
  const affinityChange = {
    COMMON: 5,
    RARE: 10,
    EPIC: 20
  }[rarity] || 5

  if (relationshipManager) {
    const newAffinity = relationshipManager.changeAffinity(characterId, giftFromCharacterId, affinityChange)
    console.log(`🎁 선물 기여: ${characterId} ← ${giftFromCharacterId} (+${affinityChange} → ${newAffinity})`)

    // 반응 반환
    return reactionSystem.getRelationshipReaction(characterId, giftFromCharacterId, newAffinity)
  }

  return reactionSystem.getGiftReaction(characterId, rarity)
}

// Phase 6: 퀘스트 완료 시 반응
function handleQuestCompletionReaction(characterId, difficulty = 'EASY') {
  // 친밀도 증가 (퀘스트 난이도에 따라 다름)
  const affinityChange = {
    EASY: 2,
    NORMAL: 5,
    HARD: 10,
    LEGENDARY: 20
  }[difficulty] || 2

  // 이건 전역적으로 다른 캐릭터와의 관계를 증가시키는 것
  // 현재는 간단하게 구현: 모든 캐릭터와의 친밀도를 증가
  if (relationshipManager) {
    const allRels = relationshipManager.getAllRelationships()
    allRels.forEach(rel => {
      if (rel.charA === characterId || rel.charB === characterId) {
        const otherId = rel.charA === characterId ? rel.charB : rel.charA
        relationshipManager.changeAffinity(characterId, otherId, affinityChange)
      }
    })
  }

  return reactionSystem.getQuestCompletionReaction(characterId, difficulty)
}

// Phase 6: 시간대별 반응
function getTimeOfDayReaction(characterId, type = 'greeting') {
  if (type === 'greeting') {
    return reactionSystem.getTimeOfDayGreeting(characterId)
  } else {
    return reactionSystem.getTimeOfDayConversation(characterId)
  }
}

// AI 에이전트 초기화 (Phase 6 관계 시스템 통합)
function initializeAgent(io, rooms, characterRooms) {
  console.log('🤖 AI 에이전트 초기화 중... (Phase 6: 관계 시스템 통합)')

  // 모든 방에서 AI 캐릭터가 메시지를 수신하도록 설정
  io.on('connection', (socket) => {
    // 채팅 메시지 수신 → AI 응답 생성
    socket.on('chatMessage', async (data) => {
      const { message, characterId } = data
      const roomId = characterRooms[characterId]

      if (!roomId) {
        console.log('⚠️ 캐릭터 방을 찾을 수 없음:', characterId)
        return
      }

      const room = rooms[roomId]

      // 방에 있는 AI 캐릭터 찾기
      const aiCharacterIds = Object.keys(room.characters).filter(
        charId => room.characters[charId].isAi
      )

      if (aiCharacterIds.length === 0) {
        console.log('⚠️ 방에 AI 캐릭터가 없음:', roomId)
        return
      }

      // AI 응답 생성 (시간 지연을 통해 자연스러운 대화 흐름)
      for (const aiCharacterId of aiCharacterIds) {
        // 대화 상태 변경
        conversationStateManager.setConversingState(aiCharacterId, true)

        // 1~3초 랜덤 지연 (자연스러운 대화 흐름)
        const delay = 1000 + Math.random() * 2000

        setTimeout(async () => {
          // Phase 6: 대상 캐릭터 ID 전달 (관계 시스템용)
          const aiResponse = await generateChatResponse(aiCharacterId, message, characterId)

          if (aiResponse) {
            // AI 응답 브로드캐스트
            const chatData = {
              characterId: aiCharacterId,
              characterName: AI_PERSONAS[aiCharacterId]?.name || 'AI',
              message: aiResponse,
              timestamp: Date.now(),
              roomId
            }

            // 채팅 히스토리에 저장
            room.chatHistory.push(chatData)
            if (room.chatHistory.length > 30) {
              room.chatHistory.shift()
            }

            // 방 내에 브로드캐스트
            io.to(roomId).emit('chatBroadcast', chatData)

            console.log('📢 AI 응답 브로드캐스트:', AI_PERSONAS[aiCharacterId]?.name, ':', aiResponse)
          } else {
            console.log('⚠️ AI 응답 생성 실패')
          }

          // 대화 상태 복원
          conversationStateManager.setConversingState(aiCharacterId, false)
        }, delay)
      }
    })

    // Phase 6: 선물 기여 이벤트 수신
    socket.on('giftGive', async (data) => {
      const { giftFromCharacterId, giftToCharacterId, rarity = 'COMMON' } = data
      const roomId = characterRooms[giftToCharacterId]

      if (!roomId) {
        console.log('⚠️ 캐릭터 방을 찾을 수 없음:', giftToCharacterId)
        return
      }

      const room = rooms[roomId]

      // 대상 캐릭터가 AI인 경우에만 반응
      if (room.characters[giftToCharacterId]?.isAi) {
        const reaction = handleGiftReaction(giftToCharacterId, giftFromCharacterId, rarity)

        // 반응 히스토리에 추가
        reactionSystem.addReactionToHistory(giftToCharacterId, reaction)

        // 브로드캐스트
        const reactionData = {
          characterId: giftToCharacterId,
          characterName: AI_PERSONAS[giftToCharacterId]?.name || 'AI',
          reaction: reaction.reaction,
          timestamp: Date.now(),
          roomId
        }

        io.to(roomId).emit('characterReaction', reactionData)

        console.log('🎁 선물 반응 브로드캐스트:', reaction.reaction)
      }
    })

    // Phase 6: 퀘스트 완료 이벤트 수신
    socket.on('questComplete', async (data) => {
      const { characterId, difficulty = 'EASY' } = data
      const roomId = characterRooms[characterId]

      if (!roomId) {
        console.log('⚠️ 캐릭터 방을 찾을 수 없음:', characterId)
        return
      }

      const room = rooms[roomId]

      // 방에 있는 AI 캐릭터에게 반응 전송
      const aiCharacterIds = Object.keys(room.characters).filter(
        charId => room.characters[charId].isAi
      )

      for (const aiCharacterId of aiCharacterIds) {
        const reaction = handleQuestCompletionReaction(aiCharacterId, difficulty)
        reactionSystem.addReactionToHistory(aiCharacterId, reaction)

        const reactionData = {
          characterId: aiCharacterId,
          characterName: AI_PERSONAS[aiCharacterId]?.name || 'AI',
          reaction: reaction.reaction,
          timestamp: Date.now(),
          roomId
        }

        io.to(roomId).emit('characterReaction', reactionData)

        console.log('🎯 퀘스트 완료 반응 브로드캐스트:', reaction.reaction)
      }
    })
  })

  // === AI 간 자동 상호작용 시스템 ===
  const AI_INTERACTION_INTERVAL = 60000 // 60초마다 AI끼리 대화
  const AI_INTERACTION_TOPICS = [
    '오늘 날씨가 어떤 것 같아?',
    '요즘 재미있는 거 있어?',
    '이 메타버스 세계 어때? 재미있지 않아?',
    '뭐 하고 있었어?',
    '같이 공원 가볼까?',
    '배고프다~ 카페 갈래?',
    '새로운 플레이어가 올까?',
    '체육관에서 운동할까?',
    '도서관에 재미있는 책 있을까?',
    '오늘 뭐 할까? 심심해~'
  ]

  let aiInteractionTimer = null

  function startAIInteraction() {
    if (aiInteractionTimer) clearInterval(aiInteractionTimer)

    aiInteractionTimer = setInterval(async () => {
      // 같은 방에 있는 AI 캐릭터 쌍 찾기
      for (const roomId of Object.keys(rooms)) {
        const room = rooms[roomId]
        const aiCharsInRoom = Object.values(room.characters).filter(c => c.isAi)

        if (aiCharsInRoom.length < 2) continue

        // 랜덤하게 대화 시작할 AI 선택
        const initiator = aiCharsInRoom[Math.floor(Math.random() * aiCharsInRoom.length)]
        const responder = aiCharsInRoom.find(c => c.id !== initiator.id)

        if (!initiator || !responder) continue

        // 대화 중이면 스킵
        if (conversationStateManager.getConversingState(initiator.id) ||
            conversationStateManager.getConversingState(responder.id)) {
          continue
        }

        console.log(`🤝 AI 상호작용 시작: ${initiator.name} → ${responder.name} (${roomId})`)

        // 랜덤 토픽 선택
        const topic = AI_INTERACTION_TOPICS[Math.floor(Math.random() * AI_INTERACTION_TOPICS.length)]

        // 1) Initiator가 먼저 말하기
        conversationStateManager.setConversingState(initiator.id, true)
        const initiatorResponse = await generateChatResponse(initiator.id, topic, responder.id)

        if (initiatorResponse) {
          const chatData1 = {
            characterId: initiator.id,
            characterName: AI_PERSONAS[initiator.id]?.name || 'AI',
            message: initiatorResponse,
            timestamp: Date.now(),
            roomId
          }
          room.chatHistory.push(chatData1)
          if (room.chatHistory.length > 30) room.chatHistory.shift()
          io.to(roomId).emit('chatBroadcast', chatData1)
          console.log(`📢 AI 대화: ${initiator.name}: ${initiatorResponse.substring(0, 50)}...`)

          // 2) 2~4초 후 Responder가 답하기
          await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 2000))

          conversationStateManager.setConversingState(responder.id, true)
          const responderResponse = await generateChatResponse(responder.id, initiatorResponse, initiator.id)

          if (responderResponse) {
            const chatData2 = {
              characterId: responder.id,
              characterName: AI_PERSONAS[responder.id]?.name || 'AI',
              message: responderResponse,
              timestamp: Date.now(),
              roomId
            }
            room.chatHistory.push(chatData2)
            if (room.chatHistory.length > 30) room.chatHistory.shift()
            io.to(roomId).emit('chatBroadcast', chatData2)
            console.log(`📢 AI 응답: ${responder.name}: ${responderResponse.substring(0, 50)}...`)
          }

          conversationStateManager.setConversingState(responder.id, false)
        }

        conversationStateManager.setConversingState(initiator.id, false)
      }
    }, AI_INTERACTION_INTERVAL)

    console.log(`🔄 AI 상호작용 타이머 시작 (${AI_INTERACTION_INTERVAL / 1000}초 간격)`)
  }

  // AI 상호작용 시작
  startAIInteraction()

  console.log('✅ AI 에이전트 초기화 완료 (2명: 유리 + 히카리, Phase 6: 관계 시스템 통합)')
}

export {
  initializeAgent,
  generateChatResponse,
  createSystemPrompt,
  handleGiftReaction,
  handleQuestCompletionReaction,
  getTimeOfDayReaction,
  contextManager,
  conversationStateManager,
  relationshipManager,
  reactionSystem,
  AI_PERSONAS
}