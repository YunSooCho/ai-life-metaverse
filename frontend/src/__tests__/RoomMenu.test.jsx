import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import RoomMenu from '../components/RoomMenu'

describe('RoomMenu Component', () => {
  const defaultProps = {
    show: true,
    rooms: [
      { id: 'room-1', name: '메인 광장', members: ['char-1', 'char-2'] },
      { id: 'room-2', name: '게임방', members: ['char-3'] }
    ],
    currentRoom: { id: 'room-1', name: '메인 광장' },
    onJoinRoom: vi.fn(),
    onCreateRoom: vi.fn(),
    onClose: vi.fn()
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders nothing when show is false', () => {
    const { container } = render(<RoomMenu {...defaultProps} show={false} />)
    expect(container.innerHTML).toBe('')
  })

  it('renders room list when show is true', () => {
    render(<RoomMenu {...defaultProps} />)
    expect(screen.getByText('🌐 ROOMS')).toBeInTheDocument()
  })

  it('displays all rooms', () => {
    render(<RoomMenu {...defaultProps} />)
    expect(screen.getByText('메인 광장')).toBeInTheDocument()
    expect(screen.getByText('게임방')).toBeInTheDocument()
  })

  it('displays member count for each room', () => {
    render(<RoomMenu {...defaultProps} />)
    expect(screen.getByText('2 👤')).toBeInTheDocument()
    expect(screen.getByText('1 👤')).toBeInTheDocument()
  })

  it('calls onJoinRoom when room is clicked', () => {
    render(<RoomMenu {...defaultProps} />)
    fireEvent.click(screen.getByText('게임방'))
    expect(defaultProps.onJoinRoom).toHaveBeenCalledWith('room-2')
  })

  it('calls onClose when close button is clicked', () => {
    render(<RoomMenu {...defaultProps} />)
    fireEvent.click(screen.getByText('✕'))
    expect(defaultProps.onClose).toHaveBeenCalled()
  })

  it('renders create room input', () => {
    render(<RoomMenu {...defaultProps} />)
    expect(screen.getByPlaceholderText('NEW ROOM NAME')).toBeInTheDocument()
  })

  it('calls onCreateRoom when create button is clicked', () => {
    render(<RoomMenu {...defaultProps} />)
    const input = screen.getByPlaceholderText('NEW ROOM NAME')
    fireEvent.change(input, { target: { value: '새로운 방' } })
    fireEvent.click(screen.getByText('CREATE'))
    expect(defaultProps.onCreateRoom).toHaveBeenCalledWith('새로운 방')
  })

  it('calls onCreateRoom when Enter key is pressed', () => {
    render(<RoomMenu {...defaultProps} />)
    const input = screen.getByPlaceholderText('NEW ROOM NAME')
    fireEvent.change(input, { target: { value: '테스트 방' } })
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(defaultProps.onCreateRoom).toHaveBeenCalledWith('테스트 방')
  })

  it('does not call onCreateRoom with empty input', () => {
    render(<RoomMenu {...defaultProps} />)
    fireEvent.click(screen.getByText('CREATE'))
    expect(defaultProps.onCreateRoom).not.toHaveBeenCalled()
  })

  it('highlights current room', () => {
    render(<RoomMenu {...defaultProps} />)
    const activeRoom = screen.getByText('메인 광장').closest('button')
    expect(activeRoom).toHaveClass('room-item-active')
  })

  it('shows 0 members when room has no members array', () => {
    const propsWithEmptyRoom = {
      ...defaultProps,
      rooms: [{ id: 'empty', name: '빈 방' }]
    }
    render(<RoomMenu {...propsWithEmptyRoom} />)
    expect(screen.getByText('0 👤')).toBeInTheDocument()
  })

  it('renders create button', () => {
    render(<RoomMenu {...defaultProps} />)
    expect(screen.getByText('CREATE')).toBeInTheDocument()
  })
})
