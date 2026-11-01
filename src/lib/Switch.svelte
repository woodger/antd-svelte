<script module lang="ts">
  export type { SwitchProps } from './switch.types';
</script>

<script lang="ts">
  import { onDestroy, onMount, untrack } from 'svelte';
  import { useConfig } from './config-context';
  import { useForm, useFormField } from './form-context';
  import Icon from './Icon.svelte';
  import type { SwitchEvent, SwitchProps } from './switch.types';

  let {
    checked = $bindable<boolean | undefined>(),
    value = $bindable<boolean | undefined>(),
    nativeElement = $bindable(),
    ref = $bindable(),
    ...props
  }: SwitchProps = $props();

  const config = useConfig();
  const form = useForm();
  const field = useFormField();
  const initialDefault = untrack(() => props.defaultChecked ?? props.defaultValue ?? false);
  const resets = new Set<ReturnType<typeof setTimeout>>();
  let alive = true;
  let control = $derived(nativeElement);
  let prefix = $derived(props.prefixCls ?? 'ant-switch');
  let resolvedChecked = $derived(checked ?? value ?? initialDefault);
  let resolvedDisabled = $derived(
    Boolean(props.loading || (props.disabled ?? field?.disabled ?? form?.disabled
      ?? config.componentDisabled))
  );
  let resolvedSize = $derived(props.size ?? config.componentSize);
  let isSmall = $derived(resolvedSize === 'small');
  let fieldName = $derived(props.name ?? field?.name);
  let info = $derived({
    props: { ...props, checked, value, size: resolvedSize, disabled: resolvedDisabled }
  });
  let contextClasses = $derived(typeof config.switch?.classNames === 'function'
    ? config.switch.classNames(info) : config.switch?.classNames);
  let localClasses = $derived(typeof props.classNames === 'function'
    ? props.classNames(info) : props.classNames);
  let contextStyles = $derived(typeof config.switch?.styles === 'function'
    ? config.switch.styles(info) : config.switch?.styles);
  let localStyles = $derived(typeof props.styles === 'function'
    ? props.styles(info) : props.styles);
  let rootStyle = $derived([
    contextStyles?.root,
    config.switch?.style,
    localStyles?.root,
    props.style
  ].filter(Boolean).join(';') || undefined);
  let blurCallbacks = untrack(() => ({ onBlur: props.onBlur, onblur: props.onblur }));
  const owned = new Set([
    'checked', 'value', 'defaultChecked', 'defaultValue', 'nativeElement', 'ref', 'loading',
    'size', 'checkedChildren', 'unCheckedChildren', 'onCheckedChange', 'onChange', 'onClick',
    'onKeyDown', 'onFocus', 'onBlur', 'autoFocus', 'tabIndex', 'prefixCls', 'rootClassName',
    'classNames', 'styles', 'class', 'style', 'disabled', 'id', 'name', 'onclick', 'onkeydown',
    'onfocus', 'onblur'
  ]);
  let attributes = $derived(Object.fromEntries(Object.entries(props)
    .filter(([key]) => !owned.has(key))));

  $effect.pre(() => {
    // Keyed removal может вызвать native blur после уничтожения props родителя.
    blurCallbacks = { onBlur: props.onBlur, onblur: props.onblur };
  });

  $effect(() => {
    const button = nativeElement;
    if (!button) return;

    ref = button;

    return () => {
      if (ref === button) ref = undefined;
    };
  });

  onMount(() => {
    if (props.autoFocus) control?.focus();
  });

  onDestroy(() => {
    alive = false;
    for (const reset of resets)
      clearTimeout(reset);
  });

  export function focus(options?: FocusOptions) {
    control?.focus(options);
  }

  export function blur() {
    control?.blur();
  }

  function setChecked(next: boolean) {
    if (checked !== undefined || value === undefined) checked = next;
    else value = next;
  }

  function change(next: boolean, event: SwitchEvent) {
    setChecked(next);
    props.onCheckedChange?.(next);
    if (alive) props.onChange?.(next, event);
  }

  function handleClick(event: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement; }) {
    if (resolvedDisabled) return;

    props.onclick?.(event);

    if (!alive || event.defaultPrevented) return;

    const next = !resolvedChecked;
    change(next, event);
    if (alive) props.onClick?.(next, event);
  }

  function handleKeyDown(
    event: KeyboardEvent & { currentTarget: EventTarget & HTMLButtonElement; }
  ) {
    // React нормализует which из keyCode; rc-switch проверяет LEFT/RIGHT по этим кодам.
    const code = event.keyCode;
    if (!resolvedDisabled && (code === 37 || code === 39)) {
      change(code === 39, event);
    }

    if (alive) props.onKeyDown?.(event);
    if (alive) props.onkeydown?.(event);
  }

  function handleBlur(event: FocusEvent & { currentTarget: EventTarget & HTMLButtonElement; }) {
    if (!alive) return;

    const callbacks = blurCallbacks;
    field?.onBlur();
    if (!alive) return;

    callbacks.onBlur?.(event);
    if (alive) callbacks.onblur?.(event);
  }

  function handleReset(event: Event) {
    const button = control;

    if (!button || event.target !== button.form) return;

    // Отмена reset учитывается после всех обработчиков, включая window.
    const reset = setTimeout(() => {
      resets.delete(reset);

      if (event.defaultPrevented || !button.isConnected || button !== control) return;

      setChecked(initialDefault);
    }, 0);
    resets.add(reset);
  }
