import { describe, expect, it } from 'vitest';
import { createRawSnippet } from 'svelte';
import {
  cascaderChecks,
  cascaderClearIcon,
  cascaderColumns,
  cascaderDisplay,
  cascaderFields,
  cascaderHighlight,
  cascaderIndex,
  cascaderLeaf,
  cascaderPathKey,
  cascaderPathOptions,
  cascaderRawValues,
  cascaderStrategy,
  mergeCascaderSlots,
  navigateCascader,
  searchCascader,
  toggleCascader
} from './cascader.engine';
import type { CascaderOption, CascaderPath } from './cascader.types';

const options: CascaderOption[] = [
  { value: 'p', label: 'Parent', children: [
    { value: 'a', label: 'Alpha' },
    { value: 'b', label: 'Beta' },
    { value: 'locked', label: 'Locked', disabled: true },
    { value: 'checkbox', label: 'Checkbox', disableCheckbox: true }
  ] },
  { value: 0, label: 'Zero' },
  { value: 'q', label: 'Other', disabled: true, children: [
    { value: 'a', label: 'Alpha' }
  ] }
];
const fields = cascaderFields();
const index = cascaderIndex(options, fields);
const key = (path: CascaderPath) => cascaderPathKey(path);
const checks = (paths: CascaderPath[], multiple = true) =>
  cascaderChecks(paths, multiple, options, fields, index);

describe('Cascader paths and checks', () => {
  it('preserves Ant boolean clear icons and rc-select object and falsy fallbacks', () => {
    const icon = createRawSnippet(() => ({ render: () => '<span>Clear</span>' }));

    expect(cascaderClearIcon(true, undefined, undefined)).toBeUndefined();
    expect(cascaderClearIcon(true, undefined, icon)).toBe(icon);
    expect(cascaderClearIcon({}, undefined, icon)).toBe('×');
    expect(cascaderClearIcon({ clearIcon: icon }, null, undefined)).toBe(icon);
    for (const empty of [null, false, 0, ''] as const) {
      expect(cascaderClearIcon(true, empty, icon)).toBe('×');
      expect(cascaderClearIcon({ clearIcon: empty }, undefined, icon)).toBe('×');
    }
  });

  it('normalizes single and multiple paths without losing zero or coercing value identity', () => {
    expect(cascaderRawValues(undefined)).toEqual([]);
    expect(cascaderRawValues([])).toEqual([]);
    expect(cascaderRawValues([0])).toEqual([[0]]);
    expect(cascaderRawValues([['p', 'a'], [0]])).toEqual([['p', 'a'], [0]]);
    expect(cascaderPathOptions([0], options, fields)).toEqual([options[1]]);
    expect(cascaderPathOptions(['0'], options, fields)).toEqual([undefined]);
  });

  it('resolves full paths and retains every missing cell in callback options', () => {
    const selected = cascaderPathOptions(['p', 'a'], options, fields);

    expect(selected[0]).toBe(options[0]);
    expect(selected[1]).toBe(options[0].children![0]);
    expect(cascaderPathOptions(['p', 'missing', 'tail'], options, fields)).toEqual([
      options[0], undefined, undefined
    ]);
    expect(cascaderPathOptions(['q', 'a'], options, fields)[1]).toBe(options[2].children![0]);
  });

  it('maps custom fields recursively without modifying original options', () => {
    const custom = [{ code: 0, text: 'Root', nodes: [{ code: 2, text: 'Leaf' }] }];
    const names = cascaderFields({ value: 'code', label: 'text', children: 'nodes' });
    const customIndex = cascaderIndex(custom, names);

    expect(customIndex.paths.get(key([0, 2]))?.options[1]).toBe(custom[0].nodes[0]);
    expect(cascaderPathOptions([0, 2], custom, names)).toEqual([custom[0], custom[0].nodes[0]]);
    expect(cascaderDisplay([[0, 2]], custom, names, false)[0].text).toBe('Root / Leaf');
    const shared = cascaderFields({ label: 'code', value: 'code', children: 'nodes' });
    expect(cascaderDisplay([[0, 2]], custom, shared, false)[0].text).toBe('0 / 2');
  });

  it('uses explicit isLeaf before children for expansion', () => {
    expect(cascaderLeaf({ value: 'lazy', isLeaf: false }, fields)).toBe(false);
    expect(cascaderLeaf({ value: 'empty', children: [] }, fields)).toBe(true);
    expect(cascaderLeaf({ ...options[0], isLeaf: true }, fields)).toBe(true);
  });

  it('conducts a parent through enabled children and retains missing paths separately', () => {
    const result = checks([['missing', 0], ['p']]);

    expect(result.checked).toEqual([key(['p']), key(['p', 'a']), key(['p', 'b'])]);
    expect(result.half).toEqual([]);
    expect(result.missing).toEqual([['missing', 0]]);
    expect(checks([['p']], false).checked).toEqual(['p']);
  });

  it('marks partial ancestors and rolls up only when all enabled children are checked', () => {
    const partial = checks([['p', 'a']]);
    const complete = checks([['p', 'a'], ['p', 'b']]);

    expect(partial.half).toEqual(['p']);
    expect(cascaderStrategy(partial.checked, 'SHOW_PARENT', index)).toEqual([key(['p', 'a'])]);
    expect(cascaderStrategy(complete.checked, 'SHOW_PARENT', index)).toEqual(['p']);
    expect(cascaderStrategy(complete.checked, 'SHOW_CHILD', index)).toEqual([
      key(['p', 'a']), key(['p', 'b'])
    ]);
  });

  it('preserves disabled and disableCheckbox boundaries during clean conduction', () => {
    const result = toggleCascader(
      ['p', 'a'], checks([['p'], ['p', 'locked'], ['p', 'checkbox']]), 'SHOW_PARENT', index
    );

    expect(result).toEqual([['p', 'locked'], ['p', 'checkbox'], ['p', 'b']]);
    expect(checks(result).half).toEqual(['p']);
  });

  it('removes missing values without changing remaining checks or publishing unknown nodes', () => {
    const result = toggleCascader(['missing'], checks([['missing'], ['p']]), 'SHOW_PARENT', index);

    expect(result).toEqual([['p']]);
    expect(toggleCascader(['p', 'a'], checks([['missing'], ['p']]), 'SHOW_CHILD', index)).toEqual([
      ['missing'], ['p', 'b']
    ]);
  });

  it('keeps disabled nodes in both strategies and uses any checked child for SHOW_CHILD', () => {
    const keys = ['p', key(['p', 'a']), 'q', key(['q', 'a'])];

    expect(cascaderStrategy(keys, 'SHOW_PARENT', index)).toEqual(['p', 'q', key(['q', 'a'])]);
    expect(cascaderStrategy(keys, 'SHOW_CHILD', index)).toEqual([
      key(['p', 'a']), 'q', key(['q', 'a'])
    ]);
  });

  it('uses full labels for single, leaf labels for multiple and raw missing cells as fallback', () => {
    const paths = [['p', 'a'], ['p', 'absent'], [0]];
    const single = cascaderDisplay(paths, options, fields, false);
    const multi = cascaderDisplay(paths, options, fields, true);

    expect(single.map(item => item.text)).toEqual(['Parent / Alpha', 'Parent / absent', 'Zero']);
    expect(multi.map(item => item.text)).toEqual(['Alpha', 'absent', 'Zero']);
    expect(cascaderDisplay([['q', 'a']], options, fields, true)[0].disabled).toBe(false);
    expect(cascaderDisplay([['p', 'locked']], options, fields, true)[0].disabled).toBe(true);
  });
});

