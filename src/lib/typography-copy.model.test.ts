import { afterEach, describe, expect, it, vi } from 'vitest';
import { createTypographyCopy } from './typography-copy.model.svelte';

afterEach(() => vi.useRealTimers());

describe('Typography copy lifecycle', () => {
  it('shows async loading, publishes copied state and clears it after three seconds', async () => {
    vi.useFakeTimers();
    let complete!: (text: string) => void;
    let saved = '';
    const actions: string[] = [];
    const copy = createTypographyCopy({
      children: () => 'fallback',
      config: () => ({ text: () => new Promise(resolve => { complete = resolve; }),
        onCopy: () => { actions.push('copied'); } }),
      write: async text => {
        saved = text;
        return true;
      }
    });

    const pending = copy.copy();
    expect(copy.loading).toBe(true);
    complete('remote');
    await pending;

    expect(saved).toBe('remote');
    expect(copy.loading).toBe(false);
    expect(copy.copied).toBe(true);
    expect(actions).toEqual(['copied']);
    await vi.advanceTimersByTimeAsync(2999);
    expect(copy.copied).toBe(true);
    await vi.advanceTimersByTimeAsync(1);
    expect(copy.copied).toBe(false);
    copy.destroy();
  });

  it('uses source fallback for an empty explicit string and preserves the original event', async () => {
    const event = { preventDefault: vi.fn(), stopPropagation: vi.fn() } as unknown as MouseEvent;
    const onCopy = vi.fn();
    let saved = '';
    const copy = createTypographyCopy({
      config: () => ({ text: '', format: 'text/html', onCopy }),
      children: () => ['A', 0],
      write: async (text, format) => {
        saved = `${format}:${text}`;
        return true;
      }
    });

    await copy.copy(event);

    expect(saved).toBe('text/html:A0');
    expect(onCopy).toHaveBeenCalledWith(event);
    expect(event.preventDefault).toHaveBeenCalledOnce();
    expect(event.stopPropagation).toHaveBeenCalledOnce();
    copy.destroy();
  });

  it('marks copied even when both clipboard mechanisms return false', async () => {
    const complete = vi.fn();
    const copy = createTypographyCopy({
      config: () => ({ onCopy: complete }), children: () => 'text', write: async () => false
    });

    await copy.copy();

    expect(copy.copied).toBe(true);
    expect(complete).toHaveBeenCalledOnce();
    copy.destroy();
  });

  it('propagates provider rejection and restores loading without creating a success timer', async () => {
    vi.useFakeTimers();
    const error = new Error('provider failed');
    const copy = createTypographyCopy({
      config: () => ({ text: async () => { throw error; } }),
      children: () => 'text', write: async () => true
    });

    await expect(copy.copy()).rejects.toBe(error);

    expect(copy.loading).toBe(false);
    expect(copy.copied).toBe(false);
    expect(vi.getTimerCount()).toBe(0);
    copy.destroy();
  });

  it('finishes an already requested copy after destruction without scheduling a timer', async () => {
    vi.useFakeTimers();
    let complete!: (value: string) => void;
    const copied: string[] = [];
    const copy = createTypographyCopy({
      config: () => ({ text: () => new Promise(resolve => { complete = resolve; }),
        onCopy: () => { copied.push('callback'); } }),
      children: () => 'text',
      write: async text => {
        copied.push(text);
        return true;
      }
    });

    const pending = copy.copy();
    copy.destroy();
    complete('remote');
    await pending;
    await vi.advanceTimersByTimeAsync(4000);

    expect(copied).toEqual(['remote', 'callback']);
    expect(vi.getTimerCount()).toBe(0);
  });
});
