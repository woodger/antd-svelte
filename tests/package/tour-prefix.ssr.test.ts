import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';
import { Tour, type TourProps } from 'antd-svelte';
import registry from 'antd-svelte/porting/registry.json';
import reference from '../browser/fixtures/ant-design-tour-prefix-reference.json';
import TourPrefixSSRFixtures from '../browser/fixtures/TourPrefixSSRFixtures.svelte';

describe('Tour local/shared prefixes in the public package', () => {
  it('pins raw source states and separate fresh Inner scopes', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version,
      revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256
    });
    expect(reference.cases).toHaveLength(30);
    expect(reference.transitions.every(step => step.samePopup && step.sameEditor && step.focused))
      .toBe(true);
  });

  it('keeps local prefix CSS in head and portal layers out of SSR', () => {
    const props = {
      prefixCls: 'guide', open: true, steps: [{ title: 'Client title' }]
    } satisfies TourProps;
    const rendered = render(Tour, { props });
    const body = rendered.body;

    expect(body).not.toMatch(/<(?:div|svg|button)\b/);
    expect(body.replace(/<!--[\s\S]*?-->/g, '')).toBe('');
    expect(body).not.toContain('Client title');
    expect(rendered.head).toContain('tour-prefix:guide:ant');
    expect(rendered.head).toContain('.guide-section');
  });

  it('isolates global private namespaces without resolving targets or starting timers', () => {
    vi.useFakeTimers();
    try {
      const rendered = render(TourPrefixSSRFixtures);

      expect(rendered.body).not.toContain('Client title');
      expect(rendered.body).not.toContain('Nested client title');
      expect(rendered.head).toContain('tour-prefix:suite-tour:suite');
      expect(rendered.head).toContain('--inner-tooltip-arrow-background-color');
      expect(vi.getTimerCount()).toBe(0);
    } finally {
      vi.useRealTimers();
    }
  });
});
