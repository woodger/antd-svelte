<script lang="ts" generics="Value extends SegmentedValue = SegmentedValue">
  import { onDestroy, tick, untrack } from 'svelte';
  import { useConfig } from './config-context';
  import { useComponentTheme } from './theme-component.svelte';
  import { normalizeSegmentedOptions, offsetSegmentedValue } from './segmented.engine';
  import { connectFeedbackFocus } from './feedback.dom';
  import { animateSegmentedThumb } from './segmented.dom';
  import { getSegmentedPrefixCss } from './segmented-prefix.engine';
  import ThemeScopeStyle from './ThemeScopeStyle.svelte';
  import Tooltip from './Tooltip.svelte';
  import type {
    SegmentedOption, SegmentedProps, SegmentedValue, SegmentedSemanticSlots
  } from './segmented.types';

  let {
    options,
    value = $bindable<Value | undefined>(),
    defaultValue,
    onChange,
    disabled = false,
    name,
    block = false,
    size,
    orientation,
    vertical = false,
    shape = 'default',
    prefixCls,
    class: className = '',
    rootClassName = '',
    style,
    classNames,
    styles,
    nativeElement = $bindable(),
    ...rest
  }: SegmentedProps<Value> = $props();
  const config = useConfig();
  const componentTheme = useComponentTheme('Segmented');
  const generatedId = $props.id();
  const resets = new Set<ReturnType<typeof setTimeout>>();
  const initialValue = untrack(
    () => defaultValue ?? (typeof options[0] === 'object' ? options[0].value : options[0])
  );
  let selected = $derived(value ?? initialValue);
  let items = $derived(normalizeSegmentedOptions(options));
  let nativeName = $derived(name ?? `ant-segmented-${generatedId}`);
  let isVertical = $derived(orientation ? orientation === 'vertical' : vertical);
  let mergedSize = $derived(size ?? config.componentSize);
  let prefix = $derived(config.getPrefixCls('segmented', prefixCls));
  let prefixCss = $derived(getSegmentedPrefixCss(prefix));
  let info = $derived(
    {
      props: {
        ...rest,
        options,
        value,
        defaultValue,
        onChange,
        disabled,
        name: nativeName,
        block,
        size,
        orientation,
        vertical,
        shape,
        prefixCls,
        class: className,
        rootClassName,
        style,
        classNames,
        styles
      }
    }
  );
  let semantics = $derived.by(() => {
    const contextClasses = config.segmented?.classNames;
    const contextStyles = config.segmented?.styles;
    const inheritedClasses = typeof contextClasses === 'function'
      ? contextClasses(info) : contextClasses;
    const inheritedStyles = typeof contextStyles === 'function'
      ? contextStyles(info) : contextStyles;
    const localClasses = typeof classNames === 'function' ? classNames(info) : classNames;
    const localStyles = typeof styles === 'function' ? styles(info) : styles;
    const classes: SegmentedSemanticSlots = {};
    const slots: SegmentedSemanticSlots = {};

    for (const slot of ['root', 'item', 'label', 'icon'] as const) {
      classes[slot] = [inheritedClasses?.[slot], localClasses?.[slot]].filter(Boolean).join(' ');
      const layers = [
        inheritedStyles?.[slot], slot === 'root' && config.segmented?.style,
        localStyles?.[slot], slot === 'root' && style
      ];
      if (layers.some(value => typeof value === 'string'))
        slots[slot] = layers.filter(Boolean).join(';');
    }

    return { classes, styles: slots };
  });
  let classes = $derived(semantics.classes);
  let slotStyles = $derived(semantics.styles);
  let group = $state<HTMLDivElement>();
  let moving = $state(false);
  let previousValue = untrack(() => selected);

  $effect(() => {
    const node = nativeElement;
    if (node) return connectFeedbackFocus(node);
  });
  onDestroy(() => {
    for (const reset of resets)
      clearTimeout(reset);
  });

  $effect(() => {
    const next = selected;
    const previous = previousValue;
    const element = group;
    const currentItems = items;
    // Смена prefix, оси или RTL отменяет старую физическую геометрию.
    const currentPrefix = prefix;
    const axis = isVertical ? 'vertical' : config.direction;
    previousValue = next;
    if (!element || previous === next) return;

    return untrack(() => {
      const nodes = element.querySelectorAll<HTMLElement>('label[data-ant-segmented-item]');
      const from = nodes[currentItems.findIndex(item => item.value === previous)];
      const to = nodes[currentItems.findIndex(item => item.value === next)];
      if (!from || !to) return;

      return animateSegmentedThumb(element, from, to, axis === 'vertical', () => {
        moving = true;
      }, () => {
        moving = false;
      }, currentPrefix);
    });
  });

  function choose(next: Value) {
    if (disabled
      || next === selected
      || !items.some(item => item.value === next
        && !item.disabled)) return;

    value = next;
    onChange?.(next);
  }

  async function handleKey(event: KeyboardEvent) {
    if (event.defaultPrevented
      || disabled
      || !['ArrowLeft', 'ArrowUp', 'ArrowRight', 'ArrowDown'].includes(
        event.key
      )) return;

    event.preventDefault();
    const next = offsetSegmentedValue(
      items,
      selected,
      event.key === 'ArrowLeft' || event.key === 'ArrowUp' ? -1 : 1
    );
    if (next === undefined) return;

    const root = nativeElement;
    choose(next);
    await tick();
    if (root?.isConnected && root === nativeElement)
      root
        .querySelectorAll<HTMLInputElement>('input')[items.findIndex(
          item => item.value === next
        )]
        ?.focus();
  }

  function handleReset(event: Event) {
    const root = nativeElement;
    if (!root
      || ![...root.querySelectorAll('input')].some(input => input.form === event.target)) return;

    const reset = setTimeout(() => {
      resets.delete(reset);
      if (!root.isConnected || root !== nativeElement) return;

      root.querySelectorAll<HTMLInputElement>('input').forEach((input, index) => {
        input.checked = items[index]?.value === selected;
      });
    }, 0);
    resets.add(reset);
  }