describe('Cascader search', () => {
  it('matches any path label case-insensitively and propagates disabled ancestors', () => {
    const result = searchCascader('ALP', options, fields, {}, false);

    expect(result.map(row => row.path)).toEqual([['p', 'a'], ['q', 'a']]);
    expect(result.map(row => row.disabled)).toEqual([false, true]);
    expect(result[0].option).toBe(options[0].children![0]);
    expect(searchCascader('Parent', options, fields, {}, false)).toHaveLength(4);
  });

  it('includes parent matches only for changeOnSelect or multiple', () => {
    expect(searchCascader('Parent', options, fields, {}, true).map(row => row.path)).toEqual([
      ['p'], ['p', 'a'], ['p', 'b'], ['p', 'locked'], ['p', 'checkbox']
    ]);
    expect(searchCascader('', options, fields, {}, true)).toEqual([]);
  });

  it('keeps rendered labels opaque instead of searching Svelte render function source', () => {
    const label = createRawSnippet(() => ({ render: () => '<b>Rich label</b>' }));
    const rich = [{ value: 0, label }];

    expect(searchCascader('function', rich, fields, {}, false)).toEqual([]);
    expect(searchCascader('object', rich, fields, {}, false)[0].path).toEqual([0]);
    expect(searchCascader('rich', rich, fields, {}, false)).toEqual([]);
  });

  it('filters by children rather than isLeaf and visits custom fields in depth-first order', () => {
    const custom = [{ id: 0, name: 'Root', isLeaf: true, nodes: [{ id: 1, name: 'Leaf' }] }];
    const names = cascaderFields({ value: 'id', label: 'name', children: 'nodes' });
    const args: unknown[] = [];
    const result = searchCascader('x', custom, names, { filter: (search, path, fields) => {
      args.push([search, path.map(option => option.id), fields]);
      return true;
    } }, false);

    expect(args).toEqual([['x', [0, 1], { label: 'name' }]]);
    expect(result[0].path).toEqual([0, 1]);
    expect(searchCascader(
      'Lazy',
      [{ value: 'lazy', label: 'Lazy', isLeaf: false }],
      fields,
      {},
      false
    )[0]).toMatchObject({ path: ['lazy'], leaf: false });
  });

  it('limits traversal before sorting only when no comparator is supplied', () => {
    let calls = 0;
    const result = searchCascader('a', options, fields, {
      limit: 1, filter: () => { calls++; return true; }
    }, false);
    const sorted = searchCascader('a', options, fields, {
      limit: 1, filter: () => true,
      sort: (first, second, search, names) => {
        expect(search).toBe('a');
        expect(names).toEqual(fields);
        return String(second.at(-1)!.label).localeCompare(String(first.at(-1)!.label));
      }
    }, false);

    expect(calls).toBe(1);
    expect(result[0].path).toEqual(['p', 'a']);
    expect(sorted[0].path).toEqual([0]);
  });

  it.each([false, 0, -1] as const)('keeps every result for unlimited limit=%s', limit => {
    expect(searchCascader('a', options, fields, { filter: () => true, limit }, false))
      .toHaveLength(6);
  });

  it('defaults to fifty results and preserves original label case in every highlight', () => {
    const many = Array.from({ length: 60 }, (_, value) => ({ value, label: 'Alpha' }));

    expect(searchCascader('a', many, fields, {}, false)).toHaveLength(50);
    expect(cascaderHighlight('AlPHA alpha', 'alp')).toEqual([
      { text: '', match: false }, { text: 'AlP', match: true },
      { text: 'HA ', match: false }, { text: 'alp', match: true },
      { text: 'ha', match: false }
    ]);
    expect(cascaderHighlight(0, '')).toEqual([{ text: '0', match: false }]);
  });
});

