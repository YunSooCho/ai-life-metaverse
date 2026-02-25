/**
 * 캐릭터 커스터마이징 유틸리티
 *
 * 커스터마이징 설정을 관리하고 localStorage에 저장합니다.
 */

import {
  DEFAULT_CUSTOMIZATION,
  CUSTOMIZATION_CATEGORIES,
  OPTIONS_BY_CATEGORY
} from '../data/customizationOptions'

// localStorage 키
const STORAGE_KEY = 'character-customization'

/**
 * 커스터마이징 설정 가져오기
 *
 * @returns {Object} 커스터마이징 설정
 */
export function getCustomization() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      return { ...DEFAULT_CUSTOMIZATION, ...parsed }
    }
    return { ...DEFAULT_CUSTOMIZATION }
  } catch (error) {
    console.error('Failed to load customization:', error)
    return { ...DEFAULT_CUSTOMIZATION }
  }
}

/**
 * 커스터마이징 설정 저장
 *
 * @param {Object} customization - 커스터마이징 설정
 */
export function saveCustomization(customization) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(customization))
    console.log('Customization saved:', customization)
  } catch (error) {
    console.error('Failed to save customization:', error)
  }
}

/**
 * 커스터마이징 설정 리셋
 */
export function resetCustomization() {
  try {
    localStorage.removeItem(STORAGE_KEY)
    console.log('Customization reset')
  } catch (error) {
    console.error('Failed to reset customization:', error)
  }
}

/**
 * 커스터마이징 설정 업데이트
 *
 * @param {Object} customization - 현재 커스터마이징 설정
 * @param {string} category - 카테고리 (hairStyles, clothingColors, accessories)
 * @param {string} optionId - 옵션 ID
 * @returns {Object} 업데이트된 커스터마이징 설정
 */
export function updateCustomization(customization, category, optionId) {
  const validCategories = Object.values(CUSTOMIZATION_CATEGORIES)

  if (!validCategories.includes(category)) {
    console.error(`Invalid category: ${category}`)
    return customization
  }

  const options = OPTIONS_BY_CATEGORY[category]
  if (!options[optionId]) {
    console.error(`Invalid option ID: ${optionId} in category: ${category}`)
    return customization
  }

  // 카테고리별 필드 이름 매핑
  const fieldNames = {
    [CUSTOMIZATION_CATEGORIES.HAIR_STYLES]: 'hairStyle',
    [CUSTOMIZATION_CATEGORIES.CLOTHING_COLORS]: 'clothingColor',
    [CUSTOMIZATION_CATEGORIES.ACCESSORIES]: 'accessory'
  }

  const fieldName = fieldNames[category]
  const updated = {
    ...customization,
    [fieldName]: optionId
  }

  saveCustomization(updated)
  return updated
}

/**
 * 옵션 이름 가져오기
 *
 * @param {string} category - 카테고리
 * @param {string} optionId - 옵션 ID
 * @returns {string} 옵션 이름
 */
export function getOptionName(category, optionId) {
  const options = OPTIONS_BY_CATEGORY[category]
  return options[optionId]?.name || ''
}

/**
 * 옵션 설명 가져오기
 *
 * @param {string} category - 카테고리
 * @param {string} optionId - 옵션 ID
 * @returns {string} 옵션 설명
 */
export function getOptionDescription(category, optionId) {
  const options = OPTIONS_BY_CATEGORY[category]
  return options[optionId]?.description || ''
}

/**
 * 옵션 이모지 가져오기
 *
 * @param {string} category - 카테고리
 * @param {string} optionId - 옵션 ID
 * @returns {string} 옵션 이모지
 */
export function getOptionEmoji(category, optionId) {
  const options = OPTIONS_BY_CATEGORY[category]
  return options[optionId]?.emoji || ''
}

/**
 * 옵션 색상 가져오기 (clothingColors 카테고리용)
 *
 * @param {string} optionId - 옵션 ID
 * @returns {string} 색상 hex 값
 */
export function getColorHex(optionId) {
  const options = OPTIONS_BY_CATEGORY[CUSTOMIZATION_CATEGORIES.CLOTHING_COLORS]
  return options[optionId]?.hex || '#4CAF50'
}

/**
 * 모든 옵션 목록 가져오기
 *
 * @returns {Object} 모든 옵션 목록
 */
export function getAllOptions() {
  return OPTIONS_BY_CATEGORY
}

/**
 * 카테고리 목록 가져오기
 *
 * @returns {Array} 카테고리 목록
 */
export function getCategories() {
  return Object.values(CUSTOMIZATION_CATEGORIES)
}

/**
 * 커스터마이징 설정의 이모지 조합 생성
 *
 * @param {Object} customization - 커스터마이징 설정
 * @returns {string} 이모지 조합
 */
export function getEmojiCombination(customization) {
  const hairEmoji = getOptionEmoji(CUSTOMIZATION_CATEGORIES.HAIR_STYLES, customization.hairStyle)
  const accessoryEmoji = getOptionEmoji(CUSTOMIZATION_CATEGORIES.ACCESSORIES, customization.accessory)

  return `${hairEmoji}${accessoryEmoji}`
}

export default {
  getCustomization,
  saveCustomization,
  resetCustomization,
  updateCustomization,
  getOptionName,
  getOptionDescription,
  getOptionEmoji,
  getColorHex,
  getAllOptions,
  getCategories,
  getEmojiCombination
}