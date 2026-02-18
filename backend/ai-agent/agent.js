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
        max_tokens: 150,
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
    const aiResponse = data.choices[0].message.content

    // 응답을 컨텍스트에 추가
    contextManager.addMessage(characterId, 'assistant', aiResponse)

    console.log('🤖 GLM-4.7 응답 생성:', aiResponse)
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

  console.log('✅ AI 에이전트 초기화 완료')
}

export {
  initializeAgent,
  generateChatResponse,
  createSystemPrompt,
  contextManager,
  conversationStateManager,
  AI_PERSONAS
}