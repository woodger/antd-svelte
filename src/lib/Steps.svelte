<script lang="ts">
  import { useStepsComposition } from './steps-composition-context';
  import { useConfig } from './config-context';
  import { useComponentTheme } from './theme-component.svelte';
  import { mergeComponentSemantics } from './semantic-style.engine';
  import { getStepsPrefixCss } from './steps-prefix.engine';
  import ThemeScopeStyle from './ThemeScopeStyle.svelte';
  import StepItem from './StepItem.svelte';
  import { connectStepsFocus } from './steps.dom';
  import { getStepsStatus, normalizeStepsCurrent } from './steps.engine';
  import { stepsDataItems, stepsLayout } from './steps-data.engine';
  import { displaySteps } from './steps-display.engine';
  import { ruRU } from './types';
  import type { NormalizedStepsDataItem, StepsSemanticSlots } from './steps-data.engine';
  import type { StepsProps } from './steps.types';

  let {
    items: sourceItems = [],
    prefixCls,
    current = 0,
    initial = 0,
    status = 'process',
    onChange,
    orientation,
    size,
    responsive = true,
    disabled,
    type,
    variant = 'filled',
    titlePlacement,
    percent,
    maxCount,
    ellipsis,
    offset = 0,
    iconRender,
    classNames,
    styles,
    rootClassName = '',
    id,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledby,
    'aria-describedby': ariaDescribedby,
    class: className = '',
    style,
    nativeElement = $bindable(),
    ...rest
  }: StepsProps = $props();
  const config = useConfig();
  let componentPrefix = $derived(config.getPrefixCls('steps', prefixCls));
  let prefixCss = $derived(getStepsPrefixCss(componentPrefix));
  const componentTheme = useComponentTheme('Steps');
  const composition = useStepsComposition();
  const generatedId = $props.id();
  let mobile = $state(false);
  let rootId = $derived(id ?? `ant-steps-${generatedId}`);
  let items = $derived(stepsDataItems(sourceItems));
  let selected = $derived(initial + normalizeStepsCurrent(current - initial, items.length));
  let display = $derived(displaySteps(items, selected, initial, maxCount));
  let strings = $derived({ ...ruRU.steps, ...config.locale.steps });
  let layout = $derived(
    stepsLayout(
      type,
      orientation,
      responsive,
      mobile,
      titlePlacement
    )
  );
  let actualPercent = $derived(layout.type === 'inline' ? undefined : percent);
  let small = $derived((size
    ?? (config.componentSize === 'small'
      ? 'small'
      : 'medium')) === 'small');
  let info = $derived(
    {
      props: {
        ...rest,
        items: sourceItems,
        prefixCls,
        current,
        initial,
        status,
        onChange,
        orientation: layout.vertical ? 'vertical' as const : 'horizontal' as const,
        size,
        responsive,
        disabled,
        type: layout.type,
        variant,
        titlePlacement: layout.titlePlacement as 'horizontal' | 'vertical',
        percent: actualPercent,
        maxCount,
        ellipsis,
        offset,
        iconRender,
        classNames,
        styles,
        rootClassName,
        id,
        class: className,
        style
      }
    }
  );
  // Source InternalContext Timeline исключает Steps semantics, сохраняя plain root style/class.
  let componentConfig = $derived(composition?.timeline
    ? { style: config.steps?.style } : config.steps);
  let semantic = $derived(mergeComponentSemantics<keyof StepsSemanticSlots, StepsProps>(
    componentConfig,
    info.props,
    ['root', 'item', 'itemWrapper', 'itemIcon', 'itemSection', 'itemHeader',
      'itemTitle', 'itemSubtitle', 'itemContent', 'itemRail']
  ));
  let classes = $derived(semantic.classes);
  let slots = $derived(semantic.styles);
  let displayed = $derived(
    display.steps.map(
      step => ({
        ...step,
        item: step.item
          ?? {
            key: step.key,
            originalKey: step.sourceKey,
            title: '',
            disabled: true,
            status: step.status
          } as NormalizedStepsDataItem
      })
    )
  );
  let statuses = $derived(
    displayed.map((step, index) => getStepsStatus(step.item, index, display.current, status))
  );

  $effect(() => {
    if (!responsive
      || orientation === 'vertical'
      || layout.type === 'panel') return;
    const media = window.matchMedia(
      composition?.timeline ? '(max-width: 575.98px)' : '(max-width: 531.98px)'
    );
    const update = () => {
      mobile = media.matches;
    };
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  });
  $effect(() => {
    if (nativeElement) return connectStepsFocus(nativeElement);
  });

  function choose(event: MouseEvent, item: NormalizedStepsDataItem, index: number) {
    if ((disabled ?? config.componentDisabled) || item.disabled) return;
    item.onClick?.(event);
    if (index !== selected)
      onChange?.(index);
  }
