/**
 * AI Relationship Manager - AI 간 관계성 관리
 *
 * 다음을 추적:
 * - 호감도 (0-10)
 * - 대화 빈도
 * - 공통 주제
 * - 감정 상태 (friendly/professional/rival)
 */

import { getDB } from './init.js'

const db = getDB()

/**
 * AI 관계성 초기화
 */
export function initAIRelationship(charId1, charId2) {
  // 작은 순서로 정렬 (중복 방지)
  const [id1, id2] = [charId1, charId2].sort()

  const stmt = db.prepare(`
    INSERT OR IGNORE INTO ai_relationships (char_id_1, char_id_2, conversation_count, affinity_score, last_conversation)
    VALUES (?, ?, 0, 0, NULL)
  `)

  const result = stmt.run(id1, id2)

  console.log('🤝 AI 관계성 초기화:', id1, '-', id2, `(ID: ${result.lastInsertRowid})`)

  return result
}

/**
 * 대화 증가
 */
export function incrementConversation(charId1, charId2) {
  const [id1, id2] = [charId1, charId2].sort()

  const stmt = db.prepare(`
    UPDATE ai_relationships
    SET conversation_count = conversation_count + 1,
        last_conversation = strftime('%s', 'now'),
        updated_at = strftime('%s', 'now')
    WHERE char_id_1 = ? AND char_id_2 = ?
  `)

  const result = stmt.run(id1, id2)

  if (result.changes === 0) {
    // 관계가 없으면 초기화 후 다시 증가
    initAIRelationship(id1, id2)
    return incrementConversation(id1, id2)
  }

  console.log('💬 대화 증가:', id1, '-', id2, `(Count: +1)`)

  return result
}

/**
 * 호감도 증가/감소
 */
export function updateAffinity(charId1, charId2, delta) {
  const [id1, id2] = [charId1, charId2].sort()

  const stmt = db.prepare(`
    UPDATE ai_relationships
    SET affinity_score = affinity_score + ?,
        updated_at = strftime('%s', 'now')
    WHERE char_id_1 = ? AND char_id_2 = ?
  `)

  const result = stmt.run(delta, id1, id2)

  if (result.changes > 0) {
    // 호감도 0-10 사이로 제한
    const clampStmt = db.prepare(`
      UPDATE ai_relationships
      SET affinity_score = CASE
        WHEN affinity_score < 0 THEN 0
        WHEN affinity_score > 10 THEN 10
        ELSE affinity_score
      END
      WHERE char_id_1 = ? AND char_id_2 = ?
    `)

    clampStmt.run(id1, id2)

    console.log('💖 호감도 업데이트:', id1, '-', id2, `(Delta: ${delta})`)
  }

  return result
}

/**
 * 관계성 조회
 */
export function getRelationship(charId1, charId2) {
  const [id1, id2] = [charId1, charId2].sort()

  const stmt = db.prepare(`
    SELECT * FROM ai_relationships
    WHERE char_id_1 = ? AND char_id_2 = ?
  `)

  const result = stmt.get(id1, id2)

  if (result && result.common_topics) {
    result.common_topics = JSON.parse(result.common_topics)
  }

  return result
}

/**
 * 모든 AI 관계성 조회
 */
export function getAllRelationships() {
  const stmt = db.prepare('SELECT * FROM ai_relationships ORDER BY affinity_score DESC')

  const results = stmt.all()

  return results.map(r => ({
    ...r,
    common_topics: r.common_topics ? JSON.parse(r.common_topics) : []
  }))
}

/**
 * 공통 주제 추가
 */
export function addCommonTopic(charId1, charId2, topic) {
  const [id1, id2] = [charId1, charId2].sort()

  // 관계성 조회
  const relationship = getRelationship(id1, id2)

  if (!relationship) {
    initAIRelationship(id1, id2)
    return addCommonTopic(id1, id2, topic)
  }

  // 공통 주제 업데이트
  const commonTopics = relationship.common_topics || []

  if (!commonTopics.includes(topic)) {
    commonTopics.push(topic)

    const stmt = db.prepare(`
      UPDATE ai_relationships
      SET common_topics = ?,
          updated_at = strftime('%s', 'now')
      WHERE char_id_1 = ? AND char_id_2 = ?
    `)

    stmt.run(JSON.stringify(commonTopics), id1, id2)

    console.log('🏷️  공통 주제 추가:', id1, '-', id2, `→ ${topic}`)
  }

  return getRelationship(id1, id2)
}

/**
 * 감정 상태 업데이트
 */
export function updateMood(charId1, charId2, mood) {
  const [id1, id2] = [charId1, charId2].sort()

  const stmt = db.prepare(`
    UPDATE ai_relationships
    SET mood = ?,
        updated_at = strftime('%s', 'now')
    WHERE char_id_1 = ? AND char_id_2 = ?
  `)

  const result = stmt.run(mood, id1, id2)

  console.log('😊 감정 상태 업데이트:', id1, '-', id2, `→ ${mood}`)

  return result
}

/**
 * AI 관계성 통계
 */
export function getRelationshipStats() {
  const totalStmt = db.prepare('SELECT COUNT(*) as count FROM ai_relationships')
  const friendshipsStmt = db.prepare("SELECT COUNT(*) as count FROM ai_relationships WHERE mood = 'friendly'")
  const rivalriesStmt = db.prepare("SELECT COUNT(*) as count FROM ai_relationships WHERE mood = 'rival'")

  const total = totalStmt.get()
  const friendships = friendshipsStmt.get()
  const rivalries = rivalriesStmt.get()

  return {
    totalRelationships: total.count,
    friendships: friendships.count,
    rivalries: rivalries.count
  }
}