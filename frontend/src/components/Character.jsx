// 캐릭터 컴포넌트 - 픽셀 아트 스프라이트 애니메이션 지원
import PropTypes from 'prop-types'
import { useState, useEffect, useRef } from 'react'
import { useI18n } from '../i18n/I18nContext'
import characterSpriteRenderer from '../utils/characterSpriteRenderer.js'
import { globalMovementHistoryManager } from '../utils/MovementHistory.js'

const CHARACTER_SIZE = 40

function getAffinityColor(affinity) {
  if (affinity <= 2) return '#ff4444'
  if (affinity >= 3 && affinity < 8) return '#ff8800'
  return '#00cc44'
}

export default function Character({ char, myCharacterId, affinities, chatMessages, scale }) {
  const { t } = useI18n()
  const { x, y, color, emoji, name, isAi, id, emotion } = char
  const scaledX = x * scale
  const scaledY = y * scale
  const CHARACTER_SIZE_SCALED = CHARACTER_SIZE * scale
  const displayName = name || t('app.anonymous')  // Fallback: name이 undefined이면 익명 표시

  // 이동 상태 추적 (MovementHistory 사용)
  const [isMoving, setIsMoving] = useState(false)
  const [direction, setDirection] = useState('down')

  // MovementHistory ref 초기화
  const movementInitializedRef = useRef(false)

  // MovementHistory로 위치 등록
  useEffect(() => {
    // 첫 위치 등록
    if (!movementInitializedRef.current) {
      globalMovementHistoryManager.addPosition(id, x, y)
      movementInitializedRef.current = true
    }

    // 현재 위치 등록
    globalMovementHistoryManager.addPosition(id, x, y)

    // MovementHistory에서 이동 상태 및 방향 계산
    const history = globalMovementHistoryManager.getHistory(id)
    setIsMoving(history.isMoving())
    setDirection(history.getDirection())

    // Cleanup: 캐릭터가 사라지면 히스토리 제거
    return () => {
      globalMovementHistoryManager.remove(id)
    }
  }, [x, y, id])

  // 스플라이트 시트 초기 로드
  useEffect(() => {
    const loadSprites = async () => {
      await characterSpriteRenderer.loadSpriteSheet()
    }
    loadSprites()

    // cleanup
    return () => {
      characterSpriteRenderer.removeController(id)
    }
  }, [id])

  // Canvas에서 스프라이트 렌더링을 위한 ref
  // (현재는 JSX 기반으로 표시, 추후 Canvas 통합 시 필요)

  return (
    <>
      {/* 캐릭터 스프라이트 렌더링 (Canvas 기반) */}
      {/* Note: GameCanvas.jsx에서 실제 Canvas 렌더링을 수행 */}

      {/* 하위 호환성: 기존 SVG 기반 캐릭터 표시 */}
      {/* 스프라이트가 로드되지 않았거나 Canvas 통합 전까지 사용 */}
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

// 스프라이트 렌더링을 위한 헬퍼 함수 (GameCanvas에서 사용)
// MovementHistory를 사용하여 이동 상태 및 방향 결정
export function renderCharacterSprite(canvas, char, scale, timestamp) {
  const ctx = canvas.getContext('2d')
  const { x, y, id } = char
  const scaledX = x * scale
  const scaledY = y * scale
  const size = CHARACTER_SIZE * scale

  // MovementHistory에서 이동 상태 및 방향 결정
  const history = globalMovementHistoryManager.getHistory(id)
  const isMoving = history ? history.isMoving() : false
  const direction = history ? history.getDirection() : 'down'

  // 스프라이트 렌더링
  characterSpriteRenderer.render(ctx, id, scaledX, scaledY, size, isMoving, direction, timestamp)

  return { isMoving, direction }
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