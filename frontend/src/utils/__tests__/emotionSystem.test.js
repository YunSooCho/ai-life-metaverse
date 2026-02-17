/**
 * 감정 시스템 & FX 시스템 테스트
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  EMOTION_TYPES,
  EMOTION_EMOJIS,
  EMOTION_COLORS,
  EMOTION_DURATION,
  getAutoEmotionAffinity,
  EmotionSystem,
  FX_TYPES,
  FXEffect,
  FXSystem
} from '../emotionSystem'

describe('감정 시스템 - EMOTION_TYPES', () => {
  it('16개 감정 타입이 정의되어 있어야 함', () => {
    expect(Object.keys(EMOTION_TYPES).length).toBe(16)
  })

  it('필수 감정 타입이 존재해야 함', () => {
    expect(EMOTION_TYPES.HAPPY).toBe('happy')
    expect(EMOTION_TYPES.SAD).toBe('sad')
    expect(EMOTION_TYPES.ANGRY).toBe('angry')
    expect(EMOTION_TYPES.SURPRISED).toBe('surprised')
    expect(EMOTION_TYPES.NEUTRAL).toBe('neutral')
    expect(EMOTION_TYPES.LOVE).toBe('love')
    expect(EMOTION_TYPES.HATE).toBe('hate')
    expect(EMOTION_TYPES.FEAR).toBe('fear')
    expect(EMOTION_TYPES.EXCITED).toBe('excited')
    expect(EMOTION_TYPES.TIRED).toBe('tired')
    expect(EMOTION_TYPES.CONFUSED).toBe('confused')
    expect(EMOTION_TYPES.PROUD).toBe('proud')
    expect(EMOTION_TYPES.SHY).toBe('shy')
    expect(EMOTION_TYPES.EMBARRASSED).toBe('embarrassed')
    expect(EMOTION_TYPES.CURIOUS).toBe('curious')
    expect(EMOTION_TYPES.DISGUSTED).toBe('disgusted')
  })
})

describe('감정 시스템 - EMOTION_EMOJIS', () => {
  it('16개 감정 이모지가 정의되어 있어야 함', () => {
    expect(Object.keys(EMOTION_EMOJIS).length).toBe(16)
  })

  it('이모지가 올바르게 매핑되어 있어야 함', () => {
    expect(EMOTION_EMOJIS[EMOTION_TYPES.HAPPY]).toBe('😊')
    expect(EMOTION_EMOJIS[EMOTION_TYPES.SAD]).toBe('😢')
    expect(EMOTION_EMOJIS[EMOTION_TYPES.LOVE]).toBe('❤️')
  })
})

describe('감정 시스템 - EMOTION_COLORS', () => {
  it('16개 감정 색상이 정의되어 있어야 함', () => {
    expect(Object.keys(EMOTION_COLORS).length).toBe(16)
  })

  it('색상이 헥스 코드여야 함', () => {
    Object.values(EMOTION_COLORS).forEach(color => {
      expect(color).toMatch(/^#[0-9A-Fa-f]{6}$/)
    })
  })
})

describe('감정 시스템 - EMOTION_DURATION', () => {
  it('16개 감정 지속 시간이 정의되어 있어야 함', () => {
    expect(Object.keys(EMOTION_DURATION).length).toBe(16)
  })

  it('지속 시간이 100ms 이상이어야 함', () => {
    Object.values(EMOTION_DURATION).forEach(duration => {
      expect(duration).toBeGreaterThanOrEqual(100)
    })
  })
})

describe('감정 시스템 - getAutoEmotionAffinity', () => {
  it('호감도 80 이상이면 LOVE 감정을 반환해야 함', () => {
    expect(getAutoEmotionAffinity(80)).toBe(EMOTION_TYPES.LOVE)
    expect(getAutoEmotionAffinity(100)).toBe(EMOTION_TYPES.LOVE)
  })

  it('호감도 60~79이면 HAPPY 감정을 반환해야 함', () => {
    expect(getAutoEmotionAffinity(60)).toBe(EMOTION_TYPES.HAPPY)
    expect(getAutoEmotionAffinity(75)).toBe(EMOTION_TYPES.HAPPY)
  })

  it('호감도 40~59이면 NEUTRAL 감정을 반환해야 함', () => {
    expect(getAutoEmotionAffinity(40)).toBe(EMOTION_TYPES.NEUTRAL)
    expect(getAutoEmotionAffinity(55)).toBe(EMOTION_TYPES.NEUTRAL)
  })

  it('호감도 20~39이면 CONFUSED 감정을 반환해야 함', () => {
    expect(getAutoEmotionAffinity(20)).toBe(EMOTION_TYPES.CONFUSED)
    expect(getAutoEmotionAffinity(35)).toBe(EMOTION_TYPES.CONFUSED)
  })

  it('호감도 19 이하이면 SAD 감정을 반환해야 함', () => {
    expect(getAutoEmotionAffinity(0)).toBe(EMOTION_TYPES.SAD)
    expect(getAutoEmotionAffinity(19)).toBe(EMOTION_TYPES.SAD)
  })
})

describe('EmotionSystem 클래스', () => {
  let emotionSystem

  beforeEach(() => {
    emotionSystem = new EmotionSystem()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('초기화 시 감정 맵이 비어 있어야 함', () => {
    expect(emotionSystem.activeEmotions.size).toBe(0)
    expect(emotionSystem.emotionTimers.size).toBe(0)
  })

  it('감정을 설정할 수 있어야 함', () => {
    const emotion = emotionSystem.setEmotion('char1', EMOTION_TYPES.HAPPY)
    expect(emotion.type).toBe(EMOTION_TYPES.HAPPY)
    expect(emotion.emoji).toBe('😊')
    expect(emotion.color).toBe('#FFD93D')
    expect(emotionSystem.activeEmotions.has('char1')).toBe(true)
  })

  it('감정을 가져올 수 있어야 함', () => {
    emotionSystem.setEmotion('char1', EMOTION_TYPES.SAD)
    const emotion = emotionSystem.getEmotion('char1')
    expect(emotion.type).toBe(EMOTION_TYPES.SAD)
  })

  it('존재하지 않는 감정을 가져오면 null을 반환해야 함', () => {
    expect(emotionSystem.getEmotion('nonexistent')).toBeNull()
  })

  it('감정을 클리어할 수 있어야 함', () => {
    emotionSystem.setEmotion('char1', EMOTION_TYPES.HAPPY)
    expect(emotionSystem.activeEmotions.has('char1')).toBe(true)
    
    emotionSystem.clearEmotion('char1')
    expect(emotionSystem.activeEmotions.has('char1')).toBe(false)
  })

  it('감정이 지속 시간 이후 자동으로 클리어되어야 함', () => {
    const duration = EMOTION_DURATION.HAPPY
    emotionSystem.setEmotion('char1', EMOTION_TYPES.HAPPY)
    expect(emotionSystem.activeEmotions.has('char1')).toBe(true)
    
    // 수동으로 시간 경과 시뮬레이션
    vi.advanceTimersByTime(duration + 100)
    
    // 타이머가 호출될 때까지 기다림
    vi.runAllTimers()
    
    expect(emotionSystem.activeEmotions.has('char1')).toBe(false)
  })

  it('애니메이션 진행도를 계산할 수 있어야 함', () => {
    // emotion 객체를 직접 생성하여 테스트
    const testEmotion = {
      type: EMOTION_TYPES.HAPPY,
      startTime: Date.now(),
      duration: 3000
    }
    
    emotionSystem.activeEmotions.set('char1', testEmotion)
    
    // progress가 0~1 범위 내에 있는지 확인
    const progress = emotionSystem.getAnimationProgress('char1')
    expect(progress).toBeGreaterThanOrEqual(0)
    expect(progress).toBeLessThanOrEqual(1)
  })

  it('바운스 오프셋을 계산할 수 있어야 함', () => {
    emotionSystem.setEmotion('char1', EMOTION_TYPES.HAPPY)
    
    const offset = emotionSystem.getBounceOffset('char1')
    expect(offset).toHaveProperty('x')
    expect(offset).toHaveProperty('y')
  })

  it('모든 감정을 클리어할 수 있어야 함', () => {
    emotionSystem.setEmotion('char1', EMOTION_TYPES.HAPPY)
    emotionSystem.setEmotion('char2', EMOTION_TYPES.SAD)
    expect(emotionSystem.activeEmotions.size).toBe(2)
    
    emotionSystem.clearAll()
    expect(emotionSystem.activeEmotions.size).toBe(0)
    expect(emotionSystem.emotionTimers.size).toBe(0)
  })

  it('감정 유효성을 체크할 수 있어야 함', () => {
    expect(emotionSystem.isValidEmotion(EMOTION_TYPES.HAPPY)).toBe(true)
    expect(emotionSystem.isValidEmotion('invalid_emotion')).toBe(false)
  })

  it('호감도에 따른 자동 감정 설정이 작동해야 함', () => {
    const emotion = emotionSystem.setAutoEmotionByAffinity('char1', 85)
    expect(emotion.type).toBe(EMOTION_TYPES.LOVE)
    expect(emotionSystem.activeEmotions.has('char1')).toBe(true)
  })
})

describe('FX 시스템 - FX_TYPES', () => {
  it('모든 FX 타입이 정의되어 있어야 함', () => {
    expect(FX_TYPES.JUMP_DUST).toBe('jump_dust')
    expect(FX_TYPES.HEART_RISE).toBe('heart_rise')
    expect(FX_TYPES.AFFINITY_UP).toBe('affinity_up')
    expect(FX_TYPES.AFFINITY_DOWN).toBe('affinity_down')
    expect(FX_TYPES.LOADING).toBe('loading')
    expect(FX_TYPES.CLICK_RIPPLE).toBe('click_ripple')
    expect(FX_TYPES.PARTICLE_BURST).toBe('particle_burst')
  })
})

describe('FXEffect 클래스', () => {
  it('FX 효과를 생성할 수 있어야 함', () => {
    const fx = new FXEffect(FX_TYPES.JUMP_DUST, 100, 200, {
      duration: 500,
      size: 16,
      color: '#CCCCCC'
    })
    
    expect(fx.type).toBe(FX_TYPES.JUMP_DUST)
    expect(fx.x).toBe(100)
    expect(fx.y).toBe(200)
    expect(fx.duration).toBe(500)
    expect(fx.size).toBe(16)
    expect(fx.color).toBe('#CCCCCC')
    expect(fx.opacity).toBe(1)
    expect(fx.scale).toBe(1)
  })

  it('FX 효과를 업데이트할 수 있어야 함', () => {
    const originalDateNow = Date.now
    const startTime = originalDateNow()
    
    const fx = new FXEffect(FX_TYPES.JUMP_DUST, 100, 200, { duration: 100 })
    fx.startTime = startTime // 시작 시간 고정
    
    const stillActive = fx.update()
    expect(stillActive).toBe(true) // 아직 활성 상태
    
    // 완료될 때까지 시간 경과
    vi.setSystemTime(new Date(startTime + 150))
    
    const completed = fx.update()
    expect(completed).toBe(false) // 완료됨
    expect(fx.opacity).toBe(0)
  })

  it('렌더링 데이터를 반환할 수 있어야 함', () => {
    const fx = new FXEffect(FX_TYPES.JUMP_DUST, 100, 200)
    const renderData = fx.getRenderData()
    
    expect(renderData).toHaveProperty('id')
    expect(renderData).toHaveProperty('type')
    expect(renderData).toHaveProperty('x')
    expect(renderData).toHaveProperty('y')
    expect(renderData).toHaveProperty('opacity')
    expect(renderData).toHaveProperty('scale')
    expect(renderData).toHaveProperty('color')
    expect(renderData).toHaveProperty('size')
  })
})

describe('FXSystem 클래스', () => {
  let fxSystem

  beforeEach(() => {
    fxSystem = new FXSystem()
  })

  it('초기화 시 효과가 비어 있어야 함', () => {
    expect(fxSystem.effects.length).toBe(0)
  })

  it('FX 효과를 추가할 수 있어야 함', () => {
    const effect = fxSystem.addEffect(FX_TYPES.JUMP_DUST, 100, 200)
    expect(fxSystem.effects.length).toBe(1)
    expect(effect.type).toBe(FX_TYPES.JUMP_DUST)
  })

  it('점프 dust FX를 추가할 수 있어야 함', () => {
    fxSystem.addJumpDust(100, 200)
    expect(fxSystem.effects.length).toBe(5) // 5개의 dust 파티클
  })

  it('하트 상승 FX를 추가할 수 있어야 함', () => {
    fxSystem.addHeartRise(100, 200)
    expect(fxSystem.effects.length).toBe(1)
    expect(fxSystem.effects[0].type).toBe(FX_TYPES.HEART_RISE)
  })

  it('호감도 상승 FX를 추가할 수 있어야 함', () => {
    fxSystem.addAffinityUp(100, 200)
    expect(fxSystem.effects.length).toBe(3) // 3개의 하트
  })

  it('호감도 하락 FX를 추가할 수 있어야 함', () => {
    fxSystem.addAffinityDown(100, 200)
    expect(fxSystem.effects.length).toBe(1)
    expect(fxSystem.effects[0].type).toBe(FX_TYPES.AFFINITY_DOWN)
  })

  it('클릭 리플 FX를 추가할 수 있어야 함', () => {
    fxSystem.addClickRipple(100, 200, '#FF0000')
    expect(fxSystem.effects.length).toBe(3) // 3개의 리플
  })

  it('모든 FX를 업데이트할 수 있어야 함', () => {
    const originalDateNow = Date.now
    const startTime = originalDateNow()
    
    fxSystem.addEffect(FX_TYPES.JUMP_DUST, 100, 200, {
      duration: 10
    })
    fxSystem.effects[0].startTime = startTime // 시작 시간 고정
    
    expect(fxSystem.effects.length).toBe(1)
    
    vi.setSystemTime(new Date(startTime + 20))
    fxSystem.update()
    
    expect(fxSystem.effects.length).toBe(0) // 완료된 FX는 제거됨
  })

  it('모든 FX를 클리어할 수 있어야 함', () => {
    fxSystem.addJumpDust(100, 200)
    expect(fxSystem.effects.length).toBe(5)
    
    fxSystem.clearAll()
    expect(fxSystem.effects.length).toBe(0)
  })

  it('렌더링 효과를 가져올 수 있어야 함', () => {
    fxSystem.addEffect(FX_TYPES.JUMP_DUST, 100, 200)
    const renderEffects = fxSystem.getRenderEffects()
    
    expect(renderEffects.length).toBe(1)
    expect(renderEffects[0]).toHaveProperty('opacity')
  })

  it('투명도가 0인 효과는 렌더링하지 않아야 함', () => {
    const fx = new FXEffect(FX_TYPES.JUMP_DUST, 100, 200, {
      duration: 10
    })
    fx.opacity = 0
    fxSystem.effects.push(fx)
    
    const renderEffects = fxSystem.getRenderEffects()
    expect(renderEffects.length).toBe(0)
  })

  it('효과 개수를 반환할 수 있어야 함', () => {
    expect(fxSystem.getCount()).toBe(0)
    
    fxSystem.addJumpDust(100, 200)
    expect(fxSystem.getCount()).toBe(5)
  })
})

describe('감정 FX 통합 테스트', () => {
  it('감정 설정과 FX가 함께 작동해야 함', () => {
    const emotionSystem = new EmotionSystem()
    const fxSystem = new FXSystem()
    
    // 감정 설정
    emotionSystem.setEmotion('char1', EMOTION_TYPES.HAPPY)
    
    // 호감도 상승 FX 추가
    fxSystem.addAffinityUp(100, 200)
    
    expect(emotionSystem.activeEmotions.size).toBe(1)
    expect(fxSystem.effects.length).toBe(3)
  })

  it('클릭 리플과 감정이 함께 작동해야 함', () => {
    const emotionSystem = new EmotionSystem()
    const fxSystem = new FXSystem()
    
    emotionSystem.setEmotion('char1', EMOTION_TYPES.EXCITED)
    fxSystem.addClickRipple(100, 200, '#00FF00')
    
    expect(emotionSystem.getEmotion('char1').type).toBe(EMOTION_TYPES.EXCITED)
    expect(fxSystem.effects.length).toBe(3)
  })
})