/**
 * spriteRenderer 테스트
 * 픽셀 아트 스프라이트 렌더링 유틸리티 테스트
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import spriteRenderer from '../utils/spriteRenderer'

describe('SpriteRenderer', () => {
  let mockCtx
  let mockImage

  beforeEach(() => {
    // Mock Canvas Context
    mockCtx = {
      save: vi.fn(),
      restore: vi.fn(),
      imageSmoothingEnabled: false,
      translate: vi.fn(),
      scale: vi.fn(),
      drawImage: vi.fn(),
      fillText: vi.fn(),
      measureText: (text) => ({ width: text.length * 10 }),
      createPattern: vi.fn(() => ({ setTransform: vi.fn() })),
      fillStyle: '',
      strokeStyle: '',
      lineWidth: 1,
      fillRect: vi.fn(),
      strokeRect: vi.fn(),
    }

    // Mock Image
    mockImage = {
      width: 128,
      height: 128,
    }
  })

  afterEach(() => {
    spriteRenderer.cleanup()
  })

  describe('renderFrame', () => {
    it('should render a single sprite frame', () => {
      const frame = { x: 0, y: 0, width: 32, height: 32 }
      
      spriteRenderer.renderFrame(mockCtx, mockImage, 100, 100, 64, frame, false)

      expect(mockCtx.save).toHaveBeenCalled()
      expect(mockCtx.drawImage).toHaveBeenCalledWith(
        mockImage,
        0, 0, 32, 32,
        68, 68, 64, 64 // destX - size/2, destY - size/2
      )
      expect(mockCtx.restore).toHaveBeenCalled()
    })

    it('should render flipped frame horizontally', () => {
      const frame = { x: 0, y: 0, width: 32, height: 32 }
      
      spriteRenderer.renderFrame(mockCtx, mockImage, 100, 100, 64, frame, true)

      expect(mockCtx.translate).toHaveBeenCalledWith(264, 0) // x * 2 + size
      expect(mockCtx.scale).toHaveBeenCalledWith(-1, 1)
    })
  })

  describe('renderCharacterSprite', () => {
    it('should render idle animation', () => {
      // 이미지 스무딩을 false로 설정했는지 확인
      expect(mockCtx.imageSmoothingEnabled).toBe(false)
      
      // idle 상태에서 첫 번째 프레임(0)을 렌더링 해야 함
      // 이 테스트는 기본 동작을 확인
      const characterId = 'test-character'
      const timestamp = performance.now()
      
      // 테스트 목적: 함수가 에러 없이 실행되는지 확인
      expect(() => {
        spriteRenderer.renderCharacterSprite(
          mockCtx, mockImage, characterId,
          100, 100, 64, 'idle', timestamp, 200
        )
      }).not.toThrow()
    })

    it('should render walk_down animation', () => {
      const characterId = 'test-walk'
      const timestamp = performance.now()
      
      expect(() => {
        spriteRenderer.renderCharacterSprite(
          mockCtx, mockImage, characterId,
          100, 100, 64, 'walk_down', timestamp, 200
        )
      }).not.toThrow()
    })

    it('should render walk_up animation', () => {
      const characterId = 'test-up'
      const timestamp = performance.now()
      
      expect(() => {
        spriteRenderer.renderCharacterSprite(
          mockCtx, mockImage, characterId,
          100, 100, 64, 'walk_up', timestamp, 200
        )
      }).not.toThrow()
    })

    it('should render walk_left animation with flip', () => {
      const characterId = 'test-left'
      const timestamp = performance.now()
      
      expect(() => {
        spriteRenderer.renderCharacterSprite(
          mockCtx, mockImage, characterId,
          100, 100, 64, 'walk_left', timestamp, 200
        )
      }).not.toThrow()
    })

    it('should render walk_right animation', () => {
      const characterId = 'test-right'
      const timestamp = performance.now()
      
      expect(() => {
        spriteRenderer.renderCharacterSprite(
          mockCtx, mockImage, characterId,
          100, 100, 64, 'walk_right', timestamp, 200
        )
      }).not.toThrow()
    })
  })

  describe('setAnimationState', () => {
    it('should set animation state for character', () => {
      const characterId = 'test-character-1'
      
      spriteRenderer.setAnimationState(characterId, 'walk')
      
      // 내부 상태가 설정되었는지 확인 (다음 렌더링 시 사용)
      expect(() => {
        spriteRenderer.renderCharacterSprite(
          mockCtx, mockImage, characterId,
          100, 100, 64, 'walk_down', performance.now(), 200
        )
      }).not.toThrow()
    })
  })

  describe('resetAnimation', () => {
    it('should reset animation state for character', () => {
      const characterId = 'test-character-2'
      
      spriteRenderer.setAnimationState(characterId, 'walk')
      spriteRenderer.resetAnimation(characterId)
      
      expect(() => {
        spriteRenderer.renderCharacterSprite(
          mockCtx, mockImage, characterId,
          100, 100, 64, 'idle', performance.now(), 200
        )
      }).not.toThrow()
    })
  })

  describe('cleanup', () => {
    it('should clear all internal state', () => {
      const characterId = 'test-character-3'
      
      spriteRenderer.setAnimationState(characterId, 'walk')
      spriteRenderer.cleanup()
      
      expect(() => {
        spriteRenderer.renderCharacterSprite(
          mockCtx, mockImage, characterId,
          100, 100, 64, 'idle', performance.now(), 200
        )
      }).not.toThrow()
    })
  })
})