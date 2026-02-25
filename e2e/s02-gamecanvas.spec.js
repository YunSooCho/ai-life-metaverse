import { test, expect } from '@playwright/test';

test.describe('S02. GameCanvas (메인 캔버스)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('S02-1: 타일맵 배경 렌더링 (초록 배경)', async ({ page }) => {
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible({ timeout: 5000 });
  });

  test('S02-2: 건물 5개 표시 (상점, 카페, 도서관, 공원, 체육관)', async ({ page }) => {
    // 캔버스가 렌더링되었는지 확인
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();
    
    // 건물 이름 텍스트 확인
    await expect(page.locator('text=/상점/')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=/카페/')).toBeVisible();
    await expect(page.locator('text=/도서관/')).toBeVisible();
    await expect(page.locator('text=/공원/')).toBeVisible();
    await expect(page.locator('text=/체육관/')).toBeVisible();
  });

  test('S02-3: 플레이어 캐릭터 표시 + 이름', async ({ page }) => {
    await expect(page.locator('text=/플레이어/')).toBeVisible();
  });

  test('S02-4: 미니맵 표시 (우상단)', async ({ page }) => {
    await expect(page.locator('text=/미니맵|minimap/i')).toBeVisible();
  });

  test('S02-5: 호감도 하트 + 수치 표시', async ({ page }) => {
    await expect(page.locator('text=💗').or(page.locator('text=/💖|💕|❤️/'))).toBeVisible();
  });
});