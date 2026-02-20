/**
 * Character System (Phase 12) - Skill System
 *
 * 캐릭터 스킬 시스템
 * - 액티브 스킬 (발동형)
 * - 패시브 스킬 (자동 효과)
 * - 스킬 레벨 및 경험치
 * - 쿨타임 관리
 * - 스킬 슬롯 시스템
 */

// 스킬 타입
const SkillType = {
  ACTIVE: 'active',   // 발동형 스킬
  PASSIVE: 'passive'  // 자동 효과 스킬
}

// 스킬 범주
const SkillCategory = {
  COMBAT: 'combat',     // 전투 (데미지, 공격력 증가)
  MOVEMENT: 'movement', // 이동 (속도 증가, 순간이동)
  SUPPORT: 'support'    // 보조 (힐, 버프, 디버프)
}

// 스킬 효과 타입
const EffectType = {
  DAMAGE: 'damage',              // 데미지
  HEAL: 'heal',                  // 힐
  INCREASE_STAT: 'increase_stat', // 스탯 증가
  DECREASE_STAT: 'decrease_stat', // 스탯 감소
  TELEPORT: 'teleport',          // 순간이동
  SPEED_BOOST: 'speed_boost'     // 속도 증가
}

// 기본 스킬 정의
const BASE_SKILLS = {
  // 전투 스킬
  'slash': {
    id: 'slash',
    name: '베기',
    description: '전방의 적에게 물리 공격',
    type: SkillType.ACTIVE,
    category: SkillCategory.COMBAT,
    cooldown: 3000, // 3초
    requiredLevel: 1,
    icon: '⚔️',
    effects: [
      { type: EffectType.DAMAGE, value: { min: 10, max: 20 }, range: 1 }
    ],
    maxLevel: 5
  },
  'power_strike': {
    id: 'power_strike',
    name: '파워 스트라이크',
    description: '강력한 일격으로 적에게 큰 데미지',
    type: SkillType.ACTIVE,
    category: SkillCategory.COMBAT,
    cooldown: 8000, // 8초
    requiredLevel: 10,
    icon: '💥',
    effects: [
      { type: EffectType.DAMAGE, value: { min: 30, max: 50 }, range: 1 }
    ],
    maxLevel: 5
  },
  'critical_hit': {
    id: 'critical_hit',
    name: '크리티컬 히트',
    description: '크리티컬 확률 증가',
    type: SkillType.PASSIVE,
    category: SkillCategory.COMBAT,
    cooldown: 0,
    requiredLevel: 5,
    icon: '🎯',
    effects: [
      { type: EffectType.INCREASE_STAT, stat: 'criticalChance', value: 0.1 } // 10%
    ],
    maxLevel: 5
  },

  // 이동 스킬
  'dash': {
    id: 'dash',
    name: '대시',
    description: '짧은 거리를 빠르게 이동',
    type: SkillType.ACTIVE,
    category: SkillCategory.MOVEMENT,
    cooldown: 5000, // 5초
    requiredLevel: 1,
    icon: '💨',
    effects: [
      { type: EffectType.TELEPORT, distance: 3 }
    ],
    maxLevel: 5
  },
  'speed_boost': {
    id: 'speed_boost',
    name: '속도 부스트',
    description: '이동 속도 30% 증가 (10초)',
    type: SkillType.ACTIVE,
    category: SkillCategory.MOVEMENT,
    cooldown: 30000, // 30초
    requiredLevel: 8,
    icon: '⚡',
    effects: [
      { type: EffectType.SPEED_BOOST, multiplier: 1.3, duration: 10000 }
    ],
    maxLevel: 5
  },
  'agility': {
    id: 'agility',
    name: '민첩함',
    description: '기본 이동 속도 10% 증가',
    type: SkillType.PASSIVE,
    category: SkillCategory.MOVEMENT,
    cooldown: 0,
    requiredLevel: 3,
    icon: '🦶',
    effects: [
      { type: EffectType.INCREASE_STAT, stat: 'moveSpeed', value: 0.15 } // 15%
    ],
    maxLevel: 5
  },

  // 보조 스킬
  'heal': {
    id: 'heal',
    name: '힐',
    description: 'HP 회복',
    type: SkillType.ACTIVE,
    category: SkillCategory.SUPPORT,
    cooldown: 10000, // 10초
    requiredLevel: 1,
    icon: '💗',
    effects: [
      { type: EffectType.HEAL, value: { min: 20, max: 40 } }
    ],
    maxLevel: 5
  },
  'defense_boost': {
    id: 'defense_boost',
    name: '방어력 강화',
    description: '방어력 20% 증가 (15초)',
    type: SkillType.ACTIVE,
    category: SkillCategory.SUPPORT,
    cooldown: 25000, // 25초
    requiredLevel: 7,
    icon: '🛡️',
    effects: [
      { type: EffectType.INCREASE_STAT, stat: 'defense', multiplier: 1.2, duration: 15000 }
    ],
    maxLevel: 5
  },
  'vitality': {
    id: 'vitality',
    name: '생명력',
    description: '최대 HP 20% 증가',
    type: SkillType.PASSIVE,
    category: SkillCategory.SUPPORT,
    cooldown: 0,
    requiredLevel: 2,
    icon: '❤️',
    effects: [
      { type: EffectType.INCREASE_STAT, stat: 'maxHp', value: 0.2 } // 20%
    ],
    maxLevel: 5
  }
}

