import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { useI18n } from '../i18n/I18nContext'
import './NotificationSystem.css'

/**
 * 알림 시스템 컴포넌트 (Phase 5 개선)
 *
 * 기능:
 * - 퀘스트 완료 알림
 * - 아이템 획득 알림
 * - 날씨 변화 알림
 * - 애니메이션 효과 (slide-in, fade)
 *
 * @param {Object} props
 * @param {Array} props.notifications - 알림 목록
 */
export default function NotificationSystem({ notifications = [] }) {
  const { t } = useI18n()
  const [displayedNotifications, setDisplayedNotifications] = useState([])

  // 알림 추가 시 display state 업데이트
  useEffect(() => {
    const newNotifications = notifications.filter(
      n => !displayedNotifications.find(d => d.id === n.id)
    )

    if (newNotifications.length > 0) {
      setDisplayedNotifications([...displayedNotifications, ...newNotifications])

      // 5초 후 자동 제거
      newNotifications.forEach(n => {
        setTimeout(() => {
          setDisplayedNotifications(prev => prev.filter(d => d.id !== n.id))
        }, 5000)
      })
    }
  }, [notifications])

  // 알림 제거
  const dismissNotification = (id) => {
    setDisplayedNotifications(prev => prev.filter(n => n.id !== id))
  }

  // 알림 타입별 스타일
  const getNotificationStyle = (type) => {
    switch (type) {
      case 'quest_complete':
        return 'notification-quest'
      case 'item_get':
        return 'notification-item'
      case 'weather':
        return 'notification-weather'
      default:
        return 'notification-info'
    }
  }

  // 알림 아이콘
  const getNotificationIcon = (notification) => {
    switch (notification.type) {
      case 'quest_complete':
        return '🏆'
      case 'item_get':
        return notification.icon || '🎁'
      case 'weather':
        const weatherIcons = { CLEAR: '☀️', CLOUDY: '☁️', RAINY: '🌧️', SNOWY: '❄️', STORM: '⛈️' }
        return weatherIcons[notification.weather?.toUpperCase()] || '🌡️'
      default:
        return notification.icon || 'ℹ️'
    }
  }

  if (displayedNotifications.length === 0) return null

  return (
    <div className="notification-system">
      {displayedNotifications.map((notification, index) => (
        <div
          key={notification.id}
          className={`notification ${getNotificationStyle(notification.type)}`}
          style={{ animationDelay: `${index * 100}ms` }}
          onClick={() => dismissNotification(notification.id)}
        >
          <div className="notification-icon">
            {getNotificationIcon(notification)}
          </div>
          <div className="notification-content">
            <h4 className="notification-title">
              {t(`ui.notifications.${notification.type}`)}
            </h4>
            <p className="notification-message">
              {notification.message}
            </p>
            {notification.details && (
              <p className="notification-details">
                {notification.details}
              </p>
            )}
          </div>
          <button
            className="notification-dismiss"
            onClick={(e) => {
              e.stopPropagation()
              dismissNotification(notification.id)
            }}
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  )
}

NotificationSystem.propTypes = {
  notifications: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      type: PropTypes.oneOf(['quest_complete', 'item_get', 'weather', 'info']).isRequired,
      title: PropTypes.string,
      message: PropTypes.string.isRequired,
      details: PropTypes.string,
      icon: PropTypes.string,
      weather: PropTypes.string
    })
  )
}

/**
 * 알림 Hook (useNotifications)
 *
 * 사용법:
 * ```javascript
 * const { notifications, addNotification, dismissNotification } = useNotifications()
 *
 * // 알림 추가
 * addNotification({
 *   type: 'quest_complete',
 *   message: '퀘스트 완료!',
 *   details: '보상: 100 EXP',
 *   icon: '🏆'
 * })
 * ```
 */
export function useNotifications() {
  const [notifications, setNotifications] = useState([])

  const addNotification = (notification) => {
    const id = `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    setNotifications(prev => [...prev, { id, ...notification, timestamp: Date.now() }])
  }

  const dismissNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  return {
    notifications,
    addNotification,
    dismissNotification
  }
}