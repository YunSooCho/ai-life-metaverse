import PropTypes from 'prop-types'
import { useI18n } from '../i18n/I18nContext'

function EventLog({ logs, characterName }) {
  const { t, language } = useI18n()

  const locale = language === 'ja' ? 'ja-JP' : language === 'en' ? 'en-US' : 'ko-KR'

  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  }

  const formatDwellTime = (ms) => {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)

    if (language === 'en') {
      if (hours > 0) return `${hours}h ${minutes % 60}m ${seconds % 60}s`
      if (minutes > 0) return `${minutes}m ${seconds % 60}s`
      return `${seconds}s`
    } else if (language === 'ja') {
      if (hours > 0) return `${hours}時間${minutes % 60}分${seconds % 60}秒`
      if (minutes > 0) return `${minutes}分${seconds % 60}秒`
      return `${seconds}秒`
    } else {
      if (hours > 0) return `${hours}시간 ${minutes % 60}분 ${seconds % 60}초`
      if (minutes > 0) return `${minutes}분 ${seconds % 60}초`
      return `${seconds}초`
    }
  }

  const formatDate = (timestamp) => {
    const date = new Date(timestamp)
    return date.toLocaleDateString(locale)
  }

  return (
    <div className="event-log-list">
      {logs.length === 0 ? (
        <div className="event-log-empty">{t('ui.inventory.empty')}</div>
      ) : (
        logs.map((log, index) => (
          <div key={index} className="event-log-item">
            <div className="event-log-icon">
              {log.type === 'enter' ? '🚶' : '🏃'}
            </div>
            <div className="event-log-content">
              <div className="event-log-type">
                {log.type === 'enter' ? t('ui.building.enter') : t('ui.building.exit')}
              </div>
              <div className="event-log-building">
                🏢 {log.buildingName}
              </div>
              <div className="event-log-date">{formatDate(log.exitTime || log.enterTime)}</div>
              <div className="event-log-time">
                {t('ui.building.enter')}: {formatTime(log.enterTime)}
              </div>
              {log.type === 'exit' && (
                <>
                  <div className="event-log-time">
                    {t('ui.building.exit')}: {formatTime(log.exitTime)}
                  </div>
                  <div className="event-log-dwell">
                    ⏱️ {formatDwellTime(log.dwellTime)}
                  </div>
                </>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  )
}

EventLog.propTypes = {
  logs: PropTypes.arrayOf(
    PropTypes.shape({
      type: PropTypes.oneOf(['enter', 'exit']).isRequired,
      buildingId: PropTypes.number.isRequired,
      buildingName: PropTypes.string.isRequired,
      characterId: PropTypes.string.isRequired,
      characterName: PropTypes.string.isRequired,
      enterTime: PropTypes.number.isRequired,
      exitTime: PropTypes.number,
      dwellTime: PropTypes.number
    })
  ).isRequired,
  characterName: PropTypes.string.isRequired
}

export default EventLog
