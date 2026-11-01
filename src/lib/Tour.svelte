<script lang="ts">
  import { onDestroy, untrack } from 'svelte';
  import { useConfig } from './config-context';
  import { getTourClosable, getTourSemantics, type TourHighlight } from './tour.engine';
  import { connectTourEscape } from './tour-portal.dom';
  import {
    connectTourLayout,
    getTourArrowStyle,
    getTourOffsetStyle,
    isTourEditableTarget,
    type TourAlignment
  } from './tour.dom';
  import { tourRuRU } from './tour.locale';
  import type { TourPanelInfo, TourProps, TourStepProps } from './tour.types';
  import TourPortal from './TourPortal.svelte';
  import TourPanel from './TourPanel.svelte';
  import TourDefaultPanel from './TourDefaultPanel.svelte';

  let props: TourProps = $props();
  const config = useConfig();
  let steps = $derived((props.steps ?? []).map(step => ({
    ...step,
    class: [
      step.class,
      (step.type ?? props.type) === 'primary' && `${props.prefixCls ?? 'ant-tour'}-primary`
    ]
      .filter(Boolean).join(' ')
  })));
  let innerCurrent = $state<number | undefined>(untrack(() => props.defaultCurrent || 0));
  let innerOpen = $state<boolean | undefined>(untrack(() => props.defaultOpen));
  let previousCurrent = untrack(() => props.current);
  let previousOpen = untrack(() => props.open);
  // rc-util сбрасывает внутреннее значение и при снятии controlled props.
  let current = $derived((props.current !== undefined ? props.current : innerCurrent)!);
  let visible = $derived(current < 0 || current >= steps.length
    ? false : innerOpen !== undefined && props.open === undefined ? innerOpen : props.open ?? true);
  let wasOpen = untrack(() => visible);
  let step = $derived<Partial<TourStepProps>>(steps[current] ?? {});
  let prefixCls = $derived(props.prefixCls ?? 'ant-tour');
  let semantics = $derived(getTourSemantics(config.tour, { ...props, steps }));
  let rootClass = $derived([
    config.direction === 'rtl' && `${prefixCls}-rtl`,
    'ant-tour-css-var',
    props.rootClassName,
    config.tour?.class,
    semantics.classes.root,
    props.class
  ]);
  let closable = $derived(getTourClosable(
    step.closable,
    step.closeIcon,
    props.closable,
    props.closeIcon ?? config.tour?.closeIcon
  ));
  let target = $state<HTMLElement | null | undefined>(undefined);
  let placement = $derived(
    step.placement ?? props.placement ?? (target === null ? 'center' : 'bottom')
  );
  let arrow = $derived(
    target ? step.arrow === undefined ? props.arrow ?? true : step.arrow : false
  );
  let pointAtCenter = $derived(typeof arrow === 'object' ? arrow.pointAtCenter : false);
  let mask = $derived(step.mask ?? props.mask ?? true);
  let maskStyle = $derived(typeof mask === 'object' ? mask.style : undefined);
  let maskColor = $derived(
    typeof mask === 'object' ? mask.color ?? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.5)'
  );
  let locale = $derived({ ...tourRuRU, ...config.locale.tour });
  let closeLabel = $derived(config.locale.global?.close ?? 'Закрыть');
  let zIndex = $derived(props.zIndex ?? 1001);
  let mounted = $state(false);
  let host = $state<HTMLDivElement>();
  let popup = $state<HTMLDivElement>();
  let placeholder = $state<HTMLDivElement>();
  let popupReady = $state(false);
  let placeholderReady = $state(false);
  let portalRevision = $state(0);
  let activePopup = $derived(popupReady ? popup : undefined);
  let activePlaceholder = $derived(placeholderReady ? placeholder : undefined);
  let highlight = $state.raw<TourHighlight | null>(null);
  let position = $state.raw<TourAlignment>();
  let layout = $state<ReturnType<typeof connectTourLayout>>();
  const generatedId = $props.id();
  let maskId = $derived(`${prefixCls}-mask-${generatedId}`);
  let maskSize = $state('100vw');
  let maskHeight = $state('100vh');
  let panel = $derived<TourPanelInfo>({
    classNames: semantics.classes,
    styles: semantics.styles,
    prefixCls,
    title: undefined,
    total: steps.length,
    current,
    onPrev: () => change(current - 1),
    onNext: () => change(current + 1),
    onClose: handleClose,
    onFinish: handleFinish,
    renderPanel: standardPanel,
    ...step,
    closable
  });

  $effect.pre(() => {
    const next = props.current;
    if (!Object.is(previousCurrent, next)) {
      innerCurrent = next;
      previousCurrent = next;
    }
  });

  $effect.pre(() => {
    const next = props.open;
    if (!Object.is(previousOpen, next)) {
      innerOpen = next;
      previousOpen = next;
    }
  });

  $effect.pre(() => {
    const open = visible;
    if (open && !wasOpen) innerCurrent = 0;
    wasOpen = open;
  });

  $effect(() => {
    const value = step.target;
    target = (typeof value === 'function' ? value() : value) || null;
    mounted = true;
    if (/^((?!chrome|android).)*safari/i.test(navigator.userAgent)) {
      maskSize = '100%';
      maskHeight = '100%';
    }
  });

  $effect(() => {
    const panelNode = activePopup;
    const targetNode = activePlaceholder;
    if (!panelNode || !targetNode) return;
    const controller = connectTourLayout(
      panelNode,
      targetNode,
      value => {
        if (JSON.stringify(highlight) !== JSON.stringify(value)) highlight = value;
      },
      value => {
        const callback = props.onPopupAlign;
        callback?.(panelNode, value.align);
        position = value;
      }
    );
    layout = controller;
    return () => {
      controller.destroy();
      layout = undefined;
      position = undefined;
    };
  });

  $effect(() => {
    const controller = layout;
    if (!controller) return;
    void panel;
    void portalRevision;
    const options = {
      target: target ?? null,
      placement,
      pointAtCenter,
      inline: props.getPopupContainer === false,
      parent: host?.parentElement ?? undefined,
      open: props.open,
      gap: props.gap,
      // Деструктуризация rc-tour задаёт default на шаге до fallback к корневой настройке.
      scrollIntoViewOptions: step.scrollIntoViewOptions === undefined
        ? { block: 'center' as const, inline: 'center' as const }
        : step.scrollIntoViewOptions
          ?? props.scrollIntoViewOptions
          ?? { block: 'center', inline: 'center' }
    };
    untrack(() => controller.configure(options));
  });

  $effect(() => {
    if (!visible || !mounted) return;
    const view = window;
    const escape = connectTourEscape(view, event => {
      if ((props.keyboard ?? true) && closable !== null) {
        event.preventDefault();
        handleClose();
      }
    });
    function handleKeydown(event: KeyboardEvent) {
      if (!(props.keyboard ?? true) || isTourEditableTarget(event)) return;
      if (event.key === 'ArrowLeft' && current > 0) {
        event.preventDefault();
        change(current - 1);
      } else if (event.key === 'ArrowRight' && current < steps.length - 1) {
        event.preventDefault();
        change(current + 1);
      }
    }
    view.addEventListener('keydown', handleKeydown);
    return () => {
      escape();
      view.removeEventListener('keydown', handleKeydown);
    };
  });

  onDestroy(() => {
    layout?.destroy();
  });

  function change(next: number) {
    innerCurrent = next;
    props.onChange?.(next);
  }

  function handlePlaceholderReady(ready: boolean) {
    placeholderReady = ready;
    if (ready) portalRevision++;
  }

  function handlePopupReady(ready: boolean) {
    popupReady = ready;
    if (ready) portalRevision++;
  }

  function handleClose() {
    innerOpen = false;
    props.onClose?.(current);
  }

  function handleFinish() {
    const callback = props.onFinish;
    handleClose();
    callback?.();
  }
