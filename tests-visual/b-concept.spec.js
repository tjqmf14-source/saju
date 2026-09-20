import { test, expect } from '@playwright/test';

async function assertNoHorizontalOverflow(page) {
  const overflow = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth + 1);
}

test('V12 desktop follows the supplied landing-page composition', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'desktop-only reference contract');
  await page.goto('/');
  await expect(page.locator('#results')).toBeVisible();

  const order = await page.evaluate(() => {
    const selectors = ['#input','.visual-keyword-showcase','.quote-band','#today','#year','#tarot','#full-report','.closing-cta'];
    return selectors.map((selector) => ({ selector, top: document.querySelector(selector)?.getBoundingClientRect().top ?? -1 }));
  });
  for (let i = 1; i < order.length; i += 1) expect(order[i].top, order[i].selector).toBeGreaterThan(order[i - 1].top);

  const hero = page.locator('.hero-primary');
  const heroBox = await hero.boundingBox();
  expect(heroBox?.width || 0).toBeGreaterThanOrEqual(1300);
  expect(heroBox?.height || 0).toBeGreaterThanOrEqual(540);

  const heroVisual = page.locator('.hero-visual');
  const heroBg = await heroVisual.evaluate((el) => getComputedStyle(el).backgroundImage);
  expect(heroBg).toContain('/oracle/b-visual-atlas.webp');

  await expect(page.locator('.visual-keyword-card')).toHaveCount(6);
  await expect(page.locator('#standards, #faq, .review-card, .faq-list')).toHaveCount(0);
  await expect(page.locator('.annual-scene, .detail-visual')).toHaveCount(0);

  const score = page.locator('.daily-primary-score');
  const scoreBox = await score.boundingBox();
  expect(Math.abs((scoreBox?.width || 0) - (scoreBox?.height || 0))).toBeLessThan(3);
  const scoreBg = await score.evaluate((el) => getComputedStyle(el).backgroundImage);
  expect(scoreBg).toContain('conic-gradient');
  const scoreAudit = await score.evaluate((el) => {
    const value=Number(el.querySelector('strong')?.textContent);
    const bound=Number(el.style.getPropertyValue('--score'));
    el.style.setProperty('--score','50');
    const half=getComputedStyle(el).backgroundImage;
    el.style.setProperty('--score','100');
    const full=getComputedStyle(el).backgroundImage;
    el.style.setProperty('--score',String(bound));
    return {value,bound,half,full};
  });
  expect(scoreAudit.bound).toBe(scoreAudit.value);
  expect(scoreAudit.half).not.toBe(scoreAudit.full);
  expect(scoreAudit.half).toContain('50%');
  expect(scoreAudit.full).toContain('100%');

  const annualBackground = await page.locator('#year').evaluate((el) => getComputedStyle(el).backgroundImage);
  expect(annualBackground).not.toContain('url(');

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
  await page.evaluate(() => scrollTo(0,0));
  await page.screenshot({ path: 'test-results/v12-reference-desktop.png', fullPage: true });
});

