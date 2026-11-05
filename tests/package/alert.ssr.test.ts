import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';
import { Alert } from 'antd-svelte';
import AlertSourceCase from '../browser/fixtures/AlertSourceCase.svelte';

describe('Alert public package SSR', () => {
  it('renders scalar and nested array content with source presence rules', () => {
    const numeric = render(Alert, { props: {
      title: 0, description: 0, action: 0, icon: 0, showIcon: true
    } }).body.replace(/<!--[\s\S]*?-->/g, '');
    const arrays = render(Alert, { props: {
      title: ['First', 0, false, [null, 'Last']], description: [], action: true
    } }).body.replace(/<!--[\s\S]*?-->/g, '');

    for (const part of ['title', 'description', 'actions', 'icon']) {
      expect(numeric).toMatch(new RegExp(`data-ant-alert-part="${part}"[^>]*>\\s*0`));
    }
    expect(arrays).toContain('First0Last');
    expect(arrays).toContain('ant-alert-with-description');
    expect(arrays).toContain('ant-alert-actions');
    expect(arrays).not.toContain('>true<');
  });

  it('uses nullish title fallback without replacing explicit false, zero or empty strings', () => {
    const fallback = render(Alert, { props: { title: null, message: 'Legacy title' } }).body;
    const zero = render(Alert, { props: { title: 0, message: 'Legacy title' } }).body;
    const empty = render(Alert, { props: { title: '', message: 'Legacy title' } }).body;

    expect(fallback).toContain('Legacy title');
    expect(zero).not.toContain('Legacy title');
    expect(zero).toContain('ant-alert-title');
    expect(empty).not.toContain('ant-alert-title');
  });

  it('merges function slots with resolved defaults and local plain style last', () => {
    const { body } = render(AlertSourceCase, { props: { sample: {
      name: 'merge', props: { style: 'padding-top:11px' },
      provider: 'function', semantic: 'function'
    } } });

    expect(body).toContain('type-info variant-filled prefix-ant-alert close-true icon-undefined');
    expect(body).toContain('provider-close local-close');
    expect(body).toContain('padding-top:3px;background:red;padding-top:5px;');
    expect(body).toContain('padding-top:7px;background:#112233;padding-top:11px');
  });

  it('replaces nested component config and forwards root and close data/ARIA separately', () => {
    const { body } = render(AlertSourceCase, { props: { sample: {
      name: 'reset', props: { 'data-owner': 'root', role: 'status', 'aria-atomic': 'false',
        closable: { 'data-owner': 'close', 'aria-label': 'Owner close' } },
      provider: 'object', childProvider: 'empty'
    } } });

    expect(body).not.toContain('provider-alert');
    expect(body).toContain('ant-alert-outlined');
    expect(body).toContain('role="status"');
    expect(body).toContain('aria-atomic="false"');
    expect(body).toContain('data-owner="root"');
    expect(body).toContain('data-owner="close"');
    expect(body).toContain('aria-label="Owner close"');
  });

  it('uses context icons with local nullish fallback and explicit false suppression', () => {
    const inherited = render(AlertSourceCase, { props: { sample: {
      name: 'inherit', props: { showIcon: true, icon: null }, provider: 'icons'
    } } }).body;
    const suppressed = render(AlertSourceCase, { props: { sample: {
      name: 'suppress', props: { showIcon: true, icon: false }, provider: 'icons'
    } } }).body;

    expect(inherited).toContain('Context info');
    expect(suppressed).not.toContain('Context info');
    expect(suppressed).toContain('data-ant-alert-part="icon"');
  });

  it('prepares four tokens and prefix CSS without DOM, refs, timers or callbacks', () => {
    vi.useFakeTimers();
    try {
      const { body, head } = render(AlertSourceCase, { props: { sample: {
        name: 'source', props: { prefixCls: 'source-alert' }, theme: 'tokens'
      } } });

      expect(body).toContain('--ant-alert-border-radius:19px');
      expect(body).toContain('--ant-alert-default-padding:13px 17px');
      expect(body).toContain('--ant-alert-with-description-padding:23px 27px');
      expect(body).toContain('--ant-alert-with-description-icon-size:37px');
      expect(body).toContain('aria-label="Alert source native ref">false');
      expect(head).toContain('alert-prefix:source-alert');
      expect(head).toContain('.source-alert-close-icon');
      expect(vi.getTimerCount()).toBe(0);
    } finally {
      vi.useRealTimers();
    }
  });
});