const createEmptySkills = () => ({
  skills: [],                          // 소유 스킬 ID 목록
  skillLevels: {},                     // 스킬 레벨 (스킬 ID → 레벨)
  skillExp: {},                        // 스킬 경험치 (스킬 ID → 경험치)
  skillCooldowns: {},                  // 쿨타임 상태 (스킬 ID → 종료 시간)
  activeSlots: 5,                      // 액티브 스킬 슬롯
  equippedActive: [],                  // 장착된 액티브 스킬 ID 목록
  passiveSkills: [],                   // 패시브 스킬 ID 목록
  activeEffects: []                    // 현재 활성화된 효과 (버프/디버프)
})

class SkillManager {
  constructor(logger = console) {
    this.logger = logger
  }

  // 스킬 정보 가져오기
  getSkill(skillId) {
    return BASE_SKILLS[skillId] || null
  }

  // 모든 스킬 목록 가져오기
  getAllSkills() {
    return Object.values(BASE_SKILLS)
  }

  // 레벨 기반 사용 가능 스킬 필터링
  getAvailableSkills(level = 1) {
    return Object.values(BASE_SKILLS).filter(skill => skill.requiredLevel <= level)
  }

  // 스킬 학습 가능 여부 확인
  canLearnSkill(characterData, skillId) {
    if (!characterData || !characterData.level) {
      return { canLearn: false, reason: '캐릭터 데이터 없음' }
    }

    const skill = this.getSkill(skillId)
    if (!skill) {
      return { canLearn: false, reason: '유효하지 않은 스킬' }
    }

    const level = characterData.level
    if (level < skill.requiredLevel) {
      return {
        canLearn: false,
        reason: `레벨 부족 (필요 Lv.${skill.requiredLevel}, 현재 Lv.${level})`
      }
    }

    // 이미 학습한 스킬 확인
    const learnedSkills = characterData.skills?.skills || []
    if (learnedSkills.includes(skillId)) {
      return { canLearn: false, reason: '이미 학습한 스킬' }
    }

    return { canLearn: true, skill }
  }

  // 스킬 학습
  learnSkill(characterData, skillId) {
    if (!characterData) {
      this.logger.error('캐릭터 데이터 없음')
      return { success: false, message: '캐릭터 데이터 없음' }
    }

    const canLearnCheck = this.canLearnSkill(characterData, skillId)
    if (!canLearnCheck.canLearn) {
      return {
        success: false,
        message: canLearnCheck.reason
      }
    }

    if (!characterData.skills) {
      characterData.skills = createEmptySkills()
    }

    const skill = canLearnCheck.skill

    // 스킬 추가
    characterData.skills.skills.push(skillId)
    characterData.skills.skillLevels[skillId] = 1
    characterData.skills.skillExp[skillId] = 0

    // 패시브 스킬이면 자동 장착
    if (skill.type === SkillType.PASSIVE) {
      characterData.skills.passiveSkills.push(skillId)
      this.logger.log(`✨ 패시브 스킬 자동 활성화: ${skill.name}`)
    }

    this.logger.log(`📚 스킬 학습: ${characterData.name} → ${skill.name} (Lv.1)`)

    return {
      success: true,
      characterData,
      skill,
      message: `${skill.name} 스킬을 학습했습니다!`
    }
  }

