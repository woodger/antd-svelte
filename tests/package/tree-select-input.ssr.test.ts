import { render } from 'svelte/server';
import { expect, it, vi } from 'vitest';
import registry from 'antd-svelte/porting/registry.json';
import TreeSelectInputCase from '../browser/fixtures/TreeSelectInputCase.svelte';
import { treeSelectInputSamples } from '../browser/fixtures/tree-select-input-cases';
import reference from '../browser/fixtures/ant-design-tree-select-input-reference.json';

it('pins independent custom input captures for refs, textarea navigation, own handlers and live props', () => {
  expect(reference.reference).toMatchObject({ version: registry.upstream.version,
    revision: registry.upstream.revision, archiveSha256: registry.upstream.archiveSha256,
    errors: [], warnings: [], serverMessages: [] });
  expect(reference.cases.map(entry => entry.id)).toEqual(treeSelectInputSamples.map(sample => sample.id));
  expect(reference.cases).toHaveLength(33);
  expect(reference.cases.reduce((count, entry) => count + entry.steps.length, 0)).toBe(144);
  expect(reference.ssr).toHaveLength(14);
  const component = reference.cases.find(entry => entry.id === 'component-input')!;
  expect(component.initial.props?.keys.some(key => key === 'key' || key === 'ref' || key === 'placeholder')).toBe(false);
  expect(component.initial.props?.callbacks).toEqual(['onBlur', 'onChange', 'onCompositionEnd', 'onCompositionStart', 'onKeyDown', 'onPaste']);
  expect(component.initial.view.label).toBe('Alpha');
  expect(component.initial.view.value).toBe('');
  const own = reference.cases.find(entry => entry.id === 'own-input-callbacks')!;
  expect(own.steps[1].view.events.slice(-4)).toEqual([
    ['own', 'keydown', '', 'ArrowDown', true], ['generated', 'inputkeydown', '', 'ArrowDown', true],
    ['open', true], ['generated', 'keydown', '', 'ArrowDown', true]
  ]);
  expect(reference.cases.find(entry => entry.id === 'intrinsic-textarea')!.steps[1].view.open).toBe(false);
  expect(reference.cases.find(entry => entry.id === 'composite-textarea')!.steps[1].view.open).toBe(true);
  const attrs = reference.cases.find(entry => entry.id === 'own-input-attrs')!.initial.view;
  expect(attrs).toMatchObject({ disabled: false, readonly: false, classes: ['own-input'], style: { backgroundColor: '' } });
  expect(reference.cases.every(entry => entry.initial.refs.nativeTag === 'DIV' && entry.initial.refs.nativeContainsEditor)).toBe(true);
  const uncontrolled = reference.cases.find(entry => entry.id === 'own-input-value-undefined')!;
  expect(uncontrolled.steps[2].view).toMatchObject({ value: 'Alpha,Beta', controlled: '', open: false });
  expect(reference.cases.find(entry => entry.id === 'own-input-value')!.steps[1].view.value).toBe('Own');
  for (const id of ['empty-label', 'blank-label']) {
    const entry = reference.cases.find(entry => entry.id === id)!;
    expect(entry.initial.view).toMatchObject({ selected: 'a', label: '', hasValue: false });
    expect(entry.steps.every(step => !step.view.hasValue)).toBe(true);
  }
});

it.each(reference.ssr)('renders custom $id with native attributes and no registration, callbacks or timers', entry => {
  vi.useFakeTimers();
  try {
    const sample = treeSelectInputSamples.find(sample => sample.id === entry.id)!;
    const { body } = render(TreeSelectInputCase, { props: { sample } });
    const opening = body.match(/<(input|textarea)\b[^>]*>/)!;
    expect(opening[1].toUpperCase()).toBe(entry.view.fieldTag);
    expect(opening[0]).toContain(`id="${entry.view.attrs.id}"`);
    expect(opening[0]).toContain(`role="${entry.view.attrs.role}"`);
    expect(opening[0]).toContain(`tabindex="${entry.view.attrs.tabindex}"`);
    expect(opening[0]).toContain(`aria-label="${entry.view.attrs['aria-label']}"`);
    expect(opening[0]).toContain(`autocomplete="${entry.view.attrs.autocomplete}"`);
    if (entry.view.fieldTag === 'INPUT') {
      if (entry.id === 'own-input-value-undefined') expect(opening[0]).not.toMatch(/\svalue=/);
      else expect(opening[0]).toContain(`value="${entry.view.value}"`);
    }
    expect(/\sreadonly(?:[\s=>]|$)/.test(opening[0])).toBe(entry.view.readonly);
    expect(/\sdisabled(?:[\s=>]|$)/.test(opening[0])).toBe(entry.view.disabled);
    const content = /<div\b[^>]*class="([^"]*\bant-select-content\b[^"]*)"[^>]*>/.exec(body)!;
    expect(content[1].split(/\s+/).includes('ant-select-content-has-value')).toBe(entry.view.hasValue);
    if (entry.view.attrs.placeholder !== null) expect(opening[0]).toContain(`placeholder="${entry.view.attrs.placeholder}"`);
    expect(body).toContain('data-input-events="">[]');
    expect(body).toContain('data-input-refs="false"');
    expect(body).toContain(`data-input-selected="">${JSON.stringify(entry.view.selected)}`);
    expect(body).toContain(`data-input-controlled="">${JSON.stringify(entry.view.controlled)}`);
    expect(body).not.toContain('popover="manual"');
    expect(entry.timers).toBe(0);
    expect(vi.getTimerCount()).toBe(0);
  } finally { vi.useRealTimers(); }
});
