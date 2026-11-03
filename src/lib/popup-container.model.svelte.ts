import { untrack } from 'svelte';
import { connectPopupPortal } from './popup-portal.dom';

interface PopupContainerOptions {
  open: boolean;
  rendered?: boolean;
  reference?: Element;
  getPopupContainer?: (trigger: HTMLElement) => HTMLElement | ShadowRoot;
  themeStyle?: string;
  preserveVariables?: readonly string[];
}

/** Callback identity не меняет portal, пока функция возвращает тот же DOM-контейнер. */
export function createPopupContainer(getOptions: () => PopupContainerOptions) {
  let visited = false;
  let rendered = true;
  let container = $state<HTMLElement | ShadowRoot>();
  let connection = $state.raw<ReturnType<typeof connectPopupPortal>>();

  $effect.pre(() => {
    const options = getOptions();
    visited ||= options.open;
    // Cleanup Svelte читает прежние runes; DOM-флаг меняется до удаления условной ветки.
    rendered = options.rendered !== false;
    // rc-trigger передаёт фактический DOM trigger, включая SVG, при HTMLElement в исходном типе.
    container = visited && options.reference && options.getPopupContainer
      ? options.getPopupContainer(options.reference as HTMLElement)
        ?? options.reference.ownerDocument.body
      : undefined;
  });

  $effect(() => {
    void getOptions().themeStyle;
    const current = connection;
    // Component-theme attachments должны закончить обновление собственных variables.
    if (current) queueMicrotask(() => current.syncTheme());
  });

  return (node: HTMLElement) => {
    const target = container;
    if (!target) return;

    return untrack(() => {
      const reference = getOptions().reference!;
      const origin = node.parentElement ?? reference as HTMLElement;
      const marker = node.ownerDocument.createComment('popup-container');
      node.before(marker);
      const current = connectPopupPortal(node, {
        getPopupContainer: () => target,
        reference: reference as HTMLElement,
        origin,
        marker,
        autoLock: false,
        get restoreOnDestroy() { return rendered; },
        get preserveVariables() {
          const style = node.ownerDocument.createElement('span').style;
          style.cssText = getOptions().themeStyle ?? '';
          // Координаты и CSS-derived arrow variables принадлежат самой поверхности.
          return [
            '--arrow-x',
            '--arrow-y',
            '--ant-tooltip-valid-offset-x',
            '--ant-tooltip-arrow-offset-x',
            '--ant-tooltip-arrow-background-color',
            ...(getOptions().preserveVariables ?? []),
            ...Array.from(style).filter(name => name.startsWith('--'))
          ];
        }
      });
      connection = current;
      return () => {
        current();
        marker.remove();
        if (connection === current) connection = undefined;
      };
    });
  };
}
