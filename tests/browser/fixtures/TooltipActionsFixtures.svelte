<script lang="ts">
  import { ConfigProvider, Tooltip } from 'antd-svelte';
  import reference from './ant-design-tooltip-actions-reference.json';
  import TooltipLifecycleCase from './TooltipLifecycleCase.svelte';
  import type { TooltipActionCase } from './tooltip-actions.types';

  const cases = reference.cases as readonly TooltipActionCase[];
  let selected = $state(cases[0].name);
  let source = $state(true);
  let binding = $state(false);
  let boundOpen = $state(false);
  let events = $state<boolean[]>([]);
  let sample = $derived(cases.find(item => item.name === selected)!);
</script>

<section id="tooltip-actions-fixture">
  <h2>Tooltip action overrides and focus delays</h2>
  <label><input type="checkbox" bind:checked={source} /> Source action config</label>
  <label><input type="checkbox" bind:checked={binding} /> Tooltip action binding</label>
  <select aria-label="Tooltip action case" bind:value={selected}>
    {#each cases as item}<option value={item.name}>{item.name}</option>{/each}
  </select>
  {#if binding}
    <ConfigProvider tooltip={source ? {} : undefined}>
      <label><input type="checkbox" bind:checked={boundOpen} /> Bound Tooltip open</label>
      <output aria-label="Bound action open">{String(boundOpen)}</output>
      <output aria-label="Bound action events">{JSON.stringify(events)}</output>
      <div style="margin:180px">
        <Tooltip title="Bound action content" bind:open={boundOpen}
          showAction={['focus']} hideAction={['click']}
          onOpenChange={value => events.push(value)}>
          <button type="button">Bound action trigger</button>
        </Tooltip>
      </div>
    </ConfigProvider>
  {:else}
    {#key sample.name}<TooltipLifecycleCase {sample} {source} kind={sample.mode} />{/key}
  {/if}
  <div id="lifecycle-container"></div>
</section>
