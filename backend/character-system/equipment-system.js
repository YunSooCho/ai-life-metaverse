/**
 * AI Life Metaverse - Equipment System
 *
 * 캐릭터 장비 시스템
 * - 장비 슬롯 시스템
 * - 장비 장착/해제
 * - 장비 효과 계산
 * - 장비 레벨/강화 시스템
 *
 * @module character-system/equipment-system
 */

// ============================================================================
// 장비 데이터 정의
// ============================================================================

/**
 * 장비 슬롯 타입
 */
const SlotTypes = {
  WEAPON: 'weapon',        // 무기
  HEAD: 'head',            // 머리
  BODY: 'body',            // 몸통
  ACCESSORY: 'accessory',  // 장신구
  SPECIAL: 'special'       // 특수
};

/**
 * 장비 레어도
 */
const Rarities = {
  COMMON: { name: 'COMMON', color: '#95A5A6', statMultiplier: 1.0 },
  RARE: { name: 'RARE', color: '#3498DB', statMultiplier: 1.2 },
  EPIC: { name: 'EPIC', color: '#9B59B6', statMultiplier: 1.5 },
  LEGENDARY: { name: 'LEGENDARY', color: '#F39C12', statMultiplier: 2.0 },
  MYTHIC: { name: 'MYTHIC', color: '#E74C3C', statMultiplier: 2.5 }
};

/**
 * 장비 스탯 타입
 */
const StatTypes = {
  ATTACK: 'attack',
  DEFENSE: 'defense',
  SPEED: 'speed',
  HEALTH: 'health',
  STAMINA: 'stamina',
  INTELLIGENCE: 'intelligence',
  CRITICAL_CHANCE: 'criticalChance',
  CRITICAL_DAMAGE: 'criticalDamage'
};

/**
 * 기본 장비 아이템 데이터베이스
 */
const EquipmentDatabase = {
  // 무기
  'sword_basic': {
    id: 'sword_basic',
    name: '기본 검',
    slot: SlotTypes.WEAPON,
    rarity: Rarities.COMMON,
    level: 1,
    maxLevel: 10,
    baseStats: {
      [StatTypes.ATTACK]: 10,
      [StatTypes.CRITICAL_DAMAGE]: 0.05
    },
    description: '기본적인 검'
  },
  'sword_rare': {
    id: 'sword_rare',
    name: '강철 검',
    slot: SlotTypes.WEAPON,
    rarity: Rarities.RARE,
    level: 1,
    maxLevel: 15,
    baseStats: {
      [StatTypes.ATTACK]: 15,
      [StatTypes.CRITICAL_DAMAGE]: 0.08
    },
    description: '강철로 만들어진 검'
  },
  'staff_magic': {
    id: 'staff_magic',
    name: '마법 스태프',
    slot: SlotTypes.WEAPON,
    rarity: Rarities.RARE,
    level: 1,
    maxLevel: 15,
    baseStats: {
      [StatTypes.ATTACK]: 8,
      [StatTypes.INTELLIGENCE]: 20,
      [StatTypes.CRITICAL_CHANCE]: 0.1
    },
    description: '마법의 힘이 담긴 스태프'
  },

  // 머리 장비
  'helmet_leather': {
    id: 'helmet_leather',
    name: '가죽 투구',
    slot: SlotTypes.HEAD,
    rarity: Rarities.COMMON,
    level: 1,
    maxLevel: 10,
    baseStats: {
      [StatTypes.DEFENSE]: 5,
      [StatTypes.HEALTH]: 10
    },
    description: '가죽으로 만든 투구'
  },
  'crown_mage': {
    id: 'crown_mage',
    name: '마법사 관',
    slot: SlotTypes.HEAD,
    rarity: Rarities.EPIC,
    level: 1,
    maxLevel: 15,
    baseStats: {
      [StatTypes.DEFENSE]: 8,
      [StatTypes.INTELLIGENCE]: 25,
      [StatTypes.CRITICAL_CHANCE]: 0.05
    },
    description: '마법사의 힘이 담긴 관'
  },

  // 몸통 장비
  'armor_leather': {
    id: 'armor_leather',
    name: '가죽 갑옷',
    slot: SlotTypes.BODY,
    rarity: Rarities.COMMON,
    level: 1,
    maxLevel: 10,
    baseStats: {
      [StatTypes.DEFENSE]: 15,
      [StatTypes.HEALTH]: 30
    },
    description: '가죽으로 만든 갑옷'
  },
  'armor_plate': {
    id: 'armor_plate',
    name: '판금 갑옷',
    slot: SlotTypes.BODY,
    rarity: Rarities.RARE,
    level: 1,
    maxLevel: 15,
    baseStats: {
      [StatTypes.DEFENSE]: 25,
      [StatTypes.HEALTH]: 50,
      [StatTypes.SPEED]: -5
    },
    description: '튼튼한 판금 갑옷'
  },

  // 장신구
  'ring_hp': {
    id: 'ring_hp',
    name: '생명의 반지',
    slot: SlotTypes.ACCESSORY,
    rarity: Rarities.EPIC,
    level: 1,
    maxLevel: 15,
    baseStats: {
      [StatTypes.HEALTH]: 100,
      [StatTypes.STAMINA]: 20
    },
    description: '생명력을 증가시키는 반지'
  },
  'ring_speed': {
    id: 'ring_speed',
    name: '속도의 반지',
    slot: SlotTypes.ACCESSORY,
    rarity: Rarities.EPIC,
    level: 1,
    maxLevel: 15,
    baseStats: {
      [StatTypes.SPEED]: 20,
      [StatTypes.CRITICAL_CHANCE]: 0.08
    },
    description: '이동 속도를 증가시키는 반지'
  },

  // 특수 장비
  'shadow_cloak': {
    id: 'shadow_cloak',
    name: '그림자 망토',
    slot: SlotTypes.SPECIAL,
    rarity: Rarities.LEGENDARY,
    level: 1,
    maxLevel: 20,
    baseStats: {
      [StatTypes.SPEED]: 30,
      [StatTypes.CRITICAL_CHANCE]: 0.15,
      [StatTypes.CRITICAL_DAMAGE]: 0.2
    },
    description: '그림자 속에 몸을 숨기는 망토'
  }
};

