<script module lang="ts">
  export type { CheckboxProps } from './checkbox.types';
</script>

<script lang="ts">
  import { onDestroy, onMount, untrack } from 'svelte';
  import { useConfig } from './config-context';
  import { useForm, useFormField } from './form-context';
  import { useCheckboxGroup } from './checkbox-context';
  import { createCheckableClickLock } from './checkable.dom';
  import type { CheckboxChangeEvent, CheckboxProps } from './checkbox.types';

  let {
    checked = $bindable(),
    indeterminate = $bindable(),
    value = 'on',
    nativeElement = $bindable(),
    inputElement = $bindable(),
    ref = $bindable(),
    ...props
  }: CheckboxProps = $props();

  const config = useConfig();
  const form = useForm();
  const field = useFormField();
  const group = useCheckboxGroup();
  const initialDefault = untrack(() => props.defaultChecked ?? false);
  const clickLock = createCheckableClickLock();
  let alive = true;
  let prefix = $derived(props.prefixCls ?? 'ant-checkbox');
  let inGroup = $derived(Boolean(group && !props.skipGroup));
  let groupValue = $derived(typeof value === 'string' || typeof value === 'number'
    || typeof value === 'boolean' ? value : undefined);
  let resolvedChecked = $derived(inGroup ? groupValue !== undefined
    && group!.value.includes(groupValue) : checked ?? initialDefault);
  let resolvedDefault = $derived(inGroup ? groupValue !== undefined
    && group!.defaultValue.includes(groupValue) : initialDefault);
  let resolvedDisabled = $derived(Boolean(group?.disabled || (props.disabled ?? group?.disabled
    ?? field?.disabled ?? form?.disabled ?? config.componentDisabled)));
  let nativeName = $derived(inGroup ? group?.name : props.name ?? field?.name);
  let nativeForm = $derived(props.form ?? (inGroup ? group?.form : undefined));
  let info = $derived({
    props: {
      ...props,
      value,
      checked: resolvedChecked,
      indeterminate: indeterminate ?? false,
      disabled: resolvedDisabled,
      name: nativeName
    }
  });
  let contextClasses = $derived(typeof config.checkbox?.classNames === 'function'
    ? config.checkbox.classNames(info) : config.checkbox?.classNames);
  let localClasses = $derived(typeof props.classNames === 'function'
    ? props.classNames(info) : props.classNames);
  let contextStyles = $derived(typeof config.checkbox?.styles === 'function'
    ? config.checkbox.styles(info) : config.checkbox?.styles);
  let localStyles = $derived(typeof props.styles === 'function'
    ? props.styles(info) : props.styles);
  let rootStyle = $derived([
    contextStyles?.root,
    config.checkbox?.style,
    localStyles?.root,
    props.style
  ].filter(Boolean).join(';') || undefined);
  let blurCallbacks = untrack(() => ({ onBlur: props.onBlur, onblur: props.onblur }));
  const owned = new Set([
    'checked', 'defaultChecked', 'indeterminate', 'value', 'children', 'skipGroup',
    'onCheckedChange', 'onChange', 'disabled', 'id', 'name', 'form', 'title', 'style', 'class',
    'rootClassName', 'prefixCls', 'classNames', 'styles', 'nativeElement', 'inputElement', 'ref',
    'autoFocus', 'tabIndex', 'onClick', 'onFocus', 'onBlur', 'onKeyDown', 'onKeyPress',
    'onMouseEnter', 'onMouseLeave', 'onchange', 'onblur', 'onclick', 'onfocus', 'onkeydown',
    'onkeypress'
  ]);
  let attributes = $derived(Object.fromEntries(Object.entries(props)
    .filter(([key]) => !owned.has(key))));

  $effect.pre(() => {
    // Native blur на keyed removal не читает уже уничтоженные derived props родителя.
    blurCallbacks = { onBlur: props.onBlur, onblur: props.onblur };
  });

  $effect(() => {
    const input = inputElement;
    if (!input || !inGroup || groupValue === undefined) return;

    return group?.register(input, groupValue);
  });

  $effect(() => {
    const input = inputElement;
    const root = nativeElement;
    if (!input || !root) return;

    const handle = {
      input,
      nativeElement: root,
      focus: (options?: FocusOptions) => input.focus(options),
      blur: () => input.blur()
    };
    ref = handle;

    return () => {
      // Объект ref может пройти через $state proxy владельца; DOM-ссылки сохраняют identity.
      if (ref?.input === input && ref.nativeElement === root) ref = undefined;
    };
  });

  onMount(() => {
    if (props.autoFocus) inputElement?.focus();
  });

  onDestroy(() => {
    alive = false;
    clickLock.destroy();
  });

  export function focus(options?: FocusOptions) {
    inputElement?.focus(options);
  }

  export function blur() {
    inputElement?.blur();
  }

  function handleChange(event: Event & { currentTarget: EventTarget & HTMLInputElement; }) {
    if (resolvedDisabled) return;

    const next = event.currentTarget.checked;
    const change: CheckboxChangeEvent = {
      target: { ...info.props, type: 'checkbox', checked: next },
      nativeEvent: event,
      stopPropagation: () => event.stopPropagation(),
      preventDefault: () => event.preventDefault()
    };
    checked = next;
    indeterminate = false;
    props.onCheckedChange?.(checked);
    if (!alive) return;

    props.onChange?.(change);
    if (!alive) return;

    if (inGroup && groupValue !== undefined) group?.toggle(groupValue, next);
    if (alive) props.onchange?.(event);
  }

  function handleBlur(event: FocusEvent & { currentTarget: EventTarget & HTMLInputElement; }) {
    if (!alive) return;

    const callbacks = blurCallbacks;
    field?.onBlur();
    if (!alive) return;

    callbacks.onBlur?.(event);
    if (alive) callbacks.onblur?.(event);
  }
