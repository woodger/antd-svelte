import { createRawSnippet } from 'svelte';
import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';
import {
  Skeleton, SkeletonAvatar, SkeletonButton, SkeletonInput, SkeletonImage, SkeletonNode
} from 'antd-svelte';
import SkeletonElementCase from '../browser/fixtures/SkeletonElementCase.svelte';

describe('Skeleton primitives public package SSR', () => {
  it('exports identical named and static Svelte components', () => {
    expect(Skeleton.Avatar).toBe(SkeletonAvatar);
    expect(Skeleton.Button).toBe(SkeletonButton);
    expect(Skeleton.Input).toBe(SkeletonInput);
    expect(Skeleton.Image).toBe(SkeletonImage);
    expect(Skeleton.Node).toBe(SkeletonNode);
  });

  it('renders a zero-sized avatar and source shapes before hydration', () => {
    const { body } = render(Skeleton.Avatar, { props: { size: 0, shape: 'square' } });

    expect(body).toContain('ant-skeleton-element');
    expect(body).toContain('ant-skeleton-avatar-square');
    expect(body).toContain('width:0px;height:0px;line-height:0px');
    expect(body).not.toContain('role="status"');
    expect(body).not.toContain('tabindex');
  });

  it('keeps root and content styles distinct with local style after semantic content', () => {
    const { body } = render(Skeleton.Button, { props: {
      block: true,
      styles: { root: 'padding-top:7px', content: 'width:110px;height:25px' },
      style: 'width:130px;height:31px'
    } });

    expect(body).toContain('ant-skeleton-block');
    expect(body).toContain('padding-top:7px');
    expect(body).toContain('width:110px;height:25px;width:130px;height:31px');
    expect(body).not.toContain('<button');
  });

  it('renders an input placeholder without introducing a form control', () => {
    const { body } = render(Skeleton.Input, { props: { size: 'small', active: true } });

    expect(body).toContain('ant-skeleton-input-sm');
    expect(body).toContain('ant-skeleton-active');
    expect(body).not.toContain('<input');
    expect(body).not.toContain('aria-live');
  });

  it('renders the original image SVG without an image request', () => {
    const { body } = render(Skeleton.Image);

    expect(body).toContain('viewBox="0 0 1098 1024"');
    expect(body).toContain('Image placeholder');
    expect(body).toContain('ant-skeleton-image-path');
    expect(body).toContain('aria-hidden="true"');
    expect(body).not.toContain('<img');
  });

  it('renders node snippets inside the source content region', () => {
    const children = createRawSnippet(() => ({ render: () => '<strong>Custom node</strong>' }));
    const { body } = render(Skeleton.Node, { props: { children, style: 'width:160px' } });

    expect(body).toContain('ant-skeleton-node');
    expect(body).toContain('<strong>Custom node</strong>');
    expect(body).toContain('width:160px');
  });

  it('prepares all six current tokens for main and primitive placeholders without browser work', () => {
    vi.useFakeTimers();
    try {
      const { body, head } = render(SkeletonElementCase, { props: { sample: {
        name: 'own', kind: 'avatar', props: {}, theme: 'own'
      } } });

      expect(body).toContain('--ant-skeleton-gradient-from-color:#112233');
      expect(body).toContain('--ant-skeleton-gradient-to-color:#445566');
      expect(body).toContain('--ant-skeleton-title-height:20px');
      expect(body).toContain('--ant-skeleton-block-radius:9px');
      expect(body).toContain('--ant-skeleton-paragraph-margin-top:31px');
      expect(body).toContain('--ant-skeleton-paragraph-li-height:18px');
      expect(body.match(/--ant-skeleton-title-height:20px/g)).toHaveLength(2);
      expect(head).toContain('skeleton-element-source-scope');
      expect(vi.getTimerCount()).toBe(0);
    } finally {
      vi.useRealTimers();
    }
  });

  it('renders source context size and local prefix selectors on SSR', () => {
    const { body, head } = render(SkeletonElementCase, { props: { sample: {
      name: 'prefix', kind: 'avatar', contextSize: 'large',
      props: { prefixCls: 'source-skeleton' }
    } } });

    expect(body).toContain('source-skeleton-avatar-lg');
    expect(head).toContain('skeleton-prefix:source-skeleton');
    expect(head).toContain('.source-skeleton-avatar');
    expect(body).toContain('ant-skeleton-css-var');
  });
});
