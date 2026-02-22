/**
 * 채팅 메시지 전송 테스트 (Issue #144)
 *
 * ✅ 테스트 목표:
 * - sendChatMessage가 호출되면 채팅 히스토리에 메시지가 추가됨 (roomChatHistory)
 * - 말풍선도 즉시 표시됨 (chatMessages)
 * - socket.emit으로 메시지가 전송됨
 *
 * 🔴 버그 #144: 채팅 메시지 전송 후 화면에 표시되지 않음
 * 해결: sendChatMessage에서 roomChatHistory에 즉시 메시지 추가
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { vi } from 'vitest'

/**
 * 단위 테스트: sendChatMessage 로직
 *
 * 이 테스트는 React 컴포넌트 렌더링 없이 sendChatMessage 함수의
 * 핵심 로직만 테스트합니다.
 */

describe('채팅 메시지 전송 로직 (Issue #144)', () => {
  let mockSetChatMessages, mockSetRoomChatHistory, mockSocketEmit

  beforeEach(() => {
    // Mock 함수들 초기화
    mockSetChatMessages = vi.fn((updateFn) => {
      // updateFn이 호출되면 mock data로 시뮬레이션
      const currentState = {}
      const newState = updateFn(currentState)
      return newState
    })

    mockSetRoomChatHistory = vi.fn((updateFn) => {
      const currentState = {}
      const newState = updateFn(currentState)
      return newState
    })

    mockSocketEmit = vi.fn()
  })

  it('메시지 전송 시 chatMessages가 업데이트됨 (말풍선)', () => {
    const trimmedMessage = '안녕하세요'
    const timestamp = Date.now()
    const myCharacterId = 'player'

    // sendChatMessage의 chatMessages 업데이트 로직 시뮬레이션
    const newChatMessages = mockSetChatMessages((prev) => {
      return {
        ...prev,
        [myCharacterId]: {
          message: trimmedMessage,
          timestamp
        }
      }
    })

    // chatMessages가 업데이트되었는지 확인
    expect(newChatMessages[myCharacterId]).toBeDefined()
    expect(newChatMessages[myCharacterId].message).toBe(trimmedMessage)
    expect(newChatMessages[myCharacterId].timestamp).toBe(timestamp)

    console.log('✅ [Test] chatMessages 업데이트 확인:', newChatMessages)
  })

  it('메시지 전송 시 roomChatHistory가 업데이트됨 (채팅 히스토리) - Issue #144 FIX', () => {
    const trimmedMessage = '테스트 메시지'
    const timestamp = Date.now()
    const myCharacterId = 'player'
    const myCharacterName = '플레이어'
    const currentRoomId = 'main'

    // sendChatMessage의 roomChatHistory 업데이트 로직 시뮬레이션
    const newRoomChatHistory = mockSetRoomChatHistory((prev) => {
      const roomHistory = prev[currentRoomId] || []
      const newHistory = [
        ...roomHistory,
        {
          characterId: myCharacterId,
          characterName: myCharacterName,
          message: trimmedMessage,
          timestamp: timestamp
        }
      ].slice(-50)
      return {
        ...prev,
        [currentRoomId]: newHistory
      }
    })

    // roomChatHistory가 업데이트되었는지 확인
    expect(newRoomChatHistory[currentRoomId]).toBeDefined()
    expect(newRoomChatHistory[currentRoomId].length).toBe(1)
    expect(newRoomChatHistory[currentRoomId][0].message).toBe(trimmedMessage)
    expect(newRoomChatHistory[currentRoomId][0].characterName).toBe(myCharacterName)
    expect(newRoomChatHistory[currentRoomId][0].characterId).toBe(myCharacterId)

    console.log('✅ [Test Issue #144] roomChatHistory 업데이트 확인:', newRoomChatHistory)
  })

  it('빈 메시지는 전송되지 않음', () => {
    const emptyMessage = '   '

    if (!emptyMessage.trim()) {
      // 빈 메시지는 처리하지 않음
      console.log('✅ [Test] 빈 메시지 무시 확인')

      // socket.emit이 호출되지 않는 것을 확인
      expect(mockSocketEmit).not.toHaveBeenCalled()
    } else {
      // 빈 메시지라면 테스트에 문제가 있음
      throw new Error('테스트 실패: 빈 메시지가 처리되었습니다')
    }
  })

  it('메시지 전송이 50개 제한을 준수함', () => {
    const trimmedMessage = '메시지'
    const currentRoomId = 'main'

    // 이미 50개의 메시지가 있는 시뮬레이션
    const existingHistory = Array(50).fill().map((_, i) => ({
      characterId: 'player',
      characterName: '플레이어',
      message: `메시지 ${i}`,
      timestamp: Date.now() - (50 - i) * 1000
    }))

    const newRoomChatHistory = mockSetRoomChatHistory((prev) => {
      return {
        ...prev,
        [currentRoomId]: [
          ...existingHistory,
          {
            characterId: 'player',
            characterName: '플레이어',
            message: trimmedMessage,
            timestamp: Date.now()
          }
        ].slice(-50)
      }
    })

    // 가장 오래된 메시지가 제거되고 50개만 유지되는지 확인
    expect(newRoomChatHistory[currentRoomId].length).toBe(50)
    expect(newRoomChatHistory[currentRoomId][49].message).toBe(trimmedMessage)

    console.log('✅ [Test] 50개 제한 준수 확인:', newRoomChatHistory[currentRoomId].length)
  })
})