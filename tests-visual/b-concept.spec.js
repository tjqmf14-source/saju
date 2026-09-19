import { test, expect } from '@playwright/test';

async function assertNoHorizontalOverflow(page) {
  const overflow = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth + 1);
}

test('V11 desktop follows the supplied landing-page composition', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'desktop-only reference contract');
  await page.goto('/');
  await expect(page.locator('#results')).toBeVisible();

  const order = await page.evaluate(() => {
    const selectors = ['#input','.visual-keyword-showcase','.quote-band','#today','#year','#tarot','#reviews','#faq','.closing-cta'];
    return selectors.map((selector) => ({ selector, top: document.querySelector(selector)?.getBoundingClientRect().top ?? -1 }));
  });
  for (let i = 1; i < order.length; i += 1) expect(order[i].top, order[i].selector).toBeGreaterThan(order[i - 1].top);

  const hero = page.locator('.hero-primary');
  const heroBox = await hero.boundingBox();
  expect(heroBox?.width || 0).toBeGreaterThanOrEqual(1300);
  expect(heroBox?.height || 0).toBeGreaterThanOrEqual(560);

  const heroVisual = page.locator('.hero-visual');
  const heroBg = await heroVisual.evaluate((el) => getComputedStyle(el).backgroundImage);
  expect(heroBg).toContain('/oracle/b-visual-atlas.webp');

  await expect(page.locator('.visual-keyword-card')).toHaveCount(6);
  await expect(page.locator('.review-card')).toHaveCount(3);
  await expect(page.locator('.faq-list details')).toHaveCount(5);

  const score = page.locator('.daily-primary-score');
  const scoreBox = await score.boundingBox();
  expect(Math.abs((scoreBox?.width || 0) - (scoreBox?.height || 0))).toBeLessThan(3);
  const scoreBg = await score.evaluate((el) => getComputedStyle(el).backgroundImage);
  expect(scoreBg).toContain('conic-gradient');

  const minFont = await page.evaluate(() => {
    const items = [...document.querySelectorAll('body *')].filter((el) => {
      const s = getComputedStyle(el);
      if (s.display === 'none' || s.visibility === 'hidden') return false;
      if (['SVG','SYMBOL','PATH','USE'].includes(el.tagName)) return false;
      return [...el.childNodes].some((node) => node.nodeType === Node.TEXT_NODE && node.textContent.trim());
    });
    return Math.min(...items.map((el) => parseFloat(getComputedStyle(el).fontSize)).filter(Number.isFinite));
  });
  expect(minFont).toBeGreaterThanOrEqual(15);

  await assertNoHorizontalOverflow(page);
  await page.screenshot({ path: 'test-results/v11-reference-desktop.png', fullPage: true });
});

test('V11 remains readable and overflow-free on mobile', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'mobile-only contract');
  await page.goto('/');
  await expect(page.locator('#results')).toBeVisible();

  const fontSize = await page.locator('.hero-copy h1').evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
  expect(fontSize).toBeGreaterThanOrEqual(38);
  expect(fontSize).toBeLessThanOrEqual(46);

  await expect(page.locator('.feature-orbit-nav a')).toHaveCount(6);
  await expect(page.locator('.visual-keyword-card')).toHaveCount(6);
  await expect(page.locator('.review-card')).toHaveCount(3);

  const mobileAudit = await page.evaluate(() => {
    const rect = (selector) => {
      const el = document.querySelector(selector);
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { x:r.x, width:r.width, height:r.height, right:r.right };
    };
    const cards=[...document.querySelectorAll('.visual-keyword-card')].map((el)=>{
      const r=el.getBoundingClientRect();
      return { x:r.x, width:r.width, height:r.height, right:r.right };
    });
    return {
      input:rect('#input'),
      form:rect('#birthForm'),
      hero:rect('.hero-primary'),
      heroVisual:rect('.hero-visual'),
      keywordShell:rect('.visual-keyword-showcase'),
      faq:rect('#faq'),
      faqList:rect('.faq-list'),
      heroBackground:getComputedStyle(document.querySelector('.hero-visual')).backgroundImage,
      cards,
    };
  });
  expect(mobileAudit.form?.width || 0).toBeGreaterThan(300);
  expect(mobileAudit.input?.height || 9999).toBeLessThan(1150);
  expect(mobileAudit.hero?.height || 9999).toBeLessThan(1250);
  expect(mobileAudit.heroVisual?.height || 0).toBeGreaterThan(250);
  expect(mobileAudit.keywordShell?.height || 9999).toBeLessThan(1650);
  expect(mobileAudit.faq?.width || 0).toBeGreaterThan(340);
  expect(mobileAudit.faqList?.width || 0).toBeGreaterThan(300);
  expect(mobileAudit.heroBackground).toContain('/oracle/hero-scene.svg');
  expect(mobileAudit.cards).toHaveLength(6);
  for (const card of mobileAudit.cards) {
    expect(card.width).toBeGreaterThan(140);
    expect(card.x).toBeGreaterThanOrEqual(0);
    expect(card.right).toBeLessThanOrEqual(390);
  }

  await assertNoHorizontalOverflow(page);
  await page.screenshot({ path: 'test-results/v11-reference-mobile.png', fullPage: true });
});

