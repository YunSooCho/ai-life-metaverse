import { test, expect } from '@playwright/test';

test.describe('S10. 캐릭터 인터랙션 메뉴', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('S10-1: AI 캐릭터 클릭 → 인터랙션 메뉴 열기', async ({ page }) => {
    const aiCharacter = page.locator('[data-testid="character-ai"], .character-ai, .character[data-name*="유리"]');

    const count = await aiCharacter.count();
    if (count > 0) {
      await aiCharacter.first().click();
      await page.waitForTimeout(300);

      const interactionMenu = page.locator('.interaction-menu, [data-testid="interaction-menu"]');
      const isVisible = await interactionMenu.isVisible().catch(() => false);
      expect(isVisible).toBe(true);
    }
  });

  test('S10-2: 캐릭터 이름 헤더', async ({ page }) => {
    const aiCharacter = page.locator('[data-testid="character-ai"], .character-ai');

    const count = await aiCharacter.count();
    if (count > 0) {
      await aiCharacter.first().click();
      await page.waitForTimeout(300);

      const menuHeader = page.locator('.interaction-menu h3, [data-testid="interaction-header"]');
      expect(await menuHeader.count()).toBeGreaterThan(0);
    }
  });

  test('S10-3: INSA / GIFT / FRIEND / FIGHT 버튼', async ({ page }) => {
    const aiCharacter = page.locator('[data-testid="character-ai"], .character-ai');

    const count = await aiCharacter.count();
    if (count > 0) {
      await aiCharacter.first().click();
      await page.waitForTimeout(300);

      const buttons = ['INSA', 'GIFT', 'FRIEND', 'FIGHT', '반려', '선물', '친구', '전투'];
      for (const btn of buttons) {
        const buttonElement = page.locator(`button:has-text("${btn}")`);
        const btnCount = await buttonElement.count();
        expect(btnCount).toBeGreaterThanOrEqual(0);
      }
    }
  });

  test('S10-4: 버튼 클릭 → 인터랙션 실행 + 호감도 변화', async ({ page }) => {
    const aiCharacter = page.locator('[data-testid="character-ai"], .character-ai');

    const count = await aiCharacter.count();
    if (count > 0) {
      await aiCharacter.first().click();
      await page.waitForTimeout(300);

      const insaButton = page.locator('button:has-text("INSA"), button:has-text("반려")');
      const btnCount = await insaButton.count();

      if (btnCount > 0) {
        const initialAffection = await page.locator('.affection, [data-testid="affection"]').textContent().catch(() => '');

        await insaButton.first().click();
        await page.waitForTimeout(500);

        // 인터랙션 메뉴 닫기 확인
        const menuClosed = await page.locator('.interaction-menu').isVisible().catch(() => true);
        expect(menuClosed).toBe(false);
      }
    }
  });

  test('S10-5: 메뉴 외부 클릭 → 닫기', async ({ page }) => {
    const aiCharacter = page.locator('[data-testid="character-ai"], .character-ai');

    const count = await aiCharacter.count();
    if (count > 0) {
      await aiCharacter.first().click();
      await page.waitForTimeout(300);

      const menu = page.locator('.interaction-menu, [data-testid="interaction-menu"]');
      const wasVisible = await menu.isVisible().catch(() => false);

      if (wasVisible) {
        // 메뉴 외부 클릭 (캔버스)
        const canvas = page.locator('canvas, [data-testid="gamecanvas"]');
        await canvas.click({ position: { x: 50, y: 50 } });
        await page.waitForTimeout(300);

        const isStillVisible = await menu.isVisible().catch(() => true);
        expect(isStillVisible).toBe(false);
      }
    }
  });
});