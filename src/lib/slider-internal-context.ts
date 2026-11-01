import { getContext, setContext } from 'svelte';

export interface SliderDragInfo {
  rawValues: readonly number[];
  draggingIndex: number;
  draggingValue: number;
  deleteIndex?: number;
}

/** Private ColorPicker adapter: исходные drag identities до сортировки public values. */
export interface SliderInternalContext {
  readonly controlled?: boolean;
  readonly direction?: 'ltr' | 'rtl';
  handleClass?: (index: number, value: number) => string;
  handleStyle?: (index: number, value: number) => string;
  onFocus?: (index: number) => void;
  onKeyDelete?: (index: number) => void;
  onDragStart?: (info: SliderDragInfo) => void;
  onDragChange?: (info: SliderDragInfo) => void;
}
const key = Symbol('ant-slider-internal');

export function provideSliderInternal(context: SliderInternalContext) {
  setContext(key, context);
}

export function useSliderInternal(): SliderInternalContext | undefined {
  return getContext(key);
}
