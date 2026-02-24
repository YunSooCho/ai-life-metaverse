import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import RaidMenu from '../RaidMenu'

// Mock socket
const mockSocket = {
  on: jest.fn(),
  off: jest.fn(),
  emit: jest.fn()
}

// Mock fetch
global.fetch = jest.fn()

describe('RaidMenu', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockSocket.on.mockReturnValue(mockSocket)
    mockSocket.off.mockReturnValue(mockSocket)
    mockSocket.emit.mockReturnValue(mockSocket)
  })

  describe('Render and UI', () => {
    it('should render loading state', () => {
      const { container } = render(
        <RaidMenu
          socket={mockSocket}
          characterId="char1"
          onClose={jest.fn()}
        />
      )
      expect(container.querySelector('.raid-loading')).toBeInTheDocument()
      expect(screen.getByText('로딩 중...')).toBeInTheDocument()
    })

    it('should render error state', async () => {
      fetch.mockRejectedValueOnce(new Error('API 오류'))

      const { container } = render(
        <RaidMenu
          socket={mockSocket}
          characterId="char1"
          onClose={jest.fn()}
        />
      )

      await waitFor(() => {
        expect(container.querySelector('.raid-error')).toBeInTheDocument()
        expect(screen.getByText('API 오류')).toBeInTheDocument()
      })
    })

    it('should render raid list', async () => {
      const mockRaids = [
        {
          id: 'raid1',
          name: '불의 제단',
          difficulty: 'easy',
          status: 'waiting',
          minParticipants: 2,
          maxParticipants: 10,
          minLevel: 10,
          description: '불의 정령을 물리치세요',
          participants: []
        },
        {
          id: 'raid2',
          name: '얼음의 성',
          difficulty: 'hard',
          status: 'waiting',
          minParticipants: 5,
          maxParticipants: 10,
          minLevel: 20,
          description: '얼음의 마법사를 물리치세요',
          participants: []
        }
      ]

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ raids: mockRaids })
      })

      const { container } = render(
        <RaidMenu
          socket={mockSocket}
          characterId="char1"
          onClose={jest.fn()}
        />
      )

      await waitFor(() => {
        expect(screen.getByText('불의 제단')).toBeInTheDocument()
        expect(screen.getByText('얼음의 성')).toBeInTheDocument()
      })
    })

    it('should render empty raid list message', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ raids: [] })
      })

      const { container } = render(
        <RaidMenu
          socket={mockSocket}
          characterId="char1"
          onClose={jest.fn()}
        />
      )

      await waitFor(() => {
        expect(container.querySelector('.raids-empty')).toBeInTheDocument()
        expect(screen.getByText('참여 가능한 레이드가 없습니다')).toBeInTheDocument()
      })
    })
  })

  describe('Raid Join', () => {
    it('should call handleJoinRaid and emit socket event when join button clicked', async () => {
      const mockRaid = {
        id: 'raid1',
        name: '테스트 레이드',
        difficulty: 'normal',
        status: 'waiting',
        minParticipants: 2,
        maxParticipants: 10,
        minLevel: 1,
        participants: []
      }

      fetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ raids: [mockRaid] })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ raid: mockRaid })
        })

      const { container } = render(
        <RaidMenu
          socket={mockSocket}
          characterId="char1"
          onClose={jest.fn()}
        />
      )

      await waitFor(() => {
        expect(screen.getByText('테스트 레이드')).toBeInTheDocument()
      })

      const joinButton = await screen.findByText('참여')
      fireEvent.click(joinButton)

      await waitFor(() => {
        expect(mockSocket.emit).toHaveBeenCalledWith('joinRaid', {
          characterId: 'char1',
          raidId: 'raid1'
        })
      })
    })
  })

  describe('Active Raid Display', () => {
    it('should display active raid when character is participating', async () => {
      const mockActiveRaid = {
        id: 'raid1',
        name: '진행 중인 레이드',
        difficulty: 'hard',
        status: 'in_progress',
        minParticipants: 2,
        maxParticipants: 10,
        minLevel: 10,
        bossName: '불의 정령',
        currentHp: 50000,
        maxHp: 100000,
        participants: [{ id: 'char1' }]
      }

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          raids: [],
          activeRaid: mockActiveRaid
        })
      })

      const { container } = render(
        <RaidMenu
          socket={mockSocket}
          characterId="char1"
          onClose={jest.fn()}
        />
      )

      await waitFor(() => {
        expect(screen.getByText('⚔️ 현재 레이드')).toBeInTheDocument()
        expect(screen.getByText('진행 중인 레이드')).toBeInTheDocument()
        expect(screen.getByText('⚔️ 진행 중')).toBeInTheDocument()
      })
    })

    it('should display raid HP bar during battle', async () => {
      const mockActiveRaid = {
        id: 'raid1',
        name: 'HP 테스트 레이드',
        difficulty: 'normal',
        status: 'in_progress',
        bossName: '테스트 보스',
        currentHp: 50000,
        maxHp: 100000,
        participants: [{ id: 'card1' }]
      }

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          raids: [],
          activeRaid: mockActiveRaid
        })
      })

      const { container } = render(
        <RaidMenu
          socket={mockSocket}
          characterId="card1"
          onClose={jest.fn()}
        />
      )

      await waitFor(() => {
        expect(screen.getByText('테스트 보스 HP')).toBeInTheDocument()
        expect(screen.getByText('50000 / 100000')).toBeInTheDocument()
        const hpFill = container.querySelector('.raid-hp-fill')
        expect(hpFill).toHaveStyle({ width: '50%' })
      })
    })

    it('should display raid completion rewards', async () => {
      const mockActiveRaid = {
        id: 'raid1',
        name: '완료된 레이드',
        difficulty: 'normal',
        status: 'completed',
        rewards: {
          exp: 1000,
          items: ['검', '방패']
        },
        participants: [{ id: 'char1' }]
      }

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          raids: [],
          activeRaid: mockActiveRaid
        })
      })

      const { container } = render(
        <RaidMenu
          socket={mockSocket}
          characterId="char1"
          onClose={jest.fn()}
        />
      )

      await waitFor(() => {
        expect(screen.getByText('🎉 레이드 완료!')).toBeInTheDocument()
        expect(screen.getByText('1000 EXP')).toBeInTheDocument()
        expect(screen.getByText('2개')).toBeInTheDocument()
        expect(screen.getByText('보상 수령')).toBeInTheDocument()
      })
    })

    it('should call handleLeaveRaid and emit socket event when leave button clicked', async () => {
      const mockActiveRaid = {
        id: 'raid1',
        name: '대기 중 레이드',
        difficulty: 'normal',
        status: 'waiting',
        participants: [{ id: 'char1' }]
      }

      fetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            raids: [],
            activeRaid: mockActiveRaid
          })
        })
        .mockResolvedValueOnce({
          ok: true
        })

      const { container } = render(
        <RaidMenu
          socket={mockSocket}
          characterId="char1"
          onClose={jest.fn()}
        />
      )

      await waitFor(() => {
        expect(screen.getByText('레이드 나가기')).toBeInTheDocument()
      })

      const leaveButton = screen.getByText('레이드 나가기')
      fireEvent.click(leaveButton)

      await waitFor(() => {
        expect(mockSocket.emit).toHaveBeenCalledWith('leaveRaid', {
          characterId: 'char1',
          raidId: 'raid1'
        })
      })
    })
  })

  describe('Socket Events', () => {
    it('should register socket listeners on mount', () => {
      render(
        <RaidMenu
          socket={mockSocket}
          characterId="char1"
          onClose={jest.fn()}
        />
      )

      expect(mockSocket.on).toHaveBeenCalledWith('raidCreated', expect.any(Function))
      expect(mockSocket.on).toHaveBeenCalledWith('raidUpdated', expect.any(Function))
      expect(mockSocket.on).toHaveBeenCalledWith('raidCompleted', expect.any(Function))
      expect(mockSocket.on).toHaveBeenCalledWith('raidFailed', expect.any(Function))
    })

    it('should unregister socket listeners on unmount', () => {
      const { unmount } = render(
        <RaidMenu
          socket={mockSocket}
          characterId="char1"
          onClose={jest.fn()}
        />
      )

      unmount()

      expect(mockSocket.off).toHaveBeenCalledWith('raidCreated', expect.any(Function))
      expect(mockSocket.off).toHaveBeenCalledWith('raidUpdated', expect.any(Function))
      expect(mockSocket.off).toHaveBeenCalledWith('raidCompleted', expect.any(Function))
      expect(mockSocket.off).toHaveBeenCalledWith('raidFailed', expect.any(Function))
    })
  })

  describe('Difficulty Labels', () => {
    it('should show correct difficulty labels', async () => {
      const mockRaids = [
        { id: 'raid1', name: '쉬움', difficulty: 'easy', status: 'waiting', minParticipants: 2, maxParticipants: 10, participants: [] },
        { id: 'raid2', name: '보통', difficulty: 'normal', status: 'waiting', minParticipants: 2, maxParticipants: 10, participants: [] },
        { id: 'raid3', name: '어려움', difficulty: 'hard', status: 'waiting', minParticipants: 2, maxParticipants: 10, participants: [] },
        { id: 'raid4', name: '악몽', difficulty: 'nightmare', status: 'waiting', minParticipants: 2, maxParticipants: 10, participants: [] }
      ]

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ raids: mockRaids })
      })

      render(
        <RaidMenu
          socket={mockSocket}
          characterId="char1"
          onClose={jest.fn()}
        />
      )

      await waitFor(() => {
        expect(screen.getByText('🌱 쉬움')).toBeInTheDocument()
        expect(screen.getByText('⚔️ 보통')).toBeInTheDocument()
        expect(screen.getByText('🔥 어려움')).toBeInTheDocument()
        expect(screen.getByText('💀 악몽')).toBeInTheDocument()
      })
    })
  })
})