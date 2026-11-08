import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';
import { TypographyParagraph, type TypographyParagraphProps } from 'antd-svelte';
import registry from 'antd-svelte/porting/registry.json';
import reference from '../browser/fixtures/ant-design-typography-prefix-reference.json';
import TypographyPrefixSSRFixtures from '../browser/fixtures/TypographyPrefixSSRFixtures.svelte';

describe('Typography local and shared prefixes in the public package', () => {
  it('pins official source measurements and live editor state', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version,
      revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256
    });
    expect(reference.cases).toHaveLength(10);
    expect(reference.transitions).toHaveLength(3);
    expect(reference.transitions.every(step => step.sameEditor && step.sameLink && step.focused))
      .toBe(true);
    const changed = reference.transitions[0];

    expect(changed.result.nested.actions.actions[0].classes).toEqual(['suite-typography-edit']);
    expect(changed.freshResult.nested.actions.actions[0].classes).toEqual(['next-typography-edit']);
  });

  it('styles local actions and keeps semantic callbacks resolved and local styles last', () => {
    const props: TypographyParagraphProps = {
      prefixCls: 'prose',
      children: 'Draft',
      copyable: true,
      classNames: info => ({ root: `semantic-${info.props.prefixCls}` }),
      styles: { root: 'font-size:22px' },
      style: 'font-size:24px'
    };
    const rendered = render(TypographyParagraph, { props });

    expect(rendered.body).toContain('semantic-prose');
    expect(rendered.body).toContain('prose-copy');
    expect(rendered.body).toMatch(/font-size:22px;\s*font-size:24px/);
    expect(rendered.body).not.toContain('prefixCls=');
    expect(rendered.head).toContain('typography-prefix:prose');
  });

  it('inherits and overrides prefixes in SSR editing without creating browser resources', () => {
    vi.useFakeTimers();
    try {
      const rendered = render(TypographyPrefixSSRFixtures);

      expect(rendered.body).toContain('suite-typography');
      expect(rendered.body).toContain('prose-copy');
      expect(rendered.body).toContain('inner-typography-edit-content');
      expect(rendered.body).toContain('Server editing draft</textarea>');
      expect(rendered.head).toContain('typography-prefix:suite-typography');
      expect(rendered.head).toContain('typography-prefix:prose');
      expect(rendered.head).toContain('typography-prefix:inner-typography');
      expect(vi.getTimerCount()).toBe(0);
    } finally {
      vi.useRealTimers();
    }
  });
});
