<script lang="ts" generics="Value extends InputNumberValue = number">
  import { onDestroy, untrack } from 'svelte';
  import { useConfig } from './config-context';
  import { useVariant } from './variant.svelte';
  import { useComponentTheme } from './theme-component.svelte';
  import { getInputNumberPrefixCss } from './input-number-prefix.engine';
  import ThemeScopeStyle from './ThemeScopeStyle.svelte';
  import { useCompact } from './space-compact-context';
  import { compactClasses } from './space-compact.engine';
  import { useForm, useFormField } from './form-context';
  import { useFormItemStatusContext } from './form-item-status';
  import { useFormFeedback } from './form-feedback-context';
  import FormFeedbackIcon from './FormFeedbackIcon.svelte';
  import { formatInputNumber, normalizeInputNumber } from './input-number.engine';
  import {
    commitInputNumberValue,
    inputNumberDecimal,
    inputNumberValue,
    isInputNumberValueInRange,
    parseInputNumberValue,
    resolveInputNumberValueOptions,
    stepInputNumberValue
  } from './input-number-value.engine';
  import { getDecupleSteps, getNumberPrecision, validateNumber } from './decimal-format.engine';
  import { toFixed, type MiniDecimal } from './mini-decimal.engine';
  import {
    createInputNumberRef,
    focusInputNumber,
    recordInputNumberCursor,
    restoreInputNumberCursor
  } from './input-number.dom';
  import type {
    InputNumberFocusOptions,
    InputNumberProps,
    InputNumberSlots,
    InputNumberStepInfo,
    InputNumberValue
  } from './input-number.types';
  import { ruRU } from './types';
  import InputNumberAction from './InputNumberAction.svelte';

  let {
    value = $bindable(),
    inputElement = $bindable(),
    nativeElement = $bindable(),
    ref = $bindable(),
    ...props
  }: InputNumberProps<Value> = $props();
  const config = useConfig();
  const variantContext = useVariant('inputNumber', () => props);
  const componentTheme = useComponentTheme('InputNumber');
  const compact = useCompact();
  const form = useForm();
  const field = useFormField(() => ref);
  const itemStatus = useFormItemStatusContext();
  const feedback = useFormFeedback();
  const generatedId = $props.id();
  const initialDefault = untrack(() => props.defaultValue);
  const resets = new Set<ReturnType<typeof setTimeout>>();
  let focused = $state(false);
  let composing = false;
  let alive = true;
  let userTyping = false;
  let shiftKey = false;
  let cursor: ReturnType<typeof recordInputNumberCursor>;
  let frame: number | undefined;
  let previousValue = untrack(() => value);
  let previousPrecision = untrack(() => props.precision);
  let previousFormatter = untrack(() => props.formatter);
  let previousReset = untrack(() => form?.resetKey);
  let decimal = $derived(inputNumberDecimal(value === undefined ? initialDefault : value,
    props.stringMode ?? false));
  let options = $derived(resolveInputNumberValueOptions(props));
  let precision = $derived(options.precision);
  let resolvedValue = $derived(inputNumberValue(decimal, props.stringMode ?? false));
  let size = $derived(props.size ?? compact?.size ?? config.componentSize);
  let status = $derived(props.status ?? ('status' in itemStatus ? itemStatus.status : field?.status));
  let disabled = $derived(props.disabled ?? field?.disabled ?? form?.disabled
    ?? config.componentDisabled);
  let readonly = $derived(props.readonly ?? props.readOnly);
  let prefixCls = $derived(config.getPrefixCls('input-number', props.prefixCls));
  let prefixCss = $derived(getInputNumberPrefixCss(prefixCls));
  let variant = $derived(variantContext.variant);
  let mode = $derived(props.mode ?? 'input');
  let controls = $derived(props.controls !== false && !disabled && !readonly);
  let icons = $derived(typeof props.controls === 'object' ? props.controls : {});
  let controlId = $derived(props.id ?? field?.id ?? `ant-input-number-${generatedId}`);
  let fieldName = $derived(props.name ?? field?.name);
  // ARIA сериализуется из decimal string: Number потерял бы точность stringMode.
  let numericAria: Record<string, InputNumberValue | undefined> = $derived({
    'aria-valuenow': resolvedValue ?? undefined,
    'aria-valuemin': options.min
      ? inputNumberValue(options.min, props.stringMode ?? false) ?? undefined : undefined,
    'aria-valuemax': options.max
      ? inputNumberValue(options.max, props.stringMode ?? false) ?? undefined : undefined
  });
  let upValue = $derived(stepInputNumberValue(decimal, 1, options));
  let downValue = $derived(stepInputNumberValue(decimal, -1, options));
  let editor = $state.raw(untrack(() => ({ text: formatValue(decimal), dirty: false })));
  let parsed = $derived(parseInputNumberValue(editor.text, props));
  let outOfRange = $derived(!decimal.isInvalidate() && !isInputNumberValueInRange(decimal, options)
    || !parsed.isInvalidate() && !isInputNumberValueInRange(parsed, options));
  let blurState = untrack(captureBlurState);
  let info = $derived({ props: {
    ...props,
    value,
    size,
    disabled,
    controls: controls ? props.controls ?? true : false
  } } as { props: InputNumberProps<InputNumberValue>; });
  let contextClasses = $derived(typeof config.inputNumber?.classNames === 'function'
    ? config.inputNumber.classNames(info) : config.inputNumber?.classNames);
  let localClasses = $derived(typeof props.classNames === 'function'
    ? props.classNames(info) : props.classNames);
  let contextStyles = $derived(typeof config.inputNumber?.styles === 'function'
    ? config.inputNumber.styles(info) : config.inputNumber?.styles);
  let localStyles = $derived(typeof props.styles === 'function'
    ? props.styles(info) : props.styles);
  let classes = $derived(mergeSlots({ root: componentTheme.className }, contextClasses, localClasses));
  let styles = $derived(mergeSlots({ root: componentTheme.style }, contextStyles,
    { root: config.inputNumber?.style },
    localStyles, { root: props.style }, ';'));
  const owned = new Set([
    'value', 'defaultValue', 'stringMode', 'min', 'max', 'step', 'precision', 'decimalSeparator',
    'formatter', 'parser', 'controls', 'keyboard', 'changeOnWheel', 'changeOnBlur', 'mode', 'size',
    'status', 'variant', 'readOnly', 'readonly', 'disabled', 'prefix', 'suffix',
    'rootClassName', 'prefixCls', 'class', 'style', 'classNames',
    'styles', 'name',
    'inputElement', 'nativeElement', 'ref', 'autoFocus', 'autoComplete', 'tabIndex', 'maxLength',
    'onValueChange', 'onChange', 'onInput', 'onStep', 'onPressEnter', 'onFocus', 'onBlur',
    'onKeyDown',
    'onKeyUp', 'onMouseDown', 'onClick', 'onMouseUp', 'onMouseLeave', 'onMouseMove', 'onMouseEnter',
    'onMouseOut', 'oninput', 'onkeydown', 'onkeyup', 'onfocus', 'onblur', 'oncompositionstart',
    'oncompositionend', 'onbeforeinput'
  ]);
  let attributes = $derived(Object.fromEntries(Object.entries(props)
    .filter(([key]) => !owned.has(key))));

  function mergeSlots(
    a?: InputNumberSlots,
    b?: InputNumberSlots,
    c?: InputNumberSlots,
    d?: InputNumberSlots,
    e?: InputNumberSlots,
    separator = ' '
  ) {
    const result: InputNumberSlots = {};

    for (const slots of [a, b, c, d, e]) {
      for (const [name, text] of Object.entries(slots ?? {})) {
        const key = name as keyof InputNumberSlots;
        result[key] = [result[key], text].filter(Boolean).join(separator);
      }
    }

    return result;
  }

  $effect.pre(() => {
    // Native blur при удалении DOM предшествует teardown внешнего keyed block.
    // Обработчик использует последний действующий render, как closure rc-input-number.
    blurState = captureBlurState();
  });

  $effect.pre(() => {
    const current = value;
    const nextPrecision = props.precision;
    const formatter = props.formatter;
    const resetKey = form?.resetKey;
    const changed = !Object.is(current, previousValue);
    const formatted = nextPrecision !== previousPrecision || formatter !== previousFormatter;

    if (changed || formatted || resetKey !== previousReset) {
      untrack(() => {
        const next = parseInputNumberValue(editor.text, props);
        const nonFinite = typeof current === 'number' && !Number.isFinite(current);

        if (!changed || formatted || resetKey !== previousReset || nonFinite
          || !decimal.equals(next) || !userTyping || formatter) {
          editor = { text: formatValue(decimal, changed && userTyping), dirty: false };
        }
      });
    }

    previousValue = current;
    previousPrecision = nextPrecision;
    previousFormatter = formatter;
    previousReset = resetKey;
  });

  $effect(() => {
    const input = inputElement;
    const root = nativeElement;
    if (!input || !root) return;

    const handle = createInputNumberRef(input, root);
    ref = handle;

    return () => { if (ref === handle) ref = undefined; };
  });

  $effect(() => {
    const input = inputElement;
    if (!input) return;

    input.setCustomValidity(!disabled && !readonly && (parsed.isNaN() || outOfRange)
      ? config.locale.inputNumber?.invalidNumber ?? ruRU.inputNumber.invalidNumber : '');

    return () => input.setCustomValidity('');
  });

  $effect(() => {
    void editor.text;
    untrack(() => {
      if (props.formatter && focused) restoreInputNumberCursor(inputElement, cursor);
    });
  });

  $effect(() => {
    const input = inputElement;
    if (!props.changeOnWheel || !focused || !input) return;

    function wheel(event: WheelEvent) {
      changeStep(event.deltaY < 0 ? 1 : -1, 'wheel');
      event.preventDefault();
    }

    input.addEventListener('wheel', wheel, { passive: false });

    return () => input.removeEventListener('wheel', wheel);
  });

  onDestroy(() => {
    alive = false;
    for (const reset of resets) clearTimeout(reset);
    if (frame !== undefined) inputElement?.ownerDocument.defaultView?.cancelAnimationFrame(frame);
  });

  export function focus(options?: InputNumberFocusOptions) {
    focusInputNumber(inputElement, options);
  }

  export function blur() {
    inputElement?.blur();
  }

  function formatValue(current: MiniDecimal, typing = false, input?: string): string {
    const text = current.isInvalidate() ? current.toString(false) : current.toString(!typing);

    if (props.formatter) {
      return props.formatter(text, {
        userTyping: typing,
        input: input ?? untrack(() => inputElement?.value ?? '')
      });
    }
    if (typing) return text;
    if (!props.stringMode) {
      const number = formatInputNumber(current.isInvalidate() ? null
        : normalizeInputNumber(current.toNumber()), precision);

      return props.decimalSeparator ? number.replace('.', props.decimalSeparator) : number;
    }
    if (!validateNumber(text)) return text;

    const digits = precision ?? Math.max(getNumberPrecision(text),
      getNumberPrecision(untrack(() => props.step ?? 1)));

    return toFixed(text, props.decimalSeparator || '.', digits);
  }

  function captureBlurState() {
    return { props: { ...props }, decimal, options, disabled, readonly, resolvedValue };
  }

  function publish(next: MiniDecimal, snapshot?: ReturnType<typeof captureBlurState>) {
    const currentProps = snapshot?.props ?? props;
    const current = snapshot ? snapshot.resolvedValue : resolvedValue;
    const result = inputNumberValue(next, currentProps.stringMode ?? false) as Value | null;
    if (result === current) return;

    value = result;
    previousValue = snapshot ? result : value;
    currentProps.onChange?.(result);
    if (alive) currentProps.onValueChange?.(result);
  }

  function collect(text: string) {
    cursor = recordInputNumberCursor(inputElement);
    editor = { text, dirty: true };

    if (!composing) {
      const next = commitInputNumberValue(parseInputNumberValue(text, props), options, true);

      if (next) {
        publish(next);
        if (!alive) return;

        if (props.formatter
          && inputNumberValue(next, props.stringMode ?? false) === resolvedValue) {
          editor = { text: formatValue(next, true, text), dirty: true };
        }
      }
    }

    if (!alive) return;
    blurState = captureBlurState();
    props.onInput?.(text);
    if (!alive) return;

    const view = inputElement?.ownerDocument.defaultView;
    if (!view) return;
    if (frame !== undefined) view.cancelAnimationFrame(frame);

    frame = view.requestAnimationFrame(() => {
      frame = undefined;
      if (!props.parser && text.includes('。')) collect(text.replace(/。/g, '.'));
    });
  }

  function flush(snapshot?: ReturnType<typeof captureBlurState>, input?: HTMLInputElement) {
    const current = snapshot ?? captureBlurState();
    if (!editor.dirty && !current.props.stringMode || composing
      || current.disabled || current.readonly) return;

    const next = parseInputNumberValue(editor.text, current.props);
    const committed = commitInputNumberValue(next.isNaN() ? current.decimal : next,
      current.options, false);

    if (committed) publish(committed, snapshot);
    if (!alive) return;

    if (snapshot && input) {
      editor = { text: editor.text, dirty: false };
      queueMicrotask(() => {
        if (!alive || !input.isConnected) return;

        previousValue = value;
        editor = { text: formatValue(decimal), dirty: false };
      });
    } else editor = { text: formatValue(decimal), dirty: false };
  }

  function changeStep(direction: 1 | -1, emitter: InputNumberStepInfo['emitter']) {
    if (disabled || readonly || composing) return;

    const next = stepInputNumberValue(decimal, direction, options, shiftKey);
    if (!next) return;

    userTyping = false;
    publish(next);
    if (!alive) return;

    editor = { text: formatValue(decimal), dirty: false };
    props.onStep?.(inputNumberValue(next, props.stringMode ?? false) as Value, {
      offset: shiftKey ? getDecupleSteps(options.step) : options.step,
      type: direction === 1 ? 'up' : 'down',
      emitter
    });
    if (alive) inputElement?.focus();
  }

  function handleInput(event: Event & { currentTarget: EventTarget & HTMLInputElement; }) {
    if (disabled || readonly) return;

    collect(event.currentTarget.value);
    if (alive) props.oninput?.(event);
  }

  function handleKeydown(
    event: KeyboardEvent & { currentTarget: EventTarget & HTMLInputElement; }
  ) {
    props.onKeyDown?.(event);
    if (!alive) return;

    props.onkeydown?.(event);
    if (!alive || event.defaultPrevented || event.isComposing
      || composing || disabled || readonly) return;

    userTyping = true;
    shiftKey = event.shiftKey;
    if (event.key === 'Enter') {
      userTyping = false;
      flush();
      if (!alive) return;

      props.onPressEnter?.(event);
    }
    if (props.keyboard !== false && ['Up', 'Down', 'ArrowUp', 'ArrowDown'].includes(event.key)) {
      event.preventDefault();
      changeStep(event.key === 'Up' || event.key === 'ArrowUp' ? 1 : -1, 'keyboard');
    }
  }

  function handleKeyup(event: KeyboardEvent & { currentTarget: EventTarget & HTMLInputElement; }) {
    userTyping = false;
    shiftKey = false;
    props.onKeyUp?.(event);
    if (alive) props.onkeyup?.(event);
  }

  function handleFocus(event: FocusEvent & { currentTarget: EventTarget & HTMLInputElement; }) {
    if (!alive || !event.currentTarget.isConnected) return;

    focused = true;
    props.onFocus?.(event);
    if (alive) props.onfocus?.(event);
  }

  function handleBlur(event: FocusEvent & { currentTarget: EventTarget & HTMLInputElement; }) {
    if (!alive || !event.currentTarget.isConnected) return;

    const current = blurState;
    if (current.props.changeOnBlur !== false) flush(current, event.currentTarget);
    if (!alive) return;

    focused = false;
    userTyping = false;
    field?.onBlur();
    current.props.onBlur?.(event);
    if (alive) current.props.onblur?.(event);
  }

  function handleReset(event: Event) {
    const input = inputElement;
    if (!input || event.target !== input.form) return;

    const reset = setTimeout(() => {
      resets.delete(reset);
      if (event.defaultPrevented || !input.isConnected || input !== inputElement) return;

      composing = false;
      userTyping = false;
      value = inputNumberValue(inputNumberDecimal(initialDefault, props.stringMode ?? false),
        props.stringMode ?? false) as Value | null;
      previousValue = value;
      editor = { text: formatValue(decimal), dirty: false };
    }, 0);
    resets.add(reset);
  }
