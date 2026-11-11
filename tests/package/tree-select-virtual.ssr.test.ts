import { render } from 'svelte/server';
import { expect, it, vi } from 'vitest';
import registry from 'antd-svelte/porting/registry.json';
import TreeSelectVirtualFixtures from '../browser/fixtures/TreeSelectVirtualFixtures.svelte';
import reference from '../browser/fixtures/ant-design-tree-select-virtual-reference.json';

it('pins the TreeSelect virtual list and DOM-free renders to the Source delegates', () => {
  expect(reference.reference).toMatchObject({
    version: registry.upstream.version, revision: registry.upstream.revision,
    archiveSha256: registry.upstream.archiveSha256,
    treeSelect: '1.16.1', tree: '1.4.0', select: '1.10.1', virtualList: '1.5.1', errors: []
  });
  expect(reference.ssr.map(entry => [entry.id, entry.hasPopup, entry.timers])).toEqual([
    ['default', false, 0], ['local-virtual-off', false, 0], ['zero-height', false, 0],
    ['theme-estimate', false, 0], ['retained-single', false, 0], ['custom-popup', false, 0]
  ]);
  const [hidden, inherited, empty] = reference.observations;
  expect(hidden).toMatchObject({ id: 'hidden-scroll', actionErrors: [] });
  expect(hidden.steps.at(-1)?.viewport).toMatchObject({ top: 280, first: 'Node 19', last: 'Node 24' });
  expect(inherited).toMatchObject({ id: 'provider-virtual-undefined', initial: { viewport: { count: 5 } } });
  expect(empty).toMatchObject({ id: 'empty-ref', actionErrors: [
    { name: 'TypeError', message: 'listRef.current?.scrollTo is not a function' }
  ] });
});

it.each([
  { id: 'default', count: 5 }, { id: 'local-virtual-off', count: 80 },
  { id: 'zero-height', count: 80 }, { id: 'theme-estimate', count: 4 },
  { id: 'retained-single', count: 0 }, { id: 'custom-popup', count: 5 }
])('renders the Native estimated server window for $id without scheduling work', ({ id, count }) => {
  vi.useFakeTimers();
  try {
    const { body } = render(TreeSelectVirtualFixtures, { props: { initialSample: id } });
    expect([...body.matchAll(/role="treeitem"/g)]).toHaveLength(count);
    expect(body).toContain('data-virtual-ref="false"');
    expect(body).toContain('data-virtual-scrolls="0"');
    expect(body).not.toContain('aria-activedescendant=');
    if (count) expect(body).toMatch(/popover="manual" hidden(?: |>|=)/);
    else expect(body).not.toContain('popover="manual"');
    expect(vi.getTimerCount()).toBe(0);
  } finally {
    vi.useRealTimers();
  }
});
