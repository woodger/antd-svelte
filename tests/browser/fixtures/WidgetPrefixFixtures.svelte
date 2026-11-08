<script lang="ts">
  import { ConfigProvider } from 'antd-svelte';
  import WidgetPrefixScope, { type WidgetPrefixSample } from './WidgetPrefixScope.svelte';
  import reference from './ant-design-widget-prefix-reference.json';

  let selected = $state(reference.cases[0].sample.id as string);
  let live = $state(false);
  let prefix = $state('suite');
  let sample = $derived(live ? { id: 'live', prefix }
    : (reference.cases.find(entry => entry.sample.id === selected) ?? reference.cases[0]).sample);
</script>

<section id="widget-prefix-fixture" aria-label="Shared display component prefixes">
  <label>Widget prefix sample <select bind:value={selected}>
    {#each reference.cases as { sample }}<option value={sample.id}>{sample.id}</option>{/each}
  </select></label>
  <label><input type="checkbox" bind:checked={live} /> Live widget prefix</label>
  <label>Live widget prefix value <input bind:value={prefix} /></label>
  <ConfigProvider prefixCls={sample.prefix} direction={'rtl' in sample && sample.rtl ? 'rtl' : 'ltr'}
    theme={{ cssVar: 'variablePrefix' in sample ? { prefix: sample.variablePrefix } : {} }}>
    <WidgetPrefixScope scope="normal" sample={sample as WidgetPrefixSample} />
    <ConfigProvider prefixCls={'childPrefix' in sample ? sample.childPrefix : undefined}>
      <WidgetPrefixScope scope="nested" sample={sample as WidgetPrefixSample} />
    </ConfigProvider>
  </ConfigProvider>
  <ConfigProvider theme={{ cssVar: {} }}>
    <WidgetPrefixScope scope="sibling" sample={sample as WidgetPrefixSample} local={false} />
  </ConfigProvider>
</section>
