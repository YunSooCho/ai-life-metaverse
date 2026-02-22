/**
 * 날씨/시간 시스템 테스트
 * PM 룰 v3.2: 테스트 코드 필수!
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  getGameHour,
  getGameMinute,
  getTimePeriod,
  getTimeOverlay,
  generateRandomWeather,
  createWeatherParticles,
  updateWeatherParticles,
  renderWeatherParticles,
  renderTimeOverlay,
  renderWeatherTimeHUD,
  WEATHER_TYPES,
  TIME_PERIODS,
  GAME_DAY_DURATION_MS
} from '../weatherTimeSystem'

describe('Weather & Time System', () => {
  describe('getGameHour', () => {
    it('should return hour between 0 and 23', () => {
      const hour = getGameHour(0)
      expect(hour).toBeGreaterThanOrEqual(0)
      expect(hour).toBeLessThanOrEqual(23)
    })

    it('should return 0 at start of game day', () => {
      const now = Date.now()
      // startTime = now → elapsed = 0 → hour = 0
      const hour = getGameHour(now)
      expect(hour).toBe(0)
    })

    it('should return 12 at midday', () => {
      const now = Date.now()
      const startTime = now - (GAME_DAY_DURATION_MS / 2)
      const hour = getGameHour(startTime)
      expect(hour).toBe(12)
    })
  })

  describe('getGameMinute', () => {
    it('should return minute between 0 and 59', () => {
      const minute = getGameMinute(0)
      expect(minute).toBeGreaterThanOrEqual(0)
      expect(minute).toBeLessThanOrEqual(59)
    })

    it('should return 0 at exact hour', () => {
      const now = Date.now()
      const minute = getGameMinute(now)
      expect(minute).toBe(0)
    })
  })

  describe('getTimePeriod', () => {
    it('should return DAWN for hours 5-6', () => {
      expect(getTimePeriod(5)).toBe(TIME_PERIODS.DAWN)
      expect(getTimePeriod(6)).toBe(TIME_PERIODS.DAWN)
    })

    it('should return MORNING for hours 7-11', () => {
      expect(getTimePeriod(7)).toBe(TIME_PERIODS.MORNING)
      expect(getTimePeriod(11)).toBe(TIME_PERIODS.MORNING)
    })

    it('should return AFTERNOON for hours 12-16', () => {
      expect(getTimePeriod(12)).toBe(TIME_PERIODS.AFTERNOON)
      expect(getTimePeriod(16)).toBe(TIME_PERIODS.AFTERNOON)
    })

    it('should return EVENING for hours 17-19', () => {
      expect(getTimePeriod(17)).toBe(TIME_PERIODS.EVENING)
      expect(getTimePeriod(19)).toBe(TIME_PERIODS.EVENING)
    })

    it('should return NIGHT for hours 20-4', () => {
      expect(getTimePeriod(20)).toBe(TIME_PERIODS.NIGHT)
      expect(getTimePeriod(0)).toBe(TIME_PERIODS.NIGHT)
      expect(getTimePeriod(4)).toBe(TIME_PERIODS.NIGHT)
    })
  })

  describe('getTimeOverlay', () => {
    it('should return overlay with color property', () => {
      const overlay = getTimeOverlay(12)
      expect(overlay).toHaveProperty('color')
    })

    it('should return transparent for afternoon', () => {
      const overlay = getTimeOverlay(14)
      expect(overlay.color).toBe('rgba(255, 255, 255, 0)')
    })

    it('should return dark overlay for night', () => {
      const overlay = getTimeOverlay(22)
      expect(overlay.color).toContain('rgba(0, 0, 40')
    })
  })

  describe('generateRandomWeather', () => {
    it('should return a valid weather type', () => {
      const validTypes = Object.values(WEATHER_TYPES)
      for (let i = 0; i < 50; i++) {
        const weather = generateRandomWeather()
        expect(validTypes).toContain(weather)
      }
    })
  })

  describe('WEATHER_TYPES', () => {
    it('should have 4 weather types', () => {
      expect(Object.keys(WEATHER_TYPES)).toHaveLength(4)
    })

    it('should have clear, cloudy, rain, snow', () => {
      expect(WEATHER_TYPES.CLEAR).toBe('clear')
      expect(WEATHER_TYPES.CLOUDY).toBe('cloudy')
      expect(WEATHER_TYPES.RAIN).toBe('rain')
      expect(WEATHER_TYPES.SNOW).toBe('snow')
    })
  })

  describe('createWeatherParticles', () => {
    it('should create particles for rain', () => {
      const particles = createWeatherParticles(WEATHER_TYPES.RAIN, 800, 600)
      expect(particles.length).toBe(80)
      particles.forEach(p => {
        expect(p).toHaveProperty('x')
        expect(p).toHaveProperty('y')
        expect(p).toHaveProperty('speed')
        expect(p).toHaveProperty('size')
        expect(p).toHaveProperty('opacity')
      })
    })

    it('should create particles for snow', () => {
      const particles = createWeatherParticles(WEATHER_TYPES.SNOW, 800, 600)
      expect(particles.length).toBe(40)
    })

    it('should return empty for clear weather', () => {
      const particles = createWeatherParticles(WEATHER_TYPES.CLEAR, 800, 600)
      expect(particles).toHaveLength(0)
    })

    it('should return empty for cloudy weather', () => {
      const particles = createWeatherParticles(WEATHER_TYPES.CLOUDY, 800, 600)
      expect(particles).toHaveLength(0)
    })
  })

  describe('updateWeatherParticles', () => {
    it('should move rain particles downward', () => {
      const particles = [{ x: 100, y: 100, speed: 8, size: 2, opacity: 1 }]
      const updated = updateWeatherParticles(particles, WEATHER_TYPES.RAIN, 800, 600)
      expect(updated[0].y).toBeGreaterThan(100)
    })

    it('should reset particles when they go below canvas', () => {
      const particles = [{ x: 100, y: 599, speed: 8, size: 2, opacity: 1 }]
      const updated = updateWeatherParticles(particles, WEATHER_TYPES.RAIN, 800, 600)
      expect(updated[0].y).toBe(-10)
    })

    it('should return same particles for clear weather', () => {
      const particles = [{ x: 100, y: 100, speed: 2, size: 3, opacity: 1 }]
      const updated = updateWeatherParticles(particles, WEATHER_TYPES.CLEAR, 800, 600)
      expect(updated).toEqual(particles)
    })
  })

  describe('renderWeatherParticles', () => {
    it('should call ctx methods for rain', () => {
      const ctx = {
        save: vi.fn(),
        restore: vi.fn(),
        fillRect: vi.fn(),
        globalAlpha: 1,
        fillStyle: ''
      }
      const particles = [{ x: 10, y: 20, speed: 8, size: 2, opacity: 0.8 }]
      renderWeatherParticles(ctx, particles, WEATHER_TYPES.RAIN)
      expect(ctx.save).toHaveBeenCalled()
      expect(ctx.fillRect).toHaveBeenCalled()
      expect(ctx.restore).toHaveBeenCalled()
    })

    it('should call ctx methods for snow', () => {
      const ctx = {
        save: vi.fn(),
        restore: vi.fn(),
        beginPath: vi.fn(),
        arc: vi.fn(),
        fill: vi.fn(),
        globalAlpha: 1,
        fillStyle: ''
      }
      const particles = [{ x: 10, y: 20, speed: 2, size: 3, opacity: 0.5 }]
      renderWeatherParticles(ctx, particles, WEATHER_TYPES.SNOW)
      expect(ctx.beginPath).toHaveBeenCalled()
      expect(ctx.arc).toHaveBeenCalled()
      expect(ctx.fill).toHaveBeenCalled()
    })

    it('should not render for clear weather', () => {
      const ctx = { save: vi.fn(), restore: vi.fn() }
      renderWeatherParticles(ctx, [], WEATHER_TYPES.CLEAR)
      expect(ctx.save).not.toHaveBeenCalled()
    })
  })

  describe('renderTimeOverlay', () => {
    it('should render overlay for night', () => {
      const ctx = {
        save: vi.fn(),
        restore: vi.fn(),
        fillRect: vi.fn(),
        fillStyle: ''
      }
      renderTimeOverlay(ctx, 22, 800, 600)
      expect(ctx.save).toHaveBeenCalled()
      expect(ctx.fillRect).toHaveBeenCalledWith(0, 0, 800, 600)
      expect(ctx.restore).toHaveBeenCalled()
    })

    it('should skip rendering for afternoon (transparent)', () => {
      const ctx = {
        save: vi.fn(),
        restore: vi.fn(),
        fillRect: vi.fn(),
        fillStyle: ''
      }
      renderTimeOverlay(ctx, 14, 800, 600)
      expect(ctx.save).not.toHaveBeenCalled()
    })
  })

  describe('renderWeatherTimeHUD', () => {
    it('should render HUD with time and weather', () => {
      const ctx = {
        save: vi.fn(),
        restore: vi.fn(),
        fillRect: vi.fn(),
        strokeRect: vi.fn(),
        fillText: vi.fn(),
        fillStyle: '',
        strokeStyle: '',
        lineWidth: 0,
        font: '',
        textAlign: '',
        textBaseline: ''
      }
      renderWeatherTimeHUD(ctx, 14, 30, WEATHER_TYPES.CLEAR, 1)
      expect(ctx.save).toHaveBeenCalled()
      expect(ctx.fillText).toHaveBeenCalledTimes(2) // time + weather
      expect(ctx.restore).toHaveBeenCalled()
    })
  })
})
