/**
 * Pixel Art Renderer
 * 픽셀아트 스타일 캐릭터 & 타일 렌더링 유틸리티
 * 애니메이션 채널 시스템 통합
 * Phase 3: 배경 픽셀아트 타일 시스템
 */

import AnimationController from './AnimationController.js';

const PIXEL_SIZE = 1; // 기본 픽셀 사이즈 (스케일링 적용)
const CHARACTER_SIZE = 32; // 32x32 픽셀
const TILE_SIZE = 32; // 타일 크기 (32x32 픽셀)

// ==================== 애니메이션 채널 관리자 ====================

class AnimationChannelManager {
  constructor() {
    this.controllers = new Map();
  }

  /**
   * 애니메이션 컨트롤러 가져오기
   * @param {string} characterId - 캐릭터 ID
   * @returns {AnimationController}
   */
  getController(characterId) {
    if (!this.controllers.has(characterId)) {
      this.controllers.set(characterId, new AnimationController(characterId));
    }
    return this.controllers.get(characterId);
  }

  /**
   * 캐릭터 컨트롤러 제거
   * @param {string} characterId - 캐릭터 ID
   */
  removeController(characterId) {
    const controller = this.controllers.get(characterId);
    if (controller) {
      controller.cleanup();
      this.controllers.delete(characterId);
    }
  }

  /**
   * 모든 컨트롤러 정리
   */
  cleanupAll() {
    this.controllers.forEach(controller => controller.cleanup());
    this.controllers.clear();
  }
}

// 전체 애니메이션 채널 관리자
const globalAnimationChannelManager = new AnimationChannelManager();

// ==================== 색상 팔레트 ====================

const COLORS = {
  skin: '#FFE4C4',
  hair: {
    default: '#000000',
    brown: '#8B4513',
    gold: '#FFD700',
  },
  clothing: {
    blue: '#4169E1',
    red: '#FF6347',
    green: '#32CD32',
    yellow: '#FFD700',
    purple: '#9370DB',
  },
  outline: '#333333',
  white: '#FFFFFF',
  pink: '#FFB6C1',
  // 타일 색상
  grass: {
    base: '#4CAF50',
    light: '#66BB6A',
    dark: '#388E3C',
  },
  water: {
    base: '#2196F3',
    light: '#64B5F6',
    dark: '#1976D2',
    foam: '#E3F2FD',
  },
  tree: {
    trunk: '#5D4037',
    leaves: '#2E7D32',
    shadow: '#1B5E20',
    highlight: '#43A047',
  },
  path: {
    dirt: '#8D6E63',
    stone: '#757575',
  },
  building: {
    wall: '#9E9E9E',
    roof: '#5D4037',
    door: '#3E2723',
    window: '#64B5F6',
  },
};

// ==================== 픽셀 그리기 함수 ====================

/**
 * 픽셀 그리기 함수
 * @param {CanvasRenderingContext2D} ctx - Canvas 컨텍스트
 * @param {number} x - X 좌표
 * @param {number} y - Y 좌표
 * @param {string} color - 색상
 * @param {number} scale - 스케일
 */
function drawPixel(ctx, x, y, color, scale = 1) {
  ctx.fillStyle = color;
  ctx.fillRect(
    Math.floor(x) * scale,
    Math.floor(y) * scale,
    scale,
    scale
  );
}

/**
 * 픽셀 패턴 그리기
 * @param {CanvasRenderingContext2D} ctx - Canvas 컨텍스트
 * @param {Array} pattern - 패턴 (2D 배열)
 * @param {number} offsetX - X 오프셋
 * @param {number} offsetY - Y 오프셋
 * @param {number} scale - 스케일
 * @param {Object} colorMap - 색상 맵
 */
function drawPattern(ctx, pattern, offsetX, offsetY, scale = 1, colorMap = {}) {
  pattern.forEach((row, rowIndex) => {
    row.forEach((color, colIndex) => {
      if (color && color !== 0) {
        const pixelColor = colorMap[color] || color;
        drawPixel(
          ctx,
          offsetX + colIndex,
          offsetY + rowIndex,
          pixelColor,
          scale
        );
      }
    });
  });
}

// ==================== 캐릭터 렌더링 ====================

// 머리 스타일 패턴
const HAIR_STYLES = {
  short: [
    [0, 0, 0, 0, 0, 0],
    [0, 1, 1, 1, 1, 0],
    [1, 2, 2, 2, 2, 1],
    [1, 2, 2, 2, 2, 1],
    [0, 1, 1, 1, 1, 0],
    [0, 0, 0, 0, 0, 0],
  ],
  medium: [
    [0, 0, 0, 0, 0, 0],
    [0, 1, 1, 1, 1, 0],
    [1, 2, 2, 2, 2, 1],
    [1, 2, 2, 2, 2, 1],
    [1, 2, 2, 2, 2, 1],
    [0, 1, 1, 1, 1, 0],
  ],
  long: [
    [0, 0, 0, 0, 0, 0],
    [0, 1, 1, 1, 1, 0],
    [1, 2, 2, 2, 2, 1],
    [1, 2, 2, 2, 2, 1],
    [1, 2, 2, 2, 2, 1],
    [1, 2, 2, 2, 2, 1],
  ],
};

// 악세사리 패턴
const ACCESSORIES = {
  none: null,
  glasses: [
    [0, 0, 0, 0, 0, 0],
    [0, 1, 1, 1, 1, 0],
    [0, 1, 0, 0, 1, 0],
    [0, 1, 1, 1, 1, 0],
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0],
  ],
  hat: [
    [0, 0, 1, 1, 0, 0],
    [0, 1, 2, 2, 1, 0],
    [0, 1, 2, 2, 1, 0],
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0],
  ],
  flowers: [
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0, 1, 0, 0],
    [0, 1, 0, 0, 1, 0],
    [0, 0, 1, 1, 0, 0],
    [0, 0, 0, 0, 0, 0],
  ],
};

/**
 * 픽셀아트 캐릭터 그리기 (애니메이션 지원)
 * @param {CanvasRenderingContext2D} ctx - Canvas Context
 * @param {number} x - X 좌표
 * @param {number} y - Y 좌표
 * @param {number} scale - 스케일 (기본: 1.25 to make 32px → 40px)
 * @param {Object} options - 커스터마이징 옵션
 * @param {string} options.hairStyle - 머리 스타일 (short|medium|long)
 * @param {string} options.hairColor - 머리 색상 (default|brown|gold)
 * @param {string} options.clothingColor - 옷 색상 (blue|red|green|yellow|purple)
 * @param {string} options.accessory - 악세사리 (none|glasses|hat|flowers)
 * @param {string} options.emotion - 감정 (happy|sad|angry|neutral|joy|surprised)
 * @param {string} options.characterId - 캐릭터 ID (애니메이션에 필요)
 * @param {boolean} options.isMoving - 이동 중 여부
 * @param {string} options.direction - 이동 방향 (up|down|left|right)
 * @param {number} options.movementSpeed - 이동 속도 (run/walk 결정)
 */
export function drawPixelCharacter(ctx, x, y, scale = 1.25, options = {}) {
  const {
    hairStyle = 'short',
    hairColor = 'default',
    clothingColor = 'blue',
    accessory = 'none',
    emotion = 'neutral',
    characterId,
    isMoving = false,
    direction = 'down',
    movementSpeed = 0,
  } = options;

  // 애니메이션 컨트롤러 업데이트 (characterId가 있을 때만)
  let animationState = null;
  if (characterId) {
    const controller = globalAnimationChannelManager.getController(characterId);
    const timestamp = performance.now();
    controller.setEmotion(emotion);
    controller.setMoving(isMoving, movementSpeed);
    controller.setDirection(direction);
    controller.updateFrame(timestamp);
    animationState = controller.getCurrentState();
  }

  const colorMap = {
    1: COLORS.outline,
    2: COLORS.hair[hairColor] || COLORS.hair.default,
    3: COLORS.clothing[clothingColor] || COLORS.clothing.blue,
    4: COLORS.skin,
    5: COLORS.white,
    6: COLORS.pink,
  };

  // 몸통 (Body)
  const bodyPattern = [
    [0, 0, 0, 0, 0, 0],
    [0, 0, 3, 3, 0, 0],
    [0, 1, 1, 1, 1, 0],
    [0, 1, 3, 3, 1, 0],
    [0, 1, 3, 3, 1, 0],
    [0, 1, 3, 3, 1, 0],
    [0, 1, 3, 3, 1, 0],
    [0, 1, 3, 3, 1, 0],
    [0, 1, 1, 1, 1, 0],
    [0, 0, 0, 0, 0, 0],
  ];

  // 머리 (Head)
  const headPattern = [
    [0, 0, 0, 0, 0, 0],
    [0, 0, 1, 1, 0, 0],
    [0, 1, 4, 4, 1, 0],
    [0, 1, 4, 4, 1, 0],
    [0, 1, 4, 4, 1, 0],
    [0, 0, 1, 1, 0, 0],
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0],
  ];

  // 감정 애니메이션 프레임
  const emotionFrame = animationState ? animationState.emotionFrame : 0;

  // 눈 (Eyes) - 감정에 따라 변화 (애니메이션 지원)
  let eyePattern;
  switch (emotion) {
    case 'happy':
    case 'joy':
      eyePattern = emotionFrame === 0 ? [
        [0, 0, 0, 0, 0, 0],
        [0, 0, 1, 1, 0, 0],
        [0, 0, 5, 5, 0, 0],
        [0, 1, 5, 5, 1, 0],
        [0, 0, 5, 5, 0, 0],
        [0, 0, 0, 0, 0, 0],
      ] : [
        [0, 0, 0, 0, 0, 0],
        [0, 1, 1, 1, 1, 0],
        [0, 1, 0, 0, 1, 0],
        [0, 1, 1, 1, 1, 0],
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
      ];
      break;
    case 'sad':
      eyePattern = [
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
        [0, 1, 5, 5, 1, 0],
        [0, 0, 5, 5, 0, 0],
        [0, 0, 1, 1, 0, 0],
        [0, 0, 0, 0, 0, 0],
      ];
      break;
    case 'angry':
      eyePattern = emotionFrame === 0 ? [
        [0, 0, 0, 0, 0, 0],
        [0, 1, 1, 1, 1, 0],
        [0, 0, 5, 5, 0, 0],
        [0, 1, 5, 5, 1, 0],
        [0, 0, 5, 5, 0, 0],
        [0, 1, 1, 1, 1, 0],
      ] : [
        [0, 1, 1, 1, 1, 0],
        [0, 1, 1, 1, 1, 0],
        [0, 0, 5, 5, 0, 0],
        [0, 1, 5, 5, 1, 0],
        [0, 0, 5, 5, 0, 0],
        [0, 1, 1, 1, 1, 0],
      ];
      break;
    case 'surprised':
      eyePattern = [
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
        [0, 1, 5, 5, 1, 0],
        [0, 0, 5, 5, 0, 0],
        [0, 1, 5, 5, 1, 0],
        [0, 0, 0, 0, 0, 0],
      ];
      break;
    default: // neutral
      eyePattern = [
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
        [0, 1, 5, 5, 1, 0],
        [0, 1, 5, 5, 1, 0],
        [0, 0, 5, 5, 0, 0],
        [0, 0, 0, 0, 0, 0],
      ];
  }

  // 입 (Mouth) - 감정에 따라 변화
  let mouthPattern;
  switch (emotion) {
    case 'happy':
    case 'joy':
      mouthPattern = emotionFrame === 0 ? [
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
        [0, 1, 6, 6, 1, 0],
        [0, 0, 6, 6, 0, 0],
      ] : [
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
        [0, 0, 6, 6, 0, 0],
        [0, 1, 6, 6, 1, 0],
      ];
      break;
    case 'sad':
      mouthPattern = [
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
        [0, 1, 6, 6, 1, 0],
        [0, 0, 6, 6, 0, 0],
        [0, 0, 0, 0, 0, 0],
      ];
      break;
    case 'angry':
      mouthPattern = [
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
        [0, 0, 6, 6, 0, 0],
        [0, 1, 0, 0, 1, 0],
        [0, 0, 0, 0, 0, 0],
      ];
      break;
    case 'surprised':
      mouthPattern = [
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
        [0, 0, 6, 6, 0, 0],
        [0, 0, 6, 6, 0, 0],
        [0, 0, 0, 0, 0, 0],
      ];
      break;
    default: // neutral
      mouthPattern = [
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
        [0, 1, 6, 6, 1, 0],
        [0, 0, 0, 0, 0, 0],
      ];
  }

  // 오프셑 계산
  const bodyOffsetX = x - 3;
  const bodyOffsetY = y - 4;
  const headOffsetX = x - 3;
  const headOffsetY = y - 13;
  const eyeOffsetX = x - 3;
  const eyeOffsetY = y - 11;
  const mouthOffsetX = x - 3;
  const mouthOffsetY = y - 8;
  const hairOffsetX = x - 3;
  const hairOffsetY = y - 16;

  // Bounce 애니메이션 (걷을 때 캐릭터가 위아래로 움직임)
  let bounceY = 0;
  if (animationState && (animationState.state === 'walk' || animationState.state === 'run')) {
    const bounceAmplitude = animationState.state === 'run' ? 0.8 : 0.5;
    bounceY = -Math.sin(animationState.currentFrame * Math.PI / 2) * bounceAmplitude;
  }

  // 몸통 그리기 (bounce 애니메이션 적용)
  drawPattern(ctx, bodyPattern, bodyOffsetX, bodyOffsetY + bounceY, scale, colorMap);

  // 머리 그리기
  drawPattern(ctx, headPattern, headOffsetX, headOffsetY + bounceY, scale, colorMap);

  // 눈 그리기
  drawPattern(ctx, eyePattern, eyeOffsetX, eyeOffsetY + bounceY, scale, colorMap);

  // 입 그리기
  drawPattern(ctx, mouthPattern, mouthOffsetX, mouthOffsetY + bounceY, scale, colorMap);

  // 머리카락 그리기
  const hairPattern = HAIR_STYLES[hairStyle] || HAIR_STYLES.short;
  drawPattern(ctx, hairPattern, hairOffsetX, hairOffsetY + bounceY, scale, colorMap);

  // 악세사리 그리기
  if (accessory !== 'none' && ACCESSORIES[accessory]) {
    const accessoryPattern = ACCESSORIES[accessory];
    drawPattern(ctx, accessoryPattern, eyeOffsetX, eyeOffsetY + bounceY, scale, colorMap);
  }
}

/**
 * 픽셀아트 캐릭터를 Data URL로 생성
 * @param {Object} options - 커스터마이징 옵션
 * @returns {string} Data URL (base64)
 */
export function createPixelCharacterDataURL(options = {}) {
  const canvas = document.createElement('canvas');
  const size = CHARACTER_SIZE;
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  // 투명 배경
  ctx.clearRect(0, 0, size, size);

  // 캐릭터 그리기 (scale = 1 for base image)
  drawPixelCharacter(ctx, 16, 16, 1, options);

  return canvas.toDataURL('image/png');
}

/**
 * 캐릭터 커스터마이징 옵션 유효성 검사
 * @param {Object} options - 커스터마이징 옵션
 * @returns {boolean} 유효한지 여부
 */
export function validateCustomizationOptions(options) {
  // null, undefined, 비객체 핸들링
  if (!options || typeof options !== 'object') {
    return true;
  }

  const validHairStyles = ['short', 'medium', 'long'];
  const validHairColors = ['default', 'brown', 'gold'];
  const validClothingColors = ['blue', 'red', 'green', 'yellow', 'purple'];
  const validAccessories = ['none', 'glasses', 'hat', 'flowers'];
  const validEmotions = ['happy', 'sad', 'angry', 'neutral', 'joy', 'surprised'];

  return (
    (!options.hairStyle || validHairStyles.includes(options.hairStyle)) &&
    (!options.hairColor || validHairColors.includes(options.hairColor)) &&
    (!options.clothingColor || validClothingColors.includes(options.clothingColor)) &&
    (!options.accessory || validAccessories.includes(options.accessory)) &&
    (!options.emotion || validEmotions.includes(options.emotion))
  );
}

// ==================== 타일 시스템 (Phase 3) ====================

/**
 * Tile 클래스
 * @class
 */
export class Tile {
  /**
   * @param {Object} options - 타일 옵션
   * @param {number} options.id - 타일 ID
   * @param {string} options.type - 타일 타입 (grass|water|tree|building|path)
   * @param {Object} options.properties - 타일 속성
   * @param {Object} options.style - 타일 스타일
   */
  constructor({ id, type, properties = {}, style = {} }) {
    this.id = id;
    this.type = type;
    this.properties = properties;
    this.style = style;
  }

  /**
   * 타일이 통행 가능한지 확인
   * @returns {boolean}
   */
  isWalkable() {
    return this.properties.walkable !== false;
  }

  /**
   * 타일이 장애물인지 확인
   * @returns {boolean}
   */
  isObstacle() {
    return this.properties.obstacle === true;
  }

  /**
   * 타일 상호작용 여부 확인
   * @returns {boolean}
   */
  isInteractable() {
    return this.properties.interactable === true;
  }
}

/**
 * Tilemap 클래스
 * @class
 */
export class Tilemap {
  /**
   * @param {Object} options - 타일맵 옵션
   * @param {number} options.width - 맵 너비 (타일 수)
   * @param {number} options.height - 맵 높이 (타일 수)
   * @param {number} options.tileWidth - 타일 너비 (픽셀)
   * @param {number} options.tileHeight - 타일 높이 (픽셀)
   */
  constructor({ width, height, tileWidth = TILE_SIZE, tileHeight = TILE_SIZE }) {
    this.width = width;
    this.height = height;
    this.tileWidth = tileWidth;
    this.tileHeight = tileHeight;
    this.tiles = new Array(width * height).fill(null);
    this.layers = [];
  }

  /**
   * 타일 좌표로 인덱스 계산
   * @param {number} x - 타일 X 좌표
   * @param {number} y - 타일 Y 좌표
   * @returns {number} 배열 인덱스
   */
  getIndex(x, y) {
    return y * this.width + x;
  }

  /**
   * 타일 설정
   * @param {number} x - 타일 X 좌표
   * @param {number} y - 타일 Y 좌표
   * @param {Tile} tile - 타일 객체
   */
  setTile(x, y, tile) {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) return;
    this.tiles[this.getIndex(x, y)] = tile;
  }

  /**
   * 타일 가져오기
   * @param {number} x - 타일 X 좌표
   * @param {number} y - 타일 Y 좌표
   * @returns {Tile|null} 타일 객체
   */
  getTile(x, y) {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) return null;
    return this.tiles[this.getIndex(x, y)];
  }

  /**
   * 레이어 추가
   * @param {Array} tiles - 타일 배열
   * @param {string} name - 레이어 이름
   */
  addLayer(tiles, name) {
    this.layers.push({ name, tiles });
  }
}

// ==================== 타일 패턴 (픽셀 아트) ====================

// 잔디 타일 패턴
const GRASS_TILE = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 2, 3, 2, 3, 2, 1, 2, 3, 2, 3, 2, 1, 2, 3, 2, 3, 2, 1, 2, 3, 2, 3, 2, 1, 2, 3, 2, 3, 2, 1, 1],
  [1, 3, 2, 3, 2, 3, 1, 3, 2, 3, 2, 3, 1, 3, 2, 3, 2, 3, 1, 3, 2, 3, 2, 3, 1, 3, 2, 3, 2, 3, 1, 1],
  [1, 2, 3, 2, 3, 2, 1, 2, 3, 2, 3, 2, 1, 2, 3, 2, 3, 2, 1, 2, 3, 2, 3, 2, 1, 2, 3, 2, 3, 2, 1, 1],
  [1, 3, 2, 3, 2, 3, 1, 3, 2, 3, 2, 3, 1, 3, 2, 3, 2, 3, 1, 3, 2, 3, 2, 3, 1, 3, 2, 3, 2, 3, 1, 1],
  [1, 2, 3, 2, 3, 2, 1, 2, 3, 2, 3, 2, 1, 2, 3, 2, 3, 2, 1, 2, 3, 2, 3, 2, 1, 2, 3, 2, 3, 2, 1, 1],
  [1, 3, 2, 3, 2, 3, 1, 3, 2, 3, 2, 3, 1, 3, 2, 3, 2, 3, 1, 3, 2, 3, 2, 3, 1, 3, 2, 3, 2, 3, 1, 1],
  [1, 2, 3, 2, 3, 2, 1, 2, 3, 2, 3, 2, 1, 2, 3, 2, 3, 2, 1, 2, 3, 2, 3, 2, 1, 2, 3, 2, 3, 2, 1, 1],
  [1, 3, 2, 3, 2, 3, 1, 3, 2, 3, 2, 3, 1, 3, 2, 3, 2, 3, 1, 3, 2, 3, 2, 3, 1, 3, 2, 3, 2, 3, 1, 1],
  [1, 2, 3, 2, 3, 2, 1, 2, 3, 2, 3, 2, 1, 2, 3, 2, 3, 2, 1, 2, 3, 2, 3, 2, 1, 2, 3, 2, 3, 2, 1, 1],
  [1, 3, 2, 3, 2, 3, 1, 3, 2, 3, 2, 3, 1, 3, 2, 3, 2, 3, 1, 3, 2, 3, 2, 3, 1, 3, 2, 3, 2, 3, 1, 1],
  [1, 2, 3, 2, 3, 2, 1, 2, 3, 2, 3, 2, 1, 2, 3, 2, 3, 2, 1, 2, 3, 2, 3, 2, 1, 2, 3, 2, 3, 2, 1, 1],
  [1, 3, 2, 3, 2, 3, 1, 3, 2, 3, 2, 3, 1, 3, 2, 3, 2, 3, 1, 3, 2, 3, 2, 3, 1, 3, 2, 3, 2, 3, 1, 1],
  [1, 2, 3, 2, 3, 2, 1, 2, 3, 2, 3, 2, 1, 2, 3, 2, 3, 2, 1, 2, 3, 2, 3, 2, 1, 2, 3, 2, 3, 2, 1, 1],
  [1, 3, 2, 3, 2, 3, 1, 3, 2, 3, 2, 3, 1, 3, 2, 3, 2, 3, 1, 3, 2, 3, 2, 3, 1, 3, 2, 3, 2, 3, 1, 1],
  [1, 2, 3, 2, 3, 2, 1, 2, 3, 2, 3, 2, 1, 2, 3, 2, 3, 2, 1, 2, 3, 2, 3, 2, 1, 2, 3, 2, 3, 2, 1, 1],
  [1, 3, 2, 3, 2, 3, 1, 3, 2, 3, 2, 3, 1, 3, 2, 3, 2, 3, 1, 3, 2, 3, 2, 3, 1, 3, 2, 3, 2, 3, 1, 1],
  [1, 2, 3, 2, 3, 2, 1, 2, 3, 2, 3, 2, 1, 2, 3, 2, 3, 2, 1, 2, 3, 2, 3, 2, 1, 2, 3, 2, 3, 2, 1, 1],
  [1, 3, 2, 3, 2, 3, 1, 3, 2, 3, 2, 3, 1, 3, 2, 3, 2, 3, 1, 3, 2, 3, 2, 3, 1, 3, 2, 3, 2, 3, 1, 1],
  [1, 2, 3, 2, 3, 2, 1, 2, 3, 2, 3, 2, 1, 2, 3, 2, 3, 2, 1, 2, 3, 2, 3, 2, 1, 2, 3, 2, 3, 2, 1, 1],
  [1, 3, 2, 3, 2, 3, 1, 3, 2, 3, 2, 3, 1, 3, 2, 3, 2, 3, 1, 3, 2, 3, 2, 3, 1, 3, 2, 3, 2, 3, 1, 1],
  [1, 2, 3, 2, 3, 2, 1, 2, 3, 2, 3, 2, 1, 2, 3, 2, 3, 2, 1, 2, 3, 2, 3, 2, 1, 2, 3, 2, 3, 2, 1, 1],
  [1, 3, 2, 3, 2, 3, 1, 3, 2, 3, 2, 3, 1, 3, 2, 3, 2, 3, 1, 3, 2, 3, 2, 3, 1, 3, 2, 3, 2, 3, 1, 1],
  [1, 2, 3, 2, 3, 2, 1, 2, 3, 2, 3, 2, 1, 2, 3, 2, 3, 2, 1, 2, 3, 2, 3, 2, 1, 2, 3, 2, 3, 2, 1, 1],
  [1, 3, 2, 3, 2, 3, 1, 3, 2, 3, 2, 3, 1, 3, 2, 3, 2, 3, 1, 3, 2, 3, 2, 3, 1, 3, 2, 3, 2, 3, 1, 1],
  [1, 2, 3, 2, 3, 2, 1, 2, 3, 2, 3, 2, 1, 2, 3, 2, 3, 2, 1, 2, 3, 2, 3, 2, 1, 2, 3, 2, 3, 2, 1, 1],
  [1, 3, 2, 3, 2, 3, 1, 3, 2, 3, 2, 3, 1, 3, 2, 3, 2, 3, 1, 3, 2, 3, 2, 3, 1, 3, 2, 3, 2, 3, 1, 1],
  [1, 2, 3, 2, 3, 2, 1, 2, 3, 2, 3, 2, 1, 2, 3, 2, 3, 2, 1, 2, 3, 2, 3, 2, 1, 2, 3, 2, 3, 2, 1, 1],
  [1, 3, 2, 3, 2, 3, 1, 3, 2, 3, 2, 3, 1, 3, 2, 3, 2, 3, 1, 3, 2, 3, 2, 3, 1, 3, 2, 3, 2, 3, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
];

// 물 타일 패턴 (애니메이션 프레임 0)
const WATER_TILE_ANIM_0 = [
  [4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
  [4, 5, 6, 5, 6, 5, 4, 5, 6, 5, 6, 5, 4, 5, 6, 5, 6, 5, 4, 5, 6, 5, 6, 5, 4, 5, 6, 5, 6, 5, 4, 4],
  [4, 6, 5, 6, 5, 6, 4, 6, 5, 6, 5, 6, 4, 6, 5, 6, 5, 6, 4, 6, 5, 6, 5, 6, 4, 6, 5, 6, 5, 6, 4, 4],
  [4, 5, 6, 5, 6, 5, 4, 5, 6, 5, 6, 5, 4, 5, 6, 5, 6, 5, 4, 5, 6, 5, 6, 5, 4, 5, 6, 5, 6, 5, 4, 4],
  [4, 6, 5, 6, 5, 6, 4, 6, 5, 6, 5, 6, 4, 6, 5, 6, 5, 6, 4, 6, 5, 6, 5, 6, 4, 6, 5, 6, 5, 6, 4, 4],
  [4, 5, 6, 5, 6, 5, 4, 5, 6, 5, 6, 5, 4, 5, 6, 5, 6, 5, 4, 5, 6, 5, 6, 5, 4, 5, 6, 5, 6, 5, 4, 4],
  [4, 6, 5, 6, 5, 6, 4, 6, 5, 6, 5, 6, 4, 6, 5, 6, 5, 6, 4, 6, 5, 6, 5, 6, 4, 6, 5, 6, 5, 6, 4, 4],
  [4, 5, 6, 5, 6, 5, 4, 5, 6, 5, 6, 5, 4, 5, 6, 5, 6, 5, 4, 5, 6, 5, 6, 5, 4, 5, 6, 5, 6, 5, 4, 4],
  [4, 6, 5, 6, 5, 6, 4, 6, 5, 6, 5, 6, 4, 6, 5, 6, 5, 6, 4, 6, 5, 6, 5, 6, 4, 6, 5, 6, 5, 6, 4, 4],
  [4, 5, 6, 5, 6, 5, 4, 5, 6, 5, 6, 5, 4, 5, 6, 5, 6, 5, 4, 5, 6, 5, 6, 5, 4, 5, 6, 5, 6, 5, 4, 4],
  [4, 6, 5, 6, 5, 6, 4, 6, 5, 6, 5, 6, 4, 6, 5, 6, 5, 6, 4, 6, 5, 6, 5, 6, 4, 6, 5, 6, 5, 6, 4, 4],
  [4, 5, 6, 5, 6, 5, 4, 5, 6, 5, 6, 5, 4, 5, 6, 5, 6, 5, 4, 5, 6, 5, 6, 5, 4, 5, 6, 5, 6, 5, 4, 4],
  [4, 6, 5, 6, 5, 6, 4, 6, 5, 6, 5, 6, 4, 6, 5, 6, 5, 6, 4, 6, 5, 6, 5, 6, 4, 6, 5, 6, 5, 6, 4, 4],
  [4, 5, 6, 5, 6, 5, 4, 5, 6, 5, 6, 5, 4, 5, 6, 5, 6, 5, 4, 5, 6, 5, 6, 5, 4, 5, 6, 5, 6, 5, 4, 4],
  [4, 6, 5, 6, 5, 6, 4, 6, 5, 6, 5, 6, 4, 6, 5, 6, 5, 6, 4, 6, 5, 6, 5, 6, 4, 6, 5, 6, 5, 6, 4, 4],
  [4, 5, 6, 5, 6, 5, 4, 5, 6, 5, 6, 5, 4, 5, 6, 5, 6, 5, 4, 5, 6, 5, 6, 5, 4, 5, 6, 5, 6, 5, 4, 4],
  [4, 6, 5, 6, 5, 6, 4, 6, 5, 6, 5, 6, 4, 6, 5, 6, 5, 6, 4, 6, 5, 6, 5, 6, 4, 6, 5, 6, 5, 6, 4, 4],
  [4, 5, 6, 5, 6, 5, 4, 5, 6, 5, 6, 5, 4, 5, 6, 5, 6, 5, 4, 5, 6, 5, 6, 5, 4, 5, 6, 5, 6, 5, 4, 4],
  [4, 6, 5, 6, 5, 6, 4, 6, 5, 6, 5, 6, 4, 6, 5, 6, 5, 6, 4, 6, 5, 6, 5, 6, 4, 6, 5, 6, 5, 6, 4, 4],
  [4, 5, 6, 5, 6, 5, 4, 5, 6, 5, 6, 5, 4, 5, 6, 5, 6, 5, 4, 5, 6, 5, 6, 5, 4, 5, 6, 5, 6, 5, 4, 4],
  [4, 6, 5, 6, 5, 6, 4, 6, 5, 6, 5, 6, 4, 6, 5, 6, 5, 6, 4, 6, 5, 6, 5, 6, 4, 6, 5, 6, 5, 6, 4, 4],
  [4, 5, 6, 5, 6, 5, 4, 5, 6, 5, 6, 5, 4, 5, 6, 5, 6, 5, 4, 5, 6, 5, 6, 5, 4, 5, 6, 5, 6, 5, 4, 4],
  [4, 6, 5, 6, 5, 6, 4, 6, 5, 6, 5, 6, 4, 6, 5, 6, 5, 6, 4, 6, 5, 6, 5, 6, 4, 6, 5, 6, 5, 6, 4, 4],
  [4, 5, 6, 5, 6, 5, 4, 5, 6, 5, 6, 5, 4, 5, 6, 5, 6, 5, 4, 5, 6, 5, 6, 5, 4, 5, 6, 5, 6, 5, 4, 4],
  [4, 6, 5, 6, 5, 6, 4, 6, 5, 6, 5, 6, 4, 6, 5, 6, 5, 6, 4, 6, 5, 6, 5, 6, 4, 6, 5, 6, 5, 6, 4, 4],
  [4, 5, 6, 5, 6, 5, 4, 5, 6, 5, 6, 5, 4, 5, 6, 5, 6, 5, 4, 5, 6, 5, 6, 5, 4, 5, 6, 5, 6, 5, 4, 4],
  [4, 6, 5, 6, 5, 6, 4, 6, 5, 6, 5, 6, 4, 6, 5, 6, 5, 6, 4, 6, 5, 6, 5, 6, 4, 6, 5, 6, 5, 6, 4, 4],
  [4, 5, 6, 5, 6, 5, 4, 5, 6, 5, 6, 5, 4, 5, 6, 5, 6, 5, 4, 5, 6, 5, 6, 5, 4, 5, 6, 5, 6, 5, 4, 4],
  [4, 6, 5, 6, 5, 6, 4, 6, 5, 6, 5, 6, 4, 6, 5, 6, 5, 6, 4, 6, 5, 6, 5, 6, 4, 6, 5, 6, 5, 6, 4, 4],
  [4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
];

// 나무 타일 패턴 (48x48 픽셀 - 32x32 타일 오버랩)
const TREE_TILE = [
  [0, 0, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7],
  [0, 0, 7, 8, 8, 7, 7, 8, 8, 7, 7, 8, 8, 7, 7, 8, 8, 7, 7, 8, 8, 7, 7, 8, 8, 7, 7, 8, 8, 7, 7, 7],
  [0, 0, 8, 9, 9, 8, 8, 9, 9, 8, 8, 9, 9, 8, 8, 9, 9, 8, 8, 9, 9, 8, 8, 9, 9, 8, 8, 9, 9, 8, 7, 7],
  [0, 0, 8, 9, 9, 8, 8, 9, 9, 8, 8, 9, 9, 8, 8, 9, 9, 8, 8, 9, 9, 8, 8, 9, 9, 8, 8, 9, 9, 8, 7, 7],
  [0, 0, 7, 8, 8, 7, 7, 8, 8, 7, 7, 8, 8, 7, 7, 8, 8, 7, 7, 8, 8, 7, 7, 8, 8, 7, 7, 8, 8, 7, 7, 7],
  [0, 0, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7],
  [0, 0, 7, 8, 8, 7, 7, 8, 8, 7, 7, 8, 8, 7, 7, 8, 8, 7, 7, 8, 8, 7, 7, 8, 8, 7, 7, 8, 8, 7, 7, 7],
  [0, 0, 8, 9, 9, 8, 8, 9, 9, 8, 8, 9, 9, 8, 8, 9, 9, 8, 8, 9, 9, 8, 8, 9, 9, 8, 8, 9, 9, 8, 7, 7],
  [0, 0, 8, 9, 9, 8, 8, 9, 9, 8, 8, 9, 9, 8, 8, 9, 9, 8, 8, 9, 9, 8, 8, 9, 9, 8, 8, 9, 9, 8, 7, 7],
  [0, 0, 7, 8, 8, 7, 7, 8, 8, 7, 7, 8, 8, 7, 7, 8, 8, 7, 7, 8, 8, 7, 7, 8, 8, 7, 7, 8, 8, 7, 7, 7],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 10],  // Trunk start
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 10],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 10, 10],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 10, 10],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 10, 10, 10],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 10, 10, 10, 10],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 10, 10, 10, 10, 10],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 10, 10, 10, 10, 10, 10],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 10, 10, 10, 10, 10, 10, 10],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 10, 10, 10, 10, 10, 10, 10, 10],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 10, 10, 10, 10, 10, 10, 10, 10, 10],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10],
];

// 길 (Path) 타일 패턴
const PATH_TILE = [
  [11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11],
  [11, 12, 13, 12, 13, 12, 11, 12, 13, 12, 13, 12, 11, 12, 13, 12, 13, 12, 11, 12, 13, 12, 13, 12, 11, 12, 13, 12, 13, 12, 11, 11],
  [11, 13, 12, 13, 12, 13, 11, 13, 12, 13, 12, 13, 11, 13, 12, 13, 12, 13, 11, 13, 12, 13, 12, 13, 11, 13, 12, 13, 12, 13, 11, 11],
  [11, 12, 13, 12, 13, 12, 11, 12, 13, 12, 13, 12, 11, 12, 13, 12, 13, 12, 11, 12, 13, 12, 13, 12, 11, 12, 13, 12, 13, 12, 11, 11],
  [11, 13, 12, 13, 12, 13, 11, 13, 12, 13, 12, 13, 11, 13, 12, 13, 12, 13, 11, 13, 12, 13, 12, 13, 11, 13, 12, 13, 12, 13, 11, 11],
  [11, 12, 13, 12, 13, 12, 11, 12, 13, 12, 13, 12, 11, 12, 13, 12, 13, 12, 11, 12, 13, 12, 13, 12, 11, 12, 13, 12, 13, 12, 11, 11],
  [11, 13, 12, 13, 12, 13, 11, 13, 12, 13, 12, 13, 11, 13, 12, 13, 12, 13, 11, 13, 12, 13, 12, 13, 11, 13, 12, 13, 12, 13, 11, 11],
  [11, 12, 13, 12, 13, 12, 11, 12, 13, 12, 13, 12, 11, 12, 13, 12, 13, 12, 11, 12, 13, 12, 13, 12, 11, 12, 13, 12, 13, 12, 11, 11],
  [11, 13, 12, 13, 12, 13, 11, 13, 12, 13, 12, 13, 11, 13, 12, 13, 12, 13, 11, 13, 12, 13, 12, 13, 11, 13, 12, 13, 12, 13, 11, 11],
  [11, 12, 13, 12, 13, 12, 11, 12, 13, 12, 13, 12, 11, 12, 13, 12, 13, 12, 11, 12, 13, 12, 13, 12, 11, 12, 13, 12, 13, 12, 11, 11],
  [11, 13, 12, 13, 12, 13, 11, 13, 12, 13, 12, 13, 11, 13, 12, 13, 12, 13, 11, 13, 12, 13, 12, 13, 11, 13, 12, 13, 12, 13, 11, 11],
  [11, 12, 13, 12, 13, 12, 11, 12, 13, 12, 13, 12, 11, 12, 13, 12, 13, 12, 11, 12, 13, 12, 13, 12, 11, 12, 13, 12, 13, 12, 11, 11],
  [11, 13, 12, 13, 12, 13, 11, 13, 12, 13, 12, 13, 11, 13, 12, 13, 12, 13, 11, 13, 12, 13, 12, 13, 11, 13, 12, 13, 12, 13, 11, 11],
  [11, 12, 13, 12, 13, 12, 11, 12, 13, 12, 13, 12, 11, 12, 13, 12, 13, 12, 11, 12, 13, 12, 13, 12, 11, 12, 13, 12, 13, 12, 11, 11],
  [11, 13, 12, 13, 12, 13, 11, 13, 12, 13, 12, 13, 11, 13, 12, 13, 12, 13, 11, 13, 12, 13, 12, 13, 11, 13, 12, 13, 12, 13, 11, 11],
  [11, 12, 13, 12, 13, 12, 11, 12, 13, 12, 13, 12, 11, 12, 13, 12, 13, 12, 11, 12, 13, 12, 13, 12, 11, 12, 13, 12, 13, 12, 11, 11],
  [11, 13, 12, 13, 12, 13, 11, 13, 12, 13, 12, 13, 11, 13, 12, 13, 12, 13, 11, 13, 12, 13, 12, 13, 11, 13, 12, 13, 12, 13, 11, 11],
  [11, 12, 13, 12, 13, 12, 11, 12, 13, 12, 13, 12, 11, 12, 13, 12, 13, 12, 11, 12, 13, 12, 13, 12, 11, 12, 13, 12, 13, 12, 11, 11],
  [11, 13, 12, 13, 12, 13, 11, 13, 12, 13, 12, 13, 11, 13, 12, 13, 12, 13, 11, 13, 12, 13, 12, 13, 11, 13, 12, 13, 12, 13, 11, 11],
  [11, 12, 13, 12, 13, 12, 11, 12, 13, 12, 13, 12, 11, 12, 13, 12, 13, 12, 11, 12, 13, 12, 13, 12, 11, 12, 13, 12, 13, 12, 11, 11],
  [11, 13, 12, 13, 12, 13, 11, 13, 12, 13, 12, 13, 11, 13, 12, 13, 12, 13, 11, 13, 12, 13, 12, 13, 11, 13, 12, 13, 12, 13, 11, 11],
  [11, 12, 13, 12, 13, 12, 11, 12, 13, 12, 13, 12, 11, 12, 13, 12, 13, 12, 11, 12, 13, 12, 13, 12, 11, 12, 13, 12, 13, 12, 11, 11],
  [11, 13, 12, 13, 12, 13, 11, 13, 12, 13, 12, 13, 11, 13, 12, 13, 12, 13, 11, 13, 12, 13, 12, 13, 11, 13, 12, 13, 12, 13, 11, 11],
  [11, 12, 13, 12, 13, 12, 11, 12, 13, 12, 13, 12, 11, 12, 13, 12, 13, 12, 11, 12, 13, 12, 13, 12, 11, 12, 13, 12, 13, 12, 11, 11],
  [11, 13, 12, 13, 12, 13, 11, 13, 12, 13, 12, 13, 11, 13, 12, 13, 12, 13, 11, 13, 12, 13, 12, 13, 11, 13, 12, 13, 12, 13, 11, 11],
  [11, 12, 13, 12, 13, 12, 11, 12, 13, 12, 13, 12, 11, 12, 13, 12, 13, 12, 11, 12, 13, 12, 13, 12, 11, 12, 13, 12, 13, 12, 11, 11],
  [11, 13, 12, 13, 12, 13, 11, 13, 12, 13, 12, 13, 11, 13, 12, 13, 12, 13, 11, 13, 12, 13, 12, 13, 11, 13, 12, 13, 12, 13, 11, 11],
  [11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11],
];

// 타일 색상 맵
const TILE_COLOR_MAP = {
  1: COLORS.outline,  // 잔디 테두리
  2: COLORS.grass.base,  // 잔디 base
  3: COLORS.grass.light,  // 잔디 light
  4: COLORS.water.dark,  // 물 base
  5: COLORS.water.base,  // 물 mid
  6: COLORS.water.light,  // 물 light
  7: COLORS.tree.highlight,  // 나무 leaves light
  8: COLORS.tree.leaves,  // 나무 leaves base
  9: COLORS.tree.shadow,  // 나무 leaves shadow
  10: COLORS.tree.trunk,  // 나무 trunk
  11: COLORS.path.dirt,  // 길 base
  12: COLORS.path.stone,  // 길 stone dark
  13: '#9E9E9E',  // 길 stone light
};

// ==================== 타일 렌더링 함수 ====================

/**
 * 단일 타일 그리기
 * @param {CanvasRenderingContext2D} ctx - Canvas 컨텍스트
 * @param {number} x - 타일 X 좌표 (픽셀)
 * @param {number} y - 타일 Y 좌표 (픽셀)
 * @param {string} tileType - 타일 타입 (grass|water|tree|path)
 * @param {Object} options - 옵션
 * @param {number} options.scale - 스케일
 * @param {number} options.animationFrame - 애니메이션 프레임 (선택)
 * @returns {void}
 */
export function drawTile(ctx, x, y, tileType, options = {}) {
  const { scale = 1, animationFrame = 0 } = options;

  // 픽셀 아트 스무딩 비활성화
  ctx.imageSmoothingEnabled = false;

  let pattern;
  switch (tileType) {
    case 'grass':
      pattern = GRASS_TILE;
      break;
    case 'water':
      // 애니메이션 프레임에 따라 패턴 선택 (현재는 프레임 0만)
      pattern = WATER_TILE_ANIM_0;
      break;
    case 'tree':
      // 나무는 두 타일 오버랩으로 그려짐
      pattern = TREE_TILE;
      break;
    case 'path':
      pattern = PATH_TILE;
      break;
    default:
      pattern = GRASS_TILE;
  }

  drawPattern(ctx, pattern, x, y, scale, TILE_COLOR_MAP);
}

/**
 * 타일맵 그리기
 * @param {CanvasRenderingContext2D} ctx - Canvas 컨텍스트
 * @param {Tilemap} tilemap - 타일맵 객체
 * @param {Object} options - 옵션
 * @param {number} options.scale - 스케일
 * @param {Object} options.offsetX - X 오프셋
 * @param {Object} options.offsetY - Y 오프셋
 * @param {number} options.animationFrame - 애니메이션 프레임
 * @returns {void}
 */
export function drawTilemap(ctx, tilemap, options = {}) {
  const { scale = 1, offsetX = 0, offsetY = 0, animationFrame = 0 } = options;

  const tileCount = tilemap.width * tilemap.height;

  for (let i = 0; i < tileCount; i++) {
    const tile = tilemap.tiles[i];
    if (!tile) continue;

    const tileX = i % tilemap.width;
    const tileY = Math.floor(i / tilemap.width);
    const x = offsetX + tileX * tilemap.tileWidth * scale;
    const y = offsetY + tileY * tilemap.tileHeight * scale;

    drawTile(ctx, x, y, tile.type, { scale, animationFrame });
  }
}

/**
 * 타일 간격 계산 (타일맵 렌더링용)
 * @param {number} mapWidth - 맵 너비 (타일 수)
 * @param {number} mapHeight - 맵 높이 (타일 수)
 * @param {number} tileWidth - 타일 너비 (픽셀)
 * @param {number} tileHeight - 타일 높이 (픽셀)
 * @param {number} scale - 스케일
 * @returns {Object} 총 너비, 높이
 */
export function calculateTileSpacing(mapWidth, mapHeight, tileWidth, tileHeight, scale) {
  return {
    totalWidth: mapWidth * tileWidth * scale,
    totalHeight: mapHeight * tileHeight * scale,
    tileSpacingX: tileWidth * scale,
    tileSpacingY: tileHeight * scale,
  };
}

/**
 * 월드 좌표를 타일 좌표로 변환
 * @param {number} worldX - 월드 X 좌표 (픽셀)
 * @param {number} worldY - 월드 Y 좌표 (픽셀)
 * @param {number} tileWidth - 타일 너비 (픽셀)
 * @param {number} tileHeight - 타일 높이 (픽셀)
 * @param {number} scale - 스케일
 * @returns {Object} 타일 좌표 {x, y}
 */
export function worldToTile(worldX, worldY, tileWidth = TILE_SIZE, tileHeight = TILE_SIZE, scale = 1) {
  return {
    tileX: Math.floor(worldX / (tileWidth * scale)),
    tileY: Math.floor(worldY / (tileHeight * scale)),
  };
}

/**
 * 타일 좌표를 월드 좌표로 변환
 * @param {number} tileX - 타일 X 좌표
 * @param {number} tileY - 타일 Y 좌표
 * @param {number} tileWidth - 타일 너비 (픽셀)
 * @param {number} tileHeight - 타일 높이 (픽셀)
 * @param {number} scale - 스케일
 * @returns {Object} 월드 좌표 {x, y}
 */
export function tileToWorld(tileX, tileY, tileWidth = TILE_SIZE, tileHeight = TILE_SIZE, scale = 1) {
  return {
    worldX: tileX * tileWidth * scale,
    worldY: tileY * tileHeight * scale,
  };
}

// ==================== 애니메이션 컨트롤러 헬퍼 ====================

/**
 * 애니메이션 컨트롤러 가져오기
 * @param {string} characterId - 캐릭터 ID
 * @returns {AnimationController}
 */
export function getAnimationController(characterId) {
  return globalAnimationChannelManager.getController(characterId);
}

/**
 * 캐릭터 애니메이션 컨트롤러 제거
 * @param {string} characterId - 캐릭터 ID
 */
export function removeAnimationController(characterId) {
  globalAnimationChannelManager.removeController(characterId);
}

/**
 * 모든 애니메이션 컨트롤러 정리
 */
export function cleanupAllAnimationControllers() {
  globalAnimationChannelManager.cleanupAll();
}