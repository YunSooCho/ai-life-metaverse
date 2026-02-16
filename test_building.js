// 건물 시스템 테스트

const buildings = [
  { id: 1, name: '상점', x: 150, y: 150, width: 120, height: 100, type: 'shop', color: '#4CAF50' },
  { id: 2, name: '카페', x: 700, y: 150, width: 120, height: 100, type: 'cafe', color: '#FF9800' },
  { id: 3, name: '공원', x: 400, y: 500, width: 200, height: 150, type: 'park', color: '#8BC34A' },
  { id: 4, name: '도서관', x: 100, y: 450, width: 150, height: 120, type: 'library', color: '#2196F3' },
  { id: 5, name: '체육관', x: 750, y: 450, width: 150, height: 120, type: 'gym', color: '#F44336' }
]

// 테스트 1: 건물 데이터 구조 검증
console.log('🧪 테스트 1: 건물 데이터 구조')
let passed = 0
let failed = 0

buildings.forEach(building => {
  if (
    typeof building.id === 'number' &&
    typeof building.name === 'string' &&
    typeof building.x === 'number' &&
    typeof building.y === 'number' &&
    typeof building.width === 'number' &&
    typeof building.height === 'number' &&
    typeof building.type === 'string' &&
    typeof building.color === 'string'
  ) {
    console.log(`  ✅ ${building.name} (${building.id}): 데이터 구조 유효`)
    passed++
  } else {
    console.log(`  ❌ ${building.name} (${building.id}): 데이터 구조 무효`)
    failed++
  }
})

// 테스트 2: 건물 클릭 감지
console.log('\n🧪 테스트 2: 건물 클릭 감지')

function getBuildingAtPosition(clickX, clickY) {
  return buildings.find(building => {
    return clickX >= building.x && clickX <= building.x + building.width &&
           clickY >= building.y && clickY <= building.y + building.height
  })
}

const clickTests = [
  { x: 210, y: 200, expected: '상점' },  // 상점 안
  { x: 760, y: 200, expected: '카페' },  // 카페 안
  { x: 500, y: 575, expected: '공원' },  // 공원 안
  { x: 175, y: 510, expected: '도서관' }, // 도서관 안
  { x: 825, y: 510, expected: '체육관' }, // 체육관 안
  { x: 100, y: 100, expected: null },    // 맵 바깥
  { x: 300, y: 300, expected: null },    // 빈 공간
]

clickTests.forEach(test => {
  const building = getBuildingAtPosition(test.x, test.y)
  const actual = building ? building.name : null

  if (actual === test.expected) {
    console.log(`  ✅ (${test.x}, ${test.y}) ${actual || '없음'}`)
    passed++
  } else {
    console.log(`  ❌ (${test.x}, ${test.y}) 예상: ${test.expected}, 실제: ${actual}`)
    failed++
  }
})

// 테스트 3: 건물 ID 유니크성
console.log('\n🧪 테스트 3: 건물 ID 유니크성')
const ids = buildings.map(b => b.id)
const uniqueIds = [...new Set(ids)]

if (ids.length === uniqueIds.length) {
  console.log(`  ✅ 모든 건물 ID가 유니크함 (${ids.length}개)`)
  passed++
} else {
  console.log(`  ❌ 중복된 ID가 존재함`)
  failed++
}

// 테스트 4: 건물 위치 맵 범위 내 (0~1000, 0~700)
console.log('\n🧪 테스트 4: 건물 위치 맵 범위 내')
const MAP_SIZE = { width: 1000, height: 700 }

buildings.forEach(building => {
  const withinBounds =
    building.x >= 0 &&
    building.y >= 0 &&
    building.x + building.width <= MAP_SIZE.width &&
    building.y + building.height <= MAP_SIZE.height

  if (withinBounds) {
    console.log(`  ✅ ${building.name}: 맵 범위 내`)
    passed++
  } else {
    console.log(`  ❌ ${building.name}: 맵 범위 외 (${building.x}, ${building.y}, ${building.width}x${building.height})`)
    failed++
  }
})

// 결과 요약
console.log('\n📊 테스트 결과 요약')
console.log(`  ✅ 통과: ${passed}`)
console.log(`  ❌ 실패: ${failed}`)

if (failed === 0) {
  console.log('\n🎉 모든 테스트 통과!')
  process.exit(0)
} else {
  console.log('\n⚠️ 테스트 실패!')
  process.exit(1)
}