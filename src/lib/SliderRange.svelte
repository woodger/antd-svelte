<script lang="ts">
  import { onMount, onDestroy, tick, untrack } from 'svelte';
  import { useConfig } from './config-context';
  import { useComponentTheme } from './theme-component.svelte';
  import { useForm, useFormField } from './form-context';
  import { getSliderDirection } from './slider.engine';
  import {
    createSliderRangeOffset,
    sliderClosestHandle,
    sliderDisabledState,
    sliderHandleDisabled,
    sliderRangeCache,
    sliderRangeKey,
    sliderRangeMarks,
    sliderRangePosition,
    sliderRangeSettings,
    sliderRangeValues,
    type SliderRangeOptions
  } from './slider-range.engine';
  import { connectSliderRangeDrag, connectSliderRangeInput } from './slider-range.dom';
  import { useSliderInternal } from './slider-internal-context';
  import { sliderSemantics } from './slider-semantic.engine';
  import { getSliderPrefixCss } from './slider-prefix.engine';
  import ThemeScopeStyle from './ThemeScopeStyle.svelte';
  import type { SliderRangeProps } from './slider-range.types';
  import TooltipPopup from './TooltipPopup.svelte';

  let { value = $bindable(), ref = $bindable(), nativeElement = $bindable(), ...props }:
    SliderRangeProps = $props();
  const config = useConfig();
  const componentTheme = useComponentTheme('Slider');
  const internal = useSliderInternal();
  const form = useForm();
  const field = useFormField(() => ref);
  const initialDefault = untrack(() => props.defaultValue);
  const autoFocus = untrack(() => props.autoFocus ?? props.autofocus);
  let inputs = $state<HTMLInputElement[]>([]);
  let handles = $state<HTMLDivElement[]>([]);
  const generated = new WeakSet<Event>();
  const resetTimers = new Set<ReturnType<typeof setTimeout>>();
  let mounted = false;
  let gesture: (() => void) | undefined;
  let active = $state(false);
  let draggingIndex = $state(-1);
  let draggingValue = $state<number>();
  let draggingDelete = $state(false);
  let cache = $state.raw<number[]>([]);
  let hovered = $state(-1);
  let focused = $state(-1);
  let activeTooltip = $state(-1);
  let tooltipDismissed = $state(false);
  let locked = $state(false);
  let blurCallbacks: Pick<SliderRangeProps, 'onBlur' | 'onblur'> = {};
  let prefixCls = $derived(props.prefixCls || 'ant-slider');
  let customPrefix = $derived(prefixCls !== 'ant-slider');
  let prefixCss = $derived(getSliderPrefixCss(prefixCls));
  let orientation = $derived(props.orientation ?? 'horizontal');
  let direction = $derived(getSliderDirection(orientation, props.reverse ?? false,
    (internal?.direction ?? config.direction) === 'rtl'));
  let disabled = $derived(props.disabled ?? field?.disabled ?? form?.disabled
    ?? config.componentDisabled);
  let minimum = $derived(Number.isFinite(props.min) ? props.min! : 0);
  let maximum = $derived(Number.isFinite(props.max) ? props.max! : 100);
  let step = $derived(props.step === null ? null : (props.step ?? 1) > 0 ? props.step ?? 1 : 1);
  let marks = $derived(sliderRangeMarks(props.marks));
  let options = $derived<SliderRangeOptions>({
    min: minimum,
    max: maximum,
    step,
    marks,
    allowCross: props.allowCross ?? true,
    pushable: props.pushable === true ? step
      : typeof props.pushable === 'number' && props.pushable >= 0 ? props.pushable : false,
    disabled
  });
  let offset = $derived(createSliderRangeOffset(options));
  let settings = $derived(sliderRangeSettings(props.range));
  let raw = $derived(sliderRangeValues(value === undefined ? initialDefault : value,
    options));
  let disabledState = $derived(sliderDisabledState(disabled, raw));
  let editable = $derived(settings.editable && !disabledState[1]);
  let draggableTrack = $derived(settings.draggableTrack && !disabledState[1] && step !== null);
  let displayed = $derived(active ? sliderRangeCache(raw, cache, editable) : raw);
  let sorted = $derived([...displayed].sort((a, b) => a - b));
  let included = $derived(props.included ?? true);
  let mergedProps = $derived({ ...props, value, disabled });
  let semantics = $derived(sliderSemantics(mergedProps, config.slider,
    props.classNames, props.styles));
  let classNames = $derived(semantics.classNames);
  let styles = $derived(semantics.styles);
  let dots = $derived.by(() => {
    const values = new Set(marks.map(mark => mark.value));
    if (props.dots && step !== null) {
      for (let point = minimum; point <= maximum; point += step) values.add(point);
    }
    return [...values];
  });
  let tooltipIndex = $derived(active && draggingIndex >= 0 ? draggingIndex : activeTooltip);
  let tooltipTitle = $derived(formatTooltip(displayed[tooltipIndex]));
  let tooltipOpen = $derived(props.tooltip !== false && !disabledState[0]
    && !draggingDelete && !tooltipDismissed && props.tooltip?.open !== false
    && (Boolean(props.tooltip?.open) || hovered >= 0 || focused >= 0 || locked));
  const owned = new Set([
    'range', 'min', 'max', 'step', 'marks', 'dots', 'included', 'track', 'allowCross', 'pushable',
    'disabled', 'orientation', 'reverse', 'keyboard', 'autoFocus', 'autofocus',
    'onValueChange', 'onChange', 'onChangeComplete',
    'onFocus', 'onBlur', 'tabIndex', 'ariaLabelForHandle', 'ariaLabelledByForHandle',
    'ariaRequired', 'ariaValueTextFormatterForHandle', 'tooltip', 'prefixCls', 'rootClassName',
    'class', 'classNames', 'styles', 'dotStyle',
    'activeDotStyle', 'defaultValue', 'id', 'style', 'oninput', 'onchange', 'onkeydown',
    'onkeyup', 'onfocus', 'onblur', 'onpointerdown', 'onpointerenter', 'onpointerleave',
    'ontouchstart', 'ontouchmove'
  ]);
  let inputAttributes = $derived(Object.fromEntries(Object.entries(props)
    .filter(([key]) => !owned.has(key))));

  function connectInput(node: HTMLInputElement) {
    return connectSliderRangeInput(node, {
      start(event) {
        props.ontouchstart?.(event);
        if (event.defaultPrevented) cancel();
      },
      move: event => props.ontouchmove?.(event)
    });
  }

  function formatTooltip(point: number | undefined) {
    if (point === undefined || props.tooltip === false || props.tooltip?.formatter === null) {
      return '';
    }
    return props.tooltip?.formatter ? props.tooltip.formatter(point) ?? '' : String(point);
  }

  function indexed<T>(entry: T | readonly T[] | undefined, index: number): T | undefined {
    return Array.isArray(entry) ? entry[index] : entry as T | undefined;
  }

  function tabIndex(index: number) {
    if (props.tabIndex !== undefined) return indexed(props.tabIndex, index) ?? -1;
    return props.tabindex ?? 0;
  }

  function percent(point: number) {
    return (point - minimum) / (maximum - minimum) * 100;
  }

  function trackStyle(start: number, end: number) {
    const position = direction === 'rtl' ? 'right' : direction === 'btt' ? 'bottom'
      : direction === 'ttb' ? 'top' : 'left';
    const dimension = orientation === 'vertical' ? 'height' : 'width';
    return `${position}:${percent(start)}%;${dimension}:${percent(end) - percent(start)}%`;
  }

  function isIncluded(point: number) {
    return included && sorted[0] <= point && point <= sorted[sorted.length - 1];
  }

  function decorationStyle(point: number) {
    return [sliderRangePosition(direction, point, minimum, maximum),
      typeof props.dotStyle === 'function' ? props.dotStyle(point) : props.dotStyle,
      isIncluded(point) && (typeof props.activeDotStyle === 'function'
        ? props.activeDotStyle(point) : props.activeDotStyle)].filter(Boolean).join(';');
  }

  function dispatchNative(type: 'input' | 'change', index: number) {
    void tick().then(() => {
      if (!mounted || !inputs[index]) return;
      const input = inputs[index];
      const event = new input.ownerDocument.defaultView!.Event(type, { bubbles: true });
      generated.add(event);
      input.dispatchEvent(event);
    });
  }

  function publish(next: readonly number[], index = -1) {
    const result = [...next].sort((a, b) => a - b);
    const changed = result.length !== raw.length
      || result.some((entry, item) => entry !== raw[item]);
    if (changed) props.onChange?.(result);
    if (!internal?.controlled) value = result;
    if (changed) {
      props.onValueChange?.(result);
      if (index >= 0) dispatchNative('input', index);
    }
  }

  function complete(index = -1) {
    const result = [...raw];
    props.onChangeComplete?.(result);
    locked = false;
    if (index >= 0) dispatchNative('change', index);
  }

  function focusIndex(index: number) {
    void tick().then(() => {
      if (mounted) inputs[index]?.focus();
    });
  }

  function cancel() {
    gesture?.();
    gesture = undefined;
    active = false;
    draggingIndex = -1;
    draggingDelete = false;
    locked = false;
  }

  function start(
    event: PointerEvent,
    index: number,
    values = [...raw],
    handle = false,
    removeCount = displayed.length
  ) {
    event.stopPropagation();
    if (sliderHandleDisabled(disabled, index)) return;
    event.preventDefault();
    cancel();
    const origin = [...values];
    const startX = event.pageX;
    const startY = event.pageY;
    const startDirection = direction;
    cache = origin;
    active = true;
    draggingIndex = index;
    draggingValue = origin[index];
    locked = handle;
    if (index >= 0) inputs[index]?.focus();
    tooltipDismissed = false;
    internal?.onDragStart?.({
      rawValues: origin, draggingIndex: index, draggingValue: origin[index]
    });
    gesture = connectSliderRangeDrag(event.currentTarget as HTMLElement, event, move => {
      if (!nativeElement) return;
      const rect = nativeElement.getBoundingClientRect();
      const x = move.pageX - startX;
      const y = move.pageY - startY;
      const vertical = startDirection === 'btt' || startDirection === 'ttb';
      const distance = vertical ? y / rect.height : x / rect.width;
      const ratio = startDirection === 'btt' || startDirection === 'rtl' ? -distance : distance;
      draggingDelete = editable && Math.abs(vertical ? x : y) > 130
        && settings.minCount < removeCount;
      if (index === -1) {
        if (origin.some((_, item) => sliderHandleDisabled(disabled, item))) return;
        let delta = Math.max(minimum - origin[0], Math.min(maximum - origin[origin.length - 1],
          ratio * (maximum - minimum)));
        delta = offset.format(origin[0] + delta) - origin[0];
        cache = origin.map(entry => entry + delta);
        publish(cache);
      } else {
        const working = [...cache];
        working[index] = origin[index];
        const next = offset.offset(working, ratio * (maximum - minimum), index, 'dist');
        cache = next.values;
        draggingValue = next.value;
        publish(draggingDelete ? cache.filter((_, item) => item !== index) : cache, index);
        internal?.onDragChange?.({
          rawValues: cache,
          draggingIndex: index,
          draggingValue: next.value,
          deleteIndex: draggingDelete ? index : -1
        });
      }
    }, () => {
      const target = draggingValue;
      complete(index);
      cancel();
      if (target !== undefined) focusIndex(raw.lastIndexOf(target));
    }, cancel);
  }

  function closest(point: number, event?: PointerEvent) {
    if (disabledState[0]) return;
    const index = raw.length ? sliderClosestHandle(raw, point, options) : 0;
    if (index === -1) return;
    const next = [...raw];
    const removeCount = displayed.length;
    const distance = raw.length ? Math.abs(point - raw[index]) : maximum - minimum;
    let before = 0;
    raw.forEach((entry, item) => { if (entry < point) before = item; });
    let focus = index;
    if (editable && distance !== 0
      && (!settings.maxCount || raw.length < settings.maxCount)) {
      next.splice(before + 1, 0, point);
      focus = before + 1;
    } else next[index] = point;
    if (!raw.length) next.push(point);
    publish(next, focus);
    if (event) {
      (nativeElement?.ownerDocument.activeElement as HTMLElement | null)?.blur?.();
      focusIndex(focus);
      start(event, focus, next, false, removeCount);
    } else complete(focus);
  }

  function handleRootPointer(event: PointerEvent) {
    if (event.defaultPrevented) return;
    event.preventDefault();
    const rect = nativeElement!.getBoundingClientRect();
    const ratio = direction === 'rtl' ? (rect.right - event.clientX) / rect.width
      : direction === 'btt' ? (rect.bottom - event.clientY) / rect.height
      : direction === 'ttb' ? (event.clientY - rect.top) / rect.height
      : (event.clientX - rect.left) / rect.width;
    closest(offset.format(minimum + ratio * (maximum - minimum)), event);
  }

  function handleStart(event: PointerEvent, index: number) {
    props.onpointerdown?.(event as PointerEvent & { currentTarget: HTMLInputElement; });
    if (event.defaultPrevented) return;
    event.stopPropagation();
    if (sliderHandleDisabled(disabled, index)) return;
    start(event, index, [...raw], true);
  }

  function handleKeydown(
    event: KeyboardEvent & { currentTarget: HTMLInputElement; },
    index: number
  ) {
    props.onkeydown?.(event);
    if (event.defaultPrevented || sliderHandleDisabled(disabled, index)) return;
    if ((event.key === 'Delete' || event.key === 'Backspace') && internal?.onKeyDelete) {
      event.preventDefault();
      internal.onKeyDelete(index);
      return;
    }
    const change = sliderRangeKey(event.key, direction);
    if (props.keyboard === false) {
      if (change !== undefined) event.preventDefault();
      return;
    }
    if (change !== undefined) {
      event.preventDefault();
      const next = offset.offset(raw, change, index);
      publish(next.values, index);
      focusIndex(raw[index] === next.value ? index : raw.indexOf(next.value));
    } else if ((event.key === 'Delete' || event.key === 'Backspace')
      && editable && raw.length > settings.minCount) {
      const next = raw.filter((_, item) => item !== index);
      publish(next);
      focused = -1;
      focusIndex(Math.max(0, index - 1));
    }
  }

  function handleKeyup(event: KeyboardEvent & { currentTarget: HTMLInputElement; }, index: number) {
    props.onkeyup?.(event);
    if (!event.defaultPrevented && sliderRangeKey(event.key, direction) !== undefined) {
      complete(index);
    }
  }

  function handleInput(event: Event & { currentTarget: HTMLInputElement; }, index: number) {
    if (!mounted) return;
    if (!generated.has(event) && !sliderHandleDisabled(disabled, index)) {
      const next = offset.offset(
        raw, event.currentTarget.valueAsNumber - raw[index], index, 'dist'
      );
      publish(next.values);
    }
    props.oninput?.(event);
  }

  function handleChange(event: Event & { currentTarget: HTMLInputElement; }) {
    if (!mounted) return;
    if (!generated.has(event)) complete();
    props.onchange?.(event);
  }

  function handleEnter(event: PointerEvent & { currentTarget: HTMLInputElement; }, index: number) {
    if (!mounted) return;
    hovered = index;
    activeTooltip = index;
    tooltipDismissed = false;
    props.onpointerenter?.(event);
  }

  function handleLeave(event: PointerEvent & { currentTarget: HTMLInputElement; }, index: number) {
    if (!mounted) return;
    if (hovered === index) hovered = -1;
    props.onpointerleave?.(event);
  }

  function handleFocus(event: FocusEvent & { currentTarget: HTMLInputElement; }, index: number) {
    if (!mounted) return;
    focused = index;
    activeTooltip = index;
    tooltipDismissed = false;
    internal?.onFocus?.(index);
    props.onFocus?.(event);
    props.onfocus?.(event);
  }

  function handleBlur(event: FocusEvent & { currentTarget: HTMLInputElement; }, index: number) {
    // Svelte может получить blur от remove() раньше cleanup компонента.
    if (!mounted || !event.currentTarget.isConnected) return;
    if (focused === index) focused = -1;
    field?.onBlur();
    blurCallbacks.onBlur?.(event);
    blurCallbacks.onblur?.(event);
  }

  function handleReset(event: Event) {
    const owner = props.form == null ? nativeElement?.closest('form')
      : nativeElement?.ownerDocument.getElementById(props.form);
    if (event.target !== owner || owner?.nodeName !== 'FORM') return;
    cancel();
    const timer = setTimeout(() => {
      resetTimers.delete(timer);
      if (!mounted || event.defaultPrevented) return;
      value = sliderRangeValues(initialDefault, options);
    }, 0);
    resetTimers.add(timer);
  }

  onMount(() => {
    mounted = true;
    ref = {
      get nativeElement() { return nativeElement; },
      focus: () => { if (mounted) inputs[0]?.focus(); },
      blur: () => {
        const element = nativeElement?.ownerDocument.activeElement;
        if (element instanceof HTMLElement && nativeElement?.contains(element)) element.blur();
      }
    };
    if (autoFocus) inputs[0]?.focus();
  });

  onDestroy(() => {
    mounted = false;
    cancel();
    for (const timer of resetTimers) clearTimeout(timer);
    ref = undefined;
  });

  $effect(() => {
    const reset = form?.resetKey;
    void reset;
    untrack(cancel);
  });

  $effect.pre(() => {
    // Remove() вызывает blur до onDestroy; spread props родителя уже могут быть уничтожены.
    blurCallbacks = { onBlur: props.onBlur, onblur: props.onblur };
  });

  $effect(() => {
    const defaults = sliderRangeValues(initialDefault, options);
    const current = displayed;
    for (let index = 0; index < inputs.length; index++) {
      const input = inputs[index];
      if (!input) continue;
      input.defaultValue = String(defaults[index] ?? minimum);
      input.value = String(current[index]);
    }
  });
