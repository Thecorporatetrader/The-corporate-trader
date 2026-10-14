import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { assessmentQuestions, calculateAssessment } from '../lib/traderAssessment.ts';

test('ten categories each have exactly three responses with a consistent rubric', () => {
  assert.equal(assessmentQuestions.length, 10);
  assert.equal(new Set(assessmentQuestions.map(q => q.category)).size, 10);
  for (const q of assessmentQuestions) {
    assert.equal(q.options.length, 3);
    assert.deepEqual([...q.points].sort((a,b) => a-b), [0,5,10]);
    assert.ok(q.recommendation && q.habit);
  }
});
test('incomplete and malformed submissions cannot produce results', () => {
  for (const answers of [[], Array(9).fill(0), Array(10).fill(null), Array(10).fill(3), Array(10).fill(-1), Array(10).fill(0.5)]) {
    assert.throws(() => calculateAssessment(answers));
  }
});
test('every possible answer combination has bounded scores and matching recommendations', () => {
  for (let combination = 0; combination < 3 ** 10; combination++) {
    let remaining = combination;
    const answers = assessmentQuestions.map(() => { const a = remaining % 3; remaining = Math.floor(remaining / 3); return a; });
    const result = calculateAssessment(answers);
    const expected = assessmentQuestions.reduce((sum, q, i) => sum + q.points[answers[i]], 0);
    assert.equal(result.score, expected);
    assert.equal(result.classification, expected >= 80 ? 'Disciplined Trader' : expected >= 55 ? 'Developing Trader' : expected >= 30 ? 'Emotional Trader' : 'Impulsive Trader');
    assert.ok(result.strengths.every(q => q.score === 10));
    assert.ok(result.improvements.every(q => q.score < 10));
    assert.equal(result.strengths.length + result.improvements.length, 10);
  }
});
test('approved FAQ has all seven topics, 39 unique questions and assessment link', () => {
  const topics = JSON.parse(readFileSync(new URL('../lib/helpFaq.json', import.meta.url)));
  assert.equal(topics.length, 7);
  const questions = topics.flatMap(t => t.questions);
  assert.equal(questions.length, 39);
  assert.equal(new Set(questions.map(q => q.question)).size, 39);
  assert.equal(questions.find(q => q.question === 'What is Know Your Inner Trader?').href, '/know-your-inner-trader');
  assert.ok(questions.every(q => q.answer.length > 0));
});
