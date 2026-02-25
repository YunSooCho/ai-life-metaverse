/**
 * spriteRenderer.js 테스트 코드 (수정版)
 * 스프라이트 렌더러 유틸리티 기능 검증
 */

import spriteRenderer from './spriteRenderer.js'

// Mock Canvas Context
class MockContext {
  constructor() {
    this.saveCalls = []
    this.restoreCalls = []
    this.drawImageCalls = []
    this.translateCalls = []
    this.scaleCalls = []
    this.imageSmoothingEnabled = true
  }

  save() {
    this.saveCalls.push(1)
  }

  restore() {
    this.restoreCalls.push(1)
  }

  drawImage(image, sx, sy, sw, sh, dx, dy, dw, dh) {
    this.drawImageCalls.push({ image, sx, sy, sw, sh, dx, dy, dw, dh })
  }

  translate(x, y) {
    this.translateCalls.push({ x, y })
  }

  scale(x, y) {
    this.scaleCalls.push({ x, y })
  }
}

// Mock Image
class MockImage {
  constructor() {
    this.width = 128
    this.height = 128
    this.complete = true
  }
}

describe('SpriteRenderer', () => {
  let mockCtx
  let mockSpriteSheet

  beforeEach(() => {
    mockCtx = new MockContext()
    mockSpriteSheet = new MockImage()
    spriteRenderer.cleanup()
  })

  describe('renderFrame', () => {
    test('기본 프레임 렌더링', () => {
      const frame = { x: 0, y: 0, width: 32, height: 32 }

      spriteRenderer.renderFrame(
        mockCtx,
        mockSpriteSheet,
        100, 100, // destX, destY
        64,       // destSize
        frame,
        false     // flipX
      )

      // Canvas save/restore 호출 확인
      expect(mockCtx.saveCalls).toHaveLength(1)
      expect(mockCtx.restoreCalls).toHaveLength(1)

      // imageSmoothingEnabled = false 확인
      expect(mockCtx.imageSmoothingEnabled).toBe(false)

      // drawImage 호출 확인
      expect(mockCtx.drawImageCalls).toHaveLength(1)
      const drawCall = mockCtx.drawImageCalls[0]
      expect(drawCall.image).toBe(mockSpriteSheet)
      expect(drawCall.sx).toBe(frame.x)
      expect(drawCall.sy).toBe(frame.y)
      expect(drawCall.sw).toBe(frame.width)
      expect(drawCall.sh).toBe(frame.height)
    })

    test('수평 뒤집기 (flipX=true)', () => {
      const frame = { x: 0, y: 0, width: 32, height: 32 }
      const destX = 100
      const destSize = 64

      spriteRenderer.renderFrame(
        mockCtx,
        mockSpriteSheet,
        destX, 100,
        destSize,
        frame,
        true
      )

      // translate와 scale 호출 확인
      expect(mockCtx.translateCalls).toHaveLength(1)
      expect(mockCtx.scaleCalls).toHaveLength(1)

      const translateCall = mockCtx.translateCalls[0]
      // translate(x * 2 + size, 0) = 100 * 2 + 64 = 264
      expect(translateCall.x).toBe(264)
      expect(translateCall.y).toBe(0)

      const scaleCall = mockCtx.scaleCalls[0]
      expect(scaleCall.x).toBe(-1)
      expect(scaleCall.y).toBe(1)
    })
  })

  describe('renderCharacterSprite', () => {
    test('idle 상태 렌더링', () => {
      // GameCanvas에서 setAnimationState를 호출하여 상태 설정
      spriteRenderer.setAnimationState('char1', 'idle')

      spriteRenderer.renderCharacterSprite(
        mockCtx,
        mockSpriteSheet,
        'char1',
        100, 100,
        64,
        'idle',  // direction
        0,     // timestamp
        150    // animationSpeed (GameCanvas에서 사용하는 값)
      )

      // 애니메이션 상태 확인
      expect(spriteRenderer.animations.get('char1')).toBe('idle')

      // drawImage 호출 확인 (idle은 프레임 인덱스 0)
      expect(mockCtx.drawImageCalls).toHaveLength(1)
    })

    test('walk 상태 렌더링', () => {
      // GameCanvas에서 setAnimationState를 호출하여 walk 상태 설정
      spriteRenderer.setAnimationState('char2', 'walk')

      // 첫 번째 프레임 타임스탬프 + walk 상태 트리거
      spriteRenderer.renderCharacterSprite(
        mockCtx,
        mockSpriteSheet,
        'char2',
        100, 100,
        64,
        'walk_right',
        150,   // timestamp
        150    // animationSpeed
      )

      // 애니메이션 상태 확인 (walk로 설정됨)
      expect(spriteRenderer.animations.get('char2')).toBe('walk')

      // drawImage 호출 확인
      expect(mockCtx.drawImageCalls).toHaveLength(1)
    })

    test('걷는 애니메이션 프레임 계산', () => {
      // 애니메이션 상태를 walk로 설정
      spriteRenderer.setAnimationState('char3', 'walk')
      // frameTimer 초기화 (renderCharacterSprite 호출 전에 설정해야 elapsed 계산 가능)
      spriteRenderer.frameTimer.set('char3', 0)

      // 300ms 경과 (300 / 150 = 2 프레임)
      const timestamp = 300
      const animationSpeed = 150

      spriteRenderer.renderCharacterSprite(
        mockCtx,
        mockSpriteSheet,
        'char3',
        100, 100,
        64,
        'walk_down',
        timestamp,
        animationSpeed,
        32
      )

      // 프레임 인덱스 2 (300 / 150 = 2)
      const drawCall = mockCtx.drawImageCalls[0]
      // walk_down은 direction index 0, 프레임 2
      // srcX = (2 * 32) + (0 * 32 * 4) = 64
      expect(drawCall.sx).toBe(64)
    })

    test('방향별 소스 좌표 계산', () => {
      const directions = ['idle', 'walk_down', 'walk_up', 'walk_left', 'walk_right']
      const drawCalls = []

      // 방향별 srcX를 모으기 위해 동일한 mockCtx 사용
      directions.forEach((direction, index) => {
        spriteRenderer.setAnimationState(`char${index}`, 'idle')

        // renderCharacterSprite 호출
        spriteRenderer.renderCharacterSprite(
          mockCtx,
          mockSpriteSheet,
          `char${index}`,
          100, 100,
          64,
          direction,
          0,
          150,
          32
        )

        // 마지막 drawImage 호출 기록
        const lastCall = mockCtx.drawImageCalls[mockCtx.drawImageCalls.length - 1]
        if (lastCall) {
          drawCalls.push({ direction, srcX: lastCall.sx })
        }
      })

      expect(drawCalls).toHaveLength(directions.length)

      // srcX들이 모두 동일하면 안 됨 (방향별로 다르기 때문)
      const srcXs = drawCalls.map(call => call.srcX)
      const uniqueSrcXs = [...new Set(srcXs)]

      // idle과 walk_down은 같은 방향(index 0)이므로 srcX가 같을 수 있음
      // 하지만 walk_up, walk_left, walk_right는 다름
      expect(uniqueSrcXs.length).toBeGreaterThan(1)

      // 방향별로 확인
      const idleCall = drawCalls[0]   // idle: index 0
      const downCall = drawCalls[1]   // walk_down: index 0
      const upCall = drawCalls[2]     // walk_up: index 1

      // idle과 walk_down은 같은 srcX (direction index 0)
      expect(idleCall.srcX).toBe(downCall.srcX)

      // walk_down과 walk_up은 다른 srcX
      expect(downCall.srcX).not.toBe(upCall.srcX)
    })
  })

  describe('setAnimationState', () => {
    test('애니메이션 상태 설정', () => {
      spriteRenderer.setAnimationState('char1', 'walk')
      expect(spriteRenderer.animations.get('char1')).toBe('walk')

      spriteRenderer.setAnimationState('char1', 'idle')
      expect(spriteRenderer.animations.get('char1')).toBe('idle')
    })

    test('동일한 캐릭터 재설정', () => {
      spriteRenderer.setAnimationState('char1', 'walk')
      spriteRenderer.setAnimationState('char1', 'idle')

      expect(spriteRenderer.animations.get('char1')).toBe('idle')
    })
  })

  describe('resetAnimation', () => {
    test('캐릭터 애니메이션 리셋', () => {
      spriteRenderer.setAnimationState('char1', 'walk')
      spriteRenderer.frameTimer.set('char1', 0)

      expect(spriteRenderer.animations.has('char1')).toBe(true)
      expect(spriteRenderer.frameTimer.has('char1')).toBe(true)

      spriteRenderer.resetAnimation('char1')

      expect(spriteRenderer.animations.has('char1')).toBe(false)
      expect(spriteRenderer.frameTimer.has('char1')).toBe(false)
    })
  })

  describe('cleanup', () => {
    test('모든 상태 정리', () => {
      // 캐릭터 상태 추가
      spriteRenderer.setAnimationState('char1', 'walk')
      spriteRenderer.setAnimationState('char2', 'idle')
      spriteRenderer.frameTimer.set('char1', 0)
      spriteRenderer.frameTimer.set('char2', 0)

      expect(spriteRenderer.animations.size).toBe(2)
      expect(spriteRenderer.frameTimer.size).toBe(2)

      // Cleanup 호출
      spriteRenderer.cleanup()

      expect(spriteRenderer.animations.size).toBe(0)
      expect(spriteRenderer.frameTimer.size).toBe(0)
    })
  })
})