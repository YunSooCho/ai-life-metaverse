/**
 * useAiCharacterMovement Hook v1.0
 *
 * AI 캐릭터 자동 이동 시스템 통합
 * MovementScheduler + BuildingInteractionSystem
 */

import { useState, useEffect, useContext } from 'react'
import { SocketContext } from '../contexts/SocketContext'
import {
  aiMovementScheduler,
  BUILDING_LOCATIONS
} from '../utils/aiCharacterMovementScheduler.js'
import {
  buildingInteractionSystem,
  BUILDING_STATUS
} from '../utils/buildingInteractionSystem.js'

/**
 * AI 캐릭터 자동 이동 Hook
 */
export function useAiCharacterMovement(characters) {
  const socket = useContext(SocketContext)
  const [isRunning, setIsRunning] = useState(false)

  useEffect(() => {
    // AI 캐릭터 필터링
    const aiCharacters = characters.filter(char => char.isAi)

    if (aiCharacters.length === 0) return

    // 스케줄러 콜백 설정
    aiMovementScheduler.onMove = (charId, newX, newY) => {
      // 서버에 위치 전송
      if (socket) {
        socket.emit('character:move', {
          characterId: charId,
          x: newX,
          y: newY
        })
      }
    }

    // 건물 입장 콜백
    aiMovementScheduler.onArrive = (charId, building) => {
      const message = BUILDING_LOCATIONS[building]?.name || building

      // 건물 입장
      buildingInteractionSystem.enter(charId, building)

      // 서버에 알림 전송 (선택 사항)
      if (socket) {
        socket.emit('character:building:enter', {
          characterId: charId,
          building
        })
      }
    }

    // BuildingInteractionSystem 콜백
    buildingInteractionSystem.onEnter = (charId, building, message) => {
      console.log(`[AI] ${charId} entered ${building}: ${message}`)

      // 채팅 메시지로 전송 (선택 사항)
      if (socket) {
        socket.emit('character:chat', {
          characterId: charId,
          message,
          isSystemMessage: true
        })
      }
    }

    buildingInteractionSystem.onActivity = (charId, building, message) => {
      console.log(`[AI] ${charId} activity in ${building}: ${message}`)

      // 채팅 메시지로 전송 (선택 사항)
      if (socket) {
        socket.emit('character:chat', {
          characterId: charId,
          message,
          isSystemMessage: true
        })
      }
    }

    buildingInteractionSystem.onExit = (charId, building, message) => {
      console.log(`[AI] ${charId} exited ${building}: ${message}`)

      // 채팅 메시지로 전송 (선택 사항)
      if (socket) {
        socket.emit('character:chat', {
          characterId: charId,
          message,
          isSystemMessage: true
        })
      }

      // 퇴장 후 재출발
      setTimeout(() => {
        aiMovementScheduler.executeMovement(charId)
      }, 5000) // 5초 후 새로운 이동 시작
    }

    // 캐릭터 업데이트
    aiCharacters.forEach(char => {
      aiMovementScheduler.addCharacter(char)
    })

    // 스케줄러 시작
    aiMovementScheduler.start()
    setIsRunning(true)

    // Cleanup
    return () => {
      aiMovementScheduler.stop()
      buildingInteractionSystem.clearAll()
      setIsRunning(false)
    }
  }, [characters, socket])

  /**
   * 캐릭터 추가
   */
  const addCharacter = (char) => {
    if (char.isAi) {
      aiMovementScheduler.addCharacter(char)
    }
  }

  /**
   * 캐릭터 제거
   */
  const removeCharacter = (charId) => {
    aiMovementScheduler.removeCharacter(charId)
  }

  /**
   * 스케줄러 시작/정지
   */
  const toggleScheduler = (running) => {
    if (running) {
      aiMovementScheduler.start()
      setIsRunning(true)
    } else {
      aiMovementScheduler.stop()
      setIsRunning(false)
    }
  }

  return {
    isRunning,
    addCharacter,
    removeCharacter,
    toggleScheduler
  }
}

export default useAiCharacterMovement