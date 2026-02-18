import React from 'react'
import { useI18n } from '../i18n/I18nContext'
import './StatusPanel.css'

/**
 * 캐릭터 스테이터스 패널 컴포넌트
 * JRPG 스타일 픽셀 UI로 캐릭터 정보 표시
 */
export default function StatusPanel({ show, onClose, character }) {
  const { t } = useI18n()
  if (!show || !character) return null

  // 경험치 퍼센트 계산
  const expPercentage = character.maxExp > 0
    ? Math.floor((character.exp / character.maxExp) * 100)
    : 0

  // HP 퍼센트 계산
  const hpPercentage = character.stats?.maxHp > 0
    ? Math.floor((character.stats.hp / character.stats.maxHp) * 100)
    : 100

  return (
    <div className="status-panel-overlay" onClick={onClose}>
      <div className="status-panel" onClick={(e) => e.stopPropagation()}>
        <button className="status-panel-close" onClick={onClose}>✕</button>

        <div className="status-panel-header">
          <h2 className="status-panel-title">
            {character.emoji} {character.name}
          </h2>
          <div className="status-panel-level">
            Lv. {character.level}
          </div>
        </div>

        <div className="status-panel-content">
          {/* HP Bar */}
          <div className="status-section">
            <div className="status-label">
              <span className="label-text">{t('ui.status.hp')}</span>
              <span className="label-value">
                {character.stats?.hp || 0} / {character.stats?.maxHp || 100}
              </span>
            </div>
            <div className="hp-bar-container">
              <div className="hp-bar-fill" style={{ width: `${hpPercentage}%` }}></div>
              <div className="hp-bar-text">{hpPercentage}%</div>
            </div>
          </div>

          {/* EXP Bar */}
          <div className="status-section">
            <div className="status-label">
              <span className="label-text">{t('ui.profile.exp')}</span>
              <span className="label-value">
                {character.exp} / {character.maxExp}
              </span>
            </div>
            <div className="exp-bar-container">
              <div className="exp-bar-fill" style={{ width: `${expPercentage}%` }}></div>
              <div className="exp-bar-text">{expPercentage}%</div>
            </div>
            <div className="exp-next">
              {t('ui.statusExtended.nextLevelExp')} {character.maxExp - character.exp} EXP
            </div>
          </div>

          {/* Stats */}
          <div className="status-section">
            <div className="status-subtitle">{t('ui.statusExtended.abilities')}</div>
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-icon">❤️</span>
                <span className="stat-name">{t('ui.status.affinity')}</span>
                <span className="stat-value">{character.stats?.affinity || 0}</span>
              </div>
              <div className="stat-item">
                <span className="stat-icon">⭐</span>
                <span className="stat-name">{t('ui.status.charisma')}</span>
                <span className="stat-value">{character.stats?.charisma || 0}</span>
              </div>
              <div className="stat-item">
                <span className="stat-icon">💡</span>
                <span className="stat-name">{t('ui.status.intelligence')}</span>
                <span className="stat-value">{character.stats?.intelligence || 0}</span>
              </div>
            </div>
          </div>

          {/* Character Info */}
          <div className="status-section">
            <div className="status-subtitle">{t('ui.statusExtended.info')}</div>
            <div className="info-row">
              <span className="info-label">{t('ui.statusExtended.id')}:</span>
              <span className="info-value">{character.id}</span>
            </div>
            <div className="info-row">
              <span className="info-label">{t('ui.statusExtended.typeLabel')}:</span>
              <span className="info-value">{character.isAi ? t('app.aiCharacter') : t('app.player')}</span>
            </div>
            {character.color && (
              <div className="info-row">
                <span className="info-label">{t('ui.statusExtended.color')}:</span>
                <span className="info-value color-sample" style={{ backgroundColor: character.color }}>
                  {character.color}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}