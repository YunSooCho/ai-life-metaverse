import { useState, useEffect, useRef } from 'react'
import { socket } from './socket'
import './App.css'

const MAP_SIZE = { width: 1000, height: 700 }
const CHARACTER_SIZE = 40

function App() {
  const [myCharacter, setMyCharacter] = useState({
    id: 'player',
    name: '플레이어',
    x: 100,
    y: 100,
    color: '#4CAF50',
    emoji: '👤',
    isAi: false
  })

  const [characters, setCharacters] = useState({})
  const [chatMessages, setChatMessages] = useState({})

  const canvasRef = useRef(null)

  // 키보드 이벤트 리스너
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [myCharacter.id])

  // 소켓 이벤트 리스너
  useEffect(() => {
    // 기존 캐릭터들 수신
    socket.on('characters', (allCharacters) => {
      setCharacters(prev => {
        const newChars = { ...prev }
        Object.entries(allCharacters).forEach(([id, char]) => {
          if (char.id !== myCharacter.id) {
            newChars[id] = char
          }
        })
        return newChars
      })
    })

    // 캐릭터 위치 업데이트
    socket.on('characterUpdate', (char) => {
      if (char.id !== myCharacter.id) {
        setCharacters(prev => ({
          ...prev,
          [char.id]: char
        }))
      }
    })

    // 채팅 브로드캐스트 수신
    socket.on('chatBroadcast', (chatData) => {
      const { characterId, message } = chatData
      setChatMessages(prev => ({
        ...prev,
        [characterId]: message
      }))

      // 3초 후 메시지 제거
      setTimeout(() => {
        setChatMessages(prev => {
          const newMessages = { ...prev }
          if (newMessages[characterId] === message) {
            delete newMessages[characterId]
          }
          return newMessages
        })
      }, 3000)
    })

    // 채팅 히스토리 수신
    socket.on('chatHistory', (history) => {
      console.log('채팅 히스토리 수신:', history.length, '개')
    })

    return () => {
      socket.off('characters')
      socket.off('characterUpdate')
      socket.off('chatBroadcast')
      socket.off('chatHistory')
    }
  }, [myCharacter.id])

  // 내 캐릭터 서버에 등록
  useEffect(() => {
    socket.emit('join', myCharacter)
  }, [])

  // 채팅 메시지 전송
  const sendChatMessage = (message) => {
    if (message.trim()) {
      socket.emit('chatMessage', {
        message: message.trim(),
        characterId: myCharacter.id
      })
    }
  }

  // 키보드 이벤트
  const handleKeyDown = (e) => {
    // Enter 키로 채팅 전송 (간단한 테스트용)
    if (e.key === 'Enter' && !e.shiftKey) {
      const testMessages = ['안녕하세요!', '반가워요~', '어떻게 지내세요?', 'AI와 대화하고 있어요!', '여긴 어디죠?']
      const randomMessage = testMessages[Math.floor(Math.random() * testMessages.length)]
      sendChatMessage(randomMessage)
    }
  }

  // 마우스 클릭으로 이동 (그리드 기반 한칸씩)
  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // 화면 크기에 맞는 스케일 계산
    const container = canvas.parentElement
    const containerWidth = container.clientWidth
    const containerHeight = container.clientHeight
    const scale = Math.min(containerWidth / MAP_SIZE.width, containerHeight / MAP_SIZE.height)

    // 그리드 셀 크기
    const CELL_SIZE = 50

    // 클릭한 위치를 맵 좌표로 스케일링
    const clickMapX = x / scale
    const clickMapY = y / scale

    // 현재 그리드 위치 계산
    const currentGridX = Math.floor(myCharacter.x / CELL_SIZE)
    const currentGridY = Math.floor(myCharacter.y / CELL_SIZE)

    // 클릭한 그리드 위치 계산
    const clickGridX = Math.floor(clickMapX / CELL_SIZE)
    const clickGridY = Math.floor(clickMapY / CELL_SIZE)

    // 한칸씩만 이동 (상하좌우)
    let newGridX = currentGridX
    let newGridY = currentGridY

    if (clickGridX > currentGridX) newGridX++
    else if (clickGridX < currentGridX) newGridX--
    else if (clickGridY > currentGridY) newGridY++
    else if (clickGridY < currentGridY) newGridY--

    // 그리드 셀 중심으로 위치 계산
    const newX = (newGridX * CELL_SIZE) + (CELL_SIZE / 2)
    const newY = (newGridY * CELL_SIZE) + (CELL_SIZE / 2)

    // 맵 경계 체크
    const clampedX = Math.max(CELL_SIZE / 2, Math.min(MAP_SIZE.width - CELL_SIZE / 2, newX))
    const clampedY = Math.max(CELL_SIZE / 2, Math.min(MAP_SIZE.height - CELL_SIZE / 2, newY))

    const updatedCharacter = {
      ...myCharacter,
      x: clampedX,
      y: clampedY
    }

    setMyCharacter(updatedCharacter)
    socket.emit('move', updatedCharacter)
  }

  // 캐릭터 그리기
  const drawCharacter = (ctx, char) => {
    const { x, y, color, emoji, name, isAi } = char

    // 배경 원
    ctx.beginPath()
    ctx.arc(x, y, CHARACTER_SIZE / 2, 0, Math.PI * 2)
    ctx.fillStyle = color
    ctx.fill()
    ctx.strokeStyle = isAi ? '#FF6B6B' : '#4CAF50'
    ctx.lineWidth = 3
    ctx.stroke()

    // 이모지
    ctx.font = `${CHARACTER_SIZE / 2}px Arial`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(emoji, x, y)

    // 이름
    ctx.font = '12px Arial'
    ctx.fillStyle = '#ffffff'
    ctx.fillText(name, x, y - CHARACTER_SIZE / 2 - 8)

    // AI 라벨
    if (isAi) {
      ctx.fillStyle = '#FF6B6B'
      ctx.fillText('🤖', x + CHARACTER_SIZE / 2, y - CHARACTER_SIZE / 2)
    }
  }

  // Canvas 렌더링
  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    // 화면 크기에 맞게 캔버스 크기 조절
    const container = canvas.parentElement
    const containerWidth = container.clientWidth
    const containerHeight = container.clientHeight

    // 화면 비율 유지하며 최대 크기 설정
    const scale = Math.min(containerWidth / MAP_SIZE.width, containerHeight / MAP_SIZE.height)
    const canvasWidth = MAP_SIZE.width * scale
    const canvasHeight = MAP_SIZE.height * scale

    canvas.width = canvasWidth
    canvas.height = canvasHeight

    const CELL_SIZE_SCALED = 50 * scale
    const CHARACTER_SIZE_SCALED = CHARACTER_SIZE * scale

    const render = () => {
      // 배경
      ctx.fillStyle = '#1a1a2e'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // 그리드
      ctx.strokeStyle = '#2a2a4e'
      ctx.lineWidth = 1
      for (let x = 0; x < canvas.width; x += CELL_SIZE_SCALED) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, canvas.height)
        ctx.stroke()
      }
      for (let y = 0; y < canvas.height; y += CELL_SIZE_SCALED) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(canvas.width, y)
        ctx.stroke()
      }

      // 캐릭터 그리기 함수
      const drawCharacter = (char) => {
        // 좌표 스케일링
        const x = char.x * scale
        const y = char.y * scale
        const { color, emoji, name, isAi } = char

        // 배경 원
        ctx.beginPath()
        ctx.arc(x, y, CHARACTER_SIZE_SCALED / 2, 0, Math.PI * 2)
        ctx.fillStyle = color
        ctx.fill()
        ctx.strokeStyle = isAi ? '#FF6B6B' : '#4CAF50'
        ctx.lineWidth = 3
        ctx.stroke()

        // 이모지
        ctx.font = `${CHARACTER_SIZE_SCALED / 2}px Arial`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(emoji, x, y)

        // 이름
        ctx.font = `${12 * scale}px Arial`
        ctx.fillStyle = '#ffffff'
        ctx.fillText(name, x, y - CHARACTER_SIZE_SCALED / 2 - (8 * scale))

        // AI 라벨
        if (isAi) {
          ctx.fillStyle = '#FF6B6B'
          ctx.fillText('🤖', x + CHARACTER_SIZE_SCALED / 2, y - CHARACTER_SIZE_SCALED / 2)
        }

        // Speech bubble 렌더링
        const chatMsg = chatMessages[char.id] || (char.id === myCharacter.id ? chatMessages[myCharacter.id] : null)
        if (chatMsg) {
          const showBubble = chatMessages[char.id] || (char.id === myCharacter.id && chatMessages[myCharacter.id])

          if (showBubble) {
            const messageText = chatMessages[char.id] || chatMessages[myCharacter.id]

            if (messageText) {
              const bubbleMaxWidth = 150 * scale
              const bubblePadding = 8 * scale
              const bubbleFontSize = 12 * scale
              ctx.font = `${bubbleFontSize}px Arial`

              // 텍스트 측정 및 줄바꿈
              const words = messageText.split('')
              const lines = []
              let currentLine = ''

              for (const char of words) {
                const testLine = currentLine + char
                const metrics = ctx.measureText(testLine)

                if (metrics.width > bubbleMaxWidth - (bubblePadding * 2) && currentLine !== '') {
                  lines.push(currentLine)
                  currentLine = char
                } else {
                  currentLine = testLine
                }
              }
              lines.push(currentLine)

              const lineHeight = bubbleFontSize * 1.4
              const bubbleHeight = (lines.length * lineHeight) + (bubblePadding * 2)
              const bubbleWidth = Math.min(
                bubbleMaxWidth,
                Math.max(
                  ctx.measureText(lines[0]).width + (bubblePadding * 2),
                  ...lines.map(line => ctx.measureText(line).width + (bubblePadding * 2))
                )
              )

              const bubbleX = x - (bubbleWidth / 2)
              const bubbleY = y - CHARACTER_SIZE_SCALED - bubbleHeight - (10 * scale)

              // 말풍선 배경
              ctx.fillStyle = '#ffffff'
              ctx.strokeStyle = '#cccccc'
              ctx.lineWidth = 1

              // 말풍선 본체 (둥근 사각형)
              const radius = 8 * scale
              ctx.beginPath()
              ctx.moveTo(bubbleX + radius, bubbleY)
              ctx.lineTo(bubbleX + bubbleWidth - radius, bubbleY)
              ctx.quadraticCurveTo(bubbleX + bubbleWidth, bubbleY, bubbleX + bubbleWidth, bubbleY + radius)
              ctx.lineTo(bubbleX + bubbleWidth, bubbleY + bubbleHeight - radius)
              ctx.quadraticCurveTo(bubbleX + bubbleWidth, bubbleY + bubbleHeight, bubbleX + bubbleWidth - radius, bubbleY + bubbleHeight)
              ctx.lineTo(bubbleX + radius, bubbleY + bubbleHeight)
              ctx.quadraticCurveTo(bubbleX, bubbleY + bubbleHeight, bubbleX, bubbleY + bubbleHeight - radius)
              ctx.lineTo(bubbleX, bubbleY + radius)
              ctx.quadraticCurveTo(bubbleX, bubbleY, bubbleX + radius, bubbleY)
              ctx.closePath()
              ctx.fill()
              ctx.stroke()

              // 말풍선 꼬리
              const tailWidth = 10 * scale
              const tailHeight = 10 * scale
              const tailX = x - (tailWidth / 2)
              const tailY = bubbleY + bubbleHeight

              ctx.beginPath()
              ctx.moveTo(tailX, tailY)
              ctx.lineTo(x, tailY + tailHeight)
              ctx.lineTo(tailX + tailWidth, tailY)
              ctx.closePath()
              ctx.fill()
              ctx.stroke()

              // 텍스트 렌더링
              ctx.fillStyle = '#000000'
              ctx.textAlign = 'center'
              ctx.textBaseline = 'top'

              lines.forEach((line, index) => {
                ctx.fillText(
                  line,
                  x,
                  bubbleY + bubblePadding + (index * lineHeight)
                )
              })
            }
          }
        }
      }

      // 다른 캐릭터들
      Object.values(characters).forEach(char => {
        drawCharacter(char)
      })

      // 내 캐릭터
      drawCharacter(myCharacter)

      requestAnimationFrame(render)
    }

    render()
  }, [myCharacter, characters, chatMessages])

  return (
    <div className="app">
      <div className="header">
        <h1>🧞 AI 라이프 POC</h1>
        <div className="stats">
          <span>나: {myCharacter.name}</span>
          <span>다른 캐릭터: {Object.keys(characters).length}</span>
          <span>연결 상태: {socket.connected ? '✅' : '❌'}</span>
        </div>
      </div>
      <div className="canvas-container">
        <canvas ref={canvasRef} onClick={handleCanvasClick} />
      </div>
      <div className="controls">
        <p>🖱️ 클릭해서 캐릭터 이동하기</p>
        <p>⌨️ Enter 키로 채팅 메시지 전송하기</p>
      </div>
    </div>
  )
}

export default App