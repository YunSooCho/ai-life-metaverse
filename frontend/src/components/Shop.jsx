/**
 * AI Life Metaverse - Shop Component
 *
 * 상점 UI 컴포넌트
 * - NPC 상점 목록 표시
 * - 아이템 구매/판매
 * - 금액 표시
 */

import React, { useState, useEffect } from 'react';

const Shop = ({ onClose }) => {
  const [shops, setShops] = useState([]);
  const [selectedShop, setSelectedShop] = useState(null);
  const [coins, setCoins] = useState(0);
  const [inventory, setInventory] = useState([]);

  // 상점 데이터 불러오기
  useEffect(() => {
    loadShops();
    loadCoins();
    loadInventory();
  }, []);

  const loadShops = async () => {
    try {
      const res = await fetch('http://10.76.29.91:4000/api/shop/list');
      const data = await res.json();
      if (data.success) {
        setShops(data.data);
        if (data.data.length > 0) {
          setSelectedShop(data.data[0]);
        }
      }
    } catch (error) {
      console.error('상점 목록 불러오기 실패:', error);
    }
  };

  const loadCoins = async () => {
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

  const loadInventory = async () => {
    try {
      const res = await fetch('http://10.76.29.91:4000/api/inventory');
      const data = await res.json();
      if (data.success) {
        setInventory(data.data || []);
      }
    } catch (error) {
      console.error('인벤토리 불러오기 실패:', error);
    }
  };

  // 아이템 구매
  const handleBuy = async (shopId, itemId, price) => {
    if (confirm(`${price} 코인으로 이 아이템을 구매하시겠습니까?`)) {
      try {
        const res = await fetch('http://10.76.29.91:4000/api/shop/buy', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            shopId,
            itemId,
            quantity: 1
          })
        });

        const data = await res.json();
        if (data.success) {
          alert(data.message);
          loadCoins();
          loadInventory();
          loadShops(); // 재고 업데이트
        } else {
          alert(data.message);
        }
      } catch (error) {
        console.error('아이템 구매 실패:', error);
        alert('아이템 구매에 실패했습니다');
      }
    }
  };

  // 아이템 판매
  const handleSell = async (itemId, price) => {
    if (confirm(`${price} 코인에 이 아이템을 판매하시겠습니까?`)) {
      try {
        const res = await fetch('http://10.76.29.91:4000/api/shop/sell', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            itemId,
            quantity: 1
          })
        });

        const data = await res.json();
        if (data.success) {
          alert(data.message);
          loadCoins();
          loadInventory();
        } else {
          alert(data.message);
        }
      } catch (error) {
        console.error('아이템 판매 실패:', error);
        alert('아이템 판매에 실패했습니다');
      }
    }
  };

  if (!selectedShop) {
    return (
      <div style={{
        backgroundColor: '#2C3E50',
        color: '#ECF0F1',
        padding: '20px',
        borderRadius: '10px',
        minWidth: '600px'
      }}>
        <div style={{ textAlign: 'center', padding: '50px' }}>
          로딩 중...
        </div>
      </div>
    );
  }

  return (
    <div className="shop-menu" style={{
      backgroundColor: '#2C3E50',
      color: '#ECF0F1',
      padding: '20px',
      borderRadius: '10px',
      fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
      minWidth: '800px',
      maxHeight: '80vh',
      overflowY: 'auto'
    }}>
      {/* 헤더 */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        borderBottom: '2px solid #34495E',
        paddingBottom: '10px'
      }}>
        <h2 style={{ margin: 0, color: '#F39C12' }}>🏪 상점</h2>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <div style={{
            padding: '8px 16px',
            backgroundColor: '#34495E',
            borderRadius: '5px',
            color: '#F39C12',
            fontWeight: 'bold'
          }}>
            💰 {coins} 코인
          </div>
        </div>
      </div>

      {/* 상점 선택 탭 */}
      <div style={{
        display: 'flex',
        gap: '10px',
        marginBottom: '20px'
      }}>
        {shops.map(shop => (
          <button
            key={shop.shopId}
            onClick={() => setSelectedShop(shop)}
            style={{
              padding: '10px 20px',
              backgroundColor: selectedShop.shopId === shop.shopId ? '#F39C12' : '#34495E',
              color: '#ECF0F1',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: selectedShop.shopId === shop.shopId ? 'bold' : 'normal'
            }}
          >
            {shop.name}
          </button>
        ))}
      </div>

      {/* 선택된 상점 설명 */}
      <div style={{
        backgroundColor: '#34495E',
        padding: '15px',
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <h3 style={{ margin: '0 0 5px 0', color: '#3498DB' }}>
          {selectedShop.name}
        </h3>
        <p style={{ margin: 0, color: '#95A5A6' }}>
          {selectedShop.description}
        </p>
      </div>

      {/* 아이템 목록 */}
      <div style={{
        backgroundColor: '#34495E',
        padding: '15px',
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <h3 style={{ margin: '0 0 15px 0', color: '#E74C3C' }}>📦 판매 상품</h3>

        {selectedShop.items.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '30px',
            color: '#95A5A6'
          }}>
            판매 상품이 없습니다
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '10px'
          }}>
            {selectedShop.items.map(item => (
              <div
                key={item.itemId}
                style={{
                  backgroundColor: '#2C3E50',
                  padding: '15px',
                  borderRadius: '8px',
                  border: '1px solid #34495E',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'scale(1.02)';
                  e.target.style.boxShadow = '0 0 10px rgba(52, 152, 219, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'scale(1)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                <div style={{
                  fontSize: '32px',
                  marginBottom: '10px',
                  textAlign: 'center'
                }}>
                  {item.itemId.includes('potion') && '🧪'}
                  {item.itemId.includes('food') && (item.itemId.includes('apple') ? '🍎' : '🍞')}
                  {item.itemId.includes('weapon') && (item.itemId.includes('sword') ? '⚔️' : '🏹')}
                  {item.itemId.includes('armor') && '🛡️'}
                </div>

                <div style={{
                  fontSize: '14px',
                  fontWeight: 'bold',
                  marginBottom: '5px',
                  color: '#ECF0F1'
                }}>
                  {item.name}
                </div>

                <div style={{
                  fontSize: '12px',
                  color: '#95A5A6',
                  marginBottom: '8px',
                  display: 'flex',
                  justifyContent: 'space-between'
                }}>
                  <span>재고: {item.stock}</span>
                </div>

                <div style={{
                  borderTop: '1px solid #34495E',
                  paddingTop: '10px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <div style={{
                    fontSize: '13px',
                    color: '#F39C12',
                    fontWeight: 'bold'
                  }}>
                    구매: {item.buyPrice} 💰
                  </div>
                  <button
                    onClick={() => handleBuy(selectedShop.shopId, item.itemId, item.buyPrice)}
                    disabled={item.stock <= 0}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: item.stock > 0 ? '#2ECC71' : '#7F8C8D',
                      color: '#ECF0F1',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: item.stock > 0 ? 'pointer' : 'not-allowed',
                      fontSize: '12px'
                    }}
                  >
                    구매
                  </button>
                </div>

                <div style={{
                  marginTop: '8px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <div style={{
                    fontSize: '13px',
                    color: '#3498DB',
                    fontWeight: 'bold'
                  }}>
                    판매: {item.sellPrice} 💰
                  </div>
                  <button
                    onClick={() => handleSell(item.itemId, item.sellPrice)}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: '#E67E22',
                      color: '#ECF0F1',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    판매
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 내 인벤토리에서 판매 가능한 아이템 */}
      <div style={{
        backgroundColor: '#34495E',
        padding: '15px',
        borderRadius: '8px'
      }}>
        <h3 style={{ margin: '0 0 15px 0', color: '#9B59B6' }}>🎒 내 인벤토리 (판매 가능)</h3>

        {inventory.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '30px',
            color: '#95A5A6'
          }}>
            인벤토리가 비어있습니다
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
            gap: '8px'
          }}>
            {inventory.map(item => (
              <div
                key={item.id}
                style={{
                  backgroundColor: '#2C3E50',
                  padding: '10px',
                  borderRadius: '5px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '12px'
                }}
              >
                <div style={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  flex: 1
                }}>
                  {item.name} x{item.quantity || 1}
                </div>
                <button
                  onClick={() => handleSell(item.id, item.sellPrice || Math.floor(item.price / 2))}
                  style={{
                    padding: '4px 8px',
                    backgroundColor: '#E67E22',
                    color: '#ECF0F1',
                    border: 'none',
                    borderRadius: '3px',
                    cursor: 'pointer',
                    fontSize: '10px'
                  }}
                >
                  판매
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Shop;