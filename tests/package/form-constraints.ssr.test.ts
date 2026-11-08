import type { ValidationRule } from 'antd-svelte';
import registry from 'antd-svelte/porting/registry.json';
import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import reference from '../browser/fixtures/ant-design-form-constraints-reference.json';
import FormConstraintsFixtures from '../browser/fixtures/FormConstraintsFixtures.svelte';

describe('Form length and whitespace public package', () => {
  it('pins source code points, exact range priority and optional whitespace behavior', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version, revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256
    });
    for (const id of ['unicode-astral', 'unicode-combining', 'exact-before-min-max', 'empty-space-optional']) {
      expect(reference.cases.find(({ sample }) => sample.id === id)?.valid).toBe(true);
    }
    expect(reference.cases.find(({ sample }) => sample.id === 'space-warning'))
      .toMatchObject({ valid: true, warnings: ['Rejected'] });
  });

  it('publishes len and whitespace and leaves validation inactive during SSR', () => {
    const rule: ValidationRule = { len: 2, whitespace: true };
    const body = render(FormConstraintsFixtures).body;

    expect(rule).toEqual({ len: 2, whitespace: true });
    expect(body).toContain('value="ab"');
    expect(body).toContain('name="field"');
    expect(body).toContain('"errors":[],"warnings":[]');
    expect(body).not.toContain('ant-form-item-explain-error');
  });
});