test('V12 remains readable and overflow-free on mobile', async ({ page }, testInfo) => {
  test.skip(!['mobile','mobile-wide','mobile-small'].includes(testInfo.project.name), 'mobile-only contract');
  await page.goto('/');
  await expect(page.locator('#results')).toBeVisible();

  const fontSize = await page.locator('.hero-copy h1').evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
  expect(fontSize).toBeGreaterThanOrEqual(38);
  expect(fontSize).toBeLessThanOrEqual(46);

  await expect(page.locator('.feature-orbit-nav a')).toHaveCount(5);
  await expect(page.locator('.visual-keyword-card')).toHaveCount(6);
  await expect(page.locator('#standards, #faq')).toHaveCount(0);

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
      formGrid:rect('.form-grid'),
      nameField:rect('.field-name'),
      premiumLink:rect('.premium-link'),
      hero:rect('.hero-primary'),
      heroVisual:rect('.hero-visual'),
      keywordShell:rect('.visual-keyword-showcase'),
      fullReport:rect('#full-report'),
      heroBackground:getComputedStyle(document.querySelector('.hero-visual')).backgroundImage,
      premiumWhiteSpace:getComputedStyle(document.querySelector('.premium-link')).whiteSpace,
      premiumFits:document.querySelector('.premium-link').scrollWidth<=document.querySelector('.premium-link').clientWidth+1,
      cards,
    };
  });
  const viewportWidth=page.viewportSize()?.width || 390;
  expect(mobileAudit.form?.width || 0).toBeGreaterThan(viewportWidth - 80);
  expect(mobileAudit.nameField?.width || 0).toBeGreaterThan((mobileAudit.formGrid?.width || 0) * .95);
  expect(mobileAudit.premiumWhiteSpace).toBe('nowrap');
  expect(mobileAudit.premiumFits).toBe(true);
  expect(mobileAudit.input?.height || 9999).toBeLessThan(1150);
  expect(mobileAudit.hero?.height || 9999).toBeLessThan(1250);
  expect(mobileAudit.heroVisual?.height || 0).toBeGreaterThan(250);
  expect(mobileAudit.keywordShell?.height || 9999).toBeLessThan(1650);
  expect(mobileAudit.fullReport?.width || 0).toBeGreaterThan(viewportWidth - 40);
  expect(mobileAudit.heroBackground).toContain('/oracle/hero-scene.svg');
  expect(mobileAudit.cards).toHaveLength(6);
  for (const card of mobileAudit.cards) {
    expect(card.width).toBeGreaterThan(120);
    expect(card.x).toBeGreaterThanOrEqual(0);
    expect(card.right).toBeLessThanOrEqual(viewportWidth);
  }

  await assertNoHorizontalOverflow(page);
  await page.evaluate(() => scrollTo(0,0));
  await page.locator('.hero-primary').screenshot({ path: `test-results/v12-hero-${testInfo.project.name}.png` });
  await page.locator('#input').screenshot({ path: `test-results/v12-input-${testInfo.project.name}.png` });
  await page.locator('.visual-keyword-showcase').screenshot({ path: `test-results/v12-keywords-${testInfo.project.name}.png` });
  await page.locator('#year').screenshot({ path: `test-results/v12-year-${testInfo.project.name}.png` });
  await page.screenshot({ path: `test-results/v12-reference-${testInfo.project.name}.png`, fullPage: true });
});

test('calculation renderers still populate all retained data targets', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#results')).toBeVisible();
  await expect(page.locator('#monthForecast .month-card')).toHaveCount(12);
  await expect(page.locator('#luckOverview .luck-overview-item')).toHaveCount(9);
  await expect(page.locator('#pillarGrid .pillar-card')).toHaveCount(4);
  await expect(page.locator('#dailyMetrics .metric-row')).toHaveCount(5);
  await expect(page.locator('#tojungQuarterGrid .quarter-card')).toHaveCount(4);
  await assertNoHorizontalOverflow(page);
});

test('tarot exposes all 78 cards as one overlapping fan without a scrollbar', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator('.tarot-preview-card')).toHaveCount(3);
  await page.locator('.tarot-options').evaluate((element) => { element.open = true; });
  await page.locator('#tarotMode').selectOption('question');
  await page.locator('#drawTarot').click();

  const deck=page.locator('#tarotDeck');
  const stage=page.locator('.tarot-fan-stage');
  await expect(page.locator('.tarot-pick')).toHaveCount(78);
  await expect(stage).toBeVisible();
  await expect(stage).toHaveAttribute('role','listbox');
  await expect(stage).toHaveAttribute('aria-multiselectable','true');
  await expect(deck).toHaveClass(/is-spread/);

  const geometry=await stage.evaluate((el)=>({
    scrollWidth:el.scrollWidth,
    clientWidth:el.clientWidth,
    overflowX:getComputedStyle(el).overflowX
  }));
  expect(geometry.overflowX).toBe('hidden');
  expect(geometry.scrollWidth).toBeLessThan(geometry.clientWidth + 12);

  const box=await stage.boundingBox();
  if(!box) throw new Error('tarot fan stage missing');
  for(const ratio of [0.2,0.5,0.8]){
    await stage.click({position:{x:box.width*ratio,y:box.height*.58}});
  }

  await expect(page.locator('.tarot-card')).toHaveCount(3);
  await expect(page.locator('.tarot-card-caption')).toHaveCount(3);
  await expect(page.locator('.tarot-reading')).toHaveCount(3);

  const revealGeometry=await page.evaluate(() => {
    const captions=[...document.querySelectorAll('.tarot-card-caption')].map((el)=>{
      const r=el.getBoundingClientRect();
      return {bottom:r.bottom,height:r.height,scrollHeight:el.scrollHeight,clientHeight:el.clientHeight};
    });
    const firstReading=document.querySelector('.tarot-reading')?.getBoundingClientRect();
    return {captions,readingTop:firstReading?.top ?? 0};
  });
  const maxCaptionBottom=Math.max(...revealGeometry.captions.map((item)=>item.bottom));
  expect(revealGeometry.readingTop).toBeGreaterThan(maxCaptionBottom + 8);
  for(const caption of revealGeometry.captions){
    expect(caption.scrollHeight).toBeLessThanOrEqual(caption.clientHeight + 1);
  }

  await assertNoHorizontalOverflow(page);
});


