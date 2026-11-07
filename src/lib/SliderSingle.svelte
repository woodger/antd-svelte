<script lang="ts">
  import { onDestroy, onMount, untrack } from 'svelte';
  import type { SliderSingleProps } from './slider.types';
  import { useConfig } from './config-context';
  import { useComponentTheme } from './theme-component.svelte';
  import { useForm, useFormField } from './form-context';
  import {
    getSliderDirection,
    getSliderKeyValue,
    getSliderRatio,
    normalizeSliderValue,
    resolveSliderOptions,
    type SliderDirection,
    type SliderOptions
  } from './slider.engine';
  import {
    createSliderRangeOffset,
    sliderRangeKey,
    sliderRangeMarks,
    sliderRangePosition
  } from './slider-range.engine';
  import { sliderSemantics } from './slider-semantic.engine';
  import { getSliderPrefixCss } from './slider-prefix.engine';
  import ThemeScopeStyle from './ThemeScopeStyle.svelte';
  import TooltipPopup from './TooltipPopup.svelte';

  interface Interaction {
    kind: 'pointer' | 'key' | 'native';
    pointerId?: number;
    keys: Set<string>;
    expectedValue: number | undefined;
    options: SliderOptions;
    direction: SliderDirection;
    alignment: string | undefined;
    resetKey?: object;
    changed: boolean;
    canceled: boolean;
  }

  let {
    value = $bindable<number | undefined>(),
    ref = $bindable(),
    nativeElement = $bindable(),
    ...props
  }: SliderSingleProps = $props();
  let {
    defaultValue = 0,
    range,
    min,
    max,
    step,
    marks,
    dots,
    included = true,
    track,
    orientation: orientationProp,
    autoFocus,
    reverse = false,
    keyboard = true,
    tooltip,
    disabled,
    id,
    name,
    style,
    rootClassName,
    prefixCls,
    classNames,
    styles: semanticStyles,
    dotStyle,
    activeDotStyle,
    tabIndex,
    ariaLabelForHandle,
    ariaLabelledByForHandle,
    ariaRequired,
    ariaValueTextFormatterForHandle,
    onChange,
    onValueChange,
    onChangeComplete,
    oninput,
    onchange,
    onkeydown,
    onkeyup,
    onpointerdown,
    onpointerenter,
    onpointerleave,
    onlostpointercapture,
    onfocus,
    onblur,
    onFocus,
    onBlur,
    class: className = '',
    ...attributes
  } = $derived(props);
  const initialAutoFocus = untrack(() => autoFocus ?? props.autofocus);

  onMount(() => {
    ref = {
      get nativeElement() { return nativeElement; },
      focus: () => control?.focus(),
      blur: () => control?.blur()
    };
    if (initialAutoFocus) control?.focus();
    return () => { ref = undefined; };
  });

  const config = useConfig();
  const componentTheme = useComponentTheme('Slider');
  const form = useForm();
  const field = useFormField(() => ref);
  const initialDefault = untrack(() => defaultValue);
  const resets = new Set<ReturnType<typeof setTimeout>>();
  let control = $state<HTMLInputElement>();
  let handle = $state<HTMLDivElement>();
  let dragging = $state(false);
  let tooltipHovered = $state(false);
  let tooltipFocused = $state(false);
  let popupHovered = $state(false);
  let interaction: Interaction | null = null;
  let blurCallbacks: Pick<SliderSingleProps, 'onblur' | 'onBlur'> = {};
  let orientation = $derived(orientationProp ?? 'horizontal');
  let prefix = $derived(prefixCls || 'ant-slider');
  let customPrefix = $derived(prefix !== 'ant-slider');
  let prefixCss = $derived(getSliderPrefixCss(prefix));
  let options = $derived(resolveSliderOptions({ min, max, step: step ?? undefined }));
  let markEntries = $derived(sliderRangeMarks(marks));
  let hasDecorations = $derived(markEntries.length > 0 || Boolean(dots));
  let sourceAlignment = $derived(marks !== undefined || step === null);
  let alignment = $derived(sourceAlignment
    ? `${step === null ? 'null' : options.step}:${markEntries.map(mark => mark.value).join(',')}`
    : undefined);
  let offset = $derived(createSliderRangeOffset({
    ...options,
    step: step === null ? null : options.step,
    marks: markEntries,
    allowCross: true,
    pushable: false,
    disabled: false
  }));
  let resolvedValue = $derived(
    formatValue(value === undefined ? initialDefault : value)
  );
  let mergedDisabled = $derived(
    disabled ?? field?.disabled ?? form?.disabled ?? config.componentDisabled
  );
  let resolvedDisabled = $derived(typeof mergedDisabled === 'boolean'
    ? mergedDisabled : mergedDisabled[0] ?? false);
  let semantics = $derived(sliderSemantics<SliderSingleProps>({
    ...props, value, disabled: mergedDisabled
  }, config.slider, classNames, semanticStyles));
  let classes = $derived(semantics.classNames);
  let styles = $derived(semantics.styles);
  let stepDots = $derived.by(() => {
    const result = new Set(markEntries.map(mark => mark.value));
    if (dots && step !== null) {
      for (let point = options.min; point <= options.max; point += options.step) result.add(point);
    }
    return [...result];
  });
  let direction = $derived(getSliderDirection(orientation, reverse, config.direction === 'rtl'));
  let percentage = $derived(getSliderRatio(resolvedValue, options) * 100);
  let position = $derived(direction === 'rtl' || direction === 'btt'
    ? 100 - percentage
    : percentage);
  let trackStart = $derived(direction === 'rtl' || direction === 'btt' ? 100 - percentage : 0);
  let labelledBy = $derived(indexed(ariaLabelledByForHandle) ?? attributes['aria-labelledby']);
  let configuredTooltipOpen = $derived(tooltip === false ? false : tooltip?.open);
  let tooltipState = $derived(
    { ownerOpen: configuredTooltipOpen, disabled: resolvedDisabled, dismissed: false }
  );
  let tooltipTitle = $derived(
    tooltip === false || configuredTooltipOpen === false
      ? ''
      : tooltip?.formatter === null
        ? ''
        : tooltip?.formatter ? tooltip.formatter(resolvedValue) ?? '' : String(resolvedValue)
  );
  let tooltipOpen = $derived(
    !resolvedDisabled
    && !tooltipState.dismissed
    && configuredTooltipOpen !== false
    && (configuredTooltipOpen === true
      || tooltipHovered
      || tooltipFocused
      || popupHovered
      || dragging)
  );
  let tooltipPlacement = $derived(
    tooltip !== false
    && tooltip?.placement
    || (orientation === 'vertical'
      ? config.direction === 'rtl' ? 'left' : 'right'
      : 'top')
  );

  function runtime() {
    return {
      value,
      options,
      direction,
      alignment,
      disabled: resolvedDisabled,
      keyboard,
      resetKey: form?.resetKey
    };
  }

  function isCurrent(active: Interaction, current = runtime()): boolean {
    return !active.canceled && !current.disabled && !!control?.isConnected
      && Object.is(active.expectedValue, current.value)
      && active.options.min === current.options.min
      && active.options.max === current.options.max
      && active.options.step === current.options.step
      && active.alignment === current.alignment
      && active.direction === current.direction && active.resetKey === current.resetKey
      && (active.kind !== 'key' || current.keyboard);
  }

  $effect(() => {
    const input = control;
    const current = runtime();
    const next = resolvedValue;

    if (!input) return;

    // Нативный reset хранит defaults отдельно от текущего value; смена владельца отменяет захват.
    input.defaultValue = String(formatValue(initialDefault));
    input.value = String(next);

    if (interaction && !interaction.canceled && !isCurrent(interaction, current))
      cancelInteraction(true);
  });

  onDestroy(() => {
    cancelInteraction();
    for (const reset of resets)
      clearTimeout(reset);
  });

  function begin(kind: Interaction['kind'], pointerId?: number): Interaction {
    cancelInteraction();
    interaction = {
      kind,
      pointerId,
      keys: new Set(),
      expectedValue: value,
      options,
      direction,
      alignment,
      resetKey: form?.resetKey,
      changed: false,
      canceled: false
    };
    dragging = kind === 'pointer';
    tooltipState = { ...tooltipState, dismissed: false };

    return interaction;
  }

  function cancelInteraction(keepPointer = false) {
    const active = interaction;

    if (!active) return;

    active.canceled = true;
    if (!keepPointer || active.kind !== 'pointer')
      interaction = null;
    dragging = false;

    if (active.pointerId !== undefined && control?.hasPointerCapture(active.pointerId))
      control.releasePointerCapture(active.pointerId);
  }

  function finish(canceled = false) {
    const active = interaction;
    const notify = !canceled && active?.changed && isCurrent(active);
    const next = resolvedValue;

    cancelInteraction();

    if (notify)
      onChangeComplete?.(next);
  }

  function publish(next: number) {
    if (next === resolvedValue) return;

    if (interaction) {
      interaction.changed = true;
      interaction.expectedValue = next;
    }
    onChange?.(next);
    value = next;
    onValueChange?.(next);
  }

  function handleInput(event: Event & { currentTarget: EventTarget & HTMLInputElement; }) {
    if (resolvedDisabled || interaction?.canceled) {
      event.currentTarget.value = String(resolvedValue);
      return;
    }

    if (!interaction)
      begin('native');
    publish(formatValue(event.currentTarget.valueAsNumber));
    event.currentTarget.value = String(resolvedValue);
    oninput?.(event);
  }

  function handleChange(event: Event & { currentTarget: EventTarget & HTMLInputElement; }) {
    if (resolvedDisabled || interaction?.canceled) return;

    if (interaction?.kind === 'native')
      finish();
    onchange?.(event);
  }

  function handlePointerdown(
    event: PointerEvent & { currentTarget: EventTarget & HTMLInputElement; }
  ) {
    onpointerdown?.(event);

    if (event.defaultPrevented || resolvedDisabled) return;
    if (event.button !== 0 || !event.isPrimary) {
      event.preventDefault();
      return;
    }

    begin('pointer', event.pointerId);
  }

  function handlePointerup(event: PointerEvent) {
    if (interaction?.kind === 'pointer' && interaction.pointerId === event.pointerId)
      finish(event.defaultPrevented);
  }

  function handlePointercancel(event: PointerEvent) {
    if (interaction?.kind === 'pointer' && interaction.pointerId === event.pointerId)
      cancelInteraction();
  }

  function handleLostCapture(
    event: PointerEvent & { currentTarget: EventTarget & HTMLInputElement; }
  ) {
    onlostpointercapture?.(event);

    if (interaction?.kind === 'pointer' && interaction.pointerId === event.pointerId)
      cancelInteraction(true);
  }

  function handlePointerenter(
    event: PointerEvent & { currentTarget: EventTarget & HTMLInputElement; }
  ) {
    if (event.pointerType !== 'touch') {
      tooltipHovered = true;
      tooltipState = { ...tooltipState, dismissed: false };
    }
    onpointerenter?.(event);
  }

  function handlePointerleave(
    event: PointerEvent & { currentTarget: EventTarget & HTMLInputElement; }
  ) {
    tooltipHovered = false;
    onpointerleave?.(event);
  }

  function handleKeydown(
    event: KeyboardEvent & { currentTarget: EventTarget & HTMLInputElement; }
  ) {
    onkeydown?.(event);

    if (event.defaultPrevented || event.isComposing || resolvedDisabled) return;

    const change = sliderRangeKey(event.key, direction);
    const next = sourceAlignment && change !== undefined
      ? offset.offset([resolvedValue], change, 0).value
      : getSliderKeyValue(event.key, resolvedValue, options, direction);

    if (next === undefined) return;

    event.preventDefault();

    if (!keyboard || interaction?.kind === 'pointer') return;

    const active = interaction?.kind === 'key' ? interaction : begin('key');
    active.keys.add(event.key);
    publish(next);
  }

  function handleKeyup(event: KeyboardEvent & { currentTarget: EventTarget & HTMLInputElement; }) {
    onkeyup?.(event);

    if (interaction?.kind !== 'key' || !interaction.keys.delete(event.key)) return;
    if (!interaction.keys.size)
      finish(event.defaultPrevented);
  }

  function handleFocus(event: FocusEvent & { currentTarget: EventTarget & HTMLInputElement; }) {
    tooltipFocused = true;
    tooltipState = { ...tooltipState, dismissed: false };
    onFocus?.(event);
    onfocus?.(event);
  }

  function handleBlur(event: FocusEvent & { currentTarget: EventTarget & HTMLInputElement; }) {
    tooltipFocused = false;
    cancelInteraction(true);
    field?.onBlur();
    blurCallbacks.onBlur?.(event);
    blurCallbacks.onblur?.(event);
  }

  $effect.pre(() => {
    // Blur от remove() не должен читать уже уничтоженные spread props родителя.
    blurCallbacks = { onblur, onBlur };
  });

  function handleReset(event: Event) {
    const input = control;

    if (!input || event.target !== input.form) return;

    cancelInteraction(true);

    const reset = setTimeout(() => {
      resets.delete(reset);

      if (event.defaultPrevented || !input.isConnected || input !== control) return;

      value = formatValue(input.valueAsNumber);
    }, 0);
    resets.add(reset);
  }

  function indexed<T>(entry: T | readonly T[] | undefined): T | undefined {
    return Array.isArray(entry) ? entry[0] : entry as T | undefined;
  }

  function formatValue(next: number | undefined) {
    if (!sourceAlignment) return normalizeSliderValue(next, options);
    return offset.format(typeof next === 'number' && Number.isFinite(next) ? next : options.min);
  }

  function isIncluded(point: number) {
    return included && options.min <= point && point <= resolvedValue;
  }

  function decorationStyle(point: number) {
    return [
      sliderRangePosition(direction, point, options.min, options.max),
      typeof dotStyle === 'function' ? dotStyle(point) : dotStyle,
      isIncluded(point) && (typeof activeDotStyle === 'function'
        ? activeDotStyle(point) : activeDotStyle)
    ].filter(Boolean).join(';');
  }

  function handleMark(point: number) {
    if (resolvedDisabled) return;
    begin('native');
    publish(formatValue(point));
    finish();
  }
