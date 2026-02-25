/**
 * CustomizationExtensionSystem
 *
 * 캐릭터 커스터마이징 확장 시스템
 * - 잠금/잠금 해제 시스템 (레벨, 업적 기반)
 * - 프리셋 시스템 (여러 조합 저장)
 * - 커스터마이징 히스토리 (변경 이력)
 *
 * Created: 2026-02-20 15:30
 * PM: Genie
 */

/**
 * 커스터마이징 옵션 범주
 */
const CUSTOMIZATION_CATEGORIES = {
  HAIR_STYLE: 'hairStyle',
  HAIR_COLOR: 'hairColor',
  CLOTHING_COLOR: 'clothingColor',
  ACCESSORY: 'accessory',
  SKIN_TONE: 'skinTone',
  EYE_COLOR: 'eyeColor',
  FACIAL_FEATURE: 'facialFeature'
};

/**
 * 커스터마이징 옵션 데이터베이스
 */
const CUSTOMIZATION_OPTIONS_DB = {
  // 머리 스타일
  hairStyle: [
    { id: 'short_bald', name: '스킨헤드', emoji: '🧑‍🦲', unlockLevel: 1 },
    { id: 'short', name: '짧은 머리', emoji: '👨', unlockLevel: 1 },
    { id: 'medium', name: '중간 머리', emoji: '👩', unlockLevel: 1 },
    { id: 'long', name: '긴 머리', emoji: '👱‍♀️', unlockLevel: 1 },
    { id: 'long_wavy', name: '웨이브 머리', emoji: '👱‍♀️', unlockLevel: 5 },
    { id: 'afro', name: '아프로', emoji: '👨‍🦱', unlockLevel: 10 },
    { id: 'curly', name: '곱슬 머리', emoji: '👨‍🦰', unlockLevel: 15 },
    { id: 'punk', name: '펑크 머리', emoji: '🧔', unlockLevel: 20 }
  ],

  // 머리 색상
  hairColor: [
    { id: 'black', name: '검정', color: '#000000', unlockLevel: 1 },
    { id: 'brown', name: '갈색', color: '#8B4513', unlockLevel: 1 },
    { id: 'gold', name: '금발', color: '#FFD700', unlockLevel: 1 },
    { id: 'silver', name: '은발', color: '#C0C0C0', unlockLevel: 10 },
    { id: 'red', name: '빨간 머리', color: '#FF4500', unlockLevel: 15 },
    { id: 'pink', name: '분홍 머리', color: '#FF69B4', unlockLevel: 20 },
    { id: 'blue', name: '파란 머리', color: '#1E90FF', unlockLevel: 25 },
    { id: 'rainbow', name: '무지개 머리', color: 'rainbow', unlockLevel: 30 }
  ],

  // 옷 색상
  clothingColor: [
    { id: 'gray', name: '회색 옷', color: '#9E9E9E', unlockLevel: 1 },
    { id: 'blue', name: '파란 옷', color: '#2196F3', unlockLevel: 1 },
    { id: 'red', name: '빨간 옷', color: '#F44336', unlockLevel: 1 },
    { id: 'green', name: '초록 옷', color: '#4CAF50', unlockLevel: 1 },
    { id: 'yellow', name: '노란 옷', color: '#FFEB3B', unlockLevel: 1 },
    { id: 'purple', name: '보라 옷', color: '#9C27B0', unlockLevel: 5 },
    { id: 'orange', name: '주황 옷', color: '#FF9800', unlockLevel: 10 },
    { id: 'pink', name: '분홍 옷', color: '#E91E63', unlockLevel: 15 },
    { id: 'black', name: '검은 옷', color: '#212121', unlockLevel: 20 }
  ],

  // 악세서리
  accessory: [
    { id: 'none', name: '없음', emoji: '', unlockLevel: 1 },
    { id: 'glasses', name: '안경', emoji: '👓', unlockLevel: 1 },
    { id: 'hat', name: '모자', emoji: '🧢', unlockLevel: 1 },
    { id: 'sunglasses', name: '선글라스', emoji: '🕶️', unlockLevel: 5 },
    { id: 'headphones', name: '헤드폰', emoji: '🎧', unlockLevel: 10 },
    { id: 'crown', name: '왕관', emoji: '👑', unlockLevel: 15 },
    { id: 'bow_tie', name: '나비 넥타이', emoji: '🎀', unlockLevel: 20 },
    { id: 'flower', name: '꽃', emoji: '🌸', unlockLevel: 20 }
  ],

  // 피부 톤
  skinTone: [
    { id: 'light', name: '밝은 피부', emoji: '🏻', unlockLevel: 1 },
    { id: 'medium_light', name: '약간 어두운 피부', emoji: '🏼', unlockLevel: 1 },
    { id: 'medium', name: '중간 피부', emoji: '🏽', unlockLevel: 1 },
    { id: 'medium_dark', name: '어두운 피부', emoji: '🏾', unlockLevel: 1 },
    { id: 'dark', name: '매우 어두운 피부', emoji: '🏿', unlockLevel: 1 }
  ],

  // 눈 색상
  eyeColor: [
    { id: 'brown', name: '갈색 눈', color: '#8B4513', unlockLevel: 1 },
    { id: 'blue', name: '파란 눈', color: '#1E90FF', unlockLevel: 1 },
    { id: 'green', name: '초록 눈', color: '#228B22', unlockLevel: 1 },
    { id: 'gray', name: '회색 눈', color: '#808080', unlockLevel: 10 },
    { id: 'red', name: '빨간 눈', color: '#FF0000', unlockLevel: 20 },
    { id: 'gold', name: '금색 눈', color: '#FFD700', unlockLevel: 25 }
  ],

  // 얼굴 특징
  facialFeature: [
    { id: 'none', name: '없음', emoji: '', unlockLevel: 1 },
    { id: 'mustache', name: '콧수염', emoji: '👨', unlockLevel: 5 },
    { id: 'beard', name: '수염', emoji: '🧔', unlockLevel: 10 },
    { id: 'freckles', name: '주근깨', emoji: '', unlockLevel: 15 },
    { id: 'scar', name: '흉터', emoji: '', unlockLevel: 20 }
  ]
};

