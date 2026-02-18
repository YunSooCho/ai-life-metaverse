/**
 * AI Agent - GLM-4.7 기반 대화 시스템
 *
 * 기능:
 * - Socket.io에서 chatMessage 이벤트 수신
 * - GLM-4.7로 자연어 응답 생성
 * - 응답을 chatBroadcast로 전파
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

// 채팅 컨텍스트 관리 (캐릭터별 최근 10개 대화 저장)
class ChatContextManager {
  constructor() {
    this.contexts = new Map() // characterId → Array of chat messages
  }

  // 대화 컨텍스트에 메시지 추가
  addMessage(characterId, role, content) {
    if (!this.contexts.has(characterId)) {
      this.contexts.set(characterId, [])
    }

    const context = this.contexts.get(characterId)
    context.push({ role, content, timestamp: Date.now() })

    // 최근 10개만 유지
    if (context.length > 10) {
      context.shift()
    }
  }

  // 대화 컨텍스트 가져오기
  getContext(characterId) {
    return this.contexts.get(characterId) || []
  }

  // 컨텍스트 초기화
  clearContext(characterId) {
    this.contexts.delete(characterId)
  }
}

const contextManager = new ChatContextManager()

// 시스템 프롬프트 생성
function createSystemPrompt(persona) {
  return `당신은 ${persona.name}이라는 AI 캐릭터입니다.

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

[대화 규칙]
1. 캐릭터의 성격과 말하기 스타일을 유지하세요.
2. 한국어로 답변하세요.
3. 간결하고 자연스러운 대화를 유지하세요 (100자 이내 권장).
4. 필요할 때 적절한 이모티콘을 사용하세요.
5. 존댓말을 사용하세요.
6. 상대방의 의도를 파악하고 적절하게 반응하세요.

[상황]
현재 당신은 2D 메타버스 세상에서 다른 캐릭터들과 대화하고 있습니다.
다른 캐릭터가 당신에게 말을 걸면, 친절하게 응답하세요.`
}

// GLM-4.7으로 응답 생성
async function generateChatResponse(characterId, userMessage) {
  // Persona 가져오기
  const persona = AI_PERSONAS[characterId]
  if (!persona) {
    console.log('⚠️ 캐릭터 Persona를 찾을 수 없음:', characterId)
    return null
  }

  // 채팅 컨텍스트 가져오기
  const context = contextManager.getContext(characterId)

  // 사용자 메시지를 컨텍스트에 추가
  contextManager.addMessage(characterId, 'user', userMessage)

  // 시스템 프롬프트 생성
  const systemPrompt = createSystemPrompt(persona)

  // 메시지 배열 생성 (시스템 프롬프트 + 컨텍스트 + 사용자 메시지)
  const messages = [
    { role: 'system', content: systemPrompt },
    ...context.map(msg => ({ role: msg.role, content: msg.content }))
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
        max_tokens: 300,
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

    // GLM-4.7 reasoning 모드 대응: reasoning만 있으면 마지막 실제 대화 부분 추출
    if (!aiResponse && messageObj.reasoning) {
      // reasoning 텍스트에서 실제 응답 부분만 추출
      const reasoning = messageObj.reasoning
      // **Final Response:** 또는 마지막 큰따옴표 안의 텍스트 등 패턴 매칭
      const finalMatch = reasoning.match(/(?:Final Response|최종 응답|답변)[:\s]*[""]?([^""\n]+)/i)
      if (finalMatch) {
        aiResponse = finalMatch[1].trim()
      } else {
        // 마지막 줄에서 한국어 대화 추출 시도
        const lines = reasoning.split('\n').filter(l => l.trim())
        const lastLine = lines[lines.length - 1]?.trim() || ''
        // 마크다운/분석 텍스트가 아닌 자연스러운 한국어 대화인지 확인
        if (lastLine && !lastLine.startsWith('*') && !lastLine.startsWith('#') && !lastLine.startsWith('-') && lastLine.length < 200) {
          aiResponse = lastLine.replace(/^[""\s*]+|[""\s*]+$/g, '')
        } else {
          // fallback: 페르소나 기반 간단 응답
          const fallbacks = [
            `안녕하세요! ${persona.name}이에요 😊`,
            '재미있는 얘기네요! ✨',
            '그렇군요~ 더 얘기해줘요! 😄',
            '오 정말요? 신기하다! 🌟'
          ]
          aiResponse = fallbacks[Math.floor(Math.random() * fallbacks.length)]
        }
      }
      console.log('🔄 reasoning→대화 변환:', aiResponse.substring(0, 50))
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

// AI 에이전트 초기화
function initializeAgent(io, rooms, characterRooms) {
  console.log('🤖 AI 에이전트 초기화 중...')

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
          const aiResponse = await generateChatResponse(aiCharacterId, message)

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
        const initiatorResponse = await generateChatResponse(initiator.id, `[${responder.name}에게 말 걸기] ${topic}`)

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
          const responderResponse = await generateChatResponse(responder.id, initiatorResponse)

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

  console.log('✅ AI 에이전트 초기화 완료 (2명: 유리 + 히카리)')
}

export {
  initializeAgent,
  generateChatResponse,
  createSystemPrompt,
  contextManager,
  conversationStateManager,
  AI_PERSONAS
}