import { describe, expect, it } from 'vitest';
import { createBreakpoint } from './grid-breakpoint.model.svelte.js';

describe('Grid breakpoint lifecycle', () => {
  it('keeps SSR empty and removes listeners and stale publications after disconnect', () => {
    const listeners = new Set<() => void>();
    const callbacks: (() => void)[] = [];
    let match = false;
    const view = {
      matchMedia: () => ({
        get matches() {
          return match;
        },
        addEventListener: (_: string, callback: () => void) => {
          listeners.add(callback);
          callbacks.push(callback);
        },
        removeEventListener: (_: string, callback: () => void) => {
          listeners.delete(callback);
        }
      }) as unknown as MediaQueryList
    };
    const breakpoint = createBreakpoint();

    expect(breakpoint.screens).toEqual({});
    expect(breakpoint.connected).toBe(false);
    const disconnect = breakpoint.connect(view);

    expect(breakpoint.screens.md).toBe(false);
    match = true;
    callbacks[0]();

    expect(breakpoint.screens.xxxl).toBe(true);
    disconnect();
    match = false;
    callbacks[0]();

    expect(breakpoint.screens.md).toBe(true);
    expect(breakpoint.connected).toBe(false);
    expect(listeners.size).toBe(0);
  });
});

describe('Grid breakpoint custom queries', () => {
  it('replaces custom subscriptions and ignores callbacks from a previous connection', () => {
    const callbacks: (() => void)[] = [];
    const active = new Map<string, () => void>();
    const requested: string[] = [];
    let match = false;
    const view = {
      matchMedia: (query: string) => {
        requested.push(query);
        return {
          get matches() { return match; },
          addEventListener: (_: string, callback: () => void) => {
            callbacks.push(callback);
            active.set(query, callback);
          },
          removeEventListener: (_: string, callback: () => void) => {
            if (active.get(query) === callback) active.delete(query);
          }
        } as unknown as MediaQueryList;
      }
    };
    const queries = {
      xs: '(max-width: 299px)', sm: '(min-width: 320px)', md: '(min-width: 520px)',
      lg: '(min-width: 720px)', xl: '(min-width: 920px)', xxl: '(min-width: 1320px)',
      xxxl: '(min-width: 1520px)'
    };
    const breakpoint = createBreakpoint();
    breakpoint.connect(view, queries);

    expect(requested).toEqual(Object.values(queries));
    expect(active.size).toBe(7);
    match = true;
    const disconnect = breakpoint.connect(view, { ...queries, sm: '(min-width: 350px)' });
    callbacks[0]();

    expect(active.size).toBe(7);
    expect(breakpoint.screens.sm).toBe(true);
    expect(requested).toContain('(min-width: 350px)');
    disconnect();

    expect(active.size).toBe(0);
    expect(breakpoint.connected).toBe(false);
  });
});