// ============================================================================
// 장비 시스템
// ============================================================================

/**
 * 장비 시스템 클래스
 */
class EquipmentSystem {
  constructor() {
    this.slots = {
      [SlotTypes.WEAPON]: null,
      [SlotTypes.HEAD]: null,
      [SlotTypes.BODY]: null,
      [SlotTypes.ACCESSORY]: null,
      [SlotTypes.SPECIAL]: null
    };
    this.inventory = [];
  }

  /**
   * 장비 정보 가져오기
   * @param {string} itemId - 장비 아이템 ID
   * @returns {Object|null} 장비 정보
   */
  getEquipmentInfo(itemId) {
    // DB에서 검색
    const dbEquipment = EquipmentDatabase[itemId];
    if (dbEquipment) {
      return JSON.parse(JSON.stringify(dbEquipment)); // Deep copy
    }

    // 인벤토리에서 검색
    const inventoryItem = this.inventory.find(item => item.id === itemId);
    if (inventoryItem) {
      return JSON.parse(JSON.stringify(inventoryItem));
    }

    return null;
  }

  /**
   * 장비 장착
   * @param {string} itemId - 장비 아이템 ID
   * @returns {Object} { success: boolean, message: string, previousEquipment: Object|null }
   */
  equipItem(itemId) {
    const equipment = this.getEquipmentInfo(itemId);

    if (!equipment) {
      return {
        success: false,
        message: `장비 아이템을 찾을 수 없습니다: ${itemId}`,
        previousEquipment: null
      };
    }

    const slotType = equipment.slot;

    // 슬롯이 존재하는지 확인
    if (!this.slots.hasOwnProperty(slotType)) {
      return {
        success: false,
        message: `잘못된 슬롯 타입입니다: ${slotType}`,
        previousEquipment: null
      };
    }

    // 현재 장착된 장비 저장
    const previousEquipment = this.slots[slotType];

    // 장비 장착
    this.slots[slotType] = equipment;

    return {
      success: true,
      message: `${equipment.name}을(를) 장착했습니다`,
      previousEquipment: previousEquipment
    };
  }

  /**
   * 장비 해제
   * @param {string} slotType - 슬롯 타입
   * @returns {Object} { success: boolean, message: string, equipment: Object|null }
   */
  unequipSlot(slotType) {
    // 슬롯이 존재하는지 확인
    if (!this.slots.hasOwnProperty(slotType)) {
      return {
        success: false,
        message: `잘못된 슬롯 타입입니다: ${slotType}`,
        equipment: null
      };
    }

    const equipment = this.slots[slotType];

    if (!equipment) {
      return {
        success: false,
        message: `${slotType} 슬롯에 장착된 장비가 없습니다`,
        equipment: null
      };
    }

    // 장비 해제
    this.slots[slotType] = null;

    return {
      success: true,
      message: `${equipment.name}을(를) 해제했습니다`,
      equipment: equipment
    };
  }

