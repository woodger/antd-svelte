<script lang="ts" generics="Value extends RadioValue = string">
  import { onDestroy, untrack } from 'svelte';
  import Radio from './Radio.svelte';
  import { useConfig } from './config-context';
  import { useComponentTheme } from './theme-component.svelte';
  import { useForm, useFormField } from './form-context';
  import { provideRadioGroup } from './radio-context';
  import { getRadioOptions } from './radio.engine';
  import { spaceOrientation } from './space.engine';
  import type { RadioChangeEvent, RadioGroupProps, RadioValue } from './radio.types';

  let {
    options,
    children,
    value = $bindable<Value | undefined>(),
    defaultValue,
    disabled,
    required,
    orientation,
    vertical,
    optionType,
    size,
    buttonStyle = 'outline',
    block = false,
    id,
    name,
    onValueChange,
    onChange,
    onFocus,
    onBlur,
    onMouseEnter,
    onMouseLeave,
    prefixCls = 'ant-radio',
    role = 'radiogroup',
    nativeElement = $bindable(),
    onfocus,
    'aria-invalid': ariaInvalid,
    style,
    class: className = '',
    rootClassName,
    ...attributes
  }: RadioGroupProps<Value> = $props();

  const config = useConfig();
  const componentTheme = useComponentTheme('Radio');
  const form = useForm();
  const field = useFormField(() => nativeElement);
  const generatedId = $props.id();
  const initialDefault = untrack(() => defaultValue);
  const resets = new Set<ReturnType<typeof setTimeout>>();
  const members = new Map<HTMLInputElement, Value>();
  let useDefault = $state(true);
  let container = $derived(nativeElement);
  let alive = true;
  let resolvedOrientation = $derived(spaceOrientation(orientation, vertical));
  let controlId = $derived(id ?? field?.id ?? `ant-radio-group-${generatedId}`);
  let nativeName = $derived(name ?? field?.name ?? `ant-radio-name-${generatedId}`);
  let selected = $derived(value ?? (useDefault ? initialDefault : undefined));
  let items = $derived(getRadioOptions(options ?? []));
  let resolvedSize = $derived(size ?? config.componentSize);
  let resolvedDisabled = $derived(
    disabled ?? field?.disabled ?? form?.disabled ?? config.componentDisabled
  );
  let resolvedRequired = $derived(required ?? field?.required ?? false);
  let describedBy = $derived(
    [attributes['aria-describedby'], field?.describedBy].filter(Boolean).join(' ') || undefined
  );

  provideRadioGroup<Value>({
    get value() {
      return selected;
    },
    get defaultValue() {
      return initialDefault;
    },
    get name() {
      return nativeName;
    },
    get disabled() {
      return resolvedDisabled;
    },
    get required() {
      return resolvedRequired;
    },
    get optionType() {
      return optionType;
    },
    get block() {
      return block;
    },
    register(input, optionValue) {
      members.set(input, optionValue);

      return () => { members.delete(input); };
    },
    select(next, event) {
      const option = items.find((item) => item.value === next);

      if ((items.length && !option) || resolvedDisabled || option?.disabled || selected === next) return;

      useDefault = false;
      value = next;
      onChange?.(event as RadioChangeEvent<Value>);
      if (alive) onValueChange?.(next);
      if (!alive) return;

      // Владелец function binding может отклонить выбор после native radio activation.
      // Значения участников хранят тип: 0 и '0' имеют одинаковый DOM value.
      if (selected !== next) {
        for (const [input, optionValue] of members) input.checked = optionValue === selected;
      }
    }
  });

  onDestroy(() => {
    alive = false;
    members.clear();
    for (const reset of resets)
      clearTimeout(reset);
  });

  function handleFocus(event: FocusEvent & { currentTarget: EventTarget & HTMLFieldSetElement; }) {
    if (!event.defaultPrevented && event.target === event.currentTarget) {
      const element = event.currentTarget;
      const input = element.querySelector<HTMLInputElement>('input:checked:not(:disabled)')
        ?? element.querySelector<
          HTMLInputElement
        >(
          'input:not(:disabled)'
        );

      input?.focus();
    }

    onfocus?.(event);
  }

  function handleReset(event: Event) {
    const element = container;

    if (!element || event.target !== element.form) return;

    const reset = setTimeout(() => {
      resets.delete(reset);

      if (event.defaultPrevented || !element.isConnected || element !== container) return;

      useDefault = false;
      value = initialDefault;
    }, 0);
    resets.add(reset);
  }
