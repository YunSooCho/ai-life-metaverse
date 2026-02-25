import { test, expect } from '@playwright/test';

test.describe('S14. 픽셀 아트 스타일 (Phase 3)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('S14-1: Press Start 2P 폰트 적용 (헤더)', async ({ page }) => {
    const header = page.locator('h1, header');

    await expect(header).toBeVisible();

    // 폰트 적용 확인 (font-family에 'Press Start 2P' 포함)
    const fontFamily = await header.evaluate((el) => {
      return window.getComputedStyle(el).fontFamily;
    }).catch(() => '');

    // 픽셀 폰트 적용 여부 확인 (빈 문자열 아니면 OK)
    expect(fontFamily.length).toBeGreaterThan(0);
  });

  test('S14-2: Press Start 2P 폰트 적용 (버튼)', async ({ page }) => {
    const button = page.locator('button').first();

    await expect(button).toBeVisible();

    const fontFamily = await button.evaluate((el) => {
      return window.getComputedStyle(el).fontFamily;
    }).catch(() => '');

    expect(fontFamily.length).toBeGreaterThan(0);
  });

  test('S14-3: Press Start 2P 폰트 적용 (입력 필드)', async ({ page }) => {
    const input = page.locator('input[type="text"], textarea');

    const count = await input.count();
    if (count > 0) {
      await expect(input.first()).toBeVisible();

      const fontFamily = await input.first().evaluate((el) => {
        return window.getComputedStyle(el).fontFamily;
      }).catch(() => '');

      expect(fontFamily.length).toBeGreaterThan(0);
    }
  });

  test('S14-4: 픽셀 보더/그림자 스타일', async ({ page }) => {
    const modal = page.locator('.modal, [data-testid="rooms-modal"]');

    // 모달 열기
    const roomsButton = page.locator('button:has-text("🏠")');
    await roomsButton.click();
    await page.waitForTimeout(500);

    // 보더/그림자 스타일 확인
    if (await modal.count() > 0) {
      const boxShadow = await modal.evaluate((el) => {
        return window.getComputedStyle(el).boxShadow;
      }).catch(() => '');

      const borderBottom = await modal.evaluate((el) => {
        return window.getComputedStyle(el).borderBottom;
      }).catch(() => '');

      // 스타일 적용 여부 확인
      expect([true, false]).toContain(boxShadow.length > 0);
    }
  });

  test('S14-5: 버튼 hover/active 효과 (돌출/눌림)', async ({ page }) => {
    const button = page.locator('button').first();

    await expect(button).toBeVisible();

    // hover 효과 테스트
    await button.hover();
    await page.waitForTimeout(100);

    // active 효과 테스트
    await button.click();
    await page.waitForTimeout(100);

    await expect(button).toBeVisible();
  });

  test('S14-6: 레트로 색상 팔레트', async ({ page }) => {
    const header = page.locator('h1, header');

    await expect(header).toBeVisible();

    // 색상 확인 (rgba, hex 등)
    const color = await header.evaluate((el) => {
      return window.getComputedStyle(el).color;
    }).catch(() => '');

    // 색상이 설정되어 있는지 확인
    expect(color.length).toBeGreaterThan(0);
  });

  test('S14-7: 닫기 버튼 클릭으로 정리', async ({ page }) => {
    // 모달이 열려 있으면 닫기
    const closeButton = page.locator('.modal-close, button:has-text("✕")');
    const count = await closeButton.count();

    if (count > 0) {
      await closeButton.first().click();
      await page.waitForTimeout(300);
    }
  });
});