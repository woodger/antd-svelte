import type { ValidationRule, ValidationRuleType } from 'antd-svelte';
import registry from 'antd-svelte/porting/registry.json';
import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import reference from '../browser/fixtures/ant-design-form-rule-formats-reference.json';
import FormRuleFormatsFixtures from '../browser/fixtures/FormRuleFormatsFixtures.svelte';

describe('Form format rule types public package', () => {
  it('pins source URL mismatches and malformed pattern diagnostics', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version, revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256
    });
    expect(reference.cases.find(({ sample }) => sample.id === 'url-format-5'))
      .toMatchObject({ sample: { value: 'http://[::1]' }, valid: false });
    expect(reference.cases.find(({ sample }) => sample.id === 'url-format-8'))
      .toMatchObject({ sample: { value: 'http://example.com:99999' }, valid: true });
    expect(reference.diagnostics.some(message => message.includes('Invalid regular expression')))
      .toBe(true);
    expect(reference.reactDeclarations.typeValues).toHaveLength(15);
    expect(reference.reactDeclarations.typeValues).not.toContain('pattern');
    expect(reference.reactDeclarations.pattern).toBe('RegExp');
  });

  it('publishes the complete type union, enum and string patterns without SSR validation', () => {
    const formats: ValidationRuleType[] = ['email', 'url', 'hex', 'tel', 'enum', 'pattern'];
    const rules: ValidationRule[] = [
      { type: 'enum', enum: Object.freeze([0, false]) }, { pattern: '^abc$' }
    ];
    const body = render(FormRuleFormatsFixtures).body;

    expect(formats).toHaveLength(6);
    expect(rules[0].enum).toEqual([0, false]);
    expect(body).toContain('value="user@example.com"');
    expect(body).not.toContain('ant-form-item-explain-error');
  });
});
