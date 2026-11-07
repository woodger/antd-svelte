import { createRawSnippet } from 'svelte';
import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import Anchor from './Anchor.svelte';

describe('Anchor SSR', () => {
  const items = [
    { key: 'a', href: '#a', title: '<First>', children: [{ key: 'b', href: '#b', title: 0 }] }
  ];
  it('renders native nested links and defers targets, mapping and scroll until mount', () => {
    const fail = () => {
      throw new Error('browser only');
    };
    const { body } = render(
      Anchor,
      { props: { items, getContainer: fail, getCurrentAnchor: fail, onChange: fail } }
    );

    expect(body).toContain('&lt;First>');
    expect(body).toContain('href="#b"');
    expect(body.replace(/<!--.*?-->/g, '')).toMatch(/href="#b"[^>]*>\s*0/);
    expect(body).not.toContain('ant-anchor-link-title-active');
    expect(body).not.toContain('ant-affix');
    expect(body).not.toContain('role="button"');
  });
  it('omits nested items in horizontal mode and applies semantic style priority', () => {
    const { body } = render(
      Anchor,
      {
        props: {
          items,
          direction: 'horizontal',
          affix: false,
          offsetTop: 30,
          class: 'outer',
          rootClassName: 'root',
          classNames: ({ props }) => ({ root: props.direction!, item: 'item-class' }),
          styles: { root: 'max-height:200px;color:red' },
          style: 'max-height:100px'
        }
      }
    );

    expect(body).toContain('ant-anchor-wrapper-horizontal');
    expect(body).toContain('outer root horizontal');
    expect(body).toContain('item-class');
    expect(body).toContain(
      'max-height:calc(100vh - 30px);max-height:200px;color:red;max-height:100px'
    );
    expect(body).not.toContain('href="#b"');
    expect(body).toContain('ant-anchor-fixed');
  });
  it('renders title snippets and shows the fixed indicator when requested', () => {
    const title = createRawSnippet(() => ({ render: () => '<span>Title snippet</span>' }));
    const snippet = render(
      Anchor,
      {
        props: {
          items: [{ key: 'a', href: '#a', title }],
          affix: false,
          showInkInFixed: true
        }
      }
    ).body;

    expect(snippet).toContain('Title snippet');
    expect(snippet).not.toContain('ant-anchor-fixed');
  });
});
