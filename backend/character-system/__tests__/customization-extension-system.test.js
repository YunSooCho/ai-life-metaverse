/**
 * CustomizationExtensionSystem 테스트
 *
 * PM: Genie
 * Created: 2026-02-20 15:45
 */

import {
  CustomizationExtensionSystem,
  customizationExtensionSystem,
  CUSTOMIZATION_CATEGORIES,
  CUSTOMIZATION_OPTIONS_DB
} from '../customization-extension-system.js';

describe('CustomizationExtensionSystem', () => {
  let system;

  beforeEach(() => {
    // 각 테스트마다 새 인스턴스 생성
    system = new CustomizationExtensionSystem();
  });

  describe('T01-T03: 기본 설정', () => {
    test('T01: 시스템 인스턴스 생성', () => {
      expect(system).toBeInstanceOf(CustomizationExtensionSystem);
      expect(system.presets).toBeInstanceOf(Map);
      expect(system.histories).toBeInstanceOf(Map);
    });

    test('T02: CUSTOMIZATION_CATEGORIES 확인', () => {
      expect(CUSTOMIZATION_CATEGORIES.HAIR_STYLE).toBe('hairStyle');
      expect(CUSTOMIZATION_CATEGORIES.HAIR_COLOR).toBe('hairColor');
      expect(CUSTOMIZATION_CATEGORIES.CLOTHING_COLOR).toBe('clothingColor');
      expect(CUSTOMIZATION_CATEGORIES.ACCESSORY).toBe('accessory');
      expect(CUSTOMIZATION_CATEGORIES.SKIN_TONE).toBe('skinTone');
      expect(CUSTOMIZATION_CATEGORIES.EYE_COLOR).toBe('eyeColor');
      expect(CUSTOMIZATION_CATEGORIES.FACIAL_FEATURE).toBe('facialFeature');
    });

    test('T03: CUSTOMIZATION_OPTIONS_DB 구조 확인', () => {
      expect(CUSTOMIZATION_OPTIONS_DB).toBeDefined();
      expect(CUSTOMIZATION_OPTIONS_DB.hairStyle).toBeDefined();
      expect(CUSTOMIZATION_OPTIONS_DB.hairColor).toBeDefined();
      expect(CUSTOMIZATION_OPTIONS_DB.clothingColor).toBeDefined();
      expect(CUSTOMIZATION_OPTIONS_DB.accessory).toBeDefined();
    });
  });

  describe('T04-T06: 커스터마이징 옵션 조회', () => {
    test('T04: getOptions() - 모든 옵션 조회', () => {
      const hairStyles = system.getOptions('hairStyle');
      expect(Array.isArray(hairStyles)).toBe(true);
      expect(hairStyles.length).toBeGreaterThan(0);
      expect(hairStyles[0]).toHaveProperty('id');
      expect(hairStyles[0]).toHaveProperty('name');
      expect(hairStyles[0]).toHaveProperty('unlockLevel');
    });

    test('T05: getOption() - 특정 옵션 조회', () => {
      const option = system.getOption('hairStyle', 'short');
      expect(option).not.toBeNull();
      expect(option.id).toBe('short');
      expect(option.name).toBe('짧은 머리');
      expect(option.emoji).toBe('👨');
    });

    test('T06: getOption() - 존재하지 않는 옵션', () => {
      const option = system.getOption('hairStyle', 'nonexistent');
      expect(option).toBeNull();
    });
  });

  describe('T07-T11: 사용 가능한 옵션 조회', () => {
    test('T07: getAvailableOptions() - 레벨 1 기본 옵션', () => {
      const available = system.getAvailableOptions(1, 'hairStyle');
      expect(Array.isArray(available.hairStyle)).toBe(true);

      // 레벨 1 기본 옵션만 포함
      available.hairStyle.forEach(opt => {
        expect(opt.unlockLevel).toBeLessThanOrEqual(1);
        expect(opt.isUnlocked).toBe(true);
      });

      expect(available.hairStyle.length).toBe(4); // short_bald, short, medium, long
    });

    test('T08: getAvailableOptions() - 레벨 10 옵션', () => {
      const available = system.getAvailableOptions(10, 'hairColor');
      expect(Array.isArray(available.hairColor)).toBe(true);

      // 레벨 10 이하 옵션만 포함
      available.hairColor.forEach(opt => {
        expect(opt.unlockLevel).toBeLessThanOrEqual(10);
      });

      // 은발 포함 확인
      const hasSilver = available.hairColor.some(opt => opt.id === 'silver');
      expect(hasSilver).toBe(true);
    });

    test('T09: getAvailableOptions() - 모든 범주 조회', () => {
      const available = system.getAvailableOptions(1);

      expect(Object.keys(available)).toContain('hairStyle');
      expect(Object.keys(available)).toContain('hairColor');
      expect(Object.keys(available)).toContain('clothingColor');
      expect(Object.keys(available)).toContain('accessory');
      expect(Object.keys(available)).toContain('skinTone');
      expect(Object.keys(available)).toContain('eyeColor');
      expect(Object.keys(available)).toContain('facialFeature');
    });

    test('T10: isOptionUnlocked() - 잠금 해제 확인', () => {
      const unlocked = system.isOptionUnlocked('hairStyle', 'short', 1);
      expect(unlocked).toBe(true);
    });

    test('T11: isOptionUnlocked() - 잠금 상태', () => {
      const locked = system.isOptionUnlocked('hairStyle', 'punk', 1);
      expect(locked).toBe(false);
    });
  });

  describe('T12-T15: 새로 잠금 해제된 옵션', () => {
    test('T12: getNewlyUnlockedOptions() - 레벨 5', () => {
      const newlyUnlocked = system.getNewlyUnlockedOptions(5);
      expect(Array.isArray(newlyUnlocked)).toBe(true);

      // 레벨 5 옵션 확인
      newlyUnlocked.forEach(opt => {
        expect(opt.unlockLevel).toBe(5);
      });

      console.log('레벨 5 새 옵션:', newlyUnlocked.map(opt => `${opt.category}: ${opt.name}`));
    });

    test('T13: getNewlyUnlockedOptions() - 레벨 10', () => {
      const newlyUnlocked = system.getNewlyUnlockedOptions(10);
      expect(Array.isArray(newlyUnlocked)).toBe(true);

      newlyUnlocked.forEach(opt => {
        expect(opt.unlockLevel).toBe(10);
      });

      console.log('레벨 10 새 옵션:', newlyUnlocked.map(opt => `${opt.category}: ${opt.name}`));
    });

    test('T14: getNewlyUnlockedOptions() - 레벨 1 (기본 옵션)', () => {
      const newlyUnlocked = system.getNewlyUnlockedOptions(1);
      expect(Array.isArray(newlyUnlocked)).toBe(true);

      newlyUnlocked.forEach(opt => {
        expect(opt.unlockLevel).toBe(1);
      });

      expect(newlyUnlocked.length).toBeGreaterThan(0);
    });

    test('T15: getNewlyUnlockedOptions() - 레벨 100 (모두 잠금 해제)', () => {
      const newlyUnlocked = system.getNewlyUnlockedOptions(100);
      expect(Array.isArray(newlyUnlocked)).toBe(true);

      // 레벨 100은 존재하지 않으므로 빈 배열
      expect(newlyUnlocked.length).toBe(0);
    });
  });

  describe('T16-T20: 프리셋 시스템', () => {
    test('T16: savePreset() - 기본 프리셋 저장', () => {
      const customization = {
        hairStyle: 'short',
        hairColor: 'black',
        clothingColor: 'blue',
        accessory: 'glasses'
      };

      const result = system.savePreset('player1', '기본 스타일', customization);

      expect(result.success).toBe(true);
      expect(result.presetId).toBeDefined();
      expect(result.message).toContain('저장 완료');
      expect(result.preset.name).toBe('기본 스타일');
    });

    test('T17: loadPreset() - 프리셋 로드', () => {
      const customization = {
        hairStyle: 'long',
        hairColor: 'gold',
        clothingColor: 'red'
      };

      const saveResult = system.savePreset('player1', '럭셔리 스타일', customization);
      const loadedPreset = system.loadPreset(saveResult.presetId);

      expect(loadedPreset).not.toBeNull();
      expect(loadedPreset.name).toBe('럭셔리 스타일');
      expect(loadedPreset.customization.hairStyle).toBe('long');
      expect(loadedPreset.customization.hairColor).toBe('gold');
    });

    test('T18: getPresets() - 캐릭터별 프리셋 목록', () => {
      const customization1 = { hairStyle: 'short', clothingColor: 'blue' };
      const customization2 = { hairStyle: 'long', clothingColor: 'red' };

      system.savePreset('player1', '프리셋 1', customization1);
      system.savePreset('player1', '프리셋 2', customization2);
      system.savePreset('player2', '프리셋 3', { hairStyle: 'medium' });

      const presets = system.getPresets('player1');

      expect(Array.isArray(presets)).toBe(true);
      expect(presets.length).toBeGreaterThanOrEqual(2);

      // player1의 프리셋만 포함
      presets.forEach(p => {
        expect(p.characterId).toBe('player1');
      });
    });

    test('T19: deletePreset() - 프리셋 삭제', () => {
      const customization = { hairStyle: 'short' };
      const saveResult = system.savePreset('player1', '삭제용 프리셋', customization);

      const deleteResult = system.deletePreset(saveResult.presetId);
      expect(deleteResult.success).toBe(true);
      expect(deleteResult.message).toContain('삭제 완료');

      // 삭제 후 로드 불가
      const loadedPreset = system.loadPreset(saveResult.presetId);
      expect(loadedPreset).toBeNull();
    });

    test('T20: deletePreset() - 존재하지 않는 프리셋', () => {
      const result = system.deletePreset('nonexistent_preset_id');
      expect(result.success).toBe(false);
      expect(result.message).toContain('찾을 수 없음');
    });
  });

  describe('T21-T24: 커스터마이징 히스토리', () => {
    test('T21: recordHistory() - 변경 이력 기록', () => {
      const oldCustomization = {
        hairStyle: 'short',
        clothingColor: 'blue'
      };

      const newCustomization = {
        hairStyle: 'long',
        clothingColor: 'red'
      };

      const historyId = system.recordHistory('player1', oldCustomization, newCustomization);

      expect(historyId).toBeDefined();
      expect(historyId).toContain('player1_history');
    });

    test('T22: getHistory() - 히스토리 조회', () => {
      const oldCustomization = {
        hairStyle: 'short',
        clothingColor: 'blue'
      };

      const newCustomization = {
        hairStyle: 'long',
        clothingColor: 'red'
      };

      system.recordHistory('player1', oldCustomization, newCustomization);

      const history = system.getHistory('player1');

      expect(Array.isArray(history)).toBe(true);
      expect(history.length).toBeGreaterThan(0);

      const firstEntry = history[0];
      expect(firstEntry).toHaveProperty('id');
      expect(firstEntry).toHaveProperty('oldCustomization');
      expect(firstEntry).toHaveProperty('newCustomization');
      expect(firstEntry).toHaveProperty('changes');
      expect(firstEntry).toHaveProperty('timestamp');
    });

    test('T23: analyzeChanges() - 변경 사항 분석', () => {
      const oldCustomization = {
        hairStyle: 'short',
        clothingColor: 'blue',
        accessory: 'glasses'
      };

      const newCustomization = {
        hairStyle: 'long',
        clothingColor: 'red',
        accessory: 'glasses'  // 변경 없음
      };

      const changes = system.analyzeChanges(oldCustomization, newCustomization);

      expect(Array.isArray(changes)).toBe(true);
      expect(changes.length).toBe(2); // hairStyle, clothingColor 변경

      // hairStyle 변경 확인
      const hairStyleChange = changes.find(c => c.category === 'hairStyle');
      expect(hairStyleChange).toBeDefined();
      expect(hairStyleChange.oldValue).toBe('short');
      expect(hairStyleChange.newValue).toBe('long');
    });

    test('T24: getHistory() - 개수 제한', () => {
      for (let i = 0; i < 15; i++) {
        system.recordHistory('player1', { hairStyle: 'short' }, { hairStyle: 'long' });
      }

      const history = system.getHistory('player1', 10);
      expect(history.length).toBe(10);
    });
  });

  describe('T25-T27: 통합 기능', () => {
    test('T25: 레벨업 시 새 옵션 알림 시뮬레이션', () => {
      let currentLevel = 1;
      const newlyUnlockedAtLevel1 = system.getNewlyUnlockedOptions(currentLevel);

      currentLevel = 5;
      const newlyUnlockedAtLevel5 = system.getNewlyUnlockedOptions(currentLevel);

      currentLevel = 10;
      const newlyUnlockedAtLevel10 = system.getNewlyUnlockedOptions(currentLevel);

      expect(newlyUnlockedAtLevel1.length).toBeGreaterThan(0);
      expect(newlyUnlockedAtLevel5.length).toBeGreaterThan(0);
      expect(newlyUnlockedAtLevel10.length).toBeGreaterThan(0);

      console.log('레벨업 알림:');
      console.log('  레벨 1:', newlyUnlockedAtLevel1.length, '개');
      console.log('  레벨 5:', newlyUnlockedAtLevel5.length, '개');
      console.log('  레벨 10:', newlyUnlockedAtLevel10.length, '개');
    });

    test('T26: 프리셇 + 히스토리 통합', () => {
      const customization = {
        hairStyle: 'short',
        clothingColor: 'blue'
      };

      // 프리셋 저장
      const saveResult = system.savePreset('player1', '데일리 룩', customization);
      expect(saveResult.success).toBe(true);

      // 히스토리 기록
      const historyId = system.recordHistory('player1', {}, customization);
      expect(historyId).toBeDefined();

      // 프리셋 확인
      const presets = system.getPresets('player1');
      expect(presets.length).toBeGreaterThan(0);

      // 히스토리 확인
      const history = system.getHistory('player1');
      expect(history.length).toBeGreaterThan(0);
    });

    test('T27: getSummary() - 시스템 요약', () => {
      const summary = system.getSummary();

      expect(summary.categories).toBeDefined();
      expect(Array.isArray(summary.categories)).toBe(true);
      expect(summary.totalPresets).toBeDefined();
      expect(summary.totalHistories).toBeDefined();
      expect(summary.availableOptions).toBeDefined();

      // availableOptions 확인
      expect(summary.availableOptions.hairStyle).toBe(8);
      expect(summary.availableOptions.hairColor).toBe(8);
      expect(summary.availableOptions.clothingColor).toBe(9);
      expect(summary.availableOptions.accessory).toBe(8);
      expect(summary.availableOptions.skinTone).toBe(5);
      expect(summary.availableOptions.eyeColor).toBe(6);
      expect(summary.availableOptions.facialFeature).toBe(5);

      console.log('시스템 요약:', summary);
    });
  });

  describe('T28-T30: 엣지 케이스', () => {
    test('T28: savePreset() - 필수 파라미터 누락', () => {
      const result1 = system.savePreset(null, '프리셋', {});
      expect(result1.success).toBe(false);

      const result2 = system.savePreset('player1', null, {});
      expect(result2.success).toBe(false);

      const result3 = system.savePreset('player1', '프리셋', null);
      expect(result3.success).toBe(false);
    });

    test('T29: getAvailableOptions() - 잘못된 범주', () => {
      const available = system.getAvailableOptions(1, 'invalid_category');
      expect(Object.keys(available)).toHaveLength(0);
    });

    test('T30: 히스토리 메모리 제한 (50개)', () => {
      // 60회 기록 (최대 50개로 제한되어야 함)
      for (let i = 0; i < 60; i++) {
        system.recordHistory('player_limit_test', { hairStyle: 'short' }, { hairStyle: 'long' });
      }

      const history = system.getHistory('player_limit_test', 100);
      expect(history.length).toBe(50); // 최대 50개
    });
  });
});

