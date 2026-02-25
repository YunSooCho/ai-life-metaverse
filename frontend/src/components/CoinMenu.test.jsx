/**
 * CoinMenu Component Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CoinMenu from './CoinMenu';

// Mock fetch
global.fetch = vi.fn();

describe('CoinMenu', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
  });

  describe('렌더링', () => {
    it('헤더와 닫기 버튼이 렌더링되어야 함', () => {
      render(<CoinMenu characterId="char1" />);

      expect(screen.getByText('💰 코인 관리')).toBeInTheDocument();
    });

    it('코인 잔액이 표시되어야 함', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: { balance: 1000 } }),
      });
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: [] }),
      });
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: [] }),
      });

      render(<CoinMenu characterId="char1" />);

      await waitFor(() => {
        expect(screen.getByText('1,000 💰')).toBeInTheDocument();
      });
    });

    it('탭 버튼이 렌더링되어야 함', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: { balance: 1000 } }),
      });
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: [] }),
      });
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: [] }),
      });

      render(<CoinMenu characterId="char1" />);

      expect(screen.getByText('📊 기록')).toBeInTheDocument();
      expect(screen.getByText('📤 전송')).toBeInTheDocument();
      expect(screen.getByText('🏆 랭킹')).toBeInTheDocument();
    });

    it('기록이 없을 때 빈 상태 메시지가 표시되어야 함', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: { balance: 1000 } }),
      });
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: [] }),
      });
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: [] }),
      });

      render(<CoinMenu characterId="char1" />);

      await waitFor(() => {
        expect(screen.getByText('기록이 없습니다')).toBeInTheDocument();
      });
    });
  });

  describe('탭 전환', () => {
    it('기록 탭 클릭 시 기록이 표시되어야 함', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: { balance: 1000 } }),
      });
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: [] }),
      });
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: [] }),
      });

      render(<CoinMenu characterId="char1" />);

      const historyTab = screen.getByText('📊 기록');
      fireEvent.click(historyTab);

      expect(screen.getByText('최근 기록')).toBeInTheDocument();
    });

    it('전송 탭 클릭 시 전송 폼이 표시되어야 함', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: { balance: 1000 } }),
      });
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: [] }),
      });
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: [] }),
      });

      render(<CoinMenu characterId="char1" />);

      const transferTab = screen.getByText('📤 전송');
      fireEvent.click(transferTab);

      expect(screen.getByText('코인 전송')).toBeInTheDocument();
    });

    it('랭킹 탭 클릭 시 랭킹이 표시되어야 함', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: { balance: 1000 } }),
      });
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: [] }),
      });
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: [] }),
      });

      render(<CoinMenu characterId="char1" />);

      const rankingTab = screen.getByText('🏆 랭킹');
      fireEvent.click(rankingTab);

      expect(screen.getByText('코인 랭킹')).toBeInTheDocument();
    });
  });

  describe('코인 기록', () => {
    it('기록이 렌더링되어야 함', async () => {
      const mockHistory = [
        {
          type: 'earn',
          amount: 100,
          timestamp: new Date('2026-02-21T10:00:00'),
          description: '퀘스트 완료',
        },
        {
          type: 'spend',
          amount: 50,
          timestamp: new Date('2026-02-21T11:00:00'),
          description: '아이템 구매',
        },
      ];

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: { balance: 1050 } }),
      });
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: mockHistory }),
      });
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: [] }),
      });

      render(<CoinMenu characterId="char1" />);

      await waitFor(() => {
        expect(screen.getByText('💰 획득')).toBeInTheDocument();
        expect(screen.getByText('💸 소비')).toBeInTheDocument();
        expect(screen.getByText('퀘스트 완료')).toBeInTheDocument();
        expect(screen.getByText('아이템 구매')).toBeInTheDocument();
      });
    });
  });

  describe('코인 전송', () => {
    it('전송 폼 제출 시 전송 API 호출', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: { balance: 1000 } }),
      });
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
        json: async () => ({ success: true, message: '코인 전송 성공!' }),
      });

      render(<CoinMenu characterId="char1" />);

      const transferTab = screen.getByText('📤 전송');
      fireEvent.click(transferTab);

      const targetInput = screen.getByPlaceholderText('캐릭터 ID 입력');
      const submitButton = screen.getByText('전송하기');

      fireEvent.change(targetInput, { target: { value: 'char2' } });

      const amountInput = screen.getByPlaceholderText('전송할 코인');
      fireEvent.change(amountInput, { target: { value: '100' } });

      fireEvent.click(submitButton);

      expect(fetch).toHaveBeenCalledWith(
        'http://10.76.29.91:4000/api/coin/transfer',
        expect.objectContaining({
          method: 'POST',
        })
      );
    });
  });

  describe('랭킹', () => {
    it('랭킹이 렌더링되어야 함', async () => {
      const mockRanking = [
        { characterId: 'char1', characterName: 'Player1', balance: 2000 },
        { characterId: 'char2', characterName: 'Player2', balance: 1500 },
        { characterId: 'char3', characterName: 'Player3', balance: 1000 },
      ];

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: { balance: 2000 } }),
      });
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: [] }),
      });
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: mockRanking }),
      });

      render(<CoinMenu characterId="char1" />);

      const rankingTab = screen.getByText('🏆 랭킹');
      fireEvent.click(rankingTab);

      await waitFor(() => {
        expect(screen.getByText('Player1 (나)')).toBeInTheDocument();
        expect(screen.getByText('Player2')).toBeInTheDocument();
        expect(screen.getByText('Player3')).toBeInTheDocument();
        expect(screen.getByText('2,000 💰')).toBeInTheDocument();
      });
    });

    it('자신의 랭킹에 하이라이트가 표시되어야 함', async () => {
      const mockRanking = [
        { characterId: 'char1', characterName: 'Player1', balance: 2000 },
        { characterId: 'char2', characterName: 'Player2', balance: 1500 },
      ];

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: { balance: 2000 } }),
      });
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: [] }),
      });
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: mockRanking }),
      });

      render(<CoinMenu characterId="char1" />);

      const rankingTab = screen.getByText('🏆 랭킹');
      fireEvent.click(rankingTab);

      await waitFor(() => {
        expect(screen.getByText('Player1 (나)')).toBeInTheDocument();
      });
    });
  });

  describe('메달 표시', () => {
    it('상위 3명에게 메달이 표시되어야 함', async () => {
      const mockRanking = [
        { characterId: 'char1', characterName: 'Player1', balance: 2000 },
        { characterId: 'char2', characterName: 'Player2', balance: 1500 },
        { characterId: 'char3', characterName: 'Player3', balance: 1000 },
        { characterId: 'char4', characterName: 'Player4', balance: 500 },
      ];

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: { balance: 2000 } }),
      });
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: [] }),
      });
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: mockRanking }),
      });

      render(<CoinMenu characterId="char1" />);

      const rankingTab = screen.getByText('🏆 랭킹');
      fireEvent.click(rankingTab);

      await waitFor(() => {
        expect(screen.getByText('🥇')).toBeInTheDocument();
        expect(screen.getByText('🥈')).toBeInTheDocument();
        expect(screen.getByText('🥉')).toBeInTheDocument();
        expect(screen.getByText('#4')).toBeInTheDocument();
      });
    });
  });

  describe('닫기 기능', () => {
    it('닫기 버튼 클릭 시 onClose 호출', async () => {
      const onClose = vi.fn();

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: { balance: 1000 } }),
      });
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: [] }),
      });
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: [] }),
      });

      render(<CoinMenu characterId="char1" onClose={onClose} />);

      const closeButton = screen.getByText('✕');
      fireEvent.click(closeButton);

      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });
});