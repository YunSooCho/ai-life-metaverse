import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import spriteLoader from '../spriteLoader.js'

// Image 객체 모킹 - src 설정 시 자동으로 onload 호출
global.Image = class {
  constructor() {
    this._onload = null
    this._onerror = null
    this._src = ''
    this.height = 64
    this.width = 64
  }
  get onload() { return this._onload }
  set onload(fn) { this._onload = fn }
  get onerror() { return this._onerror }
  set onerror(fn) { this._onerror = fn }
  get src() { return this._src }
  set src(val) {
    this._src = val
    // src 설정 시 자동으로 onload/onerror 호출 (비동기)
    if (val && val.length > 0) {
      setTimeout(() => this._onload && this._onload(), 0)
    } else {
      setTimeout(() => this._onerror && this._onerror(new Error('Failed to load sprite: ')), 0)
    }
  }
}

describe('spriteLoader', () => {
  beforeEach(() => {
    // 캐시를 비워서 각 테스트가 독립적으로 실행되도록 함
    spriteLoader.cleanup()
  })

  afterEach(() => {
    // 테스트 후 캐시 정리
    spriteLoader.cleanup()
  })

  describe('loadSpriteSheet', () => {
    it('이미지를 성공적으로 로드해야 함', async () => {
      const testSprite = await spriteLoader.loadSpriteSheet('test.png', 'test')

      expect(testSprite).toBeInstanceOf(Image)
      expect(spriteLoader.isLoaded('test')).toBe(true)
    })

    it('같은 이미지를 두 번 로드하면 캐시된 이미지를 반환해야 함', async () => {
      const sprite1 = await spriteLoader.loadSpriteSheet('test.png', 'test')
      const sprite2 = await spriteLoader.loadSpriteSheet('test.png', 'test')

      expect(sprite1).toBe(sprite2)
    })

    it('로딩 중에 호출되면 같은 결과를 반환해야 함', async () => {
      const promise1 = spriteLoader.loadSpriteSheet('test.png', 'test')
      const promise2 = spriteLoader.loadSpriteSheet('test.png', 'test')

      const [result1, result2] = await Promise.all([promise1, promise2])
      expect(result1).toBe(result2)
    })

    it('잘못된 경로에서는 에러를 발생시켜야 함', async () => {
      await expect(spriteLoader.loadSpriteSheet('', 'invalid'))
        .rejects.toThrow('Failed to load sprite')
    })
  })

  describe('getSprite', () => {
    it('캐싱된 스프라이트를 반환해야 함', async () => {
      await spriteLoader.loadSpriteSheet('test.png', 'test')
      const sprite = spriteLoader.getSprite('test')

      expect(sprite).toBeInstanceOf(Image)
    })

    it('캐싱되지 않은 스프라이트는 null을 반환해야 함', () => {
      const sprite = spriteLoader.getSprite('nonexistent')

      expect(sprite).toBeNull()
    })
  })

  describe('isLoaded', () => {
    it('로드된 스프라이트에 대해 true를 반환해야 함', async () => {
      await spriteLoader.loadSpriteSheet('test.png', 'test')

      expect(spriteLoader.isLoaded('test')).toBe(true)
    })

    it('로드되지 않은 스프라이트에 대해 false를 반환해야 함', () => {
      expect(spriteLoader.isLoaded('nonexistent')).toBe(false)
    })
  })

  describe('preloadAssets', () => {
    it('여러 스프라이트를 동시에 미리 로드해야 함', async () => {
      const spriteList = [
        { path: 'test1.png', name: 'test1' },
        { path: 'test2.png', name: 'test2' },
        { path: 'test3.png', name: 'test3' }
      ]

      await expect(spriteLoader.preloadAssets(spriteList))
        .resolves.not.toThrow()

      expect(spriteLoader.isLoaded('test1')).toBe(true)
      expect(spriteLoader.isLoaded('test2')).toBe(true)
      expect(spriteLoader.isLoaded('test3')).toBe(true)
    })
  })

  describe('getCacheSize', () => {
    it('캐시 크기를 올바르게 반환해야 함', async () => {
      expect(spriteLoader.getCacheSize()).toBe(0)

      await spriteLoader.loadSpriteSheet('test1.png', 'test1')
      expect(spriteLoader.getCacheSize()).toBe(1)

      await spriteLoader.loadSpriteSheet('test2.png', 'test2')
      await spriteLoader.loadSpriteSheet('test3.png', 'test3')
      expect(spriteLoader.getCacheSize()).toBe(3)
    })
  })

  describe('cleanup', () => {
    it('캐시를 완전히 비워야 함', async () => {
      await spriteLoader.loadSpriteSheet('test1.png', 'test1')
      await spriteLoader.loadSpriteSheet('test2.png', 'test2')

      spriteLoader.cleanup()

      expect(spriteLoader.getCacheSize()).toBe(0)
      expect(spriteLoader.isLoaded('test1')).toBe(false)
      expect(spriteLoader.isLoaded('test2')).toBe(false)
    })
  })
})