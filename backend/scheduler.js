/**
 * Scheduler Module
 * 자정에 일일 퀘스트 리셋 및 정기 작업 스케줄링
 */

import { resetDailyQuests, updateDailyQuestProgress } from './quest.js'
import { io } from './server.js'

// 스케줄러 상태
let schedulerState = {
  isRunning: false,
  lastDailyReset: null,
  lastWeeklyReset: null,
  dailyResetInterval: null,
  weeklyResetInterval: null
}

/**
 * 다음 자정까지의 시간 계산 (밀리초)
 */
function getTimeUntilMidnight() {
  const now = new Date()
  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(0, 0, 0, 0)
  return tomorrow.getTime() - now.getTime()
}

/**
 * 다음 월요일 0시까지의 시간 계산 (밀리초)
 */
function getTimeUntilMondayMidnight() {
  const now = new Date()
  const daysUntilMonday = (1 + 7 - now.getDay()) % 7 || 7
  const nextMonday = new Date(now)
  nextMonday.setDate(nextMonday.getDate() + daysUntilMonday)
  nextMonday.setHours(0, 0, 0, 0)
  return nextMonday.getTime() - now.getTime()
}

/**
 * 모든 플레이어의 일일 퀘스트 리셋
 * 사용자 목록을 Socket.io 연결에서 가져옴
 */
function resetAllDailyQuests() {
  const now = new Date()
  const jstDate = now.toLocaleDateString('ja-JP', { timeZone: 'Asia/Tokyo' })
  const timestamp = now.toISOString()

  console.log(`🔄 [SCHEDULER] 일일 퀘스트 리셋 시작: ${timestamp} (JST: ${jstDate})`)

  // Socket.io 연결된 모든 플레이어 처리
  const connectedPlayers = io?.sockets?.adapter?.rooms || new Map()

  // 리셋된 플레이어 목록
  const resetPlayers = []

  // 모든 플레이어의 일일 퀘스트 리셋
  // TODO: 플레이어 목록을 데이터베이스/Redis에서 가져오기
  // 현재는 연결된 플레이어만 처리
  for (const [socketId, socket] of io?.sockets?.sockets || new Map()) {
    const characterId = socket.handshake?.auth?.characterId

    if (characterId) {
      resetDailyQuests(characterId)
      resetPlayers.push(characterId)

      // 클라이언트에 새로운 일일 퀘스트 푸시
      socket.emit('dailyQuestsReset', {
        date: jstDate,
        timestamp: timestamp,
        message: '일일 퀘스트가 리셋되었습니다!'
      })
    }
  }

  // Redis에 리셋 기록
  // TODO: Redis 클라이언트로 리셋 기록 저장
  // redis.set('scheduler:last_daily_reset', timestamp)

  schedulerState.lastDailyReset = timestamp

  console.log(`✅ [SCHEDULER] 일일 퀘스트 리셋 완료: ${resetPlayers.length}명의 플레이어`)
  console.log(`   - 플레이어: ${resetPlayers.join(', ') || '없음'}`)

  return {
    success: true,
    date: jstDate,
    timestamp: timestamp,
    resetCount: resetPlayers.length,
    players: resetPlayers
  }
}

/**
 * 주간 퀘스트 리셋 (매주 월요일 0시)
 */
function resetAllWeeklyQuests() {
  const now = new Date()
  const jstDate = now.toLocaleDateString('ja-JP', { timeZone: 'Asia/Tokyo' })
  const timestamp = now.toISOString()

  console.log(`🔄 [SCHEDULER] 주간 퀘스트 리셋 시작: ${timestamp} (JST: ${jstDate})`)

  // TODO: 주간 퀘스트 시스템 구현 후 weeklyQuestManager.resetAllWeeklyQuests() 호출
  console.log(`⏳ [SCHEDULER] 주간 퀘스트 시스템 구현 필요`)

  schedulerState.lastWeeklyReset = timestamp

  return {
    success: true,
    date: jstDate,
    timestamp: timestamp,
    resetCount: 0,
    players: []
  }
}

/**
 * 자정 타이머 설정 및 실행
 */
