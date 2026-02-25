import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import RoomMenu from './RoomMenu'

describe('RoomMenu', () => {
  const mockRooms = [
    {
      id: 'main',
      name: '메인 광장',
      characters: {
        'char1': { id: 'char1', name: 'Player1' },
        'char2': { id: 'char2', name: 'Player2' }
      }
    },
    {
      id: 'room-2',
      name: '방 2',
      characters: {}
    },
    {
      id: 'room-3',
      name: '방 3',
      characters: null
    }
  ]

  const mockCurrentRoom = { id: 'main', name: '메인 광장' }

  it('rooms가 보여주지 않을 때는 아무것도 렌더링하지 않음', () => {
    render(
      <RoomMenu
        show={false}
        rooms={mockRooms}
        currentRoom={mockCurrentRoom}
        onJoinRoom={() => {}}
        onCreateRoom={() => {}}
        onClose={() => {}}
      />
    )

    expect(screen.queryByText('🌐 ROOMS')).not.toBeInTheDocument()
  })

  it('방 목록이 올바르게 표시됨', () => {
    render(
      <RoomMenu
        show={true}
        rooms={mockRooms}
        currentRoom={mockCurrentRoom}
        onJoinRoom={() => {}}
        onCreateRoom={() => {}}
        onClose={() => {}}
      />
    )

    expect(screen.getByText('🌐 ROOMS')).toBeInTheDocument()
    expect(screen.getByText('메인 광장')).toBeInTheDocument()
    expect(screen.getByText('방 2')).toBeInTheDocument()
    expect(screen.getByText('방 3')).toBeInTheDocument()
  })

  it('방 인원수가 올바르게 표시됨 (Bug #127 테스트)', () => {
    render(
      <RoomMenu
        show={true}
        rooms={mockRooms}
        currentRoom={mockCurrentRoom}
        onJoinRoom={() => {}}
        onCreateRoom={() => {}}
        onClose={() => {}}
      />
    )

    // 메인 광장: 2명
    expect(screen.getByText('2 👤')).toBeInTheDocument()
    // 방 2와 방 3: 0명 (총 2개의 0 👤 있어야 함)
    const zeroCountBadges = screen.getAllByText('0 👤')
    expect(zeroCountBadges).toHaveLength(2)
  })

  it('현재 방이 active 상태로 표시됨', () => {
    render(
      <RoomMenu
        show={true}
        rooms={mockRooms}
        currentRoom={mockCurrentRoom}
        onJoinRoom={() => {}}
        onCreateRoom={() => {}}
        onClose={() => {}}
      />
    )

    const mainRoomButton = screen.getByText('메인 광장').closest('button')
    expect(mainRoomButton).toHaveClass('room-item-active')

    const room2Button = screen.getByText('방 2').closest('button')
    expect(room2Button).not.toHaveClass('room-item-active')
  })

  it('방 클릭 시 onJoinRoom이 호출됨', () => {
    const handleJoinRoom = vi.fn()

    render(
      <RoomMenu
        show={true}
        rooms={mockRooms}
        currentRoom={mockCurrentRoom}
        onJoinRoom={handleJoinRoom}
        onCreateRoom={() => {}}
        onClose={() => {}}
      />
    )

    screen.getByText('방 2').closest('button').click()
    expect(handleJoinRoom).toHaveBeenCalledWith('room-2')
  })

  it('새 방 생성 시 onCreateRoom이 호출됨', () => {
    const handleCreateRoom = vi.fn()

    render(
      <RoomMenu
        show={true}
        rooms={mockRooms}
        currentRoom={mockCurrentRoom}
        onJoinRoom={() => {}}
        onCreateRoom={handleCreateRoom}
        onClose={() => {}}
      />
    )

    const input = screen.getByPlaceholderText('NEW ROOM NAME')
    input.value = '새로운 방'

    const createButton = screen.getByText('CREATE').closest('button')
    createButton.click()

    expect(handleCreateRoom).toHaveBeenCalledWith('새로운 방')
  })

  it('닫기 버튼 클릭 시 onClose가 호출됨', () => {
    const handleClose = vi.fn()

    render(
      <RoomMenu
        show={true}
        rooms={mockRooms}
        currentRoom={mockCurrentRoom}
        onJoinRoom={() => {}}
        onCreateRoom={() => {}}
        onClose={handleClose}
      />
    )

    screen.getByText('✕').closest('button').click()
    expect(handleClose).toHaveBeenCalled()
  })

  })