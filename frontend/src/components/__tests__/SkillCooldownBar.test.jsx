/**
 * SkillCooldownBar.test.jsx - 스킬 쿨타임 Progress Bar UI 테스트
 */

import React from 'react'
import { render, screen } from '@testing-library/react'
import { vi, describe, test, expect, beforeEach } from 'vitest'
import { SkillCooldownBar, SkillCooldownPanel, CooldownIndicator } from '../SkillCooldownBar'

describe('SkillCooldownBar 컴포넌트', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // T1: 기본 렌더링 (쿨타임 완료)
  test('T1: 기본 렌더링 테스트 - 쿨타임 완료', () => {
    render(
      <SkillCooldownBar
        skillName="베기"
        cooldownRemaining={0}
        cooldownTotal={3000}
        icon="⚔️"
      />
    )

    expect(screen.getByText('베기')).toBeInTheDocument()
    expect(screen.getByText('사용 가능')).toBeInTheDocument()
  })

  // T2: 쿨타임 중 표시
  test('T2: 쿨타임 중 표시 테스트', () => {
    render(
      <SkillCooldownBar
        skillName="베기"
        cooldownRemaining={1500}
        cooldownTotal={3000}
        icon="⚔️"
      />
    )

    expect(screen.getByText('2초')).toBeInTheDocument()
  })

  // T3: 쿨타임 100% 표시
  test('T3: 쿨타임 100% 표시 테스트', () => {
    render(
      <SkillCooldownBar
        skillName="베기"
        cooldownRemaining={3000}
        cooldownTotal={3000}
        icon="⚔️"
      />
    )

    expect(screen.getByText('3초')).toBeInTheDocument()
  })

  // T4: 쿨타임 퍼센트 계산
  test('T4: 쿨타임 퍼센트 계산 테스트', () => {
    const { container } = render(
      <SkillCooldownBar
        skillName="베기"
        cooldownRemaining={1500}
        cooldownTotal={3000}
        icon="⚔️"
      />
    )

    const fill = container.querySelector('.cooldown-fill')
    expect(fill).toHaveStyle({ width: '50%' })
  })

  // T5: 아이콘 없음에도 렌더링
  test('T5: 아이콘 없음에도 렌더링 테스트', () => {
    render(
      <SkillCooldownBar
        skillName="베기"
        cooldownRemaining={0}
        cooldownTotal={3000}
      />
    )

    expect(screen.getByText('베기')).toBeInTheDocument()
  })

  // T6: 사용 가능 상태 색상 (초록)
  test('T6: 사용 가능 상태 색상 테스트', () => {
    const { container } = render(
      <SkillCooldownBar
        skillName="베기"
        cooldownRemaining={0}
        cooldownTotal={3000}
        icon="⚔️"
      />
    )

    const fill = container.querySelector('.cooldown-fill')
    expect(fill).toHaveStyle({ backgroundColor: '#4CAF50' })
  })

  // T7: 쿨타임 상태 색상 (빨강)
  test('T7: 쿨타임 상태 색상 테스트', () => {
    const { container } = render(
      <SkillCooldownBar
        skillName="베기"
        cooldownRemaining={1500}
        cooldownTotal={3000}
        icon="⚔️"
      />
    )

    const fill = container.querySelector('.cooldown-fill')
    expect(fill).toHaveStyle({ backgroundColor: '#f44336' })
  })

  // T8: 쿨타임 1분 초과 포맷
  test('T8: 쿨타임 1분 초과 포맷 테스트', () => {
    render(
      <SkillCooldownBar
        skillName="베기"
        cooldownRemaining={65000}
        cooldownTotal={120000}
        icon="⚔️"
      />
    )

    expect(screen.getByText('1분 5초')).toBeInTheDocument()
  })

  // T9: Progress Bar 컨테이너 렌더링
  test('T9: Progress Bar 컨테이너 렌더링 테스트', () => {
    const { container } = render(
      <SkillCooldownBar
        skillName="베기"
        cooldownRemaining={1500}
        cooldownTotal={3000}
        icon="⚔️"
      />
    )

    const container_div = container.querySelector('.cooldown-bar')
    expect(container_div).toBeInTheDocument()
  })

  // T10: 줄무늬 애니메이션 표시 (쿨타임 중)
  test('T10: 줄무늬 애니메이션 표시 테스트', () => {
    const { container } = render(
      <SkillCooldownBar
        skillName="베기"
        cooldownRemaining={1500}
        cooldownTotal={3000}
        icon="⚔️"
      />
    )

    const stripe = container.querySelector('.cooldown-stripe')
    expect(stripe).toBeInTheDocument()
  })
})

