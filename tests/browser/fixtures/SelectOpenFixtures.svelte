<script lang="ts">
  import reference from './ant-design-select-open-reference.json';
  import SelectOpenCase, { type SelectOpenSample } from './SelectOpenCase.svelte';

  let selected = $state(reference.cases[0].sample.id as string);
  let sample = $derived(['bound', 'bound-default', 'bound-multiple', 'accepted'].includes(selected)
    ? { id: selected, mode: selected === 'bound-multiple' ? 'multiple' : 'single',
      open: selected === 'bound-default' ? undefined : false,
      defaultOpen: selected === 'bound-default' }
    : (reference.cases.find(entry => entry.sample.id === selected) ?? reference.cases[0]).sample);
</script>

<section id="select-open-fixture" aria-label="Select popup visibility">
  <label>Open sample <select bind:value={selected}>
    {#each reference.cases as { sample }}<option value={sample.id}>{sample.id}</option>{/each}
    <option value="bound">bound</option><option value="bound-default">bound-default</option>
    <option value="bound-multiple">bound-multiple</option><option value="accepted">accepted</option>
  </select></label>
  {#each [sample] as current (current.id)}<SelectOpenCase sample={current as SelectOpenSample} />{/each}
</section>
