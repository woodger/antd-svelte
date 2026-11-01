<script lang="ts">
  import { onDestroy, untrack } from 'svelte';
  import { useConfig } from './config-context';
  import { useForm, useFormField } from './form-context';
  import { useCompact } from './space-compact-context';
  import { compactClasses } from './space-compact.engine';
  import { connectPopup } from './popup.dom';
  import { connectPopupPortal } from './popup-portal.dom';
  import { getPopupAlignment, getPopupArrowStyle, type PopupFlipCache } from './popup-position.engine';
  import { genAlphaColor, generateColor, getColorAlpha, getColorModes, getColorText,
    type ColorMode, type ColorFormat, type ColorValue } from './color-picker.engine';
  import type { AggregationColor } from './color';
  import type { ColorPickerProps, ColorPickerSlots, ColorPickerStyles } from './color-picker.types';
  import { colorPickerRuRU } from './color-picker.locale';
  import ColorPickerPanel from './ColorPickerPanel.svelte';

  let props: ColorPickerProps = $props();
  const config = useConfig();
  const field = useFormField();
  const form = useForm();
  const compact = useCompact();
  const id = $props.id();
  let innerValue = $state.raw<ColorValue | undefined>(untrack(() => props.defaultValue));
  let cachedColor = $state.raw<AggregationColor | null>(null);
  let previousValue = untrack(() => props.value);
  let color = $derived.by(() => {
    const cached = cachedColor;
    const source = generateColor((props.value !== undefined ? props.value : innerValue) || '');
    return source.equals(cached) ? cached! : source;
  });
  let cachedGradient: AggregationColor | null = null;
  let modes = $derived(getColorModes(props.mode));
  let innerMode = $state<ColorMode>('single');
  let mode = $derived(modes.includes(innerMode) ? innerMode : modes[0]);
  let innerFormat = $state<ColorFormat | undefined>(untrack(() => props.defaultFormat));
  let previousFormat = untrack(() => props.format);
  let format = $derived(props.format ?? innerFormat);
  let innerOpen = $state(false);
  let previousOpen = untrack(() => props.open);
  let disabled = $derived(props.disabled ?? field?.disabled ?? form?.disabled ?? config.componentDisabled);
  let open = $derived(!disabled && (props.open ?? innerOpen));
  let activeIndex = $state(0);
  let dragging = $state(false);
  let host = $state<HTMLSpanElement>();
  let anchor = $state<HTMLElement>();
  let popup = $state<HTMLDivElement>();
  let portalOrigin: HTMLElement | undefined;
  let portalMarker: Comment | undefined;
  let visited = $state(false);
  let actualPlacement = $state('bottom');
  let arrowStyle = $state('');
  let timer: ReturnType<typeof setTimeout> | undefined;
  let mounted = false;
  let prefixCls = $derived(props.prefixCls ?? 'ant-color-picker');
  let size = $derived(props.size ?? compact?.size ?? config.componentSize);
  let arrow = $derived(props.arrow ?? config.colorPicker?.arrow ?? true);
  let locale = $derived({ ...colorPickerRuRU, ...config.locale.colorPicker });
  let mergedProps = $derived({ ...props, trigger: props.trigger ?? 'click',
    allowClear: props.allowClear ?? false, autoAdjustOverflow: props.autoAdjustOverflow ?? true,
    disabledAlpha: props.disabledAlpha ?? false, arrow, placement: props.placement ?? 'bottomLeft',
    disabled, size });
  let contextClasses = $derived(typeof config.colorPicker?.classNames === 'function'
    ? config.colorPicker.classNames({ props: mergedProps }) : config.colorPicker?.classNames);
  let localClasses = $derived(typeof props.classNames === 'function'
    ? props.classNames({ props: mergedProps }) : props.classNames);
  let classes = $derived(mergeSlots(contextClasses, localClasses));
  let contextStyles = $derived(typeof config.colorPicker?.styles === 'function'
    ? config.colorPicker.styles({ props: mergedProps }) : config.colorPicker?.styles);
  let localStyles = $derived(typeof props.styles === 'function'
    ? props.styles({ props: mergedProps }) : props.styles);
  let styles = $derived(mergeSlots(contextStyles, { root: config.colorPicker?.style },
    localStyles, { root: props.style }, ';'));
  const owned = new Set([
    'value', 'defaultValue', 'mode', 'open', 'disabled', 'format', 'defaultFormat',
    'allowClear', 'disabledAlpha', 'disabledFormat', 'presets', 'size', 'trigger', 'placement',
    'arrow', 'autoAdjustOverflow', 'destroyOnHidden', 'destroyTooltipOnHide', 'getPopupContainer',
    'children', 'showText', 'panelRender', 'onChange', 'onChangeComplete', 'onClear',
    'onOpenChange', 'onFormatChange', 'class', 'rootClassName', 'style', 'prefixCls',
    'classNames', 'styles', 'onblur'
  ]);
  let attributes = $derived(Object.fromEntries(Object.entries(props)
    .filter(([key]) => !owned.has(key))));

  function mergeSlots(
    a?: ColorPickerSlots, b?: ColorPickerSlots, c?: ColorPickerSlots,
    d?: ColorPickerSlots, separator = ' '
  ): ColorPickerStyles {
    const result: ColorPickerStyles = {};
    for (const slots of [a, b, c, d]) {
      for (const [name, value] of Object.entries(slots ?? {})) {
        if (name === 'popup') {
          const root = [result.popup?.root, value?.root].filter(Boolean).join(separator);
          result.popup = { root };
        } else {
          const key = name as Exclude<keyof ColorPickerStyles, 'popup'>;
          result[key] = [result[key], value].filter(Boolean).join(separator);
        }
      }
    }
    return result;
  }

  $effect.pre(() => {
    if (!Object.is(previousValue, props.value)) innerValue = props.value;
    previousValue = props.value;
  });
  $effect.pre(() => {
    if (previousFormat !== props.format) innerFormat = props.format;
    previousFormat = props.format;
  });
  $effect.pre(() => {
    if (previousOpen !== props.open) innerOpen = props.open ?? false;
    previousOpen = props.open;
  });
  $effect.pre(() => {
    if (!open && popup?.contains(popup.ownerDocument.activeElement)) {
      untrack(() => anchor?.focus({ preventScroll: true }));
    }
  });
  $effect(() => { innerMode = color.isGradient() ? 'gradient' : 'single'; });
  $effect(() => {
    mounted = true;
    const element = host;
    if (!element) return;
    function update() {
      anchor = element!.firstElementChild as HTMLElement ?? element;
    }
    update();
    const observer = new MutationObserver(update);
    observer.observe(element, { childList: true });
    return () => observer.disconnect();
  });
  $effect(() => {
    if (open) visited = true;
  });
  $effect(() => {
    const surface = popup;
    const source = anchor;
    if (!open || !surface || !source) return;
    let flips: PopupFlipCache = {};
    let previousPlacement = '';
    return untrack(() => connectPopup(surface, source, {
      trigger: host,
      get placement() {
        return (props.placement ?? 'bottomLeft').replace(/(?:Left|Right|Top|Bottom)$/, '')
          .toLowerCase() as 'top' | 'bottom' | 'left' | 'right';
      },
      get align() {
        const match = /(?:Left|Right|Top|Bottom)$/.exec(props.placement ?? 'bottomLeft');
        return match?.[0].toLowerCase() as 'left' | 'right' | 'top' | 'bottom' | undefined;
      },
      get autoAdjustOverflow() { return props.autoAdjustOverflow !== false; },
      maxWidth: '100vw',
      getPosition(target, bounds, viewport) {
        const placement = props.placement ?? 'bottomLeft';
        if (previousPlacement !== placement) flips = {};
        previousPlacement = placement;
        const right = viewport.x + viewport.width;
        const bottom = viewport.y + viewport.height;
        const result = getPopupAlignment({
          target,
          popup: { left: 0, top: 0, width: bounds.width, height: bounds.height },
          mirror: { right, bottom },
          visible: { left: viewport.x, top: viewport.y, right, bottom },
          scaleX: 1,
          scaleY: 1,
          placement,
          pointAtCenter: typeof arrow === 'object' && Boolean(arrow.pointAtCenter),
          arrowWidth: arrow ? 16 : 0,
          flips,
          autoAdjustOverflow: props.autoAdjustOverflow
        });
        flips = result.flips;
        actualPlacement = result.placement ?? placement;
        arrowStyle = getPopupArrowStyle(result);
        const point = result.align.points?.[0];
        return {
          left: point?.[1] === 'r' ? right - bounds.width - result.right : result.x,
          top: point?.[0] === 'b' ? bottom - bounds.height - result.bottom : result.y,
          arrowX: result.arrowX,
          arrowY: result.arrowY,
          placement: actualPlacement.replace(/(?:Left|Right|Top|Bottom)$/, '')
            .toLowerCase() as 'top' | 'bottom' | 'left' | 'right'
        };
      },
      preserveFocus: false,
      onPlacement: () => {},
      onDismiss: reason => {
        requestOpen(false);
        if (reason === 'escape' && !open) source.focus({ preventScroll: true });
      }
    }));
  });
  onDestroy(() => {
    mounted = false;
    if (timer) clearTimeout(timer);
    portalMarker?.remove();
  });

  function complete(next: AggregationColor, opaque = props.disabledAlpha && getColorAlpha(color) < 100) {
    props.onChangeComplete?.(opaque ? genAlphaColor(next) : next);
  }

  function change(next: AggregationColor, fromDrag = false) {
    const opaque = props.disabledAlpha && getColorAlpha(color) < 100;
    const result = opaque ? genAlphaColor(next) : next;
    innerValue = result;
    cachedColor = result;
    cachedGradient = null;
    props.onChange?.(result, result.toCssString());
    if (!fromDrag) complete(result, opaque);
  }

  function changeMode(next: ColorMode) {
    innerMode = next;
    const previous = color;
    if (next === 'single' && color.isGradient()) {
      activeIndex = 0;
      change(generateColor(color.getColors()[0].color));
      cachedGradient = previous;
    } else if (next === 'gradient' && !color.isGradient()) {
      const base = getColorAlpha(color) < 100 ? genAlphaColor(color) : color;
      change(generateColor(cachedGradient || [{ percent: 0, color: base }, { percent: 100, color: base }]));
    }
  }

  function changeFormat(next: ColorFormat) {
    const previous = format;
    innerFormat = next;
    if (previous !== next) props.onFormatChange?.(next);
  }

  function requestOpen(next: boolean) {
    if (next && disabled) return;
    if (next === (props.open ?? innerOpen)) return;
    innerOpen = next;
    props.onOpenChange?.(next);
  }

  function hover(next: boolean) {
    if (timer) clearTimeout(timer);
    if (props.trigger !== 'hover') return;
    timer = setTimeout(() => {
      timer = undefined;
      if (mounted) requestOpen(next);
    }, 100);
  }
