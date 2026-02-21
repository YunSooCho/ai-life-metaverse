/**
 * TradeMenu Component Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TradeMenu from './TradeMenu';

// Mock fetch
global.fetch = vi.fn();

describe('TradeMenu', () => {
  let mockSocket;

  beforeEach(() => {
    mockSocket = {
      on: vi.fn(),
      off: vi.fn(),
    };

    vi.clearAllMocks();
    vi.clearAllTimers();

    // fetch mock 초기화 (기본 응답 설정)
    fetch.mockReset();
    fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, data: [] }),
    });
  });

  describe('렌더링', () => {
    it('헤더와 닫기 버튼이 렌더링되어야 함', () => {
      render(<TradeMenu socket={mockSocket} characterId="char1" />);

      expect(screen.getByText('🤝 거래 시스템')).toBeInTheDocument();
    });

    it('코인 잔액이 표시되어야 함', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: { balance: 100 } }),
      });

      render(<TradeMenu socket={mockSocket} characterId="char1" />);

      await waitFor(() => {
        expect(screen.getByText(/💰 현재 코인:/)).toBeInTheDocument();
      });
    });

    it('대기 중인 요청이 없을 때 빈 상태 메시지가 표시되어야 함', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: [] }),
      });
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: [] }),
      });
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: { balance: 100 } }),
      });

      render(<TradeMenu socket={mockSocket} characterId="char1" />);

      await waitFor(() => {
        expect(screen.getByText('대기 중인 요청이 없습니다')).toBeInTheDocument();
      });
    });

    it('활성 거래가 없을 때 빈 상태 메시지가 표시되어야 함', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: [] }),
      });
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: [] }),
      });
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: { balance: 100 } }),
      });

      render(<TradeMenu socket={mockSocket} characterId="char1" />);

      await waitFor(() => {
        expect(screen.getByText('활성 거래가 없습니다')).toBeInTheDocument();
      });
    });
  });

  describe('거래 요청', () => {
    it('대기 중인 요청이 렌더링되어야 함', async () => {
      const mockRequests = [
        {
          tradeId: 'trade1',
          fromCharacterId: 'char2',
          fromCharacterName: 'Player2',
          offerItems: [{ name: 'Sword', quantity: 1 }],
          offerCoins: 50,
        },
      ];

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: [] }),
      });
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: mockRequests }),
      });
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: { balance: 100 } }),
      });

      render(<TradeMenu socket={mockSocket} characterId="char1" />);

      await waitFor(() => {
        expect(screen.getByText('Player2')).toBeInTheDocument();
        expect(screen.getByText('Sword x1')).toBeInTheDocument();
        expect(screen.getByText('50 코인')).toBeInTheDocument();
      });
    });
  });

  describe('거래 수락', () => {
    it('수락 버튼 클릭 시 거래 수락 API 호출', async () => {
      const mockRequests = [
        {
          tradeId: 'trade1',
          fromCharacterId: 'char2',
          offerItems: [{ name: 'Sword', quantity: 1 }],
          offerCoins: 50,
        },
      ];

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: [] }),
      });
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: mockRequests }),
      });
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: { balance: 100 } }),
      });
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, message: '거래 수락 성공' }),
      });

      render(<TradeMenu socket={mockSocket} characterId="char1" />);

      await waitFor(() => {
        const acceptButton = screen.getByText('수락');
        fireEvent.click(acceptButton);
      });

      expect(fetch).toHaveBeenCalledWith(
        'http://10.76.29.91:4000/api/trade/accept',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ tradeId: 'trade1' }),
        })
      );
    });
  });

  describe('거래 거절', () => {
    it('거절 버튼 클릭 시 거절 확인 후 거절 API 호출', async () => {
      const mockRequests = [
        {
          tradeId: 'trade1',
          fromCharacterId: 'char2',
          offerItems: [{ name: 'Sword', quantity: 1 }],
          offerCoins: 50,
        },
      ];

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: [] }),
      });
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: mockRequests }),
      });
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: { balance: 100 } }),
      });
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, message: '거래 거절 성공' }),
      });

      window.confirm = vi.fn(() => true);

      render(<TradeMenu socket={mockSocket} characterId="char1" />);

      await waitFor(() => {
        const rejectButton = screen.getByText('거절');
        fireEvent.click(rejectButton);
      });

      expect(window.confirm).toHaveBeenCalledWith('이 거래 요청을 거절하시겠습니까?');
      expect(fetch).toHaveBeenCalledWith(
        'http://10.76.29.91:4000/api/trade/reject',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ tradeId: 'trade1' }),
        })
      );
    });
  });

  describe('활성 거래', () => {
    it('활성 거래가 렌더링되어야 함', async () => {
      const mockTrades = [
        {
          tradeId: 'trade1',
          fromCharacterId: 'char2',
          toCharacterId: 'char1',
          fromItems: [{ name: 'Sword', quantity: 1 }],
          toItems: [{ name: 'Potion', quantity: 2 }],
          status: 'accepted',
        },
      ];

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: mockTrades }),
      });
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: [] }),
      });
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: { balance: 100 } }),
      });

      render(<TradeMenu socket={mockSocket} characterId="char1" />);

      await waitFor(() => {
        expect(screen.getByText(/char2/i)).toBeInTheDocument();
        expect(screen.getByText(/char1/i)).toBeInTheDocument();
        expect(screen.getByText('Sword x1')).toBeInTheDocument();
        expect(screen.getByText('Potion x2')).toBeInTheDocument();
        expect(screen.getByText('✅ 수락됨')).toBeInTheDocument();
      });
    });
  });

  describe('거래 완료', () => {
    it('완료 버튼 클릭 시 완료 API 호출', async () => {
      const mockTrades = [
        {
          tradeId: 'trade1',
          fromCharacterId: 'char2',
          toCharacterId: 'char1',
          fromItems: [{ name: 'Sword', quantity: 1 }],
          status: 'accepted',
        },
      ];

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: mockTrades }),
      });
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: [] }),
      });
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: { balance: 100 } }),
      });
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, message: '거래 완료 성공' }),
      });

      window.confirm = vi.fn(() => true);

      render(<TradeMenu socket={mockSocket} characterId="char1" />);

      await waitFor(() => {
        const completeButton = screen.getByText('완료');
        fireEvent.click(completeButton);
      });

      expect(window.confirm).toHaveBeenCalledWith('이 거래를 완료하시겠습니까?');
      expect(fetch).toHaveBeenCalledWith(
        'http://10.76.29.91:4000/api/trade/complete',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ tradeId: 'trade1' }),
        })
      );
    });
  });

  describe('거래 취소', () => {
    it('취소 버튼 클릭 시 취소 확인 후 취소 API 호출', async () => {
      const mockTrades = [
        {
          tradeId: 'trade1',
          fromCharacterId: 'char2',
          toCharacterId: 'char1',
          fromItems: [{ name: 'Sword', quantity: 1 }],
          status: 'pending',
        },
      ];

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: mockTrades }),
      });
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: [] }),
      });
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: { balance: 100 } }),
      });
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, message: '거래 취소 성공' }),
      });

      window.confirm = vi.fn(() => true);

      render(<TradeMenu socket={mockSocket} characterId="char1" />);

      await waitFor(() => {
        const cancelButton = screen.getByText('취소');
        fireEvent.click(cancelButton);
      });

      expect(window.confirm).toHaveBeenCalledWith('이 거래를 취소하시겠습니까?');
      expect(fetch).toHaveBeenCalledWith(
        'http://10.76.29.91:4000/api/trade/cancel',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ tradeId: 'trade1' }),
        })
      );
    });
  });

  describe('상태 라벨', () => {
    it('각 상태에 맞는 라벨이 표시되어야 함', async () => {
      const mockTrades = [
        { tradeId: 't1', status: 'pending', fromCharacterId: 'char2', toCharacterId: 'char1' },
        { tradeId: 't2', status: 'accepted', fromCharacterId: 'char2', toCharacterId: 'char1' },
        { tradeId: 't3', status: 'rejected', fromCharacterId: 'char2', toCharacterId: 'char1' },
        { tradeId: 't4', status: 'cancelled', fromCharacterId: 'char2', toCharacterId: 'char1' },
        { tradeId: 't5', status: 'completed', fromCharacterId: 'char2', toCharacterId: 'char1' },
      ];

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: mockTrades }),
      });
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: [] }),
      });
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: { balance: 100 } }),
      });

      render(<TradeMenu socket={mockSocket} characterId="char1" />);

      await waitFor(() => {
        expect(screen.getByText('⏳ 대기중')).toBeInTheDocument();
        expect(screen.getByText('✅ 수락됨')).toBeInTheDocument();
        expect(screen.getByText('❌ 거절됨')).toBeInTheDocument();
        expect(screen.getByText('🚫 취소됨')).toBeInTheDocument();
        expect(screen.getByText('✨ 완료됨')).toBeInTheDocument();
      });
    });
  });

  describe('Socket 이벤트', () => {
    it('거래 요청 이벤트를 수신하면 요청 목록에 추가해야 함', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: [] }),
      });
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: [] }),
      });
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: { balance: 100 } }),
      });

      render(<TradeMenu socket={mockSocket} characterId="char1" />);

      const newRequest = {
        tradeId: 'trade2',
        fromCharacterId: 'char3',
        offerItems: [{ name: 'Shield', quantity: 1 }],
        offerCoins: 30,
      };

      const tradeRequestCallback = mockSocket.on.mock.calls.find(
        (call) => call[0] === 'tradeRequest'
      )[1];

      tradeRequestCallback(newRequest);

      await waitFor(() => {
        expect(screen.getByText('Shield x1')).toBeInTheDocument();
        expect(screen.getByText('30 코인')).toBeInTheDocument();
      });
    });

    it('거래 완료 이벤트를 수신하면 거래가 목록에서 제거되어야 함', async () => {
      const mockTrades = [
        { tradeId: 'trade1', status: 'accepted', fromCharacterId: 'char2', toCharacterId: 'char1' },
      ];

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: mockTrades }),
      });
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: [] }),
      });
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: { balance: 100 } }),
      });

      render(<TradeMenu socket={mockSocket} characterId="char1" />);

      const tradeCompletedCallback = mockSocket.on.mock.calls.find(
        (call) => call[0] === 'tradeCompleted'
      )[1];

      tradeCompletedCallback('trade1');

      await waitFor(() => {
        expect(screen.queryByText(/char2/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('닫기 기능', () => {
    it('닫기 버튼 클릭 시 onClose 호출', async () => {
      const onClose = vi.fn();

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: [] }),
      });
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: [] }),
      });
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: { balance: 100 } }),
      });

      render(<TradeMenu socket={mockSocket} characterId="char1" onClose={onClose} />);

      const closeButton = screen.getByText('✕');
      fireEvent.click(closeButton);

      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });
});