<script lang="ts">
  import { ConfigProvider, TreeSelect } from 'antd-svelte';
  import reference from './ant-design-tree-theme-reference.json';
  import TreeThemeCase from './TreeThemeCase.svelte';

  let preset = $state('component-aliases');
  let mounted = $state(true);
  let enabled = $state(true);
  let inherit = $state(true);
  let titleHeight = $state<number>();
  let switcherSize = $state<number>();
  let indentSize = $state<number>();
  let nodeSelectedBg = $state<string>();
  let sample = $derived(reference.cases.find(item => item.name === preset)!);
</script>

<section id="tree-theme-fixture">
  <h2>Tree source theme</h2>
  <select aria-label="Tree theme preset" bind:value={preset}>
    {#each reference.cases as item}<option value={item.name}>{item.name}</option>{/each}
  </select>
  <label><input type="checkbox" bind:checked={mounted} /> Mount themed Tree controls</label>
  <label><input type="checkbox" bind:checked={enabled} /> Apply source Tree theme</label>
  <label><input type="checkbox" bind:checked={inherit} /> Inherit Tree theme</label>
  <button type="button" onclick={() => {
    titleHeight = 40;
    switcherSize = 44;
    indentSize = 36;
    nodeSelectedBg = '#b5f5ec';
  }}>Update Tree tokens</button>
  <ConfigProvider theme={reference.treeSelectComposition.config}>
    <TreeSelect class="tree-theme-composition" open treeCheckable treeDefaultExpandAll
      defaultValue={['a']} style="width:240px" aria-label="Tree theme composition"
      treeData={[{ value: 'p', title: 'Parent', children: [
        { value: 'a', title: 'Alpha' }, { value: 'b', title: 'Beta' }
      ] }]} />
  </ConfigProvider>
  {#key preset}
    <TreeThemeCase {sample} {mounted} {enabled} {inherit}
      {titleHeight} {switcherSize} {indentSize} {nodeSelectedBg} />
  {/key}
</section>
