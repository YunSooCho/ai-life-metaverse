/**
 * BuildingRenderer 테스트
 * Phase 2 마무리: 건물 스프라이트 리팩토링 테스트
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderBuilding, renderBuildings, isBuildingHighlighted } from '../BuildingRenderer'

// Mock canvas context
const createMockCtx = () => ({
  imageSmoothingEnabled: true,
  fillRect: vi.fn(),
  drawImage: vi.fn(),
  strokeRect: vi.fn(),
  font: '',
  fillStyle: '',
  textAlign: '',
  textBaseline: '',
  shadowColor: '',
  shadowBlur: 0,
  fillText: vi.fn()
})

// Mock spriteSheets
const createMockSpriteSheets = (hasSprite = true) => ({
  buildings: hasSprite ? {
    instanceof: 'Image',
    width: 800,
    height: 200
  } : null
})

// Mock renderEntranceHighlight
const mockRenderEntranceHighlight = vi.fn()

describe('BuildingRenderer', () => {
  let ctx
  let spriteSheets

  beforeEach(() => {
    ctx = createMockCtx()
    spriteSheets = createMockSpriteSheets(true)
    vi.clearAllMocks()
  })

  describe('renderBuilding', () => {
    it('건물 스프라이트를 렌더링해야 한다', () => {
      const building = {
        x: 100,
        y: 200,
        width: 128,
        height: 128,
        name: '상점',
        type: 'shop',
        sprite: 'shop',
        entrance: { x: 150, y: 330 }
      }

      renderBuilding(ctx, building, 1.0, spriteSheets, mockRenderEntranceHighlight, false)

      // 스프라이트 렌더링 확인
      expect(ctx.imageSmoothingEnabled).toBe(false)
      expect(ctx.drawImage).toHaveBeenCalledWith(
        spriteSheets.buildings,
        0, 0, 128, 128, // 소스 좌표 (shop)
        100, 200, 128, 128 // 목표 좌표
      )
      expect(ctx.fillText).toHaveBeenCalledWith('상점', 164, 264)
    })

    it('스프라이트가 없을 때 fallback 색상으로 렌더링해야 한다', () => {
      const noSpriteSheets = createMockSpriteSheets(false)
      const building = {
        x: 100,
        y: 200,
        width: 128,
        height: 128,
        name: '카페',
        type: 'cafe',
        color: '#FF9800',
        entrance: { x: 150, y: 330 }
      }

      renderBuilding(ctx, building, 1.0, noSpriteSheets, mockRenderEntranceHighlight, false)

      // 색상 fallback 확인
      expect(ctx.fillRect).toHaveBeenCalledWith(100, 200, 128, 128)
      expect(ctx.strokeRect).toHaveBeenCalled()
      expect(ctx.fillText).toHaveBeenCalledWith('카페', 164, 264)
    })

    it('스케일 팩터를 적용해야 한다', () => {
      const building = {
        x: 100,
        y: 200,
        width: 128,
        height: 128,
        name: '체육관',
        type: 'gym',
        sprite: 'gym',
        entrance: { x: 150, y: 330 }
      }

      renderBuilding(ctx, building, 2.0, spriteSheets, mockRenderEntranceHighlight, false)

      // 스케일 적용 확인
      expect(ctx.drawImage).toHaveBeenCalledWith(
        spriteSheets.buildings,
        620, 0, 160, 140, // 소스 좌표 (gym)
        200, 400, 256, 256 // 목표 좌표 (scale 2.0)
      )
    })

    it('하이라이트가 활성화되면 입장 하이라이트를 렌더링해야 한다', () => {
      const building = {
        x: 100,
        y: 200,
        width: 128,
        height: 128,
        name: '공원',
        type: 'park',
        sprite: 'park',
        entrance: { x: 150, y: 330 }
      }

      renderBuilding(ctx, building, 1.0, spriteSheets, mockRenderEntranceHighlight, true)

      // 하이라이트 확인
      expect(mockRenderEntranceHighlight).toHaveBeenCalledWith(ctx, building.entrance, 1.0)
    })

    it('모든 건물 타입을 지원해야 한다', () => {
      const types = ['shop', 'cafe', 'park', 'library', 'gym']

      types.forEach(type => {
        vi.clearAllMocks()
        const building = {
          x: 100,
          y: 200,
          width: 128,
          height: 128,
          name: type,
          type: type,
          sprite: type,
          entrance: { x: 150, y: 330 }
        }

        renderBuilding(ctx, building, 1.0, spriteSheets, mockRenderEntranceHighlight, false)

        expect(ctx.drawImage).toHaveBeenCalled()
        expect(ctx.fillText).toHaveBeenCalledWith(type, 164, 264)
      })
    })
  })

  describe('renderBuildings', () => {
    it('모든 건물을 렌더링해야 한다', () => {
      const buildings = [
        {
          x: 100, y: 200, width: 128, height: 128,
          name: '상점', type: 'shop', sprite: 'shop', entrance: { x: 150, y: 330 }
        },
        {
          x: 300, y: 200, width: 128, height: 128,
          name: '카페', type: 'cafe', sprite: 'cafe', entrance: { x: 350, y: 330 }
        }
      ]

      renderBuildings(ctx, buildings, 1.0, spriteSheets, mockRenderEntranceHighlight, false)

      expect(ctx.drawImage).toHaveBeenCalledTimes(2)
      expect(ctx.fillText).toHaveBeenCalledTimes(2)
    })

    it('빈 배열을 처리해야 한다', () => {
      const buildings = []

      expect(() => {
        renderBuildings(ctx, buildings, 1.0, spriteSheets, mockRenderEntranceHighlight, false)
      }).not.toThrow()
    })
  })

  describe('isBuildingHighlighted', () => {
    it('마우스가 건물 위에 있으면 true를 반환해야 한다', () => {
      const building = {
        x: 100,
        y: 200,
        width: 128,
        height: 128
      }

      const result = isBuildingHighlighted(150, 250, building, 1.0)

      expect(result).toBe(true)
    })

    it('마우스가 건물 밖에 있으면 false를 반환해야 한다', () => {
      const building = {
        x: 100,
        y: 200,
        width: 128,
        height: 128
      }

      const result = isBuildingHighlighted(50, 50, building, 1.0)

      expect(result).toBe(false)
    })

    it('스케일 팩터를 적용해야 한다', () => {
      const building = {
        x: 100,
        y: 200,
        width: 128,
        height: 128
      }

      // scale 2.0: 건물 크기는 (256, 256), 위치는 (200, 400)
      const result = isBuildingHighlighted(300, 450, building, 2.0)

      expect(result).toBe(true)
    })

    it('건물 경계 내부를 정확히 체크해야 한다', () => {
      const building = {
        x: 100,
        y: 200,
        width: 128,
        height: 128
      }

      // 정확히 경계 위
      expect(isBuildingHighlighted(100, 200, building, 1.0)).toBe(true)
      expect(isBuildingHighlighted(228, 328, building, 1.0)).toBe(true)

      // 경계 외부 (1픽셀 차이)
      expect(isBuildingHighlighted(99, 200, building, 1.0)).toBe(false)
      expect(isBuildingHighlighted(229, 328, building, 1.0)).toBe(false)
    })
  })
})