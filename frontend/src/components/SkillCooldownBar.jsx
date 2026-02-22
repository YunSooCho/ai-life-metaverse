/**
 * SkillCooldownBar.jsx - 스킬 쿨타임 Progress Bar UI
 *
 * 쿨타임 시각화 UI
 * - 쿨타임 Progress Bar
 * - 남은 시간 표시
 * - 다중 스킬 쿨타임 표시 가능
 */

import React from 'react'

const SkillCooldownBar = ({ skillName, cooldownRemaining, cooldownTotal, icon }) => {
  // 쿨타임 퍼센트 계산
  const cooldownPercent = cooldownTotal > 0 ? (cooldownRemaining / cooldownTotal) * 100 : 0

  // 남은 시간 표시 포맷
  const formatRemainingTime = (ms) => {
    const seconds = Math.ceil(ms / 1000)
    if (seconds < 60) {
      return `${seconds}초`
    } else {
      const minutes = Math.floor(seconds / 60)
      const remainingSeconds = seconds % 60
      return `${minutes}분 ${remainingSeconds}초`
    }
  }

  // 쿨타임 완료 여부
  const isComplete = cooldownRemaining <= 0

  return (
    <div className="skill-cooldown-bar-container" style={{
      width: '100%',
      padding: '8px',
      backgroundColor: '#fff',
      borderRadius: '6px',
      marginBottom: '8px'
    }}>
      {/* 스킬 헤더 */}
      <div className="cooldown-header" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '4px'
      }}>
        <div className="cooldown-skill-info" style={{ display: 'flex', alignItems: 'center' }}>
          {icon && <span style={{ fontSize: '18px', marginRight: '6px' }}>{icon}</span>}
          <span className="cooldown-skill-name" style={{ fontWeight: 'bold', fontSize: '13px' }}>
            {skillName}
          </span>
        </div>
        <span
          className="cooldown-remaining-time"
          style={{
            fontSize: '12px',
            color: isComplete ? '#4CAF50' : '#f44336',
            fontWeight: isComplete ? 'bold' : 'normal'
          }}
        >
          {isComplete ? '사용 가능' : formatRemainingTime(cooldownRemaining)}
        </span>
      </div>

      {/* Progress Bar */}
      <div
        className="cooldown-bar"
        style={{
          width: '100%',
          height: '8px',
          backgroundColor: '#e0e0e0',
          borderRadius: '4px',
          overflow: 'hidden',
          position: 'relative'
        }}
      >
        {/* Progress Fill */}
        <div
          className="cooldown-fill"
          style={{
            width: `${cooldownPercent}%`,
            height: '100%',
            backgroundColor: isComplete ? '#4CAF50' : '#f44336',
            borderRadius: '4px',
            transition: 'width 0.1s linear'
          }}
        />

        {/* 줄무늬 애니메이션 */}
        {!isComplete && (
          <div
            className="Cooldown-stripe"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundImage: 'linear-gradient(45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent)',
              backgroundSize: '20px 20px',
              animation: 'stripe-animation 1s linear infinite'
            }}
          />
        )}
      </div>
    </div>
  )
}

// 다중 스킬 쿨타임 표시 컨테이너
const SkillCooldownPanel = ({ cooldowns, allSkills }) => {
  if (!cooldowns || Object.keys(cooldowns).length === 0) {
    return (
      <div className="cooldown-empty" style={{
        textAlign: 'center',
        color: '#999',
        padding: '20px',
        fontSize: '12px'
      }}>
        쿨타임 중인 스킬이 없습니다.
      </div>
    )
  }

  // 쿨타임 정렬 (남은 시간 오름차순)
  const sortedCooldowns = Object.entries(cooldowns)
    .filter(([_, data]) => data.remaining > 0)
    .sort(([_, a], [__2, b]) => a.remaining - b.remaining)

  return (
    <div className="skill-cooldown-panel" style={{
      width: '100%',
      maxHeight: '200px',
      overflowY: 'auto',
      backgroundColor: '#f5f5f5',
      borderRadius: '8px',
      padding: '12px',
      border: '1px solid #ddd'
    }}>
      {sortedCooldowns.map(([skillId, data]) => {
        const skill = allSkills.find(s => s.id === skillId)
        if (!skill) return null

        return (
          <SkillCooldownBar
            key={skillId}
            skillName={skill.name}
            cooldownRemaining={data.remaining}
            cooldownTotal={data.total}
            icon={skill.icon}
          />
        )
      })}
    </div>
  )
}

// 쿨타임 간단 표시 (아이콘 + 숫자)
const CooldownIndicator = ({ isOnCooldown, remainingTime, size = 'small' }) => {
  const sizes = {
    small: { fontSize: '12px', padding: '2px 6px' },
    medium: { fontSize: '14px', padding: '4px 8px' },
    large: { fontSize: '16px', padding: '6px 10px' }
  }

  const sizeStyle = sizes[size] || sizes.small

  if (!isOnCooldown) return null

  const seconds = Math.ceil(remainingTime / 1000)

  return (
    <div
      className="cooldown-indicator"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        backgroundColor: 'rgba(244, 67, 54, 0.9)',
        color: '#fff',
        borderRadius: '4px',
        fontWeight: 'bold',
        ...sizeStyle
      }}
    >
      <span style={{ marginRight: '4px' }}>⏱️</span>
      {seconds}s
    </div>
  )
}

export { SkillCooldownBar, SkillCooldownPanel, CooldownIndicator }
export default SkillCooldownBar