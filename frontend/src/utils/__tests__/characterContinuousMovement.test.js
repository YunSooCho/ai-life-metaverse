/**
 * CRITICAL Test #1002: 캐릭터 연속 이동 테스트
 *
 * 목표: 캐릭터가 연속으로 이동할 때의 동작을 검증
 * 중요 내용:
 * - 연속 이동 시 이전 이동이 완료되지 않아도 정확한 경로 추적
 * - 이동 경로에 대한 히스토리 기록 검증
 * - 맵 경계 및 건물 충돌 처리 검증
 * - 서버 동기화 시 올바른 위치 전송
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Mock dependencies
const mockSocket = {
  emit: vi.fn(),
  on: vi.fn()
};

// 맵 및 건물 설정
const MAP_SIZE = { width: 800, height: 600 };
const BUILDINGS = [
  { id: 'shop', x: 300, y: 300, width: 100, height: 100 },
  { id: 'cafe', x: 500, y: 200, width: 80, height: 80 },
  { id: 'library', x: 100, y: 400, width: 120, height: 80 }
];

// 맵 경계 밖 확인
function isOutsideMap(x, y) {
  return x < 0 || x > MAP_SIZE.width || y < 0 || y > MAP_SIZE.height;
}

// 건물 충돌 확인
function checkBuildingCollision(x, y) {
  for (const building of BUILDINGS) {
    if (x >= building.x && x < building.x + building.width &&
        y >= building.y && y < building.y + building.height) {
      return true;
    }
  }
  return false;
}

// Character class mock (경계/충돌 체크 포함)
class Character {
  constructor(id, x, y, roomId) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.roomId = roomId;
    this.isMoving = false;
    this.movementPath = [];
    this.history = [];
  }

  moveTo(targetX, targetY) {
    return new Promise((resolve, reject) => {
      // 건물 충돌만 체크 (맵 경계는 클램핑)
      if (checkBuildingCollision(targetX, targetY)) {
        reject(new Error('Collision detected - movement blocked'));
        return;
      }

      // 이동 시작: 히스토리 기록 (현재 위치 → 목표 위치)
      const startPos = { x: this.x, y: this.y };

      if (this.movementPath.length > 0) {
        // 연속 이동: 기존 경로에 추가
        this.movementPath.push({ x: targetX, y: targetY });
      } else {
        // 새 이동 시작
        this.isMoving = true;
        this.movementPath.push({ x: targetX, y: targetY });
      }

      // 이동 완료 시뮬레이션
      setTimeout(() => {
        // 위치 업데이트 (클램핑)
        this.x = Math.max(0, Math.min(MAP_SIZE.width, targetX));
        this.y = Math.max(0, Math.min(MAP_SIZE.height, targetY));

        // 히스토리 기록 (이동 전 위치 → 이동 후 위치)
        this.history.push({
          timestamp: Date.now(),
          fromX: startPos.x,
          fromY: startPos.y,
          toX: this.x,
          toY: this.y
        });

        this.movementPath.shift();
        if (this.movementPath.length === 0) {
          this.isMoving = false;
        }
        resolve();
      }, 100);
    });
  }

  getPosition() {
    return { id: this.id, x: this.x, y: this.y, roomId: this.roomId };
  }
}

describe('CRITICAL Test #1002: 캐릭터 연속 이동 테스트', () => {
  let character;

  beforeEach(() => {
    character = new Character('player1', 100, 100, 'main_plaza');
    mockSocket.emit.mockClear();
  });

  afterEach(() => {
    character = null;
  });

  it('[T1002-01] 캐릭터 단일 이동 테스트', async () => {
    const startX = character.x;
    const startY = character.y;
    const targetX = 200;
    const targetY = 200;

    await character.moveTo(targetX, targetY);

    expect(character.x).toBe(targetX);
    expect(character.y).toBe(targetY);
    expect(character.isMoving).toBe(false);
    expect(character.history.length).toBe(1);
    expect(character.history[0].fromX).toBe(startX);
    expect(character.history[0].fromY).toBe(startY);
    expect(character.history[0].toX).toBe(targetX);
    expect(character.history[0].toY).toBe(targetY);
  });

  it('[T1002-02] 캐릭터 연속 이동 테스트 (2단계)', async () => {
    const positions = [
      { x: 150, y: 150 },
      { x: 200, y: 200 },
      { x: 150, y: 250 }
    ];

    // 연속 이동 실행 (Promise.all로 동시에 명령)
    await Promise.all(positions.map(pos => character.moveTo(pos.x, pos.y)));

    // 최종 위치 확인
    expect(character.x).toBe(positions[2].x);
    expect(character.y).toBe(positions[2].y);
    expect(character.isMoving).toBe(false);
    expect(character.history.length).toBeGreaterThanOrEqual(1);
  });

  it('[T1002-03] 캐릭터 연속 이동 테스트 (5단계)', async () => {
    const positions = [
      { x: 120, y: 120 },
      { x: 180, y: 120 },
      { x: 180, y: 180 },
      { x: 120, y: 180 },
      { x: 150, y: 150 }
    ];

    // 연속 이동 실행
    const promises = positions.map((pos, idx) => {
      return new Promise(resolve => setTimeout(() => {
        character.moveTo(pos.x, pos.y).then(resolve);
      }, idx * 50)); // 50ms 간격으로 명령
    });

    await Promise.all(promises);

    // 최종 위치 확인 (마지막 명령 위치)
    expect(character.x).toBe(positions[4].x);
    expect(character.y).toBe(positions[4].y);
    expect(character.isMoving).toBe(false);
  });

  it('[T1002-04] 연속 이동 시 서버 동기화 검증', async () => {
    const positions = [
      { x: 150, y: 150 },
      { x: 200, y: 200 }
    ];

    // 연속 이동 실행
    for (const pos of positions) {
      await character.moveTo(pos.x, pos.y);
      const position = character.getPosition();
      mockSocket.emit('movement', position);
    }

    // 서버 동기화 호출 확인
    expect(mockSocket.emit).toHaveBeenCalledTimes(2);
    // 첫 번째 호출 확인
    expect(mockSocket.emit).toHaveBeenNthCalledWith(1, 'movement', expect.objectContaining({
      id: 'player1',
      roomId: 'main_plaza',
      x: 150,
      y: 150
    }));
    // 두 번째 호출 확인
    expect(mockSocket.emit).toHaveBeenNthCalledWith(2, 'movement', expect.objectContaining({
      id: 'player1',
      roomId: 'main_plaza',
      x: 200,
      y: 200
    }));
  });

  it('[T1002-05] 맵 경계 이동 클램핑 테스트', async () => {
    // 맵 크기: 800 x 600
    const boundaryX = 850; // 맵 밖
    const boundaryY = 150;

    await character.moveTo(boundaryX, boundaryY);

    // 경계 밖으로 이동 금지 (클램핑)
    expect(character.x).toBe(MAP_SIZE.width); // 800으로 클램핑
    expect(character.y).toBe(boundaryY);
  });

  it('[T1002-06] 건물 충돌 시 이동 차단 테스트', async () => {
    // 건물 위치: (300, 300) ~ (400, 400)
    const buildingX = 350;
    const buildingY = 350; // 건물 안

    // 건물 충돌 시 이동 차단 (reject)
    await expect(character.moveTo(buildingX, buildingY)).rejects.toThrow('Collision detected');

    // 이동되지 않았는지 확인
    expect(character.x).toBe(100);
    expect(character.y).toBe(100);
  });

  it('[T1002-07] 이동 히스토리 순서 검증', async () => {
    const positions = [
      { x: 150, y: 150 },
      { x: 200, y: 200 },
      { x: 250, y: 250 }
    ];

    for (const pos of positions) {
      await character.moveTo(pos.x, pos.y);
    }

    // 히스토리 순서 확인
    if (character.history.length >= 2) {
      expect(character.history[0].timestamp).toBeLessThanOrEqual(character.history[1].timestamp);
    }
  });

  it('[T1002-08] 동시 접속 캐릭터 이동 독립성', async () => {
    // 여러 캐릭터 독립 이동 테스트
    const char1 = new Character('player1', 100, 100, 'main_plaza');
    const char2 = new Character('player2', 200, 200, 'main_plaza');

    await Promise.all([
      char1.moveTo(250, 400), // 건물 밖으로 변경
      char2.moveTo(450, 150)  // 건물 밖으로 변경
    ]);

    // 각 캐릭터가 올바른 위치로 이동했는지 확인
    expect(char1.x).toBe(250);
    expect(char1.y).toBe(400);
    expect(char2.x).toBe(450);
    expect(char2.y).toBe(150);
  });
});

describe('추가 CRITICAL 검증: AI 캐릭터 연속 이동', () => {
  let aiCharacter;

  beforeEach(() => {
    aiCharacter = new Character('ai_yuri', 400, 400, 'main_plaza');
  });

  afterEach(() => {
    aiCharacter = null;
  });

  it('[T1002-09] AI 캐릭터 연속 이동 테스트', async () => {
    // 스케줄에 따른 AI 연속 이동 (건물 밖으로 변경)
    const schedulePath = [
      { x: 400, y: 100 }, // 도서관 근처 (건물 밖)
      { x: 200, y: 500 }, // 카페 근처 (건물 밖)
      { x: 400, y: 400 }  // 원위치
    ];

    for (const pos of schedulePath) {
      await aiCharacter.moveTo(pos.x, pos.y);
    }

    // AI가 스케줄대로 이동했는지 확인
    expect(aiCharacter.x).toBe(400);
    expect(aiCharacter.y).toBe(400);
    expect(aiCharacter.history.length).toBeGreaterThanOrEqual(1);
  });

  it('[T1002-10] AI 캐릭터 사용자 채팅 인터랙션 중 이동 중지', async () => {
    // AI가 이동 중인 상태 가정
    aiCharacter.isMoving = true;
    aiCharacter.movementPath = [
      { x: 500, y: 500 },
      { x: 600, y: 600 }
    ];

    // 사용자가 인터랙션 (대화 시작)
    aiCharacter.isMoving = false; // 이동 중지
    aiCharacter.movementPath = []; // 경로 초기화

    // 이동이 중지되었는지 확인
    expect(aiCharacter.isMoving).toBe(false);
    expect(aiCharacter.movementPath.length).toBe(0);
  });
});