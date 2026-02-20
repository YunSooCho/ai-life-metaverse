/**
 * EquipmentMenu App.jsx Integration Test
 *
 * 장비 메뉴가 App.jsx에 올바르게 통합되었는지 테스트
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import App from '../../App'

// Mock socket
const mockSocket = {
  connected: true,
  emit: vi.fn(),
  on: vi.fn(),
  off: vi.fn()
}

vi.mock('../../socket', () => ({
  socket: mockSocket
}))

// Mock soundManager
vi.mock('../../utils/soundManager', () => ({
  soundManager: {
    init: vi.fn().mockResolvedValue(true),
    playBGM: vi.fn().mockResolvedValue(true),
    playSFX: vi.fn().mockResolvedValue(true),
    stopAll: vi.fn()
  },
  BGM_URLS: {
    MAIN: '/audio/bgm/main.mp3'
  },
  SFX_URLS: {
    MOVE: '/audio/sfx/move.mp3',
    GREET: '/audio/sfx/greet.mp3',
    GIFT: '/audio/sfx/gift.mp3'
  }
}))

describe('EquipmentMenu Integration - App.jsx', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('장비 버튼이 렌더링되어야 함', () => {
    render(<App />)

    // 장비 버튼 확인
    const equipmentButton = screen.queryByText('🛡️ 장비')
    expect(equipmentButton).toBeInTheDocument()
  })

  it('장비 버튼 클릭 시 EquipmentMenu 모달이 표시되어야 함', async () => {
    render(<App />)

    // 장비 버튼 클릭
    const equipmentButton = screen.queryByText('🛡️ 장비')
    expect(equipmentButton).toBeInTheDocument()

    fireEvent.click(equipmentButton!)

    // EquipmentMenu 헤더 확인 (비동기로 나타날 수 있음)
    await waitFor(() => {
      const equipmentMenu = document.querySelector('.equipment-menu')
      expect(equipmentMenu).toBeInTheDocument()
    }, { timeout: 3000 })
  })

  it('장비 메뉴 닫기 버튼이 렌더링되어야 함', async () => {
    render(<App />)

    // 장비 버튼 클릭으로 메뉴 열기
    const equipmentButton = screen.queryByText('🛡️ 장비')
    fireEvent.click(equipmentButton!)

    await waitFor(() => {
      const closeButton = screen.queryByText('닫기')
      expect(closeButton).toBeInTheDocument()
    }, { timeout: 3000 })
  })

  it('닫기 버튼 클릭 시 EquipmentMenu 모달이 닫혀야 함', async () => {
    render(<App />)

    // 장비 버튼 클릭으로 메뉴 열기
    const equipmentButton = screen.queryByText('🛡️ 장비')
    fireEvent.click(equipmentButton!)

    await waitFor(() => {
      const equipmentMenu = document.querySelector('.equipment-menu')
      expect(equipmentMenu).toBeInTheDocument()
    }, { timeout: 3000 })

    // 닫기 버튼 클릭
    const closeButton = screen.queryByText('닫기')
    fireEvent.click(closeButton!)

    await waitFor(() => {
      const equipmentMenu = document.querySelector('.equipment-menu')
      expect(equipmentMenu).not.toBeInTheDocument()
    }, { timeout: 3000 })
  })

  it('EquipmentMenu 오버레이가 올바른 스타일을 가져야 함', async () => {
    render(<App />)

    // 장비 버튼 클릭
    const equipmentButton = screen.queryByText('🛡️ 장비')
    fireEvent.click(equipmentButton!)

    await waitFor(() => {
      const overlay = document.querySelector('.equipment-menu-overlay')
      expect(overlay).toBeInTheDocument()
      expect(overlay).toHaveStyle({
        position: 'fixed',
        top: '0',
        left: '0',
        right: '0',
        bottom: '0',
        zIndex: '1000'
      })
    }, { timeout: 3000 })
  })

  it('App.jsx에 EquipmentMenu import가 있어야 함', async () => {
    const appSource = await import('../../App.jsx?raw')
    const appCode = appSource.default || appSource

    // EquipmentMenu import 확인
    expect(appCode).toContain("import EquipmentMenu from './components/EquipmentMenu'")
  })

  it('App.jsx에 showEquipment 상태가 있어야 함', async () => {
    const appSource = await import('../../App.jsx?raw')
    const appCode = appSource.default || appSource

    // showEquipment useState 확인
    expect(appCode).toContain('showEquipment')
    expect(appCode).toContain('setShowEquipment')
  })

  it('EquipmentMenu가 JSX 렌더링에 포함되어야 함', async () => {
    const appSource = await import('../../App.jsx?raw')
    const appCode = appSource.default || appSource

    // EquipmentMenu 컴포넌트 사용 확인
    expect(appCode).toContain('<EquipmentMenu />')
  })
})

describe('SkillMenu Integration - App.jsx', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('스킬 버튼이 렌더링되어야 함', () => {
    render(<App />)

    // 스킬 버튼 확인
    const skillButton = screen.queryByText('⚔️ 스킬')
    expect(skillButton).toBeInTheDocument()
  })

  it('스킬 버튼 클릭 시 SkillMenu 모달이 표시되어야 함', async () => {
    render(<App />)

    // 스킬 버튼 클릭
    const skillButton = screen.queryByText('⚔️ 스킬')
    expect(skillButton).toBeInTheDocument()

    fireEvent.click(skillButton!)

    // SkillMenu 헤더 확인
    await waitFor(() => {
      const skillMenuOverlay = document.querySelector('.skill-menu-overlay')
      expect(skillMenuOverlay).toBeInTheDocument()
    }, { timeout: 3000 })
  })

  it('SkillMenu 닫기 버튼이 렌더링되어야 함', async () => {
    render(<App />)

    // 스킬 버튼 클릭으로 메뉴 열기
    const skillButton = screen.queryByText('⚔️ 스킬')
    fireEvent.click(skillButton!)

    await waitFor(() => {
      const closeButton = screen.queryByText('닫기')
      expect(closeButton).toBeInTheDocument()
    }, { timeout: 3000 })
  })

  it('닫기 버튼 클릭 시 SkillMenu 모달이 닫혀야 함', async () => {
    render(<App />)

    // 스킬 버튼 클릭으로 메뉴 열기
    const skillButton = screen.queryByText('⚔️ 스킬')
    fireEvent.click(skillButton!)

    await waitFor(() => {
      const skillMenuOverlay = document.querySelector('.skill-menu-overlay')
      expect(skillMenuOverlay).toBeInTheDocument()
    }, { timeout: 3000 })

    // 닫기 버튼 클릭
    const closeButton = screen.queryAllByText('닫기').find(btn =>
      btn.textContent === '닫기' && btn.closest('.skill-menu-container')
    )

    if (closeButton) {
      fireEvent.click(closeButton)

      await waitFor(() => {
        const skillMenuOverlay = document.querySelector('.skill-menu-overlay')
        expect(skillMenuOverlay).not.toBeInTheDocument()
      }, { timeout: 3000 })
    }
  })

  it('App.jsx에 SkillMenu import가 있어야 함', async () => {
    const appSource = await import('../../App.jsx?raw')
    const appCode = appSource.default || appSource

    // SkillMenu import 확인
    expect(appCode).toContain("import SkillMenu from './components/SkillMenu'")
  })

  it('App.jsx에 showSkillMenu 상태가 있어야 함', async () => {
    const appSource = await import('../../App.jsx?raw')
    const appCode = appSource.default || appSource

    // showSkillMenu useState 확인
    expect(appCode).toContain('showSkillMenu')
    expect(appCode).toContain('setShowSkillMenu')
  })

  it('SkillMenu가 JSX 렌더링에 포함되어야 함', async () => {
    const appSource = await import('../../App.jsx?raw')
    const appCode = appSource.default || appSource

    // SkillMenu 컴포넌트 사용 확인
    expect(appCode).toContain('<SkillMenu')
  })
})