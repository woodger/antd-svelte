import { createRawSnippet } from 'svelte';
import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import { Masonry, type MasonryProps } from 'antd-svelte';
import registry from 'antd-svelte/porting/registry.json';
import reference from '../browser/fixtures/ant-design-masonry-prefix-reference.json';
import isolated from '../browser/fixtures/ant-design-masonry-prefix-isolated.json';
import MasonryPrefixSSRFixtures from '../browser/fixtures/MasonryPrefixSSRFixtures.svelte';

describe('Masonry local and shared prefixes in the public package', () => {
  it('pins source geometry, stable identities and the isolated RTL alias', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version,
      revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256
    });
    expect(reference.cases).toHaveLength(14);
    expect(reference.transitions).toHaveLength(3);
    expect(reference.transitions.every(step => step.sameRoot && step.rootsRetained
      && step.sameInput)).toBe(true);
    const raw = reference.cases.find(entry => entry.sample.id === 'rtl-alias')!;

    expect(raw.result.normal.root.direction).toBe('rtl');
    expect(isolated.cases[0].result.normal.root.direction).toBe('ltr');
  });

  it('publishes prefixCls and keeps the local raw prefix in semantic callbacks', () => {
    const events: string[] = [];
    const props: MasonryProps<{ height: number; }> = {
      prefixCls: 'tiles',
      items: [{ key: 'one', data: { height: 70 } }],
      itemRender: createRawSnippet(() => {
        events.push('render');
        return { render: () => '<p>Client tile</p>' };
      }),
      classNames: ({ props }) => ({ root: `raw-${props.prefixCls}` })
    };
    const rendered = render(Masonry<{ height: number; }>, { props });

    expect(rendered.body).toContain('class="tiles');
    expect(rendered.body).toContain('raw-tiles');
    expect(rendered.body).toContain('data-ant-masonry-prefix="tiles"');
    expect(rendered.body).toContain('height:0px');
    expect(rendered.body).not.toContain('Client tile');
    expect(rendered.body).not.toContain('prefixCls=');
    expect(rendered.head).toContain('masonry-prefix:tiles');
    expect(events).toEqual([]);
  });

  it('renders provider prefixes and styles while keeping server roots empty', () => {
    const rendered = render(MasonryPrefixSSRFixtures);

    for (const prefix of ['suite', 'inner']) {
      expect(rendered.body).toContain(`${prefix}-masonry`);
      expect(rendered.head).toContain(`masonry-prefix:${prefix}-masonry`);
    }
    expect(rendered.body).toContain('fixture-raw-prefix-unset');
    expect(rendered.body).not.toContain('data-masonry-tile');
    expect(rendered.body).not.toContain('masonry-item-width');
  });
});
