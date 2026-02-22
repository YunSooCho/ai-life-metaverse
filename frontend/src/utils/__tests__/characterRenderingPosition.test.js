/**
 * CRITICAL Test #1003: 캐릭터 렌더링 위치 테스트 (실제 데이터 vs 화면 표시)
 *
 * 테스트 목표:
 * 캐릭터의 실제 데이터(character.x, character.y)와 화면에 렌더링된 위치가 일치하는지 확인
 *
 * 버그 시나리오:
 * - 캐릭터 데이터에서 x=100, y=200인데 화면에서는 다른 위치에 표시됨
 * - 캔버스 좌표계와 데이터 좌표계 불일치
 * - 셀 크기(cellSize) 적용 누락
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock socket.io
const mockSocket = {
  emit: vi.fn(),
  on: vi.fn(),
  id: 'test-socket-id'
};

// Mock GameCanvas 컴포넌트의 character rendering 로직
class CharacterRenderer {
  constructor(cellSize = 40) {
    this.cellSize = cellSize;
  }

  /**
   * 캐릭터 데이터를 캔버스 좌표로 변환
   * @param {Object} character - 캐릭터 데이터 {x, y, ...}
   * @returns {Object} 캔버스 좌표 {canvasX, canvasY}
   */
  characterToCanvas(character) {
    return {
      canvasX: character.x * this.cellSize,
      canvasY: character.y * this.cellSize
    };
  }

  /**
   * 캔버스 좌표를 캐릭터 데이터로 변환 (역변환)
   * @param {number} canvasX - 캔버스 X 좌표
   * @param {number} canvasY - 캔버스 Y 좌표
   * @returns {Object} 캐릭터 좌표 {x, y}
   */
  canvasToCharacter(canvasX, canvasY) {
    return {
      x: Math.round(canvasX / this.cellSize),
      y: Math.round(canvasY / this.cellSize)
    };
  }

  /**
   * 캐릭터 렌더링 위치 계산
   * @param {Object} character - 캐릭터 데이터
   * @param {Object} cameraOffset - 카메라 오프셋 {x, y}
   * @returns {Object} 화면 좌표 {screenX, screenY}
   */
  calculateScreenPosition(character, cameraOffset) {
    const canvasPos = this.characterToCanvas(character);
    return {
      screenX: canvasPos.canvasX - cameraOffset.x,
      screenY: canvasPos.canvasY - cameraOffset.y
    };
  }

  /**
   * 캐릭터 데이터와 화면 렌더링 위치의 일치성 검증
   * @param {Object} character - 캐릭터 데이터
   * @param {Object} renderedPosition - 화면에서 보이는 위치 {screenX, screenY}
   * @param {Object} cameraOffset - 카메라 오프셋 {x, y}
   * @returns {boolean} 일치 여부
   */
  validatePositionConsistency(character, renderedPosition, cameraOffset) {
    const expected = this.calculateScreenPosition(character, cameraOffset);
    const tolerance = 1; // 1px 허용 오차

    return (
      Math.abs(renderedPosition.screenX - expected.screenX) <= tolerance &&
      Math.abs(renderedPosition.screenY - expected.screenY) <= tolerance
    );
  }
}

