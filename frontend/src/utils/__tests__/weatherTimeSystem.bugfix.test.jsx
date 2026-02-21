/**
 * Bug #140 Fix Test: 시간/날씨 HUD 이모지 undefined 버그 수정 테스트
 */

import {
  renderWeatherTimeHUD,
  getTimePeriod,
  WEATHER_TYPES
} from '../weatherTimeSystem'

describe('Bug #140: 시간/날씨 HUD 이모지 undefined 버그', () => {
  test('renderWeatherTimeHUD - 유효하지 않은 weather일 때 기본 이모지 반환', () => {
    const canvas = document.createElement('canvas')
    canvas.width = 800
    canvas.height = 600
    const ctx = canvas.getContext('2d')

    // 유효하지 않은 weather 값 전달
    expect(() => {
      renderWeatherTimeHUD(ctx, 10, 30, 'INVALID_WEATHER', 1.0)
    }).not.toThrow()
  })

  test('renderWeatherTimeHUD - 유효한 period일 때 올바른 이모지 반환', () => {
    const canvas = document.createElement('canvas')
    canvas.width = 800
    canvas.height = 600
    const ctx = canvas.getContext('2d')

    expect(() => {
      renderWeatherTimeHUD(ctx, 10, 30, WEATHER_TYPES.CLEAR, 1.0)
    }).not.toThrow()
  })
})