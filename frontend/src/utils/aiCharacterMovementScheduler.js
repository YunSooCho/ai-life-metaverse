/**
 * AI Character Movement Scheduler v1.0
 *
 * AI 캐릭터(유리, 히카리)가 시간대별로 자동으로 건물을 방문하고 산책하는 시스템
 */

// 시간대별 행동 패턴
const TIME_BEHAVIORS = {
  DAWN: {      // 5-7시
    locations: ['cafe', 'park'],
    probability: { cafe: 0.7, park: 0.3 },
    idleTime: 5000 // 5분
  },
  MORNING: {   // 7-12시
    locations: ['cafe', 'library'],
    probability: { cafe: 0.6, library: 0.4 },
    idleTime: 8000 // 8분
  },
  AFTERNOON: { // 12-17시
    locations: ['park', 'cafe'],
    probability: { park: 0.7, cafe: 0.3 },
    idleTime: 6000 // 6분
  },
  EVENING: {  // 17-20시
    locations: ['library', 'cafe'],
    probability: { library: 0.6, cafe: 0.4 },
    idleTime: 10000 // 10분
  },
  NIGHT: {    // 20-5시
    locations: ['home'],
    probability: { home: 1.0 },
    idleTime: 30000 // 30분
  }
}

// 건물 기준 위치 (map 기준)
const BUILDING_LOCATIONS = {
  cafe: { x: 300, y: 400, name: 'Cafe' },
  library: { x: 600, y: 300, name: 'Library' },
  park: { x: 500, y: 600, name: 'Park' },
  home: { x: 400, y: 500, name: 'Home' }
}

/**
 * AI 캐릭터 이동 스케줄러
 */
export class AiCharacterMovementScheduler {
  constructor(aiCharacters, onMove, onArrive) {
    this.aiCharacters = aiCharacters || []
    this.onMove = onMove // 이동 콜백: (charId, newX, newY) => void
    this.onArrive = onArrive // 도착 콜백: (charId, building) => void
    this.schedules = new Map() // charId -> Schedule
    this.intervals = new Map() // charId -> intervalId
    this.isRunning = false
  }

  /**
   * 스케줄러 시작
   */
  start() {
    if (this.isRunning) return
    this.isRunning = true

    this.aiCharacters.forEach(char => {
      if (char.isAi) {
        this.startSchedule(char.id)
      }
    })
  }

  /**
   * 스케줄러 정지
   */
  stop() {
    this.isRunning = false
    this.intervals.forEach(interval => clearInterval(interval))
    this.intervals.clear()
  }

  /**
   * 캐릭터별 스케줄 시작
   */
  startSchedule(charId) {
    if (this.intervals.has(charId)) return

    // 초기 위치 설정
    const currentSchedule = this.createSchedule(charId)
    this.schedules.set(charId, currentSchedule)

    // 첫 이동 시작
    this.executeMovement(charId)

    // 주기적 체크 (10초마다)
    const interval = setInterval(() => this.checkSchedule(charId), 10000)
    this.intervals.set(charId, interval)
  }

  /**
   * 캐릭터별 스케줄 정지
   */
  stopSchedule(charId) {
    const interval = this.intervals.get(charId)
    if (interval) {
      clearInterval(interval)
      this.intervals.delete(charId)
    }
    this.schedules.delete(charId)
  }

  /**
   * 스케줄 생성
   */
  createSchedule(charId) {
    const char = this.aiCharacters.find(c => c.id === charId)
    const timePeriod = this.getCurrentTimePeriod()

    return {
      charId,
      targetBuilding: this.selectTargetBuilding(timePeriod),
      currentPos: { x: char?.x || 400, y: char?.y || 500 },
      isMoving: false,
      lastMoveTime: Date.now(),
      idleUntil: Date.now()
    }
  }

  /**
   * 현재 시간대 계산 (0-23)
   */
  getCurrentTimePeriod() {
    const hour = new Date().getHours()

    if (hour >= 5 && hour < 7) return 'DAWN'
    if (hour >= 7 && hour < 12) return 'MORNING'
    if (hour >= 12 && hour < 17) return 'AFTERNOON'
    if (hour >= 17 && hour < 20) return 'EVENING'
    return 'NIGHT'
  }

