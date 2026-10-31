import { afterEach, describe, expect, it, vi } from 'vitest';
import { connectSplitterDrag, observeSplitterSize, type SplitterDragOptions } from './splitter.dom';

afterEach(() => vi.useRealTimers());

function setupDrag(initial: Partial<SplitterDragOptions> = {}) {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date('2026-01-01T00:00:00Z'));
  const view = new EventTarget();
  const node = Object.assign(new EventTarget(), { ownerDocument: { defaultView: view } });
  const state: SplitterDragOptions = {
    index: 0,
    vertical: false,
    reverse: false,
    resizable: true,
    lazy: false,
    container: 100,
    now: 50,
    min: 30,
    max: 70,
    ...initial
  };
  const events: unknown[][] = [];
  const runtime = connectSplitterDrag(node as unknown as HTMLDivElement, () => state, {
    start: index => events.push(['start', index]),
    update: (index, offset, lazy) => events.push(['update', index, offset, lazy]),
    end: lazy => events.push(['end', lazy]),
    doubleClick: index => events.push(['double', index]),
    preview: offset => events.push(['preview', offset])
  });

  function emit(
    target: EventTarget,
    type: string,
    x = 0,
    y = 0,
    touches = 1
  ) {
    const event = new Event(type, { cancelable: true });
    Object.defineProperties(event, {
      pageX: { value: x },
      pageY: { value: y },
      touches: { value: Array.from({ length: touches }, () => ({ pageX: x, pageY: y })) }
    });
    target.dispatchEvent(event);
  }

  return { view, node, state, events, runtime, emit };
}

describe('Splitter drag runtime', () => {
  it(
    'measures normal offsets from the original pointer and keeps the start axis until reconnect',
    () => {
      const state = setupDrag();
      state.emit(state.node, 'mousedown', 10, 20);
      state.emit(state.view, 'mousemove', 30, 70);
      state.state.vertical = true;
      state.emit(state.view, 'mousemove', 40, 100);
      state.emit(state.view, 'mouseup');

      expect(state.events).toEqual([
        ['start', 0], ['update', 0, 20, false], ['update', 0, 30, false], ['end', false]
      ]);
      state.runtime.destroy();
    }
  );

  it('uses one-touch gestures and ignores multitouch starts and moves', () => {
    const state = setupDrag({ vertical: true });
    state.emit(state.node, 'touchstart', 10, 20, 2);
    state.emit(state.node, 'touchstart', 10, 20);
    state.emit(state.view, 'touchmove', 200, 70, 2);
    state.emit(state.view, 'touchmove', 200, 70);
    state.emit(state.view, 'touchend');

    expect(state.events).toEqual([['start', 0], ['update', 0, 50, false], ['end', false]]);
    state.runtime.destroy();
  });

  it('updates only the bounded preview in lazy mode and commits once on release', () => {
    const state = setupDrag({ lazy: true });
    state.emit(state.node, 'mousedown');
    state.emit(state.view, 'mousemove', 1000);

    expect(state.events).toEqual([['start', 0], ['preview', 20]]);

    state.emit(state.view, 'mouseup');

    expect(state.events).toEqual([
      ['start', 0], ['preview', 20], ['update', 0, 20, true], ['preview', 0], ['end', true]
    ]);
    state.runtime.destroy();
  });

  it('keeps the source physical preview constraint before applying RTL on lazy release', () => {
    const state = setupDrag({ lazy: true, reverse: true, now: 40, min: 20, max: 50 });
    state.emit(state.node, 'touchstart');
    state.emit(state.view, 'touchmove', 1000);
    state.emit(state.view, 'touchend');

    expect(state.events).toEqual([
      ['start', 0], ['preview', 10], ['update', 0, -10, true], ['preview', 0], ['end', true]
    ]);
    state.runtime.destroy();
  });

  it('suppresses a second drag within 300ms without suppressing the double-click callback', () => {
    const state = setupDrag();
    state.emit(state.node, 'mousedown');
    state.emit(state.view, 'mouseup');
    vi.advanceTimersByTime(200);
    state.emit(state.node, 'mousedown');
    state.emit(state.view, 'mouseup');
    state.emit(state.node, 'dblclick');
    vi.advanceTimersByTime(150);
    state.emit(state.node, 'mousedown');
    state.emit(state.view, 'mouseup');

    expect(state.events).toEqual([
      ['start', 0], ['end', false], ['double', 0], ['start', 0], ['end', false]
    ]);
    state.runtime.destroy();
  });

  it('keeps double-click available while disabled but never starts a resize', () => {
    const state = setupDrag({ resizable: false, index: 1 });
    state.emit(state.node, 'mousedown');
    state.emit(state.view, 'mousemove', 30);
    state.emit(state.node, 'touchstart');
    state.emit(state.node, 'dblclick');

    expect(state.events).toEqual([['double', 1]]);
    state.runtime.destroy();
  });

  it('reconnects a live gesture when lazy changes without losing the original pointer', () => {
    const state = setupDrag();
    state.emit(state.node, 'mousedown', 10, 20);
    state.state.lazy = true;
    state.runtime.sync(0, true);
    state.emit(state.view, 'mousemove', 1000, 40);
    state.emit(state.view, 'mouseup');

    expect(state.events).toEqual([
      ['start', 0], ['preview', 20], ['update', 0, 20, true], ['preview', 0], ['end', true]
    ]);
    state.runtime.destroy();
  });

  it('removes start and window listeners after unmount without synthesizing a resize end', () => {
    const state = setupDrag();
    state.emit(state.node, 'mousedown');

    state.runtime.destroy();
    vi.advanceTimersByTime(1000);
    state.emit(state.view, 'mousemove', 40);
    state.emit(state.view, 'mouseup');
    state.emit(state.view, 'touchmove', 50);
    state.emit(state.view, 'touchend');
    state.emit(state.node, 'mousedown');
    state.emit(state.node, 'touchstart');
    state.emit(state.node, 'dblclick');

    expect(state.events).toEqual([['start', 0]]);
  });
});

describe('Splitter size observer', () => {
  function setup() {
    let callback: ResizeObserverCallback;
    const observed = new Set<Element>();
    const view = {
      ResizeObserver: class {
        constructor(value: ResizeObserverCallback) { callback = value; }
        observe(node: Element) { observed.add(node); }
        disconnect() { observed.clear(); }
      }
    };
    const root = {
      ownerDocument: { defaultView: view },
      width: 123.4,
      height: 80.5,
      offsetWidth: 123,
      offsetHeight: 81,
      getBoundingClientRect() { return { width: this.width, height: this.height }; }
    };
    let vertical = false;
    const events: number[] = [];
    const destroy = observeSplitterSize(
      root as unknown as HTMLDivElement,
      () => vertical,
      size => events.push(size)
    );

    return {
      root,
      events,
      observed,
      destroy,
      setVertical(value: boolean) { vertical = value; },
      resize() { callback([], {} as ResizeObserver); }
    };
  }

  it(
    'keeps fractional sizes when offsets round them and deduplicates unchanged rect floors',
    async () => {
      const state = setup();
      state.resize();
      await Promise.resolve();
      state.root.width = 123.8;
      state.resize();
      await Promise.resolve();

      expect(state.events).toEqual([123.4]);

      state.root.offsetWidth = 200;
      state.resize();
      await Promise.resolve();

      expect(state.events).toEqual([123.4, 200]);
      state.destroy();
    }
  );

  it(
    'chooses the current axis at microtask delivery and does not remeasure for axis alone',
    async () => {
      const state = setup();
      state.resize();
      state.setVertical(true);
      await Promise.resolve();

      expect(state.events).toEqual([80.5]);

      state.setVertical(false);
      state.resize();
      await Promise.resolve();

      expect(state.events).toEqual([80.5]);
      state.destroy();
    }
  );

  it('ignores queued and subsequent observer deliveries after unmount', async () => {
    const state = setup();
    state.resize();
    state.destroy();
    await Promise.resolve();
    state.resize();
    await Promise.resolve();

    expect(state.events).toEqual([]);
    expect(state.observed.size).toBe(0);
  });
});
