import { useState, useEffect, useRef } from 'react'
import { socket } from './socket'
import './App.css'
import GameCanvas from './components/GameCanvas'
import InteractionMenu from './components/InteractionMenu'
import AffinityDisplay from './components/AffinityDisplay'
import ChatInput from './components/ChatInput'
import RoomMenu from './components/RoomMenu'
import Toast from './components/Toast'
import { useSocketEvent } from './hooks/useSocketEvent'
import { getAffinityColor } from './utils/characterUtils'

const MAP_SIZE = { width: 1000, height: 700 }
const CHARACTER_SIZE = 40
const CELL_SIZE = 50

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
  const [chatInput, setChatInput] = useState('')
  const [affinities, setAffinities] = useState({})
  const [rooms, setRooms] = useState([])
  const [currentRoom, setCurrentRoom] = useState({ id: 'main', name: '메인 광장' })
  const [showRoomMenu, setShowRoomMenu] = useState(false)
  const [newRoomName, setNewRoomName] = useState('')
  const [interactionMenu, setInteractionMenu] = useState({
    show: false,
    targetCharacter: null,
    x: 0,
    y: 0
  })

  const [roomChatHistory, setRoomChatHistory] = useState({})
  const [showChatHistory, setShowChatHistory] = useState(false)
  const [affinityDisplay, setAffinityDisplay] = useState({
    show: false,
    x: 0,
    y: 0,
    data: null
  })

  const [clickEffects, setClickEffects] = useState([])

  const [toast, setToast] = useState({
    show: false,
    message: '',
    type: 'info'
  })

  const canvasRef = useRef(null)

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [myCharacter.id])

  useSocketEvent('characters', (allCharacters) => {
    setCharacters(prev => {
      const newChars = { ...prev }
      Object.entries(allCharacters).forEach(([id, char]) => {
        if (char.id !== myCharacter.id) {
          newChars[id] = char
        }
      })
      return newChars
    })
  }, [myCharacter.id])

  useSocketEvent('characterUpdate', (char) => {
    if (char.id !== myCharacter.id) {
      setCharacters(prev => ({
        ...prev,
        [char.id]: char
      }))
    }
  }, [myCharacter.id])

  useSocketEvent('chatBroadcast', (chatData) => {
    const { characterId, characterName, message, timestamp, roomId } = chatData
    const targetRoomId = roomId || currentRoom.id
    setChatMessages(prev => ({
      ...prev,
      [characterId]: {
        message,
        timestamp
      }
    }))

    setRoomChatHistory(prev => {
      const roomHistory = prev[targetRoomId] || []
      const newHistory = [
        ...roomHistory,
        {
          characterId,
          characterName,
          message,
          timestamp: timestamp || Date.now()
        }
      ].slice(-50)
      return {
        ...prev,
        [targetRoomId]: newHistory
      }
    })

    setTimeout(() => {
      setChatMessages(prev => {
        const newMessages = { ...prev }
        if (newMessages[characterId]?.message === message) {
          delete newMessages[characterId]
        }
        return newMessages
      })
    }, 3000)
  }, [currentRoom.id])

  useSocketEvent('chatHistory', (data) => {
    const { roomId, history } = data || {}
    const targetRoomId = roomId || currentRoom.id
    console.log('채팅 히스토리 수신:', targetRoomId, history.length, '개')
    setRoomChatHistory(prev => ({
      ...prev,
      [targetRoomId]:history
    }))
  }, [currentRoom.id])

  useSocketEvent('characterInteractionBroadcast', (data) => {
    const { fromCharacterName, toCharacterName, interactionType, affinity } = data

    setAffinities(prev => ({
      ...prev,
      [data.fromCharacterId]: {
        ...prev[data.fromCharacterId],
        [data.toCharacterId]: affinity
      }
    }))

    const messages = {
      greet: '👋 인사',
      gift: '🎁 선물',
      befriend: '🤝 친하기',
      fight: '⚔️ 싸우기'
    }

    const message = `${fromCharacterName}님이 ${toCharacterName}님에게 ${messages[interactionType] || interactionType}`

    setToast({
      show: true,
      message,
      type: interactionType === 'fight' ? 'warning' : 'success'
    })

    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }))
    }, 3000)

    console.log('상호작션:', data)
  }, [])

  useSocketEvent('affinities', (affinityData) => {
    setAffinities(affinityData)
    console.log('호감도 데이터 수신:', affinityData)
  }, [])

  useSocketEvent('rooms', (roomsData) => {
    setRooms(roomsData)
    console.log('방 목록 수신:', roomsData)
  }, [])

  useSocketEvent('roomJoined', (data) => {
    const { roomId, history } = data
    if (history && !roomChatHistory[roomId]) {
      setRoomChatHistory(prev => ({
        ...prev,
        [roomId]: history
      }))
    }
  }, [])

  useEffect(() => {
    socket.emit('join', myCharacter)
  }, [])

  const sendChatMessage = (message) => {
    if (message.trim()) {
      socket.emit('chatMessage', {
        message: message.trim(),
        characterId: myCharacter.id,
        roomId: currentRoom.id
      })
    }
  }

  const handleChatSubmit = () => {
    if (chatInput.trim()) {
      sendChatMessage(chatInput)
      setChatInput('')
    }
  }

  const handleChatKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleChatSubmit()
    }
  }

  const handleCreateRoom = () => {
    if (newRoomName.trim()) {
      const roomId = `room-${Date.now()}`
      socket.emit('createRoom', {
        roomId,
        name: newRoomName
      })
      setNewRoomName('')
      setShowRoomMenu(false)
    }
  }

  const handleChangeRoom = (roomId) => {
    socket.emit('changeRoom', {
      characterId: myCharacter.id,
      newRoomId: roomId
    })
    const room = rooms.find(r => r.id === roomId)
    if (room) {
      setCurrentRoom(room)
    }
    setShowRoomMenu(false)
    setCharacters({})
    
    if (!roomChatHistory[roomId]) {
      socket.emit('getChatHistory', { roomId })
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'h' || e.key === 'H') {
      setShowChatHistory(prev => !prev)
    }
  }

  const handleInteractionClick = (type) => {
    if (interactionMenu.targetCharacter) {
      const typeMapping = {
        greeting: 'greet',
        gift: 'gift',
        friend: 'befriend',
        fight: 'fight'
      }

      socket.emit('characterInteraction', {
        fromCharacterId: myCharacter.id,
        toCharacterId: interactionMenu.targetCharacter.id,
        interactionType: typeMapping[type] || type,
        timestamp: Date.now()
      })
    }
    setInteractionMenu({
      show: false,
      targetCharacter: null,
      x: 0,
      y: 0
    })
  }

  const closeInteractionMenu = () => {
    setInteractionMenu({
      show: false,
      targetCharacter: null,
      x: 0,
      y: 0
    })
  }

  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()

    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY

    const x = clientX - rect.left
    const y = clientY - rect.top

    const container = canvas.parentElement
    const containerWidth = container.clientWidth
    const containerHeight = container.clientHeight
    const scale = Math.min(containerWidth / MAP_SIZE.width, containerHeight / MAP_SIZE.height)

    const clickMapX = x / scale
    const clickMapY = y / scale

    const clickedCharacter = Object.values(characters).find(char => {
      const distance = Math.sqrt(
        Math.pow(char.x - clickMapX, 2) + Math.pow(char.y - clickMapY, 2)
      )
      return distance <= CHARACTER_SIZE / 2
    })

    if (clickedCharacter) {
      socket.emit('interact', {
        targetCharacterId: clickedCharacter.id,
        sourceCharacterId: myCharacter.id
      })

      setClickEffects(prev => [...prev, {
        x: clickedCharacter.x,
        y: clickedCharacter.y,
        timestamp: Date.now(),
        type: 'heart'
      }])

      setTimeout(() => {
        setClickEffects(prev => prev.filter(effect => Date.now() - effect.timestamp > 500))
      }, 500)

      if (!clickedCharacter.isAi) {
        const affinity = affinities[myCharacter.id]?.[clickedCharacter.id] || 0
        setAffinityDisplay({
          show: true,
          x: e.clientX,
          y: e.clientY,
          data: {
            name: clickedCharacter.name,
            affinity: affinity
          }
        })
        setTimeout(() => {
          setAffinityDisplay(prev => ({ ...prev, show: false }))
        }, 3000)
      } else {
        setInteractionMenu({
          show: true,
          targetCharacter: clickedCharacter,
          x: e.clientX,
          y: e.clientY
        })
      }
      return
    }

    closeInteractionMenu()
    setAffinityDisplay({ show: false, x: 0, y: 0, data: null })

    const CELL_SIZE = 50

    const currentGridX = Math.floor(myCharacter.x / CELL_SIZE)
    const currentGridY = Math.floor(myCharacter.y / CELL_SIZE)

    const clickGridX = Math.floor(clickMapX / CELL_SIZE)
    const clickGridY = Math.floor(clickMapY / CELL_SIZE)

    let newGridX = currentGridX
    let newGridY = currentGridY

    if (clickGridX > currentGridX) newGridX++
    else if (clickGridX < currentGridX) newGridX--
    else if (clickGridY > currentGridY) newGridY++
    else if (clickGridY < currentGridY) newGridY--

    const newX = (newGridX * CELL_SIZE) + (CELL_SIZE / 2)
    const newY = (newGridY * CELL_SIZE) + (CELL_SIZE / 2)

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

  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
  }

  

  return (
    <div className="app">
      <div className="header">
        <h1>🧞 AI 라이프 POC</h1>
        <div className="stats">
          <span>나: {myCharacter.name}</span>
          <span>방: {currentRoom.name}</span>
          <span>다른 캐릭터: {Object.keys(characters).length}</span>
          <span>연결 상태: {socket.connected ? '✅' : '❌'}</span>
        </div>
        <div className="room-controls">
          <button
            className="room-button"
            onClick={() => setShowRoomMenu(prev => !prev)}
          >
            🏠 방 ({rooms.length})
          </button>
        </div>
      </div>
      <GameCanvas
        myCharacter={myCharacter}
        characters={characters}
        affinities={affinities}
        chatMessages={chatMessages}
        clickEffects={clickEffects}
        canvasRef={canvasRef}
        onClick={handleCanvasClick}
      />
      <ChatInput
        value={chatInput}
        onChange={(e) => setChatInput(e.target.value)}
        onSubmit={handleChatSubmit}
      />
      <div className="controls">
        <p>🖱️ 클릭해서 캐릭터 이동하기</p>
        <p>⌨️ Enter 키로 채팅 메시지 전송하기</p>
        <p>📋 H 키로 채팅 히스토리 열기/닫기</p>
      </div>

      {showChatHistory && (
        <div className="chat-history-sidebar">
          <div className="chat-history-header">
            <h3>💬 채팅 히스토리</h3>
            <button
              className="chat-history-close"
              onClick={() => setShowChatHistory(false)}
            >
              ✕
            </button>
          </div>
<div className="chat-history-list">
             {roomChatHistory[currentRoom.id]?.length === 0 ? (
               <div className="chat-history-empty">채팅 기록이 없습니다</div>
             ) : (
               roomChatHistory[currentRoom.id]?.map((chat, index) => (
                 <div key={index} className="chat-history-item">
                   <div className="chat-history-meta">
                     <span className="chat-history-name">{chat.characterName}</span>
                     <span className="chat-history-time">{formatTime(chat.timestamp)}</span>
                   </div>
                   <div className="chat-history-message">{chat.message}</div>
                 </div>
               ))
             )}
           </div>
        </div>
      )}

      <AffinityDisplay
        show={affinityDisplay.show}
        x={affinityDisplay.x}
        y={affinityDisplay.y}
        data={affinityDisplay.data}
      />

      <InteractionMenu
        show={interactionMenu.show}
        targetCharacter={interactionMenu.targetCharacter}
        x={interactionMenu.x}
        y={interactionMenu.y}
        onInteraction={handleInteractionClick}
        onClose={closeInteractionMenu}
      />

      <Toast show={toast.show} message={toast.message} type={toast.type} />

      <RoomMenu
        show={showRoomMenu}
        rooms={rooms}
        currentRoom={currentRoom}
        onChangeRoom={handleChangeRoom}
        onClose={() => setShowRoomMenu(false)}
        onCreateRoom={handleCreateRoom}
        newRoomName={newRoomName}
        onNewRoomNameChange={setNewRoomName}
      />
    </div>
  )
}

export default App