/**
 * CustomizationExtensionSystem 클래스
 */
class CustomizationExtensionSystem {
  /**
   * 초기화
   */
  constructor() {
    this.presets = new Map(); // 프리셋: presetId -> presetData
    this.histories = new Map(); // 히스토리: characterId -> history[]
  }

  /**
   * 커스터마이징 옵션 조회
   * @param {string} category - 범주키 (hairStyle, hairColor 등)
   * @returns {Array} 옵션 배열
   */
  getOptions(category) {
    const options = CUSTOMIZATION_OPTIONS_DB[category];
    if (!options) {
      return [];
    }

    // Deep copy 반환
    return options.map(opt => ({ ...opt }));
  }

  /**
   * 특정 커스터마이징 옵션 조회
   * @param {string} category - 범주키
   * @param {string} optionId - 옵션 ID
   * @returns {Object|null} 옵션 객체 또는 null
   */
  getOption(category, optionId) {
    const options = CUSTOMIZATION_OPTIONS_DB[category];
    if (!options) {
      return null;
    }

    const option = options.find(opt => opt.id === optionId);
    return option ? { ...option } : null;
  }

  /**
   * 사용 가능한 옵션 조회 (레벨 기반 필터링)
   * @param {number} level - 캐릭터 레벨
   * @param {string} category - 범주키 (선택사항)
   * @returns {Object} 사용 가능한 옵션들
   */
  getAvailableOptions(level, category = null) {
    const result = {};

    if (category) {
      // 특정 범주만 (존재하지 않는 범주면 빈 객체 반환)
      if (!CUSTOMIZATION_OPTIONS_DB[category]) {
        return {};
      }
      const options = this.filterOptionsByLevel(category, level);
      result[category] = options;
    } else {
      // 모든 범주
      for (const cat of Object.keys(CUSTOMIZATION_OPTIONS_DB)) {
        result[cat] = this.filterOptionsByLevel(cat, level);
      }
    }

    return result;
  }

