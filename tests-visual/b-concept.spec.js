import { test, expect } from '@playwright/test';

async function assertNoHorizontalOverflow(page) {
  const overflow = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth + 1);
}

test('B concept desktop composition renders with illustrated assets and reference-like order', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'desktop-only visual contract');
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
  const cardBackgrounds = await cards.locator('.atlas-card').evaluateAll((items) => items.map((el) => getComputedStyle(el).backgroundImage));
  expect(cardBackgrounds).toHaveLength(6);
  expect(cardBackgrounds.every((value) => value.includes('/oracle/keyword-'))).toBeTruthy();

  const score = page.locator('.daily-primary-score');
  const scoreBox = await score.boundingBox();
  expect(scoreBox?.width || 0).toBeGreaterThan(180);
  expect(Math.abs((scoreBox?.width || 0) - (scoreBox?.height || 0))).toBeLessThan(3);
  const scoreStyle = await score.evaluate((el) => ({
    borderRadius:getComputedStyle(el).borderRadius,
    backgroundImage:getComputedStyle(el).backgroundImage,
  }));
  expect(scoreStyle.borderRadius).toContain('50%');
  expect(scoreStyle.backgroundImage).toContain('conic-gradient');

  const annual = page.locator('.annual-scene');
  const annualBg = await annual.evaluate((el) => getComputedStyle(el).backgroundImage);
  expect(annualBg).toContain('/oracle/annual-scene.svg');

  await assertNoHorizontalOverflow(page);
  await page.screenshot({ path: `test-results/b-concept-${testInfo.project.name}.png`, fullPage: true });
});

test('B concept mobile layout stays readable and overflow-free', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'mobile-only visual contract');
  await page.goto('/');
  await expect(page.locator('#results')).toBeVisible();

  const fontSize = await page.locator('.hero-copy h1').evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
  expect(fontSize).toBeGreaterThanOrEqual(36);
  expect(fontSize).toBeLessThanOrEqual(46);

  await expect(page.locator('.feature-orbit-nav a')).toHaveCount(6);
  await expect(page.locator('.visual-keyword-card')).toHaveCount(6);

  const heroVisual = await page.locator('.hero-visual').boundingBox();
  expect(heroVisual?.height || 0).toBeGreaterThan(240);

  await assertNoHorizontalOverflow(page);
  await page.screenshot({ path: `test-results/b-concept-${testInfo.project.name}.png`, fullPage: true });
});


test('B concept image atlas and spacing hold across all viewport profiles', async ({ page }, testInfo) => {
  await page.goto('/');
  await expect(page.locator('#results')).toBeVisible();

  const atlasResponse = await page.request.get('/oracle/b-visual-atlas.webp');
  expect(atlasResponse.ok()).toBeTruthy();
  expect(Number(atlasResponse.headers()['content-length'] || 0)).toBeGreaterThan(50000);

  const hero = page.locator('.hero-visual');
  const heroBackground = await hero.evaluate((el) => getComputedStyle(el).backgroundImage);
  expect(heroBackground).toContain('/oracle/b-visual-atlas.webp');

  const cards = page.locator('.visual-keyword-card');
  await expect(cards).toHaveCount(6);
  const visibleCards = await cards.evaluateAll((items) => items.every((el) => {
    const rect = el.getBoundingClientRect();
    return rect.width > 120 && rect.height > 180;
  }));
  expect(visibleCards).toBeTruthy();

  const annual = page.locator('.annual-scene');
  await expect(annual).toBeVisible();
  const annualBox = await annual.boundingBox();
  expect(annualBox?.height || 0).toBeGreaterThan(180);

  const panelGaps = await page.evaluate(() => {
    const input = document.querySelector('#input')?.getBoundingClientRect();
    const nav = document.querySelector('.feature-orbit-nav')?.getBoundingClientRect();
    const report = document.querySelector('.visual-keyword-showcase')?.getBoundingClientRect();
    return { inputBottom: input?.bottom || 0, navTop: nav?.top || 0, navBottom: nav?.bottom || 0, reportTop: report?.top || 0 };
  });
  expect(panelGaps.navTop).toBeGreaterThanOrEqual(panelGaps.inputBottom - 2);
  expect(panelGaps.reportTop).toBeGreaterThan(panelGaps.navBottom);

  await assertNoHorizontalOverflow(page);
  await page.screenshot({ path: `test-results/b-concept-full-${testInfo.project.name}.png`, fullPage: true });
});


