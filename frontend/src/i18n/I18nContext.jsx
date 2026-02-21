import React, { createContext, useContext, useState, useEffect } from 'react'
import { translations as allTranslations } from './translations.js'

// 기본 언어
const DEFAULT_LANGUAGE = 'ko'

// 지원하는 언어 목록 (내부 상수로 유지 - Vite Fast Refresh 호환성)
const LANGUAGES = {
  ko: '한국어',
  ja: '日本語',
  en: 'English'
}

// 테스트 환경용 fallback translations
const fallbackTranslations = {
  ko: {
    ui: {
      friends: {
        requests: "친구 요청",
        pendingCount: "보류 중 요청",
        noPendingRequests: "보류 중인 요청이 없습니다",
        accept: "수락",
        reject: "거절",
        confirmReject: "{name} 요청을 거절하시겠습니까?",
        acceptFailed: "친구 요청 수락에 실패했습니다",
        rejectFailed: "친구 요청 거절에 실패했습니다"
      },
      common: {
        loading: "로딩 중..."
      }
    }
  },
  ja: {
    ui: {
      friends: {
        requests: "友達リクエスト",
        pendingCount: "保留中のリクエスト",
        noPendingRequests: "保留中のリクエストがありません",
        accept: "承認",
        reject: "拒否",
        confirmReject: "{name} のリクエストを拒否しますか？",
        acceptFailed: "友達リクエストの承認に失敗しました",
        rejectFailed: "友達リクエストの拒否に失敗しました"
      },
      common: {
        loading: "読み込み中..."
      }
    }
  },
  en: {
    ui: {
      friends: {
        requests: "Friend Requests",
        pendingCount: "Pending Requests",
        noPendingRequests: "No pending requests",
        accept: "Accept",
        reject: "Reject",
        confirmReject: "Reject {name}'s request?",
        acceptFailed: "Failed to accept friend request",
        rejectFailed: "Failed to reject friend request"
      },
      common: {
        loading: "Loading..."
      }
    }
  }
}

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
    // 브라우저 환경인지 확인 후 localStorage에서 저장된 언어 확인
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const savedLang = localStorage.getItem('app-language')
        return savedLang && LANGUAGES[savedLang] ? savedLang : initialLanguage
      } catch (e) {
        console.warn('localStorage 접근 실패, 기본 언어 사용:', e)
        return initialLanguage
      }
    }
    return initialLanguage
  })

  // 번역 캐시 (초기 로드) - allTranslations가 비어있으면 fallback 사용
  const [translationsCache, setTranslationsCache] = useState(() => {
    if (Object.keys(allTranslations || {}).length === 0) {
      return fallbackTranslations
    }
    return allTranslations || fallbackTranslations
  })

  // 언어 변경 시 localStorage에 저장
  useEffect(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.setItem('app-language', language)
      } catch (e) {
        console.warn('localStorage 저장 실패:', e)
      }
    }
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
    // 캐치 확인 (이미 로드됨)
    if (translationsCache[language]) {
      return getNestedValue(translationsCache[language], key, params)
    }

    // 로드 중이면 기본 번역 반환
    if (translationsCache.ko) {
      return getNestedValue(translationsCache.ko, key, params)
    }

    // fallback 사용
    if (fallbackTranslations[language]) {
      return getNestedValue(fallbackTranslations[language], key, params)
    }
    if (fallbackTranslations.ko) {
      return getNestedValue(fallbackTranslations.ko, key, params)
    }

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

export default I18nContext