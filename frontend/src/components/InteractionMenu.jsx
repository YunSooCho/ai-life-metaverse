import PropTypes from 'prop-types'

export default function InteractionMenu({ show, targetCharacter, x, y, onInteraction, onClose }) {
  if (!show || !targetCharacter) return null

  return (
    <>
      <div className="interaction-overlay" onClick={onClose} />
      <div
        className="interaction-menu pixel-menu pixel-pop"
        style={{
          left: x,
          top: y
        }}
      >
        <div className="interaction-menu-header pixel-menu-header">
          {targetCharacter.name}
        </div>
        <div className="interaction-menu-items">
          <button
            className="interaction-menu-button pixel-menu-item"
            onClick={() => onInteraction('greeting')}
          >
            INSA
          </button>
          <button
            className="interaction-menu-button pixel-menu-item"
            onClick={() => onInteraction('gift')}
          >
            GIFT
          </button>
          <button
            className="interaction-menu-button pixel-menu-item pixel-button-green"
            onClick={() => onInteraction('friend')}
          >
            FRIEND
          </button>
          <button
            className="interaction-menu-button pixel-menu-item pixel-button-red"
            onClick={() => onInteraction('fight')}
          >
            FIGHT
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