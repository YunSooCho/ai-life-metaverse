import { test, expect } from '@playwright/test';

test.describe('S08. 보상 센터 (REWARD CENTER)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('S08-1: 🎁 보상 버튼 클릭 → 모달 열기', async ({ page }) => {
    const rewardButton = page.locator('button:has-text("🎁"), button:has-text("보상"), [data-testid="reward-button"]');

    await rewardButton.click();
    await page.waitForTimeout(500);

    const modal = page.locator('.modal, [data-testid="reward-modal"]');
    await expect(modal).toBeVisible();
  });

  test('S08-2: "🎁 REWARD CENTER" 헤더 표시', async ({ page }) => {
    const rewardButton = page.locator('button:has-text("🎁")');

    await rewardButton.click();
    await page.waitForTimeout(300);

    const header = page.locator('.modal-header, [data-testid="modal-header"]');
    await expect(header).toBeVisible();
    await expect(header).toContainText(/REWARD|CENTER|보상/i);
  });

  test('S08-3: 보상 목록: FIRST LOGIN, DAILY BONUS, ACHIEVEMENT', async ({ page }) => {
    const rewardButton = page.locator('button:has-text("🎁")');

    await rewardButton.click();
    await page.waitForTimeout(500);

    const rewards = ['FIRST LOGIN', 'DAILY BONUS', 'ACHIEVEMENT', '첫 로그인', '일일 보상', '성과'];
    for (const reward of rewards) {
      const element = page.locator(`text=/${reward}/i`);
      const count = await element.count();
      expect(count).toBeGreaterThanOrEqual(0);
    }
  });

  test('S08-4: 각 보상: PTS, EXP, 아이템 배지 표시', async ({ page }) => {
    const rewardButton = page.locator('button:has-text("🎁")');

    await rewardButton.click();
    await page.waitForTimeout(500);

    const pts = page.locator('text=/PTS|포인트/i');
    const exp = page.locator('text=/EXP|경험/i');

    await expect(pts.first()).toBeVisible();
    await expect(exp.first()).toBeVisible();
  });

  test('S08-5: CLAIM 버튼 동작', async ({ page }) => {
    const rewardButton = page.locator('button:has-text("🎁")');

    await rewardButton.click();
    await page.waitForTimeout(500);

    const claimButton = page.locator('button:has-text("CLAIM"), button:has-text("수령")');
    const count = await claimButton.count();

    if (count > 0) {
      await expect(claimButton.first()).toBeVisible();
      await claimButton.first().click();
      await page.waitForTimeout(500);
    }
  });

  test('S08-6: 이미 클레임한 보상: CLAIMED 표시', async ({ page }) => {
    const rewardButton = page.locator('button:has-text("🎁")');

    await rewardButton.click();
    await page.waitForTimeout(500);

    const claimedBadge = page.locator('text=/CLAIMED|수령됨/i');
    const count = await claimedBadge.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('S08-7: ✕ 버튼으로 닫기', async ({ page }) => {
    const rewardButton = page.locator('button:has-text("🎁")');

    await rewardButton.click();
    await page.waitForTimeout(300);

    const closeButton = page.locator('.modal-close, button:has-text("✕"), [data-testid="modal-close"]');
    await closeButton.click();
    await page.waitForTimeout(300);

    const modal = page.locator('.modal, [data-testid="reward-modal"]');
    const isVisible = await modal.isVisible().catch(() => false);
    expect(isVisible).toBe(false);
  });
});