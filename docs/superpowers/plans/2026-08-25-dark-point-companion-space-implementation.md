# 暗点陪伴空间 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn 暗点 into an image-led companion space while keeping the homepage intact and moving all non-administrative crow-menu entries into spatial object controls.

**Architecture:** Keep the application as its existing static `index.html` page. Replace the current room modal markup with accessible scene controls, add a small zone-action controller beside the existing room-state controller, and route each zone action into the pre-existing overlays or memory drawer. Package only the approved local PNG assets under `assets/dark-point/` so the page keeps working offline.

**Tech Stack:** Static HTML/CSS/vanilla JavaScript, Node built-in test runner, existing localStorage/IndexedDB utilities.

**Spec:** `docs/superpowers/specs/2026-08-25-dark-point-companion-space-design.md`

## Global Constraints

- Keep homepage markup and all non-room homepage sections unchanged.
- Keep data local to the browser; add no backend, account, remote asset, or dependency.
- Preserve `ROOM_STATE_KEY`, existing panel IDs, and existing panel functions.
- Copy only the six explicitly approved local PNG assets listed in the spec.
- The crow dropdown must contain only `backup` and `manage` items after the change.
- Use the existing wine-red visual system in both dark and light themes.

---

### Task 1: Lock the navigation and scene contract with tests

**Files:**
- Create: `tests/dark-point-companion-space.test.js`
- Modify: `tests/room-copy-and-memory-header.test.js`

**Interfaces:**
- Consumes: `index.html` markup and the six files in `assets/dark-point/`.
- Produces: regression tests for dropdown scope, scene controls, zone-action IDs, and local asset paths.

- [ ] **Step 1: Write the failing test**

```js
test('crow menu retains only administrative entries', () => {
  const dropdown = page.match(/<div class="nav-dropdown" id="navDropdown">([\s\S]*?)<\/div>/)[1];
  assert.match(dropdown, /data-panel="backup"/);
  assert.match(dropdown, /data-panel="manage"/);
  assert.doesNotMatch(dropdown, /data-panel="room"|data-scroll-target="timeline"|data-panel="letters"|data-panel="pomodoro"|data-panel="period"|data-panel="anniversary"|data-panel="todo"|data-panel="snake"|data-panel="privateVault"/);
});

test('dark point exposes all migrated utility routes', () => {
  for (const id of ['roomWindow', 'roomDesk', 'roomCabinet', 'roomMailbox', 'roomGameTable']) {
    assert.match(page, new RegExp(`id="${id}"`));
  }
  for (const id of ['btnRoomPeriod', 'btnRoomAnniversary', 'btnRoomTodo', 'btnRoomPomodoro', 'btnRoomTimeline', 'btnRoomVault', 'btnRoomLetters', 'btnRoomSnake']) {
    assert.match(page, new RegExp(`id="${id}"`));
  }
});
```

- [ ] **Step 2: Run the new test to verify it fails**

Run: `node --test tests/dark-point-companion-space.test.js`

Expected: FAIL because current dropdown still contains room utilities and scene IDs do not exist.

- [ ] **Step 3: Add the asset-existence assertions**

```js
for (const filename of ['qinche-seated.png', 'silhouette-watch.png', 'silhouette-crow.png', 'red-foliage.png', 'qinche-signature.png', 'feather.png']) {
  assert.equal(fs.existsSync(path.join(__dirname, '..', 'assets', 'dark-point', filename)), true, filename);
}
```

- [ ] **Step 4: Leave this test failing until Tasks 2–4 provide the markup, assets, and event routes**

Run: `node --test tests/dark-point-companion-space.test.js`

Expected: FAIL only for not-yet-implemented scene contract.

### Task 2: Add approved local assets and scene markup

**Files:**
- Create: `assets/dark-point/qinche-seated.png`
- Create: `assets/dark-point/silhouette-watch.png`
- Create: `assets/dark-point/silhouette-crow.png`
- Create: `assets/dark-point/red-foliage.png`
- Create: `assets/dark-point/qinche-signature.png`
- Create: `assets/dark-point/feather.png`
- Modify: `index.html:4404-4416`
- Modify: `index.html:4953-4985`

**Interfaces:**
- Consumes: source PNGs in `D:\small progect\png素材` and existing `openUtilPanel(name)` / `memoryDrawerController` APIs.
- Produces: `#roomPanel` scene elements and a `#roomZoneActions` action tray with the IDs asserted by Task 1.

- [ ] **Step 1: Copy the six approved source files without changing their pixels**

Run these exact copies:

