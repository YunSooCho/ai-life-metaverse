import { describe, it, expect, vi } from 'vitest'
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import InteractionMenu from '@/components/InteractionMenu'

describe('InteractionMenu Component', () => {
  const defaultProps = {
    show: true,
    targetCharacter: {
      id: 'char1',
      name: 'AI 캐릭터'
    },
    x: 100,
    y: 100,
    onInteraction: vi.fn(),
    onClose: vi.fn()
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('does not render when show is false', () => {
    const props = { ...defaultProps, show: false }
    render(<InteractionMenu {...props} />)
    
    expect(screen.queryByText('AI 캐릭터')).not.toBeInTheDocument()
  })

  it('does not render when targetCharacter is null', () => {
    const props = { ...defaultProps, targetCharacter: null }
    render(<InteractionMenu {...props} />)
    
    expect(screen.queryByText('AI 캐릭터')).not.toBeInTheDocument()
  })

  it('renders menu when show is true and targetCharacter exists', () => {
    render(<InteractionMenu {...defaultProps} />)
    
    expect(screen.getByText('AI 캐릭터')).toBeInTheDocument()
  })

  it('renders all interaction buttons', () => {
    render(<InteractionMenu {...defaultProps} />)
    
    expect(screen.getByText('👋 인사')).toBeInTheDocument()
    expect(screen.getByText('🎁 선물주기')).toBeInTheDocument()
    expect(screen.getByText('🤝 친하기')).toBeInTheDocument()
    expect(screen.getByText('⚔️ 싸우기')).toBeInTheDocument()
  })

  it('calls onInteraction with greeting when 인사 button is clicked', () => {
    render(<InteractionMenu {...defaultProps} />)
    
    fireEvent.click(screen.getByText('👋 인사'))
    expect(defaultProps.onInteraction).toHaveBeenCalledWith('greeting')
  })

  it('calls onInteraction with gift when 선물주기 button is clicked', () => {
    render(<InteractionMenu {...defaultProps} />)
    
    fireEvent.click(screen.getByText('🎁 선물주기'))
    expect(defaultProps.onInteraction).toHaveBeenCalledWith('gift')
  })

  it('calls onInteraction with friend when 친하기 button is clicked', () => {
    render(<InteractionMenu {...defaultProps} />)
    
    fireEvent.click(screen.getByText('🤝 친하기'))
    expect(defaultProps.onInteraction).toHaveBeenCalledWith('friend')
  })

  it('calls onInteraction with fight when 싸우기 button is clicked', () => {
    render(<InteractionMenu {...defaultProps} />)
    
    fireEvent.click(screen.getByText('⚔️ 싸우기'))
    expect(defaultProps.onInteraction).toHaveBeenCalledWith('fight')
  })
})