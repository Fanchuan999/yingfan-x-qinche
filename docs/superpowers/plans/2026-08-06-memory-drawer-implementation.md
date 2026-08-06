# 回忆抽屉与语录圆点 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (- [ ]) syntax for tracking.

**Goal:** 将回忆时间轴改造成由“秦彻·你”打开的左侧图片档案抽屉，并让语录切换圆点固定为单行。

**Architecture:** index.html 继续负责页面、样式和既有存储；新增两个无依赖 UMD 小模块，分别负责稳定选图与抽屉开关状态。时间线数据继续由现有 getTimelineEntries() 生成，渲染目标迁移为抽屉内的纵向列表。

**Tech Stack:** 原生 HTML/CSS/JavaScript、node:test、localStorage、IndexedDB。

## Global Constraints

- 不新增网络请求、第三方库或付费服务。
- 保留 qinche_memory_timeline_v1、照片墙和 IndexedDB 数据结构。
- 深浅主题都采用黑、暗红、酒红、暖金色体系，不出现蓝色表层。
- 自定义记忆仍可新增、展开、删除并使用现有删除确认。
- 同一条目在照片库未改变时始终选择同一张回退图。
- 语录圆点不换行；窄屏可水平滚动访问所有圆点。

---

### Task 1: 稳定的时间轴背景选图

**Files:**
- Create: timeline-helpers.js
- Create: tests/timeline-helpers.test.js
- Modify: index.html（在主内联脚本前加载模块）

**Interfaces:**
- Produces: window.QincheTimelineHelpers.pickTimelineImage(entry, galleryItems)。
- Input: entry has id and date; gallery items have src and optional createdAt.
- Output: image src or an empty string.

- [ ] **Step 1: 写入失败测试。**

~~~js
const test = require('node:test');
const assert = require('node:assert/strict');
const { pickTimelineImage } = require('../timeline-helpers.js');
const gallery = [
  { src: 'default-a.jpg' },
  { src: 'same-day.jpg', createdAt: Date.UTC(2026, 7, 6, 8) },
  { src: 'default-b.jpg' }
];
test('timeline image prefers a photo from the entry date', () => {
  assert.equal(pickTimelineImage({ id: 'photos-2026-08-06', date: '2026-08-06' }, gallery), 'same-day.jpg');
});
test('timeline image fallback is deterministic', () => {
  const entry = { id: 'default-n109', date: '2048-06-01' };
  assert.equal(pickTimelineImage(entry, gallery), pickTimelineImage(entry, gallery));
});
test('timeline image returns empty without photos', () => {
  assert.equal(pickTimelineImage({ id: 'empty', date: '2026-08-06' }, []), '');
});
~~~

- [ ] **Step 2: 运行测试，确认模块缺失导致失败。**

Run: node --test tests/timeline-helpers.test.js
Expected: FAIL with Cannot find module '../timeline-helpers.js'.

- [ ] **Step 3: 实现最小 UMD 模块。**

~~~js
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
    for (var index = 0; index < seed.length; index += 1) hash = ((hash << 5) - hash + seed.charCodeAt(index)) | 0;
    return Math.abs(hash) % length;
  }
  function pickTimelineImage(entry, galleryItems) {
    var candidates = (galleryItems || []).filter(function(item) { return item && typeof item.src === 'string' && item.src; });
    if (!candidates.length) return '';
    var matching = candidates.filter(function(item) { return toDateKey(item.createdAt) === entry.date; });
    var pool = matching.length ? matching : candidates;
    return pool[stableIndex(String(entry.id || '') + '|' + String(entry.date || ''), pool.length)].src;
  }
  return { pickTimelineImage: pickTimelineImage };
});
~~~

- [ ] **Step 4: 在 index.html 添加脚本标签并运行测试。**

Run: node --test tests/timeline-helpers.test.js
Expected: PASS (3 tests).

- [ ] **Step 5: 提交。**

~~~bash
git add timeline-helpers.js tests/timeline-helpers.test.js index.html
git commit -m "Add deterministic timeline image helper"
~~~

