<script lang="ts">
  import reference from './ant-design-notification-theme-reference.json';
  import NotificationThemeCase from './NotificationThemeCase.svelte';

  let preset = $state('component-aliases');
  let scope = $state('normal');
  let mode = $state('default');
  let mounted = $state(true);
  let enabled = $state(true);
  let inherit = $state(true);
  let updated = $state(false);
  let editable = $state(false);
  let sameColors = $state(false);
  let undefinedWidth = $state(false);
  let sample = $derived(reference.cases.find(item => item.name === preset)!);
</script>

<section id="notification-theme-fixture">
  <h2>Notification source theme</h2>
  <select aria-label="Notification theme preset" bind:value={preset}>
    {#each reference.cases as item}<option value={item.name}>{item.name}</option>{/each}
  </select>
  <select aria-label="Notification theme scope" bind:value={scope}>
    {#each ['normal', 'rtl', 'variable', 'priority', 'holder-style', 'nested', 'reset', 'sibling', 'outside'] as id}
      <option value={id}>{id}</option>
    {/each}
  </select>
  <select aria-label="Notification theme mode" bind:value={mode}>
    {#each ['default', 'success', 'warning', 'error', 'plain', 'no-title', 'no-description', 'no-actions', 'no-close', 'custom-icon', 'bottomLeft', 'close-hover'] as value}
      <option value={value}>{value}</option>
    {/each}
  </select>
  <label><input type="checkbox" bind:checked={mounted} /> Mount themed Notification</label>
  <label><input type="checkbox" bind:checked={enabled} /> Apply source Notification theme</label>
  <label><input type="checkbox" bind:checked={inherit} /> Inherit Notification theme</label>
  <label><input type="checkbox" bind:checked={editable} /> Edit themed Notification</label>
  <label><input type="checkbox" bind:checked={sameColors} /> Explicit matching Notification colors</label>
  <label><input type="checkbox" bind:checked={undefinedWidth} /> Undefined Notification width</label>
  <button type="button" onclick={() => { updated = true; }}>Update Notification tokens</button>
  {#key `${preset}:${scope}:${mode}`}
    <NotificationThemeCase {sample} {scope} {mode} {mounted} {enabled} {inherit}
      {updated} {editable} {sameColors} {undefinedWidth} />
  {/key}
</section>
