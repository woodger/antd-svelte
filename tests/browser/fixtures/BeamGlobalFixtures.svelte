<script lang="ts">
  import { ConfigProvider } from 'antd-svelte';
  import BeamGlobalScope, { type BeamGlobalSample } from './BeamGlobalScope.svelte';
  import reference from './ant-design-beam-global-reference.json';

  let selected = $state(reference.cases[0].sample.id as string);
  let live = $state(false);
  let prefix = $state('suite');
  let sample = $derived(live ? { id: 'live', prefix }
    : (reference.cases.find(entry => entry.sample.id === selected) ?? reference.cases[0]).sample);
</script>

<section id="beam-global-fixture" aria-label="Global BorderBeam class and variable prefixes">
  <label>Beam global sample <select bind:value={selected}>
    {#each reference.cases as { sample }}<option value={sample.id}>{sample.id}</option>{/each}
  </select></label>
  <label><input type="checkbox" bind:checked={live} /> Live global beam prefix</label>
  <label>Live global beam prefix value <input bind:value={prefix} /></label>
  <ConfigProvider prefixCls={sample.prefix}
    direction={'rtl' in sample && sample.rtl ? 'rtl' : 'ltr'}
    theme={{ cssVar: 'variablePrefix' in sample ? { prefix: sample.variablePrefix } : {},
      token: { motion: false } }}>
    <BeamGlobalScope scope="normal" sample={sample as BeamGlobalSample} />
    <ConfigProvider prefixCls={'childPrefix' in sample ? sample.childPrefix : undefined}>
      <BeamGlobalScope scope="nested" sample={sample as BeamGlobalSample} />
    </ConfigProvider>
  </ConfigProvider>
  <ConfigProvider theme={{ cssVar: {}, token: { motion: false } }}>
    <BeamGlobalScope scope="sibling" sample={sample as BeamGlobalSample} local={false} />
  </ConfigProvider>
</section>
