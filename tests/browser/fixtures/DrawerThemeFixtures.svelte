<script lang="ts">
  import reference from './ant-design-drawer-theme-reference.json';
  import DrawerThemeCase from './DrawerThemeCase.svelte';

  let preset = $state('component-aliases');
  let scope = $state('normal');
  let mode = $state('default');
  let mounted = $state(true);
  let enabled = $state(true);
  let inherit = $state(true);
  let updated = $state(false);
  let sample = $derived(reference.cases.find(item => item.name === preset)!);
</script>

<section id="drawer-theme-fixture">
  <h2>Drawer source theme</h2>
  <select aria-label="Drawer theme preset" bind:value={preset}>
    {#each reference.cases as item}<option value={item.name}>{item.name}</option>{/each}
  </select>
  <select aria-label="Drawer theme scope" bind:value={scope}>
    {#each ['normal', 'rtl', 'variable', 'priority', 'nested', 'reset', 'sibling', 'outside'] as id}
      <option value={id}>{id}</option>
    {/each}
  </select>
  <select aria-label="Drawer theme mode" bind:value={mode}>
    {#each ['default', 'left', 'top', 'bottom', 'large', 'no-footer', 'no-extra', 'no-close', 'headerless', 'blur', 'close-hover', 'portal'] as value}<option value={value}>{value}</option>{/each}
  </select>
  <label><input type="checkbox" bind:checked={mounted} /> Mount themed Drawer</label>
  <label><input type="checkbox" bind:checked={enabled} /> Apply source Drawer theme</label>
  <label><input type="checkbox" bind:checked={inherit} /> Inherit Drawer theme</label>
  <button type="button" onclick={() => { updated = true; }}>Update Drawer tokens</button>
  {#key `${preset}:${scope}:${mode}`}
    <DrawerThemeCase {sample} {scope} {mode} {mounted} {enabled} {inherit} {updated} />
  {/key}
</section>
