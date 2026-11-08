<script lang="ts">
  import { ConfigProvider } from 'antd-svelte';
  import StructurePrefixScope, { type StructurePrefixSample } from './StructurePrefixScope.svelte';
  import reference from './ant-design-structure-prefix-reference.json';

  let selected = $state(reference.cases[0].sample.id as string);
  let live = $state(false);
  let prefix = $state('suite');
  let sample = $derived(live ? { id: 'live', prefix }
    : (reference.cases.find(entry => entry.sample.id === selected) ?? reference.cases[0]).sample);
</script>

<section id="structure-prefix-fixture" aria-label="Shared Alert Collapse and Affix prefixes">
  <label>Structure prefix sample <select bind:value={selected}>
    {#each reference.cases as { sample }}<option value={sample.id}>{sample.id}</option>{/each}
  </select></label>
  <label><input type="checkbox" bind:checked={live} /> Live structure prefix</label>
  <label>Live structure prefix value <input bind:value={prefix} /></label>
  <ConfigProvider prefixCls={sample.prefix}
    direction={'rtl' in sample && sample.rtl ? 'rtl' : 'ltr'}
    theme={{ cssVar: 'variablePrefix' in sample ? { prefix: sample.variablePrefix } : {},
      token: { motion: false } }}>
    <StructurePrefixScope scope="normal" sample={sample as StructurePrefixSample} />
    <ConfigProvider prefixCls={'childPrefix' in sample ? sample.childPrefix : undefined}>
      <StructurePrefixScope scope="nested" sample={sample as StructurePrefixSample} />
    </ConfigProvider>
  </ConfigProvider>
  <ConfigProvider theme={{ cssVar: {}, token: { motion: false } }}>
    <StructurePrefixScope scope="sibling" sample={sample as StructurePrefixSample} local={false} />
  </ConfigProvider>
</section>
