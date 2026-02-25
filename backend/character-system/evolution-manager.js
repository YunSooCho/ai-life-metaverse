/**
 * Character System (Phase 12) - Evolution System
 *
 * 캐릭터 진화 시스템
 * - 진화 단계 (Evolution Stage)
 * - 진화 스타일 (Evolution Style)
 * - 진화 조건 (레벨, 업적)
 * - 시각적 외형 변화
 */

// 진화 단계 타입
const EvolutionStage = {
  BASIC: 0,       // Lv 1-9 (기본 형태)
  EVOLVE_1: 1,    // Lv 10-19 (1차 진화)
  EVOLVE_2: 2,    // Lv 20-29 (2차 진화)
  EVOLVE_3: 3,    // Lv 30-49 (3차 진화)
  EVOLVE_4: 4,    // Lv 50-99 (4차 진화)
  EVOLVE_5: 5     // Lv 100+ (최종 진화)
}

// 진화 단계별 정보
const EVOLUTION_STAGES = {
  [EvolutionStage.BASIC]: {
    name: '기본',
    levelRange: [1, 9],
    pixelSize: 32,
    colorModifier: 1.0,
    description: '기본 형태',
    aura: null
  },
  [EvolutionStage.EVOLVE_1]: {
    name: '1차 진화',
    levelRange: [10, 19],
    pixelSize: 35,
    colorModifier: 1.1,
    description: '첫 진화 형태',
    aura: 'shimmer'
  },
  [EvolutionStage.EVOLVE_2]: {
    name: '2차 진화',
    levelRange: [20, 29],
    pixelSize: 38,
    colorModifier: 1.15,
    description: '2차 진화 형태',
    aura: 'glow'
  },
  [EvolutionStage.EVOLVE_3]: {
    name: '3차 진화',
    levelRange: [30, 49],
    pixelSize: 42,
    colorModifier: 1.2,
    description: '3차 진화 형태',
    aura: 'radiant'
  },
  [EvolutionStage.EVOLVE_4]: {
    name: '4차 진화',
    levelRange: [50, 99],
    pixelSize: 48,
    colorModifier: 1.3,
    description: '4차 진화 형태',
    aura: 'legendary'
  },
  [EvolutionStage.EVOLVE_5]: {
    name: '최종 진화',
    levelRange: [100, 999],
    pixelSize: 54,
    colorModifier: 1.5,
    description: '최종 진화 형태',
    aura: 'divine'
  }
}

// 진화 스타일 유형
const EvolutionStyle = {
  WARRIOR: 'warrior',
  MAGE: 'mage',
  RANGER: 'ranger',
  SUPPORT: 'support'
}

// 진화 스타일별 정보
const EVOLUTION_STYLES = {
  [EvolutionStyle.WARRIOR]: {
    name: '전사',
    description: '강하고 날카로운 외형',
    colorTint: { r: 1.1, g: 1.0, b: 0.9 },
    outlineColor: '#8B0000'
  },
  [EvolutionStyle.MAGE]: {
    name: '마법사',
    description: '마력이 느껴지는 외형',
    colorTint: { r: 0.9, g: 0.9, b: 1.2 },
    outlineColor: '#4B0082'
  },
  [EvolutionStyle.RANGER]: {
    name: '레인저',
    description: '민첩하고 자연스러운 외형',
    colorTint: { r: 0.9, g: 1.15, b: 0.9 },
    outlineColor: '#006400'
  },
  [EvolutionStyle.SUPPORT]: {
    name: '서포터',
    description: '따뜻하고 친근한 외형',
    colorTint: { r: 1.1, g: 1.1, b: 0.9 },
    outlineColor: '#FFD700'
  }
}

// 오라 효과 타입
const AuraEffect = {
  SHIMMER: 'shimmer',
  GLOW: 'glow',
  RADIANT: 'radiant',
  LEGENDARY: 'legendary',
  DIVINE: 'divine'
}

