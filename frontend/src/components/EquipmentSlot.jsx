/**
 * AI Life Metaverse - Equipment Slot Component
 *
 * 장비 슬롯 UI 컴포넌트
 * - 장비 아이콘 표시
 * - 장비 레어도 표시 (색상: Gray/Green/Blue/Purple/Orange)
 * - 장비 이름/레벨 표시
 */

import React from 'react';

// 장비 레어도 색상
const RARITY_COLORS = {
  COMMON: '#95A5A6',
  RARE: '#3498DB',
  EPIC: '#9B59B6',
  LEGENDARY: '#F39C12',
  MYTHIC: '#E74C3C'
};

// 슬롯 타입 한글 변환
const SLOT_NAMES = {
  weapon: '무기',
  head: '머리',
  body: '몸통',
  accessory: '장신구',
  special: '특수'
};

const EquipmentSlot = ({
  slotType,
  equipment,
  onEquip,
  onUnequip,
  onEnhance,
  isEquipped
}) => {
  const slotName = SLOT_NAMES[slotType] || slotType;
  const rarityColor = equipment
    ? RARITY_COLORS[equipment.rarity?.name] || '#95A5A6'
    : '#7F8C8D';

  const handleSlotClick = () => {
    if (equipment) {
      // 장비가 장착된 경우: 해제 또는 강화 옵션 표시
      onUnequip && onUnequip(slotType);
    } else {
      // 장비가 없는 경우: 장착 옵션 표시
      onEquip && onEquip(slotType);
    }
  };

  const handleEnhance = (e) => {
    e.stopPropagation();
    onEnhance && onEnhance(equipment);
  };

  const isMaxLevel = equipment && equipment.level >= equipment.maxLevel;

  return (
    <div
      className="equipment-slot"
      style={{
        border: `3px solid ${rarityColor}`,
        backgroundColor: equipment ? '#2C3E50' : '#1A252F',
        cursor: 'pointer',
        padding: '10px',
        borderRadius: '8px',
        transition: 'all 0.2s ease',
        position: 'relative'
      }}
      onClick={handleSlotClick}
      onMouseEnter={(e) => {
        e.target.style.transform = 'scale(1.05)';
        e.target.style.boxShadow = `0 0 10px ${rarityColor}`;
      }}
      onMouseLeave={(e) => {
        e.target.style.transform = 'scale(1)';
        e.target.style.boxShadow = 'none';
      }}
    >
      {/* 슬롯 이름 */}
      <div
        className="slot-name"
        style={{
          fontSize: '12px',
          color: '#ECF0F1',
          marginBottom: '5px',
          textAlign: 'center',
          fontWeight: 'bold'
        }}
      >
        {slotName}
      </div>

      {/* 장비 아이콘 영역 */}
      <div
        className="slot-content"
        style={{
          width: '60px',
          height: '60px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: equipment ? '#34495E' : '#1A252F',
          borderRadius: '4px',
          marginBottom: '5px'
        }}
      >
        {equipment ? (
          // 장비 아이콘 (이모지로 임시 대체)
          <div style={{ fontSize: '32px' }}>
            {slotType === 'weapon' && '⚔️'}
            {slotType === 'head' && '👑'}
            {slotType === 'body' && '🛡️'}
            {slotType === 'accessory' && '💍'}
            {slotType === 'special' && '✨'}
          </div>
        ) : (
          // 빈 슬롯
          <div style={{ fontSize: '32px', color: '#7F8C8D' }}>📦</div>
        )}
      </div>

      {/* 장비 정보 */}
      {equipment && (
        <>
          <div
            className="equipment-name"
            style={{
              fontSize: '11px',
              color: '#ECF0F1',
              textAlign: 'center',
              marginBottom: '2px',
              fontWeight: 'bold',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
            title={equipment.name}
          >
            {equipment.name}
          </div>

          <div
            className="equipment-level"
            style={{
              fontSize: '10px',
              color: '#95A5A6',
              textAlign: 'center'
            }}
          >
            Lv. {equipment.level} / {equipment.maxLevel}
          </div>

          {/* 강화 버튼 (장착된 장비만 표시) */}
          {isEquipped && !isMaxLevel && (
            <button
              className="enhance-button"
              onClick={handleEnhance}
              style={{
                marginTop: '5px',
                width: '100%',
                padding: '4px 8px',
                backgroundColor: '#E74C3C',
                color: '#ECF0F1',
                border: 'none',
                borderRadius: '4px',
                fontSize: '10px',
                cursor: 'pointer',
                transition: 'background 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#C0392B';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#E74C3C';
              }}
            >
              강화 (+1)
            </button>
          )}

          {/* 최대 레벨 표시 */}
          {isMaxLevel && (
            <div
              className="max-level-badge"
              style={{
                marginTop: '5px',
                fontSize: '9px',
                color: '#F39C12',
                textAlign: 'center',
                fontWeight: 'bold'
              }}
            >
              MAX
            </div>
          )}
        </>
      )}

      {/* 레어도 배지 */}
      {equipment && (
        <div
          className="rarity-badge"
          style={{
            position: 'absolute',
            top: '5px',
            right: '5px',
            backgroundColor: rarityColor,
            color: '#ECF0F1',
            fontSize: '8px',
            padding: '2px 5px',
            borderRadius: '3px',
            fontWeight: 'bold'
          }}
        >
          {equipment.rarity?.name || 'COMMON'}
        </div>
      )}
    </div>
  );
};

export default EquipmentSlot;