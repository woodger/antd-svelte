import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import { Anchor, type AnchorProps } from 'antd-svelte';
import registry from 'antd-svelte/porting/registry.json';
import reference from '../browser/fixtures/ant-design-anchor-prefix-reference.json';
import AnchorPrefixSSRFixtures from '../browser/fixtures/AnchorPrefixSSRFixtures.svelte';

describe('Anchor local and shared prefixes in the public package', () => {
  it('pins source classes and records raw local item and ink observations', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version,
      revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256
    });
    expect(reference.cases).toHaveLength(13);
    expect(reference.transitions).toHaveLength(3);
    expect(reference.transitions.every(step => step.sameRoot && step.sameLink
      && step.sameInk && step.focused)).toBe(true);
    const local = reference.cases.find(entry => entry.sample.id === 'local')!;

    expect(local.result.normal.links[0].item['padding-inline-start']).toBe('0px');
    expect('matchedItems' in local && local.matchedItems!.normal.links[0]
      .item['padding-inline-start']).toBe('16px');
  });

  it('publishes owner and item prefixes without choosing active links or reading DOM during SSR', () => {
    const props: AnchorProps = {
      prefixCls: 'nav',
      affix: false,
      items: [
        { key: 'one', href: '#one', title: 'First' },
        { key: 'two', href: '#two', title: 'Second', children: [
          { key: 'detail', href: '#detail', title: 'Detail' }
        ] }
      ],
      getContainer: () => { throw Error('DOM getter'); },
      classNames: ({ props }) => ({ root: `raw-${props.prefixCls}` })
    };
    const rendered = render(Anchor, { props });

    expect(rendered.body).toContain('nav-wrapper');
    expect(rendered.body).toContain('raw-nav');
    expect(rendered.body.match(/nav-link-title/g)).toHaveLength(3);
    expect(rendered.body).toContain('data-ant-anchor-root');
    expect(rendered.body).not.toContain('data-ant-anchor-title-active');
    expect(rendered.body).not.toContain('prefixCls=');
    expect(rendered.head).toContain('anchor-prefix:nav');
  });

  it('keeps explicit item overrides and lets an empty item prefix use the provider fallback', () => {
    const rendered = render(Anchor, { props: {
      prefixCls: 'nav',
      affix: false,
      items: [
        { key: 'local', href: '#local', title: 'Local', prefixCls: 'custom' },
        { key: 'global', href: '#global', title: 'Global', prefixCls: '' }
      ]
    } });

    expect(rendered.body).toContain('custom-link-title');
    expect(rendered.body).toContain('ant-anchor-link-title');
    expect(rendered.body).toContain('nav-wrapper');
  });

  it('inherits provider prefixes for nested links and keeps local owner precedence', () => {
    const rendered = render(AnchorPrefixSSRFixtures);

    expect(rendered.body).toContain('suite-anchor-wrapper');
    expect(rendered.body).toContain('suite-anchor-link-title');
    expect(rendered.body).toContain('nav-wrapper');
    expect(rendered.body).toContain('nav-link-title');
    expect(rendered.head).toContain('anchor-prefix:suite-anchor');
    expect(rendered.head).toContain('anchor-prefix:nav');
  });
});
