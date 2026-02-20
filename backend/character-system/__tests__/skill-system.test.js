/**
 * Skill System Tests (Phase 12)
 *
 * 스킬 시스템 테스트
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { SkillManager, SkillType, SkillCategory, EffectType, BASE_SKILLS, createEmptySkills } from '../skill-system'

describe('SkillManager', () => {
  let skillManager
  let testCharacter

  beforeEach(() => {
    skillManager = new SkillManager(console)
    testCharacter = {
      id: 'player1',
      name: 'Test Player',
      level: 10,
      skills: createEmptySkills()
    }
  })

  afterEach(() => {
    skillManager = null
    testCharacter = null
  })

  describe('기본 스킬 정보', () => {
    it('[T01] 모든 스킬이 올바르게 정의되어 있어야 함', () => {
      const allSkills = skillManager.getAllSkills()

      expect(allSkills.length).toBeGreaterThan(0)
      allSkills.forEach(skill => {
        expect(skill.id).toBeDefined()
        expect(skill.name).toBeDefined()
        expect(skill.type).toBeTruthy()
        expect([SkillType.ACTIVE, SkillType.PASSIVE]).toContain(skill.type)
        expect(skill.category).toBeTruthy()
        expect(skill.cooldown).toBeGreaterThanOrEqual(0)
        expect(skill.requiredLevel).toBeGreaterThan(0)
        expect(skill.maxLevel).toBeGreaterThan(0)
      })
    })

    it('[T02] 개별 스킬 정보를 올바르게 가져와야 함', () => {
      const slashSkill = skillManager.getSkill('slash')

      expect(slashSkill).not.toBeNull()
      expect(slashSkill.id).toBe('slash')
      expect(slashSkill.name).toBe('베기')
      expect(slashSkill.type).toBe(SkillType.ACTIVE)
      expect(slashSkill.category).toBe(SkillCategory.COMBAT)
      expect(slashSkill.cooldown).toBe(3000)
      expect(slashSkill.requiredLevel).toBe(1)
      expect(slashSkill.maxLevel).toBe(5)
    })

    it('[T03] 존재하지 않는 스킬은 null을 반환해야 함', () => {
      const invalidSkill = skillManager.getSkill('nonexistent_skill')

      expect(invalidSkill).toBeNull()
    })
  })

  describe('스킬 학습', () => {
    it('[T04] 레벨 조건을 만족하면 스킬을 학습할 수 있음', () => {
      testCharacter.level = 10

      const result = skillManager.learnSkill(testCharacter, 'dash')

      expect(result.success).toBe(true)
      expect(testCharacter.skills.skills).toContain('dash')
      expect(testCharacter.skills.skillLevels['dash']).toBe(1)
      expect(testCharacter.skills.skillExp['dash']).toBe(0)
      expect(result.message).toContain('대시')
    })

    it('[T05] 레벨이 부족하면 스킬을 학습할 수 없음', () => {
      testCharacter.level = 1

      const skill = skillManager.getSkill('power_strike') // requiredLevel: 10
      const result = skillManager.learnSkill(testCharacter, 'power_strike')

      expect(result.success).toBe(false)
      expect(testCharacter.skills.skills).not.toContain('power_strike')
      expect(result.message).toContain('레벨 부족')
    })

    it('[T06] 이미 학습한 스킬은 다시 학습할 수 없음', () => {
      testCharacter.skills.skills.push('slash')
      testCharacter.skills.skillLevels['slash'] = 1

      const result = skillManager.learnSkill(testCharacter, 'slash')

      expect(result.success).toBe(false)
      expect(result.message).toContain('이미 학습한 스킬')
    })

    it('[T07] 패시브 스킬 학습 시 자동 장착됨', () => {
      const result = skillManager.learnSkill(testCharacter, 'critical_hit')

      expect(result.success).toBe(true)
      expect(testCharacter.skills.passiveSkills).toContain('critical_hit')
    })

    it('[T08] 캐릭터 데이터가 없으면 학습 실패', () => {
      const result = skillManager.learnSkill(null, 'slash')

      expect(result.success).toBe(false)
      expect(result.message).toContain('캐릭터 데이터 없음')
    })

    it('[T09] 유효하지 않은 스킬은 학습 실패', () => {
      const result = skillManager.learnSkill(testCharacter, 'invalid_skill')

      expect(result.success).toBe(false)
      expect(result.message).toContain('유효하지 않은 스킬')
    })
  })

  describe('스킬 레벨업', () => {
    beforeEach(() => {
      testCharacter.skills.skills.push('slash')
      testCharacter.skills.skillLevels['slash'] = 1
      testCharacter.skills.skillExp['slash'] = 0
    })

    it('[T10] 충분한 경험치로 스킬 레벨업 가능', () => {
      const result = skillManager.levelUpSkill(testCharacter, 'slash', 100)

      expect(result.success).toBe(true)
      expect(testCharacter.skills.skillLevels['slash']).toBe(2)
      expect(result.oldLevel).toBe(1)
      expect(result.newLevel).toBe(2)
      expect(result.message).toContain('레벨업')
    })

    it('[T11] 경험치가 부족하면 레벨업 실패', () => {
      const result = skillManager.levelUpSkill(testCharacter, 'slash', 50)

      expect(result.success).toBe(false)
      expect(testCharacter.skills.skillLevels['slash']).toBe(1)
      expect(result.message).toContain('레벨업 필요 경험치 미달')
    })

    it('[T12] 최대 레벨 도달 시 더 이상 레벨업 불가', () => {
      testCharacter.skills.skillLevels['slash'] = 5

      const result = skillManager.levelUpSkill(testCharacter, 'slash', 1000)

      expect(result.success).toBe(false)
      expect(testCharacter.skills.skillLevels['slash']).toBe(5)
      expect(result.message).toContain('최대 레벨')
    })

    it('[T13] 학습하지 않은 스킬은 레벨업 불가', () => {
      const result = skillManager.levelUpSkill(testCharacter, 'power_strike', 100)

      expect(result.success).toBe(false)
      expect(result.message).toContain('학습하지 않은 스킬')
    })
  })

  describe('스킬 사용 가능 여부 확인', () => {
    beforeEach(() => {
      testCharacter.skills.skills.push('slash')
      testCharacter.skills.skillLevels['slash'] = 1
      testCharacter.skills.equippedActive.push('slash')
    })

    it('[T14] 조건을 만족하면 스킬 사용 가능', () => {
      const result = skillManager.canUseSkill(testCharacter, 'slash')

      expect(result.canUse).toBe(true)
      expect(result.skill).toBeDefined()
      expect(result.skill.id).toBe('slash')
    })

    it('[T15] 액티브 스킬만 장착 가능', () => {
      testCharacter.skills.passiveSkills.push('critical_hit')
      testCharacter.skills.skillLevels['critical_hit'] = 1

      const result = skillManager.canUseSkill(testCharacter, 'critical_hit')

      expect(result.canUse).toBe(false)
      if (result.reason) {
        expect(result.reason).toContain('액티브 스킬이 아님')
      }
    })

    it('[T16] 장착되지 않은 스킬은 사용 불가', () => {
      testCharacter.skills.skills.push('heal')
      testCharacter.skills.skillLevels['heal'] = 1
      // 장착하지 않음

      const result = skillManager.canUseSkill(testCharacter, 'heal')

      expect(result.canUse).toBe(false)
      if (result.reason) {
        expect(result.reason).toContain('장착되지 않은 스킬')
      }
    })

    it('[T17] 쿨타임 중인 스킬은 사용 불가', () => {
      testCharacter.skills.skillCooldowns['slash'] = Date.now() + 5000 // 5초 후 쿨다운

      const result = skillManager.canUseSkill(testCharacter, 'slash')

      expect(result.canUse).toBe(false)
      if (result.reason) {
        expect(result.reason).toContain('쿨타임 중')
      }
      expect(result.remainingTime).toBeGreaterThan(0)
    })
  })

  describe('스킬 사용', () => {
    beforeEach(() => {
      testCharacter.skills.skills.push('slash')
      testCharacter.skills.skillLevels['slash'] = 1
      testCharacter.skills.equippedActive.push('slash')
    })

    it('[T18] 스킬 사용 성공 및 쿨타임 설정', () => {
      const now = Date.now()
      const result = skillManager.useSkill(testCharacter, 'slash')

      expect(result.success).toBe(true)
      expect(result.effects).toBeDefined()
      expect(testCharacter.skills.skillCooldowns['slash']).toBeGreaterThan(now)
      expect(result.message).toContain('사용했습니다')
    })

    it('[T19] 공격 스킬 데미지 계산', () => {
      const result = skillManager.useSkill(testCharacter, 'slash')

      expect(result.effects.damage).toBeGreaterThan(0)
      expect(result.effects.damage).toBeGreaterThanOrEqual(10) // min damage
      expect(result.effects.damage).toBeLessThanOrEqual(20) // max damage
    })

    it('[T20] 힐 스킬 회복량 계산', () => {
      testCharacter.skills.skills.push('heal')
      testCharacter.skills.skillLevels['heal'] = 1
      testCharacter.skills.equippedActive.push('heal')

      const result = skillManager.useSkill(testCharacter, 'heal')

      expect(result.success).toBe(true)
      expect(result.effects.heal).toBeGreaterThan(0)
      expect(result.effects.heal).toBeGreaterThanOrEqual(20)
      expect(result.effects.heal).toBeLessThanOrEqual(40)
    })

    it('[T21] 스킬 레벨에 따른 효과 증가', () => {
      testCharacter.skills.skillLevels['slash'] = 3 // 레벨 3

      const result1 = skillManager.useSkill(testCharacter, 'slash')

      // 레벨 1일 때보다 데미지가 높아야 함
      testCharacter.skills.skillLevels['slash'] = 1
      const cooldownEnd = testCharacter.skills.skillCooldowns['slash']
      testCharacter.skills.skillCooldowns['slash'] = 0 // 쿨다운 리셋

      const result2 = skillManager.useSkill(testCharacter, 'slash')

      expect(result1.effects.damage).toBeGreaterThan(result2.effects.damage)
    })

    it('[T22] 지속 효과 스킬은 activeEffects에 등록됨', () => {
      testCharacter.skills.skills.push('speed_boost')
      testCharacter.skills.skillLevels['speed_boost'] = 1
      testCharacter.skills.equippedActive.push('speed_boost')

      const result = skillManager.useSkill(testCharacter, 'speed_boost')

      expect(result.success).toBe(true)
      expect(result.effects.activeEffects.length).toBeGreaterThan(0)
      expect(testCharacter.skills.activeEffects.length).toBeGreaterThan(0)
    })

    it('[T23] 사용 불가 조건 시 스킬 사용 실패', () => {
      testCharacter.skills.skillCooldowns['slash'] = Date.now() + 5000

      const result = skillManager.useSkill(testCharacter, 'slash')

      expect(result.success).toBe(false)
      expect(result.message).toContain('쿨타임 중')
    })
  })

  describe('스킬 장착/해제', () => {
    beforeEach(() => {
      testCharacter.skills.skills.push('slash')
      testCharacter.skills.skillLevels['slash'] = 1
    })

    it('[T24] 액티브 스킬 장착 성공', () => {
      const result = skillManager.equipSkill(testCharacter, 'slash')

      expect(result.success).toBe(true)
      expect(testCharacter.skills.equippedActive).toContain('slash')
      expect(result.message).toContain('장착했습니다')
    })

    it('[T25] 패시브 스킬은 장착 불가', () => {
      testCharacter.skills.skills.push('critical_hit')
      testCharacter.skills.skillLevels['critical_hit'] = 1

      const result = skillManager.equipSkill(testCharacter, 'critical_hit')

      expect(result.success).toBe(false)
      expect(result.message).toContain('액티브 스킬만 장착 가능')
    })

    it('[T26] 학습하지 않은 스킬은 장착 불가', () => {
      const result = skillManager.equipSkill(testCharacter, 'power_strike')

      expect(result.success).toBe(false)
      expect(result.message).toContain('학습하지 않은 스킬')
    })

    it('[T27] 슬롯이 꽉 차면 장착 불가', () => {
      testCharacter.skills.activeSlots = 2
      testCharacter.skills.equippedActive = ['slash', 'heal']
      testCharacter.skills.skills.push('heal')
      testCharacter.skills.skillLevels['heal'] = 1
      testCharacter.skills.skills.push('dash')
      testCharacter.skills.skillLevels['dash'] = 1

      const result = skillManager.equipSkill(testCharacter, 'dash')

      expect(result.success).toBe(false)
      expect(result.message).toContain('슬롯 꽉 참')
    })

    it('[T28] 스킬 장착 해제 성공', () => {
      testCharacter.skills.equippedActive.push('slash')

      const result = skillManager.unequipSkill(testCharacter, 'slash')

      expect(result.success).toBe(true)
      expect(testCharacter.skills.equippedActive).not.toContain('slash')
    })

    it('[T29] 장착되지 않은 스킬은 해제 불가', () => {
      const result = skillManager.unequipSkill(testCharacter, 'slash')

      expect(result.success).toBe(false)
      expect(result.message).toContain('장착되지 않은 스킬')
    })
  })

  describe('쿨타임 관리', () => {
    beforeEach(() => {
      testCharacter.skills.skills.push('slash')
      testCharacter.skills.skillLevels['slash'] = 1
      testCharacter.skills.equippedActive.push('slash')
    })

    it('[T30] 쿨다운 만료 시 쿨타임 제거', () => {
      const now = Date.now()
      testCharacter.skills.skillCooldowns['slash'] = now

      skillManager.updateCooldowns(testCharacter)

      expect(testCharacter.skills.skillCooldowns['slash']).toBeUndefined()
    })

    it('[T31] 쿨다운 만료되지 않으면 유지됨', () => {
      const now = Date.now()
      testCharacter.skills.skillCooldowns['slash'] = now + 5000

      skillManager.updateCooldowns(testCharacter)

      expect(testCharacter.skills.skillCooldowns['slash']).toBeGreaterThan(now)
    })
  })

  describe('패시브 스킬 효과', () => {
    beforeEach(() => {
      testCharacter.skills.passiveSkills = ['critical_hit', 'vitality']
      testCharacter.skills.skillLevels['critical_hit'] = 2
      testCharacter.skills.skillLevels['vitality'] = 1
    })

    it('[T32] 패시브 스킬 효과 계산', () => {
      const effects = skillManager.calculatePassiveEffects(testCharacter)

      expect(effects).toBeDefined()
      expect(effects.criticalChance).toBeGreaterThan(0)
      expect(effects.maxHp).toBeGreaterThan(0)
    })

    it('[T33] 캐릭터 총 스탯에 패시브 효과 적용', () => {
      const baseStats = {
        maxHp: 100,
        defense: 50
      }

      const totalStats = skillManager.calculateTotalStats(testCharacter, baseStats)

      expect(totalStats.maxHp).toBeGreaterThan(baseStats.maxHp)
      // criticalChance는 baseStats에 없으므로 추가됨
    })

    it('[T34] 액티브 효과와 패시브 효과 동시 적용', () => {
      testCharacter.skills.activeEffects = [
        {
          skillId: 'defense_boost',
          effectType: 'increase_stat',
          stat: 'defense',
          value: 1.2,
          endTime: Date.now() + 10000
        }
      ]

      const baseStats = {
        maxHp: 100,
        defense: 50
      }

      const totalStats = skillManager.calculateTotalStats(testCharacter, baseStats)

      expect(totalStats.maxHp).toBeGreaterThan(baseStats.maxHp)
      expect(totalStats.defense).toBeGreaterThan(baseStats.defense)
    })
  })

  describe('만료된 액티브 효과 제거', () => {
    it('[T35] 만료된 액티브 효과를 제거', () => {
      const now = Date.now()
      testCharacter.skills.activeEffects = [
        {
          skillId: 'defense_boost',
          effectType: 'increase_stat',
          stat: 'defense',
          value: 1.2,
          endTime: now - 1000 // 이미 만료
        },
        {
          skillId: 'speed_boost',
          effectType: 'speed_boost',
          multiplier: 1.3,
          endTime: now + 5000 // 아직 유효
        }
      ]

      skillManager.updateCooldowns(testCharacter)

      expect(testCharacter.skills.activeEffects.length).toBe(1)
      expect(testCharacter.skills.activeEffects[0].skillId).toBe('speed_boost')
    })
  })

  describe('스킬 요약 정보', () => {
    beforeEach(() => {
      testCharacter.skills.skills = ['slash', 'heal', 'critical_hit']
      testCharacter.skills.skillLevels = { slash: 2, heal: 1, critical_hit: 1 }
      testCharacter.skills.skillExp = { slash: 150, heal: 0, critical_hit: 0 }
      testCharacter.skills.equippedActive = ['slash', 'heal']
      testCharacter.skills.passiveSkills = ['critical_hit']
    })

    it('[T36] 스킬 요약 정보를 올바르게 반환', () => {
      const summary = skillManager.getSkillSummary(testCharacter)

      expect(summary.totalSkills).toBe(3)
      expect(summary.equippedActive.length).toBe(2)
      expect(summary.passiveSkills.length).toBe(1)
      expect(summary.skillLevels['slash']).toBe(2)
      expect(summary.skillExp['slash']).toBe(150)
    })

    it('[T37] 캐릭터 데이터 없으면 기본 요약 반환', () => {
      const summary = skillManager.getSkillSummary(null)

      expect(summary.totalSkills).toBe(0)
      expect(summary.equippedActive.length).toBe(0)
      expect(summary.passiveSkills.length).toBe(0)
    })
  })

  describe('학습 가능한 스킬', () => {
    it('[T38] 레벨 기반 학습 가능 스킬 목록 반환', () => {
      testCharacter.level = 15
      testCharacter.skills.skills = ['slash', 'dash'] // 이미 학습

      const learnable = skillManager.getLearnableSkills(testCharacter)

      expect(learnable.length).toBeGreaterThan(0)
      learnable.forEach(skill => {
        expect(skill.requiredLevel).toBeLessThanOrEqual(15)
        expect(testCharacter.skills.skills).not.toContain(skill.id)
      })
    })

    it('[T39] 캐릭터 데이터 없으면 빈 목록 반환', () => {
      const learnable = skillManager.getLearnableSkills(null)

      expect(learnable).toEqual([])
    })
  })

  describe('레벨 기반 스킬 필터링', () => {
    it('[T40] 레벨별 사용 가능 스킬 필터링', () => {
      const level1Skills = skillManager.getAvailableSkills(1)

      expect(level1Skills.length).toBeGreaterThan(0)
      level1Skills.forEach(skill => {
        expect(skill.requiredLevel).toBeLessThanOrEqual(1)
      })

      // 레벨 10 스킬 확인
      const level10Skills = skillManager.getAvailableSkills(10)
      expect(level10Skills.length).toBeGreaterThan(level1Skills.length)
    })
  })

  describe('통합 테스트: 스킬 시스템 워크플로우', () => {
    it('[T41] 스킬 학습 → 레벨업 → 장착 → 사용 전체 흐름', () => {
      // 1. 스킬 학습
      const learnResult = skillManager.learnSkill(testCharacter, 'slash')
      expect(learnResult.success).toBe(true)

      // 2. 장착
      const equipResult = skillManager.equipSkill(testCharacter, 'slash')
      expect(equipResult.success).toBe(true)

      // 3. 스킬 사용
      const useResult = skillManager.useSkill(testCharacter, 'slash')
      expect(useResult.success).toBe(true)
      expect(useResult.effects.damage).toBeGreaterThan(0)

      // 4. 쿨타임 확인
      const canUseCheck = skillManager.canUseSkill(testCharacter, 'slash')
      expect(canUseCheck.canUse).toBe(false)
      expect(canUseCheck.reason).toContain('쿨타임 중')
    })

    it('[T42] 패시브 스킬 학습 및 효과 적용', () => {
      // 패시브 스킬 학습
      const learnResult = skillManager.learnSkill(testCharacter, 'vitality')
      expect(learnResult.success).toBe(true)
      expect(testCharacter.skills.passiveSkills).toContain('vitality')

      // 스탯 계산
      const baseStats = { maxHp: 100 }
      const totalStats = skillManager.calculateTotalStats(testCharacter, baseStats)

      expect(totalStats.maxHp).toBeGreaterThan(baseStats.maxHp)
    })

    it('[T43] 복수 스킬 장착 및 슬롯 관리', () => {
      // 스킬 학습
      testCharacter.skills.skills = ['slash', 'heal', 'dash', 'power_strike', 'speed_boost']
      testCharacter.skills.skillLevels = {
        slash: 1, heal: 1, dash: 1, power_strike: 1, speed_boost: 1
      }

      // 모든 스킬 장착
      const equipResults = []
      testCharacter.skills.skills.forEach(skillId => {
        const result = skillManager.equipSkill(testCharacter, skillId)
        equipResults.push(result)
      })

      // 5개 스킬 장착 성공
      const successCount = equipResults.filter(r => r.success).length
      expect(successCount).toBe(5)
      expect(testCharacter.skills.equippedActive.length).toBe(5)

      // 6번째 슬롯 시도
      testCharacter.skills.skills.push('defense_boost')
      testCharacter.skills.skillLevels['defense_boost'] = 1
      const failResult = skillManager.equipSkill(testCharacter, 'defense_boost')

      expect(failResult.success).toBe(false)
      expect(failResult.message).toContain('슬롯 꽉 참')
    })

    it('[T44] 스킬 레벨업으로 효과 강화 확인', () => {
      // 스킬 학습 및 장착
      testCharacter.skills.skills.push('slash')
      testCharacter.skills.skillLevels['slash'] = 1
      testCharacter.skills.equippedActive.push('slash')

      // Lv.1 데미지 (10번 시행 평균)
      let totalDamage1 = 0
      for (let i = 0; i < 10; i++) {
        const result = skillManager.useSkill(testCharacter, 'slash')
        totalDamage1 += result.effects.damage
        testCharacter.skills.skillCooldowns['slash'] = 0 // 쿨다운 리셋
      }
      const avgDamage1 = totalDamage1 / 10

      // 레벨업 (경험치 직접 설정)
      testCharacter.skills.skillLevels['slash'] = 5

      // Lv.5 데미지 (10번 시행 평균)
      let totalDamage2 = 0
      for (let i = 0; i < 10; i++) {
        const result = skillManager.useSkill(testCharacter, 'slash')
        totalDamage2 += result.effects.damage
        testCharacter.skills.skillCooldowns['slash'] = 0 // 쿨다운 리셋
      }
      const avgDamage2 = totalDamage2 / 10

      // Lv.5 평균이 Lv.1보다 높아야 함 (레벨당 10% 증가)
      expect(avgDamage2).toBeGreaterThan(avgDamage1)
    })
  })
})

describe('SkillManager Edge Cases', () => {
  let skillManager

  beforeEach(() => {
    skillManager = new SkillManager(console)
  })

  afterEach(() => {
    skillManager = null
  })

  it('[T45] 빈 스킬 데이터로 calculateTotalStats', () => {
    const result = skillManager.calculateTotalStats({}, { maxHp: 100 })

    expect(result.maxHp).toBe(100)
  })

  it('[T46] null 캐릭터 데이터로 메서드 호출', () => {
    expect(() => skillManager.calculatePassiveEffects(null)).not.toThrow()
    expect(() => skillManager.getSkillSummary(null)).not.toThrow()
    expect(() => skillManager.updateCooldowns(null)).not.toThrow()
  })

  it('[T47] 스킬 데이터 없는 캐릭터로 스킬 관리', () => {
    const emptyCharacter = { name: 'Empty', level: 1 }

    const canUseResult = skillManager.canUseSkill(emptyCharacter, 'slash')
    expect(canUseResult.canUse).toBe(false)

    const summary = skillManager.getSkillSummary(emptyCharacter)
    expect(summary.totalSkills).toBe(0)
  })

  it('[T48] 스킬 장착 해제 후 재장착', () => {
    const character = {
      name: 'Test',
      level: 10,
      skills: createEmptySkills()
    }
    character.skills.skills.push('slash')
    character.skills.skillLevels['slash'] = 1

    // 장착
    skillManager.equipSkill(character, 'slash')
    expect(character.skills.equippedActive).toContain('slash')

    // 해제
    skillManager.unequipSkill(character, 'slash')
    expect(character.skills.equippedActive).not.toContain('slash')

    // 재장착
    const result = skillManager.equipSkill(character, 'slash')
    expect(result.success).toBe(true)
    expect(character.skills.equippedActive).toContain('slash')
  })

  it('[T49] 동일 스킬 여러 번 장착 시도', () => {
    const character = {
      name: 'Test',
      level: 10,
      skills: createEmptySkills()
    }
    character.skills.skills.push('slash')
    character.skills.skillLevels['slash'] = 1

    skillManager.equipSkill(character, 'slash')
    skillManager.equipSkill(character, 'slash')
    skillManager.equipSkill(character, 'slash')

    // 중복 장착 불가
    const count = character.skills.equippedActive.filter(id => id === 'slash').length
    expect(count).toBe(1)
  })
})