/**
 * 시각 FX 시스템
 * 점프 먼지, 하트 파티클, 리플 이펙트 등
 */

/**
 * FX 타입
 */
export const FX_TYPES = {
  DUST: 'dust',           // 점프/이동 먼지
  HEART: 'heart',         // 호감도 상승
  ANGER: 'anger',         // 감정 하락
  RIPPLE: 'ripple',       // 클릭 리플
  SPARKLE: 'sparkle',     // 레벨업/보상
  LOADING: 'loading'      // 대기/로딩
}

/**
 * FX 파티클 생성
 */
export function createFxParticle(type, x, y) {
  return {
    type,
    x,
    y,
    startTime: Date.now(),
    duration: getFxDuration(type),
    particles: generateFxParticles(type, x, y)
  }
}

function getFxDuration(type) {
  const durations = {
    [FX_TYPES.DUST]: 400,
    [FX_TYPES.HEART]: 800,
    [FX_TYPES.ANGER]: 600,
    [FX_TYPES.RIPPLE]: 500,
    [FX_TYPES.SPARKLE]: 1000,
    [FX_TYPES.LOADING]: 2000
  }
  return durations[type] || 500
}

function generateFxParticles(type, x, y) {
  switch (type) {
    case FX_TYPES.DUST:
      return Array.from({ length: 5 }, () => ({
        x: x + (Math.random() - 0.5) * 20,
        y: y + Math.random() * 10,
        vx: (Math.random() - 0.5) * 3,
        vy: -Math.random() * 2,
        size: 2 + Math.random() * 3,
        color: '#8B7355'
      }))

    case FX_TYPES.HEART:
      return Array.from({ length: 3 }, (_, i) => ({
        x: x + (i - 1) * 15,
        y: y,
        vy: -1.5 - Math.random(),
        size: 12 + Math.random() * 8,
        opacity: 1
      }))

    case FX_TYPES.ANGER:
      return Array.from({ length: 4 }, () => ({
        x: x + (Math.random() - 0.5) * 30,
        y: y - 10 - Math.random() * 20,
        size: 8 + Math.random() * 6,
        angle: Math.random() * Math.PI * 2,
        opacity: 1
      }))

    case FX_TYPES.RIPPLE:
      return [{ x, y, radius: 0, maxRadius: 40, opacity: 1 }]

    case FX_TYPES.SPARKLE:
      return Array.from({ length: 6 }, () => ({
        x: x + (Math.random() - 0.5) * 40,
        y: y + (Math.random() - 0.5) * 40,
        vy: -1 - Math.random(),
        size: 4 + Math.random() * 4,
        opacity: 1,
        twinkle: Math.random() * Math.PI * 2
      }))

    default:
      return []
  }
}

/**
 * FX 렌더링
 */
export function renderFx(ctx, fx, scale) {
  const elapsed = Date.now() - fx.startTime
  const progress = Math.min(1, elapsed / fx.duration)
  if (progress >= 1) return false // 삭제 신호

  ctx.save()

  switch (fx.type) {
    case FX_TYPES.DUST:
      renderDust(ctx, fx, progress, scale)
      break
    case FX_TYPES.HEART:
      renderHearts(ctx, fx, progress, scale)
      break
    case FX_TYPES.ANGER:
      renderAnger(ctx, fx, progress, scale)
      break
    case FX_TYPES.RIPPLE:
      renderRipple(ctx, fx, progress, scale)
      break
    case FX_TYPES.SPARKLE:
      renderSparkle(ctx, fx, progress, scale)
      break
  }

  ctx.restore()
  return true // 계속 렌더링
}

function renderDust(ctx, fx, progress, scale) {
  ctx.globalAlpha = 1 - progress
  fx.particles.forEach(p => {
    const px = (p.x + p.vx * progress * 10) * scale
    const py = (p.y + p.vy * progress * 10) * scale
    ctx.fillStyle = p.color
    ctx.fillRect(px, py, p.size * scale, p.size * scale)
  })
}

function renderHearts(ctx, fx, progress, scale) {
  fx.particles.forEach(p => {
    const py = (p.y + p.vy * progress * 30) * scale
    ctx.globalAlpha = 1 - progress
    ctx.font = `${p.size * scale}px Arial`
    ctx.textAlign = 'center'
    ctx.fillText('💗', p.x * scale, py)
  })
}

function renderAnger(ctx, fx, progress, scale) {
  ctx.globalAlpha = 1 - progress
  fx.particles.forEach(p => {
    const shakeX = Math.sin(progress * 20 + p.angle) * 3 * scale
    ctx.font = `${p.size * scale}px Arial`
    ctx.textAlign = 'center'
    ctx.fillText('💢', (p.x * scale) + shakeX, p.y * scale)
  })
}

function renderRipple(ctx, fx, progress, scale) {
  const p = fx.particles[0]
  const radius = p.maxRadius * progress * scale
  ctx.globalAlpha = 1 - progress
  ctx.strokeStyle = '#ffffff'
  ctx.lineWidth = 2 * scale
  ctx.beginPath()
  ctx.arc(p.x * scale, p.y * scale, radius, 0, Math.PI * 2)
  ctx.stroke()
}

function renderSparkle(ctx, fx, progress, scale) {
  fx.particles.forEach(p => {
    const py = (p.y + p.vy * progress * 20) * scale
    const twinkle = Math.sin(performance.now() / 100 + p.twinkle)
    ctx.globalAlpha = (1 - progress) * (twinkle > 0 ? 1 : 0.3)
    ctx.fillStyle = '#FFD700'
    // 4각 별 모양
    const s = p.size * scale
    ctx.fillRect(p.x * scale - s / 2, py - 1, s, 2)
    ctx.fillRect(p.x * scale - 1, py - s / 2, 2, s)
  })
}

/**
 * 호감도 변화에 따른 FX 타입 결정
 */
export function getFxForAffinityChange(change) {
  if (change > 0) return FX_TYPES.HEART
  if (change < 0) return FX_TYPES.ANGER
  return null
}
