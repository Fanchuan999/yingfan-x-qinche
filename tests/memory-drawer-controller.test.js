const test = require('node:test');
const assert = require('node:assert/strict');

let drawerModule = {};
try {
  drawerModule = require('../memory-drawer.js');
} catch (error) {
  drawerModule = {};
}

function createElement() {
  const classes = new Set();
  return {
    attributes: {},
    classList: {
      toggle(name, enabled) {
        if (enabled) classes.add(name);
        else classes.delete(name);
      },
      contains(name) {
        return classes.has(name);
      }
    },
    setAttribute(name, value) {
      this.attributes[name] = String(value);
    },
    addEventListener() {},
    focus() {}
  };
}

test('memory drawer toggles visual and ARIA state', () => {
  assert.equal(typeof drawerModule.createMemoryDrawerController, 'function');
  const drawer = createElement();
  const trigger = createElement();
  const body = createElement();
  const controller = drawerModule.createMemoryDrawerController({
    drawer,
    trigger,
    closeButton: createElement(),
    documentRef: { addEventListener() {} },
    body
  });

  controller.open();
  assert.equal(drawer.classList.contains('is-open'), true);
  assert.equal(body.classList.contains('memory-drawer-open'), true);
  assert.equal(drawer.attributes['aria-hidden'], 'false');
  assert.equal(trigger.attributes['aria-expanded'], 'true');

  controller.close();
  assert.equal(drawer.classList.contains('is-open'), false);
  assert.equal(body.classList.contains('memory-drawer-open'), false);
  assert.equal(drawer.attributes['aria-hidden'], 'true');
  assert.equal(trigger.attributes['aria-expanded'], 'false');
});

test('memory drawer Escape closes an open drawer only', () => {
  assert.equal(typeof drawerModule.createMemoryDrawerController, 'function');
  const controller = drawerModule.createMemoryDrawerController({
    drawer: createElement(),
    trigger: createElement(),
    closeButton: createElement(),
    documentRef: { addEventListener() {} },
    body: createElement()
  });

  controller.handleKeydown({ key: 'Escape' });
  assert.equal(controller.isOpen(), false);
  controller.open();
  controller.handleKeydown({ key: 'Escape' });
  assert.equal(controller.isOpen(), false);
});

test('memory drawer notifies its owner after a visible drawer closes', () => {
  let closeCount = 0;
  const controller = drawerModule.createMemoryDrawerController({
    drawer: createElement(),
    trigger: createElement(),
    closeButton: createElement(),
    documentRef: { addEventListener() {} },
    body: createElement(),
    onClose() { closeCount += 1; }
  });

  controller.open();
  controller.close();

  assert.equal(closeCount, 1);
});
