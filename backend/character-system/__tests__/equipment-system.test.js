/**
 * AI Life Metaverse - Equipment System Tests
 *
 * 장비 시스템 테스트
 * - 장비 장착/해제
 * - 장비 강화
 * - 장비 효과 계산
 * - 인벤토리 관리
 *
 * @test character-system/equipment-system
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  EquipmentSystem,
  SlotTypes,
  Rarities,
  StatTypes,
  EquipmentDatabase
} from '../equipment-system.js';

describe('EquipmentSystem', () => {
  let equipmentSystem;

  beforeEach(() => {
    equipmentSystem = new EquipmentSystem();
  });

  // ============================================================================
  // 기본 설정 테스트
  // ============================================================================

  describe('기본 설정', () => {
    it('T01. 장비 시스템 초기화', () => {
      expect(equipmentSystem).toBeDefined();
      expect(equipmentSystem.slots).toBeDefined();
      expect(equipmentSystem.inventory).toBeDefined();
    });

    it('T02. 모든 슬롯이 비어 있는 상태로 초기화', () => {
      expect(equipmentSystem.slots[SlotTypes.WEAPON]).toBeNull();
      expect(equipmentSystem.slots[SlotTypes.HEAD]).toBeNull();
      expect(equipmentSystem.slots[SlotTypes.BODY]).toBeNull();
      expect(equipmentSystem.slots[SlotTypes.ACCESSORY]).toBeNull();
      expect(equipmentSystem.slots[SlotTypes.SPECIAL]).toBeNull();
    });

    it('T03. 인벤토리가 빈 상태로 초기화', () => {
      expect(equipmentSystem.inventory).toEqual([]);
    });
  });

  // ============================================================================
  // 장비 정보 조회 테스트
  // ============================================================================

  describe('장비 정보 조회', () => {
    it('T04. DB에서 장비 정보 가져오기', () => {
      const sword = equipmentSystem.getEquipmentInfo('sword_basic');
      expect(sword).toBeDefined();
      expect(sword.id).toBe('sword_basic');
      expect(sword.name).toBe('기본 검');
      expect(sword.slot).toBe(SlotTypes.WEAPON);
      expect(sword.rarity.name).toBe('COMMON');
    });

    it('T05. 존재하지 않는 장비 정보 조회', () => {
      const item = equipmentSystem.getEquipmentInfo('non_existent_item');
      expect(item).toBeNull();
    });

    it('T06. 장비 정보가 deep copy로 반환', () => {
      const sword1 = equipmentSystem.getEquipmentInfo('sword_basic');
      const sword2 = equipmentSystem.getEquipmentInfo('sword_basic');

      sword1.name = '수정된 검';

      expect(sword1.name).toBe('수정된 검');
      expect(sword2.name).toBe('기본 검');
    });
  });

  // ============================================================================
  // 장비 장착 테스트
  // ============================================================================

  describe('장비 장착', () => {
    it('T07. 무기 장착 성공', () => {
      const result = equipmentSystem.equipItem('sword_basic');

      expect(result.success).toBe(true);
      expect(result.message).toContain('장착');
      expect(equipmentSystem.slots[SlotTypes.WEAPON]).toBeDefined();
      expect(equipmentSystem.slots[SlotTypes.WEAPON].name).toBe('기본 검');
    });

    it('T08. 머리 장비 장착 성공', () => {
      const result = equipmentSystem.equipItem('helmet_leather');

      expect(result.success).toBe(true);
      expect(equipmentSystem.slots[SlotTypes.HEAD]).toBeDefined();
      expect(equipmentSystem.slots[SlotTypes.HEAD].name).toBe('가죽 투구');
    });

    it('T09. 장착 중인 장비 교체', () => {
      // 첫 번째 장비 장착
      equipmentSystem.equipItem('sword_basic');

      // 두 번째 장비로 교체
      const result = equipmentSystem.equipItem('sword_rare');

      expect(result.success).toBe(true);
      expect(equipmentSystem.slots[SlotTypes.WEAPON].name).toBe('강철 검');
      expect(result.previousEquipment).toBeDefined();
      expect(result.previousEquipment.name).toBe('기본 검');
    });

    it('T10. 존재하지 않는 장비 장착', () => {
      const result = equipmentSystem.equipItem('non_existent_item');

      expect(result.success).toBe(false);
      expect(result.message).toContain('찾을 수 없습니다');
    });
  });

  // ============================================================================
  // 장비 해제 테스트
  // ============================================================================

  describe('장비 해제', () => {
    it('T11. 장착된 장비 해제 성공', () => {
      equipmentSystem.equipItem('sword_basic');

      const result = equipmentSystem.unequipSlot(SlotTypes.WEAPON);

      expect(result.success).toBe(true);
      expect(result.message).toContain('해제');
      expect(equipmentSystem.slots[SlotTypes.WEAPON]).toBeNull();
      expect(result.equipment.name).toBe('기본 검');
    });

    it('T12. 빈 슬롯 해제', () => {
      const result = equipmentSystem.unequipSlot(SlotTypes.WEAPON);

      expect(result.success).toBe(false);
      expect(result.message).toContain('없습니다');
    });

    it('T13. 존재하지 않는 슬롯 해제', () => {
      const result = equipmentSystem.unequipSlot('invalid_slot');

      expect(result.success).toBe(false);
      expect(result.message).toContain('잘못된 슬롯');
    });
  });

  // ============================================================================
  // 장비 강화 테스트
  // ============================================================================

  describe('장비 강화', () => {
    it('T14. 장착된 장비 강화 성공', () => {
      equipmentSystem.equipItem('sword_basic');

      const result = equipmentSystem.enhanceEquipment('sword_basic');

      expect(result.success).toBe(true);
      expect(result.message).toContain('강화');
      expect(result.newLevel).toBe(2);
      expect(equipmentSystem.slots[SlotTypes.WEAPON].level).toBe(2);
    });

    it('T15. 인벤토리 장비 강화 성공', () => {
      equipmentSystem.addToInventory(EquipmentDatabase['sword_basic']);

      const result = equipmentSystem.enhanceEquipment('sword_basic');

      expect(result.success).toBe(true);
      expect(result.newLevel).toBe(2);
      expect(equipmentSystem.inventory[0].level).toBe(2);
    });

    it('T16. 최대 레벨 도달 시 강화 실패', () => {
      equipmentSystem.equipItem('sword_basic');

      // 최대 레벨로 설정
      equipmentSystem.slots[SlotTypes.WEAPON].level = 10;

      const result = equipmentSystem.enhanceEquipment('sword_basic');

      expect(result.success).toBe(false);
      expect(result.message).toContain('최대 레벨');
      expect(result.newLevel).toBe(10);
    });

    it('T17. 존재하지 않는 장비 강화', () => {
      const result = equipmentSystem.enhanceEquipment('non_existent');

      expect(result.success).toBe(false);
      expect(result.message).toContain('찾을 수 없습니다');
      expect(result.newLevel).toBeNull();
    });
  });

  // ============================================================================
  // 장비 효과 계산 테스트
  // ============================================================================

  describe('장비 효과 계산', () => {
    it('T18. 장착된 장비의 스탯 합산', () => {
      equipmentSystem.equipItem('sword_basic');

      const stats = equipmentSystem.getTotalStats();

      expect(stats[StatTypes.ATTACK]).toBeGreaterThan(0);
      expect(stats[StatTypes.CRITICAL_DAMAGE]).toBeGreaterThan(0);
    });

    it('T19. 레어도에 따른 스탯 보너스', () => {
      equipmentSystem.equipItem('sword_basic'); // COMMON (1.0x)
      const commonStats = equipmentSystem.getTotalStats();
      equipmentSystem.unequipSlot(SlotTypes.WEAPON);

      equipmentSystem.equipItem('sword_rare'); // RARE (1.2x)
      const rareStats = equipmentSystem.getTotalStats();
      equipmentSystem.unequipSlot(SlotTypes.WEAPON);

      expect(rareStats[StatTypes.ATTACK]).toBeGreaterThan(commonStats[StatTypes.ATTACK]);
    });

    it('T20. 레벨에 따른 스탯 증가', () => {
      equipmentSystem.equipItem('sword_basic');

      const level1Stats = equipmentSystem.getTotalStats();
      equipmentSystem.enhanceEquipment('sword_basic');
      const level2Stats = equipmentSystem.getTotalStats();

      expect(level2Stats[StatTypes.ATTACK]).toBeGreaterThan(level1Stats[StatTypes.ATTACK]);
    });

    it('T21. 복수 장비 스탯 합산', () => {
      equipmentSystem.equipItem('sword_basic');
      equipmentSystem.equipItem('helmet_leather');
      equipmentSystem.equipItem('armor_leather');

      const stats = equipmentSystem.getTotalStats();

      expect(stats[StatTypes.ATTACK]).toBeGreaterThan(0);
      expect(stats[StatTypes.DEFENSE]).toBeGreaterThan(0);
      expect(stats[StatTypes.HEALTH]).toBeGreaterThan(0);
    });

    it('T22. 장비 해제 시 스탯 감소', () => {
      equipmentSystem.equipItem('sword_basic');
      const equippedStats = equipmentSystem.getTotalStats();

      equipmentSystem.unequipSlot(SlotTypes.WEAPON);
      const unequippedStats = equipmentSystem.getTotalStats();

      expect(equippedStats[StatTypes.ATTACK]).toBeGreaterThan(unequippedStats[StatTypes.ATTACK]);
    });
  });

  // ============================================================================
  // 인벤토리 관리 테스트
  // ============================================================================

  describe('인벤토리 관리', () => {
    it('T23. 인벤토리에 장비 추가 성공', () => {
      const result = equipmentSystem.addToInventory(EquipmentDatabase['sword_basic']);

      expect(result.success).toBe(true);
      expect(result.message).toContain('추가');
      expect(equipmentSystem.inventory.length).toBe(1);
      expect(equipmentSystem.inventory[0].name).toBe('기본 검');
    });

    it('T24. 중복 장비 추가 실패', () => {
      equipmentSystem.addToInventory(EquipmentDatabase['sword_basic']);

      const result = equipmentSystem.addToInventory(EquipmentDatabase['sword_basic']);

      expect(result.success).toBe(false);
      expect(result.message).toContain('이미');
      expect(equipmentSystem.inventory.length).toBe(1);
    });

    it('T25. 인벤토리에서 장비 제거 성공', () => {
      equipmentSystem.addToInventory(EquipmentDatabase['sword_basic']);

      const result = equipmentSystem.removeFromInventory('sword_basic');

      expect(result.success).toBe(true);
      expect(result.message).toContain('제거');
      expect(equipmentSystem.inventory.length).toBe(0);
    });

    it('T26. 장착된 장비 제거 실패', () => {
      // 장비를 인벤토리에 추가
      equipmentSystem.addToInventory(EquipmentDatabase['sword_basic']);
      // 장착 상태로 변경
      equipmentSystem.equipItem('sword_basic');

      // 장착된 장비 제거 시도
      const result = equipmentSystem.removeFromInventory('sword_basic');

      expect(result.success).toBe(false);
      expect(result.message).toContain('장착 중');
    });

    it('T27. 존재하지 않는 장비 제거', () => {
      const result = equipmentSystem.removeFromInventory('non_existent');

      expect(result.success).toBe(false);
      expect(result.message).toContain('찾을 수 없습니다');
    });

    it('T28. 인벤토리 목록 조회', () => {
      equipmentSystem.addToInventory(EquipmentDatabase['sword_basic']);
      equipmentSystem.addToInventory(EquipmentDatabase['helmet_leather']);

      const inventory = equipmentSystem.getInventory();

      expect(inventory.length).toBe(2);
      expect(inventory[0].name).toBe('기본 검');
      expect(inventory[1].name).toBe('가죽 투구');
    });
  });

  // ============================================================================
  // 장비 스탯 계산 테스트
  // ============================================================================

  describe('장비 스탯 계산', () => {
    it('T29. 레벨 1 장비 스탯 계산', () => {
      const sword = equipmentSystem.getEquipmentInfo('sword_basic');
      const attack = equipmentSystem.calculateStat(sword, StatTypes.ATTACK);

      // 레벨 1, COMMON (1.0x), 기본 공격력 10
      const expected = 10 * 1.0 * 1.0;
      expect(attack).toBeCloseTo(expected, 2);
    });

    it('T30. 레벨 3 장비 스탟 계산', () => {
      const sword = equipmentSystem.getEquipmentInfo('sword_basic');
      sword.level = 3;

      const attack = equipmentSystem.calculateStat(sword, StatTypes.ATTACK);

      // 레벨 3 (1 + (3-1)*0.1 = 1.2x), COMMON (1.0x), 기본 공격력 10
      const expected = 10 * 1.0 * 1.2;
      expect(attack).toBeCloseTo(expected, 2);
    });

    it('T31. LEGENDARY 장비 스탟 계산', () => {
      const cloak = equipmentSystem.getEquipmentInfo('shadow_cloak');
      const speed = equipmentSystem.calculateStat(cloak, StatTypes.SPEED);

      // 레벨 1 (1.0x), LEGENDARY (2.0x), 기본 속도 30
      const expected = 30 * 2.0 * 1.0;
      expect(speed).toBeCloseTo(expected, 2);
    });

    it('T32. 존재하지 않는 스타입 계산', () => {
      const sword = equipmentSystem.getEquipmentInfo('sword_basic');
      const nonExistentStat = equipmentSystem.calculateStat(sword, 'non_existent');

      expect(nonExistentStat).toBe(0);
    });
  });

  // ============================================================================
  // 장착 슬롯 정보 테스트
  // ============================================================================

  describe('장착 슬롯 정보', () => {
    it('T33. 장착된 슬롯 정보 조회', () => {
      equipmentSystem.equipItem('sword_basic');
      equipmentSystem.equipItem('helmet_leather');

      const slots = equipmentSystem.equippedSlots;

      expect(slots[SlotTypes.WEAPON]).toBeDefined();
      expect(slots[SlotTypes.WEAPON].name).toBe('기본 검');
      expect(slots[SlotTypes.HEAD]).toBeDefined();
      expect(slots[SlotTypes.HEAD].name).toBe('가죽 투구');
      expect(slots[SlotTypes.BODY]).toBeNull();
    });

    it('T34. 슬롯 정보는 deep copy로 반환', () => {
      equipmentSystem.equipItem('sword_basic');

      const slots1 = equipmentSystem.equippedSlots;
      const slots2 = equipmentSystem.equippedSlots;

      slots1[SlotTypes.WEAPON].name = '수정된 검';

      expect(slots1[SlotTypes.WEAPON].name).toBe('수정된 검');
      expect(slots2[SlotTypes.WEAPON].name).toBe('기본 검');
    });
  });

  // ============================================================================
  // 요약 정보 테스트
  // ============================================================================

  describe('요약 정보', () => {
    it('T35. 빈 시스템 요약', () => {
      const summary = equipmentSystem.getSummary();

      expect(summary.slots).toBeDefined();
      expect(summary.inventoryCount).toBe(0);
      expect(summary.totalStats).toBeDefined();
    });

    it('T36. 장착된 장비가 있는 시스템 요약', () => {
      equipmentSystem.equipItem('sword_basic');
      equipmentSystem.addToInventory(EquipmentDatabase['helmet_leather']);

      const summary = equipmentSystem.getSummary();

      expect(summary.inventoryCount).toBe(1);
      expect(summary.totalStats[StatTypes.ATTACK]).toBeGreaterThan(0);
    });
  });

  // ============================================================================
  // 통합 테스트
  // ============================================================================

  describe('통합 테스트', () => {
    it('T37. 장착 → 강화 → 스탟 확인', () => {
      equipmentSystem.equipItem('sword_basic');

      const beforeStats = equipmentSystem.getTotalStats();

      equipmentSystem.enhanceEquipment('sword_basic');

      const afterStats = equipmentSystem.getTotalStats();

      expect(afterStats[StatTypes.ATTACK]).toBeGreaterThan(beforeStats[StatTypes.ATTACK]);
    });

    it('T38. 인벤토리 → 장착 → 해제 → 인벤토리', () => {
      // 인벤토리에 추가
      const sword = JSON.parse(JSON.stringify(EquipmentDatabase['sword_basic']));
      equipmentSystem.addToInventory(sword);

      // 장착
      equipmentSystem.equipItem('sword_basic');

      const equippedName = equipmentSystem.slots[SlotTypes.WEAPON].name;

      // 해제
      equipmentSystem.unequipSlot(SlotTypes.WEAPON);

      expect(equippedName).toBe('기본 검');
    });

    it('T39. 전체 장비 루트 장착', () => {
      equipmentSystem.equipItem('sword_rare');
      equipmentSystem.equipItem('crown_mage');
      equipmentSystem.equipItem('armor_plate');
      equipmentSystem.equipItem('ring_hp');
      equipmentSystem.equipItem('shadow_cloak');

      const stats = equipmentSystem.getTotalStats();

      expect(stats[StatTypes.ATTACK]).toBeGreaterThan(0);
      expect(stats[StatTypes.DEFENSE]).toBeGreaterThan(0);
      expect(stats[StatTypes.HEALTH]).toBeGreaterThan(0);
      expect(stats[StatTypes.SPEED]).toBeGreaterThan(0);
      expect(stats[StatTypes.INTELLIGENCE]).toBeGreaterThan(0);
    });

    it('T40. 장비 교체에 따른 스탯 변화', () => {
      equipmentSystem.equipItem('sword_basic');
      const beforeStats = equipmentSystem.getTotalStats();

      equipmentSystem.equipItem('sword_rare');
      const afterStats = equipmentSystem.getTotalStats();

      // RARE가 COMMON보다 스탯이 높아야 함
      expect(afterStats[StatTypes.ATTACK]).toBeGreaterThan(beforeStats[StatTypes.ATTACK]);
    });
  });

  // ============================================================================
  // 엣지 케이스
  // ============================================================================

  describe('엣지 케이스', () => {
    it('T41. 장비 장착 후 인벤토리에 동일 장비 추가', () => {
      equipmentSystem.equipItem('sword_basic');

      // 인벤토리와 장착 슬롯은 독립적이므로 장착된 장비와 동일한 장비를 인벤토리에 추가 가능
      const result = equipmentSystem.addToInventory(EquipmentDatabase['sword_basic']);

      expect(result.success).toBe(true);
      expect(result.message).toContain('추가');
    });

    it('T42. 스탯이 없는 장비 계산', () => {
      const customEquipment = {
        id: 'custom_empty',
        name: '빈 장비',
        slot: SlotTypes.WEAPON,
        rarity: Rarities.COMMON,
        level: 1,
        maxLevel: 10,
        baseStats: {},
        description: '스탯이 없는 장비'
      };

      equipmentSystem.equipItem(customEquipment.id);
      // 슬롯에 직접 설정 (DB에 없으므로)
      equipmentSystem.slots[SlotTypes.WEAPON] = customEquipment;

      const stats = equipmentSystem.getTotalStats();

      expect(stats[StatTypes.ATTACK]).toBe(0);
    });

    it('T43. 최대 레벨 장비 스탯 계산', () => {
      const sword = equipmentSystem.getEquipmentInfo('sword_basic');
      sword.level = 10; // 최대 레벨

      const attack = equipmentSystem.calculateStat(sword, StatTypes.ATTACK);

      // 레벨 10 (1 + (10-1)*0.1 = 1.9x), COMMON (1.0x), 기본 공격력 10
      const expected = 10 * 1.0 * 1.9;
      expect(attack).toBeCloseTo(expected, 2);
    });

    it('T44. 모든 슬롯 교체', () => {
      const weapons = ['sword_basic', 'sword_rare'];
      const heads = ['helmet_leather', 'crown_mage'];

      weapon: for (const weapon of weapons) {
        equipmentSystem.equipItem(weapon);
      }

      for (const head of heads) {
        equipmentSystem.equipItem(head);
      }

      expect(equipmentSystem.slots[SlotTypes.WEAPON].name).toBe('강철 검');
      expect(equipmentSystem.slots[SlotTypes.HEAD].name).toBe('마법사 관');
    });
  });
});