</script>

<style>
  .slider-range-input { position: absolute; z-index: 1; inset: -2px; width: calc(100% + 4px); height: calc(100% + 4px); opacity: 0; appearance: none; margin: 0; padding: 0; border: 0; touch-action: none; cursor: inherit; }
  .slider-range-input::-webkit-slider-thumb { appearance: none; width: 100%; height: 100%; }
  .slider-range-input::-moz-range-thumb { width: 100%; height: 100%; border: 0; }
  .range-root { touch-action: none; }
  .range-root[data-ant-slider-source] .range-handle:focus-within::before {
    inset-inline-start: calc(((var(--ant-slider-handle-size-hover) - var(--ant-slider-handle-size)) / 2 + var(--ant-slider-handle-line-width-hover)) * -1);
    inset-block-start: calc(((var(--ant-slider-handle-size-hover) - var(--ant-slider-handle-size)) / 2 + var(--ant-slider-handle-line-width-hover)) * -1);
    width: calc(var(--ant-slider-handle-size-hover) + var(--ant-slider-handle-line-width-hover) * 2);
    height: calc(var(--ant-slider-handle-size-hover) + var(--ant-slider-handle-line-width-hover) * 2);
  }
  .range-handle:has(input:focus-visible)::after { outline: 6px solid var(--ant-slider-handle-active-outline-color); box-shadow: 0 0 0 var(--ant-slider-handle-line-width-hover) var(--ant-slider-handle-active-color); }
  .range-handle:focus-within::after { width: var(--ant-slider-handle-size-hover); height: var(--ant-slider-handle-size-hover); inset-inline-start: calc((var(--ant-slider-handle-size) - var(--ant-slider-handle-size-hover)) / 2); inset-block-start: calc((var(--ant-slider-handle-size) - var(--ant-slider-handle-size-hover)) / 2); box-shadow: 0 0 0 var(--ant-slider-handle-line-width-hover) var(--ant-slider-handle-active-color); outline: 6px solid var(--ant-slider-handle-active-outline-color); }
  .range-mark { border: 0; padding: 0; background: transparent; font: inherit; line-height: inherit; }
  .range-mark:focus-visible { outline: 2px solid var(--ant-color-primary); outline-offset: 2px; }
  @media (prefers-reduced-motion: reduce) {
    .range-root :global(.ant-slider-rail), .range-root :global(.ant-slider-track),
    .range-root :global(.ant-slider-handle)::before,
    .range-root :global(.ant-slider-handle)::after { transition: none; }
  }
