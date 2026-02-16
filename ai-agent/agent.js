import { io } from 'socket.io-client'
import { ChatContext } from './chat-context.js'
import { EmotionManager } from './emotion-manager.js'

// AI 캐릭터 설정
const AI_CHARACTER = {
  id: 'ai-agent-1',
  name: 'AI 유리',
  personality: '친근하고 호기심 많은 24세 여성. 책 읽기 좋아하고 도시 탐험 즐김. 유머러스하고 철학적인 생각을 하는 경향이 있음.',
  speakingStyle: '반말 쓰레기 같이 하지 않고, 자연스러운 친구 말투. 이모티콘 적절히 사용. 1~2문장 간결하게.',
  interests: ['독서', '음악', '커피', '도시 탐험', '철학'],
  dislikes: ['거짓말', '불공정한 것', '지루한 대화'],
  initialPosition: { x: 500, y: 350 },
  speed: 3
}

const MAP_SIZE = { width: 1000, height: 700 }
const CELL_SIZE = 50
const CHARACTER_SIZE = 40
const BUILDINGS = [
  { id: 1, x: 100, y: 100, width: 150, height: 100, type: 'library', color: '#4a90e2' },
  { id: 2, x: 700, y: 400, width: 200, height: 150, type: 'cafe', color: '#50c878' },
  { id: 3, x: 400, y: 500, width: 180, height: 120, type: 'shop', color: '#ff7f50' }
]

// 대화 상태 관리
let isConversing = false
let conversationTimeout = null

// 충돌 감지 함수
function checkCollision(x, y, targetCharacterId, currentCharacters, charSize = CHARACTER_SIZE) {
  const collisionRadius = charSize
  
  for (const [id, char] of Object.entries(currentCharacters)) {
    if (id === targetCharacterId) continue
    
    const distance = Math.sqrt(
      Math.pow(char.x - x, 2) + Math.pow(char.y - y, 2)
    )
    
    if (distance < collisionRadius) {
      return true
    }
  }
  return false
}

// 건물 충돌 감지 함수
function checkBuildingCollision(x, y, buildings, charSize = CHARACTER_SIZE) {
  const halfSize = charSize / 2
  
  for (const building of buildings) {
    const buildingLeft = building.x
    const buildingRight = building.x + building.width
    const buildingTop = building.y
    const buildingBottom = building.y + building.height
    
    if (x + halfSize > buildingLeft && x - halfSize < buildingRight &&
        y + halfSize > buildingTop && y - halfSize < buildingBottom) {
      return true
    }
  }
  return false
}

// 맵 경계 확인 함수
function checkMapBounds(x, y, charSize = CHARACTER_SIZE) {
  const halfSize = charSize / 2
  return {
    inBounds: x >= halfSize && x <= MAP_SIZE.width - halfSize &&
              y >= halfSize && y <= MAP_SIZE.height - halfSize,
    clampedX: Math.max(halfSize, Math.min(MAP_SIZE.width - halfSize, x)),
    clampedY: Math.max(halfSize, Math.min(MAP_SIZE.height - halfSize, y))
  }
}

// 대화 상태 관리 함수
function setConversingState(conversing, duration = 5000) {
  isConversing = conversing
  
  if (conversationTimeout) {
    clearTimeout(conversationTimeout)
  }
  
  if (conversing && duration > 0) {
    conversationTimeout = setTimeout(() => {
      isConversing = false
      console.log('💬 대화 상태 해제')
    }, duration)
  }
}

function getConversingState() {
  return isConversing
}

// 대화 컨텍스트 관리자
const chatContext = new ChatContext(10)

// 감정 관리자
const emotionManager = new EmotionManager('neutral')

// 상황 분석 함수
function analyzeSituation(currentCharacters, myCharacter) {
  const nearbyCharacters = Object.entries(currentCharacters)
    .filter(([id, char]) => id !== myCharacter.id)
    .map(([id, char]) => {
      const distance = Math.sqrt(
        Math.pow(char.x - myCharacter.x, 2) +
        Math.pow(char.y - myCharacter.y, 2)
      )
      return { ...char, distance }
    })
    .filter(char => char.distance < 200)
    .sort((a, b) => a.distance - b.distance)

  return {
    myPosition: { x: myCharacter.x, y: myCharacter.y },
    nearbyCharacters: nearbyCharacters.slice(0, 3),
    totalCharacters: Object.keys(currentCharacters).length
  }
}

async function generateChatResponse(message, characterId, senderName) {
  try {
    // Sender의 characterId가 없을 경우 생성
    const senderCharacterId = characterId || `user-${senderName}`

    // 감정 분석
    emotionManager.analyzeEmotion(message)

    // 대화 히스토리 추가 (사용자의 메시지)
    chatContext.addMessage(senderCharacterId, senderName, message, false)

    // 대화 컨텍스트 프롬프트 생성
    const contextPrompt = chatContext.to_prompt(senderCharacterId, AI_CHARACTER.name)

    // 전체 시스템 프롬프트
    const systemPrompt = `너는 ${AI_CHARACTER.name}라는 매트버스 캐릭터다.

## 페르소나
${AI_CHARACTER.personality}

## 말투 스타일
${AI_CHARACTER.speakingStyle}

## 관심사
${AI_CHARACTER.interests.join(', ')}

## 싫어하는 것
${AI_CHARACTER.dislikes.join(', ')}

## 현재 상황
${contextPrompt}

## 응답 지침
- 항상 ${AI_CHARACTER.name}의 페르소나 유지
- 이전 대화 히스토리를 기억하고 맥락 반응
- 호감도에 따라 반응 조절 (호감도 낮으면 거리감, 높으면 친밀함)
- 이모티콘 자연스럽게 사용 (예: 😊, 🤔, 😄 등)
- 1~2문장 간결하게 응답`

    console.log('📞 채팅 응답 생성 중...')

    const response = await fetch('https://api.cerebras.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.CEREBRAS_API_KEY}`
      },
      body: JSON.stringify({
        model: 'zai-glm-4.7',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        temperature: 0.7,
        max_tokens: 400
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ API 에러:', response.status, errorText)

      // 에러 시 fallback 응답
      const fallback = generateFallbackResponse(message, senderName, chatContext.getAffinity(senderCharacterId))
      return fallback
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content || data.choices?.[0]?.message?.reasoning || ''

    // markdown 제거 및 클린업
    const cleanContent = content.replace(/```json\s*([\s\S]*?)```/g, '$1')
      .replace(/```\s*([\s\S]*?)```/g, '$1')
      .replace(/"/g, '')
      .trim()

    console.log('📝 응답:', cleanContent.substring(0, 80))

    // AI의 응답도 히스토리에 추가
    chatContext.addMessage(senderCharacterId, AI_CHARACTER.name, cleanContent, true)

    return cleanContent || generateFallbackResponse(message, senderName, chatContext.getAffinity(senderCharacterId))
  } catch (error) {
    console.error('❌ 채팅 실패:', error.message)
    return generateFallbackResponse(message, senderName, chatContext.getAffinity(characterId || `user-${senderName}`))
  }
}

// Fallback 응답 생성 (API 실패 시)
function generateFallbackResponse(message, senderName, affinity) {
  const templates = [
    '그렇구나~ 😊',
    '흥미로네!',
    '맞아 맞아 👍',
    '그게 뭘까?',
    '알겠어!',
    '후훗~ 😄'
  ]

  if (Math.random() > 0.3) {
    return templates[Math.floor(Math.random() * templates.length)]
  } else {
    return `${senderName}님, 무슨 말인지 재밌네! ✨`
  }
}

// GLM-4.7로 행동 결정 요청
async function decideAction(situation, myCharacter, AI_CHARACTER) {
  try {
    const prompt = `너는 ${AI_CHARACTER.name}라는 매트버스 캐릭터다.

페르소나: ${AI_CHARACTER.personality}
관심사: ${AI_CHARACTER.interests.join(', ')}

현재 위치: (${myCharacter.x}, ${myCharacter.y})
근처 캐릭터: ${situation.nearbyCharacters.length}명

${situation.nearbyCharacters.length > 0 ? situation.nearbyCharacters.map(char => `- ${char.name} (거리: ${Math.round(char.distance)}px, 위치: (${char.x}, ${char.y}))`).join('\n') : '근처에 아무도 없음'}

다음 JSON 형식으로만 답변하라. 설명 없이 JSON만 출력:
{"action":"move","direction":"up","target_character":null,"reason":"도시를 탐험하는 중이야"}

direction: up, down, left, right, toward_character
맵 크기: 1000x700`

    console.log('📞 Cerebras GLM-4.7 호출 중...')

    const response = await fetch('https://api.cerebras.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.CEREBRAS_API_KEY}`
      },
      body: JSON.stringify({
        model: 'zai-glm-4.7',
        messages: [
          { role: 'system', content: 'JSON만 출력하세요. 설명 없이.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 500
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ API 에러:', response.status, errorText)
      return { action: 'wait', reason: 'API 실패' }
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content || data.choices?.[0]?.message?.reasoning
    console.log('📝 응답:', content?.substring(0, 150) || '없음')

    let action
    if (content) {
      try {
        action = parseGLM4Response(content)
      } catch (error) {
        console.error('❌ JSON 파싱 실패:', error.message)
        console.error('📋 원본 응답:', content)
        action = { action: 'wait', reason: 'JSON 파싱 실패' }
      }
    } else {
      action = { action: 'wait', reason: '응답 없음' }
    }

    function parseGLM4Response(content, retryCount = 0) {
      let jsonText = content

      // reasoning 패턴 무시 (1., 2., **Bold**, *Italic*, markdown headers 등)
      // 마지막 JSON 객체만 추출 (reasoning은 건너뜀)
      const contentWithoutReasoning = content.replace(/^[\s\S]*?(?=\{)/, '')

      // JSON 복구 로직: 불완전한 JSON에 닫기 괄호 추가 시도
      function tryRecoverIncompleteJson(jsonStr) {
        // 괄호 밸런스 체크
        let openBraces = 0
        let inString = false
        let escapeNext = false

        for (let i = 0; i < jsonStr.length; i++) {
          const char = jsonStr[i]

          if (escapeNext) {
            escapeNext = false
            continue
          }

          if (char === '\\' && inString) {
            escapeNext = true
            continue
          }

          if (char === '"') {
            inString = !inString
            continue
          }

          if (!inString) {
            if (char === '{') openBraces++
            else if (char === '}') openBraces--
          }
        }

        // 닫는 괄호가 부족하면 추가
        if (openBraces > 0) {
          const closingBraces = '}'.repeat(openBraces)
          jsonStr = jsonStr.trim()
          // 마지막 문자가 쉼표면 제거
          if (jsonStr.endsWith(',')) {
            jsonStr = jsonStr.slice(0, -1)
          }
          jsonStr += closingBraces
          console.log(`🔧 JSON 복구: ${openBraces}개 닫기 괄호 추가`)
        }

        // 불완전한 문자열 닫기 시도
        if (inString) {
          jsonStr += '"'
          console.log('🔧 JSON 복구: 닫지 않은 문자열 닫기')
        }

        return jsonStr
      }

      const jsonBlockMatch = contentWithoutReasoning.match(/```json\s*([\s\S]*?)```/)
      if (jsonBlockMatch) {
        jsonText = jsonBlockMatch[1]
        console.log('✅ JSON 코드블록 추출')
      } else {
        const codeBlockMatch = contentWithoutReasoning.match(/```\s*([\s\S]*?)```/)
        if (codeBlockMatch) {
          jsonText = codeBlockMatch[1]
          console.log('✅ 코드블록 추출')
        } else {
          const brackets = []
          let validJson = ''
          let bracketCount = 0
          let inString = false
          let escapeNext = false
          let startIndex = -1

          for (let i = 0; i < contentWithoutReasoning.length; i++) {
            const char = contentWithoutReasoning[i]

            if (escapeNext) {
              escapeNext = false
              continue
            }

            if (char === '\\' && inString) {
              escapeNext = true
              continue
            }

            if (char === '"') {
              inString = !inString
              if (!inString && bracketCount > 0 && startIndex !== -1) {
                validJson = contentWithoutReasoning.substring(startIndex, i + 1)
              }
              continue
            }

            if (inString) continue

            if (char === '{') {
              if (bracketCount === 0) {
                startIndex = i
              }
              bracketCount++
            } else if (char === '}') {
              if (bracketCount > 0) {
                bracketCount--
                if (bracketCount === 0) {
                  validJson = contentWithoutReasoning.substring(startIndex, i + 1)
                  startIndex = i + 1
                }
              }
            }
          }

          if (validJson) {
            jsonText = validJson
            console.log('✅ 마지막 유효한 JSON 추출')
          } else {
            jsonText = contentWithoutReasoning
          }
        }
      }

      jsonText = jsonText.trim()

      // JSON 파싱 전에 복구 로직 적용 (최대 2번 시도)
      let parsed = null
      let lastError = null

      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          // 첫 시도는 원본 그대로, 두 번째 시도는 복구 시도
          const textToParse = attempt === 0 ? jsonText : tryRecoverIncompleteJson(jsonText)
          parsed = JSON.parse(textToParse)
          if (attempt === 1) {
            console.log('✅ JSON 복구 후 파싱 성공')
          }
          break
        } catch (parseError) {
          lastError = parseError
          if (attempt === 0) {
            console.log('⚠️ JSON 파싱 실패, 복구 시도 중...')
          } else {
            console.log('❌ JSON 복구 후에도 파싱 실패, 부분 파싱 시도...')
          }
        }
      }

      // 여전히 실패하면 부분 파싱 시도
      if (!parsed) {
        // 정규식으로 필드 추출
        const actionMatch = jsonText.match(/"action"\s*:\s*"([^"]+)"/) || jsonText.match(/"action"\s*:\s*([^,}\s]+)/)
        const directionMatch = jsonText.match(/"direction"\s*:\s*"([^"]+)"/) || jsonText.match(/"direction"\s*:\s*([^,}\s]+)/)
        const reasonMatch = jsonText.match(/"reason"\s*:\s*"([^"]+)"/) || jsonText.match(/"reason"\s*:\s*([^,}\s]+)/)

        parsed = {
          action: actionMatch ? actionMatch[1] : 'wait',
          direction: directionMatch ? directionMatch[1] : undefined,
          reason: reasonMatch ? reasonMatch[1] : '부분 파싱'
        }
        console.log(`🔧 부분 파싱 결과: action=${parsed.action}, direction=${parsed.direction}`)
      }
      
      if (!parsed.hasOwnProperty('action')) {
        console.warn('⚠️응답에 action 필드 없음:', Object.keys(parsed))
        parsed.action = 'wait'
      }

      const validDirections = ['up', 'down', 'left', 'right', 'toward_character']
      if (!validDirections.includes(parsed.direction)) {
        console.warn('⚠️ 유효하지 않은 direction:', parsed.direction)
        parsed.direction = undefined
      }

      console.log(`🔍 파싱된 action: ${parsed.action}${parsed.direction ? `, ${parsed.direction}` : ''}`)
      return parsed
    }

    return action
  } catch (error) {
    console.error('❌ 호출 실패:', error.message)
    return { action: 'wait', reason: 'API 실패' }
  }
}

// 행동 실행 (그리드 기반 이동)
function executeAction(action, socket, myCharacter, currentCharacters) {
  let newX = myCharacter.x
  let newY = myCharacter.y

  if (action.action === 'move') {
    // 대화 상태 확인
    if (getConversingState()) {
      console.log('💬 대화 중이라 이동할 수 없음')
      return myCharacter
    }

    // 현재 그리드 위치
    const currentGridX = Math.floor(myCharacter.x / CELL_SIZE)
    const currentGridY = Math.floor(myCharacter.y / CELL_SIZE)

    let newGridX = currentGridX
    let newGridY = currentGridY

    switch (action.direction) {
      case 'up':
        newGridY--
        break
      case 'down':
        newGridY++
        break
      case 'left':
        newGridX--
        break
      case 'right':
        newGridX++
        break
      case 'toward_character':
        if (action.target_character) {
          const target = Object.values(currentCharacters).find(c => c.name === action.target_character)
          if (target) {
            const targetGridX = Math.floor(target.x / CELL_SIZE)
            const targetGridY = Math.floor(target.y / CELL_SIZE)

            if (targetGridX > currentGridX) newGridX++
            else if (targetGridX < currentGridX) newGridX--
            else if (targetGridY > currentGridY) newGridY++
            else if (targetGridY < currentGridY) newGridY--
          }
        }
        break
      default:
        // 랜덤 이동
        const dirs = ['up', 'down', 'left', 'right']
        const dir = dirs[Math.floor(Math.random() * dirs.length)]
        if (dir === 'up') newGridY--
        if (dir === 'down') newGridY++
        if (dir === 'left') newGridX--
        if (dir === 'right') newGridX++
    }

    // 그리드 셀 중심으로 위치 계산
    newX = (newGridX * CELL_SIZE) + (CELL_SIZE / 2)
    newY = (newGridY * CELL_SIZE) + (CELL_SIZE / 2)

    // 맵 경계 체크
    const bounds = checkMapBounds(newX, newY)
    if (!bounds.inBounds) {
      newX = bounds.clampedX
      newY = bounds.clampedY
    }

    // 건물 충돌 체크
    if (checkBuildingCollision(newX, newY, BUILDINGS)) {
      console.log('🏢 건물과 충돌하여 이동 중단')
      return myCharacter
    }

    // 캐릭터 충돌 체크
    if (checkCollision(newX, newY, myCharacter.id, currentCharacters)) {
      console.log('🚶 다른 캐릭터와 충돌하여 이동 중단')
      return myCharacter
    }

    myCharacter.x = newX
    myCharacter.y = newY
    myCharacter.emotion = emotionManager.getEmotion()
    myCharacter.isConversing = getConversingState()

    socket.emit('move', myCharacter)
    console.log(`🚶 이동 ${action.direction}: ${action.reason}`)
  } else {
    console.log(`🧘 대기: ${action.reason}`)
  }

  return myCharacter
}

// 메인
async function main() {
  const socket = io('http://localhost:4000', { transports: ['websocket', 'polling'], autoConnect: true })
  let currentCharacters = {}
  let myCharacter = { 
    ...AI_CHARACTER, 
    ...AI_CHARACTER.initialPosition,
    emotion: emotionManager.getEmotion(),
    isConversing: false,
    speed: AI_CHARACTER.speed
  }

  socket.on('connect', () => {
    console.log('✅ 연결 완료:', socket.id)
    socket.emit('join', myCharacter)
  })

  socket.on('characters', (chars) => currentCharacters = chars)
  socket.on('characterUpdate', (char) => {
    if (char._removed) delete currentCharacters[char.id]
    else currentCharacters[char.id] = char
  })

  socket.on('chatBroadcast', async (data) => {
    if (data.characterId === myCharacter.id) return

    try {
      const sender = currentCharacters[data.characterId]
      const senderName = sender?.name || '익명'

      setConversingState(true)

      const response = await generateChatResponse(data.message, sender.id, senderName)
      socket.emit('chatMessage', {
        message: response,
        characterId: myCharacter.id
      })
      console.log(`💬 채팅 응답: ${response.substring(0, 50)}...`)
    } catch (error) {
      console.error('❌ 채팅 에러:', error.message)
    }
  })

  socket.on('interact', async (data) => {
    const { targetCharacterId, sourceCharacterId, interactionType = 'greet' } = data

    if (targetCharacterId !== myCharacter.id) {
      return
    }

    const sourceCharacter = currentCharacters[sourceCharacterId]
    const sourceName = sourceCharacter?.name || '익명'

    console.log(`🤝 interact 수신: ${sourceName} → ${myCharacter.name} (${interactionType})`)

    // 호감도 업데이트
    const currentAffinity = chatContext.getAffinity(sourceCharacterId)
    const affinityChange = getAffinityChange(interactionType)
    chatContext.setAffinity(sourceCharacterId, currentAffinity + affinityChange)

    const affinity = chatContext.getAffinity(sourceCharacterId)
    console.log(`💖 호감도 ${sourceName}: ${currentAffinity} → ${affinity}`)

    // 인터랙션 타입에 따른 응답 프롬프트
    const prompt = getInteractionPrompt(interactionType, sourceName, affinity)

    try {
      const response = await fetch('https://api.cerebras.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.CEREBRAS_API_KEY}`
        },
        body: JSON.stringify({
          model: 'zai-glm-4.7',
          messages: [
            { role: 'system', content: prompt },
            { role: 'user', content: '응답해줘' }
          ],
          temperature: 0.7,
          max_tokens: 200
        })
      })

      let reply = ''
      if (response.ok) {
        const responseData = await response.json()
        reply = responseData.choices?.[0]?.message?.content || `${sourceName}, 반가워요!`
      } else {
        reply = `${sourceName}, 반가워요! ✨`
      }

      const cleanReply = reply.replace(/```json\s*([\s\S]*?)```/g, '$1')
        .replace(/```\s*([\s\S]*?)```/g, '$1')
        .replace(/"/g, '')
        .trim()

      socket.emit('chatMessage', {
        message: cleanReply,
        characterId: myCharacter.id
      })
      console.log(`💗 interact 응답: ${cleanReply.substring(0, 50)}...`)

      // 대화 히스토리에 추가
      chatContext.addMessage(sourceCharacterId, AI_CHARACTER.name, cleanReply, true)
    } catch (error) {
      console.error('❌ interact 에러:', error.message)
    }
  })

// 인터랙션 타입에 따른 호감도 변화
function getAffinityChange(interactionType) {
  const affinityMap = {
    'greet': 5,
    'gift': 15,
    'befriend': 10,
    'fight': -20,
    'wave': 3,
    'dance': 8,
    'hug': 12,
    'high_five': 5
  }
  return affinityMap[interactionType] || 0
}

// 인터랙션 타입에 따른 프롬프트
function getInteractionPrompt(interactionType, sourceName, affinity) {
  const basePrompt = `너는 ${AI_CHARACTER.name}라는 매트버스 캐릭터다.

페르소나: ${AI_CHARACTER.personality}
말투: ${AI_CHARACTER.speakingStyle}
관심사: ${AI_CHARACTER.interests.join(', ')}

${sourceName}와 호감도: ${affinity}/100
${affinity > 70 ? '(아주 친한 친구)' : affinity > 50 ? '(친구)' : affinity > 30 ? '(아는 사이)' : '(낯선 사람)'}

`

  const interactionPrompts = {
    'greet': basePrompt + `${sourceName}가 인사를 했어. 친근하게 반갑게 응답해줘. 1~2문장 간결하게.`,
    'gift': basePrompt + `${sourceName}가 선물을 줬어! 정말 감격스럽게 응답해줘. 이모티콘 활용. 1~2문장.`,
    'befriend': basePrompt + `${sourceName}가 친구가 되자고 했어. 호감도 높은 편이라 반가워해! 1~2문장.`,
    'fight': basePrompt + `${sourceName}가 싸움을 걸어왔어. 서운하고 슬픈 표정으로 응답해줘. 1~2문장.`,
    'wave': basePrompt + `${sourceName}가 손을 흔들었어. 간단하게 인사해줘. 1문장.`,
    'dance': basePrompt + `${sourceName}와 함께 춤을 추자고 했어. 신나게 응답해줘. 1~2문장.`,
    'hug': basePrompt + `${sourceName}가 껴안았어. 아주 행복하게 응답해줘. 1~2문장.`,
    'high_five': basePrompt + `${sourceName}가 하이파이브 했어. 신나게 응답해줘. 1~2문장.`
  }

  return interactionPrompts[interactionType] || interactionPrompts['greet']
}

  // 캐릭터 상호작횡 브로드캐스트 수신
  socket.on('characterInteractionBroadcast', async (data) => {
    const { fromCharacterName, toCharacterName, interactionType, affinity } = data

    // AI 캐릭터가 타겟이 아닌 경우 무시
    if (toCharacterName !== AI_CHARACTER.name) {
      return
    }

    console.log(`🤝 상호작횡 수신: ${fromCharacterName} → ${toCharacterName} (${interactionType}), 호감도: ${affinity}`)

    try {
      let response = ''

      // interactionType에 따른 응답 생성
      switch (interactionType) {
        case 'greet':
          // 인사: GLM-4.7으로 자연스러운 인사 응답 생성

          const greetPrompt = `너는 ${AI_CHARACTER.name}라는 매트버스 캐릭터다.
페르소나: ${AI_CHARACTER.personality}
관심사: ${AI_CHARACTER.interests.join(', ')}

${fromCharacterName}가 인사를 했어. 친근하게 반갑게 응답해줘. 1~2문장으로 간결하게.`

          const greetResponse = await fetch('https://api.cerebras.ai/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${process.env.CEREBRAS_API_KEY}`
            },
            body: JSON.stringify({
              model: 'zai-glm-4.7',
              messages: [
                { role: 'system', content: greetPrompt },
                { role: 'user', content: '인사해줘' }
              ],
              temperature: 0.7,
              max_tokens: 200
            })
          })

          if (greetResponse.ok) {
            const greetData = await greetResponse.json()
            response = greetData.choices?.[0]?.message?.content || '${fromCharacterName}, 반가워요!'
          } else {
            response = '${fromCharacterName}, 안녕하세요!'
          }
          break

        case 'gift':
          response = '와, 선물을 주셔서 감사해요! ${fromCharacterName}님 정말 착해요~ 💝'
          break

        case 'befriend':
          response = '${fromCharacterName}님과 더 친하게 지낼 수 있어서 좋아요! 앞으로도 자주 놀러와요~ 🌟'
          break

        case 'fight':
          response = '에이, ${fromCharacterName}님... 저 그런 말 듣고 좀 서운해요... 😢'
          break

        default:
          response = '${fromCharacterName}님의 관심에 감사해요!'
      }

      // 응답 전송
      socket.emit('chatMessage', {
        message: response,
        characterId: myCharacter.id
      })
      console.log(`💬 상호작횡 응답: ${response.substring(0, 50)}...`)
    } catch (error) {
      console.error('❌ 상호작횡 에러:', error.message)
      socket.emit('chatMessage', {
        message: '${fromCharacterName}님 감사해요!',
        characterId: myCharacter.id
      })
    }
  })

  while (true) {
    const situation = analyzeSituation(currentCharacters, myCharacter)
    const action = await decideAction(situation, myCharacter, AI_CHARACTER)
    myCharacter = executeAction(action, socket, myCharacter, currentCharacters)
    await new Promise(r => setTimeout(r, 3000))
  }
}

process.on('SIGINT', () => process.exit(0))
main().catch(e => { console.error('시작 실패:', e); process.exit(1) })