describe('Global 인스턴스 테스트', () => {
  test('T31: customizationExtensionSystem 전역 인스턴스 확인', () => {
    expect(customizationExtensionSystem).toBeInstanceOf(CustomizationExtensionSystem);
  });

  test('T32: 전역 인스턴스 옵션 조회', () => {
    const options = customizationExtensionSystem.getOptions('hairStyle');
    expect(Array.isArray(options)).toBe(true);
    expect(options.length).toBeGreaterThan(0);
  });

  test('T33: 전역 인스턴스 프리셇', () => {
    const result = customizationExtensionSystem.savePreset(
      'global_player',
      '전역 프리셋',
      { hairStyle: 'short' }
    );

    expect(result.success).toBe(true);

    const presets = customizationExtensionSystem.getPresets('global_player');
    expect(presets.length).toBeGreaterThanOrEqual(1);
  });
});

describe('옵션 데이터 무결성 테스트', () => {
  let system;

  beforeEach(() => {
    system = new CustomizationExtensionSystem();
  });

  test('T34: 모든 머리 스타일 옵션에 필수 속성', () => {
    const hairStyles = system.getOptions('hairStyle');

    hairStyles.forEach(opt => {
      expect(opt.id).toBeDefined();
      expect(opt.name).toBeDefined();
      expect(opt.emoji).toBeDefined();
      expect(opt.unlockLevel).toBeDefined();
      expect(typeof opt.unlockLevel).toBe('number');
      expect(opt.unlockLevel).toBeGreaterThan(0);
    });
  });

  test('T35: 모든 악세서리 옵션에 필수 속성', () => {
    const accessories = system.getOptions('accessory');

    accessories.forEach(opt => {
      expect(opt.id).toBeDefined();
      expect(opt.name).toBeDefined();
      expect(opt.emoji).toBeDefined();
      expect(opt.unlockLevel).toBeDefined();
    });
  });

  test('T36: 레벨별 옵션 분배 확인', () => {
    const allOptions = system.getAvailableOptions(100); // 모든 옵션
    const levels = new Set();

    // 모든 범주의 옵션에서 레벨 수집
    Object.values(allOptions).forEach(options => {
      options.forEach(opt => {
        levels.add(opt.unlockLevel);
      });
    });

    // 여러 레벨이 존재하는지 확인
    expect(levels.size).toBeGreaterThan(5);

    console.log('분배된 레벨:', Array.from(levels).sort((a, b) => a - b));
  });
});