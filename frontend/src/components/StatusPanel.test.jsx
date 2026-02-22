import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import StatusPanel from './StatusPanel'
import { I18nProvider } from '../i18n/I18nContext'

const renderWithI18n = (ui) => render(<I18nProvider>{ui}</I18nProvider>)

describe('StatusPanel Component', () => {
  const mockCharacter = {
    id: 'player',
    name: '테스트 캐릭터',
    level: 5,
    exp: 450,
    maxExp: 1000,
    emoji: '👤',
    isAi: false,
    color: '#4CAF50',
    stats: {
      hp: 80,
      maxHp: 100,
      affinity: 15,
      charisma: 10,
      intelligence: 8
    }
  }

  const mockOnClose = jest.fn()

  test('show가 false일 때 렌더링하지 않는다', () => {
    const { container } = render(
      <StatusPanel show={false} onClose={mockOnClose} character={mockCharacter} />
    )
    expect(container.firstChild).toBeNull()
  })

  test('show가 true일 때 StatusPanel이 렌더링된다', () => {
    render(
      <StatusPanel show={true} onClose={mockOnClose} character={mockCharacter} />
    )
    expect(screen.getByText('테스트 캐릭터')).toBeInTheDocument()
    expect(screen.getByText('Lv. 5')).toBeInTheDocument()
  })

  test('캐릭터 정보가 올바르게 표시된다', () => {
    render(
      <StatusPanel show={true} onClose={mockOnClose} character={mockCharacter} />
    )

    // 이름과 레벨
    expect(screen.getByText('테스트 캐릭터')).toBeInTheDocument()
    expect(screen.getByText('Lv. 5')).toBeInTheDocument()

    // HP
    expect(screen.getByText('80 / 100')).toBeInTheDocument()

    // EXP
    expect(screen.getByText('450 / 1000')).toBeInTheDocument()
    expect(screen.getByText('45%')).toBeInTheDocument()

    // 능력치
    expect(screen.getByText('15')).toBeInTheDocument() // 친화력
    expect(screen.getByText('10')).toBeInTheDocument() // 카리스마
    expect(screen.getByText('8')).toBeInTheDocument() // 지능
  })

  test('EXP 퍼센트가 올바르게 계산된다', () => {
    render(
      <StatusPanel show={true} onClose={mockOnClose} character={mockCharacter} />
    )
    expect(screen.getByText('45%')).toBeInTheDocument()
    expect(screen.getByText('다음 레벨까지 550 EXP')).toBeInTheDocument()
  })

  test('HP 퍼센트가 올바르게 계산된다', () => {
    render(
      <StatusPanel show={true} onClose={mockOnClose} character={mockCharacter} />
    )
    expect(screen.getByText('80%')).toBeInTheDocument()
  })

  test('능력치를 올바르게 표시한다', () => {
    render(
      <StatusPanel show={true} onClose={mockOnClose} character={mockCharacter} />
    )

    // 능력치 섹션
    expect(screen.getByText('능력치')).toBeInTheDocument()
    expect(screen.getByText('친화력')).toBeInTheDocument()
    expect(screen.getByText('카리스마')).toBeInTheDocument()
    expect(screen.getByText('지능')).toBeInTheDocument()
  })

  test('정보 섹션을 올바르게 표시한다', () => {
    render(
      <StatusPanel show={true} onClose={mockOnClose} character={mockCharacter} />
    )

    expect(screen.getByText('정보')).toBeInTheDocument()
    expect(screen.getByText('player')).toBeInTheDocument()
    expect(screen.getByText('플레이어')).toBeInTheDocument()
  })

  test('AI 캐릭터 타입을 올바르게 표시한다', () => {
    const aiCharacter = { ...mockCharacter, isAi: true }
    render(
      <StatusPanel show={true} onClose={mockOnClose} character={aiCharacter} />
    )
    expect(screen.getByText('AI 캐릭터')).toBeInTheDocument()
  })

  test('닫기 버튼을 클릭하면 onClose 호출된다', () => {
    render(
      <StatusPanel show={true} onClose={mockOnClose} character={mockCharacter} />
    )
    const closeButton = screen.getByText('✕')
    fireEvent.click(closeButton)
    expect(mockOnClose).toHaveBeenCalledTimes(1)
  })

  test('overlay를 클릭하면 onClose 호출된다', () => {
    const { container } = render(
      <StatusPanel show={true} onClose={mockOnClose} character={mockCharacter} />
    )
    const overlay = container.querySelector('.status-panel-overlay')
    fireEvent.click(overlay)
    expect(mockOnClose).toHaveBeenCalledTimes(1)
  })

  test('panel을 클릭하면 onClose 호출되지 않는다 (이벤트 전파 방지)', () => {
    const { container } = render(
      <StatusPanel show={true} onClose={mockOnClose} character={mockCharacter} />
    )
    const panel = container.querySelector('.status-panel')
    fireEvent.click(panel)
    expect(mockOnClose).not.toHaveBeenCalled()
  })

  test('character가 null일 때 렌더링하지 않는다', () => {
    const { container } = render(
      <StatusPanel show={true} onClose={mockOnClose} character={null} />
    )
    expect(container.firstChild).toBeNull()
  })

  test('maxExp가 0일 때 EXP 퍼센트가 0으로 표시된다', () => {
    const zeroExpCharacter = { ...mockCharacter, maxExp: 0 }
    render(
      <StatusPanel show={true} onClose={mockOnClose} character={zeroExpCharacter} />
    )
    expect(screen.getByText('0%')).toBeInTheDocument()
  })

  test('maxHp가 0일 때 HP 퍼센트가 100으로 표시된다', () => {
    const zeroHpCharacter = {
      ...mockCharacter,
      stats: { ...mockCharacter.stats, maxHp: 0 }
    }
    render(
      <StatusPanel show={true} onClose={mockOnClose} character={zeroHpCharacter} />
    )
    expect(screen.getByText('100%')).toBeInTheDocument()
  })
})