  // 스킬 레벨업
  levelUpSkill(characterData, skillId, expGained = 100) {
    if (!characterData || !characterData.skills) {
      this.logger.error('캐릭터 스킬 데이터 없음')
      return { success: false, message: '캐릭터 스킬 데이터 없음' }
    }

    const skill = this.getSkill(skillId)
    if (!skill) {
      return { success: false, message: '유효하지 않은 스킬' }
    }

    const currentLevel = characterData.skills.skillLevels[skillId] || 0
    if (currentLevel === 0) {
      return { success: false, message: '학습하지 않은 스킬' }
    }

    if (currentLevel >= skill.maxLevel) {
      return { success: false, message: '이상 최대 레벨 도달' }
    }

    const requiredExp = currentLevel * 100
    const currentExp = characterData.skills.skillExp[skillId] || 0
    const newExp = currentExp + expGained

    if (newExp < requiredExp) {
      characterData.skills.skillExp[skillId] = newExp
      return {
        success: false,
        message: '레벨업 필요 경험치 미달',
        currentExp: newExp,
        requiredExp
      }
    }

    // 레벨업
    const newLevel = currentLevel + 1
    characterData.skills.skillLevels[skillId] = newLevel
    characterData.skills.skillExp[skillId] = newExp - requiredExp

    this.logger.log(`⬆️ 스킬 레벨업: ${skill.name} Lv.${currentLevel} → Lv.${newLevel}`)

    return {
      success: true,
      characterData,
      skill,
      oldLevel: currentLevel,
      newLevel,
      message: `${skill.name} 스킬이 Lv.${newLevel}로 레벨업했습니다!`
    }
  }

  // 스킬 사용 가능 여부 확인
  canUseSkill(characterData, skillId) {
    if (!characterData || !characterData.skills) {
      return { canUse: false, reason: '캐릭터 스킬 데이터 없음' }
    }

    const skill = this.getSkill(skillId)
    if (!skill) {
      return { canUse: false, reason: '유효하지 않은 스킬' }
    }

    if (skill.type !== SkillType.ACTIVE) {
      return { canUse: false, reason: '액티브 스킬이 아님' }
    }

    // 학습 여부 확인
    const skillLevel = characterData.skills.skillLevels[skillId] || 0
    if (skillLevel === 0) {
      return { canUse: false, reason: '학습하지 않은 스킬' }
    }

    // 장착 여부 확인 (액티브 스킬만)
    const equippedActive = characterData.skills.equippedActive || []
    if (!equippedActive.includes(skillId)) {
      return { canUse: false, reason: '장착되지 않은 스킬' }
    }

    // 쿨타임 확인
    const cooldownEnd = characterData.skills.skillCooldowns[skillId] || 0
    const now = Date.now()
    if (now < cooldownEnd) {
      const remainingTime = cooldownEnd - now
      return {
        canUse: false,
        reason: '쿨타임 중',
        remainingTime
      }
    }

    return { canUse: true, skill }
  }

  // 스킬 사용
  useSkill(characterData, skillId, target = null) {
    if (!characterData) {
      this.logger.error('캐릭터 데이터 없음')
      return { success: false, message: '캐릭터 데이터 없음' }
    }

    const canUseCheck = this.canUseSkill(characterData, skillId)
    if (!canUseCheck.canUse) {
      return {
        success: false,
        message: canUseCheck.reason,
        remainingTime: canUseCheck.remainingTime
      }
    }

    if (!characterData.skills) {
      characterData.skills = createEmptySkills()
    }

    const skill = canUseCheck.skill
    const skillLevel = characterData.skills.skillLevels[skillId] || 1

    // 쿨타임 설정
    const cooldownReduction = (skillLevel - 1) * 0.05 // 레벨당 5% 쿨다운 감소
    const actualCooldown = skill.cooldown * (1 - cooldownReduction)
    characterData.skills.skillCooldowns[skillId] = Date.now() + actualCooldown

    // 효과 계산
    const effects = this.calculateEffect(skill, skillLevel, target)

    // 액티브 효과 등록 (지속 효과)
    if (effects.activeEffects.length > 0) {
      effects.activeEffects.forEach(effect => {
        characterData.skills.activeEffects.push({
          skillId,
          effectType: effect.type,
          value: effect.value,
          endTime: Date.now() + effect.duration
        })
      })
    }

    // 경험치 획득
    this.levelUpSkill(characterData, skillId, 10) // 스킬 사용 경험치

    this.logger.log(`🎯 스킬 사용: ${characterData.name} → ${skill.name} (Lv.${skillLevel})`)

    return {
      success: true,
      characterData,
      skill,
      skillLevel,
      effects,
      message: `${skill.name} 스킬을 사용했습니다!`
    }
  }

