import { render } from 'svelte/server';
import { expect, it, vi } from 'vitest';
import registry from 'antd-svelte/porting/registry.json';
import reference from '../browser/fixtures/ant-design-tree-select-input-responsive-reference.json';
import TreeSelectInputResponsiveCase from '../browser/fixtures/TreeSelectInputResponsiveCase.svelte';
import { treeSelectInputResponsiveSamples } from '../browser/fixtures/tree-select-input-responsive-cases';

it('pins Source suffix reservation including textarea, wrapped DOM refs, fragments and live prefix growth', () => {
  expect(reference.reference).toMatchObject({ version: registry.upstream.version, revision: registry.upstream.revision,
    archiveSha256: registry.upstream.archiveSha256, errors: [], warnings: [], serverMessages: [] });
  expect(reference.cases.map(entry => entry.id)).toEqual(treeSelectInputResponsiveSamples.map(sample => sample.id));
  expect(reference.cases).toHaveLength(5);
  expect(reference.cases.reduce((count, entry) => count + entry.steps.length, 0)).toBe(28);
  expect(reference.ssr).toHaveLength(5);
  expect(reference.cases.find(entry => entry.id === 'textarea')!.steps[1].view.visible).toEqual(['a']);
  for (const id of ['wrapped-dom-ref', 'composite-ref', 'fragment']) {
    const entry = reference.cases.find(entry => entry.id === id)!;
    expect(entry.steps[0].view).toMatchObject({ visible: ['a'], prefixWidth: 64, editorWidth: 4 });
    expect(entry.steps.at(-1)!.view).toMatchObject({ visible: ['a'], prefixWidth: 96, hostWidth: 260 });
  }
});
it.each(reference.ssr)('renders responsive $id without measuring or registering DOM on the server', entry => {
  vi.useFakeTimers();
  try {
    const sample = treeSelectInputResponsiveSamples.find(sample => sample.id === entry.id)!;
    const { body } = render(TreeSelectInputResponsiveCase, { props: { sample } });
    const field = body.match(/<(input|textarea)\b[^>]*data-input-responsive-editor[^>]*>/)!;
    expect(field[1].toUpperCase()).toBe(entry.view.tag);
    expect(field[0]).not.toContain('--select-input-width');
    expect(body).toContain('data-input-responsive-bound="false"');
    // Native сохраняет существующий SSR shell с четырьмя hidden measuring tags;
    // Source Overflow создаёт их после client layout. Responsive выбор проверяет browser.
    expect([...body.matchAll(/data-input-responsive-tag="/g)]).toHaveLength(4);
    expect(entry.view.renderedTags).toBe(0);
    expect(entry.view.query).toBe('');
    expect(entry.view.variable).toBe('');
    expect(entry.timers).toBe(0);
    expect(vi.getTimerCount()).toBe(0);
  } finally { vi.useRealTimers(); }
});
