import { test, expect } from '@playwright/test';

test.describe('S06. 방 메뉴 (ROOMS)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('S06-1: 🏠 방 버튼 클릭 → 모달 열기', async ({ page }) => {
    const roomsButton = page.locator('button:has-text("🏠"), button:has-text("방"), [data-testid="rooms-button"]');

    await roomsButton.click();
    await page.waitForTimeout(500);

    const modal = page.locator('.modal, [data-testid="rooms-modal"]');
    await expect(modal).toBeVisible();
  });

  test('S06-2: "🌐 ROOMS" 헤더 표시', async ({ page }) => {
    const roomsButton = page.locator('button:has-text("🏠")');

    await roomsButton.click();
    await page.waitForTimeout(300);

    const header = await page.locator('.modal-header, [data-testid="modal-header"]');
    await expect(header).toBeVisible();
    await expect(header).toContainText(/ROOMS|rooms/i);
  });

  test('S06-3: 현재 방 목록 (메인 광장 등)', async ({ page }) => {
    const roomsButton = page.locator('button:has-text("🏠")');

    await roomsButton.click();
    await page.waitForTimeout(500);

    const roomList = await page.locator('.room-list, [data-testid="room-list"]');
    const roomItems = await roomList.locator('.room-item, .room-name');

    // 최소 1개의 방이 있어야 함
    expect(await roomItems.count()).toBeGreaterThan(0);
  });

  test('S06-4: 방 인원 수 표시 (N 👤)', async ({ page }) => {
    const roomsButton = page.locator('button:has-text("🏠")');

    await roomsButton.click();
    await page.waitForTimeout(500);

    const memberCount = await page.locator('text=/\\d+\\s*👤/');
    expect(await memberCount.count()).toBeGreaterThan(0);
  });

  test('S06-5: NEW ROOM NAME 입력 + CREATE 버튼', async ({ page }) => {
    const roomsButton = page.locator('button:has-text("🏠")');

    await roomsButton.click();
    await page.waitForTimeout(500);

    const input = page.locator('input[placeholder*="room" i], [data-testid="new-room-input"]');
    const createButton = page.locator('button:has-text("CREATE"), button:has-text("생성")');

    await expect(input).toBeVisible();
    await expect(createButton).toBeVisible();
  });

  test('S06-6: ✕ 버튼으로 닫기', async ({ page }) => {
    const roomsButton = page.locator('button:has-text("🏠")');

    await roomsButton.click();
    await page.waitForTimeout(300);

    const closeButton = page.locator('.modal-close, button:has-text("✕"), [data-testid="modal-close"]');
    await closeButton.click();
    await page.waitForTimeout(300);

    const modal = page.locator('.modal, [data-testid="rooms-modal"]');
    // 모달이 닫혀야 함 (visible 아니거나 count가 0)
    const isVisible = await modal.isVisible().catch(() => false);
    expect(isVisible).toBe(false);
  });
});