  /**
   * 장비 강화
   * @param {string} itemId - 장비 아이템 ID
   * @returns {Object} { success: boolean, message: string, newLevel: number|null }
   */
  enhanceEquipment(itemId) {
    // 장착된 장비에서 검색
    let targetEquipment = null;
    let targetSlot = null;

    for (const [slot, equipment] of Object.entries(this.slots)) {
      if (equipment && equipment.id === itemId) {
        targetEquipment = equipment;
        targetSlot = slot;
        break;
      }
    }

    // 장착된 장비가 없으면 인벤토리에서 검색
    if (!targetEquipment) {
      targetEquipment = this.inventory.find(item => item.id === itemId);
      if (!targetEquipment) {
        return {
          success: false,
          message: `장비를 찾을 수 없습니다: ${itemId}`,
          newLevel: null
        };
      }
    }

    // 최대 레벨 확인
    if (targetEquipment.level >= targetEquipment.maxLevel) {
      return {
        success: false,
        message: `${targetEquipment.name}은(는) 이미 최대 레벨입니다`,
        newLevel: targetEquipment.level
      };
    }

    // 레벨업
    targetEquipment.level += 1;

    // 장착된 장비이면 슬롯 업데이트
    if (targetSlot) {
      this.slots[targetSlot] = targetEquipment;
    }

    return {
      success: true,
      message: `${targetEquipment.name}이(가) 레벨 ${targetEquipment.level}로 강화되었습니다`,
      newLevel: targetEquipment.level
    };
  }

  /**
   * 장비 효과 계산
   * @returns {Object} 총 스탯 보너스
   */
  getTotalStats() {
    const totalStats = {};

    // 기본 스탯 초기화
    Object.values(StatTypes).forEach(stat => {
      totalStats[stat] = 0;
    });

    // 장착된 장비들의 스탯 합산
    for (const equipment of Object.values(this.slots)) {
      if (!equipment) continue;

      const rarityMultiplier = equipment.rarity.statMultiplier;
      const levelMultiplier = 1 + (equipment.level - 1) * 0.1; // 레벨당 10% 증가

      for (const [stat, value] of Object.entries(equipment.baseStats)) {
        if (totalStats.hasOwnProperty(stat)) {
          const effectiveValue = value * rarityMultiplier * levelMultiplier;
          totalStats[stat] += effectiveValue;
        }
      }
    }

    return totalStats;
  }

  /**
   * 장착된 장비 정보
   * @returns {Object} 슬롯별 장착된 장비
   */
  get equippedSlots() {
    return JSON.parse(JSON.stringify(this.slots));
  }

  /**
   * 인벤토리에 장비 추가
   * @param {Object} equipment - 장비 정보
   * @returns {Object} { success: boolean, message: string }
   */
  addToInventory(equipment) {
    // 파라미터 검증
    if (!equipment || !equipment.id || !equipment.name) {
      return {
        success: false,
        message: '유효하지 않은 장비 정보입니다'
      };
    }

    // 중복 체크
    const existingIndex = this.inventory.findIndex(item => item.id === equipment.id);
    if (existingIndex !== -1) {
      return {
        success: false,
        message: `${equipment.name}은(는) 이미 인벤토리에 있습니다`
      };
    }

    this.inventory.push(JSON.parse(JSON.stringify(equipment)));

    return {
      success: true,
      message: `${equipment.name}을(를) 인벤토리에 추가했습니다`
    };
  }

  /**
   * 인벤토리에서 장비 제거
   * @param {string} itemId - 장비 아이템 ID
   * @returns {Object} { success: boolean, message: string }
   */
  removeFromInventory(itemId) {
    const index = this.inventory.findIndex(item => item.id === itemId);

    if (index === -1) {
      return {
        success: false,
        message: `인벤토리에서 장비를 찾을 수 없습니다: ${itemId}`
      };
    }

    // 장착된 장비인지 확인
    const isEquipped = Object.values(this.slots).some(
      equipment => equipment && equipment.id === itemId
    );

    if (isEquipped) {
      return {
        success: false,
        message: `${itemId}은(는) 현재 장착 중이므로 제거할 수 없습니다`
      };
    }

    const equipment = this.inventory.splice(index, 1)[0];

    return {
      success: true,
      message: `${equipment.name}을(를) 인벤토리에서 제거했습니다`
    };
  }

  /**
   * 인벤토리 목록
   * @returns {Array} 인벤토리 장비 목록
   */
  getInventory() {
    return JSON.parse(JSON.stringify(this.inventory));
  }

  /**
   * 장비 시스템 요약 정보
   * @returns {Object} 요약 정보
   */
  getSummary() {
    return {
      slots: JSON.parse(JSON.stringify(this.slots)),
      inventoryCount: this.inventory.length,
      totalStats: this.getTotalStats()
    };
  }

  /**
   * 장비 레벨에 따른 스탯 계산
   * @param {Object} equipment - 장비 정보
   * @param {string} stat - 스탯 타입
   * @returns {number} 계산된 스탯 값
   */
  calculateStat(equipment, stat) {
    if (!equipment.baseStats.hasOwnProperty(stat)) {
      return 0;
    }

    const baseValue = equipment.baseStats[stat];
    const rarityMultiplier = equipment.rarity.statMultiplier;
    const levelMultiplier = 1 + (equipment.level - 1) * 0.1;

    return baseValue * rarityMultiplier * levelMultiplier;
  }
}

// ============================================================================
// 내보내기
// ============================================================================

module.exports = {
  EquipmentSystem,
  SlotTypes,
  Rarities,
  StatTypes,
  EquipmentDatabase
};