</script>

<style>
  .input-number-root { max-width: 100%; height: var(--ant-control-height); min-height: calc(var(--ant-input-number-input-font-size) * var(--ant-line-height) + var(--ant-input-number-padding-block) * 2 + var(--ant-line-width) * 2); }
  .input-number-root[data-ant-input-number-size='large'] { height: var(--ant-control-height-lg); min-height: calc(var(--ant-input-number-input-font-size-lg) * var(--ant-line-height-lg) + var(--ant-input-number-padding-block-lg) * 2 + var(--ant-line-width) * 2); }
  .input-number-root[data-ant-input-number-size='small'] { height: var(--ant-control-height-sm); min-height: calc(var(--ant-input-number-input-font-size-sm) * var(--ant-line-height) + var(--ant-input-number-padding-block-sm) * 2 + var(--ant-line-width) * 2); }
  .input-number-input { min-width: 0; height: 100%; }
  .input-number-root .input-number-suffix { height: auto; }
  @media (prefers-reduced-motion: reduce) {
    .input-number-root, .input-number-input, .input-number-actions { transition: none; }
  }
</style>

{#snippet action(direction: 'up' | 'down')}
  <InputNumberAction {prefixCls} action={direction} disabled={direction === 'up' ? !upValue : !downValue}
    {controlId} content={direction === 'up' ? icons.upIcon : icons.downIcon} spinner={mode === 'spinner'}
    class={classes.action} style={styles.action}
    onStep={() => changeStep(direction === 'up' ? 1 : -1, 'handler')} />
{/snippet}

<svelte:document onreset={handleReset} />
{#if prefixCss}<ThemeScopeStyle css={prefixCss} scope={`input-number-prefix:${prefixCls}`} />{/if}<!-- svelte-ignore a11y_no_static_element_interactions, a11y_click_events_have_key_events, a11y_mouse_events_have_key_events (Mouse callbacks принадлежат root; клавиатурой и фокусом управляет native input.) --><div bind:this={nativeElement} class={[
  prefixCls, 'ant-input-number-css-var', 'input-number-root', `${prefixCls}-${variant}`,
  `${prefixCls}-mode-${mode}`, disabled && `${prefixCls}-disabled`, readonly && `${prefixCls}-readonly`,
  focused && !disabled && `${prefixCls}-focused`, focused && `${prefixCls}-mode-${mode}-focused`,
  size === 'large' && `${prefixCls}-lg`, size === 'small' && `${prefixCls}-sm`,
  status && `${prefixCls}-status-${status}`, outOfRange && `${prefixCls}-out-of-range`,
  decimal.isNaN() && `${prefixCls}-not-a-number`, config.direction === 'rtl' && `${prefixCls}-rtl`,
  feedback.hasFeedback && `${prefixCls}-has-feedback`,
  feedback.isFormItemInput && `${prefixCls}-in-form-item`, !controls && `${prefixCls}-without-controls`,
  compactClasses(prefixCls, config.direction, compact), config.inputNumber?.class,
  props.class, props.rootClassName, classes.root
]} style={styles.root} data-ant-number-theme={config.theme.mode}
  data-ant-input-number-prefix={prefixCss ? prefixCls : undefined}
  data-ant-input-number-size={size}
  onmousedown={event => {
    if (!alive) return;

    if (inputElement && event.target !== inputElement) {
      inputElement.focus();
      event.preventDefault();
    }
    if (alive) props.onMouseDown?.(event);
  }} onclick={event => { if (alive) props.onClick?.(event); }}
  onmouseup={event => { if (alive) props.onMouseUp?.(event); }}
  onmouseleave={event => { if (alive) props.onMouseLeave?.(event); }}
  onmousemove={event => { if (alive) props.onMouseMove?.(event); }}
  onmouseenter={event => { if (alive) props.onMouseEnter?.(event); }}
  onmouseout={event => { if (alive) props.onMouseOut?.(event); }}>
  {#if mode === 'spinner' && controls}{@render action('down')}{/if}
  {#if props.prefix !== undefined}
    <div class={[`${prefixCls}-prefix`, classes.prefix]} style={styles.prefix}>
      {#if typeof props.prefix === 'function'}{@render props.prefix()}{:else}{props.prefix}{/if}
    </div>
  {/if}
  <!-- svelte-ignore a11y_autofocus (Публичный autoFocus/HTML autofocus сохраняет выбор потребителя.) -->
  <input {...attributes} {...numericAria} bind:this={inputElement} id={controlId} type={props.type ?? 'text'}
    role="spinbutton" class={[`${prefixCls}-input`, 'input-number-input', classes.input]}
    style={styles.input} value={editor.text}
    inputmode={props.inputmode ?? (precision === 0 ? 'numeric' : 'decimal')}
    autocomplete={props.autoComplete ?? props.autocomplete ?? 'off'}
    autofocus={props.autoFocus ?? props.autofocus} tabindex={props.tabIndex ?? props.tabindex}
    maxlength={props.maxLength ?? props.maxlength} step={options.step}
    required={props.required ?? field?.required} {disabled} {readonly}
    aria-label={props['aria-label'] ?? (props['aria-labelledby'] ? undefined : field?.label)}
    aria-invalid={field?.invalid || status === 'error' || props['aria-invalid'] || undefined}
    aria-describedby={[props['aria-describedby'], field?.describedBy].filter(Boolean).join(' ') || undefined}
    oninput={handleInput} onkeydown={handleKeydown} onkeyup={handleKeyup}
    onfocus={handleFocus} onblur={handleBlur}
    onbeforeinput={event => {
      userTyping = true;
      props.onbeforeinput?.(event);
    }}
    oncompositionstart={event => {
      composing = true;
      props.oncompositionstart?.(event);
    }}
    oncompositionend={event => {
      composing = false;
      if (!disabled && !readonly) collect(event.currentTarget.value);
      if (alive) props.oncompositionend?.(event);
    }} />
  {#if props.suffix !== undefined || feedback.hasFeedback}
    <div class={[`${prefixCls}-suffix`, 'input-number-suffix', classes.suffix]} style={styles.suffix}>
      {#if typeof props.suffix === 'function'}{@render props.suffix()}{:else}{props.suffix}{/if}{#if feedback.hasFeedback && feedback.icon}<FormFeedbackIcon descriptor={feedback.icon} />{/if}
    </div>
  {/if}
  {#if mode === 'spinner' && controls}{@render action('up')}
  {:else if controls}
    <div class={[`${prefixCls}-actions`, 'input-number-actions', classes.actions]} style={styles.actions}>
      {@render action('up')}{@render action('down')}
    </div>
  {/if}
  {#if fieldName}
    <input type="hidden" name={fieldName} value={resolvedValue ?? ''} {disabled} form={props.form} />
  {/if}
</div>
