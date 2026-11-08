<script lang="ts">
  import { ConfigProvider } from 'antd-svelte';
  import MasonryPrefixScope, { type MasonryPrefixSample } from './MasonryPrefixScope.svelte';
  import reference from './ant-design-masonry-prefix-reference.json';

  let selected = $state(reference.cases[0].sample.id as string);
  let live = $state(false);
  let prefix = $state('suite');
  let motion = $state(false);
  let removeLast = $state(false);
  let sample = $derived(live ? { id: 'live', prefix }
    : (reference.cases.find(entry => entry.sample.id === selected) ?? reference.cases[0]).sample);
</script>

<section id="masonry-prefix-fixture" aria-label="Masonry class and width variable prefixes">
  <label>Masonry prefix sample <select bind:value={selected}>
    {#each reference.cases as { sample }}<option value={sample.id}>{sample.id}</option>{/each}
  </select></label>
  <label><input type="checkbox" bind:checked={live} /> Live Masonry prefix</label>
  <label>Live Masonry prefix value <input bind:value={prefix} /></label>
  <label><input type="checkbox" bind:checked={motion} /> Masonry prefix motion</label>
  <button type="button" onclick={() => removeLast = true}>Remove last prefixed tile</button>
  <ConfigProvider prefixCls={sample.prefix}
    direction={'rtl' in sample && sample.rtl ? 'rtl' : 'ltr'}
    theme={{ cssVar: 'variablePrefix' in sample ? { prefix: sample.variablePrefix } : {},
      token: { motion, motionDurationFast: motion ? '0.8s' : '0s' },
      components: 'aliases' in sample && sample.aliases
        ? { Masonry: { fontSize: 22, fontFamily: 'monospace', colorText: '#722ed1' } }
        : undefined }}>
    <MasonryPrefixScope scope="normal" sample={sample as MasonryPrefixSample} {removeLast} />
    <ConfigProvider prefixCls={'childPrefix' in sample ? sample.childPrefix : undefined}>
      <MasonryPrefixScope scope="nested" sample={sample as MasonryPrefixSample} />
    </ConfigProvider>
  </ConfigProvider>
  <ConfigProvider theme={{ cssVar: {}, token: { motion: false } }}>
    <MasonryPrefixScope scope="sibling" sample={sample as MasonryPrefixSample} local={false} />
  </ConfigProvider>
</section>
