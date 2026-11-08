<script lang="ts">
  import { untrack } from 'svelte';
  import { connectSplitterDrag, type SplitterDragCallbacks } from './splitter.dom';
  import { splitterAriaNumber, type SplitterResizable } from './splitter.engine';
  import type { SplitterProps, SplitterStyleSlots } from './splitter.types';
  import SplitterArrow from './SplitterArrow.svelte';

  let {
    prefixCls = 'ant-splitter',
    rootPrefix = 'ant',
    index,
    active,
    vertical,
    reverse,
    lazy,
    resizable,
    aria,
    container,
    draggerIcon,
    icons,
    classDefault,
    classActive,
    style,
    callbacks,
    onCollapse
  }: {
    prefixCls?: string;
    rootPrefix?: string;
    index: number;
    active: boolean;
    vertical: boolean;
    reverse: boolean;
    lazy: boolean;
    resizable: SplitterResizable;
    aria: { now: number; min: number; max: number; };
    container: number;
    draggerIcon: SplitterProps['draggerIcon'];
    icons: NonNullable<SplitterProps['collapsible']>['icon'];
    classDefault?: string;
    classActive?: string;
    style?: SplitterStyleSlots['dragger'];
    callbacks: Omit<SplitterDragCallbacks, 'preview'>;
    onCollapse: (index: number, side: 'start' | 'end') => void;
  } = $props();

  let dragger = $state<HTMLDivElement>();
  let preview = $state(0);
  let runtime = $state.raw<ReturnType<typeof connectSplitterDrag>>();
  let barPrefix = $derived(`${prefixCls}-bar`);
  let previewVariable = $derived(`--${rootPrefix.replace(/\./g, '')}-splitter-bar-preview-offset`);
  const visibility = (mode: boolean | 'auto') => mode === true ? 'always-visible'
    : mode === false ? 'always-hidden' : 'hover-only';

  function handleCollapseKey(event: KeyboardEvent, side: 'start' | 'end') {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onCollapse(index, side);
    }
  }

  $effect(() => {
    if (!dragger) return;

    const controller = connectSplitterDrag(
      dragger,
      () => ({
        index,
        vertical,
        reverse,
        lazy,
        resizable: resizable.resizable,
        container,
        ...aria
      }),
      {
        start: value => callbacks.start(value),
        update: (value, offset, end) => callbacks.update(value, offset, end),
        end: value => callbacks.end(value),
        doubleClick: value => callbacks.doubleClick(value),
        preview: value => { preview = value; }
      }
    );
    runtime = controller;

    return () => {
      controller.destroy();
      runtime = undefined;
    };
  });

  $effect(() => {
    const controller = runtime;
    const currentIndex = index;
    const currentLazy = lazy;

    untrack(() => controller?.sync(currentIndex, currentLazy));
  });
</script>

<style>
  /* Native button сохраняет геометрию исходного div role=button. */
  [data-ant-splitter-collapse] { border: 0; padding: 0; font-family: inherit; line-height: inherit; }
</style>

<div class={barPrefix} data-ant-splitter-bar>
  {#if lazy}<div
    class={[`${barPrefix}-preview`, Boolean(preview) && `${barPrefix}-preview-active`]}
    style={`${previewVariable}:${preview}px`}
  ></div>{/if}
  <div
    bind:this={dragger}
    class={[
      `${barPrefix}-dragger`,
      !resizable.resizable && `${barPrefix}-dragger-disabled`,
      active && `${barPrefix}-dragger-active`,
      draggerIcon !== undefined && `${barPrefix}-dragger-customize`,
      classDefault,
      active && classActive
    ]}
    style={style?.default}
    role="separator"
    aria-disabled={!resizable.resizable}
    aria-orientation={vertical ? 'horizontal' : 'vertical'}
    aria-valuenow={splitterAriaNumber(aria.now)}
    aria-valuemin={splitterAriaNumber(aria.min)}
    aria-valuemax={splitterAriaNumber(aria.max)}
  >
    {#if draggerIcon !== undefined}<div class={`${barPrefix}-dragger-icon`}>
      {#if typeof draggerIcon === 'function'}{@render draggerIcon()}{:else if typeof draggerIcon !== 'boolean'}{draggerIcon ?? ''}{/if}
    </div>{/if}
  </div>
  {#each ['start', 'end'] as side}
    {@const isStart = side === 'start'}
    {@const shown = isStart ? resizable.startCollapsible : resizable.endCollapsible}
    {@const mode = isStart ? resizable.showStartCollapsibleIcon : resizable.showEndCollapsibleIcon}
    {@const icon = isStart ? icons?.start : icons?.end}
    {#if shown}<button
      type="button"
      class={[
        `${barPrefix}-collapse-bar`,
        `${barPrefix}-collapse-bar-${side}`,
        icon !== undefined && `${barPrefix}-collapse-bar-customize`,
        `${barPrefix}-collapse-bar-${visibility(mode)}`
      ]}
      data-ant-splitter-collapse
      aria-label={`Toggle ${side} panel`}
      onclick={() => onCollapse(index, isStart ? 'start' : 'end')}
      onkeydown={event => handleCollapseKey(event, isStart ? 'start' : 'end')}
    ><span class={`${barPrefix}-collapse-icon ${barPrefix}-collapse-${side}`}>
      {#if icon === undefined}<SplitterArrow name={vertical ? isStart ? 'up' : 'down' : isStart ? 'left' : 'right'} />
      {:else if typeof icon === 'function'}{@render icon()}{:else if typeof icon !== 'boolean'}{icon ?? ''}{/if}
    </span></button>{/if}
  {/each}
</div>
