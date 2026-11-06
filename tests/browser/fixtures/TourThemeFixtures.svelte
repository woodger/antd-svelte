<script lang="ts">
  import reference from './ant-design-tour-theme-reference.json';
  import TourThemeCase from './TourThemeCase.svelte';

  let preset = $state('component-aliases');
  let scope = $state('normal');
  let mode = $state('default');
  let mounted = $state(true);
  let enabled = $state(true);
  let inherit = $state(true);
  let updated = $state(false);
  let draft = $state(false);
  let explicitLayer = $state(false);
  let sample = $derived(reference.cases.find(item => item.name === preset)!);
</script>

<section id="tour-theme-fixture">
  <h2>Tour source theme</h2>
  <select aria-label="Tour theme preset" bind:value={preset}>
    {#each reference.cases as item}<option value={item.name}>{item.name}</option>{/each}
  </select>
  <select aria-label="Tour theme scope" bind:value={scope}>
    {#each ['normal', 'rtl', 'variable', 'priority', 'nested', 'reset', 'sibling', 'outside'] as id}
      <option value={id}>{id}</option>
    {/each}
  </select>
  <select aria-label="Tour theme mode" bind:value={mode}>
    {#each ['default', 'primary', 'target', 'right'] as value}<option value={value}>{value}</option>{/each}
  </select>
  <label><input type="checkbox" bind:checked={mounted} /> Mount themed Tour</label>
  <label><input type="checkbox" bind:checked={enabled} /> Apply source Tour theme</label>
  <label><input type="checkbox" bind:checked={inherit} /> Inherit Tour theme</label>
  <label><input type="checkbox" bind:checked={draft} /> Show Tour input</label>
  <label><input type="checkbox" bind:checked={explicitLayer} /> Use explicit Tour layer</label>
  <button type="button" onclick={() => { updated = true; }}>Update Tour tokens</button>
  {#key `${preset}:${scope}:${mode}:${draft}`}
    <TourThemeCase {sample} {scope} {mode} {mounted} {enabled} {inherit} {updated} {draft}
      zIndex={explicitLayer ? 1900 : undefined} />
  {/key}
</section>