test('final-build typography and section geometry do not clip or overlap', async ({ page }, testInfo) => {
  await page.goto('/');
  await expect(page.locator('#results')).toBeVisible();

  const audit = await page.evaluate(() => {
    const viewportWidth=document.documentElement.clientWidth;
    const selector='h1,h2,h3,h4,p,span,b,strong,small,label,summary,button,a';
    const nodes=[...document.querySelectorAll(selector)].filter((el)=>{
      if(el.closest('.tarot-fan-stage') || el.classList.contains('skip-link') || el.classList.contains('sr-only')) return false;
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
    const sections=[...document.querySelectorAll('.hero-primary,#input,.feature-orbit-nav,.visual-keyword-showcase,.quote-band,#today,#year,#tarot,#full-report,.closing-cta')];
    const badSections=sections.filter((el)=>{
      if(el.id==='full-report' && !el.open) return false;
      const r=el.getBoundingClientRect();
      return r.width<=0 || r.height<=0 || r.right>viewportWidth+2 || r.left<-2;
    }).map((el)=>({id:el.id,cls:el.className}));
    return {outOfViewport,clipped,badSections};
  });

  expect(audit.outOfViewport, JSON.stringify(audit.outOfViewport)).toEqual([]);
  expect(audit.clipped, JSON.stringify(audit.clipped)).toEqual([]);
  expect(audit.badSections, JSON.stringify(audit.badSections)).toEqual([]);
  await assertNoHorizontalOverflow(page);
  await page.evaluate(() => scrollTo(0,0));
  await page.screenshot({ path: `test-results/v12-fullpage-${testInfo.project.name}.png`, fullPage: true });
});

test('reference-density sections stay compact on desktop and primary disclosure works', async ({ page }, testInfo) => {
  await page.goto('/');
  await expect(page.locator('#results')).toBeVisible();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeLessThan(2);

  if (testInfo.project.name === 'desktop') {
    const geometry = await page.evaluate(() => Object.fromEntries(
      ['#input', '#today', '#year', '#tarot'].map((selector) => [selector, document.querySelector(selector).getBoundingClientRect().height])
    ));
    expect(geometry['#input']).toBeLessThan(520);
    expect(geometry['#today']).toBeLessThan(370);
    expect(geometry['#year']).toBeLessThan(540);
    expect(geometry['#tarot']).toBeLessThan(400);
  }

  await expect(page.locator('#birthDate')).toBeVisible();
  await expect(page.locator('#leapField')).toBeHidden();
  await page.locator('input[name="calendar"][value="lunar"]').check();
  await expect(page.locator('.birth-date-inputs')).toBeVisible();
  await expect(page.locator('#leapField')).toBeVisible();
  const birthWidths=await page.evaluate(()=>({
    year:document.querySelector('#birthYear').getBoundingClientRect().width,
    month:document.querySelector('#birthMonth').getBoundingClientRect().width,
    day:document.querySelector('#birthDay').getBoundingClientRect().width
  }));
  expect(birthWidths.year).toBeGreaterThan(birthWidths.month * 1.35);
  expect(Math.abs(birthWidths.month-birthWidths.day)).toBeLessThan(3);
  await page.locator('input[name="calendar"][value="solar"]').check();
  await expect(page.locator('#birthDate')).toBeVisible();
  await expect(page.locator('.birth-date-inputs')).toBeHidden();
  await expect(page.locator('#leapField')).toBeHidden();

  const workCard = page.locator('.visual-keyword-card[data-report-key="career"]');
  await workCard.click();
  await expect(workCard).toHaveAttribute('aria-pressed','true');
  await expect(page.locator('#keywordInsight')).toContainText('일·직업·재능');
  const keywordTitles=[];
  for(const key of ['temperament','career','money','relationships','recovery','balance']){
    const card=page.locator(`.visual-keyword-card[data-report-key="${key}"]`);
    await card.click();
    keywordTitles.push((await page.locator('#keywordInsight h3').textContent())?.trim());
    await expect(page.locator('#keywordInsight a')).toHaveAttribute('href',`#report-${key}`);
  }
  expect(new Set(keywordTitles).size).toBe(6);

  const fullReport = page.locator('#full-report');
  await expect(fullReport).not.toHaveAttribute('open', '');
  await fullReport.locator(':scope > summary').focus();
  await page.keyboard.press('Enter');
  await expect(fullReport).toHaveAttribute('open', '');
  await expect(page.locator('#detailedReport')).toBeVisible();

  await page.locator('.closing-cta a[href="#input"]').click();
  await expect(page.locator('#input')).toBeInViewport();
  await assertNoHorizontalOverflow(page);
});


test('desktop tarot deal animation expands one stacked deck into a full overlapping fan', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'desktop animation contract');
  await page.goto('/');
  await page.locator('.tarot-options').evaluate((element) => { element.open = true; });
  await page.locator('#tarotMode').selectOption('question');
  await page.locator('#drawTarot').click();
  await expect(page.locator('.tarot-pick')).toHaveCount(78);

  const deck=page.locator('#tarotDeck');
  const stage=page.locator('.tarot-fan-stage');
  await expect(deck).toHaveClass(/is-spread/);
  await page.waitForTimeout(1500);

  const spread=await page.locator('.tarot-pick').evaluateAll((cards)=>cards.map((card)=>{
    const r=card.getBoundingClientRect();
    return {left:r.left,right:r.right,width:r.width};
  }));
  expect(spread[0].left).toBeLessThan(spread.at(-1).left);
  expect(spread.at(-1).right - spread[0].left).toBeGreaterThan(900);
  expect(spread[1].left - spread[0].left).toBeLessThan(spread[0].width * .4);

  const box=await stage.boundingBox();
  if(!box) throw new Error('tarot fan stage missing');
  await stage.hover({position:{x:box.width*.34,y:box.height*.55}});
  await expect(page.locator('.tarot-pick.is-active')).toHaveCount(1);

  const activeBounds=await page.evaluate(() => {
    const stage=document.querySelector('.tarot-fan-stage').getBoundingClientRect();
    const active=document.querySelector('.tarot-pick.is-active').getBoundingClientRect();
    return {stageTop:stage.top,stageBottom:stage.bottom,cardTop:active.top,cardBottom:active.bottom};
  });
  expect(activeBounds.cardTop).toBeGreaterThanOrEqual(activeBounds.stageTop - 1);
  expect(activeBounds.cardBottom).toBeLessThanOrEqual(activeBounds.stageBottom + 1);

  await stage.click({position:{x:box.width*.34,y:box.height*.55}});
  const selected=page.locator('.tarot-pick.selected');
  await expect(selected).toHaveCount(1);
  await expect(selected).toHaveAttribute('aria-selected','true');
  const selectedBounds=await page.evaluate(() => {
    const stage=document.querySelector('.tarot-fan-stage').getBoundingClientRect();
    const card=document.querySelector('.tarot-pick.selected').getBoundingClientRect();
    return {stageTop:stage.top,stageBottom:stage.bottom,cardTop:card.top,cardBottom:card.bottom};
  });
  expect(selectedBounds.cardTop).toBeGreaterThanOrEqual(selectedBounds.stageTop - 1);
  expect(selectedBounds.cardBottom).toBeLessThanOrEqual(selectedBounds.stageBottom + 1);

  await page.locator('#tarot').screenshot({path:'test-results/v12-tarot-78-fan-desktop.png'});
});


