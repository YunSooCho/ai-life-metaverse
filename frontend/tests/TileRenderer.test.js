import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TileRenderer } from '../src/utils/TileRenderer';

describe('TileRenderer', () => {
  let tileRenderer;
  let mockCtx;

  beforeEach(() => {
    tileRenderer = new TileRenderer();
    mockCtx = {
      imageSmoothingEnabled: true,
      fillStyle: '',
      fillRect: vi.fn(),
      strokeRect: vi.fn(),
      strokeStyle: '',
      lineWidth: 0,
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      stroke: vi.fn(),
      setLineDash: vi.fn(),
    };
  });

  describe('기본 설정', () => {
    it('TileRenderer 인스턴스 생성', () => {
      expect(tileRenderer).toBeDefined();
    });

    it('타일 크기 설정', () => {
      tileRenderer.setTileSize(32, 32);
      expect(tileRenderer.tileWidth).toBe(32);
      expect(tileRenderer.tileHeight).toBe(32);
    });
  });

  describe('Ground 레이어 렌더링', () => {
    it('잔디 타일 렌더링', () => {
      const groundLayer = {
        tiles: [
          {
            id: 1,
            name: '잔디',
            color: '#4CAF50',
            walkable: true,
            x: 0,
            y: 0,
            width: 1000,
            height: 700
          }
        ]
      };

      tileRenderer.renderGroundLayer(mockCtx, groundLayer, 1);

      // fillRect가 최소 1번 호출되어야 함
      expect(mockCtx.fillRect).toHaveBeenCalled();
      expect(mockCtx.imageSmoothingEnabled).toBe(false);
    });

    it('경로(path) 렌더링', () => {
      const groundLayer = {
        tiles: [
          {
            id: 2,
            name: '흙길',
            color: '#8D6E63',
            walkable: true,
            path: [
              { x: 150, y: 200, width: 120, height: 20 },
              { x: 200, y: 200, width: 20, height: 300 }
            ]
          }
        ]
      };

      tileRenderer.renderGroundLayer(mockCtx, groundLayer, 1);

      // 경로 렌더링 확인 (base + texture)
      expect(mockCtx.fillRect).toHaveBeenCalled();
    });

    it('돌바닥(rects) 렌더링', () => {
      const groundLayer = {
        tiles: [
          {
            id: 3,
            name: '돌바닥',
            color: '#757575',
            walkable: true,
            rects: [
              { x: 130, y: 130, width: 160, height: 140 }
            ]
          }
        ]
      };

      tileRenderer.renderGroundLayer(mockCtx, groundLayer, 1);

      expect(mockCtx.fillRect).toHaveBeenCalledWith(130, 130, 160, 140);
    });

    it('null 레이어 처리', () => {
      tileRenderer.renderGroundLayer(mockCtx, null, 1);
      expect(mockCtx.fillRect).not.toHaveBeenCalled();
    });

    it('빈 tiles 배열 처리', () => {
      const groundLayer = { tiles: [] };
      tileRenderer.renderGroundLayer(mockCtx, groundLayer, 1);
      expect(mockCtx.fillRect).not.toHaveBeenCalled();
    });
  });

  describe('장식 레이어 렌더링', () => {
    it('나무 스프라이트 렌더링', () => {
      const decorationLayer = {
        objects: [
          {
            id: 'd1',
            name: '나무',
            sprite: 'tree',
            x: 300,
            y: 300,
            width: 32,
            height: 48,
            obstacle: true
          }
        ]
      };

      tileRenderer.renderDecorationLayer(mockCtx, decorationLayer, 1);

      expect(mockCtx.imageSmoothingEnabled).toBe(false);
      expect(mockCtx.fillRect).toHaveBeenCalled();
    });

    it('벤치 스프라이트 렌더링', () => {
      const decorationLayer = {
        objects: [
          {
            id: 'd3',
            name: '벤치',
            sprite: 'bench',
            x: 450,
            y: 550,
            width: 48,
            height: 24,
            obstacle: false,
            interactable: true,
            action: 'sit'
          }
        ]
      };

      tileRenderer.renderDecorationLayer(mockCtx, decorationLayer, 1);

      expect(mockCtx.fillRect).toHaveBeenCalled();
    });

    it('꽃 스프라이트 렌더링', () => {
      const decorationLayer = {
        objects: [
          {
            id: 'd4',
            name: '꽃',
            sprite: 'flower',
            x: 100,
            y: 100,
            width: 16,
            height: 16,
            obstacle: false
          }
        ]
      };

      tileRenderer.renderDecorationLayer(mockCtx, decorationLayer, 1);

      expect(mockCtx.fillRect).toHaveBeenCalled();
    });

    it('바위 스프라이트 렌더링', () => {
      const decorationLayer = {
        objects: [
          {
            id: 'd5',
            name: '바위',
            sprite: 'rock',
            x: 200,
            y: 200,
            width: 24,
            height: 20,
            obstacle: true
          }
        ]
      };

      tileRenderer.renderDecorationLayer(mockCtx, decorationLayer, 1);

      expect(mockCtx.fillRect).toHaveBeenCalled();
    });

    it('기본 장식 스프라이트 렌더링', () => {
      const decorationLayer = {
        objects: [
          {
            id: 'd6',
            name: '알 수 없는 장식',
            sprite: 'unknown',
            x: 100,
            y: 100,
            width: 32,
            height: 32
          }
        ]
      };

      tileRenderer.renderDecorationLayer(mockCtx, decorationLayer, 1);

      expect(mockCtx.fillStyle).toBe('#888888');
      expect(mockCtx.fillRect).toHaveBeenCalledWith(100, 100, 32, 32);
    });

    it('null 레이어 처리', () => {
      tileRenderer.renderDecorationLayer(mockCtx, null, 1);
      expect(mockCtx.fillRect).not.toHaveBeenCalled();
    });
  });

  describe('건물 입장 영역 하이라이트', () => {
    it('입장 영역 하이라이트 렌더링', () => {
      const entrance = {
        x: 190,
        y: 230,
        width: 40,
        height: 20
      };

      tileRenderer.renderEntranceHighlight(mockCtx, entrance, 1);

      expect(mockCtx.fillRect).toHaveBeenCalledWith(190, 230, 40, 20);
      expect(mockCtx.setLineDash).toHaveBeenCalledWith([4, 4]);
      expect(mockCtx.setLineDash).toHaveBeenCalledWith([]);
    });

    it('scale 적용 하이라이트', () => {
      const entrance = {
        x: 190,
        y: 230,
        width: 40,
        height: 20
      };

      tileRenderer.renderEntranceHighlight(mockCtx, entrance, 2);

      expect(mockCtx.fillRect).toHaveBeenCalledWith(380, 460, 80, 40);
    });
  });

  describe('좌표 변환', () => {
    it('타일 좌표를 월드 좌표로 변환', () => {
      tileRenderer.setTileSize(32, 32);
      const worldCoords = tileRenderer.tileToWorld(5, 3, 1);

      expect(worldCoords.x).toBe(160);
      expect(worldCoords.y).toBe(96);
    });

    it('scale 적용 타일→월드 변환', () => {
      tileRenderer.setTileSize(32, 32);
      const worldCoords = tileRenderer.tileToWorld(5, 3, 2);

      expect(worldCoords.x).toBe(320);
      expect(worldCoords.y).toBe(192);
    });

    it('월드 좌표를 타일 좌표로 변환', () => {
      tileRenderer.setTileSize(32, 32);
      const tileCoords = tileRenderer.worldToTile(160, 96, 1);

      expect(tileCoords.tileX).toBe(5);
      expect(tileCoords.tileY).toBe(3);
    });

    it('scale 적용 월드→타일 변환', () => {
      tileRenderer.setTileSize(32, 32);
      const tileCoords = tileRenderer.worldToTile(320, 192, 2);

      expect(tileCoords.tileX).toBe(5);
      expect(tileCoords.tileY).toBe(3);
    });

    it('소수 좌표 변환 (내림)', () => {
      tileRenderer.setTileSize(32, 32);
      const tileCoords = tileRenderer.worldToTile(175, 110, 1);

      expect(tileCoords.tileX).toBe(5);
      expect(tileCoords.tileY).toBe(3);
    });
  });

  describe('색상 처리', () => {
    it('색상 어둡게 처리', () => {
      const darkened = tileRenderer.darkenColor('#4CAF50', 10);

      // R: 76-10=66(ox42), G: 175-10=165(0xA5), B: 80-10=70(0x46)
      expect(darkened.toLowerCase()).toBe('#42a546');
    });

    it('색상 어둡게 처리 (최대값)', () => {
      const darkened = tileRenderer.darkenColor('#FFFFFF', 255);

      expect(darkened).toBe('#000000');
    });

    it('색상 어둡게 처리 (0)', () => {
      const darkened = tileRenderer.darkenColor('#4CAF50', 0);

      // 소문자로 확인 (실제 반환되는 값)
      expect(darkened.toLowerCase()).toBe('#4caf50');
    });
  });

  describe('캐시 관리', () => {
    it('캐시 초기화', () => {
      tileRenderer.tileCache.set('test', 'value');
      tileRenderer.clearCache();

      expect(tileRenderer.tileCache.size).toBe(0);
    });
  });
});