```powershell
Copy-Item 'D:\small progect\png素材\image 11.png' 'assets\dark-point\qinche-seated.png'
Copy-Item 'D:\small progect\png素材\image 54.png' 'assets\dark-point\silhouette-watch.png'
Copy-Item 'D:\small progect\png素材\image 55.png' 'assets\dark-point\silhouette-crow.png'
Copy-Item 'D:\small progect\png素材\image 61.png' 'assets\dark-point\red-foliage.png'
Copy-Item 'D:\small progect\png素材\image 66.png' 'assets\dark-point\qinche-signature.png'
Copy-Item 'D:\small progect\png素材\image 69.png' 'assets\dark-point\feather.png'
```

- [ ] **Step 2: Reduce the crow menu to two entries**

Replace its contents with:

```html
<div class="dropdown-item" data-panel="backup">数据备份</div>
<div class="dropdown-item" data-panel="manage">内容管理</div>
```

- [ ] **Step 3: Replace the room object list and two legacy room actions with scene buttons and an action tray**

Use semantic buttons with these stable IDs:

```html
<button class="room-hotspot room-hotspot-window" id="roomWindow" type="button" data-zone="window" aria-pressed="false">窗边<span>经期记录 · 纪念日</span></button>
<button class="room-hotspot room-hotspot-desk" id="roomDesk" type="button" data-zone="desk" aria-pressed="false">书桌<span>待办清单 · 番茄钟</span></button>
<button class="room-hotspot room-hotspot-cabinet" id="roomCabinet" type="button" data-zone="cabinet" aria-pressed="false">回忆柜<span>时间轴 · 我的私藏</span></button>
<button class="room-hotspot room-hotspot-mail" id="roomMailbox" type="button" data-zone="mail" aria-pressed="false">信箱<span>未来信件</span></button>
<button class="room-hotspot room-hotspot-game" id="roomGameTable" type="button" data-zone="game" aria-pressed="false">游戏台<span>贪吃鸦</span></button>
<section class="room-zone-actions" id="roomZoneActions" aria-live="polite"></section>
```

- [ ] **Step 4: Run the contract test**

Run: `node --test tests/dark-point-companion-space.test.js`

Expected: asset and markup checks PASS; route binding checks may still fail before Task 4.

### Task 3: Build the responsive scene styling

**Files:**
- Modify: `index.html:3875-4030`
- Modify: `index.html:4364-4381`

**Interfaces:**
- Consumes: the Task 2 IDs/classes and the existing CSS custom properties (`--bg-card`, `--red`, `--red-dark`, `--text-light`, `--text-muted`, `--border`).
- Produces: `.room-space`, `.room-hotspot`, `.room-zone-actions`, and light-theme variants that remain visible on 320px+ viewports.

- [ ] **Step 1: Style the panel as an image-led room rather than a small form**

Implement layered decorative images with stable classes:

```css
.room-space { min-height: min(680px, 78vh); overflow: hidden; position: relative; }
.room-space-hero { bottom: 0; height: min(620px, 88%); pointer-events: none; position: absolute; right: 3%; }
.room-space-foliage { pointer-events: none; position: absolute; right: -6%; top: -4%; width: min(330px, 42vw); }
.room-hotspot { position: absolute; text-align: left; }
.room-hotspot[aria-pressed="true"] { border-color: var(--red); background: rgba(196, 30, 58, 0.18); }
```

- [ ] **Step 2: Add dark and light theme readability rules**

```css
[data-theme="light"] .room-space { background: #f4dde1; }
[data-theme="light"] .room-hotspot { background: rgba(255, 247, 248, 0.86); border-color: #b66779; color: #482a33; }
[data-theme="light"] .room-zone-actions { background: rgba(255, 239, 242, 0.94); }
```

- [ ] **Step 3: Add mobile layout rules without hiding a hotspot**

```css
@media (max-width: 768px) {
  #roomPanel .util-panel { max-width: 96%; padding: 14px; }
  .room-space { min-height: 620px; }
  .room-space-hero { height: 410px; right: -20%; }
  .room-hotspot { width: min(42vw, 164px); }
}
```

- [ ] **Step 4: Run static tests and inspect the dark/light CSS selectors**

Run: `node --test tests/dark-point-companion-space.test.js`

Expected: PASS for all structural assertions.

### Task 4: Add zone selection and reuse existing utility panels

**Files:**
- Modify: `index.html:10572-10687`
- Modify: `index.html:11414-11426`
- Modify: `tests/dark-point-companion-space.test.js`

