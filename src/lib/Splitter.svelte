<script lang="ts">
  import { useConfig } from './config-context';
  import { getSplitterAria, splitterDraggerClasses } from './splitter.engine';
  import { observeSplitterSize } from './splitter.dom';
  import { createSplitterModel } from './splitter.model.svelte.js';
  import { spaceOrientation } from './space.engine';
  import type { SplitterProps, SplitterSemantic } from './splitter.types';
  import SplitterBar from './SplitterBar.svelte';
  import SplitterPanel from './SplitterPanel.svelte';

  let {
    items = [],
    orientation,
    vertical,
    layout,
    lazy = false,
    collapsible,
    collapsibleIcon,
    destroyOnHidden = false,
    draggerIcon,
    onResizeStart,
    onResize,
    onResizeEnd,
    onCollapse,
    onDraggerDoubleClick,
    class: className,
    rootClassName,
    style,
    classNames,
    styles,
    nativeElement = $bindable()
  }: SplitterProps = $props();

  const config = useConfig();
  let actualOrientation = $derived(spaceOrientation(orientation, vertical, layout));
  let isVertical = $derived(actualOrientation === 'vertical');
  let reverse = $derived(!isVertical && config.direction === 'rtl');
  const model = createSplitterModel(
    () => ({ items, onResizeStart, onResize, onResizeEnd, onCollapse }),
    () => reverse
  );
  let info = $derived({
    props: {
      items,
      orientation: actualOrientation,
      vertical: isVertical,
      layout,
      lazy,
      collapsible,
      collapsibleIcon,
      destroyOnHidden,
      draggerIcon,
      onResizeStart,
      onResize,
      onResizeEnd,
      onCollapse,
      onDraggerDoubleClick,
      class: className,
      rootClassName,
      style,
      classNames,
      styles,
      nativeElement
    }
  });
  const resolve = <Value,>(value: SplitterSemantic<Value> | undefined) =>
    typeof value === 'function'
      ? (value as (context: { props: SplitterProps; }) => Value | undefined)(info)
      : value;
  let contextClasses = $derived(resolve(config.splitter?.classNames) ?? {});
  let localClasses = $derived(resolve(classNames) ?? {});
  let contextStyles = $derived(resolve(config.splitter?.styles) ?? {});
  let localStyles = $derived(resolve(styles) ?? {});
  let draggerClass = $derived({
    default: [
      splitterDraggerClasses(contextClasses.dragger).default,
      splitterDraggerClasses(localClasses.dragger).default
    ].filter(Boolean).join(' '),
    active: [
      splitterDraggerClasses(contextClasses.dragger).active,
      splitterDraggerClasses(localClasses.dragger).active
    ].filter(Boolean).join(' ')
  });
  let draggerStyle = $derived({
    default: [
      contextStyles.dragger?.default,
      localStyles.dragger?.default
    ].filter(Boolean).join(';'),
    active: [contextStyles.dragger?.active, localStyles.dragger?.active].filter(Boolean).join(';')
  });

  $effect(() => {
    if (!nativeElement) return;

    return observeSplitterSize(nativeElement, () => isVertical, model.measure);
  });
</script>

<div
  bind:this={nativeElement}
  class={[
    'ant-splitter',
    className,
    `ant-splitter-${actualOrientation}`,
    config.direction === 'rtl' && 'ant-splitter-rtl',
    rootClassName,
    contextClasses.root,
    localClasses.root,
    config.splitter?.class,
    'ant-splitter-css-var'
  ]}
  style={[contextStyles.root, config.splitter?.style, localStyles.root, style].filter(Boolean).join(';')}
>
  {#each model.items as panel, index}
    <SplitterPanel
      {panel}
      size={model.sizes.panels[index]}
      class={[contextClasses.panel, localClasses.panel].filter(Boolean).join(' ')}
      style={[contextStyles.panel, localStyles.panel].filter(Boolean).join(';')}
      motion={Boolean(collapsible?.motion && model.movingIndex === undefined)}
      destroyOnHidden={panel.destroyOnHidden ?? destroyOnHidden}
    />
    {#if model.resizable[index]}<SplitterBar
      {index}
      {lazy}
      {reverse}
      vertical={isVertical}
      active={model.movingIndex === index}
      resizable={model.resizable[index]}
      aria={getSplitterAria(model.sizes, index)}
      container={model.containerSize}
      {draggerIcon}
      icons={collapsible?.icon || collapsibleIcon}
      classDefault={draggerClass.default}
      classActive={draggerClass.active}
      style={draggerStyle}
      callbacks={{
        start: model.start,
        update: model.update,
        end: model.end,
        doubleClick: value => onDraggerDoubleClick?.(value)
      }}
      onCollapse={model.collapse}
    />{/if}
  {/each}
  {#if model.movingIndex !== undefined}<div
    aria-hidden="true"
    class={`ant-splitter-mask ant-splitter-mask-${actualOrientation}`}
  ></div>{/if}
</div>
