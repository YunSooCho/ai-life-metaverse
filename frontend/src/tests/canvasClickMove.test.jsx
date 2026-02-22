/**
 * 캔버스 클릭/터치 이동 테스트
 * Issue #119: 캔버스 클릭/터치로 캐릭터가 이동하는가?
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import App from '../App'
import { socket } from '../socket'

// Mock socket
vi.mock('../socket', () => ({
  socket: {
    emit: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
    connected: true
  }
}))

describe('Canvas Click/Touch Movement Test (Issue #119)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('캔버스 클릭 시 캐릭터가 이동해야 함', async () => {
    render(<App />)

    const canvas = await waitFor(() => {
      const canvas = document.querySelector('canvas')
      expect(canvas).toBeInTheDocument()
      return canvas
    }, { timeout: 5000 })

    // 캔버스 클릭
    fireEvent.click(canvas, {
      clientX: 200,
      clientY: 200
    })

    // move 이벤트가 emit되었는지 확인
    await waitFor(() => {
      const moveCalls = socket.emit.mock.calls.filter(call => call[0] === 'move')
      expect(moveCalls.length).toBeGreaterThan(0)
    }, { timeout: 3000 })
  })

  test('모바일 터치 시 캐릭터가 이동해야 함', async () => {
    render(<App />)

    const canvas = await waitFor(() => {
      const canvas = document.querySelector('canvas')
      expect(canvas).toBeInTheDocument()
      return canvas
    }, { timeout: 5000 })

    // 터치 이벤트 발생
    fireEvent.touchStart(canvas, {
      touches: [{
        clientX: 200,
        clientY: 200
      }]
    })

    // move 이벤트가 emit되었는지 확인
    await waitFor(() => {
      const moveCalls = socket.emit.mock.calls.filter(call => call[0] === 'move')
      expect(moveCalls.length).toBeGreaterThan(0)
    }, { timeout: 3000 })
  })
})