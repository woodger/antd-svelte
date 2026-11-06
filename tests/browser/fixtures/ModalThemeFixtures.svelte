<script lang="ts">
  import reference from './ant-design-modal-theme-reference.json';
  import ModalThemeCase from './ModalThemeCase.svelte';

  let preset = $state('component-aliases');
  let scope = $state('normal');
  let mode = $state('default');
  let mounted = $state(true);
  let enabled = $state(true);
  let inherit = $state(true);
  let updated = $state(false);
  let sample = $derived(reference.cases.find(item => item.name === preset)!);
</script>

<section id="modal-theme-fixture">
  <h2>Modal source theme</h2>
  <select aria-label="Modal theme preset" bind:value={preset}>
    {#each reference.cases as item}<option value={item.name}>{item.name}</option>{/each}
  </select>
  <select aria-label="Modal theme scope" bind:value={scope}>
    {#each ['normal', 'rtl', 'nested', 'reset', 'sibling', 'outside'] as id}
      <option value={id}>{id}</option>
    {/each}
  </select>
  <select aria-label="Modal theme mode" bind:value={mode}>
    {#each ['default', 'no-footer', 'custom-footer', 'no-close', 'wide', 'close-hover', 'body-text', 'portal'] as value}<option value={value}>{value}</option>{/each}
  </select>
  <label><input type="checkbox" bind:checked={mounted} /> Mount themed Modal</label>
  <label><input type="checkbox" bind:checked={enabled} /> Apply source Modal theme</label>
  <label><input type="checkbox" bind:checked={inherit} /> Inherit Modal theme</label>
  <button type="button" onclick={() => { updated = true; }}>Update Modal tokens</button>
  {#key `${preset}:${scope}:${mode}`}
    <ModalThemeCase {sample} {scope} {mode} {mounted} {enabled} {inherit} {updated} />
  {/key}
</section>
