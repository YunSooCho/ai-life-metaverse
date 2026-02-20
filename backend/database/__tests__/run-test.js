/**
 * Character Manager Manual Test Runner
 * vitest 문제 해결 전까지 직접 실행
 */

import { getDB } from '../init.js'
import {
  initCharacterTable,
  updateCharacterPosition,
  upsertCharacter,
  getCharacter,
  getAllCharacters,
  deleteCharacter
} from '../character-manager.js'

// 색상 유틸
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
}

// 테스트 시작
console.log(colors.blue + '🧪 Character Manager Manual Test - CRITICAL #1007' + colors.reset)

// 테스트 카운터
let passed = 0
let failed = 0

function assertEqual(actual, expected, message) {
  if (JsonStringify(actual) === JsonStringify(expected)) {
    console.log(colors.green + `  ✅ ${message}` + colors.reset)
    passed++
  } else {
    console.log(colors.red + `  ❌ ${message}` + colors.reset)
    console.log(colors.red + `     Expected: ${JSON.stringify(expected)}` + colors.reset)
    console.log(colors.red + `     Actual: ${JSON.stringify(actual)}` + colors.reset)
    failed++
  }
}

function assertNotEqual(actual, notExpected, message) {
  if (JsonStringify(actual) !== JsonStringify(notExpected)) {
    console.log(colors.green + `  ✅ ${message}` + colors.reset)
    passed++
  } else {
    console.log(colors.red + `  ❌ ${message}` + colors.reset)
    failed++
  }
}

function assertDefined(value, message) {
  if (value !== undefined && value !== null) {
    console.log(colors.green + `  ✅ ${message}` + colors.reset)
    passed++
  } else {
    console.log(colors.red + `  ❌ ${message}` + colors.reset)
    failed++
  }
}

function assertNull(value, message) {
  if (value === null) {
    console.log(colors.green + `  ✅ ${message}` + colors.reset)
    passed++
  } else {
    console.log(colors.red + `  ❌ ${message}` + colors.reset)
    failed++
  }
}

// JSON 비교 유틸 (객체 순서 무시)
function JsonStringify(obj) {
  if (typeof obj !== 'object' || obj === null) {
    return JSON.stringify(obj)
  }

  const sortedKeys = Object.keys(obj).sort()
  const result = {}
  for (const key of sortedKeys) {
    result[key] = JsonStringify(obj[key])
  }

  return JSON.stringify(result)
}

// 테스트 세트 1: 캐릭터 테이블 초기화
console.log(colors.yellow + '\n📋 T1007-01: 캐릭터 테이블 초기화' + colors.reset)
try {
  initCharacterTable()
  const db = getDB()
  const tables = db.prepare(`
    SELECT name FROM sqlite_master
    WHERE type='table' AND name='characters'
  `).get()
  assertEqual(tables?.name, 'characters', '캐릭터 테이블 존재')
} catch (error) {
  console.log(colors.red + `  ❌ 에러: ${error.message}` + colors.reset)
  failed++
}

// 테스트 세트 2: 캐릭터 위치 업데이트
console.log(colors.yellow + '\n📋 T1007-02: 캐릭터 위치 업데이트' + colors.reset)
try {
  upsertCharacter({
    id: 'test-char-1',
    name: 'Test Player',
    x: 100,
    y: 100,
    room_id: 'main-plaza'
  })

  updateCharacterPosition('test-char-1', 200, 200, 'main-plaza')

  const character = getCharacter('test-char-1')
  assertEqual(character?.x, 200, 'x 좌표 업데이트')
  assertEqual(character?.y, 200, 'y 좌표 업데이트')
  assertEqual(character?.room_id, 'main-plaza', 'room_id 업데이트')
} catch (error) {
  console.log(colors.red + `  ❌ 에러: ${error.message}` + colors.reset)
  failed++
}

console.log(colors.yellow + '\n📋 T1007-03: 캐릭터가 없으면 새로 생성' + colors.reset)
try {
  updateCharacterPosition('test-char-new', 300, 300, 'main-plaza')

  const newCharacter = getCharacter('test-char-new')
  assertEqual(newCharacter?.x, 300, '새 캐릭터 x 좌표 생성')
  assertEqual(newCharacter?.y, 300, '새 캐릭터 y 좌표 생성')
} catch (error) {
  console.log(colors.red + `  ❌ 에러: ${error.message}` + colors.reset)
  failed++
}

// 테스트 세트 3: 캐릭터 조회
console.log(colors.yellow + '\n📋 T1007-04: ID로 캐릭터 조회' + colors.reset)
try {
  upsertCharacter({
    id: 'test-query-1',
    name: 'Query Player',
    x: 150,
    y: 150,
    color: '#FF0000',
    emoji: '😀'
  })

  const foundCharacter = getCharacter('test-query-1')
  assertEqual(foundCharacter?.name, 'Query Player', '캐릭터 이름 조회')
  assertEqual(foundCharacter?.color, '#FF0000', '캐릭터 색상 조회')
  assertEqual(foundCharacter?.emoji, '😀', '캐릭터 이모지 조회')
  assertEqual(foundCharacter?.is_ai, false, 'is_ai 플래그')
} catch (error) {
  console.log(colors.red + `  ❌ 에러: ${error.message}` + colors.reset)
  failed++
}

