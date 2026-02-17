import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useSocketEvent } from '../useSocketEvent'
import { socket } from '../../socket'

vi.mock('../../socket', () => ({
  socket: {
    on: vi.fn(),
    off: vi.fn()
  }
}))

describe('useSocketEvent Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('registers socket event listener on mount', () => {
    const handler = vi.fn()
    
    renderHook(() => useSocketEvent('test-event', handler))

    expect(socket.on).toHaveBeenCalledWith('test-event', expect.any(Function))
  })

  it('unregisters socket event listener on unmount', () => {
    const handler = vi.fn()
    const { unmount } = renderHook(() => useSocketEvent('test-event', handler))

    unmount()

    expect(socket.off).toHaveBeenCalledWith('test-event', expect.any(Function))
  })

  it('calls handler when event is triggered', () => {
    const handler = vi.fn()
    
    renderHook(() => useSocketEvent('test-event', handler))

    const registeredHandler = socket.on.mock.calls[0][1]
    registeredHandler('test-data')

    expect(handler).toHaveBeenCalledWith('test-data')
  })

  it('passes multiple arguments to handler', () => {
    const handler = vi.fn()
    
    renderHook(() => useSocketEvent('test-event', handler))

    const registeredHandler = socket.on.mock.calls[0][1]
    registeredHandler('arg1', 'arg2', 'arg3')

    expect(handler).toHaveBeenCalledWith('arg1', 'arg2', 'arg3')
  })

  it('updates handler when dependencies change', () => {
    const handler1 = vi.fn()
    const handler2 = vi.fn()
    
    const { rerender } = renderHook(
      ({ handler }) => useSocketEvent('test-event', handler, [handler]),
      { initialProps: { handler: handler1 } }
    )

    rerender({ handler: handler2 })

    expect(socket.off).toHaveBeenCalled()
  })

  it('handles multiple socket events', () => {
    const handler1 = vi.fn()
    const handler2 = vi.fn()
    
    renderHook(() => {
      useSocketEvent('event1', handler1)
      useSocketEvent('event2', handler2)
    })

    expect(socket.on).toHaveBeenCalledWith('event1', expect.any(Function))
    expect(socket.on).toHaveBeenCalledWith('event2', expect.any(Function))
  })

  it('cleans up multiple event listeners on unmount', () => {
    const handler1 = vi.fn()
    const handler2 = vi.fn()
    
    const { unmount } = renderHook(() => {
      useSocketEvent('event1', handler1)
      useSocketEvent('event2', handler2)
    })

    unmount()

    expect(socket.off).toHaveBeenCalledWith('event1', expect.any(Function))
    expect(socket.off).toHaveBeenCalledWith('event2', expect.any(Function))
  })
})