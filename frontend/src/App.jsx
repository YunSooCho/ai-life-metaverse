import { useState, useEffect, useRef } from 'react'
import { socket } from './socket'
import './App.css'
import './styles/pixel-theme.css'
import GameCanvas from './components/GameCanvas'
import InteractionMenu from './components/InteractionMenu'
import AffinityDisplay from './components/AffinityDisplay'
import ChatInput from './components/ChatInput'
import RoomMenu from './components/RoomMenu'
import Toast from './components/Toast'
import EventLog from './components/EventLog'
import MiniMap from './components/MiniMap'
import Inventory from './components/Inventory'
import Reward from './components/Reward'
import Quest from './components/Quest'
import LanguageSelector from './components/LanguageSelector'
import SettingsPanel from './components/SettingsPanel'
import CharacterCustomizationModal from './components/CharacterCustomizationModal'
import './components/SettingsPanel.css'
import { useSocketEvent } from './hooks/useSocketEvent'
import { getAffinityColor } from './utils/characterUtils'
import { getOptionEmoji, getColorHex } from './utils/characterCustomization'
import { CUSTOMIZATION_CATEGORIES } from './data/customizationOptions'
import { I18nProvider, useI18n } from './i18n/I18nContext'
import { soundManager, BGM_URLS, SFX_URLS } from './utils/soundManager'

const MAP_SIZE = { width: 1000, height: 700 }
const CHARACTER_SIZE = 40
const CELL_SIZE = 50

