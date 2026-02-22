// 애니메이션 컨트롤러 - 캐릭터 애니메이션 상태 전환 관리
class AnimationController {
  constructor(characterId) {
    this.characterId = characterId;
    this.state = 'idle'; // idle, walk, run, jump, sit
    this.direction = 'down'; // up, down, left, right
    this.emotion = 'neutral'; // neutral, joy, sad, angry, surprised
    this.currentFrame = 0;
    this.lastFrameUpdate = 0;
    this.animationSpeed = 200; // ms per frame
    this.isMoving = false;

    // 애니메이션 채널
    this.animationChannels = {
      idle: { speed: 500, loop: true },
      walk: { speed: 200, loop: true },
      run: { speed: 120, loop: true },
      jump: { speed: 150, loop: false },
      sit: { speed: 300, loop: true }
    };

    // 감정 애니메이션 채널
    this.emotionChannels = {
      neutral: { speed: 0, loop: true },
      joy: { speed: 250, loop: true },
      sad: { speed: 300, loop: true },
      angry: { speed: 200, loop: true },
      surprised: { speed: 150, loop: false }
    };

    // Crossfade transition
    this.transitionProgress = 0;
    this.transitionDuration = 200; // ms
    this.isTransitioning = false;

    // 감정 애니메이션 프레임
    this.emotionFrame = 0;
    this.lastEmotionFrameUpdate = 0;
  }

  /**
   * 애니메이션 상태 설정 (idle/walk/run/jump/sit)
   * @param {string} state - 애니메이션 상태
   */
  setState(state) {
    if (this.state !== state && this.animationChannels[state]) {
      // 애니메이션 채널 전환이면 crossfade 트리거
      if (this.state !== 'idle' && state !== 'idle') {
        this.startTransition();
      } else {
        this.state = state;
        this.resetAnimation();
      }
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
   * 감정 상태 설정
   * @param {string} emotion - 감정 (neutral, joy, sad, angry, surprised)
   */
  setEmotion(emotion) {
    if (this.emotion !== emotion && this.emotionChannels[emotion]) {
      this.emotion = emotion;
      this.resetEmotionAnimation();
    }
  }

  /**
   * 이동 상태 설정 (walk/speed에 따라 run으로 변경)
   * @param {boolean} isMoving - 이동 중 여부
   * @param {number} speed - 이동 속도 (run/walk 결정)
   */
  setMoving(isMoving, speed = 0) {
    if (this.isMoving !== isMoving) {
      this.isMoving = isMoving;
      // 이동 시작/중지 시 애니메이션 상태 자동 전환
      if (isMoving) {
        this.state = speed > 2 ? 'run' : 'walk';
        this.resetAnimation();
      } else {
        this.state = 'idle';
        this.resetAnimation();
      }
    } else if (isMoving) {
      // 이동 중에 속도 변경 시 walk/run 자동 전환
      const newState = speed > 2 ? 'run' : 'walk';
      if (this.state !== newState) {
        this.state = newState;
        this.resetAnimation();
      }
    }
  }

  /**
   * 현재 프레임 업데이트
   * @param {number} timestamp - 현재 타임스탬프
   */
  updateFrame(timestamp) {
    // Crossfade transition 업데이트
    if (this.isTransitioning) {
      const transitionElapsed = timestamp - this.transitionStartTime;
      this.transitionProgress = Math.min(transitionElapsed / this.transitionDuration, 1);
      if (this.transitionProgress >= 1) {
        this.isTransitioning = false;
        this.transitionProgress = 0;
      }
    }

    // 현재 상태의 애니메이션 프레임 업데이트
    const channelConfig = this.animationChannels[this.state];
    if (!channelConfig) return;

    const maxFrames = 4; // 기본 4프레임
    const loop = channelConfig.loop;
    const speed = channelConfig.speed;

    if (!this.lastFrameUpdate) {
      this.lastFrameUpdate = timestamp;
      return;
    }

    const elapsed = timestamp - this.lastFrameUpdate;
    if (elapsed >= speed) {
      // loop 여부에 따른 프레임 갱신
      if (loop) {
        this.currentFrame = (this.currentFrame + 1) % maxFrames;
      } else {
        // 비루프 애니메이션은 마지막 프레임에서 멈춤
        if (this.currentFrame < maxFrames - 1) {
          this.currentFrame = (this.currentFrame + 1) % maxFrames;
        }
      }
      this.lastFrameUpdate = timestamp;
    }

    // 감정 애니메이션 프레임 업데이트
    const emotionConfig = this.emotionChannels[this.emotion];
    if (!emotionConfig) return;

    const emotionMaxFrames = 2; // 감정 애니메이션은 2프레임
    const emotionLoop = emotionConfig.loop;
    const emotionSpeed = emotionConfig.speed;

    if (!this.lastEmotionFrameUpdate) {
      this.lastEmotionFrameUpdate = timestamp;
      return;
    }

    const emotionElapsed = timestamp - this.lastEmotionFrameUpdate;
    if (emotionSpeed > 0 && emotionElapsed >= emotionSpeed) {
      if (emotionLoop) {
        this.emotionFrame = (this.emotionFrame + 1) % emotionMaxFrames;
      } else {
        // 비루프 감정 애니메이션은 마지막 프레임에서 멈춤
        if (this.emotionFrame < emotionMaxFrames - 1) {
          this.emotionFrame = (this.emotionFrame + 1) % emotionMaxFrames;
        }
      }
      this.lastEmotionFrameUpdate = timestamp;
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
   * 감정 애니메이션 리셋
   */
  resetEmotionAnimation() {
    this.emotionFrame = 0;
    this.lastEmotionFrameUpdate = 0;
  }

  /**
   * Crossfade 전환 시작
   */
  startTransition() {
    this.isTransitioning = true;
    this.transitionStartTime = performance.now();
    this.transitionProgress = 0;
  }

  /**
   * Crossfade 프로그레스 반환 (0~1)
   * @returns {number}
   */
  getTransitionProgress() {
    return this.transitionProgress;
  }

  /**
   * 애니메이션 속도 설정 (walk speed에 따라 frame rate 조절)
   * @param {number} speed - 이동 속도 (1~3)
   */
  setAnimationSpeed(speed) {
    // 속도가 빠를수록 애니메이션 속도 빠름 (ms이므로 작아야 빠름)
    const baseSpeed = 200;
    this.animationSpeed = Math.max(100, baseSpeed - (speed * 30));
  }

  /**
   * 현재 애니메이션 상태 반환
   * @returns {Object} - { state, direction, currentFrame, emotion, emotionFrame, transitionProgress }
   */
  getCurrentState() {
    return {
      state: this.state,
      direction: this.direction,
      currentFrame: this.currentFrame,
      emotion: this.emotion,
      emotionFrame: this.emotionFrame,
      transitionProgress: this.transitionProgress
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
    this.resetEmotionAnimation();
  }
}

export default AnimationController;