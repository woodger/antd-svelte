import { describe, expect, it } from 'vitest';
import { validateFieldValue, validateValue } from './validation.engine';
import { createForm } from './form.model.svelte';
import reference from '../../tests/browser/fixtures/ant-design-form-rule-formats-reference.json';
import {
  formRuleFormatsValue, formRuleFormatsRule, formRuleFormatsCorrections
} from '../../tests/browser/fixtures/form-rule-formats-cases';

describe('Form format, enum and pattern validation rules', () => {
  for (const entry of reference.cases) {
    it(`validates source format behavior for ${entry.sample.id}`, async () => {
      const valid = formRuleFormatsCorrections[entry.sample.id] ?? entry.valid;

      expect(await validateFieldValue(formRuleFormatsValue(entry.sample), {}, [
        formRuleFormatsRule(entry.sample)
      ])).toEqual({ errors: valid ? [] : ['Rejected'], warnings: entry.warnings });
    });
  }

  it('matches enum primitives strictly without mutating caller-owned choices', async () => {
    const choices = Object.freeze([0, false, 'abc']);

    expect(await validateValue(0, {}, [{ type: 'enum', enum: choices }])).toEqual([]);
    expect(await validateValue(false, {}, [{ type: 'enum', enum: choices }])).toEqual([]);
    expect(await validateValue('0', {}, [{ type: 'enum', enum: choices, message: 'Not included' }]))
      .toEqual(['Not included']);
    expect(choices).toEqual([0, false, 'abc']);
    expect(await validateValue(NaN, {}, [{ type: 'enum', enum: [NaN], message: 'Not included' }]))
      .toEqual(['Not included']);
  });

  it('does not turn enum into a constraint without the explicit enum type', async () => {
    expect(await validateValue('abc', {}, [{ enum: ['other'] }])).toEqual([]);
    expect(await validateValue('abc', {}, [{ type: 'enum' }]))
      .toEqual(['Недопустимое значение.']);
  });

  it('keeps global RegExp state intact and reports malformed string expressions as validation errors', async () => {
    const pattern = /^abc$/g;
    pattern.lastIndex = 2;

    for (let index = 0; index < 2; index++) {
      expect(await validateValue('abc', {}, [{ type: 'pattern', pattern }])).toEqual([]);
    }
    expect(pattern.lastIndex).toBe(2);
    expect(await validateValue('abc', {}, [{ pattern: '[', message: 'Bad pattern' }]))
      .toEqual(['Bad pattern']);
    expect(await validateValue(Symbol('abc'), {}, [{ type: 'pattern', pattern: 'abc' }]))
      .toEqual(['Проверьте формат значения.']);
  });

  it('validates IPv6 and numeric ports without requiring two port digits', async () => {
    for (const value of ['http://[::1]', 'https://[2001:db8::1]:65535/a',
      '//[::1]:0', 'http://example.com:1', 'http://example.com:000080']) {
      expect(await validateValue(value, {}, [{ type: 'url' }])).toEqual([]);
    }
    for (const value of ['http://::1', 'http://[::zzz]', 'http://example.com:65536',
      'http://localhost:99999']) {
      expect(await validateValue(value, {}, [{ type: 'url', message: 'Invalid URL' }]))
        .toEqual(['Invalid URL']);
    }
  });

  it('applies transforms and warning-only format validation without replacing the store', async () => {
    const form = createForm({
      initialValues: { field: ' user@example.com ' },
      rules: { field: [{ type: 'email', transform: value => String(value).trim() }] }
    });
    await expect(form.validateFields()).resolves.toEqual({ field: ' user@example.com ' });
    expect(form.values.field).toBe(' user@example.com ');
    expect(await validateFieldValue('bad', {}, [{ type: 'url', warningOnly: true, message: 'Check URL' }]))
      .toEqual({ errors: [], warnings: ['Check URL'] });
  });
});
