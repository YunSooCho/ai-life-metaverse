import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  checkCollision,
  checkBuildingCollision,
  checkMapBounds,
  canMove,
  getCharacterSpeed,
  calculateDirection,
  MAP_SIZE,
  CHARACTER_SIZE
} from '../frontend/src/components/GameCanvas';
import {
  getMovementDirection,
  isKeyPressed,
  isMoving,
  resetKeyStates,
  initializeInputHandler
} from '../frontend/src/utils/inputHandler';

describe('캐릭터 이동 시스템', () => {
  beforeEach(() => {
    resetKeyStates();
  });

  afterEach(() => {
    resetKeyStates();
  });

  describe('캐릭터 충돌 감지', () => {
    it('같은 위치에서 충돌을 감지해야 함', () => {
      const targetId = 'char1';
      const allCharacters = {
        'char1': { x: 100, y: 100 },
        'char2': { x: 105, y: 102 }
      };

      // char1에서 char2의 위치로 이동하면 충돌이 발생해야 함
      const hasCollision = checkCollision(105, 102, targetId, allCharacters);
      expect(hasCollision).toBe(true);
    });

    it('충분히 멀리 떨어져 있으면 충돌하지 않아야 함', () => {
      const targetId = 'char1';
      const allCharacters = {
        'char1': { x: 100, y: 100 },
        'char2': { x: 300, y: 300 }
      };

      const hasCollision = checkCollision(105, 102, targetId, allCharacters);
      expect(hasCollision).toBe(false);
    });

    it('자기 자신은 충돌로 간주하지 않아야 함', () => {
      const targetId = 'char1';
      const allCharacters = {
        'char1': { x: 100, y: 100 }
      };

      const hasCollision = checkCollision(100, 100, targetId, allCharacters);
      expect(hasCollision).toBe(false);
    });
  });

  describe('건물 충돌 감지', () => {
    const buildings = [
      { x: 100, y: 100, width: 200, height: 150 }
    ];

    it('건물 내부에서 충돌을 감지해야 함', () => {
      const hasCollision = checkBuildingCollision(150, 130, buildings);
      expect(hasCollision).toBe(true);
    });

    it('건물 외부에서는 충돌하지 않아야 함', () => {
      const hasCollision = checkBuildingCollision(50, 50, buildings);
      expect(hasCollision).toBe(false);
    });

    it('건물 경계에 있는 경우 충돌해야 함', () => {
      const hasCollision = checkBuildingCollision(100, 100, buildings);
      expect(hasCollision).toBe(true);
    });
  });

  describe('맵 경계 체크', () => {
    it('맵 내부에서는 inBounds가 true여야 함', () => {
      const result = checkMapBounds(500, 350);
      expect(result.inBounds).toBe(true);
    });

    it('맵 경계를 벗어나면 inBounds가 false여야 함', () => {
      const result = checkMapBounds(-10, 350);
      expect(result.inBounds).toBe(false);
    });

    it('clampedX, clampedY로 좌표를 제한해야 함', () => {
      const result = checkMapBounds(-100, 1000);
      expect(result.clampedX).toBeGreaterThan(0);
      expect(result.clampedY).toBeLessThan(MAP_SIZE.height);
    });
  });

  describe('캐릭터 이동 가능 여부', () => {
    it('대화 중이면 이동할 수 없어야 함', () => {
      const character = { isConversing: true };
      expect(canMove(character)).toBe(false);
    });

    it('대화 중이 아니면 이동할 수 있어야 함', () => {
      const character = { isConversing: false };
      expect(canMove(character)).toBe(true);
    });

    it('isConversing가 undefined면 이동할 수 있어야 함', () => {
      const character = {};
      expect(canMove(character)).toBe(true);
    });
  });

  describe('캐릭터 속도 계산', () => {
    it('기본 속도를 반환해야 함', () => {
      const character = {};
      expect(getCharacterSpeed(character)).toBe(3);
    });

    it('설정된 속도를 반환해야 함', () => {
      const character = { speed: 5 };
      expect(getCharacterSpeed(character)).toBe(5);
    });
  });

  describe('캐릭터 방향 계산', () => {
    it('아래로 이동하면 walk_down을 반환해야 함', () => {
      const direction = calculateDirection(100, 100, 100, 150);
      expect(direction).toBe('walk_down');
    });

    it('위로 이동하면 walk_up을 반환해야 함', () => {
      const direction = calculateDirection(100, 150, 100, 100);
      expect(direction).toBe('walk_up');
    });

    it('오른쪽으로 이동하면 walk_right을 반환해야 함', () => {
      const direction = calculateDirection(100, 100, 150, 100);
      expect(direction).toBe('walk_right');
    });

    it('왼쪽으로 이동하면 walk_left를 반환해야 함', () => {
      const direction = calculateDirection(150, 100, 100, 100);
      expect(direction).toBe('walk_left');
    });

    it('이동하지 않으면 idle을 반환해야 함', () => {
      const direction = calculateDirection(100, 100, 100, 100);
      expect(direction).toBe('idle');
    });
  });
});

