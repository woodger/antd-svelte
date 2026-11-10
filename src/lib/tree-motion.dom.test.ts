import { describe, expect, it } from 'vitest';
import { createTreeGroupMotion, type TreeGroupMotionState } from './tree-motion.dom';
import type { TreeMotionConfig } from './tree-motion.types';

function setup(previous?: boolean) {
  let serial = 0;
  const frames = new Map<number, FrameRequestCallback>();
  const timers = new Map<number, { callback: () => void; delay: number; }>();
  const media = Object.assign(new EventTarget(), { matches: false });
  const node = Object.assign(new EventTarget(), {
    ownerDocument: { defaultView: {
      matchMedia: () => media,
      requestAnimationFrame(callback: FrameRequestCallback) {
        const id = ++serial;
        frames.set(id, callback);
        return id;
      },
      cancelAnimationFrame: (id: number) => { frames.delete(id); },
      setTimeout(callback: () => void, delay: number) {
        const id = ++serial;
        timers.set(id, { callback, delay });
        return id;
      },
      clearTimeout: (id: number) => { timers.delete(id); }
    } }
  }) as unknown as HTMLDivElement;
  const states: TreeGroupMotionState[] = [];
  const visible: boolean[] = [];
  const motion = createTreeGroupMotion(node, state => states.push(state), next => visible.push(next), previous);
  const frame = () => {
    const pending = [...frames.values()];
    frames.clear();
    for (const callback of pending) callback(0);
  };
  const timer = (delay: number) => {
    for (const [id, entry] of timers) if (entry.delay === delay) {
      timers.delete(id);
      entry.callback();
    }
  };
  return { node, media, frames, timers, states, visible, motion, frame, timer };
}
const config: TreeMotionConfig = { motionName: 'collapse', motionDeadline: 500 };
const commit = async () => { await Promise.resolve(); await Promise.resolve(); };

describe('Tree group motion lifecycle', () => {
  it('keeps the entering group until two RAFs and its own end event complete', async () => {
    const state = setup();
    state.motion.sync(true, config, true);
    await commit();

    expect(state.states.at(-1)?.className).toBe('collapse-appear collapse-appear-start collapse');
    state.node.dispatchEvent(new Event('transitionend'));
    state.frame();
    expect(state.visible).toEqual([]);
    state.frame();
    const child = new Event('transitionend');
    Object.defineProperty(child, 'target', { value: new EventTarget() });
    state.node.dispatchEvent(child);
    expect(state.states.at(-1)?.running).toBe(true);
    state.node.dispatchEvent(new Event('transitionend'));
    state.timer(0);

    expect(state.visible).toEqual([true]);
    expect(state.states.at(-1)?.running).toBe(false);
    expect(state.frames.size + state.timers.size).toBe(0);
    state.motion.destroy();
  });

  it('starts leave from a mounted visible group and preserves end=false until a permitted event', async () => {
    const state = setup(true);
    const ended: string[] = [];
    state.motion.sync(false, { ...config,
      onLeaveStart: () => 'height:84px', onLeaveActive: () => 'height:0px',
      onLeaveEnd: (_node, event) => {
        ended.push('deadline' in event ? 'deadline' : event.type);
        return 'deadline' in event;
      }
    }, true);
    await commit();
    expect(state.states.at(-1)?.style).toBe('height:84px');
    state.frame(); state.frame();
    state.node.dispatchEvent(new Event('transitionend'));

    expect(state.states.at(-1)?.style).toBe('height:0px');
    expect(state.visible).toEqual([]);
    state.timer(500); state.timer(0);

    expect(ended).toEqual(['transitionend', 'deadline']);
    expect(state.visible).toEqual([false]);
    expect(state.timers.size).toBe(0);
    state.motion.destroy();
  });

  it('awaits prepare with disabled motion and omits start/active hooks after it resolves', async () => {
    const state = setup();
    let resolve: (() => void) | undefined;
    const hooks: string[] = [];
    state.motion.sync(true, { ...config,
      onAppearPrepare: () => new Promise<void>(done => { hooks.push('prepare'); resolve = done; }),
      onAppearStart: () => { hooks.push('start'); },
      onAppearActive: () => { hooks.push('active'); }
    }, false);
    await commit(); state.frame(); state.frame();

    expect(state.visible).toEqual([]);
    resolve!(); await commit();

    expect(hooks).toEqual(['prepare']);
    expect(state.visible).toEqual([true]);
    expect(state.states.at(-1)?.running).toBe(false);
    state.motion.destroy();
  });

  it('ignores stale prepare completions after a replacement or destroy', async () => {
    for (const cancel of ['replace', 'destroy']) {
      const state = setup();
      let resolve: (() => void) | undefined;
      state.motion.sync(true, { ...config,
        onAppearPrepare: () => new Promise<void>(done => { resolve = done; })
      }, true);
      await commit(); state.frame(); state.frame();
      if (cancel === 'replace') state.motion.sync(false, { motionLeave: false }, false);
      else state.motion.destroy();
      const count = state.states.length;
      resolve!(); await commit(); state.frame(); state.frame(); state.timer(500);

      expect(state.states).toHaveLength(count);
      expect(state.frames.size + state.timers.size).toBe(0);
      state.motion.destroy();
    }
  });

  it('settles reduced motion and cancels all scheduled work on unmount', async () => {
    const state = setup();
    state.motion.sync(true, config, true);
    await commit(); state.frame(); state.frame();
    state.media.matches = true;
    state.media.dispatchEvent(new Event('change'));
    await commit();

    expect(state.visible).toEqual([true]);
    expect(state.frames.size + state.timers.size).toBe(0);
    state.motion.destroy();
    const count = state.states.length;
    state.node.dispatchEvent(new Event('transitionend'));
    state.media.dispatchEvent(new Event('change'));
    state.timer(0);
    expect(state.states).toHaveLength(count);
  });
});
