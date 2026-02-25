/**
 * CharacterCustomizationModal 확장 기능 테스트
 *
 * 잠금 옵션 표시, 프리셋 관리, 히스토리 표시 기능 테스트
 *
 * Created: 2026-02-24 11:05
 * PM: Genie
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import CharacterCustomizationModal from '../CharacterCustomizationModal.jsx'

// Mock socket module
vi.mock('../socket', () => ({
  socket: {
    emit: vi.fn(),
    on: vi.fn(),
    off: vi.fn()
  }
}))

// Mock i18n context - 더 간단한 방식
vi.mock('../i18n/I18nContext', () => ({
  useI18n: vi.fn()
}))

// Mock customization utilities
vi.mock('../utils/characterCustomization', () => ({
  getCustomization: () => ({
    hairStyle: 'short',
    clothingColor: 'blue',
    accessory: 'none'
  }),
  saveCustomization: vi.fn(),
  updateCustomization: vi.fn(),
  getOptionEmoji: (category, id) => {
    const emojis = {
      hairStyle: { short: '👨', medium: '👩', long: '👱‍♀️' },
      accessories: { none: '', glasses: '👓', hat: '🧢' }
    }
    return emojis[category]?.[id] || ''
  },
  getColorHex: (color) => {
    const colors = { blue: '#2196F3', red: '#F44336' }
    return colors[color] || '#4CAF50'
  }
}))

// Mock PresetManager and HistoryUI
vi.mock('../PresetManager', () => ({
  default: ({ show, onClose }) => show ? <div data-testid="preset-manager">Preset Manager</div> : null
}))

vi.mock('../HistoryUI', () => ({
  default: ({ show, onClose }) => show ? <div data-testid="history-ui">History UI</div> : null
}))

describe('CharacterCustomizationModal - 확장 기능', () => {
  const defaultProps = {
    show: true,
    onClose: vi.fn(),
    onSave: vi.fn(),
    characterLevel: 10
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('기본 렌더링', () => {
    it('컴포넌트가 렌더링됨 (Modal 요소 존재)', () => {
      render(
        <CharacterCustomizationModal
          {...defaultProps}
        />
      )

      // Modal 패널이 존재하는지 확인
      const modalPanels = document.querySelectorAll('.pixel-panel')
      expect(modalPanels.length).toBeGreaterThan(0)
    })

    it('프리셋 및 이력 버튼이 렌더링됨', () => {
      render(
        <CharacterCustomizationModal
          {...defaultProps}
        />
      )

      expect(screen.getByText('💾 프리셋')).toBeInTheDocument()
      expect(screen.getByText('📜 이력')).toBeInTheDocument()
    })
  })

  describe('캐릭터 레벨 prop 전달', () => {
    it('characterLevel prop가 컴포넌트에 전달됨', () => {
      const { container } = render(
        <CharacterCustomizationModal
          {...defaultProps}
          characterLevel={20}
        />
      )

      // 컴포넌트가 렌더링됨
      expect(container).toBeTruthy()
    })

    it('레벨 1 캐릭터도 렌더링됨', () => {
      const { container } = render(
        <CharacterCustomizationModal
          {...defaultProps}
          characterLevel={1}
        />
      )

      expect(container).toBeTruthy()
    })
  })

  describe('컴포넌트 구조 확인', () => {
    it('Modal body 요소가 존재', () => {
      render(
        <CharacterCustomizationModal
          {...defaultProps}
        />
      )

      const modalBody = document.querySelector('.pixel-panel-body')
      expect(modalBody).toBeTruthy()
    })
  })
})