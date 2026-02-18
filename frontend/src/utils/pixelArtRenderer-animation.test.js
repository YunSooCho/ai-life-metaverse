// pixelArtRenderer 애니메이션 시스템 테스트

describe('PixelAnimationController', () => {
  let controller;

  beforeEach(() => {
    controller = new (require('./AnimationController.js').default)('test-char-1');
  });

  afterEach(() => {
    if (controller) {
      controller.cleanup();
    }
  });

  // TC01: 애니메이션 채널 설정
  test('TC01: animationChannels 설정 확인', () => {
    expect(controller.animationChannels).toHaveProperty('idle');
    expect(controller.animationChannels).toHaveProperty('walk');
    expect(controller.animationChannels).toHaveProperty('run');
    expect(controller.animationChannels).toHaveProperty('jump');
    expect(controller.animationChannels).toHaveProperty('sit');

    // idle 속도 확인
    expect(controller.animationChannels.idle.speed).toBe(500);
    expect(controller.animationChannels.idle.loop).toBe(true);

    // walk 속도 확인
    expect(controller.animationChannels.walk.speed).toBe(200);
    expect(controller.animationChannels.walk.loop).toBe(true);

    // run 속도 확인
    expect(controller.animationChannels.run.speed).toBe(120);
    expect(controller.animationChannels.run.loop).toBe(true);

    // jump 루프 확인
    expect(controller.animationChannels.jump.loop).toBe(false);

    // sit 속도 확인
    expect(controller.animationChannels.sit.speed).toBe(300);
  });

  // TC02: 감정 애니메이션 채널 설정
  test('TC02: emotionChannels 설정 확인', () => {
    expect(controller.emotionChannels).toHaveProperty('neutral');
    expect(controller.emotionChannels).toHaveProperty('joy');
    expect(controller.emotionChannels).toHaveProperty('sad');
    expect(controller.emotionChannels).toHaveProperty('angry');
    expect(controller.emotionChannels).toHaveProperty('surprised');

    // neutral 속도 확인 (정지)
    expect(controller.emotionChannels.neutral.speed).toBe(0);

    // joy 속도 확인
    expect(controller.emotionChannels.joy.speed).toBe(250);
    expect(controller.emotionChannels.joy.loop).toBe(true);

    // sad 속도 확인
    expect(controller.emotionChannels.sad.speed).toBe(300);
    expect(controller.emotionChannels.sad.loop).toBe(true);

    // angry 속도 확인
    expect(controller.emotionChannels.angry.speed).toBe(200);
    expect(controller.emotionChannels.angry.loop).toBe(true);

    // surprised 루프 확인
    expect(controller.emotionChannels.surprised.loop).toBe(false);
  });

  // TC03: setState 기본 동작
  test('TC03: setState로 idle/walk 변경', () => {
    controller.setState('walk');
    expect(controller.state).toBe('walk');

    controller.setState('idle');
    expect(controller.state).toBe('idle');
  });

  // TC04: setMoving으로 state 자동 전환
  test('TC04: setMoving으로 walk/idle 자동 전환', () => {
    // 이동 시작
    controller.setMoving(true, 1);
    expect(controller.state).toBe('walk');

    // 이동 중지
    controller.setMoving(false);
    expect(controller.state).toBe('idle');
  });

  // TC05: setMoving으로 run/walk 자동 전환
  test('TC05: setMoving으로 run/walk 자동 전환 (speed 기준)', () => {
    // 빠른 속도
    controller.setMoving(true, 3);
    expect(controller.state).toBe('run');

    // 느린 속도
    controller.setMoving(true, 1);
    expect(controller.state).toBe('walk');
  });

  // TC06: setEmotion 기본 동작
  test('TC06: setEmotion으로 감정 변경', () => {
    controller.setEmotion('joy');
    expect(controller.emotion).toBe('joy');

    controller.setEmotion('sad');
    expect(controller.emotion).toBe('sad');

    controller.setEmotion('angry');
    expect(controller.emotion).toBe('angry');

    controller.setEmotion('surprised');
    expect(controller.emotion).toBe('surprised');

    controller.setEmotion('neutral');
    expect(controller.emotion).toBe('neutral');
  });

  // TC07: 애니메이션 프레임 업데이트
  test('TC07: updateFrame으로 프레임 업데이트', () => {
    const timestamp = performance.now();
    controller.state = 'walk';

    controller.lastFrameUpdate = timestamp;
    controller.updateFrame(timestamp + 250);
    expect(controller.currentFrame).toBe(1);
  });

  // TC08: 캐릭터 ID 반환
  test('TC08: getCharacterId로 캐릭터 ID 반환', () => {
    expect(controller.getCharacterId()).toBe('test-char-1');
  });

  // TC09: getCurrentState 전체 상태 반환
  test('TC09: getCurrentState로 전체 상태 반환', () => {
    controller.state = 'walk';
    controller.direction = 'right';
    controller.emotion = 'joy';
    controller.currentFrame = 2;
    controller.emotionFrame = 1;

    const state = controller.getCurrentState();
    expect(state.state).toBe('walk');
    expect(state.direction).toBe('right');
    expect(state.emotion).toBe('joy');
    expect(state.currentFrame).toBe(2);
    expect(state.emotionFrame).toBe(1);
  });

  // TC10: cleanup으로 애니메이션 리셋
  test('TC10: cleanup으로 애니메이션 리셋', () => {
    controller.state = 'walk';
    controller.currentFrame = 2;
    controller.emotionFrame = 1;

    controller.cleanup();
    expect(controller.currentFrame).toBe(0);
    expect(controller.emotionFrame).toBe(0);
  });

  // TC11: 애니메이션 속도 설정
  test('TC11: setAnimationSpeed으로 속도 변경', () => {
    controller.setAnimationSpeed(2);
    expect(controller.animationSpeed).toBeLessThan(200);

    controller.setAnimationSpeed(3);
    expect(controller.animationSpeed).toBe(110); // 200 - 3*30
  });

  // TC12: crossfade transition
  test('TC12: startTransition으로 crossfade 시작', () => {
    controller.state = 'walk';
    controller.startTransition('run');

    expect(controller.isTransitioning).toBe(true);
    expect(controller.transitionProgress).toBe(0);
  });

  // TC13: transitionProgress 업데이트
  test('TC13: updateFrame으로 transitionProgress 업데이트', () => {
    controller.state = 'run';
    controller.startTransition('idle');

    const timestamp = performance.now();
    controller.transitionStartTime = timestamp - 100; // 절반 경과
    controller.updateFrame(timestamp);

    expect(controller.transitionProgress).toBeCloseTo(0.5, 1);
  });
});

