#!/usr/bin/env node

/**
 * MovementHistory 테스트 실행 스크립트
 */

import MovementHistory, { MovementHistoryManager, globalMovementHistoryManager } from './src/utils/MovementHistory.js'

console.log('🧪 MovementHistory 테스트 시작...\n')

let passed = 0
let failed = 0

function assert(condition, message) {
  if (condition) {
    console.log(`✅ ${message}`)
    passed++
  } else {
    console.log(`❌ ${message}`)
    failed++
  }
}

console.log('1. 위치 추가 및 히스토리 크기 제한 테스트')
const history = new MovementHistory('test-char', 5)
history.addPosition(100, 200)
assert(history.size() === 1, '첫 위치 추가')
assert(history.getCurrentPosition().x === 100, '현재 위치 확인')

// 히스토리 크기 제한 테스트
for (let i = 0; i < 10; i++) {
  history.addPosition(100 + i * 10, 200 + i * 10)
}
assert(history.size() === 5, 'MaxHistory 크기 제한 (5개)')

console.log('\n2. 이동 임계값 무시 테스트')
const history2 = new MovementHistory('test-char-2')
history2.addPosition(100, 200)
history2.addPosition(100.1, 200.1)  // 임계값 이하
assert(history2.size() === 1, '임계값 이하 이동 무시')
history2.addPosition(105, 205)  // 임계값 이상
assert(history2.size() === 2, '임계값 이상 이동 추가')

console.log('\n3. 이동 감지 테스트')
const history3 = new MovementHistory('test-char-3')
assert(history3.isMoving() === false, '히스토리 없음 → 이동 중 아님')
history3.addPosition(100, 200)
assert(history3.isMoving() === false, '위치 1개 → 이동 중 아님')
history3.addPosition(110, 210)
history3.addPosition(120, 220)
assert(history3.isMoving() === true, '연속 이동 → 이동 중')

console.log('\n4. 이동 벡터 계산 테스트')
const history4 = new MovementHistory('test-char-4')
history4.addPosition(0, 0)
history4.addPosition(10, 0)
const vector1 = history4.calculateMovementVector()
assert(vector1.dx === 10, '오른쪽 이동 벡터 dx=10')
assert(vector1.normalized.x === 1, '오른쪽 이동 정규화 x=1')

const history5 = new MovementHistory('test-char-5')
history5.addPosition(0, 0)
history5.addPosition(10, 10)
const vector2 = history5.calculateMovementVector()
assert(Math.abs(vector2.normalized.x - 0.707) < 0.01, '대각선 정규화 x≈0.707')
assert(Math.abs(vector2.normalized.y - 0.707) < 0.01, '대각선 정규화 y≈0.707')

console.log('\n5. 방향 결정 테스트')
const history6 = new MovementHistory('test-char-6')
history6.addPosition(100, 200)
history6.addPosition(110, 200)
assert(history6.getDirection() === 'right', '오른쪽 이동 → right')

const history7 = new MovementHistory('test-char-7')
history7.addPosition(100, 200)
history7.addPosition(90, 200)
assert(history7.getDirection() === 'left', '왼쪽 이동 → left')

const history8 = new MovementHistory('test-char-8')
history8.addPosition(100, 200)
history8.addPosition(100, 190)
assert(history8.getDirection() === 'up', '위쪽 이동 → up')

const history9 = new MovementHistory('test-char-9')
history9.addPosition(100, 200)
history9.addPosition(100, 210)
assert(history9.getDirection() === 'down', '아래쪽 이동 → down')

console.log('\n6. 상세 방향 결정 (8방향) 테스트')
const history10 = new MovementHistory('test-char-10')
history10.addPosition(100, 200)
history10.addPosition(110, 190)
assert(history10.getDetailedDirection() === 'up-right', '오른쪽 위 대각선 → up-right')

const history11 = new MovementHistory('test-char-11')
history11.addPosition(100, 200)
history11.addPosition(90, 190)
assert(history11.getDetailedDirection() === 'up-left', '왼쪽 위 대각선 → up-left')

const history12 = new MovementHistory('test-char-12')
history12.addPosition(100, 200)
history12.addPosition(110, 210)
assert(history12.getDetailedDirection() === 'down-right', '오른쪽 아래 대각선 → down-right')

const history13 = new MovementHistory('test-char-13')
history13.addPosition(100, 200)
history13.addPosition(90, 210)
assert(history13.getDetailedDirection() === 'down-left', '왼쪽 아래 대각선 → down-left')

console.log('\n7. 속도 계산 테스트')
const history14 = new MovementHistory('test-char-14')
const now = Date.now()
history14.addPosition(100, 200, now)
history14.addPosition(110, 210, now + 100)  // 100ms에 14.14px 이동
const speed = history14.calculateSpeed()
assert(Math.abs(speed - 0.1414) < 0.01, '속도 계산 (14.14px/100ms≈0.1414)')

console.log('\n8. MovementHistoryManager 다중 캐릭터 관리 테스트')
const manager = new MovementHistoryManager()
assert(manager.getHistory('char-1').characterId === 'char-1', '새 캐릭터 히스토리 생성')

manager.addPosition('char-1', 100, 200)
manager.addPosition('char-1', 110, 200)  // 오른쪽만 이동
manager.addPosition('char-2', 300, 400)
manager.addPosition('char-2', 310, 400)  // 오른쪽만 이동

assert(manager.isMoving('char-1') === true, 'char-1 이동 중')
assert(manager.isMoving('char-2') === true, 'char-2 이동 중')
assert(manager.getDirection('char-1') === 'right', 'char-1 방향 right')
assert(manager.getDirection('char-2') === 'right', 'char-2 방향 right')
assert(manager.size() === 2, '관리 중인 캐릭터 수')

console.log('\n9. 캐릭터 삭제 테스트')
manager.remove('char-1')
assert(manager.size() === 1, 'char-1 삭제 후 크기 1')
assert(manager.isMoving('char-1') === false, 'char-1 삭제 후 이동 중 아님')

manager.clearAll()
assert(manager.size() === 0, 'clearAll 후 크기 0')

console.log('\n10. 전역 인스턴스 테스트')
globalMovementHistoryManager.addPosition('global-1', 100, 200)
globalMovementHistoryManager.addPosition('global-1', 110, 210)
assert(globalMovementHistoryManager.isMoving('global-1') === true, 'global 인스턴스 이동 중')
globalMovementHistoryManager.remove('global-1')

console.log('\n' + '='.repeat(50))
console.log(`📊 테스트 결과: ${passed} 통과, ${failed} 실패`)
console.log('='.repeat(50))

process.exit(failed > 0 ? 1 : 0)