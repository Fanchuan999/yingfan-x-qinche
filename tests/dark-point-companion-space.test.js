const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');

const projectRoot = path.join(__dirname, '..');
const page = fs.readFileSync(path.join(projectRoot, 'index.html'), 'utf8');

function getCrowDropdown() {
  const start = page.indexOf('<div class="nav-dropdown" id="navDropdown">');
  const end = page.indexOf('</nav>', start);
  return page.slice(start, end);
}

test('crow menu retains only administrative entries', () => {
  const dropdown = getCrowDropdown();

  assert.match(dropdown, /data-panel="backup"/);
  assert.match(dropdown, /data-panel="manage"/);
  assert.doesNotMatch(dropdown, /data-panel="room"|data-scroll-target="timeline"|data-panel="letters"|data-panel="pomodoro"|data-panel="period"|data-panel="anniversary"|data-panel="todo"|data-panel="snake"|data-panel="privateVault"/);
});

test('dark point exposes all migrated utility routes through room objects', () => {
  for (const id of ['roomWindow', 'roomDesk', 'roomCabinet', 'roomMailbox', 'roomGameTable']) {
    assert.match(page, new RegExp(`id="${id}"`));
  }

  for (const id of ['btnRoomPeriod', 'btnRoomAnniversary', 'btnRoomTodo', 'btnRoomPomodoro', 'btnRoomTimeline', 'btnRoomVault', 'btnRoomLetters', 'btnRoomSnake']) {
    assert.match(page, new RegExp(`id: '${id}'`));
  }
});

test('dark point uses packaged local visual assets', () => {
  for (const filename of ['qinche-seated.png', 'silhouette-watch.png', 'silhouette-crow.png', 'red-foliage.png', 'qinche-signature.png', 'feather.png']) {
    assert.equal(fs.existsSync(path.join(projectRoot, 'assets', 'dark-point', filename)), true, filename);
    assert.match(page, new RegExp(`assets/dark-point/${filename}`));
  }
});

test('room destination controller reuses existing panels', () => {
  assert.match(page, /function selectRoomZone\(zone\)/);
  assert.match(page, /function openRoomDestination\(destination\)/);

  for (const destination of ['period', 'anniversary', 'todo', 'pomodoro', 'timeline', 'privateVault', 'letters', 'snake']) {
    assert.match(page, new RegExp(`destination === '${destination}'`));
  }
});

test('small screens keep the room scene scrollable instead of clipping its hotspots', () => {
  assert.match(page, /@media \(max-width: 768px\) \{[\s\S]*?\.room-space \{[^}]*overflow-y: auto/s);
});
