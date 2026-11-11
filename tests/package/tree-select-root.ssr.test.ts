import { render } from 'svelte/server';
import { expect, it, vi } from 'vitest';
import registry from 'antd-svelte/porting/registry.json';
import { treeSelectRootSamples } from '../browser/fixtures/tree-select-root-cases';
import reference from '../browser/fixtures/ant-design-tree-select-root-reference.json';
import TreeSelectRootCase from '../browser/fixtures/TreeSelectRootCase.svelte';
import TreeSelectRootLifecycle from '../browser/fixtures/TreeSelectRootLifecycle.svelte';

it('pins the independent Source root replacements and filtered received props', () => {
  expect(reference.reference).toMatchObject({ version: registry.upstream.version,
    revision: registry.upstream.revision, archiveSha256: registry.upstream.archiveSha256,
    select: '1.10.1', treeSelect: '1.16.1', errors: [], warnings: [] });
  expect(reference.cases.map(entry => entry.id)).toEqual(treeSelectRootSamples.map(sample => sample.id));
  expect(reference.cases.reduce((count, entry) => count + entry.steps.length, 0)).toBe(112);
  expect(reference.cases.every(entry => entry.steps.every(step => step.sameField !== false))).toBe(true);
  const component = reference.cases.find(entry => entry.id === 'component-button')!;
  expect(Object.keys(component.received!).sort()).toEqual([
    'title', 'name', 'data-root-probe', 'data-collision', 'aria-label',
    'onClick', 'onFocus', 'onBlur', 'onKeyDown', 'onKeyUp'
  ].sort());
  expect(reference.cases.every(entry => entry.initial.generatedEditorCount === 0
    && entry.initial.generatedContentCount === 0 && entry.initial.clearCount === 0
    && entry.initial.prefixCount === 0 && entry.initial.suffixCount === 0
    && entry.initial.inertInputCount === 0 && !entry.initial.generatedRootClass)).toBe(true);
});

it('preserves the raw Source callback chain after cancellation and custom root disabled requests', () => {
  const prevented = reference.cases.find(entry => entry.id === 'generated-prevent')!;
  expect(prevented.steps[0].view.events.slice(-2)).toEqual([
    ['generated:click', 'BUTTON', true, 'BUTTON', null],
    ['own:click', 'BUTTON', true, 'BUTTON', null]
  ]);
  const disabled = reference.cases.find(entry => entry.id === 'disabled-button')!;
  expect(disabled.initial.disabled).toBe(false);
  expect(disabled.steps[0].view.open).toBe(false);
  expect(disabled.steps[0].view.events).toEqual([
    ['open', true], ['generated:click', 'BUTTON', false, 'BUTTON', null]
  ]);
});

it('captures every Source root server shape without refs, callbacks or browser resources', () => {
  expect(reference.ssr.map(entry => entry.id)).toEqual(treeSelectRootSamples.map(sample => sample.id));
  expect(reference.ssr.every(entry => !entry.view.open && !entry.view.focused
    && entry.view.events.length === 0 && entry.timers === 0
    && entry.view.refs.nativeTag === null && entry.view.refs.ownTag === null
    && !entry.view.refs.focus && !entry.view.refs.blur)).toBe(true);
});

it.each(reference.ssr)('renders $id root replacement without default content or browser resources', entry => {
  vi.useFakeTimers();
  try {
    const sample = treeSelectRootSamples.find(sample => sample.id === entry.id)!;
    const { body } = render(TreeSelectRootCase, { props: { sample } });
    const field = /<(?:input|button|div)\b(?=[^>]*\bdata-root-probe="control")[^>]*>/.exec(body)![0];
    expect(field).toBeDefined();
    expect(field.startsWith(`<${entry.view.fieldTag!.toLowerCase()}`)).toBe(true);
    for (const [key, value] of Object.entries(entry.view.fieldAttrs!)) {
      if (value !== null) expect(field).toContain(`${key}="${value}"`);
      else expect(field).not.toMatch(new RegExp(`\\s${key}(?:=|\\s|>)`));
    }
    expect(/\sdisabled(?:=|\s|>)/.test(field)).toBe(entry.view.disabled === true);
    expect(/\sreadonly(?:=|\s|>)/.test(field)).toBe(entry.view.readonly === true);
    if (entry.view.value) expect(field).toContain(`value="${entry.view.value}"`);
    expect(/<(?:input|b)[^>]*(?:data-root-inert-input|data-root-generated-prefix|data-root-generated-suffix)/.test(body)).toBe(false);
    expect(/<[^>]*\bclass="[^"]*\bant-select-content\b/.test(body)).toBe(false);
    const events = /<output(?=[^>]*\bdata-root-events(?:[=\s>]))[^>]*>([\s\S]*?)<\/output>/.exec(body)!;
    expect(events[1].replace(/<!--[\s\S]*?-->/g, '')).toBe('[]');
    const refs = /<output(?=[^>]*\bdata-root-refs(?:[=\s>]))[^>]*>([\s\S]*?)<\/output>/.exec(body)!;
    expect(JSON.parse(refs[1].replace(/<!--[\s\S]*?-->/g, ''))).toEqual(entry.view.refs);
    // Native сохраняет запрошенный SSR open и скрытый popup shell;
    // Source useOpen выключает серверный флаг. Оба наблюдения отражены явно.
    const nativeOpen = Boolean((sample.defaultOpen || sample.controlled?.endsWith('-open')) && !sample.disabled);
    expect(/<div(?=[^>]*popover="manual")(?=[^>]*\bhidden(?:[=\s>]))[^>]*>/.test(body)).toBe(nativeOpen);
    expect(vi.getTimerCount()).toBe(0);
  } finally { vi.useRealTimers(); }
});

it('renders the live root with its selected hidden form value and empty DOM bindings', () => {
  const { body } = render(TreeSelectRootLifecycle);
  expect(/<input(?=[^>]*type="hidden")(?=[^>]*name="root-choice")(?=[^>]*value="a")[^>]*>/.test(body)).toBe(true);
  expect(body.includes('Custom response')).toBe(true);
  const refs = /<output(?=[^>]*\bdata-root-life-refs(?:[=\s>]))[^>]*>([\s\S]*?)<\/output>/.exec(body)!;
  expect(refs[1].replace(/<!--[\s\S]*?-->/g, '')).toBe('{"native":null,"input":null}');
});
