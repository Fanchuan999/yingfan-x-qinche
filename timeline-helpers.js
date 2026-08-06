(function(root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.QincheTimelineHelpers = api;
})(typeof window !== 'undefined' ? window : globalThis, function() {
  function toDateKey(timestamp) {
    var date = new Date(timestamp);
    if (isNaN(date.getTime())) return '';
    return date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0');
  }

  function stableIndex(seed, length) {
    var hash = 0;
    for (var index = 0; index < seed.length; index += 1) {
      hash = ((hash << 5) - hash + seed.charCodeAt(index)) | 0;
    }
    return Math.abs(hash) % length;
  }

  function pickTimelineImage(entry, galleryItems) {
    var candidates = (galleryItems || []).filter(function(item) {
      return item && typeof item.src === 'string' && item.src;
    });
    if (!candidates.length) return '';

    var matching = candidates.filter(function(item) {
      return toDateKey(item.createdAt) === String(entry && entry.date || '');
    });
    var pool = matching.length ? matching : candidates;
    var seed = String(entry && entry.id || '') + '|' + String(entry && entry.date || '');
    return pool[stableIndex(seed, pool.length)].src;
  }

  return { pickTimelineImage: pickTimelineImage };
});
