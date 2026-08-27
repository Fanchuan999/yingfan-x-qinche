const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');

const futureLetterAi = require('../future-letter-ai');
const page = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

test('buildFutureLetterMessages keeps the saved character prompt and requests an approximately 300-character letter', () => {
  const messages = futureLetterAi.buildFutureLetterMessages({
    systemPrompt: '你是秦彻，说话冷静、有分寸。'
  }, '阿帆', 'watch');

  assert.deepEqual(messages[0], {
    role: 'system',
    content: '你是秦彻，说话冷静、有分寸。'
  });
  assert.match(messages[1].content, /阿帆/);
  assert.match(messages[1].content, /约 300 字/);
  assert.match(messages[1].content, /不要标题/);
});

test('extractFutureLetterContent returns a normal chat completion body', () => {
  assert.equal(futureLetterAi.extractFutureLetterContent({
    choices: [{ message: { content: '  给未来的你。  ' } }]
  }), '给未来的你。');
});

test('extractFutureLetterContent returns an empty string for an unusable response', () => {
  assert.equal(futureLetterAi.extractFutureLetterContent({ choices: [] }), '');
});

test('future-letter panel provides the requested copy and explicit AI letter action', () => {
  assert.match(page, /<p class="letter-intro">写给未来的你，日期到了再打开。<\/p>/);
  assert.match(page, /id="btnLetterFromHim"/);
  assert.match(page, /future-letter-ai\.js/);
});

test('future-letter tools wrap on a narrow screen so the AI action stays visible', () => {
  assert.match(page, /\.letter-tools \{[^}]*flex-wrap: wrap;/s);
});

test('his-letter request has an independent timeout so a stalled API restores the form', () => {
  const start = page.indexOf('async function requestLetterFromHim()');
  const end = page.indexOf('function addFutureLetter', start);
  const request = page.slice(start, end);

  assert.match(request, /var controller = new AbortController\(\);/);
  assert.match(request, /signal: controller\.signal/);
  assert.match(request, /window\.setTimeout/);
  assert.match(request, /error && error\.name === 'AbortError'/);
});
