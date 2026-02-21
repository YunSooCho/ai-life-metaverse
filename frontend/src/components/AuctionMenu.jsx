/**
 * AI Life Metaverse - Auction Menu Component
 *
 * 경매장 UI 컴포넌트
 * - 경매 등록/입찰/낙찰/취소
 * - 수수료 5% 적용
 */

import React, { useState, useEffect } from 'react';
import './AuctionMenu.css';

const AuctionMenu = ({ socket, characterId, onClose }) => {
  const [activeAuctions, setActiveAuctions] = useState([]);
  const [myAuctions, setMyAuctions] = useState([]);
  const [showRegister, setShowRegister] = useState(false);
  const [registerForm, setRegisterForm] = useState({
    itemId: '',
    itemName: '',
    startingPrice: 100,
    minBidIncrement: 10,
  });

  useEffect(() => {
    loadActiveAuctions();
    loadMyAuctions();

    // Socket 이벤트 리스너
    socket.on('auctionCreated', handleAuctionCreated);
    socket.on('auctionUpdated', handleAuctionUpdated);
    socket.on('auctionEnded', handleAuctionEnded);

    return () => {
      socket.off('auctionCreated', handleAuctionCreated);
      socket.off('auctionUpdated', handleAuctionUpdated);
      socket.off('auctionEnded', handleAuctionEnded);
    };
  }, [socket, characterId]);

  const loadActiveAuctions = async () => {
    try {
      const res = await fetch('http://10.76.29.91:4000/api/auction/list');
      const data = await res.json();
      if (data.success) {
        setActiveAuctions(data.data || []);
      }
    } catch (error) {
      console.error('활성 경매 불러오기 실패:', error);
    }
  };

  const loadMyAuctions = async () => {
    try {
      const res = await fetch('http://10.76.29.91:4000/api/auction/my-auctions');
      const data = await res.json();
      if (data.success) {
        setMyAuctions(data.data || []);
      }
    } catch (error) {
      console.error('내 경매 불러오기 실패:', error);
    }
  };

  const handleAuctionCreated = (auction) => {
    setActiveAuctions(prev => [...prev, auction]);
  };

  const handleAuctionUpdated = (auction) => {
    setActiveAuctions(prev => {
      const index = prev.findIndex(a => a.auctionId === auction.auctionId);
      if (index >= 0) {
        const newAuctions = [...prev];
        newAuctions[index] = auction;
        return newAuctions;
      }
      return [...prev, auction];
    });
  };

  const handleAuctionEnded = (auctionId) => {
    setActiveAuctions(prev => prev.filter(a => a.auctionId !== auctionId));
    loadMyAuctions();
  };

  const handleBid = async (auctionId, bidAmount) => {
    try {
      const res = await fetch('http://10.76.29.91:4000/api/auction/bid', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          auctionId,
          bidAmount: parseInt(bidAmount),
        })
      });

      const data = await res.json();
      if (data.success) {
        loadActiveAuctions();
        alert('입찰 성공!');
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('입찰 실패:', error);
      alert('입찰에 실패했습니다');
    }
  };

  const handleRegisterAuction = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch('http://10.76.29.91:4000/api/auction/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          characterId,
          itemId: registerForm.itemId,
          itemName: registerForm.itemName,
          startingPrice: parseInt(registerForm.startingPrice),
          minBidIncrement: parseInt(registerForm.minBidIncrement),
        })
      });

      const data = await res.json();
      if (data.success) {
        setShowRegister(false);
        loadMyAuctions();
        alert('경매 등록 성공!');
        setRegisterForm({
          itemId: '',
          itemName: '',
          startingPrice: 100,
          minBidIncrement: 10,
        });
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('경매 등록 실패:', error);
      alert('경매 등록에 실패했습니다');
    }
  };

  const handleCancelAuction = async (auctionId) => {
    if (confirm('이 경매를 취소하시겠습니까?')) {
      try {
        const res = await fetch('http://10.76.29.91:4000/api/auction/cancel', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ auctionId })
        });

        const data = await res.json();
        if (data.success) {
          loadMyAuctions();
          loadActiveAuctions();
          alert('경매 취소 성공!');
        } else {
          alert(data.message);
        }
      } catch (error) {
        console.error('경매 취소 실패:', error);
        alert('경매 취소에 실패했습니다');
      }
    }
  };

  const calculateFee = (amount) => {
    return Math.floor(amount * 0.05);
  };

  const formatTime = (endTime) => {
    const end = new Date(endTime);
    const now = new Date();
    const diff = end - now;

    if (diff <= 0) return '종료';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours >= 24) {
      const days = Math.floor(hours / 24);
      return `${days}일 ${hours % 24}시간`;
    }

    return `${hours}시간 ${minutes}분`;
  };

  return (
    <div className="auction-menu-overlay">
      <div className="auction-menu">
        {/* 헤더 */}
        <div className="auction-menu-header">
          <h2 className="auction-menu-title">🔨 경매장</h2>
          <button className="auction-menu-close" onClick={onClose}>✕</button>
        </div>

        {/* 탭 메뉴 */}
        <div className="auction-tabs">
          <button
            className={`auction-tab ${!showRegister ? 'auction-tab-active' : ''}`}
            onClick={() => setShowRegister(false)}
          >
            📋 전체 경매
          </button>
          <button
            className={`auction-tab ${showRegister ? 'auction-tab-active' : ''}`}
            onClick={() => setShowRegister(true)}
          >
            ➕ 경매 등록
          </button>
        </div>

        {/* 경매 등록 폼 */}
        {showRegister && (
          <div className="auction-section">
            <h3 className="auction-section-title">새 경매 등록</h3>
            <form className="auction-register-form" onSubmit={handleRegisterAuction}>
              <div className="auction-form-group">
                <label className="auction-form-label">아이템 ID</label>
                <input
                  type="text"
                  className="auction-form-input"
                  placeholder="item_001"
                  value={registerForm.itemId}
                  onChange={(e) => setRegisterForm({ ...registerForm, itemId: e.target.value })}
                  required
                />
              </div>

              <div className="auction-form-group">
                <label className="auction-form-label">아이템 이름</label>
                <input
                  type="text"
                  className="auction-form-input"
                  placeholder="전설의 검"
                  value={registerForm.itemName}
                  onChange={(e) => setRegisterForm({ ...registerForm, itemName: e.target.value })}
                  required
                />
              </div>

              <div className="auction-form-group">
                <label className="auction-form-label">시작 가격</label>
                <input
                  type="number"
                  className="auction-form-input"
                  min="1"
                  value={registerForm.startingPrice}
                  onChange={(e) => setRegisterForm({ ...registerForm, startingPrice: e.target.value })}
                  required
                />
              </div>

              <div className="auction-form-group">
                <label className="auction-form-label">최소 입찰 단위</label>
                <input
                  type="number"
                  className="auction-form-input"
                  min="1"
                  value={registerForm.minBidIncrement}
                  onChange={(e) => setRegisterForm({ ...registerForm, minBidIncrement: e.target.value })}
                  required
                />
              </div>

              <div className="auction-form-fee">
                ⚠️ 수수료: {calculateFee(registerForm.startingPrice)} 코인 (5%)
              </div>

              <button type="submit" className="auction-button auction-button-primary">
                경매 등록
              </button>
            </form>
          </div>
        )}

        {/* 활성 경매 목록 */}
        {!showRegister && (
          <>
            <div className="auction-section">
              <h3 className="auction-section-title">🎯 활성 경매</h3>
              {activeAuctions.length === 0 ? (
                <div className="auction-empty">활성 경매가 없습니다</div>
              ) : (
                <div className="auction-list">
                  {activeAuctions.map(auction => (
                    <div key={auction.auctionId} className="auction-item">
                      <div className="auction-item-header">
                        <div className="auction-item-name">{auction.itemName}</div>
                        <div className="auction-item-time">
                          ⏱️ {formatTime(auction.endTime)}
                        </div>
                      </div>

                      <div className="auction-item-details">
                        <div className="auction-item-detail">
                          <span className="auction-detail-label">등록자:</span>
                          <span className="auction-detail-value">
                            {auction.sellerCharacterName || auction.sellerCharacterId}
                          </span>
                        </div>
                        <div className="auction-item-detail">
                          <span className="auction-detail-label">현재 입찰:</span>
                          <span className="auction-detail-value auction-detail-highlight">
                            {auction.currentBid || auction.startingPrice} 💰
                          </span>
                        </div>
                        <div className="auction-item-detail">
                          <span className="auction-detail-label">최소 입찰:</span>
                          <span className="auction-detail-value">
                            {(auction.currentBid || auction.startingPrice) + auction.minBidIncrement} 💰
                          </span>
                        </div>
                        <div className="auction-item-detail">
                          <span className="auction-detail-label">마감:</span>
                          <span className="auction-detail-value">
                            {new Date(auction.endTime).toLocaleString('ko-KR')}
                          </span>
                        </div>
                      </div>

                      <div className="auction-item-actions">
                        <input
                          type="number"
                          className="auction-bid-input"
                          min={(auction.currentBid || auction.startingPrice) + auction.minBidIncrement}
                          placeholder="입찰가"
                          id={`bid-${auction.auctionId}`}
                        />
                        <button
                          className="auction-button auction-button-bid"
                          onClick={() => {
                            const input = document.getElementById(`bid-${auction.auctionId}`);
                            if (input && input.value) {
                              handleBid(auction.auctionId, input.value);
                            }
                          }}
                        >
                          입찰
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="auction-section">
              <h3 className="auction-section-title">📦 내 경매</h3>
              {myAuctions.length === 0 ? (
                <div className="auction-empty">등록한 경매가 없습니다</div>
              ) : (
                <div className="auction-list">
                  {myAuctions.map(auction => (
                    <div key={auction.auctionId} className="auction-item auction-item-mine">
                      <div className="auction-item-header">
                        <div className="auction-item-name">{auction.itemName}</div>
                        <div className="auction-item-time">
                          {auction.status === 'active' ? '⏱️ ' + formatTime(auction.endTime) : auction.status}
                        </div>
                      </div>

                      <div className="auction-item-details">
                        <div className="auction-item-detail">
                          <span className="auction-detail-label">현재 입찰:</span>
                          <span className="auction-detail-value auction-detail-highlight">
                            {auction.currentBid || auction.startingPrice} 💰
                          </span>
                        </div>
                        <div className="auction-item-detail">
                          <span className="auction-detail-label">수수료:</span>
                          <span className="auction-detail-value">
                            {calculateFee(auction.currentBid || auction.startingPrice)} 💰 (5%)
                          </span>
                        </div>
                      </div>

                      {auction.status === 'active' && (
                        <button
                          className="auction-button auction-button-cancel"
                          onClick={() => handleCancelAuction(auction.auctionId)}
                        >
                          경매 취소
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AuctionMenu;