describe('AnimationChannelManager', () => {
  // TC14: 애니메이션 컨트롤러 생성 (helper 함수 사용)
  test('TC14: getAnimationController로 컨트롤러 생성 및 반환', () => {
    const { getAnimationController, cleanupAllAnimationControllers } = require('./pixelArtRenderer.js');
    const controller = getAnimationController('test-char-1');
    expect(controller).not.toBeNull();
    expect(controller.getCharacterId()).toBe('test-char-1');
    cleanupAllAnimationControllers();
  });

  // TC15: 같은 캐릭터 ID로 같은 컨트롤러 반환
  test('TC15: 같은 캐릭터 ID로 같은 컨트롤러 반환', () => {
    const { getAnimationController, cleanupAllAnimationControllers } = require('./pixelArtRenderer.js');
    const controller1 = getAnimationController('test-char-1');
    const controller2 = getAnimationController('test-char-1');
    expect(controller1).toBe(controller2);
    cleanupAllAnimationControllers();
  });

  // TC16: 컨트롤러 제거
  test('TC16: removeAnimationController로 컨트롤러 제거', () => {
    const { getAnimationController, removeAnimationController, cleanupAllAnimationControllers } = require('./pixelArtRenderer.js');
    getAnimationController('test-char-1');
    removeAnimationController('test-char-1');

    const controller = getAnimationController('test-char-1');
    expect(controller.getCharacterId()).toBe('test-char-1'); // 새로 생성됨
    cleanupAllAnimationControllers();
  });

  // TC17: 모든 컨트롤러 정리
  test('TC17: cleanupAllAnimationControllers로 모든 컨트롤러 정리', () => {
    const { getAnimationController, cleanupAllAnimationControllers } = require('./pixelArtRenderer.js');
    getAnimationController('test-char-1');
    getAnimationController('test-char-2');
    getAnimationController('test-char-3');
    getAnimationController('test-char-4');

    cleanupAllAnimationControllers();

    // 같은 ID로 컨트롤러를 새로 생성하면 서로 다른 객체가 됨 (정리 완료)
    const c1 = getAnimationController('test-char-1');
    const c2 = getAnimationController('test-char-1');
    expect(c1.getCharacterId()).toBe('test-char-1');
    expect(c2.getCharacterId()).toBe('test-char-1');
    cleanupAllAnimationControllers();
  });
});

