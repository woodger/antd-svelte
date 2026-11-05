<script lang="ts">
  import reference from './ant-design-tooltip-lifecycle-reference.json';
  import type { TooltipLifecycleCase, TooltipLifecycleConsumer } from './tooltip-lifecycle.types';
  import TooltipLifecycleCaseComponent from './TooltipLifecycleCase.svelte';
  import TooltipLifecycleConsumers from './TooltipLifecycleConsumers.svelte';
  import TooltipLifecycleState from './TooltipLifecycleState.svelte';

  const cases = reference.cases as readonly TooltipLifecycleCase[];
  const consumers = reference.consumers as readonly TooltipLifecycleConsumer[];
  let selected = $state(cases[0].name);
  let source = $state(true);
  let mode = $state('tooltip');
  let sample = $derived(cases.find(item => item.name === selected)!);
</script>

<section id="tooltip-lifecycle-fixture">
  <h2>Tooltip lifecycle options</h2>
  <label><input type="checkbox" bind:checked={source} /> Source lifecycle theme</label>
  <select aria-label="Lifecycle consumer" bind:value={mode}>
    {#each ['tooltip', 'single', 'range', 'pinned', 'typography', 'state'] as item}
      <option value={item}>{item}</option>
    {/each}
  </select>
  <select aria-label="Tooltip lifecycle case" bind:value={selected}>
    {#each cases as item}<option value={item.name}>{item.name}</option>{/each}
  </select>
  {#if mode === 'tooltip'}
    {#key sample.name}<TooltipLifecycleCaseComponent {sample} {source} />{/key}
  {:else if mode === 'state'}
    <TooltipLifecycleState {source} />
  {:else}
    {#key mode}<TooltipLifecycleConsumers sample={consumers.find(item => item.mode === mode)!}
      {source} />{/key}
  {/if}
  <div id="lifecycle-container"></div>
</section>
