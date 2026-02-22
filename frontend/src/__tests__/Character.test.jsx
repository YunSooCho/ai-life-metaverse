import { describe, test, expect } from 'vitest'
import { render } from '@testing-library/react'
import Character from '../components/Character'

describe('Character Component', () => {
  const mockAffinities = {
    'player': {
      'ai-1': 5,
      'other-1': 2
    }
  }

  const mockChatMessages = {}

  const aiCharacter = {
    id: 'ai-1',
    name: 'AI 캐릭터',
    x: 100,
    y: 100,
    color: '#FF6B6B',
    emoji: '🤖',
    isAi: true
  }

  const humanCharacter = {
    id: 'other-1',
    name: '플레이어 2',
    x: 200,
    y: 150,
    color: '#4CAF50',
    emoji: '👤',
    isAi: false
  }

  test('renders character circle with correct properties', () => {
    const { container } = render(
      <Character
        char={humanCharacter}
        myCharacterId="player"
        affinities={mockAffinities}
        chatMessages={mockChatMessages}
        scale={1}
      />
    )

    const circle = container.querySelector('circle')
    expect(circle).not.toBeNull()
    expect(circle.getAttribute('cx')).toBe('200')
    expect(circle.getAttribute('cy')).toBe('150')
    expect(circle.getAttribute('fill')).toBe('#4CAF50')
    expect(circle.getAttribute('stroke')).toBe('#4CAF50')
  })

  test('renders AI character with red stroke', () => {
    const { container } = render(
      <Character
        char={aiCharacter}
        myCharacterId="player"
        affinities={mockAffinities}
        chatMessages={mockChatMessages}
        scale={1}
      />
    )

    const circle = container.querySelector('circle')
    expect(circle.getAttribute('stroke')).toBe('#FF6B6B')
  })

  test('renders emoji text element', () => {
    const { container } = render(
      <Character
        char={humanCharacter}
        myCharacterId="player"
        affinities={mockAffinities}
        chatMessages={mockChatMessages}
        scale={1}
      />
    )

    const texts = container.querySelectorAll('text')
    const hasEmoji = Array.from(texts).some(text => text.textContent === '👤')
    expect(hasEmoji).toBe(true)
  })

  test('renders name text element', () => {
    const { container } = render(
      <Character
        char={humanCharacter}
        myCharacterId="player"
        affinities={mockAffinities}
        chatMessages={mockChatMessages}
        scale={1}
      />
    )

    const texts = container.querySelectorAll('text')
    const hasName = Array.from(texts).some(text => text.textContent === '플레이어 2')
    expect(hasName).toBe(true)
  })

  test('displays affinity heart when affinity exists', () => {
    const { container } = render(
      <Character
        char={aiCharacter}
        myCharacterId="player"
        affinities={mockAffinities}
        chatMessages={mockChatMessages}
        scale={1}
      />
    )

    const texts = container.querySelectorAll('text')
    const heartElements = Array.from(texts).filter(text => text.textContent === '💗')
    expect(heartElements.length).toBeGreaterThan(0)
  })

  test('displays affinity value when affinity exists', () => {
    const { container } = render(
      <Character
        char={aiCharacter}
        myCharacterId="player"
        affinities={mockAffinities}
        chatMessages={mockChatMessages}
        scale={1}
      />
    )

    const texts = container.querySelectorAll('text')
    const hasValue = Array.from(texts).some(text => text.textContent === '5')
    expect(hasValue).toBe(true)
  })

  test('renders with correct scale factor', () => {
    const { container: container2 } = render(
      <Character
        char={humanCharacter}
        myCharacterId="player"
        affinities={mockAffinities}
        chatMessages={mockChatMessages}
        scale={2}
      />
    )

    const circle = container2.querySelector('circle')
    expect(circle.getAttribute('cx')).toBe('400')
    expect(circle.getAttribute('cy')).toBe('300')
  })

  test('does not display affinity for self character with no affinity data', () => {
    const selfCharacter = { ...humanCharacter, id: 'player' }
    const noAffinities = {
      'player': {}
    }

    const { container } = render(
      <Character
        char={selfCharacter}
        myCharacterId="player"
        affinities={noAffinities}
        chatMessages={mockChatMessages}
        scale={1}
      />
    )

    const texts = container.querySelectorAll('text')
    const heartElements = Array.from(texts).filter(text => text.textContent === '💗')
    expect(heartElements.length).toBe(0)
  })
})