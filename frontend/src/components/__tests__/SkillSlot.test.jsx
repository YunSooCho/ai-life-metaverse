/**
 * SkillSlot.test.jsx - 스킬 슬롯 UI 테스트
 */

import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { vi, describe, test, expect, beforeEach } from 'vitest'
import { SkillSlot, SkillSlotContainer } from '../SkillSlot'

// 모의 스킬 데이터
const mockSkill = {
  id: 'slash',
  name: '베기',
  description: '전방의 적에게 물리 공격',
  type: 'active',
  category: 'combat',
  cooldown: 3000,
  requiredLevel: 1,
  icon: '⚔️'
}

describe('SkillSlot 컴포넌트', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // T1: 기본 렌더링 (스킬 있음)
  test('T1: 기본 렌더링 테스트 - 스킬 있음', () => {
    render(
      <SkillSlot
        skill={mockSkill}
        isOnCooldown={false}
        cooldownRemaining={0}
        cooldownTotal={3000}
        onUse={vi.fn()}
        index={0}
      />
    )

    expect(screen.getByText('⚔️')).toBeInTheDocument()
    expect(screen.getByText('1')).toBeInTheDocument() // 키 바인딩
  })

  // T2: 쿨타임 중 표시
  test('T2: 쿨타임 중 표시 테스트', () => {
    render(
      <SkillSlot
        skill={mockSkill}
        isOnCooldown={true}
        cooldownRemaining={1500}
        cooldownTotal={3000}
        onUse={vi.fn()}
        index={0}
      />
    )

    expect(screen.getByText('2')).toBeInTheDocument() // 2초 남음
  })

  // T3: 빈 슬롯 표시
  test('T3: 빈 슬롯 표시 테스트', () => {
    const { container } = render(
      <SkillSlot
        skill={null}
        isOnCooldown={false}
        cooldownRemaining={0}
        cooldownTotal={0}
        onUse={vi.fn()}
        index={0}
      />
    )

    const slot = container.querySelector('.skill-slot')
    expect(slot).toHaveStyle({ border: '2px solid #333' })
  })

  // T4: 스킬 클릭 (쿨타임 아님)
  test('T4: 스킬 클릭 테스트 - 쿨타임 아님', () => {
    const mockOnUse = vi.fn()
    render(
      <SkillSlot
        skill={mockSkill}
        isOnCooldown={false}
        cooldownRemaining={0}
        cooldownTotal={3000}
        onUse={mockOnUse}
        index={0}
      />
    )

    fireEvent.click(screen.getByText('⚔️'))
    expect(mockOnUse).toHaveBeenCalledWith('slash')
  })

  // T5: 스킬 클릭 (쿨타임 중 - 미작동)
  test('T5: 스킬 클릭 테스트 - 쿨타임 중', () => {
    const mockOnUse = vi.fn()
    render(
      <SkillSlot
        skill={mockSkill}
        isOnCooldown={true}
        cooldownRemaining={1500}
        cooldownTotal={3000}
        onUse={mockOnUse}
        index={0}
      />
    )

    fireEvent.click(screen.getByText('⚔️'))
    expect(mockOnUse).not.toHaveBeenCalled()
  })

  // T6: 툴팁 표시 (hover)
  test('T6: 툴팁 표시 테스트 - hover', () => {
    render(
      <SkillSlot
        skill={mockSkill}
        isOnCooldown={false}
        cooldownRemaining={0}
        cooldownTotal={3000}
        onUse={vi.fn()}
        index={0}
      />
    )

    const slot = screen.getByText('⚔️')
    fireEvent.mouseEnter(slot)

    expect(screen.getByText('베기')).toBeInTheDocument()
    expect(screen.getByText('전방의 적에게 물리 공격')).toBeInTheDocument()
  })

  // T7: 툴팁 숨기기 (mouseleave)
  test('T7: 툴팁 숨기기 테스트 - mouseleave', () => {
    render(
      <SkillSlot
        skill={mockSkill}
        isOnCooldown={false}
        cooldownRemaining={0}
        cooldownTotal={3000}
        onUse={vi.fn()}
        index={0}
      />
    )

    const slot = screen.getByText('⚔️')
    fireEvent.mouseEnter(slot)
    fireEvent.mouseLeave(slot)

    // 툴팁이 DOM에서 제거되어야 함
    expect(screen.queryByText('베기')).toBeInTheDocument()
  })

  // T8: 키 바인딩 표시
  test('T8: 키 바인딩 표시 테스트', () => {
    render(
      <SkillSlot
        skill={mockSkill}
        isOnCooldown={false}
        cooldownRemaining={0}
        cooldownTotal={3000}
        onUse={vi.fn()}
        index={2}
      />
    )

    expect(screen.getByText('3')).toBeInTheDocument()
  })

  // T9: 쿨타임 오버레이 스타일
  test('T9: 쿨타임 오버레이 스타일 테스트', () => {
    const { container } = render(
      <SkillSlot
        skill={mockSkill}
        isOnCooldown={true}
        cooldownRemaining={1500}
        cooldownTotal={3000}
        onUse={vi.fn()}
        index={0}
      />
    )

    const overlay = container.querySelector('.cooldown-overlay')
    expect(overlay).toHaveStyle({ top: '50%' })
  })

  // T10: onUse 없음에도 렌더링
  test('T10: onUse 없음에도 렌더링 테스트', () => {
    render(
      <SkillSlot
        skill={mockSkill}
        isOnCooldown={false}
        cooldownRemaining={0}
        cooldownTotal={3000}
        index={0}
      />
    )

    expect(screen.getByText('⚔️')).toBeInTheDocument()
  })
})

