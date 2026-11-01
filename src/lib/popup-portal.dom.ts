/** Portal сохраняет вычисленные CSS variables исходной Svelte theme boundary. */
export function connectPopupPortal(element: HTMLElement, options: {
  getPopupContainer: false | ((reference?: HTMLElement) => HTMLElement) | undefined;
  reference?: HTMLElement;
  autoLock: boolean;
  origin: HTMLElement;
  marker: Comment;
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

  function syncTheme() {
    if (!active || inline) return;
    const source = view.getComputedStyle(origin);
    const values = new Map<string, string>();
    for (const name of source) {
      if (name.startsWith('--')) values.set(name, source.getPropertyValue(name));
    }
    for (const name of managed) element.style.removeProperty(name);
    managed.clear();
    const actual = view.getComputedStyle(element);
    for (const [name, value] of values) {
      if (actual.getPropertyValue(name) !== value) {
        element.style.setProperty(name, value);
        managed.add(name);
      }
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
  else if (container !== element && !element.contains(container)) container.append(element);
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

  return () => {
    active = false;
    observer.disconnect();
    view.removeEventListener('resize', scheduleTheme);
    lock?.remove();
    for (const name of managed) element.style.removeProperty(name);
    if (!inline) element.remove();
  };
}
