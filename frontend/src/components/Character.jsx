import PropTypes from 'prop-types'

const CHARACTER_SIZE = 40

function getAffinityColor(affinity) {
  if (affinity <= 2) return '#ff4444'
  if (affinity >= 3 && affinity < 8) return '#ff8800'
  return '#00cc44'
}

export default function Character({ char, myCharacterId, affinities, chatMessages, scale }) {
  const { x, y, color, emoji, name, isAi, id, emotion } = char
  const scaledX = x * scale
  const scaledY = y * scale
  const CHARACTER_SIZE_SCALED = CHARACTER_SIZE * scale
  const displayName = name || '익명'  // Fallback: name이 undefined이면 '익명' 표시

  return (
    <>
      <circle
        cx={scaledX}
        cy={scaledY}
        r={CHARACTER_SIZE_SCALED / 2}
        fill={color}
        stroke={isAi ? '#FF6B6B' : '#4CAF50'}
        strokeWidth={3}
      />
      <text
        x={scaledX}
        y={scaledY}
        fontSize={CHARACTER_SIZE_SCALED / 2}
        fontFamily="Arial"
        textAnchor="middle"
        dominantBaseline="middle"
      >
        {emoji}
      </text>
      <text
        x={scaledX}
        y={scaledY - CHARACTER_SIZE_SCALED / 2 - (8 * scale)}
        fontSize={12 * scale}
        fontFamily="Arial"
        fill="#ffffff"
        textAnchor="middle"
      >
        {displayName}
      </text>
      {isAi && (
        <text
          x={scaledX + CHARACTER_SIZE_SCALED / 2}
          y={scaledY - CHARACTER_SIZE_SCALED / 2}
          fontSize={12 * scale}
          fontFamily="Arial"
          fill="#FF6B6B"
          textAnchor="middle"
        >
          🤖
        </text>
      )}
      {isAi && emotion && emotion.emoji && (
        <text
          x={scaledX - CHARACTER_SIZE_SCALED / 2}
          y={scaledY - CHARACTER_SIZE_SCALED / 2}
          fontSize={12 * scale}
          fontFamily="Arial"
          fill="#FFD700"
          textAnchor="middle"
        >
          {emotion.emoji}
        </text>
      )}
      {affinities[myCharacterId] && affinities[myCharacterId][id] !== undefined && (
        <>
          <text
            x={scaledX}
            y={scaledY + CHARACTER_SIZE_SCALED / 2 + Math.max(44, 32 * scale) / 2 + 5}
            fontSize={Math.max(44, 32 * scale)}
            fontFamily="Arial"
            textAnchor="middle"
            dominantBaseline="middle"
          >
            💗
          </text>
          <text
            x={scaledX}
            y={scaledY + CHARACTER_SIZE_SCALED / 2 + Math.max(44, 32 * scale) + Math.max(14, 12 * scale) + 5}
            fontSize={Math.max(14, 12 * scale)}
            fontFamily="Arial"
            fill={getAffinityColor(affinities[myCharacterId][id])}
            textAnchor="middle"
          >
            {affinities[myCharacterId][id]}
          </text>
        </>
      )}
    </>
  )
}

Character.propTypes = {
  char: PropTypes.shape({
    x: PropTypes.number.isRequired,
    y: PropTypes.number.isRequired,
    color: PropTypes.string.isRequired,
    emoji: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    isAi: PropTypes.bool.isRequired,
    id: PropTypes.string.isRequired,
    emotion: PropTypes.shape({
      type: PropTypes.string,
      emoji: PropTypes.string,
      lastChangeTime: PropTypes.number
    })
  }).isRequired,
  myCharacterId: PropTypes.string.isRequired,
  affinities: PropTypes.object.isRequired,
  chatMessages: PropTypes.object.isRequired,
  scale: PropTypes.number.isRequired
}