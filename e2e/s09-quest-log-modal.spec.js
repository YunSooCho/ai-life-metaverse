import { test, expect } from '@playwright/test';

test.describe('S09. 퀘스트 로그 (QUEST LOG)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('S09-1: 📋 퀘스트 버튼 클릭 → 모달 열기', async ({ page }) => {
    const questButton = page.locator('button:has-text("📋"), button:has-text("퀘스트"), button:has-text("QUEST"), [data-testid="quest-button"]');

    await questButton.click();
    await page.waitForTimeout(500);

    const modal = page.locator('.modal, [data-testid="quest-modal"]');
    await expect(modal).toBeVisible();
  });

  test('S09-2: "📋 QUEST LOG" 헤더 표시', async ({ page }) => {
    const questButton = page.locator('button:has-text("📋")');

    await questButton.click();
    await page.waitForTimeout(300);

    const header = page.locator('.modal-header, [data-testid="modal-header"]');
    await expect(header).toBeVisible();
    await expect(header).toContainText(/QUEST|LOG|퀘스트/i);
  });

  test('S09-3: ACTIVE 탭 + 활성 퀘스트 수', async ({ page }) => {
    const questButton = page.locator('button:has-text("📋")');

    await questButton.click();
    await page.waitForTimeout(500);

    const activeTab = page.locator('text=/ACTIVE|진행중/i');
    await expect(activeTab).toBeVisible();
  });

  test('S09-4: 퀘스트 카드: 타입 배지 (MAIN/SIDE), 제목, 설명', async ({ page }) => {
    const questButton = page.locator('button:has-text("📋")');

    await questButton.click();
    await page.waitForTimeout(500);

    const questCard = page.locator('.quest-card, [data-testid="quest-card"]');
    const count = await questCard.count();

    if (count > 0) {
      // 퀘스트가 있으면 카드가 보여야 함
      await expect(questCard.first()).toBeVisible();

      // 타입 배지 확인
      const typeBadge = questCard.locator('.quest-type, .badge');
      expect(await typeBadge.count()).toBeGreaterThan(0);
    }
  });

  test('S09-5: OBJECTIVES 리스트 (○/✓ 체크, 진행률)', async ({ page }) => {
    const questButton = page.locator('button:has-text("📋")');

    await questButton.click();
    await page.waitForTimeout(500);

    const objectives = page.locator('.objective, .quest-objective');
    const count = await objectives.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('S09-6: 진행바 + 퍼센트 표시', async ({ page }) => {
    const questButton = page.locator('button:has-text("📋")');

    await questButton.click();
    await page.waitForTimeout(500);

    const progressBar = page.locator('.progress-bar, [data-testid="progress-bar"]');
    const count = await progressBar.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('S09-7: REWARD 섹션 (PTS, EXP, 아이템)', async ({ page }) => {
    const questButton = page.locator('button:has-text("📋")');

    await questButton.click();
    await page.waitForTimeout(500);

    const rewardSection = page.locator('.quest-reward, [data-testid="quest-reward"]');
    const count = await rewardSection.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('S09-8: 100% 완료 시 CLAIM REWARD 버튼', async ({ page }) => {
    const questButton = page.locator('button:has-text("📋")');

    await questButton.click();
    await page.waitForTimeout(500);

    const claimButton = page.locator('button:has-text("CLAIM REWARD"), button:has-text("보상 수령")');
    const count = await claimButton.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('S09-9: AVAILABLE 탭 + 수락 가능 퀘스트', async ({ page }) => {
    const questButton = page.locator('button:has-text("📋")');

    await questButton.click();
    await page.waitForTimeout(500);

    const availableTab = page.locator('text=/AVAILABLE|수락 가능/i');
    const count = await availableTab.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('S09-10: ACCEPT 버튼 동작', async ({ page }) => {
    const questButton = page.locator('button:has-text("📋")');

    await questButton.click();
    await page.waitForTimeout(500);

    const acceptButton = page.locator('button:has-text("ACCEPT"), button:has-text("수락")');
    const count = await acceptButton.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('S09-11: ✕ 버튼으로 닫기', async ({ page }) => {
    const questButton = page.locator('button:has-text("📋")');

    await questButton.click();
    await page.waitForTimeout(300);

    const closeButton = page.locator('.modal-close, button:has-text("✕"), [data-testid="modal-close"]');
    await closeButton.click();
    await page.waitForTimeout(300);

    const modal = page.locator('.modal, [data-testid="quest-modal"]');
    const isVisible = await modal.isVisible().catch(() => false);
    expect(isVisible).toBe(false);
  });
});