<script lang="ts">
  import reference from './ant-design-border-beam-prefix-reference.json';
  import BorderBeamPrefixCase, { type BorderBeamPrefixSample } from './BorderBeamPrefixCase.svelte';

  const samples: BorderBeamPrefixSample[] = [
    ...reference.cases,
    { name: 'native-light', prefix: 'native-beam', config: {}, native: { mode: 'light' } },
    { name: 'native-dark', prefix: 'native-beam', config: {}, native: { mode: 'dark' } },
    { name: 'native-dark-compact', prefix: 'native-beam', config: {},
      native: { mode: 'dark', compact: true } }
  ];
  let selected = $state('tenant');
  let mounted = $state(true);
  let sample = $derived(samples.find(item => item.name === selected)!);
</script>

<section id="border-beam-prefix-fixture">
  <h2>BorderBeam local prefixes</h2>
  <label>BorderBeam prefix preset<select bind:value={selected}>
    {#each samples as item}<option value={item.name}>{item.name}</option>{/each}
  </select></label>
  <label><input type="checkbox" bind:checked={mounted} /> Mount prefix beam controls</label>
  {#key selected}<BorderBeamPrefixCase {sample} {mounted} />{/key}
</section>
