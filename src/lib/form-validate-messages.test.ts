import { describe, expect, it, vi } from 'vitest';
import { createForm } from './form.model.svelte';
import { getFormHooks } from './form-internal';
import { mergeValidationMessages } from './validation-message.engine';
import { validateFieldValue } from './validation.engine';
import reference from '../../tests/browser/fixtures/ant-design-form-validate-messages-reference.json';
import {
  buildValidationMessages, buildMessagesRule, validateMessagesCorrections,
  type FormValidateMessagesSample
} from '../../tests/browser/fixtures/form-validate-messages-cases';

describe('Form validation message templates', () => {
  for (const entry of reference.cases) {
    it(`matches source templates and recorded native outcomes for ${entry.sample.id}`, async () => {
      const sample = entry.sample as FormValidateMessagesSample;
      const calls: string[][] = [];
      const form = createForm({ initialValues: { field: sample.value } });
      const hooks = getFormHooks(form)!;
      const remove = hooks.registerField({
        name: 'field', rules: [buildMessagesRule(sample.rule)],
        messageVariables: { label: 'Field label', ...sample.variables }
      });
      const config = sample.inner?.form ? undefined : buildValidationMessages(sample.outer, calls);
      const unregisterMessages = hooks.registerValidateMessages(() => ({
        ...mergeValidationMessages(
          buildValidationMessages(sample.inner?.locale?.Form?.defaultValidateMessages, calls), config
        ),
        ...buildValidationMessages(sample.local, calls)
      }));

      const result = await form.validateFields().then(() => true, () => false);

      expect(result).toBe(entry.valid);
      expect(form.getFieldError('field')).toEqual(validateMessagesCorrections[sample.id] ?? entry.errors);
      expect(form.getFieldWarning('field')).toEqual(entry.warnings);
      expect(calls).toEqual(entry.functionCalls);
      unregisterMessages();
      remove();
    });
  }

  it('merges config groups without mutating inputs and lets later undefined templates use defaults', () => {
    const locale = { required: 'Locale', number: { min: 'Minimum', max: 'Maximum' } };
    const config = { required: undefined, number: { min: 'Config' } };

    expect(mergeValidationMessages(locale, config)).toEqual({
      required: undefined, number: { min: 'Config', max: 'Maximum' }
    });
    expect(locale.number).toEqual({ min: 'Minimum', max: 'Maximum' });
    expect(config.number).toEqual({ min: 'Config' });
  });

  it('releases template providers without leaking their messages into the same model or its sibling', async () => {
    const first = createForm({ initialValues: { field: '' }, rules: { field: [{ required: true }] } });
    const sibling = createForm({ initialValues: { field: '' }, rules: { field: [{ required: true }] } });
    const hooks = getFormHooks(first)!;
    const removeOuter = hooks.registerValidateMessages(() => ({ required: 'Outer' }));
    const removeInner = hooks.registerValidateMessages(() => ({ required: 'Inner' }));

    await first.validateFields().catch(() => {});
    await sibling.validateFields().catch(() => {});
    expect(first.getFieldError('field')).toEqual(['Inner']);
    expect(sibling.getFieldError('field')).toEqual(['Заполните это поле.']);
    removeInner();
    await first.validateFields().catch(() => {});
    expect(first.getFieldError('field')).toEqual(['Outer']);
    removeOuter();
    await first.validateFields().catch(() => {});
    expect(first.getFieldError('field')).toEqual(['Заполните это поле.']);
  });

  it('captures templates before debounce and reads the next config without rewriting existing errors', async () => {
    vi.useFakeTimers();
    const form = createForm({ initialValues: { field: '' } });
    const hooks = getFormHooks(form)!;
    let required = 'Before';
    const unregisterMessages = hooks.registerValidateMessages(() => ({ required }));
    const remove = hooks.registerField({
      name: 'field', rules: [{ required: true }], validateDebounce: 100
    });

    try {
      form.touchField('field');
      required = 'After';
      await vi.advanceTimersByTimeAsync(100);

      expect(form.getFieldError('field')).toEqual(['Before']);
      await form.validateFields().catch(() => {});
      expect(form.getFieldError('field')).toEqual(['After']);
    } finally {
      remove();
      unregisterMessages();
      vi.useRealTimers();
    }
  });

  it('uses default templates only for native custom failures without an Error message', async () => {
    const context = { name: 'field', messages: { default: 'Default ${name}' } };
    const messages = await validateFieldValue('value', {}, [
      { validator: () => { throw undefined; } },
      { validator: () => { throw Error('Explicit'); } },
      { validator: () => 'Returned' },
      { validator: () => { throw null; }, message: 'Rule' }
    ], false, context);

    expect(messages).toEqual({ errors: ['Default field', 'Explicit', 'Returned', 'Rule'], warnings: [] });
  });

  it('preserves printf argument order, remaining placeholders, circular JSON and literal rule messages', async () => {
    const circular: { self?: unknown } = {};
    circular.self = circular;
    const messages = await validateFieldValue(circular, {}, [{ type: 'pattern', pattern: /^no$/ }], false, {
      name: 'field', messages: { pattern: { mismatch: '%s %j %s %% %s' } }
    });

    expect(messages.errors).toEqual(['field [Circular] /^no$/ % %s']);
    expect(await validateFieldValue('', {}, [{ required: true, message: '%s ${name}' }], false, {
      name: 'field', messages: { required: 'Override' }
    })).toEqual({ errors: ['%s field'], warnings: [] });
  });

  it('reads only own template properties and preserves empty template failures', async () => {
    const messages = Object.create({ required: 'Inherited' });
    const result = await validateFieldValue('', {}, [{ required: true }], false, { messages });

    expect(result.errors).toEqual(['Заполните это поле.']);
    expect(await validateFieldValue('', {}, [{ required: true }], false, {
      messages: { required: '' }
    })).toEqual({ errors: [''], warnings: [] });
  });

  it('keeps explicit enum messages independent of unused choice coercion or configured templates', async () => {
    const choice = { toString() { throw Error('Unused choice coercion'); } };

    expect(await validateFieldValue('other', {}, [{
      type: 'enum', enum: [choice], message: 'Explicit'
    }], false, { messages: { enum: () => { throw Error('Unused template'); } } }))
      .toEqual({ errors: ['Explicit'], warnings: [] });
  });
});
