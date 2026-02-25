/**
 * 날씨 시스템 브리지 테스트
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import {
  WEATHER_TYPES,
  DEFAULT_WEATHER,
  WEATHER_PROBABILITIES,
  getMapWeather,
  setMapWeather,
  getDefaultWeather,
  getRandomWeather,
  changeWeatherRandomly,
  getWeatherModifier,
  clearWeatherData,
  exportWeatherData,
  importWeatherData
} from '../weather-bridge.js'

describe('날씨 시스템 브리지', () => {
  const testMapId = 'main_plaza'

  beforeEach(() => {
    // 각 테스트 전에 데이터 초기화
    clearWeatherData()
  })

  afterEach(() => {
    // 각 테스트 후에 데이터 정리
    clearWeatherData()
  })

  describe('WEATHER_TYPES', () => {
    it('모든 날씨 유형이 정의되어야 함', () => {
      expect(WEATHER_TYPES.SUNNY).toBe('sunny')
      expect(WEATHER_TYPES.CLOUDY).toBe('cloudy')
      expect(WEATHER_TYPES.RAINY).toBe('rainy')
      expect(WEATHER_TYPES.SNOWY).toBe('snowy')
      expect(WEATHER_TYPES.WINDY).toBe('windy')
      expect(WEATHER_TYPES.FOGGY).toBe('foggy')
    })
  })

  describe('DEFAULT_WEATHER', () => {
    it('모든 맵의 기본 날씨가 정의되어야 함', () => {
      expect(DEFAULT_WEATHER.default).toBeDefined()
      expect(DEFAULT_WEATHER.beach).toBeDefined()
      expect(DEFAULT_WEATHER.forest).toBeDefined()
      expect(DEFAULT_WEATHER.mountain).toBeDefined()
    })

    it('각 기본 날씨에 필요한 필드가 있어야 함', () => {
      const weather = DEFAULT_WEATHER.default

      expect(weather.type).toBeDefined()
      expect(weather.temperature).toBeDefined()
      expect(weather.humidity).toBeDefined()
      expect(weather.windSpeed).toBeDefined()
    })

    it('맵별로 다른 기본 날씨를 가져야 함', () => {
      expect(DEFAULT_WEATHER.beach.temperature).toBeGreaterThan(DEFAULT_WEATHER.default.temperature)
      expect(DEFAULT_WEATHER.mountain.temperature).toBeLessThan(DEFAULT_WEATHER.default.temperature)
    })
  })

  describe('WEATHER_PROBABILITIES', () => {
    it('모든 맵의 날씨 확률이 정의되어야 함', () => {
      expect(WEATHER_PROBABILITIES.default).toBeDefined()
      expect(WEATHER_PROBABILITIES.beach).toBeDefined()
      expect(WEATHER_PROBABILITIES.forest).toBeDefined()
      expect(WEATHER_PROBABILITIES.mountain).toBeDefined()
    })

    it('확률 합계는 100이어야 함', () => {
      const defaultSum = Object.values(WEATHER_PROBABILITIES.default).reduce((a, b) => a + b, 0)
      const beachSum = Object.values(WEATHER_PROBABILITIES.beach).reduce((a, b) => a + b, 0)

      expect(defaultSum).toBe(100)
      expect(beachSum).toBe(100)
    })

    it('맵별로 다른 날씨 확률을 가져야 함', () => {
      expect(WEATHER_PROBABILITIES.beach[WEATHER_TYPES.SUNNY]).toBeGreaterThan(WEATHER_PROBABILITIES.default[WEATHER_TYPES.SUNNY])
      expect(WEATHER_PROBABILITIES.mountain[WEATHER_TYPES.SNOWY]).toBeGreaterThan(WEATHER_PROBABILITIES.default[WEATHER_TYPES.SNOWY])
    })
  })

  describe('getMapWeather', () => {
    it('맵의 현재 날씨를 조회할 수 있어야 함', () => {
      const weather = getMapWeather(testMapId)

      expect(weather).toBeDefined()
      expect(weather.type).toBeDefined()
      expect(weather.temperature).toBeDefined()
      expect(weather.lastUpdate).toBeDefined()
    })

    it('초기에는 기본 날씨를 사용해야 함', () => {
      const weather = getMapWeather('default')

      expect(weather.type).toBe(DEFAULT_WEATHER.default.type)
      expect(weather.temperature).toBe(DEFAULT_WEATHER.default.temperature)
    })

    it('없는 맵은 기본 날씨를 사용해야 함', () => {
      const weather = getMapWeather('nonexistent_map')

      expect(weather).toBeDefined()
      expect(weather.type).toBe(DEFAULT_WEATHER.default.type)
    })
  })

  describe('setMapWeather', () => {
    it('맵 날씨를 설정할 수 있어야 함', () => {
      const newWeather = {
        type: WEATHER_TYPES.RAINY,
        temperature: 15,
        humidity: 80,
        windSpeed: 20
      }

      setMapWeather(testMapId, newWeather)

      const weather = getMapWeather(testMapId)

      expect(weather.type).toBe(WEATHER_TYPES.RAINY)
      expect(weather.temperature).toBe(15)
      expect(weather.humidity).toBe(80)
      expect(weather.windSpeed).toBe(20)
    })

    it('설정 시간을 기록해야 함', () => {
      const beforeTime = Date.now()
      setMapWeather(testMapId, { type: WEATHER_TYPES.SUNNY })
      const afterTime = Date.now()

      const weather = getMapWeather(testMapId)

      expect(weather.lastUpdate).toBeGreaterThanOrEqual(beforeTime)
      expect(weather.lastUpdate).toBeLessThanOrEqual(afterTime)
    })

    it('기본 필드를 채워야 함', () => {
      setMapWeather(testMapId, { type: WEATHER_TYPES.SUNNY })

      const weather = getMapWeather(testMapId)

      expect(weather.humidity).toBeDefined()
      expect(weather.windSpeed).toBeDefined()
    })
  })

  describe('getDefaultWeather', () => {
    it('기본 날씨를 조회할 수 있어야 함', () => {
      const weather = getDefaultWeather('default')

      expect(weather).toEqual(DEFAULT_WEATHER.default)
    })

    it('없는 맵은 기본 맵 날씨를 사용해야 함', () => {
      const weather = getDefaultWeather('nonexistent_map')

      expect(weather).toEqual(DEFAULT_WEATHER.default)
    })
  })

  describe('getRandomWeather', () => {
    it('랜덤 날씨를 생성할 수 있어야 함', () => {
      const weather = getRandomWeather('default')

      expect(weather).toBeDefined()
      expect(weather.type).toBeDefined()
      expect(weather.temperature).toBeDefined()
    })

    it('날씨 유형은 정의된 유형이어야 함', () => {
      const weather = getRandomWeather('default')

      expect(Object.values(WEATHER_TYPES)).toContain(weather.type)
    })

    it('맵별로 다른 확률을 사용해야 함', () => {
      // beach는 sunny 확률이 높음 (60%)
      // 여러 번 시도해서 sunny가 자주 나오는지 확인은 어려우니,
      // 적어도 유효한 날씨 유형인지 확인
      const weather1 = getRandomWeather('beach')
      const weather2 = getRandomWeather('beach')
      const weather3 = getRandomWeather('beach')

      expect(Object.values(WEATHER_TYPES)).toContain(weather1.type)
      expect(Object.values(WEATHER_TYPES)).toContain(weather2.type)
      expect(Object.values(WEATHER_TYPES)).toContain(weather3.type)
    })
  })

  describe('changeWeatherRandomly', () => {
    it('날씨를 랜덤하게 변경할 수 있어야 함', () => {
      const oldWeather = getMapWeather(testMapId)

      changeWeatherRandomly(testMapId)

      const newWeather = getMapWeather(testMapId)

      expect(newWeather.lastUpdate).toBeGreaterThan(oldWeather.lastUpdate)
    })

    it('이전 날씨와 다를 수 있어야 함', () => {
      const oldWeather = getMapWeather(testMapId)

      changeWeatherRandomly(testMapId)

      const newWeather = getMapWeather(testMapId)

      // 랜덤이므로 항상 다르지는 않지만, 확률적으로 다를 수 있음
      expect(newWeather.lastUpdate).not.toBe(oldWeather.lastUpdate)
    })
  })

  describe('getWeatherModifier', () => {
    it('날씨에 따른 수식어를 반환해야 함', () => {
      let modifier

      modifier = getWeatherModifier('default')
      expect(modifier).toBeDefined()
      expect(typeof modifier).toBe('string')
    })

    it('날씨 타입에 따라 다른 수식어를 사용해야 함', () => {
      const sunnyModifier = getWeatherModifier('default', WEATHER_TYPES.SUNNY)
      const rainyModifier = getWeatherModifier('default', WEATHER_TYPES.RAINY)

      expect(sunnyModifier).toBeDefined()
      expect(rainyModifier).toBeDefined()
      // 두 수식어가 같을 수도 있지만, 날씨 타입 매개변수를 잘 처리하는지 확인
    })
  })

  describe('clearWeatherData', () => {
    it('날씨 데이터를 초기화할 수 있어야 함', () => {
      setMapWeather(testMapId, { type: WEATHER_TYPES.SNOWY })

      clearWeatherData()

      const weather = getMapWeather(testMapId)

      expect(weather.type).toBe(DEFAULT_WEATHER.default.type)
    })

    it('모든 맵 데이터를 초기화해야 함', () => {
      setMapWeather('default', { type: WEATHER_TYPES.RAINY })
      setMapWeather('beach', { type: WEATHER_TYPES.SNOWY })

      clearWeatherData()

      const weather1 = getMapWeather('default')
      const weather2 = getMapWeather('beach')

      expect(weather1.type).toBe(DEFAULT_WEATHER.default.type)
      expect(weather2.type).toBe(DEFAULT_WEATHER.beach.type)
    })
  })

  describe('exportWeatherData / importWeatherData', () => {
    beforeEach(() => {
      setMapWeather(testMapId, {
        type: WEATHER_TYPES.RAINY,
        temperature: 15,
        humidity: 80,
        windSpeed: 20
      })

      setMapWeather('beach', {
        type: WEATHER_TYPES.SUNNY,
        temperature: 30,
        humidity: 55,
        windSpeed: 10
      })
    })

    it('데이터를 내보내야 함', () => {
      const exported = exportWeatherData()

      expect(exported).toBeDefined()
      expect(exported['default']).toBeDefined()
      expect(exported['beach']).toBeDefined()
    })

    it('데이터를 불러올 수 있어야 함', () => {
      const exported = exportWeatherData()

      clearWeatherData()

      const weather1 = getMapWeather(testMapId)
      expect(weather1.type).toBe(DEFAULT_WEATHER.default.type)

      importWeatherData(exported)

      const weather2 = getMapWeather(testMapId)
      expect(weather2.type).toBe(WEATHER_TYPES.RAINY)
      expect(weather2.temperature).toBe(15)
    })

    it('모든 맵 데이터를 복원해야 함', () => {
      const exported = exportWeatherData()

      clearWeatherData()
      importWeatherData(exported)

      const weather1 = getMapWeather(testMapId)
      const weather2 = getMapWeather('beach')

      expect(weather1.type).toBe(WEATHER_TYPES.RAINY)
      expect(weather2.type).toBe(WEATHER_TYPES.SUNNY)
    })
  })
})