/**
 * MiniMap 날씨 아이콘 테스트
 */

import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import MiniMap from '../MiniMap'

// Canvas API mock
vi.mock('../MiniMap', async () => {
  const actual = await vi.importActual('../MiniMap')
  return {
    ...actual,
    default: (props) => {
      const canvasRef = { current: document.createElement('canvas') }
      const comp = actual.default(props, { ref: canvasRef })
      return comp
    }
  }
})

describe('MiniMap 날씨 아이콘 props 전달 확인', () => {
  const mockMyCharacter = { id: 'player', x: 50, y: 50, emoji: '👤', isAi: false }
  const mockCharacters = { 'ai-1': { id: 'ai-1', x: 100, y: 100, emoji: '🧞', isAi: true } }
  const mockBuildings = [
    { id: 1, name: '상점', x: 150, y: 150, width: 100, height: 80, type: 'shop', color: '#4CAF50' }
  ]

  it('CLEAR 날씨 prop 전달', () => {
    const { container } = render(
      <MiniMap
        myCharacter={mockMyCharacter}
        characters={mockCharacters}
        buildings={mockBuildings}
        weather="CLEAR"
        onClick={() => {}}
      />
    )
    expect(container.querySelector('canvas')).toBeInTheDocument()
  })

  it('RAIN 날씨 prop 전달', () => {
    const { container } = render(
      <MiniMap
        myCharacter={mockMyCharacter}
        characters={mockCharacters}
        buildings={mockBuildings}
        weather="RAIN"
        onClick={() => {}}
      />
    )
    expect(container.querySelector('canvas')).toBeInTheDocument()
  })

  it('weather prop 없어도 컴포넌트 렌더링', () => {
    const { container } = render(
      <MiniMap
        myCharacter={mockMyCharacter}
        characters={mockCharacters}
        buildings={mockBuildings}
        onClick={() => {}}
      />
    )
    expect(container.querySelector('canvas')).toBeInTheDocument()
  })
})