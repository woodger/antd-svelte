import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';
import { Collapse } from 'antd-svelte';
import CollapseSourceCase from '../browser/fixtures/CollapseSourceCase.svelte';

const items = [{ key: 1, label: 'First title', children: 'First body' }];

describe('Collapse public package SSR', () => {
  it('forwards item HTML attributes and headerClass without invoking refs or events during SSR', () => {
    const fail = () => { throw new Error('Unexpected SSR callback'); };
    const { body } = render(Collapse, { props: { items: [{
      key: 'item', label: 'Section', headerClass: 'custom-header', title: 'Item title',
      tabindex: 2, ref: fail, onClick: fail, onClickCapture: fail
    }] } });

    expect(body).toContain('title="Item title"');
    expect(body).toContain('tabindex="2"');
    expect(body).toContain('custom-header ant-collapse-header');
    expect(body).not.toContain('onclick=');
  });

  it('normalizes numeric and omitted keys and renders scalar and nested array content', () => {
    const { body } = render(Collapse, { props: {
      items: [{ label: [0, false, ['Title']], children: ['First', 0, false, [null, 'Last']],
        extra: 0 }], defaultActiveKey: 0
    } });
    const text = body.replace(/<!--[\s\S]*?-->/g, '');

    expect(body).toContain('data-collapse-key="0"');
    expect(body).toContain('aria-expanded="true"');
    expect(text).toContain('0Title');
    expect(text).toContain('First0Last');
    expect(body).toContain('data-ant-collapse-part="extra"');
    expect(body).not.toContain('>false<');
  });

  it('passes resolved size, border and placement to semantic functions with item styles last', () => {
    const { body } = render(CollapseSourceCase, { props: { sample: {
      name: 'merge', props: { items: [{ ...items[0], classNames: { title: 'item-title' },
        styles: { title: 'color:orange' } }], defaultActiveKey: 1,
        expandIconPlacement: 'end', style: 'padding-top:11px' },
      provider: 'function', semantic: 'function'
    } } });

    expect(body).toContain('flag-size-medium flag-placement-end flag-border-true');
    expect(body).toContain('provider-title local-title item-title');
    expect(body).toContain('color:red;padding-top:3px;color:#335577;color:orange');
    expect(body).toContain('padding-top:7px;background:#112233;padding-top:11px');
    expect(body).toContain('data-ant-collapse-part="title"');
  });

  it('replaces nested component config and keeps root and item attributes separate', () => {
    const { body } = render(CollapseSourceCase, { props: { sample: {
      name: 'reset', props: { 'data-owner': 'root', 'aria-describedby': 'help',
        items: [{ ...items[0], id: 'panel-owner', 'data-item': 'item' }] },
      provider: 'object', childProvider: 'empty'
    } } });

    expect(body).not.toContain('provider-owner');
    expect(body).toContain('data-owner="root"');
    expect(body).toContain('aria-describedby="help"');
    expect(body).toContain('id="panel-owner"');
    expect(body).toContain('data-item="item"');
  });

  it('gives local expandIcon precedence and keeps its payload numeric keys normalized', () => {
    const { body } = render(CollapseSourceCase, { props: { sample: {
      name: 'icon', props: { items, defaultActiveKey: 1 }, provider: 'icon', customIcon: true
    } } });

    expect(body).toContain('Local:true:1:undefined:undefined');
    expect(body).not.toContain('Context:');
  });

  it('prepares all ten tokens and local prefix CSS without timers or DOM refs', () => {
    vi.useFakeTimers();
    try {
      const { body, head } = render(CollapseSourceCase, { props: { sample: {
        name: 'theme', props: { items, prefixCls: 'source-collapse' }, theme: 'tokens'
      } } });

      for (const [name, value] of [
        ['header-padding', '13px 17px'], ['header-padding-sm', '7px 11px'],
        ['header-padding-lg', '19px 23px'], ['header-bg', '#123456'],
        ['content-padding', '29px 31px'], ['content-padding-sm', '17px'],
        ['content-padding-lg', '37px'], ['content-bg', '#abcdef'],
        ['borderless-content-padding', '3px 5px 7px'], ['borderless-content-bg', '#fedcba']
      ]) {
        expect(body).toContain(`--ant-collapse-${name}:${value}`);
      }
      expect(body).toContain('aria-label="Collapse source native ref">false');
      expect(head).toContain('collapse-prefix:source-collapse');
      expect(head).toContain('.source-collapse-header');
      expect(vi.getTimerCount()).toBe(0);
    } finally {
      vi.useRealTimers();
    }
  });
});