### Task 2: 抽屉壳与可测试的开关控制器

**Files:**
- Create: memory-drawer.js
- Create: tests/memory-drawer-controller.test.js
- Modify: index.html:167-210、index.html:4403-4440、index.html:4070-4252

**Interfaces:**
- Produces: window.QincheMemoryDrawer.createMemoryDrawerController(options).
- options: { drawer, trigger, closeButton, documentRef, body, onOpen }.
- Controller: { open, close, toggle, bind, isOpen, handleKeydown }.

- [ ] **Step 1: 写入失败测试。**

~~~js
const test = require('node:test');
const assert = require('node:assert/strict');
const { createMemoryDrawerController } = require('../memory-drawer.js');
function element() {
  const classes = new Set();
  return { attributes: {}, classList: { toggle: (n, on) => on ? classes.add(n) : classes.delete(n), contains: n => classes.has(n) }, setAttribute(n, v) { this.attributes[n] = String(v); }, addEventListener() {}, focus() {} };
}
test('drawer opens and restores ARIA state on close', () => {
  const drawer = element(); const trigger = element();
  const controller = createMemoryDrawerController({ drawer, trigger, closeButton: element(), documentRef: { addEventListener() {} }, body: element() });
  controller.open();
  assert.equal(drawer.classList.contains('is-open'), true);
  assert.equal(trigger.attributes['aria-expanded'], 'true');
  controller.close();
  assert.equal(drawer.classList.contains('is-open'), false);
  assert.equal(trigger.attributes['aria-expanded'], 'false');
});
test('drawer closes when Escape is handled', () => {
  const drawer = element();
  const controller = createMemoryDrawerController({ drawer, trigger: element(), closeButton: element(), documentRef: { addEventListener() {} }, body: element() });
  controller.open(); controller.handleKeydown({ key: 'Escape' });
  assert.equal(controller.isOpen(), false);
});
~~~

- [ ] **Step 2: 运行测试，确认模块缺失导致失败。**

Run: node --test tests/memory-drawer-controller.test.js
Expected: FAIL with Cannot find module '../memory-drawer.js'.

- [ ] **Step 3: 实现模块，并加载到 index.html。**

~~~js
function createMemoryDrawerController(options) {
  var opened = false;
  function setOpen(next) {
    opened = !!next;
    options.drawer.classList.toggle('is-open', opened);
    options.drawer.setAttribute('aria-hidden', opened ? 'false' : 'true');
    options.trigger.setAttribute('aria-expanded', opened ? 'true' : 'false');
    options.body.classList.toggle('memory-drawer-open', opened);
    if (opened && typeof options.onOpen === 'function') options.onOpen();
  }
  function handleKeydown(event) { if (event.key === 'Escape' && opened) setOpen(false); }
  function bind() {
    options.trigger.addEventListener('click', function() { setOpen(!opened); });
    options.closeButton.addEventListener('click', function() { setOpen(false); });
    options.documentRef.addEventListener('keydown', handleKeydown);
  }
  return { open: function() { setOpen(true); }, close: function() { setOpen(false); }, toggle: function() { setOpen(!opened); }, bind: bind, isOpen: function() { return opened; }, handleKeydown: handleKeydown };
}
~~~

- [ ] **Step 4: 移动旧首页时间轴 DOM 到抽屉，并替换导航 logo。**

~~~html
<button class="logo" id="btnMemoryDrawer" type="button" aria-controls="memoryDrawer" aria-expanded="false">秦彻·你</button>
<div class="memory-drawer" id="memoryDrawer" aria-hidden="true">
  <div class="memory-drawer-backdrop" data-memory-drawer-close></div>
  <aside class="memory-drawer-panel" role="dialog" aria-modal="true" aria-labelledby="memoryDrawerTitle" tabindex="-1">
    <header class="memory-drawer-header">
      <div><p class="sub">MEMORY ARCHIVE</p><h2 id="memoryDrawerTitle">回忆时间轴</h2></div>
      <button class="memory-drawer-close" id="btnMemoryDrawerClose" type="button" aria-label="关闭回忆时间轴">×</button>
    </header>
    <div class="memory-drawer-timeline" id="memoryDrawerTimeline"></div>
    <!-- 保留 btnToggleMemoryForm 和 memoryForm 原 id -->
  </aside>
