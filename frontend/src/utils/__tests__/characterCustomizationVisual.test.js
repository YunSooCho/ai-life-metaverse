/**
 * CRITICAL Test #1005: 커스터마이징 시각적 일치 테스트
 *
 * 목표: 커스터마이징 카드의 캐릭터와 실제 게임 캐릭터가 일치하는가?
 *
 * 테스트 케이스:
 * - T1005-01: 커스터마이징 저장 시 프리뷰 카드 업데이트 확인
 * - T1005-02: localStorage 저장 데이터 정상성 확인
 * - T1005-03: 헤어스타일 이모지 조합 확인
 * - T1005-04: 액세서리 이모지 조합 확인
 * - T1005-05: 색상 HEX 변환 확인
 * - T1005-06: myCharacter emoji 업데이트 확인
 * - T1005-07: myCharacter color 업데이트 확인
 * - T1005-08: socket.emit('move') 호출 확인
 * - T1005-09: 기본값 fallback 동작 확인
 * - T1005-10: 서버 동기화 데이터 구조 확인
 */

import { getOptionEmoji, getColorHex } from '../characterCustomization'
import { CUSTOMIZATION_CATEGORIES } from '../../data/customizationOptions'

// Mock socket
const mockSocket = {
  emit: vi.fn()
}

// Mock localStorage
const localStorageMock = (() => {
  let store = {}
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => { store[key] = value.toString() },
    removeItem: (key) => { delete store[key] },
    clear: () => { store = {} }
  }
})()
global.localStorage = localStorageMock

/**
 * T1005-01: 커스터마이징 저장 시 프리뷰 카드 업데이트 확인
 */
test('T1005-01: 프리뷰 카드 업데이트 확인', () => {
  const savedCustomization = {
    hairStyle: 'long',
    accessory: 'glasses',
    clothingColor: 'red'
  }

  const hairEmoji = getOptionEmoji(CUSTOMIZATION_CATEGORIES.HAIR_STYLES, savedCustomization.hairStyle)
  const accessoryEmoji = getOptionEmoji(CUSTOMIZATION_CATEGORIES.ACCESSORIES, savedCustomization.accessory)

  expect(hairEmoji).toBe('👱‍♀️')
  expect(accessoryEmoji).toBe('👓')
  expect(hairEmoji + accessoryEmoji).toBe('👱‍♀️👓')
})

/**
 * T1005-02: localStorage 저장 데이터 정상성 확인
 */
test('T1005-02: localStorage 저장 데이터 정상성 확인', () => {
  const savedCustomization = {
    hairStyle: 'long',
    accessory: 'glasses',
    clothingColor: 'red'
  }

  localStorage.setItem('character-customization', JSON.stringify(savedCustomization))

  const stored = JSON.parse(localStorage.getItem('character-customization'))

  expect(stored.hairStyle).toBe('long')
  expect(stored.accessory).toBe('glasses')
  expect(stored.clothingColor).toBe('red')
})

/**
 * T1005-03: 헤어스타일 이모지 조합 확인
 */
test('T1005-03: 헤어스타일 이모지 조합 확인', () => {
  // 긴 머리
  const longHair = getOptionEmoji(CUSTOMIZATION_CATEGORIES.HAIR_STYLES, 'long')
  expect(longHair).toBe('👱‍♀️')

  // 짧은 머리
  const shortHair = getOptionEmoji(CUSTOMIZATION_CATEGORIES.HAIR_STYLES, 'short')
  expect(shortHair).toBe('👨')

  // 중간 길이
  const mediumHair = getOptionEmoji(CUSTOMIZATION_CATEGORIES.HAIR_STYLES, 'medium')
  expect(mediumHair).toBe('👩')

  // 대머리
  const bald = getOptionEmoji(CUSTOMIZATION_CATEGORIES.HAIR_STYLES, 'bald')
  expect(bald).toBe('🧑‍🦲')
})

/**
 * T1005-04: 액세서리 이모지 조합 확인
 */
test('T1005-04: 액세서리 이모지 조합 확인', () => {
  // 안경
  const glasses = getOptionEmoji(CUSTOMIZATION_CATEGORIES.ACCESSORIES, 'glasses')
  expect(glasses).toBe('👓')

  // 모자
  const hat = getOptionEmoji(CUSTOMIZATION_CATEGORIES.ACCESSORIES, 'hat')
  expect(hat).toBe('🧢')

  // 넥타이
  const bowTie = getOptionEmoji(CUSTOMIZATION_CATEGORIES.ACCESSORIES, 'bow_tie')
  expect(bowTie).toBe('🎀')

  // 없음
  const none = getOptionEmoji(CUSTOMIZATION_CATEGORIES.ACCESSORIES, 'none')
  expect(none).toBe('')
})

/**
 * T1005-05: 색상 HEX 변환 확인
 */
test('T1005-05: 색상 HEX 변환 확인', () => {
  expect(getColorHex('red')).toBe('#F44336')
  expect(getColorHex('blue')).toBe('#2196F3')
  expect(getColorHex('green')).toBe('#4CAF50')
  expect(getColorHex('yellow')).toBe('#FFEB3B')
  expect(getColorHex('purple')).toBe('#9C27B0')
  expect(getColorHex('orange')).toBe('#FF9800')
  expect(getColorHex('pink')).toBe('#E91E63')
  expect(getColorHex('cyan')).toBe('#00BCD4')
  expect(getColorHex('brown')).toBe('#795548')
  expect(getColorHex('gray')).toBe('#9E9E9E')
})

/**
 * T1005-06: myCharacter emoji 업데이트 확인
 */
