import { createRawSnippet } from 'svelte';
import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';
import { Skeleton } from 'antd-svelte';
import SkeletonMainCase from '../browser/fixtures/SkeletonMainCase.svelte';

describe('Skeleton main public package SSR', () => {
  it('keeps legacy class and style on the native host while applying semantic root to the placeholder', () => {
    const { body } = render(Skeleton, { props: {
      id: 'native-skeleton',
      class: 'legacy-owner',
      style: 'padding-top:17px',
      rootClassName: 'placeholder-owner',
      classNames: { root: 'semantic-root', title: 'semantic-title' },
      styles: { root: 'padding-top:7px', title: 'height:23px' }
    } });
    const host = body.match(/<div[^>]*id="native-skeleton"[^>]*>/)?.[0];
    const placeholder = body.match(/<div[^>]*data-ant-skeleton-main[^>]*>/)?.[0];

    expect(host).toContain('legacy-owner');
    expect(host).toContain('padding-top:17px');
    expect(host).not.toContain('placeholder-owner');
    expect(placeholder).toContain('semantic-root');
    expect(placeholder).toContain('placeholder-owner');
    expect(placeholder).toContain('padding-top:7px');
    expect(placeholder).not.toContain('padding-top:17px');
    expect(body).toContain('semantic-title');
    expect(body).toContain('height:23px');
    expect(body).toContain('role="group"');
    expect(body).toContain('aria-busy="true"');
  });

  it('merges context and function slots with defaulted parts and raw optional props', () => {
    const { body } = render(SkeletonMainCase, { props: { sample: {
      name: 'merged', props: {}, provider: true, local: true
    } } });

    expect(body).toContain('provider-root local-root');
    expect(body).toContain('avatar-false title-true paragraph-true');
    expect(body).toContain('active-undefined loading-undefined');
    expect(body).toContain('padding-top:3px;background:red;padding-top:5px;');
    expect(body).toContain('padding-top:7px;background:#112233');
    expect(body).toContain('provider-title local-title');
    expect(body).toContain('background:yellow;height:11px;background:#5588aa');
  });

  it('replaces context records with an empty nested config', () => {
    const { body } = render(SkeletonMainCase, { props: { sample: {
      name: 'nested', props: { avatar: true }, provider: true, childProvider: 'empty'
    } } });

    expect(body).not.toContain('provider-skeleton');
    expect(body).not.toContain('provider-root');
    expect(body).not.toContain('provider-avatar');
    expect(body).toContain('ant-skeleton-avatar');
  });

  it('combines function context slots with object local slots', () => {
    const { body } = render(SkeletonMainCase, { props: { sample: {
      name: 'callbacks', props: { avatar: true }, provider: true,
      functionalProvider: true, objectLocal: true
    } } });

    expect(body).toContain('context-avatar-true context-title-true context-paragraph-true');
    expect(body).toContain('context-active-undefined object-root');
    expect(body).toContain('provider-title object-title');
    expect(body).toContain('padding-top:5px;padding-top:9px');
    expect(body).toContain('background:yellow;height:13px');
  });

  it('keeps explicit undefined nested classes and prefixes instead of restoring semantic defaults', () => {
    const { body } = render(Skeleton, { props: {
      title: { prefixCls: undefined, class: undefined },
      paragraph: { prefixCls: undefined, class: undefined },
      classNames: { title: 'semantic-title', paragraph: 'semantic-paragraph' }
    } });

    expect(body).not.toContain('semantic-title');
    expect(body).not.toContain('semantic-paragraph');
    expect(body).not.toContain('class="ant-skeleton-title');
    expect(body).not.toContain('class="ant-skeleton-paragraph');
    expect(body).toContain('data-ant-skeleton-part="title"');
    expect(body).toContain('data-ant-skeleton-part="paragraph"');
  });

  it('gives nested classes and prefixes precedence while replacing nested style with slot style', () => {
    const { body } = render(SkeletonMainCase, { props: { sample: {
      name: 'nested', props: { avatar: true }, provider: true, local: true, nested: 'prefix'
    } } });

    expect(body).toContain('nested-avatar nested-avatar-circle nested-avatar-class');
    expect(body).toContain('nested-title nested-title-class');
    expect(body).toContain('nested-paragraph nested-paragraph-class');
    expect(body).not.toContain('provider-title local-title');
    expect(body).not.toContain('background:black');
    expect(body).toContain('width:30px;height:25px;background:#446688');
    expect(body).toContain('height:11px;background:#5588aa');
  });

  it('renders local prefix CSS and source tokens without assigning mounted refs or timers', () => {
    vi.useFakeTimers();
    try {
      const { body, head } = render(SkeletonMainCase, { props: { sample: {
        name: 'prefix', props: { prefixCls: 'source-main', avatar: true }, theme: 'own'
      } } });

      expect(body).toContain('source-main-title');
      expect(body).toContain('--ant-skeleton-title-height:20px');
      expect(body).toContain('--ant-skeleton-paragraph-li-height:18px');
      expect(body).toContain('aria-label="Skeleton main native ref">false');
      expect(body).toContain('aria-label="Skeleton main object ref">none');
      expect(head).toContain('skeleton-main-prefix:source-main');
      expect(head).toContain('.source-main-title');
      expect(vi.getTimerCount()).toBe(0);
    } finally {
      vi.useRealTimers();
    }
  });

  it('keeps the existing loading default for explicit undefined and returns children when ready', () => {
    const children = createRawSnippet(() => ({ render: () => '<p>Ready content</p>' }));
    const loading = render(Skeleton, { props: { loading: undefined, children } }).body;
    const ready = render(Skeleton, { props: {
      loading: false, children, prefixCls: 'ready-main', rootClassName: 'placeholder-only'
    } });

    expect(loading).toContain('aria-busy="true"');
    expect(loading).not.toContain('Ready content');
    expect(ready.body).toContain('Ready content');
    expect(ready.body).toContain('aria-busy="false"');
    expect(ready.body).not.toContain('placeholder-only');
    expect(ready.head).not.toContain('skeleton-main-prefix:ready-main');
  });
});
