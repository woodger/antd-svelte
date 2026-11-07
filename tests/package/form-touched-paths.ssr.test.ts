import { createForm, type NamePath } from 'antd-svelte';
import { describe, expect, it } from 'vitest';
import registry from 'antd-svelte/porting/registry.json';
import reference from '../browser/fixtures/ant-design-form-touched-paths-observation.json';

describe('Form touched paths public package', () => {
  it('matches source parent, literal and typed paths through touch and reset', async () => {
    const form = createForm({ initialValues: {
      user: { name: 'Anna', role: 'engineer' }, 'user.name': 'Literal', rows: [{ name: 'Bob' }]
    } });
    const queries: Record<string, NamePath> = {
      user: 'user', name: ['user', 'name'], role: ['user', 'role'], literal: 'user.name',
      rows: 'rows', numeric: ['rows', 0], string: ['rows', '0'], missing: 'missing'
    };
    const touches: Record<string, NamePath> = {
      'nested-name': ['user', 'name'], 'literal-name': 'user.name',
      'numeric-row': ['rows', 0, 'name'], 'string-row': ['rows', '0', 'name']
    };

    for (const sample of reference.cases) {
      if (touches[sample.id]) {
        form.touchField(touches[sample.id]);
        await form.validateFields();
      }
      if (sample.id === 'reset') form.resetFields();

      const { any, ...expected } = sample.queried;
      expect(Object.fromEntries(Object.entries(queries).map(([label, name]) =>
        [label, form.isFieldTouched(name)]
      ))).toEqual(expected);
      expect(form.isFieldTouched([])).toBe(sample.id !== 'initial' && sample.id !== 'reset');
      expect(any.error).toContain('not iterable');
    }
  });

  it('pins the source observation and keeps queries free of metadata writes', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version,
      revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256
    });
    const form = createForm({ initialValues: { user: { name: '' } } });
    const before = form.getFieldsError();

    expect(form.isFieldTouched('user')).toBe(false);
    expect(form.isFieldTouched([])).toBe(false);
    expect(form.isFieldTouched(['unknown', 'field'])).toBe(false);
    expect(form.getFieldsError()).toEqual(before);
  });
});
