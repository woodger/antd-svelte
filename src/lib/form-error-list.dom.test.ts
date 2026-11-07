import { afterEach, describe, expect, it, vi } from 'vitest';
import { formErrorMotion } from './form-error-list.dom';

function fixture(duration = '100ms', reduced = false) {
  const animations: { complete(): void; cancel: ReturnType<typeof vi.fn> }[] = [];
  const listeners = new Set<() => void>();
  const media = {
    matches: reduced,
    addEventListener: (_: string, listener: () => void) => { listeners.add(listener); },
    removeEventListener: (_: string, listener: () => void) => { listeners.delete(listener); }
  };
  const animate = vi.fn(() => {
    let complete!: () => void;
    const finished = new Promise<void>((resolve) => { complete = resolve; });
    const cancel = vi.fn();
    animations.push({ complete, cancel });

    return { finished, cancel, finish: complete };
  });
  const node = {
    scrollHeight: 40,
    getBoundingClientRect: () => ({ height: 40 }),
    animate,
    ownerDocument: {
      defaultView: {
        getComputedStyle: () => ({
          opacity: '1', transform: 'none',
          getPropertyValue: (name: string) => name === '--ant-motion-duration-fast'
            ? duration : 'ease-in-out'
        }),
        matchMedia: () => media,
        setTimeout: globalThis.setTimeout,
        clearTimeout: globalThis.clearTimeout
      }
    }
  } as unknown as HTMLElement;

  return { node, animations, animate, media, listeners };
}

afterEach(() => { vi.useRealTimers(); });

describe('formErrorMotion', () => {
  it('uses the theme timing and reports completed visibility only once', async () => {
    vi.useFakeTimers();
    const { node, animations, animate } = fixture('0.2s');
    const onFinish = vi.fn();
    const motion = formErrorMotion(node, { visible: true, kind: 'message', onFinish });

    expect(animate).toHaveBeenCalledWith([
      { height: '0px', opacity: 0, transform: 'translateY(-5px)', overflow: 'hidden' },
      { height: '40px', opacity: 1, transform: 'translateY(0px)', overflow: 'hidden' }
    ], { duration: 200, easing: 'ease-in-out', fill: 'both' });
    animations[0].complete();
    await Promise.resolve();
    await vi.advanceTimersByTimeAsync(500);

    expect(onFinish.mock.calls).toEqual([[true]]);
    expect(vi.getTimerCount()).toBe(0);
    motion.destroy();
  });

  it('cancels stale completion when visibility reverses during an animation', async () => {
    vi.useFakeTimers();
    const { node, animations } = fixture();
    const onFinish = vi.fn();
    const motion = formErrorMotion(node, { visible: true, kind: 'holder', onFinish });

    motion.update({ visible: false, kind: 'holder', onFinish });
    animations[0].complete();
    await Promise.resolve();

    expect(onFinish).not.toHaveBeenCalled();
    expect(animations[0].cancel).toHaveBeenCalled();
    animations[1].complete();
    await Promise.resolve();

    expect(onFinish.mock.calls).toEqual([[false]]);
    motion.destroy();
  });

  it('finishes at the source deadline when the browser does not finish the animation', async () => {
    vi.useFakeTimers();
    const { node } = fixture('2s');
    const onFinish = vi.fn();
    const motion = formErrorMotion(node, { visible: false, kind: 'holder', onFinish });

    await vi.advanceTimersByTimeAsync(500);

    expect(onFinish.mock.calls).toEqual([[false]]);
    expect(vi.getTimerCount()).toBe(0);
    motion.destroy();
  });

  it.each([['0s', false], ['100ms', true]] as const)(
    'skips animation with duration %s and reduced motion %s',
    async (duration, reduced) => {
      const { node, animate } = fixture(duration, reduced);
      const onFinish = vi.fn();
      const motion = formErrorMotion(node, { visible: true, kind: 'holder', onFinish });

      await Promise.resolve();

      expect(animate).not.toHaveBeenCalled();
      expect(onFinish.mock.calls).toEqual([[true]]);
      motion.destroy();
    }
  );

  it('cleans up timers, media listeners and callbacks when destroyed before completion', async () => {
    vi.useFakeTimers();
    const { node, animations, listeners } = fixture();
    const onFinish = vi.fn();
    const motion = formErrorMotion(node, { visible: true, kind: 'holder', onFinish });

    motion.destroy();
    animations[0].complete();
    await vi.advanceTimersByTimeAsync(1000);

    expect(onFinish).not.toHaveBeenCalled();
    expect(listeners.size).toBe(0);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('finishes an active animation when reduced motion is enabled', async () => {
    vi.useFakeTimers();
    const { node, media, listeners } = fixture();
    const onFinish = vi.fn();
    const motion = formErrorMotion(node, { visible: true, kind: 'holder', onFinish });

    media.matches = true;
    for (const listener of listeners) listener();
    await Promise.resolve();

    expect(onFinish.mock.calls).toEqual([[true]]);
    expect(vi.getTimerCount()).toBe(0);
    motion.destroy();
  });
});