test('birth CTA recalculates current input and precision report exposes retained detail', async ({ page }) => {
  await page.goto('/');
  await page.locator('#name').fill('QA사용자');
  await page.locator('.birth-side-submit:visible, #birthForm .cta:visible').first().click();
  await expect(page.locator('#reportTitle')).toContainText('QA사용자');
  await expect(page.locator('#results')).toBeVisible();

  const fullReport=page.locator('#full-report');
  await page.locator('.visual-keyword-intro a[href="#full-report"]').click();
  await expect(fullReport).toHaveAttribute('open', '');
  await expect(page.locator('#yearDeepDive .year-essay')).toHaveCount(1);
  await expect(page.locator('#monthForecast .month-card')).toHaveCount(12);
  await expect(page.locator('#detailedReport .detail-chapter')).toHaveCount(13);
  await expect(page.locator('#detailedReport .detail-visual')).toHaveCount(0);
  await assertNoHorizontalOverflow(page);
});

test('keyword insight opens the matching readable precision chapter', async ({ page }) => {
  await page.goto('/');
  await page.locator('.visual-keyword-card[data-report-key="career"]').click();
  await page.locator('#keywordInsight a[href="#report-career"]').click();

  await expect(page.locator('#full-report')).toHaveAttribute('open','');
  await expect(page.locator('#report-career .detail-disclosure')).toHaveAttribute('open','');
  await expect.poll(async()=>page.evaluate(()=>{
    const target=document.querySelector('#report-career').getBoundingClientRect();
    const topbar=document.querySelector('.topbar').getBoundingClientRect();
    const nav=document.querySelector('.report-nav').getBoundingClientRect();
    return target.top-Math.max(topbar.bottom,nav.bottom);
  })).toBeGreaterThanOrEqual(-2);
  await assertNoHorizontalOverflow(page);
});

