/**
 * Pixel Art Renderer Vitest 테스트
 * Vitest 형식으로 작성된 테스트 코드
 */

import { describe, it, expect } from 'vitest';
import {
  validateCustomizationOptions,
} from './pixelArtRenderer.js';

describe('Pixel Art Renderer', () => {
  describe('validateCustomizationOptions', () => {
    it('기본 옵션 (빈 객체) - 유효해야 함', () => {
      expect(validateCustomizationOptions({})).toBe(true);
    });

    it('모든 옵션 올바름 - 유효해야 함', () => {
      expect(
        validateCustomizationOptions({
          hairStyle: 'short',
          hairColor: 'brown',
          clothingColor: 'blue',
          accessory: 'none',
          emotion: 'happy',
        })
      ).toBe(true);
    });

    it('잘못된 머리 스타일 - 유효하지 않아야 함', () => {
      expect(
        validateCustomizationOptions({
          hairStyle: 'invalid',
        })
      ).toBe(false);
    });

    it('잘못된 옷 색상 - 유효하지 않아야 함', () => {
      expect(
        validateCustomizationOptions({
          clothingColor: 'invalid',
        })
      ).toBe(false);
    });

    it('유효한 머리 스타일들 - 모두 유효해야 함', () => {
      const hairStyles = ['short', 'medium', 'long'];
      hairStyles.forEach((style) => {
        expect(validateCustomizationOptions({ hairStyle: style })).toBe(true);
      });
    });

    it('유효한 머리 색상들 - 모두 유효해야 함', () => {
      const hairColors = ['default', 'brown', 'gold'];
      hairColors.forEach((color) => {
        expect(validateCustomizationOptions({ hairColor: color })).toBe(true);
      });
    });

    it('유효한 옷 색상들 - 모두 유효해야 함', () => {
      const clothingColors = ['blue', 'red', 'green', 'yellow', 'purple'];
      clothingColors.forEach((color) => {
        expect(validateCustomizationOptions({ clothingColor: color })).toBe(true);
      });
    });

    it('유효한 악세서리들 - 모두 유효해야 함', () => {
      const accessories = ['none', 'glasses', 'hat', 'flowers'];
      accessories.forEach((acc) => {
        expect(validateCustomizationOptions({ accessory: acc })).toBe(true);
      });
    });

    it('유효한 감정들 - 모두 유효해야 함', () => {
      const emotions = ['happy', 'sad', 'angry', 'neutral'];
      emotions.forEach((emotion) => {
        expect(validateCustomizationOptions({ emotion })).toBe(true);
      });
    });
  });

  describe('drawPixelCharacter (Canvas)', () => {
    it('캔버스에 캐릭터 그리기', () => {
      const canvas = document.createElement('canvas');
      canvas.width = 40;
      canvas.height = 40;
      const ctx = canvas.getContext('2d');

      // 예외가 발생하지 않아야 함
      expect(() => {
        const { drawPixelCharacter } = require('./pixelArtRenderer.js');
        drawPixelCharacter(ctx, 20, 20, 1.25, {
          hairStyle: 'short',
          clothingColor: 'blue',
          emotion: 'neutral',
        });
      }).not.toThrow();
    });

    it('다른 감정 그리기', () => {
      const emotions = ['happy', 'sad', 'angry', 'neutral'];
      const canvas = document.createElement('canvas');
      canvas.width = 40;
      canvas.height = 40;
      const ctx = canvas.getContext('2d');

      expect(() => {
        const { drawPixelCharacter } = require('./pixelArtRenderer.js');
        emotions.forEach((emotion) => {
          drawPixelCharacter(ctx, 20, 20, 1.25, { emotion });
        });
      }).not.toThrow();
    });
  });

  // Note: toDataURL 테스트는 JSDOM 환경에서 지원되지 않으므로 스킵
  // 실제 브라우저에서 테스트 필요
  describe.skip('createPixelCharacterDataURL (브라우저에서만 실행)', () => {
    it('기본 캐릭터 Data URL 생성', () => {
      // 실제 브라우저에서 테스트 필요
    });

    it('커스터마이징 적용 캐릭터 생성', () => {
      // 실제 브라우저에서 테스트 필요
    });
  });
});