</script>

{#snippet standardPanel(info: TourPanelInfo)}
  <TourPanel {info} type={props.type} {locale} {closeLabel}
    indicatorsRender={props.indicatorsRender} actionsRender={props.actionsRender} />
{/snippet}

{#if mounted && visible && target !== undefined}
  <div bind:this={host} style="display:contents">
    <TourPortal getPopupContainer={props.getPopupContainer}>
      <div class={[`${prefixCls}-mask`, ...rootClass, semantics.classes.mask]}
        style={`position:${props.getPopupContainer === false ? 'absolute' : 'fixed'};left:0;right:0;top:0;bottom:0;z-index:${zIndex};pointer-events:${highlight && !props.disabledInteraction ? 'none' : 'auto'};${maskStyle ?? ''};${semantics.styles.mask ?? ''}`}>
        {#if mask}
          <svg style="width:100%;height:100%" aria-hidden="true">
            <defs><mask id={maskId}>
              <rect x="0" y="0" width={maskSize} height={maskHeight} fill="white" />
              {#if highlight}<rect x={highlight.left} y={highlight.top} rx={highlight.radius}
                width={highlight.width} height={highlight.height} fill="black"
                class={`${prefixCls}-placeholder-animated`} />{/if}
            </mask></defs>
            <rect x="0" y="0" width="100%" height="100%" fill={maskColor} mask={`url(#${maskId})`} />
            {#if highlight}
              <rect x="0" y="0" width="100%" height={Math.max(highlight.top, 0)}
                fill="transparent" pointer-events="auto" />
              <rect x="0" y="0" width={Math.max(highlight.left, 0)} height="100%"
                fill="transparent" pointer-events="auto" />
              <rect x="0" y={highlight.top + highlight.height} width="100%"
                height={`calc(100% - ${highlight.top + highlight.height}px)`}
                fill="transparent" pointer-events="auto" />
              <rect x={highlight.left + highlight.width} y="0"
                width={`calc(100% - ${highlight.left + highlight.width}px)`} height="100%"
                fill="transparent" pointer-events="auto" />
            {/if}
          </svg>
        {/if}
      </div>
    </TourPortal>
    <TourPortal getPopupContainer={props.getPopupContainer} onReady={handlePlaceholderReady}>
      <div bind:this={placeholder} class={[...rootClass, `${prefixCls}-target-placeholder`]}></div>
    </TourPortal>
    <TourPortal getPopupContainer={props.getPopupContainer} reference={placeholder} popup onReady={handlePopupReady}>
      <div bind:this={popup} class={[prefixCls, position?.placement && `${prefixCls}-placement-${position.placement}`,
        ...rootClass, step.class]}
        style={`${getTourOffsetStyle(position)};z-index:${zIndex};${step.style ?? ''}`}>
        {#if arrow && position?.align.points}
          <div class={`${prefixCls}-arrow`} style={getTourArrowStyle(position)}></div>
        {/if}
        {#if typeof panel.renderPanel === 'function'}{@render panel.renderPanel(panel, panel.current)}
        {:else}<TourDefaultPanel info={panel} />{/if}
      </div>
    </TourPortal>
  </div>
{/if}
