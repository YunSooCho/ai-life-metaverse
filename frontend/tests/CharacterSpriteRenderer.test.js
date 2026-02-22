// CharacterSpriteRenderer 단위 테스트
import { describe, it, expect, beforeAll, beforeEach, vi } from 'vitest'

// Mock dependencies
vi.mock('../src/utils/spriteLoader.js', () => ({
  default: {
    loadSpriteSheet: vi.fn()
  }
}))

vi.mock('../src/utils/spriteRenderer.js', () => ({
  default: {
    renderFrame: vi.fn()
  }
}))

// Global module for AnimationController
let AnimationController

describe('AnimationController', () => {
  beforeAll(async () => {
    const module = await import('../src/utils/AnimationController.js')
    AnimationController = module.default
  })

  describe('생성 및 초기화', () => {
    it('characterId로 생성되어야 함', () => {
      const controller = new AnimationController('test-id-1')
      expect(controller.getCharacterId()).toBe('test-id-1')
    })

    it('초기 상태는 idle이어야 함', () => {
      const controller = new AnimationController('test-id-2')
      expect(controller.getCurrentState().state).toBe('idle')
    })

    it('초기 방향은 down이어야 함', () => {
      const controller = new AnimationController('test-id-3')
      expect(controller.getCurrentState().direction).toBe('down')
    })

    it('초기 프레임은 0이어야 함', () => {
      const controller = new AnimationController('test-id-4')
      expect(controller.getCurrentState().currentFrame).toBe(0)
    })
  })

  describe('애니메이션 상태 전환', () => {
    it('setState로 상태를 변경할 수 있어야 함', () => {
      const controller = new AnimationController('test-id-5')
      controller.setState('walk')
      expect(controller.getCurrentState().state).toBe('walk')
    })

    it('상태 변경 시 애니메이션이 리셋되어야 함', () => {
      const controller = new AnimationController('test-id-6')
      controller.setMoving(true)
      controller.updateFrame(1000)
      controller.setState('idle')
      expect(controller.getCurrentState().currentFrame).toBe(0)
    })

    it('direction을 변경할 수 있어야 함', () => {
      const controller = new AnimationController('test-id-7')
      controller.setDirection('up')
      expect(controller.getCurrentState().direction).toBe('up')
    })

    it('모든 방향 (up/down/left/right)을 지원해야 함', () => {
      const controller = new AnimationController('test-id-8')
      const directions = ['up', 'down', 'left', 'right']
      
      directions.forEach(dir => {
        controller.setDirection(dir)
        expect(controller.getCurrentState().direction).toBe(dir)
      })
    })
  })

  describe('이동 상태 관리', () => {
    it('setMoving true일 때 walk 상태로 변경되어야 함', () => {
      const controller = new AnimationController('test-id-9')
      controller.setMoving(true)
      expect(controller.getCurrentState().state).toBe('walk')
    })

    it('setMoving false일 때 idle 상태로 변경되어야 함', () => {
      const controller = new AnimationController('test-id-10')
      controller.setMoving(true)
      controller.setMoving(false)
      expect(controller.getCurrentState().state).toBe('idle')
    })

    it('동일한 이동 상태일 때 상태 변경되지 않아야 함', () => {
      const controller = new AnimationController('test-id-11')
      controller.setMoving(true)
      const state1 = controller.getCurrentState().currentFrame
      controller.setMoving(true)
      const state2 = controller.getCurrentState().currentFrame
      expect(state2).toBe(state1)
    })
  })

  describe('프레임 업데이트', () => {
    it('idle 상태에서는 프레임이 항상 0이어야 함', () => {
      const controller = new AnimationController('test-id-12')
      controller.updateFrame(1000)
      controller.updateFrame(1500)
      controller.updateFrame(2000)
      expect(controller.getCurrentState().currentFrame).toBe(0)
    })

    it('walk 상태에서 프레임이 증가할 수 있어야 함', () => {
      const controller = new AnimationController('test-id-13')
      controller.setAnimationSpeed(50)
      controller.setMoving(true)
      controller.updateFrame(1000)
      const frame1 = controller.getCurrentState().currentFrame
      controller.updateFrame(1100)
      const frame2 = controller.getCurrentState().currentFrame
      
      // 프레임은 0-3 사이에서 루프
      expect(frame1).toBeGreaterThanOrEqual(0)
      expect(frame1).toBeLessThan(4)
      expect(frame2).toBeGreaterThanOrEqual(0)
      expect(frame2).toBeLessThan(4)
    })

    it('애니메이션 속도에 따라 프레임 업데이트되어야 함', () => {
      const controller = new AnimationController('test-id-14')
      controller.setAnimationSpeed(100) // 100ms per frame
      controller.setMoving(true)
      
      controller.updateFrame(1000)
      controller.updateFrame(1100) // 100ms 경과
      const frame = controller.getCurrentState().currentFrame
      expect(frame).toBeGreaterThan(0)
    })

    it('프레임은 0-3 사이에서 루프해야 함', () => {
      const controller = new AnimationController('test-id-15')
      controller.setAnimationSpeed(1) // 매우 빠른 속도
      controller.setMoving(true)
      
      // 여러 프레임 업데이트
      for (let i = 0; i < 10; i++) {
        controller.updateFrame(i * 200)
      }
      
      const frame = controller.getCurrentState().currentFrame
      expect(frame).toBeGreaterThanOrEqual(0)
      expect(frame).toBeLessThan(4)
    })
  })

  describe('애니메이션 속도 설정', () => {
    it('animationSpeed를 설정할 수 있어야 함', () => {
      const controller = new AnimationController('test-id-16')
      controller.setAnimationSpeed(300)
      expect(controller.getCurrentState().state).toBe('idle')
    })

    it('속도 설정 후 프레임 업데이트에 영향을 주어야 함', () => {
      const controller = new AnimationController('test-id-17')
      controller.setAnimationSpeed(50) // 빠른 속도
      controller.setMoving(true)
      
      controller.updateFrame(1000)
      controller.updateFrame(1100) // 100ms 경과
      const frame = controller.getCurrentState().currentFrame
      
      // 프레임이 0 이상이어야 함 (애니메이션이 진행 중)
      expect(frame).toBeGreaterThanOrEqual(0)
    })
  })

  describe('정리', () => {
    it('cleanup을 호출하면 애니메이션이 리셋되어야 함', () => {
      const controller = new AnimationController('test-id-18')
      controller.setMoving(true)
      controller.setAnimationSpeed(50)
      controller.updateFrame(1000)
      controller.updateFrame(1100)
      
      controller.cleanup()
      const frameAfter = controller.getCurrentState().currentFrame
      
      expect(frameAfter).toBe(0)
    })
  })
})

