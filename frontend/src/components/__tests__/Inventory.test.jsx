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
      expect(screen.getByText('🎒 INVENTORY')).toBeInTheDocument()
    })

    it('should not render when show is false', () => {
      render(<Inventory {...defaultProps} show={false} />)
      expect(screen.queryByText('🎒 INVENTORY')).not.toBeInTheDocument()
    })

    it('should display total item count', () => {
      render(<Inventory {...defaultProps} />)
      expect(screen.getByText(/📦 TOTAL:/i)).toBeInTheDocument()
    })

    it('should display all inventory items', () => {
      render(<Inventory {...defaultProps} />)
      expect(screen.getByText('HP POTION')).toBeInTheDocument()
      expect(screen.getByText('COIN')).toBeInTheDocument()
      expect(screen.getByText('GIFT BOX')).toBeInTheDocument()
      expect(screen.getByText('EXP POTION')).toBeInTheDocument()
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
      expect(screen.getByText('INVENTORY EMPTY')).toBeInTheDocument()
    })

    it('should display item descriptions', () => {
      render(<Inventory {...defaultProps} />)
      expect(screen.getByText('HP +50 RESTORE')).toBeInTheDocument()
      expect(screen.getByText('CURRENCY ITEM')).toBeInTheDocument()
      expect(screen.getByText('AFFINITY +10')).toBeInTheDocument()
      expect(screen.getByText('EXP +100')).toBeInTheDocument()
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
      const firstItem = container.querySelector('.pixel-grid-item')
      expect(firstItem).not.toHaveClass('selected')
      fireEvent.click(firstItem)
      expect(firstItem).toHaveClass('selected')
    })

    it('should call onGetInventory when refresh button is clicked', () => {
      render(<Inventory {...defaultProps} />)
      const refreshButton = screen.getByText('REFRESH')
      fireEvent.click(refreshButton)
      expect(mockOnGetInventory).toHaveBeenCalledWith('test-character')
    })

    it('should call onUseItem when use button is clicked', () => {
      render(<Inventory {...defaultProps} />)
      const useButtons = screen.getAllByText('USE')
      fireEvent.click(useButtons[0])
      expect(mockOnUseItem).toHaveBeenCalledWith('test-character', 'healthPotion')
    })

    it('should not call onUseItem for non-consumable items', () => {
      render(<Inventory {...defaultProps} />)
      const coinItem = screen.getByText('COIN').closest('.pixel-grid-item')
      const useButton = within(coinItem).queryByText('USE')
      expect(useButton).not.toBeInTheDocument()
    })

    it('should have use button only for consumable items', () => {
      render(<Inventory {...defaultProps} />)
      const useButtons = screen.getAllByText('USE')
      expect(useButtons.length).toBe(3)
    })

    it('should deselect item when clicking same item again', () => {
      const { container } = render(<Inventory {...defaultProps} />)
      const firstItem = container.querySelector('.pixel-grid-item')
      fireEvent.click(firstItem)
      expect(firstItem).toHaveClass('selected')
      fireEvent.click(firstItem)
      expect(firstItem).not.toHaveClass('selected')
    })

    it('should select only one item at a time', () => {
      const { container } = render(<Inventory {...defaultProps} />)
      const items = container.querySelectorAll('.pixel-grid-item')
      fireEvent.click(items[0])
      fireEvent.click(items[1])
      expect(items[0]).not.toHaveClass('selected')
      expect(items[1]).toHaveClass('selected')
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty inventory gracefully', () => {
      render(<Inventory {...defaultProps} inventory={{}} />)
      expect(screen.getByText(/📦 TOTAL: 0/i)).toBeInTheDocument()
      expect(screen.getByText('INVENTORY EMPTY')).toBeInTheDocument()
    })

    it('should handle inventory with single item', () => {
      const singleItemInventory = { healthPotion: 1 }
      render(<Inventory {...defaultProps} inventory={singleItemInventory} />)
      expect(screen.getByText(/📦 TOTAL: 1/i)).toBeInTheDocument()
      expect(screen.getByText('HP POTION')).toBeInTheDocument()
      expect(screen.getByText('x1')).toBeInTheDocument()
    })

    it('should handle large quantities correctly', () => {
      const largeQuantityInventory = { coin: 99999 }
      render(<Inventory {...defaultProps} inventory={largeQuantityInventory} />)
      expect(screen.getByText(/📦 TOTAL: 99999/i)).toBeInTheDocument()
      expect(screen.getByText('x99999')).toBeInTheDocument()
    })

    it('should handle multiple clicks on use button', () => {
      render(<Inventory {...defaultProps} />)
      const useButtons = screen.getAllByText('USE')
      fireEvent.click(useButtons[0])
      fireEvent.click(useButtons[0])
      expect(mockOnUseItem).toHaveBeenCalledTimes(2)
    })

    it('should prevent event propagation on use button', () => {
      const { container } = render(<Inventory {...defaultProps} />)
      const useButton = screen.getAllByText('USE')[0]
      const itemContainer = useButton.closest('.pixel-grid-item')
      fireEvent.click(useButton)
      expect(itemContainer).not.toHaveClass('selected')
    })
  })
})