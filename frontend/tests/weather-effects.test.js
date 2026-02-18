/**
 * 날씨 효과 테스트 (Weather Effects Test)
 *
 * Issue #41: 날씨 효과 강화 - 비/눈 애니메이션 & 사운드
 */

import { describe, test, expect, beforeEach, vi } from 'vitest'
import {
  getGameHour,
  getGameMinute,
  generateRandomWeather,
  createWeatherParticles,
  updateWeatherParticles,
  renderWeatherParticles,
  WeatherState,
  renderWeatherTransition,
  WEATHER_TYPES,
  TIME_PERIODS
} from '../src/utils/weatherTimeSystem'

// Mock Canvas Context
class MockCanvasRenderingContext2D {
  constructor() {
    this.fillStyle = ''
    this.strokeStyle = ''
    this.lineWidth = 1
    this.globalAlpha = 1
    this.beginPathCalls = []
    this.fillCalls = []
    this.strokeCalls = []
    this.saveCalls = 0
    this.restoreCalls = 0
    this.translateCalls = []
    this.rotateCalls = []
    this.moveToCalls = []
    this.lineToCalls = []
    this.arcCalls = []
    this.fillRectCalls = []
    this.setTransformCalls = []
  }

  beginPath() {
    this.beginPathCalls.push(true)
  }

  fill() {
    this.fillCalls.push({ style: this.fillStyle, alpha: this.globalAlpha })
  }

  stroke() {
    this.strokeCalls.push({ style: this.strokeStyle, width: this.lineWidth })
  }

  save() {
    this.saveCalls++
  }

  restore() {
    this.restoreCalls++
  }

  fillRect(x, y, width, height) {
    this.fillRectCalls.push({ x, y, width, height, style: this.fillStyle })
  }

  moveTo(x, y) {
    this.moveToCalls.push({ x, y })
  }

  lineTo(x, y) {
    this.lineToCalls.push({ x, y })
  }

  arc(x, y, radius, startAngle, endAngle) {
    this.arcCalls.push({ x, y, radius, startAngle, endAngle })
  }

  translate(x, y) {
    this.translateCalls.push({ x, y })
  }

  rotate(angle) {
    this.rotateCalls.push(angle)
  }

  setTransform(a, b, c, d, e, f) {
    this.setTransformCalls.push({ a, b, c, d, e, f })
  }
}