test('expanded precision report has no clipped text or viewport escape', async ({ page }, testInfo) => {
  await page.goto('/');
  await page.locator('#full-report').evaluate((el) => { el.open=true; });
  await expect(page.locator('#monthForecast .month-card')).toHaveCount(12);

  const audit=await page.evaluate(() => {
    const root=document.querySelector('#full-report');
    const viewportWidth=document.documentElement.clientWidth;
    const textNodes=[...root.querySelectorAll('h2,h3,h4,p,span,strong,small,dt,dd,summary')].filter((el)=>{
      const s=getComputedStyle(el),r=el.getBoundingClientRect();
      return s.display!=='none' && s.visibility!=='hidden' && r.width>0 && r.height>0;
    });
    return {
      escaped:textNodes.filter((el)=>{
        const r=el.getBoundingClientRect();
        return r.left < -2 || r.right > viewportWidth + 2;
      }).map((el)=>({tag:el.tagName,text:(el.textContent||'').trim().slice(0,60)})),
      clipped:textNodes.filter((el)=>{
        const s=getComputedStyle(el);
        return ['hidden','clip'].includes(s.overflowX) && el.scrollWidth > el.clientWidth + 2;
      }).map((el)=>({tag:el.tagName,text:(el.textContent||'').trim().slice(0,60)}))
    };
  });
  expect(audit.escaped,JSON.stringify(audit.escaped)).toEqual([]);
  expect(audit.clipped,JSON.stringify(audit.clipped)).toEqual([]);
  await assertNoHorizontalOverflow(page);
  await page.locator('.reading-opening').screenshot({path:`test-results/v12-report-opening-${testInfo.project.name}.png`});
  await page.locator('#detailedReport .detail-chapter').first().screenshot({path:`test-results/v12-report-chapter-${testInfo.project.name}.png`});
});

