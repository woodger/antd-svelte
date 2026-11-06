<script lang="ts">
  import reference from './ant-design-float-button-theme-reference.json';
  import FloatButtonThemeCase from './FloatButtonThemeCase.svelte';

  let preset = $state('component-aliases');
  let mounted = $state(true);
  let enabled = $state(true);
  let inherit = $state(true);
  let size = $state<number>();
  let iconSize = $state<number>();
  let padding = $state<number>();
  let sample = $derived(reference.cases.find(item => item.name === preset)!);
</script>

<section id="float-button-theme-fixture">
  <h2>FloatButton source theme</h2>
  <select aria-label="FloatButton theme preset" bind:value={preset}>
    {#each reference.cases as item}<option value={item.name}>{item.name}</option>{/each}
  </select>
  <label><input type="checkbox" bind:checked={mounted} /> Mount themed FloatButton controls</label>
  <label><input type="checkbox" bind:checked={enabled} /> Apply source FloatButton theme</label>
  <label><input type="checkbox" bind:checked={inherit} /> Inherit FloatButton theme</label>
  <button type="button" onclick={() => {
    size = 64;
    iconSize = 20;
    padding = 10;
  }}>
    Update FloatButton tokens
  </button>
  {#key preset}
    <FloatButtonThemeCase {sample} {mounted} {enabled} {inherit} {size} {iconSize} {padding} />
  {/key}
</section>
