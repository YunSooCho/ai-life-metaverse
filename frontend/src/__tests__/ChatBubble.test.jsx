import { describe, test, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import ChatBubble from '../components/ChatBubble'

describe('ChatBubble Component', () => {
  const mockChatData = { message: '테스트' }

  beforeEach(() => {
    HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
      font: '12px Arial',
      measureText: vi.fn(() => ({ width: 40 }))
    }))
  })

  test('does not render when chatData is null', () => {
    const { container } = render(
      <ChatBubble chatData={null} x={100} y={100} scale={1} />
    )
    expect(container.firstChild).toBeNull()
  })

  test('does not render when chatData.message is empty', () => {
    const { container } = render(
      <ChatBubble chatData={{ message: '' }} x={100} y={100} scale={1} />
    )
    expect(container.firstChild).toBeNull()
  })

  test('renders bubble path elements when message exists', () => {
    const { container } = render(
      <ChatBubble chatData={mockChatData} x={100} y={100} scale={1} />
    )

    const paths = container.querySelectorAll('path')
    expect(paths.length).toBe(2)
  })

  test('renders bubble body with correct style', () => {
    const { container } = render(
      <ChatBubble chatData={mockChatData} x={100} y={100} scale={1} />
    )

    const paths = container.querySelectorAll('path')
    const bubblePath = paths[0]
    expect(bubblePath.getAttribute('fill')).toBe('#ffffff')
    expect(bubblePath.getAttribute('stroke')).toBe('#cccccc')
  })

  test('renders tail path pointing to character', () => {
    const { container } = render(
      <ChatBubble chatData={mockChatData} x={100} y={100} scale={1} />
    )

    const paths = container.querySelectorAll('path')
    const tailPath = paths[1]
    expect(tailPath.getAttribute('fill')).toBe('#ffffff')
    expect(tailPath.getAttribute('stroke')).toBe('#cccccc')
  })

  test('renders timestamp when provided', () => {
    const testTimestamp = new Date('2024-02-15T14:30:00').getTime()
    const chatDataWithTimestamp = { message: '테스트', timestamp: testTimestamp }
    const { container } = render(
      <ChatBubble chatData={chatDataWithTimestamp} x={100} y={100} scale={1} />
    )

    const texts = container.querySelectorAll('text')
    const timestampText = Array.from(texts).find(text => {
      const textContent = text.textContent
      return textContent.includes('14') || textContent.includes('30')
    })
    expect(timestampText).toBeTruthy()
  })

  test('does not render timestamp when not provided', () => {
    const { container } = render(
      <ChatBubble chatData={mockChatData} x={100} y={100} scale={1} />
    )

    const texts = container.querySelectorAll('text')
    const timestampText = Array.from(texts).find(text => 
      text.getAttribute('fill') === '#888888'
    )
    expect(timestampText).toBeUndefined()
  })

  test('formats timestamp correctly', () => {
    const testTimestamp = new Date('2024-02-15T23:45:00').getTime()
    const chatDataWithTimestamp = { message: '테스트', timestamp: testTimestamp }
    const { container } = render(
      <ChatBubble chatData={chatDataWithTimestamp} x={100} y={100} scale={1} />
    )

    const texts = container.querySelectorAll('text')
    const timestampText = Array.from(texts).find(text => 
      text.getAttribute('fill') === '#888888'
    )
    expect(timestampText).toBeInTheDocument()
    expect(timestampText.textContent).toMatch(/(23|45)/)
  })
})