</script>

<style>
  [data-ant-slider-single] { min-width: 0; }
  [data-ant-slider-part="rail"], [data-ant-slider-part="track"], [data-ant-slider-part="handle"] { pointer-events: none; }
  [data-ant-slider-single="horizontal"] [data-ant-slider-part="handle"] { transform: translateX(-50%); }
  [data-ant-slider-single="vertical"] [data-ant-slider-part="handle"] { transform: translateY(-50%); }
  .slider-input { position: absolute; margin: 0; padding: 0; border: 0; opacity: 0; cursor: inherit; appearance: none; touch-action: none; }
  [data-ant-slider-single="horizontal"] .slider-input { left: calc(var(--ant-slider-handle-size) / -2); top: calc((var(--ant-slider-rail-size) * 3 - 32px) / 2); width: calc(100% + var(--ant-slider-handle-size)); height: 32px; }
  [data-ant-slider-single="vertical"] .slider-input { top: calc(var(--ant-slider-handle-size) / -2); left: calc((var(--ant-slider-rail-size) * 3 - 32px) / 2); height: calc(100% + var(--ant-slider-handle-size)); width: 32px; writing-mode: vertical-lr; }
  .slider-input::-webkit-slider-thumb { appearance: none; width: var(--ant-slider-handle-size); height: var(--ant-slider-handle-size); }
  .slider-input::-moz-range-thumb { width: var(--ant-slider-handle-size); height: var(--ant-slider-handle-size); border: 0; }
  .slider-mark { border: 0; padding: 0; background: transparent; font: inherit; line-height: inherit; }
  .slider-mark:not(:disabled) { cursor: pointer; }
  [data-ant-slider-single]:has(.slider-input:focus-visible) [data-ant-slider-part="handle"]::after { outline: 6px solid var(--ant-slider-handle-active-outline-color); box-shadow: 0 0 0 var(--ant-slider-handle-line-width-hover) var(--ant-slider-handle-active-color); }
  /* В source фокусируется div handle, в native adapter — input. */
  [data-ant-slider-single].ant-slider-css-var:has(.slider-input:focus) [data-ant-slider-part="handle"]::before {
    inset-inline-start: calc(((var(--ant-slider-handle-size-hover) - var(--ant-slider-handle-size)) / 2 + var(--ant-slider-handle-line-width-hover)) * -1);
    inset-block-start: calc(((var(--ant-slider-handle-size-hover) - var(--ant-slider-handle-size)) / 2 + var(--ant-slider-handle-line-width-hover)) * -1);
    width: calc(var(--ant-slider-handle-size-hover) + var(--ant-slider-handle-line-width-hover) * 2);
    height: calc(var(--ant-slider-handle-size-hover) + var(--ant-slider-handle-line-width-hover) * 2);
  }
  [data-ant-slider-single].ant-slider-css-var:has(.slider-input:focus) [data-ant-slider-part="handle"]::after {
    width: var(--ant-slider-handle-size-hover);
    height: var(--ant-slider-handle-size-hover);
    inset-inline-start: calc((var(--ant-slider-handle-size) - var(--ant-slider-handle-size-hover)) / 2);
    inset-block-start: calc((var(--ant-slider-handle-size) - var(--ant-slider-handle-size-hover)) / 2);
    box-shadow: 0 0 0 var(--ant-slider-handle-line-width-hover) var(--ant-slider-handle-active-color);
    outline: 6px solid var(--ant-slider-handle-active-outline-color);
  }
  @media (prefers-reduced-motion: reduce) {
    [data-ant-slider-single] [data-ant-slider-part="rail"], [data-ant-slider-single] [data-ant-slider-part="track"], [data-ant-slider-single] [data-ant-slider-part="handle"]::before, [data-ant-slider-single] [data-ant-slider-part="handle"]::after { transition: none; }
  }
