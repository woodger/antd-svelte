import { createForm, type ValidationRule } from 'antd-svelte';
import registry from 'antd-svelte/porting/registry.json';
import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import reference from '../browser/fixtures/ant-design-form-nested-rules-reference.json';
import FormNestedRulesFixtures from '../browser/fixtures/FormNestedRulesFixtures.svelte';

describe('Form nested rules public package', () => {
  it('pins source ignored child warnings and sparse default-field acceptance', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version, revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256
    });
    expect(reference.cases.find(({ sample }) => sample.id === 'object-child-warning'))
      .toMatchObject({ valid: false, errors: ['Warn'], warnings: [] });
    expect(reference.cases.find(({ sample }) => sample.id === 'array-sparse')?.valid).toBe(true);
    expect(reference.diagnostics.some(message => message.includes('push is not a function'))).toBe(true);
  });

  it('publishes readonly named child rules and default fields without SSR validation', () => {
    const rule: ValidationRule = { type: 'object', fields: Object.freeze({
      name: Object.freeze([{ required: true }])
    }), defaultField: { type: 'string' } };
    const body = render(FormNestedRulesFixtures).body;

    expect(rule.fields?.name).toEqual([{ required: true }]);
    expect(body).toContain('name="field"');
    expect(body).not.toContain('ant-form-item-explain-error');
  });

  it('returns nested warnings without blocking public model submission', async () => {
    const form = createForm({
      initialValues: { field: { name: '' } },
      rules: { field: [{ type: 'object', fields: {
        name: { required: true, warningOnly: true, message: 'Warn' }
      } }] }
    });

    await expect(form.submit(() => {})).resolves.toEqual({ status: 'success' });
    expect(form.getFieldWarning('field')).toEqual(['Warn']);
    expect(form.getFieldError('field')).toEqual([]);
  });
});
