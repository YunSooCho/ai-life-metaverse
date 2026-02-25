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

// Mock soundManager
vi.mock('../utils/soundManager.js', () => ({
  soundManager: {
    playSFX: vi.fn(),
    playBGM: vi.fn(),
    stopBGM: vi.fn(),
    setSFXVolume: vi.fn(),
    setBGMVolume: vi.fn(),
    getSFXVolume: vi.fn(() => 0.7),
    getBGMVolume: vi.fn(() => 0.5)
  }
}))

// Mock HTMLCanvasElement.getContext
HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
  fillRect: vi.fn(),
  clearRect: vi.fn(),
  getImageData: vi.fn(() => ({ data: [] })),
  putImageData: vi.fn(),
  createImageData: vi.fn(() => ({ data: [] })),
  setTransform: vi.fn(),
  resetTransform: vi.fn(),
  save: vi.fn(),
  restore: vi.fn(),
  scale: vi.fn(),
  rotate: vi.fn(),
  translate: vi.fn(),
  transform: vi.fn(),
  beginPath: vi.fn(),
  closePath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  arc: vi.fn(),
  fill: vi.fn(),
  stroke: vi.fn(),
  clip: vi.fn(),
  drawImage: vi.fn(),
  measureText: vi.fn(() => ({ width: 0 }))
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