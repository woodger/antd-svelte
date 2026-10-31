import { untrack } from 'svelte';
import {
  collapseSplitterPanels,
  getSplitterResizable,
  getSplitterSizes,
  normalizeSplitterPanels,
  resizeSplitterPanels,
  type SplitterMovingIndex
} from './splitter.engine';
import type { SplitterProps, SplitterSize } from './splitter.types';

type Options = Pick<
  SplitterProps,
  'items' | 'onResizeStart' | 'onResize' | 'onResizeEnd' | 'onCollapse'
>;

export function createSplitterModel(getOptions: () => Options, getReverse: () => boolean) {
  let innerSizes = $state.raw<(SplitterSize | undefined)[]>(
    untrack(() => (getOptions().items ?? []).map(item => item.defaultSize))
  );
  let containerSize = $state<number>();
  let moving = $state.raw<SplitterMovingIndex | null>(null);
  let cache: number[] = [];
  let collapsedCache: number[] = [];
  let items = $derived(normalizeSplitterPanels(getOptions().items ?? []));
  let sizes = $derived(getSplitterSizes(items, innerSizes, containerSize));
  let resizable = $derived(getSplitterResizable(items, sizes.pixels, getReverse()));

  return {
    get items() { return items; },
    get sizes() { return sizes; },
    get resizable() { return resizable; },
    get containerSize() { return containerSize ?? 0; },
    get movingIndex() { return moving?.index; },
    measure(size: number) {
      if (size !== 0)
        containerSize = size;
    },
    start(index: number) {
      const callbacks = getOptions();
      cache = sizes.percentages.map(size => size * (containerSize || 0));
      moving = { index, confirmed: false };
      callbacks.onResizeStart?.(sizes.pixels);
    },
    update(index: number, offset: number, lazyEnd = false) {
      const callbacks = getOptions();
      const next = resizeSplitterPanels(
        items,
        resizable,
        cache,
        moving,
        index,
        offset,
        containerSize || 0
      );
      moving = next.moving;
      innerSizes = next.sizes;

      if (lazyEnd)
        callbacks.onResizeEnd?.(next.sizes);
      else
        callbacks.onResize?.(next.sizes);
    },
    end(lazyEnd = false) {
      const callbacks = getOptions();
      moving = null;

      if (!lazyEnd)
        callbacks.onResizeEnd?.(sizes.pixels);
    },
    collapse(index: number, side: 'start' | 'end') {
      const callbacks = getOptions();
      const next = collapseSplitterPanels(
        items,
        sizes.percentages.map(size => size * (containerSize || 0)),
        collapsedCache,
        index,
        side,
        getReverse(),
        containerSize || 0
      );
      collapsedCache = next.cache;
      innerSizes = next.sizes;
      callbacks.onResize?.(next.sizes);
      callbacks.onResizeEnd?.(next.sizes);
      callbacks.onCollapse?.(next.sizes.map(size => Math.abs(size) < Number.EPSILON), next.sizes);
    }
  };
}
