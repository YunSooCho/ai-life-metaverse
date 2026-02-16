import PropTypes from 'prop-types'

export default function ChatInput({ value, onChange, onSubmit, disabled }) {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onSubmit()
    }
  }

  return (
    <div className="chat-input-container">
      <input
        type="text"
        className="chat-input"
        placeholder="메시지를 입력하세요..."
        value={value}
        onChange={onChange}
        onKeyDown={handleKeyDown}
        disabled={disabled}
      />
      <button className="chat-send-button" onClick={onSubmit} disabled={disabled}>
        전송
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

ChatInput.defaultProps = {
  disabled: false
}