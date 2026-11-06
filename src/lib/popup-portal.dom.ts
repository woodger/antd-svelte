import { getPopupActiveElement } from './popup.dom';

function readPopupThemeVariables(origin: HTMLElement) {
  const document = origin.ownerDocument;
  const view = document.defaultView!;
  const source = view.getComputedStyle(origin);
  const values = new Map<string, string>();
  for (const name of source) {
    if (name.startsWith('--')) values.set(name, source.getPropertyValue(name));
  }
  const empty = [...values.keys()].filter(name => values.get(name) === '');
  if (!empty.length) return values;

  // CSSOM возвращает '' и для пустого списка токенов, и для guaranteed-invalid.
  const typed = origin.computedStyleMap?.();
  if (typed) {
    for (const name of empty) values.set(name, typed.get(name) === undefined ? 'initial' : ' ');
    return values;
  }

  const probe = document.createElement('span');
  probe.hidden = true;
  probe.style.setProperty('display', 'none', 'important');
  empty.forEach((name, index) => {
    probe.style.setProperty(`--ant-svelte-popup-probe-${index}`,
      `var(${CSS.escape(name)}, ant-svelte-invalid)`, 'important');
  });
  origin.append(probe);
  try {
    const computed = view.getComputedStyle(probe);
    empty.forEach((name, index) => {
      const invalid = computed.getPropertyValue(`--ant-svelte-popup-probe-${index}`).trim()
        === 'ant-svelte-invalid';
      values.set(name, invalid ? 'initial' : ' ');
    });
  } finally {
    probe.remove();
  }
  return values;
}

/** Portal сохраняет вычисленные CSS variables исходной Svelte theme boundary. */
export function connectPopupPortal(element: HTMLElement, options: {
  getPopupContainer: false | ((reference?: HTMLElement) => Element | DocumentFragment) | undefined;
  reference?: HTMLElement;
  autoLock: boolean;
  origin: HTMLElement;
  marker: Comment;
  preserveVariables?: readonly string[];
  restoreOnDestroy?: boolean;
}) {
  const origin = options.origin;
  const document = element.ownerDocument;
  const view = document.defaultView!;
  const getter = options.getPopupContainer;
  const inline = getter === false;
  const modal = origin.closest<HTMLDialogElement>('dialog:modal');
  const container = inline ? origin : typeof getter === 'function'
    ? (options.reference ? getter(options.reference) : getter()) ?? document.body
    : modal ?? document.body;
  const managed = new Set<string>();
  let active = true;
  let queued = false;

  function move(parent: Element | DocumentFragment, before: ChildNode | null) {
    if (element.parentNode === parent && element.nextSibling === before) return;
    const focused = getPopupActiveElement(element);
    if (typeof parent.moveBefore === 'function' && parent.isConnected && element.isConnected) {
      parent.moveBefore(element, before);
    } else {
      parent.insertBefore(element, before);
      if (focused instanceof view.HTMLElement && element.contains(focused)
        && document.activeElement === document.body) focused.focus({ preventScroll: true });
    }
  }

  function clearManaged() {
    const preserved = new Set(options.preserveVariables);
    // После прошлого sync переменная могла перейти component-theme attachment.
    for (const name of managed) {
      if (!preserved.has(name)) element.style.removeProperty(name);
    }
    managed.clear();
    return preserved;
  }

  function syncTheme() {
    if (!active || inline) return;
    const values = readPopupThemeVariables(origin);
    const preserved = clearManaged();
    // Копируем готовые значения: локальный var() иначе пересчитается после записи соседней переменной.
    for (const [name, value] of values) {
      if (preserved.has(name)) continue;
      element.style.setProperty(name, value);
      managed.add(name);
    }
  }

  function scheduleTheme() {
    if (queued) return;
    queued = true;
    queueMicrotask(() => {
      queued = false;
      syncTheme();
    });
  }

  // Native dialog делает body inert; стандартный portal остаётся в его top layer.
  element.style.pointerEvents = !getter && modal ? 'auto' : '';
  if (inline) origin.insertBefore(element, options.marker.nextSibling);
  else if (container !== element && !element.contains(container)) {
    if (options.restoreOnDestroy) move(container, null);
    else container.append(element);
  }
  syncTheme();
  const observer = new view.MutationObserver(scheduleTheme);
  if (!inline) {
    let ancestor: HTMLElement | null = origin;
    while (ancestor) {
      observer.observe(ancestor, { attributes: true });
      ancestor = ancestor.parentElement;
    }
    view.addEventListener('resize', scheduleTheme);
  }

  // Отдельный style принадлежит portal: inline и пользовательские контейнеры не блокируют body.
  let lock: HTMLStyleElement | undefined;
  if (!inline && options.autoLock && (!getter || container === document.body)) {
    const body = document.body;
    const overflowing = body.scrollHeight
      > (view.innerHeight || document.documentElement.clientHeight)
      && view.innerWidth > body.offsetWidth;
    const scrollbar = Math.max(0, view.innerWidth - document.documentElement.clientWidth);
    lock = document.createElement('style');
    lock.dataset.antTourLock = '';
    lock.textContent = `html body { overflow-y:hidden;${overflowing ? `width:calc(100% - ${scrollbar}px);` : ''} }`;
    document.head.append(lock);
  }

  const disconnect = () => {
    active = false;
    observer.disconnect();
    view.removeEventListener('resize', scheduleTheme);
    lock?.remove();
    clearManaged();
    if (!inline) {
      const parent = options.marker.parentNode;
      if (options.restoreOnDestroy && options.marker.isConnected && parent)
        move(parent as Element | DocumentFragment, options.marker.nextSibling);
      else element.remove();
    }
  };
  return Object.assign(disconnect, { syncTheme });
}