describe('Cascader keyboard columns', () => {
  it('builds only active columns and identifies equal child values by full path', () => {
    const columns = cascaderColumns(options, ['p', 'a'], fields);

    expect(columns.map(column => column.map(row => row.path))).toEqual([
      [['p'], [0], ['q']], [['p', 'a'], ['p', 'b'], ['p', 'locked'], ['p', 'checkbox']]
    ]);
    expect(cascaderColumns(options, ['absent'], fields)).toHaveLength(1);
  });

  it('wraps vertically, starts Up from the last enabled row and skips disabled rows', () => {
    const columns = cascaderColumns(options, ['p'], fields);

    expect(navigateCascader(columns, [], 'ArrowUp', false)).toEqual({ path: [0] });
    expect(navigateCascader(columns, [0], 'ArrowDown', false)).toEqual({ path: ['p'] });
    expect(navigateCascader(columns, [], 'ArrowDown', false)).toEqual({ path: ['p'] });
    expect(navigateCascader([columns[0].slice(2)], [], 'ArrowDown', false)).toEqual({});
  });

  it('enters enabled children, returns to parents and reverses arrows in RTL', () => {
    const columns = cascaderColumns(options, ['p', 'a'], fields);

    expect(navigateCascader(columns, ['p'], 'ArrowRight', false)).toEqual({ path: ['p', 'a'] });
    expect(navigateCascader(columns, ['p'], 'ArrowLeft', true)).toEqual({ path: ['p', 'a'] });
    expect(navigateCascader(columns, ['p', 'a'], 'ArrowLeft', false)).toEqual({ path: ['p'] });
    expect(navigateCascader(columns, ['p'], 'Backspace', false)).toEqual({ close: true });
  });

  it('keeps navigation within search results and ignores horizontal arrows and Backspace', () => {
    const rows = searchCascader('Alpha', options, fields, {}, false);

    expect(navigateCascader([rows], [], 'ArrowDown', false, null)).toEqual({
      searchKey: key(['p', 'a'])
    });
    expect(navigateCascader([rows], [], 'ArrowDown', false, rows[0].key)).toEqual({
      searchKey: rows[0].key
    });
    expect(navigateCascader([rows], [], 'Backspace', false, rows[0].key)).toEqual({});
    expect(navigateCascader([rows], [], 'ArrowRight', false, rows[0].key)).toEqual({});
  });

  it('merges semantic popup aliases and preserves CSS override order', () => {
    const result = mergeCascaderSlots([
      { root: 'color:red', popup: 'padding:1px' },
      { root: 'color:blue', popup: { root: 'padding:2px', listItem: 'color:green' } }
    ], ';');

    expect(result.root).toBe('color:red;color:blue');
    expect(result.popup.root).toBe('padding:1px;padding:2px');
    expect(result.popup.listItem).toBe('color:green');
  });
});
