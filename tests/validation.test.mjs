import test from 'node:test';
import assert from 'node:assert/strict';
import { validName, validEmail, validMobile, validPassword, identityError } from '../lib/validation.ts';
test('names: letters and separating spaces only', () => {
  for (const value of ['Hanmant Pawar', 'Alex', 'Élodie Martin']) assert.equal(validName(value), true, value);
  for (const value of ['', 'Alex123', 'Mary-Jane', 'O\'Neil', 'Alex@', 'a'.repeat(81)]) assert.equal(validName(value), false, value);
});
test('standard email format', () => {
  for (const value of ['name@domain.com', 'a+b@example.co.in']) assert.equal(validEmail(value), true);
  for (const value of ['name', 'a@b', 'a b@c.com', 'a@@b.com', 'a@.com', 'a@-bad.com', '.a@example.com', 'a..b@example.com']) assert.equal(validEmail(value), false);
});
test('mobile limits are inclusive 8 and 15 digits', () => {
  assert.equal(validMobile('1'.repeat(8)), true);
  assert.equal(validMobile('1'.repeat(15)), true);
  for (const value of ['1'.repeat(7), '1'.repeat(16), '1234abcd', '+919876543210', '1234 5678']) assert.equal(validMobile(value), false);
});
test('password boundaries and all four character classes', () => {
  for (const value of ['Abcdef1!x', 'Abcdefghijk1!x']) assert.equal(validPassword(value), true, value);
  for (const value of ['Abcde1!x', 'Abcdefghijkl1!x', 'abcdefg1!', 'ABCDEFG1!', 'Abcdefgh!', 'Abcdefgh1']) assert.equal(validPassword(value), false, value);
});
test('combined identity validation', () => {
  assert.equal(identityError('Alex Morgan', 'alex@example.com', '+91', '9876543210'), '');
  assert.notEqual(identityError('Alex', 'alex@example.com', '91', '9876543210'), '');
});
