/**
 * Database Initialization - SQLite
 *
 * Tables:
 * - chat_logs: 채팅 로그 영구 저장
 * - ai_relationships: AI 관계성 (호감도, 대화 빈도, 토픽)
 * - ai_conversation_topics: AI 간 대화 토픽 추적
 */

import Database from 'better-sqlite3'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// DB 파일 경로
const DB_PATH = path.join(__dirname, 'ai-life.db')

// DB 열기
const db = new Database(DB_PATH)

// 쿼리 실행 헬퍼
function run(sql, params = []) {
  const stmt = db.prepare(sql)
  return stmt.run(params)
}

// 테이블 초기화
export function initDatabase() {
  console.log('🗄️  DB 초기화 시작...')

  // 1. chat_logs 테이블
  run(`
    CREATE TABLE IF NOT EXISTS chat_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      room_id TEXT NOT NULL,
      sender_id TEXT NOT NULL,
      character_name TEXT NOT NULL,
      message TEXT NOT NULL,
      timestamp INTEGER NOT NULL,
      persona_type TEXT,
      is_ai BOOLEAN NOT NULL DEFAULT 0
    )
  `)

  // 인덱스 생성 (성능 향상)
  run(`CREATE INDEX IF NOT EXISTS idx_chat_logs_room_id ON chat_logs(room_id)`)
  run(`CREATE INDEX IF NOT EXISTS idx_chat_logs_timestamp ON chat_logs(timestamp)`)
  run(`CREATE INDEX IF NOT EXISTS idx_chat_logs_sender_id ON chat_logs(sender_id)`)

  console.log('✅ chat_logs 테이블 생성 완료')

  // 2. ai_relationships 테이블
  run(`
    CREATE TABLE IF NOT EXISTS ai_relationships (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      char_id_1 TEXT NOT NULL,
      char_id_2 TEXT NOT NULL,
      conversation_count INTEGER DEFAULT 0,
      affinity_score REAL DEFAULT 0,
      last_conversation INTEGER,
      common_topics TEXT,  -- JSON 문자열
      mood TEXT DEFAULT 'neutral',
      created_at INTEGER DEFAULT (strftime('%s', 'now')),
      updated_at INTEGER DEFAULT (strftime('%s', 'now')),
      UNIQUE(char_id_1, char_id_2)
    )
  `)

  run(`CREATE INDEX IF NOT EXISTS idx_ai_relationships_char_id_1 ON ai_relationships(char_id_1)`)
  run(`CREATE INDEX IF NOT EXISTS idx_ai_relationships_char_id_2 ON ai_relationships(char_id_2)`)

  console.log('✅ ai_relationships 테이블 생성 완료')

  // 3. ai_conversation_topics 테이블
  run(`
    CREATE TABLE IF NOT EXISTS ai_conversation_topics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      char_id_1 TEXT NOT NULL,
      char_id_2 TEXT NOT NULL,
      topic TEXT NOT NULL,
      count INTEGER DEFAULT 1,
      last_mentioned INTEGER DEFAULT (strftime('%s', 'now')),
      UNIQUE(char_id_1, char_id_2, topic)
    )
  `)

  run(`CREATE INDEX IF NOT EXISTS idx_ai_conversation_topics_char_id_1 ON ai_conversation_topics(char_id_1)`)
  run(`CREATE INDEX IF NOT EXISTS idx_ai_conversation_topics_char_id_2 ON ai_conversation_topics(char_id_2)`)
  run(`CREATE INDEX IF NOT EXISTS idx_ai_conversation_topics_topic ON ai_conversation_topics(topic)`)

  console.log('✅ ai_conversation_topics 테이블 생성 완료')

  console.log('🎉 DB 초기화 완료!')
}

// DB 연결 반환
export function getDB() {
  return db
}

// DB 닫기
export function closeDB() {
  db.close()
  console.log('🗄️  DB 닫기 완료')
}