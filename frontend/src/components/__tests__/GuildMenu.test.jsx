/**
 * 길드 메뉴 테스트 (Phase 18)
 *
 * 테스트 항목:
 * 1. 길드 메뉴 렌더링
 * 2. 길드 없는 상태 - 길드 생성 버튼
 * 3. 길드 생성 폼 표시
 * 4. 길드 생성 (이름 입력)
 * 5. 길드 생성 (설명 입력)
 * 6. 길드 생성 폼 취소
 * 7. 길드 생성 - API 호출
 * 8. 길드 정보 표시 (이름, 레벨, 멤버 수)
 * 9. 길드 정보 표시 (경험치, 골드)
 * 10. 길드 경험치 바 계산
 * 11. 길드 설명 표시
 * 12. 멤버 목록 렌더링
 * 13. 멤버 목록 - 역할 표시
 * 14. 멤버 기여도 표시
 * 15. 역할 변경 API 호출
 * 16. 길드 해체 버튼 표시 (길드장)
 * 17. 길드 해체 API 호출
 * 18. Socket 이벤트 - guildCreated
 * 19. Socket 이벤트 - guildUpdated
 * 20. Socket 이벤트 - guildDisbanded
 * 21. Socket 이벤트 - guildExpGained
 * 22. 로딩 상태 표시
 * 23. 에러 상태 표시
 * 24. 에러 복구 버튼
 * 25. 길드장만 역할 변경 가능
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import GuildMenu from '../GuildMenu'

// Mock fetch
global.fetch = jest.fn()

// Mock socket
const mockSocket = {
  emit: jest.fn(),
  on: jest.fn(),
  off: jest.fn()
}

describe('GuildMenu', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    fetch.mockClear()
    mockSocket.emit.mockClear()
    mockSocket.on.mockClear()
    mockSocket.off.mockClear()

    // Default fetch mock - 길드 없는 상태
    fetch.mockResolvedValue({
      ok: true,
      json: async () => null
    })
  })

  describe('렌더링', () => {
    test('길드 메뉴 렌더링', () => {
      render(<GuildMenu socket={mockSocket} characterId="char-1" onClose={jest.fn()} />)
      expect(screen.getByText('🏰 길드 시스템')).toBeInTheDocument()
    })

    test('길드 없는 상태 - 길드 생성 버튼 표시', async () => {
      fetch.mockResolvedValue({
        ok: true,
        json: async () => null
      })

      render(<GuildMenu socket={mockSocket} characterId="char-1" onClose={jest.fn()} />)

      await waitFor(() => {
        expect(screen.getByText('소속된 길드가 없습니다')).toBeInTheDocument()
        expect(screen.getByText('길드 만들기')).toBeInTheDocument()
      })
    })

    test('길드 생성 폼 표시', async () => {
      const { container } = render(<GuildMenu socket={mockSocket} characterId="char-1" onClose={jest.fn()} />)

      await waitFor(() => {
        expect(screen.getByText('길드 만들기')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByText('길드 만들기'))

      await waitFor(() => {
        expect(screen.getByText('새 길드 만들기')).toBeInTheDocument()
      })
    })
  })

  describe('길드 생성', () => {
    test('길드 생성 - 이름 입력', async () => {
      const { container } = render(<GuildMenu socket={mockSocket} characterId="char-1" onClose={jest.fn()} />)

      await waitFor(() => {
        expect(screen.getByText('길드 만들기')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByText('길드 만들기'))

      const nameInput = screen.getByPlaceholderText('길드 이름 (2~20자)')
      fireEvent.change(nameInput, { target: { value: 'Test Guild' } })

      expect(nameInput.value).toBe('Test Guild')
    })

    test('길드 생성 - 설명 입력', async () => {
      const { container } = render(<GuildMenu socket={mockSocket} characterId="char-1" onClose={jest.fn()} />)

      await waitFor(() => {
        expect(screen.getByText('길드 만들기')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByText('길드 만들기'))

      const descInput = screen.getByPlaceholderText('길드 소개를 입력하세요')
      fireEvent.change(descInput, { target: { value: 'Test Description' } })

      expect(descInput.value).toBe('Test Description')
    })

    test('길드 생성 폼 취소', async () => {
      render(<GuildMenu socket={mockSocket} characterId="char-1" onClose={jest.fn()} />)

      await waitFor(() => {
        expect(screen.getByText('길드 만들기')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByText('길드 만들기'))
      expect(screen.getByText('취소')).toBeInTheDocument()

      fireEvent.click(screen.getByText('취소'))

      await waitFor(() => {
        expect(screen.queryByText('새 길드 만들기')).not.toBeInTheDocument()
      })
    })

    test('길드 생성 - API 호출', async () => {
      fetch.mockImplementationOnce(() =>
        Promise.resolve({ ok: true, json: () => Promise.resolve({ success: true }) })
      )

      const { container } = render(<GuildMenu socket={mockSocket} characterId="char-1" onClose={jest.fn()} />)

      await waitFor(() => {
        expect(screen.getByText('길드 만들기')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByText('길드 만들기'))

      const nameInput = screen.getByPlaceholderText('길드 이름 (2~20자)')
      fireEvent.change(nameInput, { target: { value: 'Test Guild' } })

      const form = container.querySelector('form')
      fireEvent.submit(form)

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith(
          'http://localhost:4000/api/guild/create',
          expect.objectContaining({
            method: 'POST',
            body: expect.stringContaining('Test Guild')
          })
        )
      })
    })

    test('길드 생성 - 이름 없으면 에러 표시', async () => {
      const { container } = render(<GuildMenu socket={mockSocket} characterId="char-1" onClose={jest.fn()} />)

      await waitFor(() => {
        expect(screen.getByText('길드 만들기')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByText('길드 만들기'))

      const form = container.querySelector('form')
      fireEvent.submit(form)

      await waitFor(() => {
        expect(screen.getByText('길드 이름을 입력해주세요')).toBeInTheDocument()
      })
    })
  })

  describe('길드 정보 표시', () => {
    const mockGuild = {
      id: 'guild-1',
      name: 'Test Guild',
      level: 5,
      description: 'This is a test guild',
      masterMemberId: 'char-1',
      maxMembers: 30,
      exp: 2500,
      maxExp: 5000,
      gold: 10000,
      members: {
        'char-1': {
          characterId: 'char-1',
          nickname: 'Player1',
          role: 'master',
          contribution: 100
        },
        'char-2': {
          characterId: 'char-2',
          nickname: 'Player2',
          role: 'member',
          contribution: 50
        }
      }
    }

    beforeEach(() => {
      fetch.mockImplementationOnce(() =>
        Promise.resolve({ ok: true, json: () => Promise.resolve(mockGuild) })
      )
    })

    test('길드 정보 표시 (이름, 레벨, 멤버 수)', async () => {
      render(<GuildMenu socket={mockSocket} characterId="char-1" onClose={jest.fn()} />)

      await waitFor(() => {
        expect(screen.getByText('Test Guild')).toBeInTheDocument()
        expect(screen.getByText('Lv. 5 길드')).toBeInTheDocument()
        expect(screen.getByText('2 / 30')).toBeInTheDocument()
      })
    })

    test('길드 정보 표시 (경험치, 골드)', async () => {
      render(<GuildMenu socket={mockSocket} characterId="char-1" onClose={jest.fn()} />)

      await waitFor(() => {
        expect(screen.getByText('2500 / 5000')).toBeInTheDocument()
        expect(screen.getByText('10000 G')).toBeInTheDocument()
      })
    })

    test('길드 경험치 바 계산', async () => {
      render(<GuildMenu socket={mockSocket} characterId="char-1" onClose={jest.fn()} />)

      await waitFor(() => {
        // 2500/5000 = 50%
        expect(screen.getByText('50%')).toBeInTheDocument()
      })
    })

    test('길드 설명 표시', async () => {
      render(<GuildMenu socket={mockSocket} characterId="char-1" onClose={jest.fn()} />)

      await waitFor(() => {
        expect(screen.getByText('This is a test guild')).toBeInTheDocument()
      })
    })
  })

  describe('멤버 목록', () => {
    const mockGuild = {
      id: 'guild-1',
      name: 'Test Guild',
      level: 5,
      masterMemberId: 'char-1',
      members: {
        'char-1': {
          characterId: 'char-1',
          nickname: 'Player1',
          role: 'master',
          contribution: 100
        },
        'char-2': {
          characterId: 'char-2',
          nickname: 'Player2',
          role: 'member',
          contribution: 50
        }
      }
    }

    beforeEach(() => {
      fetch.mockImplementationOnce(() =>
        Promise.resolve({ ok: true, json: () => Promise.resolve(mockGuild) })
      )
    })

    test('멤버 목록 렌더링', async () => {
      render(<GuildMenu socket={mockSocket} characterId="char-1" onClose={jest.fn()} />)

      await waitFor(() => {
        expect(screen.getByText('👥 길드 멤버 (2)')).toBeInTheDocument()
        expect(screen.getByText('Player1')).toBeInTheDocument()
        expect(screen.getByText('Player2')).toBeInTheDocument()
      })
    })

    test('멤버 목록 - 역할 표시', async () => {
      render(<GuildMenu socket={mockSocket} characterId="char-1" onClose={jest.fn()} />)

      await waitFor(() => {
        expect(screen.getByText('👑 방장')).toBeInTheDocument()
        expect(screen.getByText('👤 길드원')).toBeInTheDocument()
      })
    })

    test('멤버 기여도 표시', async () => {
      render(<GuildMenu socket={mockSocket} characterId="char-1" onClose={jest.fn()} />)

      await waitFor(() => {
        expect(screen.getByText('기여도: 100')).toBeInTheDocument()
        expect(screen.getByText('기여도: 50')).toBeInTheDocument()
      })
    })
  })

  describe('역할 변경', () => {
    const mockGuild = {
      id: 'guild-1',
      name: 'Test Guild',
      level: 5,
      masterMemberId: 'char-1',
      members: {
        'char-1': {
          characterId: 'char-1',
          nickname: 'Player1',
          role: 'master',
          contribution: 100
        },
        'char-2': {
          characterId: 'char-2',
          nickname: 'Player2',
          role: 'member',
          contribution: 50
        }
      }
    }

    beforeEach(() => {
      fetch.mockImplementationOnce(() =>
        Promise.resolve({ ok: true, json: () => Promise.resolve(mockGuild) })
      )
    })

    test('역할 변경 API 호출', async () => {
      fetch.mockImplementationOnce(() =>
        Promise.resolve({ ok: true, json: () => Promise.resolve(mockGuild) })
      ).mockImplementationOnce(() =>
        Promise.resolve({ ok: true, json: () => Promise.resolve({ success: true }) })
      )

      render(<GuildMenu socket={mockSocket} characterId="char-1" onClose={jest.fn()} />)

      await waitFor(() => {
        expect(screen.getByText('Player2')).toBeInTheDocument()
      })

      const roleSelect = screen.getAllByRole('combobox')[1] // Player2's role select
      fireEvent.change(roleSelect, { target: { value: 'officer' } })

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith(
          'http://localhost:4000/api/guild/change-role',
          expect.objectContaining({
            method: 'POST',
            body: expect.stringContaining('officer')
          })
        )
      })
    })
  })

  describe('길드 해체', () => {
    const mockGuild = {
      id: 'guild-1',
      name: 'Test Guild',
      level: 5,
      masterMemberId: 'char-1',
      members: {
        'char-1': {
          characterId: 'char-1',
          nickname: 'Player1',
          role: 'master',
          contribution: 100
        }
      }
    }

    beforeEach(() => {
      fetch.mockImplementationOnce(() =>
        Promise.resolve({ ok: true, json: () => Promise.resolve(mockGuild) })
      )
    })

    test('길드 해체 버튼 표시 (길드장)', async () => {
      render(<GuildMenu socket={mockSocket} characterId="char-1" onClose={jest.fn()} />)

      await waitFor(() => {
        expect(screen.getByText('길드 해체')).toBeInTheDocument()
      })
    })

    test('길드 해체 API 호출', async () => {
      const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(true)

      fetch.mockImplementationOnce(() =>
        Promise.resolve({ ok: true, json: () => Promise.resolve(mockGuild) })
      ).mockImplementationOnce(() =>
        Promise.resolve({ ok: true, json: () => Promise.resolve({ success: true }) })
      )

      render(<GuildMenu socket={mockSocket} characterId="char-1" onClose={jest.fn()} />)

      await waitFor(() => {
        expect(screen.getByText('길드 해체')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByText('길드 해체'))

      await waitFor(() => {
        expect(confirmSpy).toHaveBeenCalled()
        expect(fetch).toHaveBeenCalledWith(
          'http://localhost:4000/api/guild/disband',
          expect.objectContaining({
            method: 'POST'
          })
        )
      })

      confirmSpy.mockRestore()
    })
  })

  describe('Socket 이벤트', () => {
    test('Socket 이벤트 - guildCreated', async () => {
      const onCallback = jest.fn()
      mockSocket.on.mockImplementation((event, callback) => {
        if (event === 'guildCreated') onCallback.mockImplementation(callback)
      })

      render(<GuildMenu socket={mockSocket} characterId="char-1" onClose={jest.fn()} />)

      await waitFor(() => {
        expect(mockSocket.on).toHaveBeenCalledWith('guildCreated', expect.any(Function))
      })

      expect(onCallback).toBeDefined()
    })

    test('Socket 이벤트 - guildUpdated', async () => {
      render(<GuildMenu socket={mockSocket} characterId="char-1" onClose={jest.fn()} />)

      await waitFor(() => {
        expect(mockSocket.on).toHaveBeenCalledWith('guildUpdated', expect.any(Function))
      })
    })

    test('Socket 이벤트 - guildDisbanded', async () => {
      render(<GuildMenu socket={mockSocket} characterId="char-1" onClose={jest.fn()} />)

      await waitFor(() => {
        expect(mockSocket.on).toHaveBeenCalledWith('guildDisbanded', expect.any(Function))
      })
    })

    test('Socket 이벤트 - guildExpGained', async () => {
      render(<GuildMenu socket={mockSocket} characterId="char-1" onClose={jest.fn()} />)

      await waitFor(() => {
        expect(mockSocket.on).toHaveBeenCalledWith('guildExpGained', expect.any(Function))
      })
    })
  })

  describe('로딩/에러 상태', () => {
    test('로딩 상태 표시', async () => {
      fetch.mockImplementationOnce(() =>
        new Promise(resolve => setTimeout(() => resolve({ ok: true, json: () => Promise.resolve(null) }), 100))
      )

      render(<GuildMenu socket={mockSocket} characterId="char-1" onClose={jest.fn()} />)

      expect(screen.getByText('로딩 중...')).toBeInTheDocument()
    })

    test('에러 상태 표시', async () => {
      fetch.mockRejectedValueOnce(new Error('Network Error'))

      render(<GuildMenu socket={mockSocket} characterId="char-1" onClose={jest.fn()} />)

      await waitFor(() => {
        expect(screen.getByText('Network Error')).toBeInTheDocument()
        expect(screen.getByText('다시 시도')).toBeInTheDocument()
      })
    })

    test('에러 복구 버튼 클릭', async () => {
      fetch.mockRejectedValueOnce(new Error('Network Error'))

      render(<GuildMenu socket={mockSocket} characterId="char-1" onClose={jest.fn()} />)

      await waitFor(() => {
        expect(screen.getByText('다시 시도')).toBeInTheDocument()
      })

      // Reset mock to succeed
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => null
      })

      fireEvent.click(screen.getByText('다시 시도'))

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledTimes(2) // First failed, second retry
      })
    })
  })

  describe('길드장만 역할 변경 가능', () => {
    test('비길드장은 역할 변경 버튼 표시 안함', async () => {
      const mockGuild = {
        id: 'guild-1',
        name: 'Test Guild',
        level: 5,
        masterMemberId: 'char-2', // 다른 사람이 길드장
        members: {
          'char-1': {
            characterId: 'char-1',
            nickname: 'Player1',
            role: 'member',
            contribution: 50
          }
        }
      }

      fetch.mockImplementationOnce(() =>
        Promise.resolve({ ok: true, json: () => Promise.resolve(mockGuild) })
      )

      render(<GuildMenu socket={mockSocket} characterId="char-1" onClose={jest.fn()} />)

      await waitFor(() => {
        expect(screen.getByText('Player1')).toBeInTheDocument()
      })

      const roleSelects = screen.queryAllByRole('combobox')
      expect(roleSelects.length).toBe(0) // 역할 변경 셀렉트 없음
    })
  })
})