import { tick, untrack } from 'svelte';
import { virtualListScrollStep, virtualListSizes, virtualListWindow } from './virtual-list.engine';
import { measureVirtualListRow } from './virtual-list.dom';
import type { VirtualScrollAlign } from './virtual-list.engine';
import type { VirtualScrollConfig, VirtualScrollOffset } from './virtual-list.types';

/** Общий viewport: retained heights, source window и до десяти проходов scrollTo. */
export function createVirtualList<Row, Key>(options: {
  rows: () => readonly Row[];
  getKey: (row: Row) => Key;
  height: () => number | undefined;
  estimate: () => number;
  enabled: () => boolean;
  width: () => number | undefined;
}) {
  let heights = $state.raw(new Map<Key, number>());
  let top = $state(0);
  let left = $state(0);
  let innerHeight = $state(0);
  let holderHeight = $state(untrack(() => options.height() ?? 0));
  let holderWidth = $state(0);
  let flash = $state(0);
  let moving = $state(false);
  let connected = $state(false);
  let holder: HTMLDivElement | undefined;
  let inner: HTMLDivElement | undefined;
  let observer: ResizeObserver | undefined;
  let collection = 0;
  let request = 0;
  const nodes = new Map<Key, HTMLElement>();
  const range = $derived(virtualListWindow(
    options.rows(), options.getKey, heights, options.estimate(), options.height(), top,
    innerHeight, options.enabled(), options.width()
  ));
  const sizes = $derived(virtualListSizes(options.rows(), options.getKey, heights, options.estimate()));

  function sync(next: number) {
    if (!holder) return;
    const maximum = (range.scrollHeight ?? NaN) - (options.height() ?? NaN);
    const value = Math.max(0, Number.isNaN(maximum) ? next : Math.min(next, maximum));
    holder.scrollTop = value;
    if (top !== value) {
      top = value;
      flash++;
    }
  }

  function syncLeft(next: number) {
    const maximum = Math.max(0, (options.width() ?? holderWidth) - holderWidth);
    const value = Math.max(0, Math.min(next, maximum));
    if (left !== value) {
      left = value;
      flash++;
    }
  }

  function measure() {
    collection++;
    if (!connected) return;
    const previousHeight = range.scrollHeight;
    const changes: { key: Key; previous: number | undefined; height: number; }[] = [];
    for (const [key, element] of nodes) {
      const height = measureVirtualListRow(element);
      if (height !== undefined && heights.get(key) !== height) {
        changes.push({ key, previous: heights.get(key), height });
      }
    }
    if (changes.length) {
      const next = new Map(heights);
      for (const change of changes) next.set(change.key, change.height);
      heights = next;
      const change = changes[0];
      const first = options.rows()[range.start];
      if (changes.length === 1 && change.previous === undefined
        && previousHeight !== range.scrollHeight && first
        && options.getKey(first) === change.key) {
        sync(top + change.height - options.estimate());
      }
    }
    if (inner) innerHeight = inner.offsetHeight;
    if (holder) {
      const rect = holder.getBoundingClientRect();
      holderHeight = holder.offsetHeight === Math.round(rect.height)
        ? rect.height : holder.offsetHeight;
      holderWidth = holder.offsetWidth === Math.round(rect.width) ? rect.width : holder.offsetWidth;
      syncLeft(left);
    }
  }

  function collect() {
    const generation = ++collection;
    void Promise.resolve().then(() => {
      if (generation === collection) measure();
    });
  }

  function attach(element: HTMLElement, key: Key) {
    nodes.set(key, element);
    observer?.observe(element);
    collect();
    return () => {
      observer?.unobserve(element);
      if (nodes.get(key) === element) nodes.delete(key);
    };
  }

  function connect(viewport: HTMLDivElement, content: HTMLDivElement) {
    holder = viewport;
    inner = content;
    connected = true;
    const Observer = viewport.ownerDocument.defaultView?.ResizeObserver;
    observer = Observer ? new Observer(entries => {
      if (entries.some(entry => entry.target === viewport || entry.contentRect.height)) collect();
    }) : undefined;
    observer?.observe(viewport);
    observer?.observe(content);
    for (const node of nodes.values()) observer?.observe(node);
    measure();
    return () => {
      observer?.disconnect();
      observer = undefined;
      connected = false;
      holder = undefined;
      inner = undefined;
      collection++;
      request++;
    };
  }

  function getSize(startKey: Key, endKey = startKey) {
    return { top: sizes.get(startKey)?.top ?? 0, bottom: sizes.get(endKey)?.bottom };
  }

  async function alignTo(
    index: number,
    key: Key | undefined,
    align: VirtualScrollAlign | undefined,
    rawOffset: VirtualScrollOffset<Key>
  ) {
    const generation = ++request;
    let resolved = align;
    let lastTop: number | null | undefined;
    for (let times = 0; times < 10; times++) {
      if (generation !== request || !holder) return;
      measure();
      if (index < 0) index = options.rows().findIndex(row => options.getKey(row) === key);
      const value = typeof rawOffset === 'function'
        ? rawOffset({ getSize, align: resolved }) : rawOffset;
      const offset = Number.isFinite(value) ? value : 0;
      if (index < 0) {
        await tick();
        continue;
      }
      if (!holder.clientHeight) return;
      const step = virtualListScrollStep(
        options.rows(),
        options.getKey,
        heights,
        options.estimate(),
        index,
        resolved,
        offset,
        holder.scrollTop,
        holder.clientHeight
      );
      if (step.top !== undefined) sync(step.top);
      const target = step.top ?? null;
      if (!step.unknown && target === lastTop) return;
      resolved = step.align;
      lastTop = target;
      await tick();
    }
  }

  function scrollTo(config?: VirtualScrollConfig<Key> | null) {
    if (!holder) return;
    if (config == null) {
      flash++;
      return;
    }
    if (typeof config === 'number') {
      request++;
      sync(config);
      return;
    }
    if ('top' in config || 'left' in config) {
      if (config.left !== undefined) syncLeft(config.left);
      scrollTo(config.top);
    } else if ('index' in config) {
      void alignTo(config.index, undefined, config.align, config.offset ?? 0);
    } else if ('key' in config) {
      const index = options.rows().findIndex(row => options.getKey(row) === config.key);
      void alignTo(index, config.key, config.align, config.offset ?? 0);
    }
  }

  return {
    get range() { return range; },
    get top() { return top; },
    get left() { return left; },
    get holderHeight() { return holderHeight; },
    get holderWidth() { return holderWidth; },
    get flash() { return flash; },
    get moving() { return moving; },
    set moving(value: boolean) { moving = value; },
    attach,
    connect,
    measure,
    collect,
    sync,
    syncLeft,
    scrollTo,
    flashScrollbar() { flash++; },
    scrollBy(delta: number) { sync(top + delta); },
    scrollByX(delta: number) { syncLeft(left + delta); }
  };
}
