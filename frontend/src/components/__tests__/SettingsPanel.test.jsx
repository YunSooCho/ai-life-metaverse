/**
 * SettingsPanel 테스트
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import SettingsPanel from '../SettingsPanel'

// Mock soundSystem
vi.mock('../../utils/soundSystem', () => ({
  default: {
    bgmVolume: 0.5,
    sfxVolume: 0.5,
    muted: false,
    setBgmVolume: vi.fn(),
    setSfxVolume: vi.fn(),
    toggleMute: vi.fn(() => false),
  }
}))

import soundSystem from '../../utils/soundSystem'

describe('SettingsPanel', () => {
  const mockOnClose = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    soundSystem.bgmVolume = 0.5
    soundSystem.sfxVolume = 0.5
    soundSystem.muted = false
  })

  describe('기본 렌더링', () => {
    it('설정 패널이 렌더링되어야 함', () => {
      render(<SettingsPanel onClose={mockOnClose} />)
      expect(screen.getByText('⚙️ SETTINGS')).toBeInTheDocument()
    })

    it('BGM 볼륨 슬라이더가 표시되어야 함', () => {
      render(<SettingsPanel onClose={mockOnClose} />)
      const sliders = screen.getAllByRole('slider')
      expect(sliders.length).toBeGreaterThanOrEqual(1)
      expect(screen.getAllByText('50%').length).toBeGreaterThanOrEqual(1)
    })

    it('SFX 볼륨 슬라이더가 표시되어야 함', () => {
      render(<SettingsPanel onClose={mockOnClose} />)
      const sliders = screen.getAllByRole('slider')
      expect(sliders.length).toBeGreaterThanOrEqual(2)
    })

    it('음소거 버튼이 표시되어야 함', () => {
      render(<SettingsPanel onClose={mockOnClose} />)
      expect(screen.getByText('OFF')).toBeInTheDocument()
    })

    it('닫기 버튼이 표시되어야 함', () => {
      render(<SettingsPanel onClose={mockOnClose} />)
      expect(screen.getByText('✕')).toBeInTheDocument()
    })
  })

  describe('BGM 볼륨 제어', () => {
    it('BGM 볼륨 슬라이더 변경 시 setBgmVolume 호출', () => {
      render(<SettingsPanel onClose={mockOnClose} />)
      const slider = screen.getAllByRole('slider')[0]

      fireEvent.change(slider, { target: { value: '0.7' } })

      expect(soundSystem.setBgmVolume).toHaveBeenCalledWith(0.7)
    })

    it('BGM 볼륨 값 표시', () => {
      soundSystem.bgmVolume = 0.8
      render(<SettingsPanel onClose={mockOnClose} />)
      expect(screen.getByText('80%')).toBeInTheDocument()
    })
  })

  describe('SFX 볼륨 제어', () => {
    it('SFX 볼륨 슬라이더 변경 시 setSfxVolume 호출', () => {
      render(<SettingsPanel onClose={mockOnClose} />)
      const sliders = screen.getAllByRole('slider')
      const slider2 = sliders[1] || sliders[0]

      fireEvent.change(slider2, { target: { value: '0.3' } })

      expect(soundSystem.setSfxVolume).toHaveBeenCalledWith(0.3)
    })

    it('SFX 볼륨 값 표시', () => {
      soundSystem.sfxVolume = 0.6
      render(<SettingsPanel onClose={mockOnClose} />)
      expect(screen.getByText('60%')).toBeInTheDocument()
    })
  })

  describe('음소거 토글', () => {
    it('음소거 버튼 클릭 시 toggleMute 호출', () => {
      soundSystem.toggleMute = vi.fn(() => true)
      render(<SettingsPanel onClose={mockOnClose} />)

      const muteBtn = screen.getByText('OFF')
      fireEvent.click(muteBtn)

      expect(soundSystem.toggleMute).toHaveBeenCalled()
    })

    it('음소거 상태일 때 ON 표시', () => {
      soundSystem.muted = true
      soundSystem.toggleMute = vi.fn(() => false)
      render(<SettingsPanel onClose={mockOnClose} />)

      expect(screen.getByText('ON')).toBeInTheDocument()
    })
  })

  describe('패널 닫기', () => {
    it('닫기 버튼(X) 클릭 시 onClose 호출', () => {
      render(<SettingsPanel onClose={mockOnClose} />)

      const closeBtn = screen.getByText('✕')
      fireEvent.click(closeBtn)

      expect(mockOnClose).toHaveBeenCalled()
    })

    it('패널 외부 클릭 시 onClose 호출', () => {
      const { container } = render(<SettingsPanel onClose={mockOnClose} />)

      const overlay = container.querySelector('.settings-overlay')
      fireEvent.click(overlay)

      expect(mockOnClose).toHaveBeenCalled()
    })

    it('패널 내부 클릭 시 onClose 호출 안 됨', () => {
      render(<SettingsPanel onClose={mockOnClose} />)

      const panel = screen.getByText('⚙️ SETTINGS').closest('.settings-panel')
      if (panel) {
        fireEvent.click(panel)
      }

      expect(mockOnClose).not.toHaveBeenCalled()
    })
  })
})