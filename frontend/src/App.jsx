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

  const canvasRef = useRef(null)

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

    return () => {
      socket.off('characters')
      socket.off('characterUpdate')
    }
  }, [myCharacter.id])

  // 내 캐릭터 서버에 등록
  useEffect(() => {
    socket.emit('join', myCharacter)
  }, [])

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
  }, [myCharacter, characters])

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
      </div>
    </div>
  )
}

export default App