</script>

<style>
  [data-ant-steps-root] { min-width: 0; max-width: 100%; }
  [data-ant-steps-orientation="horizontal"] { overflow-x: auto; overscroll-behavior-x: contain; scrollbar-width: thin; }
  @media (prefers-reduced-motion: reduce) { [data-ant-steps-root] :global(*) { transition: none; animation: none; } }
</style>

{#if prefixCss}<ThemeScopeStyle css={prefixCss} scope={`steps-prefix:${componentPrefix}`} />{/if}<ol {...rest} bind:this={nativeElement} data-ant-steps-root=""
  data-ant-steps-prefix={prefixCss ? componentPrefix : undefined}
  data-ant-steps-orientation={layout.vertical ? 'vertical' : 'horizontal'}
  id={composition?.timeline ? id : rootId} role="list" aria-label={ariaLabel
    ?? (ariaLabelledby || composition?.timeline
      ? undefined
      : strings.label)} aria-labelledby={ariaLabelledby} aria-describedby={ariaDescribedby} dir={config.direction}
  class={[
      componentPrefix, 'ant-steps-css-var',
      componentTheme.className,
      componentTheme.className && 'ant-steps-source-theme',
      `${componentPrefix}-${variant}`,
      `${componentPrefix}-title-${layout.titlePlacement}`,
      layout.vertical ? `${componentPrefix}-vertical` : `${componentPrefix}-horizontal`,
      small && `${componentPrefix}-small`,
      layout.type && layout.type !== 'dot' && `${componentPrefix}-${layout.type}`,
      layout.dot && `${componentPrefix}-dot`,
      ellipsis && `${componentPrefix}-ellipsis`,
      display.collapsed && `${componentPrefix}-max-count`,
      actualPercent !== undefined && `${componentPrefix}-with-progress`,
      config.direction === 'rtl' && `${componentPrefix}-rtl`,
      config.steps?.class,
      className,
      rootClassName,
      classes.root
    ]}
  style={[componentTheme.style, `--ant-cmp-steps-items-offset:${offset}`, slots.root].filter(
      Boolean
    ).join(
      ';'
    )}>
  {#each displayed as step, index (step.key)}
    <StepItem prefixCls={componentPrefix} item={step.item} index={step.originIndex >= 0 ? initial + step.originIndex : index} status={statuses[index]} active={index === display.current}
      waveDisabled={!onChange} waveColorSource={variant === 'filled' ? 'color' : null}
      blocked={(disabled
          ?? config.componentDisabled)
          || Boolean(step.item.disabled)} nextStatus={index < displayed.length - 1
              ? composition?.railFollowPrevStatus ? statuses[index] : statuses[index + 1]
              : undefined} {rootId} statusText={composition?.timeline ? undefined : strings[statuses[index]]} composed={composition?.timeline} {classes} {slots}
      dot={layout.dot} panel={layout.type === 'panel'} inline={layout.type === 'inline'} percent={actualPercent} {iconRender}
      ellipsis={step.originIndex < 0} sourceKey={step.item.originalKey
          ?? (display.collapsed && step.originIndex >= 0
            ? step.originIndex
            : undefined)} onChoose={onChange || step.item.onClick
                ? event => choose(event, step.item, initial + step.originIndex)
                : undefined} />
  {/each}
</ol>
