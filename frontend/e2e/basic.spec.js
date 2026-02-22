import { test, expect } from '@playwright/test';

test.describe('AI Life Metaverse E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  // S01: 초기 로딩
  test('S01 - 초기 로딩', async ({ page }) => {
    // 콘솔 에러 확인 (페이지 로드 전)
    const errors = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    // 페이지 로드 및 React 렌더링 대기
    await page.goto('/', { waitUntil: 'networkidle' });

    // 캔버스가 나타날 때까지 대기 (React SPA)
    await page.waitForSelector('canvas', { timeout: 10000 });
    await page.waitForTimeout(2000);

    // 헤더 표시 확인
    await expect(page.getByRole('heading', { name: /AI/ })).toBeVisible();

    // 상태바 확인
    await expect(page.getByText(/프로필/)).toBeVisible();
    await expect(page.getByText('Lv.1')).toBeVisible();
    await expect(page.getByText(/메인 광장/)).toBeVisible();
    await expect(page.getByText('2')).toBeVisible(); // 캐릭터 수
    await expect(page.getByText('✅')).toBeVisible(); // 연결 상태

    // 에러 확인
    expect(errors.length).toBe(0);
  });

  // S02: GameCanvas (메인 캔버스)
  test('S02 - GameCanvas 렌더링', async ({ page }) => {
    // 첫 번째 캔버스 (메인 게임 캔버스)
    const canvas = page.locator('canvas').first();

    // 캔버스 존재 확인
    await expect(canvas).toBeVisible();

    // 캔버스 크기 확인
    const box = await canvas.boundingBox();
    expect(box.width).toBeGreaterThan(0);
    expect(box.height).toBeGreaterThan(0);
  });

  // S07: 인벤토리
  test('S07 - 인벤토리', async ({ page }) => {
    // 인벤토리 버튼 찾기
    const inventoryBtn = page.getByRole('button', { name: /인벤토리/ });
    await expect(inventoryBtn).toBeVisible();

    // 인벤토리 버튼 클릭
    await inventoryBtn.click();

    // 모달 대기
    await page.waitForTimeout(500);

    // 모달 확인 (한국어) - 더 구체적인 셀렉터
    await expect(page.getByRole('heading', { name: /인벤토리/ })).toBeVisible();
    await expect(page.getByText(/전체: 0/)).toBeVisible();
    await expect(page.getByText(/비어있습니다/)).toBeVisible();

    // 닫기 버튼
    await page.getByRole('button', { name: '✕' }).click();
    await page.waitForTimeout(200);
  });

  // S08: 보상 센터
  test('S08 - 보상 센터', async ({ page }) => {
    // 보상 버튼 클릭
    await page.getByRole('button', { name: /보상/ }).click();

    // 모달 대기
    await page.waitForTimeout(500);

    // 모달 확인
    await expect(page.getByText(/REWARD/)).toBeVisible();

    // 보상 카드 확인
    await expect(page.getByText(/FIRST/)).toBeVisible();
    await expect(page.getByText(/DAILY/)).toBeVisible();
    await expect(page.getByText(/ACHIEVEMENT/)).toBeVisible();

    // 닫기 버튼
    await page.getByRole('button', { name: '✕' }).click();
    await page.waitForTimeout(200);
  });

  // S09: 퀘스트 로그
  test('S09 - 퀘스트 로그', async ({ page }) => {
    // 퀘스트 버튼 클릭
    await page.getByRole('button', { name: /퀘스트/ }).click();

    // 모달 대기
    await page.waitForTimeout(500);

    // 모달 확인 - 더 구체적인 셀렉터
    await expect(page.getByRole('heading', { name: /QUEST/ })).toBeVisible();

    // ACTIVE 퀘스트 탭 확인
    await expect(page.getByRole('button', { name: 'ACTIVE' })).toBeVisible();

    // 퀘스트 카드 확인
    await expect(page.getByText(/AI 세계/)).toBeVisible();
    await expect(page.getByText('0%', { exact: true })).toBeVisible();

    // 닫기 버튼
    await page.getByRole('button', { name: '✕' }).click();
    await page.waitForTimeout(200);
  });

  // S15: 콘솔 에러 체크
  test('S15 - 콘솔 에러 체크', async ({ page }) => {
    const errors = [];
    const warnings = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
      if (msg.type() === 'warning') warnings.push(msg.text());
    });

    await page.waitForLoadState('networkidle');

    console.log(`Errors: ${errors.length}`);
    console.log(`Warnings: ${warnings.length}`);

    // 목표: 에러 0건
    expect(errors.length).toBe(0);
  });
});