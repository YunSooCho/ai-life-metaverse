import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useCharacter } from '@/hooks/useCharacter'
import { socket } from '@/socket'

vi.mock('@/socket', () => ({
  socket: {
    emit: vi.fn()
  }
}))

describe('useCharacter Hook', () => {
  const initialCharacter = {
    id: 'player',
    name: '플레이어',
    x: 100,
    y: 100,
    color: '#4CAF50',
    emoji: '👤',
    isAi: false
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('initializes with empty characters object', () => {
    const { result } = renderHook(() => useCharacter(initialCharacter))

    expect(result.current.characters).toEqual({})
  })

  it('adds a character using addCharacter', () => {
    const { result } = renderHook(() => useCharacter(initialCharacter))
    const newCharacter = {
      id: 'char1',
      name: 'AI 캐릭터',
      x: 200,
      y: 200,
      color: '#FF6B6B',
      emoji: '🤖',
      isAi: true
    }

    act(() => {
      result.current.addCharacter(newCharacter)
    })

    expect(result.current.characters['char1']).toEqual(newCharacter)
  })

  it('updates a character using updateCharacter', () => {
    const { result } = renderHook(() => useCharacter(initialCharacter))

    act(() => {
      result.current.addCharacter({
        id: 'char1',
        name: '캐릭터',
        x: 100,
        y: 100,
        color: '#000000',
        emoji: '😊',
        isAi: false
      })
    })

    act(() => {
      result.current.updateCharacter('char1', { x: 150, y: 200 })
    })

    expect(result.current.characters['char1'].x).toBe(150)
    expect(result.current.characters['char1'].y).toBe(200)
    expect(result.current.characters['char1'].name).toBe('캐릭터')
  })

  it('removes a character using removeCharacter', () => {
    const { result } = renderHook(() => useCharacter(initialCharacter))

    act(() => {
      result.current.addCharacter({
        id: 'char1',
        name: '캐릭터',
        x: 100,
        y: 100,
        color: '#000000',
        emoji: '😊',
        isAi: false
      })
    })

    act(() => {
      result.current.removeCharacter('char1')
    })

    expect(result.current.characters['char1']).toBeUndefined()
  })

  it('moves a character and emits socket event', () => {
    const { result } = renderHook(() => useCharacter(initialCharacter))

    act(() => {
      result.current.addCharacter({
        id: 'char1',
        name: '캐릭터',
        x: 100,
        y: 100,
        color: '#000000',
        emoji: '😊',
        isAi: false
      })
    })

    act(() => {
      result.current.moveCharacter('char1', 200, 300)
    })

    expect(result.current.characters['char1'].x).toBe(200)
    expect(result.current.characters['char1'].y).toBe(300)
    expect(socket.emit).toHaveBeenCalledWith('move', {
      id: 'char1',
      x: 200,
      y: 300
    })
  })

  it('handles multiple characters', () => {
    const { result } = renderHook(() => useCharacter(initialCharacter))

    act(() => {
      result.current.addCharacter({ id: 'char1', name: 'Character 1', x: 100, y: 100, color: '#fff', emoji: '😀', isAi: false })
      result.current.addCharacter({ id: 'char2', name: 'Character 2', x: 200, y: 200, color: '#fff', emoji: '😂', isAi: false })
      result.current.addCharacter({ id: 'char3', name: 'Character 3', x: 300, y: 300, color: '#fff', emoji: '😍', isAi: false })
    })

    expect(Object.keys(result.current.characters)).toHaveLength(3)
    expect(result.current.characters['char1'].name).toBe('Character 1')
    expect(result.current.characters['char2'].name).toBe('Character 2')
    expect(result.current.characters['char3'].name).toBe('Character 3')
  })

  it('updates character with multiple properties', () => {
    const { result } = renderHook(() => useCharacter(initialCharacter))

    act(() => {
      result.current.addCharacter({
        id: 'char1',
        name: 'Old Name',
        x: 100,
        y: 100,
        color: '#ffffff',
        emoji: '😊',
        isAi: false
      })
    })

    act(() => {
      result.current.updateCharacter('char1', {
        name: 'New Name',
        color: '#ff0000',
        emoji: '🎉'
      })
    })

    expect(result.current.characters['char1'].name).toBe('New Name')
    expect(result.current.characters['char1'].color).toBe('#ff0000')
    expect(result.current.characters['char1'].emoji).toBe('🎉')
    expect(result.current.characters['char1'].x).toBe(100)
  })

  it('handles removing non-existent character gracefully', () => {
    const { result } = renderHook(() => useCharacter(initialCharacter))

    act(() => {
      result.current.removeCharacter('non-existent')
    })

    expect(Object.keys(result.current.characters)).toHaveLength(0)
  })
})