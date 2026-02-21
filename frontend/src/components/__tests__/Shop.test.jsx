/**
 * AI Life Metaverse - Shop Component Tests
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import Shop from '../Shop';

// Mock fetch
global.fetch = vi.fn();

describe('Shop Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('상점 목록을 로드하고 표시합니다', async () => {
    const mockShops = [
      {
        shopId: 'general',
        name: '일반 상점',
        description: '기본 아이템 판매',
        items: [
          { itemId: 'potion_hp', name: 'HP 포션', buyPrice: 50, sellPrice: 25, stock: 100 }
        ]
      }
    ];

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: mockShops })
    });

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: { balance: 1000 } })
    });

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: [] })
    });

    render(<Shop onClose={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText('🏪 상점')).toBeInTheDocument();
    });

    expect(screen.getAllByText('일반 상점').length).toBeGreaterThan(0);
  });

  it('아이템 구매를 확인 메시지와 함께 요청합니다', async () => {
    const mockShops = [
      {
        shopId: 'general',
        name: '일반 상점',
        description: '기본 아이템 판매',
        items: [
          { itemId: 'potion_hp', name: 'HP 포션', buyPrice: 50, sellPrice: 25, stock: 100 }
        ]
      }
    ];

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: mockShops })
    });

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: { balance: 1000 } })
    });

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: [] })
    });

    render(<Shop onClose={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText('구매')).toBeInTheDocument();
    });

    // 구매 버튼 클릭 (confirm 모킹)
    const confirmMock = vi.spyOn(global, 'confirm').mockReturnValue(false);
    const alertMock = vi.spyOn(global, 'alert').mockImplementation(() => {});

    const buyButtons = screen.getAllByText('구매');
    fireEvent.click(buyButtons[0]);

    expect(confirmMock).toHaveBeenCalledWith('50 코인으로 이 아이템을 구매하시겠습니까?');

    confirmMock.mockRestore();
    alertMock.mockRestore();
  });

  it('아이템 판매를 확인 메시지와 함께 요청합니다', async () => {
    const mockShops = [
      {
        shopId: 'general',
        name: '일반 상점',
        description: '기본 아이템 판매',
        items: []
      }
    ];

    const mockInventory = [
      { id: 'item_1', name: '테스트 아이템', quantity: 1, price: 100 }
    ];

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: mockShops })
    });

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: { balance: 1000 } })
    });

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: mockInventory })
    });

    render(<Shop onClose={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText('테스트 아이템')).toBeInTheDocument();
    });

    const confirmMock = vi.spyOn(global, 'confirm').mockReturnValue(false);
    const alertMock = vi.spyOn(global, 'alert').mockImplementation(() => {});

    const sellButtons = screen.getAllByText('판매');
    fireEvent.click(sellButtons[sellButtons.length - 1]); // 인벤토리 판매 버튼

    expect(confirmMock).toHaveBeenCalled();

    confirmMock.mockRestore();
    alertMock.mockRestore();
  });

  it('코인 잔액을 표시합니다', async () => {
    const mockShops = [{
      shopId: 'general',
      name: '일반 상점',
      description: '기본 아이템 판매',
      items: []
    }];

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: mockShops })
    });

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: { balance: 2500 } })
    });

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: [] })
    });

    render(<Shop onClose={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText('💰 2500 코인')).toBeInTheDocument();
    });
  });

  it('재고가 0인 아이템은 구매 버튼이 비활성화됩니다', async () => {
    const mockShops = [{
      shopId: 'general',
      name: '일반 상점',
      description: '기본 아이템 판매',
      items: [
        { itemId: 'potion_hp', name: 'HP 포션', buyPrice: 50, sellPrice: 25, stock: 0 }
      ]
    }];

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: mockShops })
    });

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: { balance: 1000 } })
    });

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: [] })
    });

    render(<Shop onClose={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText('재고: 0')).toBeInTheDocument();
    });

    const buyButton = screen.getByText('구매');
    expect(buyButton).toBeDisabled();
  });

  it('인벤토리가 비어있을 때 메시지를 표시합니다', async () => {
    const mockShops = [{
      shopId: 'general',
      name: '일반 상점',
      description: '기본 아이템 판매',
      items: []
    }];

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: mockShops })
    });

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: { balance: 1000 } })
    });

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: [] })
    });

    render(<Shop onClose={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText('인벤토리가 비어있습니다')).toBeInTheDocument();
    });
  });

  it('여러 상점을 탭으로 선택할 수 있습니다', async () => {
    const mockShops = [
      {
        shopId: 'general',
        name: '일반 상점',
        description: '기본 아이템 판매',
        items: []
      },
      {
        shopId: 'weapon',
        name: '무기 상점',
        description: '무기와 방어구 판매',
        items: []
      }
    ];

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: mockShops })
    });

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: { balance: 1000 } })
    });

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: [] })
    });

    render(<Shop onClose={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText('일반 상점')).toBeInTheDocument();
      expect(screen.getByText('무기 상점')).toBeInTheDocument();
    });

    // 무기 상점 클릭
    const weaponShopButton = screen.getByText('무기 상점');
    fireEvent.click(weaponShopButton);

    await waitFor(() => {
      expect(screen.getByText('무기 상점')).toBeInTheDocument();
    });
  });
});