  /**
   * 레벨별 옵션 필터링
   * @param {string} category - 범주키
   * @param {number} level - 캐릭터 레벨
   * @returns {Array} 필터링된 옵션들
   */
  filterOptionsByLevel(category, level) {
    const options = CUSTOMIZATION_OPTIONS_DB[category];
    if (!options) {
      return [];
    }

    return options
      .filter(opt => opt.unlockLevel <= level)
      .map(opt => ({
        ...opt,
        isUnlocked: opt.unlockLevel <= level
      }));
  }

  /**
   * 옵션 잠금 해제 확인
   * @param {string} category - 범주키
   * @param {string} optionId - 옵션 ID
   * @param {number} level - 캐릭터 레벨
   * @returns {boolean} 잠금 해제 여부
   */
  isOptionUnlocked(category, optionId, level) {
    const option = this.getOption(category, optionId);
    if (!option) {
      return false;
    }

    return option.unlockLevel <= level;
  }

  /**
   * 잠금 해제 가능한 새 옵션 조회
   * @param {number} currentLevel - 현재 레벨
   * @returns {Array} 새로 잠금 해제된 옵션들
   */
  getNewlyUnlockedOptions(currentLevel) {
    const newlyUnlocked = [];

    for (const category of Object.keys(CUSTOMIZATION_OPTIONS_DB)) {
      for (const option of CUSTOMIZATION_OPTIONS_DB[category]) {
        if (option.unlockLevel === currentLevel) {
          newlyUnlocked.push({
            category,
            ...option
          });
        }
      }
    }

    return newlyUnlocked;
  }

