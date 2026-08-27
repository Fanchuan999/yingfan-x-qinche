(function(root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.QincheRoomStateHelpers = api;
})(typeof window !== 'undefined' ? window : globalThis, function() {
  'use strict';

  function normalizeStoredRoomState(value) {
    return value === 'watch' || value === 'focus' ? value : 'auto';
  }

  return {
    normalizeStoredRoomState: normalizeStoredRoomState
  };
});
