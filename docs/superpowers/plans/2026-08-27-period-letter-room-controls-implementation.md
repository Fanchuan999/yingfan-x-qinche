# Reminder, Letter, and Room Controls Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Correct reminder permission copy, create an optional API-powered Qin Che letter draft, and remove the manual Dark Point night-state control.

**Architecture:** Keep the static single-page architecture. Extract deterministic letter-request and room-state normalization helpers into small UMD modules so Node tests verify behavior without a browser. The page consumes these helpers while retaining its existing storage and AI configuration mechanisms.

**Tech Stack:** HTML, CSS, browser JavaScript, Node.js built-in test runner.

**Spec:** `docs/superpowers/specs/2026-08-27-period-letter-room-controls-design.md`

## Global Constraints

- Keep all data local to the browser.
- Reuse the existing chat API endpoint, API key, and system prompt; do not add a backend.
- API use occurs only after an explicit click and never seals a letter automatically.
- Preserve time-based nighttime ambience through the `auto` room state.

---

### Task 1: Add deterministic helper contracts

**Files:**
- Create: `future-letter-ai.js`
- Create: `room-state-helpers.js`
- Create: `tests/future-letter-ai.test.js`
- Create: `tests/room-state-helpers.test.js`

**Interfaces:**
- Produces `buildFutureLetterMessages(endpoint, nickname, tone)` returning two chat messages.
- Produces `extractFutureLetterContent(payload)` returning response text or an empty string.
- Produces `normalizeStoredRoomState(value)` returning `auto`, `watch`, or `focus`.

- [ ] **Step 1: Write failing helper tests**

```js
assert.match(buildFutureLetterMessages(endpoint, '阿帆', 'watch')[1].content, /约 300 字/);
assert.equal(extractFutureLetterContent({ choices: [{ message: { content: '来信' } }] }), '来信');
assert.equal(normalizeStoredRoomState('night'), 'auto');
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `node --test tests/future-letter-ai.test.js tests/room-state-helpers.test.js`

Expected: FAIL because the modules do not exist.

- [ ] **Step 3: Add the minimal helper implementations**

- [ ] **Step 4: Run the helper tests to verify they pass**

Run: `node --test tests/future-letter-ai.test.js tests/room-state-helpers.test.js`

Expected: PASS.

### Task 2: Wire the panel controls and room-state migration

**Files:**
- Modify: `index.html:4000-4255, 5314-5360, 7377-7510, 10957-11030, 12096-12135`
- Test: `tests/future-letter-ai.test.js`
- Test: `tests/room-state-helpers.test.js`
- Test: `tests/dark-point-companion-space.test.js`

**Interfaces:**
- Consumes `FutureLetterAI.buildFutureLetterMessages`, `FutureLetterAI.extractFutureLetterContent`, and `RoomStateHelpers.normalizeStoredRoomState`.
- Produces `requestLetterFromHim()` as the button handler.

- [ ] **Step 1: Write failing page-contract tests**

```js
assert.match(page, /id="btnLetterFromHim"/);
assert.match(page, /写给未来的你，日期到了再打开。/);
assert.doesNotMatch(getRoomPicker(), /value="night"/);
```

- [ ] **Step 2: Run the page-contract tests to verify they fail**

Run: `node --test tests/future-letter-ai.test.js tests/dark-point-companion-space.test.js`

Expected: FAIL because the button and copy are not present, and the night option remains.

- [ ] **Step 3: Implement the smallest UI and event-handler changes**

- [ ] **Step 4: Run focused tests to verify they pass**

Run: `node --test tests/future-letter-ai.test.js tests/room-state-helpers.test.js tests/dark-point-companion-space.test.js`

Expected: PASS.

### Task 3: Verify interaction and publish

**Files:**
- Modify: `index.html` only if visual verification finds an issue.

- [ ] **Step 1: Start the local site and verify desktop and mobile controls**
- [ ] **Step 2: Run the complete Node test suite and `git diff --check`**
- [ ] **Step 3: Commit the changes with `feat: refine reminders and future letters`**
- [ ] **Step 4: Push `master` so the earlier starfield commit and this feature publish together**
