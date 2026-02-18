import { describe, it, expect } from 'vitest'
import {
  getRequiredExpForLevel,
  canLevelUp,
  gainExp,
  getStatusValue,
  getExpToNextLevel,
  getExpPercentage,
  createNewCharacter,
  healHp,
  takeDamage,
  getExpPotionEffect,
  getTotalExpForLevel,
  createLevelUpMessage
} from '../characterStatusSystem'

describe('characterStatusSystem', () => {
  describe('getRequiredExpForLevel', () => {
    it('레벨 1의 필요 경험치는 100이어야 함', () => {
      expect(getRequiredExpForLevel(1)).toBe(100)
    })

    it('레벨 2의 필요 경험치는 400이어야 함', () => {
      expect(getRequiredExpForLevel(2)).toBe(400)
    })

    it('레벨 0의 필요 경험치는 0이어야 함', () => {
      expect(getRequiredExpForLevel(0)).toBe(0)
    })

    it('레벨 101 이상은 무한대이어야 함', () => {
      expect(getRequiredExpForLevel(101)).toBe(Infinity)
    })

    it('레벨 10의 필요 경험치는 10000이어야 함', () => {
      expect(getRequiredExpForLevel(10)).toBe(10000)
    })
  })

  describe('canLevelUp', () => {
    it('경험치가 충분하면 레벨업 가능', () => {
      expect(canLevelUp(1, 100)).toBe(true)
    })

    it('경험치가 부족하면 레벨업 불가', () => {
      expect(canLevelUp(1, 99)).toBe(false)
    })

    it('최대 레벨(100)에서는 레벨업 불가', () => {
      expect(canLevelUp(100, 1000000)).toBe(false)
    })

    it('경험치가 0이면 레벨업 불가', () => {
      expect(canLevelUp(1, 0)).toBe(false)
    })
  })

  describe('gainExp', () => {
    const baseCharacter = {
      id: 'test',
      name: 'Test',
      level: 1,
      exp: 0,
      stats: {
        hp: 100,
        affinity: 10,
        charisma: 5,
        intelligence: 5
      }
    }

    it('경험치 0 추가 시 변화 없음', () => {
      const result = gainExp(baseCharacter, 0)
      expect(result.levelUp).toBe(false)
      expect(result.character.level).toBe(1)
      expect(result.character.exp).toBe(0)
    })

    it('경험치 50 추가 시 레벨업 안 함', () => {
      const result = gainExp(baseCharacter, 50)
      expect(result.levelUp).toBe(false)
      expect(result.character.level).toBe(1)
      expect(result.character.exp).toBe(50)
    })

    it('경험치 100 추가 시 레벨 2로 레벨업', () => {
      const result = gainExp(baseCharacter, 100)
      expect(result.levelUp).toBe(true)
      expect(result.levelsGained).toBe(1)
      expect(result.character.level).toBe(2)
      expect(result.character.exp).toBe(0) // 정확히 100을 사용
      expect(result.character.stats.hp).toBeGreaterThan(100) // HP 증가
    })

    it('다중 레벨업 지원', () => {
      const result = gainExp(baseCharacter, 600) // Lv1 -> Lv2(400) -> Lv3(900)
      expect(result.levelUp).toBe(true)
      expect(result.levelsGained).toBe(2)
      expect(result.character.level).toBe(3)
      expect(result.character.exp).toBe(100) // 600 - 400 - 100
    })

    it('스테이터스 정확히 증가', () => {
      const result = gainExp(baseCharacter, 100)
      const increase = result.statusIncreases[0]
      expect(increase.hp).toBeGreaterThanOrEqual(10)
      expect(increase.hp).toBeLessThanOrEqual(14)
      expect(increase.affinity).toBeGreaterThanOrEqual(2)
      expect(increase.affinity).toBeLessThanOrEqual(3)
      expect(increase.charisma).toBeGreaterThanOrEqual(1)
      expect(increase.charisma).toBeLessThanOrEqual(2)
      expect(increase.intelligence).toBeGreaterThanOrEqual(1)
      expect(increase.intelligence).toBeLessThanOrEqual(2)
    })

    it('음수 경험치 추가 시 변화 없음', () => {
      const result = gainExp(baseCharacter, -10)
      expect(result.levelUp).toBe(false)
      expect(result.character.exp).toBe(0)
    })
  })

  describe('getStatusValue', () => {
    const baseValue = 10
    const increases = [
      { hp: 5, affinity: 2, charisma: 1, intelligence: 1 },
      { hp: 7, affinity: 3, charisma: 1, intelligence: 2 }
    ]

    it('누적 HP 증가값 계산', () => {
      expect(getStatusValue(baseValue, increases, 'hp')).toBe(22) // 10 + 5 + 7
    })

    it('누적 친화력 증가값 계산', () => {
      expect(getStatusValue(baseValue, increases, 'affinity')).toBe(15) // 10 + 2 + 3
    })

    it('증가값이 없으면 기본값 반환', () => {
      expect(getStatusValue(baseValue, [], 'hp')).toBe(10)
    })
  })

  describe('getExpToNextLevel', () => {
    const character = {
      level: 1,
      exp: 50
    }

    it('다음 레벨까지 필요한 경험치 계산', () => {
      expect(getExpToNextLevel(character)).toBe(50) // 100 - 50
    })

    it('경험치가 0이면 전체 필요 경험치 반환', () => {
      const zeroExpCharacter = { level: 1, exp: 0 }
      expect(getExpToNextLevel(zeroExpCharacter)).toBe(100)
    })

    it('최대 레벨에서는 0 반환', () => {
      const maxLevelCharacter = { level: 100, exp: 999999 }
      expect(getExpToNextLevel(maxLevelCharacter)).toBe(0)
    })
  })

  describe('getExpPercentage', () => {
    it('경험치 비율 계산 (경험치 0)', () => {
      const character = { level: 1, exp: 0 }
      expect(getExpPercentage(character)).toBe(0)
    })

    it('경험치 비율 계산 (경험치 50/100)', () => {
      const character = { level: 1, exp: 50 }
      expect(getExpPercentage(character)).toBe(50)
    })

    it('경험치 비율 계산 (경험치 100/100)', () => {
      const character = { level: 1, exp: 100 }
      expect(getExpPercentage(character)).toBe(100)
    })

    it('최대 레벨에서는 100% 반환', () => {
      const character = { level: 100, exp: 999999 }
      expect(getExpPercentage(character)).toBe(100)
    })
  })

  describe('createNewCharacter', () => {
    it('새로운 캐릭터 생성', () => {
      const baseCharacter = {
        id: 'test',
        name: 'TestChar',
        x: 100,
        y: 100
      }
      const character = createNewCharacter(baseCharacter)

      expect(character.id).toBe('test')
      expect(character.name).toBe('TestChar')
      expect(character.level).toBe(1)
      expect(character.exp).toBe(0)
      expect(character.maxExp).toBe(100)
      expect(character.stats.hp).toBe(100)
      expect(character.stats.maxHp).toBe(100)
      expect(character.stats.affinity).toBe(10)
      expect(character.stats.charisma).toBe(5)
      expect(character.stats.intelligence).toBe(5)
    })

    it('기본 캐릭터 데이터 유지', () => {
      const baseCharacter = {
        id: 'test',
        name: 'Test',
        x: 200,
        y: 300,
        color: '#FF0000'
      }
      const character = createNewCharacter(baseCharacter)

      expect(character.x).toBe(200)
      expect(character.y).toBe(300)
      expect(character.color).toBe('#FF0000')
    })
  })

  describe('healHp', () => {
    const baseCharacter = {
      level: 1,
      exp: 0,
      stats: {
        hp: 50,
        maxHp: 100,
        affinity: 10,
        charisma: 5,
        intelligence: 5
      }
    }

    it('HP 회복', () => {
      const healed = healHp(baseCharacter, 30)
      expect(healed.stats.hp).toBe(80)
    })

    it('최대 HP 초과 회복 시 제한', () => {
      const healed = healHp(baseCharacter, 100)
      expect(healed.stats.hp).toBe(100) // 최대 100
    })

    it('0 회복 시 변화 없음', () => {
      const healed = healHp(baseCharacter, 0)
      expect(healed.stats.hp).toBe(50)
    })

    it('HP가 없으면 기본값으로 처리', () => {
      const noHpCharacter = {
        level: 1,
        exp: 0,
        stats: { affinity: 10 }
      }
      const healed = healHp(noHpCharacter, 50)
      expect(healed.stats.hp).toBe(50)
    })
  })

  describe('takeDamage', () => {
    const baseCharacter = {
      level: 1,
      exp: 0,
      stats: {
        hp: 80,
        maxHp: 100,
        affinity: 10,
        charisma: 5,
        intelligence: 5
      }
    }

    it('데미지 적용', () => {
      const damaged = takeDamage(baseCharacter, 30)
      expect(damaged.stats.hp).toBe(50)
    })

    it('데미지가 HP 초과 시 0으로 제한', () => {
      const damaged = takeDamage(baseCharacter, 100)
      expect(damaged.stats.hp).toBe(0)
    })

    it('0 데미지 시 변화 없음', () => {
      const damaged = takeDamage(baseCharacter, 0)
      expect(damaged.stats.hp).toBe(80)
    })

    it('HP가 없으면 기본값으로 처리', () => {
      const noHpCharacter = {
        level: 1,
        exp: 0,
        stats: { affinity: 10 }
      }
      const damaged = takeDamage(noHpCharacter, 30)
      expect(damaged.stats.hp).toBe(0)
    })
  })

  describe('getExpPotionEffect', () => {
    it('소형 경험치 물약 (레벨 1)', () => {
      expect(getExpPotionEffect(1)).toBe(50)
    })

    it('중형 경험치 물약 (레벨 2)', () => {
      expect(getExpPotionEffect(2)).toBe(150)
    })

    it('대형 경험치 물약 (레벨 3)', () => {
      expect(getExpPotionEffect(3)).toBe(500)
    })

    it('알 수 없는 레벨은 기본값 50 반환', () => {
      expect(getExpPotionEffect(99)).toBe(50)
      expect(getExpPotionEffect(0)).toBe(50)
    })
  })

  describe('getTotalExpForLevel', () => {
    it('레벨 1의 총 경험치는 0', () => {
      expect(getTotalExpForLevel(1)).toBe(0)
    })

    it('레벨 2의 총 경험치는 100', () => {
      expect(getTotalExpForLevel(2)).toBe(100)
    })

    it('레벨 3의 총 경험치는 500', () => {
      expect(getTotalExpForLevel(3)).toBe(500) // 100 + 400
    })

    it('레벨 0의 총 경험치는 0', () => {
      expect(getTotalExpForLevel(0)).toBe(0)
    })
  })

  describe('createLevelUpMessage', () => {
    const statusIncreases = [
      { level: 2, hp: 12, affinity: 2, charisma: 1, intelligence: 1 }
    ]

    it('레벨업 메시지 생성', () => {
      const message = createLevelUpMessage(1, statusIncreases)
      expect(message).toContain('🎉')
      expect(message).toContain('Lv.2')
      expect(message).toContain('HP')
      expect(message).toContain('친화력')
      expect(message).toContain('카리스마')
      expect(message).toContain('지능')
    })

    it('레벨업 없으면 빈 메시지', () => {
      const message = createLevelUpMessage(0, [])
      expect(message).toBe('')
    })

    it('다중 레벨업 시 마지막 레벨 정보', () => {
      const increases = [
        { level: 2, hp: 12, affinity: 2, charisma: 1, intelligence: 1 },
        { level: 3, hp: 11, affinity: 3, charisma: 2, intelligence: 1 }
      ]
      const message = createLevelUpMessage(2, increases)
      expect(message).toContain('Lv.3') // 마지막 레벨
    })
  })
})