console.log(colors.yellow + '\n📋 T1007-05: 존재하지 않는 캐릭터 조회' + colors.reset)
try {
  const notFound = getCharacter('not-exists')
  assertNull(notFound, 'null 반환 확인')
} catch (error) {
  console.log(colors.red + `  ❌ 에러: ${error.message}` + colors.reset)
  failed++
}

// 테스트 세트 4: 모든 캐릭터 조회
console.log(colors.yellow + '\n📋 T1007-06: 빈 목록 조회' + colors.reset)
try {
  // 테스트 데이터 정리
  const db = getDB()
  db.exec('DELETE FROM characters')

  const characters = getAllCharacters()
  assertEqual(characters, [], '빈 목록 반환')
} catch (error) {
  console.log(colors.red + `  ❌ 에러: ${error.message}` + colors.reset)
  failed++
}

console.log(colors.yellow + '\n📋 T1007-07: 여러 캐릭터 조회' + colors.reset)
try {
  // 테스트 후 정리
  const db = getDB()
  db.exec('DELETE FROM characters')

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

  const characters = getAllCharacters()
  assertEqual(characters.length, 3, '3개 캐릭터 조회')
  assertEqual(characters[0].name, 'Player 1', '첫 번째 캐릭터 이름')
  assertEqual(characters[1].name, 'Player 2', '두 번째 캐릭터 이름')
  assertEqual(characters[2].name, 'Player 3', '세 번째 캐릭터 이름')
} catch (error) {
  console.log(colors.red + `  ❌ 에러: ${error.message}` + colors.reset)
  failed++
}

console.log(colors.yellow + '\n📋 T1007-08: is_ai 플래그 변환 확인' + colors.reset)
try {
  upsertCharacter({
    id: 'test-player',
    name: 'Human Player',
    is_ai: false
  })

  upsertCharacter({
    id: 'test-ai',
    name: 'AI Character',
    is_ai: true
  })

  const characters = getAllCharacters()
  const human = characters.find(c => c.id === 'test-player')
  const ai = characters.find(c => c.id === 'test-ai')

  assertEqual(human?.is_ai, false, 'human is_ai = false')
  assertEqual(ai?.is_ai, true, 'ai is_ai = true')
} catch (error) {
  console.log(colors.red + `  ❌ 에러: ${error.message}` + colors.reset)
  failed++
}

// 테스트 세트 5: 서버 동기화 시나리오
console.log(colors.yellow + '\n📋 T1007-09: 연속 이동 후 데이터 유지' + colors.reset)
try {
  const characterId = 'test-sync-1'

  upsertCharacter({
    id: characterId,
    name: 'Sync Player',
    x: 100,
    y: 100
  })

  // 첫 이동
  updateCharacterPosition(characterId, 200, 200, 'main-plaza')
  let character = getCharacter(characterId)
  assertEqual(character.x, 200, '첫 이동 x 좌표')
  assertEqual(character.y, 200, '첫 이동 y 좌표')

  // 두 번째 이동
  updateCharacterPosition(characterId, 300, 300, 'main-plaza')
  character = getCharacter(characterId)
  assertEqual(character.x, 300, '두 번째 이동 x 좌표')
  assertEqual(character.y, 300, '두 번째 이동 y 좌표')

  // 세 번째 이동
  updateCharacterPosition(characterId, 400, 400, 'room-2')
  character = getCharacter(characterId)
  assertEqual(character.x, 400, '세 번째 이동 x 좌표')
  assertEqual(character.y, 400, '세 번째 이동 y 좌표')
  assertEqual(character.room_id, 'room-2', '세 번째 이동 room_id')
} catch (error) {
  console.log(colors.red + `  ❌ 에러: ${error.message}` + colors.reset)
  failed++
}

console.log(colors.yellow + '\n📋 T1007-10: 다중 캐릭터 독립성' + colors.reset)
try {
  updateCharacterPosition('char-1', 100, 100, 'room-1')
  updateCharacterPosition('char-2', 200, 200, 'room-2')

  const char1 = getCharacter('char-1')
  const char2 = getCharacter('char-2')

  assertEqual(char1?.x, 100, 'char-1 x 좌표')
  assertEqual(char1?.y, 100, 'char-1 y 좌표')
  assertEqual(char1?.room_id, 'room-1', 'char-1 room_id')

  assertEqual(char2?.x, 200, 'char-2 x 좌표')
  assertEqual(char2?.y, 200, 'char-2 y 좌표')
  assertEqual(char2?.room_id, 'room-2', 'char-2 room_id')
} catch (error) {
  console.log(colors.red + `  ❌ 에러: ${error.message}` + colors.reset)
  failed++
}

// 테스트 정리
console.log(colors.yellow + '\n🧹 테스트 데이터 정리...' + colors.reset)
const db = getDB()
db.exec('DELETE FROM characters')
console.log(colors.green + '  ✅ 테스트 데이터 삭제 완료' + colors.reset)

// 결과 요약
console.log(colors.blue + '\n📊 테스트 결과 요약' + colors.reset)
console.log(colors.green + `  ✅ 통과: ${passed}` + colors.reset)
console.log(colors.red + `  ❌ 실패: ${failed}` + colors.reset)
console.log(`  📈 총합: ${passed + failed}`)

if (failed === 0) {
  console.log(colors.green + '\n🎉 모든 테스트 통과! (10/10)' + colors.reset)
  process.exit(0)
} else {
  console.log(colors.red + '\n❌ 테스트 실패! 버그 존재!' + colors.reset)
  process.exit(1)
}