import { test, expect } from '@playwright/test';

test.describe('S15. 콘솔 에러 체크', () => {
  test('S15-1: JavaScript 에러 0건 확인', async ({ page, context }) => {
    const errors = [];
    const warnings = [];

    context.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      } else if (msg.type() === 'warning') {
        warnings.push(msg.text());
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // JavaScript 에러가 없어야 함
    expect(errors.length, `JavaScript errors found: ${errors.join(', ')}`).toBe(0);
  });

  test('S15-2: PropTypes 경고 최소화', async ({ page, context }) => {
    const propTypeWarnings = [];

    context.on('console', msg => {
      if (msg.type() === 'warning' && msg.text().includes('prop-types')) {
        propTypeWarnings.push(msg.text());
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // PropTypes 경고를 최소화해야 함
    console.log(`PropTypes warnings: ${propTypeWarnings.length}`);
    expect(propTypeWarnings.length).toBeLessThanOrEqual(2);
  });

  test('S15-3: 404 리소스 에러 체크', async ({ page, context }) => {
    const notFoundErrors = [];

    context.on('console', msg => {
      if (msg.type() === 'error' && msg.text().includes('404')) {
        notFoundErrors.push(msg.text());
      }
    });

    page.on('response', response => {
      if (response.status() === 404 && !response.url().includes('favicon')) {
        notFoundErrors.push(`404: ${response.url()}`);
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // 404 에러를 최소화해야 함 (favicon 제외)
    const filteredErrors = notFoundErrors.filter(e => !e.includes('favicon'));
    console.log(`404 errors (excluding favicon): ${filteredErrors.length}`);
    expect(filteredErrors.length).toBeLessThanOrEqual(1);
  });
});