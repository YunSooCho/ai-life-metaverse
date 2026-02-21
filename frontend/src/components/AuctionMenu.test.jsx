/**
 * AuctionMenu Component Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AuctionMenu from './AuctionMenu';

// Mock fetch
global.fetch = vi.fn();

describe('AuctionMenu', () => {
  let mockSocket;

  beforeEach(() => {
    mockSocket = {
      on: vi.fn(),
      off: vi.fn(),
    };

    vi.clearAllMocks();
    vi.clearAllTimers();
  });

  describe('렌더링', () => {
    it('헤더와 닫기 버튼이 렌더링되어야 함', () => {
      render(<AuctionMenu socket={mockSocket} characterId="char1" />);

      expect(screen.getByText('🔨 경매장')).toBeInTheDocument();
    });

    it('탭 버튼이 렌더링되어야 함', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: [] }),
      });
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: [] }),
      });

      render(<AuctionMenu socket={mockSocket} characterId="char1" />);

      expect(screen.getByText('📋 전체 경매')).toBeInTheDocument();
      expect(screen.getByText('➕ 경매 등록')).toBeInTheDocument();
    });

    it('활성 경매가 없을 때 빈 상태 메시지가 표시되어야 함', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: [] }),
      });
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: [] }),
      });

      render(<AuctionMenu socket={mockSocket} characterId="char1" />);

      await waitFor(() => {
        expect(screen.getByText('활성 경매가 없습니다')).toBeInTheDocument();
      });
    });

    it('내 경매가 없을 때 빈 상태 메시지가 표시되어야 함', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: [] }),
      });
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: [] }),
      });

      render(<AuctionMenu socket={mockSocket} characterId="char1" />);

      await waitFor(() => {
        expect(screen.getByText('등록한 경매가 없습니다')).toBeInTheDocument();
      });
    });
  });

  describe('탭 전환', () => {
    it('경매 등록 탭 클릭 시 등록 폼이 표시되어야 함', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: [] }),
      });
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: [] }),
      });

      render(<AuctionMenu socket={mockSocket} characterId="char1" />);

      const registerTab = screen.getByText('➕ 경매 등록');
      fireEvent.click(registerTab);

      expect(screen.getByText('새 경매 등록')).toBeInTheDocument();
    });

    it('전체 경매 탭 클릭시 경매 목록이 표시되어야 함', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: [] }),
      });
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: [] }),
      });

      render(<AuctionMenu socket={mockSocket} characterId="char1" />);

      const listTab = screen.getByText('📋 전체 경매');
      fireEvent.click(listTab);

      expect(screen.getByText('활성 경매')).toBeInTheDocument();
    });
  });

  describe('경매 등록', () => {
    it('경매 등록 폼 제출 시 등록 API 호출', async () => {
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
        json: async () => ({ success: true, message: '경매 등록 성공' }),
      });

      render(<AuctionMenu socket={mockSocket} characterId="char1" />);

      const registerTab = screen.getByText('➕ 경매 등록');
      fireEvent.click(registerTab);

      const itemIdInput = screen.getByPlaceholderText('item_001');
      const itemNameInput = screen.getByPlaceholderText('전설의 검');
      const submitButton = screen.getByText('경매 등록');

      fireEvent.change(itemIdInput, { target: { value: 'item_001' } });
      fireEvent.change(itemNameInput, { target: { value: '전설의 검' } });
      fireEvent.click(submitButton);

      expect(fetch).toHaveBeenCalledWith(
        'http://10.76.29.91:4000/api/auction/register',
        expect.objectContaining({
          method: 'POST',
        })
      );
    });
  });

  describe('활성 경매', () => {
    it('활성 경매가 렌더링되어야 함', async () => {
      const mockAuctions = [
        {
          auctionId: 'auction1',
          itemName: '전설의 검',
          sellerCharacterId: 'char2',
          sellerCharacterName: 'Player2',
          startingPrice: 100,
          currentBid: 150,
          minBidIncrement: 10,
          endTime: new Date(Date.now() + 86400000).toISOString(),
        },
      ];

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: mockAuctions }),
      });
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: [] }),
      });

      render(<AuctionMenu socket={mockSocket} characterId="char1" />);

      await waitFor(() => {
        expect(screen.getByText('전설의 검')).toBeInTheDocument();
        expect(screen.getByText(/Player2|char2/i)).toBeInTheDocument();
        expect(screen.getByText(/150/)).toBeInTheDocument();
      });
    });
  });

  describe('입찰', () => {
    it('입찰 버튼 클릭 시 입찰 API 호출', async () => {
      const mockAuctions = [
        {
          auctionId: 'auction1',
          itemName: '전설의 검',
          sellerCharacterId: 'char2',
          startingPrice: 100,
          currentBid: 150,
          minBidIncrement: 10,
        },
      ];

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: mockAuctions }),
      });
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: [] }),
      });
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, message: '입찰 성공!' }),
      });

      render(<AuctionMenu socket={mockSocket} characterId="char1" />);

      await waitFor(() => {
        const bidInput = document.getElementById('bid-auction1');
        const bidButton = screen.getByText('입찰');

        if (bidInput) {
          fireEvent.change(bidInput, { target: { value: '200' } });
        }
        fireEvent.click(bidButton);
      });

      expect(fetch).toHaveBeenCalledWith(
        'http://10.76.29.91:4000/api/auction/bid',
        expect.objectContaining({
          method: 'POST',
        })
      );
    });
  });

  describe('경매 취소', () => {
    it('취소 버튼 클릭 시 취소 확인 후 취소 API 호출', async () => {
      const mockMyAuctions = [
        {
          auctionId: 'auction1',
          itemName: '내 아이템',
          sellerCharacterId: 'char1',
          startingPrice: 100,
          currentBid: 150,
          status: 'active',
        },
      ];

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: [] }),
      });
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: mockMyAuctions }),
      });
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, message: '경매 취소 성공!' }),
      });

      window.confirm = vi.fn(() => true);

      render(<AuctionMenu socket={mockSocket} characterId="char1" />);

      await waitFor(async () => {
        const cancelButton = await screen.findByText('경매 취소');
        fireEvent.click(cancelButton);
      });

      expect(window.confirm).toHaveBeenCalledWith('이 경매를 취소하시겠습니까?');
      expect(fetch).toHaveBeenCalledWith(
        'http://10.76.29.91:4000/api/auction/cancel',
        expect.objectContaining({
          method: 'POST',
        })
      );
    });
  });

  describe('수수료 계산', () => {
    it('수수료가 올바르게 계산되어야 함', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: [] }),
      });
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: [] }),
      });

      render(<AuctionMenu socket={mockSocket} characterId="char1" />);

      const registerTab = screen.getByText('➕ 경매 등록');
      fireEvent.click(registerTab);

      expect(screen.getByText('5 코인 (5%)')).toBeInTheDocument();
    });
  });

  describe('Socket 이벤트', () => {
    it('경매 생성 이벤트를 수신하면 경매가 목록에 추가되어야 함', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: [] }),
      });
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: [] }),
      });

      render(<AuctionMenu socket={mockSocket} characterId="char1" />);

      const newAuction = {
        auctionId: 'auction2',
        itemName: '새 아이템',
        sellerCharacterId: 'char3',
        startingPrice: 200,
        currentBid: 200,
        endTime: new Date(Date.now() + 86400000).toISOString(),
      };

      const auctionCreatedCallback = mockSocket.on.mock.calls.find(
        (call) => call[0] === 'auctionCreated'
      )[1];

      auctionCreatedCallback(newAuction);

      await waitFor(() => {
        expect(screen.getByText('새 아이템')).toBeInTheDocument();
      });
    });

    it('경매 종료 이벤트를 수신하면 경매가 목록에서 제거되어야 함', async () => {
      const mockAuctions = [
        {
          auctionId: 'auction1',
          itemName: '종료될 아이템',
          sellerCharacterId: 'char2',
          startingPrice: 100,
          endTime: new Date(Date.now() + 86400000).toISOString(),
        },
      ];

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: mockAuctions }),
      });
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: [] }),
      });

      render(<AuctionMenu socket={mockSocket} characterId="char1" />);

      const auctionEndedCallback = mockSocket.on.mock.calls.find(
        (call) => call[0] === 'auctionEnded'
      )[1];

      auctionEndedCallback('auction1');

      await waitFor(() => {
        expect(screen.queryByText('종료될 아이템')).not.toBeInTheDocument();
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

      render(<AuctionMenu socket={mockSocket} characterId="char1" onClose={onClose} />);

      const closeButton = screen.getByText('✕');
      fireEvent.click(closeButton);

      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });
});