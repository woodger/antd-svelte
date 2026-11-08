<script lang="ts">
  import { ConfigProvider } from 'antd-svelte';
  import PopupPrefixScope, { type PopupPrefixSample } from './PopupPrefixScope.svelte';
  import reference from './ant-design-popup-prefix-reference.json';

  let selected = $state(reference.cases[0].sample.id as string);
  let live = $state(false);
  let prefix = $state('suite');
  let current = $derived(reference.cases.find(entry => entry.sample.id === selected)
    ?? reference.cases[0]);
  let sample = $derived(live ? { id: 'live', kind: current.sample.kind, prefix } : current.sample);
</script>

<section id="popup-prefix-fixture" aria-label="Shared popup and Slider prefixes">
  <label>Popup prefix sample <select bind:value={selected}>
    {#each reference.cases as { sample }}<option value={sample.id}>{sample.id}</option>{/each}
  </select></label>
  <label><input type="checkbox" bind:checked={live} /> Live popup prefix</label>
  <label>Live popup prefix value <input bind:value={prefix} /></label>
  {#key sample.kind}
    <ConfigProvider prefixCls={sample.prefix}
      direction={'rtl' in sample && sample.rtl ? 'rtl' : 'ltr'}
      theme={{ cssVar: 'variablePrefix' in sample ? { prefix: sample.variablePrefix } : {},
        token: { motion: false } }}>
      <PopupPrefixScope scope="normal" sample={sample as PopupPrefixSample} />
      <ConfigProvider prefixCls={'childPrefix' in sample ? sample.childPrefix : undefined}>
        <PopupPrefixScope scope="nested" sample={sample as PopupPrefixSample} />
      </ConfigProvider>
    </ConfigProvider>
    <ConfigProvider theme={{ cssVar: {}, token: { motion: false } }}>
      <PopupPrefixScope scope="sibling" sample={sample as PopupPrefixSample} local={false} />
    </ConfigProvider>
  {/key}
</section>
