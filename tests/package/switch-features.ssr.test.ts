import { render } from 'svelte/server';
import { describe, expect, expectTypeOf, it, vi } from 'vitest';
import { Switch, type SwitchClickEventHandler } from 'antd-svelte';
import SwitchFeaturesFixture from './SwitchFeaturesFixture.svelte';

describe('Switch source package features', () => {
  it('gives checked priority over value and preserves an explicit false default', () => {
    const checked = render(Switch, { props: { checked: false, value: true } }).body;
    const defaults = render(Switch, {
      props: { defaultChecked: false, defaultValue: true }
    }).body;

    expect(checked).toContain('aria-checked="false"');
    expect(defaults).toContain('aria-checked="false"');
  });

  it('renders value and defaultValue aliases without invoking user callbacks', () => {
    const onChange = vi.fn();
    const onClick = vi.fn();
    const controlled = render(Switch, { props: { value: false, defaultValue: true, onChange } });
    const defaults = render(Switch, { props: { defaultValue: true, name: 'enabled', onClick } });

    expect(controlled.body).toContain('aria-checked="false"');
    expect(defaults.body).toContain('aria-checked="true"');
    expect(defaults.body).toMatch(/<input[^>]*name="enabled"[^>]*value="on"/);
    expect(onChange).not.toHaveBeenCalled();
    expect(onClick).not.toHaveBeenCalled();
  });

  it('merges root, indicator and both content slots in source style priority', () => {
    const body = render(SwitchFeaturesFixture).body;

    expect(body).toContain('switch-context');
    expect(body).toContain('context-small-undefined');
    expect(body).toContain('color:blue;color:red;color:green;color:orange');
    expect(body).toContain('context-indicator local-indicator');
    expect(body).toContain('outline:1px solid red;width:20px');
    expect(body.match(/context-content local-content/g)).toHaveLength(2);
    expect(body).toContain('<strong>Rich ON</strong>');
    expect(body.replace(/<!--[\s\S]*?-->/g, ''))
      .toMatch(/ant-switch-inner-unchecked[^>]*>\s*0\s*<\/span>/);
  });

  it('keeps medium ordinary while small changes the size', () => {
    for (const size of ['medium', 'small'] as const) {
      const body = render(Switch, { props: { size } }).body;

      expect(body.includes('ant-switch-small')).toBe(size === 'small');
    }
  });

  it('passes custom prefix, title and focus aliases without leaking source attributes', () => {
    const body = render(Switch, {
      props: {
        prefixCls: 'custom-switch',
        rootClassName: 'custom-root',
        value: true,
        title: 'Switch title',
        autoFocus: true,
        tabIndex: 3,
        classNames: { content: 'custom-content' }
      }
    }).body;

    expect(body).toContain('custom-switch-checked');
    expect(body).toContain('custom-switch-handle');
    expect(body).toContain('custom-root');
    expect(body).toContain('custom-content');
    expect(body).toContain('title="Switch title"');
    expect(body).toContain('autofocus');
    expect(body).toContain('tabindex="3"');
    expect(body).not.toMatch(/\s(?:value|prefixCls|autoFocus|tabIndex|classNames|rootClassName)=/);
  });

  it('preserves string and zero content while escaping caller text', () => {
    const body = render(Switch, {
      props: { checkedChildren: '<unsafe>', unCheckedChildren: 0 }
    }).body;

    expect(body).toContain('&lt;unsafe>');
    expect(body.replace(/<!--[\s\S]*?-->/g, ''))
      .toMatch(/ant-switch-inner-unchecked[^>]*>\s*0\s*<\/span>/);
    expectTypeOf<SwitchClickEventHandler>().parameter(0).toEqualTypeOf<boolean>();
    expectTypeOf<Parameters<SwitchClickEventHandler>[1]['currentTarget']>()
      .toEqualTypeOf<EventTarget & HTMLButtonElement>();
  });
});
