/**
 * Chat Log Manager - 채팅 로그 저장 및 조회
 */

import { getDB } from './init.js'

const db = getDB()

/**
 * 채팅 로그 저장
 */
export function saveChatLog(log) {
  const { room_id, sender_id, character_name, message, timestamp, persona_type, is_ai } = log

  const stmt = db.prepare(`
    INSERT INTO chat_logs (room_id, sender_id, character_name, message, timestamp, persona_type, is_ai)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `)

  const result = stmt.run(room_id, sender_id, character_name, message, timestamp, persona_type, is_ai ? 1 : 0)

  console.log('💬 채팅 로그 저장:', character_name, '→', message.substring(0, 50), `(ID: ${result.lastInsertRowid})`)

  return result
}

/**
 * 방별 채팅 로그 조회 (최근 N개)
 */
export function getChatLogsByRoom(roomId, limit = 50) {
  const stmt = db.prepare(`
    SELECT *
    FROM chat_logs
    WHERE room_id = ?
    ORDER BY timestamp DESC
    LIMIT ?
  `)

  const logs = stmt.all(roomId, limit)

  // 시간순 정렬 (오래된 순)
  return logs.reverse()
}

/**
 * 캐릭터별 채팅 로그 조회
 */
export function getChatLogsByCharacter(characterId, limit = 100) {
  const stmt = db.prepare(`
    SELECT *
    FROM chat_logs
    WHERE sender_id = ?
    ORDER BY timestamp DESC
    LIMIT ?
  `)

  const logs = stmt.all(characterId, limit)

  return logs.reverse()
}

/**
 * AI 간 채팅 로그 조회
 */
export function getAIChatLogs(characterId1, characterId2, roomId, limit = 50) {
  const stmt = db.prepare(`
    SELECT *
    FROM chat_logs
    WHERE room_id = ?
      AND ((sender_id = ?) OR (sender_id = ?))
      AND is_ai = 1
    ORDER BY timestamp DESC
    LIMIT ?
  `)

  const logs = stmt.all(roomId, characterId1, characterId2, limit)

  return logs.reverse()
}

/**
 * 전체 채팅 로그 통계
 */
export function getChatLogStats() {
  const totalLogsStmt = db.prepare('SELECT COUNT(*) as count FROM chat_logs')
  const totalAIStmt = db.prepare('SELECT COUNT(*) as count FROM chat_logs WHERE is_ai = 1')
  const totalPlayerStmt = db.prepare('SELECT COUNT(*) as count FROM chat_logs WHERE is_ai = 0')

  const totalLogs = totalLogsStmt.get()
  const totalAI = totalAIStmt.get()
  const totalPlayer = totalPlayerStmt.get()

  return {
    totalLogs: totalLogs.count,
    totalAIMessages: totalAI.count,
    totalPlayerMessages: totalPlayer.count
  }
}

/**
 * 채팅 로그 삭제 (오래된 로그 - 30일 이상)
 */
export function cleanupOldLogs(daysToKeep = 30) {
  const cutoffTime = Date.now() - (daysToKeep * 24 * 60 * 60 * 1000)

  const stmt = db.prepare(`
    DELETE FROM chat_logs
    WHERE timestamp < ?
  `)

  const result = stmt.run(cutoffTime)

  console.log('🧹 오래된 채팅 로그 삭제:', result.changes, '개')

  return result
}