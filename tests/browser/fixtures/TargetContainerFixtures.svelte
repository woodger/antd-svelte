<script lang="ts">
  import reference from './ant-design-target-container-reference.json';
  import TargetContainerCase from './TargetContainerCase.svelte';

  let preset = $state('element-a');
  let mounted = $state(true);
  let override = $state<'a' | 'b' | 'window'>();
  let sample = $derived(reference.cases.find(item => item.name === preset)!);
</script>

<section id="target-container-fixture">
  <h2>Inherited scroll targets</h2>
  <select aria-label="Target container preset" bind:value={preset}>
    {#each reference.cases as item}<option value={item.name}>{item.name}</option>{/each}
  </select>
  <label><input type="checkbox" bind:checked={mounted} /> Mount target consumers</label>
  <button type="button" onclick={() => override = 'b'}>Use target B</button>
  <button type="button" onclick={() => override = 'window'}>Use window target</button>
  <form aria-label="Target consumer form">
    {#key preset}<TargetContainerCase {sample} {mounted} {override} />{/key}
  </form>
</section>
