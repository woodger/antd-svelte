import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';
import { Empty } from 'antd-svelte';
import EmptySourceCase from '../browser/fixtures/EmptySourceCase.svelte';

describe('Empty public package SSR', () => {
  it('exports both source image constants as existing native image aliases', () => {
    expect(Empty.PRESENTED_IMAGE_DEFAULT).toBe('default');
    expect(Empty.PRESENTED_IMAGE_SIMPLE).toBe('simple');
    const { body } = render(Empty, { props: { image: Empty.PRESENTED_IMAGE_SIMPLE } });

    expect(body).toContain('ant-empty-normal');
    expect(body).toContain('viewBox="0 0 64 41"');
  });

  it('renders URL images with source alt and drag metadata inside the native inert image region', () => {
    const { body } = render(Empty, { props: { image: '/empty.svg', description: 'No records' } });

    expect(body).toContain('src="/empty.svg"');
    expect(body).toContain('alt="No records"');
    expect(body).toContain('draggable="false"');
    expect(body).toContain('aria-hidden="true" inert');
    expect(body).not.toContain('<svg');
  });

  it('renders numeric zero and preserves empty boolean regions like the pinned renderability helper', () => {
    const numeric = render(Empty, { props: { image: 0, description: 0, children: 0 } }).body
      .replace(/<!--[\s\S]*?-->/g, '');
    const boolean = render(Empty, { props: { image: true, description: true, children: true } }).body;

    for (const part of ['image', 'description', 'footer']) {
      expect(numeric).toMatch(new RegExp(`data-ant-empty-part="${part}"[^>]*>\\s*0`));
      expect(boolean).toContain(`data-ant-empty-part="${part}"`);
    }
    expect(boolean).not.toContain('>true<');
  });

  it('merges context and function slots in source order with local plain style last', () => {
    const { body } = render(EmptySourceCase, { props: { sample: {
      name: 'merge', props: { description: 0, style: 'padding-top:11px' },
      provider: 'function', semantic: 'function', actions: true
    } } });

    expect(body).toContain('ant-empty-normal');
    expect(body).toContain('unset-image given-description zero-description');
    expect(body).toContain('provider-image local-image');
    expect(body).toContain('padding-top:3px;background:red;padding-top:5px;');
    expect(body).toContain('padding-top:9px;background:#112233;padding-top:11px');
    expect(body).toContain('height:25px;background:blue;height:37px;padding-top:2px');
  });

  it('replaces nested component config and lets an explicit local image override context', () => {
    const reset = render(EmptySourceCase, { props: { sample: {
      name: 'reset', props: {}, provider: 'object', childProvider: 'empty'
    } } }).body;
    const local = render(EmptySourceCase, { props: { sample: {
      name: 'local', props: { image: '/custom.svg', description: false }, provider: 'object'
    } } }).body;

    expect(reset).not.toContain('provider-empty');
    expect(reset).not.toContain('ant-empty-normal');
    expect(reset).toContain('viewBox="0 0 184 152"');
    expect(local).toContain('src="/custom.svg"');
    expect(local).toContain('alt="empty"');
    expect(local).not.toContain('<svg');
  });

  it('applies semantic image styles', () => {
    const { body } = render(Empty, { props: {
      styles: { image: 'height:37px;padding-top:9px' }
    } });

    expect(body).toContain('height:37px;padding-top:9px');
  });

  it('uses global SVG colors independently of Empty aliases and prepares prefix CSS without browser work', () => {
    vi.useFakeTimers();
    try {
      const { body, head } = render(EmptySourceCase, { props: { sample: {
        name: 'source', props: { prefixCls: 'source-empty' }, theme: 'aliases'
      } } });

      expect(body).toContain('--ant-color-fill:#ff0000');
      expect(body).toContain('--ant-color-bg-container:#00ff00');
      expect(body).toContain('fill="#f0f0f0"');
      expect(body).not.toContain('fill="#ff0000"');
      expect(body).not.toContain('<pattern');
      expect(body).toContain('<title>No data</title>');
      expect(body).toContain('aria-label="Empty source native ref">false');
      expect(body).toContain('aria-label="Empty source object ref">false');
      expect(head).toContain('empty-prefix:source-empty');
      expect(head).toContain('.source-empty-image');
      expect(vi.getTimerCount()).toBe(0);
    } finally {
      vi.useRealTimers();
    }
  });
});
