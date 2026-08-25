const test = require('node:test');
const assert = require('node:assert/strict');

const { normalizeSharedWebLink } = require('../vault-link-parser.js');

test('extracts a Xiaohongshu short link from pasted share text', () => {
  assert.equal(
    normalizeSharedWebLink('复制这段文字，打开【小红书】查看精彩内容！ https://xhslink.com/m/4h6Qp9Abc'),
    'https://xhslink.com/m/4h6Qp9Abc'
  );
});

test('extracts a Douyin link from pasted share text', () => {
  assert.equal(
    normalizeSharedWebLink('3.67 复制打开抖音，看看【秦彻】 https://v.douyin.com/AbCdEfG/'),
    'https://v.douyin.com/AbCdEfG/'
  );
});

test('extracts a Bilibili link and removes Chinese trailing punctuation', () => {
  assert.equal(
    normalizeSharedWebLink('【视频】https://b23.tv/AbCdEfG，快来看看吧'),
    'https://b23.tv/AbCdEfG'
  );
});

test('rejects a share message without a web link', () => {
  assert.throws(
    () => normalizeSharedWebLink('请在抖音 App 内查看：snssdk1128://aweme/detail/123'),
    /网页链接/
  );
});
