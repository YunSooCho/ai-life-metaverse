/**
 * BuildingInteriorRenderer.test.js
 * Issue #71: 건물 인테리어 렌더링 테스트
 */

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  renderInteriorBackground,
  renderInteriorFurniture,
  renderInteriorItems,
  renderInteriorNPCs,
  renderInteriorExitButton,
  renderInteriorHeader,
  renderInterior,
  isExitButtonClicked
} from '../frontend/src/utils/BuildingRenderer'

describe('BuildingInteriorRenderer', () => {
  let ctx
  let canvas

  beforeEach(() => {
    // Mock Canvas 2D Context
    canvas = document.createElement('canvas')
    canvas.width = 800
    canvas.height = 600
    ctx = canvas.getContext('2d')

    // Mock fillRect, strokeRect, fillText, etc.
    vi.spyOn(ctx, 'fillRect').mockImplementation(() => {})
    vi.spyOn(ctx, 'strokeRect').mockImplementation(() => {})
    vi.spyOn(ctx, 'fillText').mockImplementation(() => {})
    vi.spyOn(ctx, 'beginPath').mockImplementation(() => {})
    vi.spyOn(ctx, 'moveTo').mockImplementation(() => {})
    vi.spyOn(ctx, 'lineTo').mockImplementation(() => {})
    vi.spyOn(ctx, 'stroke').mockImplementation(() => {})
    vi.spyOn(ctx, 'fill').mockImplementation(() => {})
    vi.spyOn(ctx, 'arc').mockImplementation(() => {})
    vi.spyOn(ctx, 'ellipse').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('renderInteriorBackground', () => {
    test('should render background with default color', () => {
      const interior = {
        background: {
          color: '#F5F5DC',
          floorColor: '#8B7355'
        }
      }

      renderInteriorBackground(ctx, interior, 800, 600)

      expect(ctx.fillRect).toHaveBeenCalled()
    })

    test('should render background without floor color', () => {
      const interior = {
        background: {
          color: '#F5F5DC'
        }
      }

      renderInteriorBackground(ctx, interior, 800, 600)

      expect(ctx.fillRect).toHaveBeenCalled()
    })

    test('should render background with default color if not provided', () => {
      const interior = {
        background: {}
      }

      renderInteriorBackground(ctx, interior, 800, 600)

      expect(ctx.fillRect).toHaveBeenCalled()
    })

    test('should render background without background object', () => {
      const interior = {}

      renderInteriorBackground(ctx, interior, 800, 600)

      expect(ctx.fillRect).toHaveBeenCalled()
    })
  })

  describe('renderInteriorFurniture', () => {
    test('should render furniture array', () => {
      const furniture = [
        {
          id: 'shelf',
          name: '선반',
          x: 100,
          y: 100,
          width: 200,
          height: 50,
          color: '#654321'
        }
      ]

      renderInteriorFurniture(ctx, furniture, 1)

      expect(ctx.fillRect).toHaveBeenCalled()
      expect(ctx.strokeRect).toHaveBeenCalled()
    })

    test('should handle empty furniture array', () => {
      renderInteriorFurniture(ctx, [], 1)

      expect(ctx.fillRect).not.toHaveBeenCalled()
    })

    test('should handle undefined furniture', () => {
      renderInteriorFurniture(ctx, undefined, 1)

      expect(ctx.fillRect).not.toHaveBeenCalled()
    })

    test('should render furniture with scale', () => {
      const furniture = [
        {
          id: 'shelf',
          name: '선반',
          x: 100,
          y: 100,
          width: 50,
          height: 30,
          color: '#654321'
        }
      ]

      renderInteriorFurniture(ctx, furniture, 2)

      expect(ctx.fillRect).toHaveBeenCalled()
    })

    test('should handle furniture without color', () => {
      const furniture = [
        {
          id: 'shelf',
          name: '선반',
          x: 100,
          y: 100,
          width: 50,
          height: 30
        }
      ]

      renderInteriorFurniture(ctx, furniture, 1)

      expect(ctx.fillRect).toHaveBeenCalled()
    })
  })

  describe('renderInteriorItems', () => {
    test('should render items with emojis', () => {
      const items = [
        {
          id: 'item_1',
          name: '체력 포션',
          x: 200,
          y: 180,
          emoji: '🧪',
          description: '체력 회복'
        }
      ]

      renderInteriorItems(ctx, items, 1)

      expect(ctx.fillRect).toHaveBeenCalled()
      expect(ctx.strokeRect).toHaveBeenCalled()
      expect(ctx.fillText).toHaveBeenCalled()
    })

    test('should handle empty items array', () => {
      renderInteriorItems(ctx, [], 1)

      expect(ctx.fillRect).not.toHaveBeenCalled()
    })

    test('should handle undefined items', () => {
      renderInteriorItems(ctx, undefined, 1)

      expect(ctx.fillRect).not.toHaveBeenCalled()
    })

    test('should render items without emoji', () => {
      const items = [
        {
          id: 'item_1',
          name: '아이템',
          x: 200,
          y: 180
        }
      ]

      renderInteriorItems(ctx, items, 1)

      expect(ctx.fillRect).toHaveBeenCalled()
      expect(ctx.fill).toHaveBeenCalled() // Circle fallback
    })

    test('should render items with scale', () => {
      const items = [
        {
          id: 'item_1',
          name: '아이템',
          x: 200,
          y: 180,
          emoji: '⚡'
        }
      ]

      renderInteriorItems(ctx, items, 2)

      expect(ctx.fillText).toHaveBeenCalled()
    })
  })

  describe('renderInteriorNPCs', () => {
    test('should render NPCs', () => {
      const npcs = [
        {
          id: 'shopkeeper',
          name: '상점 주인',
          x: 300,
          y: 250,
          color: '#FFD700',
          isAi: true
        }
      ]

      renderInteriorNPCs(ctx, npcs, 1, null)

      expect(ctx.fillRect).toHaveBeenCalled()
      expect(ctx.fillText).toHaveBeenCalled()
    })

    test('should handle empty NPCs array', () => {
      renderInteriorNPCs(ctx, [], 1, null)

      expect(ctx.fillText).not.toHaveBeenCalled()
    })

    test('should handle undefined NPCs', () => {
      renderInteriorNPCs(ctx, undefined, 1, null)

      expect(ctx.fillText).not.toHaveBeenCalled()
    })

    test('should render NPCs with scale', () => {
      const npcs = [
        {
          id: 'npc_1',
          name: 'NPC',
          x: 300,
          y: 250,
          color: '#FFD700'
        }
      ]

      renderInteriorNPCs(ctx, npcs, 2, null)

      expect(ctx.fillRect).toHaveBeenCalled()
    })

    test('should handle NPC without color', () => {
      const npcs = [
        {
          id: 'npc_1',
          name: 'NPC',
          x: 300,
          y: 250
        }
      ]

      renderInteriorNPCs(ctx, npcs, 1, null)

      expect(ctx.fillRect).toHaveBeenCalled()
    })
  })

  describe('renderInteriorExitButton', () => {
    test('should render exit button at default position', () => {
      const buttonArea = renderInteriorExitButton(ctx)

      expect(buttonArea).toBeDefined()
      expect(buttonArea.x).toBe(30)
      expect(buttonArea.y).toBe(30)
      expect(buttonArea.width).toBeGreaterThan(0)
      expect(buttonArea.height).toBeGreaterThan(0)
      expect(ctx.fillRect).toHaveBeenCalled()
      expect(ctx.fillText).toHaveBeenCalled()
    })

    test('should render exit button with scale', () => {
      const buttonArea = renderInteriorExitButton(ctx, 30, 30, 2)

      expect(buttonArea.width).toBe(100 * 2)
      expect(buttonArea.height).toBe(35 * 2)
    })

    test('should render exit button at custom position', () => {
      const buttonArea = renderInteriorExitButton(ctx, 50, 50, 1)

      expect(buttonArea.x).toBe(50)
      expect(buttonArea.y).toBe(50)
    })
  })

  describe('renderInteriorHeader', () => {
    test('should render header with building name', () => {
      renderInteriorHeader(ctx, '상점', 800, 1)

      expect(ctx.fillRect).toHaveBeenCalled()
      expect(ctx.fillText).toHaveBeenCalledWith('상점', 400, 25)
    })

    test('should render header with scale', () => {
      renderInteriorHeader(ctx, '카페', 800, 2)

      expect(ctx.fillRect).toHaveBeenCalled()
    })

    test('should render header with empty name fallback', () => {
      renderInteriorHeader(ctx, '', 800, 1)

      expect(ctx.fillRect).toHaveBeenCalled()
    })
  })

  describe('renderInterior', () => {
    test('should render complete interior', () => {
      const interior = {
        name: '상점',
        background: {
          color: '#8B4513',
          floorColor: '#DEB887'
        },
        furniture: [
          {
            id: 'shelf',
            x: 100,
            y: 100,
            width: 200,
            height: 50,
            color: '#654321'
          }
        ],
        items: [
          {
            id: 'item_1',
            x: 200,
            y: 180,
            emoji: '🧪'
          }
        ],
        npcs: [
          {
            id: 'shopkeeper',
            name: '상점 주인',
            x: 300,
            y: 250,
            color: '#FFD700'
          }
        ]
      }

      const exitButton = renderInterior(ctx, interior, 800, 600, 1, null)

      expect(exitButton).toBeDefined()
      expect(exitButton.width).toBeGreaterThan(0)
      expect(exitButton.height).toBeGreaterThan(0)
    })

    test('should render interior without NPCs', () => {
      const interior = {
        name: '상점',
        background: {
          color: '#8B4513'
        },
        furniture: [],
        items: []
      }

      const exitButton = renderInterior(ctx, interior, 800, 600, 1, null)

      expect(exitButton).toBeDefined()
    })

    test('should render minimal interior', () => {
      const interior = {
        name: 'Interior'
      }

      const exitButton = renderInterior(ctx, interior, 800, 600, 1, null)

      expect(exitButton).toBeDefined()
    })

    test('should render interior with scale', () => {
      const interior = {
        name: '상점',
        background: {
          color: '#8B4513'
        }
      }

      const exitButton = renderInterior(ctx, interior, 800, 600, 2, null)

      expect(exitButton.width).toBe(100 * 2)
    })
  })

  describe('isExitButtonClicked', () => {
    test('should detect click inside button', () => {
      const exitButton = { x: 30, y: 30, width: 100, height: 35 }

      const result = isExitButtonClicked(50, 50, exitButton)

      expect(result).toBe(true)
    })

    test('should not detect click outside button', () => {
      const exitButton = { x: 30, y: 30, width: 100, height: 35 }

      const result = isExitButtonClicked(200, 200, exitButton)

      expect(result).toBe(false)
    })

    test('should handle undefined exitButton', () => {
      const result = isExitButtonClicked(50, 50, undefined)

      expect(result).toBe(false)
    })

    test('should detect click at button corner', () => {
      const exitButton = { x: 30, y: 30, width: 100, height: 35 }

      const resultTopLeft = isExitButtonClicked(30, 30, exitButton)
      const resultBottomRight = isExitButtonClicked(130, 65, exitButton)

      expect(resultTopLeft).toBe(true)
      expect(resultBottomRight).toBe(true)
    })

    test('should not detect click just outside button', () => {
      const exitButton = { x: 30, y: 30, width: 100, height: 35 }

      const resultLeft = isExitButtonClicked(29, 50, exitButton)
      const resultRight = isExitButtonClicked(131, 50, exitButton)

      expect(resultLeft).toBe(false)
      expect(resultRight).toBe(false)
    })
  })
})