test('core form and tarot controls retain touch-friendly targets', async ({ page }) => {
  await page.goto('/');
  const audit=await page.evaluate(() => {
    const selectors=['#birthForm input','#birthForm select','#birthForm button','.birth-side-submit','#drawTarot','#full-report>summary'];
    return selectors.flatMap((selector)=>[...document.querySelectorAll(selector)]).map((el)=>{
      const r=el.getBoundingClientRect();
      return {tag:el.tagName,id:el.id||'',cls:el.className||'',width:r.width,height:r.height};
    }).filter((item)=>item.width>0 && item.height>0 && item.height<43.5);
  });
  expect(audit,JSON.stringify(audit)).toEqual([]);
});


test('invalid birth date is explained, focused, and recoverable', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'validation behavior is viewport-independent');
  await page.goto('/');
  await page.locator('#birthDate').fill('');
  await page.locator('.birth-side-submit:visible, #birthForm .cta:visible').first().click();

  await expect(page.locator('#formError')).toContainText('양력 생년월일을 달력에서 선택해 주세요.');
  await expect(page.locator('#birthDate')).toHaveAttribute('aria-invalid','true');
  await expect(page.locator('#birthDate')).toBeFocused();
  await expect(page.locator('#results')).toBeHidden();

  await page.locator('#birthDate').fill('2025-02-28');
  await expect(page.locator('#birthDate')).not.toHaveAttribute('aria-invalid','true');
  await page.locator('.birth-side-submit:visible, #birthForm .cta:visible').first().click();
  await expect(page.locator('#results')).toBeVisible();
  await expect(page.locator('#formError')).toHaveText('');
});

test('solar calendar picker and lunar compact fields both drive the retained calculator', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'calculation behavior is viewport-independent');
  await page.goto('/');

  await page.locator('#birthDate').fill('1990-01-01');
  await page.locator('.birth-side-submit:visible').click();
  await expect(page.locator('#profileBirth')).toContainText('양력 1990.01.01');

  await page.locator('input[name="calendar"][value="lunar"]').check();
  await page.locator('#birthYear').fill('1989');
  await page.locator('#birthMonth').fill('12');
  await page.locator('#birthDay').fill('5');
  await page.locator('.birth-side-submit:visible').click();
  await expect(page.locator('#profileBirth')).toContainText('양력 1990.01.01');
  await expect(page.locator('#profileBirth')).toContainText('음력 1989년 12월 5일');
});

test('calendar mode converts and preserves the same birth date across month-end and leap-month boundaries', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'calculation behavior is viewport-independent');
  await page.goto('/');

  await page.locator('#birthDate').fill('1990-01-31');
  await page.locator('input[name="calendar"][value="lunar"]').check();
  await expect(page.locator('#birthYear')).toHaveValue('1990');
  await expect(page.locator('#birthMonth')).toHaveValue('1');
  await expect(page.locator('#birthDay')).toHaveValue('5');
  await page.locator('input[name="calendar"][value="solar"]').check();
  await expect(page.locator('#birthDate')).toHaveValue('1990-01-31');

  await page.locator('#birthDate').fill('2024-02-10');
  await page.locator('input[name="calendar"][value="lunar"]').check();
  await expect(page.locator('#birthYear')).toHaveValue('2024');
  await expect(page.locator('#birthMonth')).toHaveValue('1');
  await expect(page.locator('#birthDay')).toHaveValue('1');
  await expect(page.locator('#isLeap')).toBeDisabled();
  await expect(page.locator('#leapHint')).toHaveText('이 달은 윤달 없음');
  await page.locator('input[name="calendar"][value="solar"]').check();
  await expect(page.locator('#birthDate')).toHaveValue('2024-02-10');

  await page.locator('#birthDate').fill('2023-03-22');
  await page.locator('input[name="calendar"][value="lunar"]').check();
  await expect(page.locator('#birthYear')).toHaveValue('2023');
  await expect(page.locator('#birthMonth')).toHaveValue('2');
  await expect(page.locator('#birthDay')).toHaveValue('1');
  await expect(page.locator('#isLeap')).toBeEnabled();
  await expect(page.locator('#isLeap')).toBeChecked();
  await page.locator('input[name="calendar"][value="solar"]').check();
  await expect(page.locator('#birthDate')).toHaveValue('2023-03-22');
});
