import { createForm } from 'antd-svelte';
import { describe, expect, it } from 'vitest';
import registry from 'antd-svelte/porting/registry.json';
import touchedReference from '../browser/fixtures/ant-design-form-aggregate-touched-observation.json';
import validatingReference from '../browser/fixtures/ant-design-form-aggregate-validating-observation.json';

describe('Form aggregate metadata public package', () => {
  it('pins current observations and records the ignored unsafe overloads', () => {
    expect(touchedReference.reference).toMatchObject({
      version: registry.upstream.version,
      revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256
    });
    expect(validatingReference.reference).toEqual(touchedReference.reference);
    const initial = touchedReference.cases.find(({ id }) => id === 'initial')!;
    expect(initial.touched.rootAny.error).toContain('not iterable');
    expect(initial.touched.undefinedAll.error).toContain('map');
  });

  it('matches source global touched state using the existing standalone rule bindings', async () => {
    const form = createForm({ initialValues: { first: '', second: '' }, rules: {
      first: [{ validator: () => {} }], second: [{ validator: () => {} }]
    } });

    function check(id: string) {
      const sample = touchedReference.cases.find((entry) => entry.id === id)!;
      expect(form.isFieldsTouched()).toBe(sample.touched.any);
      expect(form.isFieldsTouched(true)).toBe(sample.touched.all);
      expect(form.isFieldsTouched(undefined, true)).toBe(sample.touched.all);
      expect(form.isFieldsTouched([])).toBe(sample.touched.emptyAny);
      expect(form.isFieldsTouched([], true)).toBe(sample.touched.emptyAll);
      expect(form.isFieldsTouched(['missing'], true)).toBe(sample.touched.missingAll);
      expect(form.isFieldsTouched([[]], true)).toBe(sample.touched.any);
    }

    check('flat-initial');
    form.touchField('first');
    await form.validateFields();
    check('flat-first');
    form.touchField('second');
    await form.validateFields();
    check('flat-both');
    form.resetFields();
    check('flat-reset');
  });

  it('does not expose validating for empty rules or create metadata while reading aggregates', async () => {
    const form = createForm({ initialValues: { name: '' } });
    const before = form.getFieldsError();

    expect(form.isFieldsTouched()).toBe(false);
    expect(form.isFieldsTouched(true)).toBe(true);
    expect(form.isFieldsTouched(['unknown'], true)).toBe(false);
    expect(form.isFieldsValidating(['unknown'])).toBe(false);
    expect(form.getFieldsError()).toEqual(before);
    const validation = form.validateFields();
    expect(form.isFieldsValidating()).toBe(false);
    expect(form.isFieldValidating('name')).toBe(false);
    await validation;
    expect(form.isFieldsValidating()).toBe(false);
  });

  it('keeps silent validation out of aggregate flags while an earlier normal request remains active', async () => {
    let completeFirst!: () => void;
    let completeSecond!: () => void;
    const firstPending = new Promise<void>((resolve) => { completeFirst = resolve; });
    const secondPending = new Promise<void>((resolve) => { completeSecond = resolve; });
    const form = createForm({ initialValues: { first: '', second: '' }, rules: {
      first: [{ validator: () => firstPending }], second: [{ validator: () => secondPending }]
    } });
    const visible = form.validateFields(['first']).catch((error: unknown) => error);
    const silent = form.validateFields(['second'], { validateOnly: true });

    expect(form.isFieldsValidating()).toBe(true);
    expect(form.isFieldsValidating(['first'])).toBe(true);
    expect(form.isFieldsValidating(['second'])).toBe(false);
    expect(form.isFieldsValidating([])).toBe(false);
    completeSecond();
    await silent;
    expect(form.isFieldsValidating()).toBe(true);
    completeFirst();
    await visible;
    expect(form.isFieldsValidating()).toBe(false);
  });
});
