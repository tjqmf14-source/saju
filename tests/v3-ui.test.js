import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const html=await readFile(new URL('../index.html',import.meta.url),'utf8');
const source=await readFile(new URL('../src/product-v20.js',import.meta.url),'utf8');

test('V20 controller is the single active page controller',()=>{
  assert.match(html,/src="\/src\/product-v20\.js"/);
  assert.doesNotMatch(html,/src="\/src\/premium-ui\.js"|src="\/src\/app\.js"/);
});

for(const symbol of ['calculateSaju','calculateYearFlow','calculateMonthFlows','calculateTodayFlow','calculateTodayTimeFlows','buildCoreReading','buildYearReading','buildDailyReading','interpretSpread']){
  test('V20 controller wires '+symbol,()=>assert.match(source,new RegExp(symbol)));
}

test('public form does not ship with a personal birth profile',()=>{
  assert.doesNotMatch(html,/value="민규"|value="1987"|value="11:45"/);
});

test('neutral Korea average is assigned at runtime rather than hardcoding a personal city',()=>{
  assert.match(source,/\$\('birthLocation'\)\.value='korea'/);
  assert.doesNotMatch(html,/<option value="busan" selected>/);
});
