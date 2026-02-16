import { describe, it, expect } from 'vitest'
import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import CharacterList from '@/components/CharacterList'

describe('CharacterList Component', () => {
  const defaultProps = {
    myCharacter: {
      id: 'player',
      name: '플레이어',
      isAi: false
    },
    characters: {
      'char1': {
        id: 'char1',
        name: 'AI 캐릭터 1',
        isAi: true
      },
      'char2': {
        id: 'char2',
        name: '일반 캐릭터',
        isAi: false
      }
    }
  }

  it('renders myCharacter in the list', () => {
    render(<CharacterList {...defaultProps} />)
    
    expect(screen.getByText('플레이어')).toBeInTheDocument()
  })

  it('renders all other characters', () => {
    render(<CharacterList {...defaultProps} />)
    
    expect(screen.getByText('AI 캐릭터 1')).toBeInTheDocument()
    expect(screen.getByText('일반 캐릭터')).toBeInTheDocument()
  })

  it('displays AI badge for AI characters', () => {
    render(<CharacterList {...defaultProps} />)
    
    const aiBadges = screen.getAllByText('🤖')
    expect(aiBadges.length).toBe(1)
  })

  it('does not display AI badge for non-AI characters', () => {
    const props = {
      ...defaultProps,
      characters: {
        'char1': {
          id: 'char1',
          name: '일반 캐릭터',
          isAi: false
        }
      }
    }
    
    render(<CharacterList {...props} />)
    
    expect(screen.queryByText('🤖')).not.toBeInTheDocument()
  })

  it('renders empty list when no other characters exist', () => {
    const props = {
      ...defaultProps,
      characters: {}
    }
    
    render(<CharacterList {...props} />)
    
    expect(screen.getByText('플레이어')).toBeInTheDocument()
    expect(screen.queryByText('AI 캐릭터 1')).not.toBeInTheDocument()
  })

  it('renders correct number of characters', () => {
    const { container } = render(<CharacterList {...defaultProps} />)
    const items = container.querySelectorAll('.character-list-item')
    
    expect(items.length).toBe(3)
  })

  it('handles large number of characters', () => {
    const manyCharacters = {}
    for (let i = 0; i < 10; i++) {
      manyCharacters[`char${i}`] = {
        id: `char${i}`,
        name: `캐릭터 ${i}`,
        isAi: i % 2 === 0
      }
    }

    const props = {
      ...defaultProps,
      characters: manyCharacters
    }
    
    render(<CharacterList {...props} />)
    
    expect(screen.getByText('플레이어')).toBeInTheDocument()
    for (let i = 0; i < 10; i++) {
      expect(screen.getByText(`캐릭터 ${i}`)).toBeInTheDocument()
    }
  })
})