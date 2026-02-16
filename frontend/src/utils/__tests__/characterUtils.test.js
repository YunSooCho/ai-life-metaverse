import { describe, it, expect } from 'vitest'
import { calculateDistance, getAffinityColor } from '@/utils/characterUtils'

describe('calculateDistance', () => {
  it('calculates distance between two points correctly', () => {
    const distance = calculateDistance(0, 0, 3, 4)
    expect(distance).toBe(5)
  })

  it('calculates distance for same point as 0', () => {
    const distance = calculateDistance(100, 100, 100, 100)
    expect(distance).toBe(0)
  })

  it('calculates horizontal distance correctly', () => {
    const distance = calculateDistance(0, 0, 10, 0)
    expect(distance).toBe(10)
  })

  it('calculates vertical distance correctly', () => {
    const distance = calculateDistance(0, 0, 0, 5)
    expect(distance).toBe(5)
  })

  it('handles negative coordinates correctly', () => {
    const distance = calculateDistance(-1, -1, 2, 3)
    expect(distance).toBe(5)
  })

  it('calculates distance for large coordinates', () => {
    const distance = calculateDistance(0, 0, 300, 400)
    expect(distance).toBe(500)
  })

  it('is symmetric - distance from A to B equals distance from B to A', () => {
    const distance1 = calculateDistance(0, 0, 5, 12)
    const distance2 = calculateDistance(5, 12, 0, 0)
    expect(distance1).toBe(distance2)
  })

  it('handles floating point coordinates', () => {
    const distance = calculateDistance(0, 0, 1.5, 2)
    expect(distance).toBeCloseTo(2.5, 2)
  })
})

describe('getAffinityColor', () => {
  describe('Red color range (low affinity: 0-2)', () => {
    it('returns red color for affinity 0', () => {
      expect(getAffinityColor(0)).toBe('#ff4444')
    })

    it('returns red color for affinity 1', () => {
      expect(getAffinityColor(1)).toBe('#ff4444')
    })

    it('returns red color for affinity 2', () => {
      expect(getAffinityColor(2)).toBe('#ff4444')
    })

    it('returns red color for negative affinity', () => {
      expect(getAffinityColor(-5)).toBe('#ff4444')
    })
  })

  describe('Orange color range (medium affinity: 3-7)', () => {
    it('returns orange color for affinity 3', () => {
      expect(getAffinityColor(3)).toBe('#ff8800')
    })

    it('returns orange color for affinity 5', () => {
      expect(getAffinityColor(5)).toBe('#ff8800')
    })

    it('returns orange color for affinity 7', () => {
      expect(getAffinityColor(7)).toBe('#ff8800')
    })
  })

  describe('Green color range (high affinity: 8+)', () => {
    it('returns green color for affinity 8', () => {
      expect(getAffinityColor(8)).toBe('#00cc44')
    })

    it('returns green color for affinity 10', () => {
      expect(getAffinityColor(10)).toBe('#00cc44')
    })

    it('returns green color for high affinity values', () => {
      expect(getAffinityColor(50)).toBe('#00cc44')
      expect(getAffinityColor(100)).toBe('#00cc44')
    })
  })

  describe('Color format validation', () => {
    it('returns valid HEX color format', () => {
      const colors = [
        getAffinityColor(0),
        getAffinityColor(5),
        getAffinityColor(10)
      ]

      colors.forEach(color => {
        expect(color).toMatch(/^#[0-9a-fA-F]{6}$/)
      })
    })
  })
})