import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';
import type { RenderEmptyComponent } from 'antd-svelte';
import RenderEmptyCase from '../browser/fixtures/RenderEmptyCase.svelte';

describe('ConfigProvider renderEmpty public consumers SSR', () => {
  it('calls the shared renderer with Cascader for an inline panel', () => {
    const observed: RenderEmptyComponent[] = [];
    const { body } = render(RenderEmptyCase, { props: { observed, sample: {
      name: 'panel', component: 'CascaderPanel', renderer: 'text'
    } } });

    expect(body).toContain('Global Cascader');
    expect(observed).toContain('Cascader');
  });

  it('gives local content priority without calling the shared renderer', () => {
    const observed: RenderEmptyComponent[] = [];
    const { body } = render(RenderEmptyCase, { props: { observed, sample: {
      name: 'local', component: 'Table', renderer: 'text', local: 'snippet'
    } } });

    expect(body).toContain('Local custom');
    expect(body).not.toContain('Global Table');
    expect(observed).toEqual([]);
  });

  it('uses simple small source defaults after a falsy producer while preserving the native absence case', () => {
    const source = render(RenderEmptyCase, { props: { sample: {
      name: 'falsy', component: 'Transfer', renderer: 'zero'
    } } }).body;
    const native = render(RenderEmptyCase, { props: { sample: {
      name: 'native', component: 'Transfer', renderer: 'absent'
    } } }).body;

    expect(source.match(/ant-empty-small/g)).toHaveLength(2);
    expect(source).toContain('No data');
    expect(native).not.toContain('ant-empty-small');
    expect(native).toContain('ant-empty-normal');
  });

  it('selects Transfer array content by side and recursively renders nested nodes and zero', () => {
    const { body } = render(RenderEmptyCase, { props: { sample: {
      name: 'sides', component: 'Transfer', renderer: 'array'
    } } });

    expect(body.match(/Global Transfer left/g)).toHaveLength(1);
    expect(body.match(/Global Transfer right\|/g)).toHaveLength(1);
    expect(body.match(/Global custom/g)).toHaveLength(1);
    expect(body).toContain('Empty global action');
    expect(body).toContain('value="Fresh global draft"');
  });

  it('uses nullish fallback for Table.filter and preserves explicit false or zero', () => {
    const empty = render(RenderEmptyCase, { props: { sample: {
      name: 'filter-null', component: 'Table.filter', renderer: 'null'
    } } }).body;
    const hidden = render(RenderEmptyCase, { props: { sample: {
      name: 'filter-false', component: 'Table.filter', renderer: 'false'
    } } }).body;
    const numeric = render(RenderEmptyCase, { props: { sample: {
      name: 'filter-zero', component: 'Table.filter', renderer: 'zero'
    } } }).body.replace(/<!--[\s\S]*?-->/g, '');

    expect(empty).toContain('No filters');
    expect(empty).toContain('height:24px');
    expect(hidden).not.toContain('No filters');
    expect(hidden).not.toContain('ant-empty-normal');
    expect(numeric).toMatch(/class="filter-options[^"]*"[^>]*>\s*0/);
  });

  it('does not ask renderEmpty for an AutoComplete combobox', () => {
    const observed: RenderEmptyComponent[] = [];
    const { body } = render(RenderEmptyCase, { props: { observed, sample: {
      name: 'auto', component: 'AutoComplete', renderer: 'text'
    } } });

    expect(observed).toEqual([]);
    expect(body).not.toContain('Global AutoComplete');
  });

  it('renders configured nested fallback without creating timers or browser work', () => {
    vi.useFakeTimers();
    try {
      const { body } = render(RenderEmptyCase, { props: { sample: {
        name: 'nested', component: 'CascaderPanel', renderer: 'text', nested: 'false'
      } } });

      expect(body).not.toContain('Global Cascader');
      expect(body).toContain('ant-empty-small');
      expect(vi.getTimerCount()).toBe(0);
    } finally {
      vi.useRealTimers();
    }
  });
});
