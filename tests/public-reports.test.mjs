import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
for (const [slug,profit] of [['quant','961.61'],['scalp','1 883.35']]) {
 test(`${slug} public HTML contains summary statistics only`,()=>{
  const html=readFileSync(new URL(`../public/reports/tct-${slug}-mt5.html`,import.meta.url),'utf8');
  assert.equal((html.match(/<tr>/g)||[]).length,20);
  assert.ok(html.includes(profit));
  assert.ok(html.includes('2026'));
  assert.ok(!/<script|ReportTester|LotProgression|Expert:|Inputs:|Account:|<th[^>]*>Orders|<th[^>]*>Deals|\d{4}\.\d{2}\.\d{2} \d{2}:\d{2}/i.test(html));
 });
}
