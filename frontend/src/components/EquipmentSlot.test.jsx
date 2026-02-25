/**
 * AI Life Metaverse - EquipmentSlot Component Tests
 *
 * 장비 슬롯 컴포넌트 테스트
 */

import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import EquipmentSlot from './EquipmentSlot';

describe('EquipmentSlot Component', () => {
  describe('렌더링', () => {
    it('빈 슬롯이 렌더링되어야 함', () => {
      render(
        <EquipmentSlot
          slotType="weapon"
          equipment={null}
          onEquip={() => {}}
          onUnequip={() => {}}
          onEnhance={() => {}}
          isEquipped={false}
        />
      );

      expect(screen.getByText('무기')).toBeInTheDocument();
      expect(screen.getByText('📦')).toBeInTheDocument();
    });

    it('장착된 장비가 렌더링되어야 함', () => {
      const equipment = {
        id: 'sword_basic',
        name: '기본 검',
        slot: 'weapon',
        rarity: { name: 'COMMON' },
        level: 1,
        maxLevel: 10
      };

      render(
        <EquipmentSlot
          slotType="weapon"
          equipment={equipment}
          onEquip={() => {}}
          onUnequip={() => {}}
          onEnhance={() => {}}
          isEquipped={true}
        />
      );

      expect(screen.getByText('무기')).toBeInTheDocument();
      expect(screen.getByText('기본 검')).toBeInTheDocument();
      expect(screen.getByText('Lv. 1 / 10')).toBeInTheDocument();
      expect(screen.getByText('COMMON')).toBeInTheDocument();
    });

    it('장비 아이콘이 올바르게 표시되어야 함', () => {
      // 무기 슬롯
      const weapon = { id: 'sword', name: '검', slot: 'weapon', rarity: {}, level: 1 };
      const { rerender } = render(
        <EquipmentSlot
          slotType="weapon"
          equipment={weapon}
          onEquip={() => {}}
          onUnequip={() => {}}
          onEnhance={() => {}}
          isEquipped={true}
        />
      );
      expect(screen.getByText('⚔️')).toBeInTheDocument();

      // 머리 슬롯
      const head = { id: 'helmet', name: '투구', slot: 'head', rarity: {}, level: 1 };
      rerender(
        <EquipmentSlot
          slotType="head"
          equipment={head}
          onEquip={() => {}}
          onUnequip={() => {}}
          onEnhance={() => {}}
          isEquipped={true}
        />
      );
      expect(screen.getByText('👑')).toBeInTheDocument();

      // 몸통 슬롯
      const body = { id: 'armor', name: '갑옷', slot: 'body', rarity: {}, level: 1 };
      rerender(
        <EquipmentSlot
          slotType="body"
          equipment={body}
          onEquip={() => {}}
          onUnequip={() => {}}
          onEnhance={() => {}}
          isEquipped={true}
        />
      );
      expect(screen.getByText('🛡️')).toBeInTheDocument();

      // 장신구 슬롯
      const accessory = { id: 'ring', name: '반지', slot: 'accessory', rarity: {}, level: 1 };
      rerender(
        <EquipmentSlot
          slotType="accessory"
          equipment={accessory}
          onEquip={() => {}}
          onUnequip={() => {}}
          onEnhance={() => {}}
          isEquipped={true}
        />
      );
      expect(screen.getByText('💍')).toBeInTheDocument();

      // 특수 슬롯
      const special = { id: 'special', name: '특수', slot: 'special', rarity: {}, level: 1 };
      rerender(
        <EquipmentSlot
          slotType="special"
          equipment={special}
          onEquip={() => {}}
          onUnequip={() => {}}
          onEnhance={() => {}}
          isEquipped={true}
        />
      );
      expect(screen.getByText('✨')).toBeInTheDocument();
    });

    it('레어도 배지가 표시되어야 함', () => {
      const equipment = {
        id: 'sword_rare',
        name: '강철 검',
        slot: 'weapon',
        rarity: { name: 'RARE' },
        level: 1
      };

      render(
        <EquipmentSlot
          slotType="weapon"
          equipment={equipment}
          onEquip={() => {}}
          onUnequip={() => {}}
          onEnhance={() => {}}
          isEquipped={true}
        />
      );

      expect(screen.getByText('RARE')).toBeInTheDocument();
    });
  });

  describe('클릭 이벤트', () => {
    it('빈 슬롯 클릭 시 onEquip이 호출되어야 함', () => {
      const onEquipMock = vi.fn();

      render(
        <EquipmentSlot
          slotType="weapon"
          equipment={null}
          onEquip={onEquipMock}
          onUnequip={() => {}}
          onEnhance={() => {}}
          isEquipped={false}
        />
      );

      const slot = screen.getByText('무기').closest('.equipment-slot');
      fireEvent.click(slot);

      expect(onEquipMock).toHaveBeenCalledWith('weapon');
    });

    it('장착된 장비 클릭 시 onUnequip이 호출되어야 함', () => {
      const onUnequipMock = vi.fn();
      const equipment = {
        id: 'sword_basic',
        name: '기본 검',
        slot: 'weapon',
        rarity: {},
        level: 1
      };

      render(
        <EquipmentSlot
          slotType="weapon"
          equipment={equipment}
          onEquip={() => {}}
          onUnequip={onUnequipMock}
          onEnhance={() => {}}
          isEquipped={true}
        />
      );

      const slot = screen.getByText('기본 검').closest('.equipment-slot');
      fireEvent.click(slot);

      expect(onUnequipMock).toHaveBeenCalledWith('weapon');
    });
  });

  describe('강화 기능', () => {
    it('강화 버튼이 표시되어야 함 (장착되고 최대 레벨이 아닐 때)', () => {
      const equipment = {
        id: 'sword_basic',
        name: '기본 검',
        slot: 'weapon',
        rarity: {},
        level: 1,
        maxLevel: 10
      };

      render(
        <EquipmentSlot
          slotType="weapon"
          equipment={equipment}
          onEquip={() => {}}
          onUnequip={() => {}}
          onEnhance={() => {}}
          isEquipped={true}
        />
      );

      expect(screen.getByText('강화 (+1)')).toBeInTheDocument();
    });

    it('최대 레벨 도달 시 MAX 배지가 표시되어야 함', () => {
      const equipment = {
        id: 'sword_basic',
        name: '기본 검',
        slot: 'weapon',
        rarity: {},
        level: 10,
        maxLevel: 10
      };

      render(
        <EquipmentSlot
          slotType="weapon"
          equipment={equipment}
          onEquip={() => {}}
          onUnequip={() => {}}
          onEnhance={() => {}}
          isEquipped={true}
        />
      );

      expect(screen.getByText('MAX')).toBeInTheDocument();
      expect(screen.queryByText('강화 (+1)')).not.toBeInTheDocument();
    });

    it('강화 버튼 클릭 시 onEnhance가 호출되어야 함', () => {
      const onEnhanceMock = vi.fn();
      const equipment = {
        id: 'sword_basic',
        name: '기본 검',
        slot: 'weapon',
        rarity: {},
        level: 1,
        maxLevel: 10
      };

      render(
        <EquipmentSlot
          slotType="weapon"
          equipment={equipment}
          onEquip={() => {}}
          onUnequip={() => {}}
          onEnhance={onEnhanceMock}
          isEquipped={true}
        />
      );

      const enhanceButton = screen.getByText('강화 (+1)');
      fireEvent.click(enhanceButton);

      expect(onEnhanceMock).toHaveBeenCalledWith(equipment);
    });
  });

  describe('호버 효과', () => {
    it('호버 시 슬롯이 확대되어야 함', () => {
      const equipment = {
        id: 'sword_basic',
        name: '기본 검',
        slot: 'weapon',
        rarity: {},
        level: 1
      };

      render(
        <EquipmentSlot
          slotType="weapon"
          equipment={equipment}
          onEquip={() => {}}
          onUnequip={() => {}}
          onEnhance={() => {}}
          isEquipped={true}
        />
      );

      const slot = screen.getByText('기본 검').closest('.equipment-slot');

      fireEvent.mouseEnter(slot);
      expect(slot.style.transform).toContain('scale(1.05)');

      fireEvent.mouseLeave(slot);
      expect(slot.style.transform).toContain('scale(1)');
    });
  });

  describe('레어도 색상', () => {
    it('레어도에 따라 테두리 색상이 달라야 함', () => {
      // COMMON
      const common = { id: 'sword', name: '검', slot: 'weapon', rarity: { name: 'COMMON' }, level: 1 };
      const { rerender } = render(
        <EquipmentSlot
          slotType="weapon"
          equipment={common}
          onEquip={() => {}}
          onUnequip={() => {}}
          onEnhance={() => {}}
          isEquipped={true}
        />
      );

      const slot = screen.getByText('검').closest('.equipment-slot');
      expect(slot.style.borderColor).toBe('rgb(149, 165, 166)'); // Gray

      // RARE
      const rare = { id: 'sword_rare', name: '강철 검', slot: 'weapon', rarity: { name: 'RARE' }, level: 1 };
      rerender(
        <EquipmentSlot
          slotType="weapon"
          equipment={rare}
          onEquip={() => {}}
          onUnequip={() => {}}
          onEnhance={() => {}}
          isEquipped={true}
        />
      );

      expect(slot.style.borderColor).toBe('rgb(52, 152, 219)'); // Blue
    });
  });
});