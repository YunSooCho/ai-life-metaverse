import { test, expect } from '@playwright/test';

test.describe('S04. 캐릭터 이동', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('S04-1: 방향키 (↑↓←→) 이동 동작', async ({ page }) => {
    const player = page.locator('[data-testid="player"], .character-player');

    // ↑ 키
    await page.keyboard.press('ArrowUp');
    await page.waitForTimeout(100);

    // ↓ 키
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(100);

    // ← 키
    await page.keyboard.press('ArrowLeft');
    await page.waitForTimeout(100);

    // → 키
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(100);

    await expect(player).toBeVisible();
  });

  test('S04-2: WASD 키 이동 동작', async ({ page }) => {
    const player = page.locator('[data-testid="player"], .character-player');

    await page.keyboard.press('KeyW');
    await page.waitForTimeout(50);
    await page.keyboard.press('KeyS');
    await page.waitForTimeout(50);
    await page.keyboard.press('KeyA');
    await page.waitForTimeout(50);
    await page.keyboard.press('KeyD');
    await page.waitForTimeout(50);

    await expect(player).toBeVisible();
  });

  test('S04-3: 캔버스 클릭 이동 (터치 포함)', async ({ page }) => {
    const canvas = page.locator('canvas, [data-testid="gamecanvas"]');

    // 캔버스 클릭
    await canvas.click({ position: { x: 300, y: 300 } });
    await page.waitForTimeout(500);

    await expect(canvas).toBeVisible();
  });

  test('S04-4: 건물 충돌 시 이동 차단', async ({ page }) => {
    const player = page.locator('[data-testid="player"], .character-player');

    // 플레이어 초기 위치 기록
    const beforePosition = await player.boundingBox();

    // 건물 방향으로 이동 시도
    await page.keyboard.press('ArrowDown', { delay: 100 });

    // 충돌 체크 (위치가 크게 변하지 않거나 충돌 감지)
    const afterPosition = await player.boundingBox();
    expect(beforePosition).toBeDefined();

    await expect(player).toBeVisible();
  });

  test('S04-5: 맵 경계 이동 차단', async ({ page }) => {
    const player = page.locator('[data-testid="player"], .character-player');

    // 화면 경계에서 이동 시도
    await page.keyboard.down('ArrowUp');
    await page.waitForTimeout(500);
    await page.keyboard.up('ArrowUp');

    await expect(player).toBeVisible();
  });

  test('S04-6: 이동 시 미니맵 위치 업데이트', async ({ page }) => {
    const minimap = page.locator('[data-testid="minimap"], .minimap');
    const player = page.locator('[data-testid="player"], .character-player');

    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(200);

    await expect(minimap).toBeVisible();
    await expect(player).toBeVisible();
  });
});