// 오라 효과별 정보
const AURA_EFFECTS = {
  [AuraEffect.SHIMMER]: { name: '반짝임', color: '#FFFFFF', intensity: 0.3, animationSpeed: 1000 },
  [AuraEffect.GLOW]: { name: '빛남', color: '#FFD700', intensity: 0.5, animationSpeed: 800 },
  [AuraEffect.RADIANT]: { name: '광촑', color: '#FFA500', intensity: 0.7, animationSpeed: 600 },
  [AuraEffect.LEGENDARY]: { name: '전설적', color: '#FF4500', intensity: 0.9, animationSpeed: 400 },
  [AuraEffect.DIVINE]: { name: '신성', color: '#FFFFFF', intensity: 1.0, animationSpeed: 300 }
}

const createEmptyEvolution = () => ({
  stage: EvolutionStage.BASIC,
  style: EvolutionStyle.WARRIOR,
  evolveHistory: [],
  customAppearance: null
})

class EvolutionManager {
  constructor(logger = console) {
    this.logger = logger
  }

  getEvolutionStage(level) {
    for (const [stage, stageInfo] of Object.entries(EVOLUTION_STAGES)) {
      const [minLevel, maxLevel] = stageInfo.levelRange
      if (level >= minLevel && level <= maxLevel) {
        return parseInt(stage, 10)
      }
    }
    return EvolutionStage.BASIC
  }

  getStageInfo(stage) {
    return EVOLUTION_STAGES[stage] || EVOLUTION_STAGES[EvolutionStage.BASIC]
  }

  getStyleInfo(style) {
    return EVOLUTION_STYLES[style] || EVOLUTION_STYLES[EvolutionStyle.WARRIOR]
  }

  getAuraEffect(aura) {
    return AURA_EFFECTS[aura] || null
  }

  getCurrentStage(characterData) {
    if (!characterData) return EvolutionStage.BASIC
    const level = characterData.level || 1
    return this.getEvolutionStage(level)
  }

  canEvolve(characterData) {
    if (!characterData || !characterData.level) {
      return { canEvolve: false, reason: '캐릭터 데이터 없음' }
    }

    const level = characterData.level
    const targetStage = this.getEvolutionStage(level)
    const savedStage = characterData.evolution?.stage ?? EvolutionStage.BASIC

    if (targetStage <= savedStage) {
      return {
        canEvolve: false,
        reason: '이미 최대 진화 상태',
        currentStage: savedStage,
        targetStage
      }
    }

    return {
      canEvolve: true,
      currentStage: savedStage,
      targetStage,
      nextStage: this.getStageInfo(targetStage)
    }
  }

  evolve(characterData, style = null) {
    if (!characterData) {
      this.logger.error('캐릭터 데이터 없음')
      return { success: false, message: '캐릭터 데이터 없음' }
    }

    try {
      const canEvolveCheck = this.canEvolve(characterData)

      if (!canEvolveCheck.canEvolve) {
        return {
          success: false,
          message: canEvolveCheck.reason,
          currentStage: canEvolveCheck.currentStage
        }
      }

      if (!characterData.evolution) {
        characterData.evolution = createEmptyEvolution()
      }

      const oldStage = characterData.evolution.stage
      const newStage = canEvolveCheck.targetStage

      if (style && EVOLUTION_STYLES[style]) {
        characterData.evolution.style = style
      } else if (!characterData.evolution.style) {
        characterData.evolution.style = EvolutionStyle.WARRIOR
      }

      characterData.evolution.stage = newStage

      characterData.evolution.evolveHistory.push({
        from: oldStage,
        to: newStage,
        level: characterData.level,
        timestamp: Date.now()
      })

      this.logger.log(`🌟 캐릭터 진화: ${characterData.name} Lv.${characterData.level} → ${this.getStageInfo(newStage).name}`)

      return {
        success: true,
        characterData,
        oldStage,
        newStage,
        stageInfo: this.getStageInfo(newStage),
        styleInfo: this.getStyleInfo(characterData.evolution.style),
        message: `${this.getStageInfo(newStage).name}으로 진화했습니다!`
      }
    } catch (error) {
      this.logger.error('진화 실패:', error)
      return { success: false, message: '진화 실패' }
    }
  }

