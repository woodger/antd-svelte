import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';
import { Card, type CardProps, CardGrid, CardMeta } from 'antd-svelte';
import registry from 'antd-svelte/porting/registry.json';
import reference from '../browser/fixtures/ant-design-card-prefix-reference.json';
import CardPrefixSSRFixtures from '../browser/fixtures/CardPrefixSSRFixtures.svelte';

describe('Card local/shared prefixes and owned Grid/Meta in the public package', () => {
  it('pins raw and matched official source measurements and live node identities', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version,
      revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256
    });
    expect(reference.cases).toHaveLength(19);
    expect(reference.transitions.every(step => step.sameRoot && step.sameInput
      && step.sameMeta && step.sameGrids && step.focused)).toBe(true);
    const local = reference.cases.find(entry => entry.sample.id === 'local')!;

    expect(local.result.normal.meta?.root.display).toBe('block');
    expect(local.matched.normal.meta?.root.display).toBe('flex');
    const aliases = reference.cases.find(entry => entry.sample.id === 'aliases')!;

    expect(aliases.matched.nested.title.style['margin-top']).toBe('26.6px');
    expect('freshNested' in aliases && aliases.freshNested?.title.style['margin-top']).toBe('0px');
  });

  it('renders local root states and raw semantic prefix without leaking prefix props', () => {
    const props: CardProps = {
      prefixCls: 'panel',
      title: 'Card title',
      size: 'small',
      classNames: ({ props }) => ({ root: `semantic-${props.prefixCls}` })
    };
    const rendered = render(Card, { props });

    expect(rendered.body).toContain('panel-small');
    expect(rendered.body).toContain('panel-head-title');
    expect(rendered.body).toContain('semantic-panel');
    expect(rendered.body).not.toContain('prefixCls=');
    expect(rendered.head).toContain('card-prefix:panel:ant');
    expect(render(CardGrid, { props: { prefixCls: 'aside' } }).body).toContain('aside-grid');
    expect(render(CardMeta, { props: { prefixCls: 'aside', title: 'Title' } }).body)
      .toContain('aside-meta-title');
  });

  it('inherits owner prefixes, preserves explicit global fallback and avoids browser resources', () => {
    vi.useFakeTimers();
    try {
      const rendered = render(CardPrefixSSRFixtures);

      expect(rendered.body).toContain('suite-card');
      expect(rendered.body).toContain('panel-grid');
      expect(rendered.body).toContain('panel-meta');
      expect(rendered.body).toContain('inner-card-grid');
      expect(rendered.body).toContain('inner-card-meta');
      expect(rendered.head).toContain('card-prefix:panel:inner');
      expect(vi.getTimerCount()).toBe(0);
    } finally {
      vi.useRealTimers();
    }
  });
});
