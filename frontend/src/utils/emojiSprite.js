/**
 * 감정 이모지 스프라이트 시스템
 * 16가지 감정을 픽셀아트 텍스트 이모지로 렌더링
 */

// 감정 타입 (16종)
export const EMOTIONS = {
  HAPPY: 'happy',
  SAD: 'sad',
  ANGRY: 'angry',
  SURPRISED: 'surprised',
  NEUTRAL: 'neutral',
  LOVE: 'love',
  HATE: 'hate',
  FEAR: 'fear',
  EXCITED: 'excited',
  TIRED: 'tired',
  CONFUSED: 'confused',
  PROUD: 'proud',
  SHY: 'shy',
  EMBARRASSED: 'embarrassed',
  CURIOUS: 'curious',
  DISGUSTED: 'disgusted'
}

// 감정별 이모지 + 색상
const EMOTION_CONFIG = {
  [EMOTIONS.HAPPY]: { emoji: '😊', color: '#FFD700', label: 'HAPPY' },
  [EMOTIONS.SAD]: { emoji: '😢', color: '#4A90D9', label: 'SAD' },
  [EMOTIONS.ANGRY]: { emoji: '😠', color: '#FF4444', label: 'ANGRY' },
  [EMOTIONS.SURPRISED]: { emoji: '😲', color: '#FF8C00', label: '!?' },
  [EMOTIONS.NEUTRAL]: { emoji: '😐', color: '#AAAAAA', label: '' },
  [EMOTIONS.LOVE]: { emoji: '😍', color: '#FF69B4', label: '♥' },
  [EMOTIONS.HATE]: { emoji: '😤', color: '#8B0000', label: '💢' },
  [EMOTIONS.FEAR]: { emoji: '😨', color: '#9370DB', label: '!!' },
  [EMOTIONS.EXCITED]: { emoji: '🤩', color: '#FFD700', label: '★' },
  [EMOTIONS.TIRED]: { emoji: '😴', color: '#6B7B8D', label: 'zzz' },
  [EMOTIONS.CONFUSED]: { emoji: '🤔', color: '#DEB887', label: '?' },
  [EMOTIONS.PROUD]: { emoji: '😎', color: '#32CD32', label: '✧' },
  [EMOTIONS.SHY]: { emoji: '😳', color: '#FFB6C1', label: '...' },
  [EMOTIONS.EMBARRASSED]: { emoji: '🫣', color: '#FF6B6B', label: '//' },
  [EMOTIONS.CURIOUS]: { emoji: '🧐', color: '#00CED1', label: '?' },
  [EMOTIONS.DISGUSTED]: { emoji: '🤢', color: '#556B2F', label: '><' }
}

/**
 * 감정 설정 반환
 */
export function getEmotionConfig(emotion) {
  return EMOTION_CONFIG[emotion] || EMOTION_CONFIG[EMOTIONS.NEUTRAL]
}

/**
 * 호감도에 따른 감정 자동 결정
 */
export function getEmotionFromAffinity(affinity) {
  if (affinity >= 80) return EMOTIONS.LOVE
  if (affinity >= 60) return EMOTIONS.HAPPY
  if (affinity >= 40) return EMOTIONS.EXCITED
  if (affinity >= 20) return EMOTIONS.NEUTRAL
  if (affinity >= 0) return EMOTIONS.CONFUSED
  if (affinity >= -20) return EMOTIONS.SAD
  return EMOTIONS.ANGRY
}

/**
 * 감정 이모지를 Canvas에 렌더링
 * @param {CanvasRenderingContext2D} ctx
 * @param {string} emotion - 감정 타입
 * @param {number} x - 캐릭터 중심 X
 * @param {number} y - 캐릭터 상단 Y
 * @param {number} scale - 스케일
 * @param {number} timestamp - 애니메이션용 타임스탬프
 */
export function renderEmotionEmoji(ctx, emotion, x, y, scale, timestamp) {
  const config = getEmotionConfig(emotion)
  if (!config || emotion === EMOTIONS.NEUTRAL) return // neutral은 표시 안 함

  const emojiSize = 20 * scale
  const bounceOffset = Math.sin(timestamp / 300) * 3 * scale // bounce 애니메이션
  const emojiY = y - 15 * scale + bounceOffset

  ctx.save()

  // 감정 배경 원
  ctx.beginPath()
  ctx.arc(x, emojiY, emojiSize / 2 + 2 * scale, 0, Math.PI * 2)
  ctx.fillStyle = 'rgba(0, 0, 0, 0.4)'
  ctx.fill()

  // 이모지 렌더링
  ctx.font = `${emojiSize}px Arial`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(config.emoji, x, emojiY)

  // 라벨 (짧은 텍스트)
  if (config.label) {
    ctx.font = `${8 * scale}px 'Press Start 2P', monospace`
    ctx.fillStyle = config.color
    ctx.shadowColor = '#000000'
    ctx.shadowBlur = 2
    ctx.fillText(config.label, x, emojiY - emojiSize / 2 - 5 * scale)
    ctx.shadowBlur = 0
  }

  ctx.restore()
}

/**
 * 감정 변화 팝인 애니메이션 렌더링
 */
export function renderEmotionPopIn(ctx, emotion, x, y, scale, progress) {
  if (progress >= 1) return
  const config = getEmotionConfig(emotion)

  const popScale = progress < 0.5
    ? 1 + Math.sin(progress * Math.PI) * 0.5  // 커졌다가
    : 1 + (1 - progress) * 0.3                 // 줄어듦

  const alpha = Math.min(1, progress * 2)

  ctx.save()
  ctx.globalAlpha = alpha

  const emojiSize = 24 * scale * popScale
  ctx.font = `${emojiSize}px Arial`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(config.emoji, x, y - 20 * scale)

  ctx.globalAlpha = 1
  ctx.restore()
}