  changeStyle(characterData, style) {
    if (!characterData) {
      this.logger.error('캐릭터 데이터 없음')
      return { success: false, message: '캐릭터 데이터 없음' }
    }

    if (!EVOLUTION_STYLES[style]) {
      return {
        success: false,
        message: `유효하지 않은 스타일: ${style}`,
        availableStyles: Object.keys(EVOLUTION_STYLES)
      }
    }

    if (!characterData.evolution) {
      characterData.evolution = createEmptyEvolution()
    }

    const oldStyle = characterData.evolution.style
    characterData.evolution.style = style

    this.logger.log(`🎨 진화 스타일 변경: ${characterData.name} ${oldStyle} → ${style}`)

    return {
      success: true,
      characterData,
      oldStyle,
      newStyle: style,
      styleInfo: this.getStyleInfo(style),
      message: `${this.getStyleInfo(style).name} 스타일로 변경했습니다!`
    }
  }

  getRenderInfo(characterData) {
    if (!characterData) {
      return {
        pixelSize: 32,
        colorTint: { r: 1.0, g: 1.0, b: 1.0 },
        outlineColor: '#333333',
        aura: null
      }
    }

    if (!characterData.evolution) {
      characterData.evolution = createEmptyEvolution()
    }

    const stage = this.getCurrentStage(characterData)
    const style = characterData.evolution.style
    const stageInfo = this.getStageInfo(stage)
    const styleInfo = this.getStyleInfo(style)

    const colorModifier = stageInfo.colorModifier
    const colorTint = {
      r: styleInfo.colorTint.r * colorModifier,
      g: styleInfo.colorTint.g * colorModifier,
      b: styleInfo.colorTint.b * colorModifier
    }

    return {
      pixelSize: stageInfo.pixelSize,
      colorTint,
      outlineColor: styleInfo.outlineColor,
      aura: stageInfo.aura ? this.getAuraEffect(stageInfo.aura) : null,
      stageName: stageInfo.name,
      styleName: styleInfo.name
    }
  }

  getEvolutionHistory(characterData) {
    if (!characterData || !characterData.evolution || !characterData.evolution.evolveHistory) {
      return {
        stage: EvolutionStage.BASIC,
        style: EvolutionStyle.WARRIOR,
        history: []
      }
    }

    return {
      stage: characterData.evolution.stage,
      style: characterData.evolution.style,
      history: characterData.evolution.evolveHistory
    }
  }

  getNextEvolutionPreview(characterData) {
    if (!characterData || !characterData.level) {
      return null
    }

    const level = characterData.level

    for (const [stage, stageInfo] of Object.entries(EVOLUTION_STAGES)) {
      const [minLevel, maxLevel] = stageInfo.levelRange

      if (minLevel > level) {
        return stageInfo
      }
    }

    return null
  }

  getEvolutionSummary(characterData) {
    if (!characterData) {
      return {
        stage: EvolutionStage.BASIC,
        style: EvolutionStyle.WARRIOR,
        evolutionCount: 0,
        nextLevelRequired: 10,
        nextStage: this.getStageInfo(EvolutionStage.EVOLVE_1)
      }
    }

    const savedStage = characterData.evolution?.stage ?? EvolutionStage.BASIC
    const style = characterData.evolution?.style ?? EvolutionStyle.WARRIOR
    const evolutionCount = characterData.evolution?.evolveHistory?.length ?? 0

    const nextStageInfo = Object.values(EVOLUTION_STAGES).find(info =>
      info.levelRange[0] > (characterData.level || 1)
    )
    const nextLevelRequired = nextStageInfo ? nextStageInfo.levelRange[0] : null

    const currentLevelStage = this.getEvolutionStage(characterData.level || 1)
    const canEvolve = currentLevelStage > savedStage

    return {
      stage: savedStage,
      style,
      stageName: this.getStageInfo(savedStage).name,
      styleName: this.getStyleInfo(style).name,
      evolutionCount,
      nextLevelRequired,
      nextStage: nextStageInfo || null,
      canEvolve
    }
  }
}

export {
  EvolutionStage,
  EvolutionStyle,
  AuraEffect,
  EVOLUTION_STAGES,
  EVOLUTION_STYLES,
  AURA_EFFECTS,
  createEmptyEvolution,
  EvolutionManager
}