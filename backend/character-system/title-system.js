/**
 * 타이틀 시스템 (Title System)
 *
 * 캐릭터가 달성한 업적에 따라 타이틀을 획득하고 장착하는 시스템
 *
 * 타이틀 타입:
 * - ACHIEVEMENT: 업적 달성 (레벨, 전투 승리, 퀘스트 완료 등)
 * - SOCIAL: 소셜 업적 (친구, 팔로워 등)
 * - SPECIAL: 특별 타이틀 (이벤트, 기념일 등)
 * - LEGENDARY: 전설적 타이틀 (희귀한 업적)
 *
 * @module character-system/title-system
 */

// ========== 타이틀 타입 ==========
const TITLE_TYPES = {
  ACHIEVEMENT: 'ACHIEVEMENT',
  SOCIAL: 'SOCIAL',
  SPECIAL: 'SPECIAL',
  LEGENDARY: 'LEGENDARY'
};

// ========== 타이틀 데이터베이스 ==========
const TITLE_DATABASE = {
  // 업적 타이틀
  'novice': {
    id: 'novice',
    name: '신규 모험가',
    description: '첫 발을 내딛은 모험가',
    type: TITLE_TYPES.ACHIEVEMENT,
    rarity: 'COMMON',
    icon: '🗺️',
    requirements: {
      level: 1
    },
    passiveEffect: {
      stat: 'experience',
      multiplier: 1.05
    }
  },
  'veteran': {
    id: 'veteran',
    name: '베테랑 모험가',
    description: '많은 경험을 쌓은 모험가',
    type: TITLE_TYPES.ACHIEVEMENT,
    rarity: 'RARE',
    icon: '⚔️',
    requirements: {
      level: 20
    },
    passiveEffect: {
      stat: 'experience',
      multiplier: 1.10
    }
  },
  'master': {
    id: 'master',
    name: '마스터 모험가',
    description: '모든 것을 경험한 모험가',
    type: TITLE_TYPES.ACHIEVEMENT,
    rarity: 'EPIC',
    icon: '👑',
    requirements: {
      level: 50
    },
    passiveEffect: {
      stat: 'experience',
      multiplier: 1.15
    }
  },
  'conqueror': {
    id: 'conqueror',
    name: '정복자',
    description: '모든 전투에서 승리한 자',
    type: TITLE_TYPES.ACHIEVEMENT,
    rarity: 'EPIC',
    icon: '🏆',
    requirements: {
      battlesWon: 1000
    },
    passiveEffect: {
      stat: 'attack',
      multiplier: 1.10
    }
  },
  'survivor': {
    id: 'survivor',
    name: '생존자',
    description: '많은 위기를 넘긴 자',
    type: TITLE_TYPES.ACHIEVEMENT,
    rarity: 'RARE',
    icon: '🛡️',
    requirements: {
      questsCompleted: 50
    },
    passiveEffect: {
      stat: 'defense',
      multiplier: 1.10
    }
  },

  // 소셜 타이틀
  'socialite': {
    id: 'socialite',
    name: '소셜라이터',
    description: '많은 친구를 가진 인기인',
    type: TITLE_TYPES.SOCIAL,
    rarity: 'RARE',
    icon: '🎉',
    requirements: {
      friends: 20
    },
    passiveEffect: {
      stat: 'charisma',
      multiplier: 1.15
    }
  },
  'friend': {
    id: 'friend',
    name: '좋은 친구',
    description: '신뢰할 수 있는 친구',
    type: TITLE_TYPES.SOCIAL,
    rarity: 'COMMON',
    icon: '🤝',
    requirements: {
      friends: 5
    },
    passiveEffect: {
      stat: 'charisma',
      multiplier: 1.05
    }
  },

  // 특별 타이틀
  'birthday': {
    id: 'birthday',
    name: '생일 셀러브레이션',
    description: '생일을 맞이한 캐릭터',
    type: TITLE_TYPES.SPECIAL,
    rarity: 'RARE',
    icon: '🎂',
    requirements: {
      special: 'birthday'
    },
    passiveEffect: {
      stat: 'health',
      multiplier: 1.10
    }
  },
  'founder': {
    id: 'founder',
    name: '창립자',
    description: '초기 아이덴티티',
    type: TITLE_TYPES.SPECIAL,
    rarity: 'LEGENDARY',
    icon: '✨',
    requirements: {
      special: 'founder'
    },
    passiveEffect: {
      stat: 'experience',
      multiplier: 1.20
    }
  },

  // 전설적 타이틀
  'legend': {
    id: 'legend',
    name: '전설',
    description: '영원히 기억될 전설',
    type: TITLE_TYPES.LEGENDARY,
    rarity: 'LEGENDARY',
    icon: '⭐',
    requirements: {
      level: 100,
      battlesWon: 10000,
      questsCompleted: 500
    },
    passiveEffect: {
      stat: 'all',
      multiplier: 1.10
    }
  },
  'hero': {
    id: 'hero',
    name: '영웅',
    description: '세상을 구한 영웅',
    type: TITLE_TYPES.LEGENDARY,
    rarity: 'LEGENDARY',
    icon: '🦸',
    requirements: {
      specialEventCompleted: 10
    },
    passiveEffect: {
      stat: 'all',
      multiplier: 1.15
    }
  }
};

