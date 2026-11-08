<script lang="ts">
  import { onDestroy, onMount, untrack } from 'svelte';
  import { useConfig } from './config-context';
  import { useComponentTheme } from './theme-component.svelte';
  import { useWave } from './wave.svelte';
  import { useForm, useFormField } from './form-context';
  import { useRadioGroup, useRadioOptionType } from './radio-context';
  import { connectRadio, syncRadioPeers } from './radio.dom';
  import { createCheckableClickLock } from './checkable.dom';
  import type { RadioChangeEvent, RadioProps } from './radio.types';

  let {
    checked = $bindable<boolean | undefined>(),
    nativeElement = $bindable(),
    inputElement = $bindable(),
    ref = $bindable(),
    ...props
  }: RadioProps = $props();

  const config = useConfig();
  const componentTheme = useComponentTheme('Radio');
  const wave = useWave('Radio', () => resolvedDisabled);
  const form = useForm();
  const field = useFormField(() => ref);
  const group = useRadioGroup();
  const optionType = useRadioOptionType();
  const initialDefault = untrack(() => props.defaultChecked ?? false);
  const resets = new Set<ReturnType<typeof setTimeout>>();
  const clickLock = createCheckableClickLock();
  let alive = true;
  let control = $derived(inputElement);
  let value = $derived(props.value ?? 'on');
  let button = $derived((group?.optionType || optionType) === 'button');
  let prefix = $derived(`${props.prefixCls ?? 'ant-radio'}${button ? '-button' : ''}`);
  let resolvedChecked = $derived(group ? group.value === value : checked ?? initialDefault);
  let resolvedDefault = $derived(group ? group.defaultValue === value : initialDefault);
  let resolvedDisabled = $derived(
    group
      ? group.disabled || Boolean(props.disabled)
      : props.disabled ?? field?.disabled ?? form?.disabled ?? config.componentDisabled
  );
  let nativeGroup = $derived({ name: group?.name ?? props.name ?? field?.name, form: props.form });
  let info = $derived({ props: {
    ...props,
    checked: resolvedChecked,
    value,
    disabled: resolvedDisabled,
    name: nativeGroup.name
  } });
  let contextClasses = $derived(typeof config.radio?.classNames === 'function'
    ? config.radio.classNames(info) : config.radio?.classNames);
  let localClasses = $derived(typeof props.classNames === 'function'
    ? props.classNames(info) : props.classNames);
  let contextStyles = $derived(typeof config.radio?.styles === 'function'
    ? config.radio.styles(info) : config.radio?.styles);
  let localStyles = $derived(typeof props.styles === 'function'
    ? props.styles(info) : props.styles);
  let rootStyle = $derived([
    componentTheme.style,
    contextStyles?.root,
    config.radio?.style,
    localStyles?.root,
    props.style
  ].filter(Boolean).join(';') || undefined);
  const owned = new Set([
    'checked', 'defaultChecked', 'value', 'children', 'onCheckedChange', 'onChange',
    'disabled', 'id', 'name', 'title', 'style', 'class', 'rootClassName', 'prefixCls',
    'classNames', 'styles', 'nativeElement', 'inputElement', 'ref', 'autoFocus', 'tabIndex',
    'onClick', 'onFocus', 'onBlur', 'onKeyDown', 'onKeyPress', 'onMouseEnter', 'onMouseLeave',
    'onchange', 'onblur', 'onclick', 'onfocus', 'onkeydown', 'onkeypress', 'aria-invalid'
  ]);
  let attributes = $derived(Object.fromEntries(Object.entries(props)
    .filter(([key]) => !owned.has(key))));

  $effect(() => {
    if (!control || group) return;

    return connectRadio(control, (next) => {
      checked = next;
    });
  });

  onMount(() => {
    if (props.autoFocus) inputElement?.focus();
  });

  $effect(() => {
    const input = control;
    if (!input || !group) return;

    return group.register(input, value);
  });

  $effect(() => {
    const input = control;
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
      // Ref может пройти через $state proxy владельца; DOM-ссылки сохраняют identity.
      if (ref?.input === input && ref.nativeElement === root) ref = undefined;
    };
  });

  $effect(() => {
    if (control && !group && resolvedChecked && nativeGroup.name) {
      const input = control;

      // Нативное снятие соседнего radio не вызывает у него change.
      untrack(() => syncRadioPeers(input));
    }
  });

  onDestroy(() => {
    alive = false;
    clickLock.destroy();
    for (const reset of resets) clearTimeout(reset);
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
    const change: RadioChangeEvent = {
      target: { ...info.props, type: 'radio', checked: next },
      nativeEvent: event,
      stopPropagation: () => event.stopPropagation(),
      preventDefault: () => event.preventDefault()
    };

    if (!group) {
      checked = next;
      props.onCheckedChange?.(next);
    }
    if (!alive) return;

    props.onChange?.(change);
    if (!alive) return;

    if (group && next) group.select(value, change);
    if (alive) props.onchange?.(event);
  }

  function handleBlur(event: FocusEvent & { currentTarget: EventTarget & HTMLInputElement; }) {
    field?.onBlur();
    if (!alive) return;

    props.onBlur?.(event);
    if (alive) props.onblur?.(event);
  }

  function handleReset(event: Event) {
    const input = control;

    if (group || !input || event.target !== input.form) return;

    const reset = setTimeout(() => {
      resets.delete(reset);

      if (event.defaultPrevented || !input.isConnected || input !== control) return;

      checked = input.checked;
    }, 0);
    resets.add(reset);
  }
</script>

<style>
  .ant-radio-label { min-width: 0; overflow-wrap: anywhere; }
</style>

<svelte:document onreset={handleReset} />

<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_noninteractive_element_interactions (Label блокирует повторный click; клавиатурой и фокусом управляет native input.) -->
<label class={[
    `${prefix}-wrapper ant-radio-css-var`,
    componentTheme.className,
    button && 'ant-radio-button-css-var',
    resolvedChecked && `${prefix}-wrapper-checked`,
    resolvedDisabled && `${prefix}-wrapper-disabled`,
    config.direction === 'rtl' && `${prefix}-wrapper-rtl`,
    group?.block && `${prefix}-wrapper-block`,
    field && `${prefix}-wrapper-in-form-item`,
    config.radio?.class,
    props.class,
    props.rootClassName,
    contextClasses?.root,
    localClasses?.root
  ]} style={rootStyle} title={props.title} {@attach wave}
  onclick={clickLock.label}
  onmouseenter={event => props.onMouseEnter?.(event)}
  onmouseleave={event => props.onMouseLeave?.(event)}>
  <span bind:this={nativeElement} class={[
      prefix,
      !button && 'ant-wave-target',
      resolvedChecked && `${prefix}-checked`,
      resolvedDisabled && `${prefix}-disabled`,
      contextClasses?.icon,
      localClasses?.icon
    ]} style={[contextStyles?.icon, localStyles?.icon].filter(Boolean).join(';') || undefined}>
    <!-- svelte-ignore a11y_autofocus (Сохраняется публичный autoFocus/HTML autofocus.) -->
    <input
      {...attributes}
      bind:this={inputElement}
      type="radio"
      class={`${prefix}-input`}
      id={props.id ?? field?.id}
      name={nativeGroup.name}
      form={nativeGroup.form}
      value={String(value)}
      defaultChecked={resolvedDefault}
      checked={resolvedChecked}
      disabled={resolvedDisabled}
      required={group ? group.required || props.required : props.required ?? field?.required}
      autofocus={props.autoFocus ?? props.autofocus}
      tabindex={props.tabIndex ?? props.tabindex}
      aria-checked={resolvedChecked}
      data-ant-form-invalid={!group
          && (field?.invalid || field?.status === 'error'
            || props['aria-invalid'] === true
            || props['aria-invalid'] === 'true')
          || undefined}
      aria-describedby={[attributes['aria-describedby'], field?.describedBy].filter(
          Boolean
        )
          .join(
            ' '
          )
          || undefined}
      onchange={handleChange}
      onblur={handleBlur}
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
      }}
    />
  </span>
  {#if props.children}
    <span class={[`${prefix}-label`, contextClasses?.label, localClasses?.label]}
      style={[contextStyles?.label, localStyles?.label].filter(Boolean).join(';') || undefined}>
      {@render props.children()}
    </span>
  {/if}
</label>
