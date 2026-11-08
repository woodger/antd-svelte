<script lang="ts">
  import { ConfigProvider } from 'antd-svelte';
  import CorePrefixScope, { type CorePrefixSample } from './CorePrefixScope.svelte';
  import reference from './ant-design-core-prefix-reference.json';

  let selected = $state(reference.cases[0].sample.id as string);
  let live = $state(false);
  let prefix = $state('suite');
  let sample = $derived(live ? { id: 'live', prefix }
    : (reference.cases.find(entry => entry.sample.id === selected) ?? reference.cases[0]).sample);
</script>

<section id="core-prefix-fixture" aria-label="Shared Divider Flex and Segmented prefixes">
  <label>Core prefix sample <select bind:value={selected}>
    {#each reference.cases as { sample }}<option value={sample.id}>{sample.id}</option>{/each}
  </select></label>
  <label><input type="checkbox" bind:checked={live} /> Live core prefix</label>
  <label>Live core prefix value <input bind:value={prefix} /></label>
  <ConfigProvider prefixCls={sample.prefix}
    direction={'rtl' in sample && sample.rtl ? 'rtl' : 'ltr'}
    theme={{ cssVar: 'variablePrefix' in sample ? { prefix: sample.variablePrefix } : {},
      token: { motion: false } }}>
    <CorePrefixScope scope="normal" sample={sample as CorePrefixSample} />
    <ConfigProvider prefixCls={'childPrefix' in sample ? sample.childPrefix : undefined}>
      <CorePrefixScope scope="nested" sample={sample as CorePrefixSample} />
    </ConfigProvider>
  </ConfigProvider>
  <ConfigProvider theme={{ cssVar: {}, token: { motion: false } }}>
    <CorePrefixScope scope="sibling" sample={sample as CorePrefixSample} local={false} />
  </ConfigProvider>
</section>