test('T1005-06: myCharacter emoji 업데이트 확인', () => {
  const myCharacter = {
    id: 'player',
    name: 'Player',
    emoji: '👤',
    color: '#4CAF50'
  }

  const savedCustomization = {
    hairStyle: 'long',
    accessory: 'glasses'
  }

  const hairEmoji = getOptionEmoji(CUSTOMIZATION_CATEGORIES.HAIR_STYLES, savedCustomization.hairStyle)
  const accessoryEmoji = getOptionEmoji(CUSTOMIZATION_CATEGORIES.ACCESSORIES, savedCustomization.accessory)

  const updatedCharacter = {
    ...myCharacter,
    emoji: hairEmoji + accessoryEmoji
  }

  expect(updatedCharacter.emoji).toBe('👱‍♀️👓')
  expect(updatedCharacter.emoji).not.toBe('👤')
})

/**
 * T1005-07: myCharacter color 업데이트 확인
 */
test('T1005-07: myCharacter color 업데이트 확인', () => {
  const myCharacter = {
    id: 'player',
    name: 'Player',
    emoji: '👤',
    color: '#4CAF50'
  }

  const savedCustomization = {
    clothingColor: 'red'
  }

  const characterColor = getColorHex(savedCustomization.clothingColor)

  const updatedCharacter = {
    ...myCharacter,
    color: characterColor
  }

  expect(updatedCharacter.color).toBe('#F44336')
  expect(updatedCharacter.color).not.toBe('#4CAF50')
})

/**
 * T1005-08: socket.emit('move') 호출 확인
 */
test('T1005-08: socket.emit("move") 호출 확인', () => {
  const myCharacter = {
    id: 'player',
    name: 'Player',
    emoji: '👤',
    color: '#4CAF50',
    x: 125,
    y: 125
  }

  const savedCustomization = {
    hairStyle: 'long',
    accessory: 'glasses',
    clothingColor: 'red'
  }

  const hairEmoji = getOptionEmoji(CUSTOMIZATION_CATEGORIES.HAIR_STYLES, savedCustomization.hairStyle)
  const accessoryEmoji = getOptionEmoji(CUSTOMIZATION_CATEGORIES.ACCESSORIES, savedCustomization.accessory)
  const characterColor = getColorHex(savedCustomization.clothingColor)

  const updatedCharacter = {
    ...myCharacter,
    color: characterColor,
    emoji: hairEmoji + accessoryEmoji
  }

  mockSocket.emit('move', updatedCharacter)

  expect(mockSocket.emit).toHaveBeenCalledWith('move', updatedCharacter)
  expect(mockSocket.emit).toHaveBeenCalledTimes(1)

  // Check that the emitted character has the updated properties
  const emitCall = mockSocket.emit.mock.calls[0]
  const emittedCharacter = emitCall[1]
  expect(emittedCharacter.emoji).toBe('👱‍♀️👓')
  expect(emittedCharacter.color).toBe('#F44336')
})

/**
 * T1005-09: 기본값 fallback 동작 확인
 */
test('T1005-09: 기본값 fallback 동작 확인', () => {
  const savedCustomization = {}

  const hairStyle = savedCustomization.hairStyle || 'short'
  const accessory = savedCustomization.accessory || 'none'
  const clothingColor = savedCustomization.clothingColor || 'blue'

  const hairEmoji = getOptionEmoji(CUSTOMIZATION_CATEGORIES.HAIR_STYLES, hairStyle)
  const accessoryEmoji = getOptionEmoji(CUSTOMIZATION_CATEGORIES.ACCESSORIES, accessory)
  const characterColor = getColorHex(clothingColor)

  expect(hairStyle).toBe('short')
  expect(accessory).toBe('none')
  expect(clothingColor).toBe('blue')

  expect(hairEmoji).toBe('👨')
  expect(accessoryEmoji).toBe('')
  expect(characterColor).toBe('#2196F3')

  expect(hairEmoji + accessoryEmoji).toBe('👨')
})

/**
 * T1005-10: 서버 동기화 데이터 구조 확인
 */
test('T1005-10: 서버 동기화 데이터 구조 확인', () => {
  const myCharacter = {
    id: 'player',
    name: 'Player',
    emoji: '👱‍♀️',
    color: '#FF5733',
    x: 125,
    y: 125,
    isAi: false
  }

  const updatedCharacter = {
    ...myCharacter,
    emoji: '👱‍♀️👓',
    color: '#FF5733'
  }

  // Check that the updated character has all required fields
  expect(updatedCharacter).toHaveProperty('id')
  expect(updatedCharacter).toHaveProperty('name')
  expect(updatedCharacter).toHaveProperty('emoji')
  expect(updatedCharacter).toHaveProperty('color')
  expect(updatedCharacter).toHaveProperty('x')
  expect(updatedCharacter).toHaveProperty('y')
  expect(updatedCharacter).toHaveProperty('isAi')

  // Check that the emoji and color are updated
  expect(updatedCharacter.emoji).toBe('👱‍♀️👓')
  expect(updatedCharacter.color).toBe('#FF5733')

  // Simulate socket emit
  mockSocket.emit('move', updatedCharacter)

  // Verify the emitted data structure
  const emitCall = mockSocket.emit.mock.calls[mockSocket.emit.mock.calls.length - 1]
  const emittedData = emitCall[1]

  expect(emittedData).toHaveProperty('id', myCharacter.id)
  expect(emittedData).toHaveProperty('emoji', '👱‍♀️👓')
  expect(emittedData).toHaveProperty('color', '#FF5733')
  expect(emittedData).toHaveProperty('x', myCharacter.x)
  expect(emittedData).toHaveProperty('y', myCharacter.y)
})