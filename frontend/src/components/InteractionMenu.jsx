import PropTypes from 'prop-types'

export default function InteractionMenu({ show, targetCharacter, x, y, onInteraction, onClose }) {
  if (!show || !targetCharacter) return null

  return (
    <>
      <div className="interaction-overlay" onClick={onClose} />
      <div
        className="interaction-menu"
        style={{
          left: x,
          top: y
        }}
      >
        <div className="interaction-menu-header">
          {targetCharacter.name}
        </div>
        <div className="interaction-menu-items">
          <button
            className="interaction-menu-button"
            onClick={() => onInteraction('greeting')}
          >
            👋 인사
          </button>
          <button
            className="interaction-menu-button"
            onClick={() => onInteraction('gift')}
          >
            🎁 선물주기
          </button>
          <button
            className="interaction-menu-button"
            onClick={() => onInteraction('friend')}
          >
            🤝 친하기
          </button>
          <button
            className="interaction-menu-button"
            onClick={() => onInteraction('fight')}
          >
            ⚔️ 싸우기
          </button>
        </div>
      </div>
    </>
  )
}

InteractionMenu.propTypes = {
  show: PropTypes.bool.isRequired,
  targetCharacter: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired
  }),
  x: PropTypes.number.isRequired,
  y: PropTypes.number.isRequired,
  onInteraction: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired
}