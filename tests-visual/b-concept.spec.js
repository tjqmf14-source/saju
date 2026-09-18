import { test, expect } from '@playwright/test';

async function assertNoHorizontalOverflow(page) {
  const overflow = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth + 1);
}

test('B concept desktop composition renders with illustrated assets and reference-like order', async ({ page }, testInfo) => {
  await page.goto('/');
  await expect(page.locator('body')).toHaveAttribute('data-theme', 'modern-oracle');
  await expect(page.locator('#results')).toBeVisible();

  const title = page.locator('.hero-copy h1');
  await expect(title).toContainText('흐르는 운명 속에서');
  await expect(title).toContainText('지금의 나를 만나다');

  const heroVisual = page.locator('.hero-visual');
  const heroBox = await heroVisual.boundingBox();
  expect(heroBox?.width || 0).toBeGreaterThan(560);
  expect(heroBox?.height || 0).toBeGreaterThan(500);
  const heroBg = await heroVisual.evaluate((el) => getComputedStyle(el).backgroundImage);
  expect(heroBg).toContain('/oracle/hero-scene.svg');

  const input = page.locator('#input');
  const featureNav = page.locator('.feature-orbit-nav');
  const inputBox = await input.boundingBox();
  const navBox = await featureNav.boundingBox();
  expect((navBox?.y || 0)).toBeGreaterThan((inputBox?.y || 0));

  const cards = page.locator('.visual-keyword-card');
  await expect(cards).toHaveCount(6);
  const imagesLoaded = await cards.locator('img').evaluateAll((imgs) => imgs.every((img) => img.complete && img.naturalWidth > 0));
  expect(imagesLoaded).toBeTruthy();

  const score = page.locator('.daily-primary-score');
  const scoreBox = await score.boundingBox();
  expect(Math.abs((scoreBox?.width || 0) - (scoreBox?.height || 0))).toBeLessThan(3);
  expect(scoreBox?.width || 0).toBeGreaterThan(180);

  const annual = page.locator('.annual-scene');
  const annualBg = await annual.evaluate((el) => getComputedStyle(el).backgroundImage);
  expect(annualBg).toContain('/oracle/annual-scene.svg');

  await assertNoHorizontalOverflow(page);
  await page.screenshot({ path: `test-results/b-concept-${testInfo.project.name}.png`, fullPage: true });
});

test('B concept mobile layout stays readable and overflow-free', async ({ page }, testInfo) => {
  await page.goto('/');
  await expect(page.locator('#results')).toBeVisible();

  const fontSize = await page.locator('.hero-copy h1').evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
  expect(fontSize).toBeGreaterThanOrEqual(36);
  expect(fontSize).toBeLessThanOrEqual(46);

  await expect(page.locator('.feature-orbit-nav a')).toHaveCount(6);
  await expect(page.locator('.visual-keyword-card')).toHaveCount(6);

  const heroVisual = await page.locator('.hero-visual').boundingBox();
  expect(heroVisual?.height || 0).toBeGreaterThan(380);

  await assertNoHorizontalOverflow(page);
  await page.screenshot({ path: `test-results/b-concept-${testInfo.project.name}.png`, fullPage: true });
});
