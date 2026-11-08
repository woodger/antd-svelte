import type { FormItemProps } from 'antd-svelte';
import registry from 'antd-svelte/porting/registry.json';
import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import reference from '../browser/fixtures/ant-design-form-nameless-reference.json';
import FormNamelessFixtures from '../browser/fixtures/FormNamelessFixtures.svelte';

describe('Form nameless public package', () => {
  it('pins source absent ownership, required marks and control lifecycle', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version, revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256
    });
    expect(reference.cases[0].metrics).toMatchObject({ values: {}, instance: false, store: 'Model' });
    expect(reference.cases.find(({ sample }) => sample.id === 'required-mark')!.metrics)
      .toMatchObject({ label: { required: true }, input: { required: false, ariaRequired: null } });
    expect(reference.reset.same).toBe(true);
    expect(reference.named.same).toBe(false);
    expect(reference.unnamed.same).toBe(false);
  });

  it('publishes optional name and renders owner labels without generated field attributes', () => {
    const props: Omit<FormItemProps, 'children'> = { label: 'Caption' };
    const plain = render(FormNamelessFixtures).body;
    const manual = render(FormNamelessFixtures, { props: { initialCase: 'manual-label' } }).body;
    const tag = plain.match(/<input\b[^>]*>/)![0];

    expect(props.name).toBeUndefined();
    expect(tag).not.toMatch(/\s(?:name|id|required|aria-required|aria-describedby)=/);
    expect(plain).not.toMatch(/<label\b[^>]*\bfor=/);
    expect(manual).toContain('for="owner-input"');
    expect(manual).toContain('id="owner-input"');
  });
});
