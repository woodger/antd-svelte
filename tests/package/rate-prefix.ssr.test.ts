import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';
import { Rate, type RateProps } from 'antd-svelte';
import registry from 'antd-svelte/porting/registry.json';
import reference from '../browser/fixtures/ant-design-rate-prefix-reference.json';
import RatePrefixSSRFixtures from '../browser/fixtures/RatePrefixSSRFixtures.svelte';

describe('Rate local/shared prefixes in the public package', () => {
  it('pins source styles, character contexts and state across live prefix changes', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version,
      revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256
    });
    expect(reference.cases).toHaveLength(26);
    expect(reference.transitions.every(step => step.sameRate && step.sameStar && step.focused))
      .toBe(true);
  });

  it('renders local parts with canonical tokens and native radio buttons without leaking props', () => {
    const props = {
      prefixCls: 'review', defaultValue: 2.5, allowHalf: true, size: 'small'
    } satisfies RateProps;
    const rendered = render(Rate, { props });

    expect(rendered.body).toContain('review-small');
    expect(rendered.body).toContain('review-star-half');
    expect(rendered.body).toContain('review-star-first');
    expect(rendered.body).toContain('ant-rate-css-var');
    expect(rendered.body).toContain('type="button" role="radio"');
    expect(rendered.body).not.toContain('prefixCls=');
    expect(rendered.head).toContain('rate-prefix:review');
  });

  it('keeps character context and shared prefixes during SSR without starting timers', () => {
    vi.useFakeTimers();
    try {
      const rendered = render(RatePrefixSSRFixtures);

      expect(rendered.body).toContain('suite-rate');
      expect(rendered.body).toContain('data-character-prefix="review-star"');
      expect(rendered.body).toContain('review-star-half');
      expect(rendered.head).toContain('rate-prefix:review');
      expect(vi.getTimerCount()).toBe(0);
    } finally {
      vi.useRealTimers();
    }
  });
});