test('calculation renderers still populate all retained data targets', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#results')).toBeVisible();
  await expect(page.locator('#monthForecast .month-card')).toHaveCount(12);
  await expect(page.locator('#luckOverview .luck-overview-item')).toHaveCount(9);
  await expect(page.locator('#pillarGrid .pillar-card')).toHaveCount(4);
  await expect(page.locator('#dailyMetrics .metric-row')).toHaveCount(4);
  await expect(page.locator('#tojungQuarterGrid .quarter-card')).toHaveCount(4);
  await assertNoHorizontalOverflow(page);
});

test('tarot exposes all 78 cards in an accessible rolling selector', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator('.tarot-preview-card')).toHaveCount(3);
  await page.locator('#tarotMode').selectOption('question');
  await page.locator('#drawTarot').click();
  await expect(page.locator('.tarot-pick')).toHaveCount(78);
  await expect(page.locator('.tarot-roller-viewport')).toBeVisible();
  const geometry = await page.locator('.tarot-roller-viewport').evaluate((el) => ({
    scrollWidth:el.scrollWidth,
    clientWidth:el.clientWidth
  }));
  expect(geometry.scrollWidth).toBeGreaterThan(geometry.clientWidth * 5);
  const first = page.locator('.tarot-pick').nth(0);
  const second = page.locator('.tarot-pick').nth(1);
  const third = page.locator('.tarot-pick').nth(2);
  await first.click();
  await expect(first).toHaveClass(/selected/);
  await second.click();
  await third.click();
  await expect(page.locator('.tarot-card')).toHaveCount(3);
  await expect(page.locator('.tarot-reading')).toHaveCount(3);
  await assertNoHorizontalOverflow(page);
});


test('final-build typography and section geometry do not clip or overlap', async ({ page }, testInfo) => {
  await page.goto('/');
  await expect(page.locator('#results')).toBeVisible();

  const audit = await page.evaluate(() => {
    const viewportWidth=document.documentElement.clientWidth;
    const selector='h1,h2,h3,h4,p,span,b,strong,small,label,summary,button,a';
    const nodes=[...document.querySelectorAll(selector)].filter((el)=>{
      if(el.closest('.tarot-roller-viewport')) return false;
      const style=getComputedStyle(el);
      const rect=el.getBoundingClientRect();
      return style.display!=='none' && style.visibility!=='hidden' && rect.width>0 && rect.height>0;
    });
    const outOfViewport=nodes.filter((el)=>{
      const rect=el.getBoundingClientRect();
      return rect.left < -2 || rect.right > viewportWidth + 2;
    }).map((el)=>({tag:el.tagName,cls:el.className,text:(el.textContent||'').trim().slice(0,60),left:el.getBoundingClientRect().left,right:el.getBoundingClientRect().right}));
    const clipped=nodes.filter((el)=>{
      const style=getComputedStyle(el);
      const clippedX=['hidden','clip'].includes(style.overflowX);
      return clippedX && el.scrollWidth > el.clientWidth + 2;
    }).map((el)=>({tag:el.tagName,cls:el.className,text:(el.textContent||'').trim().slice(0,60),scrollWidth:el.scrollWidth,clientWidth:el.clientWidth}));
    const sections=[...document.querySelectorAll('.hero-primary,#input,.feature-orbit-nav,.visual-keyword-showcase,.quote-band,#today,#year,#tarot,#reviews,#faq,#full-report,.closing-cta')];
    const badSections=sections.filter((el)=>{
      const r=el.getBoundingClientRect();
      return r.width<=0 || r.height<=0 || r.right>viewportWidth+2 || r.left<-2;
    }).map((el)=>({id:el.id,cls:el.className}));
    return {outOfViewport,clipped,badSections};
  });

  expect(audit.outOfViewport, JSON.stringify(audit.outOfViewport)).toEqual([]);
  expect(audit.clipped, JSON.stringify(audit.clipped)).toEqual([]);
  expect(audit.badSections, JSON.stringify(audit.badSections)).toEqual([]);
  await assertNoHorizontalOverflow(page);
});


test('desktop tarot roll visibly travels through the full deck and can be interrupted', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'desktop animation contract');
  await page.goto('/');
  await page.locator('#tarotMode').selectOption('question');
  await page.locator('#drawTarot').click();
  await expect(page.locator('.tarot-pick')).toHaveCount(78);
  const viewport=page.locator('.tarot-roller-viewport');
  const before=await viewport.evaluate((el)=>el.scrollLeft);
  await page.waitForTimeout(450);
  const after=await viewport.evaluate((el)=>el.scrollLeft);
  expect(after).toBeGreaterThan(before + 100);
  await expect(page.locator('#tarotDeck')).toHaveClass(/is-rolling/);
  await viewport.dispatchEvent('pointerdown',{pointerType:'mouse'});
  await expect(page.locator('#tarotDeck')).not.toHaveClass(/is-rolling/);
  await page.locator('#tarot').screenshot({path:'test-results/tarot-78-roller-desktop.png'});
});
