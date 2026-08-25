(function(root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.QincheVaultLinks = api;
})(typeof window !== 'undefined' ? window : globalThis, function() {
  'use strict';

  var URL_PATTERN = /https?:\/\/[^\s<>"'`，。！？；：、】【（）〔〕〈〉《》]+|www\.[^\s<>"'`，。！？；：、】【（）〔〕〈〉《》]+/i;
  var BARE_DOMAIN_PATTERN = /\b(?:[a-z0-9-]+\.)+[a-z]{2,}(?:\/[^\s<>"'`，。！？；：、】【（）〔〕〈〉《》]*)?/i;
  var TRAILING_PUNCTUATION = /[.,!?;:'"\]\)}，。！？；：、】）〕〉》]+$/;

  function extractWebLink(source) {
    var match = source.match(URL_PATTERN) || source.match(BARE_DOMAIN_PATTERN);
    return match ? match[0].replace(TRAILING_PUNCTUATION, '') : '';
  }

  function normalizeSharedWebLink(value) {
    var source = String(value || '').trim();
    if (!source) throw new Error('请输入或粘贴分享链接');

    var candidate = extractWebLink(source);
    if (!candidate) throw new Error('请粘贴包含网页链接的分享内容');
    if (!/^[a-z][a-z0-9+.-]*:/i.test(candidate)) candidate = 'https://' + candidate;

    var url;
    try {
      url = new URL(candidate);
    } catch (error) {
      throw new Error('请粘贴有效的网页链接');
    }
    if (url.protocol !== 'https:' && url.protocol !== 'http:') {
      throw new Error('请粘贴包含网页链接的分享内容');
    }
    return url.href;
  }

  return { normalizeSharedWebLink: normalizeSharedWebLink };
});