</style>

<svelte:document onreset={handleReset} />
<svelte:window onpointerup={handlePointerup} onpointercancel={handlePointercancel} />

{#if prefixCss}<ThemeScopeStyle css={prefixCss} scope={`slider-prefix:${prefix}`} />{/if}
<div bind:this={nativeElement} class={[
    prefix,
    (componentTheme.className || hasDecorations || customPrefix) && 'ant-slider-css-var',
    componentTheme.className,
    `${prefix}-${orientation}`,
    resolvedDisabled && `${prefix}-disabled`,
    markEntries.length && `${prefix}-with-marks`,
    dragging && `${prefix}-lock`,
    config.direction === 'rtl' && `${prefix}-rtl`,
    className, config.slider?.class, rootClassName, classes.root
  ]} style={[componentTheme.style, styles.root].filter(Boolean).join(';') || undefined}
  data-ant-slider-single={orientation}
  data-ant-slider-prefix={customPrefix ? prefix : undefined}
  data-ant-slider-native={customPrefix && !componentTheme.className || undefined}
  data-ant-slider-theme={(hasDecorations || customPrefix) && !componentTheme.className
    ? config.theme.mode : undefined}
  data-ant-slider-primary={(hasDecorations || customPrefix) && !componentTheme.className
    ? config.theme.primary : undefined}>
  <div class={[`${prefix}-rail`, classes.rail]} data-ant-slider-part="rail" aria-hidden="true"
    style={styles.rail || undefined}></div>
  {#if included && track !== false}
    {#if classes.tracks || styles.tracks}
      <div class={[`${prefix}-tracks`, classes.tracks]} aria-hidden="true"
        style={[orientation === 'horizontal'
          ? `left:${trackStart}%;width:${percentage}%`
          : `top:${trackStart}%;height:${percentage}%`, styles.tracks].filter(Boolean).join(';')}></div>
    {/if}
    <div class={[`${prefix}-track`, `${prefix}-track-1`, classes.track]} data-ant-slider-part="track"
      aria-hidden="true" style={[
      orientation === 'horizontal'
      ? `left:${trackStart}%;width:${percentage}%`
      : `top:${trackStart}%;height:${percentage}%`, styles.track
    ].filter(Boolean).join(';')}></div>
  {/if}
  {#if stepDots.length}
    <div class={`${prefix}-step`} aria-hidden="true">
      {#each stepDots as point}
        <span class={[`${prefix}-dot`, isIncluded(point) && `${prefix}-dot-active`]}
          style={decorationStyle(point)}></span>
      {/each}
    </div>
  {/if}
  <div bind:this={handle} class={[`${prefix}-handle`, `${prefix}-handle-1`,
      resolvedDisabled && `${prefix}-handle-disabled`, classes.handle]} data-ant-slider-part="handle" aria-hidden="true" style={[
        orientation === 'horizontal'
          ? `left:${position}%`
          : `top:${position}%`, styles.handle
      ].filter(Boolean).join(';')}></div>
  <!-- svelte-ignore a11y_role_supports_aria_props_implicit (AriaRequired сохраняет исходный Slider prop; native required передаётся отдельно.) -->
  <input
    {...attributes}
    bind:this={control}
    type="range"
    class="slider-input"
    id={id ?? field?.id}
    name={name ?? field?.name}
    min={options.min}
    max={options.max}
    step={sourceAlignment ? 'any' : options.step}
    value={resolvedValue}
    disabled={resolvedDisabled}
    style:direction={direction === 'rtl' || direction === 'btt' ? 'rtl' : 'ltr'}
    tabindex={tabIndex === undefined ? attributes.tabindex : indexed(tabIndex) ?? -1}
    aria-label={indexed(ariaLabelForHandle) ?? attributes['aria-label']
        ?? (labelledBy
          ? undefined
          : field?.label)}
    aria-labelledby={labelledBy}
    aria-required={ariaRequired ?? attributes['aria-required']}
    aria-valuetext={indexed(ariaValueTextFormatterForHandle)?.(resolvedValue)
      ?? attributes['aria-valuetext']}
    aria-valuemin={options.min}
    aria-valuemax={options.max}
    aria-valuenow={resolvedValue}
    aria-orientation={orientation}
    aria-invalid={field?.status === 'error' || attributes['aria-invalid'] || undefined}
    aria-describedby={[attributes['aria-describedby'], field?.describedBy].filter(
        Boolean
      )
        .join(
          ' '
        )
        || undefined}
    oninput={handleInput}
    onchange={handleChange}
    onpointerdown={handlePointerdown}
    onpointerenter={handlePointerenter}
    onpointerleave={handlePointerleave}
    onlostpointercapture={handleLostCapture}
    onkeydown={handleKeydown}
    onkeyup={handleKeyup}
    onfocus={handleFocus}
    onblur={handleBlur}
  />
  {#if markEntries.length}
    <div class={`${prefix}-mark`}>
      {#each markEntries as mark}
        <button type="button" class={[`${prefix}-mark-text`, 'slider-mark',
          isIncluded(mark.value) && `${prefix}-mark-text-active`]}
          aria-label={typeof mark.label === 'boolean' ? String(mark.value) : undefined}
          style={`${sliderRangePosition(direction, mark.value, options.min, options.max)};${mark.style ?? ''}`}
          disabled={resolvedDisabled} onpointerdown={event => event.preventDefault()}
          onclick={() => handleMark(mark.value)}>
          {#if typeof mark.label === 'function'}{@render mark.label()}{:else if typeof mark.label !== 'boolean'}{mark.label}{/if}
        </button>
      {/each}
    </div>
  {/if}
  <TooltipPopup title={resolvedDisabled ? '' : tooltipTitle} open={tooltipOpen} anchor={handle} describe={control} trigger={control} placement={tooltipPlacement} arrow={tooltip === false ? false : tooltip?.arrow}
    ownerClassName={`${prefix}-tooltip`}
    color={tooltip === false ? undefined : tooltip?.color}
    prefixCls={tooltip === false ? undefined : tooltip?.prefixCls}
    openClassName={tooltip === false ? undefined : tooltip?.openClassName}
    fresh={tooltip === false ? undefined : tooltip?.fresh}
    id={tooltip === false ? undefined : tooltip?.id}
    disabled={tooltip === false ? undefined : tooltip?.disabled}
    forceRender={tooltip === false ? undefined : tooltip?.forceRender}
    zIndex={tooltip === false ? undefined : tooltip?.zIndex}
    align={tooltip === false ? undefined : tooltip?.align}
    builtinPlacements={tooltip === false ? undefined : tooltip?.builtinPlacements}
    onPopupAlign={tooltip === false ? undefined : tooltip?.onPopupAlign}
    destroyOnHidden={tooltip === false ? undefined : tooltip?.destroyOnHidden}
    autoAdjustOverflow={tooltip === false ? undefined : tooltip?.autoAdjustOverflow}
    getPopupContainer={(tooltip === false ? undefined : tooltip?.getPopupContainer)
      || config.getPopupContainer}
    onDismiss={() => {
      tooltipState = { ...tooltipState, dismissed: true };
    }} onHoverChange={(next) => {
        popupHovered = next;
      }} />
</div>