function AppContent() {
  const { t, language } = useI18n()

  const [myCharacter, setMyCharacter] = useState({
    id: 'player',
    name: '플레이어',
    x: 125,
    y: 125,
    color: '#4CAF50',
    emoji: '👤',
    isAi: false
  })

  const [characters, setCharacters] = useState({})
  const [buildings, setBuildings] = useState([])
  const [chatMessages, setChatMessages] = useState({})
  const [chatInput, setChatInput] = useState('')
  const [affinities, setAffinities] = useState({})
  const [rooms, setRooms] = useState([])
  const [currentRoom, setCurrentRoom] = useState({ id: 'main', name: '메인 광장' })
  const [showRoomMenu, setShowRoomMenu] = useState(false)
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

  const [activeBuilding, setActiveBuilding] = useState(null)

  const [showEventLog, setShowEventLog] = useState(false)
  const [eventLogs, setEventLogs] = useState([])

  const [inventory, setInventory] = useState({})
  const [showInventory, setShowInventory] = useState(false)
  const [showReward, setShowReward] = useState(false)
  const [claimedRewards, setClaimedRewards] = useState([])
  
  const [quests, setQuests] = useState({})
  const [availableQuests, setAvailableQuests] = useState({})
  const [showQuest, setShowQuest] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showCustomizationModal, setShowCustomizationModal] = useState(false)
  const [characterCustomization, setCharacterCustomization] = useState({
    hairStyle: 'short',
    clothingColor: 'blue',
    accessory: 'none'
  })
  const [weather, setWeather] = useState({ type: 'CLEAR' })

  /**
   * 커스터마이징 저장 핸들러
   */
  const handleCustomizationSave = (savedCustomization) => {
    // 커스터마이징 상태 업데이트
    setCharacterCustomization(savedCustomization)

    // 커스터마이징에 따라 캐릭터 업데이트
    const hairStyle = savedCustomization.hairStyle || 'short'
    const accessory = savedCustomization.accessory || 'none'
    const clothingColor = savedCustomization.clothingColor || 'blue'

    // 이모지 조합 생성
    const hairEmoji = getOptionEmoji(CUSTOMIZATION_CATEGORIES.HAIR_STYLES, hairStyle)
    const accessoryEmoji = getOptionEmoji(CUSTOMIZATION_CATEGORIES.ACCESSORIES, accessory)

    // 캐릭터 색상 업데이트
    const characterColor = getColorHex(clothingColor)

    // myCharacter 업데이트
    setMyCharacter(prev => ({
      ...prev,
      color: characterColor,
      emoji: hairEmoji + accessoryEmoji
    }))

    // 소켓으로 캐릭터 업데이트 전송
    const updatedCharacter = {
      ...myCharacter,
      color: characterColor,
      emoji: hairEmoji + accessoryEmoji
    }
    socket.emit('move', updatedCharacter)

    // 토스트 메시지
    setToast({
      show: true,
      message: '✨ 캐릭터 커스터마이징 저장 완료!',
      type: 'success'
    })

    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }))
    }, 3000)
  }

  const canvasRef = useRef(null)
  const chatHistoryRef = useRef(null)

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [myCharacter])

  useEffect(() => {
    if (chatHistoryRef.current) {
      chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight
    }
  }, [roomChatHistory, currentRoom.id])

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

  useSocketEvent('buildings', (buildingsData) => {
    setBuildings(buildingsData || [])
    console.log('건물 목록 수신:', buildingsData)
  }, [])

  useSocketEvent('buildingEvent', (event) => {
    const messages = {
      enter: '🏢 입장',
      exit: '🚪 퇴장'
    }

    const message = `${event.characterName}님이 ${event.buildingName}에${messages[event.type]}했습니다`

    setToast({
      show: true,
      message,
      type: 'info'
    })

    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }))
    }, 3000)

    console.log('건물 이벤트:', event)
  }, [])

  useSocketEvent('inventory', (data) => {
    setInventory(data.inventory || {})
    console.log('인벤토리 수신:', data.inventory)
  }, [])

  useSocketEvent('rewardClaimed', (data) => {
    setInventory(data.inventory || {})
    setClaimedRewards(prev => [...prev, data.rewardId])

    const message = `🎉 ${data.rewardName} 수령 완료!`
    setToast({
      show: true,
      message,
      type: 'success'
    })

    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }))
    }, 3000)

    console.log('보상 수령:', data)
  }, [])

  useSocketEvent('itemUsed', (data) => {
    setInventory(data.inventory || {})

    const message = `💊 ${data.itemName} 사용 완료!`
    setToast({
      show: true,
      message,
      type: 'info'
    })

    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }))
    }, 3000)

    console.log('아이템 사용:', data)
  }, [])

  useSocketEvent('itemUseFailed', (data) => {
    const message = '⚠️ 아이템 사용 실패 (수량 부족)'
    setToast({
      show: true,
      message,
      type: 'warning'
    })

    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }))
    }, 3000)

    console.log('아이템 사용 실패:', data)
  }, [])

  useSocketEvent('quests', (data) => {
    if (data.active) {
      setQuests(data.active)
    } else {
      setQuests(data)
    }
    if (data.available) {
      setAvailableQuests(data.available)
    }
    console.log('퀘스트 데이터 수신:', data)
  }, [])

  useSocketEvent('questProgress', (data) => {
    const { quest, progress } = data
    setQuests(prev => ({
      ...prev,
      [quest.id]: quest
    }))
    
    if (progress.percentage === 100) {
      const message = `🎉 "${quest.title}" 목표 완료! 보상을 받으세요.`
      setToast({
        show: true,
        message,
        type: 'success'
      })
      setTimeout(() => {
        setToast(prev => ({ ...prev, show: false }))
      }, 5000)
    }
    
    console.log('퀘스트 진행 업데이트:', data)
  }, [])

  useSocketEvent('questAccepted', (data) => {
    const { quest } = data
    const message = `📋 "${quest.title}" 퀘스트 수락!`
    setToast({
      show: true,
      message,
      type: 'info'
    })
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }))
    }, 3000)
    
    console.log('퀘스트 수락:', data)
  }, [])

  useSocketEvent('questRewardClaimed', (data) => {
    const { questId, reward, inventory } = data
    setInventory(inventory || {})

    const message = `🎉 퀘스트 완료 보상 수령! 포인트: ${reward?.points || 0}, 경험치: ${reward?.experience || 0}`
    setToast({
      show: true,
      message,
      type: 'success'
    })
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }))
    }, 5000)

    console.log('퀘스트 보상 수령:', data)
  }, [])

  // 방 입장/퇴장 알림 처리
  useSocketEvent('roomNotification', (data) => {
    const { type, character, roomId, roomName, fromRoomId, fromRoomName, toRoomId, toRoomName, timestamp } = data

    // 입장 알림
    if (type === 'join') {
      const message = `${character.emoji} ${character.name}님이 ${roomName}(으)로 입장했습니다`
      setToast({
        show: true,
        message,
        type: 'info'
      })

      // 채팅 히스토리에 시스템 메시지 추가
      setRoomChatHistory(prev => ({
        ...prev,
        [roomId]: [
          ...(prev[roomId] || []),
          {
            characterName: '시스템',
            message,
            timestamp: timestamp || Date.now(),
            isSystem: true
          }
        ]
      }))

      setTimeout(() => {
        setToast(prev => ({ ...prev, show: false }))
      }, 4000)

      console.log('입장 알림:', data)
    }

    // 퇴장 알림
    if (type === 'leave') {
      const message = `${character.emoji} ${character.name}님이 ${roomName}(으)로 떠났습니다`
      setToast({
        show: true,
        message,
        type: 'warning'
      })

      // 채팅 히스토리에 시스템 메시지 추가
      setRoomChatHistory(prev => ({
        ...prev,
        [roomId]: [
          ...(prev[roomId] || []),
          {
            characterName: '시스템',
            message,
            timestamp: timestamp || Date.now(),
            isSystem: true
          }
        ]
      }))

      setTimeout(() => {
        setToast(prev => ({ ...prev, show: false }))
      }, 4000)

      console.log('퇴장 알림:', data)
    }
  }, [])

  useEffect(() => {
    socket.emit('join', myCharacter)

    // Sound Manager 초기화 (첫 사용자 제스처 필요)
    soundManager.init().catch(err => console.warn('Sound init failed:', err))

    // 기본 BGM 재생 (성공하면)
    soundManager.playBGM(BGM_URLS.MAIN).catch(err => {
      console.warn('BGM playback failed:', err)
    })
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

  const handleCreateRoom = (roomName) => {
    if (roomName && roomName.trim()) {
      const roomId = `room-${Date.now()}`
      socket.emit('createRoom', {
        roomId,
        name: roomName.trim()
      })
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

  const moveCharacter = (dx, dy) => {
    const currentGridX = Math.floor(myCharacter.x / CELL_SIZE)
    const currentGridY = Math.floor(myCharacter.y / CELL_SIZE)

    const newGridX = currentGridX + dx
    const newGridY = currentGridY + dy

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

    // 이동 효과음
    soundManager.playSFX(SFX_URLS.MOVE).catch(err => {
      console.warn('SFX playback failed:', err)
    })
  }

  const handleMove = (character) => {
    setMyCharacter(prev => ({ ...prev, x: character.x, y: character.y }))
    socket.emit('move', character)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'h' || e.key === 'H') {
      setShowChatHistory(prev => !prev)
      return
    }

    // 채팅 입력 중이면 방향키 무시
    if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') {
      return
    }

    // 방향키 이동
    switch (e.key) {
      case 'ArrowUp':
      case 'w':
      case 'W':
        e.preventDefault()
        moveCharacter(0, -1)
        break
      case 'ArrowDown':
      case 's':
      case 'S':
        e.preventDefault()
        moveCharacter(0, 1)
        break
      case 'ArrowLeft':
      case 'a':
      case 'A':
        e.preventDefault()
        moveCharacter(-1, 0)
        break
      case 'ArrowRight':
      case 'd':
      case 'D':
        e.preventDefault()
        moveCharacter(1, 0)
        break
      default:
        break
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

      // 상호작용 효과음
      const sfxType = typeMapping[type] || type
      if (sfxType === 'greet') {
        soundManager.playSFX(SFX_URLS.GREET).catch(err => {
          console.warn('SFX playback failed:', err)
        })
      } else if (sfxType === 'gift') {
        soundManager.playSFX(SFX_URLS.GIFT).catch(err => {
          console.warn('SFX playback failed:', err)
        })
      }
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

    // 건물 클릭 감지
    const clickedBuilding = buildings.find(building => {
      return clickMapX >= building.x && clickMapX <= building.x + building.width &&
             clickMapY >= building.y && clickMapY <= building.y + building.height
    })

    if (clickedBuilding) {
      handleBuildingClick(clickedBuilding)
      return
    }

    const clickedCharacter = Object.values(characters).find(char => {
      const distance = Math.sqrt(
        Math.pow(char.x - clickMapX, 2) + Math.pow(char.y - clickMapY, 2)
      )
      return distance <= CHARACTER_SIZE / 2
    })

    if (clickedCharacter) {
      soundManager.playSFX(SFX_URLS.GREET).catch(err => {
        console.warn('SFX playback failed:', err)
      })

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

    const currentGridX = Math.floor(myCharacter.x / CELL_SIZE)
    const currentGridY = Math.floor(myCharacter.y / CELL_SIZE)

    const clickGridX = Math.floor(clickMapX / CELL_SIZE)
    const clickGridY = Math.floor(clickMapY / CELL_SIZE)

    let dx = 0
    let dy = 0

    if (clickGridX > currentGridX) dx = 1
    else if (clickGridX < currentGridX) dx = -1
    
    if (clickGridY > currentGridY) dy = 1
    else if (clickGridY < currentGridY) dy = -1

    if (dx !== 0 || dy !== 0) {
      // 점프 dust FX 효과
      const dustX = myCharacter.x + (dx * CHARACTER_SIZE / 2)
      const dustY = myCharacter.y + (dy * CHARACTER_SIZE / 2)
      setClickEffects(prev => [...prev, {
        x: dustX,
        y: dustY,
        timestamp: Date.now(),
        type: 'dust'
      }])
      
      moveCharacter(dx, dy)
    }
  }

  const handleBuildingClick = (building) => {
    if (activeBuilding && activeBuilding.id === building.id) {
      const message = `🚪 ${building.name}에서 퇴장했습니다`
      setToast({
        show: true,
        message,
        type: 'info'
      })
      setTimeout(() => {
        setToast(prev => ({ ...prev, show: false }))
      }, 3000)

      socket.emit('exitBuilding', {
        buildingId: building.id,
        characterId: myCharacter.id
      })

      setActiveBuilding(null)
    } else {
      const message = `🏢 ${building.name}에 입장했습니다`
      setToast({
        show: true,
        message,
        type: 'info'
      })
      setTimeout(() => {
        setToast(prev => ({ ...prev, show: false }))
      }, 3000)

      socket.emit('enterBuilding', {
        buildingId: building.id,
        characterId: myCharacter.id
      })

      setActiveBuilding(building)
      fetchEventLogs()
    }

    console.log('건물 클릭:', building.name)
  }

  const fetchEventLogs = async () => {
    try {
      const response = await fetch(`http://localhost:4000/api/events/${myCharacter.id}`)
      const data = await response.json()
      setEventLogs(data.logs || [])
    } catch (error) {
      console.error('이벤트 로그 가져오기 실패:', error)
    }
  }

  useEffect(() => {
    socket.on('buildingEvent', (event) => {
      if (event.characterId === myCharacter.id) {
        fetchEventLogs()
      }
    })
    
    return () => {
      socket.off('buildingEvent')
    }
  }, [myCharacter.id])

  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
  }

  const handleMiniMapClick = (mapX, mapY) => {
    const currentGridX = Math.floor(myCharacter.x / CELL_SIZE)
    const currentGridY = Math.floor(myCharacter.y / CELL_SIZE)

    const clickGridX = Math.floor(mapX / CELL_SIZE)
    const clickGridY = Math.floor(mapY / CELL_SIZE)

    let dx = 0
    let dy = 0

    if (clickGridX > currentGridX) dx = 1
    else if (clickGridX < currentGridX) dx = -1
    
    if (clickGridY > currentGridY) dy = 1
    else if (clickGridY < currentGridY) dy = -1

    if (dx !== 0 || dy !== 0) {
      moveCharacter(dx, dy)
    }
  }

  const handleGetInventory = () => {
    socket.emit('getInventory', {
      characterId: myCharacter.id
    })
  }

  const handleUseItem = (characterId, itemId) => {
    socket.emit('useItem', {
      characterId,
      itemId
    })
  }

  const handleClaimReward = (characterId, rewardId) => {
    socket.emit('claimReward', {
      characterId,
      rewardId
    })
  }

  const handleGetQuests = () => {
    socket.emit('getQuests', {
      characterId: myCharacter.id
    })
  }

  const handleAcceptQuest = (questId) => {
    socket.emit('acceptQuest', {
      characterId: myCharacter.id,
      questId
    })
  }

  const handleClaimQuestReward = (questId) => {
    socket.emit('claimQuestReward', {
      characterId: myCharacter.id,
      questId
    })
  }

  useEffect(() => {
    handleGetInventory()
    handleGetQuests()
  }, [])

  

  return (
    <div className="app">
      <div className="header">
        <h1>{t('app.title')}</h1>
        <div className="stats">
          <span>{t('ui.tabs.profile')}: {myCharacter.name}</span>
          <span>{currentRoom.name}</span>
          <span>{Object.keys(characters).length}</span>
          <span>{socket.connected ? '✅' : '❌'}</span>
        </div>
        <div className="room-controls">
          <LanguageSelector />
          <button
            className="room-button"
            onClick={() => setShowRoomMenu(prev => !prev)}
          >
            🏠 방 ({rooms.length})
          </button>
          <button
            className="room-button"
            onClick={() => {
              if (showEventLog) {
                setShowEventLog(false)
              } else {
                fetchEventLogs()
                setShowEventLog(true)
              }
            }}
          >
            📊 기록
          </button>
          <button
            className="room-button"
            onClick={() => setShowInventory(prev => !prev)}
          >
            🎒 인벤토리
          </button>
          <button
            className="room-button"
            onClick={() => setShowCustomizationModal(prev => !prev)}
          >
            👕 커스터마이징
          </button>
<button
             className="room-button"
             onClick={() => setShowReward(prev => !prev)}
           >
             🎁 보상
           </button>
           <button
             className="room-button"
             onClick={() => {
               if (showQuest) {
                 setShowQuest(false)
               } else {
                 handleGetQuests()
                 setShowQuest(true)
               }
             }}
           >
             📋 퀘스트
           </button>
          <button
            className="room-button"
            onClick={() => setShowSettings(prev => !prev)}
          >
            ⚙️ 설정
          </button>
         </div>
      </div>
      <GameCanvas
        myCharacter={myCharacter}
        characters={characters}
        affinities={affinities}
        chatMessages={chatMessages}
        clickEffects={clickEffects}
        buildings={buildings}
        canvasRef={canvasRef}
        onClick={handleCanvasClick}
        onBuildingClick={handleBuildingClick}
        onMove={handleMove}
        characterCustomization={characterCustomization}
        weather={weather?.type || 'CLEAR'}
      />
      <MiniMap
        myCharacter={myCharacter}
        characters={characters}
        buildings={buildings}
        weather={weather?.type || 'CLEAR'}
        onClick={handleMiniMapClick}
      />
      <ChatInput
        value={chatInput}
        onChange={(e) => setChatInput(e.target.value)}
        onSubmit={handleChatSubmit}
      />
      <div className="controls">
        <p>🖱️ 클릭 / ⬆⬇⬅➡ 방향키 / WASD 이동</p>
        <p>⌨️ Enter 채팅 전송 | H 히스토리</p>
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
<div className="chat-history-list" ref={chatHistoryRef}>
              {roomChatHistory[currentRoom.id]?.length === 0 ? (
                <div className="chat-history-empty">채팅 기록이 없습니다</div>
              ) : (
                roomChatHistory[currentRoom.id]?.map((chat, index) => (
                  <div key={index} className={`chat-history-item ${chat.isSystem ? 'system-message' : ''}`}>
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
        onJoinRoom={handleChangeRoom}
        onClose={() => setShowRoomMenu(false)}
        onCreateRoom={handleCreateRoom}
      />

      {showEventLog && (
        <div className="event-log-sidebar">
          <div className="event-log-header">
            <h3>📊 건물 방문 기록</h3>
            <button
              className="event-log-close"
              onClick={() => setShowEventLog(false)}
            >
              ✕
            </button>
          </div>
          <EventLog
            logs={eventLogs}
            characterName={myCharacter.name}
          />
        </div>
      )}

      <Inventory
        show={showInventory}
        onClose={() => setShowInventory(false)}
        inventory={inventory}
        characterId={myCharacter.id}
        onUseItem={handleUseItem}
        onGetInventory={handleGetInventory}
      />

<Reward
         show={showReward}
         onClose={() => setShowReward(false)}
         characterId={myCharacter.id}
         onClaimReward={handleClaimReward}
         claimedRewards={claimedRewards}
       />

      <Quest
        show={showQuest}
        quests={quests}
        availableQuests={availableQuests}
        onAcceptQuest={handleAcceptQuest}
        onClaimReward={handleClaimQuestReward}
        onClose={() => setShowQuest(false)}
       />

      {showSettings && (
        <SettingsPanel onClose={() => setShowSettings(false)} />
      )}

      <CharacterCustomizationModal
        show={showCustomizationModal}
        onClose={() => setShowCustomizationModal(false)}
        onSave={handleCustomizationSave}
      />
     </div>
  )
}

// 메인 App 컴포넌트에 I18nProvider 감싸기
function App() {
  return (
    <I18nProvider>
      <AppContent />
    </I18nProvider>
  )
}

export default App