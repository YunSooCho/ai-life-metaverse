import PropTypes from 'prop-types'

/**
 * 캐릭터 프로필 카드 컴포넌트
 * 캐릭터 클릭 시 나타나는 프로필 정보 표시
 */
export default function CharacterProfile({ character, affinity, isVisible, onClose, scale = 1 }) {
  if (!isVisible || !character) {
    return null
  }

  const cardWidth = 200 * scale
  const cardHeight = 280 * scale
  const padding = 16 * scale
  const fontSize = 12 * scale
  const headerFontSize = 16 * scale

  const getAffinityColor = (aff) => {
    if (aff <= 2) return '#ff4444'
    if (aff >= 3 && aff < 8) return '#ff8800'
    return '#00cc44'
  }

  const getAffinityLabel = (aff) => {
    if (aff <= 2) return '낯설음'
    if (aff >= 3 && aff < 8) return '친근'
    return '매우 친근'
  }

  const getActivityText = (char) => {
    if (char.isConversing) return '대화 중...'
    if (char.buildingId) return '건물에 있음'
    return '이동 중'
  }

  return (
    <div
      style={{
        position: 'absolute',
        top: `${character.y * scale - cardHeight / 2 - 50 * scale}px`,
        left: `${character.x * scale - cardWidth / 2}px`,
        width: `${cardWidth}px`,
        height: `${cardHeight}px`,
        backgroundColor: '#1a1a2e',
        border: '3px solid #4a4a6a',
        borderRadius: '8px',
        padding: `${padding}px`,
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.5)',
        zIndex: 1000,
        cursor: 'pointer',
        imageSmoothingEnabled: 'false' // 픽셀 아트 스타일
      }}
      onClick={onClose}
    >
      {/* 닫기 버튼 */}
      <div
        style={{
          position: 'absolute',
          top: `${8 * scale}px`,
          right: `${8 * scale}px`,
          fontSize: `${14 * scale}px`,
          color: '#ff6666',
          cursor: 'pointer',
          fontWeight: 'bold'
        }}
        onClick={(e) => {
          e.stopPropagation()
          onClose()
        }}
      >
        ✕
      </div>

      {/* 캐릭터 이모지 */}
      <div
        style={{
          textAlign: 'center',
          fontSize: `${48 * scale}px`,
          marginBottom: `${8 * scale}px`
        }}
      >
        {character.emoji}
      </div>

      {/* 이름 */}
      <div
        style={{
          fontSize: `${headerFontSize}px`,
          fontFamily: "'Courier New', monospace",
          fontWeight: 'bold',
          color: '#ffffff',
          textAlign: 'center',
          marginBottom: `${12 * scale}px`
        }}
      >
        {character.name || '익명'}
      </div>

      {/* 감정 이모지 */}
      {character.emotion && (
        <div
          style={{
            fontSize: `${fontSize}px`,
            fontFamily: "'Courier New', monospace",
            color: '#cccccc',
            textAlign: 'center',
            marginBottom: `${12 * scale}px`
          }}
        >
          감정: {character.emotion.emoji || '😐'}
        </div>
      )}

      {/* 호감도 바 */}
      <div
        style={{
          marginBottom: `${12 * scale}px`
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: `${fontSize}px`,
            fontFamily: "'Courier New', monospace",
            color: '#ffffff',
            marginBottom: `${4 * scale}px`
          }}
        >
          <span>호감도</span>
          <span
            style={{
              color: getAffinityColor(affinity)
            }}
          >
            {affinity} ({getAffinityLabel(affinity)})
          </span>
        </div>
        <div
          style={{
            width: '100%',
            height: `${12 * scale}px`,
            backgroundColor: '#2a2a4e',
            borderRadius: '6px',
            overflow: 'hidden',
            border: '2px solid #4a4a6a'
          }}
        >
          <div
            style={{
              width: `${Math.min(100, (affinity / 10) * 100)}%`,
              height: '100%',
              backgroundColor: getAffinityColor(affinity),
              transition: 'width 0.3s ease'
            }}
          />
        </div>
      </div>

      {/* 현재 활동 상태 */}
      <div
        style={{
          fontSize: `${fontSize}px`,
          fontFamily: "'Courier New', monospace",
          color: '#aaaaaa',
          textAlign: 'center',
          marginBottom: `${8 * scale}px`
        }}
      >
        📍 {getActivityText(character)}
      </div>

      {/* AI 표시 */}
      {character.isAi && (
        <div
          style={{
            fontSize: `${fontSize}px`,
            fontFamily: "'Courier New', monospace",
            color: '#ff6b6b',
            textAlign: 'center'
          }}
        >
          🤖 AI 캐릭터
        </div>
      )}
    </div>
  )
}

CharacterProfile.propTypes = {
  character: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string,
    emoji: PropTypes.string.isRequired,
    isAi: PropTypes.bool.isRequired,
    isConversing: PropTypes.bool,
    buildingId: PropTypes.string,
    emotion: PropTypes.shape({
      type: PropTypes.string,
      emoji: PropTypes.string
    })
  }).isRequired,
  affinity: PropTypes.number.isRequired,
  isVisible: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  scale: PropTypes.number
}