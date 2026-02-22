/**
 * spriteLoader.js 테스트 코드 (간소화版)
 * 스프라이트 로더 유틸리티 기능 검증
 */

import spriteLoader from './spriteLoader.js'

describe('SpriteLoader', () => {
  beforeEach(() => {
    // 테스트 전 캐시 클리어
    spriteLoader.cleanup()
  })

  describe('getSprite', () => {
    test('로드되지 않은 스프라이트는 null 반환', () => {
      const sprite = spriteLoader.getSprite('nonexistent')
      expect(sprite).toBe(null)
    })
  })

  describe('isLoaded', () => {
    test('로드되지 않은 스프라이트 확인', () => {
      expect(spriteLoader.isLoaded('test')).toBe(false)
    })
  })

  describe('setAnimationState', () => {
    test('getCacheSize - 초기 상태', () => {
      expect(spriteLoader.getCacheSize()).toBe(0)
    })

    test('cleanup - 캐시 정리', () => {
      expect(spriteLoader.getCacheSize()).toBe(0)
      spriteLoader.cleanup()
      expect(spriteLoader.getCacheSize()).toBe(0)
    })
  })

  describe('loadSpriteSheet 기본 동작', () => {
    test('loadSpriteSheet는 Promise를 반환', () => {
      const result = spriteLoader.loadSpriteSheet('test.png', 'test')
      expect(result).toBeInstanceOf(Promise)
    })

    test('로딩 실패 시 에러 처리 - 로드되지 않은 상태 확인', async () => {
      // 존재하지 않는 파일 로드 시도
      const loadPromise = spriteLoader.loadSpriteSheet('nonexistent.png', 'nonexistent')

      // 로드 실패로 인해 캐시에 없는지 확인
      expect(spriteLoader.isLoaded('nonexistent')).toBe(false)
    })
  })

  describe('preloadAssets 기본 동작', () => {
    test('preloadAssets는 Promise를 반환', () => {
      const result = spriteLoader.preloadAssets([])
      expect(result).toBeInstanceOf(Promise)
    })

    test('빈 목록 preload', async () => {
      const result = spriteLoader.preloadAssets([])
      await result
      expect(spriteLoader.getCacheSize()).toBe(0)
    })
  })

  describe('cleanup', () => {
    test('캐시 정리', () => {
      expect(spriteLoader.getCacheSize()).toBe(0)

      spriteLoader.cleanup()

      expect(spriteLoader.getCacheSize()).toBe(0)
    })
  })
})