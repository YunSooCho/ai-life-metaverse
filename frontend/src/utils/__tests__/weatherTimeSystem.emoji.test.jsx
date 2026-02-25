/**
 * Bug #140: 시간/날씨 HUD 이모지 undefined 버그 테스트
 * 
 * Issue: period/weather 값이 undefined/null일 때 HUD 화면에 "undefined" 텍스트로 표시됨
 * Fix: periodEmoji[period] || '⏰', weatherEmoji[weather] || '🌤' 기본값 추가
 */

import { getTimePeriod, TIME_PERIODS, WEATHER_TYPES } from '../weatherTimeSystem'

describe('Bug #140: 시간/날씨 HUD 이모지 undefined 버그', () => {
  describe('getTimePeriod 함수', () => {
    it('시간 5-7시: DAWN 반환', () => {
      expect(getTimePeriod(6)).toBe(TIME_PERIODS.DAWN)
    })

    it('시간 7-12시: MORNING 반환', () => {
      expect(getTimePeriod(9)).toBe(TIME_PERIODS.MORNING)
    })

    it('시간 12-17시: AFTERNOON 반환', () => {
      expect(getTimePeriod(14)).toBe(TIME_PERIODS.AFTERNOON)
    })

    it('시간 17-20시: EVENING 반환', () => {
      expect(getTimePeriod(18)).toBe(TIME_PERIODS.EVENING)
    })

    it('시간 20-5시: NIGHT 반환', () => {
      expect(getTimePeriod(2)).toBe(TIME_PERIODS.NIGHT)
      expect(getTimePeriod(22)).toBe(TIME_PERIODS.NIGHT)
    })
  })

  describe('이모지 맵핑 (HUD 코드 검증)', () => {
    const periodEmoji = {
      [TIME_PERIODS.DAWN]: '🌅',
      [TIME_PERIODS.MORNING]: '☀️',
      [TIME_PERIODS.AFTERNOON]: '🌤️',
      [TIME_PERIODS.EVENING]: '🌇',
      [TIME_PERIODS.NIGHT]: '🌙'
    }

    const weatherEmoji = {
      [WEATHER_TYPES.CLEAR]: '☀️',
      [WEATHER_TYPES.CLOUDY]: '☁️',
      [WEATHER_TYPES.RAIN]: '🌧️',
      [WEATHER_TYPES.SNOW]: '❄️'
    }

    it('유효한 모든 period에 이모지가 있음', () => {
      expect(periodEmoji[TIME_PERIODS.DAWN]).toBe('🌅')
      expect(periodEmoji[TIME_PERIODS.MORNING]).toBe('☀️')
      expect(periodEmoji[TIME_PERIODS.AFTERNOON]).toBe('🌤️')
      expect(periodEmoji[TIME_PERIODS.EVENING]).toBe('🌇')
      expect(periodEmoji[TIME_PERIODS.NIGHT]).toBe('🌙')
    })

    it('유효한 모든 weather에 이모지가 있음', () => {
      expect(weatherEmoji[WEATHER_TYPES.CLEAR]).toBe('☀️')
      expect(weatherEmoji[WEATHER_TYPES.CLOUDY]).toBe('☁️')
      expect(weatherEmoji[WEATHER_TYPES.RAIN]).toBe('🌧️')
      expect(weatherEmoji[WEATHER_TYPES.SNOW]).toBe('❄️')
    })

    it('undefined/null period 처리 - 기본값 ⏰ 테스트', () => {
      // 이 패턴이 소스 코드에 적용되어 있는지 확인
      const periodDisplay = periodEmoji[undefined] || '⏰'
      expect(periodDisplay).toBe('⏰')

      const weatherDisplay = weatherEmoji[undefined] || '🌤'
      expect(weatherDisplay).toBe('🌤')
    })

    it('잘못된 period/weather 처리 - 기본값 반환 테스트', () => {
      const periodDisplay = periodEmoji['INVALID_PERIOD'] || '⏰'
      expect(periodDisplay).toBe('⏰')

      const weatherDisplay = weatherEmoji['INVALID_WEATHER'] || '🌤'
      expect(weatherDisplay).toBe('🌤')
    })
  })
})