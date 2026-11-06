<script lang="ts">
  import reference from './ant-design-upload-theme-reference.json';
  import UploadThemeCase from './UploadThemeCase.svelte';

  let preset = $state('component-aliases');
  let scope = $state('normal');
  let mode = $state('default');
  let mounted = $state(true);
  let enabled = $state(true);
  let inherit = $state(true);
  let updated = $state(false);
  let sample = $derived(reference.cases.find(item => item.name === preset)!);
</script>

<section id="upload-theme-fixture">
  <h2>Upload source theme</h2>
  <select aria-label="Upload theme preset" bind:value={preset}>
    {#each reference.cases as item}<option value={item.name}>{item.name}</option>{/each}
  </select>
  <select aria-label="Upload theme scope" bind:value={scope}>
    {#each ['normal', 'rtl', 'variable', 'priority', 'nested', 'reset', 'sibling', 'outside'] as id}
      <option value={id}>{id}</option>
    {/each}
  </select>
  <select aria-label="Upload theme mode" bind:value={mode}>
    {#each ['default', 'picture', 'picture-card', 'picture-circle', 'drag', 'disabled', 'card-disabled', 'hover', 'card-hover', 'progress', 'trigger-variables'] as value}<option value={value}>{value}</option>{/each}
  </select>
  <label><input type="checkbox" bind:checked={mounted} /> Mount themed Upload</label>
  <label><input type="checkbox" bind:checked={enabled} /> Apply source Upload theme</label>
  <label><input type="checkbox" bind:checked={inherit} /> Inherit Upload theme</label>
  <button type="button" onclick={() => { updated = true; }}>Update Upload tokens</button>
  {#key `${preset}:${scope}:${mode}`}
    <UploadThemeCase {sample} {scope} {mode} {mounted} {enabled} {inherit} {updated} />
  {/key}
</section>
