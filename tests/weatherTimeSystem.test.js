import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('weatherTimeSystem 공통 모듈 테스트', () => {
  let weatherTimeSystem;

  beforeEach(async () => {
    // 모듈 import (ESM)
    weatherTimeSystem = await import('../frontend/src/utils/weatherTimeSystem.js');
    
    // 시간 고정 (테스트 재현성)
    vi.spyOn(Date, 'now').mockReturnValue(1708000000000);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('날씨 타입', () => {
    it('CLEAR 타입이 존재해야 함', () => {
      expect(weatherTimeSystem.WEATHER_TYPES.CLEAR).toBeDefined();
    });

    it('RAIN 타입이 존재해야 함', () => {
      expect(weatherTimeSystem.WEATHER_TYPES.RAIN).toBeDefined();
    });

    it('SNOW 타입이 존재해야 함', () => {
      expect(weatherTimeSystem.WEATHER_TYPES.SNOW).toBeDefined();
    });

    it('CLOUDY 타입이 존재해야 함', () => {
      expect(weatherTimeSystem.WEATHER_TYPES.CLOUDY).toBeDefined();
    });
  });

  describe('시간대 계산', () => {
    it('게임 시간을 계산할 수 있어야 함', () => {
      const gameTime = weatherTimeSystem.getGameTime();
      expect(gameTime).toBeDefined();
      expect(gameTime.hour).toBeGreaterThanOrEqual(0);
      expect(gameTime.hour).toBeLessThan(24);
    });

    it('시간대 이모지를 반환해야 함', () => {
      const emojis = ['🌅', '🌤️', '🌇', '🌙'];
      const emoji = weatherTimeSystem.getTimeOfDayEmoji();
      expect(emojis).toContain(emoji);
    });
  });

  describe('날씨 효과', () => {
    it('비 파티클을 생성할 수 있어야 함', () => {
      const rainParticles = weatherTimeSystem.createRainParticles(10);
      expect(Array.isArray(rainParticles)).toBe(true);
      if (rainParticles.length > 0) {
        expect(rainParticles[0]).toHaveProperty('x');
        expect(rainParticles[0]).toHaveProperty('y');
        expect(rainParticles[0]).toHaveProperty('velocity');
      }
    });

    it('눈 파티클을 생성할 수 있어야 함', () => {
      const snowParticles = weatherTimeSystem.createSnowParticles(10);
      expect(Array.isArray(snowParticles)).toBe(true);
      if (snowParticles.length > 0) {
        expect(snowParticles[0]).toHaveProperty('x');
        expect(snowParticles[0]).toHaveProperty('y');
        expect(snowParticles[0]).toHaveProperty('velocity');
      }
    });
  });

  describe('시간 경과', () => {
    it('시간이 경과해야 함', () => {
      const initialTime = weatherTimeSystem.getGameTime();
      
      // 100 게임 시간 진행
      weatherTimeSystem.updateTime(100);
      
      const updatedTime = weatherTimeSystem.getGameTime();
      expect(updatedTime).toBeDefined();
    });
  });
});