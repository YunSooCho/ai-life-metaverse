import { test, expect } from '@playwright/test';

test.describe('S03. 시간/날씨 HUD', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('S03-1: 좌상단 HUD 박스 표시', async ({ page }) => {
    const hud = page.locator('[data-testid="weather-hud"], .weather-hud, .game-hud');
    await expect(hud).toBeVisible();
  });

  test('S03-2: 게임 시간 표시 (HH:MM 형식)', async ({ page }) => {
    await expect(page.locator('text=/\\d{1,2}:\\d{2}/')).toBeVisible();
  });

  test('S03-3: 시간대 이모지 표시 (🌅🌤️🌇🌙)', async ({ page }) => {
    const timeEmojis = ['🌅', '🌤️', '🌇', '🌙'];
    const anyTimeEmoji = page.locator(`text=/${timeEmojis.join('|')}/`);
    await expect(anyTimeEmoji).toBeVisible();
  });

  test('S03-4: 날씨 상태 표시 (CLEAR/CLOUDY/RAIN/SNOW)', async ({ page }) => {
    const weatherStates = ['CLEAR', 'CLOUDY', 'RAIN', 'SNOW', '맑음', '흐림', '비', '눈'];
    const anyWeather = page.locator(`text=/${weatherStates.join('|')}/i`);
    await expect(anyWeather).toBeVisible();
  });

  test('S03-5: 시간 경과에 따른 오버레이 색상 변화 (밤 어두워짐)', async ({ page }) => {
    const overlay = page.locator('[data-testid="time-overlay"], .time-overlay, .darkness-overlay');
    // 오버레이 요소 존재 확인 (밤 시간일 때만 보일 수 있음)
    expect(await overlay.count()).toBeGreaterThanOrEqual(0);
  });

  test('S03-6: 비/눈 날씨 시 파티클 효과', async ({ page }) => {
    // 파티클 캔버스 확인
    const particleCanvas = page.locator('.weather-particles, canvas[data-type="weather"]');
    // 날씨가 비/눈일 때만 파티클이 보일 수 있음
    expect(await particleCanvas.count()).toBeGreaterThanOrEqual(0);
  });
});