describe('SkillCooldownPanel 컴포넌트', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const mockAllSkills = [
    {
      id: 'slash',
      name: '베기',
      icon: '⚔️',
      cooldown: 3000
    },
    {
      id: 'heal',
      name: '힐',
      icon: '💗',
      cooldown: 10000
    }
  ]

  // T11: 기본 렌더링
  test('T11: 기본 렌더링 테스트', () => {
    render(
      <SkillCooldownPanel
        cooldowns={{ slash: { remaining: 1500, total: 3000 } }}
        allSkills={mockAllSkills}
      />
    )

    expect(screen.getByText('베기')).toBeInTheDocument()
  })

  // T12: 빈 쿨타임 패널
  test('T12: 빈 쿨타임 패널 테스트', () => {
    render(
      <SkillCooldownPanel
        cooldowns={{}}
        allSkills={mockAllSkills}
      />
    )

    expect(screen.getByText('쿨타임 중인 스킬이 없습니다.')).toBeInTheDocument()
  })

  // T13: 다중 스킬 쿨타임 표시
  test('T13: 다중 스킬 쿨타임 표시 테스트', () => {
    render(
      <SkillCooldownPanel
        cooldowns={{
          slash: { remaining: 1500, total: 3000 },
          heal: { remaining: 5000, total: 10000 }
        }}
        allSkills={mockAllSkills}
      />
    )

    expect(screen.getByText('베기')).toBeInTheDocument()
    expect(screen.getByText('힐')).toBeInTheDocument()
  })

  // T14: 쿨타임 완료된 스킬 제외
  test('T14: 쿨타임 완료된 스킬 제외 테스트', () => {
    render(
      <SkillCooldownPanel
        cooldowns={{
          slash: { remaining: 0, total: 3000 },
          heal: { remaining: 5000, total: 10000 }
        }}
        allSkills={mockAllSkills}
      />
    )

    expect(screen.queryByText('베기')).not.toBeInTheDocument()
    expect(screen.getByText('힐')).toBeInTheDocument()
  })

  // T15: 쿨타임 정렬 (남은 시간 오름차순)
  test('T15: 쿨타임 정렬 테스트', () => {
    render(
      <SkillCooldownPanel
        cooldowns={{
          heal: { remaining: 8000, total: 10000 },
          slash: { remaining: 1000, total: 3000 }
        }}
        allSkills={mockAllSkills}
      />
    )

    const texts = screen.getAllByText(/s$/)
    expect(texts[0]).toHaveTextContent('1s')
  })
})

describe('CooldownIndicator 컴포넌트', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // T16: 기본 렌더링 (쿨타임 중)
  test('T16: 기본 렌더링 테스트 - 쿨타임 중', () => {
    render(
      <CooldownIndicator
        isOnCooldown={true}
        remainingTime={1500}
      />
    )

    expect(screen.getByText('2s')).toBeInTheDocument()
  })

  // T17: 쿨타임 완료 시 미표시
  test('T17: 쿨타임 완료 시 미표시 테스트', () => {
    const { container } = render(
      <CooldownIndicator
        isOnCooldown={false}
        remainingTime={0}
      />
    )

    expect(container.firstChild).toBeNull()
  })

  // T18: 사이즈 small
  test('T18: 사이즈 small 테스트', () => {
    render(
      <CooldownIndicator
        isOnCooldown={true}
        remainingTime={1500}
        size="small"
      />
    )

    expect(screen.getByText('2s')).toBeInTheDocument()
  })

  // T19: 사이즈 large
  test('T19: 사이즈 large 테스트', () => {
    const { container } = render(
      <CooldownIndicator
        isOnCooldown={true}
        remainingTime={1500}
        size="large"
      />
    )

    const indicator = container.querySelector('.cooldown-indicator')
    expect(indicator).toHaveStyle({ fontSize: '16px' })
  })

  // T20: 1초 미만 표시
  test('T20: 1초 미만 표시 테스트', () => {
    render(
      <CooldownIndicator
        isOnCooldown={true}
        remainingTime={500}
      />
    )

    expect(screen.getByText('1s')).toBeInTheDocument()
  })
})