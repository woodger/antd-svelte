<script lang="ts">
  import { Tag } from 'antd-svelte';
  import TagPrefixCase from './TagPrefixCase.svelte';
  import reference from './ant-design-tag-prefix-reference.json';
  import type { TagPrefixCase as Sample } from './tag-prefix-presets';

  let name = $state(reference.cases[0].name);
  let changed = $state(false);
  let mounted = $state(true);
  let nativeTheme = $state(false);
  let sample = $derived(reference.cases.find(sample => sample.name === name)! as Sample);
</script>

<section id="tag-prefix-fixture">
  <h2>Tag local prefixes</h2>
  <label>Tag prefix reference <select bind:value={name} onchange={() => {
    changed = false;
    mounted = true;
  }}>
    {#each reference.cases as sample}<option value={sample.name}>{sample.name}</option>{/each}
  </select></label>
  <label><input type="checkbox" bind:checked={nativeTheme} /> Native Tag prefix theme</label>
  <button type="button" onclick={() => changed = !changed}>Change Tag prefix props</button>
  <button type="button" onclick={() => mounted = !mounted}>Toggle prefix component</button>
  <input aria-label="Tag prefix outside input" value="Outside draft" />
  <div id="tag-prefix-surface">
    {#if mounted}{#key name}<TagPrefixCase {sample} {changed} {nativeTheme} />{/key}{/if}
  </div>
  <Tag color="blue" variant="outlined" data-tag-prefix-neighbor="">Default neighbor</Tag>
  <Tag prefixCls="sibling-tag" color="green" data-tag-prefix-sibling="">Sibling prefix</Tag>
  <div id="tag-prefix-destination">Prefix destination</div>
</section>
