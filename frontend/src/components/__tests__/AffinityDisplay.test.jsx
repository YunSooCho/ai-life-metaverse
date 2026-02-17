import { describe, it, expect } from 'vitest'
import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import AffinityDisplay from '../AffinityDisplay'

describe('AffinityDisplay Component', () => {
  const defaultProps = {
    show: true,
    x: 100,
    y: 100,
    data: {
      name: 'AI 캐릭터',
      affinity: 5
    }
  }

  it('does not render when show is false', () => {
    const props = { ...defaultProps, show: false }
    render(<AffinityDisplay {...props} />)
    
    expect(screen.queryByText('AI 캐릭터')).not.toBeInTheDocument()
  })

  it('does not render when data is null', () => {
    const props = { ...defaultProps, data: null }
    render(<AffinityDisplay {...props} />)
    
    expect(screen.queryByText('AI 캐릭터')).not.toBeInTheDocument()
  })

  it('renders character name correctly', () => {
    render(<AffinityDisplay {...defaultProps} />)
    
    expect(screen.getByText('AI 캐릭터')).toBeInTheDocument()
  })

  it('renders heart emoji', () => {
    render(<AffinityDisplay {...defaultProps} />)
    
    expect(screen.getByText('💗')).toBeInTheDocument()
  })

  it('renders affinity value', () => {
    render(<AffinityDisplay {...defaultProps} />)
    
    expect(screen.getByText('5')).toBeInTheDocument()
  })

  it('renders high affinity (8+) with green color', () => {
    const props = {
      ...defaultProps,
      data: { name: '친한 친구', affinity: 10 }
    }
    
    const { container } = render(<AffinityDisplay {...props} />)
    const valueElement = container.querySelector('.affinity-display-value')
    
    expect(valueElement).toHaveStyle({ color: '#00cc44' })
  })

  it('renders medium affinity (3-7) with orange color', () => {
    const props = {
      ...defaultProps,
      data: { name: '아는 친구', affinity: 5 }
    }
    
    const { container } = render(<AffinityDisplay {...props} />)
    const valueElement = container.querySelector('.affinity-display-value')
    
    expect(valueElement).toHaveStyle({ color: '#ff8800' })
  })

  it('renders low affinity (0-2) with red color', () => {
    const props = {
      ...defaultProps,
      data: { name: '낯선 사람', affinity: 1 }
    }
    
    const { container } = render(<AffinityDisplay {...props} />)
    const valueElement = container.querySelector('.affinity-display-value')
    
    expect(valueElement).toHaveStyle({ color: '#ff4444' })
  })

  it('has correct position styles', () => {
    const props = {
      ...defaultProps,
      x: 200,
      y: 300
    }
    
    const { container } = render(<AffinityDisplay {...props} />)
    const display = container.querySelector('.affinity-display')
    
    expect(display).toHaveStyle({
      left: '200px',
      top: '300px'
    })
  })
})