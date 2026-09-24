import { test, expect } from '@playwright/test';

async function setupProfile(page){
  await page.goto('/');
  const dialog=page.locator('#profileDialog');
  if(await dialog.isVisible()){
    await page.locator('#birthName').fill('테스트');
    await page.locator('#calendarMode').selectOption('solar');
    await page.locator('#birthDate').fill('1990-05-15');
    await page.locator('#birthTime').fill('09:20');
    await page.locator('#birthGender').selectOption('male');
    await page.locator('#birthLocation').selectOption('korea');
    await page.locator('#profileForm .primary-button').click();
    await expect(dialog).toBeHidden();
  }
  await expect(page.locator('#homeScore')).not.toHaveText('--');
}

async function assertNoHorizontalOverflow(page){
  const value=await page.evaluate(()=>({
    doc:document.documentElement.scrollWidth-document.documentElement.clientWidth,
    body:document.body.scrollWidth-document.body.clientWidth
  }));
  expect(value.doc).toBeLessThanOrEqual(1);
  expect(value.body).toBeLessThanOrEqual(1);
}

test('V20 renders as an app shell with no clipped layout and a real 12pt text floor',async({page},testInfo)=>{
  await setupProfile(page);
  const audit=await page.evaluate(()=>{
    const visible=[...document.querySelectorAll('body *')].filter((el)=>{
      if(el.closest('[hidden]')) return false;
      const style=getComputedStyle(el);
      const rect=el.getBoundingClientRect();
      return style.display!=='none' && style.visibility!=='hidden' && rect.width>0 && rect.height>0;
    });
    const textNodes=visible.filter((el)=>{
      if(['SCRIPT','STYLE','SVG','PATH'].includes(el.tagName)) return false;
      const direct=[...el.childNodes].some((node)=>node.nodeType===Node.TEXT_NODE && node.textContent.trim());
      return direct;
    });
    const undersized=textNodes.filter((el)=>parseFloat(getComputedStyle(el).fontSize)<15.9).map((el)=>({
      tag:el.tagName,cls:el.className,font:getComputedStyle(el).fontSize,text:el.textContent.trim().slice(0,50)
    }));
    const escaped=visible.filter((el)=>{
      if(el.closest('.segment-tabs,.time-flow')) return false;
      const rect=el.getBoundingClientRect();
      return rect.right>document.documentElement.clientWidth+2 || rect.left<-2;
    }).map((el)=>({tag:el.tagName,cls:el.className,left:el.getBoundingClientRect().left,right:el.getBoundingClientRect().right}));
    return {undersized,escaped};
  });
  expect(audit.undersized,JSON.stringify(audit.undersized)).toEqual([]);
  expect(audit.escaped,JSON.stringify(audit.escaped)).toEqual([]);
  await assertNoHorizontalOverflow(page);
  await page.screenshot({path:'test-results/v20-home-'+testInfo.project.name+'.png',fullPage:true});
});

test('primary navigation exposes only four destinations and each route switches cleanly',async({page})=>{
  await setupProfile(page);
  const routes=['home','saju','fortune','tarot'];
  for(const route of routes){
    const button=page.locator('.mobile-nav [data-route="'+route+'"], .side-nav [data-route="'+route+'"]').first();
    await button.click();
    await expect(page.locator('[data-screen="'+route+'"]')).toBeVisible();
    const visible=await page.locator('[data-screen]:visible').count();
    expect(visible).toBe(1);
  }
});

test('five saju categories have distinct useful readings and evidence',async({page},testInfo)=>{
  await setupProfile(page);
  await page.locator('[data-route="saju"]').first().click();
  const tabs=page.locator('#sajuTabs [role="tab"]');
  await expect(tabs).toHaveCount(5);
  const headlines=[];
  for(let i=0;i<5;i+=1){
    await tabs.nth(i).click();
    headlines.push((await page.locator('#sajuReading header h2').textContent())?.trim());
    await expect(page.locator('#sajuReading .practice-box')).toBeVisible();
    await expect(page.locator('#sajuReading .evidence-box')).toBeVisible();
  }
  expect(new Set(headlines).size).toBe(5);
  await page.screenshot({path:'test-results/v20-saju-'+testInfo.project.name+'.png',fullPage:true});
});

test('fortune keeps four adult daily categories and twelve non-duplicate monthly readings',async({page},testInfo)=>{
  await setupProfile(page);
  await page.locator('[data-route="fortune"]').first().click();
  await expect(page.locator('#fortuneDailyList .daily-row')).toHaveCount(4);
  const scores=await page.locator('#fortuneDailyList .daily-row').evaluateAll((rows)=>rows.map((row)=>Number(row.dataset.score)));
  expect(scores.every((score)=>Number.isFinite(score) && score>=0 && score<=100)).toBe(true);

  await page.locator('.fortune-tabs [data-fortune-tab="year"]').click();
  await expect(page.locator('#monthList .month-item')).toHaveCount(12);
  const months=await page.locator('#monthList .month-item').evaluateAll((items)=>items.map((item)=>({
    title:item.querySelector('h3')?.textContent.trim(),
    action:item.querySelector('.month-copy p:nth-child(1)')?.textContent.trim(),
    caution:item.querySelector('.month-copy p:nth-child(2)')?.textContent.trim()
  })));
  expect(new Set(months.map((item)=>item.title)).size).toBe(12);
  expect(new Set(months.map((item)=>item.action)).size).toBe(12);
  expect(new Set(months.map((item)=>item.caution)).size).toBe(12);
  await page.screenshot({path:'test-results/v20-year-'+testInfo.project.name+'.png',fullPage:true});
});

test('tarot preserves the whole card image and gives the selected topic a focused reading',async({page},testInfo)=>{
  await setupProfile(page);
  await page.locator('[data-route="tarot"]').first().click();
  await page.locator('#shuffleTarot').click();
  await expect(page.locator('#tarotDeck .tarot-card-back')).toHaveCount(12);
  await page.locator('#tarotDeck .tarot-card-back').first().click();
  await expect(page.locator('#tarotResult .tarot-reading-card')).toHaveCount(1);
  const fit=await page.locator('#tarotResult img').evaluate((img)=>({
    objectFit:getComputedStyle(img).objectFit,
    naturalWidth:img.naturalWidth,
    naturalHeight:img.naturalHeight,
    boxWidth:img.getBoundingClientRect().width,
    boxHeight:img.getBoundingClientRect().height
  }));
  expect(fit.objectFit).toBe('contain');
  expect(fit.naturalWidth).toBeGreaterThan(0);
  expect(fit.naturalHeight).toBeGreaterThan(0);
  await assertNoHorizontalOverflow(page);
  await page.screenshot({path:'test-results/v20-tarot-'+testInfo.project.name+'.png',fullPage:true});
});

test('profile editing supports lunar mode, unknown time and accessible recovery',async({page})=>{
  await setupProfile(page);
  await page.locator('#profileButton').click();
  await page.locator('#calendarMode').selectOption('lunar');
  await expect(page.locator('#leapField')).toBeVisible();
  await page.locator('#timeUnknown').check();
  await expect(page.locator('#birthTime')).toBeDisabled();
  await page.locator('#birthDate').fill('');
  await page.locator('#profileForm .primary-button').click();
  await expect(page.locator('#profileError')).toBeVisible();
  await expect(page.locator('#profileDialog')).toBeVisible();
});
