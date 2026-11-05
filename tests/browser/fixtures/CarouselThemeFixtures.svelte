<script lang="ts">
  import reference from './ant-design-carousel-theme-reference.json';
  import CarouselThemeCase from './CarouselThemeCase.svelte';

  let selected = $state('reported');
  let sample = $derived(reference.cases.find(item => item.name === selected)!);
  let enabled = $state(true);
  let mounted = $state(true);
  let inherit = $state(true);
  let dotWidth = $state<number>();
</script>

<section id="carousel-theme-fixture">
  <h2>Source Carousel tokens</h2>
  <select aria-label="Carousel token preset" bind:value={selected}>
    {#each reference.cases as item}<option value={item.name}>{item.name}</option>{/each}
  </select>
  <label><input type="checkbox" bind:checked={enabled} /> Apply source Carousel tokens</label>
  <label><input type="checkbox" bind:checked={inherit} /> Inherit child Carousel tokens</label>
  <label><input type="checkbox" bind:checked={mounted} /> Mount themed Carousels</label>
  <button type="button" onclick={() => dotWidth = 19}>Update Carousel dot width</button>
  <CarouselThemeCase {sample} {enabled} {mounted} {inherit} {dotWidth} />
</section>
