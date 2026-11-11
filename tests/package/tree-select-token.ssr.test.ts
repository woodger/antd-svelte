import { render } from 'svelte/server';
import { expect, it, vi } from 'vitest';
import registry from 'antd-svelte/porting/registry.json';
import TreeSelectTokenCase from '../browser/fixtures/TreeSelectTokenCase.svelte';
import { treeSelectTokenSamples } from '../browser/fixtures/tree-select-token-cases';
import reference from '../browser/fixtures/ant-design-tree-select-token-reference.json';

it('pins independent token search captures including full-count search and functional splitter effects', () => {
  expect(reference.reference).toMatchObject({ version: registry.upstream.version,
    revision: registry.upstream.revision, archiveSha256: registry.upstream.archiveSha256, errors: [], warnings: [] });
  expect(reference.cases.map(entry => entry.id)).toEqual(treeSelectTokenSamples.map(sample => sample.id));
  expect(reference.cases).toHaveLength(23);
  expect(reference.cases.reduce((count, entry) => count + entry.steps.length, 0)).toBe(56);
  expect(reference.ssr).toHaveLength(5);
  const full = reference.cases.find(entry => entry.id === 'count-full')!;
  expect(full.steps.at(-1)!.view.events).toContainEqual(['split', 'Beta,Alpha']);
  expect(full.steps.at(-1)!.view.value).toEqual(['a']);
  expect(reference.cases.find(entry => entry.id === 'functional-csv')!.initial.events).toEqual([['split', '']]);
});
it.each(reference.ssr)('renders $id without token callbacks, browser globals or timers', entry => {
  vi.useFakeTimers();
  try {
    const sample = treeSelectTokenSamples.find(sample => sample.id === entry.id)!;
    const { body } = render(TreeSelectTokenCase, { props: { sample } });
    expect(body).toContain('data-token-events="">[]');
    expect(body).toContain(`data-token-values="">${JSON.stringify(entry.view.value)}`);
    expect(body).toContain('aria-expanded="false"');
    expect(body).toContain('data-tree-select-token-refs="false"');
    expect(body).not.toContain('popover="manual"');
    expect(entry.timers).toBe(0);
    expect(vi.getTimerCount()).toBe(0);
  } finally { vi.useRealTimers(); }
});
