/**
 * SkillMenu.test.jsx - 스킬 메뉴 UI 테스트
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi, describe, test, expect, beforeEach } from 'vitest'
import SkillMenu from '../SkillMenu'

// 모의 socket 객체
const mockSocket = {
  emit: vi.fn(),
  on: vi.fn(),
  off: vi.fn(),
  once: vi.fn()
}

// 모의 characterData
const mockCharacterData = {
  id: 'test-character-1',
  name: 'TestCharacter',
  level: 5
}

describe('SkillMenu 컴포넌트', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // T1: 기본 렌더링
  test('T1: 기본 렌더링 테스트', () => {
    render(
      <SkillMenu
        socket={mockSocket}
        characterData={mockCharacterData}
        onClose={vi.fn()}
      />
    )

    expect(screen.getByText('⚔️ 스킬 관리')).toBeInTheDocument()
    expect(screen.getByText('닫기')).toBeInTheDocument()
  })

  // T2: 닫기 버튼 클릭
  test('T2: 닫기 버튼 클릭 테스트', () => {
    const mockOnClose = vi.fn()
    render(
      <SkillMenu
        socket={mockSocket}
        characterData={mockCharacterData}
        onClose={mockOnClose}
      />
    )

    fireEvent.click(screen.getByText('닫기'))
    expect(mockOnClose).toHaveBeenCalledTimes(1)
  })

  // T3: 초기 렌더링 시 Socket 이벤트 등록
  test('T3: 초기 렌더링 시 Socket 이벤트 등록 테스트', () => {
    render(
      <SkillMenu
        socket={mockSocket}
        characterData={mockCharacterData}
        onClose={vi.fn()}
      />
    )

    expect(mockSocket.on).toHaveBeenCalledWith('learnableSkills', expect.any(Function))
    expect(mockSocket.on).toHaveBeenCalledWith('equippedSkills', expect.any(Function))
    expect(mockSocket.on).toHaveBeenCalledWith('learnedSkills', expect.any(Function))
  })

  // T4: 언마운트 시 Socket 이벤트 제거
  test('T4: 언마운트 시 Socket 이벤트 제거 테스트', () => {
    const { unmount } = render(
      <SkillMenu
        socket={mockSocket}
        characterData={mockCharacterData}
        onClose={vi.fn()}
      />
    )

    unmount()
    expect(mockSocket.off).toHaveBeenCalledWith('learnableSkills')
    expect(mockSocket.off).toHaveBeenCalledWith('equippedSkills')
    expect(mockSocket.off).toHaveBeenCalledWith('learnedSkills')
  })

  // T5: 학습 가능 스킬 데이터 수신
  test('T5: 학습 가능 스킬 데이터 수신 테스트', async () => {
    const mockLearnableSkills = [
      {
        id: 'slash',
        name: '베기',
        description: '전방의 적에게 물리 공격',
        type: 'active',
        category: 'combat',
        cooldown: 3000,
        requiredLevel: 1,
        icon: '⚔️'
      }
    ]

    render(
      <SkillMenu
        socket={mockSocket}
        characterData={mockCharacterData}
        onClose={vi.fn()}
      />
    )

    // learnableSkills 이벤트 핸들러 실행
    const learnableSkillsHandler = mockSocket.on.mock.calls.find(
      call => call[0] === 'learnableSkills'
    )[1]
    learnableSkillsHandler(mockLearnableSkills)

    await waitFor(() => {
      expect(screen.getByText('베기')).toBeInTheDocument()
    })
  })

  // T6: 장착된 스킬 데이터 수신
  test('T6: 장착된 스킬 데이터 수신 테스트', async () => {
    const mockEquippedSkills = ['slash', 'heal']

    render(
      <SkillMenu
        socket={mockSocket}
        characterData={mockCharacterData}
        onClose={vi.fn()}
      />
    )

    const equippedSkillsHandler = mockSocket.on.mock.calls.find(
      call => call[0] === 'equippedSkills'
    )[1]
    equippedSkillsHandler(mockEquippedSkills)

    await waitFor(() => {
      expect(screen.getByText('장착 중 (2)')).toBeInTheDocument()
    })
  })

  // T7: 학습 완료 스킬 데이터 수신
  test('T7: 학습 완료 스킬 데이터 수신 테스트', async () => {
    const mockLearnedSkills = {
      skills: [
        {
          id: 'slash',
          name: '베기',
          icon: '⚔️'
        }
      ],
      skillLevels: { slash: 2 },
      skillExp: { slash: 150 }
    }

    render(
      <SkillMenu
        socket={mockSocket}
        characterData={mockCharacterData}
        onClose={vi.fn()}
      />
    )

    const learnedSkillsHandler = mockSocket.on.mock.calls.find(
      call => call[0] === 'learnedSkills'
    )[1]
    learnedSkillsHandler(mockLearnedSkills)

    await waitFor(() => {
      expect(screen.getByText('Level 2')).toBeInTheDocument()
    })
  })

  // T8: 스킬 학습 버튼 클릭
  test('T8: 스킬 학습 버튼 클릭 테스트', async () => {
    const mockLearnableSkills = [
      {
        id: 'slash',
        name: '베기',
        description: '전방의 적에게 물리 공격',
        type: 'active',
        category: 'combat',
        cooldown: 3000,
        requiredLevel: 1,
        icon: '⚔️'
      }
    ]

    render(
      <SkillMenu
        socket={mockSocket}
        characterData={mockCharacterData}
        onClose={vi.fn()}
      />
    )

    const learnableSkillsHandler = mockSocket.on.mock.calls.find(
      call => call[0] === 'learnableSkills'
    )[1]
    learnableSkillsHandler(mockLearnableSkills)

    await waitFor(() => {
      const learnButton = screen.getByText(/학습/)
      expect(learnButton).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText(/학습/))

    expect(mockSocket.emit).toHaveBeenCalledWith('learnSkill', {
      characterId: 'test-character-1',
      skillId: 'slash'
    })
  })

  // T9: 탭 전환 테스트
  test('T9: 탭 전환 테스트', () => {
    render(
      <SkillMenu
        socket={mockSocket}
        characterData={mockCharacterData}
        onClose={vi.fn()}
      />
    )

    const learnedTab = screen.getByText('학습 완료')
    fireEvent.click(learnedTab)

    expect(learnedTab).toHaveStyle({ backgroundColor: '#2196F3' })
  })

  // T10: 비어있는 메시지 표시
  test('T10: 비어있는 메시지 표시 테스트', async () => {
    render(
      <SkillMenu
        socket={mockSocket}
        characterData={mockCharacterData}
        onClose={vi.fn()}
      />
    )

    // 빈 데이터 전송
    const learnableSkillsHandler = mockSocket.on.mock.calls.find(
      call => call[0] === 'learnableSkills'
    )[1]
    learnableSkillsHandler([])

    await waitFor(() => {
      expect(screen.getByText('학습 가능한 스킬이 없습니다.')).toBeInTheDocument()
    })
  })
})