</script>

<style>
  [data-ant-segmented] { --ant-segmented-track-bg: var(--ant-color-bg-layout); --ant-segmented-item-color: var(--ant-color-text-label); --ant-segmented-item-hover-color: var(--ant-color-text); --ant-segmented-item-hover-bg: var(--ant-color-fill-secondary); --ant-segmented-item-selected-bg: var(--ant-color-bg-elevated); --ant-segmented-item-active-bg: var(--ant-color-fill); --ant-segmented-item-selected-color: var(--ant-color-text); }
  [data-ant-segmented-item]:has(input:focus-visible) { outline: var(--ant-line-width-focus) solid var(--ant-color-primary-border); outline-offset: 1px; }
  [data-ant-segmented-group]:has(> :global([data-ant-segmented-thumb])) [data-ant-segmented-item]:not([data-ant-segmented-item-disabled])::after { background-color: transparent; }
  @media (prefers-reduced-motion: reduce) { [data-ant-segmented], [data-ant-segmented-item], [data-ant-segmented-item]::after { transition: none; } }
</style>

<svelte:document onreset={handleReset} />

{#snippet optionNode(item: SegmentedOption<Value>)}
  <label data-ant-segmented-item data-ant-segmented-item-disabled={disabled || item.disabled || undefined}
    class={[
      `${prefix}-item`,
      item.value === selected && !moving && `${prefix}-item-selected`,
      item.value === selected && `${prefix}-item-selected-text`,
      (disabled || item.disabled) && `${prefix}-item-disabled`,
      item.class,
      classes.item
    ]} style={slotStyles.item}>
    <input type="radio" class={`${prefix}-item-input`} name={nativeName} checked={item.value === selected} disabled={disabled || item.disabled} aria-label={item['aria-label']
        ?? (item.icon && (item.label === undefined || item.label === '')
          ? item.title
          : undefined)} onchange={() => choose(item.value)} onkeydown={handleKey} />
    <div class={[`${prefix}-item-label`, classes.label]} title={item.title} style={slotStyles.label}>
      <!-- Интервал icon/label задаёт CSS margin; текстовый пробел меняет исходную ширину. -->
      {#if item.icon}<span class={[`${prefix}-item-icon`, classes.icon]} style={slotStyles.icon} aria-hidden="true">{@render item.icon()}</span>{/if}{#if item.icon && item.label !== undefined && item.label !== ''}<span>{#if typeof item.label === 'function'}{@render item.label()}{:else}{item.label}{/if}</span>
      {:else if typeof item.label === 'function'}{@render item.label()}{:else}{item.label}{/if}
    </div>
  </label>
{/snippet}

{#if prefixCss}<ThemeScopeStyle css={prefixCss} scope={`segmented-prefix:${prefix}`} />{/if}
<div {...rest} bind:this={nativeElement} data-ant-segmented
  data-ant-segmented-prefix={prefixCss ? prefix : undefined} role="radiogroup" aria-label={rest['aria-label']
    ?? (rest['aria-labelledby']
      ? undefined
      : 'segmented control')}
  aria-orientation={isVertical ? 'vertical' : 'horizontal'} tabindex={rest.tabindex ?? (disabled ? undefined : 0)} dir={config.direction}
  class={[
      prefix,
      'ant-segmented-css-var',
      componentTheme.className,
      disabled && `${prefix}-disabled`,
      block && `${prefix}-block`,
      isVertical && `${prefix}-vertical`,
      config.direction === 'rtl' && `${prefix}-rtl`,
      mergedSize === 'small' && `${prefix}-sm`,
      mergedSize === 'large' && `${prefix}-lg`,
      shape === 'round' && `${prefix}-shape-round`,
      className,
      rootClassName,
      config.segmented?.class,
      classes.root
    ]}
  style={[componentTheme.style, slotStyles.root].filter(Boolean).join(';')}>
  <div class={`${prefix}-group`} data-ant-segmented-group bind:this={group}>
    {#each items as item (item.value)}
      {#if item.tooltip}
        <Tooltip {...(typeof item.tooltip === 'string'
            ? { title: item.tooltip }
            : item.tooltip)}
          class={`${prefix}-tooltip-item ${typeof item.tooltip === 'object'
              ? item.tooltip.class ?? ''
              : ''}`}
          style={`display:contents;${typeof item.tooltip === 'object'
              ? item.tooltip.style ?? ''
              : ''}`}>
          {@render optionNode(item)}
        </Tooltip>
      {:else}{@render optionNode(item)}{/if}
    {/each}
  </div>
</div>
