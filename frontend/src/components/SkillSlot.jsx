/**
 * SkillSlot.jsx - 스킬 슬롯 UI
 *
 * 스킬 슬롯 시스템 UI
 * - 장착된 스킬 아이콘 표시
 * - 쿨타임 Progress Bar
 * - 툴팁 (스킬 설명)
 */

import React, { useState } from 'react'

const SkillSlot = ({ skill, isOnCooldown, cooldownRemaining, cooldownTotal, onUse, index }) => {
  const [showTooltip, setShowTooltip] = useState(false)

  // 쿨타임 Progress 계산 (ms -> 초)
  const cooldownPercent = isOnCooldown ? (cooldownRemaining / cooldownTotal) * 100 : 0
  const cooldownSeconds = Math.ceil(cooldownRemaining / 1000)

  // 툴팁 표시
  const renderTooltip = () => {
    if (!skill || !showTooltip) return null

    return (
      <div className="skill-tooltip-container" style={{
        position: 'absolute',
        Bottom: '60px',
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        color: '#fff',
        padding: '12px',
        borderRadius: '8px',
        fontSize: '12px',
        maxWidth: '200px',
        zIndex: 1001,
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.3)',
        whiteSpace: 'normal',
        lineHeight: '1.4'
      }}>
        {/* 스킬 이름 & 아이콘 */}
        <div className="tooltip-header" style={{ marginBottom: '8px', borderBottom: '1px solid #444', paddingBottom: '6px' }}>
          <span style={{ fontSize: '16px', marginRight: '6px' }}>{skill.icon}</span>
          <span style={{ fontWeight: 'bold', fontSize: '13px' }}>{skill.name}</span>
        </div>

        {/* 스킬 설명 */}
        <div className="tooltip-description" style={{ marginBottom: '8px', color: '#ccc' }}>
          {skill.description}
        </div>

        {/* 스킬 정보 */}
        <div className="tooltip-info" style={{ fontSize: '11px', color: '#888' }}>
          <div>⚡ {skill.type === 'active' ? '액티브 스킬' : '패시브 스킬'}</div>
          <div>🕒 쿨타임: {skill.cooldown / 1000}초</div>
          {skill.type === 'active' && (
            <div>🎯 필요 레벨: Lv.{skill.requiredLevel}</div>
          )}
        </div>
      </div>
    )
  }

  // 스킬 슬롯 키 바인딩 표시 (1, 2, 3...)
  const getKeyBinding = () => {
    return index !== undefined ? index + 1 : ''
  }

  return (
    <div
      className="skill-slot-wrapper"
      style={{
        position: 'relative',
        width: '60px',
        height: '60px',
        margin: '4px'
      }}
      onClick={() => onUse && skill && !isOnCooldown && onUse(skill.id)}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {/* 스킬 슬롯 */}
      <div
        className={`skill-slot ${isOnCooldown ? 'cooldown' : ''} ${skill ? 'filled' : 'empty'}`}
        style={{
          width: '60px',
          height: '60px',
          borderRadius: '8px',
          backgroundColor: skill ? (isOnCooldown ? '#555' : '#2a2a2a') : '#1a1a1a',
          border: skill ? (isOnCooldown ? '2px solid #888' : '2px solid #ffd700') : '2px solid #333',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: skill && !isOnCooldown ? 'pointer' : 'default',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
        }}
      >
        {/* 스킬 아이콘 */}
        {skill && (
          <span
            className="skill-icon"
            style={{
              fontSize: '36px',
              filter: isOnCooldown ? 'grayscale(100%) brightness(50%)' : 'none',
              zIndex: 2
            }}
          >
            {skill.icon}
          </span>
        )}

        {/* 쿨타임 Overay */}
        {isOnCooldown && (
          <div
            className="cooldown-overlay"
            style={{
              position: 'absolute',
              top: `${cooldownPercent}%`,
              left: 0,
              right: 0,
              Bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              zIndex: 1,
              transition: 'top 0.1s linear'
            }}
          />
        )}

        {/* 쿨타임 텍스트 */}
        {isOnCooldown && cooldownSeconds > 0 && (
          <div
            className="cooldown-text"
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              fontSize: '20px',
              fontWeight: 'bold',
              color: '#fff',
              zIndex: 3,
              textShadow: '0 0 4px rgba(0, 0, 0, 0.8)'
            }}
          >
            {cooldownSeconds}
          </div>
        )}
      </div>

      {/* 키 바인딩 표시 */}
      <div
        className="key-binding"
        style={{
          position: 'absolute',
          Bottom: '2px',
          right: '4px',
          fontSize: '11px',
          fontWeight: 'bold',
          color: '#fff',
          textShadow: '0 0 3px rgba(0, 0, 0, 1)',
          zIndex: 4
        }}
      >
        {getKeyBinding()}
      </div>

      {/* 툴팁 */}
      {renderTooltip()}
    </div>
  )
}

// 스킬 슬롯 컨테이너 (스킬 슬롯 그룹)
const SkillSlotContainer = ({ equippedSkills, allSkills, onUseSkill, cooldowns }) => {
  // 장착된 스킬 정보 가져오기
  const getSkillDetails = (skillId) => {
    return allSkills.find(skill => skill.id === skillId) || null
  }

  // 슬롯 수 (최대 5개)
  const slotCount = 5

  return (
    <div className="skill-slot-container" style={{
      display: 'flex',
      flexWrap: 'wrap',
      justifyContent: 'center',
      padding: '8px',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      borderRadius: '12px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)'
    }}>
      {Array.from({ length: slotCount }, (_, index) => {
        const skillId = equippedSkills[index]
        const skill = getSkillDetails(skillId)
        const cooldownData = cooldowns[skillId] || { remaining: 0, total: skill?.cooldown || 0 }
        const isOnCooldown = cooldownData.remaining > 0

        return (
          <SkillSlot
            key={index}
            index={index}
            skill={skill}
            isOnCooldown={isOnCooldown}
            cooldownRemaining={cooldownData.remaining}
            cooldownTotal={cooldownData.total}
            onUse={onUseSkill}
          />
        )
      })}
    </div>
  )
}

export { SkillSlot, SkillSlotContainer }
export default SkillSlot