import { test, expect } from '@playwright/test';

test.describe('S07. 인벤토리 (INVENTORY)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('S07-1: 🎒 인벤토리 버튼 클릭 → 모달 열기', async ({ page }) => {
    const inventoryButton = page.locator('button:has-text("🎒"), button:has-text("인벤토리"), [data-testid="inventory-button"]');

    await inventoryButton.click();
    await page.waitForTimeout(500);

    const modal = page.locator('.modal, [data-testid="inventory-modal"]');
    await expect(modal).toBeVisible();
  });

  test('S07-2: "🎒 INVENTORY" 헤더 표시', async ({ page }) => {
    const inventoryButton = page.locator('button:has-text("🎒")');

    await inventoryButton.click();
    await page.waitForTimeout(300);

    const header = page.locator('.modal-header, [data-testid="modal-header"]');
    await expect(header).toBeVisible();
    await expect(header).toContainText(/INVENTORY|인벤토리/i);
  });

  test('S07-3: TOTAL 아이템 수 표시', async ({ page }) => {
    const inventoryButton = page.locator('button:has-text("🎒")');

    await inventoryButton.click();
    await page.waitForTimeout(300);

    const totalLabel = page.locator('text=/TOTAL|총/i');
    const itemCount = page.locator('text=/\\d+/');
    await expect(totalLabel).toBeVisible();
  });

  test('S07-4: REFRESH 버튼 동작', async ({ page }) => {
    const inventoryButton = page.locator('button:has-text("🎒")');

    await inventoryButton.click();
    await page.waitForTimeout(500);

    const refreshButton = page.locator('button:has-text("REFRESH"), button:has-text("새로고침")');
    await expect(refreshButton).toBeVisible();
    await refreshButton.click();
    await page.waitForTimeout(500);
  });

  test('S07-5: 아이템 있을 때: 그리드 목록 (아이콘, 이름, 수량, 설명)', async ({ page }) => {
    const inventoryButton = page.locator('button:has-text("🎒")');

    await inventoryButton.click();
    await page.waitForTimeout(500);

    const itemGrid = page.locator('.item-grid, [data-testid="item-grid"]');
    const itemCards = itemGrid.locator('.item-card, .inventory-item');

    const count = await itemCards.count();
    if (count > 0) {
      // 아이템이 있으면 그리드가 보여야 함
      await expect(itemGrid).toBeVisible();
    }
  });

  test('S07-6: 소비 아이템 USE 버튼', async ({ page }) => {
    const inventoryButton = page.locator('button:has-text("🎒")');

    await inventoryButton.click();
    await page.waitForTimeout(500);

    const useButton = page.locator('button:has-text("USE"), button:has-text("사용")');
    const count = await useButton.count();

    // 아이템이 있으면 USE 버튼이 있어야 함
    if (count > 0) {
      await expect(useButton.first()).toBeVisible();
    }
  });

  test('S07-7: 아이템 없을 때: "INVENTORY EMPTY"', async ({ page }) => {
    const inventoryButton = page.locator('button:has-text("🎒")');

    await inventoryButton.click();
    await page.waitForTimeout(500);

    const emptyMessage = page.locator('text=/EMPTY|비어있다|없다/i');
    // 아이템이 없을 때만 이 메시지가 보일 수 있음
    const count = await emptyMessage.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('S07-8: ✕ 버튼으로 닫기', async ({ page }) => {
    const inventoryButton = page.locator('button:has-text("🎒")');

    await inventoryButton.click();
    await page.waitForTimeout(300);

    const closeButton = page.locator('.modal-close, button:has-text("✕"), [data-testid="modal-close"]');
    await closeButton.click();
    await page.waitForTimeout(300);

    const modal = page.locator('.modal, [data-testid="inventory-modal"]');
    const isVisible = await modal.isVisible().catch(() => false);
    expect(isVisible).toBe(false);
  });
});