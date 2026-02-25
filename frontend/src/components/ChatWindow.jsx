import React, { useState, useRef, useEffect } from 'react'
import PropTypes from 'prop-types'
import { useI18n } from '../i18n/I18nContext'
import './ChatWindow.css'

/**
 * AI 캐릭터와의 대화창 팝업 (Phase 5 개선)
 *
 * 기능:
 * - AI 캐릭터 프로필 표시
 * - 실시간 대화 히스토리
 * - 텍스트 입력 및 전송
 * - 이모지/아이콘 지원
 * - 애니메이션 효과
 *
 * @param {Object} props
 * @param {boolean} props.visible - 표시 여부
 * @param {Object} props.character - 캐릭터 정보 { id, name, emoji, isAi }
 * @param {Array} props.messages - 대화 메시지 [{ id, sender, text, timestamp }]
 * @param {function} props.onSendMessage - 메시지 전송 핸들러 (text)
 * @param {function} props.onClose - 닫기 핸들러
 */
export default function ChatWindow({
  visible = false,
  character = null,
  messages = [],
  onSendMessage = () => {},
  onClose = () => {}
}) {
  const { t } = useI18n()
  const [inputText, setInputText] = useState('')
  const messagesEndRef = useRef(null)

  // 메시지 추가 시 자동 스크롤
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  // 메시지 전송
  const handleSend = () => {
    if (inputText.trim()) {
      onSendMessage(inputText.trim())
      setInputText('')
    }
  }

  // Enter키 전송 / Shift+Enter 줄바꿈
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // 시간 포맷
  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
  }

  if (!visible || !character) return null

  return (
    <div className="chat-window-overlay" onClick={onClose}>
      <div className="chat-window" onClick={(e) => e.stopPropagation()}>
        {/* 캐릭터 프로필 헤더 */}
        <div className="chat-window-header">
          <div className="character-profile">
            <span className="character-emoji">{character.emoji}</span>
            <div className="character-info">
              <span className="character-name">{character.name}</span>
              {character.isAi && (
                <span className="ai-badge">{t('app.aiCharacter')}</span>
              )}
            </div>
          </div>
          <button className="close-button" onClick={onClose}>✕</button>
        </div>

        {/* 대화 히스토리 */}
        <div className="chat-messages">
          {messages.length === 0 ? (
            <div className="empty-messages">
              <span className="empty-icon">💬</span>
              <p>{t('ui.chat.noMessages')}</p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`message ${message.sender === 'player' ? 'player' : 'ai'}`}
              >
                <div className="message-header">
                  <span className="message-sender">
                    {message.sender === 'player' ? t('app.player') : character.name}
                  </span>
                  <span className="message-time">{formatTime(message.timestamp)}</span>
                </div>
                <div className="message-content">
                  {message.text}
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* 입력 영역 */}
        <div className="chat-input-area">
          <textarea
            className="chat-input textarea"
            placeholder={t('ui.chat.placeholder')}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={2}
          />
          <button className="send-button" onClick={handleSend} disabled={!inputText.trim()}>
            <span className="send-icon">📤</span>
            <span className="send-text">{t('ui.chat.send')}</span>
          </button>
        </div>
      </div>
    </div>
  )
}

ChatWindow.propTypes = {
  visible: PropTypes.bool,
  character: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    emoji: PropTypes.string,
    isAi: PropTypes.bool
  }),
  messages: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      sender: PropTypes.oneOf(['player', 'ai']),
      text: PropTypes.string,
      timestamp: PropTypes.number
    })
  ),
  onSendMessage: PropTypes.func,
  onClose: PropTypes.func
}