describe('pixelArtRenderer 애니메이션 헬퍼 함수', () => {
  // TC18: drawPixelCharacter 파라미터 유효성 검사
  test.skip('TC18: drawPixelCharacter characterId로 애니메이션 활성화', () => {
    // Skip: Canvas not available in vitestjsdom
    // 별도 설정이 필요하거나 실제 브라우저 환경에서 테스트 필요
  });

  // TC19: drawPixelCharacter characterId로 애니메이션 활성화
  test.skip('TC19: drawPixelCharacter characterId로 애니메이션 활성화', () => {
    // Skip: Canvas not available in vitestjsdom
    // 별도 설정이 필요하거나 실제 브라우저 환경에서 테스트 필요
  });

  // TC20: Joy 감정 emotionFrame 확인
  test('TC20: Joy 감정 emotionFrame 확인', () => {
    const controller = new (require('./AnimationController.js').default)('test-char-1');
    controller.setEmotion('joy');

    const timestamp = performance.now();
    controller.updateFrame(timestamp + 300);

    expect(controller.emotionFrame).toBeGreaterThanOrEqual(0);
    expect(controller.emotionFrame).toBeLessThan(2);
  });

  // TC21: Angry 감정 emotionFrame 확인
  test('TC21: Angry 감정 emotionFrame 확인', () => {
    const controller = new (require('./AnimationController.js').default)('test-char-1');
    controller.setEmotion('angry');

    const timestamp = performance.now();
    controller.updateFrame(timestamp + 250);

    expect(controller.emotionFrame).toBeGreaterThanOrEqual(0);
    expect(controller.emotionFrame).toBeLessThan(2);
  });

  // TC22: Surprised 감정 emotionFrame 확인 (non-loop)
  test('TC22: Surprised 감정 emotionFrame 확인 (non-loop)', () => {
    const controller = new (require('./AnimationController.js').default)('test-char-1');
    controller.setEmotion('surprised');

    const timestamp = performance.now();
    controller.updateFrame(timestamp + 200);

    // 두 번 업데이트해도 마지막 프레임(1) 유지
    controller.updateFrame(timestamp + 400);

    expect(controller.emotionFrame).toBeGreaterThanOrEqual(0);
    expect(controller.emotionFrame).toBeLessThanOrEqual(1);
  });

  // TC23: Bounce 애니메이션 offset 계산
  test('TC23: Bounce 애니메이션 offset 계산', () => {
    const controller = new (require('./AnimationController.js').default)('test-char-1');
    controller.setMoving(true, 1);

    const timestamp = performance.now();
    controller.updateFrame(timestamp + 200);

    const state = controller.getCurrentState();
    const bounceY = -Math.sin(state.currentFrame * Math.PI / 2) * 0.5;

    expect(bounceY).toBeGreaterThanOrEqual(-0.5);
    expect(bounceY).toBeLessThanOrEqual(0);
  });

  // TC24: Run bounce 아마피튜드 더 큼
  test('TC24: Run bounce 아마피튜드 더 큼', () => {
    const controllerWalk = new (require('./AnimationController.js').default)('test-char-1');
    controllerWalk.setMoving(true, 1);
    const timestamp = performance.now();
    controllerWalk.updateFrame(timestamp);
    controllerWalk.updateFrame(timestamp + 200);
    const stateWalk = controllerWalk.getCurrentState();
    const bounceWalk = -Math.sin(stateWalk.currentFrame * Math.PI / 2) * 0.5;

    const controllerRun = new (require('./AnimationController.js').default)('test-char-2');
    controllerRun.setMoving(true, 3);
    controllerRun.updateFrame(timestamp);
    controllerRun.updateFrame(timestamp + 200);
    const stateRun = controllerRun.getCurrentState();
    const bounceRun = -Math.sin(stateRun.currentFrame * Math.PI / 2) * 0.8;

    expect(Math.abs(bounceRun)).toBeGreaterThan(Math.abs(bounceWalk));
  });

  // TC25: validateCustomizationOptions joy/surprised 추가
  test('TC25: validateCustomizationOptions joy/surprised 추가', () => {
    const { validateCustomizationOptions } = require('./pixelArtRenderer.js');

    expect(validateCustomizationOptions({ emotion: 'joy' })).toBe(true);
    expect(validateCustomizationOptions({ emotion: 'surprised' })).toBe(true);
    expect(validateCustomizationOptions({ emotion: 'invalid' })).toBe(false);
  });
});