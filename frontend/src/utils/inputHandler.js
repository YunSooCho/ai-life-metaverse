/**
 * 키보드 입력 처리 유틸리티
 *
 * 방향키 및 WASD 키를 감지하고, 캐릭터 이동을 관리하는 핸들러
 */

// 키 상태 저장소
const keyStates = {}

// 지원하는 키 목록
const SUPPORTED_KEYS = [
  'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',  // 방향키
  'w', 'a', 's', 'd',  // WASD
  'W', 'A', 'S', 'D'   // 대문자 WASD
]

// 키 방향 매핑
const KEY_DIRECTIONS = {
  'ArrowUp': { x: 0, y: -1 },
  'ArrowDown': { x: 0, y: 1 },
  'ArrowLeft': { x: -1, y: 0 },
  'ArrowRight': { x: 1, y: 0 },
  'w': { x: 0, y: -1 },
  'W': { x: 0, y: -1 },
  's': { x: 0, y: 1 },
  'S': { x: 0, y: 1 },
  'a': { x: -1, y: 0 },
  'A': { x: -1, y: 0 },
  'd': { x: 1, y: 0 },
  'D': { x: 1, y: 0 }
}

// 활성화된 콜백 (cleanup 용)
const activeCallbacks = []

/**
 * 키보드 입력 초기화
 * @param {Object} callbacks - 콜백 함수들
 * @param {Function} callbacks.onKeyDown - 키 다운 이벤트
 * @param {Function} callbacks.onKeyUp - 키 업 이벤트
 * @returns {Function} cleanup 함수
 */
export function initializeInputHandler(callbacks = {}) {
  const { onKeyDown, onKeyUp } = callbacks

  // 키 다운 이벤트 핸들러
  const handleKeyDown = (event) => {
    if (!SUPPORTED_KEYS.includes(event.key)) return

    // 키 상태 업데이트
    keyStates[event.key] = true

    // 콜백 호출
    if (onKeyDown) {
      onKeyDown(event.key, event)
    }
  }

  // 키 업 이벤트 핸들러
  const handleKeyUp = (event) => {
    if (!SUPPORTED_KEYS.includes(event.key)) return

    // 키 상태 업데이트
    keyStates[event.key] = false

    // 콜백 호출
    if (onKeyUp) {
      onKeyUp(event.key, event)
    }
  }

  // 이벤트 리스너 등록
  window.addEventListener('keydown', handleKeyDown)
  window.addEventListener('keyup', handleKeyUp)

  // Cleanup 함수 반환
  const cleanup = () => {
    window.removeEventListener('keydown', handleKeyDown)
    window.removeEventListener('keyup', handleKeyUp)
  }

  // 콜백와 cleanup을 저장
  activeCallbacks.push({ onKeyDown, onKeyUp, cleanup })

  return cleanup
}

/**
 * 키가 눌려 있는지 확인
 * @param {string} key - 키 이름
 * @returns {boolean} 키가 눌려 있으면 true
 */
export function isKeyPressed(key) {
  return !!keyStates[key]
}

/**
 * 현재 눌린 키들에서 이동 방향 계산
 * @returns {Object} { x: number, y: number } 방향 벡터
 */
export function getMovementDirection() {
  let x = 0
  let y = 0

  // 대각선 이동을 위한 상태 확인
  const up = isKeyPressed('ArrowUp') || isKeyPressed('w') || isKeyPressed('W')
  const down = isKeyPressed('ArrowDown') || isKeyPressed('s') || isKeyPressed('S')
  const left = isKeyPressed('ArrowLeft') || isKeyPressed('a') || isKeyPressed('A')
  const right = isKeyPressed('ArrowRight') || isKeyPressed('d') || isKeyPressed('D')

  // 상하 충돌 처리
  if (up && !down) y = -1
  else if (down && !up) y = 1

  // 좌우 충돌 처리
  if (left && !right) x = -1
  else if (right && !left) x = 1

  // 대각선 이동 정규화
  if (x !== 0 && y !== 0) {
    const length = Math.sqrt(x * x + y * y)
    x = x / length
    y = y / length
  }

  return { x, y }
}

/**
 * 이동 중인지 확인
 * @returns {boolean} 키보드로 이동 중이면 true
 */
export function isMoving() {
  const direction = getMovementDirection()
  return direction.x !== 0 || direction.y !== 0
}

/**
 * 모든 키 상태 초기화
 */
export function resetKeyStates() {
  for (const key of SUPPORTED_KEYS) {
    keyStates[key] = false
  }
}

/**
 * 현재 눌린 모든 키 목록 반환
 * @returns {string[]} 눌린 키들
 */
export function getPressedKeys() {
  return SUPPORTED_KEYS.filter(key => keyStates[key])
}

// 모든 콜백 cleanup (테스트/디버깅 용)
export function cleanupAllInputHandlers() {
  for (const { cleanup } of activeCallbacks) {
    cleanup()
  }
  activeCallbacks.length = 0
  resetKeyStates()
}

export default {
  initializeInputHandler,
  isKeyPressed,
  getMovementDirection,
  isMoving,
  resetKeyStates,
  getPressedKeys,
  cleanupAllInputHandlers
}