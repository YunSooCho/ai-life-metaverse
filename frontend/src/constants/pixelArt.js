/**
 * Pixel Art 관련 상수
 * 모든 픽셀 아트 컴포넌트에서 공유하는 상수
 */

// 캐릭터 크기 (픽셀)
export const CHARACTER_SIZE = 40;

// 맵 타일 크기 (픽셀)
export const TILE_SIZE = 48;

// 캔버스 크기
export const CANVAS_WIDTH = 1200;
export const CANVAS_HEIGHT = 700;

// 픽셀 폰트 크기
export const FONT_SIZE_XS = '8px';
export const FONT_SIZE_SM = '12px';
export const FONT_SIZE_MD = '16px';
export const FONT_SIZE_LG = '24px';
export const FONT_SIZE_XL = '32px';

// 애니메이션 속도 (ms)
export const ANIMATION_SPEED_FAST = 150;
export const ANIMATION_SPEED_NORMAL = 300;
export const ANIMATION_SPEED_SLOW = 600;

// 캐릭터 이동 속도
export const MOVE_SPEED = 4;

// 색상 팔레트 (Retro 8-bit)
export const COLOR_PALETTE = {
  // 기본
  white: '#FFFFFF',
  black: '#000000',
  gray: '#808080',
  darkGray: '#404040',

  // 픽셀 아트
  skyBlue: '#87CEEB',
  grassGreen: '#32CD32',
  treeGreen: '#228B22',
  dirtBrown: '#8B4513',
  waterBlue: '#4169E1',

  // UI
  success: '#4CAF50',
  warning: '#FFC107',
  error: '#F44336',
  info: '#2196F3',
};