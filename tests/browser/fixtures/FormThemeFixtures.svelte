<script lang="ts">
  import reference from './ant-design-form-theme-reference.json';
  import FormThemeCase from './FormThemeCase.svelte';

  let preset = $state('component-tokens');
  let mounted = $state(true);
  let enabled = $state(true);
  let inherit = $state(true);
  let labelHeight = $state<number>();
  let verticalHeight = $state<number>();
  let fontSize = $state<number>();
  let margin = $state<number>();
  let sample = $derived(reference.cases.find(item => item.name === preset)!);
</script>

<section id="form-theme-fixture">
  <h2>Form source theme</h2>
  <select aria-label="Form theme preset" bind:value={preset}>
    {#each reference.cases as item}<option value={item.name}>{item.name}</option>{/each}
  </select>
  <label><input type="checkbox" bind:checked={mounted} /> Mount themed Form controls</label>
  <label><input type="checkbox" bind:checked={enabled} /> Apply source Form theme</label>
  <label><input type="checkbox" bind:checked={inherit} /> Inherit Form theme</label>
  <button type="button" onclick={() => {
    labelHeight = 64;
    verticalHeight = 36;
    fontSize = 24;
    margin = 40;
  }}>Update Form tokens</button>
  {#key preset}
    <FormThemeCase {sample} {mounted} {enabled} {inherit}
      {labelHeight} {verticalHeight} {fontSize} {margin} />
  {/key}
</section>
