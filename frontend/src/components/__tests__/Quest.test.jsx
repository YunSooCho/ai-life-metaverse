import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import Quest from '../Quest'

describe('Quest Component', () => {
  const mockOnClose = vi.fn()
  const mockOnAcceptQuest = vi.fn()
  const mockOnClaimReward = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  const sampleQuests = {
    welcome: {
      id: 'welcome',
      title: 'AI 세계에 오신 것을 환영합니다!',
      description: 'AI 유리에게 인사하고 채팅을 시작해보세요.',
      questType: 'main',
      status: 'progress',
      objectives: [
        {
          id: 'greet_ai',
          description: 'AI 유리에게 인사하기',
          type: 'interact',
          targetId: 'ai-agent-1',
          requiredCount: 1,
          currentCount: 0
        }
      ],
      reward: {
        points: 100,
        experience: 50,
        items: [
          { id: 'healthPotion', quantity: 2 }
        ]
      }
    },
    explore_park: {
      id: 'explore_park',
      title: '공원 탐험',
      description: '공원을 방문하여 자연을 즐겨보세요.',
      questType: 'main',
      status: 'completed',
      objectives: [
        {
          id: 'visit_park',
          description: '공원 방문하기',
          type: 'visit_building',
          targetId: 3,
          requiredCount: 1,
          currentCount: 1
        }
      ],
      reward: {
        points: 150,
        experience: 100
      }
    }
  }

  const sampleAvailableQuests = {
    visit_cafe: {
      id: 'visit_cafe',
      title: '카페에서의 휴식',
      description: '카페를 방문하여 휴식을 취하세요.',
      questType: 'main',
      status: 'available',
      objectives: [
        {
          id: 'visit_cafe',
          description: '카페 방문하기',
          type: 'visit_building',
          targetId: 2,
          requiredCount: 1,
          currentCount: 0
        }
      ],
      reward: {
        points: 120,
        experience: 80
      }
    }
  }

  describe('Rendering', () => {
    it('should not render when show is false', () => {
      const { container } = render(
        <Quest
          show={false}
          quests={sampleQuests}
          availableQuests={sampleAvailableQuests}
          onAcceptQuest={mockOnAcceptQuest}
          onClaimReward={mockOnClaimReward}
          onClose={mockOnClose}
        />
      )

      expect(container.querySelector('.quest-overlay')).toBeNull()
    })

    it('should render correctly when show is true', () => {
      render(
        <Quest
          show={true}
          quests={sampleQuests}
          availableQuests={sampleAvailableQuests}
          onAcceptQuest={mockOnAcceptQuest}
          onClaimReward={mockOnClaimReward}
          onClose={mockOnClose}
        />
      )

      expect(screen.getByText('📋 퀘스트')).toBeInTheDocument()
      expect(screen.getByText('진행 중')).toBeInTheDocument()
    })

    it('should render quest title and description', () => {
      render(
        <Quest
          show={true}
          quests={sampleQuests}
          availableQuests={sampleAvailableQuests}
          onAcceptQuest={mockOnAcceptQuest}
          onClaimReward={mockOnClaimReward}
          onClose={mockOnClose}
        />
      )

      expect(screen.getByText('AI 세계에 오신 것을 환영합니다!')).toBeInTheDocument()
      expect(screen.getByText('AI 유리에게 인사하고 채팅을 시작해보세요.')).toBeInTheDocument()
    })

    it('should display quest type badges', () => {
      render(
        <Quest
          show={true}
          quests={sampleQuests}
          availableQuests={sampleAvailableQuests}
          onAcceptQuest={mockOnAcceptQuest}
          onClaimReward={mockOnClaimReward}
          onClose={mockOnClose}
        />
      )

      expect(screen.getAllByText('메인 퀘스트')[0]).toBeInTheDocument()
    })

    it('should display quest objectives', () => {
      render(
        <Quest
          show={true}
          quests={sampleQuests}
          availableQuests={sampleAvailableQuests}
          onAcceptQuest={mockOnAcceptQuest}
          onClaimReward={mockOnClaimReward}
          onClose={mockOnClose}
        />
      )

      expect(screen.getByText('AI 유리에게 인사하기')).toBeInTheDocument()
    })

    it('should display quest rewards', () => {
      render(
        <Quest
          show={true}
          quests={sampleQuests}
          availableQuests={sampleAvailableQuests}
          onAcceptQuest={mockOnAcceptQuest}
          onClaimReward={mockOnClaimReward}
          onClose={mockOnClose}
        />
      )

      expect(screen.getAllByText('보상')[0]).toBeInTheDocument()
      expect(screen.getByText('🏆 100 포인트')).toBeInTheDocument()
      expect(screen.getByText('⭐ 50 경험치')).toBeInTheDocument()
    })

    it('should show empty state when no active quests', () => {
      render(
        <Quest
          show={true}
          quests={{}}
          availableQuests={sampleAvailableQuests}
          onAcceptQuest={mockOnAcceptQuest}
          onClaimReward={mockOnClaimReward}
          onClose={mockOnClose}
        />
      )

      expect(screen.getByText('진행 중인 퀘스트가 없습니다')).toBeInTheDocument()
    })

    it('should show completed quests separately', () => {
      render(
        <Quest
          show={true}
          quests={sampleQuests}
          availableQuests={sampleAvailableQuests}
          onAcceptQuest={mockOnAcceptQuest}
          onClaimReward={mockOnClaimReward}
          onClose={mockOnClose}
        />
      )

      expect(screen.getByText('완료')).toBeInTheDocument()
      expect(screen.getByText('✓ 완료')).toBeInTheDocument()
    })

    it('should show available quests', () => {
      render(
        <Quest
          show={true}
          quests={sampleQuests}
          availableQuests={sampleAvailableQuests}
          onAcceptQuest={mockOnAcceptQuest}
          onClaimReward={mockOnClaimReward}
          onClose={mockOnClose}
        />
      )

      expect(screen.getByText('수락 가능')).toBeInTheDocument()
      expect(screen.getByText('카페에서의 휴식')).toBeInTheDocument()
    })
  })

  describe('Progress Display', () => {
    it('should show progress percentage', () => {
      render(
        <Quest
          show={true}
          quests={sampleQuests}
          availableQuests={sampleAvailableQuests}
          onAcceptQuest={mockOnAcceptQuest}
          onClaimReward={mockOnClaimReward}
          onClose={mockOnClose}
        />
      )

      expect(screen.getByText('0%')).toBeInTheDocument()
    })

    it('should check completed objectives', () => {
      const questWithProgress = {
        ...sampleQuests,
        welcome: {
          ...sampleQuests.welcome,
          objectives: [
            {
              ...sampleQuests.welcome.objectives[0],
              currentCount: 1
            }
          ]
        }
      }

      render(
        <Quest
          show={true}
          quests={questWithProgress}
          availableQuests={sampleAvailableQuests}
          onAcceptQuest={mockOnAcceptQuest}
          onClaimReward={mockOnClaimReward}
          onClose={mockOnClose}
        />
      )

      expect(screen.getByText('100%')).toBeInTheDocument()
    })

    it('should show claim button when quest is completable', () => {
      const completableQuest = {
        welcome: {
          ...sampleQuests.welcome,
          objectives: [
            {
              ...sampleQuests.welcome.objectives[0],
              currentCount: 1
            }
          ]
        }
      }

      render(
        <Quest
          show={true}
          quests={completableQuest}
          availableQuests={sampleAvailableQuests}
          onAcceptQuest={mockOnAcceptQuest}
          onClaimReward={mockOnClaimReward}
          onClose={mockOnClose}
        />
      )

      expect(screen.getByText('보상 받기')).toBeInTheDocument()
    })
  })

  describe('Interactions', () => {
    it('should call onClose when close button is clicked', () => {
      render(
        <Quest
          show={true}
          quests={sampleQuests}
          availableQuests={sampleAvailableQuests}
          onAcceptQuest={mockOnAcceptQuest}
          onClaimReward={mockOnClaimReward}
          onClose={mockOnClose}
        />
      )

      const closeButton = screen.getByText('✕')
      fireEvent.click(closeButton)

      expect(mockOnClose).toHaveBeenCalledTimes(1)
    })

    it('should call onAcceptQuest when accept button is clicked', () => {
      render(
        <Quest
          show={true}
          quests={sampleQuests}
          availableQuests={sampleAvailableQuests}
          onAcceptQuest={mockOnAcceptQuest}
          onClaimReward={mockOnClaimReward}
          onClose={mockOnClose}
        />
      )

      const acceptButton = screen.getByText('수락하기')
      fireEvent.click(acceptButton)

      expect(mockOnAcceptQuest).toHaveBeenCalledWith('visit_cafe')
    })

    it('should call onClaimReward when claim button is clicked', () => {
      const completableQuest = {
        welcome: {
          ...sampleQuests.welcome,
          objectives: [
            {
              ...sampleQuests.welcome.objectives[0],
              currentCount: 1
            }
          ]
        }
      }

      render(
        <Quest
          show={true}
          quests={completableQuest}
          availableQuests={sampleAvailableQuests}
          onAcceptQuest={mockOnAcceptQuest}
          onClaimReward={mockOnClaimReward}
          onClose={mockOnClose}
        />
      )

      const claimButton = screen.getByText('보상 받기')
      fireEvent.click(claimButton)

      expect(mockOnClaimReward).toHaveBeenCalledWith('welcome')
    })
  })

  describe('Quest Types', () => {
    it('should display main quest with correct styling', () => {
      const { container } = render(
        <Quest
          show={true}
          quests={sampleQuests}
          availableQuests={sampleAvailableQuests}
          onAcceptQuest={mockOnAcceptQuest}
          onClaimReward={mockOnClaimReward}
          onClose={mockOnClose}
        />
      )

      const mainQuestItems = container.querySelectorAll('.quest-main')
      expect(mainQuestItems.length).toBeGreaterThan(0)
    })

    it('should display side quest with correct styling', () => {
      const sideQuest = {
        gym_training: {
          id: 'gym_training',
          title: '체육관 훈련',
          description: '체육관을 방문하여 운동하세요.',
          questType: 'side',
          status: 'progress',
          objectives: [
            {
              id: 'visit_gym',
              description: '체육관 방문하기',
              type: 'visit_building',
              targetId: 5,
              requiredCount: 1,
              currentCount: 0
            }
          ],
          reward: {
            points: 180
          }
        }
      }

      const { container } = render(
        <Quest
          show={true}
          quests={sideQuest}
          availableQuests={sampleAvailableQuests}
          onAcceptQuest={mockOnAcceptQuest}
          onClaimReward={mockOnClaimReward}
          onClose={mockOnClose}
        />
      )

      const sideQuestItems = container.querySelectorAll('.quest-side')
      expect(sideQuestItems.length).toBeGreaterThan(0)
    })
  })

  describe('Duration Objectives', () => {
    it('should format duration objectives correctly', () => {
      const durationQuest = {
        explore_park: {
          id: 'explore_park',
          title: '공원 탐험',
          description: '공원을 방문하여 자연을 즐겨보세요.',
          questType: 'main',
          status: 'progress',
          objectives: [
            {
              id: 'stay_park',
              description: '공원에서 30초 이상 체류하기',
              type: 'duration',
              targetId: 3,
              requiredCount: 30000,
              currentCount: 15000,
              unit: 'ms'
            }
          ],
          reward: {
            points: 150
          }
        }
      }

      render(
        <Quest
          show={true}
          quests={durationQuest}
          availableQuests={{}}
          onAcceptQuest={mockOnAcceptQuest}
          onClaimReward={mockOnClaimReward}
          onClose={mockOnClose}
        />
      )

      expect(screen.getByText('15/30초')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(
        <Quest
          show={true}
          quests={sampleQuests}
          availableQuests={sampleAvailableQuests}
          onAcceptQuest={mockOnAcceptQuest}
          onClaimReward={mockOnClaimReward}
          onClose={mockOnClose}
        />
      )

      const closeButtons = screen.getAllByText('✕')
      expect(closeButtons.length).toBeGreaterThan(0)
    })
  })
})