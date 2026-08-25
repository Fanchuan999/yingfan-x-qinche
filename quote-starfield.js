(function(root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.QincheQuoteStarfield = api;
})(typeof window !== 'undefined' ? window : globalThis, function() {
  'use strict';

  function seededUnit(seed) {
    var value = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
    return value - Math.floor(value);
  }

  function createStarLayout(count) {
    var stars = [];
    for (var index = 0; index < count; index++) {
      stars.push({
        x: 6 + seededUnit(index + 1) * 88,
        y: 10 + seededUnit(index + 101) * 78,
        size: 4 + Math.floor(seededUnit(index + 201) * 7),
        delay: -(seededUnit(index + 301) * 6),
        duration: 4 + seededUnit(index + 401) * 5
      });
    }
    return stars;
  }

  function pickNextQuoteIndex(count, currentIndex, random) {
    if (count <= 0) return -1;
    if (count === 1) return 0;

    var draw = typeof random === 'function' ? Number(random()) : Math.random();
    draw = Math.max(0, Math.min(0.999999, isFinite(draw) ? draw : 0));
    var candidate = Math.floor(draw * (count - 1));
    return candidate >= currentIndex ? candidate + 1 : candidate;
  }

  return {
    createStarLayout: createStarLayout,
    pickNextQuoteIndex: pickNextQuoteIndex
  };
});
