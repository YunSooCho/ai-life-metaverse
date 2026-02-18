// 애니메이션 컨트롤러 - 캐릭터 애니메이션 상태 전환 관리
class AnimationController {
  constructor(characterId) {
    this.characterId = characterId;
    this.state = 'idle'; // idle, walk
    this.direction = 'down'; // up, down, left, right
    this.currentFrame = 0;
    this.lastFrameUpdate = 0;
    this.animationSpeed = 200; // ms per frame
    this.isMoving = false;
  }

  /**
   * 애니메이션 상태 설정 (idle/walk)
   * @param {string} state - 애니메이션 상태
   */
  setState(state) {
    if (this.state !== state) {
      this.state = state;
      this.resetAnimation();
    }
  }

  /**
   * 이동 방향 설정
   * @param {string} direction - 방향 (up, down, left, right)
   */
  setDirection(direction) {
    if (this.direction !== direction) {
      this.direction = direction;
    }
  }

  /**
   * 이동 상태 설정
   * @param {boolean} isMoving - 이동 중 여부
   */
  setMoving(isMoving) {
    if (this.isMoving !== isMoving) {
      this.isMoving = isMoving;
      // 이동 시작/중지 시 애니메이션 상태 자동 전환
      if (isMoving) {
        this.setState('walk');
      } else {
        this.setState('idle');
      }
    }
  }

  /**
   * 현재 프레임 업데이트
   * @param {number} timestamp - 현재 타임스탬프
   */
  updateFrame(timestamp) {
    if (this.state === 'idle') {
      this.currentFrame = 0;
      return;
    }

    // walk 상태일 때만 프레임 업데이트
    if (!this.lastFrameUpdate) {
      this.lastFrameUpdate = timestamp;
      return;
    }

    const elapsed = timestamp - this.lastFrameUpdate;
    if (elapsed >= this.animationSpeed) {
      this.currentFrame = (this.currentFrame + 1) % 4;
      this.lastFrameUpdate = timestamp;
    }
  }

  /**
   * 애니메이션 리셋
   */
  resetAnimation() {
    this.currentFrame = 0;
    this.lastFrameUpdate = 0;
  }

  /**
   * 애니메이션 속도 설정
   * @param {number} speed - 애니메이션 속도 (ms per frame)
   */
  setAnimationSpeed(speed) {
    this.animationSpeed = speed;
  }

  /**
   * 현재 애니메이션 상태 반환
   * @returns {Object} - { state, direction, currentFrame }
   */
  getCurrentState() {
    return {
      state: this.state,
      direction: this.direction,
      currentFrame: this.currentFrame
    };
  }

  /**
   * 캐릭터 ID 반환
   * @returns {string}
   */
  getCharacterId() {
    return this.characterId;
  }

  /**
   * 정리
   */
  cleanup() {
    this.resetAnimation();
  }
}

export default AnimationController;