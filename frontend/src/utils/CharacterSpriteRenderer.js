// 캐릭터 스프라이트 렌더러 - 4방향 애니메이션 렌더링 담당
import spriteLoader from './spriteLoader.js';
import spriteRenderer from './spriteRenderer.js';

class CharacterSpriteRenderer {
  constructor() {
    // 스프라이트 시트 경로
    this.spriteSheetPath = 'sprites/characters.png';
    this.spriteSheetName = 'characters';
    this.spriteSheet = null;
    
    // 애니메이션 컨트롤러 맵
    this.animControllers = new Map();
    
    // 스프라이트 좌표 데이터
    this.spriteFrames = {
      // 시트 구조: 32x32 픽셀, 4방향 × 4프레임
      // 행: 방향 (0=down, 1=up, 2=left, 3=right)
      // 열: 프레임 (0, 1, 2, 3)
      SPRITE_SIZE: 32,
      FRAMES_PER_ROW: 4,
      DIRECTIONS: {
        down: 0,
        up: 1,
        left: 2,
        right: 3
      }
    };
  }

  /**
   * 스프라이트 시트 로드
   * @returns {Promise<void>}
   */
  async loadSpriteSheet() {
    // 간단한 폴백: 실제 스프라이트 이미지가 없으면 null 유지
    try {
      this.spriteSheet = await spriteLoader.loadSpriteSheet(
        this.spriteSheetPath,
        this.spriteSheetName
      );
    } catch (error) {
      console.warn(`[CharacterSpriteRenderer] Failed to load sprite sheet: ${error.message}`);
      this.spriteSheet = null;
    }
  }

  /**
   * 캐릭터 애니메이션 컨트롤러 생성
   * @param {string} characterId - 캐릭터 ID
   * @returns {Promise<AnimationController>}
   */
  async createController(characterId) {
    if (!this.animControllers.has(characterId)) {
      const AnimationController = (await import('./AnimationController.js')).default;
      const controller = new AnimationController(characterId);
      this.animControllers.set(characterId, controller);
    }
    return this.animControllers.get(characterId);
  }

  /**
   * 캐릭터 렌더링
   * @param {CanvasRenderingContext2D} ctx - Canvas 컨텍스트
   * @param {string} characterId - 캐릭터 ID
   * @param {number} x - X 좌표
   * @param {number} y - Y 좌표
   * @param {number} size - 렌더링 크기
   * @param {boolean} isMoving - 이동 중 여부
   * @param {string} direction - 이동 방향
   * @param {number} timestamp - 현재 타임스탬프
   */
  render(ctx, characterId, x, y, size, isMoving, direction, timestamp) {
    // 애니메이션 컨트롤러 가져오기
    const controller = this.createController(characterId);
    
    // 상태 업데이트
    controller.setMoving(isMoving);
    controller.setDirection(direction);
    controller.updateFrame(timestamp);
    
    // 현재 프레임 정보 가져오기
    const currentState = controller.getCurrentState();
    
    // 스프라이트 시트가 없으면 프로그래매틱 렌더링 (폴백)
    if (!this.spriteSheet) {
      this.renderFallback(ctx, x, y, size, currentState);
      return;
    }
    
    // 스프라이트 프레임 렌더링
    this.renderSpriteFrame(ctx, x, y, size, currentState);
  }

  /**
   * 스프라이트 프레임 렌더링 (실제 스프라이트 시트가 있을 때)
   * @param {CanvasRenderingContext2D} ctx - Canvas 컨텍스트
   * @param {number} x - X 좌표
   * @param {number} y - Y 좌표
   * @param {number} size - 렌더링 크기
   * @param {Object} state - 현재 애니메이션 상태
   */
  renderSpriteFrame(ctx, x, y, size, state) {
    const { direction, currentFrame } = state;
    const { SPRITE_SIZE, DIRECTIONS } = this.spriteFrames;
    
    // 방향별 행 인덱스
    const directionRow = DIRECTIONS[direction] || DIRECTIONS.down;
    
    // 소스 좌표 계산
    const srcX = currentFrame * SPRITE_SIZE;
    const srcY = directionRow * SPRITE_SIZE;
    
    // 프레임 객체
    const frame = {
      x: srcX,
      y: srcY,
      width: SPRITE_SIZE,
      height: SPRITE_SIZE
    };
    
    // 뒤집기 여부 (left/right는 같은 프레임으로 처리)
    // left 방향은 수평 뒤집기로 처리하지 않고 별도 행 사용
    const flipX = false;
    
    // 스프라이트 렌더링
    spriteRenderer.renderFrame(ctx, this.spriteSheet, x, y, size, frame, flipX);
  }

  /**
   * 폴백 렌더링 (스프라이트 시트가 없을 때 프로그래매틱으로 렌더링)
   * @param {CanvasRenderingContext2D} ctx - Canvas 컨텍스트
   * @param {number} x - X 좌표
   * @param {number} y - Y 좌표
   * @param {number} size - 렌더링 크기
   * @param {Object} state - 현재 애니메이션 상태
   */
  renderFallback(ctx, x, y, size, state) {
    const { direction, currentFrame } = state;
    
    ctx.save();
    ctx.imageSmoothingEnabled = false;
    
    // 몸통 (픽셀 스타일)
    ctx.fillStyle = '#4CAF50';
    ctx.fillRect(x - size/3, y - size/3, size/1.5, size/1.5);
    
    // 눈 (방향에 따라 위치 변경)
    const eyeOffset = { up: 0, down: size/8, left: -size/8, right: size/8 }[direction] || 0;
    ctx.fillStyle = '#FFFFFF';
    const eyeSize = size/8;
    const eyeY = y - size/6;
    
    // bounce 애니메이션 (걷을 때)
    const bounce = state.state === 'walk' ? Math.sin(currentFrame * Math.PI / 2) * size/10 : 0;
    
    // 눈 그리기
    ctx.fillRect(x - size/8 + eyeOffset - bounce, eyeY - bounce, eyeSize, eyeSize);
    ctx.fillRect(x + eyeOffset - bounce, eyeY - bounce, eyeSize, eyeSize);
    
    // 눈동자
    ctx.fillStyle = '#000000';
    ctx.fillRect(x - size/8 + eyeOffset + eyeSize/4 - bounce, eyeY + eyeSize/4 - bounce, eyeSize/2, eyeSize/2);
    ctx.fillRect(x + eyeOffset + eyeSize/4 - bounce, eyeY + eyeSize/4 - bounce, eyeSize/2, eyeSize/2);
    
    ctx.restore();
  }

  /**
   * 캐릭터 애니메이션 컨트롤러 삭제
   * @param {string} characterId - 캐릭터 ID
   */
  removeController(characterId) {
    const controller = this.animControllers.get(characterId);
    if (controller) {
      controller.cleanup();
      this.animControllers.delete(characterId);
    }
  }

  /**
   * 모든 캐릭터 정리
   */
  cleanup() {
    this.animControllers.forEach(controller => controller.cleanup());
    this.animControllers.clear();
  }

  /**
   * 스프라이트 로드 여부 확인
   * @returns {boolean}
   */
  isLoaded() {
    return this.spriteSheet !== null;
  }
}

// 싱글톤 인스턴스
const characterSpriteRenderer = new CharacterSpriteRenderer();

export default characterSpriteRenderer;