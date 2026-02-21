/**
 * AI Life Metaverse - Coin Menu Component
 *
 * 코인 관리 UI 컴포넌트
 * - 코인 잔액 확인
 * - 코인 획득/소비/전송 기록
 * - 코인 랭킹
 */

import React, { useState, useEffect } from 'react';
import './CoinMenu.css';

const CoinMenu = ({ characterId, onClose }) => {
  const [coins, setCoins] = useState(0);
  const [history, setHistory] = useState([]);
  const [ranking, setRanking] = useState([]);
  const [activeTab, setActiveTab] = useState('balance');
  const [transferForm, setTransferForm] = useState({
    targetCharacterId: '',
    amount: 0,
  });

  useEffect(() => {
    loadBalance();
    loadHistory();
    loadRanking();
  }, [characterId]);

  const loadBalance = async () => {
    try {
      const res = await fetch('http://10.76.29.91:4000/api/coin/balance');
      const data = await res.json();
      if (data.success) {
        setCoins(data.data.balance || 0);
      }
    } catch (error) {
      console.error('코인 잔액 불러오기 실패:', error);
    }
  };

  const loadHistory = async () => {
    try {
      const res = await fetch('http://10.76.29.91:4000/api/coin/history');
      const data = await res.json();
      if (data.success) {
        setHistory(data.data || []);
      }
    } catch (error) {
      console.error('코인 기록 불러오기 실패:', error);
    }
  };

  const loadRanking = async () => {
    try {
      const res = await fetch('http://10.76.29.91:4000/api/coin/ranking');
      const data = await res.json();
      if (data.success) {
        setRanking(data.data || []);
      }
    } catch (error) {
      console.error('코인 랭킹 불러오기 실패:', error);
    }
  };

  const handleTransfer = async (e) => {
    e.preventDefault();

    if (!transferForm.targetCharacterId || transferForm.amount <= 0) {
      alert('입력값을 확인해주세요');
      return;
    }

    try {
      const res = await fetch('http://10.76.29.91:4000/api/coin/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromCharacterId: characterId,
          toCharacterId: transferForm.targetCharacterId,
          amount: parseInt(transferForm.amount),
        })
      });

      const data = await res.json();
      if (data.success) {
        alert('코인 전송 성공!');
        loadBalance();
        loadHistory();
        setTransferForm({ targetCharacterId: '', amount: 0 });
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('코인 전송 실패:', error);
      alert('코인 전송에 실패했습니다');
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'earn': return '💰 획득';
      case 'spend': return '💸 소비';
      case 'transfer': return '🔄 전송';
      case 'receive': return '📥 수신';
      default: return type;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'earn': return '#2ECC71';
      case 'spend': return '#E74C3C';
      case 'transfer': return '#F39C12';
      case 'receive': return '#3498DB';
      default: return '#95A5A6';
    }
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getMedal = (rank) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `#${rank}`;
    }
  };

  return (
    <div className="coin-menu-overlay">
      <div className="coin-menu">
        {/* 헤더 */}
        <div className="coin-menu-header">
          <h2 className="coin-menu-title">💰 코인 관리</h2>
          <button className="coin-menu-close" onClick={onClose}>✕</button>
        </div>

        {/* 코인 잔액 카드 */}
        <div className="coin-balance-card">
          <div className="coin-balance-label">현재 잔액</div>
          <div className="coin-balance-amount">{coins.toLocaleString()} 💰</div>
        </div>

        {/* 탭 메뉴 */}
        <div className="coin-tabs">
          <button
            className={`coin-tab ${activeTab === 'balance' ? 'coin-tab-active' : ''}`}
            onClick={() => setActiveTab('balance')}
          >
            📊 기록
          </button>
          <button
            className={`coin-tab ${activeTab === 'transfer' ? 'coin-tab-active' : ''}`}
            onClick={() => setActiveTab('transfer')}
          >
            📤 전송
          </button>
          <button
            className={`coin-tab ${activeTab === 'ranking' ? 'coin-tab-active' : ''}`}
            onClick={() => setActiveTab('ranking')}
          >
            🏆 랭킹
          </button>
        </div>

        {/* 기록 탭 */}
        {activeTab === 'balance' && (
          <div className="coin-section">
            <h3 className="coin-section-title">최근 기록</h3>
            {history.length === 0 ? (
              <div className="coin-empty">기록이 없습니다</div>
            ) : (
              <div className="coin-list">
                {history.map((record, index) => (
                  <div key={index} className="coin-record">
                    <div className="coin-record-left">
                      <div
                        className="coin-record-type"
                        style={{ color: getTypeColor(record.type) }}
                      >
                        {getTypeLabel(record.type)}
                      </div>
                      <div className="coin-record-time">
                        {formatTimestamp(record.timestamp)}
                      </div>
                      {record.description && (
                        <div className="coin-record-description">
                          {record.description}
                        </div>
                      )}
                    </div>
                    <div className="coin-record-amount">
                      {['earn', 'receive'].includes(record.type) ? '+' : '-'}
                      {record.amount.toLocaleString()} 💰
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 전송 탭 */}
        {activeTab === 'transfer' && (
          <div className="coin-section">
            <h3 className="coin-section-title">코인 전송</h3>
            <form className="coin-transfer-form" onSubmit={handleTransfer}>
              <div className="coin-form-group">
                <label className="coin-form-label">받는 사람</label>
                <input
                  type="text"
                  className="coin-form-input"
                  placeholder="캐릭터 ID 입력"
                  value={transferForm.targetCharacterId}
                  onChange={(e) => setTransferForm({
                    ...transferForm,
                    targetCharacterId: e.target.value
                  })}
                  required
                />
              </div>

              <div className="coin-form-group">
                <label className="coin-form-label">전송 금액</label>
                <input
                  type="number"
                  className="coin-form-input"
                  min="1"
                  max={coins}
                  placeholder="전송할 코인"
                  value={transferForm.amount}
                  onChange={(e) => setTransferForm({
                    ...transferForm,
                    amount: parseInt(e.target.value) || 0
                  })}
                  required
                />
                <div className="coin-form-hint">
                  최대 전송: {coins.toLocaleString()} 코인
                </div>
              </div>

              <button
                type="submit"
                className="coin-button coin-button-primary"
                disabled={!transferForm.targetCharacterId || transferForm.amount <= 0}
              >
                전송하기
              </button>
            </form>
          </div>
        )}

        {/* 랭킹 탭 */}
        {activeTab === 'ranking' && (
          <div className="coin-section">
            <h3 className="coin-section-title">코인 랭킹</h3>
            {ranking.length === 0 ? (
              <div className="coin-empty">랭킹 정보가 없습니다</div>
            ) : (
              <div className="coin-ranking">
                {ranking.map((player, index) => (
                  <div
                    key={player.characterId}
                    className={`coin-rank-item ${
                      player.characterId === characterId ? 'coin-rank-item-me' : ''
                    }`}
                  >
                    <div className="coin-rank-position">
                      {getMedal(index + 1)}
                    </div>
                    <div className="coin-rank-info">
                      <div className="coin-rank-name">
                        {player.characterName || player.characterId}
                        {player.characterId === characterId && ' (나)'}
                      </div>
                    </div>
                    <div className="coin-rank-amount">
                      {player.balance.toLocaleString()} 💰
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CoinMenu;