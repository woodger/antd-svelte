import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';
import registry from 'antd-svelte/porting/registry.json';
import reference from '../browser/fixtures/ant-design-listy-prefix-reference.json';
import ListyPrefixSSRFixtures from '../browser/fixtures/ListyPrefixSSRFixtures.svelte';

describe('Listy local/shared prefixes in the public package', () => {
  it('pins raw and virtual source styles and live prefix identity', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version,
      revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256
    });
    expect(reference.cases).toHaveLength(17);
    expect(reference.transitions.every(step => step.sameList && step.sameRecord && step.focused))
      .toBe(true);
  });

  it('renders raw/virtual prefixes and canonical tokens without leaking props', () => {
    const rendered = render(ListyPrefixSSRFixtures);

    expect(rendered.body).toContain('suite-listy-item');
    expect(rendered.body).toContain('records-holder');
    expect(rendered.body).toContain('records-group-header');
    expect(rendered.body).toContain('ant-listy-css-var');
    expect(rendered.body).not.toContain('prefixCls=');
    expect(rendered.head).toContain('listy-prefix:records');
  });

  it('keeps SSR deterministic without virtual measurement, scroll resources or timers', () => {
    vi.useFakeTimers();
    try {
      const rendered = render(ListyPrefixSSRFixtures);

      expect(rendered.body).toContain('Record row-00');
      expect(rendered.body).toContain('value="Draft"');
      expect(rendered.head).toContain('--rc-virtual-list-scrollbar-bg');
      expect(vi.getTimerCount()).toBe(0);
    } finally {
      vi.useRealTimers();
    }
  });
});
