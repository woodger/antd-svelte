<script lang="ts">
  import type { TourPanelInfo } from './tour.types';
  import { getTourCloseAttributes } from './tour.engine';
  import TourContent from './TourContent.svelte';

  let { info }: { info: TourPanelInfo; } = $props();
  let {
    prefixCls,
    current,
    total,
    title,
    description,
    closable,
    class: className,
    classNames = {},
    styles = {}
  } = $derived(info);
</script>

<div class={[`${prefixCls}-panel`, className]}>
  <div class={[`${prefixCls}-section`, classNames.section]} style={styles.section}>
    {#if closable}
      <button type="button" onclick={() => info.onClose?.()} aria-label="Close"
        {...getTourCloseAttributes(closable)} class={[`${prefixCls}-close`, classNames.close]}
        style={styles.close}>{#if closable.closeIcon !== null && closable.closeIcon !== undefined}<TourContent value={closable.closeIcon} />{:else}<span class={`${prefixCls}-close-x`}>×</span>{/if}</button>
    {/if}
    <div class={[`${prefixCls}-header`, classNames.header]} style={styles.header}>
      <div class={[`${prefixCls}-title`, classNames.title]} style={styles.title}>
        <TourContent value={title} />
      </div>
    </div>
    <div class={[`${prefixCls}-description`, classNames.description]} style={styles.description}>
      <TourContent value={description} />
    </div>
    <div class={[`${prefixCls}-footer`, classNames.footer]} style={styles.footer}>
      <div class={`${prefixCls}-sliders`}>
        {#if total > 1}{#each Array.from({ length: total }, (_, index) => index) as index}
          <span class:active={index === current}></span>
        {/each}{/if}
      </div>
      <div class={[`${prefixCls}-actions`, classNames.actions]} style={styles.actions}>
        {#if current !== 0}<button class={`${prefixCls}-prev-btn`} onclick={() => info.onPrev?.()}>Prev</button>{/if}{#if current === total - 1}<button class={`${prefixCls}-finish-btn`} onclick={() => info.onFinish?.()}>Finish</button>{:else}<button class={`${prefixCls}-next-btn`} onclick={() => info.onNext?.()}>Next</button>{/if}
      </div>
    </div>
  </div>
</div>
