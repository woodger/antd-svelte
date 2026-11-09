import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';
import registry from 'antd-svelte/porting/registry.json';
import reference from '../browser/fixtures/ant-design-descriptions-breakpoints-reference.json';
import DescriptionsBreakpointsCase from '../browser/fixtures/DescriptionsBreakpointsCase.svelte';

describe('Descriptions theme breakpoints', () => {
  it('pins raw viewport layouts and separates the stale Source observer from fresh mounts', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version,
      revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256
    });
    expect(reference.cases.reduce((count, entry) => count + entry.result.length, 0)).toBe(52);
    expect(reference.live.updated.layout).toEqual(reference.live.initial);
    expect(reference.live.updated.layout).not.toEqual(reference.live.fresh[0].layout);
    expect(reference.live.updated.sameInput).toBe(true);
  });

  it('keeps SSR at the default column fallback without browser subscriptions or timers', () => {
    vi.useFakeTimers();
    try {
      const result = render(DescriptionsBreakpointsCase, { props: {
        sample: reference.cases.find(entry => entry.sample.id === 'shifted')!.sample
      } });
      const body = result.body;

      expect(body.match(/class="ant-descriptions-row"/g)).toHaveLength(3);
      expect(body).toContain('name="draft"');
      expect(body).toContain('colspan="3"');
      expect(body).not.toContain('[object Object]');
      expect(vi.getTimerCount()).toBe(0);
    } finally {
      vi.useRealTimers();
    }
  });

  it('rejects invalid global breakpoint order before browser mount', () => {
    expect(() => render(DescriptionsBreakpointsCase, { props: { sample: {
      id: 'invalid', token: { screenSM: 400 }
    } } }).body).toThrow('screenSMMin<=screenSM fails : !(576<=400)');
  });

  it('resets inherited invalid thresholds in the inner provider', () => {
    const result = render(DescriptionsBreakpointsCase, { props: {
      sample: { id: 'reset', token: { screenSM: 400 } }, scope: 'reset'
    } });

    expect(result.body).toContain('fixture-descriptions-breakpoints');
  });
});
