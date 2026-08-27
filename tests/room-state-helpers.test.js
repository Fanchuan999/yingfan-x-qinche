const test = require('node:test');
const assert = require('node:assert/strict');

const roomStateHelpers = require('../room-state-helpers');

test('normalizeStoredRoomState migrates the removed manual night state to auto', () => {
  assert.equal(roomStateHelpers.normalizeStoredRoomState('night'), 'auto');
});

test('normalizeStoredRoomState keeps the remaining selectable room states', () => {
  assert.equal(roomStateHelpers.normalizeStoredRoomState('watch'), 'watch');
  assert.equal(roomStateHelpers.normalizeStoredRoomState('focus'), 'focus');
  assert.equal(roomStateHelpers.normalizeStoredRoomState('auto'), 'auto');
});

test('normalizeStoredRoomState protects against unsupported saved values', () => {
  assert.equal(roomStateHelpers.normalizeStoredRoomState('anything-else'), 'auto');
  assert.equal(roomStateHelpers.normalizeStoredRoomState(null), 'auto');
});
