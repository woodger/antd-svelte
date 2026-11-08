import { expect, it } from 'vitest';
import { createForm } from './form.model.svelte';
import { getFormHooks } from './form-internal';
import { resolveFormStatus } from './form-status.engine';

it('Form visual metadata uses the exact binding rather than aggregate descendant touched', () => {
  const form = createForm({ initialValues: { profile: { name: 'Anna' } } });
  const hooks = getFormHooks(form)!;
  hooks.registerField({ name: ['profile', 'name'] });

  form.setFields([{ name: ['profile', 'name'], touched: true }]);
  const parent = hooks.getFieldMeta('profile')!;
  const child = hooks.getFieldMeta(['profile', 'name'])!;

  expect(form.isFieldTouched('profile')).toBe(true);
  expect(resolveFormStatus({ ...parent })).toBeUndefined();
  expect(resolveFormStatus({ ...child })).toBe('success');
  expect(hooks.getFieldMeta('missing')).toBeUndefined();
});