test('annual, decade and natal grids stay within their section bounds', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#results')).toBeVisible();
  await expect(page.locator('#monthForecast .month-card')).toHaveCount(12);
  await expect(page.locator('#luckOverview .luck-overview-item')).toHaveCount(9);
  await expect(page.locator('#pillarGrid .pillar-card')).toHaveCount(4);
  await page.locator('#expert details').first().evaluate((details) => { details.open = true; });

  const audit = await page.evaluate(() => {
    const inspect = (selector, childSelector) => {
      const root = document.querySelector(selector);
      if (!root) return { selector, missing: true };
      const rootRect = root.getBoundingClientRect();
      const children = [...root.querySelectorAll(childSelector)];
      const escaped = children.filter((child) => {
        const rect = child.getBoundingClientRect();
        return rect.left < rootRect.left - 1 || rect.right > rootRect.right + 1;
      }).length;
      return {
        selector,
        missing: false,
        escaped,
        scrollWidth: root.scrollWidth,
        clientWidth: root.clientWidth,
        minChildWidth: children.length ? Math.min(...children.map((child) => child.getBoundingClientRect().width)) : 0,
      };
    };
    return [
      inspect('.reading-opening', '.reading-aside, .reading-main'),
      inspect('#monthForecast', '.month-card'),
      inspect('#luckOverview', '.luck-overview-item'),
      inspect('#expert .expert-content-shell', '.pillar-card, .expert-story-card, .raw-data-group'),
    ];
  });

  for (const item of audit) {
    expect(item.missing, item.selector).toBeFalsy();
    expect(item.escaped, item.selector).toBe(0);
    expect(item.scrollWidth, item.selector).toBeLessThanOrEqual(item.clientWidth + 1);
    expect(item.minChildWidth, item.selector).toBeGreaterThan(0);
  }

  await assertNoHorizontalOverflow(page);
});


test('approved reference keeps desktop content at editorial scale', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/');
  await expect(page.locator('#results')).toBeVisible();
  const geometry = await page.evaluate(() => {
    const box = (selector) => {
      const el = document.querySelector(selector);
      if (!el) return null;
      const rect = el.getBoundingClientRect();
      const style = getComputedStyle(el);
      return { width: rect.width, height: rect.height, fontSize: parseFloat(style.fontSize) || 0 };
    };
    return {
      shell: box('.agency-shell'),
      hero: box('.hero-primary'),
      heroTitle: box('.hero-copy h1'),
      keywords: box('.visual-keyword-showcase'),
      keywordCards: [...document.querySelectorAll('.visual-keyword-card')].map((el) => el.getBoundingClientRect().width),
      today: box('#today'),
      annual: box('.year-panel'),
    };
  });
  expect(geometry.shell?.width || 0).toBeGreaterThanOrEqual(1300);
  expect(geometry.hero?.height || 0).toBeGreaterThanOrEqual(560);
  expect(geometry.heroTitle?.fontSize || 0).toBeGreaterThanOrEqual(52);
  expect(geometry.keywords?.width || 0).toBeGreaterThanOrEqual(1300);
  expect(geometry.keywordCards).toHaveLength(6);
  expect(Math.min(...geometry.keywordCards)).toBeGreaterThan(130);
  expect(geometry.today?.width || 0).toBeGreaterThanOrEqual(1300);
  expect(geometry.annual?.width || 0).toBeGreaterThanOrEqual(1300);
  await assertNoHorizontalOverflow(page);
});
