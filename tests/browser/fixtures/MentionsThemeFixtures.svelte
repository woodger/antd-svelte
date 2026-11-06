<script lang="ts">
  import reference from './ant-design-mentions-theme-reference.json';
  import MentionsThemeCase from './MentionsThemeCase.svelte';

  let preset = $state('component-aliases');
  let scope = $state('normal');
  let mode = $state('default');
  let mounted = $state(true);
  let enabled = $state(true);
  let inherit = $state(true);
  let updated = $state(false);
  let autoSize = $state(false);
  let sample = $derived(reference.cases.find(item => item.name === preset)!);
</script>

<section id="mentions-theme-fixture">
  <h2>Mentions source theme</h2>
  <select aria-label="Mentions theme preset" bind:value={preset}>
    {#each reference.cases as item}<option value={item.name}>{item.name}</option>{/each}
  </select>
  <select aria-label="Mentions theme scope" bind:value={scope}>
    {#each ['normal', 'rtl', 'variable', 'priority', 'nested', 'reset', 'sibling', 'outside'] as id}
      <option value={id}>{id}</option>
    {/each}
  </select>
  <select aria-label="Mentions theme mode" bind:value={mode}>
    {#each ['default', 'small', 'large', 'filled', 'underlined', 'borderless', 'disabled', 'error', 'warning', 'hover', 'popup'] as value}<option value={value}>{value}</option>{/each}
  </select>
  <label><input type="checkbox" bind:checked={mounted} /> Mount themed Mentions</label>
  <label><input type="checkbox" bind:checked={enabled} /> Apply source Mentions theme</label>
  <label><input type="checkbox" bind:checked={inherit} /> Inherit Mentions theme</label>
  <label><input type="checkbox" bind:checked={autoSize} /> Autosize themed Mentions</label>
  <button type="button" onclick={() => { updated = true; }}>Update Mentions tokens</button>
  {#key `${preset}:${scope}:${mode}:${autoSize}`}
    <MentionsThemeCase {sample} {scope} {mode} {mounted} {enabled} {inherit} {updated} {autoSize} />
  {/key}
</section>
