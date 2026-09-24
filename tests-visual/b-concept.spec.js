import { test, expect } from '@playwright/test';

async function assertNoHorizontalOverflow(page) {
  const overflow = await page.evaluate(() => {
    const clientWidth = document.documentElement.clientWidth;
    const offenders = [...document.querySelectorAll('body *')].map((el) => {
      const rect = el.getBoundingClientRect();
      const style = getComputedStyle(el);
      return {
        tag: el.tagName,
        id: el.id || '',
        cls: typeof el.className === 'string' ? el.className : '',
        left: Math.round(rect.left * 10) / 10,
        right: Math.round(rect.right * 10) / 10,
        width: Math.round(rect.width * 10) / 10,
        position: style.position,
      };
    }).filter((item) => item.width > 0 && (item.left < -1 || item.right > clientWidth + 1)).slice(0, 20);
    return {
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth,
      offenders,
    };
  });
  expect(overflow.scrollWidth, JSON.stringify(overflow)).toBeLessThanOrEqual(overflow.clientWidth + 1);
}

async function selectCalendarMode(page, mode) {
  const label = mode === 'lunar' ? '음력' : '양력';
  await page.locator('.segmented label').filter({ hasText: label }).click();
  await expect(page.locator(`input[name="calendar"][value="${mode}"]`)).toBeChecked();
}

test('Product V3 desktop preserves the editorial landing-page composition', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'desktop-only reference contract');
  await page.goto('/');
  await expect(page.locator('#results')).toBeVisible();

  const order = await page.evaluate(() => {
    const selectors = ['#input','.visual-keyword-showcase','#today','#year','#compatibility','#tarot','#full-report'];
    return selectors.map((selector) => ({ selector, top: document.querySelector(selector)?.getBoundingClientRect().top ?? -1 }));
  });
  for (let i = 1; i < order.length; i += 1) expect(order[i].top, order[i].selector).toBeGreaterThan(order[i - 1].top);

  const hero = page.locator('.hero-primary');
  const heroBox = await hero.boundingBox();
  expect(heroBox?.width || 0).toBeGreaterThanOrEqual(1100);
  expect(heroBox?.height || 0).toBeGreaterThanOrEqual(360);
  expect(heroBox?.height || 9999).toBeLessThanOrEqual(700);

  const heroVisual = page.locator('.hero-visual');
  await expect(heroVisual).toBeVisible();
  const heroBg = await heroVisual.evaluate((el) => getComputedStyle(el).backgroundImage);
  expect(heroBg).not.toBe('none');
  expect(heroBg).toMatch(/^url\(/);
  const heroVisualBox = await heroVisual.boundingBox();
  expect(heroVisualBox?.height || 0).toBeGreaterThan(320);

  await expect(page.locator('.visual-keyword-card')).toHaveCount(5);
  await expect(page.locator('.trust-strip p')).toHaveCount(3);
  await expect(page.locator('#standards, #faq, .review-card, .faq-list')).toHaveCount(0);
  await expect(page.locator('.annual-scene, .detail-visual')).toHaveCount(0);

  const score = page.locator('.daily-primary-score');
  const scoreBox = await score.boundingBox();
  expect(Math.abs((scoreBox?.width || 0) - (scoreBox?.height || 0))).toBeLessThan(3);
  const scoreAudit = await score.evaluate((el) => {
    const value=Number(el.querySelector('strong')?.textContent);
    const circle=el.querySelector('.daily-score-progress');
    const dash=circle?.getAttribute('stroke-dasharray');
    const pathLength=circle?.getAttribute('pathLength');
    return {value,meter:Number(el.getAttribute('aria-valuenow')),dash,pathLength,track:!!el.querySelector('.daily-score-track')};
  });
  expect(scoreAudit.meter).toBe(scoreAudit.value);
  expect(scoreAudit.pathLength).toBe('100');
  expect(scoreAudit.dash).toBe(`${scoreAudit.value} ${100-scoreAudit.value}`);
  expect(scoreAudit.track).toBe(true);
  await score.evaluate((el)=>{
    el.setAttribute('aria-valuenow','50');
    el.querySelector('strong').textContent='50';
    el.querySelector('.daily-score-progress').setAttribute('stroke-dasharray','50 50');
  });
  await score.screenshot({path:'test-results/v13-score-50.png'});
  await score.evaluate((el)=>{
    el.setAttribute('aria-valuenow','100');
    el.querySelector('strong').textContent='100';
    el.querySelector('.daily-score-progress').setAttribute('stroke-dasharray','100 0');
  });
  await score.screenshot({path:'test-results/v13-score-100.png'});
  await score.evaluate((el,{value,dash})=>{
    el.setAttribute('aria-valuenow',String(value));
    el.querySelector('strong').textContent=String(value);
    el.querySelector('.daily-score-progress').setAttribute('stroke-dasharray',dash);
  },{value:scoreAudit.value,dash:scoreAudit.dash});

  const annualBackground = await page.locator('#year').evaluate((el) => getComputedStyle(el).backgroundImage);
  expect(annualBackground).not.toContain('url(');

  const typography = await page.evaluate(() => ({
    body: parseFloat(getComputedStyle(document.body).fontSize),
    input: parseFloat(getComputedStyle(document.querySelector('#birthDate')).fontSize),
    button: parseFloat(getComputedStyle(document.querySelector('#birthForm .cta')).fontSize)
  }));
  expect(typography.body).toBeGreaterThanOrEqual(16);
  expect(typography.input).toBeGreaterThanOrEqual(16);
  expect(typography.button).toBeGreaterThanOrEqual(13);

  await assertNoHorizontalOverflow(page);
  await page.evaluate(() => scrollTo(0,0));
  await page.screenshot({ path: 'test-results/v17-reference-desktop.png', fullPage: true });
});

