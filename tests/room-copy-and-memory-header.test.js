const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');

const page = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

test('visible companion room entry points use the 暗点 name', () => {
  assert.match(page, /<button class="nav-room-link" id="btnRoom" type="button">暗点<\/button>/);
  assert.match(page, /<div class="dropdown-item" data-panel="room">暗点<\/div>/);
  assert.match(page, /<h3>暗点<\/h3>/);
  assert.doesNotMatch(page, /我们的小屋|>小屋<|打开小屋|小屋状态/);
});

test('memory drawer groups both title lines and protects them with a blur header', () => {
  assert.match(page, /<div class="memory-drawer-heading">\s*<h2 id="memoryDrawerTitle">回忆时间轴<\/h2>\s*<p class="sub">MEMORY TIMELINE<\/p>\s*<\/div>/);
  assert.match(page, /\.memory-drawer-panel \.section-header \{[^}]*backdrop-filter: blur\(/s);
});