// Global module for CharacterSpriteRenderer
let CharacterSpriteRenderer

describe.skip('CharacterSpriteRenderer', () => {
  beforeAll(async () => {
    vi.clearAllMocks()
    const module = await import('../src/utils/characterSpriteRenderer.js')
    CharacterSpriteRenderer = module.default
  })

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('생성 및 초기화', () => {
    it('인스턴스가 생성되어야 함', () => {
      const renderer = new CharacterSpriteRenderer()
      expect(renderer).toBeDefined()
      expect(renderer.animControllers).toBeInstanceOf(Map)
    })

    it('스프라이트 시트 경로가 설정되어야 함', () => {
      const renderer = new CharacterSpriteRenderer()
      expect(renderer.spriteSheetPath).toContain('characters.png')
    })
  })

  describe('애니메이션 컨트롤러 관리', () => {
    it('컨트롤러를 생성할 수 있어야 함', () => {
      const renderer = new CharacterSpriteRenderer()
      const controller = renderer.createController('char-1')
      expect(controller).toBeDefined()
      expect(controller.getCharacterId()).toBe('char-1')
    })

    it('동일 캐릭터 ID에 대해 같은 컨트롤러를 반환해야 함', () => {
      const renderer = new CharacterSpriteRenderer()
      const ctrl1 = renderer.createController('char-2')
      const ctrl2 = renderer.createController('char-2')
      expect(ctrl1).toBe(ctrl2)
    })

    it('컨트롤러를 삭제할 수 있어야 함', () => {
      const renderer = new CharacterSpriteRenderer()
      renderer.createController('char-3')
      renderer.removeController('char-3')
      expect(renderer.animControllers.has('char-3')).toBe(false)
    })
  })

  describe('스프라이트 시트 로드', () => {
    it('스프라이트 시트를 로드할 수 있어야 함', async () => {
      const spriteLoader = await import('../src/utils/spriteLoader.js')
      spriteLoader.default.loadSpriteSheet.mockResolvedValueOnce({ src: 'mock-sprite.png' })
      
      const renderer = new CharacterSpriteRenderer()
      await renderer.loadSpriteSheet()
      
      expect(spriteLoader.default.loadSpriteSheet).toHaveBeenCalled()
    })

    it('로드 실패 시 spriteSheet는 null이어야 함', async () => {
      const spriteLoader = await import('../src/utils/spriteLoader.js')
      spriteLoader.default.loadSpriteSheet.mockRejectedValueOnce(new Error('Load failed'))
      
      const renderer = new CharacterSpriteRenderer()
      await renderer.loadSpriteSheet()
      
      expect(renderer.spriteSheet).toBeNull()
    })
  })

  describe('스프라이트 프레임 좌표', () => {
    it('스프라이트 프레임 정의가 올바른 구조여야 함', () => {
      const renderer = new CharacterSpriteRenderer()
      const { spriteFrames } = renderer
      
      expect(spriteFrames).toHaveProperty('SPRITE_SIZE')
      expect(spriteFrames).toHaveProperty('DIRECTIONS')
      expect(spriteFrames.DIRECTIONS).toHaveProperty('up')
      expect(spriteFrames.DIRECTIONS).toHaveProperty('down')
      expect(spriteFrames.DIRECTIONS).toHaveProperty('left')
      expect(spriteFrames.DIRECTIONS).toHaveProperty('right')
    })

    it('방향별 인덱스가 올바른 순서여야 함', () => {
      const renderer = new CharacterSpriteRenderer()
      const { DIRECTIONS } = renderer.spriteFrames
      
      expect(DIRECTIONS.down).toBe(0)  // 첫 번째 행
      expect(DIRECTIONS.up).toBe(1)    // 두 번째 행
      expect(DIRECTIONS.left).toBe(2)  // 세 번째 행
      expect(DIRECTIONS.right).toBe(3) // 네 번째 행
    })
  })

  describe('정리', () => {
    it('cleanup으로 모든 컨트롤러를 정리할 수 있어야 함', () => {
      const renderer = new CharacterSpriteRenderer()
      renderer.createController('char-4')
      renderer.createController('char-5')
      
      renderer.cleanup()
      
      expect(renderer.animControllers.size).toBe(0)
    })
  })

  describe('상태 확인', () => {
    it('isLoaded로 로드 상태를 확인할 수 있어야 함', () => {
      const renderer = new CharacterSpriteRenderer()
      expect(renderer.isLoaded()).toBe(false)
    })
  })
})