**Interfaces:**
- Consumes: `openUtilPanel(name)`, `closeUtilPanel(name)`, `memoryDrawerController.open()`, `saveRoomState(value)`, and the Task 2 element IDs.
- Produces: `selectRoomZone(zone)` and `openRoomDestination(destination)`.

- [ ] **Step 1: Extend the failing test to require both controller functions and every destination mapping**

```js
assert.match(page, /function selectRoomZone\(zone\)/);
assert.match(page, /function openRoomDestination\(destination\)/);
for (const destination of ['period', 'anniversary', 'todo', 'pomodoro', 'timeline', 'privateVault', 'letters', 'snake']) {
  assert.match(page, new RegExp(`openRoomDestination\\('${destination}'\\)`));
}
```

- [ ] **Step 2: Run the test to verify the controller contract fails**

Run: `node --test tests/dark-point-companion-space.test.js`

Expected: FAIL because the room currently has only timeline and letters direct click handlers.

- [ ] **Step 3: Implement zone definitions and selection state**

```js
var roomZoneDefinitions = {
  window: { title: '窗边', copy: '把身体和重要的日子记下来。', actions: [['btnRoomPeriod', '经期记录', 'period'], ['btnRoomAnniversary', '纪念日', 'anniversary']] },
  desk: { title: '书桌', copy: '今晚要做的事，一件件完成。', actions: [['btnRoomTodo', '待办清单', 'todo'], ['btnRoomPomodoro', '番茄钟', 'pomodoro']] },
  cabinet: { title: '回忆柜', copy: '所有留下来的瞬间，都在这里。', actions: [['btnRoomTimeline', '回忆时间轴', 'timeline'], ['btnRoomVault', '我的私藏', 'privateVault']] },
  mail: { title: '信箱', copy: '写给未来的你，到了再打开。', actions: [['btnRoomLetters', '未来信件', 'letters']] },
  game: { title: '游戏台', copy: '歇一会，来一局。', actions: [['btnRoomSnake', '贪吃鸦', 'snake']] }
};
```

- [ ] **Step 4: Implement only the destination router, preserving existing panels**

```js
function openRoomDestination(destination) {
  closeUtilPanel('room');
  if (destination === 'timeline') {
    if (memoryDrawerController) memoryDrawerController.open();
    return;
  }
  openUtilPanel(destination);
}
```

- [ ] **Step 5: Bind scene buttons and delegate action tray clicks**

```js
document.querySelectorAll('.room-hotspot').forEach(function(button) {
  button.addEventListener('click', function() { selectRoomZone(this.dataset.zone); });
});
document.getElementById('roomZoneActions').addEventListener('click', function(event) {
  var action = event.target.closest('[data-room-destination]');
  if (action) openRoomDestination(action.dataset.roomDestination);
});
```

- [ ] **Step 6: Run the focused test and full suite**

Run: `node --test tests/dark-point-companion-space.test.js`

Expected: PASS.

Run: `node --test tests/*.test.js`

Expected: all existing and new tests PASS.

### Task 5: Verify real interaction, commit, and push

**Files:**
- Modify: `index.html`
- Create: `assets/dark-point/*.png`
- Create: `tests/dark-point-companion-space.test.js`
- Modify: `.gitignore`
- Create: `docs/superpowers/specs/2026-08-25-dark-point-companion-space-design.md`
- Create: `docs/superpowers/plans/2026-08-25-dark-point-companion-space-implementation.md`

**Interfaces:**
- Consumes: all completed Tasks 1–4.
- Produces: a tested, pushed companion-space feature.

- [ ] **Step 1: Start a local static server and check both themes**

Run: `py -m http.server 4173`

Verify manually:

```text
1. Open 暗点 from the top navigation and hero state card.
2. Select each of the five room objects and check its action tray.
3. Open all eight destinations and confirm each existing overlay/drawer opens.
4. Toggle the site theme and re-open 暗点.
5. Repeat a zone selection at a mobile viewport.
```

- [ ] **Step 2: Run the full test suite after visual checks**

Run: `node --test tests/*.test.js`

Expected: all tests PASS with no skipped failures.

- [ ] **Step 3: Check only intended project changes are staged**

Run: `git status --short`

Expected: only the listed implementation files; `.superpowers/` remains ignored.

- [ ] **Step 4: Commit and push the feature**

```bash
git add .gitignore index.html assets/dark-point tests/dark-point-companion-space.test.js docs/superpowers/specs/2026-08-25-dark-point-companion-space-design.md docs/superpowers/plans/2026-08-25-dark-point-companion-space-implementation.md
git commit -m "feat: turn dark point into companion space"
git push origin master
```