test('Product V3 is app-like, readable and overflow-free on mobile', async ({ page }, testInfo) => {
  test.skip(!['mobile','mobile-wide','mobile-small'].includes(testInfo.project.name), 'mobile-only contract');
  await page.goto('/');
  await expect(page.locator('#results')).toBeVisible();

  const fontSize = await page.locator('.hero-copy h1').evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
  expect(fontSize).toBeGreaterThanOrEqual(36);
  expect(fontSize).toBeLessThanOrEqual(46);

  await expect(page.locator('.feature-orbit-nav a')).toHaveCount(4);
  await expect(page.locator('.visual-keyword-card')).toHaveCount(5);
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
      compatibility:rect('#compatibility'),
      mobileNav:rect('.mobile-bottom-nav'),
      hero:rect('.hero-primary'),
      heroVisual:rect('.hero-visual'),
      keywordShell:rect('.visual-keyword-showcase'),
      fullReport:rect('#full-report'),
      heroBackground:getComputedStyle(document.querySelector('.hero-visual')).backgroundImage,
      premiumWhiteSpace:getComputedStyle(document.querySelector('.premium-link')).whiteSpace,
      premiumFits:document.querySelector('.premium-link').scrollWidth<=document.querySelector('.premium-link').clientWidth+1,
      topbarPosition:getComputedStyle(document.querySelector('.topbar')).position,
      cards,
    };
  });
  const viewportWidth=page.viewportSize()?.width || 390;
  expect(mobileAudit.form?.width || 0).toBeGreaterThan(viewportWidth - 80);
  expect(mobileAudit.nameField?.width || 0).toBeGreaterThan((mobileAudit.formGrid?.width || 0) * .95);
  expect(mobileAudit.topbarPosition).toBe('sticky');
  await expect(page.locator('.feature-orbit-nav')).toBeHidden();
  const trustTop=await page.locator('.trust-strip').boundingBox();
  const heroTop=await page.locator('.hero-primary').boundingBox();
  expect((trustTop?.y||0)).toBeGreaterThan((heroTop?.y||0));
  const keywordColumns=await page.locator('.visual-keyword-showcase').evaluate((el)=>getComputedStyle(el).gridTemplateColumns.split(' ').filter(Boolean).length);
  expect(keywordColumns).toBeGreaterThanOrEqual(2);
  expect(mobileAudit.input?.height || 9999).toBeLessThan(1250);
  expect(mobileAudit.hero?.height || 9999).toBeLessThan(1250);
  expect(mobileAudit.compatibility?.width || 0).toBeGreaterThan(viewportWidth - 40);
  expect(mobileAudit.mobileNav?.height || 0).toBeGreaterThanOrEqual(60);
  expect(mobileAudit.heroVisual?.height || 0).toBe(0);
  expect(mobileAudit.keywordShell?.height || 9999).toBeLessThan(1650);
  expect(mobileAudit.fullReport?.width || 0).toBeGreaterThan(viewportWidth - 40);
  expect(mobileAudit.heroBackground).toBe('none');
  const mobileType=await page.evaluate(()=>({
    body:parseFloat(getComputedStyle(document.body).fontSize),
    birthDate:parseFloat(getComputedStyle(document.querySelector('#birthDate')).fontSize),
    select:parseFloat(getComputedStyle(document.querySelector('#gender')).fontSize)
  }));
  expect(mobileType.body).toBeGreaterThanOrEqual(18);
  expect(mobileType.birthDate).toBeGreaterThanOrEqual(16);
  expect(mobileType.select).toBeGreaterThanOrEqual(16);
  expect(mobileAudit.cards).toHaveLength(5);
  for (const card of mobileAudit.cards) {
    expect(card.width).toBeGreaterThan(120);
    expect(card.x).toBeGreaterThanOrEqual(0);
    expect(card.right).toBeLessThanOrEqual(viewportWidth);
  }

  await assertNoHorizontalOverflow(page);
  await page.evaluate(() => scrollTo(0,0));
  await page.locator('.hero-primary').screenshot({ path: `test-results/v17-hero-${testInfo.project.name}.png` });
  await page.locator('#input').screenshot({ path: `test-results/v17-input-${testInfo.project.name}.png` });
  await page.locator('.visual-keyword-showcase').screenshot({ path: `test-results/v17-keywords-${testInfo.project.name}.png` });
  await page.locator('#year').screenshot({ path: `test-results/v17-year-${testInfo.project.name}.png` });
  await page.screenshot({ path: `test-results/v17-reference-${testInfo.project.name}.png`, fullPage: true });
});

