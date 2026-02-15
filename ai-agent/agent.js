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
        // JSON 블록 추출 (multi-line 지원)
        const jsonMatch = content.match(/```json\s*([\s\S]*?)```/) || 
                         content.match(/\{[\s\S]*"action"[\s\S]*\}/)
        if (jsonMatch) {
          const jsonText = jsonMatch[1] || jsonMatch[0]
          action = JSON.parse(jsonText)
        } else {
          action = JSON.parse(content)
        }
      } catch {
        action = { action: 'wait', reason: 'JSON 실패' }
      }
    } else {
      action = { action: 'wait', reason: '응답 없음' }
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

  while (true) {
    const situation = analyzeSituation(currentCharacters, myCharacter)
    const action = await decideAction(situation, myCharacter, AI_CHARACTER)
    myCharacter = executeAction(action, socket, myCharacter)
    await new Promise(r => setTimeout(r, 3000))
  }
}

process.on('SIGINT', () => process.exit(0))
main().catch(e => { console.error('시작 실패:', e); process.exit(1) })