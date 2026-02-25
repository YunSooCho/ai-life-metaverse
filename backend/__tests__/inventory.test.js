import { describe, it, expect, beforeEach } from 'vitest'
import {
  addItem,
  removeItem,
  getInventory,
  hasItem,
  getItemCount,
  clearInventory,
  getAllInventories
} from '../inventory.js'

describe('Inventory System', () => {
  beforeEach(() => {
    clearInventory('test-user-1')
    clearInventory('test-user-2')
  })

  describe('addItem', () => {
    it('should add item to inventory', () => {
      const result = addItem('test-user-1', 'healthPotion', 5)
      expect(result).toBe(true)
      expect(getInventory('test-user-1')['healthPotion']).toBe(5)
    })

    it('should increment quantity if item already exists', () => {
      addItem('test-user-1', 'coin', 10)
      addItem('test-user-1', 'coin', 5)
      expect(getInventory('test-user-1')['coin']).toBe(15)
    })

    it('should handle multiple users separately', () => {
      addItem('test-user-1', 'healthPotion', 3)
      addItem('test-user-2', 'healthPotion', 7)
      expect(getInventory('test-user-1')['healthPotion']).toBe(3)
      expect(getInventory('test-user-2')['healthPotion']).toBe(7)
    })

    it('should add item with default quantity of 1', () => {
      addItem('test-user-1', 'giftBox')
      expect(getInventory('test-user-1')['giftBox']).toBe(1)
    })

    it('should create inventory object if not exists', () => {
      expect(getInventory('test-user-1')).toEqual({})
      addItem('test-user-1', 'healthPotion', 1)
      expect(Object.keys(getInventory('test-user-1'))).toContain('healthPotion')
    })
  })

  describe('removeItem', () => {
    beforeEach(() => {
      addItem('test-user-1', 'healthPotion', 10)
      addItem('test-user-1', 'coin', 5)
    })

    it('should remove item from inventory', () => {
      const result = removeItem('test-user-1', 'healthPotion', 3)
      expect(result).toBe(true)
      expect(getInventory('test-user-1')['healthPotion']).toBe(7)
    })

    it('should return false when inventory does not exist', () => {
      const result = removeItem('non-existent-user', 'healthPotion', 1)
      expect(result).toBe(false)
    })

    it('should return false when item does not exist', () => {
      const result = removeItem('test-user-1', 'non-existent-item', 1)
      expect(result).toBe(false)
    })

    it('should return false when quantity is insufficient', () => {
      const result = removeItem('test-user-1', 'healthPotion', 15)
      expect(result).toBe(false)
      expect(getInventory('test-user-1')['healthPotion']).toBe(10)
    })

    it('should remove item entry when quantity becomes 0', () => {
      removeItem('test-user-1', 'coin', 5)
      expect(getInventory('test-user-1')['coin']).toBeUndefined()
    })
  })

  describe('getInventory', () => {
    it('should return empty object for non-existent user', () => {
      const inventory = getInventory('non-existent-user')
      expect(inventory).toEqual({})
    })

    it('should return inventory for existing user', () => {
      addItem('test-user-1', 'healthPotion', 5)
      addItem('test-user-1', 'coin', 10)
      const inventory = getInventory('test-user-1')
      expect(inventory['healthPotion']).toBe(5)
      expect(inventory['coin']).toBe(10)
    })

    it('should return a copy of inventory (not reference)', () => {
      addItem('test-user-1', 'healthPotion', 5)
      const inventory1 = getInventory('test-user-1')
      const inventory2 = getInventory('test-user-1')
      expect(inventory1).toEqual(inventory2)
      expect(inventory1).not.toBe(inventory2)
    })

    it('should handle inventory with multiple items', () => {
      addItem('test-user-1', 'healthPotion', 5)
      addItem('test-user-1', 'coin', 10)
      addItem('test-user-1', 'giftBox', 2)
      addItem('test-user-1', 'experiencePotion', 3)
      const inventory = getInventory('test-user-1')
      expect(Object.keys(inventory).length).toBe(4)
    })

    it('should return empty inventory after clearing', () => {
      addItem('test-user-1', 'healthPotion', 5)
      clearInventory('test-user-1')
      const inventory = getInventory('test-user-1')
      expect(inventory).toEqual({})
    })
  })

  describe('hasItem', () => {
    beforeEach(() => {
      addItem('test-user-1', 'healthPotion', 5)
      addItem('test-user-1', 'coin', 10)
    })

    it('should return true when user has sufficient quantity', () => {
      expect(hasItem('test-user-1', 'healthPotion', 3)).toBe(true)
      expect(hasItem('test-user-1', 'healthPotion', 5)).toBe(true)
    })

    it('should return false when quantity is insufficient', () => {
      expect(hasItem('test-user-1', 'healthPotion', 6)).toBe(false)
      expect(hasItem('test-user-1', 'healthPotion', 10)).toBe(false)
    })

    it('should return false when item does not exist', () => {
      expect(hasItem('test-user-1', 'giftBox', 1)).toBe(false)
    })

    it('should return false when user does not exist', () => {
      expect(hasItem('non-existent-user', 'healthPotion', 1)).toBe(false)
    })

    it('should use default quantity of 1', () => {
      expect(hasItem('test-user-1', 'healthPotion')).toBe(true)
      expect(hasItem('test-user-1', 'giftBox')).toBe(false)
    })
  })

  describe('getItemCount', () => {
    beforeEach(() => {
      addItem('test-user-1', 'healthPotion', 5)
      addItem('test-user-1', 'coin', 10)
    })

    it('should return correct item quantity', () => {
      expect(getItemCount('test-user-1', 'healthPotion')).toBe(5)
      expect(getItemCount('test-user-1', 'coin')).toBe(10)
    })

    it('should return 0 when item does not exist', () => {
      expect(getItemCount('test-user-1', 'giftBox')).toBe(0)
    })

    it('should return 0 when user does not exist', () => {
      expect(getItemCount('non-existent-user', 'healthPotion')).toBe(0)
    })

    it('should return 0 after removing all items', () => {
      removeItem('test-user-1', 'healthPotion', 5)
      expect(getItemCount('test-user-1', 'healthPotion')).toBe(0)
    })

    it('should track quantity changes correctly', () => {
      expect(getItemCount('test-user-1', 'healthPotion')).toBe(5)
      addItem('test-user-1', 'healthPotion', 3)
      expect(getItemCount('test-user-1', 'healthPotion')).toBe(8)
      removeItem('test-user-1', 'healthPotion', 2)
      expect(getItemCount('test-user-1', 'healthPotion')).toBe(6)
    })
  })

  describe('clearInventory', () => {
    beforeEach(() => {
      addItem('test-user-1', 'healthPotion', 5)
      addItem('test-user-1', 'coin', 10)
    })

    it('should clear all items for user', () => {
      clearInventory('test-user-1')
      expect(getInventory('test-user-1')).toEqual({})
    })

    it('should not affect other users', () => {
      addItem('test-user-2', 'giftBox', 3)
      clearInventory('test-user-1')
      expect(getInventory('test-user-1')).toEqual({})
      expect(getInventory('test-user-2')['giftBox']).toBe(3)
    })

    it('should work on empty inventory', () => {
      expect(() => clearInventory('test-user-2')).not.toThrow()
      expect(getInventory('test-user-2')).toEqual({})
    })

    it('should allow adding items after clearing', () => {
      clearInventory('test-user-1')
      addItem('test-user-1', 'experiencePotion', 7)
      expect(getInventory('test-user-1')['experiencePotion']).toBe(7)
    })

    it('should handle multiple clear operations', () => {
      clearInventory('test-user-1')
      clearInventory('test-user-1')
      expect(getInventory('test-user-1')).toEqual({})
      expect(() => clearInventory('test-user-1')).not.toThrow()
    })
  })

  describe('getAllInventories', () => {
    beforeEach(() => {
      addItem('test-user-1', 'healthPotion', 5)
      addItem('test-user-1', 'coin', 10)
      addItem('test-user-2', 'giftBox', 3)
    })

    it('should return all inventories', () => {
      const allInventories = getAllInventories()
      expect(Object.keys(allInventories).length).toBeGreaterThanOrEqual(2)
      expect(allInventories['test-user-1']['healthPotion']).toBe(5)
      expect(allInventories['test-user-2']['giftBox']).toBe(3)
    })

    it('should return empty object when no inventories exist', () => {
      clearInventory('test-user-1')
      clearInventory('test-user-2')
      const allInventories = getAllInventories()
      expect(allInventories['test-user-1']).toBeUndefined()
      expect(allInventories['test-user-2']).toBeUndefined()
    })

    it('should include empty inventories', () => {
      clearInventory('test-user-2')
      const allInventories = getAllInventories()
      expect(allInventories['test-user-1']).toBeDefined()
      expect(allInventories['test-user-2']).toEqual({})
    })
  })
})