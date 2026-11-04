<script lang="ts">
  import ProgressLineCase from './ProgressLineCase.svelte';
  import type { ProgressLineSample } from './ProgressLineCase.svelte';
  import reference from './ant-design-progress-line-reference.json';

  let selected = $state('default');
  let percent = $state<number>();
  let successPercent = $state<number>();
  let count = $state<number>();
  let inner = $state(false);
  let prefix = $state<string>();
  let radius = $state<number>();
  let mounted = $state(true);
  let rtl = $state<boolean>();
  let sample = $derived.by((): ProgressLineSample => {
    const source = reference.cases.find(item => item.name === selected)! as ProgressLineSample;
    return { ...source,
      ...(rtl === undefined ? {} : { rtl }),
      props: { ...source.props,
        ...(percent === undefined ? {} : { percent }),
        ...(successPercent === undefined ? {} : { success: { percent: successPercent } }),
        ...(count === undefined ? {} : { steps: count }),
        ...(inner ? { percentPosition: { align: 'center', type: 'inner' } } : {}),
        ...(prefix === undefined ? {} : { prefixCls: prefix })
      }
    };
  });
  function reset() {
    percent = undefined;
    successPercent = undefined;
    count = undefined;
    inner = false;
    prefix = undefined;
    radius = undefined;
    mounted = true;
    rtl = undefined;
  }
</script>

<section id="progress-line-fixture">
  <h2>Source Progress line</h2>
  <label>Progress line case<select bind:value={selected} onchange={reset}>
    {#each reference.cases as item}<option value={item.name}>{item.name}</option>{/each}
  </select></label>
  <button type="button" onclick={() => percent = 80}>Update line percent</button>
  <button type="button" onclick={() => successPercent = 45}>Update success percent</button>
  <button type="button" onclick={() => count = 7}>Set line steps</button>
  <button type="button" onclick={() => count = 0}>Clear line steps</button>
  <button type="button" onclick={() => inner = !inner}>Toggle inner percent</button>
  <button type="button" onclick={() => prefix = prefix ? '' : 'live-progress'}>Change Progress prefix</button>
  <button type="button" onclick={() => radius = 0}>Square themed Progress</button>
  <button type="button" onclick={() => mounted = !mounted}>Toggle line mount</button>
  <button type="button" onclick={() => rtl = !rtl}>Toggle line RTL</button>
  <input aria-label="Progress line draft" value="Draft" />
  <button type="button">Before line</button>
  {#key selected}<ProgressLineCase {sample} {radius} {mounted} />{/key}
  <button type="button">After line</button>
</section>
