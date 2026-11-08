import { describe, expect, it } from 'vitest';
import { resolveFormStatus } from './form-status.engine';
import type { FormValidateStatus } from './form-error-list.types';

describe('Form visual validation status', () => {
  it.each<FormValidateStatus>(['', 'success', 'error', 'warning', 'validating'])(
    'keeps explicit %s above pending validation and messages', (validateStatus) => {
      expect(resolveFormStatus({
        validateStatus, validating: true, touched: true, errors: ['Invalid'], warnings: ['Check']
      })).toBe(validateStatus);
    }
  );

  it('shows pending validation above previous errors without modifying messages', () => {
    const errors = Object.freeze(['Previous error']);
    const warnings = Object.freeze(['Previous warning']);

    expect(resolveFormStatus({ validating: true, touched: true, errors, warnings }))
      .toBe('validating');
    expect(errors).toEqual(['Previous error']);
    expect(warnings).toEqual(['Previous warning']);
  });

  it('prioritizes errors over warnings and warnings over touched success', () => {
    expect(resolveFormStatus({ touched: true, errors: ['Invalid'], warnings: ['Check'] }))
      .toBe('error');
    expect(resolveFormStatus({ touched: true, errors: [], warnings: ['Check'] }))
      .toBe('warning');
    expect(resolveFormStatus({ touched: true, errors: [], warnings: [] })).toBe('success');
    expect(resolveFormStatus({ errors: [], warnings: [] })).toBeUndefined();
  });
});
