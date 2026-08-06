const test = require('node:test');
const assert = require('node:assert/strict');

let helpers = {};
try {
  helpers = require('../timeline-helpers.js');
} catch (error) {
  helpers = {};
}

const gallery = [
  { src: 'default-a.jpg' },
  { src: 'same-day.jpg', createdAt: Date.UTC(2026, 7, 6, 8) },
  { src: 'default-b.jpg' }
];

test('timeline image prefers a photo from the entry date', () => {
  assert.equal(typeof helpers.pickTimelineImage, 'function');
  assert.equal(
    helpers.pickTimelineImage({ id: 'photos-2026-08-06', date: '2026-08-06' }, gallery),
    'same-day.jpg'
  );
});

test('timeline image fallback is deterministic for the same entry', () => {
  assert.equal(typeof helpers.pickTimelineImage, 'function');
  const entry = { id: 'default-n109', date: '2048-06-01' };
  assert.equal(
    helpers.pickTimelineImage(entry, gallery),
    helpers.pickTimelineImage(entry, gallery)
  );
});

test('timeline image returns empty without usable photos', () => {
  assert.equal(typeof helpers.pickTimelineImage, 'function');
  assert.equal(
    helpers.pickTimelineImage({ id: 'empty', date: '2026-08-06' }, []),
    ''
  );
});
