/**
 * Character Status System
 * 캐릭터 레벨, 경험치, 스테이터스 관리 시스템
 */

/**
 * 레벨별 필요 경험치 테이블
 * @param {number} level - 현재 레벨
 * @returns {number} 해당 레벨에 필요한 경험치
 */
export const getRequiredExpForLevel = (level) => {
  if (level < 1) return 0
  if (level > 100) return Infinity

  // 비선형 성장 곡선 (점점 더 많은 경험치 필요)
  // 기본 공식: 100 * (level ^ 2)
  return Math.floor(100 * Math.pow(level, 2))
}

/**
 * 레벨업 가능 여부 확인
 * @param {number} currentLevel - 현재 레벨
 * @param {number} currentExp - 현재 경험치
 * @returns {boolean} 레벨업 가능 여부
 */
export const canLevelUp = (currentLevel, currentExp) => {
  if (currentLevel >= 100) return false
  const required = getRequiredExpForLevel(currentLevel)
  return currentExp >= required
}

/**
 * 경험치 획득 (다중 레벨업 지원)
 * @param {Object} character - 캐릭터 객체
 * @param {number} expGain - 획득 경험치
 * @returns {Object} 업데이트된 캐릭터 객체와 레벨업 정보
 */
export const gainExp = (character, expGain) => {
  if (expGain <= 0) return { character, levelUp: false, levelsGained: 0 }

  let newExp = character.exp + expGain
  let newLevel = character.level
  let levelsGained = 0
  let statusIncreases = []

  // 다중 레벨업 처리
  while (canLevelUp(newLevel, newExp) && newLevel < 100) {
    const required = getRequiredExpForLevel(newLevel)
    newExp -= required
    newLevel++
    levelsGained++

    // 레벨업 시 스테이터스 증가
    const increase = {
      hp: 10 + Math.floor(Math.random() * 5),        // 10-14 HP 증가
      affinity: 2 + Math.floor(Math.random() * 2),   // 2-3 친화력 증가
      charisma: 1 + Math.floor(Math.random() * 2),   // 1-2 카리스마 증가
      intelligence: 1 + Math.floor(Math.random() * 2) // 1-2 지능 증가
    }
    statusIncreases.push({
      level: newLevel,
      ...increase
    })
  }

  return {
    character: {
      ...character,
      level: newLevel,
      exp: newExp,
      stats: {
        hp: getStatusValue(character.stats?.hp || 100, statusIncreases, 'hp'),
        affinity: getStatusValue(character.stats?.affinity || 10, statusIncreases, 'affinity'),
        charisma: getStatusValue(character.stats?.charisma || 5, statusIncreases, 'charisma'),
        intelligence: getStatusValue(character.stats?.intelligence || 5, statusIncreases, 'intelligence')
      }
    },
    levelUp: levelsGained > 0,
    levelsGained,
    statusIncreases
  }
}

/**
 * 누적 스테이터스 증가값 계산
 * @param {number} baseValue - 기본값
 * @param {Array} increases - 증가값 배열
 * @param {string} statType - 스테이터스 타입
 * @returns {number} 누적 스테이터스 값
 */
export const getStatusValue = (baseValue, increases, statType) => {
  return increases.reduce((sum, inc) => sum + inc[statType], baseValue)
}

/**
 * 다음 레벨까지 필요한 경험치 계산
 * @param {Object} character - 캐릭터 객체
 * @returns {number} 다음 레벨까지 필요한 경험치
 */
export const getExpToNextLevel = (character) => {
  if (character.level >= 100) return 0
  return getRequiredExpForLevel(character.level) - character.exp
}

/**
 * 다음 레벨까지의 경험치 비율 계산 (0-100)
 * @param {Object} character - 캐릭터 객체
 * @returns {number} 경험치 비율 (0-100)
 */
export const getExpPercentage = (character) => {
  if (character.level >= 100) return 100
  const required = getRequiredExpForLevel(character.level)
  return Math.min(100, Math.floor((character.exp / required) * 100))
}

/**
 * 새로운 캐릭터 생성
 * @param {Object} baseCharacter - 기본 캐릭터 데이터
 * @returns {Object} 초기화된 캐릭터 객체
 */
export const createNewCharacter = (baseCharacter) => {
  return {
    ...baseCharacter,
    level: 1,
    exp: 0,
    maxExp: getRequiredExpForLevel(1),
    stats: {
      hp: 100,
      maxHp: 100,
      affinity: 10,
      charisma: 5,
      intelligence: 5
    }
  }
}

/**
 * HP 회복
 * @param {Object} character - 캐릭터 객체
 * @param {number} healAmount - 회복량
 * @returns {Object} 업데이트된 캐릭터 객체
 */
export const healHp = (character, healAmount) => {
  const currentHp = character.stats?.hp || 0
  const maxHp = character.stats?.maxHp || 100
  const newHp = Math.min(maxHp, currentHp + healAmount)

  return {
    ...character,
    stats: {
      ...character.stats,
      hp: newHp
    }
  }
}

/**
 * HP 감소
 * @param {Object} character - 캐릭터 객체
 * @param {number} damageAmount - 데미지
 * @returns {Object} 업데이트된 캐릭터 객체
 */
export const takeDamage = (character, damageAmount) => {
  const currentHp = character.stats?.hp || 0
  const newHp = Math.max(0, currentHp - damageAmount)

  return {
    ...character,
    stats: {
      ...character.stats,
      hp: newHp
    }
  }
}

/**
 * 경험치 물약 사용 효과
 * @param {number} potionLevel - 물약 레벨 (1, 2, 3)
 * @returns {number} 획득 경험치
 */
export const getExpPotionEffect = (potionLevel) => {
  const effects = {
    1: 50,   // 소형: 50 EXP
    2: 150,  // 중형: 150 EXP
    3: 500   // 대형: 500 EXP
  }
  return effects[potionLevel] || 50
}

/**
 * 캐릭터 총 경험치 계산 (현재 레벨까지)
 * @param {number} level - 레벨
 * @returns {number} 총 경험치
 */
export const getTotalExpForLevel = (level) => {
  let total = 0
  for (let l = 1; l < level; l++) {
    total += getRequiredExpForLevel(l)
  }
  return total
}

/**
 * 레벨업 메시지 생성
 * @param {number} levelsGained - 획득한 레벨 수
 * @param {Array} statusIncreases - 스테이터스 증가 정보
 * @returns {string} 레벨업 메시지
 */
export const createLevelUpMessage = (levelsGained, statusIncreases) => {
  if (levelsGained === 0) return ''

  const lastIncrease = statusIncreases[statusIncreases.length - 1]
  return `🎉 레벨업! Lv.${lastIncrease.level}\n` +
         `+${lastIncrease.hp} HP, +${lastIncrease.affinity} 친화력, ` +
         `+${lastIncrease.charisma} 카리스마, +${lastIncrease.intelligence} 지능`
}