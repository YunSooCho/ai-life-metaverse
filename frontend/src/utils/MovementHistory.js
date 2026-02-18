/**
 * MovementHistory - 캐릭터 이동 히스토리 추적 유틸리티
 *
 * 목표:
 * - 캐릭터의 이동 경로를 정확하게 추적
 * - 최신 이동 벡터 기반으로 방향 결정
 * - 임계값 이하 이동 무시 (노이즈 제거)
 * - 대각선 이동 정규화 지원
 *
 * 구조:
 * {
 *   characterId: string,
 *   positions: [{ x, y, timestamp }],  // 최근 N개 위치 기록
 *   maxHistory: 100,                   // 최대 기록 개수
 * }
 */

const DEFAULT_MAX_HISTORY = 50
const MOVEMENT_THRESHOLD = 0.5  // 이동 임계값(px) - 이하면 무시
const DIRECTION_HISTORY_SIZE = 3  // 방향 결정에 사용할 최근 이동 개수

class MovementHistory {
  constructor(characterId, maxHistory = DEFAULT_MAX_HISTORY) {
    this.characterId = characterId
    this.positions = []
    this.maxHistory = maxHistory
  }

  /**
   * 새 위치 추가
   * @param {number} x - 현재 X 좌표
   * @param {number} y - 현재 Y 좌표
   * @param {number} timestamp - 타임스탬프 (기본: 현재 시간)
   */
  addPosition(x, y, timestamp = Date.now()) {
    const lastPosition = this.positions[this.positions.length - 1]

    // 첫 위치이거나 임계값 이상 이동 시 추가
    if (!lastPosition) {
      this.positions.push({ x, y, timestamp })
    } else {
      const distance = Math.sqrt(
        Math.pow(x - lastPosition.x, 2) +
        Math.pow(y - lastPosition.y, 2)
      )

      if (distance >= MOVEMENT_THRESHOLD) {
        this.positions.push({ x, y, timestamp })

        // 히스토리 크기 제한
        if (this.positions.length > this.maxHistory) {
          this.positions.shift()
        }
      }
    }
  }

  /**
   * 최근 N개 위치 반환
   * @param {number} n - 반환할 개수 (기본: 전체)
   * @returns {Array} 최근 위치 배열
   */
  getRecentPositions(n = this.positions.length) {
    return this.positions.slice(-n)
  }

  /**
   * 현재 위치 반환
   * @returns {Object|null} { x, y, timestamp } 또는 null
   */
  getCurrentPosition() {
    return this.positions[this.positions.length - 1] || null
  }

  /**
   * 이전 위치 반환
   * @returns {Object|null} { x, y, timestamp } 또는 null
   */
  getPreviousPosition() {
    return this.positions.length > 1 ? this.positions[this.positions.length - 2] : null
  }

  /**
   * 이동 중인지 확인 (최근 N개 위치 평균)
   * @param {number} n - 확인할 최근 위치 개수
   * @returns {boolean} 이동 중이면 true
   */
  isMoving(n = DIRECTION_HISTORY_SIZE) {
    if (this.positions.length < 2) return false

    const recentPositions = this.getRecentPositions(n)
    if (recentPositions.length < 2) return false

    // 최근 위치들의 평균 이동 거리 계산
    let totalDistance = 0
    for (let i = 1; i < recentPositions.length; i++) {
      const distance = Math.sqrt(
        Math.pow(recentPositions[i].x - recentPositions[i - 1].x, 2) +
        Math.pow(recentPositions[i].y - recentPositions[i - 1].y, 2)
      )
      totalDistance += distance
    }

    const avgDistance = totalDistance / (recentPositions.length - 1)
    return avgDistance >= MOVEMENT_THRESHOLD
  }

