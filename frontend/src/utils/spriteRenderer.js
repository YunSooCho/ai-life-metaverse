// 스프라이트 렌더러 유틸리티
// 픽셀 아트 스프라이트를 Canvas에 렌더링하는 클래스

class SpriteRenderer {
  constructor() {
    this.animations = new Map(); // 애니메이션 상태 추적
    this.currentFrame = new Map(); // 현재 프레임 추적
    this.frameTimer = new Map(); // 프레임 타이머
  }

  /**
   * 스프라이트 시트에서 특정 프레임 렌더링
   * @param {CanvasRenderingContext2D} ctx - Canvas 컨텍스트
   * @param {HTMLImageElement} spriteSheet - 스프라이트 시트 이미지
   * @param {number} destX - 목표 X 좌표
   * @param {number} destY - 목표 Y 좌표
   * @param {number} destSize - 목표 크기
   * @param {Object} frame - 프레임 정보 { x, y, width, height }
   * @param {boolean} flipX - 수평 뒤집기
   */
  renderFrame(ctx, spriteSheet, destX, destY, destSize, frame, flipX = false) {
    ctx.save();
    
    // 이미지 스무딩 비활성화 (픽셀 아트 스타일)
    ctx.imageSmoothingEnabled = false;
    
    // 수평 뒤집기 처리
    if (flipX) {
      ctx.translate(destX * 2 + destSize, 0);
      ctx.scale(-1, 1);
    }
    
    // 스프라이트 프레임 렌더링
    ctx.drawImage(
      spriteSheet,
      frame.x, frame.y, frame.width, frame.height, // 소스 사각형
      destX - destSize / 2, destY - destSize / 2, destSize, destSize // 목표 사각형
    );
    
    ctx.restore();
  }

  /**
   * 캐릭터 스프라이트 렌더링 (애니메이션 지원)
   * @param {CanvasRenderingContext2D} ctx - Canvas 컨텍스트
   * @param {HTMLImageElement} spriteSheet - 스프라이트 시트 이미지
   * @param {string} characterId - 캐릭터 ID
   * @param {number} x - X 좌표
   * @param {number} destY - Y 좌표
   * @param {number} size - 크기
   * @param {Object} direction - 방향 (idle, walk_up, walk_down, walk_left, walk_right)
   * @param {number} timestamp - 현재 타임스탬프
   * @param {number} animationSpeed - 애니메이션 속도 (ms per frame)
   */
  renderCharacterSprite(ctx, spriteSheet, characterId, x, y, size, direction, timestamp, animationSpeed = 200) {
    // 방향별 프레임 인덱스
    const directionFrames = {
      idle: 0,
      walk_down: 0,
      walk_up: 1,
      walk_left: 2,
      walk_right: 3
    };
    
    // 시트 구조 (32x32 칸, 4방향 * 4프레임)
    const SPRITE_SIZE = 32;
    const FRAMES_PER_ANIMATION_STEP = 4;
    const frameHeight = SPRITE_SIZE;
    const frameWidth = SPRITE_SIZE;
    
    // 현재 애니메이션 상태 확인
    const currentState = this.animations.get(characterId) || 'idle';
    const currentDirectionIndex = directionFrames[direction] || 0;
    
    // 프레임 계산
    let frameIndex = 0;
    if (currentState === 'idle') {
      frameIndex = 0;
    } else {
      // 걷는 애니메이션: 4프레임 루프
      if (!this.frameTimer.has(characterId)) {
        this.frameTimer.set(characterId, timestamp);
      }
      
      const elapsed = timestamp - this.frameTimer.get(characterId);
      frameIndex = Math.floor(elapsed / animationSpeed) % 4;
      
      // 타이머 갱신 (오버플로우 방지)
      if (elapsed > animationSpeed * 4) {
        this.frameTimer.set(characterId, timestamp);
      }
    }
    
    // 소스 좌표 계산
    const srcX = (frameIndex * frameWidth) + (currentDirectionIndex * frameWidth * 4);
    const srcY = 0;
    
    // 프레임 객체 생성
    const frame = {
      x: srcX,
      y: srcY,
      width: frameWidth,
      height: frameHeight
    };
    
    // 방향에 따른 뒤집기
    const flipX = direction === 'walk_left';
    
    // 렌더링
    this.renderFrame(ctx, spriteSheet, x, y, size, frame, flipX);
  }

  /**
   * 건물 타일 렌더링
   * @param {CanvasRenderingContext2D} ctx - Canvas 컨텍스트
   * @param {HTMLImageElement} tileSheet - 타일 시트 이미지
   * @param {number} x - X 좌표
   * @param {number} y - Y 좌표
   * @param {number} width - 너비
   * @param {number} height - 높이
   * @param {Object} tile - 타일 정보 { type, variant }
   */
  renderTile(ctx, tileSheet, x, y, width, height, tile) {
    const TILE_SIZE = 32;
    
    ctx.save();
    ctx.imageSmoothingEnabled = false;
    
    // 타일 타입별 소스 좌표
    const tileFrames = {
      ground: { x: 0, y: 320 },
      road: { x: 32, y: 320 },
      grass: { x: 64, y: 320 },
      water: { x: 96, y: 320 }
    };
    
    const frame = tileFrames[tile.type] || tileFrames.ground;
    
    // 타일 패턴으로 채우기
    const pattern = ctx.createPattern(tileSheet, 'repeat');
    pattern.setTransform(new DOMMatrix()
      .translate(x - frame.x, y - frame.y)
      .scale(TILE_SIZE / 32, TILE_SIZE / 32)
    );
    
    ctx.fillStyle = pattern;
    ctx.fillRect(x, y, width, height);
    
    ctx.restore();
  }

  /**
   * 애니메이션 상태 설정
   * @param {string} characterId - 캐릭터 ID
   * @param {string} state - 애니메이션 상태 (idle, walk)
   */
  setAnimationState(characterId, state) {
    this.animations.set(characterId, state);
  }

  /**
   * 애니메이션 상태 리셋
   * @param {string} characterId - 캐릭터 ID
   */
  resetAnimation(characterId) {
    this.animations.delete(characterId);
    this.frameTimer.delete(characterId);
  }

  /**
   * 상태 정리
   */
  cleanup() {
    this.animations.clear();
    this.currentFrame.clear();
    this.frameTimer.clear();
  }
}

// 싱글톤 인스턴스
const spriteRenderer = new SpriteRenderer();

export default spriteRenderer;