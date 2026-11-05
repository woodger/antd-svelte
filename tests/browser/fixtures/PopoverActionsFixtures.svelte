<script lang="ts">
  import reference from './ant-design-popover-actions-reference.json';
  import PopoverActionsCase from './PopoverActionsCase.svelte';
  import type { PopoverActionCase } from './popover-actions.types';

  const cases = reference.cases as readonly PopoverActionCase[];
  let selected = $state(cases[0].name);
  let source = $state(true);
  let sample = $derived(cases.find(item => item.name === selected)!);
</script>

<section id="popover-actions-fixture">
  <h2>Popover and Popconfirm action overrides</h2>
  <label><input type="checkbox" bind:checked={source} /> Source Popover actions</label>
  <select aria-label="Popover action case" bind:value={selected}>
    {#each cases as item}<option value={item.name}>{item.name}</option>{/each}
  </select>
  {#key sample.name}<PopoverActionsCase {sample} {source} />{/key}
</section>
