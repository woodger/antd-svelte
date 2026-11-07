import { compute } from './vendor/compute-scroll-into-view';
import type { FormScrollOptions } from './form.types';

function isElement(value: unknown): value is Element {
  if (!value || typeof value !== 'object' || !('ownerDocument' in value)) return false;

  const node = value as Element;
  const view = node.ownerDocument?.defaultView;

  return Boolean(view && typeof view.Element === 'function' && node instanceof view.Element);
}

export function getFormFieldElement(instance: unknown): Element | undefined {
  if (instance && typeof instance === 'object' && 'nativeElement' in instance
    && isElement(instance.nativeElement)) {
    return instance.nativeElement;
  }

  return isElement(instance) ? instance : undefined;
}

export function focusFormField(instance: unknown, fallback?: () => Element | undefined) {
  const target = instance ?? fallback?.();
  if (target && (typeof target === 'object' || typeof target === 'function')
    && 'focus' in target && typeof target.focus === 'function') {
    target.focus();
  } else {
    const node = getFormFieldElement(instance) ?? fallback?.();
    if (node && 'focus' in node && typeof node.focus === 'function') node.focus();
  }
}

// Стандартный behavior и callback scroll-into-view-if-needed 3.1.0.
// Source дважды учитывает scroll-margin и смещает даже видимый control; до отдельного
// исправления margins не применяются. Raw замеры сохранены в form-dom observation.
export function scrollFormField(node: Element, options: FormScrollOptions = {}) {
  if (!node.isConnected) return;

  const { focus: _focus, behavior, ...settings } = options;
  const actions = compute(node, { scrollMode: 'if-needed', block: 'nearest', ...settings });
  if (typeof behavior === 'function') {
    behavior(actions);
    return;
  }

  for (const action of actions) {
    action.el.scroll({
      top: action.top,
      left: action.left,
      behavior
    });
  }
}
