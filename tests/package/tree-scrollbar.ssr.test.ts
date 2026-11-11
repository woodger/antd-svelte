import { render } from 'svelte/server';
import { expect, it, vi } from 'vitest';
import registry from 'antd-svelte/porting/registry.json';
import TreeScrollbarFixtures from '../browser/fixtures/TreeScrollbarFixtures.svelte';
import reference from '../browser/fixtures/ant-design-tree-scrollbar-reference.json';
it('pins inherited TreeSelect no-op behavior and keeps a sensitive Select positive control', () => {
  expect(reference.reference).toMatchObject({ version: registry.upstream.version, revision: registry.upstream.revision,
    archiveSha256: registry.upstream.archiveSha256, select: '1.10.1', treeSelect: '1.16.1', tree: '1.4.0',
    virtualList: '1.5.1', errors: [] });
  expect(reference.cases).toHaveLength(14);
  expect(reference.cases.reduce((count, entry) => count + entry.steps.length, 0)).toBe(111);
  const find = (id: string) => reference.cases.find(entry => entry.id === id)!;
  for (const id of ['tree-select-true', 'tree-select-false', 'tree-select-optional']) {
    expect(find(id).initial).toEqual(find('tree-select-default').initial);
    expect(find(id).steps).toEqual(find('tree-select-default').steps);
  }
  expect(find('select-true').steps.find(step => step.action === 'idle')!.view.bar?.visible).toBe('visible');
  expect(find('select-false').initial.bar?.visible).toBe('hidden');
  expect(find('select-false').steps.find(step => step.action === 'hover')!.view.bar?.visible).toBe('hidden');
  expect(find('select-optional').steps.find(step => step.action === 'idle')!.view.bar?.visible).toBe('hidden');
});
it.each(reference.ssr)('consumes $id during SSR without leaking attributes or scheduling work', entry => {
  vi.useFakeTimers();
  try {
    const { body } = render(TreeScrollbarFixtures, { props: { initialSample: entry.id } });
    expect(body).not.toMatch(/\sshowscrollbar(?:=|\s|>)/i);
    expect(body).toContain('data-tree-scrollbar-ref="false"');
    expect(body).toMatch(/popover="manual" hidden(?: |>|=)/);
    // Native retains the existing estimated hidden popup; Source suppresses portals in SSR.
    expect([...body.matchAll(/role="treeitem"/g)]).toHaveLength(entry.id.includes('nonvirtual') ? 64 : entry.id.endsWith('fit') ? 2 : 5);
    expect(entry).toMatchObject({ hasPopup: false, timers: 0, propLeaked: false });
    expect(vi.getTimerCount()).toBe(0);
  } finally { vi.useRealTimers(); }
});
