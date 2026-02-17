import React, { createContext, useContext, useState, useEffect } from 'react'
import * as translations from './translations.js'

// 지원하는 언어 목록
export const LANGUAGES = {
  ko: '한국어',
  ja: '日本語',
  en: 'English'
}

// 기본 언어
const DEFAULT_LANGUAGE = 'ko'

// Context 생성
const I18nContext = createContext(null)

/**
 * I18n Provider 컴포넌트
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - 자식 컴포넌트
 * @param {string} props.initialLanguage - 초기 언어 (기본값: ko)
 */
export function I18nProvider({ children, initialLanguage = DEFAULT_LANGUAGE }) {
  // 언어 상태
  const [language, setLanguage] = useState(() => {
    // localStorage에서 저장된 언어 확인
    const savedLang = localStorage.getItem('app-language')
    return savedLang && LANGUAGES[savedLang] ? savedLang : initialLanguage
  })

  // 번역 캐시
  const [translationsCache, setTranslationsCache] = useState({})

  // 언어 변경 시 localStorage에 저장
  useEffect(() => {
    localStorage.setItem('app-language', language)
  }, [language])

  /**
   * 번역 가져오기
   * key 경로 예: 'ui.chat.placeholder'
   *
   * @param {string} key - 번역 키 (점으로 구분된 경로)
   * @param {Object} params - 치환 파라미터
   * @returns {string} 번역된 텍스트
   */
  const t = (key, params = {}) => {
    // 캐시 확인
    if (translationsCache[language]) {
      return getNestedValue(translationsCache[language], key, params)
    }

    // 번역 로드
    loadTranslations(language)
      .then(translations => {
        setTranslationsCache(prev => ({
          ...prev,
          [language]: translations
        }))
      })

    // 로딩 중이면 키 반환
    return key
  }

  /**
   * 언어 변경
   *
   * @param {string} newLanguage - 새 언어 코드
   */
  const changeLanguage = (newLanguage) => {
    if (LANGUAGES[newLanguage]) {
      setLanguage(newLanguage)
    }
  }

  return (
    <I18nContext.Provider value={{ language, t, changeLanguage, languages: LANGUAGES }}>
      {children}
    </I18nContext.Provider>
  )
}

/**
 * i18n Hook 사용
 *
 * @example
 * const { t, language, changeLanguage } = useI18n()
 * const message = t('ui.chat.placeholder')
 *
 * @returns {Object} i18n API
 */
export function useI18n() {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider')
  }
  return context
}

/**
 * 중첩된 객체에서 값 가져오기
 *
 * @param {Object} obj - 대상 객체
 * @param {string} path - 점으로 구분된 경로
 * @param {Object} params - 치환 파라미터
 * @returns {string} 찾은 값
 */
function getNestedValue(obj, path, params = {}) {
  const keys = path.split('.')
  let value = obj

  for (const key of keys) {
    if (value && typeof value === 'object' && key in value) {
      value = value[key]
    } else {
      return path // 찾을 수 없으면 경로 반환
    }
  }

  // 파라미터 치환
  if (typeof value === 'string') {
    return replaceParams(value, params)
  }

  return value
}

/**
 * 파라미터 치환
 * {{key}} 형식의 파라미터를 실제 값으로 치환
 *
 * @param {string} text - 대상 텍스트
 * @param {Object} params - 파라미터 객체
 * @returns {string} 치환된 텍스트
 */
function replaceParams(text, params = {}) {
  return text.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return params[key] !== undefined ? params[key] : match
  })
}

/**
 * 번역 파일 동적 로드
 *
 * @param {string} language - 언어 코드
 * @returns {Promise<Object>} 번역 객체
 */
async function loadTranslations(language) {
  try {
    const translationsModule = await import(`./${language}.json`)
    return translationsModule.default || translationsModule
  } catch (error) {
    console.error(`Failed to load translations for ${language}:`, error)
    return {} // 로드 실패 시 빈 객체 반환
  }
}

export default I18nContext