import { describe, test, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ChatInput from '../ChatInput'

describe('ChatInput Component', () => {
  const defaultProps = {
    value: '',
    onChange: vi.fn(),
    onSubmit: vi.fn(),
    disabled: false
  }

  test('renders chat input with placeholder', () => {
    render(<ChatInput {...defaultProps} />)

    const input = screen.getByPlaceholderText('메시지를 입력하세요...')
    expect(input).toBeInTheDocument()
    expect(input.disabled).toBe(false)
  })

  test('renders send button', () => {
    render(<ChatInput {...defaultProps} />)

    const sendButton = screen.getByText('전송')
    expect(sendButton).toBeInTheDocument()
    expect(sendButton.disabled).toBe(false)
  })

  test('displays current value', () => {
    render(<ChatInput {...defaultProps} value="안녕하세요" />)

    const input = screen.getByPlaceholderText('메시지를 입력하세요...')
    expect(input.value).toBe('안녕하세요')
  })

  test('calls onChange when input value changes', () => {
    render(<ChatInput {...defaultProps} />)

    const input = screen.getByPlaceholderText('메시지를 입력하세요...')
    fireEvent.change(input, { target: { value: '새 메시지' } })

    expect(defaultProps.onChange).toHaveBeenCalled()
  })

  test('calls onSubmit when send button is clicked', () => {
    render(<ChatInput {...defaultProps} value="테스트 메시지" />)

    const sendButton = screen.getByText('전송')
    fireEvent.click(sendButton)

    expect(defaultProps.onSubmit).toHaveBeenCalled()
  })

  test('calls onSubmit when Enter key is pressed without Shift', () => {
    render(<ChatInput {...defaultProps} value="테스트 메시지" />)

    const input = screen.getByPlaceholderText('메시지를 입력하세요...')
    fireEvent.keyDown(input, { key: 'Enter', shiftKey: false })

    expect(defaultProps.onSubmit).toHaveBeenCalled()
  })

  test('does not call onSubmit when Shift+Enter is pressed', () => {
    const onChangeMock = vi.fn()
    const onSubmitMock = vi.fn()
    render(<ChatInput {...defaultProps} onChange={onChangeMock} onSubmit={onSubmitMock} value="테스트 메시지" />)

    const input = screen.getByPlaceholderText('메시지를 입력하세요...')
    fireEvent.keyDown(input, { key: 'Enter', shiftKey: true })

    expect(onSubmitMock).not.toHaveBeenCalled()
  })

  test('allows line break with Shift+Enter', () => {
    const onChangeMock = vi.fn()
    const onSubmitMock = vi.fn()
    render(<ChatInput {...defaultProps} onChange={onChangeMock} onSubmit={onSubmitMock} value="첫 번째 줄" />)

    const input = screen.getByPlaceholderText('메시지를 입력하세요...')
    fireEvent.keyDown(input, { key: 'Enter', shiftKey: true })

    expect(input.value).toBe('첫 번째 줄')
    expect(onSubmitMock).not.toHaveBeenCalled()
  })

  test('disables input when disabled prop is true', () => {
    render(<ChatInput {...defaultProps} disabled={true} />)

    const input = screen.getByPlaceholderText('메시지를 입력하세요...')
    expect(input.disabled).toBe(true)
  })

  test('disables send button when disabled prop is true', () => {
    render(<ChatInput {...defaultProps} disabled={true} />)

    const sendButton = screen.getByText('전송')
    expect(sendButton.disabled).toBe(true)
  })

  test('handles empty input submission', () => {
    render(<ChatInput {...defaultProps} value="" />)

    const sendButton = screen.getByText('전송')
    fireEvent.click(sendButton)

    expect(defaultProps.onSubmit).toHaveBeenCalled()
  })

  test('handles multi-line input correctly', () => {
    render(<ChatInput {...defaultProps} />)

    const input = screen.getByPlaceholderText('메시지를 입력하세요...')
    fireEvent.change(input, { target: { value: '첫 번째 줄\n두 번째 줄' } })

    expect(defaultProps.onChange).toHaveBeenCalled()
  })

  test('submits message on Enter without creating new line', () => {
    render(<ChatInput {...defaultProps} value="메시지" />)

    const input = screen.getByPlaceholderText('메시지를 입력하세요...')
    fireEvent.keyDown(input, { key: 'Enter', shiftKey: false })

    expect(defaultProps.onSubmit).toHaveBeenCalled()
  })

  test('auto-adjusts height based on content', () => {
    const { unmount } = render(<ChatInput {...defaultProps} value="짧은 메시지" />)

    const input = screen.getByPlaceholderText('메시지를 입력하세요...')
    const shortHeight = input.style.height

    unmount()
    render(<ChatInput {...defaultProps} value="아주 긴 메시지입니다 여러 줄로 구성될 것이고 자동으로 높이가 조정될 것입니다 충분한 텍스트를 입력합니다" />)

    const longInput = screen.getByPlaceholderText('메시지를 입력하세요...')
    expect(longInput.style.height).toBeTruthy()
  })

  test('works with Arabic characters', () => {
    render(<ChatInput {...defaultProps} value="مرحبا" />)

    const input = screen.getByPlaceholderText('메시지를 입력하세요...')
    expect(input.value).toBe('مرحبا')
  })

  test('works with long messages', () => {
    const longMessage = 'A'.repeat(1000)
    render(<ChatInput {...defaultProps} value={longMessage} />)

    const input = screen.getByPlaceholderText('메시지를 입력하세요...')
    expect(input.value).toBe(longMessage)
  })
})