test('calculation renderers still populate all retained data targets', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#results')).toBeVisible();
  await expect(page.locator('#monthForecast .month-card')).toHaveCount(12);
  await expect(page.locator('#luckOverview .luck-overview-item')).toHaveCount(9);
  await expect(page.locator('#pillarGrid .pillar-card')).toHaveCount(4);
  await expect(page.locator('#dailyMetrics .metric-row')).toHaveCount(5);
  await expect(page.locator('#dailyActionGuide article')).toHaveCount(3);
  await expect(page.locator('#dailyBriefGrid article')).toHaveCount(4);
  await expect(page.locator('#dailyTimeFlow article')).toHaveCount(6);
  await expect(page.locator('#weeklyPreview .weekly-day')).toHaveCount(7);
  await expect(page.locator('#weeklyPreview')).not.toContainText('연애이');
  await expect(page.locator('#weeklyPreview')).not.toContainText('연애은');
  await expect(page.locator('.daily-report-extra')).not.toHaveAttribute('open','');
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

  const revealFits=await page.locator('.tarot-card-image').evaluateAll((images)=>images.map((img)=>getComputedStyle(img).objectFit));
  expect(revealFits.length).toBeGreaterThan(0);
  expect(revealFits.every((fit)=>fit==='contain')).toBe(true);

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
    const selector='h1,h2,h3,h4,p,span,b,strong,small,label,summary,button,a,input,select,textarea,li,dt,dd';
    const nodes=[...document.querySelectorAll(selector)].filter((el)=>{
      if(el.closest('.tarot-fan-stage') || el.classList.contains('skip-link') || el.classList.contains('sr-only')) return false;
      const closedDetails=el.closest('details:not([open])');
      if(closedDetails && !el.closest('summary')) return false;
      const style=getComputedStyle(el);
      const rect=el.getBoundingClientRect();
      return style.display!=='none' && style.visibility!=='hidden' && rect.width>0 && rect.height>0;
    });
    const horizontalScrollers='.feature-orbit-nav,.hero-proof-oracles,.trust-strip,.daily-time-flow,.weekly-preview,.report-nav,.tarot-reveal-deck';
    const outOfViewport=nodes.filter((el)=>{
      if(el.closest(horizontalScrollers)) return false;
      const rect=el.getBoundingClientRect();
      return rect.left < -2 || rect.right > viewportWidth + 2;
    }).map((el)=>({tag:el.tagName,cls:el.className,text:(el.textContent||'').trim().slice(0,60),left:el.getBoundingClientRect().left,right:el.getBoundingClientRect().right}));
    const clipped=nodes.filter((el)=>{
      const style=getComputedStyle(el);
      if(style.textOverflow==='ellipsis' || el.closest(horizontalScrollers)) return false;
      const clippedX=['hidden','clip'].includes(style.overflowX);
      return clippedX && el.scrollWidth > el.clientWidth + 2;
    }).map((el)=>({tag:el.tagName,cls:el.className,text:(el.textContent||'').trim().slice(0,60),scrollWidth:el.scrollWidth,clientWidth:el.clientWidth}));
    const undersized=nodes.filter((el)=>{
      const text=((el.textContent||'') || ('value' in el ? el.value : '')).trim();
      return text && parseFloat(getComputedStyle(el).fontSize) < 13.3;
    }).map((el)=>({tag:el.tagName,cls:el.className,text:((el.textContent||'') || ('value' in el ? el.value : '')).trim().slice(0,60),fontSize:getComputedStyle(el).fontSize}));
    const sections=[...document.querySelectorAll('.hero-primary,#input,.feature-orbit-nav,.visual-keyword-showcase,#today,#year,#compatibility,#tarot,#full-report')];
    const badSections=sections.filter((el)=>{
      const style=getComputedStyle(el);
      if(style.display==='none' || style.visibility==='hidden') return false;
      if(el.id==='full-report' && !el.open) return false;
      const r=el.getBoundingClientRect();
      return r.width<=0 || r.height<=0 || r.right>viewportWidth+2 || r.left<-2;
    }).map((el)=>({id:el.id,cls:el.className}));
    return {outOfViewport,clipped,badSections,undersized};
  });

  expect(audit.outOfViewport, JSON.stringify(audit.outOfViewport)).toEqual([]);
  expect(audit.clipped, JSON.stringify(audit.clipped)).toEqual([]);
  expect(audit.badSections, JSON.stringify(audit.badSections)).toEqual([]);
  expect(audit.undersized, JSON.stringify(audit.undersized)).toEqual([]);
  await assertNoHorizontalOverflow(page);
  await page.evaluate(() => scrollTo(0,0));
  await page.screenshot({ path: `test-results/v17-fullpage-${testInfo.project.name}.png`, fullPage: true });
});

