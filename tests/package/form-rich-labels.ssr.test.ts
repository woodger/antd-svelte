import type { Snippet } from 'svelte';
import { createRawSnippet } from 'svelte';
import type { FormItemProps, FormRequiredMark, FormRequiredMarkInfo, RenderEmptyContent } from 'antd-svelte';
import registry from 'antd-svelte/porting/registry.json';
import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import reference from '../browser/fixtures/ant-design-form-rich-labels-reference.json';
import FormRichLabelsFixtures from '../browser/fixtures/FormRichLabelsFixtures.svelte';

describe('Form rich labels public package', () => {
  it('pins source renderability, original renderer values and rich label reset', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version, revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256
    });
    expect(reference.cases.find(({ sample }) => sample.id === 'zero-custom')!.metrics.label)
      .toMatchObject({ text: '0!', title: null, kind: 'number' });
    expect(reference.cases.find(({ sample }) => sample.id === 'false-custom')!.metrics.label)
      .toBeNull();
    expect(reference.cases.find(({ sample }) => sample.id === 'array-custom')!.metrics.label)
      .toMatchObject({ text: '!', kind: 'array' });
    expect(reference.lifecycle.map(({ metrics }) => metrics.label.counter))
      .toEqual(['Counter 0', 'Counter 1', 'Counter 0']);
  });

  it('publishes rich labels while keeping legacy string renderers assignable', () => {
    const legacy: Snippet<[string, FormRequiredMarkInfo]> = createRawSnippet(() => ({
      render: () => '<span>Legacy mark</span>'
    }));
    const rich: Snippet<[RenderEmptyContent, FormRequiredMarkInfo]> = createRawSnippet(() => ({
      render: () => '<span>Rich mark</span>'
    }));
    const legacyMark: FormRequiredMark = legacy;
    const richMark: FormRequiredMark = rich;
    const props: Pick<FormItemProps, 'label'> = { label: [0, false, 'Name'] };
    const number = render(FormRichLabelsFixtures, { props: { initialCase: 'zero-custom' } }).body;
    const snippet = render(FormRichLabelsFixtures, { props: { initialCase: 'rich-custom' } }).body;
    const absent = render(FormRichLabelsFixtures, { props: { initialCase: 'false-custom' } }).body;

    expect(legacyMark).toBe(legacy);
    expect(richMark).toBe(rich);
    expect(props.label).toEqual([0, false, 'Name']);
    expect(number).toContain('data-label-kind="number"');
    expect(number).toContain('data-label-required="false"');
    expect(snippet).toContain('data-label-kind="rich"');
    expect(snippet.replace(/<!--[\s\S]*?-->/g, ''))
      .toMatch(/<strong\b[^>]*>Rich name:<\/strong>/);
    expect(absent).not.toMatch(/<label\b[^>]*\bfor=/);
    expect(absent).toContain('name="name"');
  });
});