  /**
   * 확률 기반 목표 건물 선택
   */
  selectTargetBuilding(timePeriod) {
    const behavior = TIME_BEHAVIORS[timePeriod]
    const rand = Math.random()

    let cumulative = 0
    for (const [location, prob] of Object.entries(behavior.probability)) {
      cumulative += prob
      if (rand < cumulative) return location
    }

    return behavior.locations[0] // fallback
  }

  /**
   * 스케줄 체크 (주기적)
   */
  checkSchedule(charId) {
    const schedule = this.schedules.get(charId)
    if (!schedule || schedule.isMoving) return // 이동 중이면 스킵

    const now = Date.now()
    const timePeriod = this.getCurrentTimePeriod()

    // Idle 시간이 지났으면 새로운 건물로 이동
    if (now >= schedule.idleUntil) {
      schedule.targetBuilding = this.selectTargetBuilding(timePeriod)
      this.executeMovement(charId)
    }
  }

  /**
   * 이동 실행
   */
  executeMovement(charId) {
    const schedule = this.schedules.get(charId)
    if (!schedule || schedule.isMoving) return

    const targetLocation = BUILDING_LOCATIONS[schedule.targetBuilding]
    if (!targetLocation) return

    schedule.isMoving = true
    schedule.lastMoveTime = Date.now()
    schedule.currentPos = { ...schedule.currentPos }
    schedule.targetPos = { x: targetLocation.x, y: targetLocation.y }

    // 이동 시작 콜백
    if (this.onMove) {
      this.onMove(charId, schedule.currentPos.x, schedule.currentPos.y)
    }

    // 이동 애니메이션 시작
    this.animateMovement(charId, schedule)
  }

  /**
   * 이동 애니메이션 (Linear interpolation)
   */
  animateMovement(charId, schedule) {
    const startTime = Date.now()
    const duration = 5000 // 5초에 걸쳐 이동
    const startX = schedule.currentPos.x
    const startY = schedule.currentPos.y
    const targetX = schedule.targetPos.x
    const targetY = schedule.targetPos.y
    const char = this.aiCharacters.find(c => c.id === charId)

    const animate = () => {
      if (!this.isRunning || !schedule.isMoving) return

      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1.0)

      // 캐릭터 위치 업데이트
      const newX = startX + (targetX - startX) * progress
      const newY = startY + (targetY - startY) * progress

      if (char) {
        char.x = newX
        char.y = newY
      }

      // 콜백으로 위치 전달
      if (this.onMove) {
        this.onMove(charId, newX, newY)
      }

      if (progress < 1.0) {
        requestAnimationFrame(animate)
      } else {
        // 도착
        this.onCharacterArrive(charId, schedule)
      }
    }

    requestAnimationFrame(animate)
  }

  /**
   * 캐릭터 도착 처리
   */
  onCharacterArrive(charId, schedule) {
    schedule.isMoving = false
    schedule.currentPos = { ...schedule.targetPos }

    const timePeriod = this.getCurrentTimePeriod()
    const behavior = TIME_BEHAVIORS[timePeriod]
    schedule.idleUntil = Date.now() + behavior.idleTime

    // 도착 이벤트 발생
    if (this.onArrive) {
      this.onArrive(charId, schedule.targetBuilding)
    }
  }

  /**
   * 캐릭터 추가/업데이트
   */
  addCharacter(char) {
    if (!char.isAi) return

    const existingIndex = this.aiCharacters.findIndex(c => c.id === char.id)
    if (existingIndex >= 0) {
      this.aiCharacters[existingIndex] = char
    } else {
      this.aiCharacters.push(char)
      if (this.isRunning) {
        this.startSchedule(char.id)
      }
    }
  }

  /**
   * 캐릭터 제거
   */
  removeCharacter(charId) {
    this.stopSchedule(charId)
    this.aiCharacters = this.aiCharacters.filter(c => c.id !== charId)
  }
}

// 싱글톤 인스턴스
export const aiMovementScheduler = new AiCharacterMovementScheduler()

// 내보내기
export { BUILDING_LOCATIONS, TIME_BEHAVIORS }