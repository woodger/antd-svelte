<script lang="ts">
  import { ConfigProvider, Row, Col } from 'antd-svelte';
  import reference from './ant-design-grid-theme-reference.json';
  import GridThemeCase from './GridThemeCase.svelte';

  let preset = $state('component-aliases');
  let scope = $state('normal');
  let mode = $state('default');
  let enabled = $state(true);
  let inherit = $state(true);
  let mounted = $state(true);
  let updated = $state(false);
  let sample = $derived(reference.cases.find(item => item.name === preset)!);
</script>

<section id="grid-theme-fixture">
  <h2>Grid source theme</h2>
  <select aria-label="Grid theme preset" bind:value={preset}>
    {#each reference.cases as item}<option value={item.name}>{item.name}</option>{/each}
  </select>
  <select aria-label="Grid theme scope" bind:value={scope}>
    {#each ['normal', 'rtl', 'nested', 'reset', 'sibling', 'outside'] as value}
      <option value={value}>{value}</option>
    {/each}
  </select>
  <select aria-label="Grid theme mode" bind:value={mode}>
    {#each ['default', 'no-gutter', 'nowrap', 'row-style', 'col-style', 'stateful',
      'row-style-canonical', 'col-style-canonical'] as value}
      <option value={value}>{value}</option>
    {/each}
  </select>
  <label><input type="checkbox" bind:checked={enabled} /> Apply source Grid theme</label>
  <label><input type="checkbox" bind:checked={inherit} /> Inherit Grid theme</label>
  <label><input type="checkbox" bind:checked={mounted} /> Mount themed Grid</label>
  <button type="button" onclick={() => { updated = true; }}>Update Grid tokens</button>
  {#key `${preset}:${scope}:${mode}`}<GridThemeCase {sample} {scope} {mode} {enabled} {inherit}
    {mounted} {updated} />{/key}
</section>
<div id="grid-theme-neighbor">
  <ConfigProvider theme={{ cssVar: {}, components: { Grid: { fontFamily: 'cursive', fontSize: 17 } } }}>
    <Row><Col span={24}>Independent Grid</Col></Row>
  </ConfigProvider>
</div>
