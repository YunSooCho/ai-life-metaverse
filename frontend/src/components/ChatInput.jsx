import PropTypes from 'prop-types'
import { useRef, useEffect } from 'react'
import { useI18n } from '../i18n/I18nContext'

export default function ChatInput({ value, onChange, onSubmit, disabled = false }) {
  const { t } = useI18n()
  const textareaRef = useRef(null)
  const MAX_HEIGHT = 120

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onSubmit()
    }
  }

  const handleChange = (e) => {
    onChange(e)
  }

  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      const newHeight = Math.min(textarea.scrollHeight, MAX_HEIGHT)
      textarea.style.height = `${newHeight}px`
    }
  }, [value, MAX_HEIGHT])

  return (
    <div className="chat-input-container pixel-panel">
      <textarea
        ref={textareaRef}
        className="chat-input chat-input-textarea pixel-input"
        placeholder={t('ui.chat.placeholder')}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        rows={1}
        style={{
          resize: 'none',
          overflowY: textareaRef.current?.scrollHeight > MAX_HEIGHT ? 'auto' : 'hidden',
          maxHeight: `${MAX_HEIGHT}px`
        }}
      />
      <button
        className="chat-send-button pixel-button pixel-button-green"
        onClick={onSubmit}
        disabled={disabled}
      >
        SEND
      </button>
    </div>
  )
}

ChatInput.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  disabled: PropTypes.bool
}