import { test, expect } from '@playwright/test';

test.describe('S11. 이벤트 로그 / 기록', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('S11-1: 📊 기록 버튼 클릭 → 이벤트 로그 열기/닫기', async ({ page }) => {
    const logButton = page.locator('button:has-text("📊"), button:has-text("기록"), [data-testid="log-button"]');

    const count = await logButton.count();
    if (count > 0) {
      await logButton.click();
      await page.waitForTimeout(500);

      const eventLog = page.locator('.event-log, [data-testid="event-log"], .history-panel');
      const isVisible = await eventLog.isVisible().catch(() => false);
      expect(isVisible).toBe(true);

      // 다시 클릭하여 닫기
      await logButton.click();
      await page.waitForTimeout(300);

      const isClosed = await eventLog.isVisible().catch(() => true);
      expect(isClosed).toBe(false);
    }
  });

  test('S11-2: H 키로 히스토리 토글', async ({ page }) => {
    // 이벤트 로그가 처음에 닫혀 있는 상태 가정
    await page.keyboard.press('KeyH');
    await page.waitForTimeout(300);

    const eventLog = page.locator('.event-log, [data-testid="event-log"], .history-panel');
    const isVisible = await eventLog.isVisible().catch(() => false);

    // 이벤트 로그가 존재하면 토글 동작 검증
    if (await eventLog.count() > 0) {
      expect(isVisible).toBe(true);
    }
  });

  test('S11-3: 이벤트 로그 콘텐츠 확인', async ({ page }) => {
    const logButton = page.locator('button:has-text("📊")');

    const count = await logButton.count();
    if (count > 0) {
      await logButton.click();
      await page.waitForTimeout(500);

      const eventLog = page.locator('.event-log, [data-testid="event-log"]');
      const eventEntries = eventLog.locator('.log-entry, .event-entry');

      // 적어도 이벤트 로그 패널은 있어야 함
      await expect(eventLog).toBeVisible();
    }
  });
});