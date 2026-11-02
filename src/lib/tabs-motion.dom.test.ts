import { describe, expect, it } from 'vitest';
import { createTabsPaneMotion, type TabsPaneMotionState } from './tabs-motion.dom';
import type { TabsPaneMotion } from './tabs-motion.types';

function setup() {
  let nextId = 0;
  const frames = new Map<number, FrameRequestCallback>();
  const timers = new Map<number, { callback: () => void; delay: number; }>();
  const media = Object.assign(new EventTarget(), { matches: false });
  const node = Object.assign(new EventTarget(), {
    ownerDocument: {
      defaultView: {
        matchMedia: () => media,
        requestAnimationFrame(callback: FrameRequestCallback) {
          const id = ++nextId;
          frames.set(id, callback);
          return id;
        },
        cancelAnimationFrame: (id: number) => { frames.delete(id); },
        setTimeout(callback: () => void, delay: number) {
          const id = ++nextId;
          timers.set(id, { callback, delay });
          return id;
        },
        clearTimeout: (id: number) => { timers.delete(id); }
      }
    }
  }) as unknown as HTMLDivElement;
  const states: TabsPaneMotionState[] = [];
  const motion = createTabsPaneMotion(node, state => states.push(state));
  const flush = () => {
    const pending = [...frames.values()];
    frames.clear();
    for (const callback of pending) callback(0);
  };
  const flushTimers = (delay: number) => {
    const pending = Array.from(timers).filter(([, timer]) => timer.delay === delay);
    for (const [id, timer] of pending) {
      timers.delete(id);
      timer.callback();
    }
  };
  return { node, media, frames, timers, states, motion, flush, flushTimers };
}

const config: TabsPaneMotion = { motionName: 'switch', motionAppear: false };

async function flushCommit() {
  await Promise.resolve();
  await Promise.resolve();
}

describe('Native Tabs pane motion lifecycle', () => {
  it('skips initial appear and waits two frames plus its own end event before leaving', async () => {
    const state = setup();
    const visible: boolean[] = [];
    const options = { ...config, onVisibleChanged: (value: boolean) => visible.push(value) };
    state.motion.sync(true, options, true);
    await flushCommit();
    state.motion.sync(false, options, true);
    await flushCommit();

    expect(state.states.at(-1)?.className).toBe('switch-leave switch-leave-start switch');
    state.node.dispatchEvent(new Event('transitionend'));
    state.flush();

    expect(state.states.at(-1)?.running).toBe(true);
    state.flush();

    expect(state.states.at(-1)?.className).toBe('switch-leave switch-leave-active switch');
    const child = new Event('transitionend');
    Object.defineProperty(child, 'target', { value: new EventTarget() });
    state.node.dispatchEvent(child);

    expect(state.states.at(-1)?.running).toBe(true);
    state.node.dispatchEvent(new Event('transitionend'));
    state.flushTimers(0);

    expect(state.states.at(-1)).toEqual({ running: false, className: undefined, style: undefined });
    expect(visible).toEqual([true, false]);
    state.motion.destroy();
  });

  it('waits for prepare even without CSS motion and ignores a canceled prepare completion', async () => {
    const state = setup();
    let resolve: (() => void) | undefined;
    const options: TabsPaneMotion = {
      ...config,
      onLeavePrepare: () => new Promise<void>(done => { resolve = done; })
    };
    state.motion.sync(true, options, false);
    state.motion.sync(false, options, false);
    await flushCommit();
    state.flush();
    state.flush();

    expect(state.states.at(-1)?.running).toBe(true);
    state.motion.sync(true, options, false);
    const count = state.states.length;
    resolve!();
    await Promise.resolve();

    expect(state.states).toHaveLength(count);
    expect(state.states.at(-1)?.running).toBe(false);
    state.motion.destroy();
  });

  it('applies phase styles and honors end=false until the deadline callback can finish', async () => {
    const state = setup();
    const ended: boolean[] = [];
    const options: TabsPaneMotion = {
      ...config,
      motionDeadline: 75,
      onLeaveStart: (_node, event) => event === null ? 'opacity:0.9' : undefined,
      onLeaveActive: () => 'opacity:0.1',
      onLeaveEnd: (_node, event) => {
        const deadline = 'deadline' in event && event.deadline;
        ended.push(deadline);
        return deadline;
      }
    };
    state.motion.sync(true, options, true);
    state.flushTimers(0);
    state.motion.sync(false, options, true);
    await flushCommit();

    expect(state.states.at(-1)?.style).toBe('opacity:0.9');
    state.flush();
    state.flush();
    state.node.dispatchEvent(new Event('transitionend'));

    expect(state.states.at(-1)?.style).toBe('opacity:0.1');
    expect(state.states.at(-1)?.running).toBe(true);
    expect([...state.timers.values()][0].delay).toBe(75);
    [...state.timers.values()][0].callback();

    expect(state.states.at(-1)?.running).toBe(false);
    expect(ended).toEqual([false, true]);
    state.motion.destroy();
  });

  it('cancels stale frames, deadlines and events on reversal and unmount', async () => {
    const state = setup();
    const visible: boolean[] = [];
    const options = {
      ...config,
      motionDeadline: 60,
      onVisibleChanged: (value: boolean) => visible.push(value)
    };
    state.motion.sync(true, options, true);
    await flushCommit();
    state.motion.sync(false, options, true);
    await flushCommit();
    const oldFrame = [...state.frames.values()][0];
    state.motion.sync(true, options, true);
    oldFrame(0);
    await flushCommit();
    state.flush();
    state.flush();
    const oldDeadline = [...state.timers.values()][0].callback;
    const count = state.states.length;
    state.motion.destroy();
    oldDeadline();
    state.node.dispatchEvent(new Event('animationend'));
    state.flush();

    expect(state.states).toHaveLength(count);
    expect(state.frames.size).toBe(0);
    expect(state.timers.size).toBe(0);
    expect(visible).toEqual([true]);
  });

  it('settles immediately for reduced motion or disabled motion while keeping prepare support', async () => {
    const state = setup();
    state.motion.sync(true, config, true);
    state.motion.sync(false, config, true);
    await flushCommit();
    state.flush();
    state.flush();
    state.media.matches = true;
    state.media.dispatchEvent(new Event('change'));

    expect(state.states.at(-1)?.running).toBe(false);
    expect(state.frames.size).toBe(0);
    state.motion.sync(true, config, true);

    expect(state.states.at(-1)?.running).toBe(false);
    state.media.matches = false;
    state.motion.sync(false, config, false);

    expect(state.states.at(-1)?.running).toBe(false);
    state.motion.destroy();
  });

  it('does not invoke queued start hooks after unmount before the first frame', async () => {
    const state = setup();
    const calls: string[] = [];
    state.motion.sync(
      true,
      {
        motionName: 'switch',
        onAppearStart: () => { calls.push('start'); },
        onVisibleChanged: () => { calls.push('visible'); }
      },
      true
    );
    const count = state.states.length;
    state.motion.destroy();
    await flushCommit();
    state.flush();
    state.flushTimers(0);

    expect(state.states).toHaveLength(count);
    expect(calls).toEqual([]);
    expect(state.frames.size).toBe(0);
  });

  it('does not continue start hooks when the prepare commit unmounts the pane', async () => {
    const state = setup();
    state.motion.destroy();
    const calls: string[] = [];
    const motion = createTabsPaneMotion(state.node, (_next, commit) => {
      if (commit) motion.destroy();
    });
    motion.sync(
      true,
      {
        motionName: 'switch',
        onAppearStart: () => { calls.push('start'); }
      },
      true
    );
    await flushCommit();
    state.flush();

    expect(calls).toEqual([]);
    expect(state.frames.size).toBe(0);
  });
});
