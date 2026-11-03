import { onMount, untrack } from 'svelte';
import { on } from 'svelte/events';
import type { GetContainer, GetPopupContainer } from './types';
import { connectPopupPortal } from './popup-portal.dom';

interface DialogContainerOptions {
  component: 'modal' | 'drawer';
  getContainer?: GetContainer;
  getPopupContainer?: GetPopupContainer;
  enabled?: boolean;
  style?: string;
  onPointerDown?: (event: PointerEvent) => void;
  onPointerUp?: (event: PointerEvent) => void;
  onPointerCancel?: () => void;
}

/** Первый перенос сохраняет SSR DOM; последующая смена target пересоздаёт panel, как portal. */
export function createDialogContainer(getOptions: () => DialogContainerOptions) {
  let target = $state.raw<Element | DocumentFragment | false>();
  let revision = $state(0);
  let connected = $state(false);
  let connection = $state.raw<ReturnType<typeof connectPopupPortal>>();
  let initialized = false;
  let currentRevision = 0;
  let activeNode: HTMLDialogElement | undefined;
  let mounted = $state(false);
  // Контейнер/selector разрешается после DOM commit, как повторная проверка Portal в effect.
  onMount(() => { mounted = true; });

  $effect.pre(() => {
    if (!mounted) return;
    const options = getOptions();
    if (options.enabled === false) return;

    const choice = options.getContainer;
    let next: Element | DocumentFragment | false | undefined;
    if (choice === undefined) {
      const getter = options.getPopupContainer;
      next = getter
        ? (options.component === 'drawer' ? getter(document.body) : getter()) ?? document.body
        : undefined;
    } else if (choice === false) next = false;
    else if (typeof choice === 'string') {
      next = (choice ? document.querySelector(choice) : null) ?? document.body;
    }
    else next = (typeof choice === 'function' ? choice() : choice) ?? document.body;

    if (initialized && next !== target) revision = ++currentRevision;
    initialized = true;
    target = next;
  });

  $effect(() => {
    void getOptions().style;
    const current = connection;
    if (current) queueMicrotask(() => current.syncTheme());
  });

  function attach(node: HTMLDialogElement) {
    const container = target;
    return untrack(() => {
      const nodeRevision = currentRevision;
      activeNode = node;
      const document = node.ownerDocument;
      const view = document.defaultView!;
      const marker = document.createComment('dialog-container');
      node.before(marker);
      const current = container ? connectPopupPortal(node, {
        getPopupContainer: () => container,
        origin: node.parentElement ?? node,
        marker,
        autoLock: false,
        // Cleanup старого keyed panel не должен возвращать уничтожаемый DOM в исходную ветку.
        get restoreOnDestroy() { return node.isConnected && nodeRevision === currentRevision; },
        get preserveVariables() {
          const style = document.createElement('span').style;
          style.cssText = getOptions().style ?? '';
          return [
            '--ant-svelte-drawer-size',
            ...Array.from(style).filter(name => name.startsWith('--'))
          ];
        }
      }) : undefined;
      connection = current;
      let lock: HTMLStyleElement | undefined;

      function sync() {
        connected = node.isConnected;
        // :has() в document не видит modal внутри ShadowRoot; модальность остаётся нативной.
        const shadowModal = node.isConnected && node.open && node.getRootNode() instanceof ShadowRoot;
        if (shadowModal && !lock) {
          lock = document.createElement('style');
          lock.dataset.antDialogLock = '';
          lock.textContent = 'html { overflow: hidden; }';
          document.head.append(lock);
        } else if (!shadowModal && lock) {
          lock.remove();
          lock = undefined;
        }
      }
      const observer = new view.MutationObserver(sync);
      observer.observe(node, { attributes: true, attributeFilter: ['open'] });
      // Контейнер может быть временно отключён или быть DocumentFragment до вставки владельцем.
      if (container) observer.observe(document, { childList: true, subtree: true });
      sync();
      // Child handlers выполняются внутри shadow boundary с исходными native event targets.
      const listeners = [
        'click', 'keydown', 'keyup', 'focusin', 'focusout'
      ].map(type => on(node, type, () => {}));
      // Root handler тоже должен получить native target до retargeting на ShadowRoot host.
      listeners.push(
        on(node, 'pointerdown', event => getOptions().onPointerDown?.(event)),
        on(node, 'pointerup', event => getOptions().onPointerUp?.(event)),
        on(node, 'pointercancel', () => getOptions().onPointerCancel?.())
      );

      return () => {
        observer.disconnect();
        for (const remove of listeners) remove();
        lock?.remove();
        current?.();
        marker.remove();
        if (connection === current) connection = undefined;
        if (activeNode === node) {
          activeNode = undefined;
          connected = false;
        }
      };
    });
  }

  return {
    get key() { return revision; },
    get connected() { return connected; },
    attach
  };
}
