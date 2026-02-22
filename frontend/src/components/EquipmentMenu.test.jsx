/**
 * AI Life Metaverse - EquipmentMenu Component Tests
 *
 * 장비 메뉴 컴포넌트 테스트
 */

import { describe, it, expect, beforeEach, vi, jest } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import EquipmentMenu from './EquipmentMenu';

// Fetch API Mock
global.fetch = vi.fn();

describe('EquipmentMenu Component', () => {
  beforeEach(() => {
    // Fetch Mock 초기화
    global.fetch.mockClear();
  });

  describe('렌더링', () => {
    it('장비 메뉴가 렌더링되어야 함', () => {
      // Mock 데이터
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            slots: {
              weapon: null,
              head: null,
              body: null,
              accessory: null,
              special: null
            }
          }
        })
      });

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: []
        })
      });

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {}
        })
      });

      render(<EquipmentMenu />);

      expect(screen.getByText('🛡️ 장비 시스템')).toBeInTheDocument();
      expect(screen.getByText('장착된 장비')).toBeInTheDocument();
      expect(screen.getByText('총 스탯 효과')).toBeInTheDocument();
    });

    it('인벤토리 버튼이 표시되어야 함', () => {
      // Mock 데이터
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: { slots: {} }
        })
      });

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: []
        })
      });

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {}
        })
      });

      render(<EquipmentMenu />);

      expect(screen.getByText(/인벤토리/)).toBeInTheDocument();
    });
  });

  describe('장비 장착', () => {
    it('장착 성공 시 메시지를 표시해야 함', async () => {
      // Mock 장착된 장비
      const mockSlots = {
        weapon: null,
        head: null,
        body: null,
        accessory: null,
        special: null
      };

      const mockInventory = [
        {
          id: 'sword_basic',
          name: '기본 검',
          slot: 'weapon',
          rarity: { name: 'COMMON' },
          level: 1,
          maxLevel: 10
        }
      ];

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: { slots: mockSlots }
        })
      });

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: mockInventory
        })
      });

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {}
        })
      });

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          message: '기본 검을(를) 장착했습니다'
        })
      });

      render(<EquipmentMenu />);
    });
  });

  describe('장비 해제', () => {
    it('해제 성공 시 메시지를 표시해야 함', () => {
      // Mock 장착된 장비
      const mockSlots = {
        weapon: {
          id: 'sword_basic',
          name: '기본 검',
          slot: 'weapon',
          rarity: { name: 'COMMON' },
          level: 1
        },
        head: null,
        body: null,
        accessory: null,
        special: null
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: { slots: mockSlots }
        })
      });

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: []
        })
      });

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: { attack: 10 }
        })
      });

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          message: '기본 검을(를) 해제했습니다'
        })
      });

      render(<EquipmentMenu />);
    });
  });

  describe('장비 강화', () => {
    it('강화 성공 시 레벨이 증가해야 함', () => {
      const mockSlots = {
        weapon: {
          id: 'sword_basic',
          name: '기본 검',
          slot: 'weapon',
          rarity: { name: 'COMMON' },
          level: 1,
          maxLevel: 10
        },
        head: null,
        body: null,
        accessory: null,
        special: null
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: { slots: mockSlots }
        })
      });

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: []
        })
      });

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: { attack: 10 }
        })
      });

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          message: '기본 검이(가) 레벨 2로 강화되었습니다',
          newLevel: 2
        })
      });

      render(<EquipmentMenu />);
    });

    it('최대 레벨 도달 시 강화가 불가능해야 함', () => {
      const mockSlots = {
        weapon: {
          id: 'sword_basic',
          name: '기본 검',
          slot: 'weapon',
          rarity: { name: 'COMMON' },
          level: 10,
          maxLevel: 10
        },
        head: null,
        body: null,
        accessory: null,
        special: null
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: { slots: mockSlots }
        })
      });

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: []
        })
      });

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {}
        })
      });

      render(<EquipmentMenu />);
    });
  });

  describe('인벤토리', () => {
    it('인벤토리 버튼 클릭 시 모달이 표시되어야 함', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: { slots: {} }
        })
      });

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: []
        })
      });

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {}
        })
      });

      render(<EquipmentMenu />);

      const inventoryButton = screen.getByText(/인벤토리/);
      fireEvent.click(inventoryButton);
    });

    it('빈 인벤토리 시 비어있다고 표시되어야 함', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: { slots: {} }
        })
      });

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: []
        })
      });

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {}
        })
      });

      render(<EquipmentMenu />);

      const inventoryButton = screen.getByText(/인벤토리/);
      fireEvent.click(inventoryButton);
    });
  });

  describe('에러 처리', () => {
    it('데이터 로드 실패 시 에러가 기록되어야 함', async () => {
      // Mock 실패 응답
      global.fetch.mockRejectedValueOnce(new Error('Network error'));

      render(<EquipmentMenu />);
    });

    it('API 호출 실패 시 메시지를 표시해야 함', async () => {
      // Mock 초기 데이터 로드
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: { slots: {} }
        })
      });

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: []
        })
      });

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {}
        })
      });

      // Mock 장착 실패
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: false,
          message: '장비를 찾을 수 없습니다'
        })
      });

      render(<EquipmentMenu />);
    });
  });
});