</style>

<svelte:document onreset={handleReset} />
{#if prefixCss}<ThemeScopeStyle css={prefixCss} scope={`slider-prefix:${prefixCls}`} />{/if}
<!-- svelte-ignore a11y_no_static_element_interactions (Корень маршрутизирует исходный click/drag по дорожке.) -->
<div bind:this={nativeElement} class={[prefixCls, 'ant-slider-css-var', componentTheme.className, 'range-root',
  `${prefixCls}-${orientation}`, (internal?.direction ?? config.direction) === 'rtl' && `${prefixCls}-rtl`,
  disabledState[0] && `${prefixCls}-disabled`, marks.length && `${prefixCls}-with-marks`,
  locked && `${prefixCls}-lock`, props.class, config.slider?.class, props.rootClassName, classNames.root]}
  style={[componentTheme.style, styles.root].filter(Boolean).join(';') || undefined}
  data-ant-slider-source={Boolean(componentTheme.className) || customPrefix || undefined}
  data-ant-slider-prefix={customPrefix ? prefixCls : undefined}
  data-ant-slider-native={customPrefix && !componentTheme.className || undefined}
  data-ant-slider-theme={config.theme.mode}
  data-ant-slider-primary={config.theme.primary} onpointerdown={handleRootPointer}>
  <div class={[`${prefixCls}-rail`, classNames.rail]} style={styles.rail}></div>
  {#if included && props.track !== false}
    {#if sorted.length > 1 && (classNames.tracks || styles.tracks)}
      <div class={[`${prefixCls}-tracks`, classNames.tracks]} style={`${trackStyle(raw[0], raw[raw.length - 1])};${styles.tracks ?? ''}`}></div>
    {/if}
    {#each raw.slice(0, -1) as startPoint, index}
      <!-- svelte-ignore a11y_no_static_element_interactions (Draggable track — часть нативного slider interaction.) -->
      <div class={[`${prefixCls}-track`, `${prefixCls}-track-${index + 1}`, classNames.track,
        draggableTrack && `${prefixCls}-track-draggable`]}
        style={[trackStyle(startPoint, raw[index + 1]), styles.track].filter(Boolean).join(';')}
        onpointerdown={event => {
          if (draggableTrack) {
            start(event, -1);
          }
        }}></div>
    {/each}
  {/if}
  <div class={`${prefixCls}-step`}>
    {#each dots as point}
      <span class={[`${prefixCls}-dot`, isIncluded(point) && `${prefixCls}-dot-active`]}
        style={decorationStyle(point)}></span>
    {/each}
  </div>
  {#each displayed as point, index (index)}
    <div bind:this={handles[index]} class={[`${prefixCls}-handle`, `${prefixCls}-handle-${index + 1}`,
      'range-handle', classNames.handle, internal?.handleClass?.(index, point),
      active && draggingIndex === index && `${prefixCls}-handle-dragging`,
      active && draggingIndex === index && draggingDelete && `${prefixCls}-handle-dragging-delete`,
      sliderHandleDisabled(disabled, index) && `${prefixCls}-handle-disabled`]}
      style={[sliderRangePosition(direction, point, minimum, maximum), styles.handle,
        internal?.handleStyle?.(index, point)].filter(Boolean).join(';')}>
      <!-- svelte-ignore a11y_role_supports_aria_props_implicit (AriaRequired сохраняет явный публичный prop rc-slider; native required передаётся отдельно.) -->
      <input {...inputAttributes} bind:this={inputs[index]} {@attach connectInput}
        type="range" class="slider-range-input"
        id={index === 0 ? props.id ?? field?.id : undefined}
        name={props.name ?? field?.name} min={minimum} max={maximum} step="any" value={point}
        disabled={sliderHandleDisabled(disabled, index)}
        tabindex={tabIndex(index)}
        aria-label={indexed(props.ariaLabelForHandle, index) ?? props['aria-label']
          ?? (props['aria-labelledby'] ? undefined : field?.label)}
        aria-labelledby={indexed(props.ariaLabelledByForHandle, index) ?? props['aria-labelledby']
          ?? (indexed(props.ariaLabelForHandle, index) != null || props['aria-label'] != null
            ? undefined : field?.labelledBy)}
        aria-required={props.ariaRequired ?? props['aria-required']}
        aria-valuemin={minimum} aria-valuemax={maximum} aria-valuenow={point}
        aria-valuetext={indexed(props.ariaValueTextFormatterForHandle, index)?.(point) ?? props['aria-valuetext']}
        aria-orientation={orientation} aria-disabled={sliderHandleDisabled(disabled, index)}
        aria-invalid={field?.invalid || field?.status === 'error' || props['aria-invalid'] || undefined}
        aria-describedby={[props['aria-describedby'], field?.describedBy].filter(Boolean).join(' ') || undefined}
        onpointerdown={event => handleStart(event, index)}
        onpointerenter={event => handleEnter(event, index)}
        onpointerleave={event => handleLeave(event, index)}
        onfocus={event => handleFocus(event, index)}
        onblur={event => handleBlur(event, index)}
        onkeydown={event => handleKeydown(event, index)} onkeyup={event => handleKeyup(event, index)}
        oninput={event => handleInput(event, index)}
        onchange={handleChange} />
    </div>
    {#if props.tooltip !== false && props.tooltip?.open}
      <TooltipPopup title={formatTooltip(point)}
        ownerClassName={`${prefixCls}-tooltip`}
        open={!disabledState[0] && props.tooltip.formatter !== null && !draggingDelete}
        anchor={handles[index]} describe={inputs[index]} trigger={inputs[index]}
        placement={props.tooltip.placement ?? (orientation === 'vertical'
          ? config.direction === 'rtl' ? 'left' : 'right' : 'top')}
        arrow={props.tooltip.arrow}
        color={props.tooltip.color}
        prefixCls={props.tooltip.prefixCls}
        openClassName={props.tooltip.openClassName}
        fresh={props.tooltip.fresh}
        id={props.tooltip.id}
        disabled={props.tooltip.disabled}
        forceRender={props.tooltip.forceRender}
        zIndex={props.tooltip.zIndex}
        align={props.tooltip.align}
        builtinPlacements={props.tooltip.builtinPlacements}
        onPopupAlign={props.tooltip.onPopupAlign}
        destroyOnHidden={props.tooltip.destroyOnHidden}
        autoAdjustOverflow={props.tooltip.autoAdjustOverflow}
        getPopupContainer={props.tooltip.getPopupContainer || config.getPopupContainer}
        onDismiss={() => { tooltipDismissed = true; }} />
    {/if}
  {/each}
  {#if marks.length}
    <div class={`${prefixCls}-mark`}>
      {#each marks as mark}
        <button type="button" class={[`${prefixCls}-mark-text`, 'range-mark',
          isIncluded(mark.value) && `${prefixCls}-mark-text-active`]}
          style={`${sliderRangePosition(direction, mark.value, minimum, maximum)};${mark.style ?? ''}`}
          disabled={disabledState[0]} onpointerdown={event => {
            event.stopPropagation();
            event.preventDefault();
          }}
          onclick={() => closest(mark.value)}>
          {#if typeof mark.label === 'function'}{@render mark.label()}{:else if typeof mark.label !== 'boolean'}{mark.label}{/if}
        </button>
      {/each}
    </div>
  {/if}
  {#if props.tooltip === false || !props.tooltip?.open}
    <TooltipPopup title={tooltipTitle} open={tooltipOpen} anchor={handles[tooltipIndex]}
      ownerClassName={`${prefixCls}-tooltip`}
      describe={inputs[tooltipIndex]} trigger={inputs[tooltipIndex]}
      placement={props.tooltip === false ? 'top' : props.tooltip?.placement
        ?? (orientation === 'vertical' ? config.direction === 'rtl' ? 'left' : 'right' : 'top')}
      arrow={props.tooltip === false ? false : props.tooltip?.arrow}
      color={props.tooltip === false ? undefined : props.tooltip?.color}
      prefixCls={props.tooltip === false ? undefined : props.tooltip?.prefixCls}
      openClassName={props.tooltip === false ? undefined : props.tooltip?.openClassName}
      fresh={props.tooltip === false ? undefined : props.tooltip?.fresh}
      id={props.tooltip === false ? undefined : props.tooltip?.id}
      disabled={props.tooltip === false ? undefined : props.tooltip?.disabled}
      forceRender={props.tooltip === false ? undefined : props.tooltip?.forceRender}
      zIndex={props.tooltip === false ? undefined : props.tooltip?.zIndex}
      align={props.tooltip === false ? undefined : props.tooltip?.align}
      builtinPlacements={props.tooltip === false ? undefined : props.tooltip?.builtinPlacements}
      onPopupAlign={props.tooltip === false ? undefined : props.tooltip?.onPopupAlign}
      destroyOnHidden={props.tooltip === false ? undefined : props.tooltip?.destroyOnHidden}
      autoAdjustOverflow={props.tooltip === false ? undefined : props.tooltip?.autoAdjustOverflow}
      getPopupContainer={(props.tooltip === false ? undefined : props.tooltip?.getPopupContainer)
        || config.getPopupContainer}

      onDismiss={() => { tooltipDismissed = true; }} />
  {/if}
</div>
