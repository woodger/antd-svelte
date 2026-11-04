<script lang="ts">
  import ProgressCircleCase from './ProgressCircleCase.svelte';
  import type { ProgressCircleSample } from './ProgressCircleCase.svelte';
  import reference from './ant-design-progress-circle-reference.json';

  let selected = $state('quarter');
  let percent = $state<number>();
  let success = $state<number>();
  let steps = $state<number>();
  let gap = $state<number>();
  let diameter = $state<number>();
  let gradient = $state(false);
  let prefix = $state<string>();
  let mounted = $state(true);
  let rtl = $state<boolean>();
  let sample = $derived.by((): ProgressCircleSample => {
    const source = reference.cases.find(item => item.name === selected)! as ProgressCircleSample;
    return { ...source,
      ...(rtl === undefined ? {} : { rtl }),
      props: { ...source.props,
        ...(percent === undefined ? {} : { percent }),
        ...(success === undefined ? {} : { success: { percent: success } }),
        ...(steps === undefined ? {} : { steps }),
        ...(gap === undefined ? {} : { gapDegree: gap, gapPlacement: 'start' }),
        ...(diameter === undefined ? {} : { size: diameter }),
        ...(gradient ? { strokeColor: { '0%': '#108ee9', '100%': '#87d068' } } : {}),
        ...(prefix === undefined ? {} : { prefixCls: prefix })
      }
    };
  });

  function reset() {
    percent = undefined;
    success = undefined;
    steps = undefined;
    gap = undefined;
    diameter = undefined;
    gradient = false;
    prefix = undefined;
    mounted = true;
    rtl = undefined;
  }
</script>

<section id="progress-circle-fixture">
  <h2>Source Progress circle</h2>
  <label>Progress circle case<select bind:value={selected} onchange={reset}>
    {#each reference.cases as item}<option value={item.name}>{item.name}</option>{/each}
  </select></label>
  <button type="button" onclick={() => percent = percent === 80 ? 35 : 80}>Update circle percent</button>
  <button type="button" onclick={() => success = 45}>Update circle success</button>
  <button type="button" onclick={() => steps = 8}>Set circular steps</button>
  <button type="button" onclick={() => steps = 0}>Clear circular steps</button>
  <button type="button" onclick={() => gap = 120}>Change circular gap</button>
  <button type="button" onclick={() => diameter = 18}>Shrink circular progress</button>
  <button type="button" onclick={() => diameter = 80}>Grow circular progress</button>
  <button type="button" onclick={() => gradient = !gradient}>Toggle circular gradient</button>
  <button type="button" onclick={() => prefix = 'live-progress'}>Change circular prefix</button>
  <button type="button" onclick={() => rtl = !rtl}>Toggle circle RTL</button>
  <button type="button" onclick={() => mounted = !mounted}>Toggle circle mount</button>
  <input aria-label="Progress circle draft" value="Draft" />
  <button type="button">Before circle</button>
  {#key selected}<ProgressCircleCase {sample} {mounted} />{/key}
  <button type="button">After circle</button>
</section>
