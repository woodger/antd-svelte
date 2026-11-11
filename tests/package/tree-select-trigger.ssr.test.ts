import { render } from 'svelte/server';
import { expect, it, vi } from 'vitest';
import { TreeSelect } from 'antd-svelte';
import registry from 'antd-svelte/porting/registry.json';
import TreeSelectTriggerCase from '../browser/fixtures/TreeSelectTriggerCase.svelte';
import { treeSelectTriggerSamples } from '../browser/fixtures/tree-select-trigger-cases';
import reference from '../browser/fixtures/ant-design-tree-select-trigger-reference.json';

it('pins the independent Source trigger captures and the Space callback observation', () => {
  expect(reference.reference).toMatchObject({ version: registry.upstream.version,
    revision: registry.upstream.revision, archiveSha256: registry.upstream.archiveSha256,
    select: '1.10.1', errors: [], warnings: [] });
  expect(reference.cases).toHaveLength(21);
  expect(reference.cases.reduce((sum, entry) => sum + entry.steps.length, 0)).toBe(99);
  expect(reference.ssr).toHaveLength(6);
  expect(reference.observations.map(entry => entry.id)).toEqual(['readonly-space']);
});

it.each(reference.ssr)('renders $id input attributes without focusing, calling handlers or scheduling timers', entry => {
  vi.useFakeTimers();
  try {
    const sample = treeSelectTriggerSamples.find(item => item.id === entry.id)!;
    const { body } = render(TreeSelectTriggerCase, { props: { sample } });
    const input = /<input[^>]*role="combobox"[^>]*>/.exec(body)![0];
    expect(input.includes('autofocus')).toBe(entry.autofocus);
    expect(input.includes('disabled')).toBe(entry.view.disabled);
    if (entry.view.tabIndex !== null) expect(input).toContain(`tabindex="${entry.view.tabIndex}"`);
    expect(input).not.toContain('maxlength');
    expect(body).toMatch(/data-trigger-events[^>]*>\[\]<\/output>/);
    expect(body).toMatch(/data-trigger-native-events[^>]*>\[\]<\/output>/);
    expect(body.includes('popover="manual" hidden')).toBe(Boolean(sample.defaultOpen));
    expect(entry.timers).toBe(0);
    expect(vi.getTimerCount()).toBe(0);
  } finally { vi.useRealTimers(); }
});

it('preserves explicit native autofocus, tabindex and maxlength over Source aliases at SSR', () => {
  const { body } = render(TreeSelect, { props: { autoFocus: true, autofocus: false,
    tabIndex: 3, tabindex: 7, maxLength: 5, maxlength: 2, showAction: ['focus'] } });
  const input = /<input[^>]*role="combobox"[^>]*>/.exec(body)![0];
  expect(input).toContain('tabindex="7"');
  expect(input).toContain('maxlength="2"');
  expect(input).not.toContain('autofocus');
  expect(input).not.toContain('showAction');
  expect(input).not.toContain('maxLength');
});
