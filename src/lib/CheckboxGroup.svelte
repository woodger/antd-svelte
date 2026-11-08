<script lang="ts" generics="Value extends CheckboxGroupValue = string">
  import { onDestroy, untrack } from 'svelte';
  import Checkbox from './Checkbox.svelte';
  import { useConfig } from './config-context';
  import { useComponentTheme } from './theme-component.svelte';
  import { useForm, useFormField } from './form-context';
  import { provideCheckboxGroup } from './checkbox-context';
  import {
    getCheckboxGroupOptions,
    getCheckboxGroupValue,
    toggleCheckboxGroupChildren
  } from './checkbox-group.engine';
  import type {
    CheckboxGroupProps,
    CheckboxGroupValue
  } from './checkbox-group.types';

  let {
    options = [],
    children,
    value = $bindable<Value[]>(),
    defaultValue,
    disabled,
    id,
    name,
    onValueChange,
    onChange,
    prefixCls = 'ant-checkbox',
    rootClassName,
    role = 'group',
    nativeElement = $bindable(),
    onfocus,
    'aria-invalid': ariaInvalid,
    style,
    class: className = '',
    ...attributes
  }: CheckboxGroupProps<Value> = $props();

  const config = useConfig();
  const componentTheme = useComponentTheme('Checkbox');
  const form = useForm();
  const field = useFormField(() => nativeElement);
  const generatedId = $props.id();
  const initialDefault = untrack(() => [...(defaultValue ?? [])]);
  const resets = new Set<ReturnType<typeof setTimeout>>();
  const members = new Map<HTMLInputElement, Value>();
  let registeredValues: Value[] = [];
  let container = $derived(nativeElement);
  let alive = true;
  let controlId = $derived(id ?? field?.id ?? `ant-checkbox-group-${generatedId}`);
  let items = $derived(getCheckboxGroupOptions(options));
  let selected = $derived(new Set(value ?? initialDefault));
  let resolvedDisabled = $derived(
    disabled ?? field?.disabled ?? form?.disabled ?? config.componentDisabled
  );
  let describedBy = $derived(
    [attributes['aria-describedby'], field?.describedBy].filter(Boolean).join(' ') || undefined
  );

  provideCheckboxGroup<Value>({
    get value() {
      return value ?? initialDefault;
    },
    get defaultValue() {
      return initialDefault;
    },
    get name() {
      return name ?? field?.name;
    },
    get form() {
      return attributes.form;
    },
    get disabled() {
      return resolvedDisabled;
    },
    register(input, optionValue) {
      members.set(input, optionValue);
      registeredValues = [...registeredValues, optionValue];

      return () => {
        members.delete(input);
        registeredValues = registeredValues.filter(item => item !== optionValue);
      };
    },
    toggle: change
  });

  onDestroy(() => {
    alive = false;
    members.clear();
    registeredValues = [];
    for (const reset of resets)
      clearTimeout(reset);
  });

  function syncMembers() {
    for (const [input, optionValue] of members) input.checked = selected.has(optionValue);
  }

  function change(optionValue: Value, checked: boolean) {
    if (resolvedDisabled) return;

    let values: Value[];
    let nextValue: Value[];

    if (items.length) {
      const option = items.find(item => item.value === optionValue);
      if (!option || option.disabled || selected.has(optionValue) === checked) return;

      const next = new Set(selected);
      if (checked) next.add(optionValue);
      else next.delete(optionValue);

      values = getCheckboxGroupValue(items, [...next]);
      nextValue = values;
    } else {
      const next = toggleCheckboxGroupChildren(
        value ?? initialDefault,
        optionValue,
        registeredValues
      );
      nextValue = next.value;
      values = next.callbackValue;
    }

    value = [...nextValue];
    onChange?.([...values]);
    if (alive) onValueChange?.(values);
    if (alive) syncMembers();
  }

  function handleFocus(event: FocusEvent & { currentTarget: EventTarget & HTMLFieldSetElement; }) {
    if (!event.defaultPrevented && event.target === event.currentTarget) {
      event.currentTarget.querySelector<HTMLInputElement>('input:not(:disabled)')?.focus();
    }

    onfocus?.(event);
  }

  function handleReset(event: Event) {
    const element = container;

    if (!element || event.target !== element.form) return;

    // Следующая задача учитывает отмену reset даже в позднем listener на window.
    const reset = setTimeout(() => {
      resets.delete(reset);

      if (event.defaultPrevented || !element.isConnected || element !== container) return;

      value = [...initialDefault];
      syncMembers();
    }, 0);
    resets.add(reset);
  }
</script>

<style>
  .ant-checkbox-group { min-width: 0; max-width: 100%; border: 0; row-gap: var(--ant-margin-xs); }
  .ant-checkbox-group:focus-visible { outline: 2px solid var(--ant-color-primary); outline-offset: 2px; }
  .ant-checkbox-group :global(.ant-checkbox-wrapper) { min-width: 0; max-width: 100%; overflow-wrap: anywhere; }
  .ant-checkbox-group :global(.ant-checkbox-label) { min-width: 0; }
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
      `${prefixCls}-group ant-checkbox-css-var`,
      componentTheme.className,
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
  data-ant-form-invalid={field?.status === 'error'
      || ariaInvalid === true
      || ariaInvalid === 'true'
      || undefined}
  aria-describedby={describedBy}
  tabindex="-1"
  onfocus={handleFocus}
>
  {#if items.length}
    {#each items as option, index (option.value)}
      <Checkbox id={option.id ?? `${controlId}-${index}`} value={option.value} {prefixCls}
        disabled={resolvedDisabled || option.disabled || false} required={option.required ?? false}
        title={option.title} class={[`${prefixCls}-group-item`, option.className].filter(Boolean).join(' ')}
        style={option.style} onChange={option.onChange}
        aria-label={typeof option.label === 'string' || typeof option.label === 'number'
          ? String(option.label) : undefined}
        aria-invalid={ariaInvalid} aria-describedby={attributes['aria-describedby']}>
        {#if typeof option.label === 'function'}{@render option.label()}
        {:else}{option.label}{/if}
      </Checkbox>
    {/each}
  {:else if children}
    {@render children()}
  {/if}
</fieldset>