describe('CRITICAL Test #1003: 캐릭터 렌더링 위치 테스트', () => {
  let renderer;

  beforeEach(() => {
    renderer = new CharacterRenderer(40); // cellSize = 40
  });

  /**
   * T1003-01: 기본 캐릭터 좌표 변환 테스트
   */
  it('T1003-01: 캐릭터 데이터(x=0, y=0)를 캔버스 좌표(0, 0)로 정확히 변환해야 함', () => {
    const character = { id: 'char1', x: 0, y: 0 };
    const canvasPos = renderer.characterToCanvas(character);

    expect(canvasPos.canvasX).toBe(0);
    expect(canvasPos.canvasY).toBe(0);
  });

  /**
   * T1003-02: 캐릭터 좌표 변환 테스트 (cellSize 적용)
   */
  it('T1003-02: 캐릭터 데이터(x=5, y=3)를 캔버스 좌표(200, 120)로 정확히 변환해야 함 (cellSize=40)', () => {
    const character = { id: 'char2', x: 5, y: 3 };
    const canvasPos = renderer.characterToCanvas(character);

    expect(canvasPos.canvasX).toBe(5 * 40); // 200
    expect(canvasPos.canvasY).toBe(3 * 40); // 120
  });

  /**
   * T1003-03: 역변환 테스트 (캔버스 → 캐릭터)
   */
  it('T1003-03: 캔버스 좌표(200, 120)를 캐릭터 데이터(x=5, y=3)로 정확히 역변환해야 함', () => {
    const characterPos = renderer.canvasToCharacter(200, 120);

    expect(characterPos.x).toBe(5);
    expect(characterPos.y).toBe(3);
  });

  /**
   * T1003-04: 화면 위치 계산 테스트 (카메라 오프셋 적용)
   */
  it('T1003-04: 캐릭터(x=10, y=5) + 카메라(-100, -200) = 화면(300, 0)로 계산해야 함', () => {
    const character = { id: 'char3', x: 10, y: 5 };
    const cameraOffset = { x: 100, y: 200 };
    const screenPos = renderer.calculateScreenPosition(character, cameraOffset);

    const expectedCanvasX = 10 * 40; // 400
    const expectedCanvasY = 5 * 40;  // 200
    const expectedScreenX = expectedCanvasX - 100; // 300
    const expectedScreenY = expectedCanvasY - 200; // 0

    expect(screenPos.screenX).toBe(expectedScreenX);
    expect(screenPos.screenY).toBe(expectedScreenY);
  });

  /**
   * T1003-05: 렌더링 위치 일치성 검증 테스트 (일치하는 경우)
   */
  it('T1003-05: 캐릭터 데이터와 화면 렌더링 위치가 일치하면 true를 반환해야 함', () => {
    const character = { id: 'char4', x: 7, y: 4 };
    const cameraOffset = { x: 0, y: 0 };
    const expectedScreenPos = renderer.calculateScreenPosition(character, cameraOffset);

    // 의도적으로 일치하는 위치
    const renderedPosition = {
      screenX: expectedScreenPos.screenX,
      screenY: expectedScreenPos.screenY
    };

    const isValid = renderer.validatePositionConsistency(character, renderedPosition, cameraOffset);

    expect(isValid).toBe(true);
  });

  /**
   * T1003-06: 렌더링 위치 불일치 검증 테스트 (오차 허용)
   */
  it('T1003-06: 1px 이내의 작은 오차는 허용해야 함', () => {
    const character = { id: 'char5', x: 8, y: 3 };
    const cameraOffset = { x: 0, y: 0 };
    const expectedScreenPos = renderer.calculateScreenPosition(character, cameraOffset);

    // 1px 오차
    const renderedPosition = {
      screenX: expectedScreenPos.screenX + 1,
      screenY: expectedScreenPos.screenY + 1
    };

    const isValid = renderer.validatePositionConsistency(character, renderedPosition, cameraOffset);

    expect(isValid).toBe(true); // 1px 허용 오차
  });

  /**
   * T1003-07: 렌더링 위치 불일치 검증 테스트 (오차 초과)
   */
  it('T1003-07: 2px 이상의 큰 오차는 불일치로 간주해야 함 (false 반환)', () => {
    const character = { id: 'char6', x: 6, y: 2 };
    const cameraOffset = { x: 0, y: 0 };
    const expectedScreenPos = renderer.calculateScreenPosition(character, cameraOffset);

    // 2px 오차
    const renderedPosition = {
      screenX: expectedScreenPos.screenX + 2,
      screenY: expectedScreenPos.screenY + 2
    };

    const isValid = renderer.validatePositionConsistency(character, renderedPosition, cameraOffset);

    expect(isValid).toBe(false); // 2px 초과 오차는 불일치
  });

  /**
   * T1003-08: 다양한 cellSize에 대한 변환 테스트
   */
  it('T1003-08: cellSize=32일 때 캐릭터(x=3, y=2)를 캔버스(96, 64)로 정확히 변환해야 함', () => {
    const renderer32 = new CharacterRenderer(32);
    const character = { id: 'char7', x: 3, y: 2 };
    const canvasPos = renderer32.characterToCanvas(character);

    expect(canvasPos.canvasX).toBe(3 * 32); // 96
    expect(canvasPos.canvasY).toBe(2 * 32); // 64
  });

  /**
   * T1003-09: 음수 좌표 처리 테스트 (카메라 오프셋이 큰 경우)
   */
  it('T1003-09: 캐릭터(x=0, y=0) + 카메라(-300, -400) = 화면(-300, -400)로 계산해야 함 (화면 밖)', () => {
    const character = { id: 'char8', x: 0, y: 0 };
    const cameraOffset = { x: 300, y: 400 };
    const screenPos = renderer.calculateScreenPosition(character, cameraOffset);

    expect(screenPos.screenX).toBe(-300); // 화면 밖 (왼쪽)
    expect(screenPos.screenY).toBe(-400); // 화면 밖 (위쪽)
  });

  /**
   * T1003-10: 여러 캐릭터 독립성 검증 테스트
   */
  it('T1003-10: 여러 캐릭터의 렌더링 위치가 각각 독립적으로 계산되어야 함', () => {
    const characters = [
      { id: 'char9', x: 2, y: 3 },
      { id: 'char10', x: 7, y: 5 },
      { id: 'char11', x: 12, y: 8 }
    ];
    const cameraOffset = { x: 50, y: 100 };

    // 각 캐릭터의 위치 계산
    const positions = characters.map(char => ({
      id: char.id,
      dataPos: renderer.characterToCanvas(char),
      screenPos: renderer.calculateScreenPosition(char, cameraOffset)
    }));

    // 캐릭터 9
    expect(positions[0].dataPos.canvasX).toBe(2 * 40); // 80
    expect(positions[0].dataPos.canvasY).toBe(3 * 40); // 120
    expect(positions[0].screenPos.screenX).toBe(80 - 50); // 30
    expect(positions[0].screenPos.screenY).toBe(120 - 100); // 20

    // 캐릭터 10
    expect(positions[1].dataPos.canvasX).toBe(7 * 40); // 280
    expect(positions[1].dataPos.canvasY).toBe(5 * 40); // 200
    expect(positions[1].screenPos.screenX).toBe(280 - 50); // 230
    expect(positions[1].screenPos.screenY).toBe(200 - 100); // 100

    // 캐릭터 11
    expect(positions[2].dataPos.canvasX).toBe(12 * 40); // 480
    expect(positions[2].dataPos.canvasY).toBe(8 * 40);  // 320
    expect(positions[2].screenPos.screenX).toBe(480 - 50); // 430
    expect(positions[2].screenPos.screenY).toBe(320 - 100); // 220
  });
});