/**
 * HistoryUI - 커스터마이징 히스토리 표시 UI 컴포넌트
 *
 * 커스터마이징 변경 이력 표시, 복원 기능 제공
 *
 * Created: 2026-02-24 10:50
 * PM: Genie
 */

import { useState, useEffect } from 'react'
import { socket } from '../socket'
import './HistoryUI.css'

/**
 * HistoryUI 컴포넌트
 *
 * @param {Object} props
 * @param {boolean} props.show - 표시 여부
 * @param {Function} props.onRestore - 복원 핸들러
 * @param {Function} props.onClose - 닫기 핸들러
 */
function HistoryUI({ show, onRestore, onClose }) {
  const [history, setHistory] = useState([])
  const [message, setMessage] = useState('')

  // 히스토리 로드
  useEffect(() => {
    if (show) {
      loadHistory()
    }
  }, [show])

  // 히스토리 로드 함수
  const loadHistory = () => {
    if (socket) {
      socket.emit('getCustomizationHistory', { limit: 20 })
      socket.on('customizationHistory', (data) => {
        setHistory(data.history || [])
        socket.off('customizationHistory')
      })
    }
  }

  // 히스토리 복원
  const handleRestore = (historyItem) => {
    if (window.confirm(`이전 설정으로 복원하시겠습니까?\n\n시간: ${new Date(historyItem.timestamp).toLocaleString('ko-KR')}`)) {
      if (onRestore) {
        onRestore(historyItem.oldCustomization)
        setMessage('✅ 이전 설정으로 복원 완료')
      }
    }
  }

  // 메시지 초기화
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(''), 3000)
      return () => clearTimeout(timer)
    }
  }, [message])

  /**
   * 변경 사항 텍스트 변환
   */
  const getChangeText = (change) => {
    const categoryNames = {
      hairStyle: '머리 스타일',
      hairColor: '머리 색상',
      clothingColor: '옷 색상',
      accessory: '악세사리',
      skinTone: '피부 톤',
      eyeColor: '눈 색상',
      facialFeature: '얼굴 특징'
    }

    return `${categoryNames[change.category] || change.category}: ${change.oldValue} → ${change.newValue}`
  }

  if (!show) {
    return null
  }

  return (
    <div className="history-ui-overlay pixel-overlay">
      <div className="history-ui pixel-panel">
        {/* Header */}
        <div className="history-ui-header">
          <h2>📜 변경 이력</h2>
          <button className="pixel-button pixel-button-red" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Message */}
        {message && (
          <div className="history-ui-message">
            {message}
          </div>
        )}

        {/* History List */}
        <div className="history-ui-list">
          <h3>📋 최근 변경 ({history.length})</h3>
          {history.length === 0 ? (
            <div className="history-ui-empty">
              변경 이력이 없습니다
            </div>
          ) : (
            <div className="history-ui-items">
              {history.map((item) => (
                <div key={item.id} className="history-ui-item">
                  <div className="history-ui-item-header">
                    <div className="history-ui-item-time">
                      {new Date(item.timestamp).toLocaleString('ko-KR', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                      })}
                    </div>
                    <button
                      className="pixel-button pixel-button-blue pixel-button-sm"
                      onClick={() => handleRestore(item)}
                      title="이 설정으로 복원"
                    >
                      🔄 복원
                    </button>
                  </div>
                  <div className="history-ui-item-changes">
                    {item.changes && item.changes.length > 0 ? (
                      item.changes.map((change, index) => (
                        <div key={index} className="history-ui-item-change">
                          {getChangeText(change)}
                        </div>
                      ))
                    ) : (
                      <div className="history-ui-item-change">
                        변경 사항 없음
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default HistoryUI