  // 스킬 효과 계산
  calculateEffect(skill, skillLevel, target = null) {
    const levelMultiplier = 1 + (skillLevel - 1) * 0.1 // 레벨당 10% 증가
    const results = {
      damage: 0,
      heal: 0,
      statChanges: [],
      movement: null,
      activeEffects: []
    }

    skill.effects.forEach(effect => {
      switch (effect.type) {
        case EffectType.DAMAGE:
          const minDmg = Math.floor(effect.value.min * levelMultiplier)
          const maxDmg = Math.floor(effect.value.max * levelMultiplier)
          results.damage = Math.floor(Math.random() * (maxDmg - minDmg + 1)) + minDmg
          break

        case EffectType.HEAL:
          const minHeal = Math.floor(effect.value.min * levelMultiplier)
          const maxHeal = Math.floor(effect.value.max * levelMultiplier)
          results.heal = Math.floor(Math.random() * (maxHeal - minHeal + 1)) + minHeal
          break

        case EffectType.INCREASE_STAT:
          if (effect.duration) {
            results.activeEffects.push({
              type: EffectType.INCREASE_STAT,
              stat: effect.stat,
              value: effect.multiplier || effect.value,
              duration: effect.duration
            })
          } else {
            results.statChanges.push({
              stat: effect.stat,
              value: effect.value * levelMultiplier
            })
          }
          break

        case EffectType.TELEPORT:
          results.movement = {
            type: 'teleport',
            distance: effect.distance
          }
          break

        case EffectType.SPEED_BOOST:
          results.activeEffects.push({
            type: EffectType.SPEED_BOOST,
            multiplier: effect.multiplier * levelMultiplier,
            duration: effect.duration
          })
          break
      }
    })

    return results
  }

  // 스킬 장착 (액티브 슬롯)
  equipSkill(characterData, skillId) {
    if (!characterData || !characterData.skills) {
      this.logger.error('캐릭터 스킬 데이터 없음')
      return { success: false, message: '캐릭터 스킬 데이터 없음' }
    }

    const skill = this.getSkill(skillId)
    if (!skill) {
      return { success: false, message: '유효하지 않은 스킬' }
    }

    if (skill.type !== SkillType.ACTIVE) {
      return { success: false, message: '액티브 스킬만 장착 가능' }
    }

    const skillLevel = characterData.skills.skillLevels[skillId] || 0
    if (skillLevel === 0) {
      return { success: false, message: '학습하지 않은 스킬' }
    }

    const equippedActive = characterData.skills.equippedActive || []
    const maxSlots = characterData.skills.activeSlots || 5

    if (equippedActive.length >= maxSlots && !equippedActive.includes(skillId)) {
      return {
        success: false,
        message: '액티브 스킬 슬롯 꽉 참',
        maxSlots
      }
    }

    if (!equippedActive.includes(skillId)) {
      characterData.skills.equippedActive.push(skillId)
      this.logger.log(`🔧 스킬 장착: ${skill.name}`)
    }

    return {
      success: true,
      characterData,
      equippedActive: characterData.skills.equippedActive,
      message: `${skill.name} 스킬을 장착했습니다!`
    }
  }

  // 스킬 장착 해제
  unequipSkill(characterData, skillId) {
    if (!characterData || !characterData.skills) {
      this.logger.error('캐릭터 스킬 데이터 없음')
      return { success: false, message: '캐릭터 스킬 데이터 없음' }
    }

    const equippedActive = characterData.skills.equippedActive || []
    const index = equippedActive.indexOf(skillId)

    if (index === -1) {
      return { success: false, message: '장착되지 않은 스킬' }
    }

    characterData.skills.equippedActive.splice(index, 1)

    const skill = this.getSkill(skillId)
    this.logger.log(`🔧 스킬 장착 해제: ${skill?.name || skillId}`)

    return {
      success: true,
      characterData,
      equippedActive: characterData.skills.equippedActive,
      message: '스킬을 장착 해제했습니다!'
    }
  }

