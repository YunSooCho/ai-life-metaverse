import { test, expect } from '@playwright/test';

test.describe('S01. 초기 로딩', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('S01-1: 페이지 접속 → 정상 로드', async ({ page }) => {
    // 빈 화자 X 확인
    const body = await page.locator('body');
    await expect(body).toBeVisible();
  });

  test('S01-2: 헤더 표시 확인', async ({ page }) => {
    const header = page.locator('h1, header');
    await expect(header).toContainText('AI 라이프');
  });

  test('S01-3: 상태바 표시 확인 (나, 방, 캐릭터 수, 연결 상태)', async ({ page }) => {
    await expect(page.locator('text=/플레이어/i')).toBeVisible();
    await expect(page.locator('text=/방/i')).toBeVisible();
    await expect(page.locator('text=/캐릭터/')).toBeVisible();
  });

  test('S01-4: 하단 조작 안내 텍스트 표시', async ({ page }) => {
    await expect(page.locator('text=/이동|조작|위치/i')).toBeVisible();
  });

  test('S01-5: favicon 로드 확인 (콘솔 404 없음)', async ({ page, context }) => {
    const logs = [];

    context.on('console', msg => {
      if (msg.type() === 'error') {
        logs.push(msg.text());
      }
    });

    await page.reload();

    // favicon 404 확인
    const faviconErrors = logs.filter(log => log.includes('favicon'));
    expect(faviconErrors.length).toBe(0);
  });
});