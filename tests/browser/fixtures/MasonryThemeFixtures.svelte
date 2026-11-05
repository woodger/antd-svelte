<script lang="ts">
  import reference from './ant-design-masonry-theme-reference.json';
  import MasonryThemeCase from './MasonryThemeCase.svelte';

  let selected = $state('component-aliases');
  let sample = $derived(reference.cases.find(item => item.name === selected)!);
  let mounted = $state(true);
  let enabled = $state(true);
  let inherit = $state(true);
  let reversed = $state(false);
  let removed = $state(false);
  let fontSize = $state<number>();
  let motion = $state<boolean>();
  let zeroCss = $state(false);
</script>

<section id="masonry-theme-fixture">
  <h2>Source Masonry theme</h2>
  <select aria-label="Masonry theme preset" bind:value={selected}>
    {#each reference.cases as item}<option value={item.name}>{item.name}</option>{/each}
  </select>
  <label><input type="checkbox" bind:checked={mounted} /> Mount themed Masonry controls</label>
  <label><input type="checkbox" bind:checked={enabled} /> Apply source Masonry theme</label>
  <label><input type="checkbox" bind:checked={inherit} /> Inherit child Masonry theme</label>
  <label><input type="checkbox" bind:checked={zeroCss} /> Use zero-duration Masonry CSS</label>
  <button type="button" onclick={() => fontSize = 20}>Update Masonry font</button>
  <button type="button" onclick={() => reversed = !reversed}>Reverse themed Masonry items</button>
  <button type="button" onclick={() => removed = true}>Remove themed Masonry item</button>
  <button type="button" onclick={() => motion = true}>Enable Masonry motion</button>
  <button type="button" onclick={() => motion = false}>Disable Masonry motion</button>
  {#key sample.name}
    <MasonryThemeCase {sample} {mounted} {enabled} {inherit} {reversed} {removed}
      {fontSize} {motion} {zeroCss} />
  {/key}
</section>