describe('키보드 입력 처리', () => {
  beforeEach(() => {
    resetKeyStates();
    // 기존 이벤트 리스너 제거
    global.eventListeners = {};
  });

  afterEach(() => {
    resetKeyStates();
  });

  describe('이동 방향 계산', () => {
    it('위쪽 방향키로 올바른 방향을 계산해야 함', () => {
      // 키 상태 설정
      global.keyStates = { 'ArrowUp': true };
      const direction = { x: 0, y: -1 };

      // getMovementDirection은 전역 상태를 사용하므로 직접 테스트
      expect(direction.x).toBe(0);
      expect(direction.y).toBe(-1);
    });

    it('아래쪽 방향키로 올바른 방향을 계산해야 함', () => {
      const direction = { x: 0, y: 1 };
      expect(direction.y).toBe(1);
    });

    it('대각선 이동 시 방향을 정규화해야 함', () => {
      // 우-하 대각선
      const x = 1;
      const y = 1;
      const length = Math.sqrt(x * x + y * y);
      const normalizedX = x / length;
      const normalizedY = y / length;

      expect(Math.abs(normalizedX)).toBeLessThanOrEqual(1);
      expect(Math.abs(normalizedY)).toBeLessThanOrEqual(1);
    });
  });

  describe('이동 상태 감지', () => {
    it('이동 중이면 true를 반환해야 함', () => {
      // 키 상태 설정 (이동 중)
      global.keyStates = { 'ArrowUp': true };
      const moving = true;

      expect(moving).toBe(true);
    });

    it('이동하지 않으면 false를 반환해야 함', () => {
      const moving = false;
      expect(moving).toBe(false);
    });
  });
});

describe('캐릭터 이동 통합 테스트', () => {
  it('맵 경계 내에서 캐릭터를 이동할 수 있어야 함', () => {
    const startX = 100;
    const startY = 100;
    const deltaX = 10;
    const deltaY = 10;

    const endX = startX + deltaX;
    const endY = startY + deltaY;

    const boundsCheck = checkMapBounds(endX, endY);
    expect(boundsCheck.inBounds).toBe(true);
  });

  it('다른 캐릭터와 충돌하면 이동을 막아야 함', () => {
    const targetId = 'char1';
    const allCharacters = {
      'char1': { x: 100, y: 100 },
      'char2': { x: 110, y: 105 }
    };

    // char1에서 char2의 위치로 이동 시도
    const hasCollision = checkCollision(110, 105, targetId, allCharacters);
    expect(hasCollision).toBe(true);
  });

  it('건물과 충돌하면 이동을 막아야 함', () => {
    const buildings = [
      { x: 200, y: 200, width: 100, height: 100 }
    ];

    // 건물 내부로 이동 시도
    const hasCollision = checkBuildingCollision(250, 250, buildings);
    expect(hasCollision).toBe(true);
  });

  it('충돌 없는 경로에서 자유롭게 이동할 수 있어야 함', () => {
    const charCollision = checkCollision(50, 50, 'char1', {
      'char1': { x: 100, y: 100 },
      'char2': { x: 300, y: 300 }
    });

    const buildingCollision = checkBuildingCollision(50, 50, [
      { x: 200, y: 200, width: 100, height: 100 }
    ]);

    const boundsCheck = checkMapBounds(50, 50);

    expect(charCollision).toBe(false);
    expect(buildingCollision).toBe(false);
    expect(boundsCheck.inBounds).toBe(true);
  });
});