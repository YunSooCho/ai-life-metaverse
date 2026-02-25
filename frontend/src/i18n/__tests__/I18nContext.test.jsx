import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { I18nProvider, useI18n } from '../I18nContext'

/**
 * I18nContext 테스트
 */
describe('I18nContext', () => {
  beforeEach(() => {
    // localStorage 클린업
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  /**
   * useI18n 기본 기능 테스트
   */
  it('useI18n hook을 사용하여 번역 함수를 제공해야 함', () => {
    const wrapper = ({ children }) => <I18nProvider>{children}</I18nProvider>
    const { result } = renderHook(() => useI18n(), { wrapper })

    expect(result.current).toHaveProperty('t')
    expect(result.current).toHaveProperty('language')
    expect(result.current).toHaveProperty('changeLanguage')
    expect(result.current).toHaveProperty('languages')
    expect(typeof result.current.t).toBe('function')
    expect(typeof result.current.changeLanguage).toBe('function')
  })

  /**
   * 기본 언어 테스트
   */
  it('기본 언어가 한국어(ko)여야 함', () => {
    const wrapper = ({ children }) => <I18nProvider>{children}</I18nProvider>
    const { result } = renderHook(() => useI18n(), { wrapper })

    expect(result.current.language).toBe('ko')
  })

  /**
   * 초기 언어 설정 테스트
   */
  it('initialLanguage prop으로 초기 언어 설정 가능', () => {
    const wrapper = ({ children }) => (
      <I18nProvider initialLanguage="en">{children}</I18nProvider>
    )
    const { result } = renderHook(() => useI18n(), { wrapper })

    expect(result.current.language).toBe('en')
  })

  /**
   * 언어 변경 테스트
   */
  it('changeLanguage 함수로 언어 변경 가능', () => {
    const wrapper = ({ children }) => <I18nProvider>{children}</I18nProvider>
    const { result } = renderHook(() => useI18n(), { wrapper })

    expect(result.current.language).toBe('ko')

    act(() => {
      result.current.changeLanguage('en')
    })

    expect(result.current.language).toBe('en')

    act(() => {
      result.current.changeLanguage('ja')
    })

    expect(result.current.language).toBe('ja')
  })

  /**
   * localStorage 저장 테스트
   */
  it('언어 변경 시 localStorage에 저장', () => {
    const wrapper = ({ children }) => <I18nProvider>{children}</I18nProvider>
    const { result } = renderHook(() => useI18n(), { wrapper })

    act(() => {
      result.current.changeLanguage('ja')
    })

    expect(localStorage.getItem('app-language')).toBe('ja')
  })

  /**
   * localStorage에서 언어 복원 테스트
   */
  it('localStorage에 저장된 언어로 복원 가능', () => {
    localStorage.setItem('app-language', 'en')

    const wrapper = ({ children }) => <I18nProvider>{children}</I18nProvider>
    const { result } = renderHook(() => useI18n(), { wrapper })

    expect(result.current.language).toBe('en')
  })

  /**
   * 번역 테스트
   */
  it('t 함수로 번역된 텍스트 반환', async () => {
    const wrapper = ({ children }) => <I18nProvider>{children}</I18nProvider>
    const { result } = renderHook(() => useI18n(), { wrapper })

    // 번역 로드 대기
    await waitFor(() => {
      expect(result.current.t('ui.chat.placeholder')).toBe('메시지를 입력하세요...')
    })

    expect(result.current.t('ui.buttons.ok')).toBe('확인')
    expect(result.current.t('ui.tabs.profile')).toBe('프로필')
  })

  /**
   * 영어 번역 테스트
   */
  it('영어로 번역 가능', async () => {
    const wrapper = ({ children }) => (
      <I18nProvider initialLanguage="en">{children}</I18nProvider>
    )
    const { result } = renderHook(() => useI18n(), { wrapper })

    // 번역 로드 대기
    await waitFor(() => {
      expect(result.current.t('ui.chat.placeholder')).toBe('Type a message...')
    })

    expect(result.current.t('ui.buttons.ok')).toBe('OK')
    expect(result.current.t('ui.tabs.profile')).toBe('Profile')
  })

  /**
   * 일본어 번역 테스트
   */
  it('일본어로 번역 가능', async () => {
    const wrapper = ({ children }) => (
      <I18nProvider initialLanguage="ja">{children}</I18nProvider>
    )
    const { result } = renderHook(() => useI18n(), { wrapper })

    // 번역 로드 대기
    await waitFor(() => {
      expect(result.current.t('ui.chat.placeholder')).toBe('メッセージを入力...')
    })

    expect(result.current.t('ui.buttons.ok')).toBe('OK')
    expect(result.current.t('ui.tabs.profile')).toBe('プロフィール')
  })

  /**
   * 잘못된 키 테스트
   */
  it('잘못된 키에 대해 키 자체 반환', async () => {
    const wrapper = ({ children }) => <I18nProvider>{children}</I18nProvider>
    const { result } = renderHook(() => useI18n(), { wrapper })

    // 번역 로드 대기
    await waitFor(() => {
      expect(result.current.t('invalid.key.path')).toBe('invalid.key.path')
    })
  })

  /**
   * 언어 객체 테스트
   */
  it('languages 객체에 한국어/일본어/영어 포함', () => {
    const wrapper = ({ children }) => <I18nProvider>{children}</I18nProvider>
    const { result } = renderHook(() => useI18n(), { wrapper })

    expect(result.current.languages).toEqual({
      ko: '한국어',
      ja: '日本語',
      en: 'English'
    })
  })

  /**
   * 언어 전환 시 번역 변경 테스트
   */
  it('언어 전환 시 번역 변경', async () => {
    const wrapper = ({ children }) => <I18nProvider>{children}</I18nProvider>
    const { result } = renderHook(() => useI18n(), { wrapper })

    // 한국어
    await waitFor(() => {
      expect(result.current.t('ui.chat.placeholder')).toBe('메시지를 입력하세요...')
    })

    // 영어로 변경
    act(() => {
      result.current.changeLanguage('en')
    })

    // 영어
    await waitFor(() => {
      expect(result.current.t('ui.chat.placeholder')).toBe('Type a message...')
    })
  })
})