import React from 'react'
import { render } from '@testing-library/react'
import '@testing-library/jest-dom'
import { describe, it, expect } from 'vitest'
import ChatBubble from '../components/ChatBubble'

// SVG 컴포넌트이므로 svg wrapper 필요
const renderInSvg = (ui) => {
  return render(<svg>{ui}</svg>)
}

describe('ChatBubble Component', () => {
  const defaultProps = {
    chatData: { message: 'Hello!', timestamp: Date.now() },
    x: 100,
    y: 200,
    scale: 1
  }

  it('renders nothing when chatData is null', () => {
    const { container } = renderInSvg(<ChatBubble chatData={null} x={100} y={200} scale={1} />)
    const rects = container.querySelectorAll('rect')
    expect(rects.length).toBe(0)
  })

  it('renders nothing when message is empty', () => {
    const { container } = renderInSvg(<ChatBubble chatData={{ message: '' }} x={100} y={200} scale={1} />)
    const rects = container.querySelectorAll('rect')
    expect(rects.length).toBe(0)
  })

  it('renders bubble rect when message exists', () => {
    const { container } = renderInSvg(<ChatBubble {...defaultProps} />)
    const rects = container.querySelectorAll('rect')
    // 메인 버블 rect + 하이라이트 rect = 2개
    expect(rects.length).toBe(2)
  })

  it('renders bubble tail path', () => {
    const { container } = renderInSvg(<ChatBubble {...defaultProps} />)
    const paths = container.querySelectorAll('path')
    expect(paths.length).toBe(1)
  })

  it('renders message text', () => {
    const { container } = renderInSvg(<ChatBubble {...defaultProps} />)
    const texts = container.querySelectorAll('text')
    // 메시지 텍스트 + 타임스탬프 텍스트
    expect(texts.length).toBeGreaterThanOrEqual(1)
  })

  it('renders bubble body with white fill', () => {
    const { container } = renderInSvg(<ChatBubble {...defaultProps} />)
    const mainRect = container.querySelectorAll('rect')[0]
    expect(mainRect.getAttribute('fill')).toBe('#ffffff')
  })

  it('renders bubble body with black stroke', () => {
    const { container } = renderInSvg(<ChatBubble {...defaultProps} />)
    const mainRect = container.querySelectorAll('rect')[0]
    expect(mainRect.getAttribute('stroke')).toBe('#000000')
  })

  it('renders tail pointing to character position', () => {
    const { container } = renderInSvg(<ChatBubble {...defaultProps} />)
    const path = container.querySelector('path')
    expect(path).toBeTruthy()
    expect(path.getAttribute('fill')).toBe('#ffffff')
  })

  it('renders timestamp when provided', () => {
    const { container } = renderInSvg(<ChatBubble {...defaultProps} />)
    const texts = container.querySelectorAll('text')
    // 메시지 라인 + 타임스탬프
    expect(texts.length).toBeGreaterThanOrEqual(2)
  })

  it('does not render timestamp when not provided', () => {
    const props = { ...defaultProps, chatData: { message: 'No time' } }
    const { container } = renderInSvg(<ChatBubble {...props} />)
    const texts = container.querySelectorAll('text')
    // 타임스탬프가 없으면 메시지 텍스트만
    const lastText = texts[texts.length - 1]
    expect(lastText.textContent).not.toMatch(/\d{2}:\d{2}/)
  })

  it('scales bubble with scale prop', () => {
    const { container } = renderInSvg(<ChatBubble {...defaultProps} scale={2} />)
    const mainRect = container.querySelectorAll('rect')[0]
    // scale=2이면 strokeWidth도 2배
    expect(mainRect.getAttribute('stroke-width')).toBe('4')
  })

  it('renders pixel style with no rounded corners', () => {
    const { container } = renderInSvg(<ChatBubble {...defaultProps} />)
    const mainRect = container.querySelectorAll('rect')[0]
    expect(mainRect.getAttribute('rx')).toBe('0')
  })
})
