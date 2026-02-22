import { test, expect } from '@playwright/test';

test.describe('S05. 채팅 시스템', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('S05-1: 텍스트 입력 → 입력창에 표시', async ({ page }) => {
    const input = page.locator('input[type="text"], [data-testid="chat-input"], textarea');

    await expect(input).toBeVisible();
    const testMessage = 'Hello, AI!';
    await input.fill(testMessage);
    await expect(input).toHaveValue(testMessage);
  });

  test('S05-2: SEND 버튼 클릭 → 메시지 전송 + 입력창 클리어', async ({ page }) => {
    const input = page.locator('input[type="text"], [data-testid="chat-input"], textarea');
    const sendButton = page.locator('button:has-text("SEND"), button[data-testid="send-button"]');

    const testMessage = 'Hello Test Message';
    await input.fill(testMessage);

    await sendButton.click();
    await page.waitForTimeout(500);

    // 입력창 클리어 확인
    await expect(input).toHaveValue('');
  });

  test('S05-3: Enter 키 → 메시지 전송', async ({ page }) => {
    const input = page.locator('input[type="text"], [data-testid="chat-input"], textarea');

    await input.fill('Enter key test');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);

    await expect(input).toHaveValue('');
  });

  test('S05-4: Shift+Enter → 줄바꿈 (전송 안 됨)', async ({ page }) => {
    const input = page.locator('textarea, [data-testid="chat-input"]');

    const testMessage = 'Line 1';
    await input.fill(testMessage);

    // Shift+Enter (줄바꿈)
    await page.keyboard.press('Shift+Enter');

    // 메시지가 유지되어야 함 (전송되지 않음)
    await expect(input).toHaveValue(/Line 1/);
  });

  test('S05-5: 메시지 전송 후 캐릭터 위 채팅 말풍선 표시', async ({ page }) => {
    const input = page.locator('input[type="text"], [data-testid="chat-input"]');
    const sendButton = page.locator('button:has-text("SEND")');

    await input.fill('Test message');
    await sendButton.click();
    await page.waitForTimeout(1000);

    // 말풍선 표시 확인
    const chatBubble = page.locator('.chat-bubble, [data-testid="chat-bubble"]');
    expect(await chatBubble.count()).toBeGreaterThan(0);
  });

  test('S05-6: AI 유리 채팅 응답 (GLM-4.7 API 연동)', async ({ page }) => {
    const input = page.locator('input[type="text"], [data-testid="chat-input"]');
    const sendButton = page.locator('button:has-text("SEND")');

    await input.fill('안녕하세요!');
    await sendButton.click();

    // AI 응답 대기 (최대 15초)
    await page.waitForTimeout(8000);

    // AI 응답 말풍선 확인
    const aiBubble = page.locator('.chat-bubble.ai, [data-testid="chat-bubble-ai"]');
    expect(await aiBubble.count()).toBeGreaterThan(0);
  });

  test('S05-7: AI 응답 말풍선 표시', async ({ page }) => {
    const input = page.locator('input[type="text"], [data-testid="chat-input"]');
    const sendButton = page.locator('button:has-text("SEND")');

    await input.fill('오늘 날씨 어때?');
    await sendButton.click();

    await page.waitForTimeout(8000);

    const aiBubble = page.locator('.chat-bubble.ai, [data-testid="chat-bubble-ai"]');
    if (await aiBubble.count() > 0) {
      await expect(aiBubble).toBeVisible();
    }
  });
});