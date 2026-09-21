import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const html=await readFile(new URL('../index.html',import.meta.url),'utf8');
const css=await readFile(new URL('../site-v12.css',import.meta.url),'utf8');
const upgrades=await readFile(new URL('../src/commercial-upgrades.js',import.meta.url),'utf8');
const manifest=JSON.parse(await readFile(new URL('../public/manifest.webmanifest',import.meta.url),'utf8'));
const sw=await readFile(new URL('../public/sw.js',import.meta.url),'utf8');

test('commercial UX exposes local profile, compatibility, mobile nav and share surfaces',()=>{
  for(const id of ['profileSelect','saveProfile','compatibility','compatibilityForm','compatibilityResult','shareReport','sajuAnswer']){
    assert.ok(html.includes('id="'+id+'"'),id);
  }
  assert.ok(html.includes('mobile-bottom-nav'));
  assert.ok(upgrades.includes("localStorage.getItem(PROFILE_KEY)"));
  assert.ok(upgrades.includes("calculateSaju"));
  assert.ok(upgrades.includes("navigator.share"));
});

test('commercial UX keeps privacy-first local behavior and progressive report links',()=>{
  assert.ok(html.includes('이 브라우저에 보관'));
  assert.ok(upgrades.includes("data-open-report"));
  assert.ok(css.includes('.annual-navigator'));
  assert.ok(css.includes('.today-explorer'));
  assert.ok(css.includes('.compatibility-panel'));
});

test('installable web app shell is local and standalone',()=>{
  assert.equal(manifest.display,'standalone');
  assert.equal(manifest.start_url,'/');
  assert.ok(manifest.icons.every(icon=>icon.src.startsWith('/')));
  assert.ok(sw.includes("fetch(event.request)"));
  assert.ok(sw.includes("caches.match"));
});