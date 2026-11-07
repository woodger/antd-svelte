import { createRawSnippet } from 'svelte';
import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';
import Cascader from './Cascader.svelte';
import CascaderPanel from './CascaderPanel.svelte';
import type { CascaderOption, CascaderSemantic } from './cascader.types';

const options: CascaderOption[] = [
  { value: 'p', label: 'Parent', children: [
    { value: 'a', label: 'Alpha' }, { value: 'b', label: 'Beta' }
  ] },
  { value: 0, label: 'Zero' }
];

describe('Cascader SSR', () => {
  it('renders the selected full path separately from an empty native search input', () => {
    const body = render(Cascader, { props: { options, value: ['p', 'a'], id: 'region' } }).body;

    expect(body).toContain('Parent / Alpha');
    expect(body).toContain('id="region"');
    expect(body).toContain('role="combobox"');
    expect(body).toContain('aria-haspopup="menu"');
    expect(body).toContain('aria-expanded="false"');
    expect(body).toContain('readonly');
    expect(body).not.toContain('role="menu"');
    expect(body).not.toContain('type="hidden"');
  });

  it('gives controlled empty paths priority over defaults and falls back to missing values', () => {
    const empty = render(Cascader, { props: {
      options, value: [], defaultValue: ['p', 'a'], placeholder: 'Choose'
    } }).body;
    const missing = render(Cascader, { props: { options, defaultValue: ['p', 'missing'] } }).body;

    expect(empty).toContain('Choose');
    expect(empty).not.toContain('Parent / Alpha');
    expect(missing).toContain('Parent / missing');
  });

  it('rolls up multiple parent tags and renders SHOW_CHILD leaf tags without serializing paths', () => {
    const parent = render(Cascader, { props: {
      options, multiple: true, value: [['p']], maxTagCount: 0
    } }).body;
    const child = render(Cascader, { props: {
      options, multiple: true, value: [['p']], showCheckedStrategy: 'SHOW_CHILD'
    } }).body;

    expect(parent).toContain('+ 1 ...');
    expect(child).toContain('Alpha');
    expect(child).toContain('Beta');
    expect(child).toContain('ant-select-multiple');
    expect(child).not.toContain('type="hidden"');
  });

  it('renders an initially open popup hidden without loading or publishing during SSR', () => {
    const loadData = vi.fn();
    const onChange = vi.fn();
    const body = render(Cascader, { props: {
      options: [{ value: 'p', label: 'Parent', isLeaf: false }],
      defaultOpen: true, loadData, onChange
    } }).body;

    expect(body).toContain('popover="manual" hidden');
    expect(body).toContain('role="menu"');
    expect(body).toContain('ant-cascader-menu-item-expand');
    expect(loadData).not.toHaveBeenCalled();
    expect(onChange).not.toHaveBeenCalled();
  });

  it('renders custom fields, semantic popup slots and local root style priority', () => {
    const body = render(Cascader, { props: {
      options: [{ code: 0, title: 'Custom root' }],
      fieldNames: { label: 'title', value: 'code' },
      value: [0], defaultOpen: true,
      classNames: ({ props }) => ({ root: `size-${props.size}`, popup: { listItem: 'entry' } }),
      styles: { root: 'color:red', popup: { root: 'padding:1px', listItem: 'color:blue' } },
      style: 'color:green'
    } }).body;

    expect(body).toContain('Custom root');
    expect(body).toContain('size-medium');
    expect(body).toContain('color:red;color:green');
    expect(body).toContain('padding:1px');
    expect(body).toContain('color:blue');
    expect(body).toContain('entry');
  });

  it('renders search highlights with original label case without starting loadData', () => {
    const loadData = vi.fn();
    const body = render(Cascader, { props: {
      options, defaultOpen: true, showSearch: { searchValue: 'ALP' }, loadData
    } }).body;

    expect(body).toContain('ant-cascader-menu-item-keyword');
    expect(body).toContain('>Alp</span>');
    expect(body).not.toContain('Beta');
    expect(loadData).not.toHaveBeenCalled();
  });

  it('renders snippets and custom display content as Svelte output', () => {
    const label = createRawSnippet(() => ({ render: () => '<strong>Rendered label</strong>' }));
    const display = createRawSnippet(() => ({ render: () => '<em>Custom path</em>' }));
    const body = render(Cascader, { props: {
      options: [{ value: 0, label }], value: [0], defaultOpen: true, displayRender: display
    } }).body;

    expect(body).toContain('<strong>Rendered label</strong>');
    expect(body).toContain('<em>Custom path</em>');
  });

  it('passes raw option and value props to semantic callbacks with resolved presentation state', () => {
    const value = ['p', 'a'];
    const seen: CascaderSemantic['props'][] = [];
    const body = render(Cascader, { props: {
      options, value, placeholder: 'Raw placeholder',
      classNames: info => { seen.push(info.props); return undefined; }
    } }).body;

    expect(body).toContain('Parent / Alpha');
    expect(seen[0].options).toBe(options);
    expect(seen[0].value).toBe(value);
    expect(seen[0].placeholder).toBe('Raw placeholder');
    expect(seen[0].multiple).toBeUndefined();
    expect(seen[0].disabled).toBe(false);
    expect(seen[0].size).toBe('medium');
    expect(seen[0].variant).toBe('outlined');
  });
});

describe('CascaderPanel SSR', () => {
  it('renders standalone columns and checks without a popup, selector or browser APIs', () => {
    const body = render(CascaderPanel, { props: { options, value: [['p']], multiple: true } }).body;

    expect(body).toContain('ant-cascader-panel');
    expect(body).toContain('role="menu"');
    expect(body).toContain('aria-checked="true"');
    expect(body).toContain('ant-cascader-checkbox-checked');
    expect(body).not.toContain('role="combobox"');
    expect(body).not.toContain('popover=');
  });

  it('renders source empty states and allows null content to suppress them', () => {
    const empty = render(CascaderPanel).body;
    const hidden = render(CascaderPanel, { props: { notFoundContent: null } }).body;

    expect(empty).toContain('ant-cascader-panel-empty');
    expect(empty).toContain('ant-empty');
    expect(hidden).not.toContain('ant-empty');
    expect(hidden).not.toContain('role="menuitemcheckbox"');
  });
});
