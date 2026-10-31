import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';
import {
  Cascader, CascaderPanel, CASCADER_SHOW_CHILD, CASCADER_SHOW_PARENT,
  type CascaderProps, type CascaderPanelProps, type CascaderOption
} from 'antd-svelte';
import CascaderFixtures from '../browser/fixtures/CascaderFixtures.svelte';

describe('Cascader public package SSR', () => {
  it('exports typed single paths and the standalone Panel with source strategy constants', () => {
    const props: CascaderProps = {
      options: [{ value: 0, label: 'Zero' }], value: [0]
    };
    const panelProps: CascaderPanelProps = { options: props.options, value: [0] };
    const selector = render(Cascader<CascaderOption, false>, { props }).body;
    const panel = render(CascaderPanel<CascaderOption, false>, { props: panelProps }).body;

    expect(CASCADER_SHOW_PARENT).toBe('SHOW_PARENT');
    expect(CASCADER_SHOW_CHILD).toBe('SHOW_CHILD');
    expect(selector).toContain('Zero');
    expect(selector).toContain('role="combobox"');
    expect(panel).toContain('role="menuitemcheckbox"');
    expect(panel).not.toContain('popover=');
    expect(selector).not.toContain('type="hidden"');
  });

  it('keeps missing multiple paths visible and counts omitted paths after conduction', () => {
    type Option = {
      value: string; label: string; children?: { value: string; label: string; }[];
    };
    const props: CascaderProps<Option, true> = {
      options: [{ value: 'p', label: 'Parent', children: [{ value: 'a', label: 'Alpha' }] }],
      multiple: true, value: [['missing'], ['p']], maxTagCount: 1
    };
    const body = render(Cascader<Option, true>, { props }).body;

    expect(body).toContain('missing');
    expect(body).toContain('+ 1 ...');
    expect(body).toContain('ant-select-multiple');
  });

  it('renders public fixture configuration, form association and native controls without timers', () => {
    vi.useFakeTimers();
    try {
      const body = render(CascaderFixtures).body;

      expect(body).toContain('id="cascader-fixture"');
      expect(body).toContain('Choose path');
      expect(body).toContain('id="associated-path"');
      expect(body).toContain('aria-describedby="associated-path-help"');
      expect(body).toContain('ant-cascader-panel');
      expect(vi.getTimerCount()).toBe(0);
    } finally {
      vi.useRealTimers();
    }
  });
});
