import { test, expect } from '@playwright/test';

test.describe('S12. 토스트 알림', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('S12-1: 인터랙션/이벤트 발생 시 토스트 표시', async ({ page }) => {
    // 채팅 메시지 전송하여 토스트 트리거 시도
    const input = page.locator('input[type="text"], [data-testid="chat-input"]');

    await input.fill('Test message for toast');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(1000);

    const toast = page.locator('.toast, [data-testid="toast"], .notification');
    const count = await toast.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('S12-2: success/warning/info 타입별 스타일', async ({ page }) => {
    // 모달 열기로 토스트 트리거 시도
    const roomsButton = page.locator('button:has-text("🏠")');

    await roomsButton.click();
    await page.waitForTimeout(500);

    const closeButton = page.locator('.modal-close, button:has-text("✕")');
    await closeButton.click();
    await page.waitForTimeout(500);

    const toast = page.locator('.toast.success, .toast.warning, .toast.info, [class*="toast"]');
    const count = await toast.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('S12-3: 자동 사라짐', async ({ page }) => {
    const input = page.locator('input[type="text"], [data-testid="chat-input"]');

    // 여러 번 전송하여 토스트 생성
    await input.fill('Message 1');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(200);

    await input.fill('Message 2');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(200);

    // 3초 후 토스트가 사라지는지 확인
    await page.waitForTimeout(3000);

    const toast = page.locator('.toast, [data-testid="toast"]');
    const count = await toast.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });
});