// ========== 레어도 배율 ==========
const RARITY_MULTIPLIERS = {
  COMMON: 1.0,
  RARE: 1.1,
  EPIC: 1.2,
  LEGENDARY: 1.3
};

/**
 * 타이틀 시스템 생성
 * @returns {Object} 타이틀 시스템 인스턴스
 */
function createTitleSystem() {
  return {
    unlockedTitles: [],
    equippedTitle: null,
    titleHistory: []
  };
}

/**
 * 타이틀 정보 조회
 * @param {Object} system - 타이틀 시스템
 * @param {string} titleId - 타이틀 ID
 * @returns {Object|null} 타이틀 정보
 */
function getTitleInfo(system, titleId) {
  return TITLE_DATABASE[titleId] || null;
}

/**
 * 잠금 해제 가능한 타이틀 목록 조회
 * @param {Object} system - 타이틀 시스템
 * @param {Object} characterStats - 캐릭터 스탯/상태
 * @returns {Array} 잠금 해제 가능한 타이틀 목록
 */
function getAvailableTitles(system, characterStats) {
  const available = [];

  for (const titleId in TITLE_DATABASE) {
    const title = TITLE_DATABASE[titleId];
    
    // 이미 잠금 해제된 타이틀 제외
    if (system.unlockedTitles.includes(titleId)) {
      continue;
    }

    // 요구사항 체크
    if (checkTitleRequirements(title, characterStats)) {
      available.push({
        id: titleId,
        name: title.name,
        description: title.description,
        type: title.type,
        rarity: title.rarity,
        icon: title.icon
      });
    }
  }

  return available;
}

/**
 * 타이틀 요구사항 체크
 * @param {Object} title - 타이틀 정보
 * @param {Object} characterStats - 캐릭터 스탯/상태
 * @returns {boolean} 요구사항 충족 여부
 */
function checkTitleRequirements(title, characterStats) {
  if (!title.requirements) {
    return true;
  }

  const reqs = title.requirements;

  // 레벨 체크
  if (reqs.level && characterStats.level < reqs.level) {
    return false;
  }

  // 전투 승리 수 체크
  if (reqs.battlesWon && characterStats.battlesWon < reqs.battlesWon) {
    return false;
  }

  // 퀘스트 완료 수 체크
  if (reqs.questsCompleted && characterStats.questsCompleted < reqs.questsCompleted) {
    return false;
  }

  // 친구 수 체크
  if (reqs.friends && characterStats.friends < reqs.friends) {
    return false;
  }

  // 특별 이벤트 체크
  if (reqs.specialEventCompleted && characterStats.specialEventsCompleted < reqs.specialEventCompleted) {
    return false;
  }

  // 특별 조건 체크
  if (reqs.special) {
    // 특별 조건은 별도의 이벤트 등으로 처리
    return characterStats.special && characterStats.special.includes(reqs.special);
  }

  return true;
}

/**
 * 타이틀 잠금 해제
 * @param {Object} system - 타이틀 시스템
 * @param {string} titleId - 타이틀 ID
 * @param {Object} characterStats - 캐릭터 스탯/상태
 * @returns {Object} 결과 객체
 */
function unlockTitle(system, titleId, characterStats) {
  // 이미 잠금 해제된 타이틀 체크
  if (system.unlockedTitles.includes(titleId)) {
    return {
      success: false,
      message: '이미 잠금 해제된 타이틀입니다.'
    };
  }

  // 타이틀 존재 체크
  const title = TITLE_DATABASE[titleId];
  if (!title) {
    return {
      success: false,
      message: '존재하지 않는 타이틀입니다.'
    };
  }

  // 요구사항 체크
  if (!checkTitleRequirements(title, characterStats)) {
    return {
      success: false,
      message: '요구사항을 충족하지 않았습니다.'
    };
  }

  // 잠금 해제
  system.unlockedTitles.push(titleId);
  
  // 타이틀 히스토리 기록
  system.titleHistory.push({
    titleId,
    unlockedAt: Date.now()
  });

  // 장착된 타이틀이 없으면 자동 장착 (레어도 기준)
  if (!system.equippedTitle && title.rarity) {
    const currentEquipped = system.equippedTitle 
      ? TITLE_DATABASE[system.equippedTitle].rarity 
      : 'COMMON';
    
    if (RARITY_MULTIPLIERS[title.rarity] >= RARITY_MULTIPLIERS[currentEquipped]) {
      system.equippedTitle = titleId;
    }
  }

  return {
    success: true,
    message: ` 타이틀 "${title.name}"을(를) 획득했습니다!`,
    title: {
      id: titleId,
      name: title.name,
      description: title.description,
      type: title.type,
      rarity: title.rarity,
      icon: title.icon
    }
  };
}

