import { describe, test, expect, beforeEach, vi } from 'vitest';
import spriteLoader from '../src/utils/spriteLoader';

describe('SpriteLoader', () => {
  beforeEach(() => {
    spriteLoader.cleanup();
  });

  describe('loadSpriteSheet', () => {
    test('스프라이트 시트를 로드하고 캐싱해야 함', async () => {
      const img = await spriteLoader.loadSpriteSheet(
        'character/RPGCharacterSprites32x32.png',
        'character_1'
      );

      expect(img).toBeInstanceOf(HTMLImageElement);
      expect(spriteLoader.isLoaded('character_1')).toBe(true);
    });

    test('이미 로드된 스프라이트는 캐싱된 이미지를 반환해야 함', async () => {
      const img1 = await spriteLoader.loadSpriteSheet(
        'character/RPGCharacterSprites32x32.png',
        'character_1'
      );
      const img2 = await spriteLoader.loadSpriteSheet(
        'character/RPGCharacterSprites32x32.png',
        'character_1'
      );

      expect(img1).toBe(img2); // 동일한 인스턴스
    });

    test('동시에 여러 번 호출해도 중복 로드를 방지해야 함', async () => {
      const promises = [
        spriteLoader.loadSpriteSheet(
          'character/RPGCharacterSprites32x32.png',
          'character_2'
        ),
        spriteLoader.loadSpriteSheet(
          'character/RPGCharacterSprites32x32.png',
          'character_2'
        ),
        spriteLoader.loadSpriteSheet(
          'character/RPGCharacterSprites32x32.png',
          'character_2'
        ),
      ];

      const results = await Promise.all(promises);

      // 모두 동일한 이미지
      expect(results[0]).toBe(results[1]);
      expect(results[1]).toBe(results[2]);
      // 캐시에는 하나만 있어야 함
      expect(spriteLoader.getCacheSize()).toBe(1);
    });

    test('이미지 로드 실패 시 에러를 반환해야 함', async () => {
      await expect(
        spriteLoader.loadSpriteSheet('invalid/path.png', 'invalid')
      ).rejects.toThrow();
    });
  });

  describe('getSprite', () => {
    test('캐싱된 스프라이트를 반환해야 함', async () => {
      await spriteLoader.loadSpriteSheet(
        'character/RPGSoldier32x32.png',
        'soldier_1'
      );

      const img = spriteLoader.getSprite('soldier_1');
      expect(img).toBeInstanceOf(HTMLImageElement);
    });

    test('캐싱되지 않은 스프라이트는 null을 반환해야 함', () => {
      const img = spriteLoader.getSprite('non_existent');
      expect(img).toBeNull();
    });
  });

  describe('isLoaded', () => {
    test('로드된 스프라이트는 true를 반환해야 함', async () => {
      await spriteLoader.loadSpriteSheet(
        'character/RPGCharacterSprites32x32.png',
        'character_1'
      );

      expect(spriteLoader.isLoaded('character_1')).toBe(true);
    });

    test('로드되지 않은 스프라이트는 false를 반환해야 함', () => {
      expect(spriteLoader.isLoaded('non_existent')).toBe(false);
    });
  });

  describe('cleanup', () => {
    test('모든 캐시를 비워야 함', async () => {
      await spriteLoader.loadSpriteSheet(
        'character/RPGCharacterSprites32x32.png',
        'character_1'
      );
      await spriteLoader.loadSpriteSheet(
        'character/RPGSoldier32x32.png',
        'soldier_1'
      );

      expect(spriteLoader.getCacheSize()).toBe(2);

      spriteLoader.cleanup();

      expect(spriteLoader.getCacheSize()).toBe(0);
      expect(spriteLoader.isLoaded('character_1')).toBe(false);
      expect(spriteLoader.isLoaded('soldier_1')).toBe(false);
    });
  });

  describe('preloadAssets', () => {
    test('여러 스프라이트를 병렬로 로드해야 함', async () => {
      const spriteList = [
        { path: 'character/RPGCharacterSprites32x32.png', name: 'char_1' },
        { path: 'character/RPGSoldier32x32.png', name: 'soldier_1' },
      ];

      await spriteLoader.preloadAssets(spriteList);

      expect(spriteLoader.isLoaded('char_1')).toBe(true);
      expect(spriteLoader.isLoaded('soldier_1')).toBe(true);
      expect(spriteLoader.getCacheSize()).toBe(2);
    });

    test('빈 목록을 전달해도 에러가 발생하지 않아야 함', async () => {
      await expect(spriteLoader.preloadAssets([])).resolves.not.toThrow();
    });
  });

  describe('getCacheSize', () => {
    test('캐싱된 스프라이트 수를 반환해야 함', async () => {
      expect(spriteLoader.getCacheSize()).toBe(0);

      await spriteLoader.loadSpriteSheet(
        'character/RPGCharacterSprites32x32.png',
        'character_1'
      );
      expect(spriteLoader.getCacheSize()).toBe(1);

      await spriteLoader.loadSpriteSheet(
        'character/RPGSoldier32x32.png',
        'soldier_1'
      );
      expect(spriteLoader.getCacheSize()).toBe(2);
    });
  });
});