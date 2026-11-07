import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';
import registry from 'antd-svelte/porting/registry.json';
import reference from '../browser/fixtures/ant-design-grid-breakpoints-reference.json';
import GridBreakpointsCase from '../browser/fixtures/GridBreakpointsCase.svelte';

describe('Grid global breakpoint public package SSR', () => {
  it('pins the official source revision and archive', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version,
      revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256
    });
  });

  it('rejects invalid global breakpoint ordering during SSR', () => {
    const sample = { ...reference.cases[0], config: { token: { screenSMMin: 700 } } };

    expect(() => render(GridBreakpointsCase, { props: { sample } }).body)
      .toThrow('screenSMMin<=screenSM fails : !(700<=576)');
  });

  for (const sample of reference.cases) {
    it(`renders ${sample.name}:${sample.direction}:${sample.scope} media before JavaScript`, () => {
      vi.useFakeTimers();
      try {
        const { head, body } = render(GridBreakpointsCase, { props: { sample } });
        const custom = sample.name !== 'default' && sample.scope !== 'reset';
        const stylesheet = sample.name !== 'default';

        expect(body.includes('ant-grid-custom-media')).toBe(custom);
        expect(head.includes('data-ant-svelte-theme="ant-grid-media-')).toBe(stylesheet);
        expect(body).toContain('row-gap:42px');
        expect(body).toContain('Column A');
        expect(body).not.toContain('[object Object]');
        if (stylesheet) {
          expect(head).toContain('@media (min-width:');
          expect(head).not.toContain('__ANT_GRID_MEDIA_SCOPE__');
        }
        expect(vi.getTimerCount()).toBe(0);
      } finally {
        vi.useRealTimers();
      }
    });
  }
});
