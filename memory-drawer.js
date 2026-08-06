(function(root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.QincheMemoryDrawer = api;
})(typeof window !== 'undefined' ? window : globalThis, function() {
  function createMemoryDrawerController(options) {
    var opened = false;

    function setOpen(next) {
      opened = !!next;
      options.drawer.classList.toggle('is-open', opened);
      options.drawer.setAttribute('aria-hidden', opened ? 'false' : 'true');
      options.trigger.setAttribute('aria-expanded', opened ? 'true' : 'false');
      options.body.classList.toggle('memory-drawer-open', opened);
      if (opened && typeof options.onOpen === 'function') options.onOpen();
      if (opened && options.focusTarget && typeof options.focusTarget.focus === 'function') options.focusTarget.focus();
    }

    function handleKeydown(event) {
      if (event.key === 'Escape' && opened) setOpen(false);
    }

    function bind() {
      options.trigger.addEventListener('click', function() { setOpen(!opened); });
      options.closeButton.addEventListener('click', function() { setOpen(false); });
      if (options.backdrop) options.backdrop.addEventListener('click', function() { setOpen(false); });
      options.documentRef.addEventListener('keydown', handleKeydown);
    }

    return {
      open: function() { setOpen(true); },
      close: function() { setOpen(false); },
      toggle: function() { setOpen(!opened); },
      bind: bind,
      isOpen: function() { return opened; },
      handleKeydown: handleKeydown
    };
  }

  return { createMemoryDrawerController: createMemoryDrawerController };
});