</div>
~~~

- [ ] **Step 5: 用抽屉样式替换首页横向轨道样式。**

~~~css
.memory-drawer { inset: 0; pointer-events: none; position: fixed; z-index: 260; }
.memory-drawer.is-open { pointer-events: auto; }
.memory-drawer-backdrop { background: rgba(8, 4, 6, 0.58); inset: 0; opacity: 0; position: absolute; transition: opacity 0.28s ease; }
.memory-drawer.is-open .memory-drawer-backdrop { opacity: 1; }
.memory-drawer-panel { background: var(--bg); box-shadow: 20px 0 50px rgba(0, 0, 0, 0.34); height: 100%; overflow-y: auto; transform: translateX(-100%); transition: transform 0.32s ease; width: min(42vw, 680px); }
.memory-drawer.is-open .memory-drawer-panel { transform: translateX(0); }
body.memory-drawer-open { overflow: hidden; }
@media (max-width: 768px) { .memory-drawer-panel { width: 100%; } }
~~~

- [ ] **Step 6: 运行测试并提交。**

Run: node --test tests/memory-drawer-controller.test.js
Expected: PASS (2 tests).

~~~bash
git add memory-drawer.js tests/memory-drawer-controller.test.js index.html
git commit -m "Add memory timeline drawer shell"
~~~

### Task 3: 纵向图片档案条目

**Files:**
- Modify: index.html:10590-10920、index.html:4070-4252
- Modify: tests/timeline-helpers.test.js

**Interfaces:**
- Consumes: getTimelineEntries()、galleryItems、QincheTimelineHelpers.pickTimelineImage() 和 memoryDrawerTimeline。
- Preserves: homeTimelineSelectedId、addMemoryEntry()、deleteMemoryEntry()、openMemoryDeleteConfirm().

- [ ] **Step 1: 添加选图空库边界测试。**

~~~js
test('timeline image does not create an invalid source for an empty gallery', () => {
  assert.equal(pickTimelineImage({ id: 'default-abyss', date: '2046-01-01' }, []), '');
});
~~~

- [ ] **Step 2: 确认渲染代码尚未接入选图模块。**

Run: rg -n "QincheTimelineHelpers.pickTimelineImage" index.html
Expected: no match before integration.

- [ ] **Step 3: 迁移 renderMemoryTimeline()，用背景图和文字层渲染条目。**

~~~js
var imageSrc = window.QincheTimelineHelpers.pickTimelineImage(entry, galleryItems);
var article = document.createElement('article');
article.className = 'memory-drawer-entry timeline-entry-' + entry.type;
var image = document.createElement('img');
image.className = 'memory-drawer-entry-image'; image.src = imageSrc; image.alt = ''; image.loading = 'lazy';
var openButton = document.createElement('button');
openButton.className = 'memory-drawer-entry-open'; openButton.type = 'button';
openButton.setAttribute('aria-expanded', entry.id === selectedId ? 'true' : 'false');
openButton.addEventListener('click', function() { selectHomeTimelineEntry(entry.id); });
article.append(image, openButton);
~~~

- [ ] **Step 4: 添加图片分层、纵向节点、选中展开和深浅红系覆盖样式。**

