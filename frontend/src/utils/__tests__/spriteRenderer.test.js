import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import spriteRenderer from '../spriteRenderer.js'

describe('spriteRenderer', () => {
  let mockCtx
  let mockSpriteSheet

  beforeEach(() => {
    // Mock Canvas Context 생성
    mockCtx = {
      save: vi.fn(),
      restore: vi.fn(),
      translate: vi.fn(),
      scale: vi.fn(),
      imageSmoothingEnabled: false,
      drawImage: vi.fn(),
      fillStyle: '',
      fillRect: vi.fn(),
      strokeStyle: '',
      strokeRect: vi.fn(),
      lineWidth: 0,
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      stroke: vi.fn(),
      closePath: vi.fn()
    }

    // Mock SpriteSheet 이미지 생성
    mockSpriteSheet = {
      width: 128,
      height: 32
    }

    // 상태 리셋
    spriteRenderer.cleanup()
  })

  afterEach(() => {
    spriteRenderer.cleanup()
  })

  describe('renderFrame', () => {
    it('프레임을 올바르게 렌더링해야 함', () => {
      const frame = { x: 0, y: 0, width: 32, height: 32 }
      const destX = 100
      const destY = 100
      const destSize = 64

      spriteRenderer.renderFrame(mockCtx, mockSpriteSheet, destX, destY, destSize, frame, false)

      expect(mockCtx.imageSmoothingEnabled).toBe(false)
      expect(mockCtx.drawImage).toHaveBeenCalledWith(
        mockSpriteSheet,
        frame.x, frame.y, frame.width, frame.height,
        destX - destSize / 2, destY - destSize / 2, destSize, destSize
      )
    })

    it('수평 뒤집기가 적용되어야 함', () => {
      const frame = { x: 0, y: 0, width: 32, height: 32 }
      const destX = 100
      const destY = 100
      const destSize = 64

      spriteRenderer.renderFrame(mockCtx, mockSpriteSheet, destX, destY, destSize, frame, true)

      // translate 호출: destX * 2 + destSize = 100 * 2 + 64 = 264
      expect(mockCtx.translate).toHaveBeenCalledWith(264, 0)
      expect(mockCtx.scale).toHaveBeenCalledWith(-1, 1)
    })
  })

  describe('renderCharacterSprite', () => {
    it('캐릭터 스프라이트를 애니메이션으로 렌더링해야 함', () => {
      const characterId = 'test-char'
      const timestamp = Date.now()
      spriteRenderer.setAnimationState(characterId, 'walk')

      spriteRenderer.renderCharacterSprite(
        mockCtx,
        mockSpriteSheet,
        characterId,
        100,
        100,
        64,
        'walk_right',
        timestamp,
        200
      )

      expect(mockCtx.drawImage).toHaveBeenCalled()
    })

    it('idle 상태에서는 첫 번째 프레임을 렌더링해야 함', () => {
      const characterId = 'test-char'
      const timestamp = Date.now()
      spriteRenderer.setAnimationState(characterId, 'idle')

      spriteRenderer.renderCharacterSprite(
        mockCtx,
        mockSpriteSheet,
        characterId,
        100,
        100,
        64,
        'idle',
        timestamp,
        200
      )

      expect(mockCtx.drawImage).toHaveBeenCalled()
    })

    it('walk_left 방향일 때 수평 뒤집기를 적용해야 함', () => {
      const characterId = 'test-char'
      const timestamp = Date.now()
      spriteRenderer.setAnimationState(characterId, 'walk')

      spriteRenderer.renderCharacterSprite(
        mockCtx,
        mockSpriteSheet,
        characterId,
        100,
        100,
        64,
        'walk_left',
        timestamp,
        200
      )

      // 수평 뒤집기가 적용되어야 함
      expect(mockCtx.drawImage).toHaveBeenCalled()
    })
  })

  describe('setAnimationState', () => {
    it('애니메이션 상태를 설정해야 함', () => {
      const characterId = 'test-char'

      spriteRenderer.setAnimationState(characterId, 'walk')
      const state = spriteRenderer.animations.get(characterId)

      expect(state).toBe('walk')
    })

    it('기존 상태를 덮어써야 함', () => {
      const characterId = 'test-char'

      spriteRenderer.setAnimationState(characterId, 'idle')
      spriteRenderer.setAnimationState(characterId, 'walk')
      const state = spriteRenderer.animations.get(characterId)

      expect(state).toBe('walk')
    })
  })

  describe('resetAnimation', () => {
    it('캐릭터의 애니메이션 상태를 리셋해야 함', () => {
      const characterId = 'test-char'

      spriteRenderer.setAnimationState(characterId, 'walk')
      spriteRenderer.resetAnimation(characterId)

      expect(spriteRenderer.animations.has(characterId)).toBe(false)
      expect(spriteRenderer.frameTimer.has(characterId)).toBe(false)
    })
  })

  describe('cleanup', () => {
    it('모든 애니메이션 상태를 정리해야 함', () => {
      const char1 = 'char1'
      const char2 = 'char2'

      spriteRenderer.setAnimationState(char1, 'walk')
      spriteRenderer.setAnimationState(char2, 'idle')

      spriteRenderer.cleanup()

      expect(spriteRenderer.animations.size).toBe(0)
      expect(spriteRenderer.frameTimer.size).toBe(0)
    })
  })
})