  /**
   * 프리셋 저장
   * @param {string} characterId - 캐릭터 ID
   * @param {string} presetName - 프리셋 이름
   * @param {Object} customization - 커스터마이징 데이터
   * @returns {Object} 결과 { success, presetId, message }
   */
  savePreset(characterId, presetName, customization) {
    // 입력 유효성 검사
    if (!characterId || !presetName || !customization) {
      return {
        success: false,
        message: '필수 파라미터 누락'
      };
    }

    // 프리셋 ID 생성 (캐릭터ID_이름_타임스탬프)
    const presetId = `${characterId}_${presetName}_${Date.now()}`;

    // 프리셋 데이터 생성
    const presetData = {
      id: presetId,
      characterId,
      name: presetName,
      customization: { ...customization },
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    // 프리셋 저장
    this.presets.set(presetId, presetData);

    return {
      success: true,
      presetId,
      preset: presetData,
      message: `프리셋 "${presetName}" 저장 완료`
    };
  }

  /**
   * 프리셋 로드
   * @param {string} presetId - 프리셋 ID
   * @returns {Object|null} 프리셋 데이터 또는 null
   */
  loadPreset(presetId) {
    const preset = this.presets.get(presetId);
    return preset ? { ...preset } : null;
  }

  /**
   * 캐릭터별 프리셋 목록 조회
   * @param {string} characterId - 캐릭터 ID
   * @returns {Array} 프리셋 목록
   */
  getPresets(characterId) {
    const characterPresets = [];

    for (const [presetId, preset] of this.presets) {
      if (preset.characterId === characterId) {
        characterPresets.push({ ...preset });
      }
    }

    // 생성일 기준 정렬 (최신순)
    return characterPresets.sort((a, b) => b.createdAt - a.createdAt);
  }

  /**
   * 프리셋 삭제
   * @param {string} presetId - 프리셋 ID
   * @returns {Object} 결과 { success, message }
   */
  deletePreset(presetId) {
    if (!this.presets.has(presetId)) {
      return {
        success: false,
        message: '프리셋을 찾을 수 없음'
      };
    }

    this.presets.delete(presetId);
    return {
      success: true,
      message: '프리셋 삭제 완료'
    };
  }

  /**
   * 커스터마이징 히스토리 기록
   * @param {string} characterId - 캐릭터 ID
   * @param {Object} oldCustomization - 이전 커스터마이징
   * @param {Object} newCustomization - 새 커스터마이징
   * @returns {string} 히스토리 ID
   */
  recordHistory(characterId, oldCustomization, newCustomization) {
    // 히스토리 ID 생성
    const historyId = `${characterId}_history_${Date.now()}`;

    // 변경 사항 분석
    const changes = this.analyzeChanges(oldCustomization, newCustomization);

    // 히스토리 데이터 생성
    const historyData = {
      id: historyId,
      characterId,
      oldCustomization: { ...oldCustomization },
      newCustomization: { ...newCustomization },
      changes,
      timestamp: Date.now()
    };

    // 히스토리 저장
    if (!this.histories.has(characterId)) {
      this.histories.set(characterId, []);
    }

    const characterHistory = this.histories.get(characterId);
    characterHistory.push(historyData);

    // 최대 50개로 제한
    if (characterHistory.length > 50) {
      characterHistory.shift();
    }

    return historyId;
  }

  /**
   * 변경 사항 분석
   * @param {Object} oldCustomization - 이전 커스터마이징
   * @param {Object} newCustomization - 새 커스터마이징
   * @returns {Array} 변경 사항 목록
   */
  analyzeChanges(oldCustomization, newCustomization) {
    const changes = [];
    const keys = new Set([
      ...Object.keys(oldCustomization || {}),
      ...Object.keys(newCustomization || {})
    ]);

    for (const key of keys) {
      const oldValue = oldCustomization?.[key];
      const newValue = newCustomization?.[key];

      if (oldValue !== newValue) {
        changes.push({
          category: key,
          oldValue,
          newValue,
          changedAt: Date.now()
        });
      }
    }

    return changes;
  }

  /**
   * 캐릭터별 히스토리 조회
   * @param {string} characterId - 캐릭터 ID
   * @param {number} limit - 최대 개수 (기본 10)
   * @returns {Array} 히스토리 목록
   */
  getHistory(characterId, limit = 10) {
    const characterHistory = this.histories.get(characterId) || [];

    // 최근순 정렬 및 개수 제한
    return characterHistory
      .slice(-limit)
      .reverse()
      .map(h => ({ ...h }));
  }

  /**
   * 시스템 요약 정보
   * @returns {Object} 시스템 요약
   */
  getSummary() {
    return {
      categories: Object.keys(CUSTOMIZATION_OPTIONS_DB),
      totalPresets: this.presets.size,
      totalHistories: Array.from(this.histories.values()).reduce(
        (sum, hist) => sum + hist.length,
        0
      ),
      availableOptions: {
        hairStyle: CUSTOMIZATION_OPTIONS_DB.hairStyle.length,
        hairColor: CUSTOMIZATION_OPTIONS_DB.hairColor.length,
        clothingColor: CUSTOMIZATION_OPTIONS_DB.clothingColor.length,
        accessory: CUSTOMIZATION_OPTIONS_DB.accessory.length,
        skinTone: CUSTOMIZATION_OPTIONS_DB.skinTone.length,
        eyeColor: CUSTOMIZATION_OPTIONS_DB.eyeColor.length,
        facialFeature: CUSTOMIZATION_OPTIONS_DB.facialFeature.length
      }
    };
  }
}

/**
 * 시스템 인스턴스 생성
 */
const customizationExtensionSystem = new CustomizationExtensionSystem();

/**
 * Export
 */
export {
  CustomizationExtensionSystem,
  customizationExtensionSystem,
  CUSTOMIZATION_CATEGORIES,
  CUSTOMIZATION_OPTIONS_DB
};