</script>

<style>
  .ant-radio-group { display: inline-flex; flex-wrap: wrap; min-width: 0; max-width: 100%; padding: 0; border: 0; row-gap: var(--ant-margin-xs); }
  .ant-radio-group-vertical { display: flex; flex-direction: column; align-items: stretch; }
  .ant-radio-group-vertical:has(> :global(.ant-radio-button-wrapper), > :global(.ant-badge) > :global(.ant-radio-button-wrapper)) { align-items: stretch; }
  .ant-radio-group.ant-radio-group-block { display: flex; width: 100%; }
  .ant-radio-group:focus-visible { outline: 2px solid var(--ant-color-primary); outline-offset: 2px; }
  .ant-radio-group :global(.ant-radio-wrapper) { min-width: 0; max-width: 100%; }
</style>

<svelte:document onreset={handleReset} />

<fieldset
  {...attributes}
  bind:this={nativeElement}
  id={controlId}
  {name}
  style={[componentTheme.style, style].filter(Boolean).join(';') || undefined}
  {role}
  class={[
      `${prefixCls}-group ant-radio-css-var`,
      componentTheme.className,
      `${prefixCls}-group-${buttonStyle}`,
      resolvedSize === 'small' && `${prefixCls}-group-small`,
      resolvedSize === 'large' && `${prefixCls}-group-large`,
      block && `${prefixCls}-group-block`,
      resolvedOrientation === 'vertical' && `${prefixCls}-group-vertical`,
      config.direction === 'rtl' && `${prefixCls}-group-rtl`,
      className,
      rootClassName
    ]}
  disabled={resolvedDisabled}
  aria-label={attributes['aria-label']
      ?? (attributes['aria-labelledby']
        ? undefined
        : field?.label)}
  aria-labelledby={attributes['aria-labelledby']
    ?? (attributes['aria-label'] != null ? undefined : field?.labelledBy)}
  aria-required={resolvedRequired || undefined}
  aria-invalid={field?.status === 'error' || ariaInvalid || undefined}
  aria-orientation={resolvedOrientation}
  aria-describedby={describedBy}
  data-ant-form-invalid={field?.status === 'error'
      || ariaInvalid === true
      || ariaInvalid === 'true'
      || undefined}
  tabindex="-1"
  onfocus={handleFocus}
  onfocusin={event => {
    onFocus?.(event);
    if (alive) attributes.onfocusin?.(event);
  }}
  onfocusout={event => {
    onBlur?.(event);
    if (alive) attributes.onfocusout?.(event);
  }}
  onmouseenter={event => {
    onMouseEnter?.(event);
    if (alive) attributes.onmouseenter?.(event);
  }}
  onmouseleave={event => {
    onMouseLeave?.(event);
    if (alive) attributes.onmouseleave?.(event);
  }}
>
  {#if items.length}
    {#each items as option, index (option.value)}
      <Radio id={option.id ?? `${controlId}-${index}`} value={option.value}
        disabled={option.disabled} form={attributes.form} {prefixCls}
        title={option.title} style={option.style} class={option.className}
        required={option.required} onChange={option.onChange}
        aria-label={typeof option.label === 'string' || typeof option.label === 'number'
          ? String(option.label) : undefined}
        aria-invalid={ariaInvalid} aria-describedby={attributes['aria-describedby']}>
        {#if typeof option.label === 'function'}{@render option.label()}
        {:else}{option.label}{/if}
      </Radio>
    {/each}
  {:else if children}
    {@render children()}
  {/if}
</fieldset>
