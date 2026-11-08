<script lang="ts">
  import Steps from './Steps.svelte';
  import { setStepsComposition } from './steps-composition-context';
  import { useConfig } from './config-context';
  import { useComponentTheme } from './theme-component.svelte';
  import { mergeComponentSemantics } from './semantic-style.engine';
  import { getTimelinePrefixCss } from './timeline-prefix.engine';
  import ThemeScopeStyle from './ThemeScopeStyle.svelte';
  import { timelineItems, timelineLayoutAlternate, timelineMode } from './timeline.engine';
  import type { StepsProps } from './steps.types';
  import type { TimelineProps, TimelineSlots } from './timeline.types';
  let {
    items = [],
    prefixCls,
    variant = 'outlined',
    mode,
    orientation = 'vertical',
    titleSpan,
    reverse = false,
    classNames,
    styles,
    class: className = '',
    rootClassName = '',
    style,
    nativeElement = $bindable(),
    ...rest
  }: TimelineProps = $props();
  let forwarded = $derived<Partial<StepsProps>>(
    {
      ...rest,
      id: rest.id ?? undefined,
      'aria-label': rest['aria-label'] ?? undefined,
      'aria-labelledby': rest['aria-labelledby'] ?? undefined,
      'aria-describedby': rest['aria-describedby'] ?? undefined
    }
  );
  const config = useConfig();
  let componentPrefix = $derived(config.getPrefixCls('timeline', prefixCls));
  let prefixCss = $derived(getTimelinePrefixCss(componentPrefix));
  const componentTheme = useComponentTheme('Timeline');
  setStepsComposition({
    get railFollowPrevStatus() {
      return reverse;
    },
    timeline: true
  });
  let actualMode = $derived(timelineMode(mode));
  let converted = $derived(
    timelineItems(items, actualMode, loading, reverse, componentPrefix)
  );
  let alternate = $derived(timelineLayoutAlternate(actualMode, orientation, converted));
  let info = $derived(
    {
      props: {
        ...rest,
        items: converted,
        prefixCls,
        variant,
        mode: actualMode,
        orientation,
        titleSpan,
        reverse,
        classNames,
        styles,
        class: className,
        rootClassName,
        style
      }
    }
  );
  let semantic = $derived(mergeComponentSemantics<keyof TimelineSlots, TimelineProps>(
    config.timeline,
    info.props,
    ['root', 'item', 'itemWrapper', 'itemIcon', 'itemSection', 'itemHeader',
      'itemTitle', 'itemContent', 'itemRail']
  ));
  let classes = $derived(semantic.classes);
  let slots = $derived(semantic.styles);
  let names = $derived<TimelineSlots>({
    item: `${componentPrefix}-item`,
    itemTitle: `${componentPrefix}-item-title`,
    itemIcon: `${componentPrefix}-item-icon`,
    itemContent: `${componentPrefix}-item-content`,
    itemRail: `${componentPrefix}-item-rail`,
    itemWrapper: `${componentPrefix}-item-wrapper`,
    itemSection: `${componentPrefix}-item-section`,
    itemHeader: `${componentPrefix}-item-header`
  });
  let combined = $derived(
    Object.fromEntries(
      [...new Set([...Object.keys(names), ...Object.keys(classes)])].map(
        key => [
          key,
          [names[key as keyof TimelineSlots], classes[key as keyof TimelineSlots]].filter(
            Boolean
          )
            .join(
              ' '
            )
        ]
      )
    )
  );
  let spanStyle = $derived(
    titleSpan !== undefined && titleSpan !== null && actualMode !== 'alternate'
      ? `--ant-timeline-head-span${typeof titleSpan === 'number' ? '' : '-ptg'}:${titleSpan}`
      : undefined
  );
  let retainedFocus: HTMLElement | undefined;
  $effect.pre(() => {
    const root = nativeElement;
    const focused = root?.ownerDocument.activeElement;
    retainedFocus = converted.length
      && root
      && focused instanceof HTMLElement
      && root.contains(
        focused
      )
      ? focused
      : undefined;
  });
  $effect(() => {
    const root = nativeElement;
    const focused = retainedFocus;
    retainedFocus = undefined;
    if (converted.length
      && root
      && focused?.isConnected
      && root.contains(focused)
      && root.ownerDocument.activeElement === root.ownerDocument.body
      && focused.getClientRects().length
      && !focused.matches(':disabled')
      && !focused.closest(
        '[inert]'
      )
      && root.ownerDocument.defaultView!.getComputedStyle(
        focused
      ).visibility === 'visible')
      focused.focus({ preventScroll: true });
  });
</script>

<style>
  .loading { display: inline-block; width: 1em; height: 1em; fill: currentColor; animation: timeline-loading 1s linear infinite; }
  @keyframes timeline-loading { to { transform: rotate(360deg); } }
  @media (prefers-reduced-motion: reduce) { .loading { animation-duration: 2s; } }
</style>

{#snippet loading()}
  <svg class="loading" aria-hidden="true" focusable="false" viewBox="0 0 1024 1024"><path d="M988 548c-19.9 0-36-16.1-36-36 0-59.4-11.6-117-34.6-171.3a440.45 440.45 0 00-94.3-139.9 437.71 437.71 0 00-139.9-94.3C629 83.6 571.4 72 512 72c-19.9 0-36-16.1-36-36s16.1-36 36-36c69.1 0 136.2 13.5 199.3 40.3C772.3 66 827 103 874 150c47 47 83.9 101.8 109.7 162.7 26.7 63.1 40.2 130.2 40.2 199.3.1 19.9-16 36-35.9 36z" /></svg>
{/snippet}
{#if prefixCss}
  <ThemeScopeStyle css={prefixCss} scope={`timeline-prefix:${componentPrefix}`} />
{/if}
<Steps {...forwarded} items={converted} type="dot" {variant} {orientation} current={converted.length - 1}
  data-ant-timeline-prefix={prefixCss ? componentPrefix : undefined}
  class={[
      componentPrefix, 'ant-timeline-css-var',
      componentTheme.className,
      componentTheme.className && 'ant-timeline-source-theme',
      orientation === 'horizontal' && `${componentPrefix}-horizontal`,
      alternate && `${componentPrefix}-layout-alternate`,
      config.direction === 'rtl' && `${componentPrefix}-rtl`,
      config.timeline?.class,
      className
    ].filter(
      Boolean
    ).join(
      ' '
    )}
  {rootClassName} classNames={combined} styles={{ ...slots, root: [componentTheme.style, slots.root].filter(Boolean).join(';') }} style={spanStyle} bind:nativeElement />
