import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';

const EXPECTED_ATLAS_BYTES=79548;
const EXPECTED_ATLAS_SHA256='9ab3f1366bf1ed44b937d8abc7fcdedbf03bcc8272711ab77ea664faf11d5bb2';

test('legacy local visual atlas remains byte-stable for backward assets',async()=>{
  const atlas=await readFile(new URL('../public/oracle/b-visual-atlas.webp',import.meta.url));
  assert.equal(atlas.byteLength,EXPECTED_ATLAS_BYTES);
  assert.equal(atlas.toString('ascii',0,4),'RIFF');
  assert.equal(atlas.toString('ascii',8,12),'WEBP');
  assert.equal(createHash('sha256').update(atlas).digest('hex'),EXPECTED_ATLAS_SHA256);
});

test('V20 product shell no longer depends on legacy decorative atlas',async()=>{
  const html=await readFile(new URL('../index.html',import.meta.url),'utf8');
  const css=await readFile(new URL('../product-v20.css',import.meta.url),'utf8');
  assert.doesNotMatch(html,/b-visual-atlas|hero-proof-oracles|visual-keyword/);
  assert.doesNotMatch(css,/b-visual-atlas/);
});