/**
 * 타이틀 장착
 * @param {Object} system - 타이틀 시스템
 * @param {string} titleId - 타이틀 ID
 * @returns {Object} 결과 객체
 */
function equipTitle(system, titleId) {
  // 잠금 해제 여부 체크
  if (!system.unlockedTitles.includes(titleId)) {
    return {
      success: false,
      message: '잠금 해제되지 않은 타이틀입니다.'
    };
  }

  // 이미 장착된 상태 체크
  if (system.equippedTitle === titleId) {
    return {
      success: false,
      message: '이미 장착된 타이틀입니다.'
    };
  }

  const title = TITLE_DATABASE[titleId];
  system.equippedTitle = titleId;

  return {
    success: true,
    message: `${title.name} 타이틀을 장착했습니다.`,
    title: {
      id: titleId,
      name: title.name,
      description: title.description,
      type: title.type,
      rarity: title.rarity,
      icon: title.icon
    }
  };
}

/**
 * 타이틀 해제
 * @param {Object} system - 타이틀 시스템
 * @returns {Object} 결과 객체
 */
function unequipTitle(system) {
  if (!system.equippedTitle) {
    return {
      success: false,
      message: '장착된 타이틀이 없습니다.'
    };
  }

  system.equippedTitle = null;

  return {
    success: true,
    message: '타이틀을 해제했습니다.'
  };
}

/**
 * 장착된 타이틀 정보 조회
 * @param {Object} system - 타이틀 시스템
 * @returns {Object|null} 장착된 타이틀 정보
 */
function getEquippedTitle(system) {
  if (!system.equippedTitle) {
    return null;
  }

  const title = TITLE_DATABASE[system.equippedTitle];
  return {
    id: system.equippedTitle,
    name: title.name,
    description: title.description,
    type: title.type,
    rarity: title.rarity,
    icon: title.icon
  };
}

/**
 * 타이틀 효과 계산
 * @param {Object} system - 타이틀 시스템
 * @param {Object} baseStats - 기본 스탯
 * @returns {Object} 효과가 적용된 스탯
 */
function calculateTitleEffect(system, baseStats) {
  if (!system.equippedTitle) {
    return { ...baseStats };
  }

  const title = TITLE_DATABASE[system.equippedTitle];
  if (!title.passiveEffect) {
    return { ...baseStats };
  }

  const effect = title.passiveEffect;
  const rarityBonus = RARITY_MULTIPLIERS[title.rarity] || 1.0;
  const multiplier = effect.multiplier * rarityBonus;

  const stats = { ...baseStats };

  if (effect.stat === 'all') {
    // 모든 스탯 증가
    for (const stat in stats) {
      if (typeof stats[stat] === 'number') {
        stats[stat] = Math.round(stats[stat] * multiplier);
      }
    }
  } else if (stats[effect.stat] !== undefined) {
    // 특정 스탯 증가
    stats[effect.stat] = Math.round(stats[effect.stat] * multiplier);
  }

  return stats;
}

/**
 * 잠금 해제된 타이틀 목록 조회
 * @param {Object} system - 타이틀 시스템
 * @returns {Array} 잠금 해제된 타이틀 목록
 */
function getUnlockedTitles(system) {
  return system.unlockedTitles.map(titleId => {
    const title = TITLE_DATABASE[titleId];
    return {
      id: titleId,
      name: title.name,
      description: title.description,
      type: title.type,
      rarity: title.rarity,
      icon: title.icon
    };
  });
}

/**
 * 타이틀 시스템 요약 정보
 * @param {Object} system - 타이틀 시스템
 * @returns {Object} 요약 정보
 */
function getTitleSummary(system) {
  return {
    unlockedCount: system.unlockedTitles.length,
    totalCount: Object.keys(TITLE_DATABASE).length,
    equippedTitle: getEquippedTitle(system),
    availableTitles: getAvailableTitles(system, {}), // 추후 캐릭터 스탯 전달 필요
    unlockedTitles: getUnlockedTitles(system)
  };
}

export {
  TITLE_TYPES,
  TITLE_DATABASE,
  RARITY_MULTIPLIERS,
  createTitleSystem,
  getTitleInfo,
  getAvailableTitles,
  checkTitleRequirements,
  unlockTitle,
  equipTitle,
  unequipTitle,
  getEquippedTitle,
  calculateTitleEffect,
  getUnlockedTitles,
  getTitleSummary
};