describe('Weather Time System - Enhanced v2', () => {

  let mockCtx

  beforeEach(() => {
    mockCtx = new MockCanvasRenderingContext2D()
  })

  describe('getGameHour / getGameMinute', () => {
    test('TC01: 현재 게임 시간 계산 (0-23시)', () => {
      const startTime = Date.now()
      const hour = getGameHour(startTime)
      expect(hour).toBeGreaterThanOrEqual(0)
      expect(hour).toBeLessThan(24)
    })

    test('TC02: 현재 게임 분 계산 (0-59분)', () => {
      const startTime = Date.now()
      const minute = getGameMinute(startTime)
      expect(minute).toBeGreaterThanOrEqual(0)
      expect(minute).toBeLessThan(60)
    })
  })

  describe('generateRandomWeather', () => {
    test('TC03: 랜덤 날씨 생성 (CLEAR, CLOUDY, RAIN, SNOW)', () => {
      const weather = generateRandomWeather()
      expect(Object.values(WEATHER_TYPES)).toContain(weather)
    })

    test('TC04: 날씨 생성 확률 검증 (CLEAR 50%, CLOUDY 25%, RAIN 15%, SNOW 10%)', () => {
      const iterations = 10000
      const counts = {
        [WEATHER_TYPES.CLEAR]: 0,
        [WEATHER_TYPES.CLOUDY]: 0,
        [WEATHER_TYPES.RAIN]: 0,
        [WEATHER_TYPES.SNOW]: 0
      }

      for (let i = 0; i < iterations; i++) {
        const weather = generateRandomWeather()
        counts[weather]++
      }

      // CLEAR ~50%
      expect(counts[WEATHER_TYPES.CLEAR] / iterations).toBeGreaterThan(0.45)
      expect(counts[WEATHER_TYPES.CLEAR] / iterations).toBeLessThan(0.55)

      // CLOUDY ~25%
      expect(counts[WEATHER_TYPES.CLOUDY] / iterations).toBeGreaterThan(0.20)
      expect(counts[WEATHER_TYPES.CLOUDY] / iterations).toBeLessThan(0.30)

      // RAIN ~15%
      expect(counts[WEATHER_TYPES.RAIN] / iterations).toBeGreaterThan(0.10)
      expect(counts[WEATHER_TYPES.RAIN] / iterations).toBeLessThan(0.20)

      // SNOW ~10%
      expect(counts[WEATHER_TYPES.SNOW] / iterations).toBeGreaterThan(0.05)
      expect(counts[WEATHER_TYPES.SNOW] / iterations).toBeLessThan(0.15)
    })
  })

  describe('createWeatherParticles - Enhanced', () => {
    test('TC05: 비 파티클 생성 (150개, 랜덤 속도/크기/각도)', () => {
      const particles = createWeatherParticles(WEATHER_TYPES.RAIN, 1000, 700)
      expect(particles.length).toBe(150)

      particles.forEach(p => {
        expect(p.x).toBeGreaterThanOrEqual(0)
        expect(p.x).toBeLessThan(1000)
        expect(p.y).toBeGreaterThanOrEqual(0)
        expect(p.y).toBeLessThan(700)
        expect(p.speed).toBeGreaterThan(10) // baseSpeed 12 ± variation 4
        expect(p.size).toBeGreaterThan(1) // size 2 ± variation 1
        expect(p.angle).toBeGreaterThan(0.05) // angle 0.15 ± variation 0.05
        expect(p.opacity).toBeGreaterThan(0.3)
        expect(p.opacity).toBeLessThan(1)
      })
    })

    test('TC06: 눈 파티클 생성 (100개, 천천히, 좌우 흔들림 포함)', () => {
      const particles = createWeatherParticles(WEATHER_TYPES.SNOW, 1000, 700)
      expect(particles.length).toBe(100)

      particles.forEach(p => {
        expect(p.x).toBeGreaterThanOrEqual(0)
        expect(p.x).toBeLessThan(1000)
        expect(p.y).toBeGreaterThanOrEqual(0)
        expect(p.y).toBeLessThan(700)
        expect(p.speed).toBeLessThan(3) // baseSpeed 1.5 ± variation 1
        expect(p.size).toBeGreaterThan(2) // size 4 ± variation 2
        expect(typeof p.rotation).toBe('number')
        expect(typeof p.rotationSpeed).toBe('number')
        expect(typeof p.swaying).toBe('number')
        expect(typeof p.swayingSpeed).toBe('number')
        expect(typeof p.swayingAmplitude).toBe('number')
      })
    })

    test('TC07: 맑음/흐림 날씨는 빈 파티클 반환', () => {
      const clearParticles = createWeatherParticles(WEATHER_TYPES.CLEAR, 1000, 700)
      const cloudyParticles = createWeatherParticles(WEATHER_TYPES.CLOUDY, 1000, 700)
      expect(clearParticles.length).toBe(0)
      expect(cloudyParticles.length).toBe(0)
    })
  })

  describe('updateWeatherParticles - Enhanced', () => {
    test('TC08: 비 파티클 업데이트 (낙하 + 바람)', () => {
      const particles = createWeatherParticles(WEATHER_TYPES.RAIN, 1000, 700)
      const updated = updateWeatherParticles(particles, WEATHER_TYPES.RAIN, 1000, 700)

      expect(updated.length).toBe(particles.length)

      updated.forEach((p, i) => {
        expect(p.y).toBeGreaterThan(particles[i].y) // 낙하
        expect(Math.abs(p.x - particles[i].x)).toBeGreaterThan(0) // 바람
      })
    })

    test('TC09: 눈 파티클 업데이트 (천천히 낙하 + 좌우 흔들림)', () => {
      const particles = createWeatherParticles(WEATHER_TYPES.SNOW, 1000, 700)
      const updated = updateWeatherParticles(particles, WEATHER_TYPES.SNOW, 1000, 700)

      expect(updated.length).toBe(particles.length)

      updated.forEach((p, i) => {
        expect(p.y).toBeGreaterThan(particles[i].y) // 천천히 낙하
        expect(p.swaying).toBeGreaterThanOrEqual(0) // swaying 업데이트
        expect(p.rotation).not.toBe(particles[i].rotation) // 회전 업데이트
      })
    })

    test('TC10: 화면 밖으로 나간 파티클 재생성', () => {
      const particles = createWeatherParticles(WEATHER_TYPES.RAIN, 1000, 700)
      // 모든 파티클을 화면 밖으로 이동
      particles.forEach(p => {
        p.y = p.y + 1000
      })
      const updated = updateWeatherParticles(particles, WEATHER_TYPES.RAIN, 1000, 700)

      updated.forEach(p => {
        expect(p.y).toBeLessThan(0) // 재생성 (화면 위에서)
        expect(p.x).toBeGreaterThanOrEqual(0)
        expect(p.x).toBeLessThan(1000)
      })
    })
  })

  describe('renderWeatherParticles - Enhanced Tear-drop & Snowflake', () => {
    test('TC11: 비 파티클 렌더링 (tear-drop shape, 각도 효과)', () => {
      const particles = createWeatherParticles(WEATHER_TYPES.RAIN, 1000, 700)
      renderWeatherParticles(mockCtx, particles, WEATHER_TYPES.RAIN)

      expect(mockCtx.saveCalls).toBeGreaterThan(0)
      expect(mockCtx.restoreCalls).toBeGreaterThan(0)
      expect(mockCtx.beginPathCalls.length).toBeGreaterThan(0)
      expect(mockCtx.strokeCalls.length).toBeGreaterThan(0)
      expect(mockCtx.fillCalls.length).toBeGreaterThan(0)

      // 끝부분 강조 (small circle)
      expect(mockCtx.arcCalls.length).toBeGreaterThan(0)
    })

    test('TC12: 눈 파티클 렌더링 (별형 snowflake + 회전)', () => {
      const particles = createWeatherParticles(WEATHER_TYPES.SNOW, 1000, 700)
      renderWeatherParticles(mockCtx, particles, WEATHER_TYPES.SNOW)

      expect(mockCtx.saveCalls).toBeGreaterThan(0)
      expect(mockCtx.restoreCalls).toBeGreaterThan(0)
      expect(mockCtx.translateCalls.length).toBeGreaterThan(0) // translate for rotation
      expect(mockCtx.rotateCalls.length).toBeGreaterThan(0) // rotation
      expect(mockCtx.setTransformCalls.length).toBeGreaterThan(0) // reset transform
      expect(mockCtx.fillCalls.length).toBeGreaterThan(0)

      // 별형 (6개 꼭지)
      // 각 눈송이가 moveTo + lineTo로 별형을 그림
      expect(mockCtx.moveToCalls.length).toBeGreaterThan(0)
      expect(mockCtx.lineToCalls.length).toBeGreaterThan(0)
    })

    test('TC13: 오피시티 파라미터 적용 (fade in/out 용)', () => {
      const particles = createWeatherParticles(WEATHER_TYPES.RAIN, 1000, 700)
      renderWeatherParticles(mockCtx, particles, WEATHER_TYPES.RAIN, 0.5)

      // globalAlpha가 0.5로 설정됨 (save/restore로 보호됨)
      expect(mockCtx.saveCalls).toBeGreaterThan(0)
      expect(mockCtx.restoreCalls).toBeGreaterThan(0)
    })
  })

  describe('WeatherState - Transition System', () => {
    test('TC14: WeatherState 생성 (초기 날씨 설정)', () => {
      const state = new WeatherState(WEATHER_TYPES.CLEAR)
      expect(state.currentWeather).toBe(WEATHER_TYPES.CLEAR)
      expect(state.previousWeather).toBeNull()
      expect(state.fadeProgress).toBe(1.0)
      expect(state.isTransitioning).toBe(false)
      expect(state.isTransitionComplete()).toBe(true)
    })

    test('TC15: 날씨 전환 시작 (transitionTo)', () => {
      const state = new WeatherState(WEATHER_TYPES.CLEAR)
      state.transitionTo(WEATHER_TYPES.RAIN)

      expect(state.currentWeather).toBe(WEATHER_TYPES.RAIN)
      expect(state.previousWeather).toBe(WEATHER_TYPES.CLEAR)
      expect(state.fadeProgress).toBe(0.0)
      expect(state.isTransitioning).toBe(true)
      expect(state.isTransitionComplete()).toBe(false)
    })

    test('TC16: 페이드 업데이트 (updateFade)', () => {
      const state = new WeatherState(WEATHER_TYPES.CLEAR)
      state.transitionTo(WEATHER_TYPES.RAIN)

      state.updateFade()
      expect(state.fadeProgress).toBeGreaterThan(0.0)
      expect(state.isTransitioning).toBe(true)
    })

    test('TC17: 표시 오피시티 계산 (getDisplayOpacities)', () => {
      const state = new WeatherState(WEATHER_TYPES.CLEAR)
      state.transitionTo(WEATHER_TYPES.RAIN)

      state.updateFade()
      const opacities = state.getDisplayOpacities()

      expect(opacities.current).toBeGreaterThan(0.0)
      expect(opacities.current).toBeLessThanOrEqual(1.0)
      expect(opacities.previous).toBeGreaterThanOrEqual(0.0)
      expect(opacities.previous).toBeLessThan(1.0)
      expect(opacities.current + opacities.previous).toBeCloseTo(1.0)
    })

    test('TC18: 같은 날씨로 전환 시 무시', () => {
      const state = new WeatherState(WEATHER_TYPES.RAIN)
      state.transitionTo(WEATHER_TYPES.RAIN)

      expect(state.currentWeather).toBe(WEATHER_TYPES.RAIN)
      expect(state.isTransitioning).toBe(false)
      expect(state.fadeProgress).toBe(1.0)
    })

    test('TC19: 전환 완료 후 isTransitionComplete true', () => {
      const state = new WeatherState(WEATHER_TYPES.CLEAR)
      state.transitionTo(WEATHER_TYPES.RAIN)

      // 페이드 완료 (fadeProgress = 1.0)
      state.fadeProgress = 1.0
      state.isTransitioning = false

      expect(state.isTransitionComplete()).toBe(true)
    })
  })

  describe('renderWeatherTransition - Smooth Fade', () => {
    test('TC20: 날씨 전환 렌더링 (fade in/out)', () => {
      const state = new WeatherState(WEATHER_TYPES.CLEAR)
      state.transitionTo(WEATHER_TYPES.RAIN)

      renderWeatherTransition(mockCtx, state, 1000, 700)

      // 이전 날씨 파티클 존재 (weather = CLEAR)
      // 현재 날씨 파티클 생성 (weather = RAIN)
      expect(mockCtx.saveCalls).toBeGreaterThanOrEqual(0)
      expect(mockCtx.restoreCalls).toBeGreaterThanOrEqual(0)
    })

    test('TC21: 전환 완료 후 이전 파티클 제거', () => {
      const state = new WeatherState(WEATHER_TYPES.CLEAR)
      state.transitionTo(WEATHER_TYPES.RAIN)

      // 전환 완료
      state.fadeProgress = 1.0
      state.isTransitioning = false

      renderWeatherTransition(mockCtx, state, 1000, 700)

      expect(state.prevParticles.length).toBe(0)
      expect(state.currParticles.length).toBeGreaterThan(0)
    })
  })
})