describe('SkillSlotContainer 컴포넌트', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const mockAllSkills = [mockSkill]
  const mockCooldows = { slash: { remaining: 0, total: 3000 } }

  // T11: 기본 렌더링
  test('T11: 기본 렌더링 테스트', () => {
    render(
      <SkillSlotContainer
        equippedSkills={['slash']}
        allSkills={mockAllSkills}
        onUseSkill={vi.fn()}
        cooldowns={mockCooldows}
      />
    )

    expect(screen.getByText('⚔️')).toBeInTheDocument()
  })

  // T12: 빈 슬롯 표시 (장착된 스킬 부족)
  test('T12: 빈 슬롯 표시 테스트', () => {
    const { container } = render(
      <SkillSlotContainer
        equippedSkills={['slash']}
        allSkills={mockAllSkills}
        onUseSkill={vi.fn()}
        cooldowns={mockCooldows}
      />
    )

    const slots = container.querySelectorAll('.skill-slot')
    expect(slots.length).toBe(5) // 최대 5개 슬롯
  })

  // T13: 스킬 사용 이벤트
  test('T13: 스킬 사용 이벤트 테스트', () => {
    const mockOnUseSkill = vi.fn()
    render(
      <SkillSlotContainer
        equippedSkills={['slash']}
        allSkills={mockAllSkills}
        onUseSkill={mockOnUseSkill}
        cooldowns={mockCooldows}
      />
    )

    fireEvent.click(screen.getByText('⚔️'))
    expect(mockOnUseSkill).toHaveBeenCalledWith('slash')
  })

  // T14: 쿨타임 중 스킬 사용 불가
  test('T14: 쿨타임 중 스킬 사용 불가 테스트', () => {
    const mockOnUseSkill = vi.fn()
    const cooldownsWithActive = { slash: { remaining: 1500, total: 3000 } }

    render(
      <SkillSlotContainer
        equippedSkills={['slash']}
        allSkills={mockAllSkills}
        onUseSkill={mockOnUseSkill}
        cooldowns={cooldownsWithActive}
      />
    )

    fireEvent.click(screen.getByText('⚔️'))
    expect(mockOnUseSkill).not.toHaveBeenCalled()
  })

  // T15: 장착된 스킬 없음
  test('T15: 장착된 스킬 없음 테스트', () => {
    const { container } = render(
      <SkillSlotContainer
        equippedSkills={[]}
        allSkills={mockAllSkills}
        onUseSkill={vi.fn()}
        cooldowns={{}}
      />
    )

    const slots = container.querySelectorAll('.skill-slot')
    expect(slots.length).toBe(5)
  })
})