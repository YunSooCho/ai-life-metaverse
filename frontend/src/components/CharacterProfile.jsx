import PropTypes from 'prop-types'
import { getExpPercentage, getExpToNextLevel } from '../utils/characterStatusSystem'
import { useI18n } from '../i18n/I18nContext'

/**
 * 캐릭터 프로필 카드 컴포넌트
 * 캐릭터 클릭 시 나타나는 프로필 정보 표시
 */
export default function CharacterProfile({ character, affinity, isVisible, onClose, scale = 1 }) {
  const { t } = useI18n()
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
    if (aff <= 2) return t('ui.affinity.stranger')
    if (aff >= 3 && aff < 8) return t('ui.affinity.friendly')
    return t('ui.affinity.veryFriendly')
  }

  const getActivityText = (char) => {
    if (char.isConversing) return t('ui.profile.conversing')
    if (char.buildingId) return t('ui.profile.inBuilding')
    return t('ui.profile.moving')
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

      {/* 이름 & 레벨 */}
      <div
        style={{
          fontSize: `${headerFontSize}px`,
          fontFamily: "'Courier New', monospace",
          fontWeight: 'bold',
          color: '#ffffff',
          textAlign: 'center',
          marginBottom: `${4 * scale}px`
        }}
      >
        {character.name || t('app.anonymous')}
        {character.level && (
          <span
            style={{
              marginLeft: `${8 * scale}px`,
              color: '#ffcc00',
              fontSize: `${(headerFontSize - 2) * scale}px`
            }}
          >
            Lv.{character.level}
          </span>
        )}
      </div>

      {/* 경험치 바 */}
      {character.exp !== undefined && character.level !== undefined && character.level < 100 && (
        <div
          style={{
            marginBottom: `${12 * scale}px`
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: `${(fontSize - 1) * scale}px`,
              fontFamily: "'Courier New', monospace",
              color: '#aaffaa',
              marginBottom: `${2 * scale}px`
            }}
          >
            <span>EXP</span>
            <span>{getExpPercentage(character)}% / {getExpToNextLevel(character)}</span>
          </div>
          <div
            style={{
              width: '100%',
              height: `${10 * scale}px`,
              backgroundColor: '#2a2a4e',
              borderRadius: '6px',
              overflow: 'hidden',
              border: '2px solid #4a4a6a'
            }}
          >
            <div
              style={{
                width: `${getExpPercentage(character)}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #00aaaa, #00ffaa)',
                transition: 'width 0.5s ease'
              }}
            />
          </div>
        </div>
      )}

      {/* 최대 레벨 안내 */}
      {character.level >= 100 && (
        <div
          style={{
            fontSize: `${fontSize}px`,
            fontFamily: "'Courier New', monospace",
            color: '#ffcc00',
            textAlign: 'center',
            marginBottom: `${12 * scale}px`
          }}
        >
          {t('ui.profile.maxLevel')}
        </div>
      )}

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
          {t('ui.profile.emotion')}: {character.emotion.emoji || '😐'}
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
          <span>{t('ui.affinity.label')}</span>
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
          🤖 {t('app.aiCharacter')}
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