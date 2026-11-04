<script lang="ts">
  import { spinProgress } from './spin-percent.engine';

  let { prefixCls, percent, label }: {
    prefixCls: string;
    percent: number;
    label: string | undefined;
  } = $props();
  let rendered = $state(false);
  let progress = $derived(spinProgress(percent));

  // Source useLayoutEffect: кольцо отсутствует в SSR и остаётся после возврата к нулю.
  $effect(() => {
    if (percent !== 0) rendered = true;
  });
</script>

<style>
  @media (prefers-reduced-motion: reduce) {
    span[data-ant-spin-part="progress"], circle[data-ant-spin-part="circle"] { transition: none; }
  }
</style>

{#if rendered}
  <span class={[`${prefixCls}-dot-holder ${prefixCls}-dot-progress`,
    progress.value <= 0 && `${prefixCls}-dot-holder-hidden`]} data-ant-spin-part="progress">
    <svg viewBox="0 0 100 100" role="progressbar" aria-label={label}
      aria-valuemin="0" aria-valuemax="100" aria-valuenow={progress.value}>
      <circle class={`${prefixCls}-dot-circle ${prefixCls}-dot-circle-bg`}
        r="40" cx="50" cy="50" stroke-width="20" data-ant-spin-part="circle" />
      <circle class={`${prefixCls}-dot-circle`} r="40" cx="50" cy="50" stroke-width="20"
        style={`stroke-dashoffset:${progress.offset};stroke-dasharray:${progress.dash}`}
        data-ant-spin-part="circle" />
    </svg>
  </span>
{/if}
