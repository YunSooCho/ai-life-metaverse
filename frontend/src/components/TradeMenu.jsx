/**
 * AI Life Metaverse - Trade Menu Component
 *
 * 플레이어 간 아이템 거래 UI 컴포넌트
 * - 거래 요청/수락/거절/취소/완료
 * - 아이템 교환 확인
 */

import React, { useState, useEffect } from 'react';
import './TradeMenu.css';

const TradeMenu = ({ socket, characterId, onClose }) => {
  const [activeTrades, setActiveTrades] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [coins, setCoins] = useState(0);

  useEffect(() => {
    loadActiveTrades();
    loadPendingRequests();
    loadCoins();

    // Socket 이벤트 리스너
    socket.on('tradeRequest', handleTradeRequest);
    socket.on('tradeUpdated', handleTradeUpdated);
    socket.on('tradeCompleted', handleTradeCompleted);
    socket.on('tradeCancelled', handleTradeCancelled);

    return () => {
      socket.off('tradeRequest', handleTradeRequest);
      socket.off('tradeUpdated', handleTradeUpdated);
      socket.off('tradeCompleted', handleTradeCompleted);
      socket.off('tradeCancelled', handleTradeCancelled);
    };
  }, [socket, characterId]);

  const loadActiveTrades = async () => {
    try {
      const res = await fetch('http://10.76.29.91:4000/api/trade/list');
      const data = await res.json();
      if (data.success) {
        setActiveTrades(data.data || []);
      } else {
        setActiveTrades([]); // API 실패 시 빈 배열로 설정
      }
    } catch (error) {
      console.error('활성 거래 불러오기 실패:', error);
      setActiveTrades([]); // 에러 발생 시 빈 배열로 설정
    }
  };

  const loadPendingRequests = async () => {
    try {
      const res = await fetch('http://10.76.29.91:4000/api/trade/requests');
      const data = await res.json();
      if (data.success) {
        setPendingRequests(data.data || []);
      } else {
        setPendingRequests([]); // API 실패 시 빈 배열로 설정
      }
    } catch (error) {
      console.error('거래 요청 불러오기 실패:', error);
      setPendingRequests([]); // 에러 발생 시 빈 배열로 설정
    }
  };

  const loadCoins = async () => {
    try {
      const res = await fetch('http://10.76.29.91:4000/api/coin/balance');
      const data = await res.json();
      if (data.success) {
        setCoins(data.data.balance || 0);
      } else {
        setCoins(0); // API 실패 시 0으로 설정
      }
    } catch (error) {
      console.error('코인 잔액 불러오기 실패:', error);
      setCoins(0); // 에러 발생 시 0으로 설정
    }
  };

  const handleTradeRequest = (request) => {
    setPendingRequests(prev => [...prev, request]);
  };

  const handleTradeUpdated = (trade) => {
    setActiveTrades(prev => {
      const index = prev.findIndex(t => t.tradeId === trade.tradeId);
      if (index >= 0) {
        const newTrades = [...prev];
        newTrades[index] = trade;
        return newTrades;
      }
      return [...prev, trade];
    });
  };

  const handleTradeCompleted = (tradeId) => {
    setActiveTrades(prev => prev.filter(t => t.tradeId !== tradeId));
    loadCoins();
    alert('거래가 완료되었습니다!');
  };

  const handleTradeCancelled = (tradeId) => {
    setActiveTrades(prev => prev.filter(t => t.tradeId !== tradeId));
    setPendingRequests(prev => prev.filter(r => r.tradeId !== tradeId));
  };

  const handleAcceptTrade = async (tradeId) => {
    try {
      const res = await fetch('http://10.76.29.91:4000/api/trade/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tradeId })
      });

      const data = await res.json();
      if (data.success) {
        loadActiveTrades();
        loadPendingRequests();
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('거래 수락 실패:', error);
      alert('거래 수락에 실패했습니다');
    }
  };

  const handleRejectTrade = async (tradeId) => {
    if (confirm('이 거래 요청을 거절하시겠습니까?')) {
      try {
        const res = await fetch('http://10.76.29.91:4000/api/trade/reject', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tradeId })
        });

        const data = await res.json();
        if (data.success) {
          loadPendingRequests();
        } else {
          alert(data.message);
        }
      } catch (error) {
        console.error('거래 거절 실패:', error);
        alert('거래 거절에 실패했습니다');
      }
    }
  };

  const handleCancelTrade = async (tradeId) => {
    if (confirm('이 거래를 취소하시겠습니까?')) {
      try {
        const res = await fetch('http://10.76.29.91:4000/api/trade/cancel', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tradeId })
        });

        const data = await res.json();
        if (data.success) {
          loadActiveTrades();
          loadPendingRequests();
        } else {
          alert(data.message);
        }
      } catch (error) {
        console.error('거래 취소 실패:', error);
        alert('거래 취소에 실패했습니다');
      }
    }
  };

  const handleCompleteTrade = async (tradeId) => {
    if (confirm('이 거래를 완료하시겠습니까?')) {
      try {
        const res = await fetch('http://10.76.29.91:4000/api/trade/complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tradeId })
        });

        const data = await res.json();
        if (data.success) {
          loadActiveTrades();
          loadCoins();
        } else {
          alert(data.message);
        }
      } catch (error) {
        console.error('거래 완료 실패:', error);
        alert('거래 완료에 실패했습니다');
      }
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending': return '⏳ 대기중';
      case 'accepted': return '✅ 수락됨';
      case 'rejected': return '❌ 거절됨';
      case 'cancelled': return '🚫 취소됨';
      case 'completed': return '✨ 완료됨';
      default: return status;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#F39C12';
      case 'accepted': return '#2ECC71';
      case 'rejected': return '#E74C3C';
      case 'cancelled': return '#95A5A6';
      case 'completed': return '#3498DB';
      default: return '#ECF0F1';
    }
  };

  return (
    <div className="trade-menu-overlay">
      <div className="trade-menu">
        {/* 헤더 */}
        <div className="trade-menu-header">
          <h2 className="trade-menu-title">🤝 거래 시스템</h2>
          <button className="trade-menu-close" onClick={onClose}>✕</button>
        </div>

        {/* 코인 잔액 */}
        <div className="coin-balance">
          💰 현재 코인: {coins}
        </div>

        {/* 대기 중인 거래 요청 */}
        <div className="trade-section">
          <h3 className="trade-section-title">📥 대기 중인 요청</h3>
          {!Array.isArray(pendingRequests) || pendingRequests.length === 0 ? (
            <div className="trade-empty">대기 중인 요청이 없습니다</div>
          ) : (
            <div className="trade-list">
              {pendingRequests.map(request => (
                <div key={request.tradeId} className="trade-item">
                  <div className="trade-item-info">
                    <div className="trade-item-player">
                      {request.fromCharacterName || request.fromCharacterId}
                    </div>
                    <div className="trade-item-items">
                      {request.offerItems?.map((item, idx) => (
                        <span key={idx} className="trade-item-tag">
                          {item.name} x{item.quantity}
                        </span>
                      ))}
                      <span className="trade-item-tag trade-item-coins">
                        {request.offerCoins} 코인
                      </span>
                    </div>
                  </div>
                  <div className="trade-item-actions">
                    <button
                      className="trade-button trade-button-accept"
                      onClick={() => handleAcceptTrade(request.tradeId)}
                    >
                      수락
                    </button>
                    <button
                      className="trade-button trade-button-reject"
                      onClick={() => handleRejectTrade(request.tradeId)}
                    >
                      거절
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 활성 거래 */}
        <div className="trade-section">
          <h3 className="trade-section-title">⚡ 활성 거래</h3>
          {!Array.isArray(activeTrades) || activeTrades.length === 0 ? (
            <div className="trade-empty">활성 거래가 없습니다</div>
          ) : (
            <div className="trade-list">
              {activeTrades.map(trade => (
                <div key={trade.tradeId} className="trade-item trade-item-active">
                  <div className="trade-item-info">
                    <div className="trade-item-player">
                      {trade.fromCharacterId || trade.fromCharacterName} ↔
                      {trade.toCharacterId || trade.toCharacterName}
                    </div>
                    <div className="trade-item-status" style={{ color: getStatusColor(trade.status) }}>
                      {getStatusLabel(trade.status)}
                    </div>
                    <div className="trade-item-items">
                      {trade.fromItems?.map((item, idx) => (
                        <span key={`from-${idx}`} className="trade-item-tag trade-item-from">
                          {item.name} x{item.quantity}
                        </span>
                      ))}
                      {trade.toItems?.map((item, idx) => (
                        <span key={`to-${idx}`} className="trade-item-tag trade-item-to">
                          {item.name} x{item.quantity}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="trade-item-actions">
                    {trade.status === 'accepted' || trade.status === 'pending' ? (
                      <>
                        <button
                          className="trade-button trade-button-complete"
                          onClick={() => handleCompleteTrade(trade.tradeId)}
                        >
                          완료
                        </button>
                        <button
                          className="trade-button trade-button-cancel"
                          onClick={() => handleCancelTrade(trade.tradeId)}
                        >
                          취소
                        </button>
                      </>
                    ) : (
                      <div className="trade-status-icon">
                        {trade.status === 'completed' && '✨'}
                        {trade.status === 'cancelled' && '🚫'}
                        {trade.status === 'rejected' && '❌'}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TradeMenu;