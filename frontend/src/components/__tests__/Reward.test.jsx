import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/react'
import Reward from '../Reward'

describe('Reward Component', () => {
  const mockOnClose = vi.fn()
  const mockOnClaimReward = vi.fn()

  const defaultProps = {
    show: true,
    onClose: mockOnClose,
    characterId: 'test-character',
    onClaimReward: mockOnClaimReward,
    claimedRewards: []
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render reward modal when show is true', () => {
      render(<Reward {...defaultProps} />)
      expect(screen.getByText('🎁 보상 센터')).toBeInTheDocument()
    })

    it('should not render when show is false', () => {
      render(<Reward {...defaultProps} show={false} />)
      expect(screen.queryByText('🎁 보상 센터')).not.toBeInTheDocument()
    })

    it('should display all available rewards', () => {
      render(<Reward {...defaultProps} />)
      expect(screen.getByText('첫 로그인 보상')).toBeInTheDocument()
      expect(screen.getByText('일일 보너스')).toBeInTheDocument()
      expect(screen.getByText('업적 달성 보상')).toBeInTheDocument()
    })

    it('should display reward points', () => {
      render(<Reward {...defaultProps} />)
      expect(screen.getByText('💎 100점')).toBeInTheDocument()
      expect(screen.getByText('💎 50점')).toBeInTheDocument()
      expect(screen.getByText('💎 200점')).toBeInTheDocument()
    })

    it('should display reward experience', () => {
      render(<Reward {...defaultProps} />)
      expect(screen.getByText('⭐ 50경험치')).toBeInTheDocument()
      expect(screen.getByText('⭐ 20경험치')).toBeInTheDocument()
      expect(screen.getByText('⭐ 150경험치')).toBeInTheDocument()
    })

    it('should display reward items', () => {
      render(<Reward {...defaultProps} />)
      expect(screen.getByText('❤️ 체력 포션 x3')).toBeInTheDocument()
      expect(screen.getByText('🪙 코인 x50')).toBeInTheDocument()
      expect(screen.getByText('🎁 선물 상자 x1')).toBeInTheDocument()
      expect(screen.getByText('⚡ 경험치 포션 x2')).toBeInTheDocument()
    })

    it('should show claim button for unclaimed rewards', () => {
      render(<Reward {...defaultProps} />)
      const claimButtons = screen.getAllByText('수령')
      expect(claimButtons.length).toBe(3)
    })

    it('should show claimed badge for claimed rewards', () => {
      render(<Reward {...defaultProps} claimedRewards={['firstLogin']} />)
      expect(screen.getByText('수령 완료')).toBeInTheDocument()
    })

    it('should have claimed class on claimed rewards', () => {
      const { container } = render(<Reward {...defaultProps} claimedRewards={['firstLogin']} />)
      const claimedCard = container.querySelector('.reward-item.claimed')
      expect(claimedCard).toBeInTheDocument()
    })
  })

  describe('Interaction', () => {
    it('should call onClose when close button is clicked', () => {
      render(<Reward {...defaultProps} />)
      const closeButton = screen.getByText('✕')
      fireEvent.click(closeButton)
      expect(mockOnClose).toHaveBeenCalledTimes(1)
    })

    it('should select reward when clicked', () => {
      const { container } = render(<Reward {...defaultProps} />)
      const firstReward = container.querySelector('.reward-item')
      expect(firstReward).not.toHaveClass('selected')
      fireEvent.click(firstReward)
      expect(firstReward).toHaveClass('selected')
    })

    it('should call onClaimReward when claim button is clicked', () => {
      render(<Reward {...defaultProps} />)
      const claimButtons = screen.getAllByText('수령')
      fireEvent.click(claimButtons[0])
      expect(mockOnClaimReward).toHaveBeenCalledWith('test-character', 'firstLogin')
    })

    it('should not call onClaimReward for already claimed rewards', () => {
      render(<Reward {...defaultProps} claimedRewards={['firstLogin']} />)
      const claimButtons = screen.getAllByText('수령')
      expect(claimButtons.length).toBe(2)
      expect(screen.getByText('수령 완료').closest('.reward-item')).toHaveClass('claimed')
    })

    it('should deselect reward when clicking same reward again', () => {
      const { container } = render(<Reward {...defaultProps} />)
      const firstReward = container.querySelector('.reward-item')
      fireEvent.click(firstReward)
      expect(firstReward).toHaveClass('selected')
      fireEvent.click(firstReward)
      expect(firstReward).not.toHaveClass('selected')
    })

    it('should select only one reward at a time', () => {
      const { container } = render(<Reward {...defaultProps} />)
      const rewards = container.querySelectorAll('.reward-item')
      fireEvent.click(rewards[0])
      fireEvent.click(rewards[1])
      expect(rewards[0]).not.toHaveClass('selected')
      expect(rewards[1]).toHaveClass('selected')
    })

    it('should stop propagation on claim button click', () => {
      const { container } = render(<Reward {...defaultProps} />)
      const claimButton = screen.getAllByText('수령')[0]
      const rewardCard = claimButton.closest('.reward-item')
      fireEvent.click(claimButton)
      expect(rewardCard).not.toHaveClass('selected')
    })

    it('should handle multiple clicks on claim button', () => {
      render(<Reward {...defaultProps} />)
      const claimButtons = screen.getAllByText('수령')
      fireEvent.click(claimButtons[0])
      fireEvent.click(claimButtons[0])
      expect(mockOnClaimReward).toHaveBeenCalledTimes(2)
    })
  })

  describe('Edge Cases', () => {
    it('should render correctly when all rewards are claimed', () => {
      render(<Reward {...defaultProps} claimedRewards={['firstLogin', 'dailyBonus', 'achievement']} />)
      const claimButtons = screen.queryAllByText('수령')
      expect(claimButtons.length).toBe(0)
      const claimedBadges = screen.getAllByText('수령 완료')
      expect(claimedBadges.length).toBe(3)
    })

    it('should display correct number of unclaimed rewards', () => {
      render(<Reward {...defaultProps} claimedRewards={['firstLogin']} />)
      const claimButtons = screen.getAllByText('수령')
      expect(claimButtons.length).toBe(2)
    })

    it('should render all reward items correctly', () => {
      const { container } = render(<Reward {...defaultProps} />)
      const rewardCards = container.querySelectorAll('.reward-item')
      expect(rewardCards.length).toBeGreaterThanOrEqual(3)
    })

    it('should handle empty claimedRewards array', () => {
      render(<Reward {...defaultProps} claimedRewards={[]} />)
      const claimButtons = screen.getAllByText('수령')
      expect(claimButtons.length).toBe(3)
      expect(screen.queryByText('수령 완료')).not.toBeInTheDocument()
    })

    it('should display reward details in correct order', () => {
      const { container } = render(<Reward {...defaultProps} />)
      const rewardCards = container.querySelectorAll('.reward-item')
      expect(rewardCards[0]).toHaveTextContent('첫 로그인 보상')
      expect(rewardCards[1]).toHaveTextContent('일일 보너스')
      expect(rewardCards[2]).toHaveTextContent('업적 달성 보상')
    })

    it('should handle claim for each reward type', () => {
      render(<Reward {...defaultProps} />)
      const claimButtons = screen.getAllByText('수령')
      fireEvent.click(claimButtons[0])
      expect(mockOnClaimReward).toHaveBeenCalledWith('test-character', 'firstLogin')
      fireEvent.click(claimButtons[1])
      expect(mockOnClaimReward).toHaveBeenCalledWith('test-character', 'dailyBonus')
      fireEvent.click(claimButtons[2])
      expect(mockOnClaimReward).toHaveBeenCalledWith('test-character', 'achievement')
    })

    it('should apply correct styling to claimed rewards', () => {
      const { container } = render(<Reward {...defaultProps} claimedRewards={['firstLogin']} />)
      const claimedReward = container.querySelector('.reward-item.claimed')
      expect(claimedReward).toHaveStyle({ opacity: expect.any(String) })
    })

    it('should prevent clicking claim button on claimed rewards', () => {
      render(<Reward {...defaultProps} claimedRewards={['firstLogin']} />)
      const firstRewardCard = screen.getByText('첫 로그인 보상').closest('.reward-item')
      const claimButton = within(firstRewardCard).queryByText('수령')
      expect(claimButton).not.toBeInTheDocument()
    })
  })
})