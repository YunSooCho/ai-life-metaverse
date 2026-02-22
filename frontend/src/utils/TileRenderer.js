// 타일맵 레벨 렌더러 - 픽셀아트 스타일 맵 렌더링
// Phase 2: 맵 시스템 픽셀아트 리팩토링

class TileRenderer {
  constructor() {
    this.tileCache = new Map(); // 타일 이미지 캐시
    this.tileWidth = 32;
    this.tileHeight = 32;
  }

  /**
   * 타일 캐시 설정
   * @param {number} tileWidth - 타일 너비
   * @param {number} tileHeight - 타일 높이
   */
  setTileSize(tileWidth, tileHeight) {
    this.tileWidth = tileWidth;
    this.tileHeight = tileHeight;
  }

  /**
   * 땅 레이어 렌더링 (잔디/흙/길/물 등)
   * @param {CanvasRenderingContext2D} ctx - Canvas 컨텍스트
   * @param {Object} groundLayer - ground 레이어 데이터
   * @param {number} scale - 배율
   */
  renderGroundLayer(ctx, groundLayer, scale) {
    if (!groundLayer || !groundLayer.tiles) return;

    // 픽셀 아트 스무딩 비활성화
    ctx.imageSmoothingEnabled = false;

    groundLayer.tiles.forEach((tile) => {
      // 기본 배경 (잔디 등)
      if (tile.color) {
        this.renderTileBase(ctx, tile.color, tile, scale);
      }

      // 경로 렌더링 (흙길 등)
      if (tile.path) {
        tile.path.forEach((path) => {
          this.renderPathTile(ctx, tile.color, path, scale);
        });
      }

      // 돌바닥 렌더링
      if (tile.rects) {
        tile.rects.forEach((rect) => {
          this.renderStoneTile(ctx, rect, scale);
        });
      }
    });
  }

  /**
   * 기본 타일 렌더링 (잔디 등)
   */
  renderTileBase(ctx, color, tile, scale) {
    ctx.fillStyle = color;
    ctx.fillRect(
      tile.x * scale,
      tile.y * scale,
      tile.width * scale,
      tile.height * scale
    );

    // 픽셀 아트 텍스처 효과 (디테일 추가)
    this.addTileDetail(ctx, color, tile, scale);
  }

  /**
   * 타일 디테일 추가 (픽셀 노이즈)
   */
  addTileDetail(ctx, baseColor, tile, scale) {
    const density = 0.02; // 노이즈 밀도
    const tileArea = (tile.width * scale) * (tile.height * scale);
    const numPixels = Math.floor(tileArea * density);

    ctx.fillStyle = this.darkenColor(baseColor, 10);

    for (let i = 0; i < numPixels; i++) {
      const px = (tile.x * scale) + Math.random() * (tile.width * scale);
      const py = (tile.y * scale) + Math.random() * (tile.height * scale);
      ctx.fillRect(px, py, 2, 2);
    }
  }

  /**
   * 경로 타일 렌더링 (흙길 등)
   */
  renderPathTile(ctx, color, path, scale) {
    ctx.fillStyle = color;
    ctx.fillRect(
      path.x * scale,
      path.y * scale,
      path.width * scale,
      path.height * scale
    );

    // 경로 텍스처
    this.addPathTexture(ctx, path, scale);
  }

  /**
   * 경로 텍스처 추가
   */
  addPathTexture(ctx, path, scale) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    const tileArea = (path.width * scale) * (path.height * scale);
    const numPebbles = Math.floor(tileArea * 0.01);

