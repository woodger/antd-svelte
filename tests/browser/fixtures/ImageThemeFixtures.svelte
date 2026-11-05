<script lang="ts">
  import reference from './ant-design-image-theme-reference.json';
  import ImageThemeCase from './ImageThemeCase.svelte';

  let selected = $state('all-tokens');
  let sample = $derived(reference.cases.find(item => item.name === selected)!);
  let enabled = $state(true);
  let mounted = $state(true);
  let inherit = $state(true);
  let operationSize = $state<number>();
  let operationColor = $state<string>();
  let zIndex = $state<number>();
  let duration = $state<string>();
</script>

<section id="image-theme-fixture">
  <h2>Source Image theme</h2>
  <select aria-label="Image theme preset" bind:value={selected}>
    {#each reference.cases as item}<option value={item.name}>{item.name}</option>{/each}
  </select>
  <label><input type="checkbox" bind:checked={enabled} /> Apply source Image theme</label>
  <label><input type="checkbox" bind:checked={inherit} /> Inherit child Image theme</label>
  <label><input type="checkbox" bind:checked={mounted} /> Mount themed Image controls</label>
  <button type="button" onclick={() => {
    operationSize = 34;
    operationColor = '#135200';
    zIndex = 2500;
    duration = '7s';
  }}>Update Image tokens</button>
  <ImageThemeCase {sample} {enabled} {mounted} {inherit}
    {operationSize} {operationColor} {zIndex} {duration} />
</section>
