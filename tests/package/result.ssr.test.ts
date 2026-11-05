import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';
import { Result } from 'antd-svelte';
import ResultSourceCase from '../browser/fixtures/ResultSourceCase.svelte';

describe('Result public package SSR', () => {
  it.each(['403', '404', '500'] as const)(
    'exports the %s image as a Svelte component with unchanged source geometry',
    status => {
      const width = { '403': 251, '404': 252, '500': 254 }[status];
      const title = { '403': 'Unauthorized', '404': 'No Found', '500': 'Server Error' }[status];
      const { body } = render(Result[`PRESENTED_IMAGE_${status}`]);

      expect(body).toContain(`width="${width}" height="294"`);
      expect(body).toContain(`<title>${title}</title>`);
      expect(body).not.toContain('viewBox=');
      expect(body).not.toContain('aria-hidden=');
      expect(body).not.toContain('focusable=');
    }
  );

  it('renders zero, true and nested arrays with source presence rules', () => {
    const numeric = render(Result, { props: {
      title: 0, subTitle: 0, extra: 0, children: 0, icon: 0
    } }).body.replace(/<!--[\s\S]*?-->/g, '');
    const boolean = render(Result, { props: {
      title: true, subTitle: true, extra: true, children: true, icon: true
    } }).body;
    const arrays = render(Result, { props: {
      title: ['First', 0, false, [null, 'Last']], children: [], icon: null
    } }).body.replace(/<!--[\s\S]*?-->/g, '');

    for (const part of ['title', 'subTitle', 'extra', 'body', 'icon']) {
      expect(numeric).toMatch(new RegExp(`data-ant-result-part="${part}"[^>]*>\\s*0`));
      expect(boolean).toContain(`data-ant-result-part="${part}"`);
    }
    expect(boolean).not.toContain('>true<');
    expect(arrays).toContain('First0Last');
    expect(arrays).toContain('ant-result-body');
    expect(arrays).not.toContain('ant-result-icon');
  });

  it('hides null icons while preserving exception priority over null and false', () => {
    const ordinary = render(Result, { props: { icon: null } }).body;
    const exception = render(Result, { props: { status: 404, icon: null } }).body;

    expect(ordinary).not.toContain('ant-result-icon');
    expect(exception).toMatch(/class="ant-result-icon ant-result-image/);
    expect(exception).toContain('aria-hidden="true" inert');
  });

  it('merges provider and function slots with resolved status and local plain style last', () => {
    const { body } = render(ResultSourceCase, { props: { sample: {
      name: 'merge', props: { title: 0, style: 'padding-top:11px' },
      provider: 'function', semantic: 'function'
    } } });

    expect(body).toContain('status-info given-title zero-title');
    expect(body).toContain('provider-title local-title');
    expect(body).toContain('padding-top:3px;background:red;padding-top:5px;');
    expect(body).toContain('padding-top:9px;background:#112233;padding-top:11px');
    expect(body).toContain('<h2');
  });

  it('replaces nested component config and forwards owner data and aria metadata', () => {
    const { body } = render(ResultSourceCase, { props: { sample: {
      name: 'reset', props: {
        'data-owner': 'owner', 'aria-description': 'Details', 'aria-label': 'Named outcome',
        role: 'status'
      },
      provider: 'object', childProvider: 'empty'
    } } });

    expect(body).not.toContain('provider-result');
    expect(body).not.toContain('provider-root');
    expect(body).toContain('data-owner="owner"');
    expect(body).toContain('aria-description="Details"');
    expect(body).toContain('role="status"');
    expect(body).not.toContain('role="group"');
  });

  it('prepares all four component tokens and prefix CSS without DOM or timers', () => {
    vi.useFakeTimers();
    try {
      const { body, head } = render(ResultSourceCase, { props: { sample: {
        name: 'themed', props: { prefixCls: 'source-result' }, theme: 'tokens'
      } } });

      expect(body).toContain('--ant-result-title-font-size:31px');
      expect(body).toContain('--ant-result-subtitle-font-size:19px');
      expect(body).toContain('--ant-result-icon-font-size:83px');
      expect(body).toContain('--ant-result-extra-margin:11px 7px 5px');
      expect(body).toContain('aria-label="Result source native ref">false');
      expect(body).toContain('aria-label="Result source object ref">false');
      expect(head).toContain('result-prefix:source-result');
      expect(head).toContain('.source-result-icon');
      expect(vi.getTimerCount()).toBe(0);
    } finally {
      vi.useRealTimers();
    }
  });
});
