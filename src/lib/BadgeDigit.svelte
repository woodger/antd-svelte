<script lang="ts">
  import { untrack } from 'svelte';
  import { getBadgeDigitState } from './badge-digit.engine';

  let { value, count }: { value: string; count: number; } = $props();
  let numericValue = $derived(Number(value));
  let previousValue = $state(untrack(() => Number(value)));
  let previousCount = $state(untrack(() => Math.abs(count)));
  let plan = $derived(getBadgeDigitState(value, count, previousValue, previousCount));

  $effect(() => {
    const nextValue = numericValue;
    // Source effect зависит только от value и сохраняет count своего render.
    const nextCount = untrack(() => Math.abs(count));
    const timer = setTimeout(() => {
      previousValue = nextValue;
      previousCount = nextCount;
    }, 1000);
    return () => clearTimeout(timer);
  });

  function finish() {
    previousValue = numericValue;
    previousCount = Math.abs(count);
  }
</script>

<style>
  @media (prefers-reduced-motion: reduce) { .ant-scroll-number-only { transition: none; } }
</style>

<span class="ant-scroll-number-only"
  style={plan.transform ? `transform:${plan.transform}` : 'transition:none'}
  ontransitionend={finish}>{#each plan.units as unit (String(unit.key))}<span
    class={['ant-scroll-number-only-unit', unit.current && 'current']}
    style={unit.offset ? `position:absolute;top:${unit.offset}00%;left:0` : undefined}
  >{unit.value}</span>{/each}</span>
