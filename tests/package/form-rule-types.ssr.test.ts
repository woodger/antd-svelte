import { createForm, type ValidationRule, type ValidationRuleType } from 'antd-svelte';
import registry from 'antd-svelte/porting/registry.json';
import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import reference from '../browser/fixtures/ant-design-form-rule-types-reference.json';
import FormRuleTypesFixtures from '../browser/fixtures/FormRuleTypesFixtures.svelte';

describe('Form primitive rule types public package', () => {
  it('pins source classifications and recorded primitive conversion diagnostics', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version, revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256
    });
    expect(reference.cases.find(({ sample }) => sample.id === 'integer-large-integer')?.valid)
      .toBe(false);
    expect(reference.cases.find(({ sample }) => sample.id === 'float-large-integer')?.valid)
      .toBe(true);
    expect(reference.diagnostics.some(message => message.includes('Cannot convert a BigInt')))
      .toBe(true);
  });

  it('publishes primitive type declarations and does not validate during SSR', () => {
    const type: ValidationRuleType = 'date';
    const rule: ValidationRule = { type };
    const body = render(FormRuleTypesFixtures).body;

    expect(rule.type).toBe('date');
    expect(body).toContain('value="abc"');
    expect(body).toContain('name="field"');
    expect(body).not.toContain('ant-form-item-explain-error');
  });

  it('classifies scientific-notation integers without parseInt rounding', async () => {
    const form = createForm({ initialValues: { field: 1e21 }, rules: { field: [{ type: 'integer' }] } });

    await expect(form.validateFields()).resolves.toEqual({ field: 1e21 });
    expect(form.getFieldError('field')).toEqual([]);
  });
});