</script>

<style>
  .color-picker-popup { position: fixed; inset: auto; margin: 0; padding: 0; border: 0; background: transparent; overflow: visible; }
  .color-picker-popup[hidden], .color-picker-popup:not(:popover-open) { display: none; }
  .color-picker-surface { max-width: calc(100vw - 16px); }
  .color-picker-button { font: inherit; color: inherit; text-align: start; line-height: normal; }
  .color-picker-button:focus-visible { outline: 2px solid var(--ant-color-primary); outline-offset: 2px; }
  .color-picker-trigger-clear { display: block; }
  @media (prefers-reduced-motion: reduce) { .color-picker-button { transition: none; } }
</style>

<span bind:this={host} class="ant-popover-trigger" role="presentation"
  onpointerenter={event => { if (event.pointerType !== 'touch') hover(true); }}
  onpointerleave={() => hover(false)} onclick={event => {
    if (!event.defaultPrevented && (props.trigger ?? 'click') === 'click') requestOpen(!open);
  }}>
  {#if props.children}{@render props.children()}
  {:else}
    <button {...attributes} type="button" disabled={disabled} id={props.id ?? field?.id}
      data-ant-color-theme={config.theme.mode} data-ant-color-primary={config.theme.primary}
      aria-label={props['aria-label'] ?? field?.label ?? 'Color picker'}
      aria-haspopup="dialog" aria-expanded={open} aria-controls={`ant-color-picker-${id}`}
      aria-describedby={props['aria-describedby'] ?? field?.describedBy}
      onblur={event => {
        field?.onBlur();
        props.onblur?.(event);
      }}
      class={[`${prefixCls}-trigger`, 'ant-color-picker-css-var', 'color-picker-button',
        config.direction === 'rtl' && `${prefixCls}-rtl`,
        size === 'small' && `${prefixCls}-sm`, size === 'large' && `${prefixCls}-lg`,
        disabled && `${prefixCls}-trigger-disabled`, open && `${prefixCls}-trigger-active`,
        field?.status && `${prefixCls}-status-${field.status}`,
        compactClasses(prefixCls, config.direction, compact), config.colorPicker?.class,
        props.rootClassName, props.class, classes.root]}
      style={styles.root}>
      {#if color.cleared}
        <span class={[`${prefixCls}-clear`, 'color-picker-trigger-clear', classes.body]}
          style={styles.body} aria-hidden="true"></span>
      {:else}
        <span class={[`${prefixCls}-color-block`, classes.body]} style={styles.body}>
          <span class={[`${prefixCls}-color-block-inner`, classes.content]}
            style={`display:block;background:${color.toCssString()};${styles.content ?? ''}`}></span>
        </span>
      {/if}
      {#if props.showText}
        <span class={[`${prefixCls}-trigger-text`, classes.description]} style={styles.description}>
          {#if typeof props.showText === 'function'}{@render props.showText(color)}
          {:else if color.cleared}{locale.transparent}
          {:else if color.isGradient()}
            {#each color.getColors() as stop, index}
              <span class={[`${prefixCls}-trigger-text-cell`, open && activeIndex !== index
                && `${prefixCls}-trigger-text-cell-inactive`]}>{stop.color.toRgbString()} {stop.percent}%</span>
            {/each}
          {:else}{getColorText(color, format)}{/if}
        </span>
      {/if}
    </button>
  {/if}
</span>
<div class="ant-svelte-theme" data-ant-theme={config.theme.mode} data-ant-primary={config.theme.primary}
  data-ant-compact={config.theme.compact || undefined}
  style={`display:contents;${config.themeStyle ?? ''}`}
  {@attach element => {
    const source = anchor;
    const getter = props.getPopupContainer;
    if (!source) return;
    return untrack(() => {
      portalOrigin ??= element.parentElement ?? undefined;
      if (!portalOrigin) return;
      if (!portalMarker) {
        portalMarker = element.ownerDocument.createComment('color-picker-portal');
        portalOrigin.insertBefore(portalMarker, element);
      }
      return connectPopupPortal(element, {
        getPopupContainer: getter ? () => getter(source) : undefined,
        reference: source,
        autoLock: false,
        origin: portalOrigin,
        marker: portalMarker
      });
    });
  }}>
  <div bind:this={popup} id={`ant-color-picker-${id}`} role="dialog" aria-label="Color picker"
    popover="manual" hidden tabindex="-1" dir={config.direction}
    class={['ant-popover', prefixCls, 'ant-color-picker-css-var', 'color-picker-popup',
      `ant-popover-placement-${actualPlacement}`, config.direction === 'rtl' && `${prefixCls}-rtl`,
      props.rootClassName, classes.popup?.root]} style={styles.popup?.root}
    data-ant-color-theme={config.theme.mode} data-ant-color-primary={config.theme.primary}
    onpointerenter={() => { if (timer) clearTimeout(timer); }} onpointerleave={() => hover(false)}>
    {#if arrow}<div class="ant-popover-arrow" style={arrowStyle} aria-hidden="true"></div>{/if}
    <div class="ant-popover-container color-picker-surface" style={localStyles?.popupOverlayInner}>
      {#if open || visited && !(props.destroyOnHidden ?? props.destroyTooltipOnHide)}
        <ColorPickerPanel {prefixCls} value={color} {mode} {modes} {format} props={mergedProps}
          bind:activeIndex bind:dragging onChange={change} onComplete={complete}
          onMode={changeMode} onFormat={changeFormat} />
      {/if}
    </div>
  </div>
</div>
