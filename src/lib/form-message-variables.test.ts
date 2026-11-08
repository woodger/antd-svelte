import { describe, expect, it, vi } from 'vitest';
import { formatValidationMessages } from './validation-message.engine';
import { validateFieldValue, validateValue, type ValidationRule } from './validation.engine';
import { createForm } from './form.model.svelte';
import { getFormHooks } from './form-internal';
import reference from '../../tests/browser/fixtures/ant-design-form-message-variables-reference.json';
import {
  messageVariablesRule, messageVariablesInitialValues, messageVariablesCorrections,
  type FormMessageVariablesSample
} from '../../tests/browser/fixtures/form-message-variables-cases';

describe('Form validation message variables', () => {
  for (const entry of reference.cases) {
    it(`matches source interpolation and recorded corrections for ${entry.sample.id}`, async () => {
      const sample = entry.sample as FormMessageVariablesSample;
      const values = messageVariablesInitialValues(sample);
      const name = sample.name ?? 'field';
      const path = Array.isArray(name) ? name : [name];
      const label = Object.hasOwn(sample, 'label') ? sample.label : 'Field label';
      const form = createForm({ initialValues: values });
      const remove = getFormHooks(form)!.registerField({
        name, rules: [messageVariablesRule(sample)],
        messageVariables: {
          label: !sample.rich && typeof label === 'string' ? label : String(name),
          ...sample.variables
        }
      });

      await expect(form.validateFields()).rejects.toMatchObject({
        errorFields: [{ name: path, errors: messageVariablesCorrections[sample.id] ?? entry.errors }]
      });
      expect(form.getFieldError(name)).toEqual(messageVariablesCorrections[sample.id] ?? entry.errors);
      remove();
    });
  }

  it('keeps ordinary and empty messages while expanding aliases from standalone model rules', async () => {
    expect(await validateValue('a', {}, [{ min: 3, message: 'Ordinary' }])).toEqual(['Ordinary']);
    expect(await validateValue('a', {}, [{ min: 3, message: '' }])).toEqual(['']);
    const form = createForm({
      initialValues: { name: '' }, rules: { name: [{ required: true, message: '${label}: ${name}' }] }
    });

    await expect(form.validateFields()).rejects.toMatchObject({
      errorFields: [{ name: ['name'], errors: ['name: name'] }]
    });
  });

  it('does not recursively expand replacement text or escaped messages during nested aggregation', async () => {
    const messages = await validateFieldValue({ name: '' }, {}, [{ type: 'object', fields: {
      name: { required: true, message: '\\${label}' }
    } }], false, { name: 'field', variables: { label: '${min}' } });

    expect(messages).toEqual({ errors: ['${label}'], warnings: [] });
    expect(formatValidationMessages(['${label}'], { min: 5 }, {
      variables: { label: '${min}' }
    })).toEqual(['${min}']);
  });

  it('formats warning and transform failures without changing their validation channels', async () => {
    const messages = await validateFieldValue('', {}, [
      { required: true, warningOnly: true, message: '${label}' },
      { transform: () => { throw Error('${name}'); } }
    ], false, { name: 'field', variables: { label: 'Warning' } });

    expect(messages).toEqual({ errors: ['field'], warnings: ['Warning'] });
  });

  it('keeps manual setFields messages literal instead of formatting caller-owned metadata', () => {
    const form = createForm({ initialValues: { name: '' }, rules: { name: [{}] } });
    form.setFields([{ name: 'name', errors: ['${label}'] }]);

    expect(form.getFieldError('name')).toEqual(['${label}']);
  });

  it('captures field variables before an asynchronous validator and reads new values on retry', async () => {
    let variables = { label: 'Old' };
    let finishValidation!: (message: string) => void;
    let pending = new Promise<string>(resolve => { finishValidation = resolve; });
    const form = createForm({ initialValues: { name: 'Name' } });
    const remove = getFormHooks(form)!.registerField({
      name: 'name', get messageVariables() { return variables; },
      rules: [{ validator: () => pending }]
    });
    const first = form.validateFields().catch(error => error);
    variables = { label: 'New' };
    finishValidation('${label}');

    expect(await first).toMatchObject({ errorFields: [{ errors: ['Old'] }] });
    pending = Promise.resolve('${label}');
    await expect(form.validateFields()).rejects.toMatchObject({
      errorFields: [{ errors: ['New'] }]
    });
    remove();
  });

  it('captures variables before automatic debounce and refreshes them for the next check', async () => {
    vi.useFakeTimers();
    let label = 'Before';
    const form = createForm({ initialValues: { name: 'ab' } });
    const remove = getFormHooks(form)!.registerField({
      name: 'name',
      validateDebounce: 100,
      get messageVariables() { return { label }; },
      rules: [{ min: 3, message: '${label}' }]
    });

    try {
      form.touchField('name');
      label = 'After';
      await vi.advanceTimersByTimeAsync(100);

      expect(form.getFieldError('name')).toEqual(['Before']);
      await expect(form.validateFields()).rejects.toMatchObject({
        errorFields: [{ errors: ['After'] }]
      });
    } finally {
      remove();
      vi.useRealTimers();
    }
  });

  it('keeps inherited variables absent and honors explicit own-property overrides', () => {
    const variables = Object.create({ label: 'Inherited' });
    variables.constructor = 'Custom';
    expect(formatValidationMessages(['${constructor}/${label}/${toString}'], {}, {
      name: 'field', variables
    })).toEqual(['Custom/field/undefined']);
    expect(formatValidationMessages(['${enum}'], { enum: ['a', null, undefined, false, 0] }))
      .toEqual(['a, , , false, 0']);
  });

  it('formats errors created by recursive-schema guards using the current field context', async () => {
    const rule: ValidationRule = { type: 'object', message: 'Cycle: ${label}' };
    rule.fields = { self: rule };
    const value: { self?: unknown } = {};
    value.self = value;

    expect(await validateFieldValue(value, {}, [rule], false, {
      name: 'field', variables: { label: 'Tree' }
    })).toEqual({ errors: ['Cycle: Tree'], warnings: [] });
  });
});
