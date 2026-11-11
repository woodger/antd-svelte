import { render } from 'svelte/server';
import { expect, it, vi } from 'vitest';
import registry from 'antd-svelte/porting/registry.json';
import TreeSelectComponentsFormCase from '../browser/fixtures/TreeSelectComponentsFormCase.svelte';
import { treeSelectComponentsFormSamples } from '../browser/fixtures/tree-select-components-form-cases';
import reference from '../browser/fixtures/ant-design-tree-select-components-form-reference.json';

it('pins independent Form/TreeSelect/Input inheritance and query-independent selection', () => {
  expect(reference.reference).toMatchObject({ version: registry.upstream.version,
    revision: registry.upstream.revision, archiveSha256: registry.upstream.archiveSha256,
    select: '1.10.1', treeSelect: '1.16.1', errors: [], warnings: [], serverMessages: [] });
  expect(reference.cases.map(entry => entry.id)).toEqual(treeSelectComponentsFormSamples.map(sample => sample.id));
  expect(reference.cases).toHaveLength(2);
  expect(reference.cases.reduce((count, entry) => count + entry.steps.length, 0)).toBe(12);
  expect(reference.ssr).toHaveLength(2);
  for (const entry of reference.cases) {
    expect(entry.initial.view.model).toBe('a');
    expect(entry.initial.view.icons).toHaveLength(entry.id === 'input-composite' ? 2 : 1);
    expect(entry.initial.view.status).toMatchObject({ itemError: true, itemFeedback: true, inputError: true });
    expect(entry.initial.observed).toMatchObject({ nativeFormData: [], strictSourceRefIdentity: true, fieldErrors: [] });
    expect(entry.initial.view.aria).toEqual({ required: 'true', describedBy: 'choice_help', invalid: null });
    expect(entry.initial.view.help).toEqual([{ id: 'choice_help', text: 'Choice help' }]);
    expect(entry.steps.every(step => step.observed.fieldErrors.length === 0)).toBe(true);
    expect(entry.steps.filter(step => step.view.mounted)
      .every(step => JSON.stringify(step.observed.helpStyles) === JSON.stringify(entry.initial.observed.helpStyles))).toBe(true);
    expect(entry.steps.find(step => step.action === 'type-query')!.view.model).toBe('a');
    expect(entry.steps.find(step => step.action === 'select-beta')!.view.model).toBe('b');
    expect(entry.steps.at(-1)!.view.association.present).toBe(false);
  }
});

it.each(reference.ssr)('renders $id with inherited feedback and only the Native raw successful field', entry => {
  vi.useFakeTimers();
  try {
    const sample = treeSelectComponentsFormSamples.find(sample => sample.id === entry.id)!;
    const { body } = render(TreeSelectComponentsFormCase, { props: { sample } });
    const inputs = [...body.matchAll(/<input\b[^>]*>/g)].map(match => match[0]);
    const hidden = inputs.filter(tag => /\btype="hidden"/.test(tag));
    const editor = inputs.find(tag => /\bdata-form-components-editor(?:[=\s>])/.test(tag))!;
    expect(editor).toBeDefined();
    expect(editor).not.toMatch(/\sname=/);
    if (entry.view.id) expect(editor).toContain(`id="${entry.view.id}"`);
    else expect(editor).not.toMatch(/\sid=/);
    expect(editor).toContain(`aria-required="${entry.view.aria.required}"`);
    expect(entry.view.aria.describedBy).toBe('choice_help');
    expect(editor).toContain('aria-describedby="choice-help"');
    // Существующий Native Input отражает status в ARIA у обоих composite slots.
    expect(entry.view.aria.invalid).toBeNull();
    expect(editor).toContain('aria-invalid="true"');
    expect(entry.fieldErrors).toEqual([]);
    // Source создаёт help DOM только на клиенте; Native сохраняет SSR help.
    expect(entry.view.help).toEqual([]);
    expect(body).toContain('id="choice-help"');
    expect(body).toContain('Choice help');
    expect(hidden).toHaveLength(1);
    expect(hidden[0]).toMatch(/\bname="choice"/);
    expect(hidden[0]).toMatch(/\bvalue="a"/);
    expect(entry.nativeFormData).toEqual([]);
    expect(entry.view.model).toBe('a');
    expect(entry.timers).toBe(0);
    const feedback = [...body.matchAll(/<span\b[^>]*class="[^"]*\bant-form-item-feedback-icon\b[^"]*"[^>]*>/g)];
    expect(feedback).toHaveLength(entry.view.icons.length);
    for (const icon of entry.view.icons) for (const path of icon.paths) expect(body).toContain(`d="${path}"`);
    expect(body).toContain('ant-form-item-has-error');
    expect(body).toContain('ant-input-status-error');
    const output = (name: string) => new RegExp(`<output[^>]*data-form-components-${name}[^>]*>([\\s\\S]*?)<\\/output>`)
      .exec(body)![1].replace(/<!--[\s\S]*?-->/g, '');
    expect(output('model')).toBe('"a"');
    expect(output('events')).toBe('[]');
    expect(JSON.parse(output('association'))).toEqual(entry.view.association);
    expect(output('native-refs')).toBe('{"root":null,"input":null}');
    expect(body).not.toContain('popover="manual"');
    expect(vi.getTimerCount()).toBe(0);
  } finally { vi.useRealTimers(); }
});
