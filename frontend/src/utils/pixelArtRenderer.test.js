/**
 * Pixel Art Renderer 테스트
 * read/write로 작성된 테스트 코드
 */

import {
  drawPixelCharacter,
  createPixelCharacterDataURL,
  validateCustomizationOptions,
} from './pixelArtRenderer.js';

// 간단한 테스트 프레임워크 (Jest 없이)
class SimpleTest {
  constructor() {
    this.passed = 0;
    this.failed = 0;
    this.results = [];
  }

  test(name, fn) {
    try {
      fn();
      this.passed++;
      this.results.push({ name, status: 'PASS' });
      console.log(`✅ PASS: ${name}`);
    } catch (error) {
      this.failed++;
      this.results.push({ name, status: 'FAIL', error: error.message });
      console.error(`❌ FAIL: ${name}`);
      console.error(`   ${error.message}`);
    }
  }

  assert(condition, message) {
    if (!condition) {
      throw new Error(message || 'Assertion failed');
    }
  }

  assertEqual(actual, expected, message) {
    if (actual !== expected) {
      throw new Error(
        message || `Expected ${expected}, got ${actual}`
      );
    }
  }

  summary() {
    console.log('\n=== 테스트 결과 ===');
    console.log(`총: ${this.passed + this.failed}`);
    console.log(`✅ 통과: ${this.passed}`);
    console.log(`❌ 실패: ${this.failed}`);
    return this.failed === 0;
  }
}

const test = new SimpleTest();

// 테스트: validateCustomizationOptions - 기본 옵션
test.test(
  'validateCustomizationOptions: 기본 옵션 (빈 객체) - 유효해야 함',
  () => {
    const result = validateCustomizationOptions({});
    test.assert(result, '빈 옵션은 유효해야 함');
  }
);

// 테스트: validateCustomizationOptions - 모든 옵션 올바름
test.test(
  'validateCustomizationOptions: 모든 옵션 올바름 - 유효해야 함',
  () => {
    const result = validateCustomizationOptions({
      hairStyle: 'short',
      hairColor: 'brown',
      clothingColor: 'blue',
      accessory: 'none',
      emotion: 'happy',
    });
    test.assert(result, '모든 옵션이 올바르면 유효해야 함');
  }
);

// 테스트: validateCustomizationOptions - 잘못된 머리 스타일
test.test(
  'validateCustomizationOptions: 잘못된 머리 스타일 - 유효하지 않아야 함',
  () => {
    const result = validateCustomizationOptions({
      hairStyle: 'invalid',
    });
    test.assert(!result, '잘못된 머리 스타일은 유효하지 않아야 함');
  }
);

// 테스트: validateCustomizationOptions - 잘못된 옷 색상
test.test(
  'validateCustomizationOptions: 잘못된 옷 색상 - 유효하지 않아야 함',
  () => {
    const result = validateCustomizationOptions({
      clothingColor: 'invalid',
    });
    test.assert(!result, '잘못된 옷 색상은 유효하지 않아야 함');
  }
);

// 테스트: validateCustomizationOptions - 유효한 머리 스타일들
test.test(
  'validateCustomizationOptions: 유효한 머리 스타일들 - 모두 유효해야 함',
  () => {
    const hairStyles = ['short', 'medium', 'long'];
    hairStyles.forEach((style) => {
      const result = validateCustomizationOptions({ hairStyle: style });
      test.assert(result, `${style} 스타일은 유효해야 함`);
    });
  }
);

// 테스트: validateCustomizationOptions - 유효한 머리 색상들
test.test(
  'validateCustomizationOptions: 유효한 머리 색상들 - 모두 유효해야 함',
  () => {
    const hairColors = ['default', 'brown', 'gold'];
    hairColors.forEach((color) => {
      const result = validateCustomizationOptions({ hairColor: color });
      test.assert(result, `${color} 색상은 유효해야 함`);
    });
  }
);

// 테스트: validateCustomizationOptions - 유효한 옷 색상들
test.test(
  'validateCustomizationOptions: 유효한 옷 색상들 - 모두 유효해야 함',
  () => {
    const clothingColors = ['blue', 'red', 'green', 'yellow', 'purple'];
    clothingColors.forEach((color) => {
      const result = validateCustomizationOptions({ clothingColor: color });
      test.assert(result, `${color} 색상은 유효해야 함`);
    });
  }
);

// 테스트: validateCustomizationOptions - 유효한 악세사리들
test.test(
  'validateCustomizationOptions: 유효한 악세사리들 - 모두 유효해야 함',
  () => {
    const accessories = ['none', 'glasses', 'hat', 'flowers'];
    accessories.forEach((acc) => {
      const result = validateCustomizationOptions({ accessory: acc });
      test.assert(result, `${acc} 악세서리는 유효해야 함`);
    });
  }
);

// 테스트: validateCustomizationOptions - 유효한 감정들
test.test(
  'validateCustomizationOptions: 유효한 감정들 - 모두 유효해야 함',
  () => {
    const emotions = ['happy', 'sad', 'angry', 'neutral'];
    emotions.forEach((emotion) => {
      const result = validateCustomizationOptions({ emotion });
      test.assert(result, `${emotion} 감정은 유효해야 함`);
    });
  }
);

// 테스트: createPixelCharacterDataURL (실제 브라우저에서만 실행 - toDataURL 지원 필요)
// JSDOM 환경에서는 toDataURL이 지원되지 않으므로 이 테스트들은 스킵함
if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'test') {
  console.log('⚠️  JSDOM 환경에서는 toDataURL을 지원하지 않으므로 Data URL 테스트 스킵');
}

// 테스트: drawPixelCharacter - Canvas에 그리기 (브라우저 환경)
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  test.test(
    'drawPixelCharacter: 캔버스에 캐릭터 그리기',
    () => {
      const canvas = document.createElement('canvas');
      canvas.width = 40;
      canvas.height = 40;
      const ctx = canvas.getContext('2d');

      // 예외가 발생하지 않아야 함
      drawPixelCharacter(ctx, 20, 20, 1.25, {
        hairStyle: 'short',
        clothingColor: 'blue',
        emotion: 'neutral',
      });

      test.assert(true, '캔버스 그리기 성공');
    }
  );

  test.test(
    'drawPixelCharacter: 다른 감정 그리기',
    () => {
      const emotions = ['happy', 'sad', 'angry', 'neutral'];
      const canvas = document.createElement('canvas');
      canvas.width = 40;
      canvas.height = 40;
      const ctx = canvas.getContext('2d');

      emotions.forEach((emotion) => {
        drawPixelCharacter(ctx, 20, 20, 1.25, { emotion });
      });

      test.assert(true, '모든 감정 그리기 성공');
    }
  );
} else {
  console.log('⚠️  브라우저 환경이 아니어서 Canvas 관련 테스트 스킵');
}

// 테스트 결과 요약
const allPassed = test.summary();

if (allPassed) {
  console.log('\n🎉 모든 테스트 통과!');
} else {
  console.log('\n❌ 일부 테스트 실패!');
}

export default test;