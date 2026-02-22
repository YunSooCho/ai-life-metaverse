import PropTypes from 'prop-types'

export default function ChatBubble({ chatData, x, y, scale }) {
  if (!chatData?.message) return null

  const messageText = chatData.message
  const bubbleMaxWidth = 150 * scale
  const bubblePadding = 10 * scale
  const bubbleFontSize = 11 * scale
  const timestampFontSize = 9 * scale
  const CHARACTER_SIZE = 40
  const CHARACTER_SIZE_SCALED = CHARACTER_SIZE * scale

  const words = messageText.split('')
  const lines = []
  let currentLine = ''

  // Canvas context for text width calculation (fallback for test environment)
  const ctx = document.createElement('canvas').getContext('2d')
  const useCanvas = ctx !== null

  if (useCanvas) {
    ctx.font = `${bubbleFontSize}px 'Press Start 2P', monospace`
  }

  for (const char of words) {
    const testLine = currentLine + char
    let lineWidth = 0

    if (useCanvas) {
      const metrics = ctx.measureText(testLine)
      lineWidth = metrics.width
    } else {
      // Fallback: simple character count estimation for test environment
      lineWidth = testLine.length * (bubbleFontSize * 0.6)
    }

    if (lineWidth > bubbleMaxWidth - (bubblePadding * 2) && currentLine !== '') {
      lines.push(currentLine)
      currentLine = char
    } else {
      currentLine = testLine
    }
  }
  lines.push(currentLine)

  const lineHeight = bubbleFontSize * 1.8
  const timestampHeight = chatData?.timestamp ? (timestampFontSize + 6 * scale) : 0
  const bubbleHeight = (lines.length * lineHeight) + (bubblePadding * 2) + timestampHeight

  // Calculate bubble width (with fallback for test environment)
  let bubbleWidth
  if (useCanvas) {
    bubbleWidth = Math.min(
      bubbleMaxWidth,
      Math.max(
        ctx.measureText(lines[0]).width + (bubblePadding * 2),
        ...lines.map(line => ctx.measureText(line).width + (bubblePadding * 2))
      )
    )
  } else {
    // Fallback: use character count estimation
    const estimatedLineLengths = lines.map(line => line.length * (bubbleFontSize * 0.6) + (bubblePadding * 2))
    bubbleWidth = Math.min(bubbleMaxWidth, Math.max(...estimatedLineLengths))
  }

  const bubbleX = x - (bubbleWidth / 2)
  const bubbleY = y - CHARACTER_SIZE_SCALED - bubbleHeight - (12 * scale)

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return ''
    const date = new Date(timestamp)
    return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <>
      {/* Pixel Art Chat Bubble Body */}
      <rect
        x={bubbleX}
        y={bubbleY}
        width={bubbleWidth}
        height={bubbleHeight}
        fill="#ffffff"
        stroke="#000000"
        strokeWidth={2 * scale}
        rx={0} // Pixel style: no rounded corners
      />

      {/* Pixel Art Chat Bubble Tail */}
      <path
        d={`
          M ${x - 6 * scale} ${bubbleY + bubbleHeight}
          L ${x} ${bubbleY + bubbleHeight + 8 * scale}
          L ${x + 6 * scale} ${bubbleY + bubbleHeight}
          Z
        `}
        fill="#ffffff"
        stroke="#000000"
        strokeWidth={2 * scale}
      />

      {/* Chat Message Lines */}
      {lines.map((line, index) => (
        <text
          key={index}
          x={x}
          y={bubbleY + bubblePadding + (index * lineHeight)}
          fontSize={bubbleFontSize}
          fontFamily="'Press Start 2P', monospace"
          fill="#000000"
          textAnchor="middle"
          dominantBaseline="top"
          letterSpacing={0.05}
        >
          {line}
        </text>
      ))}

      {/* Timestamp */}
      {chatData?.timestamp && (
        <text
          x={bubbleX + bubbleWidth - bubblePadding}
          y={bubbleY + bubblePadding + (lines.length * lineHeight) + (4 * scale)}
          fontSize={timestampFontSize}
          fontFamily="'Press Start 2P', monospace"
          fill="#888888"
          textAnchor="end"
          dominantBaseline="top"
          letterSpacing={0.05}
        >
          {formatTimestamp(chatData.timestamp)}
        </text>
      )}

      {/* Border Highlight (Pixel style) */}
      <rect
        x={bubbleX + 2 * scale}
        y={bubbleY + 2 * scale}
        width={bubbleWidth - 4 * scale}
        height={Math.max(0, bubbleHeight - 4 * scale)}
        fill="none"
        stroke="#e0e0e0"
        strokeWidth={1 * scale}
        opacity={0.3}
      />
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