import type { ValidationRule } from 'antd-svelte';
import registry from 'antd-svelte/porting/registry.json';
import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import reference from '../browser/fixtures/ant-design-form-transform-reference.json';
import FormTransformFixtures from '../browser/fixtures/FormTransformFixtures.svelte';

describe('Form transform public package', () => {
  it('pins per-rule source transforms and the recorded exception validation defect', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version, revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256
    });
    expect(reference.cases.find(({ sample }) => sample.id === 'transform-throw'))
      .toMatchObject({ valid: true, errors: [] });
    expect(reference.cases.find(({ sample }) => sample.id === 'transform-per-rule')?.calls)
      .toEqual([
        ['transform', ' raw '], ['first-validator', 'raw'],
        ['second-transform', ' raw '], ['second-validator', ' raw ']
      ]);
  });

  it('publishes synchronous transform without executing validation during SSR', () => {
    const rule: ValidationRule = { transform: value => String(value).trim() };
    const body = render(FormTransformFixtures).body;

    expect(rule.transform?.(' abc ')).toBe('abc');
    expect(body).toContain('value=" abc "');
    expect(body).toContain('"calls":[]');
    expect(body).not.toContain('Rejected');
  });
});
