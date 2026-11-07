import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
import type { BackTopTarget } from './float-button.types';

/** @deprecated Используйте FloatButtonBackTop для новых интерфейсов. */
export interface BackTopProps extends Omit<
  HTMLAttributes<HTMLDivElement>, 'children' | 'class' | 'style' | 'onclick'
> {
  /** Собственный элемент управления; без него используется нативная кнопка. */
  children?: Snippet;
  /** @defaultValue 400 */
  visibilityHeight?: number;
  /** Вызывается только в браузере; без target используется ownerDocument корня. */
  target?: () => BackTopTarget | null;
  /** Длительность скролла в мс; reduced motion отключает анимацию. @defaultValue 450 */
  duration?: number;
  prefixCls?: string;
  class?: string;
  rootClassName?: string;
  style?: string;
  onclick?: (event: MouseEvent) => void;
  onClick?: (event: MouseEvent) => void;
  nativeElement?: HTMLDivElement;
}
