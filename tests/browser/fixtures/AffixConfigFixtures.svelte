<script lang="ts">
  import reference from './ant-design-affix-config-reference.json';
  import AffixConfigCase, { type AffixConfigSample } from './AffixConfigCase.svelte';

  const samples: AffixConfigSample[] = [
    ...reference.cases,
    { name: 'native-light', prefix: 'native-affix', config: {}, native: { mode: 'light' } },
    { name: 'native-dark', prefix: 'native-affix', config: {}, native: { mode: 'dark' } },
    { name: 'native-dark-compact', prefix: 'native-affix', config: {},
      native: { mode: 'dark', compact: true } }
  ];
  let selected = $state('tenant');
  let mounted = $state(true);
  let sample = $derived(samples.find(item => item.name === selected)!);
</script>

<section id="affix-config-fixture">
  <h2>Affix local configuration</h2>
  <select aria-label="Affix config preset" bind:value={selected}>
    {#each samples as item}<option value={item.name}>{item.name}</option>{/each}
  </select>
  <label><input type="checkbox" bind:checked={mounted} /> Mount configured Affix controls</label>
  {#key selected}<AffixConfigCase {sample} {mounted} />{/key}
</section>
