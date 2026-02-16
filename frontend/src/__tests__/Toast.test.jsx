import { describe, test, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Toast from '../components/Toast'

describe('Toast Component', () => {
  test('does not render when show is false', () => {
    const { container } = render(
      <Toast show={false} message="테스트 메시지" type="info" />
    )
    expect(container.firstChild).toBeNull()
  })

  test('renders toast message when show is true', () => {
    render(
      <Toast show={true} message="테스트 메시지" type="info" />
    )
    expect(screen.getByText('테스트 메시지')).toBeInTheDocument()
  })

  test('applies info class for info type', () => {
    const { container } = render(
      <Toast show={true} message="정보 메시지" type="info" />
    )
    const toastElement = container.firstChild
    expect(toastElement.className).toContain('toast-info')
  })

  test('applies success class for success type', () => {
    const { container } = render(
      <Toast show={true} message="성공 메시지" type="success" />
    )
    const toastElement = container.firstChild
    expect(toastElement.className).toContain('toast-success')
  })

  test('applies warning class for warning type', () => {
    const { container } = render(
      <Toast show={true} message="경고 메시지" type="warning" />
    )
    const toastElement = container.firstChild
    expect(toastElement.className).toContain('toast-warning')
  })

  test('always applies toast base class', () => {
    const { container } = render(
      <Toast show={true} message="테스트" type="info" />
    )
    const toastElement = container.firstChild
    expect(toastElement.className).toContain('toast')
  })
})