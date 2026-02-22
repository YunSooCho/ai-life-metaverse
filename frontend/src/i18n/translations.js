/**
 * 번역 파일 관리
 * 모든 번역 파일을 여기서 import하여 관리
 */

import koTranslations from './ko.json'
import jaTranslations from './ja.json'
import enTranslations from './en.json'

/**
 * 모든 번약 내보내기
 */
export const translations = {
  ko: koTranslations,
  ja: jaTranslations,
  en: enTranslations
}

export default translations