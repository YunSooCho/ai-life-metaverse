/**
 * AI Life Metaverse - Equipment Menu Component
 *
 * 장비 메뉴 UI 컴포넌트
 * - 장비 슬롯 표시 (5개: 무기/머리/몸통/장신구/특수)
 * - 장비 장착/해제 버튼
 * - 장비 스탯 정보 표시
 */

import React, { useState, useEffect } from 'react';
import EquipmentSlot from './EquipmentSlot';

const EquipmentMenu = () => {
  const [equippedSlots, setEquippedSlots] = useState({
    weapon: null,
    head: null,
    body: null,
    accessory: null,
    special: null
  });

  const [inventory, setInventory] = useState([]);
  const [totalStats, setTotalStats] = useState({});
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [showInventory, setShowInventory] = useState(false);

  // 장비 데이터 불러오기
  useEffect(() => {
    loadEquipmentData();
  }, []);

  const loadEquipmentData = async () => {
    try {
      // 장착된 장비 불러오기
      const equippedRes = await fetch('http://localhost:4000/api/equipment/slots');
      const slotsData = await equippedRes.json();
      if (slotsData.success) {
        setEquippedSlots(slotsData.data.slots);
      }

      // 인벤토리 불러오기
      const invRes = await fetch('http://localhost:4000/api/equipment/inventory');
      const invData = await invRes.json();
      if (invData.success) {
        setInventory(invData.data);
      }

      // 총 스탯 불러오기
      const statsRes = await fetch('http://localhost:4000/api/equipment/stats');
      const statsData = await statsRes.json();
      if (statsData.success) {
        setTotalStats(statsData.data);
      }
    } catch (error) {
      console.error('장비 데이터 불러오기 실패:', error);
    }
  };

  // 장비 장착
  const handleEquip = async (slotType) => {
    if (!selectedSlot) {
      alert('인벤토리에서 장착할 장비를 선택하세요');
      return;
    }

    if (selectedSlot.slot !== slotType) {
      alert(`이 장비는 ${getSlotName(selectedSlot.slot)} 슬롯에만 장착할 수 있습니다`);
      return;
    }

    try {
      const res = await fetch('http://localhost:4000/api/equipment/equip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId: selectedSlot.id })
      });

      const data = await res.json();
      if (data.success) {
        alert(data.message);
        loadEquipmentData();
        setSelectedSlot(null);
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('장비 장착 실패:', error);
      alert('장비 장착에 실패했습니다');
    }
  };

  // 장비 해제
  const handleUnequip = async (slotType) => {
    try {
      const res = await fetch('http://localhost:4000/api/equipment/unequip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slotType })
      });

      const data = await res.json();
      if (data.success) {
        alert(data.message);
        loadEquipmentData();
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('장비 해제 실패:', error);
      alert('장비 해제에 실패했습니다');
    }
  };

  // 장비 강화
  const handleEnhance = async (equipment) => {
    if (!confirm(`${equipment.name}을(를) 강화하시겠습니까?`)) {
      return;
    }

    try {
      const res = await fetch('http://localhost:4000/api/equipment/enhance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId: equipment.id })
      });

      const data = await res.json();
      if (data.success) {
        alert(data.message);
        loadEquipmentData();
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('장비 강화 실패:', error);
      alert('장비 강화에 실패했습니다');
    }
  };

  // 인벤토리 아이템 선택
  const handleInventoryItemClick = (item) => {
    setSelectedSlot(item);
    setShowInventory(false);
  };

  // 슬롯 타입 한글 변환
  const getSlotName = (slotType) => {
    const names = {
      weapon: '무기',
      head: '머리',
      body: '몸통',
      accessory: '장신구',
      special: '특수'
    };
    return names[slotType] || slotType;
  };

  // 스탯 한글 변환
  const getStatName = (stat) => {
    const names = {
      attack: '공격력',
      defense: '방어력',
      speed: '속도',
      health: 'HP',
      stamina: '스테미나',
      intelligence: '지능',
      criticalChance: '치명타율',
      criticalDamage: '치명타 데미지'
    };
    return names[stat] || stat;
  };

  return (
    <div className="equipment-menu" style={{
      backgroundColor: '#2C3E50',
      color: '#ECF0F1',
      padding: '20px',
      borderRadius: '10px',
      fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
      minWidth: '800px'
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
        <h2 style={{ margin: 0, color: '#F39C12' }}>🛡️ 장비 시스템</h2>
        <button
          onClick={() => setShowInventory(!showInventory)}
          style={{
            padding: '8px 16px',
            backgroundColor: '#3498DB',
            color: '#ECF0F1',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          👜 인벤토리 ({inventory.length})
        </button>
      </div>

      {/* 메인 컨텐츠 */}
      <div style={{ display: 'flex', gap: '20px' }}>
        {/* 왼쪽: 장비 슬롯 */}
        <div style={{
          flex: 1,
          backgroundColor: '#34495E',
          padding: '15px',
          borderRadius: '8px'
        }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#E74C3C' }}>장착된 장비</h3>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '15px'
          }}>
            {Object.keys(equippedSlots).map(slotType => (
              <EquipmentSlot
                key={slotType}
                slotType={slotType}
                equipment={equippedSlots[slotType]}
                isEquipped={!!equippedSlots[slotType]}
                onEquip={handleEquip}
                onUnequip={handleUnequip}
                onEnhance={handleEnhance}
              />
            ))}
          </div>
        </div>

        {/* 오른쪽: 총 스탯 */}
        <div style={{
          width: '300px',
          backgroundColor: '#34495E',
          padding: '15px',
          borderRadius: '8px'
        }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#9B59B6' }}>총 스탯 효과</h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {Object.keys(totalStats).map(stat => {
              if (totalStats[stat] === 0) return null;
              return (
                <div key={stat} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '8px',
                  backgroundColor: '#2C3E50',
                  borderRadius: '5px'
                }}>
                  <span style={{ color: '#95A5A6' }}>{getStatName(stat)}</span>
                  <span style={{
                    color: totalStats[stat] > 0 ? '#2ECC71' : '#E74C3C',
                    fontWeight: 'bold'
                  }}>
                    {totalStats[stat] > 0 ? '+' : ''}{totalStats[stat].toFixed(1)}
                  </span>
                </div>
              );
            })}
          </div>

          {/* 선택된 장비 정보 */}
          {selectedSlot && (
            <div style={{
              marginTop: '20px',
              padding: '15px',
              backgroundColor: '#2C3E50',
              borderRadius: '8px',
              border: '2px solid #F39C12'
            }}>
              <h4 style={{ margin: '0 0 10px 0', color: '#F39C12' }}>
                선택된 장비
              </h4>
              <div style={{ fontSize: '14px' }}>
                <div style={{ marginBottom: '5px' }}>
                  <strong>이름:</strong> {selectedSlot.name}
                </div>
                <div style={{ marginBottom: '5px' }}>
                  <strong>레벨:</strong> {selectedSlot.level} / {selectedSlot.maxLevel}
                </div>
                <div style={{ marginBottom: '5px' }}>
                  <strong>레어도:</strong> {selectedSlot.rarity?.name || 'COMMON'}
                </div>
                <div style={{ marginBottom: '5px' }}>
                  <strong>슬롯:</strong> {getSlotName(selectedSlot.slot)}
                </div>
                <div>
                  <strong>설명:</strong> {selectedSlot.description}
                </div>
              </div>
              <button
                onClick={() => setSelectedSlot(null)}
                style={{
                  marginTop: '10px',
                  width: '100%',
                  padding: '8px',
                  backgroundColor: '#95A5A6',
                  color: '#ECF0F1',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer'
                }}
              >
                선택 해제
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 인벤토리 모달 */}
      {showInventory && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: '#2C3E50',
            padding: '20px',
            borderRadius: '10px',
            width: '80%',
            maxWidth: '900px',
            maxHeight: '80vh',
            overflowY: 'auto'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '15px'
            }}>
              <h3 style={{ margin: 0 }}>👜 인벤토리</h3>
              <button
                onClick={() => setShowInventory(false)}
                style={{
                  padding: '5px 10px',
                  backgroundColor: '#E74C3C',
                  color: '#ECF0F1',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer'
                }}
              >
                닫기
              </button>
            </div>

            {inventory.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '50px',
                color: '#95A5A6'
              }}>
                인벤토리가 비어있습니다
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                gap: '10px'
              }}>
                {inventory.map(item => (
                  <div
                    key={item.id}
                    onClick={() => handleInventoryItemClick(item)}
                    style={{
                      backgroundColor: '#34495E',
                      padding: '15px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      border: selectedSlot?.id === item.id
                        ? '3px solid #F39C12'
                        : '2px solid transparent',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      if (selectedSlot?.id !== item.id) {
                        e.target.style.transform = 'scale(1.02)';
                        e.target.style.boxShadow = '0 0 10px rgba(52, 152, 219, 0.5)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'scale(1)';
                      e.target.style.boxShadow = 'none';
                    }}
                  >
                    <div style={{ fontSize: '24px', marginBottom: '10px' }}>
                      {item.slot === 'weapon' && '⚔️'}
                      {item.slot === 'head' && '👑'}
                      {item.slot === 'body' && '🛡️'}
                      {item.slot === 'accessory' && '💍'}
                      {item.slot === 'special' && '✨'}
                    </div>
                    <div style={{
                      fontSize: '13px',
                      fontWeight: 'bold',
                      marginBottom: '5px',
                      color: '#ECF0F1'
                    }}>
                      {item.name}
                    </div>
                    <div style={{ fontSize: '11px', color: '#95A5A6' }}>
                      Lv. {item.level}
                    </div>
                    <div style={{
                      fontSize: '10px',
                      color: item.rarity?.color || '#95A5A6',
                      marginTop: '5px'
                    }}>
                      {item.rarity?.name || 'COMMON'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EquipmentMenu;