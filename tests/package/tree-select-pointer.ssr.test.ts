import { render } from 'svelte/server';
import { expect, it, vi } from 'vitest';
import registry from 'antd-svelte/porting/registry.json';
import TreeSelectPointerCase from '../browser/fixtures/TreeSelectPointerCase.svelte';
import { treeSelectPointerSamples } from '../browser/fixtures/tree-select-pointer-cases';
import reference from '../browser/fixtures/ant-design-tree-select-pointer-reference.json';

it('pins independent mouse and touch pointer captures without masking callback order', () => {
  expect(reference.reference).toMatchObject({ version: registry.upstream.version,
    revision: registry.upstream.revision, archiveSha256: registry.upstream.archiveSha256, errors: [], warnings: [] });
  expect(reference.cases.map(entry => entry.id)).toEqual(treeSelectPointerSamples.map(sample => sample.id));
  expect(reference.cases.reduce((count, entry) => count + entry.steps.length, 0)).toBe(354);
  expect(reference.cases.every(entry => entry.steps.every(step => step.sameInput))).toBe(true);
});
it.each(reference.ssr)('renders $id without browser resources or pointer side effects', entry => {
  vi.useFakeTimers();
  try {
    const sample = treeSelectPointerSamples.find(sample => sample.id === entry.id)!;
    const { body } = render(TreeSelectPointerCase, { props: { sample } });
    const input = /<input(?=[^>]*data-ant-tree-choice-input)[^>]*>/.exec(body)![0];
    // Native retains the existing open flag and hidden SSR shell. Source useOpen
    // suppresses the initial server flag; the raw Source record remains false.
    const nativeOpen = Boolean((sample.controlled?.endsWith('-open') || sample.defaultOpen) && !sample.disabled);
    expect(entry.view.open).toBe(false);
    expect(input).toContain(`aria-expanded="${nativeOpen}"`);
    if (nativeOpen) expect(body).toMatch(/<div(?=[^>]*popover="manual")(?=[^>]*\bhidden(?:[=\s>]))[^>]*>/);
    expect(input.includes(' readonly')).toBe(entry.view.readonly);
    expect(input.includes(' disabled')).toBe(entry.view.disabled);
    const events = /<output(?=[^>]*\bdata-pointer-events(?:[=\s>]))[^>]*>([\s\S]*?)<\/output>/.exec(body);
    expect(events).not.toBeNull();
    expect(events![0]).toMatch(/\bhidden(?:[=\s>])/);
    expect(events![1].replace(/<!--[\s\S]*?-->/g, '')).toBe('[]');
    expect(body).toContain('data-pointer-label');
    expect(body).toContain('data-pointer-prefix');
    expect(body).toContain('data-pointer-suffix');
    expect(entry.view.events).toEqual([]);
    expect(entry.timers).toBe(0);
    expect(vi.getTimerCount()).toBe(0);
  } finally { vi.useRealTimers(); }
});