  // 쿨타임 업데이트 (주기적 호출)
  updateCooldowns(characterData) {
    if (!characterData || !characterData.skills) {
      return
    }

    const now = Date.now()
    Object.keys(characterData.skills.skillCooldowns).forEach(skillId => {
      const cooldownEnd = characterData.skills.skillCooldowns[skillId]
      if (now >= cooldownEnd) {
        delete characterData.skills.skillCooldowns[skillId]
        const skill = this.getSkill(skillId)
        this.logger.log(`⏱️ 쿨타임 완료: ${skill?.name || skillId}`)
      }
    })

    // 만료된 액티브 효과 제거
    characterData.skills.activeEffects = characterData.skills.activeEffects.filter(effect => {
      return effect.endTime > now
    })
  }

  // 패시브 스킬 효과 계산
  calculatePassiveEffects(characterData) {
    if (!characterData || !characterData.skills) {
      return {}
    }

    const passiveSkills = characterData.skills.passiveSkills || []
    const statModifiers = {}

    passiveSkills.forEach(skillId => {
      const skill = this.getSkill(skillId)
      if (!skill) return

      const skillLevel = characterData.skills.skillLevels[skillId] || 1
      const levelMultiplier = 1 + (skillLevel - 1) * 0.1

      skill.effects.forEach(effect => {
        if (effect.type === EffectType.INCREASE_STAT && effect.stat) {
          if (!statModifiers[effect.stat]) {
            statModifiers[effect.stat] = 0
          }
          statModifiers[effect.stat] += effect.value * levelMultiplier
        }
      })
    })

    return statModifiers
  }

  // 캐릭터 총 스탯 계산 (패시브 + 액티브 효과 포함)
  calculateTotalStats(characterData, baseStats = {}) {
    const passiveEffects = this.calculatePassiveEffects(characterData)
    const activeEffects = {}

    // 액티브 효과 합산
    if (characterData.skills?.activeEffects) {
      characterData.skills.activeEffects.forEach(effect => {
        if (effect.effectType === EffectType.INCREASE_STAT && effect.stat) {
          if (!activeEffects[effect.stat]) {
            activeEffects[effect.stat] = 0
          }
          activeEffects[effect.stat] += (effect.value - 1) // multiplier 보정
        }
      })
    }

    const totalStats = { ...baseStats }

    // 베이스 스탯에 패시브 효과 적용
    Object.keys(passiveEffects).forEach(stat => {
      if (totalStats[stat] !== undefined) {
        totalStats[stat] = Math.floor(totalStats[stat] * (1 + passiveEffects[stat]))
      }
    })

    // 액티브 효과 적용
    Object.keys(activeEffects).forEach(stat => {
      if (totalStats[stat] !== undefined) {
        totalStats[stat] = Math.floor(totalStats[stat] * (1 + activeEffects[stat]))
      }
    })

    return totalStats
  }

  // 스킬 요약 정보
  getSkillSummary(characterData) {
    if (!characterData || !characterData.skills) {
      return {
        totalSkills: 0,
        activeSlots: 5,
        equippedActive: [],
        passiveSkills: []
      }
    }

    const skills = characterData.skills
    const passiveSkills = skills.passiveSkills || []
    const equippedActive = skills.equippedActive || []

    return {
      totalSkills: skills.skills?.length || 0,
      activeSlots: skills.activeSlots || 5,
      equippedActive,
      passiveSkills,
      skillLevels: skills.skillLevels || {},
      skillExp: skills.skillExp || {}
    }
  }

  // 학습 가능한 스킬 목록
  getLearnableSkills(characterData) {
    if (!characterData || !characterData.level) {
      return []
    }

    const level = characterData.level
    const learnedSkills = characterData.skills?.skills || []

    return Object.values(BASE_SKILLS).filter(skill =>
      skill.requiredLevel <= level && !learnedSkills.includes(skill.id)
    )
  }
}

export {
  SkillType,
  SkillCategory,
  EffectType,
  BASE_SKILLS,
  createEmptySkills,
  SkillManager
}