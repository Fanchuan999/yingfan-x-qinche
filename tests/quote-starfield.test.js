const test = require('node:test');
const assert = require('node:assert/strict');

const { createStarLayout, pickNextQuoteIndex } = require('../quote-starfield.js');

test('creates one visible star position for every quote', () => {
  const stars = createStarLayout(8);

  assert.equal(stars.length, 8);
  for (const star of stars) {
    assert.ok(star.x >= 6 && star.x <= 94);
    assert.ok(star.y >= 10 && star.y <= 88);
    assert.ok(star.size >= 4 && star.size <= 10);
  }
});

test('random quote selection never repeats the currently active star', () => {
  assert.equal(pickNextQuoteIndex(5, 2, () => 0), 0);
  assert.equal(pickNextQuoteIndex(5, 2, () => 0.51), 3);
});

test('single-star fields retain their only quote', () => {
  assert.equal(pickNextQuoteIndex(1, 0, () => 0.7), 0);
  assert.equal(pickNextQuoteIndex(0, 0, () => 0.7), -1);
});
