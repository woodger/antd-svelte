import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import { Breadcrumb, type BreadcrumbProps } from 'antd-svelte';
import registry from 'antd-svelte/porting/registry.json';
import reference from '../browser/fixtures/ant-design-breadcrumb-prefix-reference.json';
import BreadcrumbPrefixSSRFixtures from '../browser/fixtures/BreadcrumbPrefixSSRFixtures.svelte';

describe('Breadcrumb local and shared prefixes in the public package', () => {
  it('pins source geometry, stable identities and the raw separator namespace observation', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version,
      revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256
    });
    expect(reference.cases).toHaveLength(12);
    expect(reference.transitions).toHaveLength(3);
    expect(reference.transitions.every(step => step.sameRoot && step.sameLink
      && step.sameMenu && step.focused)).toBe(true);
    expect(reference.openTransition).toEqual({
      samePopup: true, sameCommand: true, visible: true
    });
    const local = reference.cases.find(entry => entry.sample.id === 'local')!;

    expect(local.separatorClasses.normal[0]).toBe('suite-breadcrumb-separator');
    expect(local.result.normal.separators[0].style['margin-inline-start']).toBe('0px');
    expect('matchedSeparators' in local && local.matchedSeparators!.normal.separators[0]
      .style['margin-inline-start']).toBe('8px');
  });

  it('publishes prefixCls with owned item/link/overlay/separator classes and raw semantic metadata', () => {
    const props: BreadcrumbProps = {
      prefixCls: 'trail',
      items: [
        { key: 'first', title: 'First', href: '#first' },
        { key: 'menu', title: 'Section', menu: { items: [{ key: 'entry', label: 'Menu entry' }] } },
        { key: 'last', title: 'Last' }
      ],
      classNames: ({ props }) => ({ root: `raw-${props.prefixCls}` })
    };
    const rendered = render(Breadcrumb, { props });

    expect(rendered.body).toContain('trail-item');
    expect(rendered.body).toContain('trail-link');
    expect(rendered.body).toContain('trail-overlay-link');
    expect(rendered.body).toContain('trail-separator');
    expect(rendered.body).toContain('raw-trail');
    expect(rendered.body).toContain('data-ant-breadcrumb-root');
    expect(rendered.body).not.toContain('prefixCls=');
    expect(rendered.head).toContain('breadcrumb-prefix:trail');
  });

  it('keeps explicit separators in the owner namespace during SSR', () => {
    const rendered = render(Breadcrumb, { props: {
      prefixCls: 'trail',
      items: [{ type: 'separator', separator: '>' }, { title: 'Last' }]
    } });

    expect(rendered.body).toContain('class="trail-separator"');
    expect(rendered.body).toContain('aria-hidden="true"');
    expect(rendered.body).toContain('Last');
  });

  it('inherits nested provider prefixes with local owner precedence during SSR', () => {
    const rendered = render(BreadcrumbPrefixSSRFixtures);

    expect(rendered.body).toContain('suite-breadcrumb-item');
    expect(rendered.body).toContain('suite-breadcrumb-separator');
    expect(rendered.body).toContain('trail-item');
    expect(rendered.body).toContain('trail-separator');
    expect(rendered.head).toContain('breadcrumb-prefix:suite-breadcrumb');
    expect(rendered.head).toContain('breadcrumb-prefix:trail');
  });
});
