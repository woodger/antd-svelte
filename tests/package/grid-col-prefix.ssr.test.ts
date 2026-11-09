import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';
import { Col, type ColProps } from 'antd-svelte';
import registry from 'antd-svelte/porting/registry.json';
import reference from '../browser/fixtures/ant-design-grid-col-prefix-reference.json';
import GridColPrefixSSRFixtures from '../browser/fixtures/GridColPrefixSSRFixtures.svelte';

describe('Grid Col local/shared prefixes in the public package', () => {
  it('pins Source layout across every breakpoint and retains native input identity', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version,
      revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256
    });
    expect(reference.cases).toHaveLength(21);
    expect(reference.cases.every(entry => entry.widths.length === 7)).toBe(true);
    const media = reference.cases.find(entry => entry.sample.id === 'custom-media')!
      .widths.find(entry => entry.width === 620)!;

    expect(media.result.normal.columns[0].style.flex).toBe('0 0 75%');
    expect(media.expectedNative.normal.columns[0].style.flex).toBe('0 0 100%');
    expect(reference.transitions.every(step => step.sameInput && step.sameCol && step.focused))
      .toBe(true);
  });

  it('renders local classes, global flex variables and stable Form column metadata', () => {
    const props = { prefixCls: 'column', span: 24, xs: { span: 12, flex: 2 } } satisfies ColProps;
    const rendered = render(Col, { props });

    expect(rendered.body).toContain('column-xs-flex');
    expect(rendered.body).toContain('--ant-col-xs-flex:2 2 auto');
    expect(rendered.body).toContain('data-ant-col-span="24"');
    expect(rendered.body).toContain('data-ant-col-xs-span="12"');
    expect(rendered.body).not.toContain('prefixCls=');
    expect(rendered.head).toContain('grid-col-prefix:ant-grid-col-');
  });

  it('isolates shared local classes and keeps native Form display bridges on SSR', () => {
    vi.useFakeTimers();
    try {
      const rendered = render(GridColPrefixSSRFixtures);

      expect(rendered.body).toContain('suite-col-xs-24');
      expect(rendered.body).toContain('column-md-flex');
      expect(rendered.body).toContain('--inner-col-md-flex:2 2 auto');
      expect(rendered.body).toContain('--inner-grid-display:var(--ant-grid-display,flex)');
      expect(rendered.head).toContain('--inner-grid-display');
      expect(vi.getTimerCount()).toBe(0);
    } finally {
      vi.useRealTimers();
    }
  });
});
