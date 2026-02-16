import PropTypes from 'prop-types'

export default function ChatBubble({ chatData, x, y, scale }) {
  if (!chatData?.message) return null

  const messageText = chatData.message
  const bubbleMaxWidth = 150 * scale
  const bubblePadding = 8 * scale
  const bubbleFontSize = 12 * scale
  const timestampFontSize = 10 * scale
  const CHARACTER_SIZE = 40
  const CHARACTER_SIZE_SCALED = CHARACTER_SIZE * scale

  const words = messageText.split('')
  const lines = []
  let currentLine = ''

  const ctx = document.createElement('canvas').getContext('2d')
  ctx.font = `${bubbleFontSize}px Arial`

  for (const char of words) {
    const testLine = currentLine + char
    const metrics = ctx.measureText(testLine)

    if (metrics.width > bubbleMaxWidth - (bubblePadding * 2) && currentLine !== '') {
      lines.push(currentLine)
      currentLine = char
    } else {
      currentLine = testLine
    }
  }
  lines.push(currentLine)

  const lineHeight = bubbleFontSize * 1.4
  const timestampHeight = chatData?.timestamp ? (timestampFontSize + 4 * scale) : 0
  const bubbleHeight = (lines.length * lineHeight) + (bubblePadding * 2) + timestampHeight
  const bubbleWidth = Math.min(
    bubbleMaxWidth,
    Math.max(
      ctx.measureText(lines[0]).width + (bubblePadding * 2),
      ...lines.map(line => ctx.measureText(line).width + (bubblePadding * 2))
    )
  )

  const bubbleX = x - (bubbleWidth / 2)
  const bubbleY = y - CHARACTER_SIZE_SCALED - bubbleHeight - (10 * scale)
  const radius = 8 * scale
  const tailWidth = 10 * scale
  const tailHeight = 10 * scale
  const tailX = x - (tailWidth / 2)

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return ''
    const date = new Date(timestamp)
    return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <>
      <path
        d={`
          M ${bubbleX + radius} ${bubbleY}
          L ${bubbleX + bubbleWidth - radius} ${bubbleY}
          Q ${bubbleX + bubbleWidth} ${bubbleY} ${bubbleX + bubbleWidth} ${bubbleY + radius}
          L ${bubbleX + bubbleWidth} ${bubbleY + bubbleHeight - radius}
          Q ${bubbleX + bubbleWidth} ${bubbleY + bubbleHeight} ${bubbleX + bubbleWidth - radius} ${bubbleY + bubbleHeight}
          L ${bubbleX + radius} ${bubbleY + bubbleHeight}
          Q ${bubbleX} ${bubbleY + bubbleHeight} ${bubbleX} ${bubbleY + bubbleHeight - radius}
          L ${bubbleX} ${bubbleY + radius}
          Q ${bubbleX} ${bubbleY} ${bubbleX + radius} ${bubbleY}
          Z
        `}
        fill="#ffffff"
        stroke="#cccccc"
        strokeWidth={1}
      />
      <path
        d={`
          M ${tailX} ${bubbleY + bubbleHeight}
          L ${x} ${bubbleY + bubbleHeight + tailHeight}
          L ${tailX + tailWidth} ${bubbleY + bubbleHeight}
          Z
        `}
        fill="#ffffff"
        stroke="#cccccc"
        strokeWidth={1}
      />
      {lines.map((line, index) => (
        <text
          key={index}
          x={x}
          y={bubbleY + bubblePadding + (index * lineHeight)}
          fontSize={bubbleFontSize}
          fontFamily="Arial"
          fill="#000000"
          textAnchor="middle"
          dominantBaseline="top"
        >
          {line}
        </text>
      ))}
      {chatData?.timestamp && (
        <text
          x={bubbleX + bubbleWidth - bubblePadding}
          y={bubbleY + bubblePadding + (lines.length * lineHeight) + (2 * scale)}
          fontSize={timestampFontSize}
          fontFamily="Arial"
          fill="#888888"
          textAnchor="end"
          dominantBaseline="top"
        >
          {formatTimestamp(chatData.timestamp)}
        </text>
      )}
    </>
  )
}

ChatBubble.propTypes = {
  chatData: PropTypes.shape({
    message: PropTypes.string,
    timestamp: PropTypes.number
  }),
  x: PropTypes.number.isRequired,
  y: PropTypes.number.isRequired,
  scale: PropTypes.number.isRequired
}