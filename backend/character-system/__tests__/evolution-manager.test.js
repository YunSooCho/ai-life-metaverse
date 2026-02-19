import { describe, it, expect, beforeEach } from 'vitest'
import {
  EvolutionStage,
  EvolutionStyle,
  AuraEffect,
  createEmptyEvolution,
  EvolutionManager
} from '../evolution-manager.js'

const mockLogger = { log: () => {}, error: () => {} }

describe('EvolutionManager - 진화 시스템', () => {
  let evolutionManager

  beforeEach(() => {
    evolutionManager = new EvolutionManager(mockLogger)
  })

  describe('getEvolutionStage - 레벨별 진화 단계', () => {
    it('Lv 1-9: 기본', () => {
      expect(evolutionManager.getEvolutionStage(1)).toBe(EvolutionStage.BASIC)
      expect(evolutionManager.getEvolutionStage(5)).toBe(EvolutionStage.BASIC)
      expect(evolutionManager.getEvolutionStage(9)).toBe(EvolutionStage.BASIC)
    })

    it('Lv 10-19: 1차', () => {
      expect(evolutionManager.getEvolutionStage(10)).toBe(EvolutionStage.EVOLVE_1)
      expect(evolutionManager.getEvolutionStage(15)).toBe(EvolutionStage.EVOLVE_1)
      expect(evolutionManager.getEvolutionStage(19)).toBe(EvolutionStage.EVOLVE_1)
    })

    it('Lv 20-29: 2차', () => {
      expect(evolutionManager.getEvolutionStage(20)).toBe(EvolutionStage.EVOLVE_2)
      expect(evolutionManager.getEvolutionStage(25)).toBe(EvolutionStage.EVOLVE_2)
      expect(evolutionManager.getEvolutionStage(29)).toBe(EvolutionStage.EVOLVE_2)
    })

    it('Lv 30-49: 3차', () => {
      expect(evolutionManager.getEvolutionStage(30)).toBe(EvolutionStage.EVOLVE_3)
      expect(evolutionManager.getEvolutionStage(40)).toBe(EvolutionStage.EVOLVE_3)
      expect(evolutionManager.getEvolutionStage(49)).toBe(EvolutionStage.EVOLVE_3)
    })

    it('Lv 50-99: 4차', () => {
      expect(evolutionManager.getEvolutionStage(50)).toBe(EvolutionStage.EVOLVE_4)
      expect(evolutionManager.getEvolutionStage(75)).toBe(EvolutionStage.EVOLVE_4)
      expect(evolutionManager.getEvolutionStage(99)).toBe(EvolutionStage.EVOLVE_4)
    })

    it('Lv 100+: 최종', () => {
      expect(evolutionManager.getEvolutionStage(100)).toBe(EvolutionStage.EVOLVE_5)
      expect(evolutionManager.getEvolutionStage(150)).toBe(EvolutionStage.EVOLVE_5)
      expect(evolutionManager.getEvolutionStage(999)).toBe(EvolutionStage.EVOLVE_5)
    })
  })

  describe('getStageInfo - 단계 정보', () => {
    it('기본 정보', () => {
      const info = evolutionManager.getStageInfo(EvolutionStage.BASIC)
      expect(info.name).toBe('기본')
      expect(info.levelRange).toEqual([1, 9])
      expect(info.pixelSize).toBe(32)
    })

    it('1차 정보', () => {
      const info = evolutionManager.getStageInfo(EvolutionStage.EVOLVE_1)
      expect(info.name).toBe('1차 진화')
      expect(info.levelRange).toEqual([10, 19])
    })

    it('최종 정보', () => {
      const info = evolutionManager.getStageInfo(EvolutionStage.EVOLVE_5)
      expect(info.name).toBe('최종 진화')
      expect(info.levelRange).toEqual([100, 999])
      expect(info.aura).toBe('divine')
    })
  })

  describe('canEvolve - 진화 가능', () => {
    it('Lv 5: BASIC - 이미 맞음', () => {
      const char = { name: 'Test', level: 5, evolution: { stage: EvolutionStage.BASIC } }
      const result = evolutionManager.canEvolve(char)
      expect(result.canEvolve).toBe(false)
      expect(result.currentStage).toBe(EvolutionStage.BASIC)
    })

    it('Lv 10: BASIC -> 1차 가능', () => {
      const char = { name: 'Test', level: 10, evolution: { stage: EvolutionStage.BASIC } }
      const result = evolutionManager.canEvolve(char)
      expect(result.canEvolve).toBe(true)
      expect(result.targetStage).toBe(EvolutionStage.EVOLVE_1)
    })

    it('Lv 15: EVOLVE_1 - 이미 맞음', () => {
      const char = { name: 'Test', level: 15, evolution: { stage: EvolutionStage.EVOLVE_1 } }
      const result = evolutionManager.canEvolve(char)
      expect(result.canEvolve).toBe(false)
    })

    it('Lv 20: EVOLVE_1 -> 2차 가능', () => {
      const char = { name: 'Test', level: 20, evolution: { stage: EvolutionStage.EVOLVE_1 } }
      const result = evolutionManager.canEvolve(char)
      expect(result.canEvolve).toBe(true)
      expect(result.targetStage).toBe(EvolutionStage.EVOLVE_2)
    })

    it('Lv 100: EVOLVE_5 - 최대', () => {
      const char = { name: 'Test', level: 100, evolution: { stage: EvolutionStage.EVOLVE_5 } }
      const result = evolutionManager.canEvolve(char)
      expect(result.canEvolve).toBe(false)
      expect(result.reason).toBe('이미 최대 진화 상태')
    })
  })

  describe('evolve - 진화 실행', () => {
    it('Lv 10: 1차 진화', () => {
      const char = { name: 'TestChar', level: 10, evolution: createEmptyEvolution() }
      const result = evolutionManager.evolve(char)

      expect(result.success).toBe(true)
      expect(result.newStage).toBe(EvolutionStage.EVOLVE_1)
      expect(char.evolution.evolveHistory.length).toBe(1)
    })

    it('Lv 20: 2차 진화', () => {
      const char = {
        name: 'TestChar', level: 20,
        evolution: { stage: EvolutionStage.EVOLVE_1, style: EvolutionStyle.WARRIOR, evolveHistory: [] }
      }
      const result = evolutionManager.evolve(char)

      expect(result.success).toBe(true)
      expect(result.newStage).toBe(EvolutionStage.EVOLVE_2)
    })

    it('진화 시 스타일 지정', () => {
      const char = { name: 'TestChar', level: 10, evolution: createEmptyEvolution() }
      const result = evolutionManager.evolve(char, EvolutionStyle.MAGE)

      expect(result.success).toBe(true)
      expect(char.evolution.style).toBe(EvolutionStyle.MAGE)
    })

    it('최대: 실패', () => {
      const char = {
        name: 'TestChar', level: 100,
        evolution: { stage: EvolutionStage.EVOLVE_5, style: EvolutionStyle.WARRIOR, evolveHistory: [] }
      }
      const result = evolutionManager.evolve(char)

      expect(result.success).toBe(false)
    })
  })

  describe('changeStyle - 스타일 변경', () => {
    it('성공', () => {
      const char = { name: 'TestChar', level: 10, evolution: createEmptyEvolution() }
      const result = evolutionManager.changeStyle(char, EvolutionStyle.MAGE)

      expect(result.success).toBe(true)
      expect(char.evolution.style).toBe(EvolutionStyle.MAGE)
    })

    it('유효하지 않음: 실패', () => {
      const char = { name: 'TestChar', level: 10, evolution: createEmptyEvolution() }
      const result = evolutionManager.changeStyle(char, 'invalid')

      expect(result.success).toBe(false)
    })
  })

  describe('getRenderInfo - 렌더링 정보', () => {
    it('기본', () => {
      const info = evolutionManager.getRenderInfo(null)
      expect(info.pixelSize).toBe(32)
      expect(info.aura).toBeNull()
    })

    it('1차 진화', () => {
      const char = {
        name: 'Test', level: 10,
        evolution: { stage: EvolutionStage.EVOLVE_1, style: EvolutionStyle.WARRIOR }
      }
      const info = evolutionManager.getRenderInfo(char)

      expect(info.pixelSize).toBe(35)
      expect(info.aura).toBeDefined()
    })

    it('스타일별 색상', () => {
      const char = {
        name: 'Test', level: 20,
        evolution: { stage: EvolutionStage.EVOLVE_2, style: EvolutionStyle.MAGE }
      }
      const info = evolutionManager.getRenderInfo(char)

      expect(info.outlineColor).toBe('#4B0082')
      expect(info.colorTint.b).toBeGreaterThan(1.0)
    })
  })

  describe('getEvolutionHistory - 이력', () => {
    it('조회', () => {
      const char = {
        name: 'Test', level: 20,
        evolution: {
          stage: EvolutionStage.EVOLVE_2,
          style: EvolutionStyle.WARRIOR,
          evolveHistory: [
            { from: 0, to: 1, level: 10, timestamp: Date.now() },
            { from: 1, to: 2, level: 20, timestamp: Date.now() }
          ]
        }
      }
      const history = evolutionManager.getEvolutionHistory(char)

      expect(history.stage).toBe(EvolutionStage.EVOLVE_2)
      expect(history.history.length).toBe(2)
    })

    it('없으면 빈', () => {
      const history = evolutionManager.getEvolutionHistory(null)
      expect(history.stage).toBe(EvolutionStage.BASIC)
      expect(history.history.length).toBe(0)
    })
  })

  describe('getNextEvolutionPreview - 미리보기', () => {
    it('Lv 5: 1차 미리보기', () => {
      const char = { name: 'Test', level: 5 }
      const preview = evolutionManager.getNextEvolutionPreview(char)

      expect(preview).toBeDefined()
      expect(preview.name).toBe('1차 진화')
    })

    it('Lv 95: 최종 미리보기', () => {
      const char = { name: 'Test', level: 95 }
      const preview = evolutionManager.getNextEvolutionPreview(char)

      expect(preview).toBeDefined()
      expect(preview.name).toBe('최종 진화')
    })

    it('Lv 500: null', () => {
      const char = { name: 'Test', level: 500 }
      const preview = evolutionManager.getNextEvolutionPreview(char)

      expect(preview).toBeNull()
    })
  })

  describe('getEvolutionSummary - 요약', () => {
    it('Lv 15: EVOLVE_1 - 일치', () => {
      const char = {
        name: 'Test', level: 15,
        evolution: {
          stage: EvolutionStage.EVOLVE_1,
          style: EvolutionStyle.MAGE,
          evolveHistory: [{ from: 0, to: 1, level: 10, timestamp: Date.now() }]
        }
      }
      const summary = evolutionManager.getEvolutionSummary(char)

      expect(summary.stage).toBe(EvolutionStage.EVOLVE_1)
      expect(summary.canEvolve).toBe(false)
    })

    it('Lv 20: EVOLVE_1 -> 2차 필요', () => {
      const char = {
        name: 'Test', level: 20,
        evolution: {
          stage: EvolutionStage.EVOLVE_1,
          style: EvolutionStyle.MAGE,
          evolveHistory: [{ from: 0, to: 1, level: 10, timestamp: Date.now() }]
        }
      }
      const summary = evolutionManager.getEvolutionSummary(char)

      expect(summary.stage).toBe(EvolutionStage.EVOLVE_1)
      expect(summary.canEvolve).toBe(true)
      expect(summary.nextLevelRequired).toBe(30)
    })

    it('null: 기본', () => {
      const summary = evolutionManager.getEvolutionSummary(null)

      expect(summary.stage).toBe(EvolutionStage.BASIC)
      expect(summary.evolutionCount).toBe(0)
      expect(summary.nextLevelRequired).toBe(10)
    })
  })

  describe('createEmptyEvolution - 초기화', () => {
    it('빈 생성', () => {
      const evolution = createEmptyEvolution()

      expect(evolution.stage).toBe(EvolutionStage.BASIC)
      expect(evolution.style).toBe(EvolutionStyle.WARRIOR)
      expect(evolution.evolveHistory).toEqual([])
      expect(evolution.customAppearance).toBeNull()
    })
  })
})