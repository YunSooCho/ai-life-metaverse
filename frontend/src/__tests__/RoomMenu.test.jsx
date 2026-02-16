import { describe, test, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import RoomMenu from '../components/RoomMenu'

describe('RoomMenu Component', () => {
  const mockRooms = [
    { id: 'room-1', name: '메인 광장', characters: { 'char-1': {}, 'char-2': {} } },
    { id: 'room-2', name: '게임방', characters: { 'char-3': {} } }
  ]

  const mockCurrentRoom = { id: 'room-1', name: '메인 광장' }

  const defaultProps = {
    show: true,
    rooms: mockRooms,
    currentRoom: mockCurrentRoom,
    onChangeRoom: vi.fn(),
    onClose: vi.fn(),
    onCreateRoom: vi.fn(),
    newRoomName: '',
    onNewRoomNameChange: vi.fn()
  }

  test('does not render when show is false', () => {
    const { container } = render(
      <RoomMenu {...defaultProps} show={false} />
    )
    expect(container.firstChild).toBeNull()
  })

  test('renders room list when show is true', () => {
    render(<RoomMenu {...defaultProps} />)

    expect(screen.getByText('🏠 방 리스트')).toBeInTheDocument()
    expect(screen.getByText('메인 광장')).toBeInTheDocument()
    expect(screen.getByText('게임방')).toBeInTheDocument()
  })

  test('displays character count for each room', () => {
    render(<RoomMenu {...defaultProps} />)

    expect(screen.getByText('2명')).toBeInTheDocument()
    expect(screen.getByText('1명')).toBeInTheDocument()
  })

  test('highlights current room', () => {
    const { container } = render(<RoomMenu {...defaultProps} />)

    const roomButtons = container.querySelectorAll('.room-item')
    const activeRoomButton = Array.from(roomButtons).find(button =>
      button.classList.contains('room-item-active')
    )

    expect(activeRoomButton).not.toBeNull()
    expect(activeRoomButton.textContent).toContain('메인 광장')
  })

  test('calls onChangeRoom when room is clicked', () => {
    render(<RoomMenu {...defaultProps} />)

    const gameRoomButton = screen.getByText('게임방')
    fireEvent.click(gameRoomButton)

    expect(defaultProps.onChangeRoom).toHaveBeenCalledWith('room-2')
  })

  test('calls onClose when overlay is clicked', () => {
    render(<RoomMenu {...defaultProps} />)

    const overlay = document.querySelector('.room-overlay')
    fireEvent.click(overlay)

    expect(defaultProps.onClose).toHaveBeenCalled()
  })

  test('calls onClose when close button is clicked', () => {
    render(<RoomMenu {...defaultProps} />)

    const closeButton = screen.getByText('✕')
    fireEvent.click(closeButton)

    expect(defaultProps.onClose).toHaveBeenCalled()
  })

  test('renders room creation input', () => {
    render(<RoomMenu {...defaultProps} />)

    expect(screen.getByPlaceholderText('새 방 이름...')).toBeInTheDocument()
  })

  test('calls onNewRoomNameChange when input value changes', () => {
    render(<RoomMenu {...defaultProps} />)

    const input = screen.getByPlaceholderText('새 방 이름...')
    fireEvent.change(input, { target: { value: '새로운 방' } })

    expect(defaultProps.onNewRoomNameChange).toHaveBeenCalledWith('새로운 방')
  })

  test('calls onCreateRoom when create button is clicked', () => {
    render(<RoomMenu {...defaultProps} newRoomName="새로운 방" />)

    const createButton = screen.getByText('➕ 생성')
    fireEvent.click(createButton)

    expect(defaultProps.onCreateRoom).toHaveBeenCalled()
  })

  test('calls onCreateRoom when Enter key is pressed in input', () => {
    render(<RoomMenu {...defaultProps} newRoomName="새로운 방" />)

    const input = screen.getByPlaceholderText('새 방 이름...')
    fireEvent.keyDown(input, { key: 'Enter' })

    expect(defaultProps.onCreateRoom).toHaveBeenCalled()
  })

  test('calls onCreateRoom when Enter key is pressed in input', () => {
    render(<RoomMenu {...defaultProps} newRoomName="새로운 방" />)

    const input = screen.getByPlaceholderText('새 방 이름...')
    fireEvent.keyDown(input, { key: 'Enter' })

    expect(defaultProps.onCreateRoom).toHaveBeenCalled()
  })

  test('calls onNewRoomNameChange for every keystroke', () => {
    render(<RoomMenu {...defaultProps} />)

    const input = screen.getByPlaceholderText('새 방 이름...')
    fireEvent.change(input, { target: { value: 'a' } })

    expect(defaultProps.onNewRoomNameChange).toHaveBeenCalledWith('a')
  })
})