<script lang="ts">
  import reference from './ant-design-card-theme-reference.json';
  import CardThemeCase from './CardThemeCase.svelte';

  let selected = $state('reported-true');
  let sample = $derived(reference.cases.find(item => item.name === selected)!);
  let enabled = $state(true);
  let mounted = $state(true);
  let inherit = $state(true);
  let objectCssVar = $state(false);
  let bodyPadding = $state<number>();
</script>

<section id="card-theme-fixture">
  <h2>Source Card tokens</h2>
  <select aria-label="Card token preset" bind:value={selected}>
    {#each reference.cases as item}<option value={item.name}>{item.name}</option>{/each}
  </select>
  <label><input type="checkbox" bind:checked={enabled} /> Apply source Card tokens</label>
  <label><input type="checkbox" bind:checked={inherit} /> Inherit child Card tokens</label>
  <label><input type="checkbox" bind:checked={mounted} /> Mount themed Cards</label>
  <label><input type="checkbox" bind:checked={objectCssVar} /> Use public cssVar object</label>
  <button type="button" onclick={() => bodyPadding = 9}>Update Card body padding</button>
  <CardThemeCase {sample} {enabled} {mounted} {inherit} {bodyPadding}
    cssVar={objectCssVar ? {} : undefined} />
</section>