</script>

<style>
  .ant-switch { max-width: 100%; }
</style>

<svelte:document onreset={handleReset} />

<!-- svelte-ignore a11y_autofocus (Сохраняются публичный autoFocus и нативный autofocus.) -->
<button
  {...attributes}
  bind:this={nativeElement}
  type="button"
  role="switch"
  id={props.id ?? field?.id}
  name={fieldName}
  style={rootStyle}
  disabled={resolvedDisabled}
  aria-checked={resolvedChecked}
  aria-busy={props.loading || undefined}
  aria-label={attributes['aria-label']
      ?? (attributes['aria-labelledby']
        ? undefined
        : field?.label)}
  aria-required={attributes['aria-required'] ?? (field?.required || undefined)}
  aria-invalid={field?.status === 'error' || attributes['aria-invalid'] || undefined}
  aria-describedby={[attributes['aria-describedby'], field
      ?.describedBy]
      .filter(Boolean)
      .join(
        ' '
      )
      || undefined}
  autofocus={props.autoFocus ?? props.autofocus}
  tabindex={props.tabIndex ?? props.tabindex}
  class={[
      prefix,
      resolvedChecked && `${prefix}-checked`,
      resolvedDisabled && `${prefix}-disabled`,
      props.loading && `${prefix}-loading`,
      isSmall && `${prefix}-small`,
      config.direction === 'rtl' && `${prefix}-rtl`,
      config.switch?.class,
      props.class,
      props.rootClassName,
      contextClasses?.root,
      localClasses?.root
    ]}
  onclick={handleClick}
  onkeydown={handleKeyDown}
  onfocus={event => {
    props.onFocus?.(event);
    if (alive) props.onfocus?.(event);
  }}
  onblur={handleBlur}
>
  <span class={[`${prefix}-handle`, contextClasses?.indicator, localClasses?.indicator]}
    style={[contextStyles?.indicator, localStyles?.indicator].filter(Boolean).join(';') || undefined}
    aria-hidden="true">
    {#if props.loading}<span class={`${prefix}-loading-icon anticon`}><Icon name="loading" /></span>{/if}
  </span>
  <span class={`${prefix}-inner`} aria-hidden="true">
    <span class={[`${prefix}-inner-checked`, contextClasses?.content, localClasses?.content]}
      style={[contextStyles?.content, localStyles?.content].filter(Boolean).join(';') || undefined}>
      {#if typeof props.checkedChildren === 'function'}{@render props.checkedChildren()}
      {:else}{props.checkedChildren ?? ''}{/if}
    </span>
    <span class={[`${prefix}-inner-unchecked`, contextClasses?.content, localClasses?.content]}
      style={[contextStyles?.content, localStyles?.content].filter(Boolean).join(';') || undefined}>
      {#if typeof props.unCheckedChildren === 'function'}{@render props.unCheckedChildren()}
      {:else}{props.unCheckedChildren ?? ''}{/if}
    </span>
  </span>
  {#if fieldName && resolvedChecked}<input type="hidden" name={fieldName} value="on" disabled={resolvedDisabled} form={attributes.form} />{/if}
</button>
