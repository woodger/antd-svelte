<script lang="ts">
  import { ConfigProvider } from 'antd-svelte';
  import StatusPrefixScope, { type StatusPrefixSample } from './StatusPrefixScope.svelte';
  import reference from './ant-design-status-prefix-reference.json';

  let selected = $state(reference.cases[0].sample.id as string);
  let live = $state(false);
  let prefix = $state('suite');
  let count = $state(5);
  let sample = $derived(live ? { id: 'live', prefix }
    : (reference.cases.find(entry => entry.sample.id === selected) ?? reference.cases[0]).sample);
</script>

<section id="status-prefix-fixture" aria-label="Shared status component prefixes">
  <label>Status prefix sample <select bind:value={selected}>
    {#each reference.cases as { sample }}<option value={sample.id}>{sample.id}</option>{/each}
  </select></label>
  <label><input type="checkbox" bind:checked={live} /> Live status prefix</label>
  <label>Live status prefix value <input bind:value={prefix} /></label>
  <label>Prefixed badge count <input type="number" bind:value={count} /></label>
  <ConfigProvider prefixCls={sample.prefix}
    direction={'rtl' in sample && sample.rtl ? 'rtl' : 'ltr'}
    theme={{ cssVar: 'variablePrefix' in sample ? { prefix: sample.variablePrefix } : {},
      token: { motion: false } }}>
    <StatusPrefixScope scope="normal" sample={sample as StatusPrefixSample} {count} />
    <ConfigProvider prefixCls={'childPrefix' in sample ? sample.childPrefix : undefined}>
      <StatusPrefixScope scope="nested" sample={sample as StatusPrefixSample} />
    </ConfigProvider>
  </ConfigProvider>
  <ConfigProvider theme={{ cssVar: {}, token: { motion: false } }}>
    <StatusPrefixScope scope="sibling" sample={sample as StatusPrefixSample} local={false} />
  </ConfigProvider>
</section>