  /**
   * 이동 벡터 계산 (최근 N개 위치 평균)
   * @param {number} n - 계산에 사용할 최근 위치 개수
   * @returns {Object} { dx, dy, normalized } 정규화된 이동 벡터
   */
  calculateMovementVector(n = DIRECTION_HISTORY_SIZE) {
    if (this.positions.length < 2) {
      return { dx: 0, dy: 0, normalized: { x: 0, y: 0 } }
    }

    const recentPositions = this.getRecentPositions(n)
    if (recentPositions.length < 2) {
      return { dx: 0, dy: 0, normalized: { x: 0, y: 0 } }
    }

    // 최근 위치들의 평균 이동 벡터 계산
    let totalDx = 0
    let totalDy = 0

    for (let i = 1; i < recentPositions.length; i++) {
      totalDx += recentPositions[i].x - recentPositions[i - 1].x
      totalDy += recentPositions[i].y - recentPositions[i - 1].y
    }

    const dx = totalDx / (recentPositions.length - 1)
    const dy = totalDy / (recentPositions.length - 1)

    // 벡터 정규화 (대각선 이동 시)
    const magnitude = Math.sqrt(dx * dx + dy * dy)
    const normalized = magnitude > 0
      ? { x: dx / magnitude, y: dy / magnitude }
      : { x: 0, y: 0 }

    return { dx, dy, normalized }
  }

  /**
   * 방향 결정 (up/down/left/right)
   * @returns {string} 'up', 'down', 'left', 'right', 'idle'
   */
  getDirection() {
    if (!this.isMoving()) {
      return 'idle'
    }

    const { dx, dy } = this.calculateMovementVector()

    const absDx = Math.abs(dx)
    const absDy = Math.abs(dy)

    // 절대값이 큰 축 선택
    if (absDx > absDy) {
      return dx > 0 ? 'right' : 'left'
    } else {
      return dy > 0 ? 'down' : 'up'
    }
  }

  /**
   * 방향 상세 (대각선 포함)
   * @returns {string} 'up', 'down', 'left', 'right', 'up-left', 'up-right', 'down-left', 'down-right', 'idle'
   */
  getDetailedDirection() {
    if (!this.isMoving()) {
      return 'idle'
    }

    const { dx, dy, normalized } = this.calculateMovementVector()

    const axisThreshold = 0.6  // 대각선 판정 임계값 (cos 45° ≈ 0.707)

    if (Math.abs(normalized.x) < axisThreshold && Math.abs(normalized.y) < axisThreshold) {
      // 이동이 거의 없음
      return 'idle'
    }

    const isUp = dy < -axisThreshold
    const isDown = dy > axisThreshold
    const isLeft = dx < -axisThreshold
    const isRight = dx > axisThreshold

    if (isUp) {
      return isLeft ? 'up-left' : isRight ? 'up-right' : 'up'
    } else if (isDown) {
      return isLeft ? 'down-left' : isRight ? 'down-right' : 'down'
    } else {
      return isLeft ? 'left' : isRight ? 'right' : 'idle'
    }
  }

  /**
   * 이동 속도 계산 (px/ms)
   * @param {number} n - 계산에 사용할 최근 위치 개수
   * @returns {number} 속도 (px/ms) 또는 0
   */
  calculateSpeed(n = DIRECTION_HISTORY_SIZE) {
    if (this.positions.length < 2) return 0

    const recentPositions = this.getRecentPositions(n)
    if (recentPositions.length < 2) return 0

    const first = recentPositions[0]
    const last = recentPositions[recentPositions.length - 1]

    const distance = Math.sqrt(
      Math.pow(last.x - first.x, 2) +
      Math.pow(last.y - first.y, 2)
    )

    const timeDiff = last.timestamp - first.timestamp

    if (timeDiff <= 0) return 0

    return distance / timeDiff
  }

  /**
   * 히스토리 초기화
   */
  clear() {
    this.positions = []
  }

  /**
   * 히스토리 크기 반환
   * @returns {number}
   */
  size() {
    return this.positions.length
  }

  /**
   * 현재 상태 요약
   * @returns {Object} { isMoving, direction, detailedDirection, speed, size }
   */
  getStatus() {
    return {
      isMoving: this.isMoving(),
      direction: this.getDirection(),
      detailedDirection: this.getDetailedDirection(),
      speed: this.calculateSpeed(),
      size: this.size(),
      currentPosition: this.getCurrentPosition()
    }
  }
}