~~~css
.memory-drawer-entry { min-height: 178px; overflow: hidden; position: relative; }
.memory-drawer-entry-image { height: 100%; inset: 0; object-fit: cover; position: absolute; width: 100%; }
.memory-drawer-entry::after { background: linear-gradient(90deg, rgba(21, 8, 10, 0.84), rgba(48, 15, 20, 0.5) 62%, rgba(24, 8, 11, 0.16)); content: ''; inset: 0; position: absolute; }
.memory-drawer-entry-open { color: #f0e6dc; inset: 0; padding: 26px 34px 24px 82px; position: relative; text-align: left; z-index: 1; }
[data-theme="light"] .memory-drawer-entry::after { background: linear-gradient(90deg, rgba(91, 34, 46, 0.68), rgba(135, 62, 76, 0.38) 62%, rgba(255, 241, 241, 0.08)); }
~~~

- [ ] **Step 5: 删除横向拖动、空格/双击聚焦逻辑；小屋“回忆”入口改为打开抽屉。**

~~~js
document.getElementById('btnRoomTimeline').addEventListener('click', function() {
  closeUtilPanel('room');
  memoryDrawerController.open();
});
~~~

- [ ] **Step 6: 运行全部 Node 测试、内联脚本语法检查并提交。**

Run: node --test tests/timeline-helpers.test.js tests/memory-drawer-controller.test.js
Expected: PASS (all tests).

Run: node -e "const fs=require('fs'); const html=fs.readFileSync('index.html','utf8'); const scripts=[...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)].map(m=>m[1]); scripts.forEach(s=>new Function(s)); console.log('Inline JavaScript syntax: OK');"
Expected: Inline JavaScript syntax: OK.

~~~bash
git add index.html tests/timeline-helpers.test.js
git commit -m "Render timeline as image archive"
~~~

### Task 4: 单行语录圆点与浏览器验收

**Files:**
- Create: tests/quote-dots-layout.test.js
- Modify: index.html:785-825

**Interfaces:**
- Preserves: refreshQuotes()、showQuote()、自动轮播、点击和 ARIA 属性。
- Produces: 横向可滚动且不换行的 quoteDots。

- [ ] **Step 1: 写入失败测试。**

~~~js
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const html = fs.readFileSync('index.html', 'utf8');
test('quote dots are a single horizontal row', () => {
  const rules = html.match(/\.quote-dots\s*\{[^}]*\}/)[0];
  assert.match(rules, /flex-wrap:\s*nowrap/);
  assert.match(rules, /overflow-x:\s*auto/);
});
~~~

- [ ] **Step 2: 运行测试，确认当前 flex-wrap: wrap 使测试失败。**

Run: node --test tests/quote-dots-layout.test.js
Expected: FAIL because flex-wrap: nowrap is absent.

- [ ] **Step 3: 修改样式。**

~~~css
.quote-dots { display: flex; flex-wrap: nowrap; gap: 6px; justify-content: flex-start; margin: 20px auto 0; max-width: calc(100vw - 40px); overflow-x: auto; padding: 0 8px 4px; scrollbar-width: thin; width: min(1050px, 100%); }
.quote-dot { flex: 0 0 26px; }
~~~

- [ ] **Step 4: 运行最终自动检查。**

Run: node --test tests/timeline-helpers.test.js tests/memory-drawer-controller.test.js tests/quote-dots-layout.test.js
Expected: PASS (all tests).

Run: git diff --check
Expected: no output and exit code 0.

- [ ] **Step 5: 启动静态服务器并进行浏览器验收。**

Run: python -m http.server 4173 --bind 127.0.0.1
Check at http://127.0.0.1:4173/:

1. Desktop: logo opens the left drawer; backdrop, close button and Esc close it; homepage remains behind the overlay.
2. Timeline: image strips render, entries expand, custom memory can be added, deletion cancel preserves it and confirm removes it.
3. Theme: dark and light themes have no blue timeline layer and all text remains readable.
4. Mobile 390 × 844: drawer is full width and vertically scrolls; quote dots stay one row, scroll horizontally and switch quotes.

- [ ] **Step 6: 提交。**

~~~bash
git add index.html tests/quote-dots-layout.test.js
git commit -m "Keep quote navigation in one row"
~~~

## Plan Self-Review

- Spec coverage: Task 1 covers automatic stable images; Task 2 covers left drawer, close paths, responsive behavior and ARIA; Task 3 covers vertical image memories and preserves core actions; Task 4 covers one-row quote dots and desktop/mobile verification.
- Placeholder scan: no unfinished markers or unassigned interface.
- Type consistency: Task 1 exports pickTimelineImage(entry, galleryItems) consumed by Task 3. Task 2 exports createMemoryDrawerController(options) instantiated by Task 3.