function scheduleDailyReset() {
  const timeUntilMidnight = getTimeUntilMidnight()

  console.log(`⏰ [SCHEDULER] 다음 일일 퀘스트 리셋 예정: ${Math.floor(timeUntilMidnight / 1000 / 60)}분 후`)

  // 첫 리셋 예약
  setTimeout(() => {
    resetAllDailyQuests()

    // 그 후 매 24시간마다 리셋
    schedulerState.dailyResetInterval = setInterval(() => {
      resetAllDailyQuests()
    }, 24 * 60 * 60 * 1000) // 24시간
  }, timeUntilMidnight)
}

/**
 * 주간 리셋 타이머 설정 및 실행
 */
function scheduleWeeklyReset() {
  const timeUntilMonday = getTimeUntilMondayMidnight()

  console.log(`⏰ [SCHEDULER] 다음 주간 퀘스트 리셋 예정: ${Math.floor(timeUntilMonday / 1000 / 60 / 60)}시간 후`)

  // 첫 리셋 예약
  setTimeout(() => {
    resetAllWeeklyQuests()

    // 그 후 매 7일마다 리셋
    schedulerState.weeklyResetInterval = setInterval(() => {
      resetAllWeeklyQuests()
    }, 7 * 24 * 60 * 60 * 1000) // 7일
  }, timeUntilMonday)
}

/**
 * 스케줄러 시작
 */
export function startScheduler() {
  if (schedulerState.isRunning) {
    console.log('⚠️ [SCHEDULER] 스케줄러가 이미 실행 중입니다.')
    return { success: false, error: 'Scheduler already running' }
  }

  console.log('🚀 [SCHEDULER] 스케줄러 시작...')

  // 일일 퀘스트 리셋 예약
  scheduleDailyReset()

  // 주간 퀘스트 리셋 예약
  scheduleWeeklyReset()

  schedulerState.isRunning = true

  console.log('✅ [SCHEDULER] 스케줄러 시작 완료')

  return {
    success: true,
    state: schedulerState
  }
}

/**
 * 스케줄러 정지
 */
export function stopScheduler() {
  if (!schedulerState.isRunning) {
    console.log('⚠️ [SCHEDULER] 스케줄러가 실행 중이 아닙니다.')
    return { success: false, error: 'Scheduler not running' }
  }

  console.log('🛑 [SCHEDULER] 스케줄러 정지...')

  // 타이머 정리
  if (schedulerState.dailyResetInterval) {
    clearInterval(schedulerState.dailyResetInterval)
    schedulerState.dailyResetInterval = null
  }

  if (schedulerState.weeklyResetInterval) {
    clearInterval(schedulerState.weeklyResetInterval)
    schedulerState.weeklyResetInterval = null
  }

  schedulerState.isRunning = false

  console.log('✅ [SCHEDULER] 스케줄러 정지 완료')

  return {
    success: true,
    state: schedulerState
  }
}

/**
 * 스케줄러 상태 조회
 */
export function getSchedulerStatus() {
  return {
    ...schedulerState,
    nextDailyReset: new Date(Date.now() + getTimeUntilMidnight()).toISOString(),
    nextWeeklyReset: new Date(Date.now() + getTimeUntilMondayMidnight()).toISOString()
  }
}

/**
 * 수동으로 일일 퀘스트 리셋 실행 (테스트용)
 */
export function manualDailyReset(characterId = null) {
  if (characterId) {
    // 특정 플레이어만 리셋
    const result = resetDailyQuests(characterId)
    console.log(`🔄 [SCHEDULER] 수동 리셋: ${characterId}`)
    return result
  } else {
    // 모든 플레이어 리셋
    return resetAllDailyQuests()
  }
}

/**
 * 수동으로 주간 퀘스트 리셋 실행 (테스트용)
 */
export function manualWeeklyReset(characterId = null) {
  if (characterId) {
    // 특정 플레이어만 리셋
    // TODO: 주간 퀘스트 시스템 구현 후 resetWeeklyQuests(characterId) 호출
    console.log(`🔄 [SCHEDULER] 수동 주간 리셋: ${characterId}`)
    return { success: true }
  } else {
    // 모든 플레이어 리셋
    return resetAllWeeklyQuests()
  }
}

export default {
  startScheduler,
  stopScheduler,
  getSchedulerStatus,
  manualDailyReset,
  manualWeeklyReset
}