/**
 * 캐릭터별 MovementHistory 인스턴스 관리
 */
class MovementHistoryManager {
  constructor(defaultMaxHistory = DEFAULT_MAX_HISTORY) {
    this.histories = new Map()  // characterId -> MovementHistory
    this.defaultMaxHistory = defaultMaxHistory
  }

  /**
   * 캐릭터의 MovementHistory 반환 (없으면 생성)
   * @param {string} characterId
   * @returns {MovementHistory}
   */
  getHistory(characterId) {
    if (!this.histories.has(characterId)) {
      this.histories.set(characterId, new MovementHistory(characterId, this.defaultMaxHistory))
    }
    return this.histories.get(characterId)
  }

  /**
   * 캐릭터 위치 추가
   * @param {string} characterId
   * @param {number} x
   * @param {number} y
   * @param {number} timestamp
   */
  addPosition(characterId, x, y, timestamp = Date.now()) {
    const history = this.getHistory(characterId)
    history.addPosition(x, y, timestamp)
  }

  /**
   * 캐릭터가 이동 중인지 확인
   * @param {string} characterId
   * @returns {boolean}
   */
  isMoving(characterId) {
    const history = this.histories.get(characterId)
    return history ? history.isMoving() : false
  }

  /**
   * 캐릭터 방향 반환
   * @param {string} characterId
   * @returns {string}
   */
  getDirection(characterId) {
    const history = this.histories.get(characterId)
    return history ? history.getDirection() : 'idle'
  }

  /**
   * 캐릭터 방향 상세 반환
   * @param {string} characterId
   * @returns {string}
   */
  getDetailedDirection(characterId) {
    const history = this.histories.get(characterId)
    return history ? history.getDetailedDirection() : 'idle'
  }

  /**
   * 캐릭터 이동 벡터 반환
   * @param {string} characterId
   * @returns {Object}
   */
  calculateMovementVector(characterId) {
    const history = this.histories.get(characterId)
    return history ? history.calculateMovementVector() : { dx: 0, dy: 0, normalized: { x: 0, y: 0 } }
  }

  /**
   * 캐릭터 속도 반환
   * @param {string} characterId
   * @returns {number}
   */
  calculateSpeed(characterId) {
    const history = this.histories.get(characterId)
    return history ? history.calculateSpeed() : 0
  }

  /**
   * 캐릭터 상태 요약 반환
   * @param {string} characterId
   * @returns {Object}
   */
  getStatus(characterId) {
    const history = this.histories.get(characterId)
    return history ? history.getStatus() : { isMoving: false, direction: 'idle', detailedDirection: 'idle', speed: 0, size: 0, currentPosition: null }
  }

  /**
   * 캐릭터 히스토리 초기화
   * @param {string} characterId
   */
  clear(characterId) {
    const history = this.histories.get(characterId)
    if (history) {
      history.clear()
    }
  }

  /**
   * 캐릭터 히스토리 제거
   * @param {string} characterId
   */
  remove(characterId) {
    this.histories.delete(characterId)
  }

  /**
   * 모든 히스토리 초기화
   */
  clearAll() {
    this.histories.forEach(history => history.clear())
    this.histories.clear()
  }

  /**
   * 관리 중인 캐릭터 목록 반환
   * @returns {Array<string>}
   */
  getCharacterIds() {
    return Array.from(this.histories.keys())
  }

  /**
   * 캐릭터 수 반환
   * @returns {number}
   */
  size() {
    return this.histories.size
  }
}

// 전역 싱글톤 인스턴스
const globalMovementHistoryManager = new MovementHistoryManager()

export default MovementHistory
export { MovementHistoryManager, globalMovementHistoryManager, DEFAULT_MAX_HISTORY, MOVEMENT_THRESHOLD, DIRECTION_HISTORY_SIZE }