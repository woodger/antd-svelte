import { createForm, type FormRule, type ValidationRuleFactory } from 'antd-svelte';
import registry from 'antd-svelte/porting/registry.json';
import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import reference from '../browser/fixtures/ant-design-form-rule-factories-reference.json';
import FormRuleFactoriesFixtures from '../browser/fixtures/FormRuleFactoriesFixtures.svelte';

describe('Form rule factories public package', () => {
  it('pins source dynamic settings and the internal context wrapper observation', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version, revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256
    });
    expect(reference.cases.find(entry => entry.sample.id === 'updated-minimum' && entry.phase === 'updated'))
      .toMatchObject({ valid: false, errors: ['Minimum'], factory: { minimum: 3 } });
    expect(reference.cases[0].factory.sameInstance).toBe(false);
  });

  it('publishes factory and mixed-rule types and preserves model identity', async () => {
    let received: unknown;
    const factory: ValidationRuleFactory<{ field: string }> = form => {
      received = form;
      return { min: form.values.field.length, message: 'Minimum' };
    };
    const rules: FormRule<{ field: string }>[] = [factory, { max: 3 }];
    const form = createForm({ initialValues: { field: 'abc' }, rules: { field: rules } });

    await expect(form.validateFields()).resolves.toEqual({ field: 'abc' });
    expect(received).toBe(form);
  });

  it('computes a local factory required mark before field registration during SSR', () => {
    const body = render(FormRuleFactoriesFixtures).body;
    const warning = render(FormRuleFactoriesFixtures, {
      props: { initialCase: 'required-warning' }
    }).body;

    expect(body).toContain('ant-form-item-required');
    expect(body.match(/<input[^>]*>/)?.[0]).toMatch(/required(?:[ =/>])/);
    expect(warning.match(/<input[^>]*>/)?.[0]).not.toMatch(/required(?:[ =/>])/);
    expect(body).not.toContain('ant-form-item-explain-error');
  });
});
