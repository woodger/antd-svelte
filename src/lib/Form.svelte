<script lang="ts" generics="Values extends FormValues">
  import { onDestroy, tick } from 'svelte';
  import { useConfig } from './config-context';
  import { useComponentTheme } from './theme-component.svelte';
  import { provideForm } from './form-context';
  import { getFormHooks } from './form-internal';
  import { provideFormList } from './form-list-context';
  import type { FormProps } from './form.types';
  import type { FormValues } from './validation.engine';

  let {
    form,
    children,
    layout = 'vertical',
    colon,
    labelAlign,
    labelWrap,
    labelCol,
    wrapperCol,
    requiredMark,
    variant,
    component = 'form',
    disabled,
    onFinish,
    onFinishFailed,
    onError,
    class: className = '',
    style,
    ...attributes
  }: FormProps<Values> = $props();

  const config = useConfig();
  const componentTheme = useComponentTheme('Form');
  let resolvedRequiredMark = $derived(requiredMark ?? config.form?.requiredMark ?? true);
  let active = true;

  onDestroy(() => {
    active = false;
  });

  provideFormList(undefined);

  provideForm({
    get variant() {
      return variant;
    },
    get disabled() {
      return (disabled ?? config.componentDisabled) || form.isSubmitting;
    },
    get layout() {
      return layout;
    },
    get colon() {
      return colon ?? config.form?.colon;
    },
    get labelAlign() {
      return labelAlign ?? config.form?.labelAlign;
    },
    get labelWrap() {
      return labelWrap ?? config.form?.labelWrap;
    },
    get labelCol() {
      return labelCol;
    },
    get wrapperCol() {
      return wrapperCol;
    },
    get requiredMark() {
      return resolvedRequiredMark;
    },
    get resetKey() {
      return getFormHooks(form)?.resetKey ?? form.values;
    },
    getFieldError: (name) => form.getFieldError(name),
    getFieldWarning: (name) => form.getFieldWarning(name),
    isFieldRequired: (name) => form.isFieldRequired(name),
    touchField: (name) => form.touchField(name),
    registerField: (field) => getFormHooks(form)?.registerField(field),
    getFieldValue: (name) => form.getFieldValue(name),
    initializeList: (name, initialValue) => getFormHooks(form)?.initializeList(name, initialValue),
    changeList: (name, values) => {
      const hooks = getFormHooks(form);
      if (!hooks) throw new Error('FormList requires a createForm model');

      hooks.changeList(name, values);
    }
  });

  async function handleSubmit(
    event: SubmitEvent & { currentTarget: EventTarget & HTMLFormElement; }
  ) {
    event.preventDefault();
    const element = event.currentTarget;

    if (disabled ?? config.componentDisabled) {
      return;
    }

    const submittedForm = form;
    const finish = onFinish;
    const result = await submittedForm.submit((values) => {
      if (active && form === submittedForm) {
        return finish?.(values);
      }
    });

    if (!active || form !== submittedForm) {
      return;
    }

    if (result.status === 'invalid') {
      onFinishFailed?.(result.error);

      if (!result.error.outOfDate) {
        await tick();
        element.querySelector<HTMLElement>(
          '[data-ant-form-invalid="true"], [aria-invalid="true"]'
        )
          ?.focus();
      }
    } else if (result.status === 'failed') {
      onError?.(result.error);
    }
  }

  function handleReset(event: Event) {
    event.preventDefault();
    form.resetFields();
  }
</script>

{#if component === false}
  {@render children()}
{:else}
<form
  {...attributes}
  novalidate
  class={[`ant-form ant-form-css-var ant-form-${layout} ${className}`,
    resolvedRequiredMark === false && 'ant-form-hide-required-mark',
    componentTheme.className].filter(Boolean).join(' ')}
  style={componentTheme.style
    ? [componentTheme.style, style].filter(Boolean).join(';') : style}
  aria-busy={form.isSubmitting || undefined}
  onsubmit={handleSubmit}
  onreset={handleReset}
>
  {#if form.submissionError}
    <p role="alert" class="ant-form-item-explain-error">{config.locale.submitErrorText}</p>
  {/if}
  {@render children()}
</form>
{/if}
