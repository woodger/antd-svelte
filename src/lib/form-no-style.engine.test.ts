import { describe, expect, it } from 'vitest';
import { mergeFormItemMessages } from './form-no-style.engine';
import reference from '../../tests/browser/fixtures/ant-design-form-no-style-reference.json';

describe('Form noStyle message collection', () => {
  it('keeps own messages before child messages and preserves first event order', () => {
    const merged = mergeFormItemMessages(['Parent error'], ['Parent warning'], [
      { name: 'second', errors: ['Second error'], warnings: ['Second warning'] },
      { name: 'first', errors: ['First error'], warnings: [] }
    ]);

    expect(merged.errors).toEqual(['Parent error', ...reference.eventOrder.parent.errors]);
    expect(merged.warnings).toEqual(['Parent warning', 'Second warning']);
  });

  it('replaces duplicate bindings without moving their original message position', () => {
    expect(mergeFormItemMessages([], [], [
      { name: ['user', 'name'], errors: ['Old'], warnings: [] },
      { name: 'other', errors: ['Other'], warnings: [] },
      { name: ['user', 'name'], errors: ['Latest'], warnings: ['Warning'] }
    ])).toEqual({ errors: ['Latest', 'Other'], warnings: ['Warning'] });
  });

  it('keeps numeric, literal, nested and separator-containing NamePaths separate', () => {
    const paths = [0, '0', 'user.name', ['user', 'name'], 'user__RC_FIELD_SPLIT__name'];
    const fields = paths.map((name, index) => ({ name, errors: [String(index)], warnings: [] }));

    expect(mergeFormItemMessages([], [], fields).errors).toEqual(['0', '1', '2', '3', '4']);
  });

  it('does not mutate caller-owned arrays when producing parent messages', () => {
    const errors = Object.freeze(['Own']);
    const child = Object.freeze(['Child']);
    const result = mergeFormItemMessages(errors, [], [{ name: 'name', errors: child, warnings: [] }]);
    result.errors.push('Local');

    expect(errors).toEqual(['Own']);
    expect(child).toEqual(['Child']);
    expect(mergeFormItemMessages([], [], [])).toEqual({ errors: [], warnings: [] });
  });

  it('retains distinct nonfinite segments without JSON numeric key collisions', () => {
    const fields = [Infinity, -Infinity, NaN, NaN].map((name, index) => ({
      name, errors: [String(index)], warnings: []
    }));

    expect(mergeFormItemMessages([], [], fields).errors).toEqual(['0', '1', '2', '3']);
  });
});
