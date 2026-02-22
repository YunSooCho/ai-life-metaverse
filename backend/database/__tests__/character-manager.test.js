/**
 * Character Manager Tests - CRITICAL Test #1007
 *
 * 테스트 대상:
 * 1. 캐릭터 테이블 초기화
 * 2. 캐릭터 위치 업데이트
 * 3. 캐릭터 조회
 * 4. 모든 캐릭터 조회
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { getDB } from '../init.js'
import {
  initCharacterTable,
  updateCharacterPosition,
  upsertCharacter,
  getCharacter,
  getAllCharacters,
  deleteCharacter
} from '../character-manager.js'

describe('CharacterManager - CRITICAL #1007', () => {
  beforeEach(() => {
    // 테스트 전 DB 초기화
    initCharacterTable()
  })

  afterEach(() => {
    // 테스트 후 캐릭터 삭제
    const db = getDB()
    db.exec('DELETE FROM characters')
  })

  describe('캐릭터 테이블 초기화', () => {
    it('T1007-01: 캐릭터 테이블 존재 확인', () => {
      const db = getDB()

      // 테이블 존재 확인
      const tables = db.prepare(`
        SELECT name FROM sqlite_master
        WHERE type='table' AND name='characters'
      `).get()

      expect(tables).toBeDefined()
      expect(tables.name).toBe('characters')
    })
  })

  describe('캐릭터 위치 업데이트 (move 이벤트)', () => {
    it('T1007-02: 캐릭터 생성 후 위치 업데이트', () => {
      // 캐릭터 생성
      const character = {
        id: 'test-char-1',
        name: 'Test Player',
        x: 100,
        y: 100,
        room_id: 'main-plaza'
      }

      upsertCharacter(character)

      // 위치 업데이트
      updateCharacterPosition('test-char-1', 200, 200, 'main-plaza')

      // 조회하여 위치 확인
      const updatedCharacter = getCharacter('test-char-1')

      expect(updatedCharacter).toBeDefined()
      expect(updatedCharacter.x).toBe(200)
      expect(updatedCharacter.y).toBe(200)
      expect(updatedCharacter.room_id).toBe('main-plaza')
    })

    it('T1007-03: 캐릭터가 없으면 새로 생성', () => {
      // 존재하지 않는 캐릭터 위치 업데이트
      updateCharacterPosition('test-char-new', 300, 300, 'main-plaza')

      // 조회하여 확인
      const newCharacter = getCharacter('test-char-new')

      expect(newCharacter).toBeDefined()
      expect(newCharacter.x).toBe(300)
      expect(newCharacter.y).toBe(300)
    })
  })

  describe('캐릭터 조회', () => {
    it('T1007-04: ID로 캐릭터 조회', () => {
      // 캐릭터 생성
      const character = {
        id: 'test-query-1',
        name: 'Query Player',
        x: 150,
        y: 150,
        color: '#FF0000',
        emoji: '😀'
      }

      upsertCharacter(character)

      // 조회
      const foundCharacter = getCharacter('test-query-1')

      expect(foundCharacter).toBeDefined()
      expect(foundCharacter.name).toBe('Query Player')
      expect(foundCharacter.color).toBe('#FF0000')
      expect(foundCharacter.emoji).toBe('😀')
      expect(foundCharacter.is_ai).toBe(false)
    })

    it('T1007-05: 존재하지 않는 캐릭터 조회', () => {
      const notFound = getCharacter('not-exists')

      expect(notFound).toBeNull()
    })
  })

  describe('모든 캐릭터 조회', () => {
    it('T1007-06: 빈 목록 조회', () => {
      const characters = getAllCharacters()

      expect(characters).toEqual([])
    })

    it('T1007-07: 여러 캐릭터 조회', () => {
      // 캐릭터 생성
      upsertCharacter({
        id: 'test-multi-1',
        name: 'Player 1',
        x: 100,
        y: 100
      })

      upsertCharacter({
        id: 'test-multi-2',
        name: 'Player 2',
        x: 200,
        y: 200
      })

      upsertCharacter({
        id: 'test-multi-3',
        name: 'Player 3',
        x: 300,
        y: 300
      })

      // 모든 캐릭터 조회
      const characters = getAllCharacters()

      expect(characters).toHaveLength(3)
      expect(characters[0].name).toBe('Player 1')
      expect(characters[1].name).toBe('Player 2')
      expect(characters[2].name).toBe('Player 3')
    })

    it('T1007-08: is_ai 플래그 변환 확인', () => {
      // 일반 플레이어
      upsertCharacter({
        id: 'test-player',
        name: 'Human Player',
        is_ai: false
      })

      // AI 캐릭터
      upsertCharacter({
        id: 'test-ai',
        name: 'AI Character',
        is_ai: true
      })

      const characters = getAllCharacters()

      expect(characters.length).toBeGreaterThanOrEqual(2)
      const human = characters.find(c => c.id === 'test-player')
      const ai = characters.find(c => c.id === 'test-ai')

      expect(human.is_ai).toBe(false)
      expect(ai.is_ai).toBe(true)
    })
  })

  describe('서버 동기화 시나리오', () => {
    it('T1007-09: 연속 이동 후 데이터 유지', () => {
      const characterId = 'test-sync-1'

      // 1. 초기 위치
      upsertCharacter({
        id: characterId,
        name: 'Sync Player',
        x: 100,
        y: 100
      })

      // 2. 첫 이동
      updateCharacterPosition(characterId, 200, 200, 'main-plaza')
      let character = getCharacter(characterId)
      expect(character.x).toBe(200)
      expect(character.y).toBe(200)

      // 3. 두 번째 이동
      updateCharacterPosition(characterId, 300, 300, 'main-plaza')
      character = getCharacter(characterId)
      expect(character.x).toBe(300)
      expect(character.y).toBe(300)

      // 4. 세 번째 이동
      updateCharacterPosition(characterId, 400, 400, 'room-2')
      character = getCharacter(characterId)
      expect(character.x).toBe(400)
      expect(character.y).toBe(400)
      expect(character.room_id).toBe('room-2')
    })

    it('T1007-10: 다중 캐릭터 독립성', () => {
      // 캐릭터 1
      updateCharacterPosition('char-1', 100, 100, 'room-1')
      // 캐릭터 2
      updateCharacterPosition('char-2', 200, 200, 'room-2')

      const char1 = getCharacter('char-1')
      const char2 = getCharacter('char-2')

      expect(char1.x).toBe(100)
      expect(char1.y).toBe(100)
      expect(char1.room_id).toBe('room-1')

      expect(char2.x).toBe(200)
      expect(char2.y).toBe(200)
      expect(char2.room_id).toBe('room-2')
    })
  })
})