    for (let i = 0; i < numPebbles; i++) {
      const px = (path.x * scale) + Math.random() * (path.width * scale);
      const py = (path.y * scale) + Math.random() * (path.height * scale);
      ctx.fillRect(px, py, 3, 3);
    }
  }

  /**
   * 돌바닥 타일 렌더링
   */
  renderStoneTile(ctx, rect, scale) {
    ctx.fillStyle = '#757575';
    ctx.fillRect(
      rect.x * scale,
      rect.y * scale,
      rect.width * scale,
      rect.height * scale
    );

    // 돌바닥 타일 패턴
    this.addStonePattern(ctx, rect, scale);
  }

  /**
   * 돌바닥 패턴 추가
   */
  addStonePattern(ctx, rect, scale) {
    const tileSize = 64 * scale;
    const startX = rect.x * scale;
    const startY = rect.y * scale;
    const endX = (rect.x + rect.width) * scale;
    const endY = (rect.y + rect.height) * scale;

    ctx.strokeStyle = '#616161';
    ctx.lineWidth = 2;

    // 수평 라인
    for (let y = startY; y < endY; y += tileSize) {
      ctx.beginPath();
      ctx.moveTo(startX, y);
      ctx.lineTo(endX, y);
      ctx.stroke();
    }

    // 수직 라인
    for (let x = startX; x < endX; x += tileSize) {
      ctx.beginPath();
      ctx.moveTo(x, startY);
      ctx.lineTo(x, endY);
      ctx.stroke();
    }
  }

  /**
   * 장식 레이어 렌더링 (나무/벤치 등)
   */
  renderDecorationLayer(ctx, decorationLayer, scale) {
    if (!decorationLayer || !decorationLayer.objects) return;

    ctx.imageSmoothingEnabled = false;

    decorationLayer.objects.forEach((obj) => {
      const x = obj.x * scale;
      const y = obj.y * scale;
      const width = obj.width * scale;
      const height = obj.height * scale;

      // 스프라이트 기반 렌더링
      this.renderDecorationSprite(ctx, obj, x, y, width, height, scale);
    });
  }

  /**
   * 장식 스프라이트 렌더링
   */
  renderDecorationSprite(ctx, obj, x, y, width, height, scale) {
    // 스프라이트 이름에 따라 다른 스타일
    switch (obj.sprite) {
      case 'tree':
        this.renderTreeSprite(ctx, x, y, width, height);
        break;
      case 'bench':
        this.renderBenchSprite(ctx, x, y, width, height);
        break;
      case 'flower':
        this.renderFlowerSprite(ctx, x, y, width, height);
        break;
      case 'rock':
        this.renderRockSprite(ctx, x, y, width, height);
        break;
      default:
        this.renderDefaultDecoration(ctx, x, y, width, height, obj.sprite);
    }
  }

  /**
   * 나무 스프라이트 렌더링
   */
  renderTreeSprite(ctx, x, y, width, height) {
    // 줄기
    ctx.fillStyle = '#5D4037';
    ctx.fillRect(x + width * 0.4, y + height * 0.6, width * 0.2, height * 0.4);

    // 잎 (픽셀 아트 스타일)
    ctx.fillStyle = '#2E7D32';
    ctx.fillRect(x, y, width, height * 0.7);

    // 잎 하이라이트
    ctx.fillStyle = '#43A047';
    ctx.fillRect(x + width * 0.2, y + height * 0.1, width * 0.6, height * 0.2);

    // 잎 그림자
    ctx.fillStyle = '#1B5E20';
    ctx.fillRect(x, y + height * 0.5, width, height * 0.15);

    // 테두리
    ctx.strokeStyle = '#1B5E20';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, width, height * 0.7);
  }

  /**
   * 벤치 스프라이트 렌더링
   */
  renderBenchSprite(ctx, x, y, width, height) {
    // 다리
    ctx.fillStyle = '#6D4C41';
    ctx.fillRect(x + width * 0.1, y + height * 0.6, width * 0.15, height * 0.4);
    ctx.fillRect(x + width * 0.75, y + height * 0.6, width * 0.15, height * 0.4);

    // 좌석
    ctx.fillStyle = '#8D6E63';
    ctx.fillRect(x, y + height * 0.4, width, height * 0.2);

    // 등받이
    ctx.fillStyle = '#6D4C41';
    ctx.fillRect(x, y, width * 0.1, height * 0.4);
    ctx.fillRect(x + width * 0.9, y, width * 0.1, height * 0.4);

    // 테두리
    ctx.strokeStyle = '#4E342E';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y + height * 0.4, width, height * 0.2);
  }

  /**
   * 꽃 스프라이트 렌더링
   */
  renderFlowerSprite(ctx, x, y, width, height) {
    // 줄기
    ctx.fillStyle = '#2E7D32';
    ctx.fillRect(x + width * 0.45, y + height * 0.5, width * 0.1, height * 0.5);

    // 꽃잎
    ctx.fillStyle = '#E91E63';
    const flowerSize = width * 0.4;
    ctx.fillRect(x + width * 0.3, y, flowerSize, flowerSize);
    ctx.fillRect(x + width * 0.1, y + height * 0.2, flowerSize, flowerSize);
    ctx.fillRect(x + width * 0.5, y + height * 0.2, flowerSize, flowerSize);

    // 꽃 중앙
    ctx.fillStyle = '#FFEB3B';
    ctx.fillRect(x + width * 0.3, y + height * 0.2, width * 0.4, height * 0.3);
  }

  /**
   * 바위 스프라이트 렌더링
   */
  renderRockSprite(ctx, x, y, width, height) {
    ctx.fillStyle = '#9E9E9E';
    ctx.fillRect(x, y + height * 0.3, width, height * 0.7);

    // 바위 하이라이트
    ctx.fillStyle = '#BDBDBD';
    ctx.fillRect(x, y + height * 0.3, width, height * 0.2);

    // 바위 그림자
    ctx.fillStyle = '#757575';
    ctx.fillRect(x, y + height * 0.7, width, height * 0.3);

    // 테두리
    ctx.strokeStyle = '#616161';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y + height * 0.3, width, height * 0.7);
  }

  /**
   * 기본 장식 렌더링
   */
  renderDefaultDecoration(ctx, x, y, width, height, spriteType) {
    ctx.fillStyle = '#888888';
    ctx.fillRect(x, y, width, height);
    ctx.strokeStyle = '#666666';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, width, height);
  }

  /**
   * 건물 입장 영역 하이라이트 렌더링
   */
  renderEntranceHighlight(ctx, entrance, scale) {
    const x = entrance.x * scale;
    const y = entrance.y * scale;
    const width = entrance.width * scale;
    const height = entrance.height * scale;

    // 하이라이트 효과 (픽셀 아트 스타일)
    ctx.fillStyle = 'rgba(76, 175, 80, 0.3)';
    ctx.fillRect(x, y, width, height);

    // 점선 테두리
    ctx.strokeStyle = 'rgba(76, 175, 80, 0.8)';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.strokeRect(x, y, width, height);
    ctx.setLineDash([]); // 점선 리셋
  }

  /**
   * 타일 좌표를 월드 좌표로 변환
   */
  tileToWorld(tileX, tileY, scale) {
    return {
      x: tileX * this.tileWidth * scale,
      y: tileY * this.tileHeight * scale
    };
  }

  /**
   * 월드 좌표를 타일 좌표로 변환
   */
  worldToTile(worldX, worldY, scale) {
    return {
      tileX: Math.floor(worldX / (this.tileWidth * scale)),
      tileY: Math.floor(worldY / (this.tileHeight * scale))
    };
  }

  /**
   * 색상 어둡게 처리
   * @param {string} color - HEX 색상
   * @param {number} amount - 어두운 정도 (0-100)
   * @returns {string} 어두워진 HEX 색상
   */
  darkenColor(color, amount) {
    const hex = color.replace('#', '');
    const r = Math.max(0, parseInt(hex.substr(0, 2), 16) - amount);
    const g = Math.max(0, parseInt(hex.substr(2, 2), 16) - amount);
    const b = Math.max(0, parseInt(hex.substr(4, 2), 16) - amount);

    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }

  /**
   * 타일 캐시 초기화
   */
  clearCache() {
    this.tileCache.clear();
  }
}

// 싱글톤 인스턴스
const tileRenderer = new TileRenderer();

export default tileRenderer;
export { TileRenderer };