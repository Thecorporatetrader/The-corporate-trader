import test from 'node:test';
import assert from 'node:assert/strict';
import { algorithms, scaleIllustration } from '../lib/algorithms.ts';

test('Quant 0.05-lot scenario scales both profit and dollar drawdown', () => {
  const r = scaleIllustration(961.61, 27.62, 0.05, 500);
  assert.equal(r.multiplier, 5);
  assert.ok(Math.abs(r.net - 4808.05) < 0.00001);
  assert.ok(Math.abs(r.drawdown - 138.10) < 0.00001);
  assert.ok(Math.abs(r.endBalance - 5308.05) < 0.00001);
});
test('Scalp baseline and larger balance do not create extra profit', () => {
  assert.deepEqual(scaleIllustration(1883.35,104.56,0.01,500), {multiplier:1,net:1883.35,drawdown:104.56,endBalance:2383.35});
  assert.equal(scaleIllustration(1883.35,104.56,0.01,1000).net,1883.35);
});
test('invalid and nonfinite scenarios are rejected', () => {
  for (const lot of [0,-1,1.01,Infinity,NaN]) assert.equal(scaleIllustration(1,1,lot,500),null);
  for (const balance of [0,-1,Infinity,NaN,100000001]) assert.equal(scaleIllustration(1,1,0.01,balance),null);
  assert.equal(scaleIllustration(1,-1,0.01,500),null);
  assert.equal(scaleIllustration(NaN,1,0.01,500),null);
});
test('negative net results remain losses and never become promises of gain', () => {
  assert.deepEqual(scaleIllustration(-100,120,0.05,500),{multiplier:5,net:-500,drawdown:600,endBalance:0});
});
test('all products have unique share routes; user-directed Algo has no borrowed results', () => {
  assert.deepEqual(algorithms.map(a => a.slug),['quant','scalp','algo']);
  assert.equal(algorithms.find(a => a.slug === 'algo').report,null);
});
