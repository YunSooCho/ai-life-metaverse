/**
 * Character Manager - 캐릭터 데이터 영구 저장
 *
 * Tables:
 * - characters: 캐릭터 데이터 (위치, 색상, 이모지 등)
 */

import { getDB } from './init.js'

// 캐릭터 테이블 초기화
export function initCharacterTable() {
  const db = getDB()

  db.exec(`
    CREATE TABLE IF NOT EXISTS characters (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      color TEXT DEFAULT '#4CAF50',
      emoji TEXT DEFAULT '😊',
      x REAL DEFAULT 400,
      y REAL DEFAULT 300,
      room_id TEXT DEFAULT 'main-plaza',
      level INTEGER DEFAULT 1,
      exp INTEGER DEFAULT 0,
      hp INTEGER DEFAULT 100,
      affinity INTEGER DEFAULT 0,
      charisma INTEGER DEFAULT 0,
      intelligence INTEGER DEFAULT 0,
      is_ai BOOLEAN NOT NULL DEFAULT 0,
      created_at INTEGER DEFAULT (strftime('%s', 'now')),
      updated_at INTEGER DEFAULT (strftime('%s', 'now'))
    )
  `)

  // 인덱스 생성 (성능 향상)
  db.exec(`CREATE INDEX IF NOT EXISTS idx_characters_room_id ON characters(room_id)`)
  db.exec(`CREATE INDEX IF NOT EXISTS idx_characters_is_ai ON characters(is_ai)`)

  console.log('✅ characters 테이블 생성 완료')
}

// 캐릭터 위치 업데이트 (이동 시 호출)
export function updateCharacterPosition(characterId, x, y, roomId) {
  const db = getDB()

  const stmt = db.prepare(`
    UPDATE characters
    SET x = ?, y = ?, room_id = ?, updated_at = strftime('%s', 'now')
    WHERE id = ?
  `)

  const result = stmt.run(x, y, roomId, characterId)

  if (result.changes === 0) {
    // 캐릭터가 없으면 새로 생성
    return upsertCharacter({
      id: characterId,
      x,
      y,
      room_id: roomId
    })
  }

  return result
}

// 캐릭터 데이터 업데이트 (전체 데이터)
export function upsertCharacter(character) {
  const db = getDB()

  const stmt = db.prepare(`
    INSERT OR REPLACE INTO characters (
      id, name, color, emoji, x, y, room_id, level, exp, hp, affinity, charisma, intelligence, is_ai
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

  return stmt.run(
    character.id,
    character.name || 'Player',
    character.color || '#4CAF50',
    character.emoji || '😊',
    character.x || 400,
    character.y || 300,
    character.room_id || 'main-plaza',
    character.level || 1,
    character.exp || 0,
    character.hp || 100,
    character.affinity || 0,
    character.charisma || 0,
    character.intelligence || 0,
    character.is_ai ? 1 : 0
  )
}

// 캐릭터 조회 (ID 기준)
export function getCharacter(characterId) {
  const db = getDB()

  const stmt = db.prepare(`
    SELECT
      id, name, color, emoji, x, y, room_id,
      level, exp, hp, affinity, charisma, intelligence,
      is_ai, created_at, updated_at
    FROM characters
    WHERE id = ?
  `)

  const character = stmt.get(characterId)

  if (!character) {
    return null
  }

  // is_ai 플래그 변환 (0/1 → boolean)
  character.is_ai = !!character.is_ai

  return character
}

// 모든 캐릭터 조회
export function getAllCharacters() {
  const db = getDB()

  const stmt = db.prepare(`
    SELECT
      id, name, color, emoji, x, y, room_id,
      level, exp, hp, affinity, charisma, intelligence,
      is_ai, created_at, updated_at
    FROM characters
    ORDER BY updated_at DESC
  `)

  const characters = stmt.all()

  // is_ai 플래그 변환 (0/1 → boolean)
  return characters.map(char => ({
    ...char,
    is_ai: !!char.is_ai
  }))
}

// 방 별 캐릭터 조회
export function getCharactersByRoom(roomId) {
  const db = getDB()

  const stmt = db.prepare(`
    SELECT
      id, name, color, emoji, x, y, room_id,
      level, exp, hp, affinity, charisma, intelligence,
      is_ai, created_at, updated_at
    FROM characters
    WHERE room_id = ?
    ORDER BY updated_at DESC
  `)

  const characters = stmt.all(roomId)

  return characters.map(char => ({
    ...char,
    is_ai: !!char.is_ai
  }))
}

// 캐릭터 삭제
export function deleteCharacter(characterId) {
  const db = getDB()

  const stmt = db.prepare(`
    DELETE FROM characters
    WHERE id = ?
  `)

  return stmt.run(characterId)
}