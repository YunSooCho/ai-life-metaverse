import PropTypes from 'prop-types'

function getAffinityColor(affinity) {
  if (affinity <= 2) return '#ff4444'
  if (affinity >= 3 && affinity < 8) return '#ff8800'
  return '#00cc44'
}

export default function AffinityDisplay({ show, x, y, data }) {
  if (!show || !data) return null

  return (
    <div
      className="affinity-display"
      style={{
        left: x,
        top: y
      }}
    >
      <div className="affinity-display-name">
        {data.name}
      </div>
      <div className="affinity-display-heart">💗</div>
      <div
        className="affinity-display-value"
        style={{
          color: getAffinityColor(data.affinity)
        }}
      >
        {data.affinity}
      </div>
    </div>
  )
}

AffinityDisplay.propTypes = {
  show: PropTypes.bool.isRequired,
  x: PropTypes.number.isRequired,
  y: PropTypes.number.isRequired,
  data: PropTypes.shape({
    name: PropTypes.string.isRequired,
    affinity: PropTypes.number.isRequired
  })
}