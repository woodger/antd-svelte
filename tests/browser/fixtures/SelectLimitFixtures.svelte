<script lang="ts">
  import { Select } from 'antd-svelte';
  import reference from './ant-design-select-max-count-reference.json';
  import SelectTagsCase from './SelectTagsCase.svelte';
  import { getSelectCountLimit, type SelectLimitSample } from './select-limit-cases';

  let selected = $state(reference.cases[0].sample.id as string);
  let overrideLimit = $state(false);
  let limit = $state(2);
  let nativeChecks = $state(false);
  let sample = $derived((reference.cases.find(entry => entry.sample.id === selected)
    ?? reference.cases[0]).sample as SelectLimitSample);
</script>

<section id="select-limit-fixture" aria-label="Select maximum selected count">
  <label>Limit sample
    <select bind:value={selected}>
      {#each reference.cases as { sample }}<option value={sample.id}>{sample.id}</option>{/each}
    </select>
  </label>
  <label><input type="checkbox" bind:checked={overrideLimit} />Override selection limit</label>
  <label>Selection limit<input type="number" bind:value={limit} /></label>
  <label><input type="checkbox" bind:checked={nativeChecks} />Native limit constraints</label>
  {#each [sample] as current (current.id)}
    <SelectTagsCase sample={current} {nativeChecks}
      maxCount={overrideLimit ? limit : getSelectCountLimit(current.limit)}
      tokenSeparators={current.separators ?? (current.splitter === 'csv'
        ? text => text.split(',') : undefined)} />
  {/each}
  <Select options={[{ value: 'a', label: 'Alpha' }]} maxCount={0} aria-label="Single ignores limit" />
</section>