test('reference-density sections stay compact on desktop and primary disclosure works', async ({ page }, testInfo) => {
  await page.goto('/');
  await expect(page.locator('#results')).toBeVisible();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeLessThan(2);

  if (testInfo.project.name === 'desktop') {
    const geometry = await page.evaluate(() => Object.fromEntries(
      ['#input', '#today', '#year', '#tarot'].map((selector) => [selector, document.querySelector(selector).getBoundingClientRect().height])
    ));
    expect(geometry['#input']).toBeLessThan(760);
    expect(geometry['#today']).toBeLessThan(1200);
    expect(geometry['#year']).toBeLessThan(900);
    expect(geometry['#tarot']).toBeLessThan(850);
  }

  await expect(page.locator('#birthDate')).toBeVisible();
  await expect(page.locator('#leapField')).toBeHidden();
  await selectCalendarMode(page,'lunar');
  await expect(page.locator('.birth-date-inputs')).toBeVisible();
  await expect(page.locator('#leapField')).toBeVisible();
  const birthWidths=await page.evaluate(()=>({
    year:document.querySelector('#birthYear').getBoundingClientRect().width,
    month:document.querySelector('#birthMonth').getBoundingClientRect().width,
    day:document.querySelector('#birthDay').getBoundingClientRect().width
  }));
  expect(birthWidths.year).toBeGreaterThan(birthWidths.month * 1.35);
  expect(Math.abs(birthWidths.month-birthWidths.day)).toBeLessThan(3);
  await selectCalendarMode(page,'solar');
  await expect(page.locator('#birthDate')).toBeVisible();
  await expect(page.locator('.birth-date-inputs')).toBeHidden();
  await expect(page.locator('#leapField')).toBeHidden();

  const workCard = page.locator('.visual-keyword-card[data-report-key="career"]');
  await workCard.click();
  await expect(workCard).toHaveAttribute('aria-pressed','true');
  await expect(page.locator('#keywordInsight')).toContainText('일과 진로');
  const keywordTitles=[];
  for(const key of ['temperament','career','money','relationships','recovery']){
    const card=page.locator(`.visual-keyword-card[data-report-key="${key}"]`);
    await card.click();
    keywordTitles.push((await page.locator('#keywordInsight h3').textContent())?.trim());
    await expect(page.locator('#keywordInsight a')).toHaveAttribute('href',`#report-${key}`);
  }
  expect(new Set(keywordTitles).size).toBe(5);

  const fullReport = page.locator('#full-report');
  await expect(fullReport).not.toHaveAttribute('open', '');
  await fullReport.locator(':scope > summary').focus();
  await page.keyboard.press('Enter');
  await expect(fullReport).toHaveAttribute('open', '');
  await expect(page.locator('#detailedReport')).toBeVisible();

  await page.locator('.topnav a[href="#input"]:visible, .mobile-bottom-nav a[href="#input"]:visible, .hero-cta[href="#input"]:visible').first().click();
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

  await page.locator('#tarot').screenshot({path:'test-results/v17-tarot-78-fan-desktop.png'});
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
  await expect(page.locator('#detailedReport .easy-reading-label')).toHaveCount(13);
  await expect(page.locator('#report-balance')).not.toContainText('신강');
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
  const monthCopy=await page.locator('#monthForecast .month-card').evaluateAll((cards)=>cards.map((card)=>({
    role:card.querySelector('.month-card-head strong')?.textContent,
    focus:card.querySelector('.month-card-focus')?.textContent,
    action:card.querySelector('.month-card-action')?.textContent
  })));
  expect(new Set(monthCopy.map((item)=>item.focus)).size).toBe(12);
  expect(new Set(monthCopy.map((item)=>item.action)).size).toBe(12);

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
  await page.locator('.reading-opening').screenshot({path:`test-results/v17-report-opening-${testInfo.project.name}.png`});
  await page.locator('#report-temperament').screenshot({path:`test-results/v17-report-chapter-${testInfo.project.name}.png`});
  if(['desktop','mobile'].includes(testInfo.project.name)) await page.locator('#annualDetailReport').screenshot({path:`test-results/v13-month-flow-${testInfo.project.name}.png`});
});

test('core form and tarot controls retain touch-friendly targets', async ({ page }) => {
  await page.goto('/');
  const audit=await page.evaluate(() => {
    const selectors=[
      '#birthForm input:not([type="radio"]):not([type="checkbox"])',
      '#birthForm select',
      '#birthForm button',
      '.segmented span',
      '.precision-switch',
      '.leap-field.active',
      '.birth-side-submit',
      '#drawTarot',
      '#full-report>summary'
    ];
    return selectors.flatMap((selector)=>[...document.querySelectorAll(selector)]).map((el)=>{
      const r=el.getBoundingClientRect();
      const style=getComputedStyle(el);
      return {tag:el.tagName,id:el.id||'',cls:el.className||'',width:r.width,height:r.height,display:style.display,visibility:style.visibility};
    }).filter((item)=>item.display!=='none' && item.visibility!=='hidden' && item.width>0 && item.height>0 && item.height<43.5);
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

  await expect(page.locator('#birthYearQuick')).toBeHidden();
  await page.locator('#birthDate').fill('1990-01-01');
  await expect(page.locator('#birthDate')).toHaveValue('1990-01-01');
  await page.locator('#birthForm .cta:visible').click();
  await expect(page.locator('#profileBirth')).toContainText('양력 1990.01.01');

  await selectCalendarMode(page,'lunar');
  await expect(page.locator('#birthYearQuick')).toBeHidden();
  await page.locator('#birthYear').fill('1989');
  await page.locator('#birthMonth').fill('12');
  await page.locator('#birthDay').fill('5');
  await page.locator('#birthForm .cta:visible').click();
  await expect(page.locator('#profileBirth')).toContainText('양력 1990.01.01');
  await expect(page.locator('#profileBirth')).toContainText('음력 1989년 12월 5일');
});

test('calendar mode converts and preserves the same birth date across month-end and leap-month boundaries', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'calculation behavior is viewport-independent');
  await page.goto('/');

  await page.locator('#birthDate').fill('1990-01-31');
  await selectCalendarMode(page,'lunar');
  await expect(page.locator('#birthYear')).toHaveValue('1990');
  await expect(page.locator('#birthMonth')).toHaveValue('1');
  await expect(page.locator('#birthDay')).toHaveValue('5');
  await selectCalendarMode(page,'solar');
  await expect(page.locator('#birthDate')).toHaveValue('1990-01-31');

  await page.locator('#birthDate').fill('2024-02-10');
  await selectCalendarMode(page,'lunar');
  await expect(page.locator('#birthYear')).toHaveValue('2024');
  await expect(page.locator('#birthMonth')).toHaveValue('1');
  await expect(page.locator('#birthDay')).toHaveValue('1');
  await expect(page.locator('#isLeap')).toBeDisabled();
  await expect(page.locator('#leapHint')).toHaveText('이 달은 윤달 없음');
  await selectCalendarMode(page,'solar');
  await expect(page.locator('#birthDate')).toHaveValue('2024-02-10');

  await page.locator('#birthDate').fill('2023-03-22');
  await selectCalendarMode(page,'lunar');
  await expect(page.locator('#birthYear')).toHaveValue('2023');
  await expect(page.locator('#birthMonth')).toHaveValue('2');
  await expect(page.locator('#birthDay')).toHaveValue('1');
  await expect(page.locator('#isLeap')).toBeEnabled();
  await expect(page.locator('#isLeap')).toBeChecked();
  await selectCalendarMode(page,'solar');
  await expect(page.locator('#birthDate')).toHaveValue('2023-03-22');
});


test('commercial UX interactions work without a backend', async ({ page }, testInfo) => {
  test.skip(!['desktop','mobile-small'].includes(testInfo.project.name), 'representative interaction contract');
  await page.goto('/');
  await expect(page.locator('#results')).toBeVisible();

  const compatibilityGeometry = await page.evaluate(() => {
    const rect=(selector)=>{ const el=document.querySelector(selector); const r=el?.getBoundingClientRect(); return r?{width:r.width,height:r.height,right:r.right,left:r.left}:null; };
    return {
      heading:rect('#compatibility > .section-heading'),
      form:rect('#compatibilityForm'),
      submit:rect('#compatibilityForm button[type="submit"]'),
      panel:rect('#compatibility')
    };
  });
  expect(compatibilityGeometry.heading?.width || 0).toBeGreaterThan(180);
  expect(compatibilityGeometry.heading?.height || 999).toBeLessThan(380);
  expect(compatibilityGeometry.submit?.height || 999).toBeLessThan(70);
  if(testInfo.project.name==='desktop'){
    expect(compatibilityGeometry.form?.height || 999).toBeLessThan(520);
    expect(compatibilityGeometry.panel?.height || 999).toBeLessThan(760);
  }else{
    expect(compatibilityGeometry.form?.height || 999).toBeLessThan(560);
  }

  // Local-only profile save/load.
  await page.locator('#name').fill('테스트');
  await page.locator('#birthDate').fill('1988-05-03');
  await page.locator('#saveProfile').click();
  await expect(page.locator('#profileStatus')).toContainText('이 기기에 프로필을 저장했습니다');
  await expect(page.locator('#profileSelect option')).toHaveCount(2);
  await expect(page.locator('#partnerProfileSelect option')).toHaveCount(2);
  const savedId = await page.locator('#profileSelect option').nth(1).getAttribute('value');
  await page.locator('#name').fill('변경');
  await page.locator('#profileSelect').selectOption(savedId);
  await expect(page.locator('#name')).toHaveValue('테스트');
  await expect(page.locator('#birthDate')).toHaveValue('1988-05-03');

  // Daily date navigation updates the visible date.
  const initialDate = await page.locator('#todayDate').textContent();
  await page.locator('[data-day-shift="1"]').click();
  await expect(page.locator('#todayDate')).not.toHaveText(initialDate || '');
  await page.locator('#todayReset').click();
  await expect(page.locator('#todayDate')).toHaveText(initialDate || '');
  await page.locator('#fortuneDate').fill('2026-12-25');
  await page.locator('#fortuneDate').dispatchEvent('change');
  await expect(page.locator('#todayDate')).toContainText('2026');
  await expect(page.locator('#dailyTimeFlow article')).toHaveCount(6);

  // Saved people can be loaded directly into compatibility.
  await page.locator('#partnerProfileSelect').selectOption(savedId);
  await expect(page.locator('#partnerName')).toHaveValue('테스트');
  await expect(page.locator('#partnerDate')).toHaveValue('1988-05-03');

  // Compatibility renders a deterministic relationship map from a second chart.
  await page.locator('#partnerDate').fill('1991-07-11');
  await page.locator('#partnerTime').fill('09:30');
  await page.locator('#compatibilityForm button[type="submit"]').click();
  await expect(page.locator('#compatibilityResult .compatibility-result-head')).toBeVisible();
  await expect(page.locator('#compatibilityResult .compatibility-card')).toHaveCount(4);
  await expect(page.locator('#compatibilityResult')).toContainText('RELATIONSHIP MAP');

  // Copy/share surface exists; clipboard API may be permission-gated in CI.
  await expect(page.locator('#shareReport')).toBeVisible();
  await expect(page.locator('#copyReport')).toBeVisible();

  await assertNoHorizontalOverflow(page);
});


test('plain-language layer keeps visible report copy free of specialist jargon', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#results')).toBeVisible();
  await page.locator('#full-report').evaluate((el) => { el.open = true; });
  await page.waitForTimeout(50);
  const text = await page.locator('#results').innerText();
  for (const term of ['원국','십신','오행','일간','절입','대운','세운','월운','신강','신약','용신','희신','기신','격국','천간','지지','비겁','식상','재성','관성','인성','양 화','가중 성향 균형','표현 기운']) {
    expect(text).not.toContain(term);
  }
});


test('Product V3 keeps the editorial paper hierarchy and isolated tarot stage', async ({ page }) => {
  await page.goto('/');
  const audit=await page.evaluate(()=>{
    const css=(selector)=>getComputedStyle(document.querySelector(selector));
    const rect=(selector)=>document.querySelector(selector)?.getBoundingClientRect();
    return {
      viewport:innerWidth,
      bodyBg:css('body').backgroundColor,
      heroBg:css('.hero-primary').backgroundColor,
      inputBg:css('#input').backgroundColor,
      tarotBg:css('#tarot').backgroundColor,
      heroVisual:css('.hero-visual').display,
      heroVisualBg:css('.hero-visual').backgroundImage,
      expert:css('#expert').display,
      hero:rect('.hero-primary'),
      input:rect('#input'),
      shell:rect('.agency-shell')
    };
  });
  expect(audit.bodyBg).toBe('rgb(245, 246, 243)');
  expect(audit.tarotBg).toBe('rgb(21, 28, 44)');
  if(audit.viewport>760){
    expect(audit.heroBg).toBe('rgb(255, 255, 255)');
    expect(audit.inputBg).toBe('rgb(255, 255, 255)');
    expect(audit.heroVisual).toBe('block');
    expect(audit.heroVisualBg).not.toBe('none');
    expect(audit.heroVisualBg).toMatch(/^url\(/);
  }else{
    expect(audit.inputBg).toBe('rgb(255, 255, 255)');
    expect(audit.heroVisual).toBe('none');
    expect(audit.heroVisualBg).toBe('none');
  }
  expect(audit.expert).toBe('none');
  expect(audit.hero?.width || 0).toBeGreaterThanOrEqual(Math.min(298,audit.viewport-22));
  expect(audit.input?.width || 0).toBeGreaterThanOrEqual(Math.min(298,audit.viewport-22));
  await expect(page.locator('.trust-strip p')).toHaveCount(3);
  await assertNoHorizontalOverflow(page);
});

test('Product V3 shows five primary life-language categories without duplicate strength navigation', async ({ page }) => {
  await page.goto('/');
  const cards=page.locator('.visual-keyword-card');
  await expect(cards).toHaveCount(5);
  const labels=await cards.locator('strong').allTextContents();
  expect(labels).toEqual(['나','일','돈','관계','회복']);
  await page.locator('.visual-keyword-card[data-report-key="temperament"]').click();
  await expect(page.locator('#keywordInsight')).toContainText('나의 기본 성향');
  await expect(page.locator('.visual-keyword-card[data-report-key="strengths"]')).toHaveCount(0);
});
