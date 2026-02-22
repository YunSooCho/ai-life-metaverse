import { describe, it, expect } from 'vitest'

function getAffinityColor(affinity) {
  const clamped = Math.max(-50, Math.min(50, affinity))
  const normalized = (clamped + 50) / 100
  const hue = normalized * 120
  return `hsl(${hue}, 70%, 50%)`
}

describe('Affinity Color Coding', () => {
  it('returns red for -50 affinity', () => {
    const result = getAffinityColor(-50)
    expect(result).toBe('hsl(0, 70%, 50%)')
  })

  it('returns yellow for 0 affinity', () => {
    const result = getAffinityColor(0)
    expect(result).toBe('hsl(60, 70%, 50%)')
  })

  it('returns green for 50 affinity', () => {
    const result = getAffinityColor(50)
    expect(result).toBe('hsl(120, 70%, 50%)')
  })

  it('clamps values below -50 to -50', () => {
    const result = getAffinityColor(-100)
    expect(result).toBe('hsl(0, 70%, 50%)')
  })

  it('clamps values above 50 to 50', () => {
    const result = getAffinityColor(100)
    expect(result).toBe('hsl(120, 70%, 50%)')
  })

  it('returns orange for -25 affinity', () => {
    const result = getAffinityColor(-25)
    expect(result).toBe('hsl(30, 70%, 50%)')
  })

  it('returns lime for 25 affinity', () => {
    const result = getAffinityColor(25)
    expect(result).toBe('hsl(90, 70%, 50%)')
  })
})