</script>

<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_noninteractive_element_interactions (Label блокирует повторный click; клавиатурой и фокусом управляет native input.) -->
<label class={[
  `${prefix}-wrapper ant-checkbox-css-var`,
  resolvedChecked && `${prefix}-wrapper-checked`,
  resolvedDisabled && `${prefix}-wrapper-disabled`,
  config.direction === 'rtl' && `${prefix}-rtl`,
  field && `${prefix}-wrapper-in-form-item`,
  config.checkbox?.class,
  props.class,
  contextClasses?.root,
  localClasses?.root,
  props.rootClassName
]} style={rootStyle} onclick={clickLock.label}
  onmouseenter={event => props.onMouseEnter?.(event)}
  onmouseleave={event => props.onMouseLeave?.(event)}>
  <span bind:this={nativeElement} class={[
    prefix,
    resolvedChecked && `${prefix}-checked`,
    indeterminate && `${prefix}-indeterminate`,
    resolvedDisabled && `${prefix}-disabled`,
    contextClasses?.icon,
    localClasses?.icon
  ]} title={props.title}
    style={[contextStyles?.icon, localStyles?.icon].filter(Boolean).join(';') || undefined}>
    <!-- svelte-ignore a11y_autofocus (Сохраняется публичный autoFocus/HTML autofocus.) -->
    <input {...attributes} bind:this={inputElement} type="checkbox" class={`${prefix}-input`}
      id={props.id ?? field?.id} name={nativeName} form={nativeForm}
      value={typeof value === 'boolean' ? String(value) : value} defaultChecked={resolvedDefault}
      bind:checked={() => resolvedChecked, next => { checked = next; }}
      bind:indeterminate={() => indeterminate ?? false, next => { indeterminate = next; }}
      disabled={resolvedDisabled} required={props.required ?? (inGroup ? false : field?.required)}
      autofocus={props.autoFocus ?? props.autofocus} tabindex={props.tabIndex ?? props.tabindex}
      aria-checked={indeterminate ? 'mixed' : resolvedChecked}
      aria-invalid={field?.status === 'error' || props['aria-invalid'] || undefined}
      aria-describedby={[props['aria-describedby'], field?.describedBy].filter(Boolean).join(' ') || undefined}
      onchange={handleChange} onblur={handleBlur}
      onclick={event => {
        clickLock.input(event);
        props.onClick?.(event);
        if (alive) props.onclick?.(event);
      }}
      onfocus={event => {
        props.onFocus?.(event);
        if (alive) props.onfocus?.(event);
      }}
      onkeydown={event => {
        props.onKeyDown?.(event);
        if (alive) props.onkeydown?.(event);
      }}
      onkeypress={event => {
        props.onKeyPress?.(event);
        if (alive) props.onkeypress?.(event);
      }} />
  </span>
  {#if props.children}
    <span class={[`${prefix}-label`, contextClasses?.label, localClasses?.label]}
      style={[contextStyles?.label, localStyles?.label].filter(Boolean).join(';') || undefined}>
      {@render props.children()}
    </span>
  {/if}
</label>