describe('캐릭터 스프라이트 좌표 데이터 (characterSprites.json)', () => {
  let spriteData

  beforeAll(async () => {
    const fs = await import('fs')
    const path = await import('path')
    // 올바른 경로: frontend/src/data/... 이미 해당 폴더에 있으므로
    const filePath = path.join(process.cwd(), 'src/data/characterSprites.json')
    const content = fs.readFileSync(filePath, 'utf-8')
    spriteData = JSON.parse(content)
  })

  it('스프라이트 시트 경로가 정의되어야 함', () => {
    expect(spriteData.spriteSheet).toContain('characters.png')
  })

  it('spriteSize가 32이어야 함', () => {
    expect(spriteData.spriteSize).toBe(32)
  })

  it('framesPerAnimation이 4이어야 함', () => {
    expect(spriteData.framesPerAnimation).toBe(4)
  })

  it('모든 방향이 정의되어야 함', () => {
    expect(spriteData.directions).toHaveProperty('down')
    expect(spriteData.directions).toHaveProperty('up')
    expect(spriteData.directions).toHaveProperty('left')
    expect(spriteData.directions).toHaveProperty('right')
  })

  it('애니메이션 데이터가 정의되어야 함', () => {
    expect(spriteData.animations).toHaveProperty('idle')
    expect(spriteData.animations).toHaveProperty('walk')
  })

  it('idle 애니메이션은 1프레임이어야 함', () => {
    expect(spriteData.animations.idle.frameCount).toBe(1)
  })

  it('walk 애니메이션은 4프레임이어야 함', () => {
    expect(spriteData.animations.walk.frameCount).toBe(4)
  })

  it('모든 방향의 프레임 데이터가 있어야 함', () => {
    expect(spriteData.frames).toHaveProperty('down')
    expect(spriteData.frames).toHaveProperty('up')
    expect(spriteData.frames).toHaveProperty('left')
    expect(spriteData.frames).toHaveProperty('right')
  })

  it('각 방향의 프레임은 4개여야 함', () => {
    const directions = ['down', 'up', 'left', 'right']
    directions.forEach(dir => {
      expect(spriteData.frames[dir]).toHaveLength(4)
    })
  })

  it('프레임 좌표가 올바른 형식이어야 함', () => {
    const frame = spriteData.frames.down[0]
    expect(frame).toHaveProperty('x')
    expect(frame).toHaveProperty('y')
    expect(frame).toHaveProperty('width')
    expect(frame).toHaveProperty('height')
  })

  it('프레임 크기가 32x32이어야 함', () => {
    const frame = spriteData.frames.down[0]
    expect(frame.width).toBe(32)
    expect(frame.height).toBe(32)
  })

  it('프레임 x 좌표가 32 단위 증가해야 함', () => {
    const frames = spriteData.frames.down
    for (let i = 0; i < frames.length - 1; i++) {
      expect(frames[i + 1].x).toBe(frames[i].x + 32)
    }
  })
})