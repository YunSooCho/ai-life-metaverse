/**
 * InputHandler 테스트 코드
 *
 * 키보드 입력 처리 유틸리티 테스트
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  initializeInputHandler,
  isKeyPressed,
  getMovementDirection,
  isMoving,
  resetKeyStates,
  getPressedKeys,
  cleanupAllInputHandlers
} from '../inputHandler'

describe('InputHandler', () => {
  let cleanup

  beforeEach(() => {
    // 각 테스트 전에 키 상태 초기화
    resetKeyStates()
  })

  afterEach(() => {
    // 각 테스트 후에 cleanup
    if (cleanup) {
      cleanup()
    }
    cleanupAllInputHandlers()
  })

  describe('initializeInputHandler', () => {
    it('should initialize input handler and return cleanup function', () => {
      const onKeyDown = vi.fn()
      const onKeyUp = vi.fn()

      cleanup = initializeInputHandler({ onKeyDown, onKeyUp })

      expect(typeof cleanup).toBe('function')
      expect(onKeyDown).not.toHaveBeenCalled()
      expect(onKeyUp).not.toHaveBeenCalled()
    })

    it('should call onKeyDown when a key is pressed', () => {
      const onKeyDown = vi.fn()
      const onKeyUp = vi.fn()

      cleanup = initializeInputHandler({ onKeyDown, onKeyUp })

      // 시뮬레이션: ArrowUp 키 다운 이벤트
      const event = new KeyboardEvent('keydown', { key: 'ArrowUp' })
      window.dispatchEvent(event)

      expect(onKeyDown).toHaveBeenCalledWith('ArrowUp', event)
    })

    it('should call onKeyUp when a key is released', () => {
      const onKeyDown = vi.fn()
      const onKeyUp = vi.fn()

      cleanup = initializeInputHandler({ onKeyDown, onKeyUp })

      // 시뮬레이션: ArrowUp 키 업 이벤트
      const event = new KeyboardEvent('keyup', { key: 'ArrowUp' })
      window.dispatchEvent(event)

      expect(onKeyUp).toHaveBeenCalledWith('ArrowUp', event)
    })

    it('should ignore unsupported keys', () => {
      const onKeyDown = vi.fn()
      const onKeyUp = vi.fn()

      cleanup = initializeInputHandler({ onKeyDown, onKeyUp })

      // 지원하지 않는 키 테스트
      const event = new KeyboardEvent('keydown', { key: 'a' })  // 'a'는 지원
      window.dispatchEvent(event)
      expect(onKeyDown).toHaveBeenCalledWith('a', event)

      const event2 = new KeyboardEvent('keydown', { key: 'Shift' })  // 'Shift'는 지원하지 않음
      window.dispatchEvent(event2)
      expect(onKeyDown).toHaveBeenCalledTimes(1)  // 'a'만 호출됨
    })
  })

  describe('isKeyPressed', () => {
    it('should return false for unchanged keys', () => {
      cleanup = initializeInputHandler()

      expect(isKeyPressed('ArrowUp')).toBe(false)
      expect(isKeyPressed('w')).toBe(false)
      expect(isKeyPressed('ArrowDown')).toBe(false)
    })

    it('should return true after key down event', () => {
      cleanup = initializeInputHandler()

      const event = new KeyboardEvent('keydown', { key: 'ArrowUp' })
      window.dispatchEvent(event)

      expect(isKeyPressed('ArrowUp')).toBe(true)
    })

    it('should return false after key up event', () => {
      cleanup = initializeInputHandler()

      // 키 다운
      const downEvent = new KeyboardEvent('keydown', { key: 'ArrowUp' })
      window.dispatchEvent(downEvent)
      expect(isKeyPressed('ArrowUp')).toBe(true)

      // 키 업
      const upEvent = new KeyboardEvent('keyup', { key: 'ArrowUp' })
      window.dispatchEvent(upEvent)
      expect(isKeyPressed('ArrowUp')).toBe(false)
    })
  })

  describe('getMovementDirection', () => {
    it('should return { x: 0, y: 0 } when no keys are pressed', () => {
      cleanup = initializeInputHandler()

      const direction = getMovementDirection()
      expect(direction).toEqual({ x: 0, y: 0 })
    })

    it('should return { x: 0, y: -1 } for up key', () => {
      cleanup = initializeInputHandler()

      const event = new KeyboardEvent('keydown', { key: 'ArrowUp' })
      window.dispatchEvent(event)

      const direction = getMovementDirection()
      expect(direction).toEqual({ x: 0, y: -1 })
    })

    it('should return { x: 0, y: 1 } for down key', () => {
      cleanup = initializeInputHandler()

      const event = new KeyboardEvent('keydown', { key: 'ArrowDown' })
      window.dispatchEvent(event)

      const direction = getMovementDirection()
      expect(direction).toEqual({ x: 0, y: 1 })
    })

    it('should return { x: -1, y: 0 } for left key', () => {
      cleanup = initializeInputHandler()

      const event = new KeyboardEvent('keydown', { key: 'ArrowLeft' })
      window.dispatchEvent(event)

      const direction = getMovementDirection()
      expect(direction).toEqual({ x: -1, y: 0 })
    })

    it('should return { x: 1, y: 0 } for right key', () => {
      cleanup = initializeInputHandler()

      const event = new KeyboardEvent('keydown', { key: 'ArrowRight' })
      window.dispatchEvent(event)

      const direction = getMovementDirection()
      expect(direction).toEqual({ x: 1, y: 0 })
    })

    it('should support WASD keys', () => {
      cleanup = initializeInputHandler()

      // WASD 테스트
      expect(getMovementDirection()).toEqual({ x: 0, y: 0 })

      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'w' }))
      expect(getMovementDirection()).toEqual({ x: 0, y: -1 })

      resetKeyStates()

      window.dispatchEvent(new KeyboardEvent('keydown', { key: 's' }))
      expect(getMovementDirection()).toEqual({ x: 0, y: 1 })

      resetKeyStates()

      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'a' }))
      expect(getMovementDirection()).toEqual({ x: -1, y: 0 })

      resetKeyStates()

      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'd' }))
      expect(getMovementDirection()).toEqual({ x: 1, y: 0 })
    })

    it('should normalize diagonal movement', () => {
      cleanup = initializeInputHandler()

      // 대각선 이동 (왼쪽 위)
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }))
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }))

      const direction = getMovementDirection()
      const length = Math.sqrt(direction.x * direction.x + direction.y * direction.y)

      expect(length).toBeApproximately(1, 5)
      expect(direction.x).toBeApproximately(-0.707, 3)
      expect(direction.y).toBeApproximately(-0.707, 3)
    })

    it('should handle conflicting keys (up + down = no movement)', () => {
      cleanup = initializeInputHandler()

      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }))
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }))

      const direction = getMovementDirection()
      expect(direction).toEqual({ x: 0, y: 0 })
    })

    it('should handle conflicting keys (left + right = no movement)', () => {
      cleanup = initializeInputHandler()

      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }))
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }))

      const direction = getMovementDirection()
      expect(direction).toEqual({ x: 0, y: 0 })
    })
  })

  describe('isMoving', () => {
    it('should return false when no keys are pressed', () => {
      cleanup = initializeInputHandler()

      expect(isMoving()).toBe(false)
    })

    it('should return true when movement keys are pressed', () => {
      cleanup = initializeInputHandler()

      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }))
      expect(isMoving()).toBe(true)
    })

    it('should return false after releasing movement keys', () => {
      cleanup = initializeInputHandler()

      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }))
      expect(isMoving()).toBe(true)

      window.dispatchEvent(new KeyboardEvent('keyup', { key: 'ArrowUp' }))
      expect(isMoving()).toBe(false)
    })
  })

  describe('resetKeyStates', () => {
    it('should reset all key states to false', () => {
      cleanup = initializeInputHandler()

      // 여러 키 누름
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }))
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }))
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'w' }))

      expect(isKeyPressed('ArrowUp')).toBe(true)
      expect(isKeyPressed('ArrowLeft')).toBe(true)
      expect(isKeyPressed('w')).toBe(true)

      // 리셋
      resetKeyStates()

      expect(isKeyPressed('ArrowUp')).toBe(false)
      expect(isKeyPressed('ArrowLeft')).toBe(false)
      expect(isKeyPressed('w')).toBe(false)
    })
  })

  describe('getPressedKeys', () => {
    it('should return empty array when no keys are pressed', () => {
      cleanup = initializeInputHandler()

      const keys = getPressedKeys()
      expect(keys).toEqual([])
    })

    it('should return array of pressed keys', () => {
      cleanup = initializeInputHandler()

      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }))
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }))

      const keys = getPressedKeys()
      expect(keys).toContain('ArrowUp')
      expect(keys).toContain('ArrowLeft')
    })

    it('should return only pressed keys (not released)', () => {
      cleanup = initializeInputHandler()

      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }))
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }))
      window.dispatchEvent(new KeyboardEvent('keyup', { key: 'ArrowLeft' }))

      const keys = getPressedKeys()
      expect(keys).toEqual(['ArrowUp'])
    })
  })

  describe('cleanupAllInputHandlers', () => {
    it('should clean up all input handlers', () => {
      const onKeyDown1 = vi.fn()
      const onKeyDown2 = vi.fn()

      const cleanup1 = initializeInputHandler({ onKeyDown: onKeyDown1 })
      const cleanup2 = initializeInputHandler({ onKeyDown: onKeyDown2 })

      cleanupAllInputHandlers()

      // 이벤트 리스너가 제거되었으므로 호출되지 않아야 함
      const event = new KeyboardEvent('keydown', { key: 'ArrowUp' })
      window.dispatchEvent(event)

      expect(onKeyDown1).not.toHaveBeenCalled()
      expect(onKeyDown2).not.toHaveBeenCalled()
    })
  })
})

// Vitest matchers 확장 (대각선 정규화 테스트용)
expect.extend({
  toBeApproximately(received, expected, precision = 2) {
    const diff = Math.abs(received - expected)
    const pass = diff < Math.pow(10, -precision)
    return {
      pass,
      message: () => `expected ${received} to be approximately ${expected} (within 10^-${precision})`
    }
  }
})