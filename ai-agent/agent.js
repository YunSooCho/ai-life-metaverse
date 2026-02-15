import { io } from 'socket.io-client'

// AI 캐릭터 설정
const AI_CHARACTER = {
  id: 'ai-agent-1',
  name: 'AI 유리',
  personality: '친근하고 호기심 많은 24세 여성. 책 읽기 좋아하고 도시 탐험 즐김.',
  interests: ['독서', '음악', '커피', '도시 탐험'],
  initialPosition: { x: 500, y: 350 }
}

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

async function generateChatResponse(message, senderName) {
  try {
    const prompt = `너는 ${AI_CHARACTER.name}라는 매트버스 캐릭터다.

페르소나: ${AI_CHARACTER.personality}
관심사: ${AI_CHARACTER.interests.join(', ')}

${senderName}가 말했다: "${message}"

자연스럽고 친근하게 답변해라. 1~2문장으로 간결하게.`
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
          { role: 'system', content: prompt },
          { role: 'user', content: message }
        ],
        temperature: 0.7,
        max_tokens: 500
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ API 에러:', response.status, errorText)
      return '죄송해요, 지금은 대화하기 어려워요.'
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content || data.choices?.[0]?.message?.reasoning || ''
    
    // markdown 제거
    const cleanContent = content.replace(/```json\s*([\s\S]*?)```/g, '$1')
      .replace(/```\s*([\s\S]*?)```/g, '$1')
      .replace(/"/g, '')
      .trim()
    
    console.log('📝 응답:', cleanContent.substring(0, 50))
    return cleanContent || '응, 그렇구나!'
  } catch (error) {
    console.error('❌ 채팅 실패:', error.message)
    return '죄송해요, 오류가 발생했어요.'
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

    function parseGLM4Response(content) {
      let jsonText = content

      // reasoning 패턴 무시 (1., 2., **Bold**, *Italic*, markdown headers 등)
      // 마지막 JSON 객체만 추출 (reasoning은 건너뜀)
      const contentWithoutReasoning = content.replace(/^[\s\S]*?(?=\{)/, '')

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
      
      const parsed = JSON.parse(jsonText)
      
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
function executeAction(action, socket, myCharacter) {
  const mapSize = { width: 1000, height: 700 }
  const CELL_SIZE = 50

  let newX = myCharacter.x
  let newY = myCharacter.y

  if (action.action === 'move') {
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
    newX = Math.max(CELL_SIZE / 2, Math.min(mapSize.width - CELL_SIZE / 2, newX))
    newY = Math.max(CELL_SIZE / 2, Math.min(mapSize.height - CELL_SIZE / 2, newY))

    myCharacter.x = newX
    myCharacter.y = newY

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
  let myCharacter = { ...AI_CHARACTER, ...AI_CHARACTER.initialPosition }

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

      const response = await generateChatResponse(data.message, senderName)
      socket.emit('chatBroadcast', {
        message: response,
        characterId: myCharacter.id
      })
      console.log(`💬 채팅 응답: ${response.substring(0, 50)}...`)
    } catch (error) {
      console.error('❌ 채팅 에러:', error.message)
    }
  })

  while (true) {
    const situation = analyzeSituation(currentCharacters, myCharacter)
    const action = await decideAction(situation, myCharacter, AI_CHARACTER)
    myCharacter = executeAction(action, socket, myCharacter)
    await new Promise(r => setTimeout(r, 3000))
  }
}

process.on('SIGINT', () => process.exit(0))
main().catch(e => { console.error('시작 실패:', e); process.exit(1) })