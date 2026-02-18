/**
 * Pixel Art Renderer
 * 픽셀아트 스타일 캐릭터 렌더링 유틸리티
 * 애니메이션 채널 시스템 통합
 */

import AnimationController from './AnimationController.js';

const PIXEL_SIZE = 1; // 기본 픽셀 사이즈 (스케일링 적용)
const CHARACTER_SIZE = 32; // 32x32 픽셀

// 애니메이션 채널 관리자 (싱글톤)
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

// 색상 팔레트
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
};

// 픽셀 그리기 함수
function drawPixel(ctx, x, y, color, scale = 1) {
  ctx.fillStyle = color;
  ctx.fillRect(
    Math.floor(x) * scale,
    Math.floor(y) * scale,
    scale,
    scale
  );
}

// 픽셀 패턴 그리기 (배열로 정의된 패턴)
function drawPattern(ctx, pattern, offsetX, offsetY, scale = 1) {
  pattern.forEach((row, rowIndex) => {
    row.forEach((color, colIndex) => {
      if (color) {
        drawPixel(
          ctx,
          offsetX + colIndex,
          offsetY + rowIndex,
          color,
          scale
        );
      }
    });
  });
}

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
      // Frame 0: 웃는 눈 / Frame 1: 눈 감기는 애니메이션
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
      // Frame 0: 화난 눈 / Frame 1: 더 화난 눈
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

  // 입 (Mouth) - 감정에 따라 변화 (애니메이션 지원)
  let mouthPattern;
  switch (emotion) {
    case 'happy':
    case 'joy':
      // Frame 0: 웃는 입 / Frame 1: 더 넓게 웃는 입
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
      // Frame 0: 으악 / Frame 1: 더 으악
      mouthPattern = emotionFrame === 0 ? [
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
        [0, 0, 6, 6, 0, 0],
        [0, 1, 0, 0, 1, 0],
        [0, 0, 0, 0, 0, 0],
      ] : [
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
        [0, 0, 6, 6, 0, 0],
        [0, 1, 0, 0, 1, 0],
        [0, 0, 0, 0, 0, 0],
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
  drawPattern(ctx, bodyPattern, bodyOffsetX, bodyOffsetY + bounceY, scale);

  // 머리 그리기 (bounce 애니메이션 적용)
  drawPattern(ctx, headPattern, headOffsetX, headOffsetY + bounceY, scale);

  // 눈 그리기 (bounce 애니메이션 적용)
  drawPattern(ctx, eyePattern, eyeOffsetX, eyeOffsetY + bounceY, scale);

  // 입 그리기 (bounce 애니메이션 적용)
  drawPattern(ctx, mouthPattern, mouthOffsetX, mouthOffsetY + bounceY, scale);

  // 머리카락 그리기 (bounce 애니메이션 적용)
  const hairPattern = HAIR_STYLES[hairStyle] || HAIR_STYLES.short;
  drawPattern(ctx, hairPattern, hairOffsetX, hairOffsetY + bounceY, scale);

  // 악세사리 그리기 (bounce 애니메이션 적용)
  if (accessory !== 'none' && ACCESSORIES[accessory]) {
    const accessoryPattern = ACCESSORIES[accessory];
    drawPattern(ctx, accessoryPattern, eyeOffsetX, eyeOffsetY + bounceY, scale);
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

/**
 * 애니메이션 컨트롤러 가져오기 (Helper 함수)
 * @param {string} characterId - 캐릭터 ID
 * @returns {AnimationController}
 */
export function getAnimationController(characterId) {
  return globalAnimationChannelManager.getController(characterId);
}

/**
 * 캐릭터 애니메이션 컨트롤러 제거 (Helper 함수)
 * @param {string} characterId - 캐릭터 ID
 */
export function removeAnimationController(characterId) {
  globalAnimationChannelManager.removeController(characterId);
}

/**
 * 모든 애니메이션 컨트롤러 정리 (Helper 함수)
 */
export function cleanupAllAnimationControllers() {
  globalAnimationChannelManager.cleanupAll();
}