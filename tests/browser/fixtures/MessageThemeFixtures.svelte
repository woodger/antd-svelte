<script lang="ts">
  import reference from './ant-design-message-theme-reference.json';
  import MessageThemeCase from './MessageThemeCase.svelte';

  let preset = $state('component-aliases');
  let scope = $state('normal');
  let mode = $state('default');
  let mounted = $state(true);
  let enabled = $state(true);
  let inherit = $state(true);
  let updated = $state(false);
  let sample = $derived(reference.cases.find(item => item.name === preset)!);
</script>

<section id="message-theme-fixture">
  <h2>Message source theme</h2>
  <select aria-label="Message theme preset" bind:value={preset}>
    {#each reference.cases as item}<option value={item.name}>{item.name}</option>{/each}
  </select>
  <select aria-label="Message theme scope" bind:value={scope}>
    {#each ['normal', 'rtl', 'variable', 'priority', 'holder-style', 'nested', 'reset', 'sibling', 'outside'] as id}
      <option value={id}>{id}</option>
    {/each}
  </select>
  <select aria-label="Message theme mode" bind:value={mode}>
    {#each ['default', 'success', 'warning', 'error', 'loading', 'custom-icon', 'multiline'] as value}
      <option value={value}>{value}</option>
    {/each}
  </select>
  <label><input type="checkbox" bind:checked={mounted} /> Mount themed Message</label>
  <label><input type="checkbox" bind:checked={enabled} /> Apply source Message theme</label>
  <label><input type="checkbox" bind:checked={inherit} /> Inherit Message theme</label>
  <button type="button" onclick={() => { updated = true; }}>Update Message tokens</button>
  {#key `${preset}:${scope}:${mode}`}
    <MessageThemeCase {sample} {scope} {mode} {mounted} {enabled} {inherit} {updated} />
  {/key}
</section>
