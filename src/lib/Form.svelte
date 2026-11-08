<script lang="ts" generics="Values extends FormValues">
  import { onDestroy, tick } from 'svelte';
  import { provideConfig, useConfig, type ConfigContext } from './config-context';
  import { useComponentTheme } from './theme-component.svelte';
  import { provideForm } from './form-context';
  import { getFormHooks } from './form-internal';
  import { provideFormList } from './form-list-context';
  import type { FormProps, FormSemanticSlots } from './form.types';
  import type { FormValues } from './validation.engine';
  import { mergeComponentSemantics } from './semantic-style.engine';

  let props: FormProps<Values> = $props();
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
    size,
    component = 'form',
    disabled,
    onFinish,
    onFinishFailed,
    onError,
    rootClassName,
    classNames,
    styles,
    class: className = '',
    style,
    ...attributes
  } = $derived(props);

  const config = useConfig();
  const componentTheme = useComponentTheme('Form');
  let resolvedSize = $derived(size ?? config.explicitComponentSize);
  let resolvedRequiredMark = $derived(requiredMark ?? config.form?.requiredMark ?? true);
  let semanticProps: FormProps<Values> = $derived({
    ...props, classNames, styles, layout, size: resolvedSize,
    disabled: disabled ?? config.componentDisabled,
    colon: colon ?? config.form?.colon, labelAlign: labelAlign ?? config.form?.labelAlign,
    labelWrap: labelWrap ?? config.form?.labelWrap, requiredMark: resolvedRequiredMark
  });
  let semantic = $derived(mergeComponentSemantics<keyof FormSemanticSlots, FormProps<Values>>(
    config.form, semanticProps, ['root', 'label', 'content', 'help', 'helpItem', 'extra']
  ));
  let active = true;

  onDestroy(() => {
    active = false;
  });

  provideFormList(undefined);

  // Form меняет только SizeContext; остальные reactive defaults сохраняют своего владельца.
  const fieldConfig: ConfigContext = Object.create(config, {
    componentSize: { get: () => size ?? config.componentSize },
    explicitComponentSize: { get: () => resolvedSize }
  });
  provideConfig(fieldConfig);

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
    get classNames() {
      return semantic.classes;
    },
    get styles() {
      return semantic.styles;
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
  class={[`ant-form ant-form-css-var ant-form-${layout}`,
    resolvedRequiredMark === false && 'ant-form-hide-required-mark',
    resolvedSize === 'small' && 'ant-form-small',
    resolvedSize === 'large' && 'ant-form-large',
    componentTheme.className, config.form?.class, className, rootClassName,
    semantic.classes.root].filter(Boolean).join(' ')}
  style={componentTheme.style || semantic.styles.root
    ? [componentTheme.style, semantic.styles.root].filter(Boolean).join(';') : style}
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
