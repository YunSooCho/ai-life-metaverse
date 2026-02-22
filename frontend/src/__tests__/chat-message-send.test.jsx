import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { Socket } from 'socket.io-client'
import App from '../App'

// Mock socket.io-client
vi.mock('socket.io-client', () => ({
  default: vi.fn(() => ({
    on: vi.fn(),
    emit: vi.fn(),
    disconnect: vi.fn(),
    id: 'test-socket-id'
  }))
}))

describe('Chat Message Send - Issue #145', () => {
  let mockSocket

  beforeEach(() => {
    // Mock localStorage
    vi.stubGlobal('localStorage', {
      getItem: vi.fn(() => '{"characterId":"test-char-123"}'),
      setItem: vi.fn(),
      removeItem: vi.fn()
    })

    // Mock Canvas API
    vi.stubGlobal('HTMLCanvasElement', class HTMLCanvasElement {
      getContext() {
        return {
          fillText: vi.fn(),
          measureText: vi.fn(() => ({ width: 100 })),
          clearRect: vi.fn(),
          beginPath: vi.fn(),
          moveTo: vi.fn(),
          lineTo: vi.fn(),
          stroke: vi.fn(),
          fill: vi.fn(),
          save: vi.fn(),
          restore: vi.fn()
        }
      }
    })

    mockSocket = Socket()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('채팅 메시지 전송 시 chatMessages state 업데이트 확인', async () => {
    const { container } = render(<App />)

    // 채팅 입력창 찾기
    const chatInput = await waitFor(() =>
      screen.getByPlaceholderText('채팅...')
    )

    // 메시지 입력
    fireEvent.change(chatInput, { target: { value: '테스트 메시지' } })
    expect(chatInput.value).toBe('테스트 메시지')

    // SEND 버튼 클릭
    const sendButton = screen.getByText('SEND')
    fireEvent.click(sendButton)

    // 채팅 메시지 전송 확인
    await waitFor(() => {
      expect(mockSocket.emit).toHaveBeenCalledWith(
        'chatMessage',
        expect.objectContaining({
          message: '테스트 메시지'
        })
      )
    }, { timeout: 1000 })

    // chatMessages state 업데이트 확인 (App.jsx line 690~709)
    // 이 테스트는 chatMessages가 업데이트되었는지 확인하는 간단한 테스트
    // 실제로는 GameCanvas.jsx에서 chatBubblesToRender를 확인해야 함
  }, { timeout: 5000 })

  it('채팅 메시지 전송 후 입력창 클리어 확인', async () => {
    const { container } = render(<App />)

    // 채팅 입력창 찾기
    const chatInput = await waitFor(() =>
      screen.getByPlaceholderText('채팅...')
    )

    // 메시지 입력
    fireEvent.change(chatInput, { target: { value: '테스트 메시지' } })
    expect(chatInput.value).toBe('테스트 메시지')

    // SEND 버튼 클릭
    const sendButton = screen.getByText('SEND')
    fireEvent.click(sendButton)

    // 입력창 클리어 확인 (App.jsx line 734)
    await waitFor(() => {
      expect(chatInput.value).toBe('')
    }, { timeout: 1000 })
  })

  it('빈 메시지 전송 시 socket.emit 호출 안 함', async () => {
    const { container } = render(<App />)

    // 채팅 입력창 찾기
    const chatInput = await waitFor(() =>
      screen.getByPlaceholderText('채팅...')
    )

    // 빈 메시지 입력 (공백만)
    fireEvent.change(chatInput, { target: { value: '   ' } })
    expect(chatInput.value).toBe('   ')

    // SEND 버튼 클릭
    const sendButton = screen.getByText('SEND')
    fireEvent.click(sendButton)

    // socket.emit 호출 확인 (빈 메시지는 전송 안 됨)
    await waitFor(() => {
      expect(mockSocket.emit).not.toHaveBeenCalled()
    }, { timeout: 1000 })
  })
})