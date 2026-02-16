import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/react'
import Inventory from '../Inventory'

describe('Inventory Component', () => {
  const mockOnClose = vi.fn()
  const mockOnUseItem = vi.fn()
  const mockOnGetInventory = vi.fn()

  const mockInventory = {
    healthPotion: 5,
    coin: 100,
    giftBox: 2,
    experiencePotion: 3
  }

  const defaultProps = {
    show: true,
    onClose: mockOnClose,
    inventory: mockInventory,
    characterId: 'test-character',
    onUseItem: mockOnUseItem,
    onGetInventory: mockOnGetInventory
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render inventory when show is true', () => {
      render(<Inventory {...defaultProps} />)
      expect(screen.getByText('🎒 인벤토리')).toBeInTheDocument()
    })

    it('should not render when show is false', () => {
      render(<Inventory {...defaultProps} show={false} />)
      expect(screen.queryByText('🎒 인벤토리')).not.toBeInTheDocument()
    })

    it('should display total item count', () => {
      render(<Inventory {...defaultProps} />)
      expect(screen.getByText('📦 총 아이템 수: 110')).toBeInTheDocument()
    })

    it('should display all inventory items', () => {
      render(<Inventory {...defaultProps} />)
      expect(screen.getByText('체력 포션')).toBeInTheDocument()
      expect(screen.getByText('코인')).toBeInTheDocument()
      expect(screen.getByText('선물 상자')).toBeInTheDocument()
      expect(screen.getByText('경험치 포션')).toBeInTheDocument()
    })

    it('should display correct item quantities', () => {
      render(<Inventory {...defaultProps} />)
      expect(screen.getByText('x5')).toBeInTheDocument()
      expect(screen.getByText('x100')).toBeInTheDocument()
      expect(screen.getByText('x2')).toBeInTheDocument()
      expect(screen.getByText('x3')).toBeInTheDocument()
    })

    it('should display item icons', () => {
      render(<Inventory {...defaultProps} />)
      expect(screen.getByText('❤️')).toBeInTheDocument()
      expect(screen.getByText('🪙')).toBeInTheDocument()
      expect(screen.getByText('🎁')).toBeInTheDocument()
      expect(screen.getByText('⚡')).toBeInTheDocument()
    })

    it('should show empty state when inventory has no items', () => {
      render(<Inventory {...defaultProps} inventory={{}} />)
      expect(screen.getByText('인벤토리가 비어있습니다')).toBeInTheDocument()
    })

    it('should display item descriptions', () => {
      render(<Inventory {...defaultProps} />)
      expect(screen.getByText('HP를 50 회복합니다')).toBeInTheDocument()
      expect(screen.getByText('화폐로 사용됩니다')).toBeInTheDocument()
      expect(screen.getByText('호감도가 10 증가합니다')).toBeInTheDocument()
      expect(screen.getByText('경험치가 100 증가합니다')).toBeInTheDocument()
    })
  })

  describe('Interaction', () => {
    it('should call onClose when close button is clicked', () => {
      render(<Inventory {...defaultProps} />)
      const closeButton = screen.getByText('✕')
      fireEvent.click(closeButton)
      expect(mockOnClose).toHaveBeenCalledTimes(1)
    })

    it('should select item when clicked', () => {
      const { container } = render(<Inventory {...defaultProps} />)
      const firstItem = container.querySelector('.inventory-item')
      expect(firstItem).not.toHaveClass('selected')
      fireEvent.click(firstItem)
      expect(firstItem).toHaveClass('selected')
    })

    it('should call onGetInventory when refresh button is clicked', () => {
      render(<Inventory {...defaultProps} />)
      const refreshButton = screen.getByText('🔄 새로고침')
      fireEvent.click(refreshButton)
      expect(mockOnGetInventory).toHaveBeenCalledWith('test-character')
    })

    it('should call onUseItem when use button is clicked', () => {
      render(<Inventory {...defaultProps} />)
      const useButtons = screen.getAllByText('사용')
      fireEvent.click(useButtons[0])
      expect(mockOnUseItem).toHaveBeenCalledWith('test-character', 'healthPotion')
    })

    it('should not call onUseItem for non-consumable items', () => {
      render(<Inventory {...defaultProps} />)
      const coinItem = screen.getByText('코인').closest('.inventory-item')
      const useButton = within(coinItem).queryByText('사용')
      expect(useButton).not.toBeInTheDocument()
    })

    it('should have use button only for consumable items', () => {
      render(<Inventory {...defaultProps} />)
      const useButtons = screen.getAllByText('사용')
      expect(useButtons.length).toBe(3)
    })

    it('should deselect item when clicking same item again', () => {
      const { container } = render(<Inventory {...defaultProps} />)
      const firstItem = container.querySelector('.inventory-item')
      fireEvent.click(firstItem)
      expect(firstItem).toHaveClass('selected')
      fireEvent.click(firstItem)
      expect(firstItem).not.toHaveClass('selected')
    })

    it('should select only one item at a time', () => {
      const { container } = render(<Inventory {...defaultProps} />)
      const items = container.querySelectorAll('.inventory-item')
      fireEvent.click(items[0])
      fireEvent.click(items[1])
      expect(items[0]).not.toHaveClass('selected')
      expect(items[1]).toHaveClass('selected')
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty inventory gracefully', () => {
      render(<Inventory {...defaultProps} inventory={{}} />)
      expect(screen.getByText('📦 총 아이템 수: 0')).toBeInTheDocument()
      expect(screen.getByText('인벤토리가 비어있습니다')).toBeInTheDocument()
    })

    it('should handle inventory with single item', () => {
      const singleItemInventory = { healthPotion: 1 }
      render(<Inventory {...defaultProps} inventory={singleItemInventory} />)
      expect(screen.getByText('📦 총 아이템 수: 1')).toBeInTheDocument()
      expect(screen.getByText('체력 포션')).toBeInTheDocument()
      expect(screen.getByText('x1')).toBeInTheDocument()
    })

    it('should handle large quantities correctly', () => {
      const largeQuantityInventory = { coin: 99999 }
      render(<Inventory {...defaultProps} inventory={largeQuantityInventory} />)
      expect(screen.getByText('📦 총 아이템 수: 99999')).toBeInTheDocument()
      expect(screen.getByText('x99999')).toBeInTheDocument()
    })

    it('should handle multiple clicks on use button', () => {
      render(<Inventory {...defaultProps} />)
      const useButtons = screen.getAllByText('사용')
      fireEvent.click(useButtons[0])
      fireEvent.click(useButtons[0])
      expect(mockOnUseItem).toHaveBeenCalledTimes(2)
    })

    it('should prevent event propagation on use button', () => {
      const { container } = render(<Inventory {...defaultProps} />)
      const useButton = screen.getAllByText('사용')[0]
      const itemContainer = useButton.closest('.inventory-item')
      fireEvent.click(useButton)
      expect(itemContainer).not.toHaveClass('selected')
    })
  })
})