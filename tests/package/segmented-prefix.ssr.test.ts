import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';
import registry from 'antd-svelte/porting/registry.json';
import reference from '../browser/fixtures/ant-design-segmented-prefix-reference.json';
import SegmentedPrefixCase from '../browser/fixtures/SegmentedPrefixCase.svelte';

describe('Segmented local prefix public package SSR', () => {
  it('pins the source version, revision and archive', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version,
      revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256
    });
  });

  for (const sample of reference.cases) {
    it(`renders ${sample.name} without DOM, refs, change events or animation timers`, () => {
      vi.useFakeTimers();
      try {
        const { body, head } = render(SegmentedPrefixCase, { props: { preset: sample.name } });
        const prefix = 'prefix' in sample && sample.prefix || 'ant-segmented';

        expect(body).toContain(`${prefix}-item-input`);
        expect(body).toContain(`${prefix}-item-icon`);
        expect(body).toContain('Segmented prefix ref">empty</output>');
        expect(body).toContain('Segmented prefix events">[]</output>');
        expect(body).not.toMatch(/<div[^>]*\sprefixCls=/);
        expect(body).not.toContain('data-ant-segmented-thumb');
        if (prefix === 'ant-segmented') {
          expect(head).not.toContain('data-ant-svelte-theme="segmented-prefix:');
        } else {
          expect(head).toContain(`data-ant-svelte-theme="segmented-prefix:${prefix}"`);
          expect(head).toContain(`.${prefix}:where([data-ant-segmented-prefix])`);
        }
        expect(vi.getTimerCount()).toBe(0);
      } finally {
        vi.useRealTimers();
      }
    });
  }

  it('keeps CSS variable names independent from component and token prefixes', () => {
    const { body, head } = render(SegmentedPrefixCase, { props: { preset: 'css-var-prefix' } });

    expect(body).toContain('--ant-segmented-track-padding:var(--token-segmented-track-padding)');
    expect(head).toContain('--ant-segmented-track-padding');
    expect(head).not.toContain('--owner-segmented-track-padding');
  });
});
