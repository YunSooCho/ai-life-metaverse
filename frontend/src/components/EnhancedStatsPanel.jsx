import React from 'react'
import PropTypes from 'prop-types'
import { useI18n } from '../i18n/I18nContext'
import './EnhancedStatsPanel.css'

/**
 * 통계 패널 컴포넌트 (Phase 5 개선)
 *
 * 기능:
 * - 캐릭터 상태 표시 (HP, Hunger, Happiness)
 * - 날씨 상태 표시
 * - 퀘스트 진행도
 * - 시간/날짜 표시
 *
 * @param {Object} props
 * @param {boolean} props.show - 표시 여부
 * @param {Object} props.character - 캐릭터 정보
 * @param {Object} props.weather - 날씨 정보 { type, temperature, humidity }
 * @param {Object} props.quest - 퀘스트 정보 { active: [], completed: [] }
 * @param {Object} props.gameTime - 게임 시간 { hours, minutes, day }
 * @param {function} props.onClose - 닫기 핸들러
 */
export default function EnhancedStatsPanel({
  show = false,
  character = null,
  weather = { type: 'CLEAR', temperature: 20, humidity: 50 },
  quest = { active: [], completed: [] },
  gameTime = { hours: 12, minutes: 0, day: 1 },
  onClose = () => {}
}) {
  const { t } = useI18n()

  if (!show || !character) return null

  // HP 퍼센트
  const hpPercentage = character.stats?.maxHp > 0
    ? Math.floor((character.stats.hp / character.stats.maxHp) * 100)
    : 100

  // 경험치 퍼센트
  const expPercentage = character.maxExp > 0
    ? Math.floor((character.exp / character.maxExp) * 100)
    : 0

  // 날씨 이모지
  const getWeatherEmoji = (type) => {
    switch (type.toUpperCase()) {
      case 'CLEAR': return '☀️'
      case 'CLOUDY': return '☁️'
      case 'RAINY': return '🌧️'
      case 'SNOWY': return '❄️'
      case 'STORM': return '⛈️'
      default: return '🌡️'
    }
  }

  // 시간 포맷
  const formatTime = (hours, minutes) => {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
  }

  // 시간대 이모지
  const getTimeEmoji = (hours) => {
    if (hours >= 5 && hours < 12) return '🌅'
    if (hours >= 12 && hours < 17) return '☀️'
    if (hours >= 17 && hours < 21) return '🌆'
    return '🌙'
  }

  // 퀘스트 진행률
  const questProgress = quest.active.length > 0
    ? Math.floor((quest.completed.length / quest.active.length) * 100)
    : 0

  return (
    <div className="enhanced-stats-overlay" onClick={onClose}>
      <div className="enhanced-stats-panel" onClick={(e) => e.stopPropagation()}>
        <button className="stats-close" onClick={onClose}>✕</button>

        {/* 헤더 */}
        <div className="stats-header">
          <h2 className="stats-title">
            {character.emoji} {t('ui.profile.title')}
          </h2>
          <div className="level-badge">Lv. {character.level}</div>
        </div>

        <div className="stats-content">
          {/* 캐릭터 상태 */}
          <section className="stats-section">
            <h3 className="section-title">{t('ui.statusExtended.characterStatus')}</h3>

            {/* HP */}
            <div className="stat-row">
              <div className="stat-label">
                <span className="stat-icon">❤️</span>
                <span>{t('ui.status.hp')}</span>
              </div>
              <div className="stat-value">
                <span className="stat-text">{character.stats?.hp || 0} / {character.stats?.maxHp || 100}</span>
                <div className="hp-bar">
                  <div className="hp-fill" style={{ width: `${hpPercentage}%` }}></div>
                </div>
              </div>
            </div>

            {/* 경험치 */}
            <div className="stat-row">
              <div className="stat-label">
                <span className="stat-icon">⭐</span>
                <span>{t('ui.profile.exp')}</span>
              </div>
              <div className="stat-value">
                <span className="stat-text">{character.exp} / {character.maxExp}</span>
                <div className="exp-bar">
                  <div className="exp-fill" style={{ width: `${expPercentage}%` }}></div>
                </div>
              </div>
            </div>

            {/* 능력치 */}
            <div className="abilities-grid">
              <div className="ability-item">
                <span className="ability-icon">❤️</span>
                <span className="ability-name">{t('ui.status.affinity')}</span>
                <span className="ability-value">{character.stats?.affinity || 0}</span>
              </div>
              <div className="ability-item">
                <span className="ability-icon">⭐</span>
                <span className="ability-name">{t('ui.status.charisma')}</span>
                <span className="ability-value">{character.stats?.charisma || 0}</span>
              </div>
              <div className="ability-item">
                <span className="ability-icon">💡</span>
                <span className="ability-name">{t('ui.status.intelligence')}</span>
                <span className="ability-value">{character.stats?.intelligence || 0}</span>
              </div>
            </div>
          </section>

          {/* 날씨 상태 */}
          <section className="stats-section">
            <h3 className="section-title">{t('ui.weather.title')}</h3>
            <div className="weather-info">
              <div className="weather-main">
                <span className="weather-emoji">{getWeatherEmoji(weather.type)}</span>
                <div className="weather-details">
                  <span className="weather-type">{t(`ui.weather.${weather.type.toLowerCase()}`)}</span>
                  <span className="weather-temp">{weather.temperature}°C</span>
                </div>
              </div>
              <div className="weather-meta">
                <span className="weather-humidity">💧 {weather.humidity}%</span>
              </div>
            </div>
          </section>

          {/* 게임 시간 */}
          <section className="stats-section">
            <h3 className="section-title">{t('ui.time.title')}</h3>
            <div className="time-info">
              <div className="time-display">
                <span className="time-emoji">{getTimeEmoji(gameTime.hours)}</span>
                <span className="time-value">{formatTime(gameTime.hours, gameTime.minutes)}</span>
              </div>
              <div className="date-display">
                {t('ui.time.day')} {gameTime.day}
              </div>
            </div>
          </section>

          {/* 퀘스트 진행도 */}
          <section className="stats-section">
            <h3 className="section-title">{t('ui.quest.title')}</h3>
            <div className="quest-info">
              <div className="quest-summary">
                <span className="quest-count">
                  {t('ui.quest.active')}: {quest.active.length}
                </span>
                <span className="quest-count">
                  {t('ui.quest.completed')}: {quest.completed.length}
                </span>
              </div>
              {quest.active.length > 0 && (
                <div className="quest-progress-bar">
                  <div className="quest-progress-fill" style={{ width: `${questProgress}%` }}></div>
                  <span className="quest-progress-text">{questProgress}%</span>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

EnhancedStatsPanel.propTypes = {
  show: PropTypes.bool,
  character: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    emoji: PropTypes.string,
    level: PropTypes.number,
    exp: PropTypes.number,
    maxExp: PropTypes.number,
    stats: PropTypes.shape({
      hp: PropTypes.number,
      maxHp: PropTypes.number,
      affinity: PropTypes.number,
      charisma: PropTypes.number,
      intelligence: PropTypes.number
    })
  }),
  weather: PropTypes.shape({
    type: PropTypes.string,
    temperature: PropTypes.number,
    humidity: PropTypes.number
  }),
  quest: PropTypes.shape({
    active: PropTypes.array,
    completed: PropTypes.array
  }),
  gameTime: PropTypes.shape({
    hours: PropTypes.number,
    minutes: PropTypes.number,
    day: PropTypes.number
  }),
  onClose: PropTypes.func
}