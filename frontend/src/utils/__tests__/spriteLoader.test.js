import { describe, test, expect, beforeEach, vi } from 'vitest'
import spriteLoader from '../spriteLoader'

// vitest에서 이미지 로드 mock
vi.stubGlobal('Image', class {
  constructor() {
    this.src = ''
    this.onload = null
    this.onerror = null
    this.complete = false
    
    // 비동기 로드 시뮬레이션
    setTimeout(() => {
      if (this.src) {
        this.complete = true
        if (this.onload) this.onload()
      }
    }, 100)
  }
})

describe('SpriteLoader 기능', () => {
  beforeEach(() => {
    spriteLoader.cleanup()
    vi.clearAllMocks()
  })

  test('스프라이트 로드 성공', async () => {
    const img = await spriteLoader.loadSpriteSheet('buildings/shop.svg', 'shop')
    expect(img).toBeInstanceOf(Image)
    expect(img.src).toBe('/images/buildings/shop.svg')
  }, 10000)

  test('스프라이트 캐싱', async () => {
    const img1 = await spriteLoader.loadSpriteSheet('buildings/cafe.svg', 'cafe')
    const img2 = await spriteLoader.loadSpriteSheet('buildings/cafe.svg', 'cafe')
    
    expect(img1).toBe(img2)
    expect(spriteLoader.getCacheSize()).toBe(1)
  }, 10000)

  test('여러 스프라이트 미리 로드', async () => {
    const spriteList = [
      { path: 'buildings/shop.svg', name: 'shop' },
      { path: 'buildings/cafe.svg', name: 'cafe' },
      { path: 'buildings/library.svg', name: 'library' }
    ]
    
    await spriteLoader.preloadAssets(spriteList)
    expect(spriteLoader.getCacheSize()).toBe(3)
  }, 10000)

  test('캐시 정리', async () => {
    await spriteLoader.loadSpriteSheet('buildings/gym.svg', 'gym')
    expect(spriteLoader.getCacheSize()).toBe(1)
    
    spriteLoader.cleanup()
    expect(spriteLoader.getCacheSize()).toBe(0)
  }, 10000)

  test('캐싱된 스프라이트 반환', async () => {
    await spriteLoader.loadSpriteSheet('buildings/park.svg', 'park')
    const cached = spriteLoader.getSprite('park')
    
    expect(cached).toBeInstanceOf(Image)
    expect(cached.src).toBe('/images/buildings/park.svg')
  }, 10000)

  test('로드 상태 확인', async () => {
    expect(spriteLoader.isLoaded('test')).toBe(false)
    
    await spriteLoader.loadSpriteSheet('buildings/shop.svg', 'shop')
    expect(spriteLoader.isLoaded('shop')).toBe(true)
  }, 10000)
})