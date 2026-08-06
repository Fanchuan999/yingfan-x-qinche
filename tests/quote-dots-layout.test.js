const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const html = fs.readFileSync('index.html', 'utf8');

test('quote dots remain in one horizontal row', () => {
  const rules = html.match(/\.quote-dots\s*\{[^}]*\}/)[0];
  assert.match(rules, /flex-wrap:\s*nowrap/);
  assert.match(rules, /overflow-x:\s*auto/);
});
