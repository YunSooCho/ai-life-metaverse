import PropTypes from 'prop-types'

function EventLog({ logs, characterName }) {
  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  }

  const formatDwellTime = (ms) => {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)

    if (hours > 0) {
      return `${hours}시간 ${minutes % 60}분 ${seconds % 60}초`
    } else if (minutes > 0) {
      return `${minutes}분 ${seconds % 60}초`
    } else {
      return `${seconds}초`
    }
  }

  const formatDate = (timestamp) => {
    const date = new Date(timestamp)
    return date.toLocaleDateString('ko-KR')
  }

  return (
    <div className="event-log-list">
      {logs.length === 0 ? (
        <div className="event-log-empty">방문 기록이 없습니다</div>
      ) : (
        logs.map((log, index) => (
          <div key={index} className="event-log-item">
            <div className="event-log-icon">
              {log.type === 'enter' ? '🚶' : '🏃'}
            </div>
            <div className="event-log-content">
              <div className="event-log-type">
                {log.type === 'enter' ? '입장' : '퇴장'}
              </div>
              <div className="event-log-building">
                🏢 {log.buildingName}
              </div>
              <div className="event-log-date">{formatDate(log.exitTime || log.enterTime)}</div>
              <div className="event-log-time">
                입장: {formatTime(log.enterTime)}
              </div>
              {log.type === 'exit' && (
                <>
                  <div className="event-log-time">
                    퇴장: {formatTime(log.exitTime)}
                  </div>
                  <div className="event-log-dwell">
                    ⏱️ 체류시간: {formatDwellTime(log.dwellTime)}
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