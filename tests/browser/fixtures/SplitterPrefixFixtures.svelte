<script lang="ts">
  import { ConfigProvider } from 'antd-svelte';
  import SplitterPrefixScope from './SplitterPrefixScope.svelte';
  import reference from './ant-design-splitter-prefix-reference.json';

  let selected = $state(reference.cases[0].sample.id as string);
  let live = $state(false);
  let prefix = $state('suite');
  let motion = $state(false);
  let sample = $derived(live ? { id: 'live', prefix, lazy: true }
    : (reference.cases.find(entry => entry.sample.id === selected) ?? reference.cases[0]).sample);
</script>

<section id="splitter-prefix-fixture">
  <label>Splitter prefix sample <select bind:value={selected}>
    {#each reference.cases as { sample }}<option value={sample.id}>{sample.id}</option>{/each}
  </select></label>
  <label><input type="checkbox" bind:checked={live} /> Live Splitter prefix</label>
  <label>Live Splitter prefix value <input bind:value={prefix} /></label>
  <label><input type="checkbox" bind:checked={motion} /> Splitter prefix motion</label>
  <ConfigProvider prefixCls={sample.prefix}
    direction={'rtl' in sample && sample.rtl ? 'rtl' : 'ltr'}
    theme={{ cssVar: 'variablePrefix' in sample ? { prefix: sample.variablePrefix } : {},
      token: { motionDurationSlow: motion ? '0.8s' : '0s' },
      components: 'aliases' in sample && sample.aliases
        ? { Splitter: { splitBarSize: 5, splitTriggerSize: 12, splitBarDraggableSize: 28 } }
        : undefined }}>
    <SplitterPrefixScope scope="normal" {sample} {motion} />
    <ConfigProvider prefixCls={'childPrefix' in sample ? sample.childPrefix : undefined}>
      <SplitterPrefixScope scope="nested" {sample} {motion} />
    </ConfigProvider>
  </ConfigProvider>
  <ConfigProvider theme={{ cssVar: {}, token: { motionDurationSlow: '0s' } }}>
    <SplitterPrefixScope scope="sibling" {sample} local={false} />
  </ConfigProvider>
</section>
