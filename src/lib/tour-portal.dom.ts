import type { TourProps } from './tour.types';

/** Portal сохраняет вычисленные CSS variables исходной Svelte theme boundary. */
export function connectTourPortal(element: HTMLElement, options: {
  getPopupContainer: TourProps['getPopupContainer'];
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

interface EscapeScope {
  callbacks: ((event: KeyboardEvent) => void)[];
  compositionEnded: number;
  keydown: (event: KeyboardEvent) => void;
  compositionend: () => void;
}
const escapeScopes = new WeakMap<Window, EscapeScope>();

export function connectTourEscape(view: Window, callback: (event: KeyboardEvent) => void) {
  let scope = escapeScopes.get(view);
  if (!scope) {
    const state: EscapeScope = {
      callbacks: [],
      compositionEnded: 0,
      keydown(event) {
        if (event.key !== 'Escape' || event.isComposing
          || Date.now() - state.compositionEnded < 200) return;
        for (const handler of [...state.callbacks].reverse()) handler(event);
      },
      compositionend() {
        state.compositionEnded = Date.now();
      }
    };
    scope = state;
    escapeScopes.set(view, scope);
  }
  if (!scope.callbacks.length) {
    view.addEventListener('keydown', scope.keydown);
    view.addEventListener('compositionend', scope.compositionend);
  }
  scope.callbacks.push(callback);
  return () => {
    const index = scope.callbacks.indexOf(callback);
    if (index !== -1) scope.callbacks.splice(index, 1);
    if (!scope.callbacks.length) {
      view.removeEventListener('keydown', scope.keydown);
      view.removeEventListener('compositionend', scope.compositionend);
    }
  };
}
