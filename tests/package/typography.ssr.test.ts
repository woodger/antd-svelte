import { render } from 'svelte/server';
import { createRawSnippet } from 'svelte';
import { describe, expect, it, vi } from 'vitest';
import {
  Typography,
  TypographyText,
  TypographyTitle,
  TypographyParagraph,
  TypographyLink,
  type TypographyTextProps,
  type TypographyTitleProps,
  type TypographyLinkProps,
  type TypographySemantic
} from 'antd-svelte';
import TypographyFixture from './TypographyFixture.svelte';

describe('Typography public package', () => {
  it('exports article, span, heading, div and anchor variants with native contracts', () => {
    expect(render(Typography, { props: { children: 'Article' } }).body).toMatch(/<article /);
    expect(render(TypographyText, { props: { children: 'Text' } }).body).toMatch(/<span /);
    expect(render(TypographyTitle, { props: { children: 'Title', level: 4 } }).body).toMatch(/<h4 /);
    expect(render(TypographyParagraph, { props: { children: 'Paragraph' } }).body).toMatch(/<div /);
    expect(render(TypographyLink, { props: { children: 'Link', href: '#target' } }).body).toMatch(/<a /);
  });

  it('preserves zero and arrays containing opaque snippet nodes', () => {
    const zero = render(TypographyFixture, { props: { variant: 'zero' } }).body;
    const array = render(TypographyFixture, { props: { variant: 'array' } }).body;

    expect(zero).toContain('>0');
    expect(array).toContain('Before ');
    expect(array).toContain('<b>atomic</b>');
    expect(array).toContain(' after');
  });

  it('uses the source decoration nesting around both text and actions', () => {
    const body = render(TypographyFixture, { props: { variant: 'decor' } }).body;

    expect(body).toMatch(/<i[\s>]/);
    const order = ['<i', '<kbd', '<mark', '<code', '<del', '<u', '<strong', 'Text content', 'ant-typography-actions'];
    const positions = order.map(value => body.indexOf(value));
    expect(positions.every(index => index >= 0)).toBe(true);
    expect(positions).toEqual([...positions].sort((first, second) => first - second));
  });

  it('merges semantic root, action and textarea slots without dropping root style priority', () => {
    const body = render(TypographyFixture).body;
    const editing = render(TypographyFixture, { props: { variant: 'editing' } }).body;

    expect(body).toContain('provider-typography context-root');
    expect(body).toMatch(/color:red;\s*color:pink;\s*color:green/);
    expect(body).toContain('context-action');
    expect(editing).toContain('context-root local-root');
    expect(editing).toContain('context-textarea local-textarea');
    expect(editing).toContain('padding:4px');
    expect(editing).toContain('Text content');
  });

  it('passes the resolved direction and prefix with the actual component to semantic callbacks', () => {
    const callback = vi.fn<Extract<TypographySemantic, (...args: never[]) => unknown>>(
      () => ({ root: 'computed-root' })
    );
    const body = render(TypographyFixture, { props: { variant: 'title', semantic: callback } }).body;

    expect(body).toContain('computed-root');
    expect(callback).toHaveBeenCalledWith(expect.objectContaining({
      props: expect.objectContaining({ prefixCls: 'ant-typography', direction: 'ltr', component: 'h3' })
    }));
  });

  it('starts JS ellipsis with source CSS clamping at SSR before DOM measurements', () => {
    const body = render(TypographyFixture, { props: { variant: 'ellipsis' } }).body;

    expect(body).toContain('ant-typography-ellipsis-multiple-line');
    expect(body).toContain('-webkit-line-clamp: 2');
    expect(body).toContain('Text content');
    expect(body).toContain('tail');
    expect(body).not.toContain('ant-typography-expand');
    expect(body).not.toContain('position:fixed');
  });

  it('preserves explicit rel and supplies the secure default only for an omitted blank link rel', () => {
    const body = render(TypographyLink, { props: { href: '#target', target: '_blank' } }).body;
    const explicit = render(TypographyLink, { props: { href: '#target', target: '_blank', rel: '' } }).body;

    expect(body).toContain('rel="noopener noreferrer"');
    expect(explicit).toContain('rel=""');
  });

  it('renders initial editable content without browser observers, timers or clipboard calls', () => {
    vi.useFakeTimers();
    try {
      const body = render(TypographyFixture, { props: { variant: 'editing' } }).body;

      expect(body).toContain('ant-typography-edit-content');
      expect(body).toContain('<textarea');
      expect(body).toContain('rows="1"');
      expect(vi.getTimerCount()).toBe(0);
    } finally {
      vi.useRealTimers();
    }
  });

  it('keeps polymorphic root markup and the existing direct snippet API at SSR', () => {
    const snippet = createRawSnippet(() => ({ render: () => '<em>Content</em>' }));
    const body = render(Typography, { props: { component: 'section', children: snippet } }).body;

    expect(body).toMatch(/<section /);
    expect(body).toContain('<em>Content</em>');
  });

  it('checks the public content, heading and link prop types without widening their source APIs', () => {
    const text: TypographyTextProps = { children: 'Text', ellipsis: { suffix: 'tail' } };
    const title: TypographyTitleProps = { children: 'Title', level: 5 };
    const link: TypographyLinkProps = { children: 'Link', href: '#next', ellipsis: true };

    expect(render(TypographyText, { props: text }).body).toContain('Text');
    expect(render(TypographyTitle, { props: title }).body).toMatch(/<h5 /);
    expect(render(TypographyLink, { props: link }).body).toContain('href="#next"');
  });
});
