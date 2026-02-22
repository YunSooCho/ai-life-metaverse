/**
 * SkillMenu.jsx - 스킬 메뉴 UI
 *
 * 스킬 시스템 UI
 * - 학습 가능한 스킬 목록
 * - 학습한 스킬 목록
 * - 스킬 레벨/경험치
 * - 스킬 장착/해제 버튼
 */

import React, { useState, useEffect } from 'react'

const SkillMenu = ({ socket, characterData, onClose }) => {
  const [learnableSkills, setLearnableSkills] = useState([])
  const [learnedSkills, setLearnedSkills] = useState([])
  const [equippedSkills, setEquippedSkills] = useState([])
  const [skillLevels, setSkillLevels] = useState({})
  const [skillExp, setSkillExp] = useState({})
  const [activeTabs, setActiveTabs] = useState(['learnable', 'equipped']) // 'learnable', 'learned', 'equipped', 'passive'

  // 학습 가능한 스킬 불러오기
  useEffect(() => {
    if (socket) {
      socket.emit('getLearnableSkills')
      socket.emit('getEquippedSkills')
      socket.emit('getLearnedSkills')

      socket.on('learnableSkills', setLearnableSkills)
      socket.on('equippedSkills', setEquippedSkills)
      socket.on('learnedSkills', (data) => {
        setLearnedSkills(data.skills || [])
        setSkillLevels(data.skillLevels || {})
        setSkillExp(data.skillExp || {})
      })

      return () => {
        socket.off('learnableSkills')
        socket.off('equippedSkills')
        socket.off('learnedSkills')
      }
    }
  }, [socket])

  // 스킬 학습
  const handleLearnSkill = (skillId) => {
    if (socket && characterData) {
      socket.emit('learnSkill', { characterId: characterData.id, skillId })
      socket.once('learnSkillResult', (result) => {
        if (result.success) {
          // 학습 후 목록 갱신
          socket.emit('getLearnableSkills')
          socket.emit('getLearnedSkills')
        }
      })
    }
  }

  // 스킬 장착
  const handleEquipSkill = (skillId) => {
    if (socket && characterData) {
      socket.emit('equipSkill', { characterId: characterData.id, skillId })
      socket.once('equipSkillResult', (result) => {
        if (result.success) {
          socket.emit('getEquippedSkills')
          socket.emit('getLearnedSkills')
        }
      })
    }
  }

  // 스킬 해제
  const handleUnequipSkill = (skillId) => {
    if (socket && characterData) {
      socket.emit('unequipSkill', { characterId: characterData.id, skillId })
      socket.once('unequipSkillResult', (result) => {
        if (result.success) {
          socket.emit('getEquippedSkills')
          socket.emit('getLearnedSkills')
        }
      })
    }
  }

  // 스킬 타입 아이콘
  const getSkillTypeIcon = (skill) => {
    return skill.type === 'active' ? '⚡' : '🔄'
  }

  // 스킬 카테고리 뱃지
  const getCategoryBadge = (category) => {
    const colors = {
      'combat': '#ff6b6b',
      'movement': '#4ecdc4',
      'support': '#45b7d1'
    }
    const labels = {
      'combat': '전투',
      'movement': '이동',
      'support': '보조'
    }
    return (
      <span
        className="skill-category-badge"
        style={{
          backgroundColor: colors[category] || '#666',
          padding: '2px 8px',
          borderRadius: '4px',
          fontSize: '11px',
          color: '#fff',
          marginLeft: '4px'
        }}
      >
        {labels[category] || category}
      </span>
    )
  }

  // 스킬 레벨 Progress Bar
  const renderSkillLevelBar = (skillId) => {
    const level = skillLevels[skillId] || 0
    const exp = skillExp[skillId] || 0
    const requiredExp = level * 100
    const progress = requiredExp > 0 ? (exp / requiredExp) * 100 : 0

    return (
      <div className="skill-level-bar-container">
        <div className="skill-level-info">
          <span>Level {level}</span>
          <span>{exp}/{requiredExp} XP</span>
        </div>
        <div className="skill-level-bar">
          <div
            className="skill-level-progress"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    )
  }

  // 스킬 카드
  const renderSkillCard = (skill) => {
    const level = skillLevels[skill.id] || 1
    const isEquipped = equippedSkills.includes(skill.id)

    return (
      <div
        key={skill.id}
        className="skill-card"
        style={{
          border: isEquipped ? '2px solid #ffd700' : '1px solid #ddd',
          borderRadius: '8px',
          padding: '12px',
          marginBottom: '12px',
          backgroundColor: isEquipped ? '#fff9e6' : '#fff'
        }}
      >
        <div className="skill-card-header" style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
          <span className="skill-icon" style={{ fontSize: '24px', marginRight: '8px' }}>
            {skill.icon}
          </span>
          <div style={{ flex: 1 }}>
            <div className="skill-name" style={{ fontWeight: 'bold', fontSize: '14px' }}>
              {getSkillTypeIcon(skill)} {skill.name}
              {getCategoryBadge(skill.category)}
            </div>
            <div className="skill-cooldown" style={{ fontSize: '11px', color: '#666' }}>
              쿨타임: {skill.cooldown / 1000}초
            </div>
          </div>
        </div>

        <div className="skill-description" style={{ fontSize: '12px', color: '#444', marginBottom: '8px' }}>
          {skill.description}
        </div>

        {level > 0 && renderSkillLevelBar(skill.id)}

        <div className="skill-actions" style={{ marginTop: '8px', display: 'flex', gap: '8px' }}>
          {level === 0 ? (
            <button
              className="skill-learn-btn"
              onClick={() => handleLearnSkill(skill.id)}
              style={{
                flex: 1,
                padding: '6px',
                backgroundColor: '#4CAF50',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              학습 (Lv.{skill.requiredLevel})
            </button>
          ) : (
            <>
              {skill.type === 'active' && (
                isEquipped ? (
                  <button
                    className="skill-unequip-btn"
                    onClick={() => handleUnequipSkill(skill.id)}
                    style={{
                      flex: 1,
                      padding: '6px',
                      backgroundColor: '#f44336',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    해제
                  </button>
                ) : (
                  <button
                    className="skill-equip-btn"
                    onClick={() => handleEquipSkill(skill.id)}
                    style={{
                      flex: 1,
                      padding: '6px',
                      backgroundColor: '#2196F3',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    장착
                  </button>
                )
              )}
            </>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="skill-menu-overlay" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div className="skill-menu-container" style={{
        width: '90%',
        maxWidth: '800px',
        maxHeight: '80vh',
        backgroundColor: '#fff',
        borderRadius: '12px',
        padding: '20px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
        overflow: 'auto'
      }}>
        {/* 헤더 */}
        <div className="skill-menu-header" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          paddingBottom: '12px',
          borderBottom: '2px solid #ddd'
        }}>
          <h2 className="skill-menu-title" style={{ margin: 0, fontSize: '24px', color: '#333' }}>
            ⚔️ 스킬 관리
          </h2>
          <button
            className="close-btn"
            onClick={onClose}
            style={{
              padding: '8px 16px',
              backgroundColor: '#f44336',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            닫기
          </button>
        </div>

        {/* 탭 메뉴 */}
        <div className="skill-tabs" style={{ display: 'flex', marginBottom: '16px', borderBottom: '1px solid #ddd' }}>
          {[
            { id: 'learnable', label: '학습 가능', count: learnableSkills.length },
            { id: 'learned', label: '학습 완료', count: learnedSkills.length },
            { id: 'equipped', label: '장착 중', count: equippedSkills.length }
          ].map(tab => (
            <button
              key={tab.id}
              className={`skill-tab ${activeTabs === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTabs(tab.id)}
              style={{
                padding: '10px 16px',
                backgroundColor: activeTabs === tab.id ? '#2196F3' : '#f5f5f5',
                color: activeTabs === tab.id ? '#fff' : '#333',
                border: 'none',
                borderRadius: '6px 6px 0 0',
                cursor: 'pointer',
                fontSize: '14px',
                marginRight: '8px',
                fontWeight: activeTabs === tab.id ? 'bold' : 'normal'
              }}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* 내용 */}
        <div className="skill-content">
          {activeTabs === 'learnable' && (
            <div className="skill-list-learnable">
              {learnableSkills.length === 0 ? (
                <div className="empty-message" style={{ textAlign: 'center', color: '#999', padding: '40px' }}>
                  학습 가능한 스킬이 없습니다.
                  <br />
                  레벨업 후 새로운 스킬이 해금됩니다.
                </div>
              ) : (
                <div className="skill-cards">
                  {learnableSkills.map(skill => renderSkillCard(skill))}
                </div>
              )}
            </div>
          )}

          {activeTabs === 'learned' && (
            <div className="skill-list-learned">
              {learnedSkills.length === 0 ? (
                <div className="empty-message" style={{ textAlign: 'center', color: '#999', padding: '40px' }}>
                  학습한 스킬이 없습니다.
                  <br />
                  학습 가능 탭에서 스킬을 학습하세요.
                </div>
              ) : (
                <div className="skill-cards">
                  {learnedSkills.map(skill => renderSkillCard(skill))}
                </div>
              )}
            </div>
          )}

          {activeTabs === 'equipped' && (
            <div className="skill-list-equipped">
              {equippedSkills.length === 0 ? (
                <div className="empty-message" style={{ textAlign: 'center', color: '#999', padding: '40px' }}>
                  장착한 스킬이 없습니다.
                  <br />
                  학습 완료 탭에서 스킬을 장착하세요.
                </div>
              ) : (
                <div className="skill-cards">
                  {learnedSkills
                    .filter(skill => equippedSkills.includes(skill.id))
                    